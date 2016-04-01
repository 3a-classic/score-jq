
/*
 * ページ遷移時の初期処理
 */
$('#allData_Page').on('pageinit',function(){

	saveCurrentPage('allData');

	//表示データの取得
		getScoreData();

});

/*
 *ボタンを押した時の処理
 */



/*
 * 表示用スコア取得メソッド
 */

function getScoreData(){
	$.ajax({
		type: 'GET',
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/page/entireScore',
		dataType: 'json',
		success : function(response) {
			data=response.rows;
			var scoreHtml = '';

			//スコアを挿入する
			for(var l = 0;l<data.length;l++){
				line = data[l];
				if(line[0].indexOf("-i")==0){
					scoreHtml+='<tr class = "ignore">'
					line[0]=line[0].substr(2);
				}else{
					scoreHtml+='<tr>'
				}

				if(l==0){
					scoreHtml+='<th colspan="2"></th>';
					for (var v=0;v <line.length; v++){
						value = line[v];
						if(v % 2 ==0){
							scoreHtml+='<th colspan="'+value+'">';
						}else{
							scoreHtml+=value+'</th>';
						}
					}
				}else if(l==1){
					for (var v=0;v <line.length; v++){
						value = line[v];
						scoreHtml+='<th>'+value+'</th>'
					}
				}else{
					for (var v=0;v <line.length; v++){
						value = line[v];
						scoreHtml+='<td>'+value+'</td>'
					}
				}


				scoreHtml+='</tr>'
			}

			$("#allData_ResultArea").append(scoreHtml);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus +":\n" + errorThrown +":\n" + XMLHttpRequest);
		}
	});
};
