define('mixins/axis_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function setAxisProps (axis_conf, scale) {
    if ( !axis_conf.show ) { return; }
    var axis = d3.svg.axis().scale(scale);
    d3.entries(axis_conf).forEach(function(o) {
      if ( o.value !== undefined && o.key !== 'show' ) {
        axis[o.key](o.value);
      }
    });
    return axis;
  }

  function _transitionXAxisV (__) {
    return this
      .attr("transform", "translate(0," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionXAxisH (__) {
    return this.attr("transform", "translate(" + __.barOffSet
      + "," + __.h + ")").call(__.xAxis);
  }

  function _transitionXAxis (__) {
    if ( !__.x_axis.show ) { return; }
    var vertical = __.vertical;
    if (vertical == true) {
      return _transitionXAxisV.call(this, __);
    } else {
      return _transitionXAxisH.call(this, __);
    }  
  }

  function _transitionYAxis (__) {
    if ( !__.y_axis.show ) { return; }
    console.log(this, __);
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
    this.setAxisProps = setAxisProps;
    this.transitionAxis = transitionAxis;
    return this;
  };

});

