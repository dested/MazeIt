(function() {
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.Program
	var $Blockade_$Program = function() {
		this.$blockSize = 20;
		this.$currentMazePoint = null;
		this.$startMouse = null;
		this.$placeCanvasInfo = null;
		this.$mazeCanvasInfo = null;
		this.$myWidth = 0;
		this.$myHeight = 0;
		this.data = null;
		this.$positionOffset = new CommonLibraries.IntPoint(0, 0);
		this.$scaleOffset = 1;
		this.$dragging = false;
		this.$scaling = false;
		this.$lineSize = 2;
	};
	$Blockade_$Program.prototype = {
		$touchDown: function(x, y) {
			this.$startMouse = new CommonLibraries.IntPoint(x, y);
		},
		$touchDrag: function(x, y) {
			var lastMous = new CommonLibraries.IntPoint(x, y);
			var pd = this.$pointDifference(lastMous, this.$startMouse);
			//        if (Math.Abs(pd.X) < 5 || Math.Abs(pd.Y) < 5)
			//        {
			//        return;
			//        }
			if (this.$dragging) {
				this.$positionOffset.x += pd.x;
				this.$positionOffset.y += pd.y;
				this.$draw();
				return;
			}
			if (this.$scaling) {
				if (this.$scaleOffset < 0.25) {
					return;
				}
				this.$scaleOffset += pd.y / 100;
				this.$draw();
				return;
			}
			var b = false;
			switch (this.$getDirection(pd)) {
				case 1: {
					b = this.$addMazePoint(new CommonLibraries.IntPoint(this.$currentMazePoint.x, this.$currentMazePoint.y - 1));
					break;
				}
				case 0: {
					b = this.$addMazePoint(new CommonLibraries.IntPoint(this.$currentMazePoint.x, this.$currentMazePoint.y + 1));
					break;
				}
				case 3: {
					b = this.$addMazePoint(new CommonLibraries.IntPoint(this.$currentMazePoint.x - 1, this.$currentMazePoint.y));
					break;
				}
				case 2: {
					b = this.$addMazePoint(new CommonLibraries.IntPoint(this.$currentMazePoint.x + 1, this.$currentMazePoint.y));
					break;
				}
			}
			this.$startMouse = lastMous;
		},
		$pointDifference: function(startMouse, lastMous) {
			return new CommonLibraries.IntPoint(lastMous.x - startMouse.x, lastMous.y - startMouse.y);
		},
		$addMazePoint: function(p0) {
			var d;
			if (d = this.data.mazeBuilder.addIntPoint(p0, false) === 0) {
				this.$currentMazePoint = p0;
				this.$draw();
			}
			return d;
		},
		$getDirection: function(pd) {
			if (pd.x < 0) {
				if (Math.abs(pd.x) > Math.abs(pd.y)) {
					return 2;
				}
			}
			if (pd.x >= 0) {
				if (Math.abs(pd.x) > Math.abs(pd.y)) {
					return 3;
				}
			}
			if (pd.y > 0) {
				return 1;
			}
			if (pd.y <= 0) {
				return 0;
			}
			return 2;
		},
		$start: function() {
			var stats = new xStats();
			KeyboardJS.bind.key('ctrl', ss.mkdel(this, function() {
				this.$dragging = true;
			}), ss.mkdel(this, function() {
				this.$dragging = false;
			}));
			KeyboardJS.bind.key('shift', ss.mkdel(this, function() {
				this.$scaling = true;
			}), ss.mkdel(this, function() {
				this.$scaling = false;
			}));
			document.body.appendChild(stats.element);
			this.$currentMazePoint = new CommonLibraries.IntPoint(0, 0);
			this.data = new $Blockade_MazeData(100);
			var carver = new $Blockade_Carver(this.data);
			carver.walk();
			this.$myWidth = $(window).width() - 40;
			this.$myHeight = $(window).height() - 40;
			//
			//            var @lock=Document.Body.me().requestPointerLock ||
			//
			//            Document.Body.me().mozRequestPointerLock ||
			//
			//            Document.Body.me().webkitRequestPointerLock;
			//
			//            @lock();
			this.$setup();
			this.$draw();
		},
		$setup: function() {
			this.$mazeCanvasInfo = $Blockade_CanvasInformation.create(this.$myWidth, this.$myHeight);
			$(document.body).append(this.$mazeCanvasInfo.canvas);
			this.$mazeCanvasInfo.canvas.style.position = 'absolute';
			this.$mazeCanvasInfo.canvas.style.left = '0';
			this.$mazeCanvasInfo.canvas.style.top = '0';
			this.$placeCanvasInfo = $Blockade_CanvasInformation.create(this.$myWidth, this.$myHeight);
			$(document.body).append(this.$placeCanvasInfo.canvas);
			this.$placeCanvasInfo.canvas.style.position = 'absolute';
			this.$placeCanvasInfo.canvas.style.left = '0';
			this.$placeCanvasInfo.canvas.style.top = '0';
			this.$placeCanvasInfo.domCanvas.mousemove(ss.mkdel(this, function(a) {
				a.preventDefault();
				if (ss.isNullOrUndefined(this.$startMouse)) {
					return;
				}
				var cursorPosition = $Blockade_$Program.$getCursorPosition(a);
				this.$touchDrag(ss.Int32.trunc(cursorPosition.x), ss.Int32.trunc(cursorPosition.y));
			}));
			this.$placeCanvasInfo.domCanvas.mousedown(ss.mkdel(this, function(a1) {
				a1.preventDefault();
				var cursorPosition1 = $Blockade_$Program.$getCursorPosition(a1);
				this.$touchDown(ss.Int32.trunc(cursorPosition1.x), ss.Int32.trunc(cursorPosition1.y));
			}));
			this.$placeCanvasInfo.domCanvas.mouseup(ss.mkdel(this, function(a2) {
				a2.preventDefault();
				this.$startMouse = null;
			}));
		},
		$draw: function() {
			var canvas = this.$mazeCanvasInfo.context;
			canvas.save();
			canvas.clearRect(0, 0, this.$myWidth, this.$myHeight);
			canvas.fillStyle = 'black';
			//canvas.FillRect(0, 0, width, height);
			canvas.fillStyle = 'white';
			canvas.translate(ss.Int32.div(this.$myWidth, 2) - this.$currentMazePoint.x * this.$blockSize + this.$positionOffset.x, ss.Int32.div(this.$myHeight, 2) - this.$currentMazePoint.y * this.$blockSize + this.$positionOffset.y);
			canvas.scale(this.$scaleOffset, this.$scaleOffset);
			canvas.lineCap = 'round';
			canvas.lineJoin = 'round';
			for (var i = 0; i < this.data.mazeSize; i++) {
				for (var a = 0; a < this.data.mazeSize; a++) {
					if (ss.arrayGet(this.data.walls, i, a).contains(3)) {
						canvas.fillRect((i + 1) * this.$blockSize, a * this.$blockSize, this.$lineSize, this.$blockSize);
					}
					if (ss.arrayGet(this.data.walls, i, a).contains(2)) {
						canvas.fillRect(i * this.$blockSize - this.$lineSize, a * this.$blockSize, this.$lineSize, this.$blockSize);
					}
					if (ss.arrayGet(this.data.walls, i, a).contains(1)) {
						canvas.fillRect(i * this.$blockSize, a * this.$blockSize, this.$blockSize, this.$lineSize);
					}
					if (ss.arrayGet(this.data.walls, i, a).contains(0)) {
						canvas.fillRect(i * this.$blockSize, (a + 1) * this.$blockSize - this.$lineSize, this.$blockSize, this.$lineSize);
					}
				}
			}
			this.$drawPlace();
			canvas.restore();
		},
		$drawPlace: function() {
			var canvas = this.$placeCanvasInfo.context;
			canvas.save();
			canvas.clearRect(0, 0, this.$myWidth, this.$myHeight);
			canvas.translate(ss.Int32.div(this.$myWidth, 2) - this.$currentMazePoint.x * this.$blockSize + this.$positionOffset.x, ss.Int32.div(this.$myHeight, 2) - this.$currentMazePoint.y * this.$blockSize + this.$positionOffset.y);
			canvas.scale(this.$scaleOffset, this.$scaleOffset);
			canvas.lineCap = 'round';
			canvas.lineJoin = 'round';
			var vf = this.data.mazeBuilder.magnify(this.$blockSize);
			var inj = vf.length;
			if (inj > 1) {
				var fj = 0;
				var $t1 = $Blockade_$Program.$toRects(vf);
				for (var $t2 = 0; $t2 < $t1.length; $t2++) {
					var m = $t1[$t2];
					fj++;
					var pt = this.data.mazeBuilder.points[fj];
					if (ss.arrayGet(this.data.mazeBuilder.numHits, pt.x, pt.y)) {
						canvas.save();
						canvas.fillStyle = 'green';
						canvas.fillRect(m.item2.left, m.item2.top, m.item2.get_width(), m.item2.get_height());
						canvas.restore();
					}
					else {
						canvas.save();
						canvas.fillStyle = 'blue';
						canvas.fillRect(m.item2.left, m.item2.top, m.item2.get_width(), m.item2.get_height());
						canvas.restore();
					}
				}
				this.$drawCircle(canvas, this.$currentMazePoint.x * this.$blockSize + ss.Int32.div(this.$blockSize, 2), this.$currentMazePoint.y * this.$blockSize + ss.Int32.div(this.$blockSize, 2), 'red', this.$lineSize * 4);
			}
			else if (vf.length === 1) {
				this.$drawCircle(canvas, this.$currentMazePoint.x * this.$blockSize + ss.Int32.div(this.$blockSize, 2), this.$currentMazePoint.y * this.$blockSize + ss.Int32.div(this.$blockSize, 2), 'red', this.$lineSize * 4);
			}
			else if (vf.length === 0) {
			}
			canvas.restore();
		},
		$drawCircle: function(context, x, y, radgrad, size) {
			context.save();
			context.translate(x, y);
			context.fillStyle = radgrad;
			context.beginPath();
			context.arc(0, 0, size / 2, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
			context.restore();
		}
	};
	$Blockade_$Program.$main = function() {
		var $t1 = new $Blockade_$Program();
		$(ss.mkdel($t1, $t1.$start));
	};
	$Blockade_$Program.$getCursorPosition = function(ev) {
		if (!!(ev.originalEvent && ev.originalEvent.targetTouches && ev.originalEvent.targetTouches.length > 0)) {
			ev = ev.originalEvent.targetTouches[0];
		}
		if (!!(ss.isValue(ev.pageX) && ss.isValue(ev.pageY))) {
			return new $Blockade_Pointer(ev.pageX, ev.pageY, 0, ev.which === 3);
		}
		//if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
		return new $Blockade_Pointer(ev.clientX, ev.clientY, 0, ev.which === 3);
	};
	$Blockade_$Program.$toRects = function(vf) {
		var lst = [];
		for (var index = 0; index < vf.length - 1; index++) {
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
			cur = new $Blockade_Rect(left, top, right, bottom);
			ss.add(lst, { item1: point, item2: cur });
		}
		return lst;
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.Builder
	var $Blockade_Builder = function(wallInfo) {
		this.points = null;
		this.numHits = null;
		this.$theWalls = null;
		this.$theWalls = wallInfo;
		this.numHits = ss.multidimArray(false, wallInfo.length, wallInfo.length);
		ss.arraySet(this.numHits, 0, 0, true);
		this.points = [];
		this.addIntPoint(new CommonLibraries.IntPoint(0, 0), true);
	};
	$Blockade_Builder.prototype = {
		addIntPoint: function(p, wasBad) {
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
				if (ss.arrayGet(this.$theWalls, p.x, p.y).contains(2)) {
					return 1;
				}
			}
			else if (pr.x - 1 === p.x) {
				if (ss.arrayGet(this.$theWalls, p.x, p.y).contains(3)) {
					return 1;
				}
			}
			else if (pr.y + 1 === p.y) {
				if (ss.arrayGet(this.$theWalls, p.x, p.y).contains(1)) {
					return 1;
				}
			}
			else if (pr.y - 1 === p.y) {
				if (ss.arrayGet(this.$theWalls, p.x, p.y).contains(0)) {
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
			ss.arraySet(this.numHits, p.x, p.y, !ss.arrayGet(this.numHits, p.x, p.y));
			//
			//            var pm = Points[Points.Count - 1];
			//
			//            NumHits[pm.X, pm.Y] = !NumHits[pm.X, pm.Y];
			ss.add(this.points, p);
			return 0;
		},
		magnify: function(blockSize) {
			var ps = [];
			for (var $t1 = 0; $t1 < this.points.length; $t1++) {
				var IntPoint = this.points[$t1];
				ss.add(ps, new CommonLibraries.IntPoint(IntPoint.x * blockSize + ss.Int32.div(blockSize, 2), IntPoint.y * blockSize + ss.Int32.div(blockSize, 2)));
			}
			return ps;
		}
	};
	$Blockade_Builder.magnify = function(IntPoints, blockSize, offset) {
		var ps = [];
		for (var $t1 = 0; $t1 < IntPoints.length; $t1++) {
			var IntPoint = IntPoints[$t1];
			ss.add(ps, new CommonLibraries.IntPoint(ss.Int32.trunc(IntPoint.x * blockSize) + ss.Int32.trunc(blockSize / 2) + offset.x, ss.Int32.trunc(IntPoint.y * blockSize) + ss.Int32.trunc(blockSize / 2) + offset.y));
		}
		return ps;
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.CanvasInformation
	var $Blockade_CanvasInformation = function(context, domCanvas) {
		this.context = null;
		this.domCanvas = null;
		this.canvas = null;
		this.context = context;
		this.domCanvas = domCanvas;
		this.canvas = domCanvas[0];
	};
	$Blockade_CanvasInformation.get_blackPixel = function() {
		if (ss.isNullOrUndefined($Blockade_CanvasInformation.$blackPixel)) {
			var m = $Blockade_CanvasInformation.create(0, 0);
			m.context.fillStyle = 'black';
			m.context.fillRect(0, 0, 1, 1);
			$Blockade_CanvasInformation.$blackPixel = m.canvas;
		}
		return $Blockade_CanvasInformation.$blackPixel;
	};
	$Blockade_CanvasInformation.create = function(w, h) {
		var canvas = document.createElement('canvas');
		return $Blockade_CanvasInformation.create$1(canvas, w, h);
	};
	$Blockade_CanvasInformation.create$1 = function(canvas, w, h) {
		if (w === 0) {
			w = 1;
		}
		if (h === 0) {
			h = 1;
		}
		canvas.width = w;
		canvas.height = h;
		var ctx = canvas.getContext('2d');
		return new $Blockade_CanvasInformation(ctx, $(canvas));
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.Carver
	var $Blockade_Carver = function(data) {
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
	$Blockade_Carver.prototype = {
		walk: function() {
			this.bw = ss.multidimArray(false, this.data.mazeSize, this.data.mazeSize);
			this.walker(0, 0);
		},
		walker: function(cx, cy) {
			var $t1 = this.$randomizeEach();
			for (var $t2 = 0; $t2 < $t1.length; $t2++) {
				var direction = $t1[$t2];
				var nx = cx + this.$getDX(direction);
				var ny = cy + this.$getDY(direction);
				if (ny >= 0 && ny <= this.data.mazeSize - 1 && nx >= 0 && nx <= this.data.mazeSize - 1 && !ss.arrayGet(this.bw, nx, ny)) {
					//if (!bw[nx][ny]) 
					{
						ss.arraySet(this.bw, nx, ny, true);
						ss.arrayGet(this.data.walls, cx, cy).remove(direction);
						ss.arrayGet(this.data.walls, nx, ny).remove(this.$getOpposite(direction));
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
	// Blockade.Extensions
	var $Blockade_Extensions = function() {
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.MazeData
	var $Blockade_MazeData = function(mazeSize) {
		this.mazeSize = 0;
		this.walls = null;
		this.mazeBuilder = null;
		this.mazeSize = mazeSize;
		this.walls = ss.multidimArray(null, mazeSize, mazeSize);
		for (var i = 0; i < this.mazeSize; i++) {
			for (var a = 0; a < this.mazeSize; a++) {
				ss.arraySet(this.walls, i, a, $Blockade_WallInfo.all());
			}
		}
		this.mazeBuilder = new $Blockade_Builder(this.walls);
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.Pointer
	var $Blockade_Pointer = function(x, y, delta, right) {
		this.delta = 0;
		this.right = false;
		CommonLibraries.Point.call(this, x, y);
		this.delta = delta;
		this.right = right;
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.Rect
	var $Blockade_Rect = function(left, top, right, bottom) {
		this.left = 0;
		this.right = 0;
		this.top = 0;
		this.bottom = 0;
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	};
	$Blockade_Rect.prototype = {
		get_width: function() {
			return this.right - this.left;
		},
		get_height: function() {
			return this.bottom - this.top;
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.Status
	var $Blockade_Status = function() {
	};
	$Blockade_Status.prototype = { good: 0, bad: 1, same: 2 };
	ss.registerEnum(global, 'Blockade.Status', $Blockade_Status, false);
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.WallInfo
	var $Blockade_WallInfo = function() {
		this.east = false;
		this.north = false;
		this.south = false;
		this.west = false;
	};
	$Blockade_WallInfo.prototype = {
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
	$Blockade_WallInfo.all = function() {
		var b = new $Blockade_WallInfo();
		b.south = true;
		b.north = true;
		b.east = true;
		b.west = true;
		return b;
	};
	////////////////////////////////////////////////////////////////////////////////
	// Blockade.WallPiece
	var $Blockade_WallPiece = function() {
	};
	$Blockade_WallPiece.prototype = { south: 0, north: 1, east: 2, west: 3 };
	ss.registerEnum(global, 'Blockade.WallPiece', $Blockade_WallPiece, false);
	ss.registerClass(null, 'Blockade.$Program', $Blockade_$Program);
	ss.registerClass(global, 'Blockade.Builder', $Blockade_Builder);
	ss.registerClass(global, 'Blockade.CanvasInformation', $Blockade_CanvasInformation);
	ss.registerClass(global, 'Blockade.Carver', $Blockade_Carver);
	ss.registerClass(global, 'Blockade.Extensions', $Blockade_Extensions);
	ss.registerClass(global, 'Blockade.MazeData', $Blockade_MazeData);
	ss.registerClass(global, 'Blockade.Pointer', $Blockade_Pointer, CommonLibraries.Point);
	ss.registerClass(global, 'Blockade.Rect', $Blockade_Rect);
	ss.registerClass(global, 'Blockade.WallInfo', $Blockade_WallInfo);
	$Blockade_CanvasInformation.$blackPixel = null;
	$Blockade_$Program.$main();
})();
