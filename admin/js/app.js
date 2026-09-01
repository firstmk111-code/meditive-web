/* ========================================================
 * MEDITIVE Admin — 화면 동작
 *
 * 운영자에게 HTML 코드를 보여주지 않는다.
 * 모든 편집은 일반 입력창(한 줄 / 여러 줄 / 링크 / 이미지)으로만 이루어진다.
 *
 * 로그인은 비밀번호만으로 한다. GitHub 토큰은 "발행" 할 때만 필요하며
 * 설정 > GitHub 연결 에서 한 번 등록해 두면 된다.
======================================================== */
(function (w, d) {
	'use strict';

	var S = w.CMSSchema, ST = w.CMSStore, G = w.CMSGit;

	var PW_KEY = 'meditive.admin.pw';
	var DEFAULT_PW = '1111';
	var LAST_PUB = 'meditive.admin.lastpub';

	function $(s, r) { return (r || d).querySelector(s); }
	function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
	function esc(s) {
		return String(s == null ? '' : s)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	/* ---------------------------------------------- 알림 */
	function toast(text, kind) {
		var box = $('#toast');
		var el = d.createElement('div');
		el.className = kind || '';
		el.textContent = text;
		box.appendChild(el);
		setTimeout(function () {
			el.style.transition = 'opacity .3s';
			el.style.opacity = '0';
			setTimeout(function () { el.remove(); }, 320);
		}, kind === 'err' ? 4200 : 2400);
	}

	function say(sel, text, kind) {
		var el = $(sel);
		if (!el) return;
		el.textContent = text || '';
		el.className = 'msg ' + (kind || 'info') + (text ? ' show' : '');
	}

	/* ---------------------------------------------- 로그인 (비밀번호만) */
	function currentPw() {
		try { return localStorage.getItem(PW_KEY) || DEFAULT_PW; } catch (e) { return DEFAULT_PW; }
	}

	function initLogin() {
		$('#loginForm').addEventListener('submit', function (ev) {
			ev.preventDefault();
			if ($('#fPw').value !== currentPw()) {
				say('#loginMsg', '비밀번호가 올바르지 않습니다.', 'err');
				return;
			}
			var btn = $('#loginBtn');
			btn.disabled = true; btn.textContent = '불러오는 중...';
			say('#loginMsg', '', 'info');
			start();
		});
	}

	function logout() {
		if (ST.isDirty() && !confirm('저장하지 않은 변경사항이 있습니다. 그래도 로그아웃할까요?')) return;
		ST.clearDraft();
		location.reload();
	}

	/* ---------------------------------------------- 시작 */
	function start() {
		$('#loginView').hidden = true;
		$('#loginView').style.display = 'none';
		$('#app').classList.add('on');

		ST.loadAll().then(function () {
			renderCats('image');
			renderCats('text');
			loadGallery();
			ST.onChange(syncAll);
			syncAll();
			route();

			var from = ST.state.originFrom.home;
			$('#dsNote').innerHTML = from === 'github'
				? '원본을 GitHub 저장소(<b>' + esc(G.CFG.branch) + '</b> 브랜치)에서 불러왔습니다. 발행하면 같은 곳에 커밋 한 개로 저장됩니다.'
				: 'GitHub 에서 원본을 읽지 못해 <b>내 컴퓨터의 파일</b>을 불러왔습니다. 발행 전에 연결 상태를 확인해 주세요.';

			showWho();
		}).catch(function (err) {
			toast(err.message || '내용을 불러오지 못했습니다.', 'err');
			var btn = $('#loginBtn');
			btn.disabled = false; btn.textContent = '로그인';
		});
	}

	function showWho() {
		if (!G.hasToken()) { $('#topWho').textContent = ''; return; }
		G.whoAmI().then(function (me) {
			$('#topWho').textContent = (me && me.login) ? me.login : '';
		}).catch(function () { $('#topWho').textContent = ''; });
	}

	/* ---------------------------------------------- 화면 이동 */
	var TITLES = {
		dashboard: '대시보드', image: '이미지 관리', text: '텍스트 관리',
		changes: '변경사항', history: '발행 이력', token: 'GitHub 연결', pw: '비밀번호 변경'
	};

	function route() {
		var id = (location.hash || '#dashboard').replace('#', '');
		if (!TITLES[id]) id = 'dashboard';
		$$('.view').forEach(function (v) { v.classList.toggle('on', v.id === 'v-' + id); });
		$$('#nav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-view') === id); });
		$('#topTit').textContent = TITLES[id];
		$('#side').classList.remove('open');
		if (id === 'changes') renderChanges();
		if (id === 'history') renderHistory();
		if (id === 'token') fillToken();
		w.scrollTo(0, 0);
	}

	/* ---------------------------------------------- 입력 줄 만들기 */
	function fieldRow(def) {
		var row = d.createElement('div');
		row.className = 'row';
		row.dataset.key = def.key;

		var head = d.createElement('div');
		head.className = 'row-head';
		head.innerHTML = '<label>' + esc(def.label) + '</label>' +
			'<span class="badge" data-mark hidden>수정함</span><span class="sp"></span>';
		var undo = d.createElement('button');
		undo.type = 'button';
		undo.className = 'btn ghost sm';
		undo.textContent = '되돌리기';
		undo.hidden = true;
		undo.addEventListener('click', function () { ST.reset(def.key); });
		head.appendChild(undo);
		row.appendChild(head);

		var input;
		if (def.type === 'text') {
			input = d.createElement('textarea');
			input.rows = 3;
		} else {
			input = d.createElement('input');
			input.type = (def.type === 'url') ? 'url' : 'text';
			if (def.type === 'url') input.placeholder = '예) kr/shop/list.html?cat=all';
		}
		input.value = ST.value(def.key);
		input.addEventListener('input', function () { ST.set(def.key, input.value); });
		row.appendChild(input);

		if (def.hint) {
			var h = d.createElement('p');
			h.className = 'hint';
			h.textContent = def.hint;
			row.appendChild(h);
		}

		row._sync = function () {
			var changed = ST.isChanged(def.key);
			row.classList.toggle('changed', changed);
			head.querySelector('[data-mark]').hidden = !changed;
			undo.hidden = !changed;
			if (d.activeElement !== input) input.value = ST.value(def.key);
		};
		return row;
	}

	/* ---------------------------------------------- 이미지 칸 만들기 */
	function isSlotChanged(def) {
		if (def.type === 'file') return !!ST.state.uploads[def.path];
		return ST.isChanged(def.key);
	}

	function imageSlot(def) {
		var box = d.createElement('div');
		box.className = 'card img-slot';
		box.dataset.key = def.key;
		box.innerHTML =
			'<div class="thumb"><img alt="" loading="lazy"></div>' +
			'<div class="nm">' + esc(def.label) + '</div>' +
			'<div class="pt" data-pt></div>' +
			'<div class="acts">' +
				'<button type="button" class="btn sm" data-act="pick">' + (def.type === 'file' ? '파일 올리기' : '교체') + '</button>' +
				'<button type="button" class="btn ghost sm" data-act="undo" hidden>되돌리기</button>' +
			'</div>';

		$('[data-act=pick]', box).addEventListener('click', function () { openPicker(def); });
		$('[data-act=undo]', box).addEventListener('click', function () {
			if (def.type === 'file') { ST.dropUpload(def.path); return; }
			ST.dropUpload(ST.value(def.key));
			ST.reset(def.key);
		});

		box._sync = function () {
			var changed = isSlotChanged(def);
			box.classList.toggle('changed', changed);
			$('[data-act=undo]', box).hidden = !changed;
			$('[data-pt]', box).textContent = ST.value(def.key);
			var img = $('img', box);
			var src = ST.imageSrc(def.key);
			if (img.getAttribute('src') !== src) img.setAttribute('src', src);
		};
		return box;
	}

	/* ---------------------------------------------- 카테고리 · 작업 영역 */
	var rows = [];                       /* 지금 화면에 그려진 입력줄 */
	var sel = { image: '', text: '' };   /* 분류별 현재 선택 */
	var filter = { image: '', text: '' };

	function paneIds(kind) {
		return (kind === 'image')
			? { cats: '#imgCats', head: '#imgHead', body: '#imgBody' }
			: { cats: '#txtCats', head: '#txtHead', body: '#txtBody' };
	}

	function changedIn(s) {
		var n = 0;
		s.fields.forEach(function (f) { if (isSlotChanged(f)) n++; });
		return n;
	}

	function renderCats(kind) {
		var ids = paneIds(kind);
		var wrap = $(ids.cats);
		var list = S.sections(kind);
		var q = (filter[kind] || '').trim();
		if (q) {
			list = list.filter(function (s) {
				return (s.top + ' ' + s.name).toLowerCase().indexOf(q.toLowerCase()) > -1;
			});
		}
		if (!list.length) {
			wrap.innerHTML = '<p class="hint" style="padding:14px 16px;">찾는 분류가 없습니다.</p>';
			return;
		}
		if (!sel[kind] || !list.some(function (s) { return s.id === sel[kind]; })) sel[kind] = list[0].id;

		var html = '', lastTop = '';
		list.forEach(function (s) {
			if (s.top !== lastTop) {
				html += '<p class="cat-tit">' + esc(s.top) + '</p>';
				lastTop = s.top;
			}
			var ch = changedIn(s);
			html += '<button type="button" data-sec="' + esc(s.id) + '" class="' + (s.id === sel[kind] ? 'on' : '') + '">' +
				'<span class="t">' + esc(s.name) + '</span>' +
				'<em class="c">' + s.fields.length + '</em>' +
				(ch ? '<em class="dot" title="수정함">' + ch + '</em>' : '') +
				'</button>';
		});
		wrap.innerHTML = html;
		$$('button[data-sec]', wrap).forEach(function (b) {
			b.addEventListener('click', function () {
				sel[kind] = b.getAttribute('data-sec');
				renderCats(kind);
				renderBody(kind);
			});
		});
		renderBody(kind);
	}

	function renderBody(kind) {
		var ids = paneIds(kind);
		var s = S.section(sel[kind]);
		var head = $(ids.head), body = $(ids.body);

		/* 다른 화면의 입력줄은 목록에서 뺀다 */
		rows = rows.filter(function (r) { return r._kind !== kind; });

		if (!s) { head.innerHTML = ''; body.innerHTML = ''; return; }

		head.innerHTML = '<h3>' + esc(s.top) + ' · ' + esc(s.name) + '</h3>' +
			'<p>' + esc(s.desc || '') + '</p>';

		body.innerHTML = '';
		if (kind === 'image') {
			s.fields.forEach(function (f) {
				var el = imageSlot(f);
				el._kind = kind;
				body.appendChild(el);
				rows.push(el);
			});
		} else {
			var card = d.createElement('div');
			card.className = 'card';
			card.style.padding = '4px 20px';
			s.fields.forEach(function (f) {
				var el = fieldRow(f);
				el._kind = kind;
				card.appendChild(el);
				rows.push(el);
			});
			body.appendChild(card);
		}
		rows.forEach(function (r) { if (r._sync) r._sync(); });
	}

	/* ---------------------------------------------- 상태 반영 */
	function syncAll() {
		var n = ST.count();
		$('#navCnt').textContent = n;
		$('#navCnt').classList.toggle('off', !n);
		$('#dsChg').innerHTML = n + '<small>건</small>';
		$('#topDirty').hidden = !n;
		$('#topDirtyN').textContent = n;

		var ci = 0, ct = 0;
		S.sections('image').forEach(function (s) { ci += changedIn(s); });
		S.sections('text').forEach(function (s) { ct += changedIn(s); });
		$('#nImg').textContent = ci;
		$('#nImg').classList.toggle('off', !ci);
		$('#nTxt').textContent = ct;
		$('#nTxt').classList.toggle('off', !ct);

		$('#nTok').textContent = G.hasToken() ? '연결됨' : '미연결';
		$('#nTok').classList.toggle('off', !G.hasToken());

		$('#dsTxt').innerHTML = S.countOf('text') + '<small>개</small>';
		$('#dsImg').innerHTML = S.countOf('image') + '<small>개</small>';
		try { $('#dsPub').textContent = localStorage.getItem(LAST_PUB) || '-'; } catch (e) {}

		rows.forEach(function (r) { if (r._sync) r._sync(); });
		refreshCatCounts('image');
		refreshCatCounts('text');
		if ($('#v-changes').classList.contains('on')) renderChanges();
	}

	/* 분류 목록의 "수정함" 표시만 다시 그린다 (목록 전체를 새로 만들지 않는다) */
	function refreshCatCounts(kind) {
		var wrap = $(paneIds(kind).cats);
		$$('button[data-sec]', wrap).forEach(function (b) {
			var s = S.section(b.getAttribute('data-sec'));
			if (!s) return;
			var ch = changedIn(s);
			var dot = $('.dot', b);
			if (ch && !dot) {
				dot = d.createElement('em');
				dot.className = 'dot';
				b.appendChild(dot);
			}
			if (dot) {
				dot.textContent = ch;
				dot.hidden = !ch;
			}
		});
	}

	/* ---------------------------------------------- 변경사항 */
	function renderChanges() {
		var list = ST.changeList();
		var box = $('#changeBox');
		if (!list.length) {
			box.innerHTML = '<div class="card empty">아직 수정한 내용이 없습니다.</div>';
			return;
		}
		var h = '<table class="chg-tbl"><thead><tr>' +
			'<th style="width:28%">항목</th><th style="width:28%">이전</th><th>변경 후</th><th style="width:80px"></th>' +
			'</tr></thead><tbody>';
		list.forEach(function (c) {
			h += '<tr><td><b>' + esc(c.label) + '</b></td>' +
				'<td class="b">' + esc(c.before || '(비어 있음)') + '</td>' +
				'<td class="a">' + esc(c.after || '(비어 있음)') + '</td>' +
				'<td><button type="button" class="btn ghost sm" data-undo="' + esc(c.key) + '">되돌리기</button></td></tr>';
		});
		box.innerHTML = h + '</tbody></table>';
		$$('[data-undo]', box).forEach(function (b) {
			b.addEventListener('click', function () {
				var k = b.getAttribute('data-undo');
				if (k.indexOf('@upload:') === 0) ST.dropUpload(k.replace('@upload:', ''));
				else ST.reset(k);
			});
		});
	}

	/* ---------------------------------------------- 발행 이력 */
	function renderHistory() {
		var box = $('#histBox');
		box.innerHTML = '<div class="card empty">불러오는 중...</div>';
		G.history(15).then(function (list) {
			if (!list.length) {
				box.innerHTML = '<div class="card empty">이력을 불러오지 못했습니다.</div>';
				return;
			}
			box.innerHTML = '<table class="chg-tbl"><thead><tr>' +
				'<th style="width:150px">날짜</th><th>내용</th><th style="width:110px">커밋</th>' +
				'</tr></thead><tbody>' +
				list.map(function (c) {
					var t = c.date ? new Date(c.date).toLocaleString('ko-KR') : '-';
					return '<tr><td>' + esc(t) + '</td>' +
						'<td>' + esc(c.message.split('\n')[0]) + '</td>' +
						'<td><a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.short) + '</a></td></tr>';
				}).join('') + '</tbody></table>';
		});
	}

	/* ---------------------------------------------- 이미지 고르기 */
	var GALLERY = { all: [] };
	var CATS = [
		{ id: 'main', name: '홈 · 메인', test: function (p) { return p.indexOf('images/main/') === 0; } },
		{ id: 'portfolio', name: '포트폴리오 · 상품', test: function (p) { return p.indexOf('images/portfolio/') === 0; } },
		{ id: 'banners', name: '서브 배너', test: function (p) { return p.indexOf('images/banners/') === 0; } },
		{ id: 'brand', name: '브랜드 · 공통', test: function (p) { return p.indexOf('images/brand/') === 0 || p.indexOf('images/common/') === 0; } }
	];

	function loadGallery() {
		var dirs = ['images/main', 'images/portfolio', 'images/portfolio/poster', 'images/banners', 'images/brand', 'images/common'];
		Promise.all(dirs.map(function (dir) {
			return G.listDir(dir).then(function (items) {
				return items.filter(function (it) {
					return it.type === 'file' && /\.(jpe?g|png|gif|webp|svg)$/i.test(it.name);
				}).map(function (it) { return dir + '/' + it.name; });
			});
		})).then(function (all) {
			var flat = [].concat.apply([], all);
			if (flat.length) { GALLERY.all = flat.sort(); return; }
			throw new Error('empty');
		}).catch(function () {
			return fetch('data/images.json?t=' + Date.now(), { cache: 'no-store' })
				.then(function (r) { return r.json(); })
				.then(function (j) { GALLERY.all = (j.files || []).slice(); })
				.catch(function () { GALLERY.all = []; });
		});
	}

	var picking = null;      /* 지금 교체 중인 항목 정의 */
	var pickSel = '';        /* 고른 기존 이미지 경로 */
	var pickUpload = null;   /* 새로 올린 파일 */
	var DROP_HTML = '';

	function resetDrop() {
		var drop = $('#pickDrop');
		drop.classList.remove('over');
		drop.innerHTML = DROP_HTML;
		$('#pickBrowse').addEventListener('click', function () { $('#pickFile').click(); });
	}

	function openPicker(def) {
		picking = def;
		pickSel = (def.type === 'file') ? '' : ST.value(def.key);
		pickUpload = null;
		$('#pickTit').textContent = def.sectionName + ' · ' + def.label + ' 교체';
		resetDrop();

		if (def.type === 'file') {
			/* 배너는 같은 파일 이름으로 덮어써야 하므로 새 파일만 받는다 */
			$('#pickLibrary').hidden = true;
		} else {
			$('#pickLibrary').hidden = false;
			var only = def.base ? catForPath(def.base) : null;
			renderPickTabs(only ? only.id : CATS[0].id, def);
		}
		$('#pickDim').classList.add('on');
	}

	function catForPath(p) {
		var i;
		for (i = 0; i < CATS.length; i++) if (CATS[i].test(p)) return CATS[i];
		return null;
	}

	function closePicker() {
		$('#pickDim').classList.remove('on');
		picking = null; pickUpload = null;
	}

	function renderPickTabs(active, def) {
		var tabs = $('#pickTabs');
		var list = CATS;
		/* 상품 이미지는 정해진 폴더 안에서만 고를 수 있다 */
		if (def && def.base) list = CATS.filter(function (c) { return c.test(def.base); });
		tabs.innerHTML = '';
		tabs.hidden = list.length < 2;
		list.forEach(function (c) {
			var b = d.createElement('button');
			b.type = 'button';
			b.textContent = c.name;
			b.className = (c.id === active ? 'on' : '');
			b.addEventListener('click', function () { renderPickTabs(c.id, def); });
			tabs.appendChild(b);
		});
		renderPickGrid(active, def);
	}

	function renderPickGrid(catId, def) {
		var cat = null, i;
		for (i = 0; i < CATS.length; i++) if (CATS[i].id === catId) cat = CATS[i];
		var list = GALLERY.all.filter(function (p) {
			if (def && def.base && p.indexOf(def.base) !== 0) return false;
			if (def && def.base && p.slice(def.base.length).indexOf('/') > -1) return false;  /* 하위 폴더 제외 */
			return cat ? cat.test(p) : true;
		});
		var grid = $('#pickGrid');
		if (!list.length) {
			grid.innerHTML = '<p class="hint" style="grid-column:1/-1;">이 분류에 등록된 이미지가 없습니다.</p>';
			return;
		}
		grid.innerHTML = list.map(function (p) {
			return '<button type="button" data-p="' + esc(p) + '" class="' + (p === pickSel ? 'on' : '') + '">' +
				'<span class="ph"><img src="../' + esc(p) + '" alt="" loading="lazy"></span>' +
				'<span class="cap">' + esc(p.split('/').pop()) + '</span></button>';
		}).join('');
		$$('button[data-p]', grid).forEach(function (b) {
			b.addEventListener('click', function () {
				pickSel = b.getAttribute('data-p');
				pickUpload = null;
				$$('button[data-p]', grid).forEach(function (x) { x.classList.remove('on'); });
				b.classList.add('on');
				$('#pickDrop').classList.remove('over');
			});
		});
	}

	/* 새 파일은 원본을 덮어쓰지 않도록 고유한 이름으로 올린다 */
	function uniquePath(dir, filename) {
		var dot = filename.lastIndexOf('.');
		var base = (dot > 0 ? filename.slice(0, dot) : filename)
			.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'img';
		var ext = (dot > 0 ? filename.slice(dot) : '.jpg').toLowerCase();
		var t = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
		var stamp = String(t.getFullYear()).slice(2) + p(t.getMonth() + 1) + p(t.getDate()) + p(t.getHours()) + p(t.getMinutes()) + p(t.getSeconds());
		return dir + '/' + base + '-' + stamp + ext;
	}

	function takeFile(file) {
		if (!file || !picking) return;
		if (!/^image\//.test(file.type)) { toast('이미지 파일만 올릴 수 있습니다.', 'err'); return; }
		if (file.size > 8 * 1024 * 1024) { toast('파일이 너무 큽니다. 8MB 이하로 올려 주세요.', 'err'); return; }

		var def = picking, path, replace = false;
		if (def.type === 'file') {
			/* 배너는 이름을 바꾸면 CSS 에서 못 찾으므로 같은 이름으로 덮어쓴다 */
			path = def.path;
			replace = true;
			var want = (def.path.split('.').pop() || '').toLowerCase();
			var got = (file.name.split('.').pop() || '').toLowerCase();
			if (want === 'jpg') want = 'jpeg';
			if (got === 'jpg') got = 'jpeg';
			if (want !== got) {
				toast('이 배너는 ' + def.path.split('.').pop().toUpperCase() + ' 파일로만 바꿀 수 있습니다.', 'err');
				return;
			}
		} else {
			var dir = def.base
				? def.base.replace(/\/$/, '')
				: (function () {
					var cur = ST.value(def.key) || 'images/main/new.jpg';
					return cur.slice(0, cur.lastIndexOf('/')) || 'images/main';
				})();
			path = uniquePath(dir, file.name);
		}

		var fr = new FileReader();
		fr.onload = function () {
			var dataUrl = fr.result;
			pickUpload = {
				path: path, replace: replace,
				b64: String(dataUrl).split(',')[1] || '',
				dataUrl: dataUrl,
				name: file.name, size: file.size, type: file.type,
				label: def.label
			};
			pickSel = path;
			$$('#pickGrid button').forEach(function (x) { x.classList.remove('on'); });
			$('#pickDrop').classList.add('over');
			$('#pickDrop').innerHTML = '<b>' + esc(file.name) + '</b> 준비됨 · ' + Math.round(file.size / 1024) + 'KB' +
				'<div class="hint" style="margin-top:6px;">발행할 때 <b>' + esc(path) + '</b> 로 저장됩니다.</div>';
		};
		fr.readAsDataURL(file);
	}

	function applyPick() {
		if (!picking) return;
		var def = picking;
		if (pickUpload) {
			ST.addUpload(pickUpload.path, pickUpload.b64, pickUpload);
			if (def.type !== 'file') ST.set(def.key, pickUpload.path);
		} else if (pickSel && def.type !== 'file') {
			if (!ST.set(def.key, pickSel)) { toast('이 항목은 ' + def.base + ' 폴더의 이미지만 쓸 수 있습니다.', 'err'); return; }
		} else {
			toast('바꿀 이미지를 골라 주세요.');
			return;
		}
		closePicker();
		toast('이미지를 바꿨습니다. 발행해야 실제로 반영됩니다.');
	}

	/* ---------------------------------------------- GitHub 연결 */
	function fillToken() {
		var tok = G.getToken();
		$('#fTok').value = tok || '';
		$('#fRemember').checked = G.isRemembered();
		say('#tokMsg', tok ? '토큰이 이 브라우저에 등록되어 있습니다.' : '아직 토큰이 등록되지 않았습니다. 발행하려면 등록해 주세요.', tok ? 'ok' : 'info');
	}

	function saveToken() {
		var tk = $('#fTok').value.trim();
		if (!tk) { say('#tokMsg', '토큰을 입력해 주세요.', 'err'); return Promise.reject(); }
		var btn = $('#btnTokSave');
		btn.disabled = true;
		say('#tokMsg', '토큰과 저장소 권한을 확인하고 있습니다.', 'info');
		return G.verify(tk, $('#fRemember').checked).then(function (me) {
			btn.disabled = false;
			say('#tokMsg', '연결되었습니다. (' + ((me && me.login) || '') + ')', 'ok');
			showWho();
			syncAll();
			return me;
		}).catch(function (err) {
			btn.disabled = false;
			say('#tokMsg', (err && err.message) || '연결에 실패했습니다.', 'err');
			syncAll();
			throw err;
		});
	}

	/* ---------------------------------------------- 비밀번호 변경 */
	function savePw() {
		var o = $('#pwOld').value, n = $('#pwNew').value, n2 = $('#pwNew2').value;
		if (o !== currentPw()) { say('#pwMsg', '현재 비밀번호가 올바르지 않습니다.', 'err'); return; }
		if (n.length < 4) { say('#pwMsg', '새 비밀번호는 4자 이상으로 정해 주세요.', 'err'); return; }
		if (n !== n2) { say('#pwMsg', '새 비밀번호가 서로 다릅니다.', 'err'); return; }
		try { localStorage.setItem(PW_KEY, n); } catch (e) {
			say('#pwMsg', '이 브라우저에 저장할 수 없습니다.', 'err');
			return;
		}
		$('#pwOld').value = $('#pwNew').value = $('#pwNew2').value = '';
		say('#pwMsg', '비밀번호를 바꿨습니다.', 'ok');
		toast('비밀번호를 바꿨습니다.', 'ok');
	}

	/* ---------------------------------------------- 발행 */
	function openPublish() {
		var list = ST.changeList();
		if (!list.length) { toast('발행할 변경사항이 없습니다.'); return; }

		var v = ST.check();
		if (!v.ok) { toast(v.message, 'err'); return; }

		if (!G.hasToken()) {
			toast('발행하려면 GitHub 토큰을 먼저 등록해 주세요.', 'err');
			location.hash = '#token';
			setTimeout(function () { $('#fTok').focus(); }, 120);
			return;
		}

		$('#pubN').textContent = list.length;
		$('#pubList').innerHTML = list.map(function (c) { return '· ' + esc(c.label); }).join('<br>');
		say('#pubMsg', '', 'info');
		$('#pubGo').disabled = false;
		$('#pubGo').textContent = '발행하기';
		$('#pubDim').classList.add('on');
	}

	function doPublish() {
		var btn = $('#pubGo');
		btn.disabled = true;
		say('#pubMsg', '준비하는 중...', 'info');

		ST.publish(function (step) { say('#pubMsg', step, 'info'); }).then(function (r) {
			say('#pubMsg', '발행했습니다. (커밋 ' + r.short + ') 공개 사이트 반영까지 1~2분 걸릴 수 있습니다.', 'ok');
			btn.textContent = '완료';
			try { localStorage.setItem(LAST_PUB, new Date().toLocaleString('ko-KR') + ' · ' + r.short); } catch (e) {}
			ST.clearDraft();
			toast('발행이 끝났습니다.', 'ok');
			setTimeout(function () { $('#pubDim').classList.remove('on'); }, 2200);
		}).catch(function (err) {
			btn.disabled = false;
			if (err.conflict) {
				say('#pubMsg', err.message + ' [최신 내용 불러오기] 를 누르면 내 수정사항은 사라집니다.', 'err');
				var b = d.createElement('button');
				b.type = 'button'; b.className = 'btn sm'; b.style.marginTop = '8px';
				b.textContent = '최신 내용 불러오기';
				b.addEventListener('click', function () { ST.clearDraft(); location.reload(); });
				$('#pubMsg').appendChild(d.createElement('br'));
				$('#pubMsg').appendChild(b);
			} else {
				say('#pubMsg', err.message || '발행에 실패했습니다.', 'err');
			}
		});
	}

	/* ---------------------------------------------- 묶어서 연결 */
	function bind() {
		w.addEventListener('hashchange', route);

		$$('[data-view]').forEach(function (a) {
			a.addEventListener('click', function (ev) {
				var v = a.getAttribute('data-view');
				if (a.tagName === 'A' && a.getAttribute('href')) return;
				ev.preventDefault();
				location.hash = '#' + v;
			});
		});

		$('#menuBtn').addEventListener('click', function () { $('#side').classList.toggle('open'); });
		$('#logoutBtn').addEventListener('click', logout);
		$('#btnPublish').addEventListener('click', openPublish);
		$('#btnPublish2').addEventListener('click', openPublish);
		$('#pubGo').addEventListener('click', doPublish);
		$('#btnHistReload').addEventListener('click', renderHistory);
		$('#btnTokSave').addEventListener('click', function () { saveToken().catch(function () {}); });
		$('#btnTokClear').addEventListener('click', function () {
			G.clearToken();
			$('#fTok').value = '';
			$('#topWho').textContent = '';
			say('#tokMsg', '연결을 끊었습니다.', 'info');
			syncAll();
		});
		$('#btnPwSave').addEventListener('click', savePw);

		$('#btnResetAll').addEventListener('click', function () {
			if (!ST.isDirty()) return;
			if (confirm('수정한 내용을 모두 되돌립니다. 계속할까요?')) { ST.resetAll(); toast('모두 되돌렸습니다.'); }
		});

		var t1;
		$('#imgSearch').addEventListener('input', function () {
			clearTimeout(t1);
			var v = this.value;
			t1 = setTimeout(function () { filter.image = v; renderCats('image'); }, 150);
		});
		var t2;
		$('#txtSearch').addEventListener('input', function () {
			clearTimeout(t2);
			var v = this.value;
			t2 = setTimeout(function () { filter.text = v; renderCats('text'); }, 150);
		});

		$$('[data-close]').forEach(function (b) {
			b.addEventListener('click', function () { $('#' + b.getAttribute('data-close')).classList.remove('on'); });
		});
		$('#pickDim').addEventListener('click', function (ev) { if (ev.target === $('#pickDim')) closePicker(); });
		$('#pubDim').addEventListener('click', function (ev) { if (ev.target === $('#pubDim')) $('#pubDim').classList.remove('on'); });
		$('#pickApply').addEventListener('click', applyPick);
		$('#pickFile').addEventListener('change', function () { takeFile(this.files[0]); this.value = ''; });

		var drop = $('#pickDrop');
		DROP_HTML = drop.innerHTML;
		$('#pickBrowse').addEventListener('click', function () { $('#pickFile').click(); });
		['dragenter', 'dragover'].forEach(function (t) {
			drop.addEventListener(t, function (ev) { ev.preventDefault(); drop.classList.add('over'); });
		});
		drop.addEventListener('dragleave', function () { if (!pickUpload) drop.classList.remove('over'); });
		drop.addEventListener('drop', function (ev) {
			ev.preventDefault();
			takeFile(ev.dataTransfer.files && ev.dataTransfer.files[0]);
		});

		/* 저장하지 않고 나가려 하면 붙잡는다 */
		w.addEventListener('beforeunload', function (ev) {
			if (!ST.isDirty()) return;
			ev.preventDefault();
			ev.returnValue = '';
			return '';
		});
	}

	/* ---------------------------------------------- 실행 */
	initLogin();
	bind();
})(window, document);
