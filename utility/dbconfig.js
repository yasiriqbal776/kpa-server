var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var dbconfig = function Constructor() {

};


dbconfig.prototype.getURL = function () {
    // Connection URL. This is where your mongodb server is running.
    var url = 'mongodb://kpadev:abcd1234@ds137759.mlab.com:37759/kpadev';
    return url;
};

/**
 * Created by Tauqeer on 11-08-2016.
 */

module.exports = dbconfig;