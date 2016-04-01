var ws;
var currentPage;
var timeLineCount;
var userInformation;
/*
 * アプリ起動時に一度だけ必要な処理
 */
$(document).on(
		'pagecreate',
		function(){
			//セッションストレージのチェック
			if (typeof sessionStorage === 'undefined') {
				window.alert("このブラウザはWeb Storage機能が実装されていません。対応したブラウザで使用してください");
			}
			timeLineCount = JSON.parse(getStorage('timeLineCount'));
			console.log('【debug】METHOD;common-redy;timeLinecount='+timeLineCount+' ,unReadedMessageNum='+timeLineCount.unReadedMessageNum);
			checkTimeLineCount();

});
//Ajaxのページ遷移を無効に
$(document).bind("mobileinit", function(){
	$.mobile.ajaxFormsEnabled = false;
});
/*
 * 各ページごとに必須な処理
 */
function eachPageDoFirst(rootDir){
	console.log('【debug】METHOD;eachPageDoFirst;currenPage='+currentPage);
	//ログインチェック
	loginCheck(rootDir);
	checkTimeLineCount();
	//timeLine用のファンクション
	if(!ws){
		socketOpen();
	}
	//未読件数の挿入
	insertunReadedMessageNum();

	//管理者ページの表示非表示
	if(!userInformation.admin){
		$('.admin').css('display','none');
	}

}

/*
 * timeLine用のファンクション
 * ソケット通信でメッセージを送受信する。
 * currentPageがtimeLineの場合は画面の書き換え処理も行う。
 */
function socketOpen(){
	//現時点でのデータを取得
	getTimeLineData();
	// WebSocket の初期化
    ws = new WebSocket('ws://'+ config.apiHost + '/'+config.webSocketUrl+'/timeLine');

    // イベントハンドラの設定
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onclose = onClose;
    ws.onerror = onError;

    // Windowが閉じられた(例：ブラウザを閉じた)時のイベントを設定
    $(window).unload(function() {
        ws.onclose(); // WebSocket close
    });

}

//接続イベント
function onOpen(event) {
console.log('socket open!');
timeLineCount = JSON.parse(getStorage('timeLineCount'));
insertunReadedMessageNum();
//socketが途切れないように定期的にkeep-aliveメッセージを送信
//setTimeout(ws.send("ALIVE"), 5500);
}

//メッセージ受信イベント
//storageのデータに追加分のメッセージおよびスレッドデータを追加する。
//timeLineページを開いている場合は画面の描写も行う。
function onMessage(event) {
	console.log('【debug】socket onMessage'+event.data)
	var isNewThread = false;
	if (event && event.data) {
		var pushedMessage = JSON.parse(event.data);
		var pushedThreadId = pushedMessage.threadId;
		var pushedMessageReaction;
		var pushedThreadColor =pushedMessage.colorCode;;
		timeLineCount = JSON.parse(getStorage('timeLineCount'));
		//thread追加の場合の処理
		if(!pushedMessage.reactions){
			isNewThread=true;
			timeLineData.threads.unshift(pushedMessage);
		}else{
			//メッセージ追加の場合の処理
	    	pushedMessageReaction= pushedMessage.reactions[0];
	    	for (var i=0;i<timeLineData.threads.length;i++){
	    		tmpThread = timeLineData.threads[i];
	    		if(tmpThread.threadId==pushedThreadId){
	    			if(tmpThread.reactions == null){
	    				tmpThread.reactions=[pushedMessageReaction];
	    			}else{
	    			tmpThread.reactions.unshift(pushedMessageReaction);
	    			}
	    			tmpThread.colorCode=pushedMessage.colorCode;
	    		}
	    	}
		}
		saveStorage('timeLineData', JSON.stringify(timeLineData));

		currentPage=getCurrentPage();
		//表示ページがタイムラインの場合は画面に描写する。
		if(currentPage=='timeLine'){
			if(isNewThread==true){
				var insertHTML=makeHtmlThread(pushedMessage)
				setColorCode(pushedMessage.threadId,pushedMessage.colorCode);
				//Htmlの挿入
				$("#timeLine_ResultArea").prepend(insertHTML);
			//リアクション追加でリアクションが開かれている場合
			}else if(isNewThread==false && $('#'+pushedThreadId).attr('messagestatus') == 'open'){
				var insertHTML=makeHtmlReaction(pushedMessage.reactions[0]);
				$('#otherReaction-'+pushedThreadId).prepend(insertHTML);
				setColorCode(pushedThreadId,pushedThreadColor);
			//リアクション追加でリアクションが開かれていない場合
			}else if(isNewThread==false && $('#'+pushedThreadId).attr('messagestatus') == 'close'){
				setColorCode(pushedThreadId,pushedThreadColor);
			}
		}
		//スレッドが追加された場合は未読件数を表示する（タイムライン画面の場合は行わない）
		if(currentPage!='timeLine' && isNewThread==true){
				timeLineCount.unReadedMessageNum++;
				saveStorage('timeLineCount', JSON.stringify(timeLineCount));
				insertunReadedMessageNum();
		}
	}
}

//エラーイベント
function onError(event) {
 console.log('socketErr:'+event);
}

//切断イベント
function onClose(event) {
	console.log("切断しました。10秒後に再接続します。(" + event.code + ")" +'接続試行回数' + timeLineCount.connectionTryCnt +'<br>');
	ws = null;
	timeLineCount.connectionTryCnt ++;
	setTimeout('socketOpen()', 10000);

}
//メッセージ送信イベント
function sendMessageToSocket(Message){
    ws.send(Message); // WebSocketを使いサーバにメッセージを送信
}

/*
* 初回データ取得時のメソッド
* タイムラインのデータ全てを取得する
*/
function getTimeLineData(){
	console.log('【debug】GET;request;common-getTimeLineData;-');
$
	.ajax({
		type : 'GET',
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/timeLine/',
		dataType : 'json',
		success : function(data) {
			timeLineData = data;
			//console.log('【debug】GET;response;getTimeLineData'+JSON.stringify(data));
			saveStorage('timeLineData', JSON
					.stringify(timeLineData));
			//未読件数作成処理
			timeLineCount = JSON.parse(getStorage('timeLineCount'));
			timeLineCount.unReadedMessageNum = data.threads.length - timeLineCount.watchedThreadCount;
			saveStorage('timeLineCount', JSON
					.stringify(timeLineCount));
			insertunReadedMessageNum();


		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus + ":\n"
					+ errorThrown + ":\n" + XMLHttpRequest);
		}
	});

}

function insertunReadedMessageNum(){
	timeLineCount = JSON.parse(getStorage('timeLineCount'));
	console.log('【debug】METHOD;insertunReadedMessageNum;timeLineCount:'+timeLineCount);
	var messege = '';
	if(timeLineCount.unReadedMessageNum != 0 ){
		messege = '未読'+timeLineCount.unReadedMessageNum;
	}
	$('.timeLineFooter').html(messege);
}

function checkTimeLineCount(){
	timeLineCount = JSON.parse(getStorage('timeLineCount'));
	if(timeLineCount == null || timeLineCount == undefined){
		timeLineCount ={'unReadedMessageNum':0,
				'watchedThreadCount':0,
				'connectionTryCnt':0};
		saveStorage('timeLineCount', JSON.stringify(timeLineCount));
	}
}

function loginCheck(rootDir){
	var loginPageURL=rootDir+'/facebookLogin.html';

	if(config.isDevelop){
		// テスト用
		userInformation={'userId':'125216844506488','userName':'kiyota','admin':true,'team':'C'};
		saveStorage('userInformation', JSON.stringify(userInformation));
	}else{
		userInformation =JSON.parse(getStorage('userInformation'));
		if(!userInformation){
		location.href=loginPageURL;
		};
	}
}

