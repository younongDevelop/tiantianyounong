angular.module('index.controllers', [])

    .controller('indexBaseCtrl', function($scope,cart,$http) {

        cart.getGoodsNumber(function(data){
            console.log(data);
            $scope.data=data;
        });
    })

.controller('indexCtrl', function($scope, cate, cart, $ionicSlideBoxDelegate, $timeout, $location) {
        $scope.searchStr = "";
        $scope.cates = [];
        // 获取产品品类
        cate.getCates(function(catesInfo){
           $scope.catesInfo = catesInfo;
        });
        // 获取热卖产品
        cate.getHotPros(function(hotprosInfo){
           $scope.hotprosInfo = hotprosInfo;
        });
        // 点击搜索事件
        $scope.search = function(searchStr){
            $location.path('/shopping/list/'+searchStr);
            $location.replace();
        }
        // 获取幻灯片数据
        $scope.slideInfo = {
            number:4,
            slides:[{
                url:"//www.baidu.com",
                imgSrc:"./img/slide1.jpg"
            },{
                url:"//www.xiajiecheng.com",
                imgSrc:"./img/slide2.jpg"
            },{
                url:"//www.qq.com",
                imgSrc:"./img/slide3.jpg"
            },{
                url:"//www.qq.com",
                imgSrc:"./img/slide3.jpg"
            }]
        }
        // 控制幻灯片自动滑动
        setInterval(function(){
            $ionicSlideBoxDelegate.next();
        },4000);
        // 添加购物车
        $scope.addGood = function(pro){
            // var pro = $scope.hotprosInfo.hotpros[index];
            cart.addGoods(pro,function(res){
                // 添加成功后
                console.log("suc",res);
            },function(res){
                // 添加失败后
                console.log("err",res);
            })
        }
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
