/**
 * Created by wei on 15/9/21.
 */
angular.module('shop.services', [])

    .factory('shop', function() {

    })

    .factory('orderOp',function($http, cart,accountOrders){
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
            deliver_address:'',     //deliver address
            deliver_phone:'',       //contact phone
            deliver_type:'定点自取',        //送货方式    送货上门 / 柜台自提
            deliver_status:'1',
            deliver_time:'只在周末送货',        //送货时间   选项1：只在周末送货 选项2：每日17:00~20:00送货 选项3:不限
            items:[],
            receiver_name:'',
            deliver_charges:'0',
            deliver_free:'0',
            payment_id:'1',
            payment_type:'1',  //支付方式   传值：“1”—在线支付；“2”—货到付款
            order_total:'0',
            order_status_id:'9',//"1"-待支付未发货，“9”－未支付待自取
            status_name:'未支付待自取',
            formCart:false
        }

        return {
            initFormData:function(){

                formData = {
                    customer_id:customerId,         //customer id
                    deliver_address:'',     //deliver address
                    deliver_phone:'',       //contact phone
                    deliver_type:'定点自取',        //送货方式    送货上门 / 柜台自提
                    deliver_status:'1',
                    deliver_time:'只在周末送货',        //送货时间   选项1：只在周末送货 选项2：每日17:00~20:00送货 选项3:不限
                    items:[],
                    receiver_name:'',
                    deliver_charges:'0',
                    deliver_free:'0',
                    payment_id:'1',
                    payment_type:'1',  //支付方式   传值：“1”—在线支付；“2”—货到付款
                    order_total:'0',
                    order_status_id:'9',//"1"-待支付未发货，“9”－未支付待自取
                    status_name:'未支付待自取',
                    formCart:false
                }

            },
            // 绑定数据
            getFormData:function(cb){
                cb(formData);
            },

            // 判断是否来自购物车
            isFromCart:function(data){
                formData.formCart=data;
            },
            getDeliverCharges:function(data){
                $http.post('/shop/getCharge',data).success(function(data){
                    formData.items=data.results.goods;
                    formData.charges=data.results.deliver_charges;
                    formData.deliver_type='定点自取';
                    formData.deliver_charges =0;
                    formData.deliver_free=0;
                    formData.free=data.results.deliver_free;
                    formData.deliver_timeArr=data.results.deliver_time;
                    formData.deliver_typeArr=data.results.deliver_type;
                    formData.pay_typeArr=data.results.pay_type;
                    formData.totalMoney=0;
                    formData.weight=0;
                    formData.payment_id=formData.pay_typeArr[0].id;
                    formData.payment_type=formData.pay_typeArr[0].id;
                    formData.deliver_time=formData.deliver_timeArr[0].value;
                    if(localStorage.deliver_type==formData.deliver_type){
                        formData.deliver_address=localStorage.address_detail;   //deliver address
                        formData.deliver_phone=localStorage.receiver_phone;
                        formData.receiver_name=localStorage.receiver_name;
                    }

                    var sum=0;
                    for(var i in formData.items){
                        formData.items[i].prod_images=imgIP+formData.items[i].prod_images;
                        formData.weight+=formData.items[i].prod_weight*formData.items[i].quantity;

                        var item=formData.items[i];

                        item.quantity=parseInt(item.quantity);
                        item.prod_price=parseFloat(item.prod_price).toFixed(2);
                        item.sum=item.quantity*item.prod_price;
                        item.sum=parseFloat(item.sum).toFixed(2);
                       sum+=item.quantity*item.prod_price;
                        sum=parseFloat(sum).toFixed(2);
                    }
                    formData.totalMoney=sum;
                    formData.order_total=parseInt(sum*100)/100+parseInt(formData.deliver_charges)-parseInt(formData.deliver_free);
                }).error(function(err){
                    console.log(err);
                })
            },
            //获取运费规则描述
            getDeliverRule:function(cb){
                $http.get('/shop/getDeliverRule').success(function(data){
                    cb(null,data);
                }).error(function(err){
                    cb(err,null);
                })
            },
            // 填写地址
            fillAddress:function(address){
                formData.deliver_address=localStorage.address_detail;   //deliver address
                formData.deliver_phone=localStorage.receiver_phone;
                formData.receiver_name=localStorage.receiver_name;
            },
            // 提交订单
            submitOrder:function(suc,fail){
                console.log(formData);
                $http.post('/shop/addOrder', formData).success(function(data){

                    console.log(formData.formCart)

                    if(formData.formCart){
                        for(var i in formData.items){
                            formData.items[i].customersId=customerId;
                        }
                        cart.deleteGoods(formData.items,function(data){
                            console.log('删除购物车商品失败');
                        });
                    }
                    suc(data);
                }).error(function(data){
                    fail && fail(data);
                })
            }
        }
    })