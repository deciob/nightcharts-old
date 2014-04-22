define('line/mixins', ["d3"], function (d3) {

  function tweenDash() {
    var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function(t) { 
      return i(t); };
  }

  function transitionLine (selection, data) {

    var self = this,
        __ = this.__,
        back_line = d3.select(selection).select('.line.back'),
        front_line = d3.select(selection).select('.line.front'),
        back_line_path, 
        front_line_path;

    front_line_path = front_line.selectAll(".line.front.path")
      .data([data], function(d) {
        //console.log(d[0], '@@');
        return d.length;});

    front_line_path.exit().transition().remove();
  
    front_line_path.enter().append("path")
      .attr("class", "line front path")
      .attr("d", function (d) {
        return self.line(__)(d);})    
      .style("stroke", 'none')
      .transition()
      .delay(__.delay)
      .style("stroke", '#05426C')
      .duration(__.duration)
      .attrTween("stroke-dasharray", tweenDash)
      .call(self.endall, [data], __.handleTransitionEnd);
      //.each("end", function() { 
      //  self.endall.call(this, data, __.handleTransitionEnd); 
      //});
  
  }

  function setLines () {
    var self = this,
          __ = this.__;

    var lines = self.g.select('.lines').selectAll(".line")
          // data is an array, each element one line.
          .data(__.data, self.dataIdentifier),
        line_g, line_g_back, line_g_front,
        ov_options = __.overlapping_charts.options,
        ov_line_options = ov_options ? ov_options.lines : void 0;
  
    // Exit phase (let us push out old lines before the new ones come in).
    lines.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    
    // this should end my line or piece of line, all depends from the data,
    // if the data only represents a fraction of the line then the charting
    // function needs to be called again.
    line_g = lines.enter().append("g")
      .attr("class", "line");
    line_g.append('g')
      .attr("class", "line back");
    line_g.append('g')
      .attr("class", "line front")
    line_g.each(function (d, i) { 
        //console.log('lines.enter().append("g")', d);
        return transitionLine.call(self, this, d) });
  
    //lines.enter().append("path")
    //  .attr("class", "line")
    //  //.attr("d", self.line(__) )
    //  .on('click', __.handleClick)
    //  .transition()
    //  .duration(5000)
    //  .ease("linear")
    //  .attr("d", self.line(__) );
    //
    //if (__.tooltip) {
    //  lines
    //   .on('mouseover', self.tip.show)
    //   .on('mouseout', self.tip.hide);
    //}
      
    //TODO
    //And transition them.
    //self.transitionLines
    //  .call(transition.selectAll('.line'), 'vertical', params)
    //  .call(utils.endall, data, __.handleTransitionEnd);



    return this;
  }

  return function () {
    this.setLines = setLines;
    return this;
  };

});

