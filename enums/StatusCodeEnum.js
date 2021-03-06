var StatusCodeEnum = {
    SUCCESS: 200,
    FAILURE: 400,
    USERALREADYEXISTS: 300,
    NOTAUTHORISED: 500,
    INCORRECTPASSWORD: 600,
    INVALIDCODE: 700,
    LINKEXPIRED: 800,
    DOESNOTEXIST:  900,
    PROJECTCATEGORYEXISTS: 1000,
    CHALLANGECATEGORYEXISTS: 1100,
    AGENCYNOTEXIST: 1200,
    PROJECTALREADYEXIST: 1300,
    CHALLENGESHORTNAMEALREADYEXISTS: 1400,
    CHALLENGELONGNAMEALREADYEXISTS: 1500,
    TASKSHORTNAMEALREADYEXIST: 1600,
    TASKLONGNAMEALREADYEXIST: 1700,
    TOKENUNAVAILABLE: 1800,
    TOKENINCORRECT: 1900,
    PROJECTCANNOTBEDELETEDCHALLENGEEXIST: 2000
};

module.exports = StatusCodeEnum;