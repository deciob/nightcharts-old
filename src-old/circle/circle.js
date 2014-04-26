// **The circle.circle module**

define('circle/circle',[
  "d3", 
  "utils/mixins",
  "circle/config", 
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
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
  circle_mixins
) {
  
  return function (user_config) {

    var config = user_config || {},
        utils  = utils_mixins(),
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config);

    function Circle (selection) {

      var self = this instanceof Circle
               ? this
               : new Circle(selection),
          has_timescale = __.x_scale == 'time',
          circles;

      self.__ = __;
      self.selection = selection;

      self.normalizeData();
      self.setDimensions();
      self.setScales();
      self.setAxes();
      self.setDelay();
      self.applyScales();
      self.setChart('circles');
      self.setCircles();

      return selection;
    }

    getset(Line, __);
    utils_mixins.call(Circle.prototype);
    data_mixins.call(Circle.prototype);
    layout_mixins.call(Circle.prototype);
    scale_mixins.call(Circle.prototype);
    axis_mixins.call(Circle.prototype);
    chart_mixins.call(Circle.prototype);
    circle_mixins.call(Circle.prototype);

    return Circle;
  }

});

