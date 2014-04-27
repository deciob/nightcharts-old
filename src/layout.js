define('layout', [
  "d3"
], function (d3) {

  function setDimensions (selection, __) {
    if ( __.width === undefined ) {
      __.width  = +selection.style('width').replace('px', '');
      __.height = __.height || __.width * __.ratio;
    } else if ( __.width && __.height === undefined) {
      __.height = __.width * __.ratio;
    }
    setW.call(this, __);
    setH.call(this, __);
    return __;
  }

  function setW (__) {
    __.w   = __.width - __.margin.right - __.margin.left;
    return __;
  };
      
  function setH (__) {
    __.h   = __.height - __.margin.top - __.margin.bottom;
    return __;
  };

  return {
    setDimensions: setDimensions,
    setW: setW,
    setH: setH,
  };

});
