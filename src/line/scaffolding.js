define('line/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function lineScaffolding ( __ ) {
    var self = this,
        data = __.data;

    // Select the line elements, if they exists.
    self.lines = d3.select('g.lines').selectAll(".line")
      .data(data, self.dataIdentifier);

    // Exit phase (let us push out old lines before the new ones come in).
    self.lines.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.lines.enter().append("path")
      .attr("class", "line")
      .attr("d", self.line(__) )
      .on('click', __.handleClick);
    
    if (__.tooltip) {
      self.lines
       .on('mouseover', self.tip.show)
       .on('mouseout', self.tip.hide);
    }
      
    //TODO
    //And transition them.
    //self.transitionLines
    //  .call(transition.selectAll('.line'), 'vertical', params)
    //  .call(utils.endall, data, __.handleTransitionEnd);

    return this;
  }

  return function () {
    this.lineScaffolding = lineScaffolding;
    return this;
  };

});