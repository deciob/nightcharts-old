// chart.bar_utils
// ----------------

// Differentiating these methods per barchart orientation.

chart.bar_utils = (function () {

  // TODO: vertical implementation broken!!!
  var vertical = {
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear,
    inflateYScale: function (data, w, __) {
      return this.rangeRoundBands([0, w()], __.padding)
        .domain(data.map(function(d) { return d[0]; }));
    },
    inflateXScale: function (data, h, __) {
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
    inflateXScale: function (params) {
      return this.range([0, params.w()]).domain([0, d3.max(
        params.data, function(d) {return parseFloat(d[1]); }) ]);
    },
    inflateYScale: function (params) {
      // Note the inverted range for the y-scale: bigger is up!
      return this.rangeRoundBands([params.w(), 0], params.__.padding)
        .domain(params.data.map(function(d) { return d[0]; }));
    },
    createBars: function (params) {
      return this
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", params.__.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("height", params.yScale.rangeBand());
    },
    transitionXAxis: function (params) {
      return this.attr("transform", "translate(" + params.__.barOffSet
        + "," + params.h() + ")").call(params.xAxis);
    },
    transitionYAxis: function (params) {
      return this.call(params.yAxis)
        .selectAll("g")
    },
    transitionBars: function (params) {
      return this
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("x", params.__.barOffSet)
        .attr("width", function(d) { 
          return params.xScale(d[1]) + params.__.barOffSet; 
        });
    },
    exitBar: function (params) {
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