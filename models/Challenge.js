var mongoose = require('mongoose');


// Define our beer schema
var ChallengeSchema   = new mongoose.Schema({
    challengeLongName: String,
    challengeShortName: String,
    challengeDescription: String,
    projectId: String,
    createdByUserId: String,
    createdOnUTC: String,
    updatedOnUTC: String,
    challengeStartDate: String,
    challengeEndDate: String,
    targetMinAge: Number,
    targetMaxAge: Number,
    targetGender: String,
    targetRank: String,
    targetPoints: Number,
    rewardPaypallId: String,
    rewardGiftsId: String,
    rewardRafflesId: String,
    rewardsBadgesId: String,
    rewardsVoucherId: String,
    locationArea: String,
    locationLatititude: String,
    locationLongitude: String,
    locationGeoFencingRadius : Number,
    challengePictureURL: String
});

// Export the Mongoose model
module.exports = mongoose.model('Challenge', ChallengeSchema);