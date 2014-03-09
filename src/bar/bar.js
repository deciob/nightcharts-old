// **The bar.bar module**

define('bar/bar',[
  "d3", 
  "utils/utils",
  "bar/config", 
  "mixins/data_methods",
  "mixins/layout_methods",
  "mixins/scale_methods",
  "mixins/axis_methods",
  "mixins/scaffolding",
  "bar/bar_methods",
  "bar/scaffolding",
  "line/scaffolding",
], function(
  d3, 
  utils, 
  default_config, 
  data_methods, 
  layout_methods, 
  scale_methods, 
  axis_methods, 
  scaffolding,
  bar_methods,
  bar_scaffolding,
  line_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Bar (selection) {

      var self = this instanceof Bar
               ? this
               : new Bar(selection),
          data = self.normalizeData(selection.datum(), __),
          bars;

      self.__ = __;
      // apparently this is only used with the axis, so the first one for now works...
      //__.x_axis_data = data[0]; //FIXME

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'bars');
      self.barScaffolding.call(self, __);

      __.overlapping_charts.names.forEach( function (chart_name) {
        utils.getScaffoldingMethod.call(self, chart_name).call(self, __);
      });

      return selection;


//    function Bar (selection) {
//
//      var self = this instanceof Bar
//               ? this
//               : new Bar(selection);
//
//      w = function () { return __.width - __.margin.right - __.margin.left; };
//      h = function () { return __.height - __.margin.top - __.margin.bottom; };
//  
//      // Scales are functions that map from an input domain to an output range.
//      // Presently no assumption is made about the chart orientation.
//      xScale = self.setXScale(__.orientation, __.date_chart)();
//      yScale = self.setYScale(__.orientation)();
//  
//      // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes)
//      // Presently no assumption is made about the chart orientation.
//      xAxis = self.setXAxis(__.x_axis, xScale);
//      yAxis = self.setYAxis(__.y_axis, yScale);
//      
//      selection.each( function (dat) {
//
//        var data
//          , tooltip = __.tooltip
//          , tip
//          , svg
//          , gEnter
//          , g
//          , bars
//          , transition
//          , params;
//
//        // data structure:
//        // 0: name
//        // 1: value
//        data = dat.map(function(d, i) {
//          var x;
//          if (__.date_chart) {
//            x = __.date_chart(__.categoricalValue.call(dat, d));
//          } else {
//            x = __.categoricalValue.call(dat, d);
//          }
//          return [
//            x, 
//            __.quantativeValue.call(dat, d)
//          ];
//        });
//        if (__.invert_data) {
//          data = data.reverse();
//        }
//
//        function delay (d, i) {
//          // Attention, delay can not be longer of transition time! Test!
//          return i / data.length * __.duration;
//        }
//
//        params = {
//          data: data,
//          __: __,
//          h: h,
//          w: w,
//          yScale: yScale,
//          xScale: xScale,
//          xAxis: xAxis,
//          yAxis: yAxis,
//          delay: delay,
//          date_adjust: (w()/data.length)/2
//        }
//
//        if (__.date_chart) {
//          params.bar_width = (w() / data.length) - .5;
//        }
//
//        self.applyXScale.call(xScale, __.orientation, params);
//        self.applyYScale.call(yScale, __.orientation, params); 
//
//        // Select the svg element, if it exists.
//        svg = selection.selectAll("svg").data([data]);
//
//        // Otherwise, create the skeletal chart.
//        gEnter = svg.enter().append("svg").append("g");
//        // Initializing the tooltip.
//        if (tooltip) {
//          tip = utils.tip(tooltip);
//          gEnter.call(tip);
//        }
//        gEnter.append("g").attr("class", "bars");
//        gEnter.append("g").attr("class", "x axis");
//        if (__.date_chart) {
//          gEnter.append("g").attr("class", "y axis")
//           .attr("transform", "translate(-" + (params.date_adjust + 5) + ",0)");
//        } else {
//          gEnter.append("g").attr("class", "y axis");
//        }
//
//        // Update the outer dimensions.
//        svg.attr("width", __.width)
//          .attr("height", __.height);
//
//        // Update the inner dimensions.
//        g = svg.select("g")
//          .attr("transform", "translate(" + 
//          __.margin.left + "," + __.margin.top + ")");
//
//        // Transitions root.
//        transition = g.transition().duration(__.duration)
//        
//        // Update the y axis.
//        self.transitionYAxis.call(
//          transition.selectAll('.y.axis'), __.orientation, params);
//
//        // Update the x axis.
//        self.transitionXAxis.call(
//          transition.selectAll('.x.axis'), __.orientation, params);
//
//        // Select the bar elements, if they exists.
//        bars = g.select(".bars").selectAll(".bar")
//          .data(data, dataIdentifier);
//
//        // Exit phase (let us push out old bars before the new ones come in).
//        bars.exit()
//          .transition().duration(__.duration).style('opacity', 0).remove();
//
//        // Otherwise, create them.
//        bars = self.createBars.call(bars.enter(), __.orientation, params)
//          .on('click', __.handleClick);
//
//        if (tooltip) {
//          bars
//           .on('mouseover', tip.show)
//           .on('mouseout', tip.hide);
//        }
//          
//        // And transition them.
//        self.transitionBars
//          .call(transition.selectAll('.bar'), __.orientation, params)
//          .call(utils.endall, data, __.handleTransitionEnd);
//
//        return selection;



    }

    utils.getset(Bar, __);
    data_methods.call(Bar.prototype);
    layout_methods.call(Bar.prototype);
    scale_methods.call(Bar.prototype);
    axis_methods.call(Bar.prototype);
    scaffolding.call(Bar.prototype);
    bar_methods.call(Bar.prototype);
    bar_scaffolding.call(Bar.prototype);
    line_scaffolding.call(Bar.prototype);

    return Bar;
  }

});

