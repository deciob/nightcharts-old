var buster = require("buster");
var assert = buster.assertions.assert;

var chart = require("../build/chart.js");

buster.testCase("Bar orient", {
  
  "vertical bar": function () {
    xScale = chart.bar_orient['vertical'].xScale();
    assert.isFunction(xScale.rangeRoundBands);
  },
  
  "horizontal bar": function () {
    xScale = chart.bar_orient['horizontal'].xScale();
    assert.isFunction(xScale.range);
  }

});