//Team for chalenges manage by Agency
var mongoose = require('mongoose');
var TeamSchema=new mongoose.Schema({
    teamName:{type : String},
    teamDescription:{type:String},
    teamDisplayPicture:{type:String},
    teamCreatedByUser:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teamMembers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdOnUTC:  { type: Date, default: Date.now }
});


// Export the Mongoose model
module.exports = mongoose.model('Team', TeamSchema);