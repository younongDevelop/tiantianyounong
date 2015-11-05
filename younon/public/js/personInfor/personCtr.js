/**
 * Created by wei on 15/9/21.
 */

angular.module('person.controllers', [])


    .controller('accountOrdersCtrl', function($scope,$ionicLoading, $ionicListDelegate,accountOrders) {
        $scope.status=[{show:true,statue:'(1)',title:'待支付'},{show:false,statue:'(2,3,4,9,10)',title:'待收货'},{show:false,statue:'(14)',
        title:'待自取'},{show:false,statue:'(5,12)',title:'已完成'}, {show:false,statue:'(6,7,8,11,13)',title:'已取消'}];
        accountOrders.inintOrders();
        var page=1;
        var pageSize=10;
        var isMore = false;
        var statue=$scope.status[0].statue;

        $scope.selectStatue=function(data){
            page=1;
            for(var i in $scope.status){
                $scope.status[i].show=false;
            }
            data.show=true;

            statue=data.statue;
            console.log(statue);

            accountOrders.loadOrders(page,pageSize,statue,loadMore);

        }

        var loadMore = function (data) {
            console.log(data);
            $scope.orders=data;

            page++;
            if (data.length < pageSize) {
                isMore = false;
            } else {
                isMore = true;
            }
        };
        accountOrders.loadOrders(page,pageSize,statue,loadMore);
        $scope.moreDataCanBeLoaded = function () {
            console.log(isMore);
            if (isMore) {
                return true;
            } else {
                return false;
            }
        }
        $scope.getMore = function () {
                isMore = false;
                accountOrders.loadOrders(page,pageSize,statue,loadMore);
            // 在重新完全载入数据后，需要发送一个scroll.infiniteScrollComplete事件，告诉directive，我们完成了这个动作，系统会清理scroller和为下一次的载入数据，重新绑定这一事件。
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    })

    .controller('accountOrderDetails', function($scope,$stateParams,accountOrders,errMap,$ionicPopup,weixin,$ionicBackdrop) {



        var errorMap=errMap.getMap();
        accountOrders.getOrderDetail($stateParams.orderId,function(data){
            $scope.orderDetail=data;
            console.log(data);
            $scope.orderDetail.money=0;
            $scope.orderDetail.weight=0;
            for(var i in $scope.orderDetail.items){
                if(!$scope.orderDetail.items[i].prod_weight){
                    $scope.orderDetail.items[i].prod_weight=0;
                }
                $scope.orderDetail.money=$scope.orderDetail.money+$scope.orderDetail.items[i].final_price*$scope.orderDetail.items[i].product_quantity;
                $scope.orderDetail.weight=$scope.orderDetail.weight+$scope.orderDetail.items[i].prod_weight*$scope.orderDetail.items[i].product_quantity;
            }
            $scope.information=[{title:"订单号",content:$scope.orderDetail.order_no},{title:"创建时间",content:$scope.orderDetail.date_purchased},
                {title:"商品总重",content:$scope.orderDetail.weight+'kg'},{title:"商品总金额",content:'￥'+$scope.orderDetail.order_total,attention:true},
                {title:"运费",content:'￥'+$scope.orderDetail.deliver_charges,attention:true},{title:"运费减免",content:'￥'+($scope.orderDetail.order_total-$scope.orderDetail.deliver_charges-$scope.orderDetail.money),attention:true},
                {title:"赠送积分",content:'0积分'},];
        });

        $scope.chgOrder=function(statueId){
            accountOrders.changeOrderStatue($stateParams.orderId,statueId,function(data){
                $ionicPopup.alert({
                    title: '',
                    template:errorMap[data],
                    okText: '好的'
                });
            });

        };




        $scope.pay=function(){
            $ionicBackdrop.retain();
            var name='';
            $scope.orderDetail.items.forEach(function(item){
                if(name){
                    name=item.prod_name;
                }else{
                    name=name+','+item.prod_name;
                }

            });

            var psyJson = {openid: openid, orderId: $scope.orderDetail.order_no,
                money: $scope.orderDetail.order_total,productName:name};
            weixin.weixinPay(psyJson,function(data){
                $ionicBackdrop.release();
                var statueMap={
                    定点自取:14,
                    送货上门:2
                }

                accountOrders.changeOrderStatue($stateParams.orderId,statueMap[$scope.orderDetail.deliver_type],function(data){

                    $scope.orderDetail.order_status_id=statueMap[$scope.orderDetail.deliver_type];

                });


            })

            //accountOrders.changeOrderStatue($stateParams.orderId,'pay',function(data){
            //    $ionicPopup.alert({
            //        title: '',
            //        template:errorMap[data],
            //        okText: '好的'
            //    });
            //
            //});

        };


    })

    .controller('addressesCtrl', function($scope,$ionicLoading, $ionicListDelegate,personAddress,errMap,$ionicPopup,orderOp) {
        var errorMap=errMap.getMap();
        personAddress.getSelectedId(function(id){
            $scope.selectedId=id;
        });
        var page = 1;
        var pageSize=10;
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
        };
        personAddress.loadAddress(page,pageSize,loadMore);
        $scope.moreDataCanBeLoaded = function () {
            if (isMore) {
                return true;
            } else {
                return false;
            }
        }
        $scope.getMore = function () {
                isMore = false;
                personAddress.loadAddress(page,pageSize,loadMore);
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
            console.log(item);
            for(var i in $scope.addresses){
                $scope.addresses[i].select=false;
            }
            item.select=true;
            personAddress.selectAddress(item,'送货上门');
            orderOp.fillAddress(item);
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
            if($stateParams.param =='add') {getDistricts(cities[0].city_id);
            $scope.address.city_name=cities[0].city_name;}
        });

        var getDistricts =function(cityId){
            personAddress.loadDistrict(cityId,function(districts){
                $scope.districts=districts;

                    $scope.address.district_id=districts[0].district_id;
                    getCommunity(districts[0].district_id);
                    $scope.address.district_name=districts[0].district_name;

            });
        };

        var findDistricts =function(cityId,data){
            personAddress.loadDistrict(cityId,function(districts){
                $scope.districts=districts;
                $scope.address.district_id=data.district_id;
                $scope.address.district_name=data.district_name;

            });
        };

        var getCommunity =function(districtId){
            personAddress.loadCommunity(districtId,function(community){
                $scope.community=community;

                if(community.length==0){
                    $scope.community.push({
                        comm_id:0,
                        community_name:"暂无小区"
                    })
                }else{
                    $scope.address.community_id=community[0].comm_id;
                    $scope.address.community_name=community[0].community_name;
                }

            });
        };

        var findCommunity =function(districtId,data){
            personAddress.loadCommunity(districtId,function(community){
                $scope.community=community;
                $scope.address.community_id=data.community_id;
                $scope.address.community_name=data.community_name;
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
                //地址修改的部分
                $scope.address.address_id=$stateParams.param;
                personAddress.changeAddress($scope.address,function(data){
                    window.history.go(-1);
                });
            }else{

                $scope.address.customer_id=customerId;
                personAddress.addAddress($scope.address,function(data){
                    window.history.go(-1);
                });
            }

        }
            //地址修改的部分
        if($stateParams.param!='add'){
            personAddress.findAddress($stateParams.param,function(data){
                findDistricts(data.city_id,data);
                findCommunity(data.district_id,data);
                $scope.address.city_id=data.city_id;
                $scope.address.district_id=data.district_id;
                $scope.address.community_id=data.community_id;
                $scope.address.address_room=data.address_room;
                $scope.address.receiver_phone=data.receiver_phone;
                $scope.address.receiver_name=data.receiver_name;
            });

        }


    })
;
