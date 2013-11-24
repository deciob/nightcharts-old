var buster = require("buster");
var assert = buster.assertions.assert;

var chart = require("../build/chart.js");

buster.testCase("Utils", {
  
  "vertical bar": function () {
    xScale = chart.bar_utils['vertical'].xScale();
    assert.isFunction(xScale.rangeRoundBands);
  },
  
  "horizontal bar": function () {
    xScale = chart.bar_utils['horizontal'].xScale();
    assert.isFunction(xScale.range);
  }

});