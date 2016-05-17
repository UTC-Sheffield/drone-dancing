var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/land', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/take off', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/play', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/pause', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
