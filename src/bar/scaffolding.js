define('bar/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function barScaffolding ( __ ) {
    var self = this,
        data = __.data,
        bars_enter;

    // Select the bar elements, if they exists.
    // TODO: only handles first nested array!
    // This must look like circles!!!!
    self.bars_g = self.g.select("g.bars").selectAll(".bars")
      .data(data, self.dataIdentifier);
  
    // Exit phase (let us push out old bars before the new ones come in).
    self.bars_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.bars_g.enter().append("g").each( function (data, i) {
      var bars = d3.select(this).selectAll(".bar")
        .data(data, self.dataIdentifier),
      ov_options = __.overlapping_charts.options,
      ov_bar_options = ov_options ? ov_options.bars : void 0;

      // Exit phase (let us push out old circles before the new ones come in).
      bars.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      self.createBars.call(bars.enter(), __.orientation, __)
        .on('click', __.handleClick);
  
      // And transition them.
      self.transitionBars
        .call(self.transition.selectAll('.bar'), __.orientation, __)
        .call(utils.endall, data, __.handleTransitionEnd);
  
      if (__.tooltip) {
        bars
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }
    });
      
    return this;
  }

  return function () {
    this.barScaffolding = barScaffolding;
    return this;
  };

});

    





