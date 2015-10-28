/**
 * Created by wei on 15/9/21.
 */
angular.module('shop.controllers', [])
    .controller('shoppingBaseCtrl', function($scope,cart) {
        console.log('shoppingBaseCtrl');
        cart.getGoodsNumber(function(data){
            console.log(data);
            $scope.data=data;
        });
    })

	.controller('shoppingCtrl', function($scope) {
	    console.log('shoppingCtrl');
	})

	.controller('listCtrl',function($scope,cart,$stateParams,$ionicPopup,cate){


        if(!$stateParams.search){$stateParams.search=null};

        var isMore =false;
        var page=1;
        var pageSize=3;

        // 获取商品
        cate.getSearchGoods(function(goods){
            $scope.goods=goods;

        })

        $scope.search = function(searchStr){
            if(!searchStr){searchStr=null};
            page=1;
            console.log(searchStr)
            cate.searchGoods(page,pageSize,searchStr,loadMore);

        }


        // 添加购物车
        $scope.addGoods = function(pro){
            pro.quantity=1;

            cart.addGoods(pro,function(res){
                // 添加成功后
                console.log("suc",res);
            },function(res){
                // 添加失败后
                console.log("err",res);
                $ionicPopup.alert({
                    title: '',
                    template: '添加购物车失败',
                    okText: '好的'
                });
            })
        }


        //分页

        var loadMore = function (data) {
            page++;
            if (data.results.length < pageSize) {
                isMore = false;
            } else {
                isMore = true;
            }
        };


        $scope.hasMore = function () {
            if (isMore) {
                return true;
            } else {
                return false;
            }
        }

        cate.searchGoods(page,pageSize,$stateParams.search,loadMore);

        $scope.loadMore = function () {
            isMore=false;
            cate.searchGoods(page,pageSize,$stateParams.search,loadMore);
            // 在重新完全载入数据后，需要发送一个scroll.infiniteScrollComplete事件，告诉directive，我们完成了这个动作，系统会清理scroller和为下一次的载入数据，重新绑定这一事件。
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }



    })

    .controller("detailCtrl",function($scope,cart, orderOp,$stateParams,$location, $ionicPopup){

        var proid = $stateParams.proid;

        cart.findGood(proid,function(data){
            data.prod_images=imgIP+data.prod_images;
            $scope.detail=data;
            $scope.detail.quantity=1;
            console.log(data);
        })

        $scope.minus=function(){
            if($scope.detail.quantity>1){
                $scope.detail.quantity--;
            }
        }

        $scope.add=function(){

                $scope.detail.quantity++;

        }


        $scope.addGoods = function(){
            cart.addGoods($scope.detail,function(res){
                console.log("suc",res);
            },function(res){
                console.log("fail",res);
                $ionicPopup.alert({
                    title: '',
                    template: '添加购物车失败',
                    okText: '好的'
                });
            })
        }

        // 点击前往购物车事件
        $scope.gotoCart = function(){
            $location.path('/tab/cart');
        }
        // 立即购买
        $scope.buyNow = function(selectNumber){
            var pro  = $scope.proDetailInfo.proDetail;
            pro.quantity = selectNumber;
            orderOp.initOrder([pro]);
            $location.path('/shopping/orderFill');
        }

    })
    .controller('orderFill', function($scope, orderOp, errMap, accountOrders, cart,$http, $ionicPopup,$location){
        var errorMap=errMap.getMap();
        // 绑定数据
            // 下拉选项
        //$scope.selectAttrsInfo = orderOp.getSelectAttrsInfo();
            // 表单
         orderOp.getFormData(function(data){
             $scope.formData=data;
        });
            // 订单商品

        // 绑定事件
            // 提交表单
        $scope.submit = function(){
            orderOp.submitOrder(function(data){
                // 添加到未完成订单
                var order = data.results;
                order.order_status = "待支付";
                accountOrders.addUndoneOrder(order);
                // 跳转到订单成功页
                $location.path('/tab/orderSuc/'+order.order_id);
                // 如果是购物车订单，则清空购物车
                if(orderOp.isFromCart()){

                    cart.clearGoods();
                }
            },function(param){
                $ionicPopup.alert({
                    title: '表单提交失败',
                    template:errorMap[param],
                    okText: '好的'
                });
            })
        }
            // 选择地址
        $scope.toSelectAddress = function(){
            $location.path('/account/addresses');
        }
        // 判断地址是否为空
        $scope.hasDefaultAddress = function(){
            var fd = $scope.formData;
            if(fd.deliver_address && fd.deliver_phone && fd.receiver_name){
                return true;
            }
            return false;
        }
    })
    .controller('orderSuc', function($scope,accountOrders, $stateParams,weixin,$ionicBackdrop){
        var orderid = $stateParams.orderid;

        accountOrders.getOrderDetail(orderid,function(data){
            $scope.orderDetail = data;
        })
        $scope.toPay=function(){
            var name='';
            var psyJson = {openid: openid, orderId: $scope.orderDetail.order_no,
                money: $scope.orderDetail.order_total,productName:name};
            weixin.weixinPay(psyJson,function(data){
                $scope.orderDetail.items.forEach(function(item){
                    if(name){
                        name=item.product_name;
                    }else{
                        name=name+','+item.product_name;
                    }
                });
                $ionicBackdrop.release();
                accountOrders.changeOrderStatue($stateParams.orderId,'pay',function(data){
                });
            })
        }

    })