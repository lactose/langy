
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
    res.render('index', {title: 'langy.io', everyauth: eauth, user: user, req: req});
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
      console.log(doc);
      console.log("Saved project");
      res.render('index', {title: 'langy.io', user: user, req: req, note: 'Project submitted'});
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
    res.render('error', {title: 'langy.io', req: req, user: user});
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

exports.langies = function(req, res) {
  user = set_user(req);
  langs.find({approved: true}, function(err, docs) {
    if(err) {
      res.render('error', {title: 'Woopsy', req: req, user: user});
    } else {
      res.render('langies', {title: 'Projects', req: req, user: user, langs: docs});
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
    res.render('error', {title: 'Not admin user', req: req});
  }

};
exports.vote_lang = function(req, res) {
  vote(req, res, langs);
};
exports.vote_comment = function(req, res) {

};
exports.vote_tutorial = function(req, res) {

};
exports.disapprove_id = function(req, res) {
  user = set_user(req);
  if(user[0].admin == true) {
    var query = { title: req.params.id };
    langs.remove(query, function(err, result) {
      if(err) {
        console.log(err);
        res.send(err);
      } else {
        console.log("Deleted " + result + " document(s).");
        res.send(result);
      }
    });
  } else {
    res.render('error', {title: 'Not admin user', req: req});
  }
};

function set_user(req) {
  if(req.session.auth) {
    return userdata.user_session;
  } 
  return [{
    nick: "",
    admin: false
  }]
}

function vote(req, res, obj) {
  user = set_user(req);
  if(req.session.auth) {
    var query = { title: req.params.id, voters: { '$ne': user[0].nick }}
    ,   update = {'$push' : {'voters': user[0].nick }, '$inc': {votes: 1}}
    ,   options = {};
    obj.update(query, update, options, function(err, numA) {
      if(err) {
        console.log(err);
        res.send(err);
      } else {
        console.log("Vote logged");
        res.send(numA);
      }
   });
  } else {
    res.send([{}]);
  }

}
