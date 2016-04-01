/*
 * ページ遷移時の初期処理
 */

$('#index_Page').on('pageshow',function(){
	saveCurrentPage('index');
	eachPageDoFirst('./web');
	//初期表示チーム一覧の取得
	getTeamData();
});

/*
 * チーム一覧の取得メソッド
 */
function getTeamData(){
	$.ajax({
		type: 'GET',
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/index',
		dataType: 'json',
		success : function(data) {
			var len = data.length;
			var type = 'a';
			var tag = '';
		    for(var i=0; i < len; i++){
		    	var team = data.team[i];
		    	tag += '' +
            '<div class="ui-block-'+ type +' ui-block-style">' +
              '<a href="./web/scoreViewSheet.html"' +
              'class = " ui-btn ui-shadow ui-corner-all"' +
              'id = '+ team +' data-ajax="false">' +
                'team'+ team +
              '</a>' +
            '</div>';
				type = nextGridType(type,3);
			}
		    $("#index_ResultArea").html('');
	      	$("#index_ResultArea").append(tag);

	      	//自チームの色を変える処理
			var userInformation= JSON.parse(getStorage('userInformation'));
			var myTeam = userInformation.team;
	      	$('#'+myTeam).addClass('myTeam')

		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus +":\n" + errorThrown +":\n" + XMLHttpRequest);
		}
	});
};


/*
 * ボタンを押した時の処理
 */

$(document).on('tap', '#index_Page',function(obj){

	var buttonId = obj.target.id;
	if(buttonId){
		var scoreViewSheet_Request = {team :buttonId};
		saveStorage('scoreViewSheet_Request',JSON.stringify(scoreViewSheet_Request));
	}
});

