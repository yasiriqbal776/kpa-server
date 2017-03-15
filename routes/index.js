var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var data = Math.floor(new Date() / 1000);
  //res.render('index', { title: 'Express' });
  res.json("Time is "+data);
});

module.exports = router;
