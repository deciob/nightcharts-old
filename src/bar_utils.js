// chart.bar_utils
// ----------------

// Useful functions used by the bar module.

chart.bar_utils = (function () {

  var vertical = {
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear
  }

  var horizonthal = {
    xScale: d3.scale.linear,
    yScale: d3.scale.ordinal
  }

  return {
    vertical: vertical
  };

})();