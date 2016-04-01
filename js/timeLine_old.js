var timeLine_executeRequest={};
//var connectionTryCnt = 0;
//var ws = null;
var stampHtml='<button class="greatButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/great.png" class="imgButtonI"></button> ' +
	'<button class="angryButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/angry.png" class="imgButtonI"></button> ' +
	'<button class="sadButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/sad.png" class="imgButtonI"></button> ' +
	'<button class="vexingButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/vexing.png" class="imgButtonI"></button> ';
var userInformation;

/*
 * ページ遷移時の初期処理
 */
$('#timeLine_Page').on(
		'pageshow',
		function() {
			currenPage='timeLine';
			//eachPageDoFirst('.');

			if(ws == null){
				var atFirst=$.when(
					// WebSocket作成
					socketOpen()
				);
				atFirst.done(function(){
					// 現在の最新情報を取得する
					writeAllThread()
				});
			}else{
				writeAllThread()
			}

});

$(document).on(
  'tap',
  'a.threadLink',
 function(obj){
	  		var selectedContent = obj.srcElement.currentSrc;
	  		var selectedthreadId = obj.currentTarget.closest('.thread').id;
	  		var selectedthreadColorRGB = $('#'+selectedthreadId).css('background-color');
	  		var selectedthreadColor16 = $.fmtColor( selectedthreadColorRGB );
	  		var isMessageOpen = $('#'+selectedthreadId).attr('messagestatus');
	  		if(obj.target.tagName=='IMG'){

		  		if(userInformation==null ||userInformation==undefined){
		  			userInformation =JSON.parse(getStorage('userInformation'));
		  		}
//		  		console.dir(userInformation.name);
		  		var sendMessage = {
		  			             "threadId": selectedthreadId,
		  			             "colorCode": selectedthreadColor16,
		  			             "reactions": [
		  			              {
		  			               "userId":userInformation.userId,
		  			               "name": userInformation.userName,
		  			               "contentType": 1,
		  			               "content": selectedContent
		  			              }
		  			             ]
		  			   			};
		  		console.log('【debug】send To Socket:' +JSON.stringify(sendMessage) );
		  		sendMessageToSocket(JSON.stringify(sendMessage))
		  		if(isMessageOpen == 'close'){
		  			openMessage(selectedthreadId);
		  		}
	//	        ws.send(sendMessage); // WebSocketを使いサーバにメッセージを送信
	  		}else if(isMessageOpen == 'close'){
	  			openMessage(selectedthreadId);
	  		}else if(isMessageOpen == 'open'){
		  		var toDeleteId = '#messageArea-'+selectedthreadId;
		  		$('#'+selectedthreadId).attr({messagestatus:'close'});
		  		$(toDeleteId).html('');
	  		}
});

//メッセージ一覧をクローズする処理
$(document).on(
		  'tap',
		  'a.messageLink',
		 function(obj){
			  		var toDeleteId = obj.currentTarget.closest('.message').id;
			  		var separatedIdList = toDeleteId.split('-');
			  		var threadId=separatedIdList[1];
			  		$('#'+threadId).attr({messagestatus:'close'});
			  		$('#'+toDeleteId).html('');
		});

/*
 * 初回表示時のメソッド
 * タイムラインのデータ全てを描写する
 */
function writeAllThread(){
	timeLineData = JSON.parse(getStorage('timeLineData'));
	console.log('【debug】METHOD;writeAllThread;timeLineData;'+JSON.stringify(timeLineData));
	//htmlの初期化
	$('#timeLine_ResultArea').html('');
	//スレッド情報からHTMLを作成
	var insertHtml = '';
	if(timeLineData.threads != null){
		//未読ライン形成用
		timeLineCount = JSON.parse(getStorage('timeLineCount'));
		var lastTimeWatchedThreadCount = timeLineCount.watchedThreadCount;
		timeLineCount.watchedThreadCount = timeLineData.threads.length;
		timeLineCount.unReadedMessageNum = timeLineCount.watchedThreadCount - lastTimeWatchedThreadCount;
		for (var i = 0; i < timeLineData.threads.length; i++) {
			if(i == timeLineCount.unReadedMessageNum && i != 0){
			//if(i == 3 && i != 0){
				insertHtml+='↑ 未読 ↑<HR color="red" align="right" width="90%">';
			}
			var tmpThread=timeLineData.threads[i];
			//insertHtml+='<div class="list-box" id="'+tmpThread.threadId +'"><a href="javascript:openMessage()">'+
			insertHtml+='<div class="list-box thread" id="'+tmpThread.threadId +'" messagestatus="close" style="background-color:'+tmpThread.colorCode+'">'+
				'<a href="javascript:void(0)" class="threadLink">'+
				'<div class="list-img"><img src="'+tmpThread.imgUrl+'" alt=""></div>'+
				'<div class="list-text">'+
				'<h2>'+tmpThread.msg+'</h2>' +
				//'<span class="list-cat">カテゴリ名</span><span class="list-date">日付</span>'+
				stampHtml+
				'</div></a></div><div id="messageArea-'+tmpThread.threadId+'" class="message"></div>';
		}
		timeLineCount.unReadedMessageNum=0;
		saveStorage('timeLineCount', JSON.stringify(timeLineCount));
		insertunReadedMessageNum();
	}else{
		insertHtml+='現在表示できるお知らせがありません。'
	}

	//Htmlの挿入
	$("#timeLine_ResultArea").append(insertHtml);
}

/*
 * メッセージ展開時のメソッド
 */
function openMessage(threadId){
	//表示対象のメッセージデータの取得
	timeLineData = JSON.parse(getStorage('timeLineData'));
	var targetTagId = '#messageArea-'+threadId;
	var threadList =timeLineData.threads;
	var displayMessage;
	for (var i=0;i<threadList.length;i++){
		tmpThread = threadList[i];
		if(tmpThread.threadId==threadId){
			displayMessage = tmpThread.reactions;
		}
	}
	//差し込むHTMLの生成
	var insertHTML='';
	$(targetTagId).html('');
	for (var i = 0; i < displayMessage.length; i++) {
		var tmpMessage=displayMessage[i];
		insertHTML+='<div class="list-box"><a href="javascript:void(0)" class="messageLink">'+
		'<div class="list-img-message"><img src="'+tmpMessage.content+'" alt=""></div>'+
		'<div class="list-text-message">'+
		'<h2>'+tmpMessage.name+'</h2>' +
		'</div></a></div>';
	}
	$('#'+threadId).attr({messagestatus:'open'});
	$(targetTagId).append(insertHTML);
}