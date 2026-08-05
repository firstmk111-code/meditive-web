/* *******************************************************
 * filename : main.js
 * description : 메인에만 사용되는 JS
 * date : 2022-08-08
******************************************************** */

$(document).ready(function  () {
	/* 초기 애니메이션 */
	$(".ms-preloader").animate({"opacity":"0"},1200,"easeInOutCubic",function  () {
		$(".ms-preloader").css("visibility", "hidden");
	});

	setTimeout(function  () {
		$(".main-page").addClass('active');
		$(".cm-quick-menu").addClass('active');
	},200);

	setTimeout(function  () {
		$("#mainVisual").addClass('visual-active');
	},1000);

	/* ************************
	* Func : 메인 비주얼 높이 설정 및 slick 슬라이드
	* slick.js , getWindowWidth(), getWindowHeight() 필요
	************************ */
	// 메인 비주얼 높이값 설정
	if ($.exists('#mainVisual.full-height')) {
		mainVisualHeight();
		$(window).on('resize', mainVisualHeight);

		function mainVisualHeight () {
			var visual_height = getWindowHeight();	// header가 fixed or absolute일경우 - $("#header").height() 삭제
			$("#mainVisual").height(visual_height);
		}
	}

	// 메인 비주얼 고정 텍스트 Active
	if ($.exists('.main-visual-fixed-txt-con')) {
		addClassName($(".main-visual-fixed-txt-con"), "active-item");
	}


	/* Request a Sample 흐르는 텍스트 */
	const marquee_s1 = document.querySelector('.flow-txt .marquee .absol'); 
	const marqueeChildSize_s1 = marquee_s1.querySelector('.flow-txt .mar_ch');
	const cloneMarqueeTimes_s1 = Math.ceil(marquee_s1.getBoundingClientRect().width / marqueeChildSize_s1.getBoundingClientRect().width); 
	
	for (let i = 0; i < cloneMarqueeTimes_s1; i++) {
		const childClone = marqueeChildSize_s1.cloneNode(); //반복 대상의 실제 사이즈로 지정한 대상으로 클론생성
		childClone.innerHTML = marqueeChildSize_s1.innerHTML; //클론에 원본 콘텐츠 입력
		marquee_s1.appendChild(childClone); //설정한 클론 마지막에 추가
	}
	gsap.fromTo('.flow-txt .mar_ch', {
		xPercent: 0
		}, {
			xPercent: -100,
			repeat: -1,
			duration: 25,
			ease: 'none'
	});

	/* ************************
	* Func : 메인 Service
	************************ */
	var mainServiceItem = $('.main-service-bg-JS').find('.list-item');
	var mainServiceBg = mainServiceItem.find('.bg');
	var mainServiceCoverBg = $('.main-service-cover-JS').find('.list-item');

	// 각각 항목 오버 시 해당 항목 이미지 on
	mainServiceItem.each(function(){
		$(this).on('mouseenter', function(){
			var prdIndex = $(this).index();
			mainServiceBg.css('opacity','0');
			mainServiceCoverBg.eq(prdIndex).css('opacity','1');
		});
		$(this).on('mouseleave', function(){
			mainServiceBg.css('opacity','1');
			mainServiceCoverBg.css('opacity','0');
		});
	});

	gsap.registerPlugin(ScrollTrigger);
	ScrollTrigger.refresh();

	/* ************************
	* Func : 메인 2섹션 Gsap
	************************ */
	// 스크롤에 따른 배경이미지 움직임 추가
	var tlServiceBg = gsap.timeline({ 
		scrollTrigger : { 
			trigger : $('.main-service-cover-scroll') , 
			start : "top center", 
			end : "bottom center", 
			scrub : 1, 
	        ease: "none",
			onUpdate: (self) => {
				const progress = self.progress.toFixed(2);
				const position = 200 * progress; // 스크롤 진행률에 따라 position 값을 계산합니다.
				// console.log(progress, position)
				gsap.to(".bg01", { y: `${position}px` });
				gsap.to(".bg02", { y: `${position}px` });
				gsap.to(".bg03", { y: `${position}px` });
				gsap.to(".service-hover-bg .list-item", { y: `${position}px` });
			}
		} 
	});
	// 홀수 박스 스크롤트리거
	var tlServiceOdd = gsap.timeline({ 
		scrollTrigger : { 
			trigger : $('.main-service-box-scroll') , 
			start : "top center", 
			end : "bottom center", 
			scrub : 1, 
	        ease: "none",
		} 
	});
	// 짝수 박스 스크롤트리거
	var tlServiceEven = gsap.timeline({ 
		scrollTrigger : { 
			trigger : $('.main-service-box-scroll') , 
			start : "top center", 
			end : "bottom center", 
			scrub : 1, 
	        ease: "none",
		} 
	});
	
	// y 움직임 값
	tlServiceOdd.to('.service-cover-list .list-item.odd-item a .inner', { y: -100})
	tlServiceEven.to('.service-cover-list .list-item.even-item a .inner', { y: 100})
	
	
	/* ************************
	* Func : 메인 제품 슬라이드
	************************ */
	$(".main-prd-slide-con").each(function () {
		var $prdSlideCon = $(this);
		var prdSwiper = new Swiper($prdSlideCon, {
			slidesPerView: 1,
			spaceBetween: 15,
			freeMode: false,
			loop: true,
			loopAdditionalSlides : 1,
			allowTouchMove: true,
			speed: 1200, 
			autoplay: {
				delay: 3500,
				disableOnInteraction: false,
			},
			pagination: {
				el:'.main-prd-swiper-pagination',
				type: 'progressbar',
			},
			navigation: {
				nextEl: '.main-prd-next-btn',
				prevEl:  '.main-prd-prev-btn',
			},
			breakpoints: {
				481: {
					slidesPerView: 2,
					freeMode: false,
					spaceBetween: 15,
					speed: 1200, 
					autoplay: {
						delay: 3500,
						disableOnInteraction: false,
					},
				},
				801: {
					slidesPerView:3,
					freeMode: true,
					spaceBetween: 20,
					speed: 5000, 
					autoplay: {
						delay: 0,
						disableOnInteraction: false,
					},
				},
				1281: {
					slidesPerView:4,
					freeMode: true,
					spaceBetween: 20,
					speed: 5000, 
					autoplay: {
						delay: 0,
						disableOnInteraction: false,
					},
				}
			},
		});
			
		$('.main-prd-play-btn').click(function () {
			if ($(this).hasClass('on')) {
				prdSwiper.autoplay.start();
			} else {
				prdSwiper.autoplay.stop();
			}
			$(this).toggleClass('on');
		});
		prdSwiper.update();
	});
	
	initMarqueesWithColorLayer();
	initSpotlightFollow();
	followMousePointer();
	
});

/** 세로 무한 롤링 (상/하) */
function makeVerticalMarquee(rollerSelector, direction = "up", speedPx = 1) {
  const origin = document.querySelector(rollerSelector);
  if (!origin) return;

  const list = origin.querySelector(".visual-img-list");
  if (!list) return;

  const baseId = rollerSelector.replace(/\W+/g, "_");
  origin.id = baseId + "_1";

  const clone = origin.cloneNode(true);
  clone.id = baseId + "_2";
  origin.parentNode.appendChild(clone);

	let trackHeight = 0;
	if (getWindowWidth() > 800) {
		trackHeight = list.scrollHeight + 30;
	} else {
		trackHeight = list.scrollHeight + 16;
	}

  if (direction === "up") {
    origin.style.top = "0px";
    clone.style.top = trackHeight + "px";
    origin.style.bottom = ""; clone.style.bottom = "";
  } else {
    origin.style.bottom = "0px";
    clone.style.bottom = trackHeight + "px";
    origin.style.top = ""; clone.style.top = "";
  }

  function step(){
    if (direction === "up") {
      [origin, clone].forEach(el => {
        const cur = parseInt(el.style.top || "0", 10);
        const next = cur - speedPx;
        el.style.top = next + "px";
        if (trackHeight + next <= 0) el.style.top = trackHeight + "px";
      });
    } else {
       [origin, clone].forEach(el => {
		 const cur = parseInt(el.style.bottom || "0", 10);
		 const next = cur - speedPx;
		 el.style.bottom = next + "px";
		 if (trackHeight + next <= 0) el.style.bottom = trackHeight + "px";
      });
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initMarqueesWithColorLayer(){
  const root = document.querySelector(".gray-layer .visual-con-bg");
  const colorLayer = document.getElementById("colorLayer");

  // 클론
  const colorClone = root.cloneNode(true);
  colorLayer.appendChild(colorClone);

  // 롤링
  [document].forEach(() => {
    // 위
    makeVerticalMarquee(".gray-layer .roller01", "up", 1);
    makeVerticalMarquee("#colorLayer .roller01", "up", 1);
    // 아래
    makeVerticalMarquee(".gray-layer .roller02", "down", 1);
    makeVerticalMarquee("#colorLayer .roller02", "down", 1);
    // 위
    makeVerticalMarquee(".gray-layer .roller03", "up", 1);
    makeVerticalMarquee("#colorLayer .roller03", "up", 1);
	 // 아래
    makeVerticalMarquee(".gray-layer .roller04", "down", 1);
    makeVerticalMarquee("#colorLayer .roller04", "down", 1);
    // 위
    makeVerticalMarquee(".gray-layer .roller05", "up", 1);
    makeVerticalMarquee("#colorLayer .roller05", "up", 1);
  });
}

/* 마우스 위치 중심 이동 */
function initSpotlightFollow(){
	const root = document.getElementById("mainVisual");
	const colorLayer = document.getElementById("colorLayer");
	const spotRing = document.querySelector(".spot-ring");

	let targetX = root.clientWidth / 2;
	let targetY = root.clientHeight / 2;
	let currentX = targetX;
	let currentY = targetY;

	function updateVars(e){
		const rect = root.getBoundingClientRect();
		targetX = e.clientX - rect.left;
		targetY = e.clientY - rect.top;
		colorLayer.classList.add("active");
		spotRing.classList.add("active");

	}

	function removeVars(){
		colorLayer.classList.remove("active");
		spotRing.classList.remove("active");
	}

	function animate(){
		// 보간(lerp) 값 - 0.1 ~ 0.2 정도가 부드럽게 따라옴
		const ease = 0.1;
		currentX += (targetX - currentX) * ease;
		currentY += (targetY - currentY) * ease;

		root.style.setProperty("--mx", currentX + "px");
		root.style.setProperty("--my", currentY + "px");

		requestAnimationFrame(animate);
	}

	root.addEventListener("mousemove", updateVars);
	root.addEventListener("mouseleave", removeVars);
	requestAnimationFrame(animate);
}




/* ************************
* Func : mouse pointer 모션
************************ */
function followMousePointer () {
	var $mouse_follow_btn = $(".mouse-pointer");
	$("body").on('mousemove', function (e){
		$mouse_follow_btn.addClass("active is-moving");
		var sxPos = e.pageX / $(this).width() * 100 - 50;
		var syPos = e.pageY / $(this).height() * 100 - 50;
		
		TweenMax.to($mouse_follow_btn, 2, {
			x: e.clientX,
			y: e.clientY,
			ease: Expo.easeOut,
			duration: 1
		});
	});

	$("[data-mouse-pointer='view']")
		.on('mouseenter', function (e){
			$mouse_follow_btn.addClass("view");
		})
		.on('mouseleave', function (e){
			$mouse_follow_btn.removeClass("view");
		})
}

