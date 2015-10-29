/**
 * Created by root on 15-4-16.
 */
var http = require('https');
var token='';

var gettoken=function(AppID,AppSecret,callback){
    if(token){
        callback(token);
    }
    else{
        var url='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+AppID+'&secret='
            +AppSecret;
        //  var oneSecond = 60*1000; // one second = 1000 x 1 ms
        //        setInterval(function() {
        //  http.get(url,function(res){
        //   res.on('data', function (chunk) {
        //      var obj = JSON.parse(chunk);
        //      token=obj.access_token;
        //       console.log('BODY: ' + token);
        //   });
        //       }, oneSecond);
        http.get(url,function(res){
            res.on('data', function (chunk) {
                var obj = JSON.parse(chunk);
                token=obj.access_token;
                console.log('BODY: ' + token);
                callback(token);
            });

        }).on('error', function(e)
            {console.log("Got error: " + e.message);});
    }

    return token;
}

module.exports = gettoken;
