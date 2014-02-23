// **The default configuration module for the bar.bar module**

define(function(require) {
    
    return {
      duration: 900,  // transition duration
      colour: 'LightSteelBlue',
      // layout
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      barOffSet: 4,
      orientation: 'vertical',
      // axes
      x_axis: {
        outerTickSize: 0,
        orient: 'bottom',
        tickValues: void 0,
      },
      y_axis: {
        outerTickSize: 0,
        orient: 'left',
        tickValues: void 0,
      },
      // data
      max: void 0,         // Max value for the linear scale
      invert_data: false,  // Data sorting
      categoricalValue: function (d) { return d[0]; },
      quantativeValue: function (d) { return d[1]; },
      // events
      handleClick: function (d, i) { return void 0; },
      handleTransitionEnd: function(d) { return void 0; },
      // [d3-tip](https://github.com/Caged/d3-tip) tooltips,
      // can pass boolean or object with d3-tip configuration.
      tooltip: false,
    };
  
});

