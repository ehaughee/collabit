var rooms = {
        room12: {
            usernames: ['existingUser']
        }
    },
    validate = require('../../util/validate')(rooms, { maxUserNameLength: 20 });

describe('roomValidate username', function () {
    it('should return true for a valid username', function () {
        var username = 'user1',
            room = 'room12';
        
        validate.username(username, room, function (err, val) {
            expect(err).toBeNull();
            expect(val).toBe(true);
        });
    });
    
    it('should return false for undefined username', function () {
        var room = 'room12';
        
        // note we are not passing a username
        validate.username(undefined, room, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('adduserfail');
            expect(val).toBe(false);
        });
    });
    
    it('should return false for empty username', function () {
        var room = 'room12';
        
        // note the username is an empty string
        validate.username('', room, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('adduserfail');
            expect(val).toBe(false);
        });
    });
    
    it('should return false for an existing username', function () {
        var existingUserName = 'existingUser',
            room = 'room12';
        
        validate.username(existingUserName, room, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('adduserfail');
            expect(val).toBe(false);
        });
    });
    
    it('should return false for a very long username', function () {
        var tooLongUsername = 'veryLongUsernameValueOverMaxLimit',
            room = 'room12';
        
        validate.username(tooLongUsername, room, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('adduserfail');
            expect(val).toBe(false);
        });
    });
    
    it('should return false for a disallowed username', function () {
        var disallowedUsername = 'server',
            room = 'room12';
           
        validate.username(disallowedUsername, room, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('adduserfail');
            expect(val).toBe(false);
       });
    });
});