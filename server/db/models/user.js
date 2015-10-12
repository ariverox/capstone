'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Card = require('./card.js')
var _ = require('lodash')


var schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  password: {
    type: String
  },
  salt: {
    type: String
  },
  google: {
    id: String
  },
  facebook: {
    id: String
  },
  photo: {
    type: String,
    default: '/images/default-img.png'
  },
  games: [{
    type: ObjectId,
    ref: 'Game'
  }],
  cards: [{
    type: ObjectId,
    ref: "Card"
  }],
  decks: [{
    type: ObjectId,
    ref: 'Deck'
  }],
  experience: {
    type: Number,
    max: 100,
    default: 0
  },
  level: {
    type: Number,
    max: 50,
    default: 0
  },
  packs: {
    type: Number,
    default: 6,
    min: 0
  },

  stardust: {
    type: Number,
    default: 0,
    min: 0
  }
});


schema.plugin(deepPopulate, {});

schema.method('experienceToLevel', function() {
  if (this.experience >= 100) {
    this.level += 1;
    this.experience = this.experience % 100;
  }
});

//
// schema.method('openPack', function() {
//   console.log("what")
//
//   var self = this
//   this.packs -= 1
//
//   return Card.find().then(cards => {
//     // self.cards += _.sample(cards, 5)
//     return cards
//   })
//
// })
//



// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function() {
  return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function(plainText, salt) {
  var hash = crypto.createHash('sha1');
  hash.update(plainText);
  hash.update(salt);
  return hash.digest('hex');
};

schema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.salt = this.constructor.generateSalt();
    this.password = this.constructor.encryptPassword(this.password, this.salt);
  }
  if (this.experience > 100) {
    this.level += 1;
    this.experience = 0;
  }
  next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function(candidatePassword) {
  return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);
