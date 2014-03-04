define('data_variables/data_variables',["d3", "utils/utils"], function(d3, utils) {

  function setXScale (data_value, orientation) {
    var orientation = (typeof orientation === "undefined") 
                    ? 'vertical' 
                    : orientation;
    if (orientation == 'vertical' && data_value == 'date') {
      return d3.time.scale;
    } else if (orientation == 'vertical' && data_value == 'ordinal') {
      return d3.scale.ordinal;
    } else if (orientation == 'vertical' && data_value == 'linear') {
      return d3.scale.linear;
    } else if (orientation == 'horizontal' && data_value == 'date') {
      return new Error('Horizontal graphs do not support timescales.');
    } else if (orientation == 'horizontal' && data_value == 'linear') {
      return d3.scale.linear;
    } else {
      return new Error('Data value ' 
                       + data_value 
                       + ', orientation' 
                       + orientation 
                       + ' not supported.');
    }
  }

  function setYScale (data_value, orientation) {
    if (orientation == 'vertical') {
      return d3.scale.linear;
    } else {
      return d3.scale.ordinal;
    }  
  }

  return function (orientation, params) {
    this.applyXScale = applyXScale;
    this.applyYScale = applyYScale;
    this.transitionXAxis = transitionXAxis;
    this.transitionYAxis = transitionYAxis;
    this.setYScale = setYScale;
    this.setXScale = setXScale;
    this.setXAxis = setXAxis;
    this.setYAxis = setYAxis;
    return this;
  };

});