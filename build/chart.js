var chart;
if (!chart) chart = {};chart.utils = (function () {

  function extend(o, p) {
      for(prop in p) {
          o[prop] = p[prop];
      }
      return o;
  }

  return {
    extend: extend;
  };

})();chart.bar = (function () {
  "use strict"

  function(config) {

    var chart = function(selection) {

    }

    chart.width = function(c) {
      var width;
      if (!arguments.length) {
        return width;
      }
      width = c - config.margin.left - config.margin.right;
      return chart;
    }

    return {
      chart: chart
    };

  }

})();