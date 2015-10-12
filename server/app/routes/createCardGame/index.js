var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Game = mongoose.model('Game');

router.get('/', function(req, res, next) {
  Game.find().exec().then(function(games) {
    res.status(200).send(games);
  }, function(err) {
    err.status = 404;
    throw err;
  }).then(null, next);
});

router.get('/:id', function(req, res, next) {
  Game.findById(id).exec().then(function(game) {
    res.status(200).send(game)
  }).then(null,next);
});

router.post('/', function(req, res, next) {
  var game = req.body
  Game.save(game).then(function(game){
    res.status(204).send()
  }).then(null,next)
});



module.exports = router;
