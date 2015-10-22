
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
                goods.forEach(function(item){
                    item.image='http://120.131.70.188:3003/'+item.product_images;
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
            },
            clearGoods:function() {
                while(goods.length>0){
                    goods.pop();
                }
                changeGoodsNumber();
            }
        }
})
.factory('cate',function($http){
    var cates=[];
      var  goods=[];
        var cateId='';

        function loadProducts(categoryId,page,pageSize,cb){
            if(page == 1){goods.splice(0,goods.length);}
            $http.get('/shop/getGoods/'+page+'/'+pageSize+'/'+categoryId).success(function(data){
                if(cb){cb(data);}
                console.log(data);
                for(var i=0;i<data.results.length;i++){
                    data.results[i].prod_images='http://120.131.70.188:3003/'+data.results[i].prod_images;
                    goods.push(data.results[i]);
                }
                console.log(goods);
            }).error(function(err){
                console.log(err);
            })
        }

    function loadCategory(cb) {
        $http.get('/shop/getCategory').success(function (data) {
           var catesInfo = data.results;
            var arr=[];
            for(var i=1;i<=catesInfo.length;i++){
                catesInfo[i-1].show=false;
                if(i==1){
                    catesInfo[i-1].show=true;
                    cateId=catesInfo[i-1].categories_id;
                }
                arr.push(catesInfo[i-1]);
                if(i%5 === 0|| i == catesInfo.length){
                            cates.push(arr);
                            arr=[];
                        }

            }
            cb && cb(cates);
        }).error(function(err){
            console.log(err);
        })
    }

    return {
        /**
        * @desc 获取分类数据,分类数据中包含产品数据
        * @func getCates
        * @param {function} cb 回调函数
        */ 
        getCates: function(cb){
            loadCategory(cb)
        },
        getGoods:function(cb){
            cb && cb(goods);
        },
        loadGoods:function(cateid,page,pageSize,cb){
            if(!cateid){cateid=cateId};
            loadProducts(cateid,page,pageSize,cb);
        }

    }
})


    .factory('others',function($http){

        return {

            getCarousel: function(cb){

                $http.get('/shop/getCarousel').success(function(data){
                    var carousel=[];
                    if(data.results.imgUrl)carousel=data.results.imgUrl.split(',')
                    cb(null,carousel)

                }).error(function(err){
                    cb(err,null);
                })


            },
            getHotPros:function(cb){
                cb && cb(hotprosInfo);
            }

        }
    })





    .factory('weixin',function($http){

        return{
            getToken:function(data,cb){
                $http.post('/node/token',data).success(function(data){
                    cb(data);
                });
            },
            getOpenId:function(data,cb){
                $http.post('/node/openid',data).success(function(data){
                    cb(data);
                });
            },
            getInformation:function(data,cb){
                $http.post('/node/information',data).success(function(data){
                    cb(data);
                });
            },
            getGroup:function(data,cb){
                $http.post('/node/group',data).success(function(data){
                    cb(data);
                });
            },
            weixinPay:function(data,cb){
                $http.post('/node/pay',data).success(function(data){

                    wx.chooseWXPay({
                        timestamp: data.timeStamp,
                        nonceStr: data.nonceStr,
                        package: data.package,
                        signType: data.signType,
                        paySign: data.paySign,
                        success: function (res) {

                            cb(data);

                        }
                    });
                });
            }
        }
    });


