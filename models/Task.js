var mongoose = require('mongoose');


// Define our beer schema
var TaskSchema   = new mongoose.Schema({
    challengeId: String,
    taskShortName: String,
    taskLongName: String,
    taskType: Number,
    taskMultipleChoiceQuestion : String,
    taskMultipleChoiceQuestionOptions : [],
    taskMultipleSelectQuestion : String,
    taskMultipleSelectQuestionOptions : [],
    taskPhotoURL: String,
    taskVideoURL: String,
    taskQRScanCode: String,
    taskAudioURL: String,
    taskSliderQuestion: String,
    taskSliderMinValue: Number,
    taskSliderMidValue: Number,
    taskSliderMaxValue: Number,
    taskFreeTextQuestion: String,
    createdByUserId: String,
    createdOnUTC: String,
    updatedOnUTC: String,
});

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);