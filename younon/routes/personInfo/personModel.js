/**
 * Created by wei on 15/10/23.
 */
var DbStore = require('../../DbUtils/DbUtils');
var store = new DbStore();
var personModel = module.exports;

//获取用户所有地址
personModel.getAddress=function(customerId,page,pageSize,cb){
    var start=(parseInt(page)-1)*parseInt(pageSize);
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select address_id,address_detail,receiver_name,receiver_phone from address where status = 1 and customer_id = ? order by version desc limit "+start+","+pageSize;
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
        var querySQL = "update address set status = 0 where address_id = ?";
        conn.query(querySQL, address_id, function (err, rows) {
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
personModel.getDistrict=function(cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "update address set status = 0 where address_id = ?";
        conn.query(querySQL, address_id, function (err, rows) {
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
personModel.getCommunity=function(cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "update address set status = 0 where address_id = ?";
        conn.query(querySQL, address_id, function (err, rows) {
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
personModel.getSince=function(cb) {
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "update address set status = 0 where address_id = ?";
        conn.query(querySQL, address_id, function (err, rows) {
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







