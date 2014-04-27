define('components/y_axis', [
  "d3"
], function (d3) {

  function setAxis (__) {
    __.yAxis = this.setAxisProps(__.y_axis, __.yScale);
    return __;
  }

  function transitionAxis (__) {
    return this
      .attr("transform", "translate(0,-" + __.offset_y + ")")
      .call(__.yAxis)
      .selectAll("g")
      .delay( __.delay );
  }

  function drawYAxis (selection, transition, __) {
    var g;
    __ = setAxis.call(this, __);
    g = selection.append("g").attr("class", "y axis");
    // Update the axis.
    transitionAxis.call(transition.selectAll('.y.axis'), __);
    return g; 
  }

  return {
    drawYAxis: drawYAxis,
    setAxis: setAxis,
    transitionAxis: transitionAxis,
  };

});