/**
 * Created by wei on 15/9/21.
 */

angular.module('person.controllers', [])


    .controller('accountOrdersCtrl', function($scope,$ionicLoading, $ionicListDelegate,accountOrders,$stateParams) {
        var page=1;
        var pageSize=10;
        var version=0;
        var isMore = false;

        var getDataMap={
            1:accountOrders.getUndoneOrders,
            2:accountOrders.getDoneOrders,
            3:accountOrders.getFinishOrders
        };
        $scope.statue=$stateParams.statue;

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

    .controller('accountOrderDetails', function($scope,$stateParams,accountOrders,errMap,$ionicPopup,adminGetOrders) {

        $scope.statue=$stateParams.statue;

        var errorMap=errMap.getMap();
        accountOrders.getOrderDetail($stateParams.orderId,function(data){
            $scope.orderDetail=data;
            console.log(data);

        });

        $scope.cancelOrder=function(){
            accountOrders.changeOrderStatue($stateParams.orderId,'cancel',function(data){
                $ionicPopup.alert({
                    title: '',
                    template:errorMap[data],
                    okText: '好的'
                });
            });

        };

        $scope.close=function(){
            accountOrders.adminChangeOrder($stateParams.orderId,13,function(data,statue){
                if(statue){
                    adminGetOrders.changeOrderStatue($stateParams.orderId);
                }
                $ionicPopup.alert({
                    title: '',
                    template:errorMap[data],
                    okText: '好的'
                });
            });

        }

        $scope.send=function(){
            var statueId={
                9:4,
                2:3
            }
            accountOrders.adminChangeOrder($stateParams.orderId,statueId[$scope.orderDetail.order_status_id],function(data,statue){

                if(statue){
                    adminGetOrders.changeOrderStatue($stateParams.orderId);
                }
                $ionicPopup.alert({
                    title: '',
                    template:errorMap[data],
                    okText: '好的'
                });
            })
        }
        $scope.pay=function(){
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

    .controller('orderFill', function($scope, orderPros, $http, $ionicPopup){
        // 选择列表选项信息
        $scope.selectData = {
            sendWay:[{
                value:'1',
                show:'送货上门'
            },{
                value:'2',
                show:'柜台自提'
            }],
            sendTime:[{
                value:'1',
                show:'只在周末送货'
            },{
                value:'2',
                show:'每日17:00~20:00'
            },{
                value:'3',
                show:'不限'
            }],
            payWay:[{
                value:'1',
                show:'在线支付' 
            },{
                value:'2',
                show:'货到付款'
            }]
        };
        //表单对象
        $scope.formData = {

            customer_id:customerId,         //customer id
            deliver_address:localStorage.address_detail,     //deliver address
            deliver_phone:localStorage.receiver_phone,       //contact phone
            deliver_type:'送货上门',        //送货方式    送货上门 / 柜台自提
            payment_type:'1',        //支付方式   传值：“1”—在线支付；“2”—货到付款
            deliver_time:'只在周末送货',        //送货时间   选项1：只在周末送货 选项2：每日17:00~20:00送货 选项3:不限
            order_message:'',       //订单留言(可以为空)
            order_invoice_type:'',  //发票类型  个人， 公司(可以为空)
            order_invoice_title:'', //公司类型发票的抬头(可以为空)
            /*
            * item{
            *    pid:11,                  //product id
            *    quantity:2,                 //商品购买数量
            *    final_price:1.00,           //最终价格
            *    product_weight:1.12,        //商品重量
            *}
            */
            items:[],
            receiver_name:localStorage.receiver_name,
            deliver_charges:'0',
            ischecked:'4'
        }
        // 当前订单的产品对象
        orderPros.getProsInfo(function(data){
            $scope.orderProsInfo = data;
         });
        // 商品结算信息
        $scope.accoutnInfo = {
            product_weight_all:0,
            product_price_all:0,
            send_price:1000,
            send_price_redu:0,
            integral:0,
            amount:0
        }
        // 根据订单填写对象填写表单
        for(var index in $scope.orderProsInfo.pros){
            var pro = $scope.orderProsInfo.pros[index];
            $scope.formData.items.push({
                pid:parseInt(pro.product_id),
                quantity:pro.quantity,
                // TODO:xjc 在这里可能要对价格做处理
                final_price:parseFloat(pro.product_sell_price),
                product_weight:parseFloat(pro.product_weight)
            })
        }
        // 计算总价格和总重量
        var ai = $scope.accoutnInfo;
        $scope.formData.items.forEach(function(item){
            ai.product_weight_all += (item.product_weight * item.quantity);
            ai.product_price_all += (item.final_price * item.quantity);
        })
        ai.amount = ai.product_price_all + ai.send_price - ai.send_price_redu;

        $scope.submit = function(){
            $http.post(api+"/orders/checkout",$scope.formData).success(function(data){
                console.log('submit',data);
                if(data.code === 0){
                    // TODO:xjc 跳转到预定成功页面
                }else{
                    // TODO:订单失败页面
                    $ionicPopup.alert({
                        title: '',
                        template: '对不起，订单提交失败',
                        okText: '好的'
                    });
                }
            })
        }
    })
;
