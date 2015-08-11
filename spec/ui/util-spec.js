var util = require("../../public/javascripts/util");

describe('util tokenize', function () {
    it('should return "test" for "test"', function () {
        // Init
        var message = 'test';
        var expected = 'test';
        
        // Act
        var actual = util.tokenize(message);
        
        // Assert
        expect(message).toEqual(expected);
    });
    
    it('should return an anchor tag for "#1"', function () {
       // Init
       var message = '#1',
           expected = '<a href="#", class="linelink" data-line="1">#1</a>';
       
       // Act
       var actual = util.tokenize(message);
       
       // Assert
       expect(message).toEqual(expected);
    });
});