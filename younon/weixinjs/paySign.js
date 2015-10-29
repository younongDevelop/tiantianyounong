/**
 * Created by root on 15-4-19.
 */
var Config = require('../config');
var payKey = Config.payKey;

var createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

function md5(data) {
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    var crypto = require("crypto");
    return crypto.createHash("md5").update(str).digest("hex").toUpperCase();
}

var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    string =string+'&key='+payKey;
    console.log(string);
//    var crypto = require('crypto');
//    var md5 = crypto.createHash('md5');
//    string=md5.update(string).digest('hex').toUpperCase();
    string=md5(string);
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
var paySign = function (json) {

    var ret = {
        appid:json.appid,
        mch_id:json.mch_id,
        body:json.body,
        out_trade_no:json.out_trade_no,
        total_fee:json.total_fee,
        spbill_create_ip:json.spbill_create_ip,
        notify_url:json.notify_url,
        trade_type:json.trade_type,
        openid:json.openid,
        nonce_str: createNonceStr()
    };
    ret.sign = raw(ret);

    return ret;
};

module.exports = paySign;
