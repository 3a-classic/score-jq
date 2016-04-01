var holeInformationRegistration_executeRequest = {};
var currentHoleNum;
var maxHoleNum;
var CRUD;
/*
 * ページ遷移次の初期処理
 */
$('#holeInformationRegistration_Page').on('pageshow', function() {

	// 登録更新区分
	CRUD = 'U';

	var first = $.when(
	// 表示データの取得
	getHoleData());

	first.done(function() {
		currentHoleNum = 0;

		// 1画面目の表示
		viewHoleData(currentHoleNum);
	});
});

/*
 * 登録済みホール情報一覧の取得メソッド
 */
function getHoleData() {


	$.ajax({
				type : 'GET',
				// url : 'http://' + config.apiHost +'/api/page/holeInformationRegistration',
				url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/collection/field',
				dataType : 'json',
				success : function(data) {
					// データ登録用リスエストにデータを入れなおす
					holeInformationRegistration_executeRequest = data;
					saveStorage('holeInformationRegistration_executeRequest', JSON
							.stringify(holeInformationRegistration_executeRequest));

					// チーム数を取得
					maxHoleNum = data.length - 1;
					if (maxHoleNum == -1) {
						currentHoleNum = 0;
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
function viewHoleData(currentHoleNum) {

	holeInformationRegistration_executeRequest = JSON
			.parse(getStorage('holeInformationRegistration_executeRequest'));
	// if(!holeInformationRegistration_executeRequest){
	// // 表示データの取得
	// getUserData();
	// }
	// 取得データを挿入する
	var currentHoleData = holeInformationRegistration_executeRequest[currentHoleNum];
	$('#hole').val(currentHoleData.hole);
	$('#par').val(currentHoleData.par);
	$('#yard').val(currentHoleData.yard);
	$('#holeURL').val(currentHoleData.image);
	if(currentHoleData.drivingcontest){
		$('#driverContest').val("on");
	}else{
		$('#driverContest').val("off");
	}
	if(currentHoleData.nearpin){
		$('#nearPinContest').val("on");
	}else{
		$('#nearPinContest').val("off");
	}
	if(currentHoleData.ignore){
		$('#ignoreHole').val("on");
	}else{
		$('#ignoreHole').val("off");
	}

};

/* 新規作成用メソッド */
function createHoleData() {
	CRUD = 'I';
	currentHoleNum = 0;
	// 表示を初期化
	$('#hole').val("");
	$('#par').val("");
	$('#yard').val("");
	$('#holeURL').val("");
	$('#driverContest').val("off");
	$('#nearPinContest').val("off");
	$('#ignoreHole').val("on");

};

function saveData() {
	holeInformationRegistration_executeRequest = JSON
			.parse(getStorage('holeInformationRegistration_executeRequest'));
	var ignoreflag = $('#driverContest').val()=='on' ? true:false;
	var driverflag = $('#nearPinContest').val()=='on' ? true:false;
	var nearpinflag = $('#ignoreHole').val()=='on' ? true:false;
	if (CRUD == 'U') {
		holeInformationRegistration_executeRequest[currentHoleNum].hole = $('#hole').val();
		holeInformationRegistration_executeRequest[currentHoleNum].par = $('#par').val();
		holeInformationRegistration_executeRequest[currentHoleNum].yard = $('#yard').val();
		holeInformationRegistration_executeRequest[currentHoleNum].image = $('#holeURL').val();
		if(driverflag){
			holeInformationRegistration_executeRequest[currentHoleNum].drivingcontest =true;
		}else{
			holeInformationRegistration_executeRequest[currentHoleNum].drivingcontest =false;
		}
		if(nearpinflag){
			holeInformationRegistration_executeRequest[currentHoleNum].nearpin =true;
		}else{
			holeInformationRegistration_executeRequest[currentHoleNum].nearpin =false;
		}
		if(ignoreflag){
			holeInformationRegistration_executeRequest[currentHoleNum].ignore =true;
		}else{
			holeInformationRegistration_executeRequest[currentHoleNum].ignore =false;
		}


	} else if (CRUD == 'I') {
		var insertData = {
			"hole" : $('#hole').val(),
			"par" : $('#par').val(),
			"yard" : $('#yard').val(),
			"image" : $('#holeURL').val(),
			"drivingcontest" : driverflag,
			"nearpin" : nearpinflag,
			"ignore" : ignoreflag,

		};
		holeInformationRegistration_executeRequest.push(insertData);
		maxHoleNum++;
		// for(var i=1;i<=4;i++){
		// var player = $('#player'+i).val();
		// if(!player){
		// holeInformationRegistration_executeRequest.participation[maxHoleNum+1].team=player;
		// }
		// }
		CRUD='U';

	} else if (CRUD == 'D') {
		holeInformationRegistration_executeRequest.splice(currentHoleNum, 1);
		maxHoleNum--;
	}
	saveStorage('holeInformationRegistration_executeRequest', JSON
			.stringify(holeInformationRegistration_executeRequest));

};

/*
 * 次のチームボタンを押した時の処理
 */
$(document).on('tap', '#next-btn', function(obj) {
	console.log(maxHoleNum);
	saveData();
	if (currentHoleNum != maxHoleNum) {
		currentHoleNum++;
	} else {
		currentHoleNum = 0;
	}
	viewHoleData(currentHoleNum);
});
/*
 * 前のチームボタンを押した時の処理
 */
$(document).on('tap', '#prev-btn', function(obj) {
	saveData();
	if (currentHoleNum != 0) {
		currentHoleNum--;
	} else {
		currentHoleNum = maxHoleNum;
	}
	viewHoleData(currentHoleNum);
});
/*
 * 新規作成ボタンを押した時の処理
 */
$(document).on('tap', '#new-btn', function(obj) {
	saveData();
	createHoleData();
	CRUD='I';
});

/*
 * 削除ボタンを押した時の処理
 */
$(document).on('tap', '#del-btn', function(obj) {
	CRUD = 'D';
	saveData();
	if (currentHoleNum == 0) {
		currentHoleNum == maxHoleNum;
	} else {
		currentHoleNum--;
	}
	CRUD = 'U';
	viewHoleData(currentHoleNum);
});

/*
 * 登録ボタンを押した時の処理 入力されたデータを登録する
 */
$(document).on(
		'tap',
		'#userRegistration_execute',
		function() {
			saveData();
			holeInformationRegistration_executeRequest = JSON
					.parse(getStorage('holeInformationRegistration_executeRequest'));

			$.ajax({
				type : 'POST',
				contentType : 'application/json',
				data : JSON.stringify(holeInformationRegistration_executeRequest),
				url : 'http://' + config.apiHost
						+ '/'+ config.apiVersion +'/page/holeInformationRegistration/',
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
