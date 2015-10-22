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



router.get('/getCarousel',getCarousel); //获取轮播图片
router.get('/getCategory',getCategory); //获取分类数据
router.get('/getGoods/:page/:size/:categoryid',getGoods); //获取分类数据

module.exports = router;
