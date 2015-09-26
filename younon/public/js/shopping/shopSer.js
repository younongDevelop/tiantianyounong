/**
 * Created by wei on 15/9/21.
 */
angular.module('shop.services', [])

    .factory('shop', function() {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
        }, {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
        }, {
            id: 2,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
        }, {
            id: 3,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
        }, {
            id: 4,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
        }];

        return {
            all: function() {
                return chats;
            },
            remove: function(chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function(chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    })
    .factory('list', function($http, $stateParams){
        var proListInfo = {proList:[]};
        // 分页页码
        var page = 0;
        // 每页的数据量
        var pageSize = 3;
        // 是否已经加载完毕
        var isMore = true;
        var keyword = $stateParams.search;

        /**
        * @desc 获取列表数据
        * @func getList
        * @param {string} params.keyword 关键词
        * @param {number} params.page 分页页码
        * @param {number} params.pageSize 每页数据量 
        * @param {function} cb 回调函数
        */
        function getList(params, cb){
            var searchUrlTmpl = '/search/?keyword={keyword}&start={page}&n={pageSize}&field=product_id+prod_sku_id+product_url+product_name+product_images+sku_attrval+product_original_price+product_sell_price+product_origin+product_weight+commentcount&wf=product&from=weixin&ranker_type=';
            var searchUrl = searchUrlTmpl.replace(/{(\w+)}/g,function($0,$1){
                return params[$1]===undefined?"":params[$1];
            });
            $http.get(searchUrl).success(function(data){
                if(data&&data.code===0){
                    var books = data.search_response.books;
                    for(var index in books){
                        var book = books[index];
                        try{
                            book.product_images = JSON.parse(book.product_images);
                        }catch(e){
                            book.product_images = {small:null,list:null};
                        }
                    }
                }
                cb && cb(data);
            })
        }
        return {
            /**
            * @desc 绑定数据
            */
            getProListInfo:function(cb){
                cb && cb(proListInfo);
            },
            /**
            * @desc 加载数据
            */
            load:function(cb){
                getList({keyword:keyword,page:page,pageSize:pageSize},function(data){
                    if(data.code !== 0) return;
                    proListInfo.proList = data.search_response.books;
                    if(data.search_response.books < pageSize){
                        isMore = false;
                    }
                    cb && cb();
                })
                page++;
            },
            /**
            * @desc 加载更多结果
            */
            loadMore:function(cb){
                if(!isMore) return;
                // 调用加载方法
                getList({keyword:keyword,page:page,pageSize:pageSize},function(data){
                    if(data.code !== 0) return;
                    proListInfo.proList = proListInfo.proList.concat(data.search_response.books);
                    // 更新page和hasMore状态
                    if(data.search_response.books.length < pageSize){
                        isMore = false;
                    }
                    cb && cb();
                })
                page++;
            },
            /**
            * @desc 重新加载结果
            * @func loadAgain
            * @param {string} kw 搜索的关键词
            */
            loadAgain:function(cb){
                page = 0;
                isMore = true;
                this.load(function(){
                    cb && cb();
                });
            },
            /**
            * @desc 设置搜索关键词
            */
            setKeyword:function(kw){
                keyword = kw;
            },
            /**
            * @desc 是否还有更多数据
            */ 
            hasMore:function(){
                return isMore; 
            }
        }
    })
