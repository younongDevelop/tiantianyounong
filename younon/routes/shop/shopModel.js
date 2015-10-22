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
        conn.query(querySQL, function (err, rows) {
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
        conn.query(querySQL, function (err, rows) {
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
        conn.query(querySQL, function (err, rows) {
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




