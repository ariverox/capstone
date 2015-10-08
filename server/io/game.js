var CardModel = require('mongoose').model('Card');
var _ = require('lodash');
var Promise = require('bluebird');
var Card = require('./classes/card');
var Minion = Card.Minion;
var Spell = Card.spell;
var Player = require('./classes/player');
var Game = require('./classes/game');

var games = [];

module.exports = (io, socket, createdGames) => {
  let i = () => socket.game - 1;
  let player = () => socket.p1 ? games[i()].p1 : games[i()].p2;
  let opponent = () => socket.p1 ? games[i()].p2 : games[i()].p1;
  let p = () => socket.p1 ? 'p1' : 'p2';

  socket.on('playerReady', () => {
    if (!socket.game) return;
    console.log(`player joined as ${p()}`);

    let game = createdGames[i()];
    let decks = [CardModel.find({_id: {$in: game.p1.deck}}).exec(), CardModel.find({_id: {$in: game.p2.deck}}).exec()];
    Promise.all(decks).then(resolvedDecks => {
      let i = 0;
      let decks = resolvedDecks.map(deck => {
        return deck.map(card => {
          return card.type === 'Minion' ? new Minion(card.name, card.cost, card.description, i++, card.logic, card.hitPoints, card.attackPoints) : new Spell(card.name, card.logic, card.cost, card.description, i++);
        });
      });
      let p1 = new Player(game.p1.name, decks[0], game.p1.socket);
      let p2 = new Player(game.p2.name, decks[1], game.p2.socket);
      p1.shuffle();
      p2.shuffle();
      games[i()] = new Game(p1, p2);
      socket.emit('gameStart', {player: player().name, opponent: opponent().name});
    });
  });

  socket.on('initialDraw', () => {
    if (!socket.game || games[i()].state !== 'initialCards') return;

    if (!games[i()].currentPlayer) {
      if (Math.random() > 0.5) {
        games[i()].currentPlayer = games[i()].p1;
        games[i()].waitingPlayer = games[i()].p2;
      } else {
        games[i()].currentPlayer = games[i()].p2;
        games[i()].waitingPlayer = games[i()].p1;
      }
      games[i()].currentPlayer.socket.turn = true;
    }

    player().decidingCards = [player().deck.pop(), player().deck.pop(), player().deck.pop()];
    if (!socket.turn) player().decidingCards.push(player().deck.pop());
    player().deciding = true;
    socket.emit('initialCards', player().decidingCards);
    setTimeout(() => {
      if (games[i()].state !== 'initialCards') return;
      games[i()].state = 'setInitialHand';

      if (player().deciding) {
        setInitialHand();
        socket.emit('setInitialHand', player().hand, socket.turn);
      }
      if (opponent().waiting) {
        opponent().waiting = false;
        opponent().socket.emit('setInitialHand', opponent().hand, opponent().socket.turn);
      }
    }, 10000);
  });

  function setInitialHand() {
    player().hand = player().decidingCards;
    player().deciding = false;
    player().decidingCards = [];
  }

  socket.on('rejectCards', cards => {
    if (!socket.game || games[i()].state !== 'initialCards') return;

    cards.forEach(i => player().deck.push(player().decidingCards.splice(i, 1)));
    player().shuffle();
    setInitialHand();
    let l = socket.turn ? 3 : 4;
    while (player().hand.length < l) player().draw();

    if (opponent().deciding) {
      player().waiting = true;
      socket.emit('waitInitial');
    } else {
      opponent().waiting = false;
      opponent().socket.emit('setInitialHand', opponent().hand, opponent().socket.turn);
      games[i()].state = 'setInitialHand';
      socket.emit('setInitialHand', player().hand, socket.turn);
    }
  });
  socket.on('initialHandSet', () => {
    if (games[i()].state != 'setInitialHand') return;
    games[i()].state = 'playing';
    games[i()].waitingPlayer.socket.emit('wait');
    games[i()].turns++;
    games[i()].currentPlayer.startTurn(games[i()].turn);
  });

  socket.on('summon', card => {
    if (games[i()].currentPlayer !== player() || player().mana < card.cost || !player().hand.some(handCard => handCard.id === card.id)) return;
    if (card.type === 'spell') return;
    console.log(`${p()} summoning ${card.name}`);

    if (card.type === 'minion') player().summonMinion(card);

    socket.emit('summoned', card);
    opponent().socket.emit('opponentSummoned', card);
  });

  socket.on('attack', (attackerId, attackeeId) => {
    console.log(`${p()}: ${attackerId} attacking ${attackeeId}`);
    let hps = games[i()].attack(attackerId, attackeeId);
    if (hps[1] === 0 && !attackerId) {
      socket.emit('win');
      opponent().socket.emit('lose');
    } else {
      socket.emit('attacked', {id: attackerId, hp: hps[0]}, {id: attackeeId, hp: hps[1]});
      opponent().socket.emit('wasAttacked', {id: attackerId, hp: hps[0]}, {id: attackeeId, hp: hps[1]});
    }
  });

  socket.on('endTurn', () => {
    console.log(`${p()} ended their turn.`);
    if (games[i()].currentPlayer !== player()) return;
    games[i()].endTurn();
    socket.emit('wait');
    games[i()].turn++;
    opponent().startTurn(games[i()].turn);
    console.log(`Next turn - ${opponent().mana}.`);
  });

  socket.on('leave', () => {
    if (!socket.game) return;

    socket.emit('lose');
    opponent().socket.emit('win');
    opponent().socket.game = undefined;
    opponent().socket.p1 = undefined;
    games[i()] = undefined;
    createdGames[i()] = undefined;
    socket.game = undefined;
    socket.p1 = undefined;
  });

  socket.on('disconnect', () => {
    if (!socket.game) return;

    opponent().socket.emit('win');
    opponent().socket.game = undefined;
    opponent().socket.p1 = undefined;
    games[i()] = undefined;
    createdGames[i()] = undefined;
  });
  return socket;
};
