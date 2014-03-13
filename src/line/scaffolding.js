define('line/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function lineScaffolding ( __ ) {
    var self = this,
        data = __.data;

    // Select the line elements, if they exists.
    self.lines_g = self.g.select('g.lines').selectAll(".lines")
      .data(data, self.dataIdentifier);

    // Exit phase (let us push out old lines before the new ones come in).
    self.lines_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.lines_g.enter().append("g").each( function (data, i) {
      var lines = d3.select(this).selectAll(".bar")
            .data([data], self.dataIdentifier),
          ov_options = __.overlapping_charts.options,
          ov_line_options = ov_options ? ov_options.bars : void 0;

      // Exit phase (let us push out old lines before the new ones come in).
      lines.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();      

      lines.enter().append("path")
        .attr("class", "line")
        .attr("d", self.line(__) )
        .on('click', __.handleClick);
      
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

    });

    return this;
  }

  return function () {
    this.lineScaffolding = lineScaffolding;
    return this;
  };

});