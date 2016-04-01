var galleryPageURL='./gallery.html'

/*
 * ページ遷移時の初期処理
 */

$('#galleryPopup_Page').on('pageshow',function(){

	saveCurrentPage('galleryPopup');

	//データの確認
	if(!selectedPhotoNum ||!imgPathArray || imgPathArray.length == 0){
		location.href(galleryPageURL);
	}

	//ストレージからリクエストデータを取得する
//	dialog_Request = JSON.parse(getStorage('dialog_Request'));

	//初期表示チーム一覧の取得
	insertPhotoToHTML();

});

/*
 * ダイアログ表示内容生成メソッド
 */
function insertPhotoToHTML(dialog){
	var imgURL=imgPathArray[selectedPhotoNum];
	$('#selectedPhoto').attr('src',imgURL);
};
