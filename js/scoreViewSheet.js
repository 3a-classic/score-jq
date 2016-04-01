var scoreEntrySheet_Request = {};
var applyEntrySheet_Request = {};
var scoreViewSheet_executeRequest={};
var watchingTabID;

/*
 * ページ遷移時の初期処理
 */
$('#scoreViewSheet_Page').on(
		'pageshow',
		function() {
			//indexページからの遷移以外の場合は自チームのデータを取得する
			if(getCurrentPage() != 'index'){
				setMyTeamToRequest();
			}

			saveCurrentPage('scoreViewSheet');
			eachPageDoFirst('.');

			// ストレージからリクエストデータを取得
			var scoreViewSheet_Request = JSON
					.parse(getStorage('scoreViewSheet_Request'));

			//ストレージにリクエストデータが無い場合は、自チームのデータを取得する
			if(scoreViewSheet_Request==null||scoreViewSheet_Request==undefined){
				setMyTeamToRequest();
			}

			// 表示データの取得
				getScoreData(scoreViewSheet_Request);
});

$(document).on(
		'pagebeforecreate',
		function() {
			//アクティブタブの切り替え
			changeTab();
});

$(document).on(
		'tap',
		'#outHoleTab',
		function() {
			watchingTabID='outHole';
			$('#outHoleTab').addClass('outHoleColor');
			$('#inHoleTab').removeClass('inHoleColor');
			saveStorage('watchingTabID',watchingTabID );
});
$(document).on(
		'tap',
		'#inHoleTab',
		function() {
			watchingTabID='inHole';
			$('#outHoleTab').removeClass('outHoleColor');
			$('#inHoleTab').addClass('inHoleColor');
			saveStorage('watchingTabID',watchingTabID );
});

$(document).on(
  'tap',
  '.exec-btn',
 function(obj){
  ret = confirm("スコアを確定します。よろしいですか？\n一度確定するとそれ以降スコアの変更はできません。");
  if (ret == true){
			$.ajax({
				type: 'POST',
				data:JSON.stringify(scoreViewSheet_executeRequest),
				contentType: 'application/json',
				url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/scoreViewSheet/'+scoreViewSheet_executeRequest.team,
				dataType: 'json',
				success : function(data) {
					if(data.status == "success"){
					//登録成功ダイアログを表示する。
						makeDialog('登録が完了しました','./scoreViewSheet.html','一覧画面に戻る');
				    }else{
						makeDialog('他の人によって更新済みです。','./scoreViewSheet.html','戻る');
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。" );
				}
			});
  }
});

/*
 * 申請ボタンを押した時の処理
 */
$(document).on(
		'tap',
		'.applyButton',
		function(obj) {
			console.dir(obj);
			var buttonId = obj.target.id;
			if (buttonId) {
				var separatedIdList = buttonId.split('-');
				var player = separatedIdList[1];
				saveStorage('applyEntrySheet_Request', JSON
						.stringify(applyEntrySheet_Request));
			} else {
				// TODO:システムエラー
			}

});

/*
 * スコアボタンを押した時の処理
 */
$(document).on(
		'tap',
		'.scoreButton',
		function(obj) {
			var buttonId = obj.target.id;

			if (buttonId) {
				var separatedIdList = buttonId.split('-');
				var hole = separatedIdList[0];
				var player = separatedIdList[1];
				scoreEntrySheet_Request.hole = hole;
				scoreEntrySheet_Request.player = player;
				saveStorage('scoreEntrySheet_Request', JSON
						.stringify(scoreEntrySheet_Request));
				// スコア入力ページに遷移する
				// $( ":mobile-pagecontainer" ).pagecontainer( "change",
				// "./scoreEntrySheet.html",{reload:true});

			} else {
				// TODO:システムエラー
			}

		});



/*
 * 確定ボタンを押した時の処理
 */
$(document).on(
		'tap',
		'#execute',
		function(obj) {
			$.ajax({
				type: 'POST',
				data:JSON.stringify(scoreViewSheet_executeRequest),
				contentType: 'application/json',
				url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/scoreViewSheet/'+scoreViewSheet_executeRequest.team,
				dataType: 'json',
//				jsonpCallback: 'json',
				success : function(data) {
					if(data.Status == "success"){
					//登録成功ダイアログを表示する。
						makeDialog('登録が完了しました','./scoreViewSheet.html','一覧画面に戻る');
				    }else{
						makeDialog('他の人によって更新済みです。','./scoreViewSheet.html','戻る');
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。" );
				}
			});
		});



/*
 * 表示用スコア取得メソッド
 */

function getScoreData(scoreViewSheet_Request) {
	var request_team = scoreViewSheet_Request.team;
	var type;
	$
			.ajax({
				type : 'GET',
				url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/scoreViewSheet/'
						+ request_team,
				dataType : 'json',
				success : function(data) {

					$("#inHoleResultArea").html('');
					$("#outHoleResultArea").html('');
					var insertHTML_common = '';
					var insertHTML_IN = '';
					var insertHTML_OUT = '';
					// プレイヤーのhtml生成
					var playerCount = Object.keys(data.member).length;
					insertHTML_common += '' + '<div class="ui-block-a" >'
							+ '<label class="ui-label hole">' + 'ホール'
							+ '</label>' + '</div>';
					type = 'b';
					for (var i = 0; i < playerCount; i++) {
						var j = i + 1;
						// プレイヤー名を挿入する
						insertHTML_common += '' + '<div class="ui-block-' + type
								+ ' ui-block-style" >'
								+ '<label class="ui-label player' + j
								+ '-view">' + data.member[i] + '</label>'
								+ '</div>';
						type = nextGridType(type, 5);
					}

					// 申請スコアを挿入する
					insertHTML_common += ''
							+ '<div class="ui-block-a ui-block-style applyButton">'
							+ '<a href="./applyEntrySheet.html"'
							+ 'class=" ui-btn ui-shadow ui-corner-all apply" data-ajax="false">'
							+ '申請値' + '</a>' + '</div>';
					type = 'b';

					for (var i = 0; i < playerCount; i++) {

						var apply;
						if (data.apply[i] > 0) {
							apply = "-";
						}else{
							apply = data.apply[i];
						}
						j = i + 1;
						insertHTML_common += '' + '<div class="ui-block-' + type
								+ ' ui-block-style applyButton">'
								+ '<a href="./applyEntrySheet.html"'
								+ 'class=" ui-btn ui-shadow ui-corner-all '
								+ 'apply-' + j
								+ '-view" data-ajax="false">' + apply
								+ '</a>' + '</div>';
						type = nextGridType(type, 5);
					}
					insertHTML_IN = insertHTML_common;
					insertHTML_OUT = insertHTML_common;

					//ホールのhtml生成
					var hole = data.hole;
					for (var i = 0; i < Object.keys(hole).length; i++) {
						var holenum = i + 1;
						var par = hole[i].par;
						var scoreList = hole[i].score;
						if(holenum >=1 && holenum <= 9){
							insertHTML_OUT +=''
									+ '<div class="ui-block-a ui-block-style holeButton" >'
									+ '<a href="./holeInformation.html?holeNum='+ holenum +'"'
									+ 'class=" ui-btn ui-shadow ui-corner-all"'
									+ 'id="' + holenum + '" data-ajax="false">'
									+ holenum + 'H <' + par + '>' + '</a>'
									+ '</div>';
							type = 'b';
							// スコアのhtml生成
							for (var j = 0; j < playerCount; j++) {
								var score = scoreList[j];
								insertHTML_OUT += ''
										+ '<div class="ui-block-'
										+ type
										+ ' ui-block-style scoreButton">'
										+ '<a href="./scoreEntrySheet.html"'
										+ 'class = " ui-btn ui-shadow ui-corner-all"'
										+ 'id ="' + holenum + '-' + i
										+ '" data-ajax="false">'
										+ score  + '</a>'
										+ '</div>';
								type = nextGridType(type, 5);
							}
						}else if(holenum >=9 && holenum <= 18){
							insertHTML_IN +=''
									+ '<div class="ui-block-a ui-block-style holeButton" >'
									+ '<a href="./holeInformation.html?holeNum='+ holenum +'"'
									+ 'class=" ui-btn ui-shadow ui-corner-all"'
									+ 'id="' + holenum + '" data-ajax="false">'
									+ (holenum -9) + 'H <' + par + '>' + '</a>'
									+ '</div>';
							var type = 'b';
							// スコアのhtml生成
							for (var j = 0; j < playerCount; j++) {
								var score = scoreList[j];
								insertHTML_IN += ''
										+ '<div class="ui-block-'
										+ type
										+ ' ui-block-style scoreButton">'
										+ '<a href="./scoreEntrySheet.html"'
										+ 'class = " ui-btn ui-shadow ui-corner-all"'
										+ 'id ="' + holenum + '-' + i
										+ '" data-ajax="false">'
										+ score  + '</a>'
										+ '</div>';
								type = nextGridType(type, 5);
							}
						}
					}
					;
					//IN・OUTの合計のHtml生成
					var parSumIN = data.inSum.par;
					var scoreListIN = data.inSum.score;
					var puttListIN =data.inSum.putt;
					insertHTML_IN += '' + '<div class="ui-block-a ui-block-style" >'
							+ '<label class="ui-label" id="inSum"> ' + 'IN合計<'
							+ parSumIN + '>' + '</label>' + '</div>';
					type = 'b';
					for (var i = 0; i < playerCount; i++) {
						var score = scoreListIN[i];
						var putt = puttListIN[i]
						insertHTML_IN += '' + '<div class="ui-block-' + type
								+ ' ui-block-style">'
								+ '<label class ="ui-label">' + score
								+'('+ putt +')'
								+ '</label>' + '</div>';
						type = nextGridType(type, 5);
					}
					var parSumOUT = data.outSum.par;
					var scoreListOUT = data.outSum.score;
					var puttListOUT = data.outSum.putt;
					insertHTML_OUT += '' + '<div class="ui-block-a ui-block-style" >'
							+ '<label class="ui-label" id="outSum"> ' + 'OUT合計<'
							+ parSumOUT + '>' + '</label>' + '</div>';
					var type = 'b';
					for (var i = 0; i < playerCount; i++){
						var score = scoreListOUT[i];
						var putt =  puttListOUT[i];
						insertHTML_OUT += '' + '<div class="ui-block-' + type
								+ ' ui-block-style">'
								+ '<label class ="ui-label">' + score
								+'('+ putt +')'
								+ '</label>' + '</div>';
						type = nextGridType(type, 5);
					}

					// 合計のhtml生成
					var parSum = data.sum.par;
					var scoreList = data.sum.score;
					var puttList = data.sum.putt;
					insertHTML_IN += '' + '<div class="ui-block-a ui-block-style" >'
							+ '<label class="ui-label" id="sum"> ' + '合計('
							+ parSum + ')' + '</label>' + '</div>';
					insertHTML_OUT += '' + '<div class="ui-block-a ui-block-style" >'
					+ '<label class="ui-label" id="sum"> ' + '合計<'
					+ parSum + '>' + '</label>' + '</div>';
					var type = 'b';
					for (var i = 0; i < playerCount; i++) {
						var score = scoreList[i];
						var putt = puttList[i];
						insertHTML_IN += '' + '<div class="ui-block-' + type
								+ ' ui-block-style">'
								+ '<label class ="ui-label">' + score
								+'('+ putt +')'
								+ '</label>' + '</div>';
						insertHTML_OUT += '' + '<div class="ui-block-' + type
						+ ' ui-block-style">'
						+ '<label class ="ui-label">' + score
						+'('+ putt +')'
						+ '</label>' + '</div>';
						type = nextGridType(type, 5);
					}

					$("#inHoleResultArea").append(insertHTML_IN);
					$("#outHoleResultArea").append(insertHTML_OUT);

					// 登録済み申請スコアが存在する場合はボタンを使用できなくする
					if (data.apply[0] != null && data.apply[0] != 0) {
						$(
								".apply,.apply-1-view,.apply-2-view,.apply-3-view,.apply-4-view")
								.prop('disabled', true);
						$('.apply').addClass('disabledLink');
						$('.apply-1-view').addClass('disabledLink');
						$('.apply-2-view').addClass('disabledLink');
						$('.apply-3-view').addClass('disabledLink');
						$('.apply-4-view').addClass('disabledLink');
					}

					// 確定済みのデータは操作不可にする
					if (data.defined) {
						$('#scoreViewSheet_ResultArea button').prop('disabled',
								true);
						$('#scoreViewSheet_ResultArea a').addClass(
								'disabledLink');
					}

					// スコア入力ページのリクエスト用にデータを詰め直す

					scoreEntrySheet_Request.team = data.team;
					saveStorage('scoreEntrySheet_Request', JSON
							.stringify(scoreEntrySheet_Request));
					applyEntrySheet_Request.team = data.team;
					applyEntrySheet_Request.excnt = data.excnt;
					saveStorage('applyEntrySheet_Request', JSON
							.stringify(applyEntrySheet_Request));
					scoreViewSheet_executeRequest.excnt=data.excnt;
					scoreViewSheet_executeRequest.team = data.team;

				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus + ":\n"
							+ errorThrown + ":\n" + XMLHttpRequest);
				}
			});
};

/*
 * タブのインアウトの初期表示を変更するメソッド
 */
function changeTab(){
	watchingTabID = getStorage('watchingTabID');
	if(watchingTabID=='inHole'){
		$('#tabs').attr('data-active','1');
		//$('#inHoleTab').addClass('ui-btn-active');
		$('#inHoleTab').addClass('inHoleColor');
	}else{
		$('#tabs').attr('data-active','0');
		$('#outHoleTab').addClass('outHoleColor');
	}
}

/*
 * リクエストパラメータに自チームをセットする処理
 */
function setMyTeamToRequest(){
	userInformation =JSON.parse(getStorage('userInformation'));
	var scoreViewSheet_Request = {'team' :userInformation.team};
	saveStorage('scoreViewSheet_Request',JSON.stringify(scoreViewSheet_Request));

}


//function executeDefined(){
//	alert('test');
//}
///*
// * 画面をプルダウン処理 ページをリロードする
// */
//$(document).delegate("#scoreViewSheet_Page", "pageshow",
//		function bindPullPagePullCallbacks(event) {
//			$(".iscroll-wrapper", this).bind({
//				iscroll_onpulldown : onPullDown
//			});
//		});
//
//// 下へ引き下げた時の処理中ダミータイマー
//function onPullDown(event, data) {
//	setTimeout(function fakeRetrieveDataTimeout() {
//		gotPullDownData(event, data);
//	}, 1500);
//}
//function gotPullDownData(event, data) {
//	var scoreViewSheet_Request = JSON
//			.parse(getStorage('scoreViewSheet_Request'));
//	getScoreData(scoreViewSheet_Request);
//	data.iscrollview.refresh(); // Refresh the iscrollview
//}
