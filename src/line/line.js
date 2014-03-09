// **The line.line module**

define('line/line',[
  "d3", 
  "utils/utils",
  "line/config", 
  "mixins/data_methods",
  "mixins/layout_methods",
  "mixins/scale_methods",
  "mixins/axis_methods",
  "mixins/scaffolding",
  "line/scaffolding",
  "circle/scaffolding",
], function(
  d3, 
  utils, 
  default_config, 
  data_methods, 
  layout_methods, 
  scale_methods, 
  axis_methods, 
  scaffolding,
  line_scaffolding,
  circle_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection),
          data = self.normalizeData(selection.datum(), __),
          lines;

      self.__ = __;
      // apparently this is only used with the axis, so the first one for now works...
      __.x_axis_data = data[0]; //FIXME

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'lines');
      self.lineScaffolding.call(self, __);

      __.overlapping_charts.names.forEach( function (chart_name) {
        utils.getScaffoldingMethod.call(self, chart_name).call(self, __);
      });

      return selection;
    }

    utils.getset(Line, __);
    data_methods.call(Line.prototype);
    layout_methods.call(Line.prototype);
    scale_methods.call(Line.prototype);
    axis_methods.call(Line.prototype);
    scaffolding.call(Line.prototype);
    line_scaffolding.call(Line.prototype);
    circle_scaffolding.call(Line.prototype);

    Line.prototype.line = function (__) {
      return d3.svg.line().x(function(d, i) {
        return __.xScale(d[0]);
      }).y(function(d, i) {
        return __.yScale(d[1]);
      });
    }

    return Line;
  }

});

