(function(define) {
define(function(require) {

  var buster, assert, orientation;

  buster = require('buster');
  assert = buster.referee.assert;
  __ = require('../../src/bar/config');
  orientation = require('../../src/bar/orientation');

  buster.testCase("bar/orientation", {

    setUp: function () {
      var data = [ ['a', 21], ['b', 71], ['d', 322]],
        w = function () { return __.width - __.margin.right - __.margin.left; },
        h = function () { return __.height - __.margin.top - __.margin.bottom; };
        this.params = {
          data: data,
          __: __,
          h: h,
          w: w
        };
    },
    
    "vertical chart - xScale": function () {
      var xScale = orientation['vertical'].xScale();
      assert.isFunction(xScale.rangeRoundBands);
    },
  
    "vertical chart - inflateYScale": function () {
      var params = this.params;
      var yScale = orientation['vertical'].yScale();
      orientation['vertical'].inflateYScale.call(yScale, params);
      // Explanation:
      // on a vertical bar a value of 322 would produce a chart that is
      // approximately the chart's height and because the y scale is inverted,
      // big is small.
      assert.less(yScale(322), 1);
    },
  
    "vertical chart - inflateYScale - with max": function () {
      var params = this.params;
      params.__.max = 500;
      var yScale = orientation['vertical'].yScale();
      orientation['vertical'].inflateYScale.call(yScale, params);
      // Explanation:
      // but if we pass a max value that is higher than the max value in the 
      // data, I expect the bar to be smaller than the chart height. 
      assert.greater(yScale(322), 1);
    },
    
    "horizontal chart - xScale": function () {
      var xScale = orientation['horizontal'].xScale();
      assert.isFunction(xScale.range);
    },
  
    tearDown: function () {
      this.params.__.max = void 0;
    }

  });

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));