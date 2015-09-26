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

	.controller('listCtrl',function($scope,list,cart,$stateParams,$location){
        $scope.searchStr = $stateParams.search;
		// 绑定列表数据
        list.getProListInfo(function(proListInfo){
        	$scope.proListInfo = proListInfo;
        });
        // 载入数据
        // list.load();

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
            cart.addGoods(pro,function(res){
                // 添加成功后
                console.log("suc",res);
            },function(res){
                // 添加失败后
                console.log("err",res);
            })
        }
    });