/* ========================================================
 * MEDITIVE Admin — 화면 동작
 *
 * 운영자에게 HTML 코드를 보여주지 않는다.
 * 모든 편집은 일반 입력창(한 줄 / 여러 줄 / 링크 / 이미지)으로만 이루어진다.
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

	/* ---------------------------------------------- 로그인 */
	function currentPw() {
		try { return localStorage.getItem(PW_KEY) || DEFAULT_PW; } catch (e) { return DEFAULT_PW; }
	}

	function initLogin() {
		var tok = G.getToken();
		if (tok) $('#fTok').value = tok;
		$('#fRemember').checked = G.isRemembered();

		$('#loginForm').addEventListener('submit', function (ev) {
			ev.preventDefault();
			var pw = $('#fPw').value;
			var tk = $('#fTok').value.trim();
			var remember = $('#fRemember').checked;

			if (pw !== currentPw()) { say('#loginMsg', '비밀번호가 올바르지 않습니다.', 'err'); return; }
			if (!tk) { say('#loginMsg', 'GitHub Access Token 을 입력해 주세요.', 'err'); return; }

			var btn = $('#loginBtn');
			btn.disabled = true; btn.textContent = '확인하는 중...';
			say('#loginMsg', '토큰과 저장소 권한을 확인하고 있습니다.', 'info');

			G.setToken(tk, remember);
			G.whoAmI().then(function (me) {
				return G.checkRepo().then(function (repo) {
					if (!repo.permissions || !repo.permissions.push) {
						throw new Error('이 토큰에는 저장 권한(Contents: write)이 없습니다.');
					}
					return me;
				});
			}).then(function (me) {
				say('#loginMsg', '', 'info');
				start(me);
			}).catch(function (err) {
				G.setToken('', false);
				btn.disabled = false; btn.textContent = '로그인';
				say('#loginMsg', err.message || '연결에 실패했습니다.', 'err');
			});
		});
	}

	function logout() {
		if (ST.isDirty() && !confirm('저장하지 않은 변경사항이 있습니다. 그래도 로그아웃할까요?')) return;
		G.clearToken();
		ST.clearDraft();
		location.reload();
	}

	/* ---------------------------------------------- 시작 */
	var me = null;

	function start(user) {
		me = user;
		$('#loginView').hidden = true;
		$('#loginView').style.display = 'none';
		$('#app').classList.add('on');
		$('#topWho').textContent = (user && user.login) ? user.login : '';

		ST.loadAll().then(function () {
			buildBanner();
			buildText();
			buildImages();
			loadGallery();
			ST.onChange(syncAll);
			syncAll();
			route();
			var from = ST.state.originFrom.home;
			$('#dsNote').innerHTML = from === 'github'
				? '원본을 GitHub 저장소(<b>' + esc(G.CFG.branch) + '</b> 브랜치)에서 불러왔습니다. 발행하면 같은 곳에 커밋 한 개로 저장됩니다.'
				: 'GitHub 에서 원본을 읽지 못해 <b>내 컴퓨터의 파일</b>을 불러왔습니다. 발행 전에 연결 상태를 확인해 주세요.';
		}).catch(function (err) {
			toast(err.message || '내용을 불러오지 못했습니다.', 'err');
		});
	}

	/* ---------------------------------------------- 화면 이동 */
	var TITLES = {
		dashboard: '대시보드', banner: '홈 배너', text: '텍스트 관리',
		image: '이미지 관리', preview: '미리보기', changes: '변경사항'
	};

	function route() {
		var id = (location.hash || '#dashboard').replace('#', '');
		if (!TITLES[id]) id = 'dashboard';
		$$('.view').forEach(function (v) { v.classList.toggle('on', v.id === 'v-' + id); });
		$$('#nav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-view') === id); });
		$('#topTit').textContent = TITLES[id];
		$('#side').classList.remove('open');
		if (id === 'preview') renderPreview();
		if (id === 'changes') renderChanges();
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
	function imageSlot(def) {
		var box = d.createElement('div');
		box.className = 'card img-slot';
		box.dataset.key = def.key;
		box.innerHTML =
			'<div class="thumb"><img alt=""></div>' +
			'<div class="nm">' + esc(def.label) + '</div>' +
			'<div class="pt" data-pt></div>' +
			'<div class="acts">' +
				'<button type="button" class="btn sm" data-act="pick">교체</button>' +
				'<button type="button" class="btn ghost sm" data-act="undo" hidden>되돌리기</button>' +
			'</div>';

		$('[data-act=pick]', box).addEventListener('click', function () { openPicker(def); });
		$('[data-act=undo]', box).addEventListener('click', function () {
			var cur = ST.value(def.key);
			ST.dropUpload(cur);
			ST.reset(def.key);
		});

		box._sync = function () {
			var changed = ST.isChanged(def.key);
			box.classList.toggle('changed', changed);
			$('[data-act=undo]', box).hidden = !changed;
			$('[data-pt]', box).textContent = ST.value(def.key);
			var img = $('img', box);
			var src = ST.imageSrc(def.key);
			if (img.getAttribute('src') !== src) img.setAttribute('src', src);
		};
		return box;
	}

	/* ---------------------------------------------- 각 화면 구성 */
	var rows = [];

	function group(name, desc, open) {
		var det = d.createElement('details');
		det.className = 'card grp';
		if (open) det.open = true;
		det.innerHTML = '<summary>' + esc(name) + '<span class="desc">' + esc(desc || '') + '</span></summary>' +
			'<div class="grp-body"></div>';
		return det;
	}

	function buildBanner() {
		var g = null, i;
		for (i = 0; i < S.GROUPS.length; i++) if (S.GROUPS[i].id === 'hero') g = S.GROUPS[i];
		if (!g) return;

		var box = $('#bannerText');
		box.innerHTML = '';
		var card = d.createElement('div');
		card.className = 'card';
		card.style.padding = '4px 20px';
		g.fields.forEach(function (f) {
			var r = fieldRow(f);
			card.appendChild(r);
			rows.push(r);
		});
		box.appendChild(card);

		var grid = $('#bannerImgs');
		grid.innerHTML = '';
		g.images.forEach(function (f) {
			var s = imageSlot(f);
			grid.appendChild(s);
			rows.push(s);
		});
	}

	function buildText() {
		var wrap = $('#textGroups');
		wrap.innerHTML = '';
		S.GROUPS.forEach(function (g, gi) {
			if (!g.fields.length) return;
			var det = group(g.name, g.desc, gi === 0);
			var body = $('.grp-body', det);
			g.fields.forEach(function (f) {
				var r = fieldRow(f);
				body.appendChild(r);
				rows.push(r);
			});
			wrap.appendChild(det);
		});
	}

	function buildImages() {
		var wrap = $('#imageGroups');
		wrap.innerHTML = '';
		S.GROUPS.forEach(function (g, gi) {
			if (!g.images.length) return;
			var det = group(g.name, g.images.length + '장', gi === 0);
			var body = $('.grp-body', det);
			var grid = d.createElement('div');
			grid.className = 'img-grid';
			grid.style.paddingTop = '14px';
			g.images.forEach(function (f) {
				var s = imageSlot(f);
				grid.appendChild(s);
				rows.push(s);
			});
			body.appendChild(grid);
			wrap.appendChild(det);
		});
	}

	/* ---------------------------------------------- 상태 반영 */
	function syncAll() {
		var n = ST.count();
		$('#navCnt').textContent = n;
		$('#dsChg').innerHTML = n + '<small>건</small>';
		$('#topDirty').hidden = !n;
		$('#topDirtyN').textContent = n;
		$('#btnPublish').disabled = !n;
		$('#btnPublish2').disabled = !n;

		var txt = 0, img = 0;
		S.GROUPS.forEach(function (g) { txt += g.fields.length; img += g.images.length; });
		$('#dsTxt').innerHTML = txt + '<small>개</small>';
		$('#dsImg').innerHTML = img + '<small>개</small>';
		try {
			var lp = localStorage.getItem(LAST_PUB);
			$('#dsPub').textContent = lp || '-';
		} catch (e) {}

		rows.forEach(function (r) { if (r._sync) r._sync(); });
		if ($('#v-changes').classList.contains('on')) renderChanges();
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
			'<th style="width:26%">항목</th><th style="width:30%">이전</th><th>변경 후</th><th style="width:80px"></th>' +
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

	/* ---------------------------------------------- 미리보기 */
	function renderPreview() {
		var f = $('#pvFrame');
		f.srcdoc = ST.previewHtml('home');
	}

	/* ---------------------------------------------- 이미지 고르기 */
	var GALLERY = { all: [] };
	var CATS = [
		{ id: 'main', name: '홈 · 메인', test: function (p) { return p.indexOf('images/main/') === 0; } },
		{ id: 'portfolio', name: '포트폴리오', test: function (p) { return p.indexOf('images/portfolio/') === 0; } },
		{ id: 'banners', name: '서브 배너', test: function (p) { return p.indexOf('images/banners/') === 0; } },
		{ id: 'brand', name: '브랜드 · 공통', test: function (p) { return p.indexOf('images/brand/') === 0 || p.indexOf('images/common/') === 0; } }
	];

	function loadGallery() {
		var dirs = ['images/main', 'images/portfolio', 'images/banners', 'images/brand', 'images/common'];
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
	var pickUpload = null;   /* 새로 올린 파일 { path, b64, dataUrl, name, size, type } */
	var DROP_HTML = '';      /* 파일 올리기 안내문 원본 */

	function resetDrop() {
		var drop = $('#pickDrop');
		drop.classList.remove('over');
		drop.innerHTML = DROP_HTML;
		$('#pickBrowse').addEventListener('click', function () { $('#pickFile').click(); });
	}

	function openPicker(def) {
		picking = def;
		pickSel = ST.value(def.key);
		pickUpload = null;
		$('#pickTit').textContent = def.groupName + ' · ' + def.label + ' 교체';
		resetDrop();
		renderPickTabs(CATS[0].id);
		$('#pickDim').classList.add('on');
	}

	function closePicker() {
		$('#pickDim').classList.remove('on');
		picking = null; pickUpload = null;
	}

	function renderPickTabs(active) {
		var tabs = $('#pickTabs');
		tabs.innerHTML = '';
		CATS.forEach(function (c) {
			var b = d.createElement('button');
			b.type = 'button';
			b.textContent = c.name;
			b.className = (c.id === active ? 'on' : '');
			b.addEventListener('click', function () { renderPickTabs(c.id); });
			tabs.appendChild(b);
		});
		renderPickGrid(active);
	}

	function renderPickGrid(catId) {
		var cat = null, i;
		for (i = 0; i < CATS.length; i++) if (CATS[i].id === catId) cat = CATS[i];
		var list = GALLERY.all.filter(function (p) { return cat ? cat.test(p) : true; });
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
		if (!file) return;
		if (!/^image\//.test(file.type)) { toast('이미지 파일만 올릴 수 있습니다.', 'err'); return; }
		if (file.size > 8 * 1024 * 1024) { toast('파일이 너무 큽니다. 8MB 이하로 올려 주세요.', 'err'); return; }

		var cur = ST.value(picking.key) || 'images/main/new.jpg';
		var dir = cur.slice(0, cur.lastIndexOf('/')) || 'images/main';

		var fr = new FileReader();
		fr.onload = function () {
			var dataUrl = fr.result;
			var b64 = String(dataUrl).split(',')[1] || '';
			pickUpload = {
				path: uniquePath(dir, file.name),
				b64: b64, dataUrl: dataUrl,
				name: file.name, size: file.size, type: file.type
			};
			pickSel = pickUpload.path;
			$$('#pickGrid button').forEach(function (x) { x.classList.remove('on'); });
			$('#pickDrop').classList.add('over');
			$('#pickDrop').innerHTML = '<b>' + esc(file.name) + '</b> 준비됨 · ' + Math.round(file.size / 1024) + 'KB' +
				'<div class="hint" style="margin-top:6px;">발행할 때 <b>' + esc(pickUpload.path) + '</b> 로 저장됩니다.</div>';
		};
		fr.readAsDataURL(file);
	}

	function applyPick() {
		if (!picking) return;
		if (pickUpload) {
			ST.addUpload(pickUpload.path, pickUpload.b64, pickUpload);
			ST.set(picking.key, pickUpload.path);
		} else if (pickSel) {
			ST.set(picking.key, pickSel);
		}
		closePicker();
		toast('이미지를 바꿨습니다. 발행해야 실제로 반영됩니다.');
	}

	/* ---------------------------------------------- 발행 */
	function openPublish() {
		var list = ST.changeList();
		if (!list.length) { toast('발행할 변경사항이 없습니다.'); return; }
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
				b.addEventListener('click', function () {
					ST.clearDraft();
					location.reload();
				});
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
				if (a.tagName === 'A' && a.getAttribute('href')) return;   /* 해시로 이동 */
				ev.preventDefault();
				location.hash = '#' + v;
			});
		});

		$('#menuBtn').addEventListener('click', function () { $('#side').classList.toggle('open'); });
		$('#logoutBtn').addEventListener('click', logout);
		$('#btnPreviewTop').addEventListener('click', function () { location.hash = '#preview'; });
		$('#pvReload').addEventListener('click', renderPreview);
		$('#btnPublish').addEventListener('click', openPublish);
		$('#btnPublish2').addEventListener('click', openPublish);
		$('#pubGo').addEventListener('click', doPublish);
		$('#btnResetAll').addEventListener('click', function () {
			if (!ST.isDirty()) return;
			if (confirm('수정한 내용을 모두 되돌립니다. 계속할까요?')) { ST.resetAll(); toast('모두 되돌렸습니다.'); }
		});

		$$('.pv-bar [data-pw]').forEach(function (b) {
			b.addEventListener('click', function () {
				$$('.pv-bar [data-pw]').forEach(function (x) { x.classList.remove('primary'); });
				b.classList.add('primary');
				$('#pvFrame').style.width = b.getAttribute('data-pw');
			});
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
