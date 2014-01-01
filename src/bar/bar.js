(function(define) {
  return define([
    "d3", 
    "utils/utils",
    "bar/config", 
    "bar/orientation",
  ], function(d3, utils, __, orientation) {

    return function (user_config) {

      var config = user_config || {},
        w, h, xScale, yScale, xAxis, yAxis;
  
      utils.extend(__, config);
  
      function dataIdentifier (d) {
        return d[0];
      }
  
      function bar (selection) { 
  
        w = function () { return __.width - __.margin.right - __.margin.left; };
        h = function () { return __.height - __.margin.top - __.margin.bottom; };
    
        // Scales are functions that map from an input domain to an output range.
        xScale = orientation[__.orient].xScale();
        yScale = orientation[__.orient].yScale();
    
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
          if (invert_data) {
            data = data.reverse();
          }
  
          function delay (d, i) {
            // Attention, delay can not be longer of transition time! Test!
            //return i / data.length * __.duration;
            return i * (data.length/2);
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
  
          orientation[__.orient].inflateYScale.call(yScale, params);
          orientation[__.orient].inflateXScale.call(xScale, params);
  
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
          transition = g.transition().duration(__.duration)
          
          // Update the y axis.
          orientation[__.orient]
            .transitionYAxis
            .call(transition.selectAll('.y.axis'), params);
  
          // Update the x axis.
          orientation[__.orient]
            .transitionXAxis
            .call(transition.select(".x.axis"), params);
  
          // Select the bar elements, if they exists.
          bars = g.select(".bars").selectAll(".bar")
            .data(data, dataIdentifier);
  
          // Exit phase (let us push out old bars before the new ones come in).
          bars.exit()
            .transition().duration(__.duration).style('opacity', 0).remove();
  
          // Otherwise, create them.
          orientation[__.orient].createBars.call(bars.enter(), params)
            .on('click', __.handleClick);
          // And transition them.
          orientation[__.orient].transitionBars
            .call(transition.selectAll('.bar'), params)
            .call(utils.endall, data, __.handleTransitionEnd);
  
        });
  
      }
  
      utils.getset(bar, __);
  
      return bar;

    }

  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});