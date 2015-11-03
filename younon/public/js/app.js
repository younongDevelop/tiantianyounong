// Ionic Starter App

var api='rest/';
var search='search/';
var pageNumber=10;
var customerId='11';
var openid='';
var token='';
var appid='wx248d78d070b8fb35';
var imgIP='http://120.131.70.188:3003/';

(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = 10 * (clientWidth / 640) + 'px';
        };

    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);


angular.module('starter', ['ionic', 'index.controllers', 'index.services','admin.controllers', 'admin.services','person.controllers', 'person.services','shop.controllers', 'shop.services','common.util'])

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

      //.state('tab.orderSuc', {
      //    url: '/orderSuc/{orderid}',
      //    templateUrl: 'templates/shopping/shopping-order-suc.html',
      //    controller:"orderSuc"
      //
      //})
        //index路由结束


      .state('shopping', {
          url: '/shopping',
          abstract: true,
          templateUrl: 'templates/shopping/shopping.html',
          controller:'shoppingBaseCtrl'
      })

      .state('list', {
          url: '/list/{search}',
          templateUrl: 'templates/shopping/shopping-list.html',
          controller: 'listCtrl'

      })
      .state('detail', {
          url: '/detail/{proid}',
          templateUrl: 'templates/shopping/shopping-detail.html',
          controller: 'detailCtrl'

      })

      .state('orderFill', {
          url: '/orderFill',
          templateUrl: 'templates/shopping/shopping-order-fill.html',
          controller:"orderFill"
      })

      .state('since', {
          url: '/since',
          templateUrl: 'templates/shopping/since.html',
          controller:"since"
      })

        //shopping路由结束

      .state('account', {
          url: '/account',
          abstract: true,
          templateUrl: 'templates/index/tabs.html',
          controller:'indexBaseCtrl'
      })

      .state('orders', {
          cache: false,
          url: '/orders',
          templateUrl: 'templates/personInfor/account-orders.html',
          controller: 'accountOrdersCtrl'

      })

      .state('orderDetails', {
          url: '/orderDetails/{orderId}',
          templateUrl: 'templates/personInfor/account-order-details.html',
          controller: 'accountOrderDetails'
      })


      .state('addresses', {
          url: '/addresses',
          templateUrl: 'templates/personInfor/account-addresses.html',
          controller: 'addressesCtrl'
      })

      .state('addrChg', {
          url: '/addrChg/{param}',
          templateUrl: 'templates/personInfor/account-addrChg.html',
          controller: 'addrChgCtrl'
      })

      .state('about', {
          url: '/about',
          templateUrl: 'templates/personInfor/account-about.html'
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
            return urlObj
        }catch(e){
            urlObj = {small:null,list:[]};
            return urlObj;
        }
    }
  }
})