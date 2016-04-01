var timeLine_executeRequest={};
//var connectionTryCnt = 0;
//var ws = null;
var stampHtml='<div class="stampSet"><button class="greatButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/great.png" class="imgButtonI"></button> ' +
	'<button class="angryButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/angry.png" class="imgButtonI"></button> ' +
	'<button class="sadButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/sad.png" class="imgButtonI"></button> ' +
	'<button class="vexingButtion"><img src="https://s3-ap-northeast-1.amazonaws.com/3a-classic/reaction-icon/vexing.png" class="imgButtonI"></button></div> ';
var userInformation;

/*
 * ページ遷移時の初期処理
 */
$('#timeLine_Page').on(
		'pageshow',
		function() {
			saveCurrentPage('timeLine');
			eachPageDoFirst('.');

			if(ws == null){
				var atFirst=$.when(
					// WebSocket作成
					socketOpen()
				);
				atFirst.done(function(){
					// 現在の最新情報を取得する
					writeAllThread();
				});
			}else{
				writeAllThread();
			}
			setTimeout(scrollToUnread,1000);
});

/*
 * reactionのボタンを押した時の処理
 */


$(document).on(
  'tap',
  '.stampSet button',
 function(obj){
//	  console.log('【debug】ACTION;tap-stampSet-button;obj=');
//	  console.dir(obj)
	  		var target = obj.target || obj.srcElement;
//	  		var selectedContent = target.currentSrc;
	  		var selectedContent = $(target).attr('src');
	  		var currentTarget=$(obj.currentTarget);
	  		var selectedthreadSelecter = currentTarget.closest('.oneThreadArea');
	  		var selectedthreadId = $(selectedthreadSelecter).attr('id');
	  		var selectedthreadColorRGB = $('#thread-'+selectedthreadId).css('background-color');
	  		var selectedthreadColor16 = $.fmtColor( selectedthreadColorRGB );
	  		var isMessageOpen = $('#'+selectedthreadId).attr('messagestatus');
	  		if(userInformation==null ||userInformation==undefined){
	  			userInformation =JSON.parse(getStorage('userInformation'));
	  		}
	  		var sendMessage = {
	  			             "threadId": selectedthreadId,
	  			             "colorCode": selectedthreadColor16,
	  			             "reactions": [
	  			              {
	  			               "userId":userInformation.userId,
	  			               "userName": userInformation.userName,
	  			               "contentType": 1,
	  			               "content": selectedContent
	  			              }
	  			             ]
	  			   			};
	  		console.log('【debug】send To Socket:' +JSON.stringify(sendMessage) );
	  		sendMessageToSocket(JSON.stringify(sendMessage));
	  		if(isMessageOpen == 'close'){
	  			openMessage(selectedthreadId);
	  		}
});

//メッセージ一覧をオープンクローズする処理
$(document).on(
		  'tap',
		  '.arrow_otherReaction',
		 function(obj){
//			console.log('【debug】ACTION;tap-viewOhtreReaction');
			  var currentTarget=$(obj.currentTarget);
			var selectedthreadSelecter = currentTarget.closest('.oneThreadArea');
			var selectedthreadId = $(selectedthreadSelecter).attr('id');
			var isMessageOpen = $('#'+selectedthreadId).attr('messagestatus');
			console.log(isMessageOpen)
	  		if(isMessageOpen == 'close'){
	  			openMessage(selectedthreadId);
	  		}else if(isMessageOpen == 'open'){
	  			closeMessage(selectedthreadId);
	  		}
		});

/*
 * 初回表示時のメソッド
 * タイムラインのデータ全てを描写する
 */
function writeAllThread(){
	timeLineData = JSON.parse(getStorage('timeLineData'));
//	console.log('【debug】METHOD;writeAllThread;timeLineData;'+JSON.stringify(timeLineData));
	//htmlの初期化
	$('#timeLine_ResultArea').html('');
	//スレッド情報からHTMLを作成
	var insertHtml = '';
	if(timeLineData.threads != null){
		//未読ライン形成用
		timeLineCount = JSON.parse(getStorage('timeLineCount'));
		console.log('watchedThreadCountBefore'+timeLineCount.watchedThreadCount)
		var lastTimeWatchedThreadCount = timeLineCount.watchedThreadCount;
		timeLineCount.watchedThreadCount = timeLineData.threads.length;
		console.log('lastTimeWatchedThreadCount'+lastTimeWatchedThreadCount)
		console.log('watchedThreadCount'+timeLineCount.watchedThreadCount)
		timeLineCount.unReadedMessageNum = timeLineCount.watchedThreadCount - lastTimeWatchedThreadCount;
		console.log('【debug】METHOD;writeAllThread;timeLineCount='+JSON.stringify(timeLineCount));
		var isUnreadLineInsert =false;
		for (var i = 0; i < timeLineData.threads.length; i++) {
			if(i==timeLineCount.unReadedMessageNum && i != 0){
			//if(i == 3 && i != 0){
				insertHtml+='<div id="unread">↑ 未読 ↑</div>';
				isUnreadLineInsert=true;
			}
			var tmpThread=timeLineData.threads[i];
			insertHtml += makeHtmlThread(tmpThread);
			setColorCode(tmpThread.threadId,tmpThread.colorCode);

		}
		if(isUnreadLineInsert==false && timeLineCount.unReadedMessageNum != 0){
			insertHtml+='<div id="unread">↑ 未読 ↑</div>';
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
	var targetTagId = '#otherReaction-'+threadId;
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
	if(displayMessage == null){
		 insertHTML='<div class="noReaction_Box"><div class="noReaction">No Reaction</div></div>';
	}else{
		for (var i = 0; i < displayMessage.length; i++) {
			var tmpMessage=displayMessage[i];
				insertHTML += makeHtmlReaction(tmpMessage);
		}
	}
	$('#otherReactionMessage-'+threadId ).html('Hide Other Reactions');
	$('#'+threadId).attr({messagestatus:'open'});
//	console.log('【debug】METHOD;openMessage;insertHTML='+insertHTML);
	$(targetTagId).append(insertHTML);
}

/*
 * メッセージをたたむ処理
 */
function closeMessage(threadId){
	var toDeleteId = '#otherReaction-'+threadId;
	$('#'+threadId).attr({messagestatus:'close'});
	$('#otherReactionMessage-'+threadId ).html('View Other Reactions');
	$(toDeleteId).html('');
}

/*
 * 吹き出しに色をつける処理
 */
function setColorCode(threadId,colorCode){
//	console.log('【debug】METHOD;setColorCode;threadId='+threadId+', colorCode='+colorCode);
	var targetId='#thread-'+threadId;
	$(targetId).css('background-color',colorCode);

}

/*
 * スレッド一つ分のHTMLを生成する処理
 */
function makeHtmlThread(tmpThread){
	var returnHtml ='<div class="oneThreadArea" id="'+tmpThread.threadId+'" messagestatus="close">'+
	'<div class="thread_Box">'+
	'<div class="thread_image">'+
	'<img src="'+tmpThread.imgUrl+'" alt="threadPhoto" />'+
	'</div>'+
	'<div class="arrow_thread" id="thread-'+tmpThread.threadId+'" style="background-color:'+tmpThread.colorCode+'">'+
		'<div style="text-align:left;">'+tmpThread.userName+'</div>'+
		'<br>'+
		'<div style="float:left;">'+tmpThread.msg+'</div>'+
		'<div style="float:right;">'+changeDateFormat(tmpThread.createdAt,'hhmm')+'</div>'+
	'</div><!-- /.arrow_thread -->'+
	'</div><!-- /.thread_Box -->'+
	'<div class="reaction_Box">'+
	'<div class="reaction_image">'+
	'<img src="https://graph.facebook.com/'+userInformation.userId+'/picture" alt="userPhoto" />'+
	'</div>'+
	'<div class="arrow_reaction">'+
	'Enter Your Reaction!!'+
	stampHtml+
	 '</div><!-- /.arrow_reaction -->'+
	 '</div><!-- /.reaction_Box -->'+
	 '<div class="otherReaction_Box">'+
		'<button class="arrow_otherReaction" id="otherReactionMessage-'+tmpThread.threadId+'">'+
		'View Other Reactions'+
	     '</button><!-- /.arrow_otherReaction -->'+
	     '</div><!-- /.otherReaction_Box -->'+
	     '<div class="otherReactionInsertArea" id="otherReaction-'+tmpThread.threadId+'"></div>'+
	     '</div><!-- /.oneThreadArea -->';
	return returnHtml;
}

/*
 * リアクション一つ分のHTMLを生成する処理
 */
function makeHtmlReaction(tmpMessage){
//	console.log('【debug】METHOD;makeHtmlReaction;request='+tmpMessage);
	var returnHtml ='<div class="reaction_Box">'+
	'<div class="reaction_image">'+
	'<img src="https://graph.facebook.com/'+tmpMessage.userId+'/picture" alt="userPhoto" />'+
	'</div>'+
	'<div class="arrow_reaction">'+
	'<div style="float:left">'+tmpMessage.userName+'</div>'+
	'<img class="othreReactionStamp" src="'+tmpMessage.content+'" alt=""></div>'+
	 '</div><!-- /.arrow_reaction -->'+
	 '</div><!-- /.reaction_Box -->';
	return returnHtml;
}

/*
 * 未読ラインにスクロールを合わせる処理
 */
function scrollToUnread(){
    //画面の高さを取得
    var wH = $(window).height();
	//$('#unread').get(0).scrollIntoView(true);
	var SelecterPosition = $("#unread").offset().top;
	var targetPosition=SelecterPosition-wH+100;
	$("html,body").animate({
	    scrollTop : targetPosition
	}, {
	    queue : false
	});
}