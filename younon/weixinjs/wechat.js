/**
 * Created by James on 2015/4/20.
 */
var https = require('https');
var WechatAPI = require('wechat-api');
var fs = require('fs');
var Config = require('../config');
var appid = Config.AppID;
var secret =Config.AppSecret;
var api = new WechatAPI(appid, secret );

function wechat(){};

/**
 * 从微信服务器获取access_token
 * @param callback
 */
wechat.getAccessToken = function(callback){
    api.getLatestToken(function(err, token){
        if(err){
            console.log(err);
        }else{
            //return token ;
            callback(token);
        }
    });
    /* var data = "" ;
     https.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appid+"&secret="+secret,function(res){
     res.on('data', function (chunk) {
     data +=chunk ;
     });
     res.on('end', function () {

     var access_token = JSON.parse(data).access_token
     fs.writeFile('token.txt',access_token,'utf-8',function(err){
     if (err){
     throw err;
     }
     });
     });
     });*/


};
/*

 wechat.getLocalAccessToken = function(){
 var token = fs.readFileSync('token.txt', 'utf8');
 return token;
 }
 */

// 分享接口


module.exports = wechat;
