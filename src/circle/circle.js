// **The circle.circle module**

define('circle/circle',[
  "d3", 
  "utils/utils",
  "circle/config", 
  "mixins/data_helpers",
  "mixins/layout_helpers",
  "mixins/scale_helpers",
  "mixins/axis_helpers",
  "mixins/scaffolding",
  "circle/scaffolding",
], function(
  d3, 
  utils, 
  default_config, 
  data_helpers, 
  layout_helpers, 
  scale_helpers, 
  axis_helpers, 
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
      
      self.__.selection = selection;
      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'circles');
      self.circleScaffolding.call(self, __);

      return selection;
    }

    utils.getset(Circle, __);
    data_helpers.call(Circle.prototype);
    layout_helpers.call(Circle.prototype);
    scale_helpers.call(Circle.prototype);
    axis_helpers.call(Circle.prototype);
    scaffolding.call(Circle.prototype);
    circle_scaffolding.call(Circle.prototype);

    return Circle;
  }

});

