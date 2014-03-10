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
      __.x_axis_data = data[0]; //FIXME

      self.axisScaffolding.call(self, data, __);

      if (__.x_scale == 'time') {
        __.bar_width = (__.w / data[0].length) - .5;
      }

      self.chartScaffolding.call(self, selection, __, 'bars');
      self.barScaffolding.call(self, __);

      __.overlapping_charts.names.forEach( function (chart_name) {
        utils.getScaffoldingMethod.call(self, chart_name).call(self, __);
      });

      return selection;
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

