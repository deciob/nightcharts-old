
// Uses Node, AMD or browser globals to create a module.
// see: https://github.com/umdjs/umd/blob/master/returnExports.js

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['d3'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('d3'));
    } else {
        // Browser globals (root is window)
        root.chart = factory(root.d3);
    }
}(this, function (d3) {

// chart
// ----------------

// d3.js reusable charts.

// http://bost.ocks.org/mike/chart/
// http://bost.ocks.org/mike/chart/time-series-chart.js
// http://bost.ocks.org/mike/selection/
// http://bl.ocks.org/mbostock/3019563


chart = {};

// chart.utils
// ----------------

// Useful functions that can be shared across modules.

chart.utils = (function () {

  function extend (target, source) {
    for(prop in source) {
      target[prop] = source[prop];
    }
    return target;
  }

  function getset (obj, state) {
    d3.keys(state).forEach( function(key) {
      obj[key] = function (x) {
        if (!arguments.length) return state[key];
        var old = state[key];
        state[key] = x;
        return obj;
      }
    });
  }

  // https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
  function endall (transition, callback) {
    var n = 0; 
    transition 
      .each(function() { ++n; }) 
      .each("end", function() { 
        if (!--n) {
          callback.apply(this, arguments);
        }
      }); 
  }

  return {
    extend: extend,
    getset: getset,
    endall: endall
  };

})();

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

    w = function() { return __.width - __.margin.right - __.margin.left; };
    h = function() { return __.height - __.margin.top - __.margin.bottom; };

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

    function bar (selection) {
      selection.each(function(dat) {
        var data = dat.map(function(d, i) {
          return [__.xValue.call(dat, d), __.yValue.call(dat, d)];
        });

        xScale.rangeRoundBands([0, w()], __.padding)
          .domain(data.map(function(d) { return d[0]; }));
        // Note the inverted range for the y-scale: bigger is up!
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
        svg.attr("width", __.width)
          .attr("height", __.height);

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

        //bars.transition()
        //  .duration(__.duration)
        //  .attr("x", function(d, i) { return xScale(d[0]); })
        //  .attr("y", function(d) { return yScale(d[1]); })
        //  .attr("height", function(d) { return h() - yScale(d[1]); })
        //  .call(d3.chart.utils.endall, __.handleTransitionEnd);

        //var t = g.transition().duration(__.duration);

        // Update the x axis.
        g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis)

        // Update the y axis.
        g.select(".y.axis")
          .call(yAxis);

      });

    }

    chart.utils.getset(bar, __);

    return bar;

  };

})();

    return chart;
}));
