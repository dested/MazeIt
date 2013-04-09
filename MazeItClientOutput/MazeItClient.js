(function() {
	////////////////////////////////////////////////////////////////////////////////
	// MazeItClient.MazeGameClient
	var $MazeItClient_$MazeGameClient = function(program, width, height, mainCanvasInfo, placeCanvasInfo, players, current, loadedData) {
		this.$myCurrent = null;
		this.$myMainCanvasInfo = null;
		this.$myPlaceCanvasInfo = null;
		this.$myProgram = null;
		this.$blockSize = 20;
		this.$dragging = false;
		this.$lineSize = 2;
		this.$myHeight = 0;
		this.$myWidth = 0;
		this.$positionOffset = new CommonLibraries.IntPoint(0, 0);
		this.$scaleOffset = 1;
		this.$scaling = false;
		this.$startMouse = null;
		MazeItCommon.MazeGame.call(this, players, current, loadedData);
		this.$myProgram = program;
		this.$myWidth = width;
		this.$myHeight = height;
		this.$myMainCanvasInfo = mainCanvasInfo;
		this.$myPlaceCanvasInfo = placeCanvasInfo;
		this.$myCurrent = current;
		this.$draw();
	};
	$MazeItClient_$MazeGameClient.prototype = {
		get_$currentBuilder: function() {
			return this.mazeBuilders[this.$myCurrent.id];
		},
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
			var direction = this.$getDirection(pd);
			switch (direction) {
				case 1: {
					b = this.get_$currentBuilder().addMazePoint(new CommonLibraries.IntPoint(this.get_$currentBuilder().currentMazePoint.x, this.get_$currentBuilder().currentMazePoint.y - 1));
					break;
				}
				case 0: {
					b = this.get_$currentBuilder().addMazePoint(new CommonLibraries.IntPoint(this.get_$currentBuilder().currentMazePoint.x, this.get_$currentBuilder().currentMazePoint.y + 1));
					break;
				}
				case 3: {
					b = this.get_$currentBuilder().addMazePoint(new CommonLibraries.IntPoint(this.get_$currentBuilder().currentMazePoint.x - 1, this.get_$currentBuilder().currentMazePoint.y));
					break;
				}
				case 2: {
					b = this.get_$currentBuilder().addMazePoint(new CommonLibraries.IntPoint(this.get_$currentBuilder().currentMazePoint.x + 1, this.get_$currentBuilder().currentMazePoint.y));
					break;
				}
			}
			if (b) {
				this.$myProgram.$pushMoveDirection(MazeItCommon.MoveDirection.$ctor(direction, this.get_$currentBuilder().points.length));
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
			this.$positionOffset.x = Math.max(Math.min(ss.Int32.div(this.$myWidth, 2) - this.get_$currentBuilder().currentMazePoint.x * this.$blockSize, ss.Int32.div(this.$myWidth, 8)), -this.data.mazeSize * this.$blockSize + (this.$myWidth - ss.Int32.div(this.$myWidth, 8)));
			this.$positionOffset.y = Math.max(Math.min(ss.Int32.div(this.$myHeight, 2) - this.get_$currentBuilder().currentMazePoint.y * this.$blockSize, ss.Int32.div(this.$myHeight, 8)), -this.data.mazeSize * this.$blockSize + (this.$myHeight - ss.Int32.div(this.$myHeight, 8)));
			var canvas = this.$myMainCanvasInfo.context;
			canvas.save();
			canvas.clearRect(0, 0, this.$myWidth, this.$myHeight);
			canvas.fillStyle = 'white';
			canvas.translate(this.$positionOffset.x, this.$positionOffset.y);
			canvas.scale(this.$scaleOffset, this.$scaleOffset);
			canvas.lineCap = 'round';
			canvas.lineJoin = 'round';
			for (var i = 0; i < this.data.mazeSize; i++) {
				for (var a = 0; a < this.data.mazeSize; a++) {
					var i1 = i * this.$blockSize + this.$positionOffset.x;
					var a1 = a * this.$blockSize + this.$positionOffset.y;
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
			canvas.translate(this.$positionOffset.x, this.$positionOffset.y);
			canvas.scale(this.$scaleOffset, this.$scaleOffset);
			var offsets = [0, 1, -1, 2, -2, 3, -3];
			var index = 0;
			var $t1 = new ss.ObjectEnumerator(this.mazeBuilders);
			try {
				while ($t1.moveNext()) {
					var mazeBuilder = $t1.current();
					var currentBuilder = mazeBuilder.value;
					var vf = currentBuilder.blockify(this.$blockSize, offsets[index++]);
					var inj = vf.length;
					if (inj > 1) {
						for (var $t2 = 0; $t2 < vf.length; $t2++) {
							var m = vf[$t2];
							var i1 = m.item1.x * this.$blockSize + this.$positionOffset.x;
							var a1 = m.item1.y * this.$blockSize + this.$positionOffset.y;
							if (i1 > -this.$blockSize && i1 < this.$myWidth / this.$scaleOffset && a1 > -this.$blockSize && a1 < this.$myHeight / this.$scaleOffset) {
								if (currentBuilder.numHits[m.item1.x][m.item1.y]) {
									canvas.save();
									canvas.fillStyle = MazeItCommon.Extensions.shadeColor(currentBuilder.get_color(), 40);
									canvas.fillRect(m.item3.left, m.item3.top, m.item3.get_width(), m.item3.get_height());
									canvas.restore();
								}
								else {
									canvas.save();
									canvas.fillStyle = MazeItCommon.Extensions.shadeColor(currentBuilder.get_color(), -40);
									canvas.fillRect(m.item3.left, m.item3.top, m.item3.get_width(), m.item3.get_height());
									canvas.restore();
								}
							}
						}
						for (var $t3 = 0; $t3 < vf.length; $t3++) {
							var m1 = vf[$t3];
							var i11 = m1.item1.x * this.$blockSize + this.$positionOffset.x;
							var a11 = m1.item1.y * this.$blockSize + this.$positionOffset.y;
							if (i11 > -this.$blockSize && i11 < this.$myWidth / this.$scaleOffset && a11 > -this.$blockSize && a11 < this.$myHeight / this.$scaleOffset) {
								this.$drawCircle(canvas, m1.item2.x, m1.item2.y, 'purple', this.$lineSize * 2);
							}
						}
						this.$drawCircle(canvas, currentBuilder.currentMazePoint.x * this.$blockSize + ss.Int32.div(this.$blockSize, 2), currentBuilder.currentMazePoint.y * this.$blockSize + ss.Int32.div(this.$blockSize, 2), currentBuilder.get_color(), this.$lineSize * 5);
					}
					else if (vf.length === 1) {
						this.$drawCircle(canvas, currentBuilder.currentMazePoint.x * this.$blockSize + ss.Int32.div(this.$blockSize, 2), currentBuilder.currentMazePoint.y * this.$blockSize + ss.Int32.div(this.$blockSize, 2), currentBuilder.get_color(), this.$lineSize * 5);
					}
					else if (vf.length === 0) {
					}
				}
			}
			finally {
				$t1.dispose();
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
		this.$client = null;
		this.$directions = [];
		this.$myHeight = 0;
		this.$myWidth = 0;
		this.$shuffUIManager = null;
	};
	$MazeItClient_$Program.prototype = {
		$start: function() {
			this.$myWidth = $(window).width();
			this.$myHeight = $(window).height();
			var stats = new xStats();
			document.body.appendChild(stats.element);
			this.$client = io.connect('198.211.107.235:4484');
			window.addEventListener('scroll', function(e) {
				window.scrollTo(0, 0);
				e.stopImmediatePropagation();
			});
			this.$shuffUIManager = new WebLibraries.ShuffUI.ShuffUI.ShuffUIManager();
			var waitingRoom = new $MazeItClient_$WaitingRoomUI(this.$shuffUIManager, this);
			var players = null;
			var currentPlayer = null;
			var currentPlayerID = 0;
			this.$client.on('MazeGame.PlayerLeft', ss.mkdel(this, function(data) {
				delete this.$mazeGame.mazeBuilders[data.id];
				this.$mazeGame.$draw();
			}));
			this.$client.on('MazeGame.PlayerWon', function(data1) {
				window.alert('Player ' + data1 + ' Won!');
			});
			var updates = [];
			this.$client.on('MazeGame.PlayerPositionUpdates', function(data2) {
				ss.arrayAddRange(updates, data2);
			});
			window.setInterval(ss.mkdel(this, function() {
				if (updates.length > 0) {
					var update = updates[0];
					this.$mazeGame.mazeBuilders[update.id].navigate(update.navigate);
					this.$mazeGame.$draw();
					ss.removeAt(updates, 0);
				}
			}), 75);
			this.$client.on('MazeGame.MazeData', ss.mkdel(this, function(data3) {
				this.$setupGame(players, currentPlayer, new MazeItCommon.MazeData.$ctor1(data3.mazeSize, data3.walls));
			}));
			this.$client.on('MazeGame.PlayerInfo', function(data4) {
				for (var $t1 = 0; $t1 < data4.length; $t1++) {
					var mazeGameClientPlayer = data4[$t1];
					if (mazeGameClientPlayer.id === currentPlayerID) {
						currentPlayer = mazeGameClientPlayer;
					}
				}
				players = data4;
			});
			this.$client.on('MazeGame.PlayerReflect', function(data5) {
				currentPlayerID = data5;
			});
			//  SetupGame();
			//
			//                        var @lock=Document.Body.me().requestPointerLock ||
			//
			//                        Document.Body.me().mozRequestPointerLock ||
			//
			//                        Document.Body.me().webkitRequestPointerLock;
			//
			//                        @lock();
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
		$setupGame: function(players, current, loadedData) {
			this.$mazeCanvasInfo = $MazeItClient_CanvasInformation.create(ss.Int32.trunc(this.$myWidth), ss.Int32.trunc(this.$myHeight));
			$(document.body).append(this.$mazeCanvasInfo.canvas);
			this.$mazeCanvasInfo.canvas.style.position = 'absolute';
			this.$mazeCanvasInfo.canvas.style.left = '0';
			this.$mazeCanvasInfo.canvas.style.top = '0';
			this.$placeCanvasInfo = $MazeItClient_CanvasInformation.create(ss.Int32.trunc(this.$myWidth), ss.Int32.trunc(this.$myHeight));
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
			KeyboardJS.bind.key('ctrl', ss.mkdel(this, function() {
				this.$mazeGame.$dragging = true;
			}), ss.mkdel(this, function() {
				this.$mazeGame.$dragging = false;
			}));
			//
			//            KeyboardJS.Instance().Bind.Key("shift",
			//
			//            () => { MazeGame.scaling = true; },
			//
			//            () => { MazeGame.scaling = false; });
			window.addEventListener('resize', ss.mkdel(this, function(e) {
				this.$resizeCanvas();
			}));
			$(document).resize(ss.mkdel(this, function(e1) {
				this.$resizeCanvas();
			}));
			window.setInterval(ss.mkdel(this, this.$flushMoveQueue), 500);
			this.$mazeGame = new $MazeItClient_$MazeGameClient(this, ss.Int32.trunc(this.$myWidth), ss.Int32.trunc(this.$myHeight), this.$mazeCanvasInfo, this.$placeCanvasInfo, players, current, loadedData);
		},
		$flushMoveQueue: function() {
			if (this.$directions.length > 0) {
				this.$client.emit('GameRoom.PlayerMoves', this.$directions);
				this.$directions = [];
			}
		},
		$pushMoveDirection: function(direction) {
			ss.add(this.$directions, direction);
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
			return new $MazeItClient_Pointer(ev.pageX, ev.pageY, 0, ev.which === 3);
		}
		//if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
		return new $MazeItClient_Pointer(ev.clientX, ev.clientY, 0, ev.which === 3);
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItClient.WaitingRoomUI
	var $MazeItClient_$WaitingRoomUI = function(shuffUIManager, program) {
		this.$uiWindow = null;
		this.$currentVote = false;
		var $t1 = new WebLibraries.ShuffUI.ShuffUI.ShuffWindow();
		$t1.title = 'Login';
		$t1.set_x($('body').innerWidth() - 500);
		$t1.set_y(100);
		$t1.set_width(CommonLibraries.Number.op_Implicit$2(280));
		$t1.set_height(CommonLibraries.Number.op_Implicit$2(165));
		$t1.allowClose = true;
		$t1.allowMinimize = true;
		$t1.set_visible(true);
		this.$uiWindow = shuffUIManager.createWindow($t1);
		var playersInRoom;
		var voteCountPlayers;
		this.$uiWindow.addElement(WebLibraries.ShuffUI.ShuffUI.ShuffLabel).call(this.$uiWindow, playersInRoom = new WebLibraries.ShuffUI.ShuffUI.ShuffLabel(40, 40, 'Players in waiting room: ' + 0));
		this.$uiWindow.addElement(WebLibraries.ShuffUI.ShuffUI.ShuffLabel).call(this.$uiWindow, voteCountPlayers = new WebLibraries.ShuffUI.ShuffUI.ShuffLabel(40, 80, 'Players voted to start: ' + 0));
		this.$uiWindow.addElement(WebLibraries.ShuffUI.ShuffUI.ShuffButton).call(this.$uiWindow, new WebLibraries.ShuffUI.ShuffUI.ShuffButton(55, 150, CommonLibraries.Number.op_Implicit$2(90), CommonLibraries.Number.op_Implicit$2(30), ss.makeGenericType(CommonLibraries.DelegateOrValue$1, [String]).op_Implicit$2('Vote To Start'), ss.mkdel(this, function(e) {
			this.$currentVote = !this.$currentVote;
			program.$client.emit('WaitingRoom.VoteStart', this.$currentVote);
		})));
		program.$client.on('WaitingRoom.PlayerCountChanged', function(data) {
			playersInRoom.set_text('Players in waiting room: ' + data);
		});
		program.$client.on('WaitingRoom.VoteStartChanged', function(data1) {
			voteCountPlayers.set_text('Players voted to start: ' + data1);
		});
		program.$client.on('WaitingRoom.GameBeginning', ss.mkdel(this, function(data2) {
			this.$uiWindow.swingAway(7, false);
		}));
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItClient.CanvasInformation
	var $MazeItClient_CanvasInformation = function(context, domCanvas) {
		this.context = null;
		this.domCanvas = null;
		this.canvas = null;
		this.context = context;
		this.domCanvas = domCanvas;
		this.canvas = domCanvas[0];
	};
	$MazeItClient_CanvasInformation.get_blackPixel = function() {
		if (ss.isNullOrUndefined($MazeItClient_CanvasInformation.$blackPixel)) {
			var m = $MazeItClient_CanvasInformation.create(0, 0);
			m.context.fillStyle = 'black';
			m.context.fillRect(0, 0, 1, 1);
			$MazeItClient_CanvasInformation.$blackPixel = m.canvas;
		}
		return $MazeItClient_CanvasInformation.$blackPixel;
	};
	$MazeItClient_CanvasInformation.create = function(w, h) {
		var canvas = document.createElement('canvas');
		return $MazeItClient_CanvasInformation.create$1(canvas, w, h);
	};
	$MazeItClient_CanvasInformation.create$1 = function(canvas, w, h) {
		if (w === 0) {
			w = 1;
		}
		if (h === 0) {
			h = 1;
		}
		canvas.width = w;
		canvas.height = h;
		var ctx = canvas.getContext('2d');
		return new $MazeItClient_CanvasInformation(ctx, $(canvas));
	};
	////////////////////////////////////////////////////////////////////////////////
	// MazeItClient.Pointer
	var $MazeItClient_Pointer = function(x, y, delta, right) {
		this.delta = 0;
		this.right = false;
		CommonLibraries.Point.call(this, x, y);
		this.delta = delta;
		this.right = right;
	};
	ss.registerClass(null, 'MazeItClient.$MazeGameClient', $MazeItClient_$MazeGameClient, MazeItCommon.MazeGame);
	ss.registerClass(null, 'MazeItClient.$Program', $MazeItClient_$Program);
	ss.registerClass(null, 'MazeItClient.$WaitingRoomUI', $MazeItClient_$WaitingRoomUI);
	ss.registerClass(global, 'MazeItClient.CanvasInformation', $MazeItClient_CanvasInformation);
	ss.registerClass(global, 'MazeItClient.Pointer', $MazeItClient_Pointer, CommonLibraries.Point);
	$MazeItClient_CanvasInformation.$blackPixel = null;
	$MazeItClient_$Program.$main();
})();
