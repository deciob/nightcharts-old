
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

define('base_config',['require'],function(require) {
    
    return {
      duration: 900,  // transition duration
      colour: 'LightSteelBlue',
      // layout
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      barOffSet: 4,
      // axes
      x_axis: {
        outerTickSize: 0,
        orient: 'bottom',
        tickValues: void 0,
        tickFormat: null,
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
      // is the xAxis a timescale?
      // false or function: d3.time.format("%Y").parse
      date: false,
      date_type: 'string', // or 'epoc'
      date_format: '%Y',
      // false or string: 'month', 'year', etc.
      // used for extending the timescale on the margins.
      date_offset: false
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

  function extend (target, source) {
    var target_clone = clone(target);
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


define('mixins/common_mixins',["d3", "utils/utils"], function(d3, utils) {

    // Sets the range and domain for the linear scale.
    function _applyLinearScale (params, range) {
      var max;
      if (params.__.max) {
        max = params.__.max;
      } else {
        max = d3.max( params.data, function(d) {return parseFloat(d[1]); } );
      }
      return this.range(range).domain([0, max]);
    }

    function _applyTimeScale (params, range) {
      // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
      var data = params.x_axis_data || params.data,  // FIXME this hack!
          t1 = data[0][0],
          t2 = data[data.length - 1][0],
          offset = params.__.time_offset,
          t0,
          t3;
      if (params.__.time_offset) {
        t0 = d3.time[offset].offset(t1, -1);
        t3 = d3.time[offset].offset(t2, +1);
        return this
          .domain([t0, t3])
          .range([t0, t3].map(d3.time.scale()
            .domain([t1, t2])
            .range([0, params.w()])));
      } else {
        return this.range(range).domain([data[0][0], data[data.length - 1][0]]);
      }
    }
  
    // Sets the range and domain for the ordinal scale.
    function _applyOrdinalScale (params, range) {
      var data = params.x_axis_data || params.data;  // FIXME this hack!
      return this
        .rangeRoundBands(range, params.__.padding)
        .domain(data.map(function(d) { return d[0]; }));
    }
  
    function _applyXScaleV (params) {
      var range = [0, params.w()];
      if (params.__.date) {
        return _applyTimeScale.call(this, params, range);
      } else {
        return _applyOrdinalScale.call(this, params, range);
      }
    }
  
    function _applyXScaleH (params) {
      var range = [0, params.w()];
      return _applyLinearScale.call(this, params, range);
    }
  
    function applyXScale (orientation, params) {
      if (orientation == 'vertical') {
        return _applyXScaleV.call(this, params);
      } else {
        return _applyXScaleH.call(this, params);
      }
    }
  
    function _applyYScaleV (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return _applyLinearScale.call(this, params, range);
    }
  
    function _applyYScaleH (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return _applyOrdinalScale.call(this, params, range);
    }
  
    function applyYScale (orientation, params) {
      if (orientation == 'vertical') {
        return _applyYScaleV.call(this, params);
      } else {
        return _applyYScaleH.call(this, params);
      }  
    }
  
    function _transitionXAxisV (params) {
      return this
        .attr("transform", "translate(0," + params.yScale.range()[0] + ")")
        .call(params.xAxis);
    }
  
    function _transitionXAxisH (params) {
      return this.attr("transform", "translate(" + params.__.barOffSet
        + "," + params.h() + ")").call(params.xAxis);
    }
  
    function transitionXAxis (orientation, params) {
      if (orientation == 'vertical') {
        return _transitionXAxisV.call(this, params);
      } else {
        return _transitionXAxisH.call(this, params);
      }  
    }
  
    function _transitionYAxisV (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    }
  
    function _transitionYAxisH (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    }
  
    function transitionYAxis (orientation, params) {
      if (orientation == 'vertical') {
        return _transitionYAxisV.call(this, params);
      } else {
        return _transitionYAxisH.call(this, params);
      }  
    } 

    function setYScale (orientation) {
      if (orientation == 'vertical') {
        return d3.scale.linear;
      } else {
        return d3.scale.ordinal;
      }  
    }

    function setXScale (orientation, date) {
      if (orientation == 'vertical' && date) {
        return d3.time.scale;
      } else if (orientation != 'vertical' && date) {
        return new Error('Timescale is only for horizontal graphs.')
      } else if (orientation == 'vertical') {
        return d3.scale.ordinal;
      } else {
        return d3.scale.linear;
      }  
    }

    function setXAxis (x_axis, xScale) {
      var xAxis = d3.svg.axis().scale(xScale);
      d3.entries(x_axis).forEach(function(o) {
        if (o.value !== undefined) {
          xAxis[o.key](o.value);
        }
      });
      return xAxis;
    }

    function setYAxis (y_axis, yScale) {
      var yAxis = d3.svg.axis().scale(yScale);
      d3.entries(y_axis).forEach(function(o) {
        if (o.value !== undefined) {
          yAxis[o.key](o.value);
        }
      });
      return yAxis;
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


define('mixins/bar_mixins',["d3", "utils/utils"], function(d3, utils) {

    function createBarsV (params) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return params.xScale(d[0]); })
        .attr("width", params.xScale.rangeBand())
        .attr("y", params.h() + params.__.barOffSet)
        .attr("height", 0);
    }

    function createTimeBarsV (params) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { 
          return params.xScale(d[0]) - params.date_adjust; 
        })
        .attr("width", params.bar_width)
        .attr("y", params.h() + params.__.barOffSet)
        .attr("height", 0);
    }

    function createBarsH (params) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", params.__.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("height", params.yScale.rangeBand());
    }

    function createBars (orientation, params) {
      if (orientation == 'vertical' && !params.__.parseDate) {
        return createBarsV.call(this, params);
      } else if (orientation == 'vertical' && params.__.parseDate) {
        return createTimeBarsV.call(this, params);
      } else {
        return createBarsH.call(this, params);
      }
    }

    function transitionBarsV (params) {
      return this.delay(params.delay)
        .attr("x", function(d) { return params.xScale(d[0]); })
        .attr("y", function(d) { return params.yScale(d[1]); })
        .attr("height", function(d) { return params.h() - params.yScale(d[1]); });
    }

    function transitionTimeBarsV (params) {
      return this.delay(params.delay)
        .attr("x", function(d) { 
          return params.xScale(d[0]) - params.date_adjust; 
        })
        .attr("y", function(d) { return params.yScale(d[1]); })
        .attr("height", function(d) { return params.h() - params.yScale(d[1]); });
    }

    function transitionBarsH (params) {
      return this.delay(params.delay)
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("x", params.__.barOffSet)
        .attr("width", function(d) { 
          return params.xScale(d[1]) + params.__.barOffSet; 
        });
    }

    function transitionBars (orientation, params) {
      if (orientation == 'vertical' && !params.__.parseDate) {
        return transitionBarsV.call(this, params);
      } else if (orientation == 'vertical' && params.__.parseDate) {
        return transitionTimeBarsV.call(this, params);
      } else {
        return transitionBarsH.call(this, params);
      }
    }

    return function (orientation, params) {
      this.createBars = createBars;
      this.transitionBars = transitionBars;
      return this;
    };

});


define('mixins/line_mixins',["d3", "utils/utils"], function(d3, utils) {

      //parse = d3.time.format("%Y-%m-%d").parse
      //format = d3.time.format("%Y-%m-%d")
      //format(new Date(2011, 0, 1))

  function normalizeData (data, __) {
    var parsed_data = [];
    data.forEach( function (dataset, index) {
      parsed_data.push(dataset.map(function(d, i) {
        var x;
        if (__.date && __.date_type == 'string') {
          x = d3.time.format(__.date_format)
            .parse(__.categoricalValue.call(dataset, d));
        } else if (__.date && __.date_type == 'epoch') {
          x = d3.time.format(__.date_format)(new Date(__.categoricalValue.call(dataset, d) * 1000));
        } else {
          x = __.categoricalValue.call(dataset, d);
        }
        return [
          x, 
          __.quantativeValue.call(dataset, d)
        ];
      }));
    });
    if (__.invert_data) {
      //parsed_data = data.reverse();  // TODO
    }
    return parsed_data;
  }

  function line (params) {
    return d3.svg.line().x(function(d, i) {
        return params.xScale(d[0]);
      }).y(function(d, i) {
        return params.yScale(d[1]);
      });
  }

  function createLines (params) {
    return this.append("path")
      .attr("class", "line")
      .attr("d", line(params) );
  }

  function transitionLines (params) {
    
  }

  return function (orientation, params) {
    this.createLines = createLines;
    this.transitionLines = transitionLines;
    this.normalizeData = normalizeData;
    return this;
  };
  
});


// **The default configuration module for the bar.bar module**

define('bar/config',[
    "base_config",
    "utils/utils",
  ], function(base_config, utils) {
    
  var config = {
    orientation: 'vertical',
  };

  return utils.extend(base_config, config);
  
});


// **The bar.bar module**

define('bar/bar',[
    "d3", 
    "utils/utils",
    "bar/config", 
    "mixins/common_mixins",
    "mixins/bar_mixins",
  ], function(d3, utils, default_config, common_mixins, bar_mixins) {
  
  return function (user_config) {

    var config = user_config || {}
      , __
      , w
      , h
      , xScale
      , yScale
      , xAxis
      , yAxis;

    __ = utils.extend(default_config, config);

    function dataIdentifier (d) {
      return d[0];
    }

    function Bar (selection) {

      var self = this instanceof Bar
               ? this
               : new Bar(selection);

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
  
      // Scales are functions that map from an input domain to an output range.
      // Presently no assumption is made about the chart orientation.
      xScale = self.setXScale(__.orientation, __.parseDate)();
      yScale = self.setYScale(__.orientation)();
  
      // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes)
      // Presently no assumption is made about the chart orientation.
      xAxis = self.setXAxis(__.x_axis, xScale);
      yAxis = self.setYAxis(__.y_axis, yScale);
      
      selection.each( function (dat) {

        var data
          , tooltip = __.tooltip
          , tip
          , svg
          , gEnter
          , g
          , bars
          , transition
          , params;

        // data structure:
        // 0: name
        // 1: value
        data = dat.map(function(d, i) {
          var x;
          if (__.parseDate) {
            x = __.parseDate(__.categoricalValue.call(dat, d));
          } else {
            x = __.categoricalValue.call(dat, d);
          }
          return [
            x, 
            __.quantativeValue.call(dat, d)
          ];
        });
        if (__.invert_data) {
          data = data.reverse();
        }

        function delay (d, i) {
          // Attention, delay can not be longer of transition time! Test!
          return i / data.length * __.duration;
        }

        params = {
          data: data,
          __: __,
          h: h,
          w: w,
          yScale: yScale,
          xScale: xScale,
          xAxis: xAxis,
          yAxis: yAxis,
          delay: delay,
          date_adjust: (w()/data.length)/2
        }

        if (__.parseDate) {
          params.bar_width = (w() / data.length) - .5;
        }

        self.applyXScale.call(xScale, __.orientation, params);
        self.applyYScale.call(yScale, __.orientation, params); 

        // Select the svg element, if it exists.
        svg = selection.selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        gEnter = svg.enter().append("svg").append("g");
        // Initializing the tooltip.
        if (tooltip) {
          tip = utils.tip(tooltip);
          gEnter.call(tip);
        }
        gEnter.append("g").attr("class", "bars");
        gEnter.append("g").attr("class", "x axis");
        if (__.parseDate) {
          gEnter.append("g").attr("class", "y axis")
           .attr("transform", "translate(-" + (params.date_adjust + 5) + ",0)");
        } else {
          gEnter.append("g").attr("class", "y axis");
        }

        // Update the outer dimensions.
        svg.attr("width", __.width)
          .attr("height", __.height);

        // Update the inner dimensions.
        g = svg.select("g")
          .attr("transform", "translate(" + 
          __.margin.left + "," + __.margin.top + ")");

        // Transitions root.
        transition = g.transition().duration(__.duration)
        
        // Update the y axis.
        self.transitionYAxis.call(
          transition.selectAll('.y.axis'), __.orientation, params);

        // Update the x axis.
        self.transitionXAxis.call(
          transition.selectAll('.x.axis'), __.orientation, params);

        // Select the bar elements, if they exists.
        bars = g.select(".bars").selectAll(".bar")
          .data(data, dataIdentifier);

        // Exit phase (let us push out old bars before the new ones come in).
        bars.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();

        // Otherwise, create them.
        bars = self.createBars.call(bars.enter(), __.orientation, params)
          .on('click', __.handleClick);

        if (tooltip) {
          bars
           .on('mouseover', tip.show)
           .on('mouseout', tip.hide);
        }
          
        // And transition them.
        self.transitionBars
          .call(transition.selectAll('.bar'), __.orientation, params)
          .call(utils.endall, data, __.handleTransitionEnd);

        return selection;

      });

    }

    utils.getset(Bar, __);
    common_mixins.call(Bar.prototype);
    bar_mixins.call(Bar.prototype);

    return Bar;

  }

});


// **The default configuration module for the line.line module**

define('line/config',[
    "base_config",
    "utils/utils",
  ], function(base_config, utils) {
    
  var config = {
    // TODO this is an yAxis offset....
    date_adjust: 5
  };

  return utils.extend(base_config, config);
  
});


// **The line.line module**

define('line/line',[
    "d3", 
    "utils/utils",
    "line/config", 
    "mixins/common_mixins",
    "mixins/line_mixins",
  ], function(d3, utils, default_config, common_mixins, line_mixins) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config),
        w,
        h,
        xScale,
        yScale,
        xAxis,
        yAxis,
        line;

    function dataIdentifier (d) {
      return d[0];
    }

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection),
          data = self.normalizeData(selection.datum(), __),
          tooltip = __.tooltip,
          tip,
          svg,
          gEnter,
          g,
          lines,
          transition,
          params;

      function delay (d, i) { 
        return i / data[0].length * __.duration; 
      };

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };

      // Scales are functions that map from an input domain to an output range.
      xScale = self.setXScale('vertical', __.date)();
      yScale = self.setYScale('vertical')();
  
      // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes).
      xAxis = self.setXAxis(__.x_axis, xScale);
      yAxis = self.setYAxis(__.y_axis, yScale);

      params = {
        data: data,
        x_axis_data: data[0], // FIXME this hack!
        __: __,
        h: h,
        w: w,
        yScale: yScale,
        xScale: xScale,
        xAxis: xAxis,
        yAxis: yAxis,
        delay: delay,
      }

      self.applyXScale.call(xScale, 'vertical', params);
      self.applyYScale.call(yScale, 'vertical', params);
      
      // Select the svg element, if it exists.
      svg = selection.selectAll("svg").data([data]);
      // Otherwise, create the skeletal chart.
      gEnter = svg.enter().append("svg").append("g");
      // Initializing the tooltip.
      if (tooltip) {
        tip = utils.tip(tooltip);
        gEnter.call(tip);
      }

      gEnter.append("g").attr("class", "lines");
      gEnter.append("g").attr("class", "x axis");
      if (__.date) {
        gEnter.append("g").attr("class", "y axis")
         .attr("transform", "translate(-" + (__.date_adjust) + ",0)");
      } else {
        gEnter.append("g").attr("class", "y axis");
      }

      // Update the outer dimensions.
      svg.attr("width", __.width)
        .attr("height", __.height);

      // Update the inner dimensions.
      g = svg.select("g")
        .attr("transform", "translate(" + 
        __.margin.left + "," + __.margin.top + ")");

      // Transitions root.
      transition = g.transition().duration(__.duration);

      // Update the y axis.
      self.transitionYAxis.call(
        transition.selectAll('.y.axis'), 'vertical', params);

      // Update the x axis.
      self.transitionXAxis.call(
        transition.selectAll('.x.axis'), 'vertical', params);

      // Select the line elements, if they exists.
      lines = g.selectAll(".line")
        .data(data, dataIdentifier);

      // Exit phase (let us push out old lines before the new ones come in).
      lines.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      lines = self.createLines.call(lines.enter(), params)
        .on('click', __.handleClick);
      
      if (tooltip) {
        lines
         .on('mouseover', tip.show)
         .on('mouseout', tip.hide);
      }
//          
//        // TODO
//        //// And transition them.
//        //self.transitionLines
//        //  .call(transition.selectAll('.line'), 'vertical', params)
//        //  .call(utils.endall, data, __.handleTransitionEnd);
//
//        return selection;
//
//      });

      return selection;

    }

    utils.getset(Line, __);
    common_mixins.call(Line.prototype);
    line_mixins.call(Line.prototype);

    return Line;

  }

});


// **frame.states module**

// Used by the *frame.state_machine* module.
// Name-spaced, might add other states if needed.

define('frame/states',['require'],function(require) {

  var transition_states = [
    {
      'name': 'in_pause',
      'initial': true,
      'events': {
        'start': 'in_transition_start',
        'next': 'in_transition_next',
        'prev': 'in_transition_prev',
        'jump': 'in_transition_jump',
        'reset': 'in_transition_reset'
      }
    },
    {
      'name': 'in_transition_start',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_next',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_prev',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_jump',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_reset',
      'events': {
        'stop': 'in_pause'
      }
    }
  ];

  return { transition_states: transition_states};

});


// **frame.state_machine module**
// 
// From http://lamehacks.net/blog/implementing-a-state-machine-in-javascript/

define('frame/state_machine',['require'],function(require) {

  function StateMachine (states) {
    this.states = states;
    this.indexes = {};
    for( var i = 0; i < this.states.length; i++) {
      this.indexes[this.states[i].name] = i;
      if (this.states[i].initial){
        this.currentState = this.states[i];
      }
    }
  }

  StateMachine.prototype.consumeEvent = function (e) {
    if(this.currentState.events[e]){
      this.currentState = this.states[this.indexes[this.currentState.events[e]]];
    }
  }

  StateMachine.prototype.getStatus = function () {
    return this.currentState.name;
  }

  // getLastEvent();

  return StateMachine;

});


// **frame.frame module**

define('frame/frame',[
  'd3',
  'utils/utils',
  'frame/states',
  'frame/state_machine'
], function(d3, utils, states, StateMachine) {

  var Frame = function (conf) {
    var self = this;
    
    this.initial_frame = this.frame = conf.frame;
    this.old_frame =   void 0;
    this.current_timeout = void 0;
    this.drawChart = conf.drawChart;
    this.delta = conf.delta;
    this.step = conf.step;
    this.data = conf.data;

    this.state_machine = new StateMachine(states.transition_states);
    this.dispatch = d3.dispatch(
      'start', 
      'stop', 
      'next', 
      'prev', 
      'reset', 
      'end',
      'jump',
      'at_beginning_of_transition'
    );
    
    // Initial frame. The chart is rendered for the first time.
    this.drawChart(this.data[this.frame]);

    // Fired when all the chart related transitions within a frame are 
    // terminated.
    // It is the only dispatch event that does not have a state_machine 
    // equivalent event.
    // `frame` is an arbitrary namespace, in order to register multiple 
    // listeners for the same event type.
    //
    // https://github.com/mbostock/d3/wiki/Internals#events:
    // If an event listener was already registered for the same type, the 
    // existing listener is removed before the new listener is added. To 
    // register multiple listeners for the same event type, the type may be 
    // followed by an optional namespace, such as 'click.foo' and 'click.bar'.
    this.dispatch.on('end.frame', self.handleFrameEnd);

    this.dispatch.on('stop', self.handleStop);

    this.dispatch.on('start', self.handleStart);

    this.dispatch.on('next', self.handleNext);

    this.dispatch.on('prev', self.handlePrev);

    this.dispatch.on('reset', self.handleReset);

    this.dispatch.on('jump', self.handleJump);
  }


  Frame.prototype.startTransition = function () {
    var self = this;
    clearTimeout(this.current_timeout);
    if (this.data[this.frame]) {
      this.current_timeout = setTimeout( function () {
        // Re-render the chart
        self.drawChart(self.data[self.frame]);
      }, self.step);
    } else {
      // When no data is left to consume, let us stop the running frames!
      this.state_machine.consumeEvent('stop');
      this.frame = this.old_frame;
    }
    self.dispatch.at_beginning_of_transition.call(self);
  }

  Frame.prototype.handleFrameEnd = function () {
    this.handleTransition();
    return this;
  }

  Frame.prototype.handleStop = function () {
    this.state_machine.consumeEvent('stop');
    return this;
  }

  // TODO: there is a lot of repetition here!

  Frame.prototype.handleStart = function () {
    if (this.state_machine.getStatus() === 'in_pause') {
      this.state_machine.consumeEvent('start');
      this.handleTransition();
    } else {
      console.log('State already in in_transition_start.');
    }
    return this;
  }

  // TODO:
  // for next and prev we are allowing multiple prev-next events to be 
  // fired without waiting for the current frame to end. Change?

  Frame.prototype.handleNext = function () {
    this.state_machine.consumeEvent('next');
    if (this.state_machine.getStatus() === 'in_transition_next') {
      this.handleTransition();
    } else {
      console.log('State not in pause when next event was fired.');
    }
    return this;
  }

  Frame.prototype.handlePrev = function () {
    this.state_machine.consumeEvent('prev');
    if (this.state_machine.getStatus() === 'in_transition_prev') {
      this.handleTransition();
    } else {
      console.log('State not in pause when prev event was fired.');
    }
    return this;
  }

  Frame.prototype.handleReset = function () {
    this.state_machine.consumeEvent('reset');
    if (this.state_machine.getStatus() === 'in_transition_reset') {
      this.handleTransition();
    } else {
      console.log('State not in pause when reset event was fired.');
    }
    return this;
  }

  Frame.prototype.handleJump = function (value) {
    this.state_machine.consumeEvent('jump');
    if (this.state_machine.getStatus() === 'in_transition_jump') {
      this.handleTransition(value);
    } else {
      console.log('State not in pause when jump event was fired.');
    }
    return this;
  }

  
  Frame.prototype.handleTransition = function (value) {
    var self = this, status = this.state_machine.getStatus();
    if (status === 'in_transition_start') {
      this.old_frame = this.frame;
      this.frame += this.delta;
      this.startTransition();
    } else if (status === 'in_transition_prev') {
      this.old_frame = this.frame;
      this.frame -= this.delta;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_transition_next') {
      this.old_frame = this.frame;
      this.frame += this.delta;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_transition_jump') {
      if (!value) return new Error('need to pass a value to jump!');
      this.old_frame = this.frame;
      this.frame = value;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_transition_reset') {
      this.old_frame = this.frame;
      this.frame = this.initial_frame;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_pause') {
      return;
    } 
  }

  return Frame;
  
});


define('chart',[
  "draw",
  "base_config",
  "utils/utils",
  "mixins/common_mixins",
  "mixins/bar_mixins",
  "mixins/line_mixins",
  "bar/config", 
  "bar/bar",
  "line/config",
  "line/line",
  "frame/states",
  "frame/state_machine",
  "frame/frame"
], function(draw, base_config, utils, common_mixins, bar_mixins, line_mixins, bar_config, bar, line_config, line, states, StateMachine, Frame) {

  return {
    draw: draw,
    base_config: base_config,
    utils: utils,
    common_mixins: common_mixins,
    bar_mixins: bar_mixins,
    line_mixins: line_mixins,
    bar_config: bar_config,
    bar: bar,
    line_config: line_config,
    line: line,
    Frame: Frame,
    states: states, 
    StateMachine: StateMachine,
  };

});

