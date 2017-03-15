var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var bodyParser = require('body-parser');

var multipartMiddleware = multipart();

/*
    Enum Objects and Messages
*/
var StatusCodeEnum = require('./../enums/StatusCodeEnum');
var StatusMessages = require('./../enums/StatusMessages');
/*
    END
*/
/*
    DB Config Files and DTO
*/
var Dbconfig = require('./../utility/dbconfig');
var Response = require('./../dto/APIResponse');
/*
    END
*/
/*
    Models Imported
*/
var User = require('./../models/User');
var Agency = require('./../models/Agency');
var ProjectCategory = require('./../models/ProjectCategory');
var Project = require('./../models/Project');
/*
    END
*/

//URL Routes
var addProjectCategory = router.route('/addProjectCategory');

var Dbconfig = new Dbconfig(
    {
    });
// Connection URL. This is where your mongodb server is running.
var url = Dbconfig.getURL();
mongoose.connect(url, function (err, db) {
    if (err) {
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});

addProjectCategory.post(function (req, res) {
    response = new Response();
    ProjectCategory.findOne({ $and: [{ categoryName: req.body.categoryName }, { agencyId: req.body.agencyId }] }, function (err, projectCategory) {
        if (projectCategory == null) {
            Agency.findOne({ 'agencyName': req.body.agencyName }, function (err, agency) {
                if (agency == null) {
                    response.code = StatusCodeEnum.AGENCYNOTEXIST;
                    response.message = StatusMessages.AGENCYNOTEXIST;
                    response.data = projectCategory;
                    res.json(response);
                }
                else {
                    projectCategory = new ProjectCategory();
                    projectCategory.categoryName = req.body.categoryName;
                    projectCategory.agencyId = agency._id;
                    projectCategory.color = req.body.color;
                    projectCategory.save(function (err, projectCategory) {
                        response.code = StatusCodeEnum.SUCCESS;
                        response.message = StatusMessages.SUCCESS;
                        response.data = projectCategory;
                        res.json(response);
                    });
                }
            });
        }
        else {
            response.code = StatusCodeEnum.PROJECTCATEGORYEXISTS;
            response.message = StatusMessages.PROJECTCATEGORYEXISTS;
            response.data = null;
            res.json(response);
        }
    });
});
module.exports = router;
