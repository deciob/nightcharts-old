(function(define) {
  return define(function(require) {

    // The default configuration for barcharts.
    // It is in a separate module, because it is also used in the unit tests.
    return {
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      duration: 900,
      step: 600,
      outerTickSize: 0,
      barOffSet: 4,
      max: void 0,
      x_orient: 'bottom',
      y_orient: 'left',
      colour: 'LightSteelBlue',
      orient: 'vertical',
      handleClick: function (d, i) { return void 0; },
      handleTransitionEnd: function(d) { return void 0; },
      xValue: function (d) { return d[0]; },
      yValue: function (d) { return d[1]; }
    };

  });
})(typeof define === "function" && define.amd ? define : function(factory) {
  return module.exports = factory(require);
});