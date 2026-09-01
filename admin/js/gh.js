/* ========================================================
 * MEDITIVE Admin — GitHub 연결기
 *
 * 토큰은 코드에 절대 넣지 않는다. 운영자가 로그인할 때 직접 입력하며
 *   - 기본           : sessionStorage (브라우저 탭을 닫으면 사라짐)
 *   - "저장" 선택 시 : localStorage
 * 에만 보관한다.
 *
 * 발행은 Git Data API 를 써서 여러 파일을 바꾸더라도
 * "저장하고 발행" 한 번에 커밋 한 개만 남긴다.
 * 발행 직전 원격 최신 상태를 확인해 남의 수정본을 덮어쓰지 않는다.
======================================================== */
(function (w) {
	'use strict';

	var CFG = {
		owner: 'firstmk111-code',
		repo: 'meditive-web',
		branch: 'main',
		site: 'https://firstmk111-code.github.io/meditive-web/'
	};

	var KEY_TOKEN = 'meditive.admin.token';
	var API = 'https://api.github.com';

	/* ---------------------------------------------- 토큰 보관 */
	var memToken = '';

	function setToken(tok, remember) {
		memToken = tok || '';
		try {
			sessionStorage.removeItem(KEY_TOKEN);
			localStorage.removeItem(KEY_TOKEN);
			if (!tok) return;
			(remember ? localStorage : sessionStorage).setItem(KEY_TOKEN, tok);
		} catch (e) { /* 저장이 막혀 있어도 메모리로는 동작한다 */ }
	}

	function getToken() {
		if (memToken) return memToken;
		try {
			memToken = sessionStorage.getItem(KEY_TOKEN) || localStorage.getItem(KEY_TOKEN) || '';
		} catch (e) { memToken = ''; }
		return memToken;
	}

	function isRemembered() {
		try { return !!localStorage.getItem(KEY_TOKEN); } catch (e) { return false; }
	}

	function clearToken() { setToken('', false); }

	function hasToken() { return !!getToken(); }

	/* ---------------------------------------------- 통신 기본 */
	function req(path, opt) {
		opt = opt || {};
		var url = path.charAt(0) === '/' ? API + path : path;
		var headers = {
			'Accept': 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28'
		};
		var tok = getToken();
		if (tok) headers.Authorization = 'Bearer ' + tok;
		if (opt.body) headers['Content-Type'] = 'application/json';

		return fetch(url, {
			method: opt.method || 'GET',
			headers: headers,
			body: opt.body ? JSON.stringify(opt.body) : undefined,
			cache: 'no-store'
		}).then(function (res) {
			return res.text().then(function (t) {
				var data = null;
				try { data = t ? JSON.parse(t) : null; } catch (e) { data = null; }
				if (!res.ok) {
					var msg = (data && data.message) || ('통신 실패 (' + res.status + ')');
					if (res.status === 401) msg = '토큰이 올바르지 않거나 만료되었습니다.';
					if (res.status === 403) msg = '권한이 없거나 요청 한도를 넘었습니다. (' + msg + ')';
					if (res.status === 404) msg = '경로를 찾을 수 없습니다. 저장소 이름과 토큰 권한을 확인해 주세요.';
					var err = new Error(msg);
					err.status = res.status;
					err.data = data;
					throw err;
				}
				return data;
			});
		});
	}

	function repoPath(sub) {
		return '/repos/' + CFG.owner + '/' + CFG.repo + sub;
	}

	/* ---------------------------------------------- 문자 <-> base64 (한글 안전) */
	function textToBytes(str) {
		if (w.TextEncoder) return new TextEncoder().encode(str);
		var utf = unescape(encodeURIComponent(str)), a = new Uint8Array(utf.length), i;
		for (i = 0; i < utf.length; i++) a[i] = utf.charCodeAt(i);
		return a;
	}

	function bytesToText(bytes) {
		if (w.TextDecoder) return new TextDecoder('utf-8').decode(bytes);
		var s = '', i;
		for (i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
		return decodeURIComponent(escape(s));
	}

	function b64ToBytes(b64) {
		var bin = atob(String(b64).replace(/\s/g, '')), a = new Uint8Array(bin.length), i;
		for (i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
		return a;
	}

	function bytesToB64(bytes) {
		var s = '', i, CH = 0x8000;
		for (i = 0; i < bytes.length; i += CH) {
			s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
		}
		return btoa(s);
	}

	function b64ToText(b64) { return bytesToText(b64ToBytes(b64)); }

	/* ---------------------------------------------- 조회 */
	function whoAmI() { return req('/user'); }

	function checkRepo() { return req(repoPath('')); }

	/* 브랜치 최신 커밋 SHA */
	function headSha() {
		return req(repoPath('/git/ref/heads/' + CFG.branch)).then(function (r) {
			return r.object.sha;
		});
	}

	/* 파일 내용을 글자로 읽는다 (원격이 실패하면 같은 폴더의 실제 파일로 대체) */
	function readText(path) {
		var url = repoPath('/contents/' + encodeURI(path) + '?ref=' + encodeURIComponent(CFG.branch) + '&t=' + Date.now());
		return req(url).then(function (r) {
			return { text: b64ToText(r.content), sha: r.sha, from: 'github' };
		}).catch(function (err) {
			return fetch('../' + path + '?t=' + Date.now(), { cache: 'no-store' }).then(function (res) {
				if (!res.ok) throw err;
				return res.text();
			}).then(function (t) {
				return { text: t, sha: '', from: 'local' };
			});
		});
	}

	/* 토큰이 실제로 쓸 수 있는지 확인한다 (저장 권한까지) */
	function verify(tok, remember) {
		var before = getToken(), beforeRemember = isRemembered();
		setToken(tok, remember);
		return whoAmI().then(function (me) {
			return checkRepo().then(function (repo) {
				if (!repo.permissions || !repo.permissions.push) {
					throw new Error('이 토큰에는 저장 권한(Contents: write)이 없습니다.');
				}
				return me;
			});
		}).catch(function (err) {
			setToken(before, beforeRemember);
			throw err;
		});
	}

	/* 최근 발행 이력 */
	function history(n) {
		return req(repoPath('/commits?sha=' + encodeURIComponent(CFG.branch) + '&per_page=' + (n || 10) + '&t=' + Date.now()))
			.then(function (r) {
				return (r || []).map(function (c) {
					return {
						sha: c.sha,
						short: c.sha.slice(0, 7),
						message: (c.commit && c.commit.message) || '',
						date: (c.commit && c.commit.author && c.commit.author.date) || '',
						author: (c.commit && c.commit.author && c.commit.author.name) || '',
						url: c.html_url
					};
				});
			})
			.catch(function () { return []; });
	}

	/* 폴더 목록 */
	function listDir(path) {
		return req(repoPath('/contents/' + encodeURI(path) + '?ref=' + encodeURIComponent(CFG.branch) + '&t=' + Date.now()))
			.then(function (r) { return (r && r.length) ? r : []; })
			.catch(function () { return []; });
	}

	/* ---------------------------------------------- 발행 (커밋 1개) */
	/*
	 * files = [{ path, text }]            글자 파일
	 *       | [{ path, b64  }]            이미지 등 이진 파일
	 * baseSha : 편집을 시작할 때의 커밋 SHA. 그 사이 원격이 바뀌었으면 멈춘다.
	 */
	function publish(files, message, baseSha, onStep) {
		var step = onStep || function () {};
		var latest;

		return headSha().then(function (sha) {
			latest = sha;
			if (baseSha && baseSha !== sha) {
				var e = new Error('다른 곳에서 먼저 저장한 내용이 있습니다. 최신 내용을 다시 불러온 뒤 발행해 주세요.');
				e.conflict = true;
				e.latest = sha;
				throw e;
			}
			step('파일 올리는 중 (0/' + files.length + ')');

			/* 파일을 하나씩 blob 으로 올린다 */
			var blobs = [];
			var chain = Promise.resolve();
			files.forEach(function (f, i) {
				chain = chain.then(function () {
					var body = (typeof f.b64 === 'string')
						? { content: f.b64, encoding: 'base64' }
						: { content: f.text, encoding: 'utf-8' };
					return req(repoPath('/git/blobs'), { method: 'POST', body: body }).then(function (r) {
						blobs.push({ path: f.path, mode: '100644', type: 'blob', sha: r.sha });
						step('파일 올리는 중 (' + (i + 1) + '/' + files.length + ')');
					});
				});
			});
			return chain.then(function () { return blobs; });
		}).then(function (blobs) {
			step('변경 목록 만드는 중');
			return req(repoPath('/git/trees'), {
				method: 'POST',
				body: { base_tree: latest, tree: blobs }
			});
		}).then(function (tree) {
			step('커밋 만드는 중');
			return req(repoPath('/git/commits'), {
				method: 'POST',
				body: { message: message, tree: tree.sha, parents: [latest] }
			});
		}).then(function (commit) {
			step('반영하는 중');
			return req(repoPath('/git/refs/heads/' + CFG.branch), {
				method: 'PATCH',
				body: { sha: commit.sha, force: false }
			}).then(function () { return commit; });
		}).then(function (commit) {
			return {
				sha: commit.sha,
				short: commit.sha.slice(0, 7),
				url: 'https://github.com/' + CFG.owner + '/' + CFG.repo + '/commit/' + commit.sha
			};
		});
	}

	w.CMSGit = {
		CFG: CFG,
		setToken: setToken,
		getToken: getToken,
		clearToken: clearToken,
		hasToken: hasToken,
		isRemembered: isRemembered,
		whoAmI: whoAmI,
		checkRepo: checkRepo,
		verify: verify,
		history: history,
		headSha: headSha,
		readText: readText,
		listDir: listDir,
		publish: publish,
		bytesToB64: bytesToB64,
		b64ToBytes: b64ToBytes,
		textToBytes: textToBytes
	};
})(window);
