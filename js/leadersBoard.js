var scoreEntrySheet_Request = {};


/*
 * ページ遷移時のイベント
 */
$('#leadersBoard_Page').on('pagecreate',function(){
	saveCurrentPage('leadersBoard');
	//表示データの取得
	getRankingData();



});

/*
 * ランキングデータの取得処理
 */
function getRankingData(){
	$.ajax({
		type: 'GET',
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/leadersBoard',
		dataType: 'json',
		//jsonpCallback: 'json',
		success : function(data) {
			//data = response.data
			//ランキングデータを挿入する
			var rank = data.ranking;
			var tag = '' +
        '<tr><th>順位</th>' +
        '<th>スコア</th>' +
        '<th>名前</th>' +
        '<th>ホール数</th></tr>';
			for(var i=0;i<Object.keys(rank).length; i++){
//				tag+='<div class="ui-block-a ui-block-style" ><label class="ui-label">'+key+'</label></div>';
//				tag+='<div class="ui-block-b ui-block-style" ><label class="ui-label">'+rank[key].score+'</label></div>';
//				tag+='<div class="ui-block-c ui-block-style" ><label class="ui-label">'+rank[key].score+'</label></div>';
//				tag+='<div class="ui-block-d ui-block-style" ><label class="ui-label">'+rank[key].score+'</label></div>';
        if (rank[i].score > 0) {
          rank[i].score = "+" + rank[i].score
        }

				tag += '<tr>';
				tag += '<td>'+(i+1)+'</td>';
				tag += '<td>'+rank[i].total + "(" + rank[i].score + ")" +'</td>';
				tag += '<td>'+rank[i].name+'</td>';
				tag += '<td>'+rank[i].hole+'</td>';
				tag +='</tr>';
			};
			$("#leadersBoard_ResultArea").append(tag);

		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus +":\n" + errorThrown +":\n" + XMLHttpRequest);
		}
	});
};


