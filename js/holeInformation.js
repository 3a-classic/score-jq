var holeNum;
var holeCount;
var holeData;
/*
 * ページ遷移時の初期処理
 */

$('#holeInformation_Page').on('pageshow',function(){
	saveCurrentPage('holeInformation');
  if (getStorage('holeInformation_holeData') == null){
//	if(typeof holeData === 'undefined' || holeData == null){
	//初期表示ホール一覧の取得
		getholeData();
  }else{
//	}
  	makeHolePage();
	var urlArgs = GetQueryString();
	var holeNum = 0;
	if(urlArgs){
		holeNum = urlArgs.holeNum -1;
	}
    loadSwipeSetting(holeNum);
  }
});

/*
 * ホール情報一覧の取得メソッド
 */
function getholeData(){
	$.ajax({
		type: 'GET',
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/collection/field',
		dataType: 'json',
		success : function(data) {
			saveStorage('holeInformation_holeData',JSON.stringify(data));
			saveStorage('holeInformation_holeCount',Object.keys(data).length);
    	makeHolePage();
      loadSwipeSetting()
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			console.log("リクエスト時になんらかのエラーが発生しました：" + textStatus +":\n" + errorThrown +":\n" + XMLHttpRequest);
		}
	});
};

/*
 * ホール番号によってホール情報のページを作成する処理
 */
function makeHolePage(){
	holeData = JSON.parse(getStorage('holeInformation_holeData'));
  if(holeData != null){
    for (i in holeData) {
    	var SelectedHoleData = holeData[i];
    	$('#img' + i).attr('src', SelectedHoleData.image);
    	$('#hole' + i).html(SelectedHoleData.hole);
    	$('#par' + i).html(SelectedHoleData.par);
    	$('#yard' + i).html(SelectedHoleData.yard);
    	if(SelectedHoleData.drivingcontest == true){
    		$('#driver' + i).html("○");
    	}else{
    		$('#driver' + i).html("×");
    	}
    	if(SelectedHoleData.nearpin == true){
    		$('#nearpin' + i).html("○");
    	}else{
    		$('#nearpin' + i).html("×");
    	}
    }
  }
}

function loadSwipeSetting(holeNum){
  $.getScript("../js/idangerous.swiper.min.js", function(){
    var mySwiper = new Swiper('.swiper-container',{
      pagination: '.pagination',
      loop:true,
      grabCursor: true,
      paginationClickable: true,
      initialSlide:holeNum
    });
  });
}
