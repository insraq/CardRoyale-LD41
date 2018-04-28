var io = require('socket.io')(4000);

var spawnLocations = [[8, 3], [8, 23]];
var seq = 0;

io.on('connection', function (socket) {

  socket.on('new player', function (data) {
    var playerId = seq % 2;
    var enemyId = ++seq % 2;
    var player = spawnLocations[playerId];
    var enemy = spawnLocations[enemyId];
    socket.emit('spawn player', {
      player: { id: playerId, x: player[0], y: player[1] },
      enemy: { id: enemyId, x: enemy[0], y: enemy[1] }
    });
  });

  socket.on('player move', function (data) {
    socket.broadcast.emit('player move sync', data);
  });

});