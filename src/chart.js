// chart
// ----------------

// d3.js reusable charts.

// http://bost.ocks.org/mike/chart/
// http://bost.ocks.org/mike/chart/time-series-chart.js
// http://bost.ocks.org/mike/selection/
// http://bl.ocks.org/mbostock/3019563


chart = {
  // Events for handling transitions.
  dispatch: d3.dispatch("start", "stop", "next", "prev", "reset", "end")
};