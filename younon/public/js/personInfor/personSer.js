/**
 * Created by wei on 15/9/21.
 */
angular.module('person.services', [])
    //我的地址相关部分
    .factory('personAddress', function($http) {
        var addresses=[];
        var cities=[];
        var districts=[];
        var community=[];
        var selectedId={id:''};
        if(localStorage.address_id){selectedId.id=localStorage.address_id};

        var changeAddress=function(data){
            addresses.forEach(function(item){
                if(item.address_id==data.address_id){
                    item.address_detail=data.city_name+data.district_name+data.community_name+data.address_room;
                        item.address_room=data.address_room;
                            item.city_id=data.city_id;
                                item.city_name=data.city_name;
                                    item.community_id=data.community_id;
                                        item.community_name=data.community_name;
                                            item.district_id=data.district_id;
                                                item.district_name=data.district_name;
                                                    item.receiver_name=data.receiver_name;
                                                        item.receiver_phone=data.receiver_phone;
                }
            })
        }

        return{
            getAddresses:function(cb){
                cb(addresses);
            },
            getCity:function(cb){
                $http.get('/person/getCity').success(function(data) {
                        cities=data.results;
                        cb(cities);
                }).error(function (res) {
                    console.log(res);
                });
            },
            loadDistrict:function(cityId,cb){
                $http.get('/person/getDistrict/'+cityId).success(function(data) {
                    districts=data.results;
                    cb(districts);
                    console.log(districts);
                }).error(function (res) {
                        console.log(res);
                });
            },
            loadCommunity:function(districtId,cb){
                $http.get('/person/getCommunity/'+districtId).success(function(data) {
                    community=data.results;
                    console.log(community);
                    cb(community);
                }).error(function (res) {
                    console.log(res);
                });
            },
            loadSince:function(districtId,cb){
                $http.get('/person/getSince/'+districtId).success(function(data) {
                    community=data.results;
                    console.log(community);
                    cb(community);
                }).error(function (res) {
                    console.log(res);
                });
            },
            loadAddress:function(page,pageSize,cb){
                $http.get('/person/getAddress/'+customerId+'/'+page+'/'+pageSize).success(function(data,status,headers) {
                        for (var i in data.results) {
                            addresses.push(data.results[i]);
                            addresses[i].select=false;
                            if(localStorage.address_id ==data.results[i].address_id){
                                addresses[i].select=true;
                            }
                        }
                        if(!localStorage.address_id&&addresses[0]){
                            selectedId.id=addresses[0].address_id,
                                localStorage.address_id=addresses[0].address_id;
                                localStorage.receiver_name=addresses[0].receiver_name;
                                localStorage.receiver_phone=addresses[0].receiver_phone;
                                localStorage.address_detail=addresses[0].address_detail;
                        }

                        cb(data.results);

                }).error(function (res) {
                    console.log(res);
                });
                },
            addAddress:function(data,cb){
                $http.post('/person/addAddress',data).success(function(res){
                    console.log(res);
                    if(res.code===0){
                        //addresses.unshift();
                        cb('ADD_SUCCESS');
                    }else{
                        cb('ADD_FAILURE');
                    }

                }).error(function(res){
                    cb('ADD_FAILURE');

                })
            },
            delAddress:function(index,cb){
                $http.get('/person/delAddress/'+addresses[index].address_id).success(function(res){
                            addresses.splice(index,1);
                }).error(function(){
                    cb('DEL_FAILURE');
                })
            },
            changeAddress:function(data,cb){
                $http.post('/person/updateAddress',data).success(function(res){
                        changeAddress(data);
                        cb('CHANGE_SUCCESS');
                }).error(function(res){
                    cb('CHANGE_FAILURE');
                })
            },
            selectAddress:function(item){
                selectedId.id=item.address_id;
                localStorage.address_id=item.address_id;
                localStorage.receiver_name=item.receiver_name;
                localStorage.receiver_phone=item.receiver_phone;
                localStorage.address_detail=item.address_detail;
            },
            getSelectedId:function(cb){
                cb(selectedId);
            }
        }
    })

    //我的订单相关部分
    .factory('accountOrders', function($http) {
        var undoneOrders=[];
        var doneOrders=[];
        var finishOrders=[];
        var orderDetail={};
        var statueArrMap={
            1:undoneOrders,
            2:doneOrders,
            3:finishOrders
        };
        return{
            getUndoneOrders:function(cb){
                cb(undoneOrders);
            },
            getDoneOrders:function(cb){
                cb(doneOrders);
            },
            getFinishOrders:function(cb){
                cb(finishOrders);
            },
            loadOrders:function(page,pageSize,version,statue,cb){
                $http.get(api+'/orders/'+customerId+'/'+statue+'/'+page+'/'+pageSize+'/'+version).success(function(data){
                    console.log(data);
                    if(data.code===0){
                        cb(data.results)
                        data.results.forEach(function(item){
                            statueArrMap[statue].push(item);
                        })
                    }
                }).error(function(res){
                    console.log(res);
                })
            },
            changeOrderStatue:function(orderId,statue,cb){
                var urlMap={
                  pay:'/orders/paysuccess/'+orderId,
                  cancel:'/orders/del/'+orderId
                };
                var errMAp={
                    pay:'ORDER_PAY_FAILURE',
                    cancel:'CANCEL_ORDER_FAILURE'
                };
                $http.put(api+urlMap[statue]).success(function(data){
                    var cbMAp={
                        pay:'ORDER_PAY_SUCCESS',
                        cancel:'CANCEL_ORDER_SUCCESS'
                    };
                    var statueMap={
                        pay:'支付成功',
                        cancel:'已取消'
                    };
                    if(data.code===0){
                        cb(cbMAp[statue]);
                        var i=0;
                        undoneOrders.forEach(function(item){
                            if(item.order_id==orderId){
                                undoneOrders.splice(i,1);
                                orderDetail.order_status=statueMap[statue];
                            }
                            i++;
                        })
                    }else{
                        cb(errMAp[statue]);
                    }
                }).error(function(res){
                    cb(errMAp[statue]);
                });
            },
            adminChangeOrder:function(orderId,statueId,cb){
                $http.put('/adminOrders/changeStatue/'+orderId+'/'+statueId).success(function(data){
                    if(data=200){
                        var cbMap={
                            3:'ADMIN_SEND_SUCCESS',
                            4:'ADMIN_SEND_SUCCESS',
                            13:'ADMIN_CLOSE_SUCCESS'
                        };
                        cb(cbMap[statueId],true);
                    }else{

                        var cbMap={
                            3:'ADMIN_SEND_FAILURE',
                            4:'ADMIN_SEND_FAILURE',
                            13:'ADMIN_CLOSE_FAILURE'
                        };
                        cb(cbMap[statueId],false);

                    }

                }).error(function(res){
                    var cbMap={
                        3:'ADMIN_SEND_FAILURE',
                        4:'ADMIN_SEND_FAILURE',
                        13:'ADMIN_CLOSE_FAILURE'
                    };
                    cb(cbMap[statueId],false);
                })
            },
            getOrderDetail:function(orderId,cb){
                $http.get(api+'/orders/info/'+orderId).success(function(data){
                    if(data.code===0){
                        orderDetail=data.results;
                        orderDetail.items.forEach(function(item){
                            var obj = JSON.parse(item.product_images);
                            item.image=obj.small;
                        })
                        cb(orderDetail);
                    }
                }).error(function(res){
                    console.log(res);
                })
            },
            addUndoneOrder:function(order){
                undoneOrders.unshift(order);
            }
        }
    })

    .factory('statueMap', function() {
        var map={
            MOBILE_NULL:'手机号码不能为空',
            MOBILE_INVALID:'手机号码输入有误',
            NAME_NULL:'收货人不能为空',
            ADDRESS_NULL:'详细地址不能为空',
            CHANGE_SUCCESS:'修改成功',
            CHANGE_FAILURE:'修改失败',
            ADD_SUCCESS:'添加成功',
            ADD_FAILURE:'添加失败',
            DEL_SUCCESS:'删除成功',
            DEL_FAILURE:'删除失败'
        };
        return {
            getStatueMap:function(){
                return map;
            }
        };
    })

    //表单校验部分

    .factory('errMap', function() {
        var map={
            MOBILE_NULL:'手机号码不能为空',
            MOBILE_INVALID:'手机号码输入有误',
            NAME_NULL:'收货人不能为空',
            ADDRESS_NULL:'详细地址不能为空',
            CHANGE_SUCCESS:'修改成功',
            CHANGE_FAILURE:'修改失败',
            ADD_SUCCESS:'添加成功',
            ADD_FAILURE:'添加失败',
            DEL_SUCCESS:'删除成功',
            DEL_FAILURE:'删除失败',
            CANCEL_ORDER_SUCCESS:'订单取消成功',
            CANCEL_ORDER_FAILURE:'订单取消失败',
            ORDER_PAY_SUCCESS:'订单支付成功',
            ORDER_PAY_FAILURE:'订单支付失败',
            ADMIN_CLOSE_SUCCESS:'关闭成功',
            ADMIN_CLOSE_FAILURE:'关闭失败',
            ADMIN_SEND_SUCCESS:'发货成功',
            ADMIN_SEND_FAILURE:'发货失败'
        };
        return {
           getMap:function(){
               return map;
           }
        };
    })

    .factory('checkPhone', function() {
        return{
            checkMobile:function(mobile){
                if (!mobile || !mobile.length) {
                    return 'MOBILE_NULL';
                }
                if (!('' + mobile)
                        .match(/^[1][3|4|5|7|8][0-9]{9}$/)) {
                    return 'MOBILE_INVALID';
                }
                return false;
            }
        }
    })

    .factory('checkName', function() {
        return{
            checkName:function(name){
                if (!name || !name.length) {
                    return 'NAME_NULL';
                }
                return false;
            }
        }
    })

    .factory('checkAddress', function() {
        return{
            checkAddress:function(address){
                if (!address || !address.length) {
                    return 'ADDRESS_NULL';
                }
                return false;
            }
        }
    })
;
