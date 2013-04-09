(function() {
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.Builder
	var $MazeItCommon_Builder = function(wallInfo, color) {
		this.$1$ColorField = null;
		this.currentMazePoint = null;
		this.numHits = null;
		this.points = null;
		this.$theWalls = null;
		this.set_color(color);
		this.$theWalls = wallInfo;
		this.numHits = new Array(wallInfo.length);
		for (var i = 0; i < wallInfo.length; i++) {
			this.numHits[i] = new Array(wallInfo.length);
		}
		this.numHits[0][0] = true;
		this.currentMazePoint = new CommonLibraries.IntPoint(0, 0);
		this.points = [];
		this.addPoint(new CommonLibraries.IntPoint(0, 0), true);
	};
	$MazeItCommon_Builder.prototype = {
		get_color: function() {
			return this.$1$ColorField;
		},
		set_color: function(value) {
			this.$1$ColorField = value;
		},
		addMazePoint: function(p0) {
			var d = this.addPoint(p0, false) === 0;
			if (d) {
				this.currentMazePoint = p0;
			}
			return d;
		},
		addPoint: function(p, wasBad) {
			if (p.x < 0 || p.x >= this.$theWalls.length || p.y < 0 || p.y >= this.$theWalls.length) {
				return 1;
			}
			var pr;
			if (this.points.length > 0) {
				pr = this.points[this.points.length - 1];
				if (pr.x === p.x && pr.y === p.y) {
					return 2;
				}
			}
			else {
				ss.add(this.points, p);
				return 0;
			}
			if (pr.x + 1 === p.x) {
				if (this.$theWalls[p.x][p.y].contains(2)) {
					return 1;
				}
			}
			else if (pr.x - 1 === p.x) {
				if (this.$theWalls[p.x][p.y].contains(3)) {
					return 1;
				}
			}
			else if (pr.y + 1 === p.y) {
				if (this.$theWalls[p.x][p.y].contains(1)) {
					return 1;
				}
			}
			else if (pr.y - 1 === p.y) {
				if (this.$theWalls[p.x][p.y].contains(0)) {
					return 1;
				}
			}
			if (this.points.length > 0 && wasBad) {
				return (ss.contains(this.points, p) ? 0 : 1);
			}
			//   int inj = Points.Count;
			//   if (inj > 2) {
			//   if (Points[inj - 1].X == p.X && Points[inj - 1].Y == p.Y)
			//   
			//   NumHits[Points[inj - 2].X, Points[inj - 2].Y] = !NumHits[Points[inj - 2].X, Points[inj - 2].Y];
			//   else NumHits[p.X, p.Y] = !NumHits[p.X, p.Y];
			//   }
			//   else
			//   NumHits[p.X, p.Y] = !NumHits[p.X, p.Y];
			this.numHits[p.x][p.y] = !this.numHits[p.x][p.y];
			//
			//            var pm = Points[Points.Count - 1];
			//
			//            NumHits[pm.X, pm.Y] = !NumHits[pm.X, pm.Y];
			ss.add(this.points, p);
			console.log('Adding Point: ' + this.points.length);
			return 0;
		},
		blockify: function(blockSize) {
			var ps = [];
			for (var $t1 = 0; $t1 < this.points.length; $t1++) {
				var point = this.points[$t1];
				var pt = new CommonLibraries.IntPoint(point.x * blockSize + ss.Int32.div(blockSize, 2), point.y * blockSize + ss.Int32.div(blockSize, 2));
				ss.add(ps, pt);
			}
			var pts = [];
			if (ps.length === 1) {
				ss.add(pts, { item1: this.points[0], item2: ps[0], item3: null });
			}
			for (var index = 0; index < ps.length - 1; index++) {
				var intPoint = ps[index];
				ss.add(pts, { item1: this.points[index], item2: intPoint, item3: $MazeItCommon_Builder.toRect(ps, index) });
			}
			return pts;
		},
		navigate: function(piece) {
			var point = new CommonLibraries.IntPoint(this.currentMazePoint.x, this.currentMazePoint.y);
			switch (piece) {
				case 0: {
					point.y++;
					break;
				}
				case 1: {
					point.y--;
					break;
				}
				case 2: {
					point.x++;
					break;
				}
				case 3: {
					point.x--;
					break;
				}
			}
			return this.addMazePoint(point);
		}
	};
	$MazeItCommon_Builder.toRect = function(vf, index) {
		var point = vf[index];
		var point2 = vf[index + 1];
		var left, right, top, bottom;
		var cur;
		if (point2.x > point.x) {
			left = point.x - 1;
			right = point2.x + 1;
		}
		else {
			left = point2.x - 1;
			right = point.x + 1;
		}
		if (point2.y > point.y) {
			top = point.y - 1;
			bottom = point2.y + 1;
		}
		else {
			top = point2.y - 1;
			bottom = point.y + 1;
		}
		cur = new $MazeItCommon_Rect(left, top, right, bottom);
		return cur;
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.Carver
	var $MazeItCommon_Carver = function(data) {
		var $t1 = [];
		ss.add($t1, 2);
		ss.add($t1, 1);
		ss.add($t1, 0);
		ss.add($t1, 3);
		this.$gms = $t1;
		this.data = null;
		this.bw = null;
		this.data = data;
	};
	$MazeItCommon_Carver.prototype = {
		walk: function() {
			this.bw = new Array(this.data.mazeSize);
			for (var i = 0; i < this.data.mazeSize; i++) {
				this.bw[i] = new Array(this.data.mazeSize);
			}
			this.walker(0, 0);
		},
		walker: function(cx, cy) {
			var $t1 = this.$randomizeEach();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var direction = $t1[$t2];
				var nx = cx + this.$getDX(direction);
				var ny = cy + this.$getDY(direction);
				if (ny >= 0 && ny <= this.data.mazeSize - 1 && nx >= 0 && nx <= this.data.mazeSize - 1 && !this.bw[nx][ny]) {
					//if (!bw[nx][ny]) 
					{
						this.bw[nx][ny] = true;
						this.data.walls[cx][cy].remove(direction);
						this.data.walls[nx][ny].remove(this.$getOpposite(direction));
						this.walker(nx, ny);
					}
				}
			}
		},
		$mixList: function(ipl) {
			var inputList = ss.arrayClone(ipl);
			var randomList = [];
			var randomIndex = 0;
			while (inputList.length > 0) {
				randomIndex = ss.Int32.trunc(Math.random() * inputList.length);
				// Choose a random, obj in the list
				ss.add(randomList, inputList[randomIndex]);
				// add it to the new, random list
				ss.removeAt(inputList, randomIndex);
				// remove to avoid duplicates
			}
			return randomList;
			// return the new random list
		},
		$randomizeEach: function() {
			return this.$mixList(this.$gms);
		},
		$getOpposite: function(wallse) {
			switch (wallse) {
				case 1: {
					return 0;
				}
				case 0: {
					return 1;
				}
				case 2: {
					return 3;
				}
				case 3: {
					return 2;
				}
			}
			return 2;
			// never hit
		},
		$getDX: function(wallse) {
			switch (wallse) {
				case 1:
				case 0: {
					return 0;
				}
				case 2: {
					return -1;
				}
				case 3: {
					return 1;
				}
			}
			return 0;
		},
		$getDY: function(wallse) {
			switch (wallse) {
				case 1: {
					return -1;
				}
				case 0: {
					return 1;
				}
				case 2:
				case 3: {
					return 0;
				}
			}
			return 0;
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.MazeData
	var $MazeItCommon_MazeData = function(mazeSize) {
		this.mazeSize = 0;
		this.walls = null;
		this.mazeSize = mazeSize;
		this.walls = new Array(mazeSize);
		for (var i = 0; i < this.mazeSize; i++) {
			this.walls[i] = new Array(this.mazeSize);
			for (var a = 0; a < this.mazeSize; a++) {
				this.walls[i][a] = $MazeItCommon_WallInfo.all();
			}
		}
	};
	$MazeItCommon_MazeData.$ctor1 = function(mazeSize, walls) {
		this.mazeSize = 0;
		this.walls = null;
		this.mazeSize = mazeSize;
		this.walls = new Array(mazeSize);
		for (var i = 0; i < this.mazeSize; i++) {
			this.walls[i] = new Array(this.mazeSize);
			for (var a = 0; a < this.mazeSize; a++) {
				this.walls[i][a] = new $MazeItCommon_WallInfo.$ctor1(walls[i][a]);
			}
		}
	};
	$MazeItCommon_MazeData.$ctor1.prototype = $MazeItCommon_MazeData.prototype;
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.MazeGame
	var $MazeItCommon_MazeGame = function(playerList, loadedData) {
		this.playerList = null;
		this.data = null;
		this.mazeBuilders = null;
		this.playerList = playerList;
		if (ss.isNullOrUndefined(loadedData)) {
			this.data = new $MazeItCommon_MazeData(50);
			var carver = new $MazeItCommon_Carver(this.data);
			carver.walk();
		}
		else {
			this.data = loadedData;
		}
		this.mazeBuilders = {};
		for (var $t1 = 0; $t1 < this.playerList.length; $t1++) {
			var mazeGameClientPlayer = this.playerList[$t1];
			this.mazeBuilders[mazeGameClientPlayer.id] = new $MazeItCommon_Builder(this.data.walls, this.$randomColor());
		}
	};
	$MazeItCommon_MazeGame.prototype = {
		$randomColor: function() {
			return '#' + ss.Int32.trunc(Math.floor(Math.random() * 16777215)).toString(16);
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.MazeGameClientPlayer
	var $MazeItCommon_MazeGameClientPlayer = function(id) {
		this.id = 0;
		this.id = id;
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.MoveDirection
	var $MazeItCommon_MoveDirection = function() {
	};
	$MazeItCommon_MoveDirection.$ctor = function(direction, count) {
		var $this = {};
		$this.direction = 0;
		$this.index = 0;
		$this.direction = direction;
		$this.index = count;
		return $this;
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.PlayerPositionUpdate
	var $MazeItCommon_PlayerPositionUpdate = function() {
	};
	$MazeItCommon_PlayerPositionUpdate.$ctor = function(id, navigate) {
		var $this = {};
		$this.id = 0;
		$this.navigate = 0;
		$this.id = id;
		$this.navigate = navigate;
		return $this;
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.Rect
	var $MazeItCommon_Rect = function(left, top, right, bottom) {
		this.left = 0;
		this.right = 0;
		this.top = 0;
		this.bottom = 0;
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	};
	$MazeItCommon_Rect.prototype = {
		get_width: function() {
			return this.right - this.left;
		},
		get_height: function() {
			return this.bottom - this.top;
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.Status
	var $MazeItCommon_Status = function() {
	};
	$MazeItCommon_Status.prototype = { good: 0, bad: 1, same: 2 };
	ss.registerEnum(global, 'MazeItCommon.Status', $MazeItCommon_Status, false);
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.WallInfo
	var $MazeItCommon_WallInfo = function() {
		this.east = false;
		this.north = false;
		this.south = false;
		this.west = false;
	};
	$MazeItCommon_WallInfo.prototype = {
		startingPosition: function() {
			return this.south && this.north && this.east && this.west;
		},
		remove: function(direction) {
			switch (direction) {
				case 1: {
					this.north = false;
					break;
				}
				case 0: {
					this.south = false;
					break;
				}
				case 2: {
					this.east = false;
					break;
				}
				case 3: {
					this.west = false;
					break;
				}
			}
		},
		contains: function(direction) {
			switch (direction) {
				case 1: {
					return this.north;
				}
				case 0: {
					return this.south;
				}
				case 2: {
					return this.east;
				}
				case 3: {
					return this.west;
				}
			}
			return false;
		}
	};
	$MazeItCommon_WallInfo.$ctor1 = function(wallInfo) {
		this.east = false;
		this.north = false;
		this.south = false;
		this.west = false;
		this.east = wallInfo.east;
		this.west = wallInfo.west;
		this.north = wallInfo.north;
		this.south = wallInfo.south;
	};
	$MazeItCommon_WallInfo.$ctor1.prototype = $MazeItCommon_WallInfo.prototype;
	$MazeItCommon_WallInfo.all = function() {
		var b = new $MazeItCommon_WallInfo();
		b.south = true;
		b.north = true;
		b.east = true;
		b.west = true;
		return b;
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItCommon.WallPiece
	var $MazeItCommon_WallPiece = function() {
	};
	$MazeItCommon_WallPiece.prototype = { south: 0, north: 1, east: 2, west: 3 };
	ss.registerEnum(global, 'MazeItCommon.WallPiece', $MazeItCommon_WallPiece, false);
	ss.registerClass(global, 'MazeItCommon.Builder', $MazeItCommon_Builder);
	ss.registerClass(global, 'MazeItCommon.Carver', $MazeItCommon_Carver);
	ss.registerClass(global, 'MazeItCommon.MazeData', $MazeItCommon_MazeData);
	ss.registerClass(global, 'MazeItCommon.MazeGame', $MazeItCommon_MazeGame);
	ss.registerClass(global, 'MazeItCommon.MazeGameClientPlayer', $MazeItCommon_MazeGameClientPlayer);
	ss.registerClass(global, 'MazeItCommon.MoveDirection', $MazeItCommon_MoveDirection);
	ss.registerClass(global, 'MazeItCommon.PlayerPositionUpdate', $MazeItCommon_PlayerPositionUpdate);
	ss.registerClass(global, 'MazeItCommon.Rect', $MazeItCommon_Rect);
	ss.registerClass(global, 'MazeItCommon.WallInfo', $MazeItCommon_WallInfo);
})();
