/**
 * Created by wei on 15/10/19.
 */
var express = require('express');
var router = express.Router();
var shopModel=require('./shopModel');

//获取轮播图片
function getCarousel (req, res){
    shopModel.getCarousel(function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data[0]});
    });
};



//获取分类数据
function getCategory(req, res){
    shopModel.getCategory(function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}

//获取产品数据
function getGoods(req,res){
    var page = req.params.page;
    var size = req.params.size;
    var categoryid = req.params.categoryid;
    shopModel.getGoods(page,size,categoryid,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}

//查询商品详情

function findGood (req,res){

    var goodId = req.params.goodId;
    shopModel.findGood(goodId,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })

}

//根据关键字查找商品
function searchGoods (req,res){
    var page = req.params.page;
    var size = req.params.size;
    var keyword = req.params.keyword;
    console.log(keyword);
    shopModel.searchGoods(page,size,keyword,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })

}

//购物车添加商品

function addBasket(req,res){
    var goods=req.body;
    shopModel.addBasket(goods,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}

//删除购物车商品
function delBasket(req,res){
    var goods=req.body;
    shopModel.delBasket(goods,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}

//获得购物车中的商品
function getBasket(req,res){
    var customerId = req.params.customerId;
    shopModel.getBasket(customerId,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}

//修改购物车中的商品的数量
function chgBasket(req,res){
    var customerId = req.params.customerId;
    var prod_id = req.params.prod_id;
    var quantity = req.params.quantity;
    shopModel.chgBasket(customerId,prod_id,quantity,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}

//新增订单
function addOrder(req,res){
    var data=req.body;
    shopModel.addOrder(data,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}

//获取运费
function getCharge(req,res){
    var data = req.body;
    shopModel.getCharge(data,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}


//获取运费规则描述
function getDeliverRule(req,res){

    shopModel.getDeliverRule(function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    })
}



router.get('/getCarousel',getCarousel); //获取轮播图片
router.get('/getCategory',getCategory); //获取分类数据

router.get('/getGoods/:page/:size/:categoryid',getGoods); //获取商品数据
router.get('/findGood/:goodId',findGood); //查找一个商品
router.get('/searchGoods/:page/:size/:keyword',searchGoods); //根据关键字查找商品


router.post('/addBasket',addBasket); //购物车添加商品
router.post('/delBasket',delBasket); //删除购物车商品
router.get('/getBasket/:customerId',getBasket); //获取购物车商品
router.get('/chgBasket/:customerId/:prod_id/:quantity',chgBasket); //修改购物车商品数量

router.post('/addOrder',addOrder);//新增订单
router.post('/getCharge',getCharge);//获取运费
router.get('/getDeliverRule',getDeliverRule);//获取运费规则描述


module.exports = router;
