app.factory('Minion', (Socket, $rootScope) => {
  class Minion {
    constructor(minion) {
      this.name = minion.name;
      this.cost = minion.cost;
      this.description = minion.description;
      this.id = minion.id;
      this.logic = minion.logic;
      this.hp = minion.hp;
      this.ap = minion.ap;
      this.canAttack = false;
      this.attackable = true;

      if (this.logic.charge) this.canAttack = true;
      if (this.logic.battlecry) return;
    }

    startTurn() {
      this.canAttack = true;
      this.attacked = false;
      if (this.logic.everyTurn) return;
    }
    endTurn() {
      if (this.logic.endTurn) return;
    }

    checkTaunt(taunt) {
      if (taunt && !this.taunt) this.attackable = false;
      else this.attackable = true;
    }

    death() {
      if (this.logic.deathRattle) return;
    }
    attacked(hp) {
      if (this.logic.windfury && !this.attacked) this.attacked = true;
      else this.canAttack = false;

      this.hp = hp;
    }
    wasAttacked(hp) {
      if (this.logic.divineShield) this.logic.divineShield = false;
      else this.hp = hp;
    }
  }

  return Minion;
});
