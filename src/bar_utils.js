// chart.bar_utils
// ----------------

// Differentiating these methods per barchart orientation.

chart.bar_utils = (function () {

  // TODO: vertical implementation broken!!!
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
    createBars: function (xScale, yScale, h) {
      return this
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d[0]); })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("height", function(d) { return h() - yScale(d[1]); });
    },
    transitionXAxis: function (xAxis, yScale, h) {
      return this
        .attr("transform", "translate(0," + yScale.range()[0] + ")")
        .call(xAxis);
    },
    transitionYAxis: function (yAxis, delay, __) {
      return this.call(yAxis)
        .selectAll("g")
        .duration(__.duration)
        .delay(delay);
    },
    transitionBars: function (xScale, yScale, w, h, delay, __) {
      return this
        .attr("x", function(d, i) { return xScale(d[1]); })
        .attr("y", function(d) { return yScale(d[0]); })
        .attr("height", function(d) { return h() - yScale(d[0]); });
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
    createBars: function (xScale, yScale, h) {
      return this
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 3)
        .attr("width", 0)
        .attr("y", function(d) { return yScale(d[0]); })
        .attr("height", yScale.rangeBand());
    },
    transitionXAxis: function (xAxis, yScale, h) {
      return this.attr("transform", "translate(0," + h() + ")").call(xAxis);
    },
    transitionYAxis: function (yAxis, delay, __) {
      return this.call(yAxis)
        .selectAll("g")
    },
    transitionBars: function (xScale, yScale, w, h, delay, __) {
      return this
        .attr("y", function(d) { return yScale(d[0]); })
        .attr("x", 3)
        .attr("width", function(d) { return xScale(d[1]) + 3; });
    },
    exitBar: function (h) {
      return this.attr("x", 0)
        .attr("height", 0)
        .remove();
    }
  }

  return {
    vertical: vertical,
    horizontal: horizontal
  };

})();