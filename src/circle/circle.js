// **The circle.circle module**

define('circle/circle',[
  "d3", 
  "utils/utils",
  "circle/config", 
  "mixins/data_methods",
  "mixins/layout_methods",
  "mixins/scale_methods",
  "mixins/axis_methods",
  "mixins/scaffolding",
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
  circle_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Circle (selection) {

      var self = this instanceof Circle
               ? this
               : new Circle(selection),
          data = self.normalizeData(selection.datum(), __),
          circles;

      self.__ = __;

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'circles');
      self.circleScaffolding.call(self, __);

      return selection;
    }

    utils.getset(Circle, __);
    data_methods.call(Circle.prototype);
    layout_methods.call(Circle.prototype);
    scale_methods.call(Circle.prototype);
    axis_methods.call(Circle.prototype);
    scaffolding.call(Circle.prototype);
    circle_scaffolding.call(Circle.prototype);

    return Circle;
  }

});

