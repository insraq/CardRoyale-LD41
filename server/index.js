var io = require('socket.io')(4000);
var spawnLocations = [[8, 3], [8, 23]];
var seq = 0;
var roomMapping = {};
var currentOpenRoom = false;

console.log("Socket IO running on 4000");

io.on('connection', function (socket) {

  socket.on('new player', function (data) {
    // Join room
    var roomId = 'room ' + seq;

    if (currentOpenRoom) {
      currentOpenRoom = null;
      socket.join(roomId);
      console.log('player ' + socket.id + ' joined ' + roomId + ' (start the game)');
      roomMapping[socket.id] = roomId;

      // To the other player
      socket.to(roomId).emit('spawn player', {
        playerX: spawnLocations[seq % 2][0],
        playerY: spawnLocations[seq % 2][1],
        enemyX: spawnLocations[(seq + 1) % 2][0],
        enemyY: spawnLocations[(seq + 1) % 2][1],
      });
      // To myself
      socket.emit('spawn player', {
        playerX: spawnLocations[(seq + 1) % 2][0],
        playerY: spawnLocations[(seq + 1) % 2][1],
        enemyX: spawnLocations[seq % 2][0],
        enemyY: spawnLocations[seq % 2][1],
      });

      seq++;
    } else {
      currentOpenRoom = socket.id;
      socket.join(roomId);
      console.log('player ' + socket.id + ' joined ' + roomId + ' (waiting for opponent)');
      roomMapping[socket.id] = roomId;
    }

  });

  socket.on('player move', function (data) {
    socket.to(roomMapping[socket.id]).broadcast.emit('player move sync', data);
  });

  socket.on('disconnect', () => {
    var roomId = roomMapping[socket.id];
    if (socket.id === currentOpenRoom) {
      currentOpenRoom = null;
    }
    socket.to(roomId).emit('enemy left');
    delete roomMapping[socket.id];
    console.log('player ' + socket.id + ' left ' + roomId + ', # players = ' + Object.keys(roomMapping).length);
  });

});