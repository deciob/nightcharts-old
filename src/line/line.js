// **The line.line module**

define('line/line',[
    "d3", 
    "utils/utils",
    "line/config", 
    "mixins/common_mixins",
    "mixins/line_mixins",
  ], function(d3, utils, default_config, common_mixins, line_mixins) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config),
        w,
        h,
        xScale,
        yScale,
        xAxis,
        yAxis,
        line;

    function dataIdentifier (d) {
      return d[0];
    }

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection),
          data = self.normalizeData(selection.datum(), __),
          tooltip = __.tooltip,
          tip,
          svg,
          gEnter,
          g,
          lines,
          transition,
          params;

      function delay (d, i) { 
        return i / data[0].length * __.duration; 
      };

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };

      // Scales are functions that map from an input domain to an output range.
      xScale = self.setXScale('vertical', __.date)();
      yScale = self.setYScale('vertical')();
  
      // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes).
      xAxis = self.setXAxis(__.x_axis, xScale);
      yAxis = self.setYAxis(__.y_axis, yScale);

      params = {
        data: data,
        x_axis_data: data[0], // FIXME this hack!
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
      if (__.date) {
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
      transition = g.transition().duration(__.duration);

      // Update the y axis.
      self.transitionYAxis.call(
        transition.selectAll('.y.axis'), 'vertical', params);

      // Update the x axis.
      self.transitionXAxis.call(
        transition.selectAll('.x.axis'), 'vertical', params);

      // Select the line elements, if they exists.
      lines = g.selectAll(".line")
        .data(data, dataIdentifier);

      // Exit phase (let us push out old lines before the new ones come in).
      lines.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      lines = self.createLines.call(lines.enter(), params)
        .on('click', __.handleClick);
      
      //TODO: FIXME
      if (tooltip) {
        lines
         .on('mouseover', tip.show)
         .on('mouseout', tip.hide);
      }
        
      //TODO
      //And transition them.
      //self.transitionLines
      //  .call(transition.selectAll('.line'), 'vertical', params)
      //  .call(utils.endall, data, __.handleTransitionEnd);

      return selection;

    });

      return selection;

    }

    utils.getset(Line, __);
    common_mixins.call(Line.prototype);
    line_mixins.call(Line.prototype);

    return Line;

  }

});

