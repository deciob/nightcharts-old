define('layout', [
  "d3"
], function (d3) {

  // TODO: unit test.
  function setDimensions () {
    var __ = this.__;
    if ( __.width === undefined ) {
      __.width  = +this.selection.style('width').replace('px', '');
      __.height = __.height || __.width * __.ratio;
    } else if ( __.width && __.height === undefined) {
      __.height = __.width * __.ratio;
    }
    this.setW();
    this.setH();
    return this;
  }

  function setW () {
    var __ = this.__;
    __.w   = __.width - __.margin.right - __.margin.left;
    return this;
  };
      
  function setH () {
    var __ = this.__;
    __.h   = __.height - __.margin.top - __.margin.bottom;
    return this; 
  };

  return {
    setDimensions: setDimensions,
    setW: setW,
    setH: setH,
  };

});
