function Player(name, deck) {
  this.name = name;
  this.hp = 100;
  this.deck = deck;
  this.discard = [];
  this.hand = [];
  this.summonedMinions = [];
}
Player.prototype.draw = function() {
  let card = this.deck.pop();
  this.hand.push(card);
  return card;
};

module.exports = Player;
