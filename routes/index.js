/*--------------------------------*\
 * index of routes
 * -------------------------------*/

require('../models/schema.js');
var userdata = require('../models/users.js');
var mongoose = require('mongoose');
var fs = require('fs');
var eauth = require('everyauth');
var appConfig = JSON.parse(fs.readFileSync(__dirname + '/../config/app.json', 'UTF-8'))

var db = mongoose.connect('mongodb://' + appConfig.DB_SERVER + '/langy');
var   langs = db.model('Lang')
    , type = db.model('Type')
    , comments = db.model('Comment')
    , tutorials = db.model('Tutorial')
    , users = db.model('User');

var user = '';
var nobody = { nick: '', admin: false}

exports.index = function(req, res) {
  user = get_user(req);
  res.render('index', {
      title: 'langy.io'
    , user: user 
    , req: req
  });
};

exports.add = function(req, res) {
  user = get_user(req);
  type.find(function(err, types) {
    res.render('add', {
        title: 'Add a Project'
      , user: user
      , req: req
      , types: types
    });
  });
}

exports.add_post = function(req, res) {
  user = get_user(req);
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
      res.render('error', {
          title: 'langy.io'
        , user: user
        , req: req
      });
    } else {
      console.log(doc);
      res.render('index', {
          title: 'langy.io'
        , user: user
        , req: req
        , note: 'Project submitted'
      });
    }
  });
}


exports.finder = function(req, res){
  user = get_user(req);
  langs.find({'title': req.params.title}, function(err, docs) {
    console.log(docs);
    if(err || docs.length == 0) {
      res.render('error', {
          title: 'langy.io'
        , req: req
        , user: user
      });
    } else {
      res.render('lang', {
          title: docs.title
        , req: req
        , user: user
        , lang: docs[0]
      });
    }
  });
};

exports.approve = function(req, res){
  user = get_user(req);
  set_user(req, function(err, dbuser) {
    if(dbuser.admin == true) {
      res.render('approve', {
          title: 'Approve'
        , user: user
        , req: req
      });
    } else {
      res.render('error', {
          title: 'langy.io'
        , req: req
        , user: user
      });
    }
  });
};

exports.approve_list = function(req, res) {
  set_user(req, function(err, user) {
    if(user.admin == true) {
      langs.find({approved: false}, function(error, docs) {
        if(error) {
          res.send(error);
        } else {
          res.send(docs);
        }
      });
    } else {
      res.render('error', {
          title: 'Insufficient privileges!'
        , req: req
        , user: user
      });
    }
  });
};

exports.lang_list = function(req, res) {
  var query = langs.find({approved: true});
  query.sort('votes', -1);
  query.exec(function(err, docs) {
    if(err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
};


exports.langies = function(req, res) {
  user = get_user(req);
  res.render('langies', {title: 'Projects', req: req, user: user});
};


exports.approve_id = function(req, res) {
  set_user(req, function(err, user) {
    if(user.admin == true) {
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
      res.render('error', {title: 'Not admin user', req: req, user: user});
    }
  });
};
exports.vote_lang = function(req, res) {
  vote(req, res, langs);
};
exports.vote_comment = function(req, res) {
  vote(req, res, comments);
};
exports.vote_tutorial = function(req, res) {
  vote(req, res, tutorials);
};
exports.disapprove_id = function(req, res) {
  set_user(req, function(err, user) {
    if(user.admin == true) {
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
      res.render('error', {title: 'Not admin user', req: req, user: user});
    }
  });
};

function set_user(req, callback) {
  if(req.loggedIn) {
    users.find({userid: req.session.auth.twitter.user.id_str}, function(err, docs) {
      callback(err, docs[0]);
    });
  } else {
    callback("",  {
      nick: "",
      admin: false
    });
  }
}

function get_user(req) {
  if(req.loggedIn) {
    return req.session.auth.twitter.user;
  } 
  return {
      nick: ""
    , admin: false
  }
}

function vote(req, res, obj) {
  user = get_user(req);
  if(req.session.auth) {
    var query = { title: req.params.id, voters: { '$ne': user.screen_name }}
    ,   update = {'$push' : {'voters': user.screen_name }, '$inc': {votes: 1}}
    ,   options = {};
    obj.update(query, update, options, function(err, numA) {
      if(err) {
        console.log(err);
        res.send({err: err});
      } else {
        console.log("Vote logged");
        res.send({affected: numA});
      }
   });
  } else {
    res.send({notice: 'Please log in to vote.' });
  }

}
