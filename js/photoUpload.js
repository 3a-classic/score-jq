var userInformation;
var photoUploadRequest={};

/*
 * ページ遷移時の初期処理
 */
$('#photoUpload_Page').on(
		'pageshow',
		function(obj) {
			saveCurrentPage('photoUpload');

			//表示項目を挿入する。
			makephotoUploadPage();

});

/*
 * アップロードボタンを押したときの処理
 */
$(document).on('tap','#uploadToS3',function(obj){
    var file = $("#uploadfile").prop("files")[0];
    var filename = photoUploadRequest.userId + '_';
    if(photoUploadRequest.positive){
    	filename+='positive.jpg';
    }else{
    	filename+='negative.jpg';
    }

    AWS.config.update({accessKeyId: config.s3_accesskey, secretAccessKey: config.s3_secretkey});
    var bucket = new AWS.S3({params: {Bucket: config.s3_bucekt}});
    var params = {Key: config.playDate+'/'+config.s3_uploadDir+'/'+filename, ContentType: file.type, Body: file, ACL: 'public-read'};
    bucket.putObject(params, function (err, data) {
      if(data !== null){
    	  console.log('【debug】PUT;S3;return;'+JSON.stringify(data));
      var uploadUrl = 'https://'+config.s3_baseURL+'/'+config.s3_bucekt+'/'+config.playDate+'/'+config.s3_uploadDir+'/'+filename;
      photoUploadRequest.photoUrl=uploadUrl;
      returnTakeAPicutre();
    } else {
      alert("アップロード失敗."+err);
    }
    });
});

  /*
   * 表示ボタンを押したときの処理
   */
$(document).on('tap','#photoGallaly',function(obj){
      AWS.config.update({accessKeyId: config.s3_accesskey, secretAccessKey: config.s3_secretkey});
      var bucket = new AWS.S3();
      var params = {Bucket: config.s3_bucekt};
      bucket.listObjects(params,function(error,data) {
        if(data !== null){
        console.dir(data);
        console.dir(error);
      } else {
          console.dir(data);
          console.dir(error);
      }
      });
});

/*
 * 画面表示項目のHTMLを生成する処理
 */
function makephotoUploadPage(){
	//ストレージからリクエストデータを取得
	photoUploadRequest = JSON
			.parse(getStorage('photoUploadRequest'));
	if(photoUploadRequest == null || photoUploadRequest == undefined){
		$('body').pagecontainer('change', '../web/scoreViewSheet.html');
	}
	$('#threadMsg').html(photoUploadRequest.threadMsg);
	$('#takePicMessage').html(photoUploadRequest.name+'さん、写真を撮影し、アップロードをおこなってください。');

}
/*
 * 写真要求の完了を送信する処理
 * URLを載せて返す。
 */
function returnTakeAPicutre(){
	console.log('【dubug】POST;request;photoUpload;'+JSON.stringify(photoUploadRequest));
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(photoUploadRequest),
		url : 'http://' + config.apiHost + '/'+ config.apiVersion +'/register/thread',
		dataType: 'json',
		success : function(data) {
			console.log('【dubug】POST;response;photoUpload;'+JSON.stringify(data));
			if(data.status == "success"){
				photoUploadRequest=null;
			//登録成功ダイアログを表示する。
				makeDialog('登録が完了しました','./scoreViewSheet.html','一覧画面に戻る');
		    }else if(data.status == "other updated"){
				makeDialog('他の人が更新済みです。リロードしてください。','./scoreViewSheet.html','戻る');
			}else if(data.status == "take a picture"){
				photoUploadRequest=null;
				saveStorage('photoUploadRequest', JSON
						.stringify(data));
	//			$('#uploadStatus').html('別のメッセージがあります。もう一枚お願いします。');
	//			makephotoUploadPage();
				history.back();
			}else{
				makeDialog('エラーが発生しました。'+data.status,'../web/photoUpload.html','戻る');
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("リクエスト時になんらかのエラーが発生しました。もう一度やり直してください。" );
		}
	});
}



