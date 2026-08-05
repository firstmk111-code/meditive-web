/**
 * 포트폴리오 작업물 이미지 팝업
 * .pf-grid 안의 작업물을 하나의 갤러리로 묶어 magnific-popup 으로 띄운다.
 * 마크업 변경 없이 DOM 에서 목록을 만들어 쓰기 때문에 페이지별 추가 작업이 필요 없다.
 */
$(function () {
	var $grid = $('.pf-grid');
	if (!$grid.length || !$.fn.magnificPopup) return;

	var items = $grid.find('.pf-item').map(function () {
		return { src: $(this).find('.pf-thumb img').attr('src') };
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
