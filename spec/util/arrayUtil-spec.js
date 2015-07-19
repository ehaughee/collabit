var logger = require('../helpers/logger'),
    util = require('../../util/arrayUtil')(logger);

describe('arrayUtil', function () {
    it('should remove and object and return it as an array', function () {
        var obj = 'c',
            arr = ['a', 'b', obj, 'd'];
        
        var result = util.remove(obj, arr);
        expect(result).toEqual([obj]);
        expect(arr.length).toBe(3);
    });
    
    it('should return false if object doesnt exist in array', function () {
        var obj = 'x',
            arr = ['a', 'b', 'c', 'd'];
            
        var result = util.remove(obj, arr);
        expect(result).toBe(false);
        expect(arr.length).toBe(4);
    });
    
    it('should return false if array is not really an array', function () {
        var arr = { a: 'a', b: 'b', c: 'c' };
        
        var result = util.remove('c', arr);
        expect(result).toBe(false);
    });
});