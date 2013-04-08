(function() {
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
	// Blockade.Extensions
	var $Blockade_Extensions = function() {
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
	// MazeItClient.MazeGameClient
	var $MazeItClient_$MazeGameClient = function(width, height, mainCanvasInfo, placeCanvasInfo) {
		this.$myMainCanvasInfo = null;
		this.$myPlaceCanvasInfo = null;
		this.$myHeight = 0;
		this.$startMouse = null;
		this.$myWidth = 0;
		this.$blockSize = 20;
		this.$dragging = false;
		this.$lineSize = 2;
		this.$positionOffset = new CommonLibraries.IntPoint(0, 0);
		this.$scaleOffset = 1;
		this.$scaling = false;
		MazeItCommon.MazeGame.call(this);
		this.$myWidth = width;
		this.$myHeight = height;
		this.$myMainCanvasInfo = mainCanvasInfo;
		this.$myPlaceCanvasInfo = placeCanvasInfo;
		this.$positionOffset.x += ss.Int32.div(this.$myWidth, 8);
		this.$positionOffset.y += ss.Int32.div(this.$myHeight, 8);
		this.$draw();
	};
	$MazeItClient_$MazeGameClient.prototype = {
		$touchDown: function(x, y) {
			this.$startMouse = new CommonLibraries.IntPoint(x, y);
		},
		$touchDrag: function(x, y) {
			if (ss.isNullOrUndefined(this.$startMouse)) {
				return;
			}
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
				this.$scaleOffset = Math.max(this.$scaleOffset + pd.y / 100, 0.35);
				this.$draw();
				return;
			}
			var b = false;
			switch (this.$getDirection(pd)) {
				case 1: {
					b = this.addMazePoint(new CommonLibraries.IntPoint(this.currentMazePoint.x, this.currentMazePoint.y - 1));
					break;
				}
				case 0: {
					b = this.addMazePoint(new CommonLibraries.IntPoint(this.currentMazePoint.x, this.currentMazePoint.y + 1));
					break;
				}
				case 3: {
					b = this.addMazePoint(new CommonLibraries.IntPoint(this.currentMazePoint.x - 1, this.currentMazePoint.y));
					break;
				}
				case 2: {
					b = this.addMazePoint(new CommonLibraries.IntPoint(this.currentMazePoint.x + 1, this.currentMazePoint.y));
					break;
				}
			}
			if (b) {
				this.$draw();
			}
			this.$startMouse = lastMous;
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
		$touchEnd: function() {
			this.$startMouse = null;
		},
		$pointDifference: function(startMouse, lastMous) {
			return new CommonLibraries.IntPoint(lastMous.x - startMouse.x, lastMous.y - startMouse.y);
		},
		$draw: function() {
			var canvas = this.$myMainCanvasInfo.context;
			canvas.save();
			canvas.clearRect(0, 0, this.$myWidth, this.$myHeight);
			canvas.fillStyle = 'white';
			canvas.translate(this.$positionOffset.x - this.currentMazePoint.x * this.$blockSize, this.$positionOffset.y - this.currentMazePoint.y * this.$blockSize);
			canvas.scale(this.$scaleOffset, this.$scaleOffset);
			canvas.lineCap = 'round';
			canvas.lineJoin = 'round';
			for (var i = 0; i < this.data.mazeSize; i++) {
				for (var a = 0; a < this.data.mazeSize; a++) {
					var i1 = i * this.$blockSize - this.currentMazePoint.x * this.$blockSize + this.$positionOffset.x;
					var a1 = a * this.$blockSize - this.currentMazePoint.y * this.$blockSize + this.$positionOffset.y;
					if (i1 > -this.$blockSize && i1 < this.$myWidth / this.$scaleOffset && a1 > -this.$blockSize && a1 < this.$myHeight / this.$scaleOffset) {
						if (this.data.walls[i][a].contains(3)) {
							canvas.fillRect((i + 1) * this.$blockSize, a * this.$blockSize - this.$lineSize * 2, this.$lineSize, this.$blockSize + this.$lineSize * 2);
						}
						if (this.data.walls[i][a].contains(2)) {
							canvas.fillRect(i * this.$blockSize - this.$lineSize, a * this.$blockSize - this.$lineSize * 2, this.$lineSize, this.$blockSize + this.$lineSize * 2);
						}
						if (this.data.walls[i][a].contains(1)) {
							canvas.fillRect(i * this.$blockSize - this.$lineSize * 2, a * this.$blockSize, this.$blockSize + this.$lineSize * 2, this.$lineSize);
						}
						if (this.data.walls[i][a].contains(0)) {
							canvas.fillRect(i * this.$blockSize - this.$lineSize * 2, (a + 1) * this.$blockSize - this.$lineSize, this.$blockSize + this.$lineSize * 2, this.$lineSize);
						}
					}
				}
			}
			this.$drawPlace();
			canvas.restore();
		},
		$drawPlace: function() {
			var canvas = this.$myPlaceCanvasInfo.context;
			canvas.save();
			canvas.clearRect(0, 0, this.$myWidth, this.$myHeight);
			canvas.translate(this.$positionOffset.x - this.currentMazePoint.x * this.$blockSize, this.$positionOffset.y - this.currentMazePoint.y * this.$blockSize);
			canvas.scale(this.$scaleOffset, this.$scaleOffset);
			canvas.lineCap = 'round';
			canvas.lineJoin = 'round';
			var vf = this.data.mazeBuilder.blockify(this.$blockSize);
			var inj = vf.length;
			if (inj > 1) {
				for (var $t1 = 0; $t1 < vf.length; $t1++) {
					var m = vf[$t1];
					var i1 = m.item1.x * this.$blockSize - this.currentMazePoint.x * this.$blockSize + this.$positionOffset.x;
					var a1 = m.item1.y * this.$blockSize - this.currentMazePoint.y * this.$blockSize + this.$positionOffset.y;
					if (i1 > -this.$blockSize && i1 < this.$myWidth / this.$scaleOffset && a1 > -this.$blockSize && a1 < this.$myHeight / this.$scaleOffset) {
						if (this.data.mazeBuilder.numHits[m.item1.x][m.item1.y]) {
							canvas.save();
							canvas.fillStyle = 'green';
							canvas.fillRect(m.item3.left, m.item3.top, m.item3.get_width(), m.item3.get_height());
							canvas.restore();
						}
						else {
							canvas.save();
							canvas.fillStyle = 'blue';
							canvas.fillRect(m.item3.left, m.item3.top, m.item3.get_width(), m.item3.get_height());
							canvas.restore();
						}
					}
				}
				for (var $t2 = 0; $t2 < vf.length; $t2++) {
					var m1 = vf[$t2];
					var i11 = m1.item1.x * this.$blockSize - this.currentMazePoint.x * this.$blockSize + this.$positionOffset.x;
					var a11 = m1.item1.y * this.$blockSize - this.currentMazePoint.y * this.$blockSize + this.$positionOffset.y;
					if (i11 > -this.$blockSize && i11 < this.$myWidth / this.$scaleOffset && a11 > -this.$blockSize && a11 < this.$myHeight / this.$scaleOffset) {
						this.$drawCircle(canvas, m1.item2.x, m1.item2.y, 'purple', this.$lineSize * 2);
					}
				}
				this.$drawCircle(canvas, this.currentMazePoint.x * this.$blockSize + ss.Int32.div(this.$blockSize, 2), this.currentMazePoint.y * this.$blockSize + ss.Int32.div(this.$blockSize, 2), 'red', this.$lineSize * 4);
			}
			else if (vf.length === 1) {
				this.$drawCircle(canvas, this.currentMazePoint.x * this.$blockSize + ss.Int32.div(this.$blockSize, 2), this.currentMazePoint.y * this.$blockSize + ss.Int32.div(this.$blockSize, 2), 'red', this.$lineSize * 4);
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
		},
		$resize: function(width, height) {
			this.$myWidth = width;
			this.$myHeight = height;
			this.$draw();
		}
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItClient.Program
	var $MazeItClient_$Program = function() {
		this.$mazeCanvasInfo = null;
		this.$mazeGame = null;
		this.$placeCanvasInfo = null;
		this.$myHeight = 0;
		this.$myWidth = 0;
	};
	$MazeItClient_$Program.prototype = {
		$start: function() {
			this.$myWidth = $(window).width();
			this.$myHeight = $(window).height();
			this.$setup();
			var stats = new xStats();
			KeyboardJS.bind.key('ctrl', ss.mkdel(this, function() {
				this.$mazeGame.$dragging = true;
			}), ss.mkdel(this, function() {
				this.$mazeGame.$dragging = false;
			}));
			KeyboardJS.bind.key('shift', ss.mkdel(this, function() {
				this.$mazeGame.$scaling = true;
			}), ss.mkdel(this, function() {
				this.$mazeGame.$scaling = false;
			}));
			window.addEventListener('resize', ss.mkdel(this, function(e) {
				this.$resizeCanvas();
			}));
			$(document).resize(ss.mkdel(this, function(e1) {
				this.$resizeCanvas();
			}));
			document.body.appendChild(stats.element);
			//
			//						var @lock=Document.Body.me().requestPointerLock ||
			//
			//						Document.Body.me().mozRequestPointerLock ||
			//
			//						Document.Body.me().webkitRequestPointerLock;
			//
			//						@lock();
		},
		$resizeCanvas: function() {
			this.$myWidth = $(window).width();
			this.$myHeight = $(window).height();
			this.$placeCanvasInfo.domCanvas.attr('width', this.$myWidth.toString());
			this.$placeCanvasInfo.domCanvas.attr('height', this.$myHeight.toString());
			this.$mazeCanvasInfo.domCanvas.attr('width', this.$myWidth.toString());
			this.$mazeCanvasInfo.domCanvas.attr('height', this.$myHeight.toString());
			this.$mazeGame.$resize(ss.Int32.trunc(this.$myWidth), ss.Int32.trunc(this.$myHeight));
		},
		$setup: function() {
			this.$mazeCanvasInfo = $Blockade_CanvasInformation.create(ss.Int32.trunc(this.$myWidth), ss.Int32.trunc(this.$myHeight));
			$(document.body).append(this.$mazeCanvasInfo.canvas);
			this.$mazeCanvasInfo.canvas.style.position = 'absolute';
			this.$mazeCanvasInfo.canvas.style.left = '0';
			this.$mazeCanvasInfo.canvas.style.top = '0';
			this.$placeCanvasInfo = $Blockade_CanvasInformation.create(ss.Int32.trunc(this.$myWidth), ss.Int32.trunc(this.$myHeight));
			$(document.body).append(this.$placeCanvasInfo.canvas);
			this.$placeCanvasInfo.canvas.style.position = 'absolute';
			this.$placeCanvasInfo.canvas.style.left = '0';
			this.$placeCanvasInfo.canvas.style.top = '0';
			this.$placeCanvasInfo.domCanvas.mousemove(ss.mkdel(this, function(a) {
				a.preventDefault();
				var cursorPosition = $MazeItClient_$Program.$getCursorPosition(a);
				this.$mazeGame.$touchDrag(ss.Int32.trunc(cursorPosition.x), ss.Int32.trunc(cursorPosition.y));
			}));
			this.$placeCanvasInfo.domCanvas.bind('touchstart', ss.mkdel(this, function(a1) {
				a1.preventDefault();
				var cursorPosition1 = $MazeItClient_$Program.$getCursorPosition(a1);
				this.$mazeGame.$touchDown(ss.Int32.trunc(cursorPosition1.x), ss.Int32.trunc(cursorPosition1.y));
			}));
			this.$placeCanvasInfo.domCanvas.bind('touchend', ss.mkdel(this, function(a2) {
				a2.preventDefault();
				this.$mazeGame.$touchEnd();
			}));
			this.$placeCanvasInfo.domCanvas.bind('touchmove', ss.mkdel(this, function(a3) {
				a3.preventDefault();
				var cursorPosition2 = $MazeItClient_$Program.$getCursorPosition(a3);
				this.$mazeGame.$touchDrag(ss.Int32.trunc(cursorPosition2.x), ss.Int32.trunc(cursorPosition2.y));
			}));
			this.$placeCanvasInfo.domCanvas.mousedown(ss.mkdel(this, function(a4) {
				a4.preventDefault();
				var cursorPosition3 = $MazeItClient_$Program.$getCursorPosition(a4);
				this.$mazeGame.$touchDown(ss.Int32.trunc(cursorPosition3.x), ss.Int32.trunc(cursorPosition3.y));
			}));
			this.$placeCanvasInfo.domCanvas.mouseup(ss.mkdel(this, function(a5) {
				a5.preventDefault();
				this.$mazeGame.$touchEnd();
			}));
			this.$mazeGame = new $MazeItClient_$MazeGameClient(ss.Int32.trunc(this.$myWidth), ss.Int32.trunc(this.$myHeight), this.$mazeCanvasInfo, this.$placeCanvasInfo);
		}
	};
	$MazeItClient_$Program.$main = function() {
		var $t1 = new $MazeItClient_$Program();
		$(ss.mkdel($t1, $t1.$start));
	};
	$MazeItClient_$Program.$getCursorPosition = function(ev) {
		if (!!(ev.originalEvent && ev.originalEvent.targetTouches && ev.originalEvent.targetTouches.length > 0)) {
			ev = ev.originalEvent.targetTouches[0];
		}
		if (!!(ss.isValue(ev.pageX) && ss.isValue(ev.pageY))) {
			return new $Blockade_Pointer(ev.pageX, ev.pageY, 0, ev.which === 3);
		}
		//if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
		return new $Blockade_Pointer(ev.clientX, ev.clientY, 0, ev.which === 3);
	};
	ss.registerClass(global, 'Blockade.CanvasInformation', $Blockade_CanvasInformation);
	ss.registerClass(global, 'Blockade.Extensions', $Blockade_Extensions);
	ss.registerClass(global, 'Blockade.Pointer', $Blockade_Pointer, CommonLibraries.Point);
	ss.registerClass(null, 'MazeItClient.$MazeGameClient', $MazeItClient_$MazeGameClient, MazeItCommon.MazeGame);
	ss.registerClass(null, 'MazeItClient.$Program', $MazeItClient_$Program);
	$Blockade_CanvasInformation.$blackPixel = null;
	$MazeItClient_$Program.$main();
})();
