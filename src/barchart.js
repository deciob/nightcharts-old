(function () {
  "use strict"

  function(config) {

    var chart = function(selection) {

    }

    chart.width = function(c) {
      var width;
      if (!arguments.length) {
        return width;
      }
      width = c - conf.margin.left - conf.margin.right;
      return chart;
    }

    return {
      chart: chart
    };

  }

})();