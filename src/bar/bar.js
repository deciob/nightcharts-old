// **The bar.bar module**

define('bar/bar',[
  "d3", 
  "utils/mixins",
  "bar/config", 
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
//  "bar/bar_helpers",
//  "bar/scaffolding",
//  "line/scaffolding",
], function(
  d3, 
  utils_mixins, 
  default_config, 
  data_mixins,
  layout_mixins,
  scale_mixins,
  axis_mixins,
  chart_mixins
//  bar_helpers,
//  bar_scaffolding,
//  line_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        utils  = utils_mixins()
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config);

    function Bar (selection) {

      var self = this instanceof Bar
               ? this
               : new Bar(selection),
          has_timescale = __.x_scale == 'time',
          bars;

      self.__        = __;
      self.selection = selection;

      self.normalizeData();
      self.setDimensions();

      if (has_timescale) {
//        __.bar_width = (__.w() / data[0].length) * .9;
//        __.y_axis_offset = __.y_axis_offset == 0 ? __.bar_width * .6 : __.y_axis_offset;
//        //TODO: set events?
//        __.margin = utils.extend(__.margin, {
//            left: __.margin.left + __.y_axis_offset,
//            right: __.margin.right + __.y_axis_offset
//        });
      }

      self.setScales();
      self.setAxes();

      __.delay = function (d, i) {
        // Attention, delay can not be longer of transition time! Test!
        return i / __.data.length * __.duration;
      }

      self.applyScales();
      self.setChart('bars');

//
//      self.chartScaffolding.call(self, selection, __, 'bars');
//      //self.barScaffolding.call(self, __);
//
//      __.overlapping_charts.names.forEach( function (chart_name) {
//        utils.getScaffoldingMethod.call(self, chart_name).call(self, __);
//      });

      return selection;
    }

    getset(Bar, __);
    utils_mixins.call(Bar.prototype);
    data_mixins.call(Bar.prototype);
    layout_mixins.call(Bar.prototype);
    scale_mixins.call(Bar.prototype);
    axis_mixins.call(Bar.prototype);
    chart_mixins.call(Bar.prototype);
    //bar_helpers.call(Bar.prototype);
    //bar_scaffolding.call(Bar.prototype);
    //line_scaffolding.call(Bar.prototype);

    return Bar;
  }

});

