
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , mongoose = require('mongoose')
  , everyauth = require('everyauth')
  , util = require('util')
  , fs = require('fs')
  , redis = require('redis')
  , Promise = everyauth.Promise
  , cluster = require('cluster')
  , numCPUs = require('os').cpus().length
  , users = require('./models/users')
  , RedisStore = require('connect-redis')(express)
  , debug
  , everyauthRoot = __dirname + '/..';

var redisConfig = fs.readFileSync(__dirname + '/config/redis.conf', 'UTF-8');
var appConfig = JSON.parse(fs.readFileSync(__dirname + 'config/app.json', 'UTF-8'))
require('./models/schema');

if(appConfig.DEBUG) {
  debug = appConfig.DEBUG;
}

everyauth.twitter
  .consumerKey(process.env.LANGY_CKEY)
  .consumerSecret(process.env.LANGY_CSEC)
  .findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData) {
    var promise = this.Promise();
    users.findOrCreateUserByTwitterData(twitterUserData, promise);
    return promise;
  })
  .redirectPath('/');

// redis stuff

function findRedisPassword(){

  var pw = '';

  // bet you didn't know you could do that with String#replace(), eh?
  redisConfig.replace(/(masterauth+\s)+(.*)+\s/, function( line, masterauthString, password){
    pw = password;
  });

  return pw;

}

function initRedis(){
  
  redisClient = redis.createClient()

  redisClient.on("error", function (err) {
      console.log("Redis connection error to " + redisClient.host + ":" + redisClient.port + " - " + err);
  });

  redisClient.on("connect", function (err){
    if(err) console.error(err)
    else{
      redisClient.auth(findRedisPassword(), function(){
        debug && console.log('Authenticated to redis.')
      })
    }
  });

  RedisStore = require('connect-redis')(express);
  
}

var app = express();



app.configure(function(){
  initRedis();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'dadaism', store: new RedisStore, cookie: { maxAge: 60000*( (60*24) * 30)} })); // 30 days
  app.use(everyauth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  app.set('port', 3000);
});

app.configure('production', function() {
  var logFile = fs.createWriteStream('/home/langy/www/langy/logs/production.log', {flags: 'a'});
  app.use(express.errorHandler());
  app.use(express.logger({stream: logFile}));
  app.set('port', '/tmp/langy.sock');
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

if(cluster.isMaster) {
  for(var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.pid + ' died');
  });
  cluster.on('death', function(worker) {
    cluster.fork();
    console.log('worker ' + worker.pid + ' revived');
  });
  cluster.on('unhandledException', function(worker) {
    console.log("shit");
  });
} else {
  var server = http.createServer(app).listen(app.get('port'), function(){
    if( isNaN(app.get('port')) ){
      fs.chmod(app.get('port'), 0777);
    }
    console.log("Express server listening on port " + app.get('port'));
  });

  server.on('close', function() {
    fs.unlink('/tmp/langy.sock', function() {
      //nothin 
    });
  });
}

