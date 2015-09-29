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
    .factory('orderOp',function($http){
        // 待提交的表单对象模板
        var formData = {
            customer_id:(customerId+''),         //customer id
            deliver_address:'',     //deliver address
            deliver_phone:'',       //contact phone
            deliver_type:'送货上门',        //送货方式    送货上门 / 柜台自提
            payment_type:'1',        //支付方式   传值：“1”—在线支付；“2”—货到付款
            deliver_time:'1',        //送货时间   选项1：只在周末送货 选项2：每日17:00~20:00送货 选项3:不限
            order_message:'',       //订单留言(可以为空)
            order_invoice_type:'',  //发票类型  个人， 公司(可以为空)
            order_invoice_title:'', //公司类型发票的抬头(可以为空)
            /*
            * item{
            *    pid:11,                  //product id
            *    quantity:2,                 //商品购买数量
            *    final_price:1.00,           //最终价格
            *    product_weight:1.12,        //商品重量
            *}
            */
            items:[{
                final_price: 2900,
                pid: 11,
                product_weight: 0,
                quantity: 1
            }],
            receiver_name:'',
            deliver_charges:'0',
            ischecked:'1'
        }
        // 订单商品模板
        var prosInfo = {pros:[{
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
        // 表单的中的下拉选择项
        var selectAttrsInfo = {selectAttrs:[]};
        // 商品结算信息
        var amountInfo = {
            product_weight_all:1,
            product_price_all:2,
            send_price:3,
            send_price_redu:4,
            integral:5,
            amount:6
        }
        // 载入下拉框数据
        function loadSelectAttrsInfo(){
            $http.get(api+'/attributes').success(function(data){
                if(data.code === 0){
                    selectAttrsInfo.selectAttrs = data.results;
                }
            })
        }
        loadSelectAttrsInfo();
        // 计算运费信息
        function calcuDeliverPrice(pros,cb){
            $http.post(api+'/orders/charge',pros).success(function(data){
                if(data.code === 0){
                    cb && cb(data.results);
                }
            })
        }
        // 计算结算信息
        function calcuAmount(cb){
            formData.items.forEach(function(item){
                amountInfo.product_price_all += (item.final_price * item.quantity);
            })
            calcuDeliverPrice(formData.items,function(data){
                amountInfo.send_price = data.charge;
                amountInfo.product_weight_all = data.weight
                amountInfo.amount = amountInfo.product_price_all + amountInfo.send_price - amountInfo.send_price_redu;
                cb && cb();
            })
        }
        // 重置订单信息
        function resetOrder(){
            formData.deliver_address = '';
            formData.deliver_phone = '';
            formData.receiver_name = '';
            formData.order_message = '';
            formData.items = [];
            deliver_charges='0';
            ischecked='0';

            prosInfo.pros = [];

            amountInfo.product_weight_all = 0;
            amountInfo.product_price_all = 0;
            amountInfo.send_price = 0;
            amountInfo.send_price_redu = 0;
            amountInfo.integral = 0;
            amountInfo.amount = 0;
        }
        return {
            // 绑定数据
            getFormData:function(){
                return formData;
            },
            getProsInfo:function(){
                return prosInfo;
            },
            getSelectAttrsInfo:function(){
                return selectAttrsInfo;
            },
            getAmountInfo:function(){
                return amountInfo;
            },
            // 填写地址
            fillAddress:function(address){
                formData.deliver_address = address.address_detail;
                formData.deliver_phone = address.receiver_phone;
                formData.receiver_name = address.receiver_name;
            },
            /**
            * @desc 初始化一个待提交商品订单 
            * @func initOrder
            * @param {object} pros 待结算的商品
            */ 
            initOrder:function(pros){
                // 重置数据
                resetOrder();
                // 设置订单商品
                // 替换
                prosInfo.pros = pros;
                // 填入表单
                for(var index in prosInfo.pros){
                    var pro = prosInfo.pros[index];
                    var item = {
                        pid:parseInt(pro.product_id),
                        quantity:pro.quantity,
                        final_price:parseFloat(pro.product_sell_price),
                        product_weight:parseFloat(pro.product_weight)
                    }
                    formData.items.push(item);
                }
                formData.ischecked = (formData.items.length+'');
                // 计算结算信息
                calcuAmount(function(){
                    formData.deliver_charges = (amountInfo.send_price+'');
                });
                // 自动填写地址
                this.fillAddress({
                    address_detail:localStorage.address_detail,
                    receiver_phone:localStorage.receiver_phone,
                    receiver_name:localStorage.receiver_name
                });
            },
            // 提交订单
            submitOrder:function(suc,fail){                
                $http.post(api+"/orders/checkout", formData).success(function(data){
                    console.log('submit',data);
                    if(data.code === 0){
                        suc && suc(data);
                    }else{
                        fail && fail(data);
                    }
                }).error(function(data){
                    fail && fail(data);
                })
            }
        }
    })