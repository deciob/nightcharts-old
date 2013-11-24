// chart.bar_utils
// ----------------

// Useful functions used by the bar module.

chart.bar_utils = (function () {

  var vertical = {
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear,
    inflateXScale: function (data, w, __) {
      return this.rangeRoundBands([0, w()], __.padding)
        .domain(data.map(function(d) { return d[0]; }));
    },
    inflateYScale: function (data, h, __) {
      // Note the inverted range for the y-scale: bigger is up!
      return this.range([h(), 0]).domain([0, d3.max(
        data, function(d) {return parseFloat(d[1]); }) ]);
    },
    inflateBar: function (xScale, yScale, h) {
      return this.attr("x", function(d) { return xScale(d[0]); })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("height", function(d) { return h() - yScale(d[1]); });
    },
    inflateXAxis: function (xAxis, yScale, h) {
      return this.attr("transform", "translate(0," + yScale.range()[0] + ")")
        .call(xAxis);
    }
  }

  var horizontal = {
    xScale: d3.scale.linear,
    yScale: d3.scale.ordinal,
    inflateXScale: function (data, w, __) {
      return this.range([0, w()]).domain([0, d3.max(
        data, function(d) {return parseFloat(d[1]); }) ]);
    },
    inflateYScale: function (data, w, __) {
      // Note the inverted range for the y-scale: bigger is up!
      return this.rangeRoundBands([w(), 0], __.padding)
        .domain(data.map(function(d) { return d[0]; }));
    },
    inflateBar: function (xScale, yScale, h) {
      return this.attr("x", function(d) { return 0; })
        .attr("width", function(d) { return xScale(d[1]); })
        .attr("y", function(d) { return yScale(d[0]); })
        .attr("height", yScale.rangeBand());
    },
    inflateXAxis: function (xAxis, yScale, h) {
      return this.attr("transform", "translate(0," + h() + ")").call(xAxis);
    }
  }

  return {
    vertical: vertical,
    horizontal: horizontal
  };

})();