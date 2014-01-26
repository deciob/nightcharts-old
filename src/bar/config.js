define(function(require) {
  
    // **The default configuration module for the bar.bar module**
    
    return {
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      duration: 900,
      outerTickSize: 0,
      barOffSet: 4,
      max: void 0, // Max value for the linear scale.
      x_orient: 'bottom',
      y_orient: 'left',
      colour: 'LightSteelBlue',
      orient: 'vertical',
      invert_data: false,  // Data sorting.
      handleClick: function (d, i) { return void 0; },
      handleTransitionEnd: function(d) { return void 0; },
      xValue: function (d) { return d[0]; },
      yValue: function (d) { return d[1]; }
    };
  
});

