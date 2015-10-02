app.config($stateProvider => {
  $stateProvider.state('joinGame.selectDeck', {
    url: '/select-deck',
    templateUrl: 'js/join-game/select-deck.html',
    controller: 'JoinGameSelectDeckController',
  });
}).controller('JoinGameSelectDeckController', ($scope, $state, $http, Socket, user) => {
  if (!user) $scope.notLoggedIn = true;
  $scope.user = user;
  $scope.start = () => Socket.emit('join', user, $scope.selectedDeck);
  Socket.on('waitForPlayer', () => {
    $scope.$apply(() => $scope.waiting = true);
  });
  Socket.on('startGame', id => $state.go('game', {id: id}));
});
