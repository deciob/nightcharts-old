
define('draw',['require'],function(require) {
  

  return function (chart, selection, data) {
    if (data) {
      return selection.datum(data).call(chart);
    }
    return function (data) {
      selection.datum(data).call(chart);
    }
  }

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

  // For each nested attributes in `state` it sets a getter-setter function 
  // on `obj`.
  //
  // obj - object or function
  // state - object
  function getset (obj, state) {
    d3.keys(state).forEach( function(key) {
      obj[key] = function (x) {
        if (!arguments.length) return state[key];
        var old = state[key];
        state[key] = x;
        return obj;
      }
      if ( isObject(state[key]) ) {
        getset(obj[key], state[key]);
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
    endall: endall,
    tip: tip
  };

});


// **The default configuration module for the bar.bar module**

define('bar/config',['require'],function(require) {
    
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
      axes: {
        x: {
          outerTickSize: 0,
          orient: 'bottom',
          tickValues: void 0,
        },
        y: {
          outerTickSize: 0,
          orient: 'left',
          tickValues: void 0,
        }
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


// **The bar.orientation module**

// It handles the barchart orientation: vertical or horizontal.
// An horizontal barchart has an ordinal scale on the y axis.
// A vertical barchart has a linear scale on the y axis.
// TODO: add time axis option.

define('bar/orientation',["d3"], function(d3) {

  // Sets the range and domain for the linear scale.
  function inflateLinearScale (params, range) {
    var max;
    if (params.__.max) {
      max = params.__.max;
    } else {
      max = d3.max( params.data, function(d) {return parseFloat(d[1]); } );
    }
    return this.range(range).domain([0, max]);
  }

  // Sets the range and domain for the ordinal scale.
  function inflateOrdinalScale (params, range) {
    return this
      .rangeRoundBands(range, params.__.padding)
      .domain(params.data.map(function(d) { return d[0]; }));
  }

  var vertical = {
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear,
    inflateXScale: function (params) {
      var range = [0, params.w()];
      return inflateOrdinalScale.call(this, params, range);
    },
    inflateYScale: function (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return inflateLinearScale.call(this, params, range);
    },
    createBars: function (params) {
      return this
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return params.xScale(d[1]); })
        .attr("width", params.xScale.rangeBand())
        .attr("y", params.h() + params.__.barOffSet)
        .attr("height", 0);
    },
    transitionXAxis: function (params) {
      return this
        .attr("transform", "translate(0," + params.yScale.range()[0] + ")")
        .call(params.xAxis);
    },
    transitionYAxis: function (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    },
    transitionBars: function (params) {
      return this.delay(params.delay)
        .attr("x", function(d) { return params.xScale(d[0]); })
        .attr("y", function(d) { return params.yScale(d[1]); })
        .attr("height", function(d) { return params.h() - params.yScale(d[1]); });
    }
  }

  var horizontal = {
    xScale: d3.scale.linear,
    yScale: d3.scale.ordinal,
    inflateXScale: function (params) {
      var range = [0, params.w()];
      return inflateLinearScale.call(this, params, range);
    },
    inflateYScale: function (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return inflateOrdinalScale.call(this, params, range);
    },
    createBars: function (params) {
      return this
        .append("rect")
        .attr("class", "bar")
        .attr("x", params.__.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("height", params.yScale.rangeBand());
    },
    transitionXAxis: function (params) {
      return this.attr("transform", "translate(" + params.__.barOffSet
        + "," + params.h() + ")").call(params.xAxis);
    },
    transitionYAxis: function (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    },
    transitionBars: function (params) {
      return this.delay(params.delay)
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("x", params.__.barOffSet)
        .attr("width", function(d) { 
          return params.xScale(d[1]) + params.__.barOffSet; 
        });
    }
  }

  return {
    vertical: vertical,
    horizontal: horizontal
  };

});


// **The bar.bar module**

define('bar/bar',[
    "d3", 
    "utils/utils",
    "bar/config", 
    "bar/orientation",
  ], function(d3, utils, default_config, orientation) {
  
  return function (user_config) {

    var config = user_config || {},
       __, w, h, xScale, yScale, xAxis, yAxis;

    __ = utils.extend(default_config, config);

    function dataIdentifier (d) {
      return d[0];
    }

    function bar (selection) { 

      w = function () { return __.width - __.margin.right - __.margin.left; };
      h = function () { return __.height - __.margin.top - __.margin.bottom; };
  
      // Scales are functions that map from an input domain to an output range.
      // Presently no assumption is made about the chart orientation.
      xScale = orientation[__.orientation].xScale();
      yScale = orientation[__.orientation].yScale();
  
      // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes)
      // Presently no assumption is made about the chart orientation.
      xAxis = d3.svg.axis().scale(xScale);
      d3.entries(__.axes.x).forEach(function(o) {
        if (o.value !== undefined) {
          xAxis[o.key](o.value);
        }
      });
      yAxis = d3.svg.axis().scale(yScale);
      d3.entries(__.axes.y).forEach(function(o) {
        if (o.value !== undefined) {
          yAxis[o.key](o.value);
        }
      });

      selection.each(function(dat) {

        var data, 
          tooltip = __.tooltip, 
          tip, svg, gEnter, g, bars, transition, bars_t, bars_ex, params;

        // data structure:
        // 0: name
        // 1: value
        data = dat.map(function(d, i) {
          return [
            __.categoricalValue.call(dat, d), 
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
        }

        orientation[__.orientation].inflateYScale.call(yScale, params);
        orientation[__.orientation].inflateXScale.call(xScale, params);

        // Select the svg element, if it exists.
        svg = d3.select(this).selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
        gEnter = svg.enter().append("svg").append("g");
        // Initializing the tooltip.
        if (tooltip) {
          tip = utils.tip(tooltip);
          gEnter.call(tip);
        }
        gEnter.append("g").attr("class", "bars");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");

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
        orientation[__.orientation]
          .transitionYAxis
          .call(transition.selectAll('.y.axis'), params);

        // Update the x axis.
        orientation[__.orientation]
          .transitionXAxis
          .call(transition.select(".x.axis"), params);

        // Select the bar elements, if they exists.
        bars = g.select(".bars").selectAll(".bar")
          .data(data, dataIdentifier);

        // Exit phase (let us push out old bars before the new ones come in).
        bars.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();

        // Otherwise, create them.
        bars = orientation[__.orientation].createBars.call(bars.enter(), params)
          .on('click', __.handleClick);

        if (tooltip) {
          bars
           .on('mouseover', tip.show)
           .on('mouseout', tip.hide);
        }
          
        // And transition them.
        orientation[__.orientation].transitionBars
          .call(transition.selectAll('.bar'), params)
          .call(utils.endall, data, __.handleTransitionEnd);

      });

    }

    utils.getset(bar, __);

    return bar;

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
  "utils/utils",
  "bar/config", 
  "bar/bar",
  "bar/orientation",
  "frame/states",
  "frame/state_machine",
  "frame/frame"
], function(draw, utils, __, bar, orientation, states, StateMachine, Frame) {

  return {
    utils: utils, 
    bar:bar,
    __: __, 
    orientation: orientation,
    Frame: Frame,
    states: states, 
    StateMachine: StateMachine,
    draw: draw,
  };

});

