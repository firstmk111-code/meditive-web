/* ========================================================
 * MEDITIVE SHOP HOME  —  상품몰 쇼핑몰 홈
 *   상품몰에 들어온 순간 기업 홈페이지가 아니라 온라인 몰로 읽히게 하는 화면.
 *   상품 데이터는 js/shop.js 의 window.MTShop 을 그대로 재사용한다. (단일 출처)
 *   - #shopMall 안에 몰 전체를 그린다.
 *   - ?cat= 이 붙으면 카테고리 목록 뷰로 분기한다.
 * date : 2026-08-14
======================================================== */
(function (w, d) {
	'use strict';

	var S = w.MTShop;
	if (!S) return;

	var root = d.getElementById('shopMall');
	if (!root) return;

	var BASE = S.BASE;
	function img(f) { return BASE + 'images/portfolio/' + f; }
	function shopUrl(cat) { return BASE + 'kr/shop/list.html?cat=' + cat; }
	function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
	function P(id) { return S.byId(id); }

	/* 상품 → 카드 가격 표기 */
	function priceHTML(p) {
		if (S.isQuote(p)) return '<span class="sh-card-price is-quote">견적 문의</span>';
		return '<span class="sh-card-price">' + S.won(S.minPrice(p)) + '<span class="u">원~</span></span>';
	}

	/* ====================================================
	 * 1. 콘텐츠 정의
	==================================================== */

	/* 히어로 배너 — 좌측 다크 민트 그라데이션 + 텍스트 / 우측 작업물 이미지 */
	var HERO = [
		{ label: '대표 작업물', tit: '한 장으로 전하는<br><b>병원 3단 리플렛</b>', desc: '진료 안내부터 오시는 길까지 한 흐름으로 담은 리플렛', cta: '홍보물 보러 가기', href: shopUrl('promo'), pic: 'niz01.jpg' },
		{ label: '명함 · 봉투', tit: '병원의 첫인상을 바꾸는<br><b>원장 명함</b>', desc: '박 · 형압 후가공까지 4~6영업일 제작', cta: '명함 보러 가기', href: shopUrl('card'), pic: 'niz02.jpg' },
		{ label: '개원 패키지', tit: '로고부터 사인물까지<br><b>하나의 브랜드 톤</b>', desc: '개원에 필요한 인쇄물을 한 번에 묶어 드립니다', cta: '패키지 보러 가기', href: shopUrl('package'), pic: 'niz05.jpg' },
		{ label: '재주문', tit: '매일 쓰는 봉투 · 서식<br><b>1클릭 재주문</b>', desc: '이전 주문 조건 그대로 담고 바로 결제까지', cta: '재주문 상품 보기', href: shopUrl('reorder'), pic: 'niz04.jpg' },
		{ label: '무료 템플릿', tit: '병원 템플릿을 상품에<br><b>미리 입혀보세요</b>', desc: '진료과에 맞는 디자인을 목업 위에서 바로 비교', cta: '템플릿 미리보기', href: '#tplPreview', pic: 'niz03.jpg' }
	];

	/* 상품 둘러보기 타일 — 상품 상세로 바로 보낸다 (대표 작업물을 앞쪽에 둔다) */
	var TILES = ['pm02', 'cd01', 'cd02', 'cd03', 'pk04', 'pr01', 'pr02', 'pr03', 'pr04', 'fm01',
		'fm02', 'fm03', 'cd05', 'pm01', 'pm03', 'pm04', 'pm05', 'pm06', 'pm07', 'pr05'];

	/* PICK — 해시태그로 골라 보는 큐레이션 */
	var PICK = {
		tit: '개원 준비, 이 구성이면 충분해요',
		more: shopUrl('package'),
		tags: [
			{ lb: '#개원 패키지',    ids: ['pk04', 'pm02', 'cd01', 'pk01', 'pk02', 'pk03', 'pr01', 'fm01'] },
			{ lb: '#진료 · 예약카드', ids: ['pr01', 'pr02', 'fm07', 'cd01', 'cd02', 'pr04', 'pr03', 'fm03'] },
			{ lb: '#문진표 · 서식',  ids: ['fm01', 'fm02', 'fm03', 'fm04', 'fm05', 'fm06', 'fm07', 'pr04'] },
			{ lb: '#명함 · 봉투',    ids: ['cd01', 'cd02', 'cd03', 'cd04', 'cd05', 'cd06', 'pr03', 'pr01'] },
			{ lb: '#병원 안내물',    ids: ['pr05', 'pr06', 'pr07', 'pr08', 'pm04', 'pm05', 'pm06', 'pm07'] }
		]
	};

	/* 베스트 상품 — 카테고리 탭
	 * 대표 작업물(리플렛)이 맨 처음 보이도록 홍보물 탭을 앞에 둔다.
	 * first : 해당 탭에서 맨 앞으로 끌어올릴 대표 작업물 상품 id */
	var BEST = {
		tit: '베스트 상품',
		tabs: [
			{ cat: 'promo',   lb: '홍보물',      first: 'pm02' },
			{ cat: 'print',   lb: '병원 인쇄물' },
			{ cat: 'form',    lb: '서식류' },
			{ cat: 'card',    lb: '명함 · 봉투',  first: 'cd01' },
			{ cat: 'package', lb: '개원 패키지',  first: 'pk04' }
		]
	};

	/* ---- 템플릿 미리보기 ----
	 * 탭(상품군) → 칩(실제 상품) → 템플릿을 골라 목업에 입힌다.
	 * 템플릿 이미지는 MEDITIVE 실제 작업물(images/portfolio)을 그대로 쓴다. */
	var TPL_NAME = ['미니멀 화이트', '소프트 민트', '클래식 네이비', '웜 베이지', '모던 그레이', '내추럴 우드', '클린 블루', '딥 그린'];
	var POOL = {
		card:     ['p05.jpg', 'p44.jpg', 'p17.jpg', 'p43.jpg', 'p45.jpg', 'p46.jpg', 'p37.jpg', 'p39.jpg'],
		env:      ['p21.jpg', 'p31.jpg', 'p33.jpg', 'p34.jpg', 'p35.jpg', 'p29.jpg'],
		holder:   ['p24.jpg', 'p19.jpg', 'p15.jpg', 'p02.jpg', 'p47.jpg'],
		form:     ['p12.jpg', 'p20.jpg', 'p22.jpg', 'p23.jpg', 'p25.jpg', 'p13.jpg'],
		leaflet:  ['p04.jpg', 'p07.jpg', 'p08.jpg', 'p10.jpg', 'p18.jpg', 'p36.jpg'],
		brochure: ['p01.jpg', 'p11.jpg', 'p03.jpg', 'p06.jpg', 'p42.jpg'],
		poster:   ['p09.jpg', 'p16.jpg', 'p26.jpg', 'p28.jpg', 'p41.jpg', 'p32.jpg'],
		sign:     ['p27.jpg', 'p30.jpg', 'p32.jpg', 'p38.jpg'],
		pack:     ['p02.jpg', 'p03.jpg', 'p06.jpg', 'p11.jpg', 'p47.jpg'],
		best:     ['p05.jpg', 'p01.jpg', 'p04.jpg', 'p12.jpg', 'p37.jpg', 'p02.jpg']
	};
	/* 상품별 목업 형태 · 템플릿 풀 */
	var MOCK = {
		pr01: ['card', 'card'],     pr02: ['card', 'card'],     fm07: ['card', 'card'],
		cd01: ['card', 'card'],     cd02: ['card', 'card'],
		pr03: ['env', 'env'],       cd03: ['env', 'env'],       cd04: ['env', 'env'],
		cd05: ['env', 'env'],       cd06: ['env', 'env'],
		pr04: ['holder', 'holder'],
		fm01: ['a4', 'form'],       fm02: ['a4', 'form'],       fm03: ['a4', 'form'],
		fm04: ['a4', 'form'],       fm05: ['a4', 'form'],       fm06: ['a4', 'form'],
		pm02: ['fold3', 'leaflet'], pm03: ['fold2', 'leaflet'], pr08: ['fold3', 'leaflet'],
		pm01: ['a4', 'brochure'],
		pm04: ['poster', 'poster'], pm05: ['poster', 'poster'], pm06: ['poster', 'poster'],
		pm07: ['poster', 'poster'], pm08: ['poster', 'poster'],
		pr05: ['poster', 'sign'],   pr06: ['poster', 'sign'],   pr07: ['poster', 'sign'],
		pk01: ['a4', 'pack'],       pk02: ['a4', 'pack'],       pk03: ['a4', 'pack'],  pk04: ['a4', 'pack']
	};
	var TABS = [
		{ id: 't1',  lb: '진료 · 예약카드', ico: 'xi-credit-card', ids: ['pr01', 'pr02', 'fm07'], all: shopUrl('print') },
		{ id: 't2',  lb: '봉투',          ico: 'xi-mail-o',      ids: ['pr03', 'cd03', 'cd04', 'cd05', 'cd06'], all: shopUrl('card') },
		{ id: 't3',  lb: '차트홀더',       ico: 'xi-folder-o',    ids: ['pr04'], all: shopUrl('print') },
		{ id: 't4',  lb: '문진표 · 서식',  ico: 'xi-document',    ids: ['fm01', 'fm02', 'fm03', 'fm04', 'fm05', 'fm06'], all: shopUrl('form') },
		{ id: 't5',  lb: '명함',          ico: 'xi-note-o',      ids: ['cd01', 'cd02'], all: shopUrl('card') },
		{ id: 't6',  lb: '리플렛',        ico: 'xi-paper',       ids: ['pm02', 'pm03', 'pr08'], all: shopUrl('promo') },
		{ id: 't7',  lb: '브로슈어',       ico: 'xi-book-o',      ids: ['pm01'], all: shopUrl('promo') },
		{ id: 't8',  lb: '포스터 · 배너',  ico: 'xi-image-o',     ids: ['pm04', 'pm05', 'pm06', 'pm07', 'pm08'], all: shopUrl('promo') },
		{ id: 't9',  lb: '병원 안내물',    ico: 'xi-maker',       ids: ['pr05', 'pr06', 'pr07'], all: shopUrl('print') },
		{ id: 't10', lb: '베스트',        ico: 'xi-star-o',      ids: ['pr01', 'pm01', 'pm02', 'fm01', 'cd01', 'pk01'], all: shopUrl('all') },
		{ id: 't11', lb: '개원 패키지',    ico: 'xi-gift-o',      ids: ['pk01', 'pk02', 'pk03', 'pk04'], all: shopUrl('package') }
	];

	/* 스탯 */
	var STATS = [
		'<b>240</b>종의 병원 템플릿을 🎨',
		'<b>33</b>종의 인쇄 상품을 🖨️',
		'<b>45</b>건의 실제 병원 작업물을 📷',
		'<b>6</b>개 진료과 전용 구성을 ✨'
	];

	/* 후기 */
	var REVIEWS = [
		{ tag: '치과', txt: '진료카드 톤이 병원 인테리어랑 딱 맞아서 좋았어요. 재주문도 이전 조건 그대로 담기니까 정말 편합니다.', by: '이하*12번 주문', pid: 'pr01' },
		{ tag: '피부과', txt: '시술 후 주의사항 카드를 새로 만들었는데 환자분들이 훨씬 잘 읽으세요. 문의 전화가 확실히 줄었습니다.', by: '정민*4번 주문', pid: 'fm07' },
		{ tag: '내과', txt: '문진표 글자 크기랑 여백을 조정해 주셔서 어르신들이 작성하기 편해졌어요. 접수 시간이 짧아졌습니다.', by: '박성*8번 주문', pid: 'fm01' },
		{ tag: '한의원', txt: '약봉투 인쇄가 생각보다 훨씬 깔끔하게 나왔습니다. 다음엔 수량 늘려서 주문하려구요.', by: '김도*6번 주문', pid: 'cd05' },
		{ tag: '정형외과', txt: '3단 리플렛 시안을 세 번 수정했는데 매번 빠르게 반영해 주셨어요. 결과물도 만족합니다.', by: '최우*3번 주문', pid: 'pm02' },
		{ tag: '성형외과', txt: '원장 명함에 박 후가공 넣었는데 실물이 훨씬 고급스럽네요. 상담실장 명함도 같은 톤으로 맞췄습니다.', by: '한지*9번 주문', pid: 'cd01' },
		{ tag: '치과', txt: '개원 패키지로 한 번에 준비하니 따로 발주할 일이 없어서 좋았어요. 일정도 딱 맞춰 주셨습니다.', by: '오세*2번 주문', pid: 'pk01' },
		{ tag: '내과', txt: '처방전 봉투 크라프트지로 바꿨더니 분위기가 확 달라졌어요. 환자분들 반응도 좋습니다.', by: '유나*15번 주문', pid: 'pr03' },
		{ tag: '피부과', txt: '이벤트 전단지 급하게 요청드렸는데 일정 안에 받았습니다. 색감도 화면이랑 거의 같아요.', by: '신예*5번 주문', pid: 'pm07' },
		{ tag: '한의원', txt: '복약 안내문에 그림을 넣어 주셔서 설명하기 편합니다. 진료 시간이 줄었어요.', by: '강태*7번 주문', pid: 'fm06' },
		{ tag: '정형외과', txt: '진료실 도어 사인 6개 세트로 맞췄는데 통일감이 생기니 병원이 정리된 느낌입니다.', by: '문재*3번 주문', pid: 'pr06' },
		{ tag: '치과', txt: '차트홀더 포켓 형태가 생각보다 훨씬 튼튼합니다. 서류 전달할 때 인상이 좋아요.', by: '배수*4번 주문', pid: 'pr04' },
		{ tag: '성형외과', txt: '병원 소개 브로슈어 16p로 제작했는데 상담 자료로 계속 쓰고 있습니다. 사진 보정도 만족스러워요.', by: '노현*2번 주문', pid: 'pm01' },
		{ tag: '내과', txt: '수납 영수증 양식을 NCR 2겹지로 바꿨더니 업무가 한결 편해졌습니다.', by: '임경*11번 주문', pid: 'fm05' },
		{ tag: '피부과', txt: '실내 X배너 두 개 세웠는데 대기실 분위기가 정돈됐어요. 거치대 품질도 좋습니다.', by: '서아*6번 주문', pid: 'pm05' },
		{ tag: '한의원', txt: '소봉투 1도 인쇄로 저렴하게 했는데 결과물이 기대 이상입니다. 재주문했어요.', by: '고은*13번 주문', pid: 'cd03' },
		{ tag: '치과', txt: '예약카드에 손글씨 적는 칸 위치를 조정해 주셔서 쓰기 편합니다. 세심하게 봐주셔서 감사해요.', by: '주하*5번 주문', pid: 'pr02' },
		{ tag: '정형외과', txt: '데스크 사인 우드 조합으로 했는데 사진보다 실물이 더 좋습니다. 문의 응대도 빨랐어요.', by: '황민*2번 주문', pid: 'pr05' }
	];

	/* ====================================================
	 * 2. 공통 조각
	==================================================== */
	function secHead(tit, emo, moreHref, withNav) {
		return '<div class="sh-sec-head">' +
			'<h2 class="sh-sec-tit">' + tit + (emo ? '<span class="emo">' + emo + '</span>' : '') + '</h2>' +
			'<div class="sh-sec-side">' +
			(moreHref ? '<a href="' + moreHref + '" class="sh-more">전체보기</a>' : '') +
			(withNav ? '<div class="sh-navs"><button type="button" class="sh-nav-btn js-prev" title="이전"><i class="xi-angle-left-min"></i></button><button type="button" class="sh-nav-btn js-next" title="다음"><i class="xi-angle-right-min"></i></button></div>' : '') +
			'</div></div>';
	}

	function cardHTML(p, cta) {
		if (!p) return '';
		var badge = p.badge ? '<span class="sh-card-badge' + (p.badge === 'BEST' ? ' mint' : '') + '">' + p.badge + '</span>' : '';
		var add = S.isQuote(p) ? '' :
			'<button type="button" class="sh-card-add js-add" data-id="' + p.id + '" title="장바구니에 담기"><i class="xi-cart-o"></i></button>';
		return '<li class="sh-card" data-id="' + p.id + '">' +
			'<a href="' + S.detailUrl(p) + '" class="sh-card-thumb">' + badge +
				'<img src="' + S.imgPath(p) + '" alt="' + esc(p.name) + '" loading="lazy">' +
			'</a>' + add +
			'<a href="' + S.detailUrl(p) + '" class="sh-card-name">' + esc(p.name) + '</a>' +
			priceHTML(p) +
			(cta ? '<a href="' + S.detailUrl(p) + '" class="sh-card-cta">' + cta + '</a>' : '') +
		'</li>';
	}

	/* ====================================================
	 * 3. 섹션 마크업 만들기
	==================================================== */
	function catbarHTML(curCat) {
		var li = '', i, c;
		for (i = 1; i < S.CATS.length; i++) {          /* 0번은 '전체 상품' → 홈이 대신한다 */
			c = S.CATS[i];
			li += '<li class="' + (c.id === curCat ? 'on' : '') + (c.id === 'package' ? ' hot' : '') + '">' +
				'<a href="' + shopUrl(c.id) + '">' + c.name + '</a></li>';
		}
		/* 전체보기 패널 : 카테고리별 실제 상품을 펼친다 */
		var panel = '', j, k, list;
		for (i = 1; i < S.CATS.length; i++) {
			c = S.CATS[i];
			list = S.filterList(c.id, 'all');
			panel += '<dl><dt><a href="' + shopUrl(c.id) + '">' + c.name + '</a></dt>';
			for (j = 0, k = Math.min(list.length, 8); j < k; j++) {
				panel += '<dd><a href="' + S.detailUrl(list[j]) + '">' + esc(list[j].name) + '</a></dd>';
			}
			panel += '</dl>';
		}
		return '<div class="sh-catbar"><div class="sh-catbar-inner area">' +
			'<button type="button" class="sh-all-btn js-allbtn" aria-expanded="false">' +
				'<span class="bars"><span></span><span></span><span></span></span>상품 제작 전체보기</button>' +
			'<ul class="sh-catlist">' + li + '</ul>' +
		'</div>' +
		'<div class="sh-allpanel js-allpanel"><div class="sh-allpanel-inner area">' + panel + '</div></div>' +
		'</div>';
	}

	function heroHTML() {
		var s = '', i, h;
		for (i = 0; i < HERO.length; i++) {
			h = HERO[i];
			s += '<div class="sh-hero-slide' + (i === 0 ? ' on' : '') + '">' +
				'<a href="' + h.href + '" class="sh-hero-link">' +
					'<span class="sh-hero-txt">' +
						'<span class="sh-hero-label">' + h.label + '</span>' +
						'<strong class="sh-hero-tit">' + h.tit + '</strong>' +
						'<span class="sh-hero-desc">' + h.desc + '</span>' +
						'<span class="sh-hero-cta">' + h.cta + '<i class="xi-angle-right-min"></i></span>' +
					'</span>' +
					'<span class="sh-hero-pic"><img src="' + img(h.pic) + '" alt="" ' +
						(i === 0 ? '' : 'loading="lazy" ') + 'width="740" height="480"></span>' +
				'</a></div>';
		}
		return '<section class="sh-hero"><div class="sh-hero-view">' +
			'<div class="sh-hero-track js-hero-track">' + s + '</div>' +
			'<button type="button" class="sh-hero-nav js-prev" title="이전 배너"><i class="xi-angle-left-min"></i></button>' +
			'<button type="button" class="sh-hero-nav js-next" title="다음 배너"><i class="xi-angle-right-min"></i></button>' +
			'<span class="sh-hero-page"><b class="js-hero-cur">1</b> / ' + HERO.length + '</span>' +
		'</div></section>';
	}

	function tilesHTML() {
		var s = '', i, p;
		for (i = 0; i < TILES.length; i++) {
			p = P(TILES[i]); if (!p) continue;
			s += '<li><a href="' + S.detailUrl(p) + '">' +
				'<span class="sh-tile-thumb"><img src="' + S.imgPath(p) + '" alt="" loading="lazy"></span>' +
				'<span class="sh-tile-name">' + esc(p.name) + '</span></a></li>';
		}
		return '<section class="sh-sec"><div class="sh-tiles area">' +
			secHead('상품 둘러보기', '', '', true) +
			'<div class="sh-tile-view"><ul class="sh-tile-grid js-track">' + s + '</ul></div>' +
		'</div></section>';
	}

	/* 좌우 이동 버튼 한 벌 */
	function navsHTML() {
		return '<div class="sh-navs">' +
			'<button type="button" class="sh-nav-btn js-prev" title="이전"><i class="xi-angle-left-min"></i></button>' +
			'<button type="button" class="sh-nav-btn js-next" title="다음"><i class="xi-angle-right-min"></i></button></div>';
	}

	/* PICK — 해시태그 칩으로 상품 묶음을 바꿔 본다 */
	function pickItemHTML(p) {
		if (!p) return '';
		var add = S.isQuote(p) ? '' :
			'<button type="button" class="sh-card-add js-add" data-id="' + p.id + '" title="장바구니에 담기"><i class="xi-cart-o"></i></button>';
		return '<li class="mp-item">' +
			'<div class="mp-thumb-wrap">' +
				'<a href="' + S.detailUrl(p) + '" class="mp-thumb">' +
					'<span class="mp-img"><img src="' + S.imgPath(p) + '" alt="' + esc(p.name) + '" loading="lazy"></span>' +
					'<span class="mp-dim"></span>' +
				'</a>' + add +
			'</div>' +
			'<div class="mp-body">' +
				'<a href="' + S.detailUrl(p) + '" class="mp-name">' + esc(p.name) + '</a>' +
				priceHTML(p) +
			'</div>' +
		'</li>';
	}

	function pickHTML() {
		var tg = '', i;
		for (i = 0; i < PICK.tags.length; i++) {
			tg += '<button type="button" class="mp-tag js-mptag' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + PICK.tags[i].lb + '</button>';
		}
		return '<section class="mp-sec"><div class="mp-inner area">' +
			'<h2 class="mp-tit">' + PICK.tit + '</h2>' +
			'<div class="mp-tags js-mptags">' + tg + '</div>' +
			'<div class="mp-view"><ul class="mp-list js-mplist"></ul></div>' +
			'<div class="mp-ctrl"><span class="mp-bar"><i class="js-bar"></i></span>' + navsHTML() + '</div>' +
		'</div></section>';
	}

	/* 베스트 상품 — 카테고리 탭 */
	function bestItemHTML(p) {
		if (!p) return '';
		var add = S.isQuote(p) ? '' :
			'<button type="button" class="sh-card-add js-add" data-id="' + p.id + '" title="장바구니에 담기"><i class="xi-cart-o"></i></button>';
		return '<li class="bs-item"><div class="bs-box">' +
			'<div class="bs-thumb-wrap">' +
				'<a href="' + S.detailUrl(p) + '" class="bs-img"><img src="' + S.imgPath(p) + '" alt="' + esc(p.name) + '" loading="lazy"></a>' + add +
			'</div>' +
			'<div class="bs-body">' +
				'<a href="' + S.detailUrl(p) + '" class="bs-name">' + esc(p.name) + '</a>' +
				priceHTML(p) +
			'</div>' +
		'</div></li>';
	}

	function bestHTML() {
		var tb = '', i;
		for (i = 0; i < BEST.tabs.length; i++) {
			tb += '<li class="' + (i === 0 ? 'on' : '') + '">' +
				'<button type="button" class="bs-tab js-bstab" data-i="' + i + '">' + BEST.tabs[i].lb + '</button></li>';
		}
		return '<section class="bs-sec"><span class="bs-bg"></span><div class="bs-inner area">' +
			'<div class="bs-hd">' +
				'<h2 class="bs-tit">' + BEST.tit + '</h2>' +
				'<ul class="bs-tabs js-bstabs">' + tb + '</ul>' +
				'<a href="' + shopUrl('print') + '" class="bs-more js-bsmore">전체보기</a>' +
			'</div>' +
			'<div class="bs-view"><ul class="bs-list js-bslist"></ul>' +
				'<div class="bs-navs">' +
					'<button type="button" class="sh-nav-btn js-prev" title="이전"><i class="xi-angle-left-min"></i></button>' +
					'<button type="button" class="sh-nav-btn js-next" title="다음"><i class="xi-angle-right-min"></i></button>' +
				'</div>' +
			'</div>' +
			'<span class="bs-bar"><i class="js-bar"></i></span>' +
		'</div></section>';
	}

	function tplHTML() {
		var tabs = '', i, t;
		for (i = 0; i < TABS.length; i++) {
			t = TABS[i];
			tabs += '<li class="' + (i === 0 ? 'on' : '') + '">' +
				'<button type="button" class="tp-tab js-tab" data-i="' + i + '">' +
					'<span class="ico"><i class="' + t.ico + '"></i></span><span class="lb">' + t.lb + '</span>' +
				'</button></li>';
		}
		return '<section class="tp-sec" id="tplPreview"><div class="tp-inner area">' +
			'<h2 class="sh-sec-tit">무료 템플릿을 상품에 미리 입혀보세요!' +
				'<span class="sh-sec-desc">진료과에 맞는 디자인을 고르면 실제 제작 규격의 목업 위에 바로 적용됩니다.</span></h2>' +
			'<div class="tp-panel">' +
				'<ul class="tp-tabs js-tabs">' + tabs + '</ul>' +
				'<div class="tp-chips js-chips"></div>' +
				'<div class="tp-body">' +
					'<div class="tp-stage js-stage">' +
						'<span class="tp-stage-bg js-stagebg"></span>' +
						'<span class="tp-hint">다양한 모드로 상품을 경험해보세요!</span>' +
						'<div class="tp-mock js-mock"></div>' +
						'<span class="tp-count js-count">1 / 1</span>' +
						'<button type="button" class="tp-3d js-3d"><i class="xi-rotate-right"></i>3D로 보기</button>' +
					'</div>' +
					'<div class="tp-info">' +
						'<div class="tp-info-top">' +
							'<div>' +
								'<strong class="tp-name js-name"></strong>' +
								'<p class="tp-desc js-desc"></p>' +
								'<p class="tp-price js-price"></p>' +
							'</div>' +
							'<a href="#" class="tp-cta js-cta">이 상품 만들러 가기<i class="xi-angle-right-min"></i></a>' +
						'</div>' +
						'<div class="tp-tpl-head">' +
							'<span class="tp-tpl-tit">템플릿을 눌러 구경해보세요 👀</span>' +
							'<a href="' + BASE + 'kr/portfolio/all.html" class="tp-tpl-more">템플릿 전체보기</a>' +
						'</div>' +
						'<div class="tp-tpl-list js-tpls"></div>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div></section>';
	}

	function statHTML() {
		var s = '', i;
		for (i = 0; i < STATS.length; i++) s += '<li class="' + (i === 0 ? 'on' : '') + '">' + STATS[i] + '</li>';
		return '<section class="sh-stat"><div class="area">' +
			'<p class="sh-stat-sub">오직 MEDITIVE 상품몰에서만</p>' +
			'<ul class="sh-stat-list js-stat">' + s + '</ul>' +
			'<p class="sh-stat-end">병원에 맞춰 바로 주문할 수 있어요</p>' +
		'</div></section>';
	}

	function reviewHTML() {
		var rows = ['', '', ''], i, r, p, html;
		for (i = 0; i < REVIEWS.length; i++) {
			r = REVIEWS[i]; p = P(r.pid);
			html = '<div class="sh-rv-card">' +
				'<span class="sh-rv-tag">' + r.tag + '</span>' +
				'<p class="sh-rv-txt">' + esc(r.txt) + '</p>' +
				'<span class="sh-rv-by">' + esc(r.by) + '</span>' +
				(p ? '<a href="' + S.detailUrl(p) + '" class="sh-rv-pd">' +
					'<span class="th"><img src="' + S.imgPath(p) + '" alt="" loading="lazy"></span>' +
					'<span class="in"><span class="lb">관련 상품</span><span class="nm">' + esc(p.name) + '</span></span>' +
				'</a>' : '') +
			'</div>';
			rows[i % 3] += html;
		}
		var s = '';
		for (i = 0; i < 3; i++) s += '<div class="sh-rv-row"><div class="sh-rv-track">' + rows[i] + rows[i] + '</div></div>';
		return '<section class="sh-review">' +
			secHead('무료 템플릿으로 만든 병원들의 진짜 후기 👀', '', '', false) + s +
		'</section>';
	}

	function endHTML() {
		return '<section class="sh-end"><div class="area">' +
			'<h2 class="sh-end-tit">규격이 정해진 인쇄물은 바로 주문,<br>병원에 맞춘 설계는 맞춤 제작으로.</h2>' +
			'<p class="sh-end-txt">어떤 구성이 필요한지 모르겠다면 진료과와 개원 일정만 알려주세요.<br>필요한 인쇄물을 정리해 견적으로 보내드립니다.</p>' +
			'<div class="sh-end-btns">' +
				'<a href="' + shopUrl('package') + '" class="mint">개원 패키지 보기<i class="xi-angle-right-min"></i></a>' +
				'<a href="' + BASE + 'kr/contact/inquiry.html" class="line">맞춤 제작 문의하기<i class="xi-angle-right-min"></i></a>' +
			'</div>' +
		'</div></section>';
	}

	/* ====================================================
	 * 4. 카테고리 목록 뷰
	==================================================== */
	var CATE_HEAD = {
		print:   { tit: '진료 공간에서 매일 쓰이는 병원 인쇄물', desc: '진료카드부터 사인물까지, 환자와 만나는 접점을 하나의 톤으로 정리합니다.' },
		promo:   { tit: '병원을 처음 알리는 홍보물', desc: '브로슈어 · 리플렛 · 포스터 · 배너까지 병원의 인상을 만드는 홍보 인쇄물입니다.' },
		form:    { tit: '진료 흐름을 정돈하는 병원 서식류', desc: '문진표 · 동의서 · 기록지까지, 읽기 쉬운 구조로 다시 설계했습니다.' },
		card:    { tit: '병원의 첫인상을 만드는 명함과 봉투', desc: '원장 명함부터 약봉투까지 브랜드 톤을 그대로 이어갑니다.' },
		package: { tit: '개원에 필요한 모든 것을 한 번에', desc: '낱개로 주문할 필요 없이, 개원 · 리뉴얼에 필요한 구성을 묶어 제안합니다.' },
		reorder: { tit: '자주 쓰는 상품은 같은 조건으로 다시', desc: '이전 주문 조건 그대로 한 번에 담을 수 있습니다.' }
	};

	function cateHTML(cat, dept, q) {
		var h = CATE_HEAD[cat] || CATE_HEAD.print;
		var c = null, i;
		for (i = 0; i < S.CATS.length; i++) if (S.CATS[i].id === cat) c = S.CATS[i];
		var list = S.searchList(q, S.filterList(cat, dept));

		var dp = '';
		for (i = 0; i < S.DEPTS.length; i++) {
			var u = 'list.html?cat=' + cat + (S.DEPTS[i].id !== 'all' ? '&dept=' + S.DEPTS[i].id : '') + (q ? '&q=' + encodeURIComponent(q) : '');
			dp += '<a href="' + u + '" class="' + (S.DEPTS[i].id === dept ? 'on' : '') + '">' + S.DEPTS[i].name + '</a>';
		}

		var cards = '';
		if (!list.length) cards = '<li class="sh-empty"><i class="xi-search"></i><p>선택하신 조건에 맞는 상품이 없습니다.</p></li>';
		else for (i = 0; i < list.length; i++) cards += cardHTML(list[i]);

		var searched = q ? '<div class="sh-searched"><span>‘<b>' + esc(q) + '</b>’ 검색 결과 ' + list.length + '건</span>' +
			'<a href="list.html?cat=' + cat + (dept !== 'all' ? '&dept=' + dept : '') + '"><i class="xi-close-circle"></i>검색 초기화</a></div>' : '';

		return '<section class="sh-cate">' +
			'<div class="sh-cate-head"><div>' +
				'<span class="sh-cate-en">' + (c ? c.en : '') + '</span>' +
				'<h2 class="sh-cate-tit">' + h.tit + '</h2>' +
				'<p class="sh-cate-desc">' + h.desc + '</p>' +
			'</div><p class="sh-cate-cnt">Total <b>' + list.length + '</b> items</p></div>' +
			'<div class="sh-cate-tools">' +
				'<div class="sh-dept">' + dp + '</div>' +
				'<div class="sh-search"><label for="shQ" class="blind">상품 검색</label>' +
					'<input type="text" id="shQ" value="' + esc(q) + '" placeholder="상품명 · 진료과 검색" autocomplete="off">' +
					'<button type="button" class="js-q" title="검색"><i class="xi-search"></i></button></div>' +
			'</div>' + searched +
			'<ul class="sh-card-grid">' + cards + '</ul>' +
		'</section>';
	}

	/* ====================================================
	 * 5. 인터랙션
	==================================================== */

	/* 5-1. 전체보기 패널 */
	function initAllPanel() {
		var btn = root.querySelector('.js-allbtn');
		var panel = root.querySelector('.js-allpanel');
		if (!btn || !panel) return;
		function close() { btn.className = 'sh-all-btn js-allbtn'; panel.className = 'sh-allpanel js-allpanel'; btn.setAttribute('aria-expanded', 'false'); }
		btn.addEventListener('click', function (e) {
			e.stopPropagation();
			var on = panel.className.indexOf('on') > -1;
			if (on) { close(); return; }
			btn.className = 'sh-all-btn js-allbtn on';
			panel.className = 'sh-allpanel js-allpanel on';
			btn.setAttribute('aria-expanded', 'true');
		});
		d.addEventListener('click', function (e) { if (!panel.contains(e.target)) close(); });
		d.addEventListener('keydown', function (e) { if (e.keyCode === 27) close(); });
	}

	/* 5-2. 히어로 캐러셀 — 가운데 슬라이드를 보여주고 양옆을 살짝 노출한다 */
	function initHero() {
		var sec = root.querySelector('.sh-hero'); if (!sec) return;
		var track = sec.querySelector('.js-hero-track');
		var slides = track.children;
		var cur = sec.querySelector('.js-hero-cur');
		var n = slides.length, idx = 0, timer = null;

		function layout() {
			if (!n) return;
			var view = sec.querySelector('.sh-hero-view');
			var sw = slides[0].offsetWidth;
			var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 0;
			var off = (view.clientWidth - sw) / 2 - idx * (sw + gap);
			track.style.transform = 'translateX(' + off + 'px)';
			for (var i = 0; i < n; i++) slides[i].className = 'sh-hero-slide' + (i === idx ? ' on' : '');
			if (cur) cur.textContent = (idx + 1);
		}
		function go(i) { idx = (i + n) % n; layout(); }
		sec.querySelector('.js-prev').addEventListener('click', function () { go(idx - 1); rest(); });
		sec.querySelector('.js-next').addEventListener('click', function () { go(idx + 1); rest(); });
		function start() { if (!timer) timer = w.setInterval(function () { go(idx + 1); }, 5000); }
		function stop() { if (timer) { w.clearInterval(timer); timer = null; } }
		function rest() { stop(); start(); }
		sec.addEventListener('mouseenter', stop);
		sec.addEventListener('mouseleave', start);
		w.addEventListener('resize', layout);
		layout();
		if (!w.matchMedia || !w.matchMedia('(prefers-reduced-motion: reduce)').matches) start();
	}

	/* 5-3. 가로 트랙(타일 · 레일) 페이지 이동 */
	function initTrack(sec) {
		var track = sec.querySelector('.js-track');
		var prev = sec.querySelector('.js-prev');
		var next = sec.querySelector('.js-next');
		if (!track || !prev || !next) return;
		var page = 0;
		function view() { return track.parentNode.clientWidth; }
		function max() { return Math.max(0, Math.ceil((track.scrollWidth - view()) / view())); }
		function paint() {
			if (page > max()) page = max();
			track.style.transform = 'translateX(' + (-page * view()) + 'px)';
			prev.disabled = (page <= 0);
			next.disabled = (page >= max());
		}
		prev.addEventListener('click', function () { if (page > 0) { page--; paint(); } });
		next.addEventListener('click', function () { if (page < max()) { page++; paint(); } });
		w.addEventListener('resize', function () { paint(); });
		paint();
	}

	/* 5-3b. 아이템 단위 페이저 — 한 화면에 보이는 개수만큼 넘긴다 */
	function makePager(sec, viewSel, trackSel) {
		var view  = sec.querySelector(viewSel);
		var track = sec.querySelector(trackSel);
		var prev  = sec.querySelector('.js-prev');
		var next  = sec.querySelector('.js-next');
		var bar   = sec.querySelector('.js-bar');
		if (!view || !track) return { paint: function () {}, reset: function () {} };
		var page = 0;

		function step() {
			var it = track.children[0];
			if (!it) return { w: 1, per: 1 };
			var iw = it.offsetWidth;
			var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 0;
			var per = Math.max(1, Math.round((view.clientWidth + gap) / (iw + gap)));
			return { w: iw + gap, per: per };
		}
		function paint() {
			var st = step();
			var total = Math.max(1, Math.ceil(track.children.length / st.per));
			if (page > total - 1) page = total - 1;
			if (page < 0) page = 0;
			/* 마지막 장에서 빈칸이 생기지 않도록 오른쪽 끝에 맞춰 멈춘다 */
			var end = Math.max(0, track.scrollWidth - view.clientWidth);
			track.style.transform = 'translateX(' + (-Math.min(page * st.per * st.w, end)) + 'px)';
			if (prev) prev.disabled = (page <= 0);
			if (next) next.disabled = (page >= total - 1);
			if (bar) bar.style.width = ((page + 1) / total * 100) + '%';
		}
		if (prev) prev.addEventListener('click', function () { page--; paint(); });
		if (next) next.addEventListener('click', function () { page++; paint(); });
		w.addEventListener('resize', paint);
		return { paint: paint, reset: function () { page = 0; paint(); } };
	}

	/* 5-3c. PICK — 해시태그 칩으로 묶음 교체 */
	function initPick() {
		var sec = root.querySelector('.mp-sec'); if (!sec) return;
		var list = sec.querySelector('.js-mplist');
		var tags = sec.querySelector('.js-mptags');
		var pager = makePager(sec, '.mp-view', '.js-mplist');

		function fill(i) {
			var t = PICK.tags[i], s = '', k;
			for (k = 0; k < t.ids.length; k++) s += pickItemHTML(P(t.ids[k]));
			list.innerHTML = s;
			var bs = tags.querySelectorAll('.js-mptag');
			for (k = 0; k < bs.length; k++) bs[k].className = 'mp-tag js-mptag' + (k === i ? ' on' : '');
			pager.reset();
		}
		tags.addEventListener('click', function (e) {
			var b = e.target.closest ? e.target.closest('.js-mptag') : null;
			if (b) fill(+b.getAttribute('data-i'));
		});
		fill(0);
	}

	/* 5-3d. 베스트 상품 — 카테고리 탭 */
	function initBest() {
		var sec = root.querySelector('.bs-sec'); if (!sec) return;
		var list = sec.querySelector('.js-bslist');
		var tabs = sec.querySelector('.js-bstabs');
		var more = sec.querySelector('.js-bsmore');
		var pager = makePager(sec, '.bs-view', '.js-bslist');

		function fill(i) {
			var t = BEST.tabs[i], arr = S.filterList(t.cat, 'all'), s = '', k;
			/* 대표 작업물이 지정된 탭은 그 상품을 맨 앞으로 끌어올린다 */
			if (t.first) {
				for (k = 0; k < arr.length; k++) {
					if (arr[k].id === t.first) { arr = arr.slice(); arr.unshift(arr.splice(k, 1)[0]); break; }
				}
			}
			for (k = 0; k < arr.length && k < 9; k++) s += bestItemHTML(arr[k]);
			list.innerHTML = s;
			for (k = 0; k < tabs.children.length; k++) tabs.children[k].className = (k === i ? 'on' : '');
			if (more) more.setAttribute('href', shopUrl(t.cat));
			pager.reset();
		}
		tabs.addEventListener('click', function (e) {
			var b = e.target.closest ? e.target.closest('.js-bstab') : null;
			if (b) fill(+b.getAttribute('data-i'));
		});
		fill(0);
	}

	/* 5-4. 템플릿 미리보기 */
	function initTpl() {
		var sec = root.querySelector('.tp-sec'); if (!sec) return;
		var tabsEl  = sec.querySelector('.js-tabs');
		var chipsEl = sec.querySelector('.js-chips');
		var mockEl  = sec.querySelector('.js-mock');
		var bgEl    = sec.querySelector('.js-stagebg');
		var cntEl   = sec.querySelector('.js-count');
		var tplsEl  = sec.querySelector('.js-tpls');
		var nameEl  = sec.querySelector('.js-name');
		var descEl  = sec.querySelector('.js-desc');
		var priceEl = sec.querySelector('.js-price');
		var ctaEl   = sec.querySelector('.js-cta');
		var btn3d   = sec.querySelector('.js-3d');

		var tabI = 0, prod = null, pool = [], shape = 'card', tplI = 0, is3d = false;
		var FACES = { card: 2, env: 2, a4: 2, fold2: 2, fold3: 3, poster: 1, holder: 2 };

		function setTab(i) {
			tabI = i;
			var t = TABS[i], k;
			for (k = 0; k < tabsEl.children.length; k++) tabsEl.children[k].className = (k === i ? 'on' : '');
			var h = '', p;
			for (k = 0; k < t.ids.length; k++) {
				p = P(t.ids[k]); if (!p) continue;
				h += '<button type="button" class="tp-chip js-chip' + (k === 0 ? ' on' : '') + '" data-id="' + p.id + '">' + esc(p.name) + '</button>';
			}
			h += '<a href="' + t.all + '" class="tp-chip all">' + t.lb + ' 전체 보기 👀</a>';
			chipsEl.innerHTML = h;
			setProd(t.ids[0]);
		}

		function setProd(id) {
			prod = P(id); if (!prod) return;
			var m = MOCK[id] || ['card', 'card'];
			shape = m[0];
			pool = POOL[m[1]] || POOL.card;
			/* 칩 활성화 */
			var cs = chipsEl.querySelectorAll('.js-chip'), k;
			for (k = 0; k < cs.length; k++) cs[k].className = 'tp-chip js-chip' + (cs[k].getAttribute('data-id') === id ? ' on' : '');
			/* 상품 정보 */
			nameEl.textContent = prod.name;
			descEl.textContent = prod.desc;
			priceEl.innerHTML = S.isQuote(prod)
				? '견적 문의 <span class="u">(맞춤 제작)</span>'
				: S.won(S.minPrice(prod)) + '원~ <span class="u">(' + prod.qty[0].label + ' 기준)</span>';
			ctaEl.setAttribute('href', S.detailUrl(prod));
			ctaEl.innerHTML = (S.isQuote(prod) ? '이 상품 견적 받기' : '이 상품 만들러 가기') + '<i class="xi-angle-right-min"></i>';
			/* 목업 뼈대 */
			var faces = FACES[shape] || 1, f = '';
			for (k = 0; k < faces; k++) f += '<span class="tp-face' + (k === 1 ? ' f2' : '') + '"></span>';
			mockEl.innerHTML = f;
			mockEl.className = 'tp-mock js-mock is-' + shape + (is3d ? ' is-3d' : '');
			/* 템플릿 목록 */
			var t = '', src;
			for (k = 0; k < pool.length; k++) {
				src = img(pool[k]);
				t += '<button type="button" class="tp-tpl js-tpl' + (k === 0 ? ' on' : '') + '" data-i="' + k + '">' +
					'<img src="' + src + '" alt="' + esc(TPL_NAME[k % TPL_NAME.length]) + ' 템플릿" loading="lazy">' +
					'<span class="chk"><i class="xi-check"></i></span>' +
					'<span class="nm">' + esc(TPL_NAME[k % TPL_NAME.length]) + '</span>' +
				'</button>';
			}
			tplsEl.innerHTML = t;
			setTpl(0);
		}

		function setTpl(i) {
			tplI = i;
			var src = img(pool[i]);
			var faces = mockEl.children, k;
			for (k = 0; k < faces.length; k++) {
				faces[k].style.backgroundImage = 'url(' + src + ')';
				if (shape === 'fold2' || shape === 'fold3') {
					/* 한 장의 디자인을 접지 면 수만큼 쪼개 실제 접지 상품처럼 보이게 한다 */
					var n = faces.length;
					faces[k].style.backgroundSize = (n * 100) + '% 100%';
					faces[k].style.backgroundPosition = (k * (100 / (n - 1))) + '% 50%';
				} else {
					faces[k].style.backgroundSize = 'cover';
					faces[k].style.backgroundPosition = (k === 1 ? '60% 50%' : '50% 50%');
				}
			}
			bgEl.style.backgroundImage = 'url(' + src + ')';
			cntEl.textContent = (i + 1) + ' / ' + pool.length;
			var ts = tplsEl.querySelectorAll('.js-tpl');
			for (k = 0; k < ts.length; k++) ts[k].className = 'tp-tpl js-tpl' + (k === i ? ' on' : '');
		}

		tabsEl.addEventListener('click', function (e) {
			var b = e.target.closest ? e.target.closest('.js-tab') : null;
			if (b) setTab(+b.getAttribute('data-i'));
		});
		chipsEl.addEventListener('click', function (e) {
			var b = e.target.closest ? e.target.closest('.js-chip') : null;
			if (b) setProd(b.getAttribute('data-id'));
		});
		tplsEl.addEventListener('click', function (e) {
			var b = e.target.closest ? e.target.closest('.js-tpl') : null;
			if (b) setTpl(+b.getAttribute('data-i'));
		});
		btn3d.addEventListener('click', function () {
			is3d = !is3d;
			mockEl.className = 'tp-mock js-mock is-' + shape + (is3d ? ' is-3d' : '');
			btn3d.className = 'tp-3d js-3d' + (is3d ? ' on' : '');
			btn3d.innerHTML = '<i class="xi-rotate-right"></i>' + (is3d ? '평면으로 보기' : '3D로 보기');
		});

		setTab(0);
	}

	/* 5-5. 스탯 순환 */
	function initStat() {
		var ul = root.querySelector('.js-stat'); if (!ul) return;
		var n = ul.children.length, i = 0;
		if (n < 2) return;
		w.setInterval(function () {
			ul.children[i].className = '';
			i = (i + 1) % n;
			ul.children[i].className = 'on';
		}, 1800);
	}

	/* 5-6. 카드 빠른 담기 */
	function initAdd() {
		root.addEventListener('click', function (e) {
			var b = e.target.closest ? e.target.closest('.js-add') : null;
			if (!b) return;
			e.preventDefault();
			var p = P(b.getAttribute('data-id'));
			if (!p) return;
			S.quickAdd(p);
			b.className = 'sh-card-add js-add done';
			w.setTimeout(function () { b.className = 'sh-card-add js-add'; }, 1400);
		});
	}

	/* 5-7. 카테고리 검색 */
	function initSearch(cat, dept) {
		var input = root.querySelector('#shQ');
		var btn = root.querySelector('.js-q');
		if (!input || !btn) return;
		function go() {
			var v = input.value.trim();
			location.href = 'list.html?cat=' + cat + (dept !== 'all' ? '&dept=' + dept : '') + (v ? '&q=' + encodeURIComponent(v) : '');
		}
		btn.addEventListener('click', go);
		input.addEventListener('keydown', function (e) { if (e.keyCode === 13) go(); });
	}

	/* ====================================================
	 * 6. 조립
	==================================================== */
	var cat  = S.getParam('cat')  || 'all';
	var dept = S.getParam('dept') || 'all';
	var q    = S.getParam('q')    || '';
	var isCate = (cat !== 'all' && CATE_HEAD[cat]);
	if (cat !== 'all' && !CATE_HEAD[cat]) cat = 'all';

	var html = catbarHTML(isCate ? cat : '');

	if (isCate) {
		html += cateHTML(cat, dept, q) + endHTML();
		d.title = S.catName(cat) + ' - 상품몰 | MEDITIVE 병원 전문 디자인 스튜디오';
	} else {
		html += heroHTML() + tilesHTML();
		html += pickHTML() + bestHTML();
		html += tplHTML() + statHTML() + reviewHTML() + endHTML();
	}
	root.innerHTML = html;

	initAllPanel();
	initAdd();
	if (isCate) {
		initSearch(cat, dept);
	} else {
		initHero();
		initPick();
		initBest();
		initTpl();
		initStat();
		var secs = root.querySelectorAll('.sh-tiles'), i;
		for (i = 0; i < secs.length; i++) initTrack(secs[i]);
	}
	S.paintCount();

	/* 앵커(#tplPreview)로 들어온 경우 헤더 높이만큼 보정해 이동 */
	if (location.hash === '#tplPreview') {
		w.setTimeout(function () {
			var t = d.getElementById('tplPreview');
			if (t) w.scrollTo(0, t.getBoundingClientRect().top + w.pageYOffset - 100);
		}, 300);
	}
	root.addEventListener('click', function (e) {
		var a = e.target.closest ? e.target.closest('a[href="#tplPreview"]') : null;
		if (!a) return;
		var t = d.getElementById('tplPreview');
		if (!t) return;
		e.preventDefault();
		w.scrollTo({ top: t.getBoundingClientRect().top + w.pageYOffset - 100, behavior: 'smooth' });
	});

})(window, document);
