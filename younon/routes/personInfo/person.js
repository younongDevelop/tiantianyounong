/**
 * Created by wei on 15/10/23.
 */

var express = require('express');
var router = express.Router();
var personModel=require('./personModel');

//获取用户所有地址
function getAddress (req, res){
    var customerId=req.params.customerId;
    var page=req.params.page;
    var pageSize=req.params.pageSize;
    personModel.getAddress(customerId,page,pageSize,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    });
};

//修改用户地址
function updateAddress(req,res){
    var data=req.body;
    personModel.updateAddress(data,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data[0]});
    });
}


//新增用户地址
function addAddress(req,res){
    var data=req.body;
    personModel.addAddress(data,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data[0]});
    });
}

//删除用户地址
function delAddress(req,res){
    var address_id=req.params.address_id;
    personModel.delAddress(address_id,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    });
}

//获取城市
function getCity(req,res){
    personModel.getCity(function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    });

}

//获取区列表
function getDistrict(req,res){
    var cityId=req.params.cityId;
    personModel.getDistrict(cityId,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    });

}

//获取小区列表
function getCommunity(req,res){
    var districtId=req.params.districtId;
    personModel.getCommunity(districtId,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    });

}

//获取自提点列表
function getSince(req,res){
    var districtId=req.params.districtId;
    personModel.getSince(districtId,function(err,data){
        if (!!err) {
            console.log(err);
            return res.json(500, {error: err});
        }
        return res.json(200, {results: data});
    });

}

router.get('/getAddress/:customerId/:page/:pageSize',getAddress); //获取用户所有地址
router.post('/updateAddress',updateAddress); //修改用户地址
router.post('/addAddress',addAddress); //新增用户地址
router.get('/delAddress/:address_id',delAddress); //删除用户地址

router.get('/getCity',getCity);//获取城市列表
router.get('/getDistrict/:cityId',getDistrict);//获取区列表
router.get('/getCommunity/:districtId',getCommunity);//获取小区列表
router.get('/getSince/:districtId',getSince);//获取自提点列表



module.exports = router;
