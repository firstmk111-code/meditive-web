/* ========================================================
 * MEDITIVE Admin — 상품몰 홈(js/shop_home.js) 외과수술 엔진
 *
 * 상품몰 첫 화면의 큰 배너 5장(HERO)과
 * "무료 템플릿" 영역에서 목업 위에 입혀지는 디자인 이미지 목록(POOL)은
 * HTML 이 아니라 js/shop_home.js 안의 자바스크립트 값으로 들어 있다.
 *
 * 이 파일은 그 값이 들어 있는 따옴표 안쪽만 정확히 찾아 바꾼다.
 * 배너 순서 · 링크 · 목업 형태 · 상품 연결 등 나머지 코드는 한 글자도 건드리지 않는다.
 *
 * 배너 제목은 코드상 <br> 과 <b> 가 섞여 있으므로
 * 운영자에게는 "첫 줄 / 둘째 줄(굵게)" 두 칸으로 나누어 보여주고
 * 저장할 때 원래 형태 그대로 다시 합친다.
======================================================== */
(function (w) {
	'use strict';

	/* 따옴표 안에 넣을 수 있게 다듬는다 (줄바꿈은 한 칸 띄어쓰기로) */
	function esc(s) {
		return String(s == null ? '' : s)
			.replace(/\\/g, '\\\\')
			.replace(/'/g, "\\'")
			.replace(/[\r\n]+/g, ' ');
	}
	function unesc(s) { return String(s == null ? '' : s).replace(/\\([\s\S])/g, '$1'); }

	/* ----------------------------------------------------
	 * 0. var 이름 = [ ... ]  /  var 이름 = { ... } 블록 잘라내기
	 *    따옴표 안의 괄호는 세지 않는다.
	---------------------------------------------------- */
	function block(text, name, open, close) {
		var src = String(text || '');
		var m = new RegExp('var\\s+' + name + '\\s*=\\s*\\' + open).exec(src);
		if (!m) return null;
		var start = m.index + m[0].length;
		var depth = 1, i = start, q = 0, c;
		while (i < src.length && depth > 0) {
			c = src.charAt(i);
			if (q) {
				if (c === '\\') i++;
				else if (c === q) q = 0;
			} else if (c === "'" || c === '"') { q = c; }
			else if (c === open) { depth++; }
			else if (c === close) { depth--; if (!depth) break; }
			i++;
		}
		if (depth) return null;
		return { start: start, end: i, body: src.slice(start, i) };
	}

	/* 한 덩어리 안에서 field: '값' 의 값만 읽고 쓴다 */
	function fieldRe(name) {
		return new RegExp("(\\b" + name + ":\\s*')((?:[^'\\\\]|\\\\.)*)(')");
	}
	function fieldRead(body, name) {
		var m = fieldRe(name).exec(body);
		return m ? unesc(m[2]) : null;
	}
	function fieldWrite(body, name, value) {
		var re = fieldRe(name);
		if (!re.test(body)) return body;
		re.lastIndex = 0;
		return body.replace(re, function (all, a, old, b) { return a + esc(value) + b; });
	}

	/* ----------------------------------------------------
	 * 1. 배너 (HERO)
	 *    { label:'…', tit:'…<br><b>…</b>', desc:'…', cta:'…', href:…, pic:'niz01.jpg' }
	---------------------------------------------------- */
	var FIELDS = { label: 1, tit: 1, desc: 1, cta: 1, pic: 1 };

	function heroSpans(text) {
		var b = block(text, 'HERO', '[', ']');
		if (!b) return [];
		var out = [], re = /\{[^{}]*\}/g, m;
		while ((m = re.exec(b.body))) {
			if (m[0].indexOf('label:') < 0) continue;
			out.push({ start: b.start + m.index, end: b.start + m.index + m[0].length, body: m[0] });
		}
		return out;
	}

	/* 제목을 "첫 줄 / 둘째 줄(굵게)" 로 쪼갠다.
	 * 아무것도 고치지 않고 다시 합치면 반드시 원본과 같아야 하므로
	 * 사이의 <br> 형태와 공백까지 그대로 보관한다. */
	var TIT_RE = /^([\s\S]*?)(<br[^>]*>)(\s*)<b>([\s\S]*)<\/b>(\s*)$/i;
	function titParts(raw) {
		var s = String(raw == null ? '' : raw);
		var m = TIT_RE.exec(s);
		if (!m) return { a: s, br: '<br>', g1: '', b: '', g2: '', has: false };
		return { a: m[1], br: m[2], g1: m[3], b: m[4], g2: m[5], has: true };
	}
	function titJoin(p) {
		if (!p.has || p.b === '') return p.a;
		return p.a + p.br + p.g1 + '<b>' + p.b + '</b>' + p.g2;
	}

	function heroList(text) {
		return heroSpans(text).map(function (sp, i) {
			var tit = fieldRead(sp.body, 'tit') || '';
			var t = titParts(tit);
			return {
				n: i + 1,
				label: fieldRead(sp.body, 'label') || '',
				tit: tit,
				tit1: t.a,
				tit2: t.b,
				desc: fieldRead(sp.body, 'desc') || '',
				cta: fieldRead(sp.body, 'cta') || '',
				pic: fieldRead(sp.body, 'pic') || ''
			};
		});
	}

	function heroRead(text, n, field) {
		var sp = heroSpans(text)[n - 1];
		if (!sp) return null;
		if (field === 'tit1' || field === 'tit2') {
			var t = titParts(fieldRead(sp.body, 'tit') || '');
			return field === 'tit1' ? t.a : t.b;
		}
		if (!FIELDS[field]) return null;
		return fieldRead(sp.body, field);
	}

	function heroWrite(text, n, field, value) {
		var src = String(text || '');
		var sp = heroSpans(src)[n - 1];
		if (!sp) return src;
		var body = sp.body;

		if (field === 'tit1' || field === 'tit2') {
			var t = titParts(fieldRead(body, 'tit') || '');
			if (field === 'tit1') t.a = String(value == null ? '' : value);
			else { t.b = String(value == null ? '' : value); if (!t.has && t.b) { t.has = true; } }
			body = fieldWrite(body, 'tit', titJoin(t));
			/* 제목은 <br> · <b> 를 그대로 살려야 하므로 이스케이프만 하고 태그는 남긴다 */
			return src.slice(0, sp.start) + body + src.slice(sp.end);
		}

		if (!FIELDS[field]) return src;
		body = fieldWrite(body, field, value);
		return src.slice(0, sp.start) + body + src.slice(sp.end);
	}

	/* ----------------------------------------------------
	 * 2. 무료 템플릿 이미지 목록 (POOL)
	 *    card: ['p05.jpg', 'p44.jpg', … ],
	---------------------------------------------------- */
	var POOL_LINE = /(^|\n)([ \t]*)([a-zA-Z0-9_]+)(\s*:\s*\[)([^\]]*)(\])/g;
	var STR_RE = /'((?:[^'\\]|\\.)*)'/g;

	function poolList(text) {
		var b = block(text, 'POOL', '{', '}');
		if (!b) return [];
		var out = [], m;
		POOL_LINE.lastIndex = 0;
		while ((m = POOL_LINE.exec(b.body))) {
			var files = [], s;
			STR_RE.lastIndex = 0;
			while ((s = STR_RE.exec(m[5]))) files.push(unesc(s[1]));
			out.push({ key: m[3], files: files });
		}
		return out;
	}

	/* POOL 안에서 특정 키의 대괄호 안쪽 위치를 찾는다 */
	function poolInner(text, key) {
		var b = block(text, 'POOL', '{', '}');
		if (!b) return null;
		var re = new RegExp("(^|\\n)[ \\t]*" + key + "\\s*:\\s*\\[([^\\]]*)\\]");
		var m = re.exec(b.body);
		if (!m) return null;
		var innerAt = b.start + m.index + m[0].indexOf('[') + 1;
		return { start: innerAt, end: innerAt + m[2].length, body: m[2] };
	}

	function poolRead(text, key, idx) {
		var inner = poolInner(text, key);
		if (!inner) return null;
		var out = [], s;
		STR_RE.lastIndex = 0;
		while ((s = STR_RE.exec(inner.body))) out.push(unesc(s[1]));
		return idx >= 1 && idx <= out.length ? out[idx - 1] : null;
	}

	function poolWrite(text, key, idx, value) {
		var src = String(text || '');
		var inner = poolInner(src, key);
		if (!inner) return src;
		var n = 0;
		STR_RE.lastIndex = 0;
		var body = inner.body.replace(STR_RE, function (all, old) {
			n++;
			return n === idx ? ("'" + esc(value) + "'") : all;
		});
		if (n < idx) return src;
		return src.slice(0, inner.start) + body + src.slice(inner.end);
	}

	/* ----------------------------------------------------
	 * 3. 묶음 적용 · 문법 검사
	 *    edits = [{ kind:'hero', n, field, value }
	 *             { kind:'pool', pool, idx, value }]
	---------------------------------------------------- */
	function applyEdits(text, edits) {
		var out = String(text || ''), i, e;
		for (i = 0; i < edits.length; i++) {
			e = edits[i];
			if (e.kind === 'pool') out = poolWrite(out, e.pool, e.idx, e.value);
			else out = heroWrite(out, e.n, e.field, e.value);
		}
		return out;
	}

	function validate(text) {
		try {
			/* eslint-disable no-new-func */
			new Function(String(text || ''));
			return { ok: true, message: '' };
		} catch (e) {
			return { ok: false, message: e.message || '문법 오류' };
		}
	}

	w.CMSShopHome = {
		heroList: heroList,
		heroRead: heroRead,
		heroWrite: heroWrite,
		poolList: poolList,
		poolRead: poolRead,
		poolWrite: poolWrite,
		applyEdits: applyEdits,
		validate: validate
	};
})(window);
