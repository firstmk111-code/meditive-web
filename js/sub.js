/* *******************************************************
 * filename : sub.js
 * description : 서브컨텐츠에만 사용되는 JS
 * date : 2022-08-04
******************************************************** */


$(document).ready(function  () {
	/* ************************
	* Func : 서브 Visual Active 클래스 붙이기
	* addClassName () 필요
	************************ */
	setTimeout(function  () {
		addClassName($("#visual"), "active");
	},200);

	/* ************************
	* Func : 모달팝업 플러그인 사용
	* MagnificPopup.js 필요
	************************ */
	if ($.exists(".popup-gallery")) {
		magnificPopup($(".popup-gallery"));
	}

	/* ************************
	* Func : 일정 가로사이즈 아래부터 scroll 사용하기
	* mCustomScrollbar.js, customScrollX() 필요
	************************ */
	/* 서브 Scrollbar object  */
	$(".custom-scrollbar-wrapper").each(function  () {
		$(this).prepend("<div class='custom-scrollbar-cover'><div class='scroll-cover-txt'><i class='xi-touch'></i></div></div>");
		var $scrollObject = $(this).find(".scroll-object-box");
		if ($.exists($scrollObject)) {
			customScrollX($scrollObject);
		}
		$(this).on("touchmove click",function  () {
			$(this).find(".custom-scrollbar-cover").fadeOut(200);
		});
	});

	/* ************************
	* Func : 서브 상단 메뉴 FIXED
	* getWindowWidth(), checkOffset(), toFit() 필요
	************************ */
	if ($.exists(".fixed-sub-menu")) {
		var $fixedSubMenu = $(".fixed-sub-menu");
		var topMenuStart =  checkOffset($fixedSubMenu);
		$(window).resize(function  () {
			if ( getWindowWidth() > tabletWidth ) {
				topMenuStart =  checkOffset($fixedSubMenu);
			}else {
				$fixedSubMenu.removeClass("top-fixed");
			}
		});
		window.addEventListener('scroll', toFit(function  () {
			if ( getWindowWidth() > tabletWidth ) {
				objectFixed($fixedSubMenu, topMenuStart, "top-fixed");
			}else {
				$fixedSubMenu.removeClass("top-fixed");
			}
		}, {
		}),{ passive: true })
	}

	/* ************************
	* Func : 컨텐츠 메뉴 FIXED 및 클릭시 해당영역 이동
	* getScrollTop(), getWindowWidth(), checkOffset(), toFit(), checkFixedHeight(), moveScrollTop() 필요
	************************ */
	if ($.exists(".cm-fixed-tab-container-JS")) {
		var $fixedMoveTab = $(".cm-fixed-tab-list-JS");		// fixed되는 메뉴 클래스
		var $moveTabItem = $fixedMoveTab.find("li");
		var menuCount= $moveTabItem.length;
		var nav = [];
		
		$(window).on('load', function  () {
			checkStartOffset();
			nav = checkTopOffset();
		});
		$(window).on('resize', function  () {
			checkStartOffset();
			nav = checkTopOffset();
		}); 		
		
		// 탭이 붙기 시작하는 지점 체크
		function checkStartOffset () {
			if (window.innerWidth <= 1280) {
				var fixedStartPoint =  $(".cm-fixed-tab-container-JS").offset().top - $("header").height();	
			} else {
				var fixedStartPoint =  $(".cm-fixed-tab-container-JS").offset().top - ($("header").height() / 2);	
			}
			return fixedStartPoint;
		}		

		// 해당되는 각각의 영역 상단값 측정
		function checkTopOffset () {
			var arr = [];
			for(var i=0;i < menuCount;i++){
				arr[i]=$($moveTabItem.eq(i).children("a").attr("href")).offset().top;
			}
			return arr;
		}
		
		// 스크롤 0일때 상단fixed되는 높이값 체크
		function checkFixedObjectHeight () {
			var fixedObjectTotalHeight = 0;
			for (var i=0; i<$(".top-fixed-object").length; i++) {
				var fixedObjectTotalHeight = fixedObjectTotalHeight + $(".top-fixed-object").eq(i).outerHeight();
			}
			return fixedObjectTotalHeight;
		}

		// 스크롤 event 
		window.addEventListener('scroll', toFit(function  () {
			// 메뉴fixed
			// objectFixed($fixedMoveTab, checkStartOffset(), "top-fixed");

			if ( getScrollTop() >  checkStartOffset() ) {
				$fixedMoveTab.addClass("top-fixed");
			}else if ( getScrollTop() <  (checkStartOffset() + $fixedMoveTab.height()) ) {
				$fixedMoveTab.removeClass("top-fixed");
			}

			$moveTabItem.each(function  (idx) {
				var eachOffset = nav[idx] -  checkFixedHeight();
				var minusOffset = $(window).height() / 6;	// 스크롤시 selected 붙는 지점을 조금 더 빠르게 하기위해 추가
				
				if( (getScrollTop() + minusOffset) >= eachOffset ){
					$moveTabItem.removeClass('selected');
					$moveTabItem.eq(idx).addClass('selected');
					// 모바일 드롭메뉴일때
					if ($.exists($moveTabItem.parents(".cm-drop-menu-box-JS"))) {
						$fixedMoveTab.find(".cm-drop-open-btn-JS > span").text($moveTabItem.eq(idx).find("em").text());
					}
				};
			});
			}, {
		}),{ passive: true })
		
		// 클릭 event 
		$moveTabItem.find("a").click(function  () {
			var goDivOffset = $($(this).attr("href")).offset().top - checkFixedHeight() +1;	// 이동해야할 지점
			if ( getScrollTop()  < checkStartOffset()) {
				if ( getScrollTop() == 0 ) {
					var goDiv = goDivOffset - checkFixedObjectHeight();
				}else {
					var goDiv = goDivOffset - $fixedMoveTab.height();
				}
			}else {
				var goDiv = goDivOffset;
			}
			setTimeout(function  () {
				moveScrollTop(goDiv);
			});

			// 모바일 드롭메뉴일때
			if ($.exists($(this).parents(".cm-drop-menu-box-JS")) ) {
				if ( getWindowWidth () < $fixedMoveTab.data("drop-width")+1 ) {
					$fixedMoveTab.find("ul").slideUp();
				}
			}
			 
			return false;
		});
	}

	/* ************************
	* Func : 에디터관련
	************************ */
	if ($.exists(".editor")) {
		/* 테이블 스크롤넣기 */ 
		$(".editor table").each(function  () {
			$(this).wrap("<div class='editor-table-box'></div>");
		});
		
		/* iframe 태그 감싸기 */ 
		$(".editor *:not('.editor-iframe-box') iframe").each(function  () {
			var iframeSrc = $(this).attr("src");
			var findStr = "https://www.youtube.com/embed"; 

			if (iframeSrc.indexOf(findStr) != -1) {
			  $(this).wrap("<div class='editor-iframe-box'></div>");
			}
		});
	}

	/* ************************
	* 제품 슬라이드
	************************ */
	$('.product-slide-box').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: true,
		fade: false,
		dots:true,
		autoplay: true,
		speed:800,
		infinite:false,
		autoplaySpeed: 4000,
		easing: 'easeInOutQuint',
		pauseOnHover:true,
		touchThreshold: 50,
		prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Prev" tabindex="0" role="button"><i class="xi-angle-left"></i></button>',
		nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button"><i class="xi-angle-right"></i></button>',
	});

	$(".vacuum-use-list .use-list-item").each(function () {
		const $useListBtns = $(this).find(".use-list-btn");

		$useListBtns.click(function () {
			$(this).siblings(".inner-txt-list").slideToggle();
			$(this).children("i").toggleClass("rotate");
		});
	});
});

gsap.registerPlugin(ScrollTrigger);

const historyWrap = document.querySelector(".history-wrap");
const historyItem = document.querySelectorAll(".history-con");

historyItem.forEach((obj, index) => {
	var target = obj
	ScrollTrigger.create({
		trigger: target,
		start: "top center",
		end: "bottom center",
		toggleClass: { targets: target, className: "active" },
	});
});

window.addEventListener("resize", ScrollTrigger.refresh())

/* ************************
* Func : 제작 프로세스 - 스크롤 순차 활성화 + 연결선 진행 채움
* .mgp-process-list 가 있는 페이지에서만 동작 (없으면 아무 것도 하지 않음)
************************ */
;(function () {
	var $lists = $('.mgp-process-list');
	if ( !$lists.length ) return;

	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	$lists.each(function () {
		var list = this;
		var $items = $(list).children('.process-list-item');
		if ( !$items.length ) return;

		$(list).addClass('is-process-js');

		var firstCenter = 0, trackLen = 0;

		function measure () {
			var listRect = list.getBoundingClientRect();
			var first = $items.first().find('.step-box')[0];
			var last  = $items.last().find('.step-box')[0];
			if ( !first || !last ) return;
			var fr = first.getBoundingClientRect();
			var lr = last.getBoundingClientRect();
			firstCenter = fr.top - listRect.top + fr.height / 2;
			trackLen = (lr.top - listRect.top + lr.height / 2) - firstCenter;
			list.style.setProperty('--process-x', (fr.left - listRect.left + fr.width / 2) + 'px');
			list.style.setProperty('--process-top', firstCenter + 'px');
			list.style.setProperty('--process-track', trackLen + 'px');
		}

		function update () {
			var baseLine = window.innerHeight * 0.62;	// 화면 62% 지점을 '현재 단계' 기준선으로
			var currentIdx = -1;

			$items.each(function (i) {
				var box = $(this).find('.step-box')[0] || this;
				var r = box.getBoundingClientRect();
				if ( r.top + r.height / 2 <= baseLine ) {
					$(this).addClass('is-shown');
					currentIdx = i;
				} else {
					$(this).removeClass('is-shown');
				}
			});

			$items.removeClass('is-current');
			if ( currentIdx > -1 ) $items.eq(currentIdx).addClass('is-current');

			var absFirst = list.getBoundingClientRect().top + firstCenter;
			var fill = Math.max(0, Math.min(trackLen, baseLine - absFirst));
			list.style.setProperty('--process-fill', fill + 'px');
		}

		var ticking = false;
		function onScroll () {
			if ( ticking ) return;
			ticking = true;
			window.requestAnimationFrame(function () { update(); ticking = false; });
		}

		/* 모션 최소화 설정이면 : 모든 단계를 활성 상태로 고정하고 연결선도 끝까지 채워 둔다 */
		function staticState () {
			measure();
			$items.addClass('is-shown').removeClass('is-current');
			list.style.setProperty('--process-fill', trackLen + 'px');
		}

		if ( reduceMotion ) {
			staticState();
			$(window).on('resize load', staticState);
			return;
		}

		measure();
		update();
		$(window).on('scroll', onScroll);
		$(window).on('resize load', function () { measure(); update(); });
	});
})();

/* 버튼 오버 효과 */
setTimeout(function(){
	$('.cm-fill-btn').on('mouseenter', function(e){
		x = e.pageX - $(this).offset().left;
		y = e.pageY - $(this).offset().top;
		$(this).find('.cm-fill').css({top:y, left:x});
	});
},100);