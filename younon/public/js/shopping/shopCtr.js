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

	.controller('listCtrl',function($scope,list,cart,$stateParams,$location,$ionicPopup){
        $scope.searchStr = $stateParams.search;
		// 绑定列表数据
        list.getProListInfo(function(proListInfo){
        	$scope.proListInfo = proListInfo;
        });

        $scope.search = function(searchStr){
            list.setKeyword(searchStr);
            list.loadAgain(function(){
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
        $scope.hasMore = function(){
            return list.hasMore();
        }
        $scope.loadMore = function(){
            console.log("ddd");
            list.loadMore(function(){
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
        $scope.addGoods = function(index){
            var pro = $scope.proListInfo.proList[index];
            pro.quantity = 1;
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
        // 跳转到详情页
        $scope.jumpDetail = function(proid){
            $location.path('/shopping/detail/'+proid);
        }
        $scope.search($scope.searchStr);
    })

    .controller("detailCtrl",function($scope, detail, cart, orderOp, $ionicSlideBoxDelegate,$stateParams,$location, $ionicPopup){
        var proid = $stateParams.proid;

        $scope.number=[];
        $scope.data.selectNumber = 1;
        for(var i=1;i<51;i++){
            $scope.number.push(i);
        }
        // 图文详情模拟数据
        $scope.imgDetail = {
            imgUrls:["./img/slide1.jpg","./img/slide2.jpg","./img/slide3.jpg"]
        }
        $scope.addGoods = function(selectNumber){
            var pro  = $scope.proDetailInfo.proDetail;
            pro.quantity = selectNumber;
            cart.addGoods(pro,function(res){
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
        // 
        detail.loadDetail(function(){
            $ionicSlideBoxDelegate.update();
        });
        detail.getDetail(function(proDetailInfo){
            $scope.proDetailInfo = proDetailInfo;
        });
        // 点击搜索事件
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
    .controller('orderFill', function($scope, orderOp, errMap, accountOrders, $http, $ionicPopup,$location){
        var errorMap=errMap.getMap();
        // 绑定数据
            // 下拉选项
        $scope.selectAttrsInfo = orderOp.getSelectAttrsInfo();
            // 表单
        $scope.formData = orderOp.getFormData();
            // 订单商品
        $scope.orderProsInfo = orderOp.getProsInfo();
            // 结算信息
        $scope.amountInfo = orderOp.getAmountInfo();
        // 绑定事件
            // 提交表单
        $scope.submit = function(){
            orderOp.submitOrder(function(data){
                // 添加到未完成订单
                var order = data.results;
                order.order_status = "待支付";
                accountOrders.addUndoneOrder(order);
                $ionicPopup.alert({
                    title: '表单提交成功',
                    template:errorMap[data],
                    okText: '好的'
                });
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
    .controller('orderSuc', function($scope){

    })