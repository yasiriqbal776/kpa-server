var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');

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
var postAddTaskRoute = router.route('/addTask');
var getTasksByChallengeIdRoute = router.route('/getTasksByChallengeId');
var getTaskByTaskIdRoute = router.route('/getTaskByTaskId');

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

postAddTaskRoute.post(function (req, res) {
    response = new Response();
    Task.findOne({ taskShortName: req.body.taskShortName }, function (err, task) {
        if (task != null) {
            response.code = StatusCodeEnum.TASKSHORTNAMEALREADYEXIST;
            response.message = StatusMessages.TASKSHORTNAMEALREADYEXIST;
            response.data = null;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            Task.findOne({ taskLongName: req.body.taskLongName }, function (err, task) {
                if (task != null) {
                    response.code = StatusCodeEnum.TASKLONGNAMEALREADYEXIST;
                    response.message = StatusMessages.TASKLONGNAMEALREADYEXIST;
                    response.data = null;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    task = new Task();
                    task.challengeId = req.body.challengeId;
                    task.taskShortName = req.body.taskShortName;
                    task.taskLongName = req.body.taskLongName;
                    task.taskType = req.body.taskType;
                    task.createdByUserId = req.body.createdByUserId;
                    task.createdOnUTC = Math.floor(new Date() / 1000);
                    task.updatedOnUTC = Math.floor(new Date() / 1000);
                    task.taskMultipleChoiceQuestion = req.body.taskMultipleChoiceQuestion;
                    task.taskMultipleSelectQuestionOptions = req.body.taskMultipleSelectQuestionOptions;
                    task.taskQRScanCode = req.body.taskQRScanCode;
                    task.taskSliderQuestion = req.body.taskSliderQuestion;
                    task.taskSliderMinValue = req.body.taskSliderMinValue;
                    task.taskSliderMidValue = req.body.taskSliderMidValue;
                    task.taskSliderMaxValue = req.body.taskSliderMaxValue;
                    task.taskSliderFreeTextQuestion = req.body.taskSliderFreeTextQuestion;
                    task.save(function (err) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            response.message = StatusMessages.SUCCESS;
                            response.code = StatusCodeEnum.SUCCESS;
                            response.data = task;
                            //response = encryptor.encrypt(response);
                            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                            res.json(response);
                        }
                    });
                }
            });
        }
    });
});

getTasksByChallengeIdRoute.get(function (req, res) {
    response = new Response();
    Task.find({ challengeId: req.query.challengeId }, function (err, tasks) {
        if (err) {

        }
        else {
            response.message = StatusMessages.SUCCESS;
            response.code = StatusCodeEnum.SUCCESS;
            response.data = tasks;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
    });
});

getTaskByTaskIdRoute.get(function(req,res){
    response = new Response();
    Task.findOne({ _id: req.query.taskId }, function (err, task) {
        if(err)
        {

        }
        else
        {
            response.message = StatusMessages.SUCCESS;
            response.code = StatusCodeEnum.SUCCESS;
            response.data = task;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
    });
});

module.exports = router;
