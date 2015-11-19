/**
 * Created by wei on 15/10/19.
 */
var DbStore = require('../../DbUtils/DbUtils');
var store = new DbStore();
var shopModel = module.exports;
var moment=require('moment');

//获取轮播图片
shopModel.getCarousel=function(cb){
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select imgUrl from view_pages where page_id = 1";
        conn.query(querySQL, null,function (err, rows) {
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


//获取分类信息
shopModel.getCategory = function(cb){
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select categories_id, category_name from categories where parent_id is null and category_status = 1";
        conn.query(querySQL, null,function (err, rows) {
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

//获取产品数据
shopModel.getGoods = function(page,size,categoryid,cb){
    var start=(parseInt(page)-1)*parseInt(size);
    store.getPool().getConnection(function (err, conn) {
        var like = ' where prod_categoryids like \'%' + categoryid  + '%\' and prod_status != 5 ';
        var querySQL ="select prod_id,prod_name,prod_images,prod_price from products "+like+"order by prod_updatetime desc limit "+start+","+size;
        conn.query(querySQL, null,function (err, rows) {
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


//查询商品详情
shopModel.findGood = function(goodId,cb){

    store.getPool().getConnection(function (err, conn) {

        var querySQL ="select prod_id,prod_name,prod_images,prod_price,prod_detail from products where prod_id = "+goodId;
        conn.query(querySQL, null,function (err, rows) {
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

//根据关键字查找商品

shopModel.searchGoods = function(page,size,keyword,cb){
    var start=(parseInt(page)-1)*parseInt(size);
    if(keyword=='null'){
        keyword='';
    }
    store.getPool().getConnection(function (err, conn) {
        var like = ' where prod_name like \'%' + keyword  + '%\' and prod_status != 5 ';
        var querySQL ="select prod_id,prod_name,prod_images,prod_price from products "+like+"order by prod_updatetime desc limit "+start+","+size;
        console.log(querySQL);
        conn.query(querySQL, null,function (err, rows) {
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



//如果购物车中存在商品则修改数量
function updateBasket(status,quantity,goods,cb){
    var sql={
        0:'update customers_baskets set status = 1,quantity = ?  where customer_id = ? and prod_sku_id = ?',
        1:'update customers_baskets set quantity = ?  where customer_id = ? and prod_sku_id = ?'
    }

    if(status){
        goods.quantity=quantity+goods.quantity;
    }

    store.getPool().getConnection(function (err, conn) {
        var querySQL = sql[status];
        conn.query(querySQL,[goods.quantity,goods.customersId,goods.prod_id], function (err, rows) {
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



//如果购物车中不存在商品则添加商品至购物车中
function addBasket (goods,cb){

    store.getPool().getConnection(function (err, conn) {
        var querySQL = "insert into customers_baskets(customer_id,prod_sku_id,quantity,date_added,status) values(?,?,?,now(),1)";
        conn.query(querySQL,[goods.customersId,goods.prod_id,goods.quantity], function (err, rows) {
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



//购物车添加商品
shopModel.addBasket = function(goods,cb){

    //首先查询购物车中是否存在商品
    store.getPool().getConnection(function (err, conn) {
        var querySQL = "select status,quantity from customers_baskets where customer_id = ?  and prod_sku_id = ?";
        conn.query(querySQL,[goods.customersId,goods.prod_id],function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                cb(err,null)
            }else{
               if(rows.length==0){
                   addBasket(goods,cb)
               }else{
                   updateBasket(rows[0].status,rows[0].quantity,goods,cb)
               }
            }
        });
    });
}

function arrToStr(arr,key){

    var str ='';
    if(arr.length>1){
        for(var i=0;i<arr.length;i++){
            if(i==0){
                str=str+'('+arr[i][key]+',';
            }else if(i==(arr.length-1)){
                str=str+arr[i][key]+')';
            }else{
                str=str+arr[i][key]+',';
            }
        }
    }else{
        str ='('+arr[0][key]+')';
    }

    return str;
}

//删除购物车商品
shopModel.delBasket = function(goods,cb){
    var prod_id = arrToStr(goods,'prod_id');

    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'update customers_baskets set status = 0  where customer_id = ? and prod_sku_id in ' + prod_id;
        conn.query(querySQL,goods[0].customersId, function (err, rows) {
            console.log(querySQL);
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

//获取购物车中的商品

shopModel.getBasket = function(customerId,cb){
    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'select prod_id,prod_name,prod_images,prod_price,prod_weight,quantity from products left join customers_baskets on ' +
            ' products.prod_id = customers_baskets.prod_sku_id where  customers_baskets.customer_id = ? and customers_baskets.status != 0 ' +
            'and products.prod_status != 5';
        conn.query(querySQL,customerId, function (err, rows) {
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

//修改购物车商品数量

shopModel.chgBasket = function(customerId,prod_id,quantity,cb){

    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'update customers_baskets set quantity = ?  where customer_id = ? and prod_sku_id = ? ';
        conn.query(querySQL,[quantity,customerId,prod_id], function (err, rows) {
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


//获取订单号
function getOrderNumber() {
    var Num = "";
    for (var i = 0; i < 6; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    Num += moment().format('X');
    return Num;
}


//新增订单

shopModel.addOrder = function(data,cb){
    data.order_no=getOrderNumber();
    data.date_purchased=moment().format("YYYY年MM月DD日 HH:mm");
    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'insert into orders(customer_id,order_no,deliver_time,deliver_status,deliver_address,deliver_phone,' +
            'deliver_charges,payment_id,payment_type,date_purchased,last_modified,order_total,order_status_id,order_status,' +
            'receiver_name,deliver_type,status) values(?,?,?,?,?,?,?,?,?,now(),now(),?,?,?,?,?,1)';
        conn.query(querySQL,[data.customer_id,data.order_no,data.deliver_time,data.deliver_status,data.deliver_address,data.deliver_phone,
        data.deliver_charges,data.payment_id,data.payment_type,data.order_total,data.order_status_id,data.status_name,data.receiver_name,data.deliver_type], function (err, rows) {
            conn.release();
            if (err){
                console.log(err);
                cb(err,null)
            }else{
                data.order_id=rows.insertId;
                console.log(data.order_id);
                insertOrderItems(data,function(err,insertResults){
                    if(err){
                        cb(err,null);
                    }else{
                            cb(null,rows.insertId);
                    }
                })
            }
        });
    });
}

//order_items中插入数据

function insertOrderItems(data,cb){
    var values='';

    for(var i =0;i< data.items.length;i++){
        if(i<data.items.length-1){
            values+='('+data.order_id+','+data.items[i].prod_id+','+data.items[i].quantity+','+data.items[i].prod_price+',0,?,1,0),';
        }else{
            values+='('+data.order_id+','+data.items[i].prod_id+','+data.items[i].quantity+','+data.items[i].prod_price+',0,?,1,0)';
        }
    }

    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'insert into order_items(order_id,prod_sku_id,product_quantity,final_price,base_price,customer_id,' +
            'status,have_comment) values'+values;
        console.log(querySQL);
        conn.query(querySQL,data.customer_id, function (err, rows) {
            conn.release();
            if (err){
                console.log('插入失败');
                console.log(err);
                cb(err,null)
            }else{
                cb(null,rows);
            }
        });
    });
}






//获取提交商品的商品信息

function getGoodsInfor(goodsId,cb){

    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'select prod_id,prod_name,prod_images,prod_weight,prod_price from products where prod_id in '+goodsId;
        conn.query(querySQL,null, function (err, rows) {
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

//strToJSON获取值

function getDeliverValue(str,sumWeight){
    var develiryObj=JSON.parse(str);
    var keyArr=[0];
    var valueArr=[];
    for(var key in develiryObj){
        keyArr.push(key);
        valueArr.push(develiryObj[key])
    }
    if(keyArr.length>1){
        for(var k=0;k<keyArr.length; k++){
            if(parseInt(keyArr[k]) <= sumWeight && sumWeight < parseInt(keyArr[k+1])){
                return valueArr[k];
            }
            if(k == (keyArr.length-1) ){
                return valueArr[k-1];
            }
        }
    }else {
        return 0;
    }
}

//字符串转json再转数组

function strToArr(str){

    var develiryObj=JSON.parse(str);
    var valueArr=[];
    for(var key in develiryObj){
        valueArr.push({id:key,value:develiryObj[key]})
    }
    return valueArr;

}


//获取运费

shopModel.getCharge = function(data,cb){

    var goodsId = arrToStr(data,'prod_id');

    getGoodsInfor(goodsId,function(err,results){
        if(!!err){
            cb(err,null)
        }else{
            var sumWeight=0;
            for(var i in results){
                for(var m in data){
                    if(data[m].prod_id == results[i].prod_id){
                        results[i].quantity=data[m].quantity;
                        sumWeight+=results[i].quantity*results[i].prod_price;
                    }
                }
            }

            store.getPool().getConnection(function (err, conn) {
                var querySQL = 'select attr_value,attr_type from attribute';
                conn.query(querySQL,null, function (err, rows) {
                    conn.release();
                    if (err){
                        console.log(err);
                        cb(err,null)
                    }else{
                        var result={goods:results,deliver_charges:0,deliver_free:0};
                        var delCharge='';
                        var freeCharge='';
                        var deliver_time='';
                        var deliver_type='';
                        var pay_type='';


                        for (var i =0;i<rows.length;i++){
                            if(rows[i].attr_type == 'deliver_free'){
                                freeCharge=rows[i].attr_value;
                            }
                            if(rows[i].attr_type == 'deliver_charges'){
                                delCharge=rows[i].attr_value;
                            }
                            if(rows[i].attr_type == 'deliver_time'){
                                deliver_time=rows[i].attr_value;
                            }
                            if(rows[i].attr_type == 'deliver_type'){
                                deliver_type=rows[i].attr_value;
                            }
                            if(rows[i].attr_type == 'pay_type'){
                                pay_type=rows[i].attr_value;
                            }
                        }
                        result.deliver_charges=getDeliverValue(delCharge,sumWeight);
                        result.deliver_free=getDeliverValue(freeCharge,sumWeight);
                        result.deliver_time=strToArr(deliver_time);
                        result.deliver_type=strToArr(deliver_type);
                        result.pay_type=strToArr(pay_type);
                        console.log(result);
                        cb(null,result);
                    }
                });
            });
        }
    });
}

//获取运费规则描述

shopModel.getDeliverRule =function(cb){

    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'select attr_value from attribute where attr_id = 8';
        conn.query(querySQL,null, function (err, rows) {
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




