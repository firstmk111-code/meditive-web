/**
 * 디지털 콘텐츠(카드뉴스) 그리드 + 상세 보기
 * - window.DC_PROJECTS (js/dc_projects.js) 를 공용 데이터로 쓴다.
 *   서비스 > 디지털 콘텐츠 / 포트폴리오 두 페이지가 같은 배열을 그대로 사용한다.
 * - [data-dc-grid] 안에 기존 포트폴리오 카드 마크업(.pf-item / .pf-thumb / .pf-meta)을 그대로 찍어
 *   카드 디자인·반응형은 손대지 않는다.
 * - 썸네일 클릭 시 그 프로젝트의 이미지들만 묶어 magnific-popup 갤러리로 띄운다.
 *   (좌우 버튼 / n / total 카운터 / 모바일 스와이프 / 비율 유지)
 */
$(function () {
	var list = window.DC_PROJECTS;
	var $grids = $('[data-dc-grid]');
	if (!$grids.length || !list || !list.length) return;

	// 페이지 깊이에 따른 자산 경로 기준값 (기존 페이지들이 선언해 두는 값을 재사용)
	var base = typeof window.SHOP_BASE === 'string' ? window.SHOP_BASE : '';

	// 한글 / 공백이 들어간 실제 파일명을 그대로 쓰기 때문에 인코딩이 필요하다.
	function assetUrl(path) {
		return encodeURI(base + path);
	}

	function projectImages(p) {
		return $.map(p.files, function (f) {
			return { src: assetUrl(p.dir + f) };
		});
	}

	// ── 카드 그리기 ─────────────────────────────────────────
	var html = '';
	$.each(list, function (i, p) {
		var count = p.files.length;
		html += '<li class="pf-item dc-item" data-scroll="fade-up" data-dc-index="' + i + '">' +
			'<div class="pf-thumb">' +
			'<img src="' + assetUrl(p.thumb) + '" alt="' + p.title + '" width="370" height="240" loading="lazy">' +
			(count > 1 ? '<span class="dc-count font-outfit"><i class="xi-image-o"></i>' + count + '</span>' : '') +
			'</div>' +
			'<div class="pf-meta">' +
			'<span class="pf-cat">' + p.cat + '</span>' +
			'<h3 class="pf-tit">' + p.title + '</h3>' +
			'</div>' +
			'</li>';
	});
	$grids.html(html);

	// 카드가 스크립트로 그려지므로, 공통 스크롤 등장 효과(common.js triggerScrollObject)를
	// 새로 만든 카드에만 동일한 방식으로 다시 걸어 준다.
	var $anim = $grids.find('[data-scroll]');
	if ($.fn.waypoint) {
		$anim.each(function () {
			var $el = $(this);
			var offset = $el.data('scroll-offset') ? $el.data('scroll-offset')
				: (typeof startOffset !== 'undefined' ? startOffset : '70%');
			$el.waypoint(function (direction) {
				if (direction === 'down') $el.addClass('animated');
			}, { triggerOnce: false, offset: offset });
		});
	} else {
		$anim.addClass('animated');
	}

	// ── 상세 보기 ───────────────────────────────────────────
	if (!$.fn.magnificPopup) return;

	var swipeX = null;
	var swipeY = null;

	$grids.on('click', '.pf-thumb', function () {
		var idx = parseInt($(this).closest('.dc-item').attr('data-dc-index'), 10);
		var project = list[idx];
		if (!project) return;

		$.magnificPopup.open({
			items: projectImages(project),
			type: 'image',
			mainClass: 'mfp-pf mfp-dc',
			removalDelay: 350,
			// 여러 장을 넘겨 보는 뷰어라 이미지 클릭/스와이프로 닫히지 않게 한다.
			// (배경 클릭 · 닫기 버튼 · ESC 로 닫으면 원래 목록 위치로 그대로 돌아온다)
			closeOnContentClick: false,
			image: { titleSrc: false },
			gallery: {
				enabled: true,
				preload: [1, 1],
				navigateByImgClick: false,
				tPrev: '이전 이미지',
				tNext: '다음 이미지',
				tCounter: '%curr% / %total%'
			},
			callbacks: {
				open: function () {
					var mp = this;
					// 모바일 스와이프로 좌우 이동
					mp.wrap.on('touchstart.dcSwipe', function (e) {
						var t = e.originalEvent.changedTouches[0];
						swipeX = t.clientX;
						swipeY = t.clientY;
					});
					mp.wrap.on('touchend.dcSwipe', function (e) {
						if (swipeX === null) return;
						var t = e.originalEvent.changedTouches[0];
						var dx = t.clientX - swipeX;
						var dy = t.clientY - swipeY;
						swipeX = null;
						swipeY = null;
						if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
						if (dx < 0) { mp.next(); } else { mp.prev(); }
					});
				},
				close: function () {
					if (this.wrap) this.wrap.off('.dcSwipe');
					swipeX = null;
					swipeY = null;
				}
			}
		}, 0);
	});
});
