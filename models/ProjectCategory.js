var mongoose = require('mongoose');

// Define our beer schema
var ProjectCategorySchema   = new mongoose.Schema({
    categoryName: String,
    agencyId: String,
    color: String
});
// Export the Mongoose model
module.exports = mongoose.model('ProjectCategory', ProjectCategorySchema);