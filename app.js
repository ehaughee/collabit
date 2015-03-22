/**
 * Module dependencies.
 */
var express = require('express')
  , sharejs = require('share').server
  , socket  = require('socket.io')
  , http = require('http')
  , path = require('path')
  , sanitizer = require('sanitizer')
  , Firebase = require("firebase");

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
  var room = "";

  do {
    room = makeid();
  } while (typeof rooms[room] !== "undefined");

  rooms[room] = { usernames: [] };

  res.redirect("/" + room);
});

app.get('/:room([A-Za-z0-9]{6})', function (req, res) {
  var room = sanitizer.escape(req.params.room);

  if (typeof rooms[room] === "undefined") {
    rooms[room] = { usernames: [] };
  }

  res.render('session', { title: 'Collabit', room: room });
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

  socket.on('sendchat', function (message) {
    message = sanitizer.escape(message);

    io.of('/chat').in(socket.room).emit('updatechat', socket.username, message);
  });

  socket.on('adduser', function(username, room){
    username = sanitizer.escape(username);
    room = sanitizer.escape(room);

    if (username !== "" && !username.match(/server/i)) {
      if (typeof room !== "undefined" && room.match(/[A-Za-z0-9]{6}/) && typeof rooms[room] !== "undefined") {
        socket.join(room);
        socket.room = room;
      }
      else {
        socket.emit('exception', 'Invalid room: ' + room);
        socket.disconnect();
        return;
      }

      if (rooms[room].usernames.indexOf(username) === -1) {
      	rooms[room].usernames.push(username);
        socket.username = username;

        socket.emit('updatechat', 'SERVER', 'you have connected to room ' + socket.room);
        socket.emit('addusersuccess', room);
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', username + ' has connected');
        io.of('/chat').emit('updateusers', rooms[room].usernames);
      }
      else {
        socket.emit('adduserfail', 'Invalid username, already in use: ' + username);
      }
    }
    else {
      socket.emit('adduserfail', 'Invalid username: ' + username);
    }
  });

  socket.on('changelang', function (lang) {
    lang = sanitizer.escape(lang);

    // TODO: Should probably do some validation on this
    io.of('/chat').in(socket.room).emit('updatelang', lang, socket.username);
  });

  socket.on('userleft', function () {
    console.log("SOCKET: userleft detected");
    socket.disconnect();
  });

	socket.on('disconnect', function() {
    console.log("SOCKET: disconnect detected");
    disconnect(socket);
	});
});

function disconnect(socket) {
  if (typeof rooms[socket.room] !== "undefined") {
    if (typeof rooms[socket.room].usernames !== "undefined") {
      console.log("Deleting user: " + socket.username);
      var temp = RemoveFromArray(socket.username, rooms[socket.room].usernames);
      if (temp === false && typeof username !== "undefined") {
        console.log('ERROR: Failed to remove: ' + username);
      }
    }
    if (rooms[socket.room].usernames.length === 0) {
      console.log("Deleting empty room: " + socket.room);
      delete rooms[socket.room];
    }
    else {
      socket.broadcast.to(socket.room).emit('updateusers', rooms[socket.room].usernames);
      socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    }
  }
}

function RemoveFromArray(obj, array) {
  if (array.indexOf) {
    var index = array.indexOf(obj);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    else {
      console.log("Object does not exist in array");
    }
  }
  else {
    console.log("Array.indexOf does not exist.  Unsupported function.");
  }

  return false;
}
