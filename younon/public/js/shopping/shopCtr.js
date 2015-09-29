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
        console.log("list");
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

    .controller("detailCtrl",function($scope, detail, cart, orderFill, $ionicSlideBoxDelegate,$stateParams,$location, $ionicPopup){
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
            orderFill.replacePros([pro]);
            $location.path('/account/orderFill/'+pro.product_id);
        }

    });