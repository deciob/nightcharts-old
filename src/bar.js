d3.chart.bar = (function () {
  'use strict'

  return function (config) {

    var config = config || {};

    var __ = {
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      x_orient: 'bottom',
      y_orient: 'left',
      colour: 'LightSteelBlue',
      xValue: function(d) { return d[0]; },
      yValue: function(d) { return d[1]; }
    }

    d3.chart.utils.extend(__, config);

    var w = function() { 
      return __.width - __.margin.right - __.margin.left; };
    var h = function() { 
      return __.height - __.margin.top - __.margin.bottom; };

    // Scales are functions that map from an input domain to an output range.
    var xScale = d3.scale.ordinal();
    var yScale = d3.scale.linear();

    // Axes, see: https://github.com/mbostock/d3/wiki/SVG-Axes
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient(__.x_orient);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient(__.y_orient);

    function bar (selection) {
      selection.each(function(data) {

        var data = data.map(function(d, i) {
          return [__.xValue.call(data, d), __.yValue.call(data, d)];
        });

        xScale.rangeRoundBands([0, w()], __.padding)
          .domain(d3.extent(data, function(d) { return d[0]; }));
        yScale.range([h(), 0]).domain([0, d3.max(
          data, function(d) {return parseFloat(d[1]); }) ]);

        // Select the svg element, if it exists.
        var svg = d3.select(this).selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        var gEnter = svg.enter().append("svg").append("g");
        gEnter.append("g").attr("class", "bars");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");

        // Update the outer dimensions.
        svg.attr("width", w())
          .attr("height", h());

        // Update the inner dimensions.
        var g = svg.select("g")
          .attr("transform", 
            "translate(" + __.margin.left + "," + __.margin.top + ")");

        // Select the bar elements, if they exists.
        var bars = g.select(".bars").selectAll(".bar").data(data);

        // Otherwise, create them.
        bars.enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return xScale(d[0]); })
          .attr("width", xScale.rangeBand())
          .attr("y", function(d) { return yScale(d[1]); })
          .attr("height", function(d) { return h() - yScale(d[1]); });

        // Update the x axis.
        g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

        // Update the y axis.
        g.select(".y.axis").call(yAxis);

      });

    }

    d3.chart.utils.getset(bar, __);

    return bar;

  };

})();