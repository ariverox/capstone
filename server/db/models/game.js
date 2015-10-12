'use strict';
var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  cards: [{type: ObjectId, ref: 'Card'}],
  users:[
    { id :{
      type:ObjectId,
      ref: 'User'
    } ,
    isAdmin:{
      type:Boolean,
      default: false
    }
  }],
});

mongoose.model('Game', schema);
