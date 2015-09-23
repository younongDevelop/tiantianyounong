// Ionic Starter App

var api='rest/';
var pageNumber=10;
var customerId=11;

angular.module('starter', ['ionic', 'index.controllers', 'index.services','admin.controllers', 'admin.services','person.controllers', 'person.services','shop.controllers', 'shop.services',])

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
          controller:'shoppingBaseCtrl'
      })

      .state('shopping.index', {
          url: '/index',
          views: {
                  templateUrl: 'templates/shopping/index.html',
                  controller: 'shoppingCtrl'

          }
      })

        //shopping路由结束

      .state('person', {
          url: '/person',
          abstract: true,
          controller:'personBaseCtrl'
      })

      .state('person.index', {
          url: '/index',
          views: {
              templateUrl: 'templates/personInfor/index.html',
              controller: 'personCtrl'

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
