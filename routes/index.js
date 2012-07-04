
/*
 * GET home page.
 */
require('../models/schema.js');
var userdata = require('../models/users.js');
var   mongoose = require('mongoose');
var eauth = require('everyauth');

var db = mongoose.connect('mongodb://localhost/langy');
var langs = db.model('Lang');
var type = db.model('Type');

var user = '';

exports.index = function(req, res) {
  user = set_user(req);
  langs.find(function(err, languages) {
    res.render('index', {title: 'langy.io', lang: languages[0].title, everyauth: eauth, user: user, req: req});
  });
};

exports.add = function(req, res) {
  user = set_user(req);
  type.find(function(err, types) {
    res.render('add', {title: 'Add a Project', user: user, req: req, types: types});
  });
}

exports.add_post = function(req, res) {
  user = set_user(req);
  var doc = new langs({
    title: req.body.pname,
    desc: req.body.pdesc,
    owner: req.body.powner,
    type: req.body.ptype,
    approved: false
  });
  
  doc.save(function(err) {
    if(err) {
      console.log(err);
      res.render('error', {title: 'langy.io', user: user, req: req});
    } else {
      console.log("Saved project");
      res.render('index', {title: 'langy.io', user: user, req: req});
    }
  });
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

exports.approve = function(req, res){
  user = set_user(req);
  if(user[0] && user[0].admin == true) {
    res.render('approve', {title: 'Approve', user: user, req: req});
  } else {
    res.render('error', {title: 'langy.io', req: req});
  }
};

exports.approve_list = function(req, res) {
  langs.find({approved: false}, function(err, docs) {
    if(err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
};


exports.approve_id = function(req, res) {
  user = set_user(req);
  if(user[0].admin == true) {
    var query = { title: req.params.id }
    ,   update = { approved: true}
    ,   options = { };
    langs.update(query, update, options, function(err, numA) {
      if(err) {
        console.log(err);
        res.send(err);
      } else {
        console.log("Updated " + numA + " document(s).");
        res.send(numA);
      }
    });
  } else {
    res.render('error', {title: 'langy.io', req: req});
  }

};

function set_user(req) {
  if(req.session.auth) {
    return userdata.user_session;
  } 
  return {
    nick: "",
    admin: false
  }
}
