var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/langy');
var User = db.model('User');

exports.findOrCreateUserByTwitterData = function(twitterData, promise) {
  User.find({userid: twitterData.id_str}, function(err, doc) {
    if(err) {
      console.log(err);
      console.log("error using twitter data");
      promise.fail(err);
      return;
    }
    if(doc && doc.length > 0) {
      console.log(doc);
      console.log("found user already in system");
      exports.user_session = doc;
      promise.fulfill(doc);
    } else {
      console.log("attempting to insert user");
      var doc = new User({
        name: twitterData.name,
        userid: twitterData.id_str,
        profile: twitterData.profile_image_url,
        nick: twitterData.screen_name,
        locale: twitterData.location,
        desc: twitterData.description,
        admin: false
      });
      doc.save(function(err) {
        if(err) {
          console.log(err);
          console.log("error saving doc.");
          promise.fail(err);
        } else {
          console.log("new user created!");
          exports.user_session = doc;
          promise.fulfill(doc);
        }
      });
    }
  });
};
      
/*module.exports = {
  get_user: function(req, callback) {
   var criteria = "";
   if(req.session.auth) {
     console.log("found session");
     criteria =  req.session.auth.twitter.user.id_str;
     console.log(criteria);
   } else {
     criteria = "-1";
   }
   var query = User.find({userid: criteria});
   query.exec(callback);
  }
}*/
