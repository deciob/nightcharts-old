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
        .data(data, self.dataIdentifier);
      // Exit phase (let us push out old circles before the new ones come in).
      circles.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();
      // Otherwise, create them.
      circles.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { 
          return __.xScale(d[0]); })
        .attr("cy", function(d) { 
          return __.yScale(d[1]); })
        .style("fill", function(d) { return '#1D2948'; })
        .on('click', __.handleClick);

      //TODO: FIXME
      if (__.tooltip) {
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