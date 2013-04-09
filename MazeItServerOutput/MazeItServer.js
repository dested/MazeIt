(function() {
	////////////////////////////////////////////////////////////////////////////////
	// MazeItServer.Program
	var $MazeItServer_$Program = function() {
	};
	$MazeItServer_$Program.$main = function() {
		//ExtensionMethods.debugger(""); 
		var http = require('http');
		var app = http.createServer(function(req, res) {
			res.end();
		});
		var io = require('socket.io').listen(app);
		var fs = require('fs');
		app.listen(4484);
		io.set('log level', 0);
		var server = new $MazeItServer_MazeServer();
		var count = 0;
		io.sockets.on('connection', function(socket) {
			var userID = count++;
			console.log('User Joined ' + userID);
			server.addPlayer(userID, ss.mkdel(socket, socket.emit));
			socket.on('WaitingRoom.VoteStart', function(data) {
				server.changeVoteStart(userID, ss.Nullable.unbox(ss.cast(data, Boolean)));
			});
			socket.on('GameRoom.PlayerMoves', function(data1) {
				server.movePlayer(userID, ss.cast(data1, Array));
			});
			socket.on('disconnect', function(data2) {
				console.log('User Left ' + userID);
				server.removePlayer(userID);
			});
		});
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItServer.MazeGamePlayer
	var $MazeItServer_MazeGamePlayer = function(id, color, sendMessage) {
		this.id = 0;
		this.color = null;
		this.sendMessage = null;
		this.id = id;
		this.color = color;
		this.sendMessage = sendMessage;
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItServer.MazeServer
	var $MazeItServer_MazeServer = function() {
		this.games = null;
		this.waitingRooms = null;
		this.players = null;
		this.waitingRooms = [];
		this.games = [];
		this.players = {};
	};
	$MazeItServer_MazeServer.prototype = {
		addPlayer: function(userID, sendMessage) {
			var mazeGamePlayer = new $MazeItServer_MazeGamePlayer(userID, MazeItCommon.Extensions.randomColor(), sendMessage);
			this.players[userID] = mazeGamePlayer;
			for (var $t1 = 0; $t1 < this.waitingRooms.length; $t1++) {
				var waitingRoom = this.waitingRooms[$t1];
				if (waitingRoom.players.length < $MazeItServer_MazeServer.maxPlayers) {
					waitingRoom.addPlayer(mazeGamePlayer);
					return;
				}
			}
			var room = new $MazeItServer_WaitingRoom(this);
			room.addPlayer(mazeGamePlayer);
			ss.add(this.waitingRooms, room);
		},
		changeVoteStart: function(userID, vote) {
			var player = this.players[userID];
			for (var $t1 = 0; $t1 < this.waitingRooms.length; $t1++) {
				var waitingRoom = this.waitingRooms[$t1];
				if (waitingRoom.containsPlayer(player)) {
					waitingRoom.changeVoteStart(player, vote);
					return;
				}
			}
		},
		movePlayer: function(userID, directions) {
			var player = this.players[userID];
			for (var $t1 = 0; $t1 < this.games.length; $t1++) {
				var gameRoom = this.games[$t1];
				if (gameRoom.containsPlayer(player)) {
					var updates = [];
					for (var $t2 = 0; $t2 < directions.length; $t2++) {
						var wallPiece = directions[$t2];
						var update = gameRoom.movePlayer(player, wallPiece);
						if (ss.isValue(update)) {
							ss.add(updates, update);
						}
					}
					for (var $t3 = 0; $t3 < gameRoom.players.length; $t3++) {
						var mazeGamePlayer = gameRoom.players[$t3];
						if (!ss.referenceEquals(mazeGamePlayer, player)) {
							mazeGamePlayer.sendMessage('MazeGame.PlayerPositionUpdates', updates);
						}
					}
					return;
				}
			}
		},
		removePlayer: function(userID) {
			var player = this.players[userID];
			for (var $t1 = 0; $t1 < this.waitingRooms.length; $t1++) {
				var waitingRoom = this.waitingRooms[$t1];
				if (waitingRoom.containsPlayer(player)) {
					waitingRoom.removePlayer(player);
					if (waitingRoom.players.length === 0) {
						ss.remove(this.waitingRooms, waitingRoom);
					}
					return;
				}
			}
			for (var $t2 = 0; $t2 < this.games.length; $t2++) {
				var game = this.games[$t2];
				if (game.containsPlayer(player)) {
					game.removePlayer(player);
					if (game.players.length === 0) {
						ss.remove(this.games, game);
					}
					return;
				}
			}
		},
		migrateFromWaitingRoom: function(waitingRoom) {
			ss.remove(this.waitingRooms, waitingRoom);
			var mazeServerGame = new $MazeItServer_MazeServerGame(this, waitingRoom);
			ss.add(this.games, mazeServerGame);
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItServer.MazeServerGame
	var $MazeItServer_MazeServerGame = function(server, waitingRoom) {
		this.$myServer = null;
		this.game = null;
		this.players = null;
		this.$myServer = server;
		this.players = [];
		ss.arrayAddRange(this.players, waitingRoom.players);
		for (var $t1 = 0; $t1 < this.players.length; $t1++) {
			var mazeGamePlayer = this.players[$t1];
			mazeGamePlayer.sendMessage('WaitingRoom.GameBeginning', null);
		}
		var playerList = this.players.map(function(a) {
			return new MazeItCommon.MazeGameClientPlayer(a.id, a.color);
		});
		for (var $t2 = 0; $t2 < this.players.length; $t2++) {
			var mazeGamePlayer1 = this.players[$t2];
			mazeGamePlayer1.sendMessage('MazeGame.PlayerReflect', mazeGamePlayer1.id);
			mazeGamePlayer1.sendMessage('MazeGame.PlayerInfo', playerList);
		}
		this.game = new MazeItCommon.MazeGame(playerList, null, null);
		for (var $t3 = 0; $t3 < this.players.length; $t3++) {
			var mazeGamePlayer2 = this.players[$t3];
			mazeGamePlayer2.sendMessage('MazeGame.MazeData', this.game.data);
		}
	};
	$MazeItServer_MazeServerGame.prototype = {
		movePlayer: function(player, piece) {
			var playerPositionUpdate = null;
			var mazeBuilder = this.game.mazeBuilders[player.id];
			if (mazeBuilder.navigate(piece.direction)) {
				playerPositionUpdate = MazeItCommon.PlayerPositionUpdate.$ctor(player.id, piece.direction);
				if (mazeBuilder.currentMazePoint.x === this.game.data.mazeSize - 1 && mazeBuilder.currentMazePoint.y === this.game.data.mazeSize - 1) {
					for (var $t1 = 0; $t1 < this.players.length; $t1++) {
						var mazeGamePlayer = this.players[$t1];
						mazeGamePlayer.sendMessage('MazeGame.PlayerWon', player.id);
					}
				}
			}
			return playerPositionUpdate;
		},
		removePlayer: function(player) {
			ss.remove(this.players, player);
			for (var $t1 = 0; $t1 < this.players.length; $t1++) {
				var mazeGamePlayer = this.players[$t1];
				mazeGamePlayer.sendMessage('MazeGame.PlayerLeft', new MazeItCommon.MazeGameClientPlayer(player.id, player.color));
			}
			if (this.players.length === 0) {
				ss.remove(this.$myServer.games, this);
			}
		},
		containsPlayer: function(player) {
			for (var $t1 = 0; $t1 < this.players.length; $t1++) {
				var mazeGamePlayer = this.players[$t1];
				if (mazeGamePlayer.id === player.id) {
					return true;
				}
			}
			return false;
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItServer.WaitingRoom
	var $MazeItServer_WaitingRoom = function(server) {
		this.$myServer = null;
		this.players = null;
		this.voteStart = null;
		this.$myServer = server;
		this.players = [];
		this.voteStart = {};
	};
	$MazeItServer_WaitingRoom.prototype = {
		addPlayer: function(player) {
			ss.add(this.players, player);
			this.voteStart[player.id] = false;
			if (this.players.length === $MazeItServer_MazeServer.maxPlayers) {
				var $t1 = new ss.ObjectEnumerator(this.voteStart);
				try {
					while ($t1.moveNext()) {
						var vs = $t1.current();
						this.voteStart[vs.key] = true;
					}
				}
				finally {
					$t1.dispose();
				}
			}
			var count = 0;
			var $t2 = new ss.ObjectEnumerator(this.voteStart);
			try {
				while ($t2.moveNext()) {
					var vs1 = $t2.current();
					if (vs1.value) {
						count++;
					}
				}
			}
			finally {
				$t2.dispose();
			}
			for (var $t3 = 0; $t3 < this.players.length; $t3++) {
				var mazeGamePlayer = this.players[$t3];
				mazeGamePlayer.sendMessage('WaitingRoom.PlayerCountChanged', this.players.length);
				this.$voteStartUpdated(count, mazeGamePlayer);
			}
		},
		changeVoteStart: function(player, start) {
			this.voteStart[player.id] = start;
			var count = 0;
			var $t1 = new ss.ObjectEnumerator(this.voteStart);
			try {
				while ($t1.moveNext()) {
					var vs = $t1.current();
					if (vs.value) {
						count++;
					}
				}
			}
			finally {
				$t1.dispose();
			}
			for (var $t2 = 0; $t2 < this.players.length; $t2++) {
				var mazeGamePlayer = this.players[$t2];
				this.$voteStartUpdated(count, mazeGamePlayer);
			}
			if (count === this.players.length) {
				this.$myServer.migrateFromWaitingRoom(this);
			}
		},
		$voteStartUpdated: function(voteStartCount, player) {
			player.sendMessage('WaitingRoom.VoteStartChanged', voteStartCount);
		},
		removePlayer: function(player) {
			ss.remove(this.players, player);
			delete this.voteStart[player.id];
			var count = 0;
			var $t1 = new ss.ObjectEnumerator(this.voteStart);
			try {
				while ($t1.moveNext()) {
					var vs = $t1.current();
					if (vs.value) {
						count++;
					}
				}
			}
			finally {
				$t1.dispose();
			}
			for (var $t2 = 0; $t2 < this.players.length; $t2++) {
				var mazeGamePlayer = this.players[$t2];
				mazeGamePlayer.sendMessage('WaitingRoom.PlayerCountChanged', this.players.length);
				this.$voteStartUpdated(count, mazeGamePlayer);
			}
			if (count === this.players.length) {
				this.$myServer.migrateFromWaitingRoom(this);
			}
		},
		containsPlayer: function(player) {
			return ss.contains(this.players, player);
		}
	};
	ss.registerClass(null, 'MazeItServer.$Program', $MazeItServer_$Program);
	ss.registerClass(global, 'MazeItServer.MazeGamePlayer', $MazeItServer_MazeGamePlayer);
	ss.registerClass(global, 'MazeItServer.MazeServer', $MazeItServer_MazeServer);
	ss.registerClass(global, 'MazeItServer.MazeServerGame', $MazeItServer_MazeServerGame);
	ss.registerClass(global, 'MazeItServer.WaitingRoom', $MazeItServer_WaitingRoom);
	$MazeItServer_MazeServer.maxPlayers = 5;
	require('./mscorlib');
	require('./CommonLibraries');
	require('./NodeLibraries');
	require('./MazeItCommon');
	$MazeItServer_$Program.$main();
})();
