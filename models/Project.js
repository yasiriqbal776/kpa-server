var mongoose = require('mongoose');


// Define our beer schema
var ProjectSchema   = new mongoose.Schema({
    projectName: String,
    projectDescription: String,
    agencyId: String,
    categoryId: String,
    assignedToUserId: String,
    projectPictureURL: String,
    new: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Project', ProjectSchema);