var userInformation;
var indexPageURL='../index.html';

/*
 * ページ遷移次の初期処理
 */
$('#facebooklogin_Page').on('pageshow',function(){

	saveCurrentPage('login');
});


// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  console.log('statusChangeCallback');

//  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
	 // getMeInfo();
	  var facebookUserID=response.authResponse.userID;
	  console.log('【debug】facebookId='+facebookUserID);
	  usercheck(facebookUserID);
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
	// fix iOS Chrome
	if(navigator.userAgent.match('CriOS') ){
	   	window.open('https://www.facebook.com/dialog/oauth?client_id='+config.facebook_appID+'&redirect_uri='+ document.location.href +'&scope=email,public_profile', '', null);
	}
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into Facebook.';
    // fix iOS Chrome
	if(navigator.userAgent.match('CriOS') ){
	   	window.open('https://www.facebook.com/dialog/oauth?client_id='+config.facebook_appID+'&redirect_uri='+ document.location.href +'&scope=email,public_profile', '', null);
	}
  }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
FB.init({
  appId      : config.facebook_appID,
  cookie     : true,  // enable cookies to allow the server to access
                      // the session
  xfbml      : true,  // parse social plugins on this page
  version    : 'v2.2' // use version 2.2
});

// Now that we've initialized the JavaScript SDK, we call
// FB.getLoginStatus().  This function gets the state of the
// person visiting this page and can return one of three states to
// the callback you provide.  They can be:
//
// 1. Logged into your app ('connected')
// 2. Logged into Facebook, but not your app ('not_authorized')
// 3. Not logged into Facebook and can't tell if they are logged into
//    your app or not.
//
// These three cases are handled in the callback function.

FB.getLoginStatus(function(response) {
  statusChangeCallback(response);
});

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  //js.src = "//connect.facebook.net/en_US/sdk.js";
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function getMeInfo() {
  FB.api('/me', function(response) {
	  console.log('【debug】METHOD;getMeInfo;'+JSON.stringify(response));
  });

}



/*
 * ユーザの存在チェック
 */
function usercheck(facebookUserID){
	//登録データの整形
	var login_request={'userId':facebookUserID,
			'date':config.playDate};
	console.log('【debug】POST;request;facebookLogin;'+JSON.stringify(login_request));
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(login_request),
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/login/',
		dataType: 'json',
//		jsonpCallback: 'json',
		success : function(data) {
			console.log('【debug】POST;response;facebookLogin;'+JSON.stringify(data));
			if(data.status == "success"){
				var userInformation = {'userId':data.userId,
						'admin':data.admin,
						'userName':data.userName,
						'team':data.team};
				//セッションにユーザ情報を保存する。
				saveStorage('userInformation', JSON
						.stringify(userInformation));
				location.href=indexPageURL;
		    }else{
		    	$('#status').html('<div font color="#ff0000">ユーザが存在しません。</div>');
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。" );
		}
	});
}