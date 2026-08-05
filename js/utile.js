var site_url = location.protocol + "//" + location.host;

//아이디 특수문자 유효성
function chkTxt(str){
	var reg_txt = /^[a-z0-9_-]{4,16}$/;
	if(!reg_txt.test(str)){
		  return false;
	}
	return true;
}

//아이디 영문/숫자조합
function chkTxt2(str){
	var reg_txt = /^.*(?=.{4,16})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
	if(!reg_txt.test(str)){
		  return false;
	}
	return true;
}


//비밀번호 유효성
function chkPwd(str,lang){

	var pw = str;
	var num = pw.search(/[0-9]/g);
	var eng = pw.search(/[a-z]/ig);
	var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

		if(pw.length < 4 || pw.length > 16){
			if(lang==1){//국문
			alert("비밀번호는 4~16자의 영문,숫자 조합으로 가능합니다.");
			} else if(lang==2){//영문
			alert("Password must be a combination of 4 to 16 letters and numbers.");
			} else if(lang==3){//중문
			alert("密码设定时, 请输入4~16位字符的英文字母与数字的组合。");
			} else if(lang==4){//일문
			alert("パスワードは半角英数字の組み合わせでご設定できます。");
			}
			return false;
		}
		if(pw.search(/₩s/) != -1){
			if(lang==1){//국문
			alert("비밀번호는 공백없이 입력해주세요.");
			} else if(lang==2){//영문
			alert("Please enter the password without any space.");
			} else if(lang==3){//중문
			alert("请输入不含有空格的密码。");
			} else if(lang==4){//일문
			alert("パスワードはスペースなしでご入力ください。");
			}
			return false;
		}
		if(num < 0 || eng < 0){
			if(lang==1){//국문
			alert("영문,숫자를 조합하여 입력해주세요.");
			} else if(lang==2){//영문
			alert("Please enter a combination of letters and numbers.");
			} else if(lang==3){//중문
			alert("请输入英文字母与数字的组合。");
			} else if(lang==4){//일문
			alert("半角英数字の組み合わせでご入力ください。");
			}
			return false;
		}
	 return true;

}



//우편번호
function openDaumPostcode() {
	new daum.Postcode({
		oncomplete: function(data) {
			$("input[name='zip_new']").val(data.zonecode);
			var add = data.roadAddress;
			var add2 = data.buildingName;
			var addr = add+" "+add2;
			$("input[name='add1']").val(addr);
			$("input[name='add2']").focus();
		}
	}).open();
}



//ID 체크
function id_check(){
	var form=document.join_form;
	var userid = form.userid.value
	var lang = form.lang.value
	var params ="userid="+userid+"&lang="+lang;

	if(form.userid.value=="") {
		if(lang==1){//국문
		alert("아이디를 입력해 주세요.");
		} else if(lang==2){//영문
		alert("Please enter ID");
		} else if(lang==3){//중문
		alert("请输入帐号。");
		} else if(lang==4){//일문
		alert("IDをご入力ください");
		}
		$("#id_check").empty();
		form.userid.focus();
	} else if(form.userid.value.length < 4 || form.userid.value.length > 16) {
		 if(lang==1){//국문
		 alert("아이디를 입력해 주세요.\n(4~15자)");
		 } else if(lang==2){//영문
		 alert("Please enter ID\n(4~15)");
		 } else if(lang==3){//중문
		 alert("请输入帐号。(4~15位字符)");
		 } else if(lang==4){//일문
		 alert("IDをご入力ください（４～15文字）");
		 }
		 $("#id_check").empty();
		 form.userid.focus();
	}else if(!chkTxt($.trim(form.userid.value))){ 
		 if(lang==1){//국문
		 alert("한글,특수문자,영문(대문자)는 사용 할 수 없습니다.");
		 } else if(lang==2){//영문
		 alert("Korean, special characters, and English (capital characters) can't be used.");
		 } else if(lang==3){//중문
		 alert("韩文字,特殊字元, 英文字母(大写)不可使用。");
		 } else if(lang==4){//일문
		 alert("한글,특수문자,영문(대문자)는 사용 할 수 없습니다.");
		 }
		 $("#id_check").empty();
		form.userid.focus();
	} else {

		if(lang==1){//국문
			var urls = site_url+"/kr/member/join_idcheck.php";
		} else if(lang==2){//영문
			var urls = site_url+"/en/member/join_idcheck.php";
		} else if(lang==3){//중문
			var urls = site_url+"/cn/member/join_idcheck.php";
		}
		$.ajax({
			url : urls,
			type: "get",
			data:	 params, 
			success:function(obj){ 
				$("#id_check").html(obj);
			}
		});
	}
}

$(function(){

	$('input[name=passwd]').keyup(function(){
		var pw = this.value;
		var num = pw.search(/[0-9]/g);
		var eng = pw.search(/[a-z]/ig);
		var form=document.join_form;
		var lang = form.lang.value
		if(pw.length >= 4){
			if( (pw.length < 4 || pw.length > 16) || (pw.search(/₩s/) != -1) || (num < 0 || eng < 0) ){
				if(lang==1){//국문
				$("#passwd_check").html(' <p class="join-sub-txt"><strong class="font-caution" id="passwd_check">패스워드가 정확하지 않습니다. 다시한번 입력해주세요. </strong></p>');
				} else if(lang==2){//영문
				$("#passwd_check").html(' <p class="join-sub-txt"><strong class="font-caution" id="passwd_check">Incorrect password. Please enter it again.</strong></p>');
				} else if(lang==3){//중문
				$("#passwd_check").html(' <p class="join-sub-txt"><strong class="font-caution" id="passwd_check">密码不正确。 请重新输入。</strong></p>');
				} else if(lang==4){//일문
				$("#passwd_check").html(' <p class="join-sub-txt"><strong class="font-caution" id="passwd_check">パスワードが間違っています。もう一度ご入力ください。</strong></p>');
				}
				return false;
			}else{
				$("#passwd_check").empty();
			}
		}
		return true;
	});

});