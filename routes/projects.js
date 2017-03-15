var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var multipart = require('connect-multiparty');

var multipartMiddleware = multipart();

var fs = require('fs'),
    request = require('request');

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
/*
    END
*/

var postAddProjectRoute = router.route('/addProject');
var getProjectCategoriesForAgencyRoute = router.route('/getProjectCategoriesForAgency');
var getListOfProjectsForAgencyRoute = router.route('/getListOfProjectsForAgency');
var getProjectByProjectIdRoute = router.route('/getProjectByProjectId');
var getDeleteProjectByProjectIdRoute = router.route('/deleteProjectByProjectId');
var postUpdateProjectRoute = router.route('/updateProject');

var Dbconfig = new Dbconfig(
    {
    });
var SecurityKey = new SecurityKey({

});
// Connection URL. This is where your mongodb server is running.
var url = Dbconfig.getURL();
var key = SecurityKey.getSecurityKey();

postAddProjectRoute.post(multipartMiddleware, function (req, res) {
    var agencyName = req.body.agencyName;
    response = new Response();
    Agency.findOne({ 'agencyName': req.body.agencyName }, function (err, agency) {
        if (agency == null) {
            response.data = null;
            response.code = StatusCodeEnum.AGENCYNOTEXIST;
            response.message = StatusMessages.AGENCYNOTEXIST;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            Project.findOne({ $and: [{ projectName: req.body.projectName }, { agencyId: agency._id }] }, function (err, project) {
                if (project != null) {
                    response.data = null;
                    response.code = StatusCodeEnum.PROJECTALREADYEXIST;
                    response.message = StatusMessages.PROJECTALREADYEXIST;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    project = new Project();
                    project.projectName = req.body.projectName;
                    project.projectDescription = req.body.projectDescription;
                    project.agencyId = agency._id;
                    project.categoryId = req.body.categoryId;
                    project.assignedToUserId = req.body.assignedToUserId;
                    project.new = true;
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
                        //var file = __dirname + "./../public/images/" + imageName;
                        var file = __dirname + "./../public/images/" + imageName;
                        fs.readFile(req.files.file.path, function (err, data) {
                            fs.writeFile(file, data, function (err) {
                                console.log(data);
                                if (err) {
                                    res.json(err);
                                    console.log(err);
                                } else {
                                    //project.projectPictureURL = fullUrl + "/images/" + imageName;
                                    project.projectPictureURL = file;
                                    project.save(function (err) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            response.message = StatusMessages.SUCCESS;
                                            response.code = StatusCodeEnum.SUCCESS;
                                            response.data = project;
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
                        project.save(function (err, project) {
                            if (err) {

                            }
                            else {
                                response.data = project;
                                response.code = StatusCodeEnum.SUCCESS;
                                response.message = StatusMessages.SUCCESS;
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

getProjectCategoriesForAgencyRoute.get(function (req, res) {
    var response = new Response();
    Agency.findOne({ 'agencyName': req.query.agencyName }, function (err, agency) {
        if (agency == null) {
            response.code = StatusCodeEnum.AGENCYNOTEXIST;
            response.message = StatusMessages.AGENCYNOTEXIST;
            response.data = null;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            ProjectCategory.find({ 'agencyId': agency._id }, function (err, projectCategories) {
                response.code = StatusCodeEnum.SUCCESS;
                response.message = StatusMessages.SUCCESS;
                response.data = projectCategories;
                //response = encryptor.encrypt(response);
                //console.log('obj decrypted: %j', encryptor.decrypt(response));
                res.json(response);
            });
        }
    });
});

getListOfProjectsForAgencyRoute.get(function (req, res) {
    response = new Response();
    Agency.findOne({ agencyName: req.query.agencyName }, function (err, agency) {
        if (agency == null) {
            response.data = null;
            response.code = StatusCodeEnum.AGENCYNOTEXIST;
            response.message = StatusMessages.AGENCYNOTEXIST;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            Project.find({ agencyId: agency._id }, function (err, projects) {
                if (err) {
                    response.data = null;
                    response.code = StatusCodeEnum.FAILURE;
                    response.message = StatusMessages.FAILURE;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    response.data = projects;
                    response.code = StatusCodeEnum.SUCCESS;
                    response.message = StatusMessages.SUCCESS;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
            });
        }
    });
});

getProjectByProjectIdRoute.get(function (req, res) {
    response = new Response();
    Project.findOne({ _id: req.query.projectId }, function (err, project) {
        if (err) {
            response.data = null;
            response.code = StatusCodeEnum.FAILURE;
            response.message = StatusMessages.FAILURE;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            response.data = project;
            response.code = StatusCodeEnum.SUCCESS;
            response.message = StatusMessages.SUCCESS;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
    });
});

getDeleteProjectByProjectIdRoute.get(function (req, res) {
    response = new Response();
    Challenge.find({ projectId: req.query.projectId }, function (err, challenges) {
        if (challenges != null && challenges.length > 0) {
            response.code = StatusCodeEnum.PROJECTCANNOTBEDELETEDCHALLENGEEXIST;
            response.message = StatusMessages.PROJECTCANNOTBEDELETEDCHALLENGEEXIST;
            response.data = null;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            Project.findByIdAndRemove(req.query.projectId, function (err, project) {
                if (err) {
                    response.code = StatusCodeEnum.FAILURE;
                    response.message = StatusMessages.FAILURE;
                    response.data = project;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    response.code = StatusCodeEnum.SUCCESS;
                    response.message = StatusMessages.SUCCESS;
                    response.data = null;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
            });
        }
    });
});

postUpdateProjectRoute.post(multipartMiddleware, function (req, res) {
    response = new Response();
    Project.findById(req.body.projectId, function (err, project) {
        if (err) {

        }
        else {
            Project.findOne({ projectName: req.body.projectName }, function (err, projectWithSameName) {
                if (projectWithSameName != null) {
                    response.data = null;
                    response.code = StatusCodeEnum.PROJECTALREADYEXIST;
                    response.message = StatusMessages.PROJECTALREADYEXIST;
                    //response = encryptor.encrypt(response);
                    //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    project.projectName = req.body.projectName || project.projectName;
                    project.categoryId = req.body.categoryId || project.categoryId;
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
                        var file = __dirname + "./../public/images/" + imageName;
                        fs.readFile(req.files.file.path, function (err, data) {
                            fs.writeFile(file, data, function (err) {
                                console.log(data);
                                if (err) {
                                    res.json(err);
                                    console.log(err);
                                } else {
                                    project.projectPictureURL = fullUrl + "/images/" + imageName;
                                    project.save(function (err) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            response.message = StatusMessages.SUCCESS;
                                            response.code = StatusCodeEnum.SUCCESS;
                                            response.data = project;
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
                        project.save(function (err, project) {
                            if (err) {

                            }
                            else {
                                response.data = project;
                                response.code = StatusCodeEnum.SUCCESS;
                                response.message = StatusMessages.SUCCESS;
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

module.exports = router;
