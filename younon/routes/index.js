var express = require('express');
var router = express.Router();
var DbStore = require('../DbUtils/DbUtils');
var store = new DbStore();
var moment = require('moment');

/* GET home page. */
router.get('/adminOrders/:statue/:page/:size', function(req, res, next) {

    var statue = req.params.statue;
    var page=req.params.page;
    var size=req.params.size;
    var statueMap={
        unship:'(2,9)',
        shipped:'(3,4)',
        closed:'(13,0)'
    }
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select orders.order_id,orders.order_no,orders.deliver_time," +
            "orders.deliver_phone,orders.date_purchased,orders.order_total,orders.order_status," +
            "orders.deliver_type,payment_methods.payment_type from orders,payment_methods where orders.status=1 and " +
            "payment_methods.payment_method_id=orders.payment_type and orders.order_status_id in "+statueMap[statue]+
            "order by orders.last_modified desc limit "+(page-1)*size+","+size;
        conn.query(querySQL, function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                res.json(500, {error: err});
            }else{
                rows.forEach(function(data){
                    var date_purchased = moment(data.date_purchased).format('YYYY-MM-DD HH:mm:ss');
                    data.date_purchased=date_purchased;

                });
                res.json(rows);
                //res.json(love_number);
            }
            res.end();

        });
    });
});



router.put('/adminOrders/changeStatue/:orderId/:statueId', function(req, res, next) {

    var statueId = req.params.statueId;
    var orderId = req.params.orderId;
    var statueMap={
        3:'已支付已发货',
        4:'未付款已发货',
        13:'管理员关闭'
    };

    store.getPool().getConnection(function (err, conn) {
        var querySQL = "update orders set order_status_id="+statueId+",order_status='"+statueMap[statueId]+
            "' where order_id = "+orderId;
        console.log(querySQL);
        conn.query(querySQL, function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                res.json(500, {error: err});
            }else{
                res.json(200);
            }
            res.end();
        });
    });
});


module.exports = router;
