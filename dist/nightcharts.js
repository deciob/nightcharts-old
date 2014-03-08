
define('draw',['require'],function(require) {
  

  return function (Chart, selection, data) {
    if (data) {
      return new Chart(selection.datum(data));
    }
    return function (data) {
      return new Chart(selection.datum(data));
    }
  }

});


// **The default base configuration module**

define('base_config', [
  "d3", 
], function(d3) {
    
    return {
      // layout.
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      vertical: true,
      // One of: ordinal, linear, time
      x_scale: 'ordinal',
      y_scale: 'linear',
      // axes, apart from `show`, properties match d3's api.
      x_axis: {
        show: true,
        outerTickSize: 0,
        orient: 'bottom',
        tickValues: void 0,
        tickFormat: null,
      },
      y_axis: {
        show: true,
        outerTickSize: 0,
        orient: 'left',
        tickValues: void 0,
      },
      y_axis_offset: 0,
      // if x_scale: 'time'
      date_type: 'string', // or 'epoc'
      date_format: '%Y',
      // false or string: 'month', 'year', etc.
      // used for extending the timescale on the margins.
      date_offset: false,

      duration: 900,  // transition duration
      colour: 'LightSteelBlue',
      //// layout
      //padding: .1,
      //barOffSet: 4,
      //orientation: 'vertical',
      //// axes
      //x_axis: {
      //  outerTickSize: 0,
      //  orient: 'bottom',
      //  tickValues: void 0,
      //  tickFormat: null,
      //},
      //y_axis: {
      //  outerTickSize: 0,
      //  orient: 'left',
      //  tickValues: void 0,
      //},
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


// **Useful functions that can be shared across modules**

define('utils/utils',["d3", "d3_tip"], function(d3, d3_tip) {
  
  function clone (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  function extend (target, source, use_clone) {
    var use_clone = (typeof use_clone === "undefined") ? true : use_clone,
        target_clone = use_clone ? clone(target): target;
    for(prop in source) {
      target_clone[prop] = source[prop];
    }
    return target_clone;
  }

  function isObject (o) {
    return Object.prototype.toString.call(o) === "[object Object]";
  }

  /* Adapted from Stoyan Stafanov */
  function schonfinkelize(fn) {
      var slice = Array.prototype.slice,
          stored_args = slice.call(arguments, 1);
      return function () {
          var new_args = slice.call(arguments),
              args = stored_args.concat(new_args);
          return fn.apply(null, args);
      };
  }


  // For each attribute in `state` it sets a getter-setter function 
  // on `obj`.
  // Accepts one level nested `state` objects.
  // TODO: make this function less convoluted.
  //
  // obj - object or function
  // state - object
  function getset (obj, state) {
    d3.entries(state).forEach(function(o) {
      obj[o.key] = function (x) {
        if (!arguments.length) return state[o.key];
        var old = state[o.key];
        state[o.key] = x;
        if ( isObject(o.value) ) {
          d3.keys(o.value).forEach(function(key) {
            state[o.key][key] = typeof x[key] !== 'undefined' ? x[key] : o.value[key];
          });
        }
        return obj;
      }
    });
  }

  // Fires a callback when all transitions of a chart have ended.
  // The solution is inspired from a reply in 
  // [Single event at end of transition?](https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ). 
  // The original suggestion assumes the data length never changes, this 
  // instead also accounts for `exits` during the transition.
  function endall (elements_in_transition, data, callback) {
    var n = data.length;
    elements_in_transition 
      .each("end", function() { 
        if (!--n) {
          callback.apply(this, arguments);
        }
      });
  }

  // Initializes a [d3-tip](https://github.com/Caged/d3-tip) tooltip.
  function tip (obj) {
    var tip = d3_tip()
      .attr('class', 'd3-tip')
      .html(function(d) { return d; });
    if (typeof obj !== 'boolean') {
      Object.keys(obj).forEach(function(key) {
        var value = obj[key];
        if (key === 'attr') {
          tip.attr(value[0], value[1]);
        } else {
          tip[key](value);
        }  
      });
    }
    return tip;
  }

  return {
    extend: extend,
    getset: getset,
    isObject: isObject,
    schonfinkelize: schonfinkelize,
    endall: endall,
    tip: tip,
  };

});


define('mixins/data_methods', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function dataIdentifier (d) {
    return d[0];
  }

  function delay (__) {
    var duration = __.duration,
        data = __.data;
    return function (d, i) {
      return i / data[0].length * duration;
    }
  };

  function normalizeData (data, __) {
    var parsed_data = [],
        date_chart = __.x_scale == 'time' ? true : false,
        date_format = __.date_format,
        date_type = __.date_type,
        categoricalValue = __.categoricalValue;
    data.forEach( function (dataset, index) {
      parsed_data.push(dataset.map(function(d, i) {
        var x;
        // The time data is encoded in a string:
        if (date_chart && date_type == 'string') {
          x = d3.time.format(date_format)
            .parse(categoricalValue.call(dataset, d));
        // The time data is encoded in an epoch number:
        } else if (date_chart && __.date_type == 'epoch') {
          x = new Date(categoricalValue.call(dataset, d) * 1000);
        // Real categorical value:
        } else {
          x = __.categoricalValue.call(dataset, d);
        }
        return [x, __.quantativeValue.call(dataset, d)];
      }));
    });
    if (__.invert_data) {
      //parsed_data = data.reverse();  // TODO
    }
    return parsed_data;
  }


  return function () {
    this.dataIdentifier = dataIdentifier;
    this.delay = delay;
    this.normalizeData = normalizeData;
    //this.transitionXAxis = transitionXAxis;
    //this.transitionYAxis = transitionYAxis;
    //this.setYScale = setYScale;
    //this.setXScale = setXScale;
    //this.setXAxis = setXAxis;
    //this.setYAxis = setYAxis;
    return this;
  };

});
define('mixins/layout_methods', [
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
define('mixins/scale_methods', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function _getRange (axis, __) {
    var vertical = __.vertical;
    if ( axis == 'x') {
      return [0, __.w];
    } else if ( axis == 'y' && vertical ) {
      return [__.h, 0];
    } else if ( axis == 'y' && !vertical ) {
      return [0, __.w];
    }
  }

  function setScale (scale_type) {
    switch (scale_type) {
      case undefined:
        return;
      case 'ordinal':
        return d3.scale.ordinal;
      case 'linear':
        return d3.scale.linear;
      case 'time':
        return d3.time.scale;
      default:
        throw new Error('scale_type `'
          + scale_type
          + '` is not supported. Supported types are: ordinal, linear, time' );
    }
  }

  // Sets the range and domain for the linear scale.
  function _applyLinearScale (range, __) {
    var max;
    if (__.max) {
      max = __.max;
    } else {
      max = d3.max( __.data, function(d) { return parseFloat(d[1]); } );
    }
    return this.range(range).domain([0, max]);
  }

  function _applyTimeScale (range, __) {
    // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
    var data = __.x_axis_data || __.data,  // FIXME this hack!
        t1 = data[0][0],
        t2 = data[data.length - 1][0],
        offset = __.date_offset,
        t0,
        t3;
    if (__.date_offset) {
      t0 = d3.time[offset].offset(t1, -1);
      t3 = d3.time[offset].offset(t2, +1);
      return this
        .domain([t0, t3])
        .range([t0, t3].map(d3.time.scale()
          .domain([t1, t2])
          .range([0, __.w()])));
    } else {
      return this.range(range).domain([data[0][0], data[data.length - 1][0]]);
    }
  }

  // Sets the range and domain for the ordinal scale.
  function _applyOrdinalScale (range, __) {
    var data = __.x_axis_data || __.data;  // FIXME this hack!
    return this
      .rangeRoundBands(range, __.padding)
      .domain( __.data[0].map( function(d) { return d[0]; } ) );
  }

  function applyScale (axis, scale_type, __) {
    var range = _getRange(axis, __);
    switch (scale_type) {
      case 'ordinal':
        return _applyOrdinalScale.call(this, range, __);
      case 'linear':
        return _applyLinearScale.call(this, range, __);
      case 'time':
        return _applyTimeScale.call(this, range, __);
      case undefined:
        return new Error('scale cannot be undefined');
      default:
        throw new Error('scale_type ' 
                         + scale_type 
                         + ' not supported. Is it misspelled?' );
    }
  }

  return function () {
    this.setScale = setScale;
    this.setScales = setScale;
    this.applyScale = applyScale;
    this.applyScales = applyScale;
    return this;
  };

});


define('mixins/axis_methods', [
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
    return this.call(__.yAxis)
      .selectAll("g")
      .delay( __.delay(__) );
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


define('mixins/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function axisScaffolding (data, __) {
    // Scales are functions that map from an input domain to an output range.
    this.xScale = this.setScale(__.x_scale)();
    this.yScale = this.setScale(__.y_scale)();

    // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes).
    this.xAxis = this.setAxisProps(__.x_axis, this.xScale);
    this.yAxis = this.setAxisProps(__.y_axis, this.yScale);

    utils.extend(
      this.__, 
      {
        data: data,
        //x_axis_data: data[0], // FIXME this hack!
        yScale: this.yScale,
        xScale: this.xScale,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        delay: this.delay,
        w: this.w(),
        h: this.h(),
      }, 
      false
    );

    this.applyScale.call( this.xScale, 'x', __.x_scale, __ );
    this.applyScale.call( this.yScale, 'y', __.y_scale, __ );

    return this;
  }

  function chartScaffolding (selection, __, chart_class) {

    // Select the svg element, if it exists.
    //this.gWrapper = selection.selectAll("g." + chart_class + '_wrapper')
    this.svg = selection.selectAll("svg").data([this.data]);
    // Otherwise, create the skeletal chart.
    this.gEnter = this.svg.enter().append("svg")
      //.attr('class', chart_class + '_wrapper')
      .append("g");
    // Initializing the tooltip.
    if ( __.tooltip ) {
      this.tip = utils.tip( __.tooltip );
      this.gEnter.call(this.tip);
    }

    this.gEnter.append("g").attr("class", chart_class);
    this.gEnter.append("g").attr("class", "x axis");
    this.gEnter.append("g").attr("class", "y axis")
     .attr("transform", "translate(-" + (__.y_axis_offset) + ",0)");
     
    // Update the outer dimensions.
    this.svg.attr("width", __.width)
      .attr("height", __.height);

    // Update the inner dimensions.
    this.g = this.svg.select("g")
      .attr("transform", "translate(" + 
      __.margin.left + "," + __.margin.top + ")");

    // Transitions root.
    this.transition = this.g.transition().duration(__.duration);

    // Update the y axis.
    this.transitionAxis.call(
      this.transition.selectAll('.y.axis'), 'y', __);

    // Update the x axis.
    this.transitionAxis.call(
      this.transition.selectAll('.x.axis'), 'x', __);

    return this
  };
      
  return function () {
    this.axisScaffolding = axisScaffolding;
    this.chartScaffolding = chartScaffolding;
    return this;
  };

});


// **The default configuration module for the line.line module**

define('line/config',[
  "d3", 
  "base_config",
  "utils/utils",
], function(d3, base_config, utils) {
    
  var config = {
    x_scale: 'time',
    // TODO this is an yAxis offset....
    //date_adjust: 5
  };

  return utils.extend(base_config, config);
  
});


// **The line.line module**

define('line/line',[
    "d3", 
    "utils/utils",
    "line/config", 
    "mixins/data_methods",
    "mixins/layout_methods",
    "mixins/scale_methods",
    "mixins/axis_methods",
    "mixins/scaffolding",
  ], function(d3, utils, default_config, data_methods, layout_methods, scale_methods, axis_methods, scaffolding) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection),
          data = self.normalizeData(selection.datum(), __),
          lines;

      self.__ = __;
      __.x_axis_data = data[0]; //FIXME

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'lines');

      // Select the line elements, if they exists.
      lines = self.g.selectAll(".line")
        .data(data, self.dataIdentifier);

      // Exit phase (let us push out old lines before the new ones come in).
      lines.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      lines.enter().append("path")
        .attr("class", "line")
        .attr("d", self.line(__) )
        .on('click', __.handleClick);
    
      //TODO: FIXME
      if (__.tooltip) {
        lines
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }
        
      //TODO
      //And transition them.
      //self.transitionLines
      //  .call(transition.selectAll('.line'), 'vertical', params)
      //  .call(utils.endall, data, __.handleTransitionEnd);

      return selection;

    }

    utils.getset(Line, __);
    data_methods.call(Line.prototype);
    layout_methods.call(Line.prototype);
    scale_methods.call(Line.prototype);
    axis_methods.call(Line.prototype);
    scaffolding.call(Line.prototype);

    Line.prototype.line = function (__) {
      return d3.svg.line().x(function(d, i) {
        return __.xScale(d[0]);
      }).y(function(d, i) {
        return __.yScale(d[1]);
      });
    }

    return Line;

  }

});


// **The default configuration module for the point.point module**

define('circle/config', [
  "d3", 
  "base_config",
  "utils/utils",
], function(d3, base_config, utils) {
    
  var config = {
    //x_scale: 'time',
    // TODO this is an yAxis offset....
    //date_adjust: 5
  };

  return utils.extend(base_config, config);
  
});


// **The circle.circle module**

define('circle/circle',[
    "d3", 
    "utils/utils",
    "circle/config", 
    "mixins/data_methods",
    "mixins/layout_methods",
    "mixins/scale_methods",
    "mixins/axis_methods",
    "mixins/scaffolding",
  ], function(d3, utils, default_config, data_methods, layout_methods, scale_methods, axis_methods, scaffolding) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Circle (selection) {

      var self = this instanceof Circle
               ? this
               : new Circle(selection),
          data = self.normalizeData(selection.datum(), __),  //TODO
          circles;

      self.__ = __;

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'circles');

      // Select the circle elements, if they exists.
      circles = self.g.selectAll(".circle")
        .data(data[0], self.dataIdentifier);

      // Exit phase (let us push out old circles before the new ones come in).
      circles.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      circles.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return 
          console.log(d);
          __.xScale(d[0]); })
        .attr("cy", function(d) { return __.yScale(d[1]); })
        .style("fill", function(d) { return '#1D2948'; })
        .on('click', __.handleClick);
    
      //TODO: FIXME
      if (__.tooltip) {
        circles
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }
        
      //TODO
      //And transition them.
      //self.transitionCircles
      //  .call(transition.selectAll('.circle'), 'vertical', params)
      //  .call(utils.endall, data, __.handleTransitionEnd);

      return selection;

    }

    utils.getset(Circle, __);
    data_methods.call(Circle.prototype);
    layout_methods.call(Circle.prototype);
    scale_methods.call(Circle.prototype);
    axis_methods.call(Circle.prototype);
    scaffolding.call(Circle.prototype);

    return Circle;

  }

});


define('chart',[
  "draw",
  "base_config",
  "utils/utils",
  "mixins/data_methods",
  "mixins/layout_methods",
  "mixins/scale_methods",
  "mixins/axis_methods",
  "mixins/scaffolding",
  //"bar/config", 
  //"bar/bar",
  "line/config",
  "line/line",
  "circle/config",
  "circle/circle",
  //"frame/states",
  //"frame/state_machine",
  //"frame/frame"
], function(
  draw, 
  base_config, 
  utils, 
  data_methods, 
  layout_methods, 
  scale_methods,
  axis_methods,
  scaffolding,
  //bar_config, 
  //Bar, 
  line_config, 
  Line,
  circle_config,
  Circle
  //states, 
  //StateMachine, 
  //Frame
) {

  return {
    draw: draw,
    base_config: base_config,
    utils: utils,
    data_methods: data_methods,
    layout_methods: layout_methods,
    scale_methods: scale_methods,
    axis_methods: axis_methods,
    scaffolding: scaffolding,
    //bar_config: bar_config,
    //Bar: Bar,
    line_config: line_config,
    Line: Line,
    circle_config: circle_config,
    Circle: Circle,
    //Frame: Frame,
    //states: states, 
    //StateMachine: StateMachine,
  };

});

