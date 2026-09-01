/* ========================================================
 * MEDITIVE Admin — 변경사항 보관소
 *
 * 운영자가 고친 내용을 여기에 쌓아 두었다가
 * "저장하고 발행" 을 누를 때 한 번에 내보낸다.
 *   - 원본은 발행 대상(GitHub)에서 그대로 가져와 보관한다
 *   - HTML 은 CMSHtml, 상품 데이터(js/shop.js)는 CMSJs 가 고친다
 *   - 저장하지 않은 변경이 있으면 창을 닫을 때 경고한다
======================================================== */
(function (w) {
	'use strict';

	var H = w.CMSHtml, J = w.CMSJs, S = w.CMSSchema, G = w.CMSGit;
	var DRAFT_KEY = 'meditive.admin.draft';

	var state = {
		baseSha: '',          /* 편집을 시작한 시점의 커밋 */
		origin: {},           /* 파일별 원본 내용 { home:'...', pf:'...', shop:'...' } */
		originFrom: {},       /* 원본을 어디서 읽었는지 (github / local) */
		edits: {},            /* key -> { page, value } */
		uploads: {},          /* 저장경로 -> { b64, size, type, dataUrl, name, replace } */
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
		}).catch(function () {
			state.origin[pageId] = '';
			state.originFrom[pageId] = 'fail';
			return '';
		});
	}

	function loadAll() {
		var ids = Object.keys(S.PAGES);
		return G.headSha().catch(function () { return ''; }).then(function (sha) {
			state.baseSha = sha;
			return Promise.all(ids.map(loadPage));
		}).then(function () {
			/* 원본을 읽은 뒤에야 상품몰 · 포트폴리오 카테고리를 만들 수 있다 */
			S.buildShop(state.origin.shop || '');
			S.buildPortfolio(state.origin.pf || '');
			restoreDraft();
			return true;
		});
	}

	function origin(pageId) { return state.origin[pageId] || ''; }
	function pageOf(key) {
		var def = S.get(key);
		return def ? def.page : key.split('.')[0];
	}

	/* 상품 Key 를 쪼갠다 : shop.pr01.name -> { id:'pr01', field:'name' } */
	function shopParts(key) {
		var p = String(key).split('.');
		return { id: p[1], field: p[2] };
	}

	/* ---------------------------------------------- 현재 값 읽기 */
	function value(key) {
		if (state.edits[key]) return state.edits[key].value;
		return original(key);
	}

	function original(key) {
		var def = S.get(key);
		if (!def) return '';

		/* 서브 배너처럼 파일 자체를 갈아 끼우는 항목은 경로가 곧 값이다 */
		if (def.type === 'file') return def.path || '';

		var page = def.page;
		var src = origin(page);
		if (!src) return '';

		if (page === 'shop') {
			var sp = shopParts(key);
			var raw = J.read(src, sp.id, sp.field);
			if (raw == null) return '';
			return (def.type === 'image' && def.base) ? (def.base + raw) : raw;
		}

		if (def.type === 'image') return H.readAttr(src, key, 'src') || '';
		if (def.type === 'url') return H.readAttr(src, key, 'href') || '';
		var inner = H.readInner(src, key);
		return inner == null ? '' : H.htmlToPlain(inner);
	}

	function isChanged(key) { return !!state.edits[key]; }

	/* ---------------------------------------------- 값 쓰기 */
	function set(key, val) {
		var def = S.get(key);
		if (!def || def.type === 'file') return false;
		val = String(val == null ? '' : val);

		if (def.type === 'url') val = safeUrl(val);
		if (def.type === 'line') val = val.replace(/[\r\n]+/g, ' ');

		/* 상품 이미지는 정해진 폴더 안에서만 고를 수 있다 */
		if (def.base && val.indexOf(def.base) !== 0) return false;

		if (val === original(key)) { delete state.edits[key]; emit(); return true; }

		state.edits[key] = { page: def.page, value: val };
		emit();
		return true;
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
			dataUrl: (meta && meta.dataUrl) || '',
			replace: !!(meta && meta.replace),
			label: (meta && meta.label) || ''
		};
		emit();
	}

	function dropUpload(path) {
		if (!state.uploads[path]) return;
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
		var out = [], k, def;
		for (k in state.edits) {
			if (!state.edits.hasOwnProperty(k)) continue;
			def = S.get(k);
			out.push({
				key: k,
				top: def ? def.top : '',
				label: S.label(k),
				kind: def ? def.type : 'line',
				before: original(k),
				after: state.edits[k].value
			});
		}
		for (k in state.uploads) {
			if (!state.uploads.hasOwnProperty(k)) continue;
			var u = state.uploads[k];
			out.push({
				key: '@upload:' + k,
				top: u.replace ? '공통' : '이미지 파일',
				label: (u.replace ? '배너 이미지 교체 · ' : '새 이미지 올리기 · ') + (u.label || k),
				kind: 'file',
				before: u.replace ? k : '',
				after: u.name || k
			});
		}
		out.sort(function (a, b) { return a.label < b.label ? -1 : 1; });
		return out;
	}

	function count() { return changeList().length; }
	function isDirty() { return count() > 0; }

	/* ---------------------------------------------- 결과 파일 만들기 */
	function buildPage(pageId) {
		var src = origin(pageId);
		if (!src) return '';
		var k, e, def;

		if (S.PAGES[pageId].kind === 'js') {
			var jsEdits = [];
			for (k in state.edits) {
				if (!state.edits.hasOwnProperty(k) || state.edits[k].page !== pageId) continue;
				def = S.get(k);
				var sp = shopParts(k);
				var v = state.edits[k].value;
				if (def && def.base) v = v.slice(def.base.length);
				jsEdits.push({ id: sp.id, field: sp.field, value: v });
			}
			return J.applyEdits(src, jsEdits);
		}

		var edits = [];
		for (k in state.edits) {
			if (!state.edits.hasOwnProperty(k) || state.edits[k].page !== pageId) continue;
			e = state.edits[k];
			def = S.get(k);
			if (def.type === 'image') {
				edits.push({ type: 'attr', key: k, attr: 'src', value: e.value });
			} else if (def.type === 'url') {
				edits.push({ type: 'attr', key: k, attr: 'href', value: e.value });
			} else {
				var srcInner = H.readInner(src, k) || '';
				edits.push({ type: 'inner', key: k, value: H.plainToHtml(e.value, H.detectBr(srcInner)) });
			}
		}
		return H.applyEdits(src, edits);
	}

	/* 발행할 파일 묶음 */
	function files() {
		var out = [], id, p, k;
		for (id in S.PAGES) {
			if (!S.PAGES.hasOwnProperty(id)) continue;
			var changed = false;
			for (k in state.edits) { if (state.edits[k].page === id) { changed = true; break; } }
			if (!changed) continue;
			out.push({ path: S.PAGES[id].file, text: buildPage(id) });
		}
		for (p in state.uploads) {
			if (!state.uploads.hasOwnProperty(p)) continue;
			out.push({ path: p, b64: state.uploads[p].b64 });
		}
		return out;
	}

	/* 상품 데이터는 따옴표 하나만 어긋나도 사이트가 멈추므로 미리 검사한다 */
	function check() {
		var k, need = false;
		for (k in state.edits) { if (state.edits[k].page === 'shop') { need = true; break; } }
		if (!need) return { ok: true, message: '' };
		var r = J.validate(buildPage('shop'));
		if (r.ok) return r;
		return { ok: false, message: '상품 데이터에 문제가 있어 발행할 수 없습니다. (' + r.message + ') 따옴표(’)나 역슬래시를 지우고 다시 시도해 주세요.' };
	}

	function message() {
		var list = changeList();
		var groups = {}, i, g;
		for (i = 0; i < list.length; i++) {
			g = list[i].top || '기타';
			groups[g] = (groups[g] || 0) + 1;
		}
		var names = Object.keys(groups);
		var head = '콘텐츠 수정 (' + list.length + '건)';
		var body = names.map(function (n) { return '- ' + n + ' ' + groups[n] + '건'; }).join('\n');
		return head + '\n\n' + body + '\n\n관리자 페이지에서 발행';
	}

	/* ---------------------------------------------- 발행 */
	function publish(onStep) {
		var v = check();
		if (!v.ok) return Promise.reject(new Error(v.message));

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
		buildPage: buildPage,
		check: check,
		files: files,
		message: message,
		publish: publish,
		clearDraft: clearDraft
	};
})(window);
