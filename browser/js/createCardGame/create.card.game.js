app.config(function($stateProvider) {

  $stateProvider.state('createCardGame', {
    url: '/createcardgame',
    templateUrl: 'js/createCardGame/create.card.game.html',
    controller: function($scope, GameFactory) {
      $scope.test = "lol";

      $scope.newGame = {
        name: null,
        logo: null,
        users: null
      };

      $scope.createGame = function() {
        GameFactory.create($scope.newGame).then(function(game) {
          console.log(game);
        });
      };
    }
  });


});
