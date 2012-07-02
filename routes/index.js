
/*
 * GET home page.
 */
require('../models/schema.js');
var   mongoose = require('mongoose');
var eauth = require('everyauth');

var db = mongoose.connect('mongodb://localhost/langy');
var langs = db.model('Lang');

exports.index = function(req, res) {
  var user;
  if(req.session.auth) {
    user = req.session.auth.twitter.user.screen_name;
  }
  langs.find(function(err, languages) {
    res.render('index', {title: 'langy.io', lang: languages[0].title, everyauth: eauth, user: user, req: req});
  });
};

exports.finder = function(req, res){
  langs.find({'title': req.params.title}, function(err, docs) {
    if(docs) {
      res.render('index', {title: 'langy.io', lang: docs[0].title});
    } else {
      res.render('error', {title: 'langy.io'});
    }
  });
};
