var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt    = require('jsonwebtoken');
var multipart = require('connect-multiparty');

var multipartMiddleware = multipart();

var index = require('./routes/index');
var users = require('./routes/users');
var projectCategories = require('./routes/projectCategories');
var projects = require('./routes/projects');
var challenges = require('./routes/challenges');
var tasks = require('./routes/tasks');
var teamRoute = require('./routes/TeamRoute');

var User = require('./models/User');
var HashedPassword = require('./utility/hashedpassword');
var StatusMessages = require('./enums/StatusMessages');
var StatusCodeEnum = require('./enums/StatusCodeEnum');

var app = express();
app.use(cors());
var apiRoutes = express.Router(); 

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

apiRoutes.post('/authenticate', function(req, res) {
var hashedpassword = new HashedPassword();
  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
//    var validate = hashedpassword.validateHash(user.password, req.query.password);
      // check if password matches
  //    if (validate == false) {
    //    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
     // } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, "KPA", {
          expiresIn : 60*60*24
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    //}

  });
});


apiRoutes.use(multipartMiddleware,function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, "KPA", function(err, decoded) {      
      if (err) {
        return res.json({ code: StatusCodeEnum.TOKENINCORRECT, message: StatusMessages.TOKENINCORRECT,data:null });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        code: StatusCodeEnum.TOKENUNAVAILABLE,
        message: StatusMessages.TOKENUNAVAILABLE,
        data: null
    });
    
  }
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

apiRoutes.use('/users', users);
apiRoutes.use('/projectCategories',projectCategories);
apiRoutes.use('/projects',projects);
apiRoutes.use('/challenges',challenges);
apiRoutes.use('/tasks',tasks);
apiRoutes.use('/TeamRoute',teamRoute);
module.exports = app;
