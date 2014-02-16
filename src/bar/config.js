define(function(require) {
  
    // **The default configuration module for the bar.bar module**
    
    return {
      duration: 900,  // transition duration
      colour: 'LightSteelBlue',
      // layout
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      barOffSet: 4,
      orient: 'vertical',
      // axis
      outerTickSize: 0,
      x_orient: 'bottom',
      y_orient: 'left',
      // data
      max: void 0,         // Max value for the linear scale
      invert_data: false,  // Data sorting
      categoricalValue: function (d) { return d[0]; },
      quantativeValue: function (d) { return d[1]; },
      // events
      handleClick: function (d, i) { return void 0; },
      handleTransitionEnd: function(d) { return void 0; },
      // [d3-tip](https://github.com/Caged/d3-tip) tooltips,
      // can pass boolean or html callback function.
      tooltip: false,
    };
  
});

