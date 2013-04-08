(function() {
	////////////////////////////////////////////////////////////////////////////////
	// BlockadeServer.Program
	var $BlockadeServer_$Program = function() {
	};
	$BlockadeServer_$Program.$main = function() {
		//ExtensionMethods.debugger(""); 
		var http = require('http');
		var app = http.createServer(function(req, res) {
			res.end();
		});
		var io = require('socket.io').listen(app);
		var fs = require('fs');
		var port = 1800 + (ss.Int32.trunc(Math.random() * 4000) | 0);
		app.listen(port);
		io.set('log level', 0);
		io.sockets.on('connection', function(socket) {
			socket.on('Gateway.Message', function(data) {
			});
			socket.on('disconnect', function(data1) {
			});
		});
	};
	ss.registerClass(null, 'BlockadeServer.$Program', $BlockadeServer_$Program);
	$BlockadeServer_$Program.$main();
})();
