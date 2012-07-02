var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Comments = new Schema({
    title     : String
  , body      : String
  , date      : {type: Date, default: Date.now}
  , votes     : {type: Number, default: 0}
  , replies   : [Comments]  
});

var Tutorials = new Schema({
    title   : String
  , link    : String
  , votes   : {type: Number, default: 0}
});

var Lang = new Schema({
    title   : String
  , desc    : String
  , owner   : String
  , votes   : {type: Number, default: 0}
  , tuts    : [Tutorials]
  , comments: [Comments]
});

var User = new Schema({
    nick    : String
  , name    : String
  , userid   : {type: Number, required: true, index: {unique: true, sparse: true} }
  , desc    : String
  , profile : String
  , email   : String
  , alive   : Boolean
});

Comments.methods.findCreator = function (callback) {
  return this.db.model('User').findById(this.creator, callback);
}

Lang.statics.findByTitle = function (title, callback) {
  return this.find({title: title}, callback);
}


mongoose.model('Lang', Lang);
mongoose.model('User', User);
