
angular.module('index.services', [])

.factory('cart', function($http,util) {

        var goods = [];
        var goodsNumber={number:0,sum:0,numberArr:[]};
        var changeGoodsNumber=function(){
            goodsNumber.number=0;
            goodsNumber.sum=0;
            goodsNumber.numberArr=[];
            for (var i in goods) {
                goodsNumber.number=goodsNumber.number+goods[i].quantity;
                goodsNumber.sum=goodsNumber.sum+goods[i].quantity*goods[i].product_sell_price/100;
                goodsNumber.numberArr.push(goods[i].quantity);
            }
            console.log(goodsNumber);
        }
        var load=function () {
            $http.get(api+'/basket/'+customerId+'/0/100/0').success(function (data) {

                if(data.code===0){
                    for (var i in data.results) {
                        if(data.results[i].statue!=0){goods.push(data.results[i]);}
                    }
                }
                console.log(goods);

                goods.forEach(function(item){
                    var obj = JSON.parse(item.product_images);
                    item.image=obj.small;
                })
                changeGoodsNumber();
            }).error(function (res) {
                console.log(res);

            });
        }
        load();

        return {
            getGoods: function (cb) {
                cb(goods);
            },
            /**
            * @desc 请求服务器获取最新的购物车数据
            * @func getGoodsUpToDate
            * @param {function} suc 请求成功后调用的回调函数
            * @param {function} fail 请求失败后调用的回调函数
            */
            getGoodsUpToDate:function(suc, fail){
                $http.get(api+'/basket/'+customerId+'/0/100/0').success(function (data) {
                    var goods = [];
                    if(data.code===0){
                        for (var i in data.results) {
                            if(data.results[i].statue!=0){goods.push(data.results[i]);}
                        }
                    }
                    console.log(goods);

                    goods.forEach(function(item){
                        item.product_images = util.parseImgUrls(item.product_images);
                        item.image=item.product_images.small;
                        item.product_id = item.prod_sku_id;
                    })
                    suc && suc(goods);
                }).error(function (res) {
                    console.log(res);
                    fail && fail(res);
                });
            },
            getGoodsNumber:function(cb){
                cb(goodsNumber);
            },
            /**
            * @desc 添加商品到购物车
            * @func addGoods
            * @param {number} pro 商品对象
            * @param {function} suc 添加成功后的回调函数
            * @param {function} err 添加失败后的回调函数
            */
            addGoods:function(pro,suc,err){
                var pid = parseInt(pro.product_id);
                var addInfo = {
                    cid:customerId,
                    pid:pro.product_id,
                    quantity:pro.quantity
                }
                $http.post(api+'/basket/add',addInfo).success(function(res){
                    if(res.code === 0 ){
                        suc && suc(res);
                        // 如果商品存在于购物车，更新购物车的单商品数量
                        for(var i in goods){
                            var good = goods[i];
                            if(good.prod_sku_id === pid){
                                good.quantity+=addInfo.quantity;
                                good.version = res.results;
                                changeGoodsNumber();
                                return
                            }
                        }
                        // 如果商品不存在 将商品加入购物车模型
                        pro.prod_sku_id = pro.product_id;
                        pro.version = res.results;                   
                        goods.unshift(pro);
                        changeGoodsNumber();
                        return;
                    }
                    err && err(res);
                }).error(function(res){
                    err && err(res);
                })
            },
            deleteGoods:function(index,cb){
                $http.put(api+'/basket/del/'+customerId+'/'+goods[index].prod_sku_id).success(function (data) {
                    console.log(data);
                    if(data.code===0){
                        goods.splice(index,1);
                        changeGoodsNumber();
                    }
                }).error(function (res) {
                    cb();
                });
            },
            changeNumber:function(number,index,cb){
                $http.put(api+'/basket/chg/'+customerId+'/'+goods[index].prod_sku_id+'/'+number).success(function (data) {
                   console.log(data);
                    if(data.code===0){
                        goods[index].quantity=number;
                        console.log(goods[index].quantity);
                        changeGoodsNumber();
                    }

                }).error(function (res) {
                    console.log(res);
                    changeGoodsNumber();
                    cb();
                });
            },
            hasMore: function () {
                return isMore;
            }
        }
})
.factory('cate',function($http){
    var catesInfo = {cates:[]};
    var hotprosInfo = {hotpros:[]};
    function load(){
        var searchUrl = '/search/?field=product_id+product_url+prod_sku_id+product_name+product_images+sku_attrval+product_original_price+product_sell_price+product_origin+product_weight+commentcount&n=40&wf=product&from=weixin&categoryid={categoryid}&ranker_type='
        // 记录将要发送的请求数
        // 载入列别数据
        $http.get('/rest/categories').success(function(data){
            console.log('/rest/categories',data);
            var cates = catesInfo.cates = data.results;
            // reqRecond = cates.length;
            for(var index in cates){
                var cate = cates[index];
                var url = searchUrl.replace("{categoryid}", cate.id);
                (function(){
                    var thisCate = cate;
                    $http.get(url).success(function(data){
                        thisCate.pros = data.search_response && data.search_response.books;
                        // 将图片地址string转化为object
                        // for(var i in thisCate.pros){
                        //     var pro = thisCate.pros[i];
                        //     try{
                        //         pro.product_images = JSON.parse(pro.product_images);
                        //     }catch(e){
                        //         pro.product_images = {small:null,list:null};
                        //     }
                        // }
                    })
                })();
            }
        })
    }
    //载入热卖数据
    function loadHot(){
        $http.get(api+"/hotSale/0/10").success(function(data){
            if(data.code === 0){
                hotprosInfo.hotpros = data.results;
            }
        })
    }
    load();
    loadHot();
    return {
        /**
        * @desc 获取分类数据,分类数据中包含产品数据
        * @func getCates
        * @param {function} cb 回调函数
        */ 
        getCates: function(cb){
            cb && cb(catesInfo);
        },
        getHotPros:function(cb){
            cb && cb(hotprosInfo);    
        }

    }
});
