/**
 * Created by Administrator on 15-5-8.
 */

/**
 * 微信配置文件
 *  AppID微信公众号的AppID
 *  AppSecret微信公众号的AppSecret
 *  payKey微信商户号的支付密钥
 *  hostUrl微信回调的url
 *  host微信授权的域名
 *  businessNumber微信商户的商户号
 *  keyPath退款调用微信接口时所需的两个key的路径
 *  attentionUrl关注的url
 */

var path = require('path');
var Config = {
    AppID:"wx74b3068a880e5162",
    AppSecret:"fc89f104a572aa7e761a633b132100bc",
    payKey:"yonong2015ttmycart1234567890qwer",
    hostUrl:"http://www.dayday7.com",
    host:"www.dayday7.com",
    businessNumber: '1233511302',
    keyPath:path.join (__dirname , 'public/key/'),
    attentionUrl:'http://mp.weixin.qq.com/s?__biz=MzAwNjQ3MjI5MQ==&mid=206079215&idx=1&sn=ee8af195866afe4f5b43dab8f5a92dd9#rd '
};


module.exports  = Config;