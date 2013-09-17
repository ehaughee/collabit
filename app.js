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

var rooms = {};

/**
 * Routes
 */

app.get('/', function (req, res) {
  var session = "";

  do {
    session = makeid();
  } while (typeof rooms[session] !== "undefined");

  rooms[session] = { usernames: [] };

  res.redirect("/" + session);
});

app.get('/:id([A-Za-z0-9]{6})', function (req, res) {
  var session = req.params.id;

  if (typeof rooms[session] === "undefined") {
    rooms[session] = { usernames: [] };
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

function makeid() {
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

io.of('/chat').on('connection', function (socket) {

    socket.on('sendchat', function (data) {
      io.of('/chat').in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('adduser', function(username, room){
    console.log("adduser: " + username + " - " + room);
    if (username !== "" && !username.match(/server/i)) {
      if (typeof room !== "undefined" && room.match(/[A-Za-z0-9]{6}/) && typeof rooms[room] !== "undefined") {
        socket.join(room);
        socket.room = room;
      }
      else {
        socket.emit('error', 'Invalid room: ' + room);
        return;
      }

      socket.username = username;
      
      if (rooms[room].usernames.indexOf(username) === -1) {
      	rooms[room].usernames.push(username);
      }

  		socket.emit('updatechat', 'SERVER', 'you have connected to room ' + socket.room);
  		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', username + ' has connected');
  		io.of('/chat').emit('updateusers', rooms[room].usernames);
    }
    else {
      socket.emit('error', 'Invalid username: ' + username);
    }
	});

	socket.on('disconnect', function(){
    if (typeof rooms[socket.room] !== "undefined") {
      if (typeof rooms[socket.room].usernames !== "undefined") {
        delete rooms[socket.room].usernames[socket.username];
      }
      if (rooms[socket.room].usernames.length === 0) {
        console.log("Deleting empty room: " + rooms[socket.room]);
        delete rooms[socket.room];
      }
      else {
        io.of('/chat').emit('updateusers', rooms[socket.room].usernames);
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
      }
    }
	});
});

