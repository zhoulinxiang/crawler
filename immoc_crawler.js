var http = require("http");
var fs = require('fs');
var path = require('path');
var index=process.argv.slice(2,3);
//hd=0代表超清 =1代表高清 =2代表流畅
var hd=process.argv.slice(3);
console.log("index:"+index+" hd:"+hd);
var url="http://www.imooc.com/learn/"+index;

http.get(url,function(res){
    var html = [],data;
    res.on('data',function(tmp){
        html.push(tmp);
    });
    res.on("end",function(){
        data=html.join("");
        //<a target="_blank" href='/video/3399' class="J-media-item studyvideo">1-1 Bootstrap简介 (02:01)     </a>
        data = data.replace(/(\r)?\n/g,"").match(/<a\s+target\=['"]_blank['"]\s+href\=['"]\/video\/\d+['"]\s+class\=['"].+?studyvideo['"]>.+?<\/a>/gmi);
        //console.log("data:"+data);
        data.forEach(function (item, index) {
            var link,fileName,id;
            link=item.match(/['"].+?['"]/gmi)[1];
            link=link.substring(1,link.length-1);
            fileName=item.match(/>.+?</gmi)[0];
            fileName=fileName.substring(1,fileName.length-1).trim();
            id=link.split("/")[2];
            //console.log("id:"+id);
            //console.log("fileName:"+fileName);
            downLoadMovie(id,fileName)
        })
    });
}).on("error",function(){
    console("error!");
})
function downLoadMovie(id,fileName){
    //http://www.imooc.com/course/ajaxmediainfo/?mid=8525&mode=flash
    http.get('http://www.imooc.com/course/ajaxmediainfo/?mid=' + id + '&mode=flash', function(res) {
        var html = [],data;
        res.on('data',function(tmp){
            html.push(tmp);
        });
        res.on('end', function() {
            data=html.join("");
            data = JSON.parse(data);
            data = data.data.result.mpath[hd];
            //console.log("data:"+data+"\n"+"fileName:"+fileName+path.extname(data));
            downLoad(data,  fileName + path.extname(data), function(err, res) {
                //console.log(res.statusCode, res.headers);
                if(res.statusCode==200){
                    console.log(fileName+"下载成功.");
                }else{
                    console.log(fileName+"下载失败.");
                }
            });
        })
    })
}
function downLoad(url,fileName,callback){
    console.log('download from', url, 'to', fileName);
    http.get(url,function(res){
        var writestream = fs.createWriteStream(fileName);
        writestream.on('close', function() {
            callback(null, res);
        });
        res.pipe(writestream);
    });
}