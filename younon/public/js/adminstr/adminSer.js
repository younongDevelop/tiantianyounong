/**
 * Created by wei on 15/9/21.
 */
angular.module('admin.services', [])

    .factory('adminGetOrders', function($http) {
            var orders=[];
            var orderStatue='';

        return{
            getOrders:function(cb){
                cb(orders);
            },
            changeOrderStatue:function(orderId){
               for(var i=0;i<orders.length;i++){
                   orders.splice(i,1);
               }
            },
            loadOrdersArr:function(statue,page,size,cb){
                if(!orderStatue){
                    orderStatue=statue;
                }else if(orderStatue!=statue){
                    console.log('sdfsdfsdf');
                    console.log(orderStatue);
                    console.log(orders);
                    orderStatue=statue;
                    orders=[];
                }

                $http.get('/adminOrders/'+statue+'/'+page+'/'+size).success(function(data){
                    data.forEach(function(item){
                        orders.push(item);
                    })
                    console.log(orders);
                    cb(data);
                }).error(function(res){
                    console.log(res);
                });
            }

        }

    });
