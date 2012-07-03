
/*
 * GET home page.
 */
require('../models/schema.js');
var   mongoose = require('mongoose');
var eauth = require('everyauth');

var db = mongoose.connect('mongodb://localhost/langy');
var langs = db.model('Lang');

var user = '';

exports.index = function(req, res) {
  if(req.session.auth) {
      user = req.session.auth.twitter.user.screen_name;
  }
  langs.find(function(err, languages) {
    res.render('index', {title: 'langy.io', lang: languages[0].title, everyauth: eauth, user: user, req: req});
  });
};

exports.add = function(req, res) {
  if(req.session.auth) {
      user = req.session.auth.twitter.user.screen_name;
  }
  res.render('add', {title: 'Add a Project', user: user, req: req});
}

exports.add_post = function(req, res) {
  if(req.session.auth) {
    user = req.session.auth.twitter.user.screen_name;
  }
  var doc = {
    title: req.body.pname,
    approved: false
  }
  res.send(doc);
  //res.render('add', {title: 'Add a Project', user: user, req: req});
}


exports.finder = function(req, res){
  langs.find({'title': req.params.title}, function(err, docs) {
    if(docs && docs[0].title) {
      res.render('index', {title: 'langy.io', lang: docs[0].title});
    } else {
      res.render('error', {title: 'langy.io'});
    }
  });
};

//exports.deauth
