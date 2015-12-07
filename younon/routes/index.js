var express = require('express');
var DbStore = require('../DbUtils/DbUtils');
var store = new DbStore();
var moment = require('moment');
var https = require('https');
var http = require('http');
var util = require('../weixinjs/util.js');
var request = require('request');
var router = express.Router();
var sign = require('../weixinjs/sign.js');
var paySign = require('../weixinjs/paySign.js');
var jsPaySign = require('../weixinjs/JsPaySign.js');
var mdSign = require('../weixinjs/mdSign.js');
var Config = require('../config');
var apid = Config.AppID;
var appsecret =Config.AppSecret;
var ticket = '';
var URL = require('url');
var businessNumber = Config.businessNumber;
var fs = require('fs');
var weixinJs = require('../weixinjs/wechat.js');
var notifyUrl = Config.hostUrl;
var qrcode = require('../public/lib/qrcode.js');
var payKey = Config.payKey;
var logger = require('../app').logger('index');









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
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    var signString =string+'&key='+payKey;
    console.log(string);
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    string=string+'&sign='+md5.update(signString).digest('hex').toUpperCase();
    return string;
};


router.get('/testlog', function (req, res, next) {
   console.log('testlog');
    logger.info("This is an index page! -- log4js");
    res.end();
})


/**
 * 重定向到微信接口获取页面授权，取得code
 *
 */
router.get('/node/home', function (req, res, next) {
    var arg = URL.parse(req.url, true).query;
    console.log(arg);
    if (!arg.target) {
        arg.target = '';
    }
    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + apid + '&redirect_uri=http://www.dayday7.com/node/back' +
    '&response_type=code&scope=snsapi_base&state=' + arg.target);
    res.end();
})



/**
 * 重定向返回的url，通过code获取openid
 * 根据重定向中state参数再次重定向至前端的不同页面，
 * url中uid为wechat_user表中的id
 *
 */
router.get('/node/back', function (reques, res, next) {
    var arg = URL.parse(reques.url, true).query;
    console.log(arg);
    console.log('code====================' + arg.code);
    console.log('code====================' + arg.state);
    var state=arg.state;
    var reg = new RegExp("detail", "");
    if(reg.test(arg.state)){
        state='group';
    }

    var getUid = function (openId) {
        var path;
        var data;
        var route='';
        var url='' ;

        switch (state) {
            case '':
            {
                path = '/node/login';
                data = JSON.stringify({open_id: openId});
                break;
            }
            case "brand":
            {
                path = '/node/login';
                data = JSON.stringify({open_id: openId});
                route = 'brand';
                break;
            }
            case "orders":
            {
                path = '/node/login';
                data = JSON.stringify({open_id: openId});
                route = 'orders';
                break;
            }
            case "coupons":
            {
                path = '/node/login';
                data = JSON.stringify({open_id: openId});
                route = 'coupon';
                break;
            }
            case "share":
            {
                path = '/node/login';
                data = JSON.stringify({open_id: openId});
                break;
            }
            case "group":
            {
                path = '/node/login';
                data = JSON.stringify({open_id: openId});
                route =arg.state;
                break;
            }

            default :
            {
                path = '/users/advertising';
                data = JSON.stringify({open_id: openId, tuid: arg.state});
                url ='http://mp.weixin.qq.com/s?__biz=MzAwNjQ3MjI5MQ==&mid=206079215&idx=1&sn=ee8af195866afe4f5b43dab8f5a92dd9#rd ';
                break;
            }
        }
        var opt = {
            host: 'www.dayday7.com',
            method: 'POST',
            path: path,
            headers: {
                "Content-Type": 'application/json',
                "Content-Length": data.length
            }
        }
        var body = '';
        console.log(opt);
        var req = http.request(opt,function (response) {
            var results = '';
            console.log("Got response: " + response.statusCode);
            response.on('data',function (chunk) {
                results += chunk;
            }).on('end', function () {
                var obj = JSON.parse(results);
                if(url==='' ){url = 'http://www.dayday7.com/?uid=' + obj.customer_id + '#' + route;}
                console.log(obj);
                console.log(url);
                res.redirect(url);
                res.end();
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        })
        req.write(data + "\n");
        req.end();
    }

    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + apid + '&secret=' + appsecret + '&code=' + arg.code + '&grant_type=authorization_code';
    https.get(url,function (res) {
        res.on('data', function (chunk) {
            var obj = JSON.parse(chunk);
            console.log('openid==============' + obj.openid);
            getUid(obj.openid);
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });

})

/**
 * 签名
 *
 */



router.post('/node/sign', function (req, res) {

    var json = {
        appid: apid,
        mch_id: businessNumber,
        time_stamp: createTimestamp(),
        nonce_str:createNonceStr(),
        product_id:req.body.product_id
    };

     raw(json);
    console.log(raw(json));
    res.json({result: raw(json)});
})



/**
 * 根据用户id获取用户open_id，这个open_id在wechat_user表中
 *
 */

router.post('/node/openid', function (reques, respon, next) {
    store.getPool().getConnection(function (err, conn) {
        console.log(parseInt(reques.body.uid));

        var querySQL = "select openid from customers where customer_id='" + reques.body.uid + "' ";
        conn.query(querySQL, function (err, rows) {
            if (err) console.log(err);
            console.log(rows);
            conn.release();
            respon.json({open_id: rows[0].openid});
        });
    });


})

/**
 * 支付请求，首先向微信发起统一支付请求，获取统一支付的预支付的订单ID即pre_pareId,然后通过MD5签名后将前端所需的json数据返回前端。
 *
 */

router.post('/node/pay', function (req, res, next) {


        var getClientIp =function  (req) {
            var ipAddress;
            var forwardedIpsStr = req.headers['x-forwarded-for'];
            if (forwardedIpsStr) {
                var forwardedIps = forwardedIpsStr.split(',');
                ipAddress = forwardedIps[0];
            }
            if (!ipAddress) {
                ipAddress = req.connection.remoteAddress;
            }
            console.log(ipAddress);
            return ipAddress;
        };

        req.body.money=parseFloat(req.body.money).toFixed(2);
        req.body.money=req.body.money*10;
        req.body.money=req.body.money*10;

        var json = {
            appid: apid,
            mch_id: businessNumber,
            body: req.body.productName,
            out_trade_no: req.body.orderId,
            total_fee: parseInt(req.body.money),
            spbill_create_ip: getClientIp(req),
            notify_url: notifyUrl,
            trade_type: 'JSAPI',
            openid: req.body.openid
        };

        console.log(json);

        var resjson = paySign(json);
        console.log('paysign======================' + resjson);
        var fn = function (err, result) {
            console.log('result=================='+JSON.stringify(result));
            var prepare = jsPaySign(result);
            console.log(prepare);
            res.send(prepare);
            res.end();
        }

        request({
            url: "https://api.mch.weixin.qq.com/pay/unifiedorder",
            method: 'POST',
            body: util.buildXML(resjson)
        }, function (err, response, body) {
            util.parseXML(body, fn);
        });
    }
)


/**
 * 统一下单接口
 *
 */

router.post('/node/prepareOrder', function (req, res, next) {


        var getClientIp =function  (req) {
            var ipAddress;
            var forwardedIpsStr = req.headers['x-forwarded-for'];
            if (forwardedIpsStr) {
                var forwardedIps = forwardedIpsStr.split(',');
                ipAddress = forwardedIps[0];
            }
            if (!ipAddress) {
                ipAddress = req.connection.remoteAddress;
            }
            console.log(ipAddress);
            return ipAddress;
        };

        req.body.money=parseFloat(req.body.money).toFixed(2);
        req.body.money=req.body.money*10;
        req.body.money=req.body.money*10;

        var json = {
            appid: apid,
            mch_id: businessNumber,
            body: req.body.productName,
            out_trade_no: req.body.orderId,
            total_fee: parseInt(req.body.money),
            spbill_create_ip: getClientIp(req),
            notify_url: notifyUrl,
            trade_type: 'JSAPI',
            openid: req.body.openid
        };

        console.log(json);

        var resjson = paySign(json);
        console.log('paysign======================' + resjson);
        var fn = function (err, result) {

            console.log(result);
            res.send(result);
            res.end();
        }

        request({
            url: "https://api.mch.weixin.qq.com/pay/unifiedorder",
            method: 'POST',
            body: util.buildXML(resjson)
        }, function (err, response, body) {
            util.parseXML(body, fn);
        });
    }
)





/**
 * 获取token，请求微信接口的唯一票据，7200秒过期或者提前过期，不稳定
 *
 */

router.post('/node/token', function (req, res, next) {

    var accessToken;
    var getSignature = function () {
        res.send(sign(ticket, req.body.url));
    }
    var callback = function (token) {
        console.log('token=======================' + JSON.stringify(token));
        if (accessToken != token.accessToken) {
            accessToken = token.accessToken;
            var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token.accessToken + '&type=jsapi';
            https.get(url,function (res) {
                res.on('data', function (chunk) {
                    var obj = JSON.parse(chunk);
                    ticket = obj.ticket;
                    getSignature();
                });
            }).on('error', function (e) {
                console.log("Got error: " + e.message);
            });

        } else {
            getSignature();
        }

    }

    weixinJs.getAccessToken(callback);
});

/**
 * 通过openid获取用户详细信息接口，较之于直接通过页面授权获取的用户信息更详细。
 *
 */

router.post('/node/information', function (req, res, next) {

    var callback = function (token) {
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + token.accessToken + '&openid=' + req.body.openid + '&lang=zh_CN';
        https.get(url,function (response) {
            response.on('data', function (chunk) {
                console.log('information======================' + chunk);
                var obj = JSON.parse(chunk);
                insertUserInformation(obj,req.body.openid); /*将获得的用户信息插入wechat_user表 */
                res.send(obj);
                console.log(obj);
                res.end();
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    }
    weixinJs.getAccessToken(callback);

});

/**
 * 通过openid获取用户分组信息。
 *
 */

router.post('/node/group', function (request, response, next) {
    var callback = function (token) {
        var data = JSON.stringify({openid: request.body.openid});
        console.log(data);
        var opt = {
            host: 'api.weixin.qq.com',
            method: 'POST',
            path: '/cgi-bin/groups/getid?access_token=' + token.accessToken,
            headers: {
                "Content-Type": 'application/json',
                "Content-Length": data.length
            }
        }
        var body = '';
        var req = https.request(opt,function (res) {
            console.log("Got response: " + res.statusCode);
            res.on('data',function (chunk) {
                var obj = JSON.parse(chunk);
                console.log(obj.groupid);
                response.send(obj);
                response.end();
            }).on('end', function () {
                console.log(res.headers)
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        })
        console.log('request.body.openid===================' + request.body.openid);

        req.write(data + "\n");
        req.end();
    }
    weixinJs.getAccessToken(callback);
});
/**
 * 微信的退款接口，退款必须使用支付时所使用的退款的订单号，发送数据为xml的字符串，返回数据依然是xml格式的字符串。
 * 请求该接口必须携带双向证书，证书在商户平台里面下载。
 *
 */

router.post('/node/refund', function (request, response, next) {
    var json = {
        appid: apid,
        mch_id: businessNumber,
        nonce_str: createNonceStr(),
        out_trade_no: request.body.orderId,
        out_refund_no: createNonceStr(),
        total_fee: '1',
        refund_fee: '1',
        op_user_id: businessNumber
    };

    var rejson = mdSign(json);
    console.log(rejson);
    var fn = function (err, result) {
        console.log(result);
        response.send(result);
        response.end();
    }
    var data = util.buildXML(rejson);
    //var data=JSON.stringify(rejson);
    var opt = {
        host: 'api.mch.weixin.qq.com',
        method: 'POST',
        path: '/secapi/pay/refund',
        key: fs.readFileSync(Config.keyPath + 'apiclient_key.pem'),
        cert: fs.readFileSync(Config.keyPath + 'apiclient_cert.pem'),
        rejectUnauthorized: true,
        agent: false
    };
    var body = '';
    var req = https.request(opt,function (res) {
        console.log("Got response: " + res.statusCode);
        res.on('data',function (chunk) {
            console.log(chunk);
            util.parseXML(chunk, fn);
        }).on('end', function () {
            console.log(res.headers)
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    })
    req.write(data + "\n");
    req.end();


});

/**
 * 将获得的用户信息插入wechat_users表
 */

function insertUserInformation(data,openId) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "update customers set nick_name='"+data.nickname+"',head_img_url='"+data.headimgurl+"',subscribe=" +
            "'"+data.subscribe+"' where openid = '"+openId+"'";
        console.log(querySQL);
        conn.query(querySQL, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
            }

        });
    });
}

router.post('/node/login', function(req, res, next) {

    var flag=0;
    store.getPool().getConnection(function (err, conn) {

        var querySQL = "select customer_id from customers where customers.openid='"+req.body.open_id+"' ";
        conn.query(querySQL,function(err,rows){
            console.log('!!!!!!!!');
            if (err) console.log(err);
            conn.release();
            /*如果用户已存在*/
            if(rows.length!=0){
//                var wechat_user_id=rows[0].id;
                res.json(rows[0]);

            }else{
                /*用户不存在*/
                createdWechatUser(res,req.body);
            }
//            res.end();
        });
    });
});

router.post('/node/code',function(req,res){

    var postData;

    function getPrepay_id(dataJson){

         var data = JSON.stringify(dataJson);



        var opt = {
            host: 'www.dayday7.com',
            method: 'POST',
            path: '/node/prepareOrder',
            headers: {
                "Content-Type": 'application/json',
                "Content-Length": data.length
            }
        }
        var body = '';
        console.log(opt);
        var request = http.request(opt,function (response) {
            var results = '';
            console.log("Got response: " + response.statusCode);
            response.on('data',function (chunk) {
                results += chunk;
            }).on('end', function () {
                var obj = JSON.parse(results);
                var NonceStr=createNonceStr();
                var signJson={
                    return_code:'SUCCESS',
                    appid:apid,
                    mch_id:businessNumber,
                    nonce_str:NonceStr,
                    prepay_id: obj.prepay_id,
                    result_code:'SUCCESS'
                };


                var rejson={
                    return_code:'SUCCESS',
                    appid:apid,
                    mch_id:businessNumber,
                    nonce_str:NonceStr,
                    prepay_id:obj.prepay_id,
                    result_code:'SUCCESS',
                    sign:mdSign(signJson).sign
                }


                var data = util.buildXML(rejson);
                console.log(data);
                res.send(data);
                res.end;

            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        })
        request.write(data + "\n");
        request.end();

    }

    var resultsData='';

    req.on('data',function (chunk) {
         resultsData += chunk;


    }).on('end', function () {

        util.parseXML(resultsData,  function (err, result) {
            console.log(result);
            store.getPool().getConnection(function (err, conn) {

                var querySQL = "select order_total from orders where order_no='"+result.product_id+"' ";
                conn.query(querySQL,function(err,rows){
                    console.log('!!!!!!!!');
                    if (err) console.log(err);
                    conn.release();

                    postData={
                        money:rows[0].order_total,
                        productName:'test',
                        orderId:result.product_id,
                        openid:result.openid
                    }
                    console.log(postData);
                    getPrepay_id(postData);


                });
            });
        });
    });



})


router.post('/node/payBack',function(req,res){

    var resultsData='';

    req.on('data',function (chunk) {
        resultsData += chunk;


    }).on('end', function () {

        util.parseXML(resultsData,  function (err, result) {
            console.log(result);
            if(result.return_code=='SUCCESS'){

                //store.getPool().getConnection(function (err, conn) {
                //
                //    var querySQL = "select order_total from orders where order_no='"+result.product_id+"' ";
                //    conn.query(querySQL,function(err,rows){
                //        console.log('!!!!!!!!');
                //        if (err) console.log(err);
                //        conn.release();
                //
                //    });
                //});

                var rejson={
                    return_code:'SUCCESS'
                }
                var data = util.buildXML(rejson);
                console.log(data);
                res.json(data);
                res.end;



            }else{

                var rejson={
                    return_code:'FAIL'
                }
                var data = util.buildXML(rejson);
                console.log(data);
                res.json(data);
                res.end;
            }

        });
    });


})


/*如果用户不存在，创建用户*/
function createdWechatUser(res,req){
    store.getPool().getConnection(function (err, conn) {

        var querySQL = "insert into customers (customer_name,openid,register_date) values('昵称',?,now())";
        conn.query(querySQL,req.open_id,function(err,rows){
            conn.release();
            if (err) console.log(err);
            console.log(rows);

            res.json({customer_id:rows.insertId});

        });
    });
}


router.get('/generate/qrcode/',function(req,res){
    var product_id = req.query.jpath;
    var json = {
        appid: apid,
        mch_id: businessNumber,
        time_stamp: createTimestamp(),
        nonce_str:createNonceStr(),
        product_id:product_id
    };

    var dataUrl='weixin://wxpay/bizpayurl?'+raw(json);


    console.log("二维码内容："+dataUrl);
    var qr = qrcode.qrcode(10, 'L');
    qr.addData(dataUrl);  // 解决中文乱码
    qr.make();
    var base64 = qr.createImgTag(5, 10);  // 获取base64编码图片字符串
    base64 = base64.match(/src="([^"]*)"/)[1];  // 获取图片src数据
    base64 = base64.replace(/^data:image\/\w+;base64,/, '');  // 获取base64编码
    base64 = new Buffer(base64, 'base64');  // 新建base64图片缓存
    res.writeHead(200, {'Content-Type': 'image/png', 'Content-Disposition': 'attachment; filename=' + product_id + '.png'});  // 设置http头
    res.write(base64);  // 输出图片
    res.end();
});



module.exports = router;
