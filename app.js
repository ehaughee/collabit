
/**
 * Module dependencies.
 */

var express = require('express')
  , sharejs = require('share').server
  , socket  = require('socket.io')
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

// TODO: Make this a dictionary key = room name, value = username list 
//       and maybe other info
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
var io = require('socket.io').listen(server);

// TODO: Make rooms contain usernames list
var usernames = {};
io.of('/chat').on('connection', function (socket) {

  socket.on('sendchat', function (data) {
		io.of('/chat').in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('adduser', function(username, room){
    console.log("adduser: " + username + " - " + room);
    if (username !== "" || !username.match(/server/i)) {
      socket.username = username;
      usernames[username] = username;

      if (typeof room !== "undefined" && room.match(/[A-Za-z0-9]{6}/) && rooms.indexOf(room) !== -1) {
        socket.join(room);
        socket.room = room;
      }
      else {
        socket.emit('error', 'Invalid room: ' + room);
      }

  		socket.emit('updatechat', 'SERVER', 'you have connected to ' + socket.room);
  		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', username + ' has connected');
  		// io.sockets.emit('updateusers', usernames);
    }
    else {
      socket.emit('error', 'Invalid username: ' + username);
    }
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		// io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});

