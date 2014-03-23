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
  "bar/mixins",
], function(
  d3, 
  utils_mixins, 
  default_config, 
  data_mixins,
  layout_mixins,
  scale_mixins,
  axis_mixins,
  chart_mixins,
  bar_mixins
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

      if (has_timescale) { self.adjustDimensionsToTimeScale(); }

      self.setScales();
      self.setAxes();

      __.delay = function (d, i) {
        // Attention, delay can not be longer of transition time! Test!
        return i / __.data.length * __.duration;
      }

      self.applyScales();
      self.setChart('bars');

      // Select the bar elements, if they exists.
      self.bars_g = self.g.select("g.bars").selectAll(".bars")
        .data(__.data, self.dataIdentifier);

      // Exit phase (pushes out old bar groups before new ones come in).
      self.bars_g.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();
  
      // Otherwise, create them.
      self.bars_g.enter().append("g").each( function (data, i) {
        var bars = d3.select(this).selectAll(".bar")
              .data(data, self.dataIdentifier),
            ov_options = __.overlapping_charts.options,
            ov_bar_options = ov_options ? ov_options.bars : void 0;
  
        // Exit phase (pushes out old bars before new ones come in).
        bars.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();
  
        self.createBars.call(bars.enter(), __)
          .on('click', __.handleClick);
    
        // And transition them.
        self.transitionBars
          .call(self.transition.selectAll('.bar'), __.orientation, __)
          .call(self.endall, data, __.handleTransitionEnd);
    
        if (__.tooltip) {
          bars
           .on('mouseover', self.tip.show)
           .on('mouseout', self.tip.hide);
        }
      });

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
    bar_mixins.call(Bar.prototype);

    Bar.prototype.adjustDimensionsToTimeScale = function () {
      __.bar_width = (__.w / __.data[0].length) * .9;
      __.width += __.bar_width; //FIXME: this should be smarter!
      __.y_axis_offset = __.y_axis_offset == 0 ? __.bar_width * .6 : __.y_axis_offset;
      __.margin = utils.extend(__.margin, {
          left: __.margin.left + __.y_axis_offset,
          right: __.margin.right + __.y_axis_offset
      });
      return this;
    }

    return Bar;
  }

});

