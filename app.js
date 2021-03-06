"use strict";

/**
 * Module dependencies.
 */
var express = require('express')
  , logger = require('morgan')
  , methodOverride = require('method-override')
  , bodyParser = require('body-parser')
  , sharejs = require('share').server
  , socket  = require('socket.io')
  , http = require('http')
  , path = require('path')
  , sassMiddleware = require('node-sass-middleware')
  , config = require('config')
  , _ = require('underscore');

// Globals
var Room = function() { return { usernames: [], language: "" }; };
var app = express();
var rooms = {};

// Set up input validator
var validate = require('./util/validate')(rooms, { maxUserNameLength: config.get('app.max_username_length') });

// Constants
var IS_PROD_ENV = 'production' == app.get('env');
var MAX_ROOM_NAME_LENGTH = config.get('app.max_room_name_length');

// Middleware
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());

// Sass
app.use(sassMiddleware({
  root: __dirname,
  src: 'sass',
  dest: path.join('public', 'stylesheets'),
  debug: !IS_PROD_ENV,
  sourceMap: !IS_PROD_ENV,
  prefix: '/stylesheets'
}));

// Statics
app.use(express.static(path.join(__dirname, 'public')));

// Production specific middleware
if (IS_PROD_ENV) {
  var errorhandler = require('errorhandler');
  app.use(errorhandler());
}


/**
 * Routes
 */
app.get('/', function (req, res) {
  var room = "";

  // TODO: Make into a GetRoomName function
  do {
    room = makeid();
  } while (typeof rooms[room] !== "undefined");

  rooms[room] = Room();

  res.redirect("/" + room);
});

app.get('/:room([A-Za-z0-9]{6})', function (req, res) {
  var room = _.escape(req.params.room);

  if (typeof rooms[room] === "undefined") {
    rooms[room] = Room();
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

// TODO: Explore better ways to generate a room name?
function makeid() {
  var text = [];
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0; i < MAX_ROOM_NAME_LENGTH; i++) {
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
    message = _.escape(message);

    io.of('/chat').in(socket.room).emit('updatechat', socket.username, message);
  });

  socket.on('adduser', function(username, room) {
    room = _.escape(room);

    validate.room(room, function (err, isRoomValid) {
      if (err) {
        socket.emit(err.name, err.arg);
        socket.disconnect();
      }

      if (isRoomValid) {
        socket.join(room);
        socket.room = room;

        validate.username(username, room, function (err, isUsernameValid) {
          if (err) {
            socket.emit(err.name, err.arg);
          }

          if (isUsernameValid) {
            rooms[room].usernames.push(username);
            socket.username = username;

            socket.emit('updatechatserver', 'you have connected to room ' + socket.room);
            socket.emit('addusersuccess', room);

            if (rooms[room].language !== "") {
              socket.emit('updatelang', rooms[room].language, "SERVER");
            }

            socket.broadcast.to(socket.room).emit('updatechatserver', username + ' has connected');
            io.of('/chat').emit('updateusers', rooms[room].usernames);
          }
        });
      }
    });
  });

  socket.on('changelang', function (lang) {
    lang = _.escape(lang);

    rooms[socket.room].language = lang;

    // TODO: Do some validation on the lang here
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
      rooms[socket.room].usernames = _.without(rooms[socket.room].usernames, socket.username);
    }
    if (rooms[socket.room].usernames.length === 0) {
      console.log("Deleting empty room: " + socket.room);
      delete rooms[socket.room];
    }
    else {
      socket.broadcast.to(socket.room).emit('updateusers', rooms[socket.room].usernames);
      socket.broadcast.to(socket.room).emit('updatechatserver', socket.username + ' has disconnected');
    }
  }
}
