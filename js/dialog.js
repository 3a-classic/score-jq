var dialog_Request={};

/*
 * ページ遷移時の初期処理
 */

$('#dialog_Page').on('pageshow',function(){

	saveCurrentPage('dialog');

	//ストレージからリクエストデータを取得する
	dialog_Request = JSON.parse(getStorage('dialog_Request'));

	//初期表示チーム一覧の取得
	makeDialogHtml(dialog_Request);


});

/*
 * ダイアログ表示内容生成メソッド
 */
function makeDialogHtml(dialog){
	$('#dialog_content').html(dialog.content);
	$('#dialog_link').attr("href", dialog.url);
	$('#dialog_link').html(dialog.linkTitle);
};


/*
 * ボタンを押した時の処理
 */

//$(document).on('tap', '#index_Page',function(obj){
//
//	var buttonId = obj.target.id;
//
//	if(buttonId){
//		var scoreViewSheet_Request = {team :buttonId};
//		saveStorage('scoreViewSheet_Request',JSON.stringify(scoreViewSheet_Request));
//	}
//});

