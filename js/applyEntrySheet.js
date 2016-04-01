var applyEntrySheet_Request = {};
var applyEntrySheet_executeRequest = {};

/*
 * ページ遷移次の初期処理
 */
$('#applyEntrySheet_Page').on('pageinit', function() {

	saveCurrentPage('applyEntrySheet');

	// ストレージからリクエストデータを取得する
	applyEntrySheet_Request = JSON.parse(getStorage('applyEntrySheet_Request'));


	// 表示データの取得
	getScoreData(applyEntrySheet_Request);
});

/*
 * 登録済みスコアデータの取得メソッド
 */
function getScoreData(urlParm) {
  var request_team =applyEntrySheet_Request.team;

	$.ajax({
		type : 'GET',
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/scoreViewSheet/' + request_team,
		success : function(data) {
			// 取得データを挿入する
			for (var i = 0; i < 4; i++) {
				// プレイヤーの挿入
				$('#player' + (i + 1)).html(data.member[i]);
				$('#' + (i + 1) + '-apply').attr("value", data.apply[i]);

			}
			// データ登録用リスエストにデータを入れなおす
			applyEntrySheet_executeRequest.team = data.team;
			applyEntrySheet_executeRequest.excnt = data.excnt;
			applyEntrySheet_executeRequest.member = data.member;
			applyEntrySheet_executeRequest.userIds = data.userIds;
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus + ":\n"
					+ errorThrown + ":\n" + XMLHttpRequest);
		}
	});
};

/*
 * 確定ボタンを押した時の処理 入力されたデータを登録する
 */

$(document).on(
		'tap',
		'#applyEntrySheet_execute',
		function() {

			if (applyEntrySheet_executeRequest !== undefined) {
				// 登録データの整形
				applyEntrySheet_executeRequest.apply = [
						parseInt($('#1-apply').val()),
						parseInt($('#2-apply').val()),
						parseInt($('#3-apply').val()),
						parseInt($('#4-apply').val()) ];

				 $.ajax({
				 type: 'POST',
				 contentType: 'application/json',
				 data: JSON.stringify(applyEntrySheet_executeRequest),
				 url :
					 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/applyScore/'+applyEntrySheet_executeRequest.team,
				 dataType: 'json',
				 // jsonpCallback: 'json',
				 success : function(data) {
				 if(data.status == "success"){
				 //登録成功ダイアログを表示する。
				 makeDialog('申請スコアの登録が完了しました','./scoreViewSheet.html','一覧画面に戻る');
				 }else{
				 makeDialog(data.status,'./scoreViewSheet.html','戻る');
				 }
				 },
				 error : function(XMLHttpRequest, textStatus, errorThrown) {
				 alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。" );
				 }
				 });

			} else {
				// TODO:システムエラー
			}

		});
