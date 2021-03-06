app.factory('Self', (Player, Minion, Socket, $rootScope) => {
  let player = new Player();

  Socket.on('gameStart', players => {
    player.name = players.player;
    $rootScope.$digest();
    // Socket.emit('initialDraw');
  });

  //initial draw
  player.decide = (idx, rejectedCards) => {
    if (idx + 1) {
      player.decidingCards[idx].selected = !player.decidingCards[idx].selected;
      let i = rejectedCards.indexOf(idx);
      if (i > -1) rejectedCards.splice(i, 1);
      else rejectedCards.push(idx);
    } else Socket.emit('rejectCards', rejectedCards);
  };
  Socket.on('initialCards', cards => {
    player.decidingCards = cards;
    $rootScope.$digest();
  });
  Socket.on('setInitialHand', (hand, turn) => {
    $('#initial').remove();
    player.hand = hand;
    player.turn = turn;
    $rootScope.$digest();
    // Socket.emit('initialHandSet');
  });

  //turns
  Socket.on('startTurn', card => {
    if (!card) {
      player.message = "Fatigue. You've run out of cards";
    } 
    else {
      console.log(`start turn - ${card.name}`);
      player.message = "Your turn!";
      player.startTurn(card);
    }
  });

  Socket.on('wait', () => {
    player.message = "Opponent's turn!";
    player.opponentTurn();
  });
  player.emitEndTurn = () => {
    player.endTurn();
    Socket.emit('endTurn');
  };

  //summoning
  player.summon = id => {
    let card = _.remove(player.hand, card => card.id === id)[0];
    player.mana -= card.cost;
    Socket.emit('summon', id);
  };
  Socket.on('summoned', card => {
    console.log(`summoned ${card.name}`);
    player.summoned(card);
  });

  //attacking
  player.attack = data => {
    let attackee = data.attackee ? data.attackee.id : null;
    Socket.emit('attack', data.attacker.id, attackee);
  };
  Socket.on('attacked', attacker => {
    console.log('Attacked!');
    player.attacked(attacker);
  });
  Socket.on('wasAttacked', (attacker, attackee) => {
    console.log('Was attacked!');
    player.wasAttacked(attackee);
  });

  //spells
  Socket.on('selectTarget', () => {
    player.selecting = true;
    player.message = "Select a target!";
    $rootScope.$digest();
  });
  player.selected = selectee => {
    if (!selectee) selectee = 'opponent';
    else if (selectee.id) selectee = selectee.id;
    Socket.emit('cast', selectee);
  };
  Socket.on('healed', patient => {
    console.log('Healed!');
    player.healed(patient);
  });
  //different animations for spell dmg vs minion attacking?
  Socket.on('damaged', attackee => {
    console.log('Was damaged!');
    player.wasAttacked(attackee);
  });
  Socket.on('drew', cards => {
    console.log(`Drew ${cards.length} cards`);
    player.drew(cards);
  });
  Socket.on('propertyChanged', property => {
    console.log(`${property} changed`);
    player.propertyChanged(property);
  });

  //ending
  Socket.on('win', () => {
    player.message("You win!");
    $rootScope.$digest();
    // the line below is still untested. Could potentially cause problems
    socket.removeAllListeners();
    setTimeout(() => $state.go('home'), 3000);
  });
  Socket.on('lose', () => {
    player.message = "You lose!";
    $rootScope.$digest();
    // the line below is still untested. Could potentially cause problems
    socket.removeAllListeners();
    setTimeout(() => $state.go('home'), 3000);
  });

  return player;
});
