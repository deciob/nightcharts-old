define('mixins/layout_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function w () {
    var __ = this.__;
    return __.width - __.margin.right - __.margin.left; 
  };
      
  function h () {
    var __ = this.__;
    return __.height - __.margin.top - __.margin.bottom; 
  };

  return function () {
    this.w = w;
    this.h = h;
    return this;
  };

});