/*
This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.
*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Minion = Promise.promisifyAll(mongoose.model('Minion'));
var Spell = Promise.promisifyAll(mongoose.model('Spell'));
var Card = Promise.promisifyAll(mongoose.model('Card'));
var Deck = Promise.promisifyAll(mongoose.model('Deck'))
var Damage = Promise.promisifyAll(mongoose.model('Damage'));
var Heal = Promise.promisifyAll(mongoose.model('Heal'));
var Alter = Promise.promisifyAll(mongoose.model('Alter'));

var _ = require('lodash');

var Game = Promise.promisifyAll(mongoose.model('Game'));
var chance = require('chance')(123);

var tempData = {};
var companies = ["Abacus", "AirHelp", "AirPair", "Algolia", "Ambition", "AptDeco", "Beacon", "Bellabeat", "Boostable", "Cambly", "Camperoo", "CareMessage", "CodeCombat", "CodeNow", "Eventjoy", "Framed Data", "Gbatteries"];
var spellNames = ["Astral Communion", "Bite", "Claw", "Dark Wispers", "Force of Nature", "Healing Touch", "Innervate", "Living Roots", "Mark of the Wild", "Poison Seeds", "Recycle"];
var category = ["transportation", "education", "communication", "sharing economy"];
var spells = require('./cards.js').spells;
var minions = require('./cards.js').minions;
var alter = require('./cards.js').alter
var damage = require('./cards.js').damage
var heal = require('./cards.js').heal

// var allCards = spells.concat(minions)
// var allCardIds =[]




function randPhoto() {
  var g = chance.pick(['men', 'women']);
  var n = chance.natural({
    min: 0,
    max: 96
  });
  return 'http://api.randomuser.me/portraits/med/' + g + '/' + n + '.jpg';
}

var seedUsers = function() {
  var users = [{
    username: "Cookie_Monster",
    email: 'testing@fsa.com',
    password: 'password',
    cards: [],
    photo: randPhoto(),
    decks: [],
    stardust: 23
  }, {
    username: "L.i.z.z.y",
    email: 'obama@gmail.com',
    password: 'potus',
    photo: randPhoto(),
    cards: [],
    decks: [],
    stardust: 34
  }, {
    username: "moodie",
    email: "omri@fsa.com",
    password: "password",
    isAdmin: true,
    photo: randPhoto(),
    cards: [],
    decks: [],
    stardust: 234
  }, {
    username: "xoxo_Karrie",
    email: "karrie@gmail.com",
    password: "password",
    photo: randPhoto(),
    cards: [],
    decks: [],
    stardust: 57
  }, {
    username: "sea",
    email: "sea@hi.com",
    password: "bye",
    photo: randPhoto(),
    cards: [],
    decks: [],
    stardust: 132
  }, {
    username: "sky",
    email: "sky@hi.com",
    password: "bye",
    photo: randPhoto(),
    cards: [],
    decks: [],
    stardust: 102
  }];




  users.forEach(function(user) {
    var deck1 = tempData.decks[Math.floor(Math.random() * tempData.decks.length)]._id;
    var deck2 = tempData.decks[Math.floor(Math.random() * tempData.decks.length)]._id;
    user.decks.push(deck1, deck2);
  });
  users.forEach(function(user) {
    tempData.cards.forEach(function(card) {
      user.cards.push(card);
    });
  });

  return User.createAsync(users);
};

function seedDeck() {
  var decks = [];
  var names = ['alex\'s', 'chelsea\'s', 'kate\'s'];
  var adjectives = ['amazing', 'super', 'cool', 'best', 'next-level'];
  var nouns = ['deck', 'assortment of cards', 'selection'];

  for (var i = 0; i < 20; i++) {
    var types = ['airbnb', 'uber', 'snapchat', 'pinterest', 'fullstack', 'slack', 'coinbase']
    var deck = {};
    deck.type = _.sample(types)
    deck.name = names[Math.floor(Math.random() * names.length)] + ' ' + adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' + nouns[Math.floor(Math.random() * nouns.length)];
    deck.cards = [];
    for (var j = 0; j < 30; j++) {
      var card = tempData.cards[Math.floor(Math.random() * tempData.cards.length)];
      deck.cards.push(card);
    }
    decks.push(deck);

  }
  return Deck.createAsync(decks);
}

function seedMinions() {

  // var minions = [];
  //
  // for (var i = 0; i < 100; i++) {
  //   var obj = {};
  //   obj.name = companies[Math.floor(Math.random() * companies.length)] + i;
  //   obj.category = category[Math.floor(Math.random() * category.length)];
  //   obj.description = "Y Combinator Company";
  //   obj.portrait = "http://thecatapi.com/api/images/get?format=src&type=gif";
  //   obj.rarity = Math.floor(Math.random() * 4);
  //   obj.cost = Math.floor(Math.random() * 10);
  //   obj.hp = Math.floor(Math.random() * 10);
  //   obj.ap = Math.floor(Math.random() * 10);
  //   minions.push(obj);
  // }


  var abilities = ['eachTurn', 'battlecry', 'deathRattle', 'enrage']


  minions.forEach(function(minion) {
      if (_.has(minion.logic, 'eachTurn') || _.has(minion.logic, 'battlecry') || _.has(minion.logic, 'deathRattle') || _.has(minion.logic, 'enrage')) {
        for (var k in minion.logic) {
          minion.logic[k].forEach(function(effect, index) {
            minion.logic[k][index] = _.where(tempData.effects, {
              name: minion.logic[k][index]
            }, '_id')[index]
          })
        }
      }
    })
    // user.logic = _.where(tempData.effects, {
    //     name: spell.logic[0]
    //   }, '_id')[0]

  return Minion.createAsync(minions);
}

function seedSpells() {
  // var values = _.pluck(tempData.effects, 'name')
  // console.log(values)
  // var spells = [];
  // for (var i = 0; i < 100; i++) {
  //   var obj = {};
  //   obj.name = spellNames[Math.floor(Math.random() * spellNames.length)] + i;
  //   obj.category = category[Math.floor(Math.random() * category.length)];
  //   obj.cost = Math.floor(Math.random() * 10);
  //   obj.description = "Y Combinator Spell";
  //   obj.rarity = Math.floor(Math.random() * 4);
  //   obj.portrait = "http://thecatapi.com/api/images/get?format=src&type=gif";
  //   spells.push(obj);
  // }
  var effectIds = _.map(
    tempData.effects,
    function(thing) {
      return {
        name: thing.name,
        _id: thing._id
      };
    });

  spells.forEach(function(spell) {
    if (spell.logic.length > 0) {

      spell.logic = _.where(tempData.effects, {
        name: spell.logic[0]
      }, '_id')[0]
    }
  })

  console.log(spells)
  return Spell.createAsync(spells);
}

function seedAlter() {
  return Alter.createAsync(alter)
}

function seedDamage() {
  return Damage.createAsync(damage)
}

function seedHeal() {
  return Heal.createAsync(heal)
}





function seedGames() {
  var users =[]
  tempData.users.forEach(function(user){
    users.push({
      id:user._id, isAdmin: false
    })
  })
  var games = [{
    name: 'Windfury',
    cards: tempData.cards.map(function(card) {
      return card._id;
    }),
    decks: tempData.decks.map(function(deck) {
      return deck._id;
    }),
    users: users
  }];

  return Game.createAsync(games);
}





connectToDb.then(function() {
  var remove = [
    User.remove(),
    Deck.remove(),
    Card.remove(),
    Game.remove()
  ];

  Promise.all(remove)
    .then(function() {
      return seedHeal();
    }).then(function(heals) {
      tempData.effects = heals
      return seedAlter();
    }).then(function(alters) {
      tempData.effects = tempData.effects.concat(alters)
      return seedDamage();
    }).then(function(damages) {
      tempData.effects = tempData.effects.concat(damages)
      return seedMinions();
    }).then(function(minions) {
      tempData.cards = minions;
      // return seedSpells();
      // }).then(function(spells) {
      // tempData.cards = tempData.cards.concat(spells);
      return seedDeck();
    }).then(function(decks) {
      tempData.decks = decks;
      return seedUsers();
    }).then(function(users) {
      tempData.users = users;
      return seedGames();
    }).then(function(games) {
      tempData.games = games;
      return User.updateAsync({}, {
        games: tempData.games
      }, {
        multi: true
      });
    }).then(function(users) {
      return Deck.updateAsync({}, {
        game: tempData.games[0]
      }, {
        multi: true
      });
    }).then(function(decks) {
      console.log(chalk.green('Seed successful!'));
      process.kill(0);
    }).catch(function(err) {
      console.error(err);
      process.kill(1);
    });
});
