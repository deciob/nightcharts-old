define('y_axis', [
  "d3"
], function (d3) {

  function setAxis () {
    var __ = this.__;
    __.yAxis = this._setProps(__.y_axis, __.yScale);
    return this;
  }

  function _transitionAxis (__) {
    if ( !__.y_axis.show ) { return; }
    return this
      .attr("transform", "translate(0,-" + __.offset_y + ")")
      .call(__.yAxis)
      .selectAll("g")
      .delay( __.delay );
  }

  return {
    setAxis: setAxis,
    transitionAxis: transitionAxis,
  };

});