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
    .factory('detail',function($http, $stateParams, util){
        // 商品详情信息
        var proDetailInfo = {proDetail:null};
        // 载入商品详情信息
        function loadDetail(suc){
            var proid = $stateParams.proid;
            var urlTmpl = '/?product_id={product_id}&field=product_id+product_orgin+product_name+product_description+product_images+product_vendor+product_price+product_sell_price+product_score+product_comment_volume+product_delivery_sites+product_attributes&from=weixin&wf=product&groupbyparams=none'
            var url = urlTmpl.replace("{product_id}",proid);
            $http.get(search+url).success(function(data){
                if (data.code === 0) {
                    proDetailInfo.proDetail = data.search_response.books[0];
                    // 对图片地址进行处理
                    if(proDetailInfo.proDetail){
                        proDetailInfo.proDetail.product_images = util.parseImgUrls(proDetailInfo.proDetail.product_images);
                    }
                    suc && suc();
                }else{
                    console.log(data.message);
                }
            })
        }
        return {
            /**
            * @desc 获取详情
            * @func getDetail
            */ 
            getDetail:function(cb){
                cb && cb(proDetailInfo);
            },
            loadDetail:loadDetail
        }
        
    })
    .factory('orderFill',function($http){
        // 将要结算并生产订单的产品
        var prosInfo = {pros:[{
                commentcount: "28",
                product_id: "21",
                product_images:{
                    small:'./img/slide1.jpg',
                    list:['abc3','abc2','abc1'],
                },
                product_name: "黑猪肉",
                product_origin: "南京",
                product_original_price: "2000",
                product_sell_price: "2900",
                product_weight: "10.00",
                sku_attrval: "10斤",
                quantity:1
            },{
                commentcount: "28",
                product_id: "11",
                product_images:{
                    small:'./img/slide1.jpg',
                    list:['abc3','abc2','abc1'],
                },
                product_name: "苹果",
                product_origin: "南京",
                product_original_price: "2000",
                product_sell_price: "2900",
                product_weight: "10.00",
                sku_attrval: "10斤",
                quantity:2
            }]};
        // 下拉框选项数据
        var selectAttrsInfo = {selectAttrs:[{
            "attr_id": 1,
            "attr_desc": "送货时间",
            "attr_value": {
                "3": "每日15:00~19:00送货",
                "2": "每日9:00~15:00送货",
                "1": "只在周末送货",
                "4": "送货时间不限"
            },
            "attr_type": "deliver_time"
            }, {
                "attr_id": 2,
                "attr_desc": "送货方式",
                "attr_value": {
                    "2": "柜台自取",
                    "1": "送货上门"
                },
                "attr_type": "deliver_type"
            }, {
                "attr_id": 3,
                "attr_desc": "支付方式",
                "attr_value": {
                    "2": "货到付款",
                    "1": "在线支付"
                },
                "attr_type": "pay_type"
            }, {
                "attr_id": 4,
                "attr_desc": "发票类型",
                "attr_value": {
                    "3": "公司发票",
                    "2": "个人发票",
                    "1": "否"
                },
                "attr_type": "invoice_type"
            }, {
                "attr_id": 5,
                "attr_desc": "重量运费",
                "attr_value": {
                    "20": "10",
                    "10": "0",
                    "10000": "20"
                },
                "attr_type": "deliver_charges"
            }, {
                "attr_id": 6,
                "attr_desc": "运费减免",
                "attr_value": {
                    "1": "100"
                },
                "attr_type": "deliver_free"
            }, {
                "attr_id": 7,
                "attr_desc": "商品状态",
                "attr_value": {
                    "3": "已审核未通过",
                    "2": "已审核通过",
                    "1": "已创建",
                    "5": "已下架",
                    "4": "已上架"
                },
                "attr_type": "prod_status"
            }]};
        // 即将被使用的地址对象
        var addressInfo = {
            address:{
                "address_id": 1,
                "city_name": "苏州市",
                "district_name": "园区",
                "community_name": "中海7区",
                "city_id": 2,
                "district_id": 3,
                "community_id": 4,
                "address_room": "20#903",
                "address_detail": "江苏省苏州市园区中海7区20#903",
                "receiver_name": "于慧勇",
                "receiver_phone": "2132425235322",
                "version": 77,
                "status": 0
            }
        };

        // 载入下拉框选项数据
        function loadSelectAttrsInfo(){
            $http.get(api+'/attributes').success(function(data){
                if(data.code === 0){
                    selectAttrsInfo.selectAttrs = data.result;
                }
            })
        }
        return {
            /**
            * @desc 获取将要结算的商品
            */ 
            getProsInfo:function(cb){
                cb && cb(prosInfo);
            },
            /**
            * @desc 重置将要结算的商品
            */
            replacePros:function(pros){
                prosInfo.pros  = pros
            },
            /**
            * @desc 计算运费
            * @func calcuDeliverPrice
            * @param {array} pros 商品信息
            *[{
            *    "pid":"1",
            *    "quantity":"5",
            *    "final_price":"22.89",
            *    "product_weight":"2"
            *},]
            * @param {function} cb 回调函数，传入计算结果
            *   {
            *        weight:27.0, //总重量
            *        charge:2000  //运费
            *    }
            */
            calcuDeliverPrice:function(pros,cb){
                $http.post(api+'/orders/charge',pros).success(function(data){
                    if(data.code === 0){
                        cb && cb(data.results);
                    }
                })
            },
            /**
            * @desc 获取列表选项
            */
            getSelectAttrsInfo:function(cb){
                cb&&cb(selectAttrsInfo);
            },
            /**
            * @desc 获取地址信息
            */
            getAddressInfo:function(cb){
                cb&&cb(addressInfo)
            },
            /**
            * @desc 设置地址对象
            */
            setAddressInfo:function(address){
                addressInfo.address = address;
            },
            /**
            * @desc 提交表单
            */ 
            submit:function(formData,suc,fail){
                $http.post(api+"/orders/checkout", formData).success(function(data){
                    console.log('submit',data);
                    if(data.code === 0){
                        suc && suc(data);
                    }else{
                        fail && fail(data);
                    }
                })
            }
        }
        
    })