var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
'use strict';
const nodemailer = require('nodemailer');

var multipartMiddleware = multipart();

var fs = require('fs'),
    request = require('request');

/*
    Enum Objects and Messages
*/
var UserRolesEnum = require('./../enums/UserRolesEnum');
var StatusCodeEnum = require('./../enums/StatusCodeEnum');
var StatusMessages = require('./../enums/StatusMessages');
var TaskTypenEnum = require('./../enums/TaskTypesEnum');

/*
    END
*/
/*
    DB Config Files and DTO
*/
var Dbconfig = require('./../utility/dbconfig');
var Hashedpassword = require('./../utility/hashedpassword');
var Response = require('./../dto/APIResponse');
var SecurityKey = require('./../utility/securityKey');
/*
    END
*/
/*
    Models Imported
*/
var User = require('./../models/User');
var UserCode = require('./../models/UserCode');
var Agency = require('./../models/Agency');
var ProjectCategory = require('./../models/ProjectCategory');
var Project = require('./../models/Project');
var Challenge = require('./../models/Challenge');
var Task = require('./../models/Task');
/*
    END
*/

//URL Routes
var postAddChallengeRoute = router.route('/addChallenge');
var getChallengesByProjectIdRoute = router.route('/getChallengesByProjectIdRoute');
var getChallengeByChallengeIdRoute = router.route('/getChallengeByChallengeId');

var Dbconfig = new Dbconfig(
    {
    });
var SecurityKey = new SecurityKey({

});

// Connection URL. This is where your mongodb server is running.
var url = Dbconfig.getURL();
var key = SecurityKey.getSecurityKey();

// Create an encryptor:
var encryptor = require('simple-encryptor')(key);
mongoose.connect(url, function (err, db) {
    if (err) {
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});

postAddChallengeRoute.post(multipartMiddleware, function (req, res) {
    response = new Response();
    Challenge.findOne({ challengeShortName: req.body.challengeShortName }, function (err, challenge) {
        if (challenge != null) {
            response.code = StatusCodeEnum.CHALLENGESHORTNAMEALREADYEXISTS;
            response.message = StatusMessages.CHALLENGESHORTNAMEALREADYEXISTS;
            response.data = null;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            Challenge.findOne({ challengeLongName: req.body.challengeLongName }, function (err, challenge) {
                if (challenge != null) {
                    response.code = StatusCodeEnum.CHALLENGESHORTNAMEALREADYEXISTS;
                    response.message = StatusMessages.CHALLENGESHORTNAMEALREADYEXISTS;
                    response.data = null;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    challenge = new Challenge();
                    challenge.challengeLongName = req.body.challengeLongName;
                    challenge.challengeShortName = req.body.challengeShortName;
                    challenge.challengeDescription = req.body.challengeDescription;
                    challenge.projectId = req.body.projectId;
                    challenge.createdByUserId = req.body.createdByUserId;
                    challenge.createdOnUTC = Math.floor(new Date() / 1000);
                    challenge.updatedOnUTC = Math.floor(new Date() / 1000);
                    challenge.targetMinAge = req.body.targetMinAge;
                    challenge.targetMaxAge = req.body.targetMaxAge;
                    challenge.targetGender = req.body.targetGender;
                    challenge.targetRank = req.body.targetMaxAge;
                    challenge.targetPoints = req.body.targetPoints;
                    challenge.rewardPaypallId = req.body.rewardPaypallId;
                    challenge.rewardGiftsId = req.body.rewardGiftsId;
                    challenge.rewardRafflesId = req.body.rewardRafflesId;
                    challenge.rewardsBadgesId = req.body.rewardsBadgesId;
                    challenge.rewardsVoucherId = req.body.rewardsVoucherId;
                    challenge.locationArea = req.body.locationArea;
                    challenge.locationLatititude = req.body.locationLatititude;
                    challenge.locationLongitude = req.body.locationLongitude;
                    challenge.locationGeoFencingRadius = req.body.locationGeoFencingRadius;
                    if (req.files.file != null) {
                        var extension = "";
                        if (req.files.file.headers['content-type'] == 'image/jpeg') {
                            extension = ".jpg";
                        }
                        else if (req.files.file.headers['content-type'] == 'image/png') {
                            extension = ".png";
                        }
                        var imageName = uuid.v4() + extension;
                        var fullUrl = req.protocol + '://' + req.get('host');
                        var file = "./public/" + imageName;
                        fs.readFile(req.files.file.path, function (err, data) {
                            fs.writeFile(file, data, function (err) {
                                console.log(data);
                                if (err) {
                                    res.json(err);
                                    console.log(err);
                                } else {
                                    challenge.challengePictureURL = fullUrl + "/public/images/" + imageName;
                                    challenge.save(function (err) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            response.message = StatusMessages.SUCCESS;
                                            response.code = StatusCodeEnum.SUCCESS;
                                            response.data = challenge;
                                            //response = encryptor.encrypt(response);
                                            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                                            res.json(response);
                                        }
                                    });
                                }
                            });
                        });
                    }
                    else {
                        challenge.save(function (err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                response.message = StatusMessages.SUCCESS;
                                response.code = StatusCodeEnum.SUCCESS;
                                response.data = challenge;
                                //response = encryptor.encrypt(response);
                                //console.log('obj decrypted: %j', encryptor.decrypt(response));
                                res.json(response);
                            }
                        });
                    }
                }
            });
        }
    });
});

getChallengesByProjectIdRoute.get(function (req, res) {
    response = new Response();
    Challenge.find({ projectId: req.query.projectId }, function (err, challenges) {
        if (err) {
            response.message = StatusMessages.FAILURE;
            response.code = StatusCodeEnum.FAILURE;
            response.data = null;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            response.message = StatusMessages.SUCCESS;
            response.code = StatusCodeEnum.SUCCESS;
            response.data = challenges;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
    });
});

getChallengeByChallengeIdRoute.get(function (req, res) {
    response = new Response();
    Challenge.findOne({ _id: req.query.challengeId }, function (err, challenge) {
        if (err) {
            response.message = StatusMessages.FAILURE;
            response.code = StatusCodeEnum.FAILURE;
            response.data = null;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            Task.find({ challengeId: req.query.challengeId }, function (err, tasks) {
                if (err) {
                    response.message = StatusMessages.FAILURE;
                    response.code = StatusCodeEnum.FAILURE;
                    response.data = null;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    response.message = StatusMessages.SUCCESS;
                    response.code = StatusCodeEnum.SUCCESS;
                    var obj = new Object();
                    obj.challenge = challenge;
                    obj.tasks = tasks;
                    response.data = obj;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
            });
        }
    });
});

module.exports = router;
