/**
 * Created by wei on 15/9/21.
 */

angular.module('person.controllers', [])


    .controller('accountOrdersCtrl', function($scope,$ionicLoading, $ionicListDelegate,accountOrders,$stateParams) {
        var page=1;
        var pageSize=50;
        var version=0;
        var isMore = false;

        var getDataMap={
            1:accountOrders.getUndoneOrders,
            2:accountOrders.getDoneOrders
        };

        getDataMap[$stateParams.statue](function(data){
            $scope.orders=data;

        });

        var loadMore = function (data) {
            page++;
            if (data.length < pageSize) {
                isMore = false;
            } else {
                isMore = true;
            }
        };
        accountOrders.loadOrders(page,pageSize,version,$stateParams.statue,loadMore);
        $scope.moreDataCanBeLoaded = function () {
            if (isMore) {
                return true;
            } else {
                return false;
            }
        }
        $scope.getMore = function () {
            console.log(page);
            if (page > 1) {
                isMore = false;
                accountOrders.loadOrders(page,pageSize,version,$stateParams.statue,loadMore);
            }

            // 在重新完全载入数据后，需要发送一个scroll.infiniteScrollComplete事件，告诉directive，我们完成了这个动作，系统会清理scroller和为下一次的载入数据，重新绑定这一事件。
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }



    })

    .controller('addressesCtrl', function($scope,$ionicLoading, $ionicListDelegate,personAddress,errMap,$ionicPopup) {
        var errorMap=errMap.getMap();
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
            if (page > 1) {
                isMore = false;
                personAddress.loadAddress(page,pageSize,version,loadMore);
            }
            // 在重新完全载入数据后，需要发送一个scroll.infiniteScrollComplete事件，告诉directive，我们完成了这个动作，系统会清理scroller和为下一次的载入数据，重新绑定这一事件。
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        $scope.delAddress=function(index){
            personAddress.delAddress(index,function(param){
                $ionicPopup.alert({
                    title: '',
                    template:errorMap[param],
                    okText: '好的'
                });
            })
        }

        $scope.selectAddr=function(item){
            personAddress.selectAddress(item);
        }
    })

    .controller('addrChgCtrl', function($scope,personAddress,$stateParams,checkPhone,checkName,checkAddress,errMap,$ionicPopup) {

        //地址新增与修改公共的部分
        var errorMap=errMap.getMap();
        $scope.address={
            city_id:1,
            district_id:1,
            community_id:1,
            city_name:'',
            district_name:'',
            community_name:'',
            address_room:'',
            receiver_phone:'',
            receiver_name:''
        };

        personAddress.getCity(function(cities){
            $scope.cities=cities;
            getDistricts(cities[0].city_id);
            $scope.address.city_name=cities[0].city_name;
        });

        var getDistricts =function(cityId){
            personAddress.loadDistrict(cityId,function(districts){
                $scope.districts=districts;
                $scope.address.district_id=districts[0].district_id;
                getCommunity(districts[0].district_id);
                $scope.address.district_name=districts[0].district_name;
            });
        };

        var getCommunity =function(districtId){
            personAddress.loadCommunity(districtId,function(community){
                $scope.community=community;
                $scope.address.community_id=community[0].comm_id;
                $scope.address.community_name=community[0].community_name;
            });
        };

        $scope.getDistrict=function(districtId){
            getDistricts(districtId);
        }

        $scope.getCommunity=function(communityId){
            getCommunity(communityId);
        }

        var getValue=function(arr,key,value,resKey){
            var data;
            arr.forEach(function(item){
                if(item[key]===value){
                    data=item[resKey];
                }
            })
            return data;
        }

        var attention=function(param){
            $ionicPopup.alert({
                title: '',
                template:param,
                okText: '好的'
            });
        }

        $scope.submit=function(){
            var lock=false;
            var checkNameResl=checkName.checkName($scope.address.receiver_name);
            var checkMobileResl=checkPhone.checkMobile($scope.address.receiver_phone);
            var checkAddrResl=checkAddress.checkAddress($scope.address.address_room);
            var resArr=[checkNameResl,checkMobileResl,checkAddrResl];
            for(var i=0;i<resArr.length;i++){
                if(resArr[i]){
                    attention(errorMap[resArr[i]]);
                    lock=true;
                    break;
                }
            }
            if(lock){return;}
            $scope.address.city_name=getValue($scope.cities,'city_id',$scope.address.city_id,'city_name');
            $scope.address.district_name=getValue($scope.districts,'district_id',$scope.address.district_id,'district_name');
            $scope.address.community_name=getValue($scope.community,'comm_id',$scope.address.community_id,'comm_name');
            //地址新增的部分
            if($stateParams.param!='add'){
                $scope.address.address_id=$stateParams.param;
                personAddress.changeAddress($scope.address,function(data){
                       attention(errorMap[data]);
                });
            }else{
                //地址修改的部分
                $scope.address.customer_id=customerId;
                personAddress.addAddress($scope.address,function(data){
                    attention(errorMap[data]);
                });
            }

        }
            //地址修改的部分
            personAddress.getAddresses(function(data){
                data.forEach(function(item){
                    if(item.address_id==$stateParams.param){
                        $scope.address.city_id=item.city_id;
                        $scope.address.district_id=item.district_id;
                        $scope.address.community_id=item.community_id;
                        $scope.address.address_room=item.address_room;
                        $scope.address.receiver_phone=item.receiver_phone;
                        $scope.address.receiver_name=item.receiver_name;
                    }
                })
            });

    })
;
