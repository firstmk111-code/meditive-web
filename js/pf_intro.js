/**
 * 작업물 Grid 진입 인트로
 * - 포트폴리오(전체 작업물) · 서비스 카테고리(로고 / 리플렛 / 포스터 / 카탈로그 / 홈페이지 / 디지털 콘텐츠)
 *   페이지가 모두 같은 작업물 Grid(.pf-grid)를 쓰므로, 진입 모션도 이 파일 하나로 공유한다.
 *
 * - 흐름(데스크톱, 약 2.2초) : 흩어진 카드 → 겹쳐 섞임 → 펼쳐짐 → 3열 Grid 완성
 *   1) 화면 바깥 사방(원형 각도)에서 카드가 빠르게 날아 들어온다.
 *   2) Grid 한가운데에 한 뭉치로 겹쳐 쌓인다.
 *   3) 그 상태에서 살짝 흔들며 앞뒤(zIndex)와 각도가 섞인다.
 *   4) 가운데 카드부터 바깥 카드 순으로(중심 거리 기준) 물결처럼 펼쳐지며 각자 자리에 안착한다.
 *   태블릿 · 모바일(900px 이하)은 가벼운 fade-up(약 1초)으로 단순화한다.
 *
 * - 정렬이 끝나면 inline transform 을 전부 지우고 .pf-intro 를 떼어 Grid 가 틀어지지 않게 하며,
 *   이후에는 일반 목록 페이지처럼 스크롤된다. 레이아웃 · 카드 디자인은 건드리지 않는다.
 * - 나머지 카드와 모션 최소화(prefers-reduced-motion) 설정은 기존 [data-scroll] 등장 모션 그대로.
 */
(function () {
	var booted = false;

	function init () {
		if ( booted || !window.gsap ) return;
		if ( window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ) return;

		/* 디지털 콘텐츠처럼 스크립트로 카드를 그리는 Grid 는 아직 비어 있을 수 있어 다음 기회에 다시 본다 */
		var grid = document.querySelector('.pf-grid');
		if ( !grid || !grid.children.length ) return;

		var simple = window.innerWidth <= 900;                   /* 태블릿 · 모바일은 모션 단순화 */
		var cols = ( getComputedStyle(grid).gridTemplateColumns || '' ).split(' ').filter(Boolean).length || 3;
		/* 앞쪽 카드까지만 인트로 대상 : 뒤쪽 카드는 기존 [data-scroll] 스크롤 등장 모션을 그대로 쓴다 */
		var cards = [].slice.call(grid.children, 0, simple ? Math.max(cols * 2, 4) : cols * 3);
		if ( cards.length < 2 ) return;

		booted = true;
		/* 인트로가 시작되기 전에 공통 스크롤 등장 모션이 먼저 카드를 띄우지 않도록 여기서 잡아 둔다 */
		cards.forEach(function (el) { el.classList.add('pf-intro', 'animated'); });
		gsap.set(cards, { opacity: 0 });

		/* 카드마다 항상 같은 값을 주되 규칙적으로 보이지 않게 하는 의사 난수 */
		function rnd (i, seed) {
			var v = Math.sin(( i + 1 ) * 12.9898 + seed * 78.233) * 43758.5453;
			return v - Math.floor(v);                            /* 0 ~ 1 */
		}

		function play () {
			var n = cards.length;
			var vw = window.innerWidth, vh = window.innerHeight;
			var rects = cards.map(function (el) { return el.getBoundingClientRect(); });

			/* 카드들이 한 뭉치로 겹칠 지점 : 인트로 대상 카드 전체의 중심 */
			var gx = 0, gy = 0;
			rects.forEach(function (r) { gx += r.left + r.width / 2; gy += r.top + r.height / 2; });
			gx /= n; gy /= n;

			/* 중심에서 먼 카드일수록 늦게 펼쳐지도록(안쪽 → 바깥쪽 물결) 거리 비율을 미리 구한다 */
			var mids = rects.map(function (r) {
				var dx = r.left + r.width / 2 - gx, dy = r.top + r.height / 2 - gy;
				return { dx: dx, dy: dy, dist: Math.sqrt(dx * dx + dy * dy) };
			});
			var far = Math.max.apply(null, mids.map(function (m) { return m.dist; })) || 1;

			/* 화면 바깥 출발 반경 : 어느 방향이든 확실히 화면 밖에서 들어오도록 */
			var R = Math.max(vw, vh) * .78;
			var tl = gsap.timeline({ onComplete: finish });

			cards.forEach(function (el, i) {
				if ( simple ) {
					gsap.set(el, { y: 46, scale: .94, opacity: 0, force3D: true });
					tl.to(el, { y: 0, scale: 1, opacity: 1, duration: .66, ease: 'power2.out' }, i * .075);
					return;
				}

				var m = mids[i];
				var ring = m.dist / far;                         /* 0(가운데) ~ 1(바깥) */
				var side = ( i % 2 === 0 ) ? -1 : 1;

				/* 1) 화면 바깥 출발 : 자기 자리 방향을 기준으로 각도를 흩뿌린다 */
				var ang = Math.atan2(m.dy, m.dx) + ( rnd(i, 1) - .5 ) * 1.5;
				/* transform 은 자기 자리 기준이므로, -m.dx / -m.dy 가 곧 뭉치 중심이다 */
				var ex = -m.dx + Math.cos(ang) * R;
				var ey = -m.dy + Math.sin(ang) * R;
				var erot = side * ( 22 + rnd(i, 2) * 26 );

				/* 2) 가운데 한 뭉치로 겹치는 지점 */
				var px = -m.dx + ( rnd(i, 3) - .5 ) * 76;
				var py = -m.dy + ( rnd(i, 4) - .5 ) * 60;
				var prot = ( rnd(i, 5) - .5 ) * 22;

				/* 3) 뭉치 안에서 한 번 더 섞이는 지점 (앞뒤 순서까지 뒤집는다) */
				var sx = -m.dx + ( rnd(i, 6) - .5 ) * 104;
				var sy = -m.dy + ( rnd(i, 7) - .5 ) * 80;
				var srot = -prot * 1.35;

				gsap.set(el, {
					x: ex, y: ey, rotation: erot, scale: .34, opacity: 0,
					zIndex: 10 + i, transformOrigin: '50% 50%', force3D: true
				});

				/* 1 → 2 : 사방에서 날아와 가운데에 겹쳐 쌓인다 */
				tl.to(el, {
					x: px, y: py, rotation: prot, scale: .52, opacity: 1,
					duration: .52, ease: 'power3.out'
				}, i * .035);

				/* 2 → 3 : 겹친 채로 살짝 흔들리며 앞뒤 · 각도가 섞인다 */
				tl.set(el, { zIndex: 10 + ( ( i * 7 + 3 ) % n ) }, .58 + i * .018);
				tl.to(el, {
					x: sx, y: sy, rotation: srot, scale: .60,
					duration: .34, ease: 'power1.inOut'
				}, .58 + i * .018);

				/* 3 → 완성 : 가운데 카드부터 바깥 카드 순으로 펼쳐지며 자기 Grid 자리에 안착 */
				tl.to(el, {
					x: 0, y: 0, rotation: 0, scale: 1,
					duration: .92, ease: 'expo.out'
				}, 1 + ring * .3 + rnd(i, 8) * .06);
			});
		}

		function finish () {
			cards.forEach(function (el) {
				gsap.set(el, { clearProps: 'all' });             /* transform 잔여값 초기화 */
				el.classList.remove('pf-intro');
			});
			if ( window.ScrollTrigger && ScrollTrigger.refresh ) ScrollTrigger.refresh();
		}

		var fired = false;
		function once () { if ( fired ) return; fired = true; play(); }

		/* 이미 Grid 가 보이는 상태로 들어왔다면 곧바로 시작 */
		if ( grid.getBoundingClientRect().top < window.innerHeight * .92 ) { once(); return; }

		/* 화면에 드러나는 순간을 놓치지 않도록 항상 감시해 둔다.
		   ScrollTrigger 대신 브라우저 기본 IntersectionObserver 를 쓴다 :
		   SmoothScroll · 플러그인 등록 상태와 무관하게 확실히 걸린다. */
		if ( window.IntersectionObserver ) {
			var io = new IntersectionObserver(function (entries) {
				if ( entries[0].isIntersecting ) { io.disconnect(); once(); }
			}, { rootMargin: '0px 0px -18% 0px' });
			io.observe(grid);
		}
		/* 관찰자가 없거나 어떤 이유로든 걸리지 않았을 때를 대비한 스크롤 예비 감시 */
		window.addEventListener('scroll', function onScroll () {
			if ( fired ) { window.removeEventListener('scroll', onScroll); return; }
			if ( grid.getBoundingClientRect().top < window.innerHeight * .82 ) {
				window.removeEventListener('scroll', onScroll); once();
			}
		}, { passive: true });

		/* Grid 는 서브 비주얼 아래에 있어 진입 직후에는 화면 밖이다.
		   최초 진입에 한해 Grid 위치까지 부드럽게 내려간 뒤 인트로를 재생해, 진입 인트로처럼 보이게 한다.
		   사용자가 먼저 스크롤을 잡으면 즉시 손을 떼고 위의 감시에 맡긴다. */
		if ( location.hash || window.scrollY > 10 ) return;
		setTimeout(autoScroll, 420);

		function autoScroll () {
			if ( fired || window.scrollY > 10 ) return;

			var vh = window.innerHeight;
			var max = Math.max(0, document.documentElement.scrollHeight - vh);
			/* 제목(.pf-head)이 위에 살짝 남도록 Grid 상단을 화면 16% 지점에 둔다 */
			var to = Math.min(max, Math.max(0, window.scrollY + grid.getBoundingClientRect().top - vh * .16));
			if ( to - window.scrollY < 40 ) { once(); return; }

			var events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
			var tween = null;
			function stop () {
				events.forEach(function (t) { window.removeEventListener(t, stop); });
				if ( tween ) tween.kill();                       /* 감시는 그대로 두어 인트로를 놓치지 않는다 */
			}
			events.forEach(function (t) { window.addEventListener(t, stop, { passive: true }); });

			function done () { stop(); once(); }

			if ( window.ScrollToPlugin ) {
				tween = gsap.to(window, {
					duration: .9, ease: 'power2.inOut',
					scrollTo: { y: to, autoKill: true },
					onComplete: done
				});
			} else {
				window.scrollTo({ top: to, behavior: 'smooth' });
				setTimeout(done, 900);
			}
		}
	}

	function boot () {
		init();
		if ( !booted ) setTimeout(init, 200);                    /* 스크립트로 카드를 그리는 Grid 대비 */
		if ( !booted ) setTimeout(init, 800);
	}

	if ( document.readyState === 'loading' ) document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
