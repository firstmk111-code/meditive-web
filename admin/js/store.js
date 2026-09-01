/* ========================================================
 * MEDITIVE Admin — 변경사항 보관소
 *
 * 운영자가 고친 내용을 여기에 쌓아 두었다가
 * "저장하고 발행" 을 누를 때 한 번에 내보낸다.
 *   - 원본 HTML 은 발행 대상(GitHub)에서 그대로 가져와 보관
 *   - 미리보기와 발행이 같은 함수로 만들어지므로 결과가 어긋나지 않는다
 *   - 저장하지 않은 변경이 있으면 창을 닫을 때 경고한다
======================================================== */
(function (w) {
	'use strict';

	var H = w.CMSHtml, S = w.CMSSchema, G = w.CMSGit;
	var DRAFT_KEY = 'meditive.admin.draft';

	var state = {
		baseSha: '',          /* 편집을 시작한 시점의 커밋 */
		origin: {},           /* 페이지별 원본 HTML  { home: '...' } */
		originFrom: {},       /* 원본을 어디서 읽었는지 (github / local) */
		edits: {},            /* key -> { page, type, attr, value } */
		uploads: {},          /* 저장경로 -> { b64, size, type, dataUrl, name } */
		listeners: []
	};

	/* ---------------------------------------------- 알림 */
	function emit() {
		saveDraft();
		for (var i = 0; i < state.listeners.length; i++) {
			try { state.listeners[i](); } catch (e) {}
		}
	}
	function onChange(fn) { state.listeners.push(fn); }

	/* ---------------------------------------------- 원본 불러오기 */
	function loadPage(pageId) {
		var page = S.PAGES[pageId];
		if (state.origin[pageId]) return Promise.resolve(state.origin[pageId]);
		return G.readText(page.file).then(function (r) {
			state.origin[pageId] = r.text;
			state.originFrom[pageId] = r.from;
			return r.text;
		});
	}

	function loadAll() {
		var ids = Object.keys(S.PAGES);
		return G.headSha().catch(function () { return ''; }).then(function (sha) {
			state.baseSha = sha;
			return Promise.all(ids.map(loadPage));
		}).then(function () {
			restoreDraft();
			return true;
		});
	}

	function pageOf(key) { return key.split('.')[0]; }
	function origin(pageId) { return state.origin[pageId] || ''; }

	/* ---------------------------------------------- 현재 값 읽기 */
	/* 편집 중인 값이 있으면 그것을, 없으면 원본 값을 돌려준다 */
	function value(key) {
		if (state.edits[key]) return state.edits[key].value;
		return original(key);
	}

	function original(key) {
		var def = S.get(key);
		if (!def) return '';
		var html = origin(pageOf(key));
		if (!html) return '';
		if (def.type === 'image') return H.readAttr(html, key, 'src') || '';
		if (def.type === 'url') return H.readAttr(html, key, 'href') || '';
		var inner = H.readInner(html, key);
		return inner == null ? '' : H.htmlToPlain(inner);
	}

	function isChanged(key) { return !!state.edits[key]; }

	/* ---------------------------------------------- 값 쓰기 */
	function set(key, val) {
		var def = S.get(key);
		if (!def) return;
		val = String(val == null ? '' : val);

		if (def.type === 'url') val = safeUrl(val);
		if (def.type === 'line') val = val.replace(/[\r\n]+/g, ' ');

		if (val === original(key)) { delete state.edits[key]; emit(); return; }

		state.edits[key] = {
			page: pageOf(key),
			type: (def.type === 'image') ? 'img' : (def.type === 'url' ? 'attr' : 'inner'),
			attr: (def.type === 'image') ? 'src' : (def.type === 'url' ? 'href' : ''),
			value: val
		};
		emit();
	}

	function reset(key) {
		if (!state.edits[key]) return;
		delete state.edits[key];
		emit();
	}

	function resetAll() {
		state.edits = {};
		state.uploads = {};
		emit();
	}

	/* 위험한 주소는 막는다 */
	function safeUrl(u) {
		var t = String(u).trim();
		if (/^\s*(javascript|data|vbscript)\s*:/i.test(t)) return '';
		return t;
	}

	/* ---------------------------------------------- 이미지 업로드 대기 */
	function addUpload(path, b64, meta) {
		state.uploads[path] = {
			b64: b64,
			size: (meta && meta.size) || 0,
			type: (meta && meta.type) || '',
			name: (meta && meta.name) || '',
			dataUrl: (meta && meta.dataUrl) || ''
		};
		emit();
	}

	function dropUpload(path) {
		delete state.uploads[path];
		emit();
	}

	/* 화면에 보여줄 이미지 주소 (업로드 대기 중이면 미리보기용 주소) */
	function imageSrc(key) {
		var p = value(key);
		if (state.uploads[p] && state.uploads[p].dataUrl) return state.uploads[p].dataUrl;
		return p ? ('../' + p) : '';
	}

	/* ---------------------------------------------- 변경 목록 */
	function changeList() {
		var out = [], k, e, def;
		for (k in state.edits) {
			if (!state.edits.hasOwnProperty(k)) continue;
			e = state.edits[k];
			def = S.get(k);
			out.push({
				key: k,
				page: e.page,
				label: S.label(k),
				kind: def ? def.type : 'line',
				before: original(k),
				after: e.value
			});
		}
		for (k in state.uploads) {
			if (!state.uploads.hasOwnProperty(k)) continue;
			out.push({
				key: '@upload:' + k,
				page: '-',
				label: '이미지 파일 올리기 · ' + k,
				kind: 'file',
				before: '',
				after: state.uploads[k].name || k
			});
		}
		out.sort(function (a, b) { return a.label < b.label ? -1 : 1; });
		return out;
	}

	function count() { return changeList().length; }
	function isDirty() { return count() > 0; }

	/* ---------------------------------------------- HTML 만들기 */
	function buildHtml(pageId) {
		var html = origin(pageId);
		if (!html) return '';
		var edits = [], k, e;
		for (k in state.edits) {
			if (!state.edits.hasOwnProperty(k)) continue;
			e = state.edits[k];
			if (e.page !== pageId) continue;
			if (e.type === 'inner') {
				var srcInner = H.readInner(html, k) || '';
				edits.push({ type: 'inner', key: k, value: H.plainToHtml(e.value, H.detectBr(srcInner)) });
			} else {
				edits.push({ type: 'attr', key: k, attr: e.attr, value: e.value });
			}
		}
		return H.applyEdits(html, edits);
	}

	/* 미리보기용 : 상대경로가 실제 사이트를 가리키도록 기준 주소를 넣는다 */
	function previewHtml(pageId) {
		var html = buildHtml(pageId);
		var base = new URL('../', location.href).href;
		var tag = '<base href="' + base + '">';
		var up = state.uploads;

		/* 아직 올리지 않은 이미지는 미리보기에서만 임시 주소로 바꿔 보여준다 */
		for (var p in up) {
			if (!up.hasOwnProperty(p) || !up[p].dataUrl) continue;
			html = html.split('"' + p + '"').join('"' + up[p].dataUrl + '"');
		}
		if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, '<head$1>' + tag);
		return tag + html;
	}

	/* 발행할 파일 묶음 */
	function files() {
		var out = [], id, p;
		for (id in S.PAGES) {
			if (!S.PAGES.hasOwnProperty(id)) continue;
			var changed = false, k;
			for (k in state.edits) { if (state.edits[k].page === id) { changed = true; break; } }
			if (!changed) continue;
			out.push({ path: S.PAGES[id].file, text: buildHtml(id) });
		}
		for (p in state.uploads) {
			if (!state.uploads.hasOwnProperty(p)) continue;
			out.push({ path: p, b64: state.uploads[p].b64 });
		}
		return out;
	}

	function message() {
		var list = changeList();
		var groups = {}, i, g;
		for (i = 0; i < list.length; i++) {
			g = (S.get(list[i].key) || {}).groupName || '이미지 파일';
			groups[g] = (groups[g] || 0) + 1;
		}
		var names = Object.keys(groups);
		var head = '홈 콘텐츠 수정 (' + list.length + '건)';
		var body = names.map(function (n) { return '- ' + n + ' ' + groups[n] + '건'; }).join('\n');
		return head + '\n\n' + body + '\n\n관리자 페이지에서 발행';
	}

	/* ---------------------------------------------- 발행 */
	function publish(onStep) {
		var f = files();
		if (!f.length) return Promise.reject(new Error('발행할 변경사항이 없습니다.'));
		return G.publish(f, message(), state.baseSha, onStep).then(function (r) {
			/* 발행한 내용을 새 원본으로 삼는다 */
			for (var i = 0; i < f.length; i++) {
				var id = pathToPage(f[i].path);
				if (id && typeof f[i].text === 'string') state.origin[id] = f[i].text;
			}
			state.edits = {};
			state.uploads = {};
			state.baseSha = r.sha;
			emit();
			return r;
		});
	}

	function pathToPage(path) {
		for (var id in S.PAGES) {
			if (S.PAGES.hasOwnProperty(id) && S.PAGES[id].file === path) return id;
		}
		return '';
	}

	/* 원격이 앞서 있으면 다시 불러온다 */
	function refresh() {
		state.origin = {};
		return loadAll();
	}

	/* ---------------------------------------------- 임시 저장 (새로고침 대비) */
	function saveDraft() {
		try {
			localStorage.setItem(DRAFT_KEY, JSON.stringify({
				baseSha: state.baseSha,
				edits: state.edits,
				at: Date.now()
			}));
		} catch (e) {}
	}

	function restoreDraft() {
		try {
			var raw = localStorage.getItem(DRAFT_KEY);
			if (!raw) return;
			var d = JSON.parse(raw);
			if (!d || !d.edits) return;
			/* 원본이 그 사이 바뀌었다면 임시 저장분은 버린다 */
			if (d.baseSha && state.baseSha && d.baseSha !== state.baseSha) {
				localStorage.removeItem(DRAFT_KEY);
				return;
			}
			var k, keep = {};
			for (k in d.edits) {
				if (!d.edits.hasOwnProperty(k) || !S.get(k)) continue;
				if (d.edits[k].value === original(k)) continue;
				keep[k] = d.edits[k];
			}
			state.edits = keep;
		} catch (e) {}
	}

	function clearDraft() {
		try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
	}

	w.CMSStore = {
		state: state,
		loadAll: loadAll,
		refresh: refresh,
		onChange: onChange,
		value: value,
		original: original,
		isChanged: isChanged,
		set: set,
		reset: reset,
		resetAll: resetAll,
		addUpload: addUpload,
		dropUpload: dropUpload,
		imageSrc: imageSrc,
		changeList: changeList,
		count: count,
		isDirty: isDirty,
		buildHtml: buildHtml,
		previewHtml: previewHtml,
		files: files,
		message: message,
		publish: publish,
		clearDraft: clearDraft
	};
})(window);
