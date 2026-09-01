/* ========================================================
 * MEDITIVE Admin — 편집 항목 정의서
 *
 * 편집할 수 있는 항목 하나하나에 운영자가 알아볼 수 있는
 * 한글 이름과 입력 형태를 붙이고, 카테고리로 묶는다.
 * 표시 문구가 아니라 고유 Key 로만 연결하므로
 * 문구를 아무리 바꿔도 연결이 끊어지지 않는다.
 *
 * kind   : text  = 텍스트 관리에 나온다 / image = 이미지 관리에 나온다
 * type
 *   line  : 한 줄 입력      (제목 · 라벨)
 *   text  : 여러 줄 입력    (Enter = 줄바꿈, **강조** = 굵게)
 *   url   : 링크 주소
 *   image : 이미지 교체
 *   file  : 파일 자체를 같은 이름으로 덮어쓰기 (서브 배너)
 *
 * 상품몰(js/shop.js)과 포트폴리오 전체(60건)는 항목이 많고
 * 앞으로도 늘어날 수 있으므로 원본 파일을 읽어 자동으로 만든다.
======================================================== */
(function (w) {
	'use strict';

	/* 편집 대상 파일 */
	var PAGES = {
		home: { file: 'home.html', name: '홈', kind: 'html' },
		pf: { file: 'kr/portfolio/all.html', name: '포트폴리오', kind: 'html' },
		shop: { file: 'js/shop.js', name: '상품몰 상품', kind: 'js' },
		shopHome: { file: 'js/shop_home.js', name: '상품몰 홈', kind: 'js2' },
		/* 홈 Service 배경을 갈아 끼웠을 때 브라우저 캐시를 비우기 위해서만 손댄다 */
		css: { file: 'css/main.css', name: '메인 스타일', kind: 'css' }
	};

	/* 상품 이미지가 실제로 놓여 있는 폴더 (shop.js 에는 파일명만 적힌다) */
	var SHOP_IMG_DIR = 'images/portfolio/';

	function f(key, label, type, hint) {
		return { key: key, label: label, type: type || 'line', hint: hint || '' };
	}

	/* 반복 항목을 간단히 찍어내는 도우미 (01 · 02 … 형태) */
	function nn(i) { return (i < 10 ? '0' : '') + i; }
	function items(n, make) {
		var out = [], i;
		for (i = 1; i <= n; i++) out.push(make(i, nn(i)));
		return out;
	}

	/* ----------------------------------------------------
	 * 카테고리(섹션) 목록
	 *   top  : 왼쪽 카테고리 목록에서 묶이는 큰 분류
	 *   kind : text / image
	---------------------------------------------------- */
	var SECTIONS = [];
	function sec(o) {
		o.fields = o.fields || [];
		SECTIONS.push(o);
		return o;
	}

	/* ============ 홈 · 텍스트 ============ */
	sec({
		id: 't-home-hero', top: '홈', name: '메인 비주얼', kind: 'text', page: 'home',
		desc: '첫 화면의 큰 제목과 안내 문구입니다.',
		fields: [
			f('home.hero.title', '큰 제목', 'line', '글자 단위 애니메이션이 걸려 있습니다. 영문 한 단어를 권장합니다.'),
			f('home.hero.tagline', '설명 문구', 'text'),
			f('home.hero.scroll', '스크롤 안내 문구', 'line')
		]
	});

	sec({
		id: 't-home-about', top: '홈', name: 'About Us', kind: 'text', page: 'home',
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
		]
	});

	sec({
		id: 't-home-service', top: '홈', name: 'Service', kind: 'text', page: 'home',
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
		]
	});

	sec({
		id: 't-home-shop', top: '홈', name: '상품몰 소개 영역', kind: 'text', page: 'home',
		desc: '홈에 노출되는 상품몰 3개 영역의 제목과 더보기 링크입니다.',
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
		]
	});

	sec({
		id: 't-home-portfolio', top: '홈', name: '포트폴리오 슬라이드', kind: 'text', page: 'home',
		desc: '홈 포트폴리오 슬라이드 12개의 이름과 링크입니다.',
		fields: [
			f('home.portfolio.eyebrow', '작은 제목', 'line'),
			f('home.portfolio.title', '큰 제목', 'text')
		].concat(items(12, function (i, p) {
			return f('home.portfolio.item' + p + '.title', '슬라이드 ' + i + ' · 이름', 'line');
		})).concat(items(12, function (i, p) {
			return f('home.portfolio.item' + p + '.url', '슬라이드 ' + i + ' · 링크', 'url');
		}))
	});

	sec({
		id: 't-home-journal', top: '홈', name: 'Journal', kind: 'text', page: 'home',
		desc: '홈에 노출되는 칼럼 목록 5개입니다.',
		fields: [
			f('home.journal.eyebrow', '작은 제목', 'line'),
			f('home.journal.title', '큰 제목', 'text')
		].concat((function () {
			var out = [];
			items(5, function (i, p) {
				out.push(f('home.journal.item' + p + '.title', '글 ' + i + ' · 제목', 'line'));
				out.push(f('home.journal.item' + p + '.date', '글 ' + i + ' · 날짜', 'line'));
				out.push(f('home.journal.item' + p + '.url', '글 ' + i + ' · 링크', 'url'));
				return 0;
			});
			return out;
		})())
	});

	sec({
		id: 't-home-faq', top: '홈', name: '자주 묻는 질문', kind: 'text', page: 'home',
		desc: '홈 하단 FAQ 4개입니다.',
		fields: [
			f('home.faq.eyebrow', '작은 제목', 'line'),
			f('home.faq.title', '큰 제목', 'text')
		].concat((function () {
			var out = [];
			items(4, function (i, p) {
				out.push(f('home.faq.item' + p + '.q', '질문 ' + i, 'line'));
				out.push(f('home.faq.item' + p + '.a', '답변 ' + i, 'text'));
				return 0;
			});
			return out;
		})())
	});

	sec({
		id: 't-home-contact', top: '홈', name: 'Contact 배너', kind: 'text', page: 'home',
		desc: '홈 맨 아래 문의 배너입니다.',
		fields: [
			f('home.contact.title', '제목', 'text'),
			f('home.contact.desc', '설명', 'text'),
			f('home.contact.url', '버튼 링크', 'url')
		]
	});

	/* ============ 홈 · 이미지 ============ */
	sec({
		id: 'i-home-hero', top: '홈', name: '메인 비주얼', kind: 'image', page: 'home',
		desc: '첫 화면에서 좌우로 흐르는 이미지 15장입니다.',
		fields: items(15, function (i, p) {
			return f('home.hero.img' + p, '비주얼 ' + i, 'image');
		})
	});

	sec({
		id: 'i-home-portfolio', top: '홈', name: '포트폴리오 슬라이드', kind: 'image', page: 'home',
		desc: '홈 포트폴리오 영역에 도는 이미지 12장입니다.',
		fields: items(12, function (i, p) {
			return f('home.portfolio.item' + p + '.img', '슬라이드 ' + i, 'image');
		})
	});

	/* 홈 Service 3칸 배경 — 스타일시트에서 부르는 배경이라 파일을 같은 이름으로 덮어쓴다 */
	var SERVICE_BG = [
		{ path: 'images/main/main_service_bg01.jpg', label: '1번 칸 · Brochure & Catalog 배경' },
		{ path: 'images/main/main_service_bg02.jpg', label: '2번 칸 · Digital Contents 배경' },
		{ path: 'images/main/main_service_bg03.jpg', label: '3번 칸 · Website 배경' }
	];

	sec({
		id: 'i-home-service', top: '홈', name: 'Service 3칸 배경', kind: 'image', page: '@file',
		desc: '홈 "하나의 방향으로 완성합니다" 영역 3칸에 깔리는 배경 사진입니다. 같은 파일 이름으로 덮어쓰며, 마우스를 올렸을 때 커지는 배경도 같이 바뀝니다. 세로로 긴 사진을 올려 주세요.',
		fields: SERVICE_BG.map(function (b, i) {
			var def = f('file.svcbg' + nn(i + 1), b.label, 'file');
			def.path = b.path;
			def.bump = 'css';   /* 갈아 끼우면 스타일시트의 캐시 번호를 올린다 */
			return def;
		})
	});

	sec({
		id: 'i-home-pkg', top: '홈', name: '개원 준비 패키지', kind: 'image', page: 'home',
		desc: '홈 "개원과 리뉴얼에 필요한 모든 것을" 영역의 카드 사진 2장입니다.',
		fields: [
			(function () { var d = f('home.shopPkg.item01.img', '개원 패키지', 'image'); d.base = SHOP_IMG_DIR; d.bg = true; return d; })(),
			(function () { var d = f('home.shopPkg.item02.img', '리뉴얼 패키지', 'image'); d.base = SHOP_IMG_DIR; d.bg = true; return d; })()
		]
	});

	/* ============ 서브 배너 (파일 통째 교체) ============ */
	var BANNERS = [
		{ path: 'images/banners/sub_visual_service_main.jpg', label: '서비스 페이지 상단 배너' },
		{ path: 'images/banners/sub_visual_portfolio_main.jpg', label: '포트폴리오 페이지 상단 배너' },
		{ path: 'images/banners/sub_visual_column.jpg', label: '칼럼 페이지 상단 배너' },
		{ path: 'images/banners/sub_visual_guide_main.jpg', label: '이용안내 페이지 상단 배너' },
		{ path: 'images/banners/sub_visual_contact_main.jpg', label: '문의 페이지 상단 배너' }
	];

	sec({
		id: 'i-banner', top: '공통', name: '서브 페이지 배너', kind: 'image', page: '@file',
		desc: '각 서브 페이지 맨 위에 깔리는 배경 이미지입니다. 같은 파일 이름으로 덮어쓰므로 가로로 긴 사진을 올려 주세요.',
		fields: BANNERS.map(function (b, i) {
			var def = f('file.banner' + nn(i + 1), b.label, 'file');
			def.path = b.path;
			return def;
		})
	});

	/* ----------------------------------------------------
	 * 원본 파일을 읽어 자동으로 만드는 카테고리
	---------------------------------------------------- */
	var built = { shop: false, pf: false, shopHome: false };

	/* ===== 상품몰 홈 : js/shop_home.js 의 배너 · 무료 템플릿 ===== */
	var POOL_NAME = {
		card: '명함 · 진료카드', env: '봉투', holder: '차트홀더', form: '문진표 · 서식',
		leaflet: '리플렛', brochure: '브로슈어', poster: '포스터 · 배너',
		sign: '병원 안내물', pack: '개원 패키지', best: '베스트'
	};

	function buildShopHome(text) {
		if (built.shopHome) return;
		var P = w.CMSShopHome;
		if (!P || !text) return;

		var heroes = P.heroList(text);
		if (heroes.length) {
			sec({
				id: 'i-shophome-hero', top: '상품몰', name: '상품몰 배너', kind: 'image', page: 'shopHome',
				desc: '상품몰 첫 화면에서 넘어가는 큰 배너 ' + heroes.length + '장의 오른쪽 사진입니다.',
				fields: heroes.map(function (h, i) {
					var def = f('shopHome.hero' + nn(i + 1) + '.pic', '배너 ' + (i + 1) + ' · ' + (h.label || h.tit2), 'image');
					def.base = SHOP_IMG_DIR;
					return def;
				})
			});

			sec({
				id: 't-shophome-hero', top: '상품몰', name: '상품몰 배너', kind: 'text', page: 'shopHome',
				desc: '상품몰 첫 화면 큰 배너 ' + heroes.length + '장의 문구입니다. 제목은 두 줄로 나뉘며 둘째 줄이 굵게 나옵니다.',
				fields: (function () {
					var out = [];
					heroes.forEach(function (h, i) {
						var p = nn(i + 1), t = '배너 ' + (i + 1) + ' · ';
						out.push(f('shopHome.hero' + p + '.label', t + '말머리 꼬리표', 'line'));
						out.push(f('shopHome.hero' + p + '.tit1', t + '제목 첫 줄', 'line'));
						out.push(f('shopHome.hero' + p + '.tit2', t + '제목 둘째 줄 (굵게)', 'line'));
						out.push(f('shopHome.hero' + p + '.desc', t + '설명', 'line'));
						out.push(f('shopHome.hero' + p + '.cta', t + '버튼 문구', 'line'));
					});
					return out;
				})()
			});
		}

		var pools = P.poolList(text);
		if (pools.length) {
			sec({
				id: 'i-shophome-tpl', top: '상품몰', name: '무료 템플릿', kind: 'image', page: 'shopHome',
				desc: '"무료 템플릿을 상품에 미리 입혀보세요" 영역에서 목업 위에 입혀지는 디자인 사진입니다. 상품군별로 묶여 있습니다.',
				fields: (function () {
					var out = [];
					pools.forEach(function (pl) {
						var nm = POOL_NAME[pl.key] || pl.key;
						pl.files.forEach(function (fn, k) {
							var def = f('shopHome.tpl.' + pl.key + '.' + nn(k + 1), nm + ' ' + (k + 1), 'image');
							def.base = SHOP_IMG_DIR;
							out.push(def);
						});
					});
					return out;
				})()
			});
		}

		built.shopHome = true;
		reindex();
	}

	/* ===== 상품몰 : js/shop.js 의 상품 배열에서 ===== */
	function buildShop(text) {
		if (built.shop) return;
		var P = w.CMSJs;
		if (!P) return;
		var prods = P.listProducts(text);
		if (!prods.length) return;

		var catNames = {};
		P.listCats(text).forEach(function (c) { catNames[c.id] = c.name; });

		var order = [], bucket = {};
		prods.forEach(function (p) {
			if (!bucket[p.cat]) { bucket[p.cat] = []; order.push(p.cat); }
			bucket[p.cat].push(p);
		});

		order.forEach(function (cid) {
			var list = bucket[cid];
			var nm = catNames[cid] || cid;

			sec({
				id: 't-shop-' + cid, top: '상품몰', name: nm, kind: 'text', page: 'shop',
				desc: nm + ' 상품 ' + list.length + '개의 이름과 한 줄 설명입니다.',
				fields: (function () {
					var out = [];
					list.forEach(function (p) {
						out.push(f('shop.' + p.id + '.name', p.name + ' · 상품 이름', 'line'));
						out.push(f('shop.' + p.id + '.desc', p.name + ' · 한 줄 설명', 'line'));
					});
					return out;
				})()
			});

			sec({
				id: 'i-shop-' + cid, top: '상품몰', name: nm, kind: 'image', page: 'shop',
				desc: nm + ' 상품 ' + list.length + '개의 대표 이미지입니다.',
				fields: list.map(function (p) {
					var def = f('shop.' + p.id + '.img', p.name, 'image');
					def.base = SHOP_IMG_DIR;
					return def;
				})
			});
		});

		built.shop = true;
		reindex();
	}

	/* ===== 포트폴리오 전체 : kr/portfolio/all.html 의 60건에서 ===== */
	function buildPortfolio(html) {
		if (built.pf) return;
		var H = w.CMSHtml;
		if (!H || !html) return;

		var list = [], i, key, cat, title;
		for (i = 1; i <= 300; i++) {
			key = 'pf.item' + nn(i);
			title = H.readInner(html, key + '.title');
			if (title == null) break;
			cat = H.readInner(html, key + '.cat') || '기타';
			list.push({ n: nn(i), cat: H.htmlToPlain(cat).trim(), title: H.htmlToPlain(title).trim() });
		}
		if (!list.length) return;

		var order = [], bucket = {};
		list.forEach(function (it) {
			if (!bucket[it.cat]) { bucket[it.cat] = []; order.push(it.cat); }
			bucket[it.cat].push(it);
		});
		order.sort();

		order.forEach(function (cn) {
			var group = bucket[cn];
			var sid = cn.replace(/[^가-힣a-zA-Z0-9]+/g, '');

			sec({
				id: 't-pf-' + sid, top: '포트폴리오', name: cn, kind: 'text', page: 'pf',
				desc: '포트폴리오 ' + cn + ' ' + group.length + '건의 제목과 분류 이름입니다.',
				fields: (function () {
					var out = [];
					group.forEach(function (it) {
						out.push(f('pf.item' + it.n + '.title', it.title + ' · 제목', 'line'));
						out.push(f('pf.item' + it.n + '.cat', it.title + ' · 분류', 'line'));
					});
					return out;
				})()
			});

			sec({
				id: 'i-pf-' + sid, top: '포트폴리오', name: cn, kind: 'image', page: 'pf',
				desc: '포트폴리오 ' + cn + ' ' + group.length + '건의 이미지입니다.',
				fields: group.map(function (it) {
					return f('pf.item' + it.n + '.img', it.title, 'image');
				})
			});
		});

		built.pf = true;
		reindex();
	}

	/* ----------------------------------------------------
	 * 색인
	---------------------------------------------------- */
	var INDEX = {};
	function reindex() {
		INDEX = {};
		SECTIONS.forEach(function (s) {
			s.fields.forEach(function (fd) {
				fd.section = s.id;
				fd.sectionName = s.name;
				fd.top = s.top;
				fd.page = s.page;
				INDEX[fd.key] = fd;
			});
		});
	}
	reindex();

	function get(key) { return INDEX[key] || null; }

	function label(key) {
		var d = get(key);
		return d ? (d.top + ' · ' + d.sectionName + ' · ' + d.label) : key;
	}

	function sections(kind) {
		return SECTIONS.filter(function (s) { return s.kind === kind; });
	}

	function section(id) {
		var i;
		for (i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) return SECTIONS[i];
		return null;
	}

	function countOf(kind) {
		var n = 0;
		sections(kind).forEach(function (s) { n += s.fields.length; });
		return n;
	}

	w.CMSSchema = {
		PAGES: PAGES,
		SHOP_IMG_DIR: SHOP_IMG_DIR,
		BANNERS: BANNERS,
		SERVICE_BG: SERVICE_BG,
		SECTIONS: SECTIONS,
		buildShop: buildShop,
		buildPortfolio: buildPortfolio,
		buildShopHome: buildShopHome,
		get: get,
		label: label,
		sections: sections,
		section: section,
		countOf: countOf
	};
})(window);
