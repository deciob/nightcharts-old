// **The line.line module**

define('line/line',[
    "d3", 
    "utils/utils",
    "line/config", 
    "mixins/common_mixins",
    "mixins/line_mixins",
  ], function(d3, utils, default_config, common_mixins, line_mixins) {
  
  return function (user_config) {

    var config = user_config || {}
      , __
      , w
      , h
      , xScale
      , yScale
      , xAxis
      , yAxis
      , line;

    __ = utils.extend(default_config, config);

    function dataIdentifier (d) {
      return d[0];
    }

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection);

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
  
      // Scales are functions that map from an input domain to an output range.
      // Only vertical line graphs make sense.
      xScale = self.setXScale('vertical', __.parseDate)();
      yScale = self.setYScale('vertical')();
  
      // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes)
      xAxis = self.setXAxis(__.x_axis, xScale);
      yAxis = self.setYAxis(__.y_axis, yScale);
      
      selection.each( function (dat) {

        var data
          , tooltip = __.tooltip
          , tip
          , svg
          , gEnter
          , g
          , lines
          , transition
          , params;

        // data structure:
        // 0: name
        // 1: value
        data = dat.map(function(d, i) {
          var x;
          if (__.parseDate) {
            x = __.parseDate(__.categoricalValue.call(dat, d));
          } else {
            x = __.categoricalValue.call(dat, d);
          }
          return [
            x, 
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

        self.applyXScale.call(xScale, 'vertical', params);
        self.applyYScale.call(yScale, 'vertical', params);

        // Select the svg element, if it exists.
        svg = selection.selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        gEnter = svg.enter().append("svg").append("g");
        // Initializing the tooltip.
        if (tooltip) {
          tip = utils.tip(tooltip);
          gEnter.call(tip);
        }
        gEnter.append("g").attr("class", "lines");
        gEnter.append("g").attr("class", "x axis");
        if (__.parseDate) {
          gEnter.append("g").attr("class", "y axis")
           .attr("transform", "translate(-" + (__.date_adjust) + ",0)");
        } else {
          gEnter.append("g").attr("class", "y axis");
        }

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
        self.transitionYAxis.call(
          transition.selectAll('.y.axis'), 'vertical', params);

        // Update the x axis.
        self.transitionXAxis.call(
          transition.selectAll('.x.axis'), 'vertical', params);

        // Select the line elements, if they exists.
        lines = g.select(".lines").selectAll(".line")
          .data([data], dataIdentifier);

        // Exit phase (let us push out old lines before the new ones come in).
        lines.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();

        // Otherwise, create them.
        lines = self.createLines.call(lines.enter(), params)
          .on('click', __.handleClick);

        if (tooltip) {
          lines
           .on('mouseover', tip.show)
           .on('mouseout', tip.hide);
        }
          
        // TODO
        //// And transition them.
        //self.transitionLines
        //  .call(transition.selectAll('.line'), 'vertical', params)
        //  .call(utils.endall, data, __.handleTransitionEnd);

        return selection;

      });

    }

    utils.getset(Line, __);
    common_mixins.call(Line.prototype);
    line_mixins.call(Line.prototype);

    return Line;

  }

});

