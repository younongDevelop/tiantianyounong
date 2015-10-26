/**
 * Created by wei on 15/10/23.
 */
var DbStore = require('../../DbUtils/DbUtils');
var store = new DbStore();
var personModel = module.exports;
var moment = require('moment');

//获取用户所有地址
personModel.getAddress=function(customerId,page,pageSize,cb){
    var start=(parseInt(page)-1)*parseInt(pageSize);
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select address_id,address_detail,receiver_name,receiver_phone from address where status = 1 and customer_id = ? order by address_id desc limit "+start+","+pageSize;
        conn.query(querySQL, customerId,function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                cb(err,null)
            }else{
                cb(null,rows);
            }
        });
    });
}


//查询用户用户地址
personModel.findAddress=function(addressId,cb){
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select address_id,city_id,district_id,city_name,district_name,community_name,community_id,address_room,receiver_name,receiver_phone from address where address_id = ? "
        conn.query(querySQL, addressId,function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                cb(err,null)
            }else{
                cb(null,rows);
            }
        });
    });
}


//用户地址修改

personModel.updateAddress=function(data,cb){
    data.address_detail=data.city_name+data.district_name+data.community_name+data.address_room;
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "update address set city_name = ?,district_name = ?,community_name = ?,city_id = ?,district_id = ?,community_id = ?," +
            " address_room = ?,address_detail = ?,receiver_name = ?,receiver_phone = ? where address_id = ?";
        conn.query(querySQL, [data.city_name,data.district_name,data.community_name,data.city_id,data.district_id,data.community_id,
        data.address_room,data.address_detail,data.receiver_name,data.receiver_phone,data.address_id],function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                cb(err,null)
            }else{
                cb(null,rows);
            }
        });
    });
}



//新增用户地址

personModel.addAddress=function(data,cb){
    data.address_detail=data.city_name+data.district_name+data.community_name+data.address_room;
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "insert into address (customer_id,city_name,district_name,community_name,city_id,district_id,community_id," +
            "address_room,address_detail,receiver_name,receiver_phone,status) values (?,?,?,?,?,?,?,?,?,?,?,1)";
        conn.query(querySQL,[data.customer_id,data.city_name,data.district_name,data.community_name,data.city_id,data.district_id,data.community_id,
            data.address_room,data.address_detail,data.receiver_name,data.receiver_phone] ,function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                cb(err,null)
            }else{
                console.log(rows)
                cb(null,rows);
            }
        });
    });
}

//删除用户地址
personModel.delAddress=function(address_id,cb){
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "update address set status = 0 where address_id = ?";
        conn.query(querySQL,address_id,function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                cb(err,null)
            }else{
                cb(null,rows);
            }
        });
    });

}

//获取城市列表
personModel.getCity=function(cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select city_id,city_name from cities";
        conn.query(querySQL, null, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows);
            }
        });
    });
}

//获取区列表
personModel.getDistrict=function(cityId,cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select district_id,district_name from districts where city_id = ?";
        conn.query(querySQL, cityId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows);
            }
        });
    });
}


//获取小区列表
personModel.getCommunity=function(districtId,cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select comm_id,comm_name from communities where district_id = ? and since_statue =0";
        conn.query(querySQL,districtId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows);
            }
        });
    });
}


//获取自提点列表
personModel.getSince=function(districtId,cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select comm_id,comm_name from communities where district_id = ? and since_statue =1";
        conn.query(querySQL, districtId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows);
            }
        });
    });
}

//获取订单列表

personModel.getOrders=function(customerId,statue,page,pageSize,cb) {
    var start=(parseInt(page)-1)*parseInt(pageSize);
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select order_id,date_purchased,order_status,deliver_charges,order_total from orders  where customer_id = ? and order_status_id in "+statue+" order by last_modified desc limit "+start+","+pageSize;
        conn.query(querySQL, customerId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                    var k=0;
                    if(rows.length>0)for(var i in rows){
                        rows[i].date_purchased=moment(rows[i].date_purchased).format("YYYY年MM月DD日 HH:mm");
                        getItems(rows[i].order_id,function(err,data,orderId){
                            for(var m in rows){
                                if(rows[m].order_id == orderId){rows[m].items=data;}
                            }
                            k++;
                            if(k == rows.length){
                                cb(null, rows);
                            }
                        })
                    }else{
                        cb(null, rows);
                    }
            }
        });
    });
}

function getItems (orderId,cb){

    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select product_quantity,prod_name,prod_images from order_items left join products on order_items.prod_sku_id = products.prod_id where " +
            "order_id = ?;"
        conn.query(querySQL, orderId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows,orderId);
            }
        });
    });
}


//获取订单详情
personModel.findOrder=function(orderId,cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select comm_id,comm_name from communities where district_id = ? and since_statue =1";
        conn.query(querySQL, districtId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows);
            }
        });
    });
}

//修改订单状态

personModel.chgOrder=function(orderId,statue,cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select comm_id,comm_name from communities where district_id = ? and since_statue =1";
        conn.query(querySQL, districtId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows);
            }
        });
    });
}

//新增订单
personModel.addOrder=function(data,cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select comm_id,comm_name from communities where district_id = ? and since_statue =1";
        conn.query(querySQL, districtId, function (err, rows) {
            conn.release();
            if (err) {
                console.log(err);
                cb(err, null)
            } else {
                cb(null, rows);
            }
        });
    });
}







