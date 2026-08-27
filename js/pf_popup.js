/**
 * 포트폴리오 작업물 이미지 팝업
 * .pf-grid 안의 작업물을 하나의 갤러리로 묶어 magnific-popup 으로 띄운다.
 * 마크업 변경 없이 DOM 에서 목록을 만들어 쓰기 때문에 페이지별 추가 작업이 필요 없다.
 */
$(function () {
	// 디지털 콘텐츠 그리드(.dc-grid)는 full/ 원본이 따로 없고 js/dc_gallery.js 가 따로 처리한다.
	var $grid = $('.pf-grid').not('.dc-grid');
	if (!$grid.length || !$.fn.magnificPopup) return;

	// 팝업은 썸네일이 아닌 full/ 아래 고화질 원본을 쓴다 (마크업 변경 없이 경로만 변환).
	// 고해상도 원본이 따로 없는 작업물(목업 이미지 등)은 썸네일에 data-full 을 직접 지정해
	// 같은 파일을 full/ 로 한 번 더 복사하지 않는다.
	var items = $grid.find('.pf-item').map(function () {
		var $img = $(this).find('.pf-thumb img');
		var full = $img.attr('data-full');
		if (!full) full = $img.attr('src').replace(/\/([^\/]+)$/, '/full/$1');
		return { src: full };
	}).get();

	if (!items.length) return;

	$grid.on('click', '.pf-thumb', function () {
		$.magnificPopup.open({
			items: items,
			type: 'image',
			mainClass: 'mfp-pf',
			removalDelay: 350,
			closeOnContentClick: true,
			image: { titleSrc: false },
			gallery: {
				enabled: true,
				preload: [1, 2],
				navigateByImgClick: false,
				tPrev: '이전 작업물',
				tNext: '다음 작업물',
				tCounter: '%curr% / %total%'
			}
		}, $(this).closest('.pf-item').index());
	});
});
