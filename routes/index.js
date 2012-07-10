
/*
 * GET home page.
 */
require('../models/schema.js');
var userdata = require('../models/users.js');
var mongoose = require('mongoose');
var eauth = require('everyauth');

var db = mongoose.connect('mongodb://localhost/langy');
var   langs = db.model('Lang')
    , type = db.model('Type')
    , comments = db.model('Comment')
    , tutorials = db.model('Tutorial')
    , users = db.model('User');

var user = '';
var nobody = [{ nick: '', admin: false}]

exports.index = function(req, res) {
  if(req.loggedIn) {
    users.find({userid: req.session.auth.twitter.user.id_str}, function(err, docs) {
      console.log(docs);
      res.render('index', {title: 'langy.io', user: docs, req: req});
    });
  } else {
    res.render('error', {title: 'error', user: nobody, req: req});
  }

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
  user = set_user(req);
  langs.find({'title': req.params.title}, function(err, docs) {
    console.log(docs);
    if(err || docs.length == 0) {
      res.render('error', {title: 'langy.io', req: req, user: user});
    } else {
      
      res.render('lang', {title: docs.title, req: req, user: user, lang: docs[0]});
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
  user = set_user(req);
  res.render('langies', {title: 'Projects', req: req, user: user});
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
  vote(req, res, comments);
};
exports.vote_tutorial = function(req, res) {
  vote(req, res, tutorials);
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
  /*if(req.session.auth) {
    userdata.get_user(function(err, docs) {
      if(err && err.length > 0) {
        console.log("found error");
        console.log(err);
        return [{
          nick: "",
          admin: false
        }]
      } else {
        console.log("returning user doc");
        console.log(JSON.stringify(doc));
        return doc;
      }
    });
  } */
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
