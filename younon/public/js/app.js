// Ionic Starter App

var api='rest/';
var search='search/';
var pageNumber=10;
var customerId=11;


angular.module('starter', ['ionic', 'index.controllers', 'index.services','admin.controllers', 'admin.services','person.controllers', 'person.services','shop.controllers', 'shop.services','common.util',])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
      .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/index/tabs.html',
    controller:'indexBaseCtrl'
  })

  .state('tab.index', {
    url: '/index',
    views: {
      'tab-index': {
        templateUrl: 'templates/index/tab-index.html',
        controller: 'indexCtrl'
      }
    }
  })

  .state('tab.cart', {
      url: '/cart',
      views: {
        'tab-cart': {
          templateUrl: 'templates/index/tab-cart.html',
          controller: 'cartCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/index/tab-account.html',
        controller: 'accountCtrl'
      }
    }
  })
      .state('tab.admin', {
            url: '/admin',
            views: {
                'tab-admin': {
                    templateUrl: 'templates/index/tab-admin.html',
                    controller: 'adminCtrl'
                }
            }
        })
        //index路由结束


      .state('shopping', {
          url: '/shopping',
          abstract: true,
          templateUrl: 'templates/shopping/shopping.html',
          controller:'shoppingBaseCtrl'
      })

      .state('shopping.index', {
          url: '/index',
          views: {
            'shopping':{
                  templateUrl: 'templates/shopping/index.html',
                  controller: 'shoppingCtrl'
            }
          }
      })
      .state('tab.list', {
          url: '/list/{search}',
          views: {
            'tab-index':{
                  templateUrl: 'templates/shopping/shopping-list.html',
                  controller: 'listCtrl'              
            }
          }
      })
      .state('shopping.detail', {
          url: '/detail/{proid}',
          views: {
            'shopping':{
                  templateUrl: 'templates/shopping/shopping-detail.html',
                  controller: 'detailCtrl'              
            }

          }
      })
        //shopping路由结束

      .state('account', {
          url: '/account',
          abstract: true,
          templateUrl: 'templates/index/tabs.html',
          controller:'indexBaseCtrl'
      })

      .state('account.orders', {
          url: '/orders/{statue}',
          views: {
              'tab-account': {
                  templateUrl: 'templates/personInfor/account-orders.html',
                  controller: 'accountOrdersCtrl'
              }
          }
      })

      .state('orderDetails', {
          url: '/orderDetails/{orderId}/{statue}',
          templateUrl: 'templates/personInfor/account-order-details.html',
          controller: 'accountOrderDetails'
      })


      .state('account.addresses', {
          url: '/addresses',
          views: {
              'tab-account': {
                  templateUrl: 'templates/personInfor/account-addresses.html',
                  controller: 'addressesCtrl'
              }
          }
      })

      .state('account.addrChg', {
          url: '/addrChg/{param}',
          views: {
              'tab-account': {
                  templateUrl: 'templates/personInfor/account-addrChg.html',
                  controller: 'addrChgCtrl'
              }
          }
      })
      .state('account.about', {
          url: '/about',
          views: {
              'tab-account': {
                  templateUrl: 'templates/personInfor/account-about.html'
              }
          }
      })
      .state('account.orderFill', {
          url: '/orderFill',
          views: {
              'tab-account': {
                  templateUrl: 'templates/personInfor/account-order-fill.html',
                  controller:"orderFill"
              }
          }
      })
      //person路由结束

      .state('admin', {
          url: '/admin',
          abstract: true,
          controller:'adminBaseCtrl'
      })

      .state('admin.index', {
          url: '/index',
          views: {
              templateUrl: 'templates/adminstr/index.html',
              controller: 'adminCtrl'

          }
      });

  $urlRouterProvider.otherwise('/tab/index');

});

// 公共方法
angular.module('common.util', []).factory("util",function(){
  return {
    /**
    * @desc 解析商品对象中的图片地址对象
    */
    parseImgUrls:function(urlsStr){
        var urlObj;
        try{
            urlObj = JSON.parse(urlsStr);
            var list = []
            urlObj.list = urlObj.list.split(",");
            // TODO:XJC for test 
            // for(var i in urlObj.list){
            //   urlObj.list[i] += i;
            // }
            return urlObj
        }catch(e){
            urlObj = {small:null,list:[]};
            return urlObj;
        }
    }
  }
})