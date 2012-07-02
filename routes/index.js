
/*
 * GET home page.
 */
require('../models/schema.js');
var   mongoose = require('mongoose')
    , eauth = require('everyauth');

var db = mongoose.connect('mongodb://localhost/langy');
var langs = db.model('Lang');

exports.index = function(req, res){
  langs.find(function(err, languages) {
    res.render('index', {title: 'langy.io', lang: languages[0].title, eauth: eauth});
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
