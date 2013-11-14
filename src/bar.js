chart.bar = (function () {
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