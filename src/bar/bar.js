// **The bar.bar module**

define('bar/bar',[
  "d3", 
  "utils/utils",
  "bar/config", 
  "mixins/data_helpers",
  "mixins/layout_helpers",
  "mixins/scale_helpers",
  "mixins/axis_helpers",
  "mixins/scaffolding",
  "bar/bar_helpers",
  "bar/scaffolding",
  "line/scaffolding",
], function(
  d3, 
  utils, 
  default_config, 
  data_helpers, 
  layout_helpers, 
  scale_helpers, 
  axis_helpers, 
  scaffolding,
  bar_helpers,
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
    data_helpers.call(Bar.prototype);
    layout_helpers.call(Bar.prototype);
    scale_helpers.call(Bar.prototype);
    axis_helpers.call(Bar.prototype);
    scaffolding.call(Bar.prototype);
    bar_helpers.call(Bar.prototype);
    bar_scaffolding.call(Bar.prototype);
    line_scaffolding.call(Bar.prototype);

    return Bar;
  }

});

