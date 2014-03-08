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
  ], function(d3, utils, default_config, data_methods, layout_methods, scale_methods, axis_methods, scaffolding) {
  
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
      __.x_axis_data = data[0]; //FIXME

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'lines');

      // Select the line elements, if they exists.
      lines = self.g.selectAll(".line")
        .data(data, self.dataIdentifier);

      // Exit phase (let us push out old lines before the new ones come in).
      lines.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      lines.enter().append("path")
        .attr("class", "line")
        .attr("d", self.line(__) )
        .on('click', __.handleClick);
    
      //TODO: FIXME
      if (__.tooltip) {
        lines
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }
        
      //TODO
      //And transition them.
      //self.transitionLines
      //  .call(transition.selectAll('.line'), 'vertical', params)
      //  .call(utils.endall, data, __.handleTransitionEnd);

      return selection;

    }

    utils.getset(Line, __);
    data_methods.call(Line.prototype);
    layout_methods.call(Line.prototype);
    scale_methods.call(Line.prototype);
    axis_methods.call(Line.prototype);
    scaffolding.call(Line.prototype);

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

