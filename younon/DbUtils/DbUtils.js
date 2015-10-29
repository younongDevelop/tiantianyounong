/**
 * Created by wei on 15/9/29.
 */
/**
 * Created by James on 2015/3/9.
 */

var express = require('express');
var db = require('mysql');

module.exports = function() {
    this.pool = db.createPool({
        //host: 'localhost',
        //host: '120.131.66.174',
        //user: 'cartdbuser',
        //password: 'cart@2014',
        //database:'yonong',
        host: '120.131.70.188',
        user: 'root',
        password: 'pass99',
        database:'younong',
        port: 3306
    });

    /*this.pool = db.createPool({
     host: '192.168.0.138',
     user: 'root',
     password: 'pass99',
     database:'shop',
     port: 3306
     });*/

    this.getPool = function() {
        return this.pool;
    };

    this.query = function(sql, next) {
        this.pool.getConnection(function (err, conn) {
            conn.query(sql,function(err,rows){
                if (err) console.log(err);
                conn.release();
                return rows;
            });
        });
    };
};
