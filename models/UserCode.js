var mongoose = require('mongoose');


// Define our beer schema
var UserCodeSchema   = new mongoose.Schema({
    userEmail: String,
    userId: String,
    isLinkKilled: Boolean,
    userCode: String,
    createdOnUTC: String,
    updatedOnUTC: String,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('UserCode', UserCodeSchema);