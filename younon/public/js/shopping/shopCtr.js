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

	.controller('listCtrl',function($scope,cart,$stateParams,$ionicPopup,cate,$location){
        cart.getGoodsNumber(function(data){
            $scope.data=data;
        });


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
            cancelPil();
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
        // 跳转到详情页
        $scope.jumpDetail = function(proid){
            $location.path('/detail/'+proid);
        }

        // 点击前往购物车事件
        $scope.gotoCart = function(){
            $location.path('/tab/cart');
        }




    })

    .controller("detailCtrl",function($scope,cart, orderOp,$stateParams,$location, $ionicPopup){

       var str = $location.absUrl().split('#')[0];
        str = str.split('?')[1];
        if(str){
            str =str.split('=')[1];
            customerId=str;
        }

        cart.loadGoods();




        var proid = $stateParams.proid;

        cart.findGood(proid,function(data){
            data.prod_images=imgIP+data.prod_images;
            shareIndex('/detail/'+$stateParams.proid,data.prod_images)
            $scope.detail=data;
            $scope.detail.quantity=1;
            console.log(data);
        })

        cart.getGoodsNumber(function(data){
            console.log(data);
            $scope.data=data;
        });

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
            var pro  = [];
            pro.push({prod_id:$scope.detail.prod_id,quantity:$scope.detail.quantity});
            orderOp.isFromCart(false);
            orderOp.getDeliverCharges(pro);
            $location.path('/orderFill');
        }

    })
    .controller('since', function($scope,personAddress,$stateParams,checkPhone,checkName,checkAddress,errMap,$ionicPopup) {

        //地址新增与修改公共的部分
        var errorMap=errMap.getMap();
        $scope.address={
            city_id:1,
            district_id:1,
            community_id:1,
            city_name:'',
            district_name:'',
            community_name:'',
            receiver_phone:'',
            receiver_name:''
        };

        personAddress.getCity(function(cities){
            $scope.address.city_id=cities[0].city_id;
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
            personAddress.loadSince(districtId,function(community){

                if(community.length==0){
                    community=[];
                    community.push({
                        comm_id:0,
                        comm_name:"暂无自提点"
                    })
                }else{
                    $scope.address.community_name=community[0].comm_name;
                }
                $scope.community=community;
                $scope.address.community_id=community[0].comm_id;
            });
        };



        $scope.getDistrict=function(districtId){
            getDistricts(districtId);
        }

        $scope.getCommunity=function(communityId){
            getCommunity(communityId);
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
            var resArr=[checkNameResl,checkMobileResl];
            for(var i=0;i<resArr.length;i++){
                if(resArr[i]){
                    attention(errorMap[resArr[i]]);
                    lock=true;
                    break;
                }
            }

            if(!$scope.address.district_name){
                lock=true;
                attention('请选择区');
            }
            if(!$scope.address.community_name){
                lock=true;
                attention('请重新选择自提点');
            }


            if(lock){return;}
            var deliverType='定点自取';
            var item={
                id:0,
                address_id:0,
                receiver_name:$scope.address.receiver_name,
                receiver_phone:$scope.address.receiver_phone,
                address_detail:$scope.address.city_name+$scope.address.district_name+$scope.address.community_name
            }
            personAddress.selectAddress(item,deliverType);
            window.history.go(-1);
        }
    })



.controller('orderFill', function($scope, orderOp, errMap, accountOrders, cart,$http, $ionicPopup,$location){

        var rule='获取运费规则描述信息失败';
        //获取运费规则描述
        orderOp.getDeliverRule(function(err,data){
            if(err){

            }else{

              rule=data.results[0].attr_value
            }

        })

        $scope.showRule=function(){
            $ionicPopup.alert({
                template:rule,
                okText: '好的'
            });
        }

        var errorMap=errMap.getMap();
        var addressMap={
            '定点自取':'/since',
            '送货上门':'/addresses'
        }

        $scope.addressTitle={
            '定点自取':'请选择自提点',
            '送货上门':'请选择送货地址'
        }

        $scope.getAddress=function(data){
            $location.path(addressMap[data]);
        }

        $scope.selectDeliverType=function(deliverType){
            $scope.formData.deliver_type=deliverType;
            if(deliverType=='定点自取'){
                $scope.formData.deliver_charges=0;
                $scope.formData.deliver_free=0;
                $scope.formData.order_total=$scope.formData.totalMoney;

                var orderStatue={
                    1:'9',
                    2:'12'
                }
                $scope.formData.order_status_id=orderStatue[$scope.formData.payment_id];

            }else{
                var orderStatue={
                    1:'1',
                    2:'6'
                }
                $scope.formData.order_status_id=orderStatue[$scope.formData.payment_id];
                $scope.formData.deliver_charges=$scope.formData.charges;
                $scope.formData.deliver_free=$scope.formData.free;
                $scope.formData.order_total=parseInt($scope.formData.totalMoney*100)/100+parseInt($scope.formData.deliver_charges)-$scope.formData.deliver_free;
            }

            if(localStorage.deliver_type==deliverType){
                $scope.formData.receiver_name=localStorage.receiver_name;
                $scope.formData.deliver_phone=localStorage.receiver_phone;
                $scope.formData.deliver_address=localStorage.address_detail;
            }else{
                $scope.formData.receiver_name='';
                $scope.formData.receiver_phone='';
                $scope.formData.address_detail='';
            }
        }

        $scope.selectPayType=function(item){
            $scope.formData.payment_id=item.id;
            $scope.formData.payment_type=item.id;
            console.log(item.id);
            var deliverMap={
                定点自取:3,
                送货上门:4

            }
            var orderStatusMap={
                3:'9',
                4:'1',
                6:'12',
                8:'6'
            }
            $scope.formData.order_status_id=orderStatusMap[parseInt(item.id)*deliverMap[$scope.formData.deliver_type]];
            console.log($scope.formData.order_status_id);
        }


         orderOp.getFormData(function(data){
             $scope.formData=data;
             $scope.formData.deliver_charges=0;
             $scope.formData.deliver_free=0;
             $scope.formData.formCart=true;
        });
            // 订单商品

        // 绑定事件
            // 提交表单
        $scope.submit = function(){
            if(!$scope.formData.receiver_name){
                $ionicPopup.alert({
                    template:'收货人不能为空',
                    okText: '好的'
                });
                return;
            }

            var orderStatue={
                1:'待支付未发货',
                9:'未支付待自取',
                12:'自取待电话确认',
                6:'待电话确认'
            }
            $scope.formData.status_name=orderStatue[$scope.formData.order_status_id];
            orderOp.submitOrder(function(data){

                $location.path('/orderDetails/'+data.results);
                $location.replace();

            },function(param){
                $ionicPopup.alert({
                    title: '表单提交失败',
                    template:errorMap[param],
                    okText: '好的'
                });
            })
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