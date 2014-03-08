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
  ], function(d3, utils, default_config, data_methods, layout_methods, scale_methods, axis_methods, scaffolding) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Circle (selection) {

      var self = this instanceof Circle
               ? this
               : new Circle(selection),
          data = self.normalizeData(selection.datum(), __),  //TODO
          circles;

      self.__ = __;

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'circles');

      // Select the circle elements, if they exists.
      circles = self.g.selectAll(".circle")
        .data(data[0], self.dataIdentifier);

      // Exit phase (let us push out old circles before the new ones come in).
      circles.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      circles.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return 
          console.log(d);
          __.xScale(d[0]); })
        .attr("cy", function(d) { return __.yScale(d[1]); })
        .style("fill", function(d) { return '#1D2948'; })
        .on('click', __.handleClick);
    
      //TODO: FIXME
      if (__.tooltip) {
        circles
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }
        
      //TODO
      //And transition them.
      //self.transitionCircles
      //  .call(transition.selectAll('.circle'), 'vertical', params)
      //  .call(utils.endall, data, __.handleTransitionEnd);

      return selection;

    }

    utils.getset(Circle, __);
    data_methods.call(Circle.prototype);
    layout_methods.call(Circle.prototype);
    scale_methods.call(Circle.prototype);
    axis_methods.call(Circle.prototype);
    scaffolding.call(Circle.prototype);

    return Circle;

  }

});

