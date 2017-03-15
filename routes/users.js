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

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kpatest1.@gmail.com',
        pass: 'ideofuzion'
    }
});
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
var postUserRoute = router.route('/addUser');
var postAddAdminsRoute = router.route('/addAdminsRoute');
var userLoginRoute = router.route('/login');
var postuserLoginRoute = router.route('/userLogin');
var firstTimeChangePasswordRoute = router.route('/firstTimeChangePassword');
var getPageRedirect = router.route('/pageRedirect');
var getPageControlsByRolesRoute = router.route('/getPageControlsByRoles');
var getListOfAgencyAdvancedAdminsRoute = router.route('/getListOfAgencyAdvancedAdmins');
var getListOfAdvancedAdminsRoute = router.route('/getListOfAdvancedAdmins');
var getListOfAgenciesRoute = router.route('/getListOfAgencies');

var Dbconfig = new Dbconfig(
    {
    });
    var SecurityKey = new SecurityKey({

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

var key = SecurityKey.getSecurityKey();

// Create an encryptor:
var encryptor = require('simple-encryptor')(key);

userLoginRoute.get(function (req, res) {
    var response = new Response();
    var hashedpassword = new Hashedpassword();
    var date = new Date();
    User.findOne({ 'email': req.query.email }, function (err, user) {
        if (user == null) {
            response.data = null;
            response.message = StatusMessages.DOESNOTEXIST;
            response.code = StatusCodeEnum.DOESNOTEXIST;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            var validate = hashedpassword.validateHash(user.password, req.query.password);
            if (validate == true) {
                if (user.isPasswordChangedFirstTime == false) {
                    UserCode.findOne({ $and: [{ userEmail: req.query.email }, { userCode: req.query.password }] }, function (err, userCode) {
                        if (userCode == null) {
                            response.data = null;
                            response.message = StatusMessages.INVALIDCODE;
                            response.code = StatusCodeEnum.INVALIDCODE;
                            //response = encryptor.encrypt(response);
                            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                            res.json(response);
                        }
                        else {
                            console.log(date);
                            console.log(userCode.createdOnUTC);
                            var expiryDate = Math.floor(new Date() / 1000);
                            console.log(expiryDate);
                            if ((userCode.createdOnUTC + 86400) > expiryDate) {
                                response.data = user;
                                response.message = StatusMessages.SUCCESS
                                response.code = StatusCodeEnum.SUCCESS;
                                //response = encryptor.encrypt(response);
                                //console.log('obj decrypted: %j', encryptor.decrypt(response));
                                res.json(response);
                            }
                            else {
                                response.data = null;
                                response.message = StatusMessages.LINKEXPIRED;
                                response.code = StatusCodeEnum.LINKEXPIRED;
                                //response = encryptor.encrypt(response);
                                //console.log('obj decrypted: %j', encryptor.decrypt(response));
                                res.json(response);
                            }
                        }
                    });
                }
            }
            else {
                response.data = null;
                response.message = StatusMessages.INCORRECTPASSWORD;
                response.code = StatusCodeEnum.INCORRECTPASSWORD;
                //response = encryptor.encrypt(response);
                //console.log('obj decrypted: %j', encryptor.decrypt(response));
                res.json(response);
            }
        }
    });
});
postUserRoute.post(function (req, res) {
    var response = new Response();
    var user = new User();
    var date = new Date();
    var hashedpassword = new Hashedpassword();
    //Checking If User is already in the db or not
    User.findOne({ 'email': req.body.email, 'channel': req.body.channel }
        , function (err, existingUser) {
            if (err)
                res.send(err);
            else {
                if (existingUser == null) {
                    /*
                        populating values from POST request to Object and saving in the db
                    */
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.email = req.body.email;
                    //Channel is used for the medium used by the user e.g (facebook, email, google, instagram)
                    user.channel = req.body.channel;
                    user.age = req.body.age;
                    //User Roles are defined in the User Role Enum
                    user.role = req.body.role;
                    user.gender = req.body.gender;
                    user.latLocation = req.body.latLocation;
                    user.longLocation = req.body.longLocation;
                    user.deviceInfo = req.body.deviceInfo;
                    user.createdOnUTC = date;
                    user.updatedOnUTC = date;
                    user.isDeleted = false;
                    //Hashing the Password
                    user.password = hashedpassword.createHash(req.body.password);
                    //saving user object in db
                    user.save(function (err) {
                        //Getting the Server URL
                        var fullUrl = req.protocol + '://' + req.get('host');
                        if (req.body.pictureUrl !== undefined) {
                            //Calling Function for Saving picture from URL after saving the user in db
                            downloadPictureFromURL(req.body.pictureUrl, user._id, fullUrl, function () {
                                response.code = StatusCodeEnum.SUCCESS;
                                response.data = user;
                                response.message = StatusMessages.SUCCESS;
                                //response = encryptor.encrypt(response);
                                //console.log('obj decrypted: %j', encryptor.decrypt(response));
                                res.json(response);
                            });
                        }
                        else {
                            response.code = StatusCodeEnum.SUCCESS;
                            response.data = user;
                            response.message = StatusMessages.SUCCESS;
                            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                            res.json(response);
                        }

                    });
                }
                else {
                    response.code = StatusCodeEnum.FAILURE;
                    response.data = existingUser;
                    response.message = StatusMessages.USEREXISTS;
                    //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
            }
        });
});
var downloadPictureFromURL = function (uri, filename, fullUrl, callback) {
    request.head(uri, function (err, res, body) {
        var extension = "";

        if (res.headers['content-type'] == 'image/jpeg') {
            extension = ".jpg";
        }
        else if (res.headers['content-type'] == 'image/png') {
            extension = ".png";
        }
        //giving a unique name to the picture
        var imageName = uuid.v4() + extension;
        //Updating User Picture Server URL
        User.findById(filename, function (err, retrievedUser) {
            if (!retrievedUser)
                console.log("Couldnt Updated");
            else {
                // do your updates here
                retrievedUser.pictureUrl = fullUrl + "/images/" + imageName;

                retrievedUser.save(function (err) {
                    if (err)
                        console.log('error')
                    else
                        console.log('success')
                });
            }
        });
        request(uri).pipe(fs.createWriteStream("./public/images/" + imageName)).on('close', callback);
    });
};

postAddAdminsRoute.post(function (req, res) {
    var authorised = true;
    response = new Response();
    var hashedpassword = new Hashedpassword();
    User.findOne({ 'email': req.body.email }, null, { sort: { '_id': -1 } }, function (err, user) {
        if (user != null) {
            response.data = null;
            response.message = StatusMessages.USEREXISTS;
            response.code = StatusCodeEnum.USERALREADYEXISTS;
            //response = encryptor.encrypt(response);
            console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            User.findOne({ '_id': req.body.createdByUserId }, null, { sort: { '_id': -1 } }, function (err, createdByUser) {
                if (err) {
                    response.data = err;
                    response.message = StatusMessages.FAILURE;
                    response.code = StatusCodeEnum.FAILURE;
                    //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                    res.json(response);
                }
                else {
                    var user = new User();
                    user.userDisplayName = req.body.userDisplayName;
                    user.isPasswordChangedFirstTime = false;
                    user.email = req.body.email;
                    user.password = hashedpassword.createHash(req.body.password);
                    user.createdOnUTC = Math.floor(new Date() / 1000);
                    user.updatedOnUTC = Math.floor(new Date() / 1000);
                    if (req.body.userToBeCreatedRole == UserRolesEnum.ADVANCEDADMIN) {
                        if (createdByUser.role != UserRolesEnum.SUPERADMIN) {
                            response.data = null;
                            response.message = StatusMessages.NOTAUTHORISED;
                            response.code = StatusCodeEnum.NOTAUTHORISED;
                            authorised = false;
                            //response = encryptor.encrypt(response);
                            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                            res.json(response);
                        }
                        else {
                            user.role = UserRolesEnum.ADVANCEDADMIN;
                        }
                    }
                    else if (req.body.userToBeCreatedRole == UserRolesEnum.SUPERAGENCYADMIN) {
                        if (createdByUser.role == UserRolesEnum.SUPERADMIN || createdByUser.role == UserRolesEnum.ADVANCEDADMIN) {
                            user.role = UserRolesEnum.SUPERAGENCYADMIN;
                            user.agencyName = req.body.agencyName;
                        }
                        else {
                            response.data = null;
                            response.message = StatusMessages.NOTAUTHORISED;
                            response.code = StatusCodeEnum.NOTAUTHORISED;
                            authorised = false;
                            //response = encryptor.encrypt(response);
                            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                            res.json(response);
                        }

                    }
                    else if (req.body.userToBeCreatedRole == UserRolesEnum.ADVANCEDAGENCYADMIN) {
                        if (createdByUser.role != UserRolesEnum.SUPERAGENCYADMIN) {
                            response.data = null;
                            response.message = StatusMessages.NOTAUTHORISED;
                            response.code = StatusCodeEnum.NOTAUTHORISED;
                            authorised = false;
                            //response = encryptor.encrypt(response);
                            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                            res.json(response);
                        }
                        else {
                            user.role = UserRolesEnum.ADVANCEDAGENCYADMIN;
                            user.agencyName = req.body.agencyName;
                        }
                    }
                    if (authorised == true) {
                        user.save(function (err, savedUser) {
                            response.code = StatusCodeEnum.SUCCESS;
                            response.message = StatusMessages.SUCCESS;
                            response.data = savedUser;
                            var userCode = new UserCode();
                            userCode.userEmail = savedUser.email;
                            userCode.userId = savedUser._id;
                            userCode.createdOnUTC = Math.floor(new Date() / 1000);
                            userCode.updatedOnUTC = Math.floor(new Date() / 1000);
                            userCode.isLinkKilled = false;
                            var fullUrl = req.protocol + '://' + req.get('host');
                            userCode.userCode = Math.floor(Math.random() * 900000) + 100000;
                            //var invitationFunction = "/users/login?email=" + user.email + "&password=" + userCode.userCode;
                            var invitationFunction = "http://kpaweb.azurewebsites.net/#/email-user?email=" + user.email + "&userCode=" + userCode.userCode;
                            //fullUrl = fullUrl + invitationFunction;
                            var text = 'Your Invitation Link is  : ' + invitationFunction;
                            let mailOptions = {
                                from: '"KPA Team" <kpatest1@gmail.com>', // sender address
                                to: user.email, // list of receivers
                                subject: 'Invitation Link', // Subject line
                                text: text, // plain text body
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    response.code = StatusCodeEnum.FAILURE;
                                    response.message = StatusMessages.FAILURE;
                                    response.data = error;
                                    //res.json(response);
                                }
                                //console.log('Message %s sent: %s', info.messageId, info.response);
                                userCode.save(function (err, userCode) {
                                    user.password = hashedpassword.createHash(userCode.userCode);
                                    user.save(function (err, user) {
                                        response.code = StatusCodeEnum.SUCCESS;
                                        response.message = StatusMessages.SUCCESS;
                                        response.data = user;
                                        if (user.role == UserRolesEnum.SUPERAGENCYADMIN) {
                                            var agency = new Agency();
                                            agency.agencyName = req.body.agencyName;
                                            agency.save(function (err, agency) {
                                            })
                                        }
                                        //response = encryptor.encrypt(response);
                                        //console.log('obj decrypted: %j', encryptor.decrypt(response));
                                        res.json(response);
                                    });
                                });
                            });
                        });
                    }
                }
            });
        }
    });
});

firstTimeChangePasswordRoute.post(function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var hashedpassword = new Hashedpassword();
    response = new Response();
    User.findOne({ 'email': req.body.email }, function (err, user) {
        if (user == null) {
            response.data = null;
            response.message = StatusMessages.DOESNOTEXIST;
            response.code = StatusCodeEnum.DOESNOTEXIST;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            user.password = hashedpassword.createHash(req.body.password);;
            user.firstTimeChangePasswordRoute = true;
            user.save(function (err, user) {
                response.data = user;
                response.message = StatusMessages.SUCCESS
                response.code = StatusCodeEnum.SUCCESS;
                //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                res.json(response);
            });
        }
    });
});


postuserLoginRoute.post(function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var response = new Response();
    var hashedpassword = new Hashedpassword();
    User.findOne({ 'email': email }, function (err, user) {
        if (user == null) {
            response.data = null;
            response.message = StatusMessages.DOESNOTEXIST;
            response.code = StatusCodeEnum.DOESNOTEXIST;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            var validate = hashedpassword.validateHash(user.password, req.body.password);
            if (validate == true) {
                response.data = user;
                response.message = StatusMessages.SUCCESS
                response.code = StatusCodeEnum.SUCCESS;
                //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                res.json(response);
            }
            else {
                response.data = null;
                response.message = StatusMessages.INCORRECTPASSWORD;
                response.code = StatusCodeEnum.INCORRECTPASSWORD;
                //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
                res.json(response);
            }
        }
    });
});

getPageRedirect.get(function (req, res) {
    return res.redirect('http://www.google.com');
});

getPageControlsByRolesRoute.get(function (req, res) {
    var userRole = req.query.userRole;
    var jsonfile = require('jsonfile');
    var fullUrl = req.protocol + '://' + req.get('host');
    var file = "./public/roles.json";
    var objectsToSend = [];
    jsonfile.readFile(file, function (err, objArray) {
        if (err) {
            console.log(err);
            res.json(err);
        }
        else {
            for (var i = 0; i < objArray.length; i++) {
                objArray[i].userRoles.forEach(function (element) {
                    if (element.userRole == userRole) {
                        var objToSend = new Object();
                        objToSend.Name = objArray[i].Name;
                        objToSend.fontAwesomeHTML = objArray[i].fontAwesomeHTML;
                        objToSend.RouterLink = objArray[i].RouterLink;
                        objToSend.parent_Id = objArray[i].parent_Id;
                        objToSend.id = objArray[i].id;
                        objectsToSend.push(objToSend);
                    }
                }, this);
            }
            var parentElements = [];
            objectsToSend.forEach(function (element) {
                if (element.parent_Id == 0) {
                    element.childElements = [];
                    parentElements.push(element);
                }
            }, this);
            console.log(parentElements);
            objectsToSend.forEach(function (element) {
                if (element.parent_Id != 0) {
                    parentElements.forEach(function (parentElement) {
                        if (element.parent_Id == parentElement.id) {
                            parentElement.childElements.push(element);
                            console.log(parentElement.Name);
                            console.log(element.Name);
                        }
                    }, this);
                }
            }, this);
            console.log(parentElements);
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(parentElements);
        }
    });
});

getListOfAgencyAdvancedAdminsRoute.get(function (req, res) {
    response = new Response();
    User.find({ $and: [{ agencyName: req.query.agencyName }, { role: UserRolesEnum.ADVANCEDAGENCYADMIN }] }, function (err, agencyAdvancedAdmins) {
        if (err) {
            response.data = null;
            response.code = StatusCodeEnum.FAILURE;
            response.message = StatusMessages.FAILURE;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            response.data = agencyAdvancedAdmins;
            response.code = StatusCodeEnum.SUCCESS;
            response.message = StatusMessages.SUCCESS;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
    });
});

getListOfAdvancedAdminsRoute.get(function (req, res) {
    response = new Response();
    User.find({ role: UserRolesEnum.ADVANCEDADMIN }, function (err, advancedAdmins) {
        if (err) {
            response.data = null;
            response.code = StatusCodeEnum.FAILURE;
            response.message = StatusMessages.FAILURE;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            response.data = advancedAdmins;
            response.code = StatusCodeEnum.SUCCESS;
            response.message = StatusMessages.SUCCESS;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
    });
});

getListOfAgenciesRoute.get(function (req, res) {
    response = new Response();
    Agency.find({}, function (err, agencies) {
        if (err) {
            response.data = null;
            response.code = StatusCodeEnum.FAILURE;
            response.message = StatusMessages.FAILURE;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
        else {
            response.data = agencies;
            response.code = StatusCodeEnum.SUCCESS;
            response.message = StatusMessages.SUCCESS;
            //response = encryptor.encrypt(response);
            //console.log('obj decrypted: %j', encryptor.decrypt(response));
            res.json(response);
        }
    });
});

module.exports = router;
