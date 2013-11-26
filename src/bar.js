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
        outerTickSize: 0,
        barOffSet: 4,
        x_orient: 'bottom',
        y_orient: 'left',
        colour: 'LightSteelBlue',
        orient: 'vertical',
        xValue: function(d) { return d[0]; },
        yValue: function(d) { return d[1]; },
        handleTransitionEnd: function(d) { return d; }
      },
      w, h, horizontalScale, verticalScale, horizontalAxis, verticalAxis;

    utils.extend(__, config);

    function dataIdentifier (d) {
      return d[0];
    }

    function delay (d, i) { 
      return i * 50; 
    }

    function bar (selection) {

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
  
      // Scales are functions that map from an input domain to an output range.
      horizontalScale = bar_utils[__.orient].horizontalScale();
      verticalScale = bar_utils[__.orient].verticalScale();
  
      // Axes, see: https://github.com/mbostock/d3/wiki/SVG-Axes
      horizontalAxis = d3.svg.axis()
        .outerTickSize(__.outerTickSize).scale(horizontalScale).orient(__.x_orient);
      verticalAxis = d3.svg.axis()
        .outerTickSize(__.outerTickSize).scale(verticalScale).orient(__.y_orient);

      selection.each(function(dat) {

        var data, svg, gEnter, g, bars, transition, bars_t, bars_ex, delay;

        // data structure:
        // 0: name
        // 1: value
        data = dat.map(function(d, i) {
          return [__.xValue.call(dat, d), __.yValue.call(dat, d)];
        });

        bar_utils[__.orient].inflateVerticalScale.call(horizontalScale, data, w, __);
        bar_utils[__.orient].inflateOrizontalScale.call(verticalScale, data, h, __);

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
        transition = g.transition().duration(__.duration);
        
        // Update the y axis.
        bar_utils[__.orient]
          .transitionVerticalAxis
          .call(transition.selectAll('.y.axis'), verticalAxis, delay, __);

        // Update the x axis.
        bar_utils[__.orient]
          .transitionHorizontalAxis
          .call(transition.select(".x.axis"), horizontalAxis, verticalScale, h, __);

        // Select the bar elements, if they exists.
        bars = g.select(".bars").selectAll(".bar").data(data, dataIdentifier);

        // Otherwise, create them.
        bar_utils[__.orient].createBars.call(bars, horizontalScale, verticalScale, h, __);

        // And transition them.
        bar_utils[__.orient].transitionBars
          .call(transition.selectAll('.bar'), horizontalScale, verticalScale, w, h, delay, __)
          .call(utils.endall, data, __.handleTransitionEnd);

        //debugger;

        // Exit phase.
        bars_ex = bars.exit()
          .transition()
          //.duration(__.duration);
        bar_utils[__.orient].exitBar.call(bars_ex, h);

      });

    }

    chart.utils.getset(bar, __);

    return bar;

  };

})();