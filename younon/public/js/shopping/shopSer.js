/**
 * Created by wei on 15/9/21.
 */
angular.module('shop.services', [])

    .factory('shop', function() {

    })

    .factory('orderOp',function($http, cart){
        // 待提交的表单对象模板
        var formData = {
            customer_id:(customerId+''),         //customer id
            deliver_address:localStorage.address_detail,     //deliver address
            deliver_phone:localStorage.receiver_phone,       //contact phone
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
            items:[],
            receiver_name:localStorage.receiver_name,
            deliver_charges:'0',
            ischecked:'0'
        }
        // 订单商品模板
        var prosInfo = {pros:[]};
        // 表单的中的下拉选择项
        var selectAttrsInfo = {selectAttrs:[]};
        // 商品结算信息
        var amountInfo = {
            product_weight_all:0,
            product_price_all:0,
            send_price:0,
            send_price_redu:0,
            integral:0,
            amount:0
        }
        // 载入下拉框数据
        //function loadSelectAttrsInfo(){
        //    $http.get(api+'/attributes').success(function(data){
        //        if(data.code === 0){
        //            selectAttrsInfo.selectAttrs = data.results;
        //        }
        //    })
        //}
        //loadSelectAttrsInfo();
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
            // 判断是否来自购物车
            isFromCart:function(){
                var cartsNumber;
                cart.getGoods(function(goods){
                    cartsNumber = goods.length;
                })
                if((cartsNumber+'') === formData.ischecked){
                    return true;
                }else{
                    return false;
                }
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