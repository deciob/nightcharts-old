
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
  function endall (transition, data, callback) {
    // Assumes the data length never changes.
    // Incrementing n (++n) for each transition element does not work if we
    // have exits in the transition, because of a length mismatch between now
    // and the end of the transitions. 
    var n = data.length;
    transition 
      //.each(function() { ++n; }) 
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

// Differentiating these methods per barchart orientation.

chart.bar_utils = (function () {

  // TODO: vertical implementation of bars is broken!!!
  var vertical = {
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear,
    inflateXScale: function (params) {
      return this.rangeRoundBands([0, params.w()], params.__.padding)
        .domain(params.data.map(function(d) { return d[0]; }));
    },
    inflateYScale: function (params) {
      // Note the inverted range for the y-scale: bigger is up!
      return this.range([params.h(), 0]).domain([0, d3.max(
        params.data, function(d) {return parseFloat(d[1]); }) ]);
    },
    createBars: function (params) {
      return this
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return params.xScale(d[1]); })
        .attr("width", params.xScale.rangeBand())
        .attr("y", params.h() + params.__.barOffSet)
        .attr("height", 0);
    },
    transitionXAxis: function (params) {
      return this
        .attr("transform", "translate(0," + params.yScale.range()[0] + ")")
        .call(params.xAxis);
    },
    transitionYAxis: function (params) {
      return this.call(params.yAxis)
        .selectAll("g");
    },
    transitionBars: function (params) {
      return this
        .attr("x", function(d) { return params.xScale(d[0]); })
        .attr("y", function(d) { return params.yScale(d[1]); })
        .attr("height", function(d) { return params.h() - params.yScale(d[1]); });
    },
    exitBar: function (params) {
      return this
        .attr("y", params.h())
        .attr("height", 0)
        .remove();
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
        .attr("width", 0)
        .remove();
    }
  }

  return {
    vertical: vertical,
    horizontal: horizontal
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
      w, h, xScale, yScale, xAxis, yAxis;

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
      xScale = bar_utils[__.orient].xScale();
      yScale = bar_utils[__.orient].yScale();
  
      // Axes, see: https://github.com/mbostock/d3/wiki/SVG-Axes
      xAxis = d3.svg.axis()
        .outerTickSize(__.outerTickSize).scale(xScale).orient(__.x_orient);
      yAxis = d3.svg.axis()
        .outerTickSize(__.outerTickSize).scale(yScale).orient(__.y_orient);

      selection.each(function(dat) {

        var data, svg, gEnter, g, bars, transition, bars_t, bars_ex, delay, params;

        // data structure:
        // 0: name
        // 1: value
        data = dat.map(function(d, i) {
          return [__.xValue.call(dat, d), __.yValue.call(dat, d)];
        });

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

        bar_utils[__.orient].inflateYScale.call(yScale, params);
        bar_utils[__.orient].inflateXScale.call(xScale, params);

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
          .transitionYAxis
          .call(transition.selectAll('.y.axis'), params);

        // Update the x axis.
        bar_utils[__.orient]
          .transitionXAxis
          .call(transition.select(".x.axis"), params);

        // Select the bar elements, if they exists.
        bars = g.select(".bars").selectAll(".bar").data(data, dataIdentifier);

        // Otherwise, create them.
        bar_utils[__.orient].createBars.call(bars, params);

        // And transition them.
        bar_utils[__.orient].transitionBars
          .call(transition.selectAll('.bar'), params)
          .call(utils.endall, data, __.handleTransitionEnd);

        //debugger;

        // Exit phase.
        bars_ex = bars.exit()
          .transition()
          //.duration(__.duration);
        bar_utils[__.orient].exitBar.call(bars_ex, params);

      });

    }

    chart.utils.getset(bar, __);

    return bar;

  };

})();

    return chart;
}));
