/**
 * Created by root on 15-4-19.
 */
var Config = require('../config');
var payKey = Config.payKey;
var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};


var createTimestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    string =string+'&key='+payKey;
    console.log('jspaysign=============+'+string);
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    string=md5.update(string).digest('hex').toUpperCase();
    return string;
};

/**
 * @synopsis 签名算法
 *
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @return
 */
var jsPaySign = function (json) {

    var ret = {
        appId:json.appid,
        timeStamp:createTimestamp(),
        nonceStr: createNonceStr(),
        package:'prepay_id='+json.prepay_id,
        signType: "MD5"
    };
    ret.paySign = raw(ret);

    console.log(ret);

    return ret;
};

module.exports = jsPaySign;
