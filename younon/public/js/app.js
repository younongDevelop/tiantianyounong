// Ionic Starter App


var customerId='49';
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


angular.module('starter', ['ionic','ngIOS9UIWebViewPatch','me-lazyimg','index.controllers', 'index.services','person.controllers', 'person.services','shop.controllers', 'shop.services'])

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

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('left');

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');
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

      .state('manageOrders', {
          cache: false,
          url: '/manageOrders',
          templateUrl: 'templates/personInfor/account-manageOrders.html',
          controller: 'manageOrdersCtrl'

      })

      .state('manageOrdersDetails', {
          url: '/manageOrderDetails/{orderId}',
          templateUrl: 'templates/personInfor/account-manageOrderDetail.html',
          controller: 'accountManageOrderDetails'
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

