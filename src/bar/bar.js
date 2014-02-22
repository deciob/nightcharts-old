// **The bar.bar module**

define([
    "d3", 
    "utils/utils",
    "bar/config", 
    "bar/orientation",
  ], function(d3, utils, default_config, orientation) {
  
  return function (user_config) {

    var config = user_config || {},
       __, w, h, xScale, yScale, xAxis, yAxis;

    __ = utils.extend(default_config, config);

    function dataIdentifier (d) {
      return d[0];
    }

    function bar (selection) { 

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
  
      // Scales are functions that map from an input domain to an output range.
      // Presently no assumption is made about the chart orientation.
      xScale = orientation[__.orientation].xScale();
      yScale = orientation[__.orientation].yScale();
  
      // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes)
      // Presently no assumption is made about the chart orientation.
      xAxis = d3.svg.axis();
      d3.entries(__.axes.x).forEach(function(key, value) {
        if (value) {
          xAxis[key](value);
        }
      });
      yAxis = d3.svg.axis();
      d3.entries(__.axes.y).forEach(function(key, value) {
        if (value) {
          yAxis[key](value);
        }
      });

      selection.each(function(dat) {

        var data, 
          tooltip = __.tooltip, 
          tip, svg, gEnter, g, bars, transition, bars_t, bars_ex, params;

        // data structure:
        // 0: name
        // 1: value
        data = dat.map(function(d, i) {
          return [
            __.categoricalValue.call(dat, d), 
            __.quantativeValue.call(dat, d)
          ];
        });
        if (__.invert_data) {
          data = data.reverse();
        }

        function delay (d, i) {
          // Attention, delay can not be longer of transition time! Test!
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
          yAxis: yAxis,
          delay: delay,
        }

        orientation[__.orientation].inflateYScale.call(yScale, params);
        orientation[__.orientation].inflateXScale.call(xScale, params);

        // Select the svg element, if it exists.
        svg = d3.select(this).selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        gEnter = svg.enter().append("svg").append("g");
        // Initializing the tooltip.
        if (tooltip) {
          tip = utils.tip(tooltip);
          gEnter.call(tip);
        }
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
        transition = g.transition().duration(__.duration)
        
        // Update the y axis.
        orientation[__.orientation]
          .transitionYAxis
          .call(transition.selectAll('.y.axis'), params);

        // Update the x axis.
        orientation[__.orientation]
          .transitionXAxis
          .call(transition.select(".x.axis"), params);

        // Select the bar elements, if they exists.
        bars = g.select(".bars").selectAll(".bar")
          .data(data, dataIdentifier);

        // Exit phase (let us push out old bars before the new ones come in).
        bars.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();

        // Otherwise, create them.
        bars = orientation[__.orientation].createBars.call(bars.enter(), params)
          .on('click', __.handleClick);

        if (tooltip) {
          bars
           .on('mouseover', tip.show)
           .on('mouseout', tip.hide);
        }
          
        // And transition them.
        orientation[__.orientation].transitionBars
          .call(transition.selectAll('.bar'), params)
          .call(utils.endall, data, __.handleTransitionEnd);

      });

    }

    utils.getset(bar, __);

    return bar;

  }

});

