define(['chai', 'bar/config','bar/orientation'], function(chai, __, orientation) {

  var params, 
    assert = chai.assert,
    xScale = orientation['vertical'].xScale();

  before( function() {
    var data = [ ['a', 21], ['b', 71], ['d', 322]],
      w = function () { return __.width - __.margin.right - __.margin.left; },
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
      params = {
        data: data,
        __: __,
        h: h,
        w: w
      };
  });
  
  describe('bar/orientation', function(){
  
    it('should be a function', function(){
      assert.isFunction(xScale);
    });

  });

});