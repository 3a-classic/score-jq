var indexPageURL='../index.html';

/*
 * ページ遷移次の初期処理
 */
$('#login_Page').on('pageshow',function(){
	currentPage='login';

});

//ログインボタンを押したときの処理
$(document).on('tap', '#login_execute',function(){
	usercheck();
});


/*
 * ユーザの存在チェック
 */
function usercheck(){
	//登録データの整形
	var loginUser={"name":$('#userName').val()};
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(loginUser),
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/login/',
		dataType: 'json',
//		jsonpCallback: 'json',
		success : function(data) {
			console.dir(data);
			if(data.status == "success"){
				var userInformation = loginUser;
				//セッションにユーザ情報を保存する。
				saveStorage('userInformation', JSON
						.stringify(userInformation));
				location.href=indexPageURL;
		    }else{
		    	$('#login_ResultArea').html('<div font color="#ff0000">ユーザが存在しません。</div>');
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。" );
		}
	});
}