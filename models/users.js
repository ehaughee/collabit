var User = require('./user.js');

module.exports = function(name) {
	return User({name: name});
}