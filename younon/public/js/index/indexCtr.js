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

.controller('cartCtrl', function($scope,cart,$ionicListDelegate) {

        cart.getGoods(function(data){
            console.log(data);
            $scope.cartGoods=data;
        });
   $scope.del=function(index){
       cart.deleteGoods(index,function(){
           console.log('sdfsdf');
       });
   }

})

.controller('accountCtrl', function($scope) {
        console.log('account');

})

.controller('adminCtrl', function($scope) {
        console.log('admin');

});
