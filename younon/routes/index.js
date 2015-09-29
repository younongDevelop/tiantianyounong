var express = require('express');
var router = express.Router();
var DbStore = require('../DbUtils/DbUtils');
var store = new DbStore();

/* GET home page. */
router.get('/adminOrders/:statue', function(req, res, next) {

    var statue = req.params.statue;
    var statueMap={
        unship:'(2,9)',
        shipped:'(3,4)',
        closed:'13'
    }
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select orders.order_id,orders.order_no,orders.deliver_time," +
            "orders.deliver_phone,orders.date_purchased,orders.order_total,orders.order_status," +
            "orders.receiver_type payment_methods.payment_type from orders,payment_methods where orders.status=1 and " +
            "payment_methods.payment_method_id=orders.payment_type and orders.order_status_id in "+statueMap[statue];
        conn.query(querySQL, function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                res.json(500, {error: err});
            }else{
               console.log(rows);
                //res.json(love_number);
            }
            res.end();

        });
    });
});

module.exports = router;
