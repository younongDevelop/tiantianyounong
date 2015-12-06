
angular.module('index.services', [])

.factory('cart', function($http) {

        var goodDetail;
        var goods = [];
        var goodsNumber={number:0,sum:0,numberArr:[]};
        var changeGoodsNumber=function(){
            console.log(goods);
            goodsNumber.number=0;
            goodsNumber.sum=0.00;
            goodsNumber.numberArr=[];
            for (var i in goods) {
                var item=goods[i];
                item.quantity=parseInt(item.quantity);
                item.prod_price=parseFloat(item.prod_price).toFixed(2);
                item.sum=item.quantity*item.prod_price;
                item.sum=parseFloat(item.sum).toFixed(2);
                goodsNumber.number=goodsNumber.number+goods[i].quantity;
                if(goods[i].select)goodsNumber.sum=(parseInt(goodsNumber.sum*100)+parseInt(item.sum*100))/100;
                goodsNumber.numberArr.push(goods[i].quantity);
            }
        }


        var load=function () {
            $http.get('/shop/getBasket/'+customerId).success(function (data) {

                    for (var i in data.results) {
                        data.results[i].select=false;
                        goods.push(data.results[i]);
                    }
                console.log(goods);
                goods.forEach(function(item){
                    item.prod_images='http://120.131.70.188:3003/'+item.prod_images;
                })
                changeGoodsNumber();
            }).error(function (res) {
                console.log(res);

            });
        }


        return {
            getGoods: function (cb) {
                cb(goods);

            },
            getGoodsNumber:function(cb){
                changeGoodsNumber();
                cb(goodsNumber);
            },
            loadGoods:function(){
                load();
            },
            /**
            * @desc 添加商品到购物车
            * @func addGoods
            * @param {number} pro 商品对象
            * @param {function} suc 添加成功后的回调函数
            * @param {function} err 添加失败后的回调函数
            */
            addGoods:function(pro,cb){
                var pid = parseInt(pro.prod_id);
                var addInfo = {
                    customersId:customerId,
                    prod_id:pro.prod_id,
                    quantity:pro.quantity
                }
                $http.post('/shop/addBasket',addInfo).success(function(data){
                    var lock=false;

                        // 如果商品存在于购物车，更新购物车的单商品数量
                        for(var i in goods){
                            var good = goods[i];
                            if(good.prod_id === pid){
                                good.quantity+=addInfo.quantity;
                                changeGoodsNumber();
                                lock = true;
                               break;
                            }
                        }
                    if(lock) {return;}
                        // 如果商品不存在 将商品加入购物车模型
                        pro.select=false;
                    var data={
                        prod_detail: pro.prod_detail,
                        prod_id:  pro.prod_id,
                        prod_images: pro.prod_images,
                        prod_name:pro.prod_name,
                        prod_price: pro.prod_price,
                        quantity: pro.quantity,
                        select: pro.select
                    }
                        goods.unshift(data);
                        changeGoodsNumber();
                        return;

                }).error(function(res){
                    cb && cb(res);
                })
            },
            deleteGoods:function(data,cb){
                $http.post('/shop/delBasket',data).success(function (resData) {
                    for(var i in data){
                        for(var m in goods){
                            if(data[i].prod_id == goods[m].prod_id){
                                goods.splice(m,1);
                            }
                        }
                    }
                        changeGoodsNumber();
                }).error(function (res) {
                    cb(res);
                });
            },
            changeNumber:function(index,quantity,cb){
                $http.get('/shop/chgBasket/'+customerId+'/'+goods[index].prod_id+'/'+quantity).success(function (data) {
                        goods[index].quantity=quantity;
                        changeGoodsNumber();
                }).error(function (res) {
                    console.log(res);
                    changeGoodsNumber();
                    cb();
                });
            },
            findGood:function(goodId,cb){
                $http.get('/shop/findGood/'+goodId).success(function (data) {
                    goodDetail=data.results[0]
                    cb(data.results[0]);
                }).error(function (res) {
                    console.log(res);

                });
            }

        }
})
.factory('cate',function($http){
    var cates=[];
      var  goods=[];
        var cateId='';
        var keywords='';
        var searchGoods=[];

        function loadProducts(categoryId,page,pageSize,cb){
            if(page == 1){goods.splice(0,goods.length);}
            $http.get('/shop/getGoods/'+page+'/'+pageSize+'/'+categoryId).success(function(data){
                if(cb){cb(data);}
                console.log(data);
                for(var i=0;i<data.results.length;i++){
                    data.results[i].prod_images=imgIP+data.results[i].prod_images;
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
        getSearchGoods:function(cb){
            cb && cb(searchGoods);
        },
        loadGoods:function(cateid,page,pageSize,cb){
            if(!cateid){cateid=cateId};
            loadProducts(cateid,page,pageSize,cb);
        },
        searchGoods:function(page,size,keyword,cb){
            console.log();
            if(keywords != keyword) {
                keywords=keyword;
                searchGoods.splice(0,searchGoods.length);
            }

            $http.get('/shop/searchGoods/'+page+'/'+size+'/'+keyword).success(function(data){
                if(cb){cb(data);}
                console.log(data);
                for(var i=0;i<data.results.length;i++){
                    data.results[i].prod_images=imgIP+data.results[i].prod_images;
                    searchGoods.push(data.results[i]);
                }
            }).error(function(err){
                console.log(err);
            })
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



.directive('compile', function($compile) {

        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
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


