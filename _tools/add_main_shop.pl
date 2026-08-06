#!/usr/bin/perl
# MEDITIVE : 메인 홈에 BEST PRODUCT / CATEGORY / PACKAGE 상품 영역 추가
use strict; use warnings; use utf8;
binmode(STDOUT, ':encoding(UTF-8)');

my $f = 'home.html';
open(my $in, '<:encoding(UTF-8)', $f) or die "open fail: $!";
local $/; my $s = <$in>; close($in);

if ($s =~ /id="mainShopBest"/) { print "PASS (이미적용)\n"; exit; }

my $blk = <<'HTML';
			<!-- ****************** 상품몰 : BEST PRODUCT ********************** -->
			<article id="mainShop" class="main-shop-best" data-scroll>
				<div class="main-shop-con area" id="mainShopBest">
					<div class="main-shop-head">
						<div>
							<strong class="main-sub-tit font-outfit">Best Product</strong>
							<h4 class="main-tit">병원에서 가장 많이 찾는 <br class="pc-br"><b>인기 상품입니다.</b></h4>
						</div>
						<a href="kr/shop/list.html?cat=all" class="main-shop-more">상품 전체보기 <i class="xi-angle-right-min"></i></a>
					</div>
					<ul class="shop-grid" id="bestGrid"></ul>
				</div>
			</article>

			<!-- ****************** 상품몰 : CATEGORY ********************** -->
			<article id="mainShop" class="main-shop-cat" style="background:#FAFCFC;" data-scroll>
				<div class="main-shop-con area">
					<div class="main-shop-head">
						<div>
							<strong class="main-sub-tit font-outfit">Category</strong>
							<h4 class="main-tit">필요한 디자인을 <br class="pc-br"><b>카테고리에서 찾아보세요.</b></h4>
						</div>
						<a href="kr/shop/list.html?cat=all" class="main-shop-more">전체 카테고리 <i class="xi-angle-right-min"></i></a>
					</div>
					<ul class="main-cat-grid">
						<li><a href="kr/shop/list.html?cat=print">
							<span class="num font-outfit">01</span>
							<strong class="tit">병원 인쇄물</strong>
							<span class="txt">진료카드 · 예약카드 · 차트홀더 · 사인물</span>
							<i class="arw xi-arrow-right"></i>
						</a></li>
						<li><a href="kr/shop/list.html?cat=promo">
							<span class="num font-outfit">02</span>
							<strong class="tit">홍보물</strong>
							<span class="txt">브로슈어 · 리플렛 · 포스터 · 배너</span>
							<i class="arw xi-arrow-right"></i>
						</a></li>
						<li><a href="kr/shop/list.html?cat=form">
							<span class="num font-outfit">03</span>
							<strong class="tit">서식류</strong>
							<span class="txt">문진표 · 동의서 · 진료기록지 · 안내문</span>
							<i class="arw xi-arrow-right"></i>
						</a></li>
						<li><a href="kr/shop/list.html?cat=card">
							<span class="num font-outfit">04</span>
							<strong class="tit">명함 · 봉투</strong>
							<span class="txt">원장 명함 · 직원 명함 · 약봉투 · 대봉투</span>
							<i class="arw xi-arrow-right"></i>
						</a></li>
						<li><a href="kr/shop/list.html?cat=package">
							<span class="num font-outfit">05</span>
							<strong class="tit">개원 패키지</strong>
							<span class="txt">개원 · 리뉴얼에 필요한 구성을 한 번에</span>
							<i class="arw xi-arrow-right"></i>
						</a></li>
						<li><a href="kr/shop/list.html?cat=reorder">
							<span class="num font-outfit">06</span>
							<strong class="tit">재주문 상품</strong>
							<span class="txt">이전 조건 그대로 다시 주문하기</span>
							<i class="arw xi-arrow-right"></i>
						</a></li>
					</ul>
				</div>
			</article>

			<!-- ****************** 상품몰 : PACKAGE ********************** -->
			<article id="mainShop" class="main-shop-pkg" data-scroll>
				<div class="main-shop-con area">
					<div class="main-shop-head">
						<div>
							<strong class="main-sub-tit font-outfit">Package</strong>
							<h4 class="main-tit">개원과 리뉴얼에 필요한 모든 것을 <br class="pc-br"><b>하나의 톤으로 준비합니다.</b></h4>
						</div>
						<a href="kr/shop/list.html?cat=package" class="main-shop-more">패키지 전체보기 <i class="xi-angle-right-min"></i></a>
					</div>
					<ul class="main-pkg-grid">
						<li><a href="kr/shop/detail.html?id=pk02">
							<span class="bg" style="background-image:url(images/portfolio/p02.jpg);"></span>
							<span class="badge font-outfit">OPENING</span>
							<div class="inner">
								<strong class="tit">개원 패키지</strong>
								<p class="txt">명함 · 진료카드 · 봉투 · 서식 · 리플렛까지, <br class="pc-br">개원에 필요한 인쇄물을 하나의 브랜드 톤으로 완성합니다.</p>
								<span class="price font-outfit">1,280,000원~ <em>VAT 별도</em></span>
							</div>
						</a></li>
						<li><a href="kr/shop/detail.html?id=pk03">
							<span class="bg" style="background-image:url(images/portfolio/p06.jpg);"></span>
							<span class="badge font-outfit">RENEWAL</span>
							<div class="inner">
								<strong class="tit">리뉴얼 패키지</strong>
								<p class="txt">이미 운영 중인 병원의 인쇄물 톤을 <br class="pc-br">하나로 다시 정리해 드립니다.</p>
								<span class="price font-outfit">1,680,000원~ <em>VAT 별도</em></span>
							</div>
						</a></li>
					</ul>
				</div>
			</article>

HTML

my $marker = '<!-- ****************** 메인컨텐츠 3 (Product) ********************** -->';
if (index($s, $marker) < 0) { die "marker not found\n"; }
$s =~ s/\Q$marker\E/$blk\t\t\t$marker/;

# BEST 상품 렌더 스크립트 추가
my $js = <<'JS';
	<script>
	(function(){
		var S = window.MTShop; if (!S) return;
		var best = [], i;
		for (i = 0; i < S.PRODUCTS.length && best.length < 3; i++) if (S.PRODUCTS[i].best) best.push(S.PRODUCTS[i]);
		S.renderGrid(document.getElementById('bestGrid'), best);
	})();
	</script>
JS
$s =~ s{(<script type="text/javascript" src="js/shop\.js\?ver=260806"></script>\n)}{$1 . $js}e;

open(my $out, '>:encoding(UTF-8)', $f) or die "write fail: $!";
print $out $s; close($out);
print "OK  home.html : BEST / CATEGORY / PACKAGE 삽입 완료\n";
