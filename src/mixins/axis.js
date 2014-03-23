define('mixins/axis', [
  "d3"
], function (d3) {

  function _setProps (axis_conf, scale) { 
    if ( !axis_conf.show ) { return; }
    var axis = d3.svg.axis().scale(scale);
    d3.entries(axis_conf).forEach(function(o) {
      if ( o.value !== undefined && o.key !== 'show' ) {
        axis[o.key](o.value);
      }
    });
    return axis;
  }

  function setAxes () {
    var __ = this.__;
    __.xAxis = this._setProps(__.x_axis, __.xScale);
    __.yAxis = this._setProps(__.y_axis, __.yScale);
    return this;
  }

  function _transitionXAxisV (__) {
    return this
      .attr("transform", "translate(0," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionXAxisH (__) {
    return this
      .attr("transform", "translate(" + 10 + "," + __.h + ")")
      .call(__.xAxis);
  }

  function _transitionXAxis (__) {
    if ( !__.x_axis.show ) { return; }
    __.quantitative_scale //?????????????
    if (__.quantitative_scale == 'y') {
      return _transitionXAxisV.call(this, __);
    } else if (__.quantitative_scale == 'x') {
      return _transitionXAxisH.call(this, __);
    } else {
      throw new Error('quantitative_scale must be one of: x, y');
    } 
  }

  function _transitionYAxis (__) {
    if ( !__.y_axis.show ) { return; }
    return this.call(__.yAxis)
      .selectAll("g")
      .delay( __.delay );
  }

  function transitionAxis (axis, __) {
    switch (axis) {
      case 'x':
        return _transitionXAxis.call(this, __);
      case 'y':
        return _transitionYAxis.call(this, __);
      default:
        throw new Error('axis must be one of: x, y. Not ' + axis );
    } 
  } 

  return function () {
    this.setAxes = setAxes;
    this._setProps = _setProps;
    this.transitionAxis = transitionAxis;
    return this;
  };

});