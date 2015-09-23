angular.module('index.controllers', [])

    .controller('indexBaseCtrl', function($scope,cart) {
        cart.getGoodsNumber(function(data){
            console.log(data);
            $scope.data=data;
        });
    })

.controller('indexCtrl', function($scope) {
        console.log('index');
    })

.controller('cartCtrl', function($scope,cart,$ionicListDelegate,$ionicPopup) {

        $scope.number=[];
        for(var i=1;i<51;i++){
            $scope.number.push(i);
        }

        cart.getGoods(function(data){
            $scope.cartGoods=data;
            console.log(data);

        });

       $scope.del=function(index){
       cart.deleteGoods(index,function(){
           $ionicPopup.alert({
               title: '',
               template: '删除失败',
               okText: '好的'
           });
           return;
       });
   }

        $scope.changeNumber=function(number,index){
            cart.changeNumber(number,index,function(){
                 $ionicPopup.alert({
                    title: '',
                    template: '修改失败',
                    okText: '好的'
                });
                return;
            });
        }

})

.controller('accountCtrl', function($scope) {
        console.log('account');

})

.controller('adminCtrl', function($scope) {
        console.log('admin');

});
