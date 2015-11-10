/**
 * Created by wei on 15/9/21.
 */

angular.module('person.services', [])
    //我的地址相关部分
    .factory('personAddress', function($http,orderOp) {
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
                }).error(function (res) {
                        console.log(res);
                });
            },
            loadCommunity:function(districtId,cb){
                $http.get('/person/getCommunity/'+districtId).success(function(data) {
                    community=data.results;
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
            findAddress:function(address_id,cb){
                $http.get('/person/findAddress/'+address_id).success(function(data) {
                    console.log(data.results);
                    cb(data.results);
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
                    console.log(res.results);
                        addresses.unshift({
                            address_id: res.results,
                                address_detail:data.city_name+data.district_name+data.community_name+data.address_room,
                    receiver_name:data.receiver_name,
                        receiver_phone:data.receiver_phone
                        });
                        cb('ADD_SUCCESS');

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
            selectAddress:function(item,deliverType){
                selectedId.id=item.address_id;
                localStorage.deliver_type=deliverType;
                localStorage.address_id=item.address_id;
                localStorage.receiver_name=item.receiver_name;
                localStorage.receiver_phone=item.receiver_phone;
                localStorage.address_detail=item.address_detail;
                orderOp.fillAddress();
            },
            getSelectedId:function(cb){
                cb(selectedId);
            }
        }
    })

    //我的订单相关部分
    .factory('accountOrders', function($http) {
        var resultData=[];
        var stat='';

        var orderDetail={};

        function formatData(arr,index){

            arr.forEach(function(item){
                item.title='';
                item.quantity=0;
                for(var i in item.items){
                    item.quantity=item.quantity+item.items[i].product_quantity;
                    item.items[i].prod_images=imgIP+item.items[i].prod_images;
                    if(i != item.items.length-1){item.title=item.title+item.items[i].prod_name+',';}
                    else{item.title=item.title+item.items[i].prod_name}
                }
                if(index) {resultData.unshift(item);}
                else{
                    resultData.push(item);
                }
            })

        }

        return{

            loadOrders:function(page,pageSize,statue,cb){
                if(stat!=statue){
                    resultData=[];
                    stat=statue;
                }
                console.log(resultData);
                console.log(stat);
                $http.get('/person/getOrders/'+customerId+'/'+statue+'/'+page+'/'+pageSize).success(function(data){
                    formatData(data.results);
                    cb(resultData);
                }).error(function(res){
                    console.log(res);
                })
            },
            changeOrderStatue:function(orderId,statueId,cb){
                var errMAp={
                    2:'ORDER_PAY_FAILURE',
                    6:'CANCEL_ORDER_FAILURE',
                    12:'CUSTOMER_SIGN_FAILURE'
                };
                $http.put('/person/chgOrder/'+orderId+'/'+statueId).success(function(data){

                   for(var i in resultData){
                       if(resultData[i].order_id == orderId){
                           resultData.splice(i,1);
                       }
                   }
                    var cbMAp={
                        2:'ORDER_PAY_SUCCESS',
                        6:'CANCEL_ORDER_SUCCESS',
                        12:'CUSTOMER_SIGN_SUCCESS'
                    };
                        cb(cbMAp[statueId]);

                }).error(function(res){
                    cb(errMAp[statue]);
                });
            },
            adminLoadOrder:function(page,pageSize,statue,cb){
                if(stat!=statue){
                    resultData=[];
                    stat=statue;
                }
                $http.get('/person/adminGetOrders/'+statue+'/'+page+'/'+pageSize).success(function(data){
                    formatData(data.results);
                    cb(resultData);
                }).error(function(res){
                    console.log(res);
                })
            },
            getOrderDetail:function(orderId,cb){
                $http.get('/person/findOrder/'+orderId).success(function(data){
                        orderDetail=data.results;
                        orderDetail.items.forEach(function(item){
                            item.prod_images=imgIP+item.prod_images;
                        })
                        cb(orderDetail);

                }).error(function(res){
                    console.log(res);
                })
            },
            inintOrders:function(){
                resultData.splice(0,resultData.length);
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
            ADMIN_SEND_FAILURE:'发货失败',
            CUSTOMER_SIGN_SUCCESS:'签收成功',
            CUSTOMER_SIGN_FAILURE:'签收失败',
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
