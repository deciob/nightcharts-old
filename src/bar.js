// chart.bar
// ----------------

// Create barcharts.

chart.bar = (function () {
  'use strict'

  return function (config) {

    var config = config || {},
      utils = chart.utils,
      bar_orient = chart.bar_orient,
      __ = chart.bar_config,
      w, h, xScale, yScale, xAxis, yAxis;

    utils.extend(__, config);

    function dataIdentifier (d) {
      return d[0];
    }

    function bar (selection) {

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
  
      // Scales are functions that map from an input domain to an output range.
      xScale = bar_orient[__.orient].xScale();
      yScale = bar_orient[__.orient].yScale();
  
      // Axes, see: https://github.com/mbostock/d3/wiki/SVG-Axes
      xAxis = d3.svg.axis()
        .outerTickSize(__.outerTickSize).scale(xScale).orient(__.x_orient);
      yAxis = d3.svg.axis()
        .outerTickSize(__.outerTickSize).scale(yScale).orient(__.y_orient);

      selection.each(function(dat) {

        var data, svg, gEnter, g, bars, transition, bars_t, bars_ex, params;

        // data structure:
        // 0: name
        // 1: value
        data = dat.map(function(d, i) {
          return [__.xValue.call(dat, d), __.yValue.call(dat, d)];
        });

        function delay (d, i) { 
          return i / data.length * __.duration;
        }

        params = {
          data: data,
          __: __,
          h: h,
          w: w,
          yScale: yScale,
          xScale: xScale,
          xAxis: xAxis,
          yAxis: yAxis
        }

        bar_orient[__.orient].inflateYScale.call(yScale, params);
        bar_orient[__.orient].inflateXScale.call(xScale, params);

        // Select the svg element, if it exists.
        svg = d3.select(this).selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        gEnter = svg.enter().append("svg").append("g");
        gEnter.append("g").attr("class", "bars");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");

        // Update the outer dimensions.
        svg.attr("width", __.width)
          .attr("height", __.height);

        // Update the inner dimensions.
        g = svg.select("g")
          .attr("transform", "translate(" + 
          __.margin.left + "," + __.margin.top + ")");

        // Transitions root.
        transition = g.transition().duration(__.duration).delay(delay);
        
        // Update the y axis.
        bar_orient[__.orient]
          .transitionYAxis
          .call(transition.selectAll('.y.axis'), params);

        // Update the x axis.
        bar_orient[__.orient]
          .transitionXAxis
          .call(transition.select(".x.axis"), params);

        // Select the bar elements, if they exists.
        bars = g.select(".bars").selectAll(".bar").data(data, dataIdentifier);

        // Exit phase (let us push out old bars before the new ones come in).
        bars.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();

        // Otherwise, create them.
        bar_orient[__.orient].createBars.call(bars.enter(), params);

        // And transition them.
        bar_orient[__.orient].transitionBars
          .call(transition.selectAll('.bar'), params)
          .call(utils.endall, data);

      });

    }

    chart.utils.getset(bar, __);

    return bar;

  };

})();