/**
 * Created by wei on 15/10/19.
 */
var DbStore = require('../../DbUtils/DbUtils');
var store = new DbStore();
var shopModel = module.exports;

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

//删除购物车商品
shopModel.delBasket = function(goods,cb){
    var prod_id ='';
    if(goods.length>1){
        for(var i=0;i<goods.length;i++){
            if(i==0){
                prod_id=prod_id+'('+goods[i].prod_id+',';
            }else if(i==(goods.length-1)){
                prod_id=prod_id+goods[i].prod_id+')';
            }else{
                prod_id=prod_id+goods[i].prod_id+',';
            }
        }
    }else{
        prod_id ='('+goods[0].prod_id+')';
    }

    store.getPool().getConnection(function (err, conn) {
        var querySQL = 'update customers_baskets set status = 0  where customer_id = '+goods[0].customersId+' and prod_sku_id in ' + prod_id;
        conn.query(querySQL,null, function (err, rows) {
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




