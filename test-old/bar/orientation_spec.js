// TODO: these are mixins now!!!!!! 

//REDO !!!!!

//define(['chai', 'bar/config','bar/orientation'], function(chai, __, orientation) {
//
//  var params, 
//    assert = chai.assert,
//    xScale = orientation['vertical'].xScale();
//
//  before( function() {
//    var data = [ ['a', 21], ['b', 71], ['d', 322]],
//      w = function () { return __.width - __.margin.right - __.margin.left; },
//      h = function () { return __.height - __.margin.top - __.margin.bottom; };
//      params = {
//        data: data,
//        __: __,
//        h: h,
//        w: w
//      };
//  });
//
//  after( function() {
//    // Resetting default values.
//    params.__.max = void 0;
//  });
//  
//  describe('bar#orientation', function(){
//  
//    it('should be a function', function(){
//      assert.isFunction(xScale.rangeRoundBands);
//    });
//
//    it('should be a function', function(){
//      var xScale = orientation['horizontal'].xScale();
//      assert.isFunction(xScale.range);
//    });
//
//    it('calling yScale with a big value should return a small value if the orientation is vertical', function(){
//      var yScale = orientation['vertical'].yScale();
//      // Set range and domain on yScale
//      orientation['vertical'].inflateYScale.call(yScale, params);
//      // The max value in data is 322. Passing this value to yScale 
//      // should return a very small value because the y scale is inverted.
//      assert.isTrue(yScale(322) < 1);
//    });
//
//    it('setting a new value in params should override the default one', function(){
//      var yScale = orientation['vertical'].yScale();
//      params.__.max = 500;
//      // Set range and domain on yScale
//      orientation['vertical'].inflateYScale.call(yScale, params);
//      assert.isTrue(yScale(322) > 1);
//    });
//
//    it('calling xScale with a small value should return a small value if the orientation is horizontal', function(){
//      var xScale = orientation['horizontal'].xScale();
//      // Set range and domain on xScale
//      orientation['horizontal'].inflateXScale.call(xScale, params);
//      // This time the linear scale is on the x axis and so the scale
//      // is not inverted.
//      assert.isTrue(xScale(0) < 1);
//    });
//
//  });
//
//});