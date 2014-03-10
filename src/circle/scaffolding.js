define('circle/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function circleScaffolding ( __ ) {
    var self = this,
        data = __.data;

    // Select the circle elements, if they exists.
    self.circles_g = d3.select('g.circles').selectAll(".circles")
      .data(data, self.dataIdentifier);

    // Exit phase (let us push out old circles before the new ones come in).
    self.circles_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.circles_g.enter().append("g").each( function (data, i) {
      var circles = d3.select(this).selectAll(".circle")
            .data(data, self.dataIdentifier),
          ov_options = __.overlapping_charts.options,
          ov_circle_options = ov_options ? ov_options.circles : void 0;

      // Exit phase (let us push out old circles before the new ones come in).
      circles.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      circles.enter().append("circle")
        .attr("class", "dot")
        .attr("r", ov_circle_options && ov_circle_options.r ? ov_circle_options.r : 4)
        .attr("cx", function(d) { return __.xScale(d[0]); })
        .attr("cy", function(d) { return __.yScale(d[1]); })
        // TODO: this will need a fix if is an overlapping chart!
        .on('click', __.handleClick); 

      // Tooltips.
      if (ov_circle_options && ov_circle_options.tooltip) {
        self.tip = utils.tip( ov_circle_options.tooltip );
        self.gEnter.call(self.tip);
      }
      if (__.tooltip || ov_circle_options && ov_circle_options.tooltip) {
        circles
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }

    });
    
    //TODO
    //And transition them.
    //self.transitionCircles
    //  .call(transition.selectAll('.circle'), 'vertical', params)
    //  .call(utils.endall, data, __.handleTransitionEnd);

    return this;
  }

  return function () {
    this.circleScaffolding = circleScaffolding;
    return this;
  };

});