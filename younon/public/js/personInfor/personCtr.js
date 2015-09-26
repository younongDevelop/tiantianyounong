/**
 * Created by wei on 15/9/21.
 */

angular.module('person.controllers', [])


    .controller('personOrdersCtrl', function($scope) {
        console.log('personOrdersCtrl');
    })

    .controller('addressesCtrl', function($scope,$ionicLoading, $ionicListDelegate,personAddress) {

        personAddress.getSelectedId(function(id){
            $scope.selectedId=id;
        });

        var page = 1;
        var pageSize=10;
        var version=0;
        var isMore = false;
        personAddress.getAddresses(function(data){
            $scope.addresses=data;
        });
        var loadMore = function (data) {
            page++;
            if (data.length < pageSize) {
                isMore = false;
            } else {
                isMore = true;
            }
            if($scope.addresses.length===0&&isMore){

                personAddress.loadAddress(page,pageSize,version,loadMore);
            }

        };
        personAddress.loadAddress(page,pageSize,version,loadMore);
        $scope.moreDataCanBeLoaded = function () {
            if (isMore) {
                return true;
            } else {
                return false;
            }
        }
        $scope.getMore = function () {
            console.log("scroll");
            if (page > 1) {
                isMore = false;
                personAddress.loadAddress(page,pageSize,version,loadMore);
            }

            // 在重新完全载入数据后，需要发送一个scroll.infiniteScrollComplete事件，告诉directive，我们完成了这个动作，系统会清理scroller和为下一次的载入数据，重新绑定这一事件。
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        $scope.delAddress=function(index){
            personAddress.delAddress(index,function(){
            })
        }

        $scope.selectAddr=function(item){
            personAddress.selectAddress(item);
        }
    })

    .controller('addrChgCtrl', function($scope,personAddress,$stateParams) {
        personAddress.getCity(function(cities){
            $scope.cities=cities;
            getDistricts(cities[0].city_id);
        });

        var getDistricts =function(cityId){
            personAddress.loadDistrict(cityId,function(districts){
                $scope.districts=districts;
                getCommunity(districts[0].district_id);
            });
        };

        var getCommunity =function(districtId){
            personAddress.loadCommunity(districtId,function(community){
                $scope.community=community;
            });
        };

        $scope.getDistrict=function(districtId){
            getDistricts(districtId);
        }

        $scope.getCommunity=function(communityId){
            getCommunity(communityId);
        }


    })


;
