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
    //self.bars = self.g.select('g.bars').selectAll(".bar")
    self.bars = self.g.select(".bars").selectAll(".bar")
      .data(data[0], self.dataIdentifier);
  
    // Exit phase (let us push out old bars before the new ones come in).
    self.bars.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.bars = self.createBars.call(self.bars.enter(), __.orientation, __)
      .on('click', __.handleClick);

    // And transition them.
    self.bars = self.transitionBars
      .call(self.transition.selectAll('.bar'), __.orientation, __);
      //.call(utils.endall, data, __.handleTransitionEnd);

    if (self.tooltip) {
      self.bars
       .on('mouseover', self.tip.show)
       .on('mouseout', self.tip.hide);
    }
      
    return this;
  }

  return function () {
    this.barScaffolding = barScaffolding;
    return this;
  };

});

    





