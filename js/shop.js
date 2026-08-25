/* ========================================================
 * MEDITIVE SHOP  —  병원 디자인 마켓
 * 정적 사이트용 상품 카탈로그 / 필터 / 장바구니(localStorage) / 재주문
 * 페이지에서 window.SHOP_BASE 로 루트 상대경로를 지정한다. (기본 '../../')
======================================================== */
(function (w, d) {
	'use strict';

	var BASE = (typeof w.SHOP_BASE === 'string') ? w.SHOP_BASE : '../../';
	var CART_KEY = 'meditive_cart_v1';
	var ORDER_KEY = 'meditive_orders_v1';
	var QUOTE_KEY = 'meditive_quotes_v1';

	/* ----------------------------------------------------
	 * 카테고리 / 진료과
	---------------------------------------------------- */
	var CATS = [
		{ id: 'all',     name: '전체 상품',   en: 'All Products' },
		{ id: 'print',   name: '병원 인쇄물', en: 'Hospital Print' },
		{ id: 'promo',   name: '홍보물',     en: 'Promotion' },
		{ id: 'form',    name: '서식류',     en: 'Medical Forms' },
		{ id: 'card',    name: '명함/봉투',  en: 'Card & Envelope' },
		{ id: 'package', name: '개원 패키지', en: 'Opening Package' },
		{ id: 'reorder', name: '재주문 상품', en: 'Reorder' }
	];

	var DEPTS = [
		{ id: 'all',      name: '전체' },
		{ id: 'dental',   name: '치과' },
		{ id: 'derma',    name: '피부과' },
		{ id: 'plastic',  name: '성형외과' },
		{ id: 'ortho',    name: '정형외과' },
		{ id: 'internal', name: '내과' },
		{ id: 'oriental', name: '한의원' }
	];

	var ALL_DEPT = ['dental', 'derma', 'plastic', 'ortho', 'internal', 'oriental'];

	/* 공통 제작 옵션 프리셋 */
	var OPT_PAPER = [
		{ label: '스노우지 200g (기본)', add: 0 },
		{ label: '아트지 250g', add: 12000 },
		{ label: '랑데뷰 240g (고급)', add: 28000 },
		{ label: '머쉬멜로우 240g (고급)', add: 32000 }
	];
	var OPT_FINISH = [
		{ label: '무광 코팅 (기본)', add: 0 },
		{ label: '유광 코팅', add: 0 },
		{ label: '코팅 없음', add: -6000 },
		{ label: '부분 UV', add: 38000 }
	];
	var OPT_SIDE = [
		{ label: '양면 인쇄 (기본)', add: 0 },
		{ label: '단면 인쇄', add: -8000 }
	];
	/* 디자인 수정 범위 — 기존 디자인 / 텍스트 수정 / 부분 수정 / 신규 디자인 */
	var OPT_DESIGN = [
		{ label: '기존 디자인 그대로 (기본 템플릿)', add: 0 },
		{ label: '텍스트만 수정', add: 30000 },
		{ label: '부분 수정 (레이아웃 조정)', add: 90000 },
		{ label: '신규 디자인 (시안 3회)', add: 180000 }
	];

	function qty(list) { return list; }

	/* ----------------------------------------------------
	 * 배송 / 주문 진행 단계
	---------------------------------------------------- */
	var SHIP_FEE = 3500;          /* 기본 배송비 */
	var SHIP_FREE_OVER = 300000;  /* 이 금액 이상 무료 */

	/* 디자인 프로젝트 진행 흐름 */
	var FLOW = ['자료 접수', '디자이너 배정', '시안 확인', '수정 반영', '인쇄 진행', '배송 완료'];

	/* 맞춤 제작 — 가격 확정이 어려워 견적 문의로 연결되는 상품 */
	var QUOTE_IDS = ['pr05', 'pr06', 'pr07', 'pm01', 'pm08', 'pk01', 'pk02', 'pk03', 'pk04'];

	/* ----------------------------------------------------
	 * 상품 카탈로그
	---------------------------------------------------- */
	var PRODUCTS = [
		/* ===== 병원 인쇄물 ===== */
		{
			id: 'pr01', cat: 'print', name: '진료카드', img: 'p05.jpg',
			desc: '재방문을 부르는 첫 접점. 병원 로고와 진료시간을 담은 카드.',
			depts: ALL_DEPT, best: true, reorder: true, badge: 'BEST',
			qty: qty([{ label: '500매', price: 39000 }, { label: '1,000매', price: 62000 }, { label: '2,000매', price: 104000 }, { label: '5,000매', price: 218000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '인쇄', list: OPT_SIDE }, { name: '후가공', list: OPT_FINISH }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '90 × 50 mm', '인쇄': '단면 / 양면 선택', '제작기간': '시안 확정 후 3~4일', '최소수량': '500매' }
		},
		{
			id: 'pr02', cat: 'print', name: '예약카드', img: 'p44.jpg',
			desc: '다음 내원일을 손글씨로 적어 전달하는 재방문 유도 카드.',
			depts: ALL_DEPT, reorder: true,
			qty: qty([{ label: '500매', price: 34000 }, { label: '1,000매', price: 54000 }, { label: '2,000매', price: 92000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '인쇄', list: OPT_SIDE }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '90 × 50 mm', '인쇄': '단면 / 양면 선택', '제작기간': '3~4일', '최소수량': '500매' }
		},
		{
			id: 'pr03', cat: 'print', name: '처방전 봉투', img: 'p21.jpg',
			desc: '처방전과 안내문을 함께 담는 병원 전용 봉투.',
			depts: ['dental', 'derma', 'internal', 'ortho', 'oriental'], reorder: true,
			qty: qty([{ label: '1,000매', price: 88000 }, { label: '3,000매', price: 214000 }, { label: '5,000매', price: 328000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 100g (기본)', add: 0 }, { label: '모조지 120g', add: 16000 }, { label: '크라프트지', add: 24000 }] }, { name: '인쇄', list: OPT_SIDE }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '120 × 235 mm (서양2호)', '인쇄': '1도 / 컬러 선택', '제작기간': '4~5일', '최소수량': '1,000매' }
		},
		{
			id: 'pr04', cat: 'print', name: '차트홀더 · 파일', img: 'p24.jpg',
			desc: '진료 서류를 정리해 전달하는 병원 브랜드 홀더.',
			depts: ALL_DEPT,
			qty: qty([{ label: '200부', price: 268000 }, { label: '500부', price: 520000 }, { label: '1,000부', price: 890000 }]),
			opts: [{ name: '용지', list: [{ label: '스노우지 300g (기본)', add: 0 }, { label: '랑데뷰 300g (고급)', add: 68000 }] }, { name: '후가공', list: OPT_FINISH }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '220 × 310 mm', '형태': '이단 접지 + 포켓', '제작기간': '7~9일', '최소수량': '200부' }
		},
		{
			id: 'pr05', cat: 'print', name: '진료 안내 데스크 사인', img: 'p27.jpg',
			desc: '접수 데스크에 놓는 진료시간 · 안내 사인물.',
			depts: ALL_DEPT,
			qty: qty([{ label: '1개', price: 128000 }, { label: '2개', price: 232000 }, { label: '4개', price: 428000 }]),
			opts: [{ name: '소재', list: [{ label: '아크릴 5T (기본)', add: 0 }, { label: '아크릴 10T', add: 42000 }, { label: '우드 + 아크릴', add: 78000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '200 × 300 mm', '소재': '아크릴 / 우드', '제작기간': '7~10일', '최소수량': '1개' }
		},
		{
			id: 'pr06', cat: 'print', name: '진료실 도어 사인', img: 'p30.jpg',
			desc: '진료실 · 상담실 · 처치실을 구분하는 미니멀 사인.',
			depts: ALL_DEPT,
			qty: qty([{ label: '3개 세트', price: 168000 }, { label: '6개 세트', price: 298000 }, { label: '10개 세트', price: 452000 }]),
			opts: [{ name: '소재', list: [{ label: '아크릴 무광 (기본)', add: 0 }, { label: '메탈 헤어라인', add: 96000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '150 × 60 mm', '부착': '양면 폼테이프', '제작기간': '7~10일', '최소수량': '3개' }
		},
		{
			id: 'pr07', cat: 'print', name: '수납 · 대기 안내판', img: 'p32.jpg',
			desc: '대기 공간의 안내 문구를 정돈된 톤으로 정리한 안내판.',
			depts: ALL_DEPT,
			qty: qty([{ label: '1개', price: 148000 }, { label: '2개', price: 268000 }]),
			opts: [{ name: '소재', list: [{ label: '포맥스 + 시트 (기본)', add: 0 }, { label: '아크릴 5T', add: 56000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '400 × 600 mm', '소재': '포맥스 / 아크릴', '제작기간': '7~10일', '최소수량': '1개' }
		},
		{
			id: 'pr08', cat: 'print', name: '진료 안내 리플렛 (내부 비치용)', img: 'p18.jpg',
			desc: '대기실에 비치해 진료 과정을 설명하는 안내 리플렛.',
			depts: ALL_DEPT,
			qty: qty([{ label: '500부', price: 118000 }, { label: '1,000부', price: 178000 }, { label: '3,000부', price: 398000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '접지', list: [{ label: '2단 접지 (기본)', add: 0 }, { label: '3단 접지', add: 18000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A4 → 2단/3단 접지', '인쇄': '양면 컬러', '제작기간': '5~7일', '최소수량': '500부' }
		},

		/* ===== 홍보물 ===== */
		{
			id: 'pm01', cat: 'promo', name: '병원 소개 브로슈어', img: 'p01.jpg',
			desc: '병원의 철학과 진료 영역을 한 권에 담는 대표 브로슈어.',
			depts: ALL_DEPT, best: true, badge: 'BEST',
			qty: qty([{ label: '300부', price: 480000 }, { label: '500부', price: 680000 }, { label: '1,000부', price: 1080000 }]),
			opts: [{ name: '페이지', list: [{ label: '8p (기본)', add: 0 }, { label: '12p', add: 180000 }, { label: '16p', add: 320000 }] }, { name: '용지', list: OPT_PAPER }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '210 × 297 mm (A4)', '페이지': '8p / 12p / 16p', '제본': '중철 제본', '제작기간': '10~14일' }
		},
		{
			id: 'pm02', cat: 'promo', name: '3단 리플렛', img: 'niz01.jpg',
			desc: '진료 항목과 시술 안내를 간결하게 정리한 3단 리플렛.',
			depts: ALL_DEPT, best: true,
			qty: qty([{ label: '500부', price: 138000 }, { label: '1,000부', price: 198000 }, { label: '3,000부', price: 438000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '후가공', list: OPT_FINISH }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A4 → 3단 접지', '인쇄': '양면 컬러', '제작기간': '5~7일', '최소수량': '500부' }
		},
		{
			id: 'pm03', cat: 'promo', name: '2단 리플렛', img: 'p07.jpg',
			desc: '하나의 시술 · 이벤트를 집중해서 소개하는 2단 리플렛.',
			depts: ALL_DEPT,
			qty: qty([{ label: '500부', price: 118000 }, { label: '1,000부', price: 168000 }, { label: '3,000부', price: 378000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '후가공', list: OPT_FINISH }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A4 → 2단 접지', '인쇄': '양면 컬러', '제작기간': '5~7일', '최소수량': '500부' }
		},
		{
			id: 'pm04', cat: 'promo', name: '진료과목 포스터', img: 'p09.jpg',
			desc: '대기실 · 복도 벽면에 거는 진료 안내 포스터.',
			depts: ALL_DEPT,
			qty: qty([{ label: '10매', price: 88000 }, { label: '30매', price: 168000 }, { label: '50매', price: 238000 }]),
			opts: [{ name: '규격', list: [{ label: 'A2 (기본)', add: 0 }, { label: 'A1', add: 46000 }, { label: 'B1', add: 68000 }] }, { name: '용지', list: OPT_PAPER }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A2 / A1 / B1', '인쇄': '단면 컬러', '제작기간': '4~6일', '최소수량': '10매' }
		},
		{
			id: 'pm05', cat: 'promo', name: '실내용 X배너', img: 'p26.jpg',
			desc: '접수처 · 대기실에 세우는 진료 안내 배너. 거치대 포함.',
			depts: ALL_DEPT,
			qty: qty([{ label: '1개', price: 92000 }, { label: '2개', price: 168000 }, { label: '4개', price: 312000 }]),
			opts: [{ name: '소재', list: [{ label: '실사 출력 (기본)', add: 0 }, { label: '무광 코팅 실사', add: 18000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '600 × 1,800 mm', '구성': '배너 + X형 거치대', '제작기간': '5~7일', '최소수량': '1개' }
		},
		{
			id: 'pm06', cat: 'promo', name: '개원 안내 현수막', img: 'p28.jpg',
			desc: '개원 · 이전 · 리뉴얼 소식을 알리는 외부 현수막.',
			depts: ALL_DEPT,
			qty: qty([{ label: '1장', price: 78000 }, { label: '2장', price: 142000 }, { label: '4장', price: 268000 }]),
			opts: [{ name: '규격', list: [{ label: '5m × 0.9m (기본)', add: 0 }, { label: '7m × 0.9m', add: 32000 }, { label: '10m × 1m', add: 78000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '소재': '방수 현수막 원단', '마감': '고리 + 로프 마감', '제작기간': '4~6일', '최소수량': '1장' }
		},
		{
			id: 'pm07', cat: 'promo', name: '이벤트 전단지', img: 'p16.jpg',
			desc: '시즌 프로모션 · 시술 이벤트를 알리는 배포용 전단.',
			depts: ['derma', 'plastic', 'dental', 'oriental'],
			qty: qty([{ label: '1,000부', price: 98000 }, { label: '3,000부', price: 198000 }, { label: '5,000부', price: 288000 }]),
			opts: [{ name: '용지', list: [{ label: '아트지 120g (기본)', add: 0 }, { label: '아트지 150g', add: 22000 }, { label: '스노우지 150g', add: 26000 }] }, { name: '인쇄', list: OPT_SIDE }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A5 / A4 선택', '인쇄': '양면 컬러', '제작기간': '4~6일', '최소수량': '1,000부' }
		},
		{
			id: 'pm08', cat: 'promo', name: '엘리베이터 광고 패널', img: 'p41.jpg',
			desc: '건물 엘리베이터 · 로비에 부착하는 병원 안내 패널.',
			depts: ALL_DEPT,
			qty: qty([{ label: '1개', price: 138000 }, { label: '2개', price: 248000 }]),
			opts: [{ name: '소재', list: [{ label: '포맥스 + 시트 (기본)', add: 0 }, { label: '아크릴 3T', add: 48000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '600 × 900 mm', '소재': '포맥스 / 아크릴', '제작기간': '7~10일', '최소수량': '1개' }
		},

		/* ===== 서식류 ===== */
		{
			id: 'fm01', cat: 'form', name: '초진 문진표', img: 'p15.jpg',
			desc: '첫 내원 환자의 정보를 정돈된 서식으로 받는 문진표.',
			depts: ALL_DEPT, best: true, reorder: true,
			qty: qty([{ label: '1,000매', price: 64000 }, { label: '3,000매', price: 148000 }, { label: '5,000매', price: 218000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 80g (기본)', add: 0 }, { label: '모조지 100g', add: 14000 }] }, { name: '인쇄', list: [{ label: '1도 (흑백)', add: 0 }, { label: '2도 (포인트 컬러)', add: 26000 }, { label: '4도 (컬러)', add: 48000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A4 (210 × 297 mm)', '인쇄': '단면 / 양면 선택', '제작기간': '4~5일', '최소수량': '1,000매' }
		},
		{
			id: 'fm02', cat: 'form', name: '시술 · 수술 동의서', img: 'p20.jpg',
			desc: '설명 의무를 충족하면서 읽기 쉬운 구조의 동의서 서식.',
			depts: ['derma', 'plastic', 'dental', 'ortho'], reorder: true,
			qty: qty([{ label: '1,000매', price: 68000 }, { label: '3,000매', price: 156000 }, { label: '5,000매', price: 228000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 80g (기본)', add: 0 }, { label: '모조지 100g', add: 14000 }] }, { name: '인쇄', list: OPT_SIDE }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A4', '인쇄': '양면 1도', '제작기간': '4~5일', '최소수량': '1,000매' }
		},
		{
			id: 'fm03', cat: 'form', name: '진료기록지', img: 'p22.jpg',
			desc: '차트 정리 흐름에 맞춘 진료기록 서식.',
			depts: ALL_DEPT, reorder: true,
			qty: qty([{ label: '1,000매', price: 62000 }, { label: '3,000매', price: 142000 }, { label: '5,000매', price: 208000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 80g (기본)', add: 0 }, { label: '모조지 100g', add: 14000 }] }, { name: '인쇄', list: OPT_SIDE }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A4', '인쇄': '단면 1도', '제작기간': '4~5일', '최소수량': '1,000매' }
		},
		{
			id: 'fm04', cat: 'form', name: '검사결과 안내지', img: 'p23.jpg',
			desc: '검사 결과를 환자가 이해하기 쉽게 전달하는 안내 서식.',
			depts: ['internal', 'ortho', 'derma', 'oriental'],
			qty: qty([{ label: '500매', price: 58000 }, { label: '1,000매', price: 88000 }, { label: '3,000매', price: 188000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '인쇄', list: [{ label: '4도 (컬러)', add: 0 }, { label: '1도 (흑백)', add: -22000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A4', '인쇄': '단면 컬러', '제작기간': '4~6일', '최소수량': '500매' }
		},
		{
			id: 'fm05', cat: 'form', name: '수납 영수증 양식', img: 'p25.jpg',
			desc: '병원 로고가 들어간 수납 · 진료비 영수증 서식.',
			depts: ALL_DEPT, reorder: true,
			qty: qty([{ label: '2,000매', price: 72000 }, { label: '5,000매', price: 148000 }, { label: '10,000매', price: 268000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 80g (기본)', add: 0 }, { label: 'NCR 2겹지', add: 68000 }] }, { name: '인쇄', list: [{ label: '1도 (흑백)', add: 0 }, { label: '2도 (포인트 컬러)', add: 24000 }] }],
			spec: { '규격': '100 × 190 mm', '인쇄': '단면 1도', '제작기간': '4~5일', '최소수량': '2,000매' }
		},
		{
			id: 'fm06', cat: 'form', name: '복약 · 처방 안내문', img: 'p13.jpg',
			desc: '복약 방법과 주의사항을 그림과 함께 안내하는 서식.',
			depts: ['internal', 'oriental', 'dental', 'derma'],
			qty: qty([{ label: '1,000매', price: 78000 }, { label: '3,000매', price: 168000 }, { label: '5,000매', price: 248000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '인쇄', list: OPT_SIDE }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': 'A5 / A4 선택', '인쇄': '단면 컬러', '제작기간': '4~6일', '최소수량': '1,000매' }
		},
		{
			id: 'fm07', cat: 'form', name: '시술 후 주의사항 카드', img: 'p17.jpg',
			desc: '시술 직후 환자에게 건네는 홈케어 안내 카드.',
			depts: ['derma', 'plastic', 'dental'],
			qty: qty([{ label: '500매', price: 46000 }, { label: '1,000매', price: 72000 }, { label: '3,000매', price: 158000 }]),
			opts: [{ name: '용지', list: OPT_PAPER }, { name: '인쇄', list: OPT_SIDE }, { name: '후가공', list: OPT_FINISH }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '90 × 140 mm', '인쇄': '단면 / 양면 선택', '제작기간': '4~6일', '최소수량': '500매' }
		},

		/* ===== 명함 / 봉투 ===== */
		{
			id: 'cd01', cat: 'card', name: '원장 명함', img: 'niz02.jpg',
			desc: '병원의 인상을 결정하는 원장 명함. 고급 용지 선택 가능.',
			depts: ALL_DEPT, best: true, reorder: true, badge: 'BEST',
			qty: qty([{ label: '200매', price: 42000 }, { label: '500매', price: 68000 }, { label: '1,000매', price: 108000 }]),
			opts: [{ name: '용지', list: [{ label: '랑데뷰 240g (기본)', add: 0 }, { label: '머쉬멜로우 240g', add: 12000 }, { label: '팬시 크라프트', add: 16000 }, { label: '수입지 (고급)', add: 46000 }] }, { name: '인쇄', list: OPT_SIDE }, { name: '후가공', list: [{ label: '없음 (기본)', add: 0 }, { label: '박 (금·은)', add: 58000 }, { label: '형압', add: 52000 }, { label: '박 + 형압', add: 96000 }] }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '90 × 50 mm', '인쇄': '단면 / 양면 선택', '제작기간': '4~6일', '최소수량': '200매' }
		},
		{
			id: 'cd02', cat: 'card', name: '직원 명함', img: 'niz03.jpg',
			desc: '원장 명함과 톤을 맞춘 상담실장 · 간호팀 명함.',
			depts: ALL_DEPT, reorder: true,
			qty: qty([{ label: '200매', price: 34000 }, { label: '500매', price: 54000 }, { label: '1,000매', price: 86000 }]),
			opts: [{ name: '용지', list: [{ label: '랑데뷰 240g (기본)', add: 0 }, { label: '머쉬멜로우 240g', add: 12000 }, { label: '스노우지 250g', add: -6000 }] }, { name: '인쇄', list: OPT_SIDE }, { name: '디자인', list: OPT_DESIGN }],
			spec: { '규격': '90 × 50 mm', '인쇄': '단면 / 양면 선택', '제작기간': '4~6일', '최소수량': '200매' }
		},
		{
			id: 'cd03', cat: 'card', name: '소봉투 (서양 봉투)', img: 'niz04.jpg',
			desc: '안내문 · 영수증을 담아 전달하는 병원 소봉투.',
			depts: ALL_DEPT, reorder: true,
			qty: qty([{ label: '1,000매', price: 86000 }, { label: '3,000매', price: 208000 }, { label: '5,000매', price: 318000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 100g (기본)', add: 0 }, { label: '모조지 120g', add: 18000 }, { label: '크라프트지', add: 26000 }] }, { name: '인쇄', list: [{ label: '1도 (기본)', add: 0 }, { label: '2도', add: 28000 }, { label: '4도 (컬러)', add: 56000 }] }],
			spec: { '규격': '120 × 235 mm', '인쇄': '단면 1도', '제작기간': '5~7일', '최소수량': '1,000매' }
		},
		{
			id: 'cd04', cat: 'card', name: '대봉투 (각대 봉투)', img: 'p33.jpg',
			desc: '서류 · 브로슈어를 담는 A4 규격 병원 대봉투.',
			depts: ALL_DEPT,
			qty: qty([{ label: '500매', price: 118000 }, { label: '1,000매', price: 188000 }, { label: '3,000매', price: 438000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 120g (기본)', add: 0 }, { label: '크라프트지 120g', add: 22000 }] }, { name: '인쇄', list: [{ label: '1도 (기본)', add: 0 }, { label: '4도 (컬러)', add: 68000 }] }],
			spec: { '규격': '240 × 332 mm (각대)', '인쇄': '단면', '제작기간': '5~7일', '최소수량': '500매' }
		},
		{
			id: 'cd05', cat: 'card', name: '약봉투', img: 'p34.jpg',
			desc: '복약 정보와 병원 정보를 함께 담는 약봉투.',
			depts: ['internal', 'oriental', 'dental', 'derma', 'ortho'], reorder: true,
			qty: qty([{ label: '2,000매', price: 96000 }, { label: '5,000매', price: 198000 }, { label: '10,000매', price: 356000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 80g (기본)', add: 0 }, { label: '모조지 100g', add: 22000 }] }, { name: '인쇄', list: [{ label: '1도 (기본)', add: 0 }, { label: '2도', add: 32000 }] }],
			spec: { '규격': '105 × 175 mm', '인쇄': '양면 1도', '제작기간': '5~7일', '최소수량': '2,000매' }
		},
		{
			id: 'cd06', cat: 'card', name: '진료비 영수증 봉투', img: 'p35.jpg',
			desc: '수납 후 영수증과 안내문을 함께 담는 전용 봉투.',
			depts: ALL_DEPT,
			qty: qty([{ label: '1,000매', price: 82000 }, { label: '3,000매', price: 196000 }]),
			opts: [{ name: '용지', list: [{ label: '모조지 100g (기본)', add: 0 }, { label: '모조지 120g', add: 18000 }] }, { name: '인쇄', list: [{ label: '1도 (기본)', add: 0 }, { label: '2도', add: 26000 }] }],
			spec: { '규격': '105 × 220 mm', '인쇄': '단면 1도', '제작기간': '5~7일', '최소수량': '1,000매' }
		},

		/* ===== 개원 패키지 ===== */
		{
			id: 'pk01', cat: 'package', name: '개원 베이직 패키지', img: 'p02.jpg',
			desc: '개원에 꼭 필요한 인쇄물을 하나의 톤으로 묶은 기본 구성.',
			depts: ALL_DEPT, best: true, badge: 'PACKAGE',
			qty: qty([{ label: '기본 구성', price: 1280000 }, { label: '수량 2배 구성', price: 1980000 }]),
			opts: [{ name: '디자인', list: [{ label: '기본 템플릿 적용', add: 0 }, { label: '맞춤 디자인 (컨셉 제안 포함)', add: 480000 }] }, { name: '일정', list: [{ label: '일반 (3~4주)', add: 0 }, { label: '긴급 (2주)', add: 320000 }] }],
			spec: { '구성': '명함 · 진료카드 · 봉투 · 문진표 · 리플렛', '수량': '기본 각 1,000매 기준', '제작기간': '3~4주', '포함': '시안 3회 수정' },
			include: ['원장 · 직원 명함 각 500매', '진료카드 1,000매', '소봉투 1,000매', '초진 문진표 1,000매', '3단 리플렛 500부']
		},
		{
			id: 'pk02', cat: 'package', name: '개원 프리미엄 패키지', img: 'p03.jpg',
			desc: '브랜딩부터 사인물까지, 개원 전 과정을 한 번에 정리하는 구성.',
			depts: ALL_DEPT, best: true, badge: 'PACKAGE',
			qty: qty([{ label: '기본 구성', price: 2680000 }, { label: '사인물 확장 구성', price: 3480000 }]),
			opts: [{ name: '디자인', list: [{ label: '맞춤 디자인 (기본)', add: 0 }, { label: '브랜드 컨셉 2안 제안', add: 380000 }] }, { name: '일정', list: [{ label: '일반 (4~6주)', add: 0 }, { label: '긴급 (3주)', add: 480000 }] }],
			spec: { '구성': '베이직 전체 + 브로슈어 · 사인물 · 배너', '수량': '기본 각 1,000매 기준', '제작기간': '4~6주', '포함': '시안 무제한 수정' },
			include: ['베이직 패키지 전체 구성', '병원 소개 브로슈어 300부', '데스크 사인 · 도어 사인 세트', '실내 X배너 2개', '개원 현수막 1장']
		},
		{
			id: 'pk03', cat: 'package', name: '리뉴얼 패키지', img: 'p06.jpg',
			desc: '운영 중인 병원의 인쇄물 톤을 하나로 다시 정리하는 구성.',
			depts: ALL_DEPT, badge: 'PACKAGE',
			qty: qty([{ label: '기본 구성', price: 1680000 }, { label: '사인물 포함 구성', price: 2280000 }]),
			opts: [{ name: '디자인', list: [{ label: '기존 로고 유지 (기본)', add: 0 }, { label: '로고 리터치 포함', add: 320000 }] }, { name: '일정', list: [{ label: '일반 (3~4주)', add: 0 }, { label: '긴급 (2주)', add: 380000 }] }],
			spec: { '구성': '명함 · 카드 · 서식 · 리플렛 리디자인', '수량': '기본 각 1,000매 기준', '제작기간': '3~4주', '포함': '시안 3회 수정' },
			include: ['명함 리디자인 (원장 · 직원)', '진료카드 1,000매', '서식류 3종 리디자인', '3단 리플렛 500부']
		},
		{
			id: 'pk04', cat: 'package', name: '브랜딩 풀패키지', img: 'niz05.jpg',
			desc: 'CI부터 인쇄물 · 디지털까지 병원 브랜드 전체를 설계합니다.',
			depts: ALL_DEPT, badge: 'PACKAGE',
			qty: qty([{ label: '기본 구성', price: 4800000 }, { label: '홈페이지 포함 구성', price: 7800000 }]),
			opts: [{ name: '범위', list: [{ label: 'CI + 인쇄물 (기본)', add: 0 }, { label: 'CI + 인쇄물 + SNS 템플릿', add: 680000 }] }, { name: '일정', list: [{ label: '일반 (6~8주)', add: 0 }, { label: '단축 (4~5주)', add: 880000 }] }],
			spec: { '구성': 'CI · 브랜드 가이드 · 인쇄물 · 디지털', '산출물': '로고 원본 + 가이드북', '제작기간': '6~8주', '포함': '시안 무제한 수정' },
			include: ['CI · 로고 디자인 (3안 제안)', '브랜드 가이드북 제작', '프리미엄 패키지 전체 구성', 'SNS · 카드뉴스 템플릿 10종']
		}
	];

	/* 주문 유형 부여 : order(바로 주문) / quote(견적 문의) */
	(function () {
		for (var i = 0; i < PRODUCTS.length; i++) {
			PRODUCTS[i].type = (QUOTE_IDS.indexOf(PRODUCTS[i].id) >= 0) ? 'quote' : 'order';
		}
	})();

	/* ----------------------------------------------------
	 * 유틸
	---------------------------------------------------- */
	function won(n) { return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
	/* 견적 문의형 상품 여부 */
	function isQuote(p) { return !!p && p.type === 'quote'; }
	/* 제작 기간 — '4~5일' → '4~5영업일' */
	function leadTime(p) {
		var v = (p && p.spec && (p.spec['제작기간'] || p.spec['제작 기간'])) || '';
		return v.replace(/(\d)일/g, '$1영업일');
	}
	/* 인쇄 방식 (소재형 상품은 소재로 대체) */
	function printWay(p) {
		if (!p || !p.spec) return '';
		return p.spec['인쇄'] || p.spec['소재'] || p.spec['형태'] || p.spec['구성'] || '';
	}
	/* 제작 기간 중 기간 표기만 추출 — '시안 확인 후 3~4영업일' → '3~4영업일' */
	function leadShort(p) {
		var v = leadTime(p);
		var m = /(\d+(?:\s*~\s*\d+)?)\s*(영업일|주)/.exec(v);
		return m ? m[1].replace(/\s+/g, '') + m[2] : v;
	}
	/* 카드 · 상세 공통 요약 : "500매 기준 · 제작 3~4영업일" */
	function briefInfo(p) {
		var l = leadShort(p);
		return p.qty[0].label + ' 기준' + (l ? ' · 제작 ' + l : '');
	}
	/* 배송비 */
	function shipFee(total) { return (total >= SHIP_FREE_OVER || total <= 0) ? 0 : SHIP_FEE; }
	/* 상품명 · 카테고리 · 진료과 검색 */
	function deptNames(p) {
		var out = [];
		for (var i = 0; i < DEPTS.length; i++) if (p.depts.indexOf(DEPTS[i].id) >= 0) out.push(DEPTS[i].name);
		return out;
	}
	function searchList(q, list) {
		list = list || PRODUCTS;
		q = (q || '').trim().toLowerCase();
		if (!q) return list.slice(0);
		var out = [];
		for (var i = 0; i < list.length; i++) {
			var p = list[i];
			var hay = (p.name + ' ' + p.desc + ' ' + catName(p.cat) + ' ' + deptNames(p).join(' ')).toLowerCase();
			if (hay.indexOf(q) >= 0) out.push(p);
		}
		return out;
	}
	function catName(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name; return ''; }
	function getParam(k) {
		var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(w.location.search);
		return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
	}
	function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
	function imgPath(p) { return BASE + 'images/portfolio/' + p.img; }
	function detailUrl(p) { return BASE + 'kr/shop/detail.html?id=' + p.id; }
	function minPrice(p) {
		var m = p.qty[0].price;
		for (var i = 1; i < p.qty.length; i++) if (p.qty[i].price < m) m = p.qty[i].price;
		return m;
	}

	/* ----------------------------------------------------
	 * 장바구니 (localStorage)
	---------------------------------------------------- */
	function readJSON(key) {
		try { return JSON.parse(w.localStorage.getItem(key)) || []; } catch (e) { return []; }
	}
	function writeJSON(key, v) {
		try { w.localStorage.setItem(key, JSON.stringify(v)); } catch (e) { }
	}
	function getCart() { return readJSON(CART_KEY); }
	function setCart(c) { writeJSON(CART_KEY, c); paintCount(); }

	function addCart(item) {
		var cart = getCart(), i;
		for (i = 0; i < cart.length; i++) {
			if (cart[i].id === item.id && cart[i].optKey === item.optKey) {
				cart[i].count += item.count;
				setCart(cart);
				return cart;
			}
		}
		cart.push(item);
		setCart(cart);
		return cart;
	}
	function cartCount() {
		var c = getCart(), n = 0;
		for (var i = 0; i < c.length; i++) n += c[i].count;
		return n;
	}
	function paintCount() {
		var els = d.querySelectorAll('.cart-count');
		var n = cartCount();
		for (var i = 0; i < els.length; i++) {
			els[i].textContent = n > 99 ? '99+' : n;
			els[i].className = 'cart-count' + (n > 0 ? ' on' : '');
		}
	}

	/* 토스트 */
	var toastEl = null, toastTimer = null;
	function toast(msg, linkTxt, linkHref) {
		if (!toastEl) {
			toastEl = d.createElement('div');
			toastEl.className = 'shop-toast';
			d.body.appendChild(toastEl);
		}
		toastEl.innerHTML = '<i class="xi-check-circle"></i><p>' + msg +
			(linkTxt ? '<a href="' + linkHref + '">' + linkTxt + '</a>' : '') + '</p>';
		/* reflow */
		void toastEl.offsetWidth;
		toastEl.className = 'shop-toast on';
		clearTimeout(toastTimer);
		toastTimer = setTimeout(function () { toastEl.className = 'shop-toast'; }, 3200);
	}

	/* 기본 옵션(첫 항목)으로 바로 담기 */
	function quickAdd(p) {
		var optTxt = [], optKey = [], optIdx = [], add = 0;
		if (p.opts) {
			for (var i = 0; i < p.opts.length; i++) {
				var o = p.opts[i].list[0];
				optTxt.push(p.opts[i].name + ' : ' + o.label);
				optKey.push(o.label);
				optIdx.push(0);
				add += o.add;
			}
		}
		addCart({
			id: p.id, name: p.name, cat: p.cat, img: p.img, type: p.type,
			qtyLabel: p.qty[0].label, unit: p.qty[0].price,
			optTxt: optTxt.join(' / '), optKey: optKey.join('|'), optAdd: add,
			qtyIdx: 0, optIdx: optIdx,
			count: 1
		});
		toast('<b>' + p.name + '</b> 을(를) 장바구니에 담았습니다.', '장바구니 보기', BASE + 'kr/shop/cart.html');
	}

	/* ----------------------------------------------------
	 * 주문 내역 (재주문용) — 데모 시드 + 실제 주문 기록
	---------------------------------------------------- */
	function seedOrders() {
		return [
			{ no: 'MD-260805-0187', date: '2026.08.05', id: 'pm02', name: '3단 리플렛', qtyLabel: '1,000부', opt: '스노우지 200g / 무광 코팅 / 부분 수정', count: 1, price: 198000, state: '시안 확인', step: 2, qtyIdx: 1, optIdx: [0, 0, 0] },
			{ no: 'MD-260728-0161', date: '2026.07.28', id: 'fm03', name: '진료기록지', qtyLabel: '3,000매', opt: '모조지 80g / 양면 인쇄 / 텍스트만 수정', count: 1, price: 142000, state: '인쇄 진행', step: 4, qtyIdx: 1, optIdx: [0, 0, 0] },
			{ no: 'MD-260731-0142', date: '2026.07.31', id: 'pr01', name: '진료카드', qtyLabel: '500매', opt: '스노우지 200g / 양면 인쇄 / 무광 코팅', count: 1, price: 39000, state: '제작완료', step: 5, qtyIdx: 0, optIdx: [0, 0, 0, 0] },
			{ no: 'MD-260714-0098', date: '2026.07.14', id: 'cd01', name: '원장 명함', qtyLabel: '1,000매', opt: '랑데뷰 240g / 양면 인쇄 / 박 (금·은)', count: 1, price: 166000, state: '제작완료', step: 5, qtyIdx: 2, optIdx: [0, 0, 1, 0] },
			{ no: 'MD-260620-0071', date: '2026.06.20', id: 'fm01', name: '초진 문진표', qtyLabel: '3,000매', opt: '모조지 80g / 1도 (흑백)', count: 1, price: 148000, state: '제작완료', step: 5, qtyIdx: 1, optIdx: [0, 0, 0] },
			{ no: 'MD-260602-0033', date: '2026.06.02', id: 'cd03', name: '소봉투 (서양 봉투)', qtyLabel: '3,000매', opt: '모조지 100g / 1도', count: 1, price: 208000, state: '제작완료', step: 5, qtyIdx: 1, optIdx: [0, 0] },
			{ no: 'MD-260518-0016', date: '2026.05.18', id: 'cd05', name: '약봉투', qtyLabel: '5,000매', opt: '모조지 80g / 1도', count: 1, price: 198000, state: '제작완료', step: 5, qtyIdx: 1, optIdx: [0, 0] }
		];
	}
	function getOrders() {
		var o = readJSON(ORDER_KEY);
		if (!o || !o.length) { o = seedOrders(); writeJSON(ORDER_KEY, o); }
		return o;
	}
	function addOrder(list) {
		var o = getOrders(), now = new Date();
		var ds = now.getFullYear() + '.' + ('0' + (now.getMonth() + 1)).slice(-2) + '.' + ('0' + now.getDate()).slice(-2);
		var no = 'MD-' + String(now.getFullYear()).slice(2) + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2) + '-' + ('000' + Math.floor(Math.random() * 9999)).slice(-4);
		for (var i = 0; i < list.length; i++) {
			o.unshift({
				no: no, date: ds, id: list[i].id, name: list[i].name, qtyLabel: list[i].qtyLabel,
				opt: list[i].optTxt, count: list[i].count, price: (list[i].unit + list[i].optAdd) * list[i].count,
				state: FLOW[0], step: 0,
				qtyIdx: (typeof list[i].qtyIdx === 'number') ? list[i].qtyIdx : 0,
				optIdx: list[i].optIdx || []
			});
		}
		writeJSON(ORDER_KEY, o);
	}

	/* 견적 문의 내역 (맞춤 제작) */
	function seedQuotes() {
		return [
			{ no: 'MQ-260722-0044', date: '2026.07.22', id: 'pm01', name: '병원 소개 브로슈어', memo: '12p / 500부 / 브랜드 컨셉 제안 포함', state: '견적 검토 중' },
			{ no: 'MQ-260610-0021', date: '2026.06.10', id: 'pk02', name: '개원 프리미엄 패키지', memo: '사인물 확장 구성 / 4~6주 일정', state: '견적 발송 완료' }
		];
	}
	function getQuotes() {
		var q = readJSON(QUOTE_KEY);
		if (!q || !q.length) { q = seedQuotes(); writeJSON(QUOTE_KEY, q); }
		return q;
	}

	/* 재주문 ① 동일하게 재주문 : 이전 조건 그대로 장바구니에 담기 */
	function reorder(order) {
		var p = byId(order.id);
		addCart({
			id: order.id, name: order.name, cat: p ? p.cat : 'print', img: p ? p.img : 'p05.jpg',
			qtyLabel: order.qtyLabel, unit: Math.round(order.price / (order.count || 1)),
			optTxt: order.opt, optKey: order.opt, optAdd: 0, count: order.count || 1,
			qtyIdx: order.qtyIdx, optIdx: order.optIdx
		});
		toast('<b>' + order.name + ' ' + order.qtyLabel + '</b> 을(를) 이전 주문과 동일한 조건으로 담았습니다.', '장바구니 보기', BASE + 'kr/shop/cart.html');
	}
	/* 재주문 ② 내용 수정 후 재주문 : 이전 조건을 그대로 불러온 상세 페이지로 이동 */
	function reorderEditUrl(order) {
		var q = 'id=' + order.id + '&re=1';
		if (typeof order.qtyIdx === 'number') q += '&qi=' + order.qtyIdx;
		if (order.optIdx && order.optIdx.length) q += '&oi=' + order.optIdx.join('-');
		if (order.count) q += '&cn=' + order.count;
		return BASE + 'kr/shop/detail.html?' + q;
	}

	/* ----------------------------------------------------
	 * 상품 카드 렌더링
	---------------------------------------------------- */
	function cardHTML(p) {
		var badge = p.badge ? '<span class="shop-badge' + (p.badge === 'BEST' ? ' mint' : '') + ' font-outfit">' + p.badge + '</span>' : '';
		var quote = isQuote(p);
		/* 견적 상품은 담기 아이콘 대신 상세로 유도한다 */
		var icon = quote ? '' :
			'<button type="button" class="shop-cart-icon js-quick-add" title="장바구니에 담기"><i class="xi-cart-o"></i></button>';
		var price = quote
			? '<strong class="shop-price is-quote"><span class="from">맞춤 제작</span>견적 문의</strong>'
			: '<strong class="shop-price font-outfit"><span class="from">' + p.qty[0].label + ' 기준</span>' + won(minPrice(p)) + '<span class="won">원~</span></strong>';
		return '' +
			'<li class="shop-item" data-scroll="fade-up" data-id="' + p.id + '" data-cat="' + p.cat + '" data-type="' + p.type + '" data-depts="' + p.depts.join(' ') + '">' +
				'<div class="shop-thumb">' + badge +
					'<a href="' + detailUrl(p) + '"><img src="' + imgPath(p) + '" alt="' + p.name + '" loading="lazy"></a>' + icon +
				'</div>' +
				'<div class="shop-meta">' +
					'<h3 class="shop-tit"><a href="' + detailUrl(p) + '">' + p.name + '</a></h3>' +
					'<p class="shop-txt">' + p.desc + '</p>' +
					'<div class="shop-price-row">' + price +
						'<a href="' + detailUrl(p) + '" class="shop-detail-btn">' + (quote ? '견적 문의' : '상세보기') + ' <i class="xi-angle-right-min"></i></a>' +
					'</div>' +
				'</div>' +
			'</li>';
	}

	/* JS로 그린 카드에도 기존 사이트의 스크롤 등장 모션을 그대로 적용한다.
	   ([data-scroll]은 .animated 가 붙기 전까지 opacity:0 이므로 반드시 필요) */
	function initReveal(el) {
		var items = el.querySelectorAll('[data-scroll]'), i;
		var $ = w.jQuery;
		if ($ && $.fn && $.fn.waypoint) {
			$(el).find('[data-scroll]').each(function () {
				var $e = $(this);
				$e.waypoint(function (direction) {
					if (direction === 'down') $e.addClass('animated');
				}, { triggerOnce: true, offset: '92%' });
			});
		}
		/* 이미 화면 안에 들어와 있는 카드는 즉시 노출 */
		for (i = 0; i < items.length; i++) {
			if (items[i].getBoundingClientRect().top < w.innerHeight * 0.95) items[i].className += ' animated';
		}
		/* waypoint 미탑재 시 안전장치 */
		if (!($ && $.fn && $.fn.waypoint)) {
			setTimeout(function () {
				for (var k = 0; k < items.length; k++) items[k].className += ' animated';
			}, 200);
		}
	}

	function renderGrid(el, list) {
		if (!el) return;
		if (!list.length) {
			el.innerHTML = '<li class="shop-empty"><i class="xi-search"></i><p>선택하신 조건에 맞는 상품이 없습니다.</p></li>';
			return;
		}
		var h = '';
		for (var i = 0; i < list.length; i++) h += cardHTML(list[i]);
		el.innerHTML = h;
		initReveal(el);
	}

	function filterList(cat, dept) {
		var out = [];
		for (var i = 0; i < PRODUCTS.length; i++) {
			var p = PRODUCTS[i];
			if (cat === 'reorder') { if (!p.reorder) continue; }
			else if (cat && cat !== 'all' && p.cat !== cat) continue;
			if (dept && dept !== 'all' && p.depts.indexOf(dept) < 0) continue;
			out.push(p);
		}
		/* 진료과를 고르면 해당 진료과 전용 상품을 앞으로 (공통 상품은 뒤로) */
		if (dept && dept !== 'all') {
			var focus = [], common = [];
			for (var k = 0; k < out.length; k++) {
				(out[k].depts.length < ALL_DEPT.length ? focus : common).push(out[k]);
			}
			out = focus.concat(common);
		}
		return out;
	}

	/* 위임 이벤트 : 빠른 담기 */
	d.addEventListener('click', function (e) {
		var btn = e.target.closest ? e.target.closest('.js-quick-add') : null;
		if (!btn) return;
		e.preventDefault();
		var li = btn.closest('.shop-item');
		var p = byId(li.getAttribute('data-id'));
		if (!p) return;
		quickAdd(p);
		btn.className = 'shop-cart-icon js-quick-add done';
		setTimeout(function () { btn.className = 'shop-cart-icon js-quick-add'; }, 1400);
	});

	/* ----------------------------------------------------
	 * 공개 API
	---------------------------------------------------- */
	w.MTShop = {
		BASE: BASE, CATS: CATS, DEPTS: DEPTS, PRODUCTS: PRODUCTS, FLOW: FLOW,
		SHIP_FEE: SHIP_FEE, SHIP_FREE_OVER: SHIP_FREE_OVER,
		won: won, catName: catName, getParam: getParam, byId: byId,
		imgPath: imgPath, detailUrl: detailUrl, minPrice: minPrice,
		isQuote: isQuote, leadTime: leadTime, printWay: printWay, briefInfo: briefInfo,
		shipFee: shipFee, deptNames: deptNames, searchList: searchList,
		cardHTML: cardHTML, renderGrid: renderGrid, filterList: filterList,
		getCart: getCart, setCart: setCart, addCart: addCart, cartCount: cartCount,
		paintCount: paintCount, toast: toast, quickAdd: quickAdd,
		getOrders: getOrders, addOrder: addOrder, getQuotes: getQuotes,
		reorder: reorder, reorderEditUrl: reorderEditUrl,
		clearCart: function () { setCart([]); }
	};

	if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', paintCount);
	else paintCount();

})(window, document);


/* ==========================================================================
 * 메인 CATEGORY : 원형(오빗) 인터랙션
 * 기존 .main-cat-grid 를 콘텐츠 원본으로 삼아 데스크탑 전용 원형 UI 를 만든다.
 * - HTML 은 건드리지 않는다 (마크업 단일 출처 유지)
 * - 900px 이하는 CSS 가 원형 UI 를 감추고 기존 카드 그리드를 그대로 보여준다
 * - 화면에 들어오면 3초 간격으로 01 -> 06 자동 순환, 마지막 다음은 다시 01
 * - 노드에 hover/focus 하면 순환을 멈추고 그 항목을 활성화, 벗어나면 다시 순환
 * - 스크롤 핸들러를 쓰지 않아 스크롤 성능에 영향이 없다
 * ========================================================================== */
(function (w, d) {
	'use strict';

	function init() {
		var root = d.querySelector('.main-shop-cat');
		if (!root) return;
		var grid = root.querySelector('.main-cat-grid');
		if (!grid) return;

		var src = grid.querySelectorAll('li > a');
		var MAX = 6;                                  /* 원 위에 배치해 둔 노드 좌표 수 */
		var total = Math.min(src.length, MAX);
		if (total < 2) return;

		function pick(el, sel) { var t = el.querySelector(sel); return t ? t.textContent.replace(/\s+/g, ' ').trim() : ''; }
		function make(tag, cls) { var e = d.createElement(tag); if (cls) e.className = cls; return e; }

		/* 트랙과 호를 같은 좌표계(viewBox 200)로 그려 두 선이 정확히 겹치게 한다.
		 * r 95.5 / stroke 5  ->  지름 대비 2.5% 두께의 굵은 원형 */
		var NS = 'http://www.w3.org/2000/svg';
		var R = 95.5, SW = 5;
		function svgRoot() {
			var s = d.createElementNS(NS, 'svg');
			s.setAttribute('viewBox', '0 0 200 200');
			s.setAttribute('aria-hidden', 'true');
			s.setAttribute('focusable', 'false');
			return s;
		}
		function ringCircle(stroke, dash, rotate) {
			var c = d.createElementNS(NS, 'circle');
			c.setAttribute('cx', '100'); c.setAttribute('cy', '100'); c.setAttribute('r', String(R));
			c.setAttribute('fill', 'none');
			c.setAttribute('stroke', stroke);
			c.setAttribute('stroke-width', String(SW));
			if (dash) { c.setAttribute('stroke-dasharray', dash); c.setAttribute('stroke-linecap', 'round'); }
			if (rotate) c.setAttribute('transform', 'rotate(' + rotate + ' 100 100)');
			return c;
		}

		/* ---------- 조립 ---------- */
		var orbit = make('div', 'cat-orbit');
		var stage = make('div', 'cat-orbit-stage');
		var plane = make('div', 'cat-orbit-plane');
		var ring  = make('div', 'cat-orbit-ring');
		var spin  = make('div', 'cat-orbit-spin');
		var nodes = make('ul', 'cat-orbit-nodes');
		var core  = make('div', 'cat-orbit-core');
		var slot  = make('div', 'core-slot');
		var nodeEls = [], btnEls = [], panelEls = [], i;

		/* 굵은 그레이 트랙 */
		var ringSvg = svgRoot();
		ringSvg.appendChild(ringCircle('#D3DCDF', '', ''));
		ring.appendChild(ringSvg);

		/* 활성 노드를 가리키는 민트 호 : 12시에서 끝나도록 -138도 회전 (48도 길이) */
		var CIRC = 2 * Math.PI * R;                    /* 600.0 */
		var ARC  = CIRC * 48 / 360;                    /* 80.0  */
		var arcSvg = svgRoot();
		var grad = d.createElementNS(NS, 'linearGradient');
		grad.setAttribute('id', 'catOrbitArc');
		grad.setAttribute('x1', '0'); grad.setAttribute('y1', '1');
		grad.setAttribute('x2', '1'); grad.setAttribute('y2', '0');
		var st1 = d.createElementNS(NS, 'stop');
		st1.setAttribute('offset', '0%'); st1.setAttribute('stop-color', '#64D3CE'); st1.setAttribute('stop-opacity', '.15');
		var st2 = d.createElementNS(NS, 'stop');
		st2.setAttribute('offset', '100%'); st2.setAttribute('stop-color', '#64D3CE'); st2.setAttribute('stop-opacity', '1');
		grad.appendChild(st1); grad.appendChild(st2);
		var defs = d.createElementNS(NS, 'defs');
		defs.appendChild(grad);
		arcSvg.appendChild(defs);
		arcSvg.appendChild(ringCircle('url(#catOrbitArc)', ARC.toFixed(1) + ' ' + (CIRC - ARC).toFixed(1), '-138'));
		spin.appendChild(arcSvg);
		spin.appendChild(make('span', 'dot'));

		nodes.setAttribute('role', 'tablist');
		nodes.setAttribute('aria-label', '상품 카테고리');

		for (i = 0; i < total; i++) {
			var a   = src[i];
			var num = pick(a, '.num') || (i < 9 ? '0' + (i + 1) : String(i + 1));
			var tit = pick(a, '.tit');
			var des = pick(a, '.txt');
			var uid = 'catOrbitPanel' + (i + 1);

			/* 원 위의 노드 */
			var li  = make('li', 'cat-node n' + (i + 1));
			var btn = make('button', 'node-btn');
			btn.type = 'button';
			btn.setAttribute('role', 'tab');
			btn.setAttribute('aria-controls', uid);
			var mark = make('span', 'node-mark'); mark.textContent = num;
			var ntit = make('span', 'node-tit');  ntit.textContent = tit;
			btn.appendChild(mark); btn.appendChild(ntit);
			li.appendChild(btn); nodes.appendChild(li);
			nodeEls.push(li); btnEls.push(btn);

			/* 중앙 : 활성 카테고리 상세 */
			var panel = make('div', 'core-item');
			panel.id = uid;
			panel.setAttribute('role', 'tabpanel');
			var pn = make('span', 'core-num'); pn.textContent = num;
			var pt = make('strong', 'core-tit'); pt.textContent = tit;
			panel.appendChild(pn); panel.appendChild(pt);
			if (des) { var px = make('span', 'core-txt'); px.textContent = des; panel.appendChild(px); }
			/* 상품 수 · 최저가 : .main-cat-grid 의 .meta 를 그대로 복제해 콘텐츠 출처를 하나로 유지한다 */
			var srcMeta = a.querySelector('.meta');
			if (srcMeta) { var pm = srcMeta.cloneNode(true); pm.className = 'core-meta'; panel.appendChild(pm); }
			var goBtn = make('a', 'core-go');
			goBtn.href = a.getAttribute('href') || '#';
			goBtn.appendChild(d.createTextNode('상품 보기 '));
			goBtn.appendChild(make('i', 'xi-angle-right-min'));
			panel.appendChild(goBtn);
			slot.appendChild(panel); panelEls.push(panel);
		}

		core.appendChild(slot);
		plane.appendChild(ring);
		plane.appendChild(spin);
		plane.appendChild(core);
		stage.appendChild(plane);
		orbit.appendChild(stage);
		/* 노드는 stage(원 아래를 잘라내는 상자) 밖에 둬야 좌우 라벨이 잘리지 않는다 */
		orbit.appendChild(nodes);
		grid.parentNode.insertBefore(orbit, grid);

		/* ---------- 전환 ---------- */
		var cur = -1;
		function go(idx) {
			if (idx < 0) idx = 0;
			if (idx > total - 1) idx = total - 1;
			if (idx === cur) return;
			cur = idx;
			for (var k = 0; k < total; k++) {
				var on = (k === idx);
				nodeEls[k].className = 'cat-node n' + (k + 1) + (on ? ' on' : '');
				btnEls[k].setAttribute('aria-selected', on ? 'true' : 'false');
				btnEls[k].tabIndex = on ? 0 : -1;
				panelEls[k].className = 'core-item' + (on ? ' on' : '');
				if (on) panelEls[k].removeAttribute('aria-hidden');
				else panelEls[k].setAttribute('aria-hidden', 'true');
			}
			orbit.className = 'cat-orbit on' + (idx + 1);
		}
		go(0);

		/* ---------- 3초 자동 순환 ---------- */
		var TICK = 3000;
		var timer = null, inView = false, held = false;

		function next() { go((cur + 1) % total); }
		function start() {
			if (timer || !inView || held || w.innerWidth < 901) return;
			timer = w.setInterval(next, TICK);
		}
		function stop() {
			if (!timer) return;
			w.clearInterval(timer);
			timer = null;
		}
		function restart() { stop(); start(); }

		/* 노드에 마우스를 올리면 순환을 멈추고 그 항목을 활성화한다 */
		function idxOf(el) {
			var t = el;
			while (t && t !== nodes) {
				if (t.nodeType === 1 && (' ' + t.className + ' ').indexOf(' cat-node ') > -1) {
					for (var k = 0; k < total; k++) if (nodeEls[k] === t) return k;
					return -1;
				}
				t = t.parentNode;
			}
			return -1;
		}
		function hold(e) {
			var k = idxOf(e.target);
			if (k < 0) return;
			held = true; stop(); go(k);
		}
		function release() { held = false; start(); }

		nodes.addEventListener('mouseover', hold);
		nodes.addEventListener('mouseout', function (e) {
			if (e.relatedTarget && nodes.contains(e.relatedTarget)) return;
			release();
		});
		nodes.addEventListener('focusin', hold);
		nodes.addEventListener('focusout', function (e) {
			if (e.relatedTarget && nodes.contains(e.relatedTarget)) return;
			release();
		});
		nodes.addEventListener('click', function (e) {
			var k = idxOf(e.target);
			if (k > -1) { go(k); restart(); }
		});

		/* 좌우 방향키로도 이동 (tablist 기본 동작) */
		nodes.addEventListener('keydown', function (e) {
			var step = (e.keyCode === 39) ? 1 : (e.keyCode === 37 ? -1 : 0);
			if (!step) return;
			e.preventDefault();
			var n = (cur + step + total) % total;
			go(n);
			btnEls[n].focus();
		});

		/* 화면에 들어와 있을 때만 돈다 */
		if (w.IntersectionObserver) {
			new w.IntersectionObserver(function (entries) {
				inView = entries[0].isIntersecting;
				if (inView) start(); else stop();
			}, { threshold: 0.4 }).observe(orbit);
		} else {
			inView = true; start();
		}
		w.addEventListener('resize', function () {
			if (w.innerWidth < 901) stop(); else start();
		});
	}

	if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
	else init();

})(window, document);


/* ==========================================================================
 * FAQ 아코디언 (공통)
 * .faq-list > .faq-item > (button.faq-q + .faq-a) 구조면 어느 페이지에서든 동작한다.
 * - 높이를 px 로 지정해 부드럽게 열고, 다 열린 뒤에는 auto 로 되돌려 리사이즈에 대응
 * - 한 번에 하나만 열리게 (같은 목록 안에서)
 * - 모션 최소화 설정이면 애니메이션 없이 즉시 열고 닫는다
 * ========================================================================== */
(function (w, d) {
	'use strict';

	var REDUCE = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function panel(item) { return item.querySelector('.faq-a'); }

	function close(item) {
		var a = panel(item);
		if (!a || !item.classList.contains('on')) return;
		if (REDUCE) { a.style.height = '0px'; }
		else {
			a.style.height = a.scrollHeight + 'px';
			a.offsetHeight;                       /* 강제 리플로우 : auto -> px 전환을 잡아준다 */
			a.style.height = '0px';
		}
		item.classList.remove('on');
		item.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
	}

	function open(item) {
		var a = panel(item);
		if (!a || item.classList.contains('on')) return;
		a.style.height = REDUCE ? 'auto' : (a.scrollHeight + 'px');
		item.classList.add('on');
		item.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
	}

	function init() {
		var lists = d.querySelectorAll('.faq-list');
		if (!lists.length) return;

		for (var i = 0; i < lists.length; i++) {
			(function (list) {
				var items = list.querySelectorAll('.faq-item');
				for (var k = 0; k < items.length; k++) {
					var btn = items[k].querySelector('.faq-q');
					if (!btn) continue;
					btn.setAttribute('aria-expanded', 'false');
				}

				list.addEventListener('click', function (e) {
					var btn = e.target.closest ? e.target.closest('.faq-q') : null;
					if (!btn || !list.contains(btn)) return;
					var item = btn.parentNode;
					var wasOpen = item.classList.contains('on');
					/* 같은 목록 안에서는 하나만 열어 둔다 */
					var open_ = list.querySelectorAll('.faq-item.on');
					for (var j = 0; j < open_.length; j++) close(open_[j]);
					if (!wasOpen) open(item);
				});

				/* 다 열린 뒤 height:auto — 답변이 길거나 창 크기가 바뀌어도 잘리지 않게 */
				list.addEventListener('transitionend', function (e) {
					if (e.propertyName !== 'height') return;
					var a = e.target;
					if (!a.classList.contains('faq-a')) return;
					if (a.parentNode.classList.contains('on')) a.style.height = 'auto';
				});
			})(lists[i]);
		}
	}

	if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
	else init();

})(window, document);

/* ==========================================================================
 * 칼럼 게시판 (공통)
 * - 목록(list.html) : 좌측 카테고리로 카드 필터. 주소에 ?cat= 를 남겨 뒤로가기까지 맞춘다.
 * - 상세(view.html) : ?no= 에 해당하는 글 하나만 노출하고 이전 / 다음 링크를 만든다.
 * 해당 마크업이 없는 페이지에서는 아무 일도 하지 않는다.
 * ========================================================================== */
(function (w, d) {
	'use strict';

	function param(k) {
		var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(w.location.search);
		return m ? decodeURIComponent(m[1]) : '';
	}

	/* ---------------- 목록 : 카테고리 필터 ---------------- */
	function initList() {
		var main = d.querySelector('.col-main');
		var grid = d.querySelector('.col-grid');
		var btns = d.querySelectorAll('.col-cate-btn');
		if (!main || !grid || !btns.length) return;

		var cards = grid.querySelectorAll('.col-card');

		function apply(cat, push) {
			var shown = 0;
			for (var i = 0; i < cards.length; i++) {
				var hit = (cat === 'all' || cards[i].getAttribute('data-cat') === cat);
				cards[i].classList.toggle('is-hide', !hit);
				if (hit) shown++;
			}
			main.classList.toggle('is-empty', shown === 0);
			for (var k = 0; k < btns.length; k++) {
				btns[k].classList.toggle('on', btns[k].getAttribute('data-cat') === cat);
			}
			if (push && w.history && w.history.replaceState) {
				var q = (cat === 'all') ? w.location.pathname : (w.location.pathname + '?cat=' + cat);
				w.history.replaceState(null, '', q);
			}
		}

		for (var i = 0; i < btns.length; i++) {
			btns[i].addEventListener('click', function () {
				apply(this.getAttribute('data-cat') || 'all', true);
			});
		}

		apply(param('cat') || 'all', false);
	}

	/* ---------------- 상세 : ?no= 로 한 편만 노출 ---------------- */
	function initView() {
		var docs = d.querySelectorAll('.col-doc');
		if (!docs.length) return;

		var want = param('no') || docs[0].getAttribute('data-no');
		var cur = null;
		for (var i = 0; i < docs.length; i++) {
			var on = (docs[i].getAttribute('data-no') === want);
			docs[i].classList.toggle('on', on);
			if (on) cur = docs[i];
		}
		/* 잘못된 번호로 들어오면 첫 글을 보여 준다 */
		if (!cur) { cur = docs[0]; cur.classList.add('on'); }

		function titleOf(no) {
			for (var k = 0; k < docs.length; k++) {
				if (docs[k].getAttribute('data-no') === no) {
					var t = docs[k].querySelector('.col-doc-tit');
					return t ? t.textContent : '';
				}
			}
			return '';
		}

		var pairs = [['.col-nav-prev', 'data-prev'], ['.col-nav-next', 'data-next']];
		for (var j = 0; j < pairs.length; j++) {
			var btn = d.querySelector(pairs[j][0]);
			if (!btn) continue;
			var no = cur.getAttribute(pairs[j][1]);
			var label = no ? titleOf(no) : '';
			if (!no || !label) {
				btn.classList.add('is-off');
				btn.setAttribute('href', 'javascript:;');
				continue;
			}
			btn.classList.remove('is-off');
			btn.setAttribute('href', 'view.html?no=' + no);
			var span = btn.querySelector('span');
			if (span) span.textContent = label;
		}

		/* 브라우저 탭 제목도 글 제목으로 맞춘다 */
		var tit = cur.querySelector('.col-doc-tit');
		if (tit) d.title = tit.textContent + ' | MEDITIVE 병원 전문 디자인 스튜디오';
	}

	function initColumn() { initList(); initView(); }

	if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', initColumn);
	else initColumn();
})(window, document);

/* ==========================================================================
 * 진행 안내 타임라인 (공통)
 * .shop-flow > (.shop-flow-line > .shop-flow-fill) + .shop-flow-list > li.shop-flow-step
 * - 화면에 들어오면 왼쪽부터 한 단계씩 불이 켜지고, 켜진 지점까지 라인이 채워진다.
 * - 한 번만 재생하고 관찰을 끊는다.
 * - 모션 최소화 설정이면 전부 켜진 상태로 즉시 보여 준다.
 * 해당 마크업이 없는 페이지에서는 아무 일도 하지 않는다.
 * ========================================================================== */
(function (w, d) {
	'use strict';

	var REDUCE = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var GAP = 300;                                    /* 단계 사이 간격 (ms) */

	/* 마지막으로 켜진 점까지만 채운다 (뒤쪽은 남겨 두어 "진행 중" 으로 읽히게) */
	function fillTo(i, total) { return ((i / total) * 100 + 1) + '%'; }

	function run(flow) {
		if (flow.__lit) return;
		flow.__lit = true;

		var steps = flow.querySelectorAll('.shop-flow-step');
		var fill = flow.querySelector('.shop-flow-fill');
		var total = steps.length, i;
		if (!total) return;

		if (REDUCE) {
			for (i = 0; i < total; i++) steps[i].classList.add('on');
			if (fill) fill.style.width = fillTo(total - 1, total);
			return;
		}

		for (i = 0; i < total; i++) {
			(function (k) {
				w.setTimeout(function () {
					steps[k].classList.add('on');
					if (fill) fill.style.width = fillTo(k, total);
				}, k * GAP);
			})(i);
		}
	}

	function init() {
		var flows = d.querySelectorAll('.shop-flow'), i;
		if (!flows.length) return;

		if (!w.IntersectionObserver) {
			for (i = 0; i < flows.length; i++) run(flows[i]);
			return;
		}

		var io = new w.IntersectionObserver(function (entries) {
			for (var j = 0; j < entries.length; j++) {
				if (!entries[j].isIntersecting) continue;
				run(entries[j].target);
				io.unobserve(entries[j].target);
			}
		}, { threshold: 0.35 });

		for (i = 0; i < flows.length; i++) io.observe(flows[i]);
	}

	if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
	else init();

})(window, document);
