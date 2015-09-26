/**
 * Created by wei on 15/9/21.
 */
angular.module('shop.controllers', [])
    .controller('shoppingBaseCtrl', function($scope) {
        console.log('shoppingBaseCtrl');
    })

	.controller('shoppingCtrl', function($scope) {
	    console.log('shoppingCtrl');
	})

	.controller('listCtrl',function($scope,list,$ionicLoading){
		// 绑定列表数据
        list.getProListInfo(function(proListInfo){
        	$scope.proListInfo = proListInfo;
        });
        // 载入数据
        // list.load();

        $scope.search = function(searchStr){
            list.setKeyword(searchStr);
            list.loadAgain();
            $scope.$broadcast('scroll.infiniteScrollComplete');
            
        }
        $scope.hasMore = function(){
            return list.hasMore();
        }
        $scope.loadMore = function(){
            console.log("ddd");
            list.loadMore();
            $scope.$broadcast('scroll.infiniteScrollComplete');
            
            
        }
    });