/* ========================================================
 * MEDITIVE Admin — HTML 외과수술 엔진
 *
 * 원본 HTML 문자열에서 data-cms 표식이 붙은 요소만 정확히 찾아
 * 그 안쪽 내용(또는 속성값)만 바꾼다. DOM 파서를 거치지 않으므로
 * 나머지 바이트는 단 하나도 변하지 않는다.
 *   - 들여쓰기 · 줄바꿈 · 따옴표 · 엔티티 전부 원본 그대로 유지
 *   - 미리보기와 발행이 "동일한 함수"를 쓰므로 결과가 절대 어긋나지 않는다
 *
 * 운영자에게는 HTML 을 보여주지 않는다.
 * 편집기에서는 평문(줄바꿈 = Enter, 강조 = **텍스트**)만 다루고
 * 이 파일이 평문 <-> HTML 을 왕복 변환한다.
======================================================== */
(function (w) {
	'use strict';

	/* ----------------------------------------------------
	 * 1. 태그 짝 찾기
	 * 시작태그 위치에서 출발해 같은 이름의 태그 중첩을 세면서
	 * 짝이 맞는 종료태그를 찾는다. (<br>, <b>, <span> 중첩 안전)
	---------------------------------------------------- */
	var VOID = { br: 1, img: 1, input: 1, hr: 1, meta: 1, link: 1, source: 1, area: 1, base: 1, col: 1, embed: 1, param: 1, track: 1, wbr: 1 };

	/* 시작태그의 '>' 위치를 찾는다. 속성값 안의 '>' 는 건너뛴다 */
	function endOfOpenTag(html, from) {
		var i = from, q = 0, c;
		while (i < html.length) {
			c = html.charAt(i);
			if (q) { if (c === q) q = 0; }
			else if (c === '"' || c === "'") q = c;
			else if (c === '>') return i;
			i++;
		}
		return -1;
	}

	/* tagStart : '<' 의 인덱스. { tag, openEnd, innerStart, innerEnd, tagEnd } 반환 */
	function scanElement(html, tagStart) {
		var m = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(tagStart, tagStart + 40));
		if (!m) return null;
		var tag = m[1].toLowerCase();
		var openEnd = endOfOpenTag(html, tagStart);
		if (openEnd < 0) return null;
		if (VOID[tag] || html.charAt(openEnd - 1) === '/') {
			return { tag: tag, openEnd: openEnd, innerStart: openEnd + 1, innerEnd: openEnd + 1, tagEnd: openEnd + 1, isVoid: true };
		}
		var depth = 1, i = openEnd + 1;
		var open = new RegExp('<' + tag + '(?=[\\s/>])', 'gi');
		var close = new RegExp('</' + tag + '\\s*>', 'gi');
		while (i < html.length && depth > 0) {
			open.lastIndex = i; close.lastIndex = i;
			var o = open.exec(html), c = close.exec(html);
			if (!c) return null;
			if (o && o.index < c.index) { depth++; i = o.index + 1; }
			else { depth--; i = c.index + c[0].length; if (depth === 0) return { tag: tag, openEnd: openEnd, innerStart: openEnd + 1, innerEnd: c.index, tagEnd: i, isVoid: false }; }
		}
		return null;
	}

	/* data-cms 계열 표식이 붙은 요소들의 '<' 위치를 모두 찾는다 */
	function findMarks(html, attrName, key) {
		var needle = attrName + '="' + key + '"';
		var out = [], from = 0, at, lt;
		while ((at = html.indexOf(needle, from)) > -1) {
			from = at + needle.length;
			lt = html.lastIndexOf('<', at);
			if (lt < 0) continue;
			/* 표식이 진짜 그 태그의 속성인지 확인 (사이에 '>' 가 없어야 한다) */
			if (html.slice(lt, at).indexOf('>') > -1) continue;
			out.push(lt);
		}
		return out;
	}

	/* ----------------------------------------------------
	 * 2. 읽기
	---------------------------------------------------- */
	function readInner(html, key) {
		var marks = findMarks(html, 'data-cms', key);
		if (!marks.length) return null;
		var el = scanElement(html, marks[0]);
		return el ? html.slice(el.innerStart, el.innerEnd) : null;
	}

	function readAttr(html, key, attr) {
		var marks = findMarks(html, 'data-cms-attr', key + ':' + attr);
		if (!marks.length) marks = findMarks(html, 'data-cms-img', key);
		if (!marks.length) return null;
		var openEnd = endOfOpenTag(html, marks[0]);
		var open = html.slice(marks[0], openEnd);
		var m = new RegExp('\\s' + attr + '="([^"]*)"').exec(open);
		return m ? m[1] : null;
	}

	/* ----------------------------------------------------
	 * 3. 쓰기
	---------------------------------------------------- */
	function writeInner(html, key, innerHtml) {
		var marks = findMarks(html, 'data-cms', key);
		if (!marks.length) return html;
		/* 뒤에서부터 바꿔야 앞쪽 인덱스가 밀리지 않는다 */
		for (var i = marks.length - 1; i >= 0; i--) {
			var el = scanElement(html, marks[i]);
			if (!el || el.isVoid) continue;
			html = html.slice(0, el.innerStart) + innerHtml + html.slice(el.innerEnd);
		}
		return html;
	}

	function writeAttr(html, key, attr, value) {
		var marks = findMarks(html, 'data-cms-attr', key + ':' + attr);
		if (!marks.length) marks = findMarks(html, 'data-cms-img', key);
		if (!marks.length) return html;
		for (var i = marks.length - 1; i >= 0; i--) {
			var openEnd = endOfOpenTag(html, marks[i]);
			var open = html.slice(marks[i], openEnd);
			var re = new RegExp('(\\s' + attr + '=")[^"]*(")');
			if (re.test(open)) open = open.replace(re, '$1' + value.replace(/\$/g, '$$$$') + '$2');
			else open = open + ' ' + attr + '="' + value + '"';
			html = html.slice(0, marks[i]) + open + html.slice(openEnd);
		}
		return html;
	}

	/* ----------------------------------------------------
	 * 4. 평문 <-> HTML  (운영자는 HTML 을 보지 않는다)
	 *    줄바꿈  = <br> 또는 <br class="pc-br">
	 *    **강조** = <b>강조</b>
	 *
	 * 주의 : 이 두 함수는 "원본을 그대로 되돌릴 수 있어야" 한다.
	 * 아무것도 고치지 않고 저장했을 때 파일이 한 글자도 변하면 안 되므로
	 *   - <br> 앞뒤 공백을 함부로 지우지 않는다
	 *   - &nbsp; 는 붙임표 문자로 바꿔 두었다가 저장할 때 되돌린다
	 *     (보통 공백으로 바꾸면 자간·줄바꿈 위치가 달라져 디자인이 틀어진다)
	---------------------------------------------------- */
	var BR_RE = /<br\s*(?:class="[^"]*")?\s*\/?>/gi;
	var NBSP = String.fromCharCode(160);

	function htmlToPlain(html) {
		if (html == null) return '';
		return String(html)
			.replace(BR_RE, '\n')
			.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
			.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
			.replace(/<[^>]+>/g, '')          /* 그 밖의 태그는 편집 대상이 아니므로 숨긴다 */
			.split('&nbsp;').join(NBSP)
			.split('&quot;').join('"')
			.split('&lt;').join('<')
			.split('&gt;').join('>')
			.split('&amp;').join('&');
	}

	function escapeText(s) {
		return String(s)
			.split('&').join('&amp;')
			.split('<').join('&lt;')
			.split('>').join('&gt;')
			.split(NBSP).join('&nbsp;');
	}

	/* brTag : 원본에서 쓰던 <br> 형태를 그대로 재사용한다 */
	function plainToHtml(plain, brTag) {
		var br = brTag || '<br>';
		var parts = String(plain).split(/\r?\n/).map(function (line) {
			return escapeText(line).replace(/\*\*([\s\S]+?)\*\*/g, '<b>$1</b>');
		});
		return parts.join(br);
	}

	/* 원본에서 쓰이던 br 태그 형태를 뽑아 둔다 (없으면 <br>) */
	function detectBr(html) {
		var m = String(html || '').match(BR_RE);
		return m ? m[0] : '<br>';
	}

	/* ----------------------------------------------------
	 * 5. 변경 묶음을 원본 HTML 에 한 번에 적용
	 *    edits = [{ type:'inner'|'attr', key, attr, value }]
	---------------------------------------------------- */
	function applyEdits(html, edits) {
		var out = html, i, e;
		for (i = 0; i < edits.length; i++) {
			e = edits[i];
			if (e.type === 'attr') out = writeAttr(out, e.key, e.attr, e.value);
			else out = writeInner(out, e.key, e.value);
		}
		return out;
	}

	w.CMSHtml = {
		readInner: readInner,
		readAttr: readAttr,
		writeInner: writeInner,
		writeAttr: writeAttr,
		htmlToPlain: htmlToPlain,
		plainToHtml: plainToHtml,
		detectBr: detectBr,
		escapeText: escapeText,
		applyEdits: applyEdits
	};
})(window);
