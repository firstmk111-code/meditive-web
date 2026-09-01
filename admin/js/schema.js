/* ========================================================
 * MEDITIVE Admin — 편집 항목 정의서
 *
 * home.html 안에 심어 둔 data-cms 표식 하나하나에
 * 운영자가 알아볼 수 있는 한글 이름과 입력 형태를 붙인다.
 * 표시 문구가 아니라 고유 Key 로만 연결하므로
 * 문구를 아무리 바꿔도 연결이 끊어지지 않는다.
 *
 * type
 *   line  : 한 줄 입력      (제목 · 라벨)
 *   text  : 여러 줄 입력    (Enter = 줄바꿈, **강조** = 굵게)
 *   url    : 링크 주소
 *   image : 이미지 교체
======================================================== */
(function (w) {
	'use strict';

	/* 편집 대상 페이지 (Phase 1 은 Home 만) */
	var PAGES = {
		home: { file: 'home.html', name: '홈', url: 'home.html' }
	};

	function f(key, label, type, hint) {
		return { key: key, label: label, type: type || 'line', hint: hint || '' };
	}

	/* 반복 항목을 간단히 찍어내는 도우미 */
	function items(n, make) {
		var out = [], i;
		for (i = 1; i <= n; i++) out.push(make(i, (i < 10 ? '0' : '') + i));
		return out;
	}

	var GROUPS = [
		/* ------------------------------------------------ 메인 비주얼 */
		{
			id: 'hero',
			name: '메인 비주얼',
			desc: '첫 화면의 큰 제목과 흐르는 이미지입니다.',
			fields: [
				f('home.hero.title', '큰 제목', 'line', '글자 단위 애니메이션이 걸려 있습니다. 영문 한 단어를 권장합니다.'),
				f('home.hero.tagline', '설명 문구', 'text'),
				f('home.hero.scroll', '스크롤 안내 문구', 'line')
			],
			images: items(15, function (i, nn) {
				return f('home.hero.img' + nn, '비주얼 이미지 ' + i, 'image');
			})
		},

		/* ------------------------------------------------ About Us */
		{
			id: 'about',
			name: 'About Us',
			desc: '회사 소개 영역입니다.',
			fields: [
				f('home.about.marquee', '흐르는 배경 글자', 'line', '좌우로 끊김 없이 흐르도록 같은 문구가 두 번 쓰입니다. 한 번만 입력하면 양쪽 모두 바뀝니다.'),
				f('home.about.eyebrow', '작은 제목', 'line'),
				f('home.about.title', '큰 제목', 'text'),
				f('home.about.item01.title', '지표 1 · 제목', 'line'),
				f('home.about.item01.desc', '지표 1 · 설명', 'text'),
				f('home.about.item02.title', '지표 2 · 제목', 'line'),
				f('home.about.item02.desc', '지표 2 · 설명', 'text'),
				f('home.about.item03.title', '지표 3 · 제목', 'line'),
				f('home.about.item03.desc', '지표 3 · 설명', 'text')
			],
			images: []
		},

		/* ------------------------------------------------ Service */
		{
			id: 'service',
			name: 'Service',
			desc: '서비스 소개 3칸 영역입니다.',
			fields: [
				f('home.service.eyebrow', '작은 제목', 'line'),
				f('home.service.title', '큰 제목', 'text'),
				f('home.service.card01.title', '카드 1 · 제목', 'line'),
				f('home.service.card01.desc', '카드 1 · 설명', 'text'),
				f('home.service.card02.title', '카드 2 · 제목', 'line'),
				f('home.service.card02.desc', '카드 2 · 설명', 'text'),
				f('home.service.card03.title', '카드 3 · 제목', 'line'),
				f('home.service.card03.desc', '카드 3 · 설명', 'text')
			],
			images: []
		},

		/* ------------------------------------------------ 상품몰 3개 영역 */
		{
			id: 'shop',
			name: '상품몰 영역',
			desc: '홈에 노출되는 상품몰 3개 영역의 제목과 더보기 링크입니다. 상품 목록 자체는 상품몰 데이터에서 불러옵니다.',
			fields: [
				f('home.shopBest.eyebrow', '베스트 상품 · 작은 제목', 'line'),
				f('home.shopBest.title', '베스트 상품 · 큰 제목', 'text'),
				f('home.shopBest.moreUrl', '베스트 상품 · 더보기 링크', 'url'),
				f('home.shopCat.eyebrow', '카테고리 · 작은 제목', 'line'),
				f('home.shopCat.title', '카테고리 · 큰 제목', 'text'),
				f('home.shopCat.moreUrl', '카테고리 · 더보기 링크', 'url'),
				f('home.shopPkg.eyebrow', '개원 준비 · 작은 제목', 'line'),
				f('home.shopPkg.title', '개원 준비 · 큰 제목', 'text'),
				f('home.shopPkg.moreUrl', '개원 준비 · 더보기 링크', 'url')
			],
			images: []
		},

		/* ------------------------------------------------ Portfolio */
		{
			id: 'portfolio',
			name: 'Portfolio',
			desc: '홈 포트폴리오 슬라이드 12개입니다.',
			fields: [
				f('home.portfolio.eyebrow', '작은 제목', 'line'),
				f('home.portfolio.title', '큰 제목', 'text')
			].concat(items(12, function (i, nn) {
				return f('home.portfolio.item' + nn + '.title', '슬라이드 ' + i + ' · 이름', 'line');
			})).concat(items(12, function (i, nn) {
				return f('home.portfolio.item' + nn + '.url', '슬라이드 ' + i + ' · 링크', 'url');
			})),
			images: items(12, function (i, nn) {
				return f('home.portfolio.item' + nn + '.img', '슬라이드 ' + i + ' · 이미지', 'image');
			})
		},

		/* ------------------------------------------------ Journal */
		{
			id: 'journal',
			name: 'Journal',
			desc: '홈에 노출되는 칼럼 목록 5개입니다.',
			fields: [
				f('home.journal.eyebrow', '작은 제목', 'line'),
				f('home.journal.title', '큰 제목', 'text')
			].concat((function () {
				var out = [];
				items(5, function (i, nn) {
					out.push(f('home.journal.item' + nn + '.title', '글 ' + i + ' · 제목', 'line'));
					out.push(f('home.journal.item' + nn + '.date', '글 ' + i + ' · 날짜', 'line'));
					out.push(f('home.journal.item' + nn + '.url', '글 ' + i + ' · 링크', 'url'));
					return 0;
				});
				return out;
			})()),
			images: []
		},

		/* ------------------------------------------------ FAQ */
		{
			id: 'faq',
			name: '자주 묻는 질문',
			desc: '홈 하단 FAQ 4개입니다.',
			fields: [
				f('home.faq.eyebrow', '작은 제목', 'line'),
				f('home.faq.title', '큰 제목', 'text')
			].concat((function () {
				var out = [];
				items(4, function (i, nn) {
					out.push(f('home.faq.item' + nn + '.q', '질문 ' + i, 'line'));
					out.push(f('home.faq.item' + nn + '.a', '답변 ' + i, 'text'));
					return 0;
				});
				return out;
			})()),
			images: []
		},

		/* ------------------------------------------------ Contact */
		{
			id: 'contact',
			name: 'Contact 배너',
			desc: '홈 맨 아래 문의 배너입니다.',
			fields: [
				f('home.contact.title', '제목', 'text'),
				f('home.contact.desc', '설명', 'text'),
				f('home.contact.url', '버튼 링크', 'url')
			],
			images: []
		}
	];

	/* Key 로 항목 정의를 즉시 찾을 수 있게 색인을 만들어 둔다 */
	var INDEX = {};
	(function () {
		var i, j, g, list;
		for (i = 0; i < GROUPS.length; i++) {
			g = GROUPS[i];
			list = g.fields.concat(g.images);
			for (j = 0; j < list.length; j++) {
				list[j].group = g.id;
				list[j].groupName = g.name;
				INDEX[list[j].key] = list[j];
			}
		}
	})();

	function get(key) { return INDEX[key] || null; }

	function label(key) {
		var d = get(key);
		return d ? d.groupName + ' · ' + d.label : key;
	}

	/* 이미지 항목 전체 */
	function allImages() {
		var out = [], i;
		for (i = 0; i < GROUPS.length; i++) out = out.concat(GROUPS[i].images);
		return out;
	}

	w.CMSSchema = {
		PAGES: PAGES,
		GROUPS: GROUPS,
		get: get,
		label: label,
		allImages: allImages
	};
})(window);
