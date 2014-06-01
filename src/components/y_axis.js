define('components/y_axis', [
  "d3",
  'utils'
], function (d3, utils) {
  'use strict';

  var d3 = d3;

  function setAxis (__) {
    __.yAxis = utils.setAxisProps(__.y_axis, __.yScale);
    return __;
  }

  function transitionAxis (__) {
    return this
      .attr("transform", "translate(0,-" + __.offset_y + ")")
      .call(__.yAxis)
      .selectAll("g")
      .delay( __.delay );
  }

  function drawYAxis (selection, transition, __, data) {
    var g,
        __ = setAxis(__);
    // Select the g element, if it exists.
    g = selection.selectAll("g.y.axis").data([data]);
    // Otherwise, create the skeletal axis.
    g.enter().append("g").attr("class", "y axis");
    g.exit().remove();
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