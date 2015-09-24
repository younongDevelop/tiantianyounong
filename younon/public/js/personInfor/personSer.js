/**
 * Created by wei on 15/9/21.
 */
angular.module('person.services', [])

    .factory('personAddress', function($http) {
        var addresses=[];
        var cities=[];
        var districts=[];
        var community=[];
        var selectedId={id:''};
        if(localStorage.address_id){selectedId.id=localStorage.address_id};

        return{
            getAddresses:function(cb){
                cb(addresses);
            },
            getCity:function(cb){

                $http.get(api+'/cities').success(function(data) {
                    if(data.code===0){
                        cities=data.results;
                        cb(cities);
                    }
                }).error(function (res) {
                    console.log(res);
                });
            },
            loadDistrict:function(cityId,cb){
                $http.get(api+'/districts/'+cityId).success(function(data) {
                    districts=data.results;
                    cb(districts);
                    console.log(districts);
                }).error(function (res) {
                        console.log(res);
                });
            },
            loadCommunity:function(districtId,cb){
                $http.get(api+'/communities/'+districtId).success(function(data) {
                    community=data.results;
                    console.log(community);
                    cb(community);
                }).error(function (res) {
                    console.log(res);
                });
            },
            loadAddress:function(page,pageSize,version,cb){
                $http.get(api+'/addresses/'+customerId+'/'+page+'/'+pageSize+'/'+version).success(function(data,status,headers) {
                    console.log(data);
                    if(data.code===0){
                        for (var i in data.results) {
                            if(data.results[i].status!=0){addresses.push(data.results[i]);}
                        }
                        if(!localStorage.address_id&&addresses[0]){
                            selectedId.id=addresses[0].address_id,
                                localStorage.address_id=addresses[0].address_id;
                                localStorage.receiver_name=addresses[0].receiver_name;
                                localStorage.receiver_phone=addresses[0].receiver_phone;
                                localStorage.address_detail=addresses[0].address_detail;
                        }
                        cb(data.results);
                    }
                }).error(function (res) {
                    console.log(res);
                });
                },
            addAddress:function(item,cb){

            },
            delAddress:function(index,cb){
                addresses.splice(index,1);
            },
            changeAddress:function(index,key,value,cb){

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
    });
