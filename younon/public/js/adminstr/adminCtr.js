/**
 * Created by wei on 15/9/21.
 */
angular.module('admin.controllers', [])

    .controller('adminBaseCtrl', function($scope) {
        console.log('adminBaseCtrl');
    })

    .controller('adminCtrl', function($scope,adminGetOrders) {

        var pageSize=10;
        var isMore = false;
        var page=1;

        $scope.unship='admin-selected';
        $scope.shipped='';
        $scope.closed='';
        $scope.statue='unship';

        adminGetOrders.getOrders(function(data){
            $scope.orders=data;
        })

        $scope.changeStatue=function(data){
            page=1;
            $scope.unship='';
            $scope.shipped='';
            $scope.closed='';
            $scope[data]='admin-selected';
            $scope.statue=data;
            adminGetOrders.loadOrdersArr($scope.statue,page,pageSize,loadMore);
        }
        var loadMore = function (data) {
            page++;
            if (data.length < pageSize) {
                isMore = false;
            } else {
                isMore = true;
            }
            adminGetOrders.getOrders(function(data){
                $scope.orders=data;
            })
        };
        adminGetOrders.loadOrdersArr($scope.statue,page,pageSize,loadMore);
        $scope.moreDataCanBeLoaded = function () {
            if (isMore) {
                return true;
            } else {
                return false;
            }
        }
        $scope.getMore = function () {

            if (pageMap[$scope.statue] > 1) {
                isMore = false;
                adminGetOrders.loadOrdersArr($scope.statue,page,pageSize,loadMore);
            }
            // 在重新完全载入数据后，需要发送一个scroll.infiniteScrollComplete事件，告诉directive，我们完成了这个动作，系统会清理scroller和为下一次的载入数据，重新绑定这一事件。
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

});
