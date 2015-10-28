var signback = function (data) {
    wx.config({
        debug:true,
        appId: appid,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['chooseWXPay']
    });
    wx.ready(function () {
    });
    wx.error(function (res) {

    });
}

var getToken=function(url,$http,weixin){
    var json = {url: url};
    weixin.getToken(json,function(data){
        token=data;
        signback(data);
    })
}
var getOpenId=function($http,weixin,callback){
    var jsonCode = {uid: customerId};
    weixin.getOpenId(jsonCode,function(data){
        openid=data.open_id;
        callback();
    })

}


angular.module('index.controllers', [])

    .controller('indexBaseCtrl', function($scope,cart,$http,$location,weixin) {

        var str = $location.absUrl().split('#')[0];
        str = str.split('?')[1];
        if(str){
            str =str.split('=')[1];
            customerId=str;
        }

        if(!token.timestamp){
            getToken($location.absUrl().split('#')[0],$http,weixin);
        }

        $scope.show = false;
        $scope.nickname = '昵称';
        $scope.headimgurl = '../img/slide1.jpg';

        var getInformation = function () {
            var json = {openid: openid};
            weixin.getInformation(json,function(data){
                if (data.nickname) {$scope.nickname = data.nickname;}
                if (data.headimgurl) $scope.headimgurl = data.headimgurl;
            })
            weixin.getGroup(json,function(data){
                if (data.groupid === 2) {
                    $scope.show = true;
                }
            })

        }
        getOpenId($http,weixin,getInformation);

        cart.getGoodsNumber(function(data){
            console.log(data);
            $scope.data=data;
        });


    })

.controller('indexCtrl', function($scope, cate, cart,$interval, $ionicSlideBoxDelegate,$timeout,$location,
                                  $ionicPopup, $rootScope,$ionicLoading,$ionicListDelegate,others) {
    
        $scope.searchStr = "";
        $scope.categoryArr=[];
        $scope.goods=[];
        var categoryId='';

        var isMore =false;
        var page=1;
        var pageSize=3;

        var slideHandle = $ionicSlideBoxDelegate.$getByHandle('indexSlide');
        $interval(function(){
            slideHandle.next();
        },3000);


        //获取轮播图片

        others.getCarousel(function(err,data){
            if(err){
                alert('获取轮播图片出错')
            }else{
                var imgArr=[];
                for(var i=0 ;i<data.length;i++){
                    imgArr.push({imgSrc:imgIP+data[i]});
                }
                $scope.slideInfo = {
                    number:data.length,
                    slides:imgArr
                }
            }
        })

        // 获取产品种类
        cate.getCates(function(catesInfo){
            $scope.categoryArr=catesInfo;
            cate.loadGoods(categoryId,page,pageSize,loadMore);
        });
        // 获取商品
        cate.getGoods(function(goods){
            $scope.goods=goods;
            console.log(goods);
        })

        //获取产品
        $scope.getProduct=function(categoryid){
            categoryId=categoryid;
            page=1;
           angular.forEach($scope.categoryArr,function(item){
               item.forEach(function(data){
                   data.show=false;
                   if(data.categories_id == categoryid){
                       data.show=true;
                   }
               })

           })
            cate.loadGoods(categoryId,page,pageSize,loadMore);


        }

        // 点击搜索事件
        $scope.search = function(searchStr){
            $location.path('/tab/list/'+searchStr);
        }

        // 添加购物车
        $scope.addGoods = function(pro){
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

        // 跳转到详情页
        $scope.jumpDetail = function(proid){
            $location.path('/shopping/detail/'+proid);
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
        $scope.loadMore = function () {
            isMore=false;
            cate.loadGoods(categoryId,page,pageSize,loadMore);
            // 在重新完全载入数据后，需要发送一个scroll.infiniteScrollComplete事件，告诉directive，我们完成了这个动作，系统会清理scroller和为下一次的载入数据，重新绑定这一事件。
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    })

.controller('cartCtrl', function($scope,cart,orderOp,$ionicListDelegate,$ionicPopup,$location) {
        $scope.selected=false;
        $scope.number=[];
        var goodsId=[];
        for(var i=1;i<51;i++){
            $scope.number.push(i);
        }

        cart.getGoods(function(data){
            $scope.cartGoods=data;
            console.log(data);

        });

       $scope.del=function(index){
           var item={
               customersId:customerId,
               prod_id:$scope.cartGoods[index].prod_id
           }
           var items=[];
           items.push(item);
       cart.deleteGoods(items,function(){
           $ionicPopup.alert({
               title: '',
               template: '删除失败',
               okText: '好的'
           });
           return;
       });
   }

        var changeNumber=function(index,quantity){
            cart.changeNumber(index,quantity,function(){
                 $ionicPopup.alert({
                    title: '',
                    template: '修改失败',
                    okText: '好的'
                });
                return;
            });
        }

        $scope.minus = function(index){
            if($scope.cartGoods[index].quantity>1){
                var number=$scope.cartGoods[index].quantity;
                changeNumber(index,--number);
            }

        }

        $scope.add = function(index){
            var number=$scope.cartGoods[index].quantity;
            changeNumber(index,++number);

        }

        $scope.selectAll = function(){
            $scope.selected=!$scope.selected;
            if($scope.selected){
                for(var i in $scope.cartGoods){
                    $scope.cartGoods[i].select=true;
                    var exit=false;
                    if(goodsId.length !=0 ){
                        for(var m in goodsId){
                            if(goodsId[m] == $scope.cartGoods[i].prod_id){
                                exit=true;
                            }
                            if(m == (goodsId.length-1) && !exit){
                                goodsId.push({prod_id:$scope.cartGoods[i].prod_id,quantity:$scope.cartGoods[i].quantity});
                            }
                        }
                    }else{
                        goodsId.push({prod_id:$scope.cartGoods[i].prod_id,quantity:$scope.cartGoods[i].quantity});
                    }
                }
            }else{
                for(var i in $scope.cartGoods){
                    $scope.cartGoods[i].select=false;
                    goodsId=[];
                }
            }

            cart.getGoodsNumber(function(data){

            });
        }

        $scope.selectOne=function(index){
            $scope.cartGoods[index].select=!$scope.cartGoods[index].select;
            if($scope.cartGoods[index].select){
                goodsId.push({prod_id:$scope.cartGoods[i].prod_id,quantity:$scope.cartGoods[i].quantity});
            }else{
                for(var i in goodsId){
                    if($scope.cartGoods[index].prod_id == goodsId[i]){
                        goodsId.splice(i,1);
                    }
                }
            }
            cart.getGoodsNumber(function(data){

            });
        }


        $scope.accountCart = function(){
            if(goodsId.length<1){
                $ionicPopup.alert({
                    title: '',
                    template: '请选择结算商品',
                    okText: '好的'
                });
                return;
            }



            orderOp.getDeliverCharges(goodsId);
            $location.path('/orderFill');

        }
})

.controller('accountCtrl', function($scope) {
        console.log('account');

})

.controller('adminCtrl', function($scope) {
        console.log('admin');

});
