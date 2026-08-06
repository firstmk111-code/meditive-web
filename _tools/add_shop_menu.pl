#!/usr/bin/perl
# MEDITIVE : 기존 페이지 GNB에 "상품몰" 메뉴 + 장바구니 아이콘 + 푸터 Shop 링크 추가
use strict;
use warnings;
use utf8;
binmode(STDOUT, ':encoding(UTF-8)');

# file => prefix
my %FILES = (
	'home.html'                     => '',
	'kr/service/logo.html'          => '../../',
	'kr/service/catalog.html'       => '../../',
	'kr/service/leaflet.html'       => '../../',
	'kr/service/digital.html'       => '../../',
	'kr/service/poster.html'        => '../../',
	'kr/service/homepage.html'      => '../../',
	'kr/portfolio/all.html'         => '../../',
	'kr/guide/binding.html'         => '../../',
	'kr/guide/paper.html'           => '../../',
	'kr/guide/brochure_size.html'   => '../../',
	'kr/marketing/all_in_one.html'  => '../../',
	'kr/contact/inquiry.html'       => '../../',
);

# dep1 재매핑 : 상품몰이 2번으로 들어가면서 뒤 메뉴가 한 칸씩 밀린다
my %DEP1 = ( 2 => 3, 3 => 4, 4 => 5, 5 => 6 );

for my $f (sort keys %FILES) {
	my $P = $FILES{$f};

	open(my $in, '<:encoding(UTF-8)', $f) or do { print "SKIP (열기실패) $f\n"; next; };
	local $/; my $s = <$in>; close($in);
	my $orig = $s;

	# 이미 적용된 파일은 건너뛴다
	if ($s =~ /kr\/shop\/list\.html/) { print "PASS (이미적용) $f\n"; next; }

	# ---------- 1) gnb 번호 뒤로 밀기 (내림차순) ----------
	$s =~ s/class="gnb5"/class="gnb6"/g;
	$s =~ s/class="gnb4"/class="gnb5"/g;
	$s =~ s/class="gnb3"/class="gnb4"/g;
	$s =~ s/class="gnb2"/class="gnb3"/g;

	# ---------- 2) 새 gnb2(상품몰) 블록 삽입 ----------
	my $ins_ok = 0;
	if ($s =~ /^([ \t]*)<li class="gnb3">/m) {
		my $ind = $1;
		my $i2 = $ind . "\t";
		my $i3 = $ind . "\t\t";
		my $blk = $ind . qq{<li class="gnb2">\n}
		        . $i2  . qq{<a href="${P}kr/shop/list.html?cat=all">상품몰</a>\n}
		        . $i2  . qq{<div class="gnb-2dep"><ul>\n}
		        . $i3  . qq{<li><a href="${P}kr/shop/list.html?cat=print"><span>병원 인쇄물</span></a></li>\n}
		        . $i3  . qq{<li><a href="${P}kr/shop/list.html?cat=promo"><span>홍보물</span></a></li>\n}
		        . $i3  . qq{<li><a href="${P}kr/shop/list.html?cat=form"><span>서식류</span></a></li>\n}
		        . $i3  . qq{<li><a href="${P}kr/shop/list.html?cat=card"><span>명함/봉투</span></a></li>\n}
		        . $i3  . qq{<li><a href="${P}kr/shop/list.html?cat=package"><span>개원 패키지</span></a></li>\n}
		        . $i3  . qq{<li><a href="${P}kr/shop/list.html?cat=reorder"><span>재주문 상품</span></a></li>\n}
		        . $i2  . qq{</ul></div>\n}
		        . $ind . qq{</li>\n};
		$s =~ s/^([ \t]*)<li class="gnb3">/$blk$1<li class="gnb3">/m;
		$ins_ok = 1;
	}

	# ---------- 3) 헤더 장바구니 아이콘 + 마이페이지 연결 ----------
	my $cart_ok = 0;
	if ($s =~ s{<a href="[^"]*" class="header-member-btn" title="마이페이지"><i class="xi-profile-o"></i></a>}
	           {<a href="${P}kr/shop/cart.html" class="header-cart-btn" title="장바구니"><i class="xi-cart-o"></i><em class="cart-count">0</em></a><a href="${P}kr/shop/mypage.html" class="header-member-btn" title="마이페이지"><i class="xi-profile-o"></i></a>}) {
		$cart_ok = 1;
	}

	# ---------- 4) 푸터 사이트맵에 Shop 추가 ----------
	my $foot_ok = 0;
	if ($s =~ s{(<li><a href="\Q$P\Ekr/service/logo\.html"><span>Service</span></a></li>)}
	           {$1 . qq{\n\t\t\t\t\t\t<li><a href="${P}kr/shop/list.html?cat=all"><span>Shop</span></a></li>}}e) {
		$foot_ok = 1;
	}

	# ---------- 5) 서브 비주얼 location1 드롭다운에 상품몰 추가 ----------
	my $loc_ok = 0;
	if ($s =~ s{(<li><a href="\Q$P\Ekr/service/logo\.html">서비스</a></li>)}
	           {$1 . qq{\n\t\t\t\t\t\t\t\t\t\t\t\t<li><a href="${P}kr/shop/list.html?cat=all">상품몰</a></li>}}e) {
		$loc_ok = 1;
	}

	# ---------- 6) shop.css / shop.js 연결 ----------
	if ($s !~ /css\/shop\.css/) {
		$s =~ s{(<script type="text/javascript" src="\Q$P\Ejs/vendor/jquery-3\.6\.0\.min\.js"></script>)}
		       {qq{<link rel="stylesheet" href="${P}css/shop.css?ver=260806">\n} . $1}e;
	}
	if ($s !~ /js\/shop\.js/) {
		$s =~ s{(\s*)(</body>)}
		       {qq{\n\t<script>window.SHOP_BASE='${P}';</script>\n\t<script type="text/javascript" src="${P}js/shop.js?ver=260806"></script>\n} . $2}e;
	}

	# ---------- 7) dep1 재매핑 ----------
	if ($s =~ /<script>dep1=(\d);/) {
		my $old = $1;
		if (exists $DEP1{$old}) {
			my $new = $DEP1{$old};
			$s =~ s/<script>dep1=$old;/<script>dep1=$new;/;
		}
	}

	if ($s eq $orig) { print "NOCHANGE $f\n"; next; }

	open(my $out, '>:encoding(UTF-8)', $f) or do { print "SKIP (쓰기실패) $f\n"; next; };
	print $out $s; close($out);
	printf("OK  %-32s gnb:%d cart:%d foot:%d loc:%d\n", $f, $ins_ok, $cart_ok, $foot_ok, $loc_ok);
}
print "\n done.\n";
