var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

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
    Models Imported
*/
var User = require('./../models/User');
var UserCode = require('./../models/UserCode');
var Agency = require('./../models/Agency');
var ProjectCategory = require('./../models/ProjectCategory');
var Project = require('./../models/Project');
var Challenge = require('./../models/Challenge');
var Task = require('./../models/Task');
var Team = require('./../models/Team');
/*
    END
*/
//URL Routes
var postNewTeam = router.route('/newTeam');
var postAllUsers = router.route('/getAllUsers')

//Db Configs
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


//All FUnctions 

postNewTeam.post(function (req, res) {
    console.log("Successfully in response");
    response = new Response();
    teamObj = new Team();
    teamObj.teamName = req.body.teamName;
    teamObj.teamCreatedByUser = req.body.teamCreatedByUser;
    teamObj.teamDisplayPicture = req.body.teamDisplayPicture;
    teamObj.save();
    response.code = StatusCodeEnum.SUCCESS;
    response.message = StatusMessages.SUCCESS;
    response.data = teamObj;
    res.json(response);
});

postAllUsers.post(function (req, res) {
    //here we will get all users of one Agency
    var userList = [];
    var agenyId=req.body.agencyName;
    console.log(agenyId)
    for (var i = 0; i < 10; i++) {
        var userObj = new Object();
        userObj.userName = "Sajjad1" + (i + 1);
        userObj.userAge = Math.random() * (65 - 18) + 18;
        userObj.userGender = "male";
        userObj.userScore = Math.random() * (1000 - 1) + 1;
        userObj.userNationality = "pakistan";
        userObj.userRank = Math.random() * (7 - 1) + 1;
        userObj.location = "Kowait capital";
        userList.push(userObj);
    }//end of for lop
    response = new Response();
    response.code = StatusCodeEnum.SUCCESS;
    response.message = StatusMessages.SUCCESS;
    response.data = userList;
    res.json(response);
});

module.exports = router;
