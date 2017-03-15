var mongoose = require('mongoose');

// Define our beer schema
var AgencySchema   = new mongoose.Schema({
    agencyName: String
});
// Export the Mongoose model
module.exports = mongoose.model('Agency', AgencySchema);