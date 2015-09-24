
angular.module('index.services', [])

.factory('cart', function($http) {

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
            getGoodsNumber:function(cb){
                cb(goodsNumber);
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
});
