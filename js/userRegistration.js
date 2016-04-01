var userRegistration_executeRequest = {};
var currentTeamNum;
var maxTeamNum;
var CRUD;
/*
 * ページ遷移次の初期処理
 */
$('#userRegistration_Page').on('pageshow', function() {

	// 登録更新区分
	CRUD = 'U';

	var first = $.when(
	// 表示データの取得
	getUserData());

	first.done(function() {
		currentTeamNum = 0;

		// 1画面目の表示
		viewUserData(currentTeamNum);
	});
});

/*
 * 登録済みチーム・ユーザ一覧の取得メソッド
 */
function getUserData() {

	// TODO 取得データを一時的に直接作成
	// 松野：コメントアウト外して、このデータ形式で返してください。（URLも変更）
	$
			.ajax({
				type : 'GET',
				// url : 'http://' + config.apiHost +
				// '/api/page/userRegistration',
				url : 'http://' + config.apiHost + '/api/page/scoreViewSheet/A',
				dataType : 'json',
				success : function(data) {
					// TODO 削除
					data = {
						"participation" : [ {
							"team" : "teamA",
							"player" : [ "太郎", "次郎", "三郎", "四朗" ]
						}, {
							"team" : "teamB",
							"player" : [ "太郎B", "次郎B", "三郎B", "四朗B" ]
						}, {
							"team" : "teamC",
							"player" : [ "太郎C", "次郎C", "三郎C", "四朗C" ]
						} ],
						"excnt" : 0
					};

					// データ登録用リスエストにデータを入れなおす
					userRegistration_executeRequest = data;
					saveStorage('userRegistration_executeRequest', JSON
							.stringify(userRegistration_executeRequest));

					// チーム数を取得
					maxTeamNum = userRegistration_executeRequest.participation.length - 1;
					if (maxTeamNum == -1) {
						currentTeamNum = 0;
						CRUD = 'I';
					}

				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus + ":\n"
							+ errorThrown + ":\n" + XMLHttpRequest);
				}
			});
};

/* 画面表示用メソッド:HTMLを生成する */
function viewUserData(currentTeamNum) {

	userRegistration_executeRequest = JSON
			.parse(getStorage('userRegistration_executeRequest'));
	// if(!userRegistration_executeRequest){
	// // 表示データの取得
	// getUserData();
	// }
	// 取得データを挿入する
	var currentTeamData = userRegistration_executeRequest.participation[currentTeamNum];
	$('#team').val(currentTeamData.team);
	for (var i = 0; i <= currentTeamData.player.length; i++) {
		// プレイヤーの挿入
		$('#player' + (i + 1)).val(currentTeamData.player[i]);
	}

};

/* 新規作成用メソッド */
function createUserData() {
	CRUD = 'I';
	currentTeamNum = 0;
	// 表示を初期化
	$('#team').val("");
	$('#player1').val("");
	$('#player2').val("");
	$('#player3').val("");
	$('#player4').val("");

};

function saveData() {
	userRegistration_executeRequest = JSON
			.parse(getStorage('userRegistration_executeRequest'));
	if (CRUD == 'U') {
		userRegistration_executeRequest.participation[currentTeamNum].team = $(
				'#team').val();
		for (var i = 1; i <= 4; i++) {
			var player = $('#player' + i).val();
			if (!player) {
				userRegistration_executeRequest.participation[currentTeamNum].team = player;
			}
		}
	} else if (CRUD == 'I') {
		var insertData = {
			"team" : $('#team').val(),
			"player" : [ $('#player1').val(), $('#player2').val(),
					$('#player3').val(), $('#player4').val() ]
		};
		userRegistration_executeRequest.participation.push(insertData);
		maxTeamNum++;
		// for(var i=1;i<=4;i++){
		// var player = $('#player'+i).val();
		// if(!player){
		// userRegistration_executeRequest.participation[maxTeamNum+1].team=player;
		// }
		// }
		CRUD='U';

	} else if (CRUD == 'D') {
		userRegistration_executeRequest.participation.splice(currentTeamNum, 1);
		maxTeamNum--;
	}
	saveStorage('userRegistration_executeRequest', JSON
			.stringify(userRegistration_executeRequest));

};

/*
 * 次のチームボタンを押した時の処理
 */
$(document).on('tap', '#next-btn', function(obj) {
	console.log(maxTeamNum);
	saveData();
	if (currentTeamNum != maxTeamNum) {
		currentTeamNum++;
	} else {
		currentTeamNum = 0;
	}
	viewUserData(currentTeamNum);
});
/*
 * 前のチームボタンを押した時の処理
 */
$(document).on('tap', '#prev-btn', function(obj) {
	saveData();
	if (currentTeamNum != 0) {
		currentTeamNum--;
	} else {
		currentTeamNum = maxTeamNum;
	}
	viewUserData(currentTeamNum);
});
/*
 * 新規作成ボタンを押した時の処理
 */
$(document).on('tap', '#new-btn', function(obj) {
	saveData();
	createUserData();
	CRUD='I';
});

/*
 * 削除ボタンを押した時の処理
 */
$(document).on('tap', '#del-btn', function(obj) {
	CRUD = 'D';
	saveData();
	if (currentTeamNum == 0) {
		currentTeamNum == maxTeamNum;
	} else {
		currentTeamNum--;
	}
	CRUD = 'U';
	viewUserData(currentTeamNum);
});

/*
 * 登録ボタンを押した時の処理 入力されたデータを登録する
 */
$(document).on(
		'tap',
		'#userRegistration_execute',
		function() {
			saveData();
			userRegistration_executeRequest = JSON
					.parse(getStorage('userRegistration_executeRequest'));

			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				data : JSON.stringify(userRegistration_executeRequest),
				url : 'http://' + config.apiHost
						+ '/api/page/userRegistration/',
				dataType : 'json',
				// jsonpCallback: 'json',
				success : function(data) {
					if (applyEntrySheet_executeResponse == ture) {
						// 登録成功ダイアログを表示する。
						makeDialog('ユーザーの登録が完了しました' + data, './adminTop.html',
								'一覧画面に戻る');
					} else {
						makeDialog('他の人によって更新済みです。', './adminTop.html', '戻る');
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。");
				}
			});

		});
