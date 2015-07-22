var rooms = {
        room12: {
            usernames: ['existingUser']
        }
    },
    validate = require('../../util/validate')(rooms, { maxUserNameLength: 20 });

describe('roomValidate room', function () {
    it('should return true for a valid room', function () {
        var room = 'room12';
        
        validate.room(room, function (err, val) {
            expect(err).toBeNull();
            expect(val).toBe(true);
        });
    });
    
    it('should return false for undefined room name', function () {
        // note we are not passing room
        validate.room(undefined, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('exception');
            expect(val).toBe(false);
        });
    });
    
    it('should return false for a very short room name', function () {
        var shortRoomName = 'room';
        
        validate.room(shortRoomName, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('exception');
            expect(val).toBe(false);
        });
    });
    
    it('should return false for a non-existent room name', function () {
        var nonExistentRoomName = 'roomxy';
        
        validate.room(nonExistentRoomName, function (err, val) {
            expect(err).not.toBeNull();
            expect(err.name).toBe('exception');
            expect(val).toBe(false);
        });
    });
});