define('x_axis', [
  "d3"
], function (d3) {

  function _transitionXAxisV (__) {
    return this
      .attr("transform", "translate(" + __.offset_x + "," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionXAxisH (__) {
    return this
      .attr("transform", "translate(" + __.offset_x + "," + __.h + ")")
      .call(__.xAxis);
  }

  function transitionAxis (__) {
    if ( !__.x_axis.show ) { return; }
    if (__.quantitative_scale == 'y') {
      return _transitionXAxisV.call(this, __);
    } else if (__.quantitative_scale == 'x') {
      return _transitionXAxisH.call(this, __);
    } else {
      throw new Error('quantitative_scale must be one of: x, y');
    } 
  }

  function setAxis () {
    var __ = this.__;
    __.xAxis = this._setProps(__.x_axis, __.xScale);
    return this;
  }

  return {
    setAxis: setAxis,
    transitionAxis: transitionAxis,
  };

});