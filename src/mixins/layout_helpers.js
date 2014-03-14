define('mixins/layout_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  // TODO: unit test.
  function setDimensions () {
    var __ = this.__;
    if ( __.width === undefined ) {
      __.width  = +__.selection.style('width').replace(/[^0-9]+/g, '');
      __.height = __.height || __.width * __.ratio;
    } else if ( __.width && __.height === undefined) {
      __.height = __.width * __.ratio;
    }
    return this;
  }

  function w () {
    var __ = this.__;
    return __.width - __.margin.right - __.margin.left; 
  };
      
  function h () {
    var __ = this.__;
    return __.height - __.margin.top - __.margin.bottom; 
  };

  return function () {
    this.setDimensions = setDimensions;
    this.w = w;
    this.h = h;
    return this;
  };

});