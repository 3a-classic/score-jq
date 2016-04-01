/*jQueryMobileのグリッド生成用メソッド
 * グリッド数に応じて次のアルファベットを返却する。
 */
function nextGridType(data,num){
	var returnData = '';
	if(num == 3){
		switch (data){
		  case 'a':
		    returnData = 'b';
		    break;
		  case 'b':
		    returnData = 'c';
		    break;
		  case 'c':
		    returnData = 'a';
		    break;
		  default:
		    console.log("err：utils.js_nextGridType");
		    break;
		}
	}else if(num == 4){
		switch (data){
		  case 'a':
		    returnData = 'b';
		    break;
		  case 'b':
		    returnData = 'c';
		    break;
		  case 'c':
		    returnData = 'd';
		    break;
		  case 'd':
		    returnData = 'a';
		    break;
		  default:
		    console.log("err：utils.js_nextGridType");
		    break;
		}
	}else if(num == 5){
		switch (data){
		  case 'a':
		    returnData = 'b';
		    break;
		  case 'b':
		    returnData = 'c';
		    break;
		  case 'c':
		    returnData = 'd';
		    break;
		  case 'd':
		    returnData = 'e';
		    break;
		  case 'e':
		    returnData = 'a';
		    break;
		  default:
		    console.log("err：utils.js_nextGridType");
		    break;
		}
	};
	return returnData;
};


/*
 * URLのリクエストパラメータを取得するメソッド
 */
function GetQueryString()
{
    var urlArgMap = {};
    if( 1 < window.location.search.length )
    {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = window.location.search.substring( 1 );

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split( '&' );

        for( var i = 0; i < parameters.length; i++ )
        {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[ i ].split( '=' );

            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );

            // パラメータ名をキーとして連想配列に追加する
            urlArgMap[ paramName ] = paramValue;
        }
    }
    return urlArgMap;
}



/*
 * セッションストレージにデータを保存するメソッド
 */
function saveStorage(key, value){

	if (typeof sessionStorage !== 'undefined') {
		if(key && value){
			var storage = sessionStorage;
			storage.setItem(key,value);
		}else{
			//TODO:システムエラー
		}
	}else{
		window.alert("このブラウザはWeb Storage機能が実装されていません。対応したブラウザで使用してください");
	}
}


/*
 * セッションストレージからデータを取得するメソッド
 */
function getStorage(key){

	var returnParm;
	if (typeof sessionStorage !== 'undefined') {
		if(key){
			var storage = sessionStorage;
			returnParm = storage.getItem(key);
		}else{
			//TODO:システムエラー
		}
	}else{
		window.alert("このブラウザはWeb Storage機能が実装されていません。対応したブラウザで使用してください");
	}
	if(returnParm){
		//TODO:システムエラー
	}

	return returnParm;
}


/*　
 * ダイアログ作成用メソッド
 * 	@pram(コメント,遷移先URL,リンク表示名)　
 */
function makeDialog(content,url,linkTitle){

	if (typeof sessionStorage !== 'undefined') {
		if(content && url && linkTitle){
			var dialog_Request ={content:content
								,url:url
								,linkTitle:linkTitle};
			var storage = sessionStorage;
			storage.setItem('dialog_Request',JSON.stringify(dialog_Request));
			$.mobile.changePage('./dialog.html', {transition: 'pop', role: 'dialog'});
		}else{
			//TODO:システムエラー
		}
	}else{
		window.alert("このブラウザはWeb Storage機能が実装されていません。対応したブラウザで使用してください");
	}
}

/*
 * timeLineで渡される時間のフォーマットを変更する処理
 */
function changeDateFormat(inputDate,type){
	var year = inputDate.substring(0,4);
	var month = inputDate.substring(5,7);
	var day = inputDate.substring(8,10);
	var hh = inputDate.substring(11,13);
	var mm = inputDate.substring(14,16);
	var returnDate='';
	switch (type){
		case 'hhmm':
			returnDate=hh+':'+mm;
			break;
	}
	return returnDate;
}
/*
 * 表示ページを保存・取得する処理
 */
function saveCurrentPage(currentPage){
	saveStorage('currentPage', currentPage);
}
function getCurrentPage(){
	var currentPage = getStorage('currentPage');
	return currentPage;
}
