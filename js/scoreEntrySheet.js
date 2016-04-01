var scoreEntrySheet_Request ={};
var scoreEntrySheet_executeRequest ={};
var photoUploadRequest={};

/*
 * ページ遷移次の初期処理
 */
$('#scoreEntrySheet_Page').on('pageshow',function(){
	if(getCurrentPage()=='photoUpload'){
		takePhotoAlert();
	}
	saveCurrentPage('scoreEntrySheet');
	eachPageDoFirst('.');


	//ストレージからリクエストデータを取得する
	scoreEntrySheet_Request = JSON.parse(getStorage('scoreEntrySheet_Request'));
	if(scoreEntrySheet_Request==null||scoreEntrySheet_Request==undefined){
		location.href='../index.html';
	}
	//表示データの取得
	getScoreData(scoreEntrySheet_Request);
});

/*
 * 登録済みスコアデータの取得メソッド
 */
function getScoreData(scoreEntrySheet_Request){
	var request_team =scoreEntrySheet_Request.team;
	var request_hole =scoreEntrySheet_Request.hole;

  console.dir("ajax")
	$.ajax({
		type: 'GET',
		url:'http://' + config.apiHost + '/'+ config.apiVersion +'/page/scoreEntrySheet/'+request_team+'/'+request_hole,
		success : function(data) {
			//ホール番号を挿入する
			$('#scoreEntrySheet_execute').html( '確定　'+'[ホール'+data.hole +']');
			var type = 'a';
			var tag = '';
			//取得データを挿入する
		    for(var i=0; i < data.member.length; i++){
		    	var j=i+1;
		    	var total = data.total[i];
  				var putt = data.putt[i];
  				var par = data.par;
  				var id_total = '#'+ j + '-total';
  				var id_putt = '#'+ j + '-putt';
  				var player = data.member[i];
  				//プレイヤーの挿入
  				$('#player'+j).html(data.member[i] );

				//スコアの挿入
				//登録データがある場合はそのデータを、ない場合はパーの値を挿入する
		    	if(data.total[i] != null && data.total[i] != 0){
		    		$(id_total).attr("value", total);
		    		$(id_total).attr("max", par*3);
		    		$(id_putt).attr("value", putt);
		    		$(id_putt).attr("max", par*2);
				}else{
		    		$(id_total).attr("value", par);
		    		$(id_total).attr("max", par*3);
		    		$(id_putt).attr("value", 0);
		    		$(id_putt).attr("max", par*2);
				}
			}
		    for(var i=4; i > data.member.length; i--){
  				var id_total = '#'+ i + '-total';
  				var id_putt = '#'+ i + '-putt';
	    		$(id_total).attr("value", "-");
	    		$(id_total).attr("max", "-");
	    		$(id_putt).attr("value", "-");
	    		$(id_putt).attr("max", "-");
		    }

      console.dir(data);
      console.log(Object.keys(data.member).length);
      console.log(data.member.length);

		//データ登録用リスエストにデータを入れなおす
		scoreEntrySheet_executeRequest.team = data.team;
		scoreEntrySheet_executeRequest.hole = data.hole;
		scoreEntrySheet_executeRequest.excnt = data.excnt;
		scoreEntrySheet_executeRequest.member = data.member;
		scoreEntrySheet_executeRequest.userIds = data.userIds;

		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus +":\n" + errorThrown +":\n" + XMLHttpRequest);
		}
	});
};

/*
 * 確定ボタンを押した時の処理
 * 入力されたデータを登録する
 */

$(document).on('tap', '#scoreEntrySheet_execute',function(){
	if(scoreEntrySheet_executeRequest !== undefined){
		//登録データの整形
		scoreEntrySheet_executeRequest.total=[
      parseInt($('#1-total').val()),
      parseInt( $('#2-total').val()),
      parseInt($('#3-total').val()),
      parseInt($('#4-total').val())
    ];
		scoreEntrySheet_executeRequest.putt=[
      parseInt($('#1-putt').val()),
      parseInt($('#2-putt').val()),
      parseInt($('#3-putt').val()),
      parseInt($('#4-putt').val())
    ];

    console.dir(scoreEntrySheet_executeRequest)
		$.ajax({
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(scoreEntrySheet_executeRequest),
			url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/scoreEntrySheet/'+scoreEntrySheet_executeRequest.team+'/'+scoreEntrySheet_executeRequest.hole,
			dataType: 'json',
//			jsonpCallback: 'json',
			success : function(data) {
				if(data.status == "success"){
				//登録成功ダイアログを表示する。
					makeDialog('登録が完了しました','./scoreViewSheet.html','一覧画面に戻る');
			    }else if(data.status == "take a picture"){
					console.dir(data);
					saveStorage('photoUploadRequest', JSON
							.stringify(data));
					takePhotoAlert();
				}else if(data.status == "other updated"){
					makeDialog('他の人が更新済みです。リロードしてください。','./scoreEntrySheet.html','戻る');
				}
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。" );
			}
		});

	}else{
		//TODO:システムエラー
	}

});

function takePhotoAlert(photoUploadRequest){
	$('body').pagecontainer('change', '../web/photoUpload.html',
			{transition: 'pop', role: 'dialog'});
}


