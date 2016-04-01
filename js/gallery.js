var galleryData={};
var imgPathArray=[];
var selectedPhotoNum;
var isGetData;
var doneMakeHtml;
/*
 * ページ遷移時の初期処理
 */
$('#gallery_Page').on(
		'pagebeforecreate',
		function(obj) {
		saveCurrentPage('gallery');
		isGetData=false;
		doneMakeHtml=false;
			//表示項目を取得する。
			getGalleryDataFromS3();

			//データ取得待ち処理
			setInterval("checkGetData()",1000);

			//HTML生成処理
			setInterval("makeHtmlGallery()",1000);

});

/*
 * 画像をタッチした時の処理
 * 画像を拡大表示する。
 */

$(document).on(
  'tap',
  '.imgLink',
 function(obj){
	  console.log('【debug】ACTION;tap-photoLink;obj=');
	  console.dir(obj)
	  var selectedImgId = obj.currentTarget.id;
	  var splitSelectedImgIdArray =selectedImgId.split('-');
	  selectedPhotoNum = splitSelectedImgIdArray[1];
	  $.mobile.changePage('./galleryPopup.html', {transition: 'pop', role: 'dialog'});
});

/*
 * S3から写真の一覧データを取得するメソッド
 */
function getGalleryDataFromS3(){
	AWS.config.update({accessKeyId: config.s3_accesskey, secretAccessKey: config.s3_secretkey});
	var bucket = new AWS.S3();
	var params = {Bucket: config.s3_bucekt};

	bucket.listObjects(params,function(error,data) {
    	if(data !== null){
    	  console.log('【debug】PUT;S3;');
    	  galleryData=data.Contents;
//    	  console.log('【debug】;METHOD;getGalleryData;response='+JSON.stringify(galleryData));
    	} else {
    	console.log('【error】PUT;S3;'+error);
    	}

    });
}

/*
 * 画面表示項目のHTMLを生成する処理
 */
function makeHtmlGallery(){
//	console.log('【debug】;METHOD;makeGallery;galleryData='+JSON.stringify(galleryData) );
	if(isGetData==true && doneMakeHtml==false){
		var insertHTMLGallerycontent ='';
		var insertHTMLPopup='';
		var insertCount=0;
		var type='a';
		var imgNum=0;
			for(var i=0;i < galleryData.length;i++){
				var imgPath = galleryData[i]['Key'];
				if(imgPath.match(config.playDate+'/'+config.s3_uploadDir) && imgPath != config.playDate+'/'+config.s3_uploadDir+'/'){
					var imgPathSplit=imgPath.split('/');
					var imgAlt=imgPathSplit[2].replace('.jpg','');
					var imgSrc='https://'+config.s3_baseURL+'/'+config.s3_bucekt+'/'+imgPath;
	//				insertHTMLGallerycontent +='<div class="ui-block-'+type+'"><a href="'+imgAlt+'" data-rel="popup" data-transition="pop" class="imgOuter">'+
	//				      '<img src="'+imgSrc+'" class="imgInner" /></a></div>';

	//				insertHTMLPopup +='<div id="'+imgAlt+'" data-role="popup" data-dismissible="false" data-overlay-theme="b">'+
	//			    '<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-right">閉じる</a>'+
	//			    '<img src="'+imgSrc+'" style="max-height:400px;" ></img></div>';

					insertHTMLGallerycontent +='<div class="imgOuter">'+
					'<a href="#'+imgAlt+'" data-rel="popup" data-transition="pop" class="imgLink" id="gallery-'+imgNum+'">'+
				    '<img src="'+imgSrc+'" class="imgInner" /></a></div>';

					imgPathArray.push(imgSrc);
					imgNum++
				}
			}
			$('#gallerycontent').append(insertHTMLGallerycontent);
	//		$('#popupArea').append(insertHTMLPopup);
			doneMakeHtml=true;
		}
}

/*
 * データが取得できたか確認する処理
 */
function checkGetData(){
	if(galleryData != null){
		isGetData=true;
	}

}
