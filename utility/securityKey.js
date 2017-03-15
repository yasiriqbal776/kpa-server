var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var securityKey = function Constructor() {

};


securityKey.prototype.getSecurityKey = function () {
    var key = 'KP@096IDE0FUZI0N762';
    return key;
};

/**
 * Created by Tauqeer on 11-08-2016.
 */

module.exports = securityKey;