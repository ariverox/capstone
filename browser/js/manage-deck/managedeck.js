app.config(function($stateProvider) {
  $stateProvider.state('managedeck', {
    url: '/managedeck',
    templateUrl: '/js/manage-deck/managedeck.html',
    controller: 'manageDeckController',
    resolve: {
      user: AuthService => AuthService.getLoggedInUser()
    }
  });
});

app.controller('manageDeckController', function($scope, user, $http, $state, DeckFactory, UserFactory) {
  var context;
  var clientsChart;
  $scope.barData = {};
  $scope.showCards = false;
  $scope.createDeck = false;
  $scope.cardsInDeck = {};
  $scope.user = user;
  $scope.craft = false;
  
  $scope.selectDeck = function() {
    $scope.currentdeck = _.find($scope.user.decks, {_id: $scope.selectedDeck});
      if ($scope.selectedDeck === undefined) {
        $scope.currentdeck = $scope.user.decks[0];
        $scope.selectedDeck = $scope.user.decks[0];
      }
    $scope.cardsInDeck = displayDeck();
    $scope.deckName = $scope.currentdeck.name;
    $scope.showCards = true;
    $scope.barData.labels = ["1", "2", "3", "4", "5", "6","7+"];
    $scope.barData.datasets = [{
            label: $scope.deckName,
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: $scope.deckcost()
        }];

  context = document.getElementById('clients').getContext('2d');
  clientsChart = new Chart(context).Bar($scope.barData);
  };

  function displayDeck() {
    if ($scope.currentdeck === undefined) return;
    var cardsInDeckObj = {};
    $scope.currentdeck.cards.forEach(function(card){
      if (cardsInDeckObj.hasOwnProperty(card.name)){
        cardsInDeckObj[card.name] += 1;
      } else {
        cardsInDeckObj[card.name] = 1;
      }
    });
    return cardsInDeckObj;
  }
  
  $scope.deckcost = function() {
    $scope.cost = [0,0,0,0,0,0,0];
    $scope.currentdeck.cards.forEach(function(card) {
      if (card.cost <= 6) {
        $scope.cost[card.cost-1]++;
      }
      else {
        $scope.cost[6]++;
      }
    });
    return $scope.cost;
  };

  $scope.removeFromDeck = function(cardname) {
    if ($scope.total < 1 || $scope.currentdeck === undefined) return;
    var indx = -1;
    $scope.currentdeck.cards.forEach(function(currentcard, index) {
      if (currentcard.name === cardname) {
        indx = index;
      }
    });
    $scope.currentdeck.cards.splice(indx, 1);
    updateDeck();
  };

  $scope.removeDeck = function() {
    if ($scope.currentdeck === undefined) return;
    DeckFactory.destroy($scope.currentdeck._id)
    .then(function(deletedDeck){
      var indx = -1;
      $scope.user.decks.forEach(function(thisdeck, index){
        if (thisdeck._id === deletedDeck._id){
          indx = index;
        }
      });
      $scope.user.decks.splice(indx, 1);
      updateUser();
    });
  };

  $scope.showCreateDeckForm = function(){
    if ($scope.createDeck){
      $scope.createDeck = false;
    } else {
      $scope.createDeck = true;
    }
  };

  $scope.createNewDeck = function(deckname) {
    if (deckname === undefined || deckname.length < 1) return;
    DeckFactory.create({"name": deckname})
    .then(function(newdeck){
      $scope.user.decks.push(newdeck);
      updateUser();
    });
  };

  $scope.addToDeck = function(card){
    if ($scope.currentdeck === undefined || $scope.total > 29) return;
    if (duplicateChecker(card)) {
      console.log("cannot have more than 2 duplicates in the currentdeck");
      return;
    }
    $scope.currentdeck.cards.push(card);
    updateDeck();
  };

  $scope.showCraftForm = function() {
    if ($scope.craft) {
      $scope.craft = false;
    } else {
      $scope.craft = true;
    }
  };

  $scope.disenchant = function(card){
    // 1. Remove card from user.cards
    var cost = card.stardustCost;
    removeCardFromUser(card);
    // 2. Add card's stardust value to user's stardust points
    $scope.user.stardust += cost;
    updateUser();
  };

  function updateDeck(){
    DeckFactory.update($scope.currentdeck._id, $scope.currentdeck)
      .then(function(updatedDeck){
        $scope.cardsInDeck = displayDeck();
        $scope.currentdeck = updatedDeck;
      })
      .then(null, function(err){
        console.log("Error occured ", err);
      });
  }

  function updateUser(){
    UserFactory.update($scope.user._id, $scope.user)
      .then(function(updatedUser){
        console.log("updated user ", updatedUser);
        user = updatedUser;
        $scope.user = updatedUser;
      })
      .then(null, function(err){
        console.log("Error occured ", err);
      });
  }

  function duplicateChecker(card) {
    var count = 0;
    $scope.currentdeck.cards.forEach(function(currentcard){
      if (currentcard._id === card._id){
        count++;
      }
    });
    if (count >= 2) return true;
    return false;
  }

  function removeCardFromUser(card) {
    // remove the card from the user's user.cards property
    var indx = -1;
    $scope.user.cards.forEach(function(currentcard, index){
      if (currentcard._id === card._id){
        indx = index;
      }
    });
    $scope.user.cards.splice(indx, 1);
  }

});
