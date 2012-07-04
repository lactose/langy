var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Comment = new Schema({
    title     : String
  , body      : String
  , date      : {type: Date, default: Date.now}
  , votes     : {type: Number, default: 0}
  , replies   : [Comment]  
});

var Tutorial = new Schema({
    title   : String
  , link    : String
  , votes   : {type: Number, default: 0}
});

var Lang = new Schema({
    title   : {type: String, required: true, index: {unique: true, sparse: true}}
  , desc    : String
  , type    : Number
  , owner   : String
  , votes   : {type: Number, default: 0}
  , tuts    : [Tutorial]
  , comments: [Comment]
  , approved: Boolean
});

var Type = new Schema({
    title   : String
});

var User = new Schema({
    nick    : String
  , name    : String
  , userid   : {type: Number, required: true, index: {unique: true, sparse: true} }
  , desc    : String
  , locale  : String
  , profile : String
  , email   : String
  , alive   : Boolean
  , admin   : {type: Boolean, default: false}
});

Comment.methods.findCreator = function (callback) {
  return this.db.model('User').findById(this.creator, callback);
}

Lang.statics.findByTitle = function (title, callback) {
  return this.find({title: title}, callback);
}

Lang.path('title').set(function(v) {
  return v.toLowerCase();
});


mongoose.model('Lang', Lang);
mongoose.model('User', User);
mongoose.model('Type', Type);
mongoose.model('Comment', Comment);
mongoose.model('Tutorial', Tutorial);
