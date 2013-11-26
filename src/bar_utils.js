// chart.bar_utils
// ----------------

// Differentiating these methods per barchart orientation.

chart.bar_utils = (function () {

  // TODO: vertical implementation broken!!!
  var vertical = {
    horizontalScale: d3.scale.ordinal,
    verticalScale: d3.scale.linear,
    inflateVerticalScale: function (data, w, __) {
      return this.rangeRoundBands([0, w()], __.padding)
        .domain(data.map(function(d) { return d[0]; }));
    },
    inflateOrizontalScale: function (data, h, __) {
      // Note the inverted range for the y-scale: bigger is up!
      return this.range([h(), 0]).domain([0, d3.max(
        data, function(d) {return parseFloat(d[1]); }) ]);
    },
    createBars: function (horizontalScale, verticalScale, h) {
      return this
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return horizontalScale(d[0]); })
        .attr("width", horizontalScale.rangeBand())
        .attr("y", function(d) { return verticalScale(d[1]); })
        .attr("height", function(d) { return h() - verticalScale(d[1]); });
    },
    transitionHorizontalAxis: function (horizontalAxis, verticalScale, h) {
      return this
        .attr("transform", "translate(0," + verticalScale.range()[0] + ")")
        .call(horizontalAxis);
    },
    transitionVerticalAxis: function (verticalAxis, delay, __) {
      return this.call(verticalAxis)
        .selectAll("g")
        .duration(__.duration)
        .delay(delay);
    },
    transitionBars: function (horizontalScale, verticalScale, w, h, delay, __) {
      return this
        .attr("x", function(d, i) { return horizontalScale(d[1]); })
        .attr("y", function(d) { return verticalScale(d[0]); })
        .attr("height", function(d) { return h() - verticalScale(d[0]); });
    }
  }

  var horizontal = {
    horizontalScale: d3.scale.linear,
    verticalScale: d3.scale.ordinal,
    inflateVerticalScale: function (data, w, __) {
      return this.range([0, w()]).domain([0, d3.max(
        data, function(d) {return parseFloat(d[1]); }) ]);
    },
    inflateOrizontalScale: function (data, w, __) {
      // Note the inverted range for the y-scale: bigger is up!
      return this.rangeRoundBands([w(), 0], __.padding)
        .domain(data.map(function(d) { return d[0]; }));
    },
    createBars: function (horizontalScale, verticalScale, h, __) {
      return this
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", __.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return verticalScale(d[0]); })
        .attr("height", verticalScale.rangeBand());
    },
    transitionHorizontalAxis: function (horizontalAxis, verticalScale, h, __) {
      return this.attr("transform", "translate(" + __.barOffSet
        + "," + h() + ")").call(horizontalAxis);
    },
    transitionVerticalAxis: function (verticalAxis, delay, __) {
      return this.call(verticalAxis)
        .selectAll("g")
    },
    transitionBars: function (horizontalScale, verticalScale, w, h, delay, __) {
      return this
        .attr("y", function(d) { return verticalScale(d[0]); })
        .attr("x", __.barOffSet)
        .attr("width", function(d) { return horizontalScale(d[1]) + __.barOffSet; });
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