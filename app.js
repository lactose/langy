
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , mongoose = require('mongoose')
  , everyauth = require('everyauth')
  , util = require('util')
  , Promise = everyauth.Promise
  , users = require('./models/users')
  , everyauthRoot = __dirname + '/..';

require('./models/schema');

everyauth.twitter
  .consumerKey(process.env.LANGY_CKEY)
  .consumerSecret(process.env.LANGY_CSEC)
  .findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData) {
    var promise = this.Promise();
    //console.log(util.inspect(twitterUserData));
    users.findOrCreateUserByTwitterData(twitterUserData, promise);
    return promise;
  })
  .redirectPath('/');

var app = express();



app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'dadaism'}));
  app.use(everyauth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/projects/find/:title', routes.finder);
app.get('/projects', routes.langies);
app.put('/projects/list', routes.lang_list);
app.get('/add', routes.add);
app.post('/add', routes.add_post);
app.get('/approve', routes.approve);
app.get('/approval', routes.approve_list);
app.put('/approve/:id', routes.approve_id);
app.delete('/approve/:id', routes.disapprove_id);
app.put('/vote/project/:id', routes.vote_lang);
app.put('/vote/comment/:id', routes.vote_comment);
app.put('/vote/tutorial/:id', routes.vote_tutorial);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
