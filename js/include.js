//外付HTMLファイル読み込み用スクリプト

function writeHead(rootDir){
  $.ajax({
    url: rootDir + "head.html", 
    cache: false,
    async: false, 
    success: function(html){

      html = html.replace(/\{\$root\}/g, rootDir);
      document.write(html);
    }
  });

}
