var User = function(options) {
	this.name = options.name;
}

module.exports = function(name) {
	return new User({name: name});
}