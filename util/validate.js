module.exports = function (rooms, config) {
    return {
        username: function (username, room, callback) {
            var error;
            if (typeof username === 'undefined'
                || username === ''
                || username === null
                || username.match(/server/i)) {
                error = {
                    name: 'adduserfail',
                    arg: 'Invalid username: ' + username
                };
                return callback(error, false);
            } else if (rooms[room].usernames.indexOf(username) !== -1) {
                error = {
                    name: 'adduserfail',
                    arg: 'Invalid username, already in use: ' + username
                };
                return callback(error, false);
            } else if (username.length > config.maxUserNameLength) {
                error = {
                    name: 'adduserfail',
                    arg: 'Username too long: ' + username + ". Max characters allowed: " + config.maxUserNameLength
                };
                return callback(error, false);
            }
            
            return callback(null, true);
        },
        room: function (room, callback) {
            if (typeof room === 'undefined' || !room.match(/[A-Za-z0-9]{6}/) || typeof rooms[room] === "undefined") {
                var error = {
                    name: 'exception',
                    arg: 'Invalid room: ' + room
                };
                
                return callback(error, false);
            }
            
            return callback(null, true);
        }
    }
}