/**
 * Created by wei on 15/9/21.
 */
angular.module('shop.services', [])

    .factory('shop', function() {

    })

    .factory('orderOp',function($http, cart){
        var fromCart=false;
        // 待提交的表单对象模板
        /*
         * item{
         *    pid:11,                  //product id
         *    quantity:2,                 //商品购买数量
         *    final_price:1.00,           //最终价格
         *    product_weight:1.12,        //商品重量
         *}
         */
        var formData = {
            customer_id:customerId,         //customer id
            deliver_address:localStorage.address_detail,     //deliver address
            deliver_phone:localStorage.receiver_phone,       //contact phone
            deliver_type:'送货上门',        //送货方式    送货上门 / 柜台自提
            payment_type:'1',        //支付方式   传值：“1”—在线支付；“2”—货到付款
            deliver_time:'1',        //送货时间   选项1：只在周末送货 选项2：每日17:00~20:00送货 选项3:不限
            items:[],
            receiver_name:localStorage.receiver_name,
            deliver_charges:'0',
            ischecked:'0'
        }

        return {
            // 绑定数据
            getFormData:function(cb){
                cb(formData);
            },
            // 判断是否来自购物车
            isFromCart:function(){
                fromCart=true;
            },
            getDeliverCharges:function(data){
                $http.post('/shop/getCharge',data).success(function(data){

                    console.log(data);

                }).error(function(err){
                    console.log(err);
                })
            },
            // 填写地址
            fillAddress:function(address){
                formData.deliver_address = address.address_detail;
                formData.deliver_phone = address.receiver_phone;
                formData.receiver_name = address.receiver_name;
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