// **The line.line module**

define('line/line',[
  "d3", 
  "utils/mixins",
  "line/config", 
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
  "line/mixins",
  "circle/mixins",
], function(
  d3, 
  utils_mixins, 
  default_config, 
  data_mixins,
  layout_mixins,
  scale_mixins,
  axis_mixins,
  chart_mixins,
  line_mixins,
  circle_mixins
) {
  
  return function (user_config) {

    var config = user_config || {},
        utils  = utils_mixins(),
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config);

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection),
          has_timescale = __.x_scale == 'time',
          lines;

      self.__ = __;
      self.selection = selection;

      self.normalizeData();
      self.setDimensions();
      self.setScales();
      self.setAxes();
      self.setDelay();
      self.applyScales();
      self.setChart('lines');
      self.setLines();

      __.overlapping_charts.names.forEach( function (chart_name) {
        utils.getGraphHelperMethod.call(self, chart_name).call(self, __);
      });

      return selection;
    }

    getset(Line, __);
    utils_mixins.call(Line.prototype);
    data_mixins.call(Line.prototype);
    layout_mixins.call(Line.prototype);
    scale_mixins.call(Line.prototype);
    axis_mixins.call(Line.prototype);
    chart_mixins.call(Line.prototype);
    line_mixins.call(Line.prototype);
    circle_mixins.call(Line.prototype);

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

