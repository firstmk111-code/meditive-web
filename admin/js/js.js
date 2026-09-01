/* ========================================================
 * MEDITIVE Admin — 상품 데이터(js/shop.js) 외과수술 엔진
 *
 * 상품몰 상품 33개는 HTML 이 아니라 js/shop.js 안의
 * 자바스크립트 배열에 들어 있다. 이 파일은 그 배열에서
 * 상품 하나의 이름 · 이미지 · 설명 값만 정확히 찾아 바꾼다.
 *
 * 파일을 통째로 다시 만들지 않고 해당 따옴표 안쪽만 교체하므로
 * 가격표 · 옵션 · 규격 등 나머지 코드는 한 글자도 변하지 않는다.
 * 저장 직전에 문법 검사를 통과하지 못하면 발행을 막는다.
======================================================== */
(function (w) {
	'use strict';

	/* 상품 한 건의 머리 부분 :
	 *   id: 'pr01', cat: 'print', name: '진료카드', img: 'p05.jpg',
	 *   desc: '...........'
	 * 뒤따르는 qty · opts · spec 은 건드리지 않는다. */
	function headRe(id) {
		return new RegExp(
			"(\\bid:\\s*'" + id + "',\\s*cat:\\s*'[a-z0-9]+',\\s*name:\\s*')" +   /* 1 앞부분 */
			"((?:[^'\\\\]|\\\\.)*)" +                                              /* 2 이름 */
			"(',\\s*img:\\s*')" +                                                  /* 3 사이 */
			"([^']*)" +                                                            /* 4 이미지 파일명 */
			"(',[^\\n]*\\r?\\n\\s*desc:\\s*')" +                                   /* 5 사이 */
			"((?:[^'\\\\]|\\\\.)*)" +                                              /* 6 설명 */
			"(')"                                                                  /* 7 뒷부분 */
		);
	}

	var SCAN_RE = /\bid:\s*'([a-z0-9]+)',\s*cat:\s*'([a-z0-9]+)',\s*name:\s*'((?:[^'\\]|\\.)*)',\s*img:\s*'([^']*)',[^\n]*\r?\n\s*desc:\s*'((?:[^'\\]|\\.)*)'/g;

	var SLOT = { name: 2, img: 4, desc: 6 };

	/* 따옴표 안에 넣을 수 있게 다듬는다 (줄바꿈은 한 칸 띄어쓰기로) */
	function esc(s) {
		return String(s == null ? '' : s)
			.replace(/\\/g, '\\\\')
			.replace(/'/g, "\\'")
			.replace(/[\r\n]+/g, ' ');
	}

	/* 코드 안의 이스케이프를 사람이 읽는 글자로 되돌린다 */
	function unesc(s) {
		return String(s == null ? '' : s).replace(/\\([\s\S])/g, '$1');
	}

	/* ----------------------------------------------------
	 * 목록 읽기 — 파일 안의 상품을 순서대로 뽑는다
	---------------------------------------------------- */
	function listProducts(text) {
		var out = [], m;
		SCAN_RE.lastIndex = 0;
		while ((m = SCAN_RE.exec(String(text || '')))) {
			out.push({ id: m[1], cat: m[2], name: unesc(m[3]), img: m[4], desc: unesc(m[5]) });
		}
		return out;
	}

	/* 카테고리 목록도 파일에서 그대로 읽어 온다 */
	function listCats(text) {
		var out = [], m;
		var block = /var\s+CATS\s*=\s*\[([\s\S]*?)\];/.exec(String(text || ''));
		if (!block) return out;
		var re = /\{\s*id:\s*'([a-z0-9]+)'\s*,\s*name:\s*'((?:[^'\\]|\\.)*)'/g;
		while ((m = re.exec(block[1]))) out.push({ id: m[1], name: unesc(m[2]) });
		return out;
	}

	/* ----------------------------------------------------
	 * 한 항목 읽기 / 쓰기
	---------------------------------------------------- */
	function read(text, id, field) {
		if (!SLOT[field]) return null;
		var m = headRe(id).exec(String(text || ''));
		return m ? unesc(m[SLOT[field]]) : null;
	}

	function write(text, id, field, value) {
		var slot = SLOT[field];
		if (!slot) return text;
		var re = headRe(id);
		var src = String(text || '');
		if (!re.test(src)) return src;
		re.lastIndex = 0;
		return src.replace(re, function () {
			var g = Array.prototype.slice.call(arguments, 1, 8);
			g[slot - 1] = esc(value);
			return g.join('');
		});
	}

	/* 여러 건을 한 번에 적용 — edits = [{ id, field, value }] */
	function applyEdits(text, edits) {
		var out = String(text || ''), i;
		for (i = 0; i < edits.length; i++) out = write(out, edits[i].id, edits[i].field, edits[i].value);
		return out;
	}

	/* ----------------------------------------------------
	 * 문법 검사 — 따옴표가 깨지면 사이트 전체가 멈추므로
	 * 발행 전에 반드시 통과해야 한다. (실행이 아니라 해석만 한다)
	---------------------------------------------------- */
	function validate(text) {
		try {
			/* eslint-disable no-new-func */
			new Function(String(text || ''));
			return { ok: true, message: '' };
		} catch (e) {
			return { ok: false, message: e.message || '문법 오류' };
		}
	}

	w.CMSJs = {
		listProducts: listProducts,
		listCats: listCats,
		read: read,
		write: write,
		applyEdits: applyEdits,
		validate: validate,
		escape: esc
	};
})(window);
