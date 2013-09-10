
/**
 * Module dependencies.
 */

var express = require('express')
  , sharejs = require('share').server
  // , routes = require('./routes')
  // , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var rooms = [];

/**
 * Routes
 */

app.get('/', function (req, res) {
  var session = "";

  do {
    session = makeid();
  } while (rooms.indexOf(session) !== -1);

  rooms.push(session);

  res.redirect("/" + session);
});

app.get('/:id([A-Za-z0-9]{6})', function (req, res) {
  var session = req.params.id;

  if (rooms.indexOf(session) === -1) {
    rooms.push(session);
  }

  res.render('session', { title: 'Collabit', session: session });
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/**
 * ShareJS Code
 */

var options = {db: {type: 'none'}};
sharejs.attach(app, options);

function makeid()
{
  var text = [];
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0; i < 6; i++) {
    text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }

  return text.join("");
}

/**
 * Socket.IO Code
 */
// var io = require('socket.io').listen(server);

// var usernames = {};
// io.sockets.on('connection', function (socket) {
//   console.log("LOG: Connection detected");

//   socket.on('sendcode', function(code) {
//     io.sockets.emit('updateeditor', code);
//   });

//   socket.on('sendchat', function (data) {
// 		io.sockets.emit('updatechat', socket.username, data);
// 	});

// 	socket.on('adduser', function(username){
// 		socket.username = username;
// 		usernames[username] = username;
// 		socket.emit('updatechat', 'SERVER', 'you have connected');
// 		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
// 		io.sockets.emit('updateusers', usernames);
// 	});

// 	socket.on('disconnect', function(){
// 		delete usernames[socket.username];
// 		io.sockets.emit('updateusers', usernames);
// 		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
// 	});
// });

