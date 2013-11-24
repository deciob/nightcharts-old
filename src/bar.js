// chart.bar
// ----------------

// Create barcharts.

chart.bar = (function () {
  'use strict'

  return function (config) {

    var config = config || {},
      utils = chart.utils,
      bar_utils = chart.bar_utils,
      __ = {
        margin: {top: 20, right: 20, bottom: 40, left: 40},
        width: 500,
        height: 400,
        padding: .1,
        duration: 900,
        step: 600,
        x_orient: 'bottom',
        y_orient: 'left',
        colour: 'LightSteelBlue',
        orient: 'vertical',
        xValue: function(d) { return d[0]; },
        yValue: function(d) { return d[1]; },
        handleTransitionEnd: function(d) { return d; }
      },
      w, h, xScale, yScale, xAxis, yAxis;

    utils.extend(__, config);

    function dataIdentifier (d) {
      //console.log(d)
      return d[1];
    }

    function bar (selection) {

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
  
      // Scales are functions that map from an input domain to an output range.
      xScale = bar_utils[__.orient].xScale();
      yScale = bar_utils[__.orient].yScale();
  
      // Axes, see: https://github.com/mbostock/d3/wiki/SVG-Axes
      xAxis = d3.svg.axis()
        .scale(xScale)
        .orient(__.x_orient);
      yAxis = d3.svg.axis()
        .scale(yScale)
        .orient(__.y_orient);

      selection.each(function(dat) {

        var data, svg, gEnter, g, bars, transition, bars_t, bars_ex, delay;

        delay = function(d, i) { 
          //console.log(d, i, 'xx');
          return i * 50; 
        };

        // data structure:
        // 0: "New York-Newark"
        // 1: 12.34
        data = dat.map(function(d, i) {
          return [__.xValue.call(dat, d), __.yValue.call(dat, d)];
        });

        console.log(dat, data)

        bar_utils[__.orient].inflateXScale.call(xScale, data, w, __);
        bar_utils[__.orient].inflateYScale.call(yScale, data, h, __);

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
          .attr("transform", 
            "translate(" + __.margin.left + "," + __.margin.top + ")");

        // Select the bar elements, if they exists.
        bars = g.select(".bars").selectAll(".bar").data(data, dataIdentifier);

        // Otherwise, create them.
        bar_utils[__.orient].createBars.call(bars, xScale, yScale, h);

        transition = g.transition().duration(__.duration);
        //transition = svg.transition().duration(__.duration);

        
        //bar_utils[__.orient].transitionBars
        //  .call(transition.selectAll('.bar'), xScale, yScale, w, delay, __)
        transition.selectAll('.bar').duration(__.duration)
        .delay(delay)
        .attr("y", function(d) { return yScale(d[0]); })
        .attr("x", 0)
        .attr("width", function(d) { return xScale(d[1]); })
        .attr("width", function(d) { return xScale(d[1]); })
          .call(utils.endall, __.handleTransitionEnd);

        // Update the x axis.
        bar_utils[__.orient]
          .inflateXAxis.call(g.select(".x.axis"), xAxis, yScale, h);

        // Update the y axis.
        g.select(".y.axis")
          .call(yAxis);

        //bar_utils[__.orient].transitionAxis.call(transition, yAxis, __);

        // Exit stuff
        bars_ex = bars.exit()
          .transition()
          .duration(__.duration);
        bar_utils[__.orient].exitBar.call(bars_ex, h);




      });

    }

    chart.utils.getset(bar, __);

    return bar;

  };

})();