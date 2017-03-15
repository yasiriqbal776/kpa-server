var mongoose = require('mongoose');


// Define our beer schema
var UserSchema   = new mongoose.Schema({
    userDisplayName: String,
    isPasswordChangedFirstTime: Boolean,
    email: String,
    password: String,
    role:String,
    createdOnUTC: String,
    updatedOnUTC: String,
    isDeleted: Boolean,
    agencyName: String
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);