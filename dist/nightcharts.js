
(function(define) {
  return define('utils/utils',["d3"], function(d3) {

    // Useful functions that can be shared across modules.
    
    function extend (target, source) {
      for(prop in source) {
        target[prop] = source[prop];
      }
      return target;
    }
  
    function getset (obj, state) {
      d3.keys(state).forEach( function(key) {
        obj[key] = function (x) {
          if (!arguments.length) return state[key];
          var old = state[key];
          state[key] = x;
          return obj;
        }
      });
    }
  
    // https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
    function endall (elements_in_transition, data, callback) {
      // Assumes the data length never changes.
      // Incrementing n (++n) for each transition element does not work if we
      // have exits in the transition, because of a length mismatch between now
      // and the end of the transitions.
      var n = data.length;
      elements_in_transition 
        //.each(function() { ++n; }) 
        .each("end", function() { 
          if (!--n) {
            callback.apply(this, arguments);
          }
        });
    }
  
    return {
      extend: extend,
      getset: getset,
      endall: endall
    };
  
  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});
(function(define) {
  return define('bar/config',['require'],function(require) {

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
      invert_data: false,
      handleClick: function (d, i) { return void 0; },
      handleTransitionEnd: function(d) { return void 0; },
      xValue: function (d) { return d[0]; },
      yValue: function (d) { return d[1]; }
    };

  });
})(typeof define === "function" && define.amd ? define : function(factory) {
  return module.exports = factory(require);
});
(function(define) {
  return define('bar/orientation',["d3"], function(d3) {

  // Handling the barchart orientation.

    function inflateLinearScale (params, range) {
      var max;
      if (params.__.max) {
        max = params.__.max;
      } else {
        max = d3.max( params.data, function(d) {return parseFloat(d[1]); } );
      }
      return this.range(range).domain([0, max]);
    }
  
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

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});
(function(define) {
  return define('bar/bar',[
    "d3", 
    "utils/utils",
    "bar/config", 
    "bar/orientation",
  ], function(d3, utils, __, orientation) {

    return function (user_config) {

      var config = user_config || {},
        w, h, xScale, yScale, xAxis, yAxis;
  
      utils.extend(__, config);
  
      function dataIdentifier (d) {
        return d[0];
      }
  
      function bar (selection) { 
  
        w = function () { return __.width - __.margin.right - __.margin.left; };
        h = function () { return __.height - __.margin.top - __.margin.bottom; };
    
        // Scales are functions that map from an input domain to an output range.
        xScale = orientation[__.orient].xScale();
        yScale = orientation[__.orient].yScale();
    
        // Axes, see: https://github.com/mbostock/d3/wiki/SVG-Axes
        xAxis = d3.svg.axis()
          .outerTickSize(__.outerTickSize).scale(xScale).orient(__.x_orient);
        yAxis = d3.svg.axis()
          .outerTickSize(__.outerTickSize).scale(yScale).orient(__.y_orient);
  
        selection.each(function(dat) {
  
          var data, svg, gEnter, g, bars, transition, bars_t, bars_ex, params;
  
          // data structure:
          // 0: name
          // 1: value
          data = dat.map(function(d, i) {
            return [__.xValue.call(dat, d), __.yValue.call(dat, d)];
          });
          if (__.invert_data) {
            data = data.reverse();
          }
  
          function delay (d, i) {
            // Attention, delay can not be longer of transition time! Test!
            //return i / data.length * __.duration;
            return i * (data.length/2);
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
  
          orientation[__.orient].inflateYScale.call(yScale, params);
          orientation[__.orient].inflateXScale.call(xScale, params);
  
          // Select the svg element, if it exists.
          svg = d3.select(this).selectAll("svg").data([data]);
  
          // Otherwise, create the skeletal chart.
          gEnter = svg.enter().append("svg").append("g");
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
          orientation[__.orient]
            .transitionYAxis
            .call(transition.selectAll('.y.axis'), params);
  
          // Update the x axis.
          orientation[__.orient]
            .transitionXAxis
            .call(transition.select(".x.axis"), params);
  
          // Select the bar elements, if they exists.
          bars = g.select(".bars").selectAll(".bar")
            .data(data, dataIdentifier);
  
          // Exit phase (let us push out old bars before the new ones come in).
          bars.exit()
            .transition().duration(__.duration).style('opacity', 0).remove();
  
          // Otherwise, create them.
          orientation[__.orient].createBars.call(bars.enter(), params)
            .on('click', __.handleClick);
          // And transition them.
          orientation[__.orient].transitionBars
            .call(transition.selectAll('.bar'), params)
            .call(utils.endall, data, __.handleTransitionEnd);
  
        });
  
      }
  
      utils.getset(bar, __);
  
      return bar;

    }

  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});
(function(define) {
  return define('transition_train/states',['require'],function(require) {

    var transition_states = [
      {
        'name': 'in_pause',
        'initial': true,
        'events': {
          'start': 'in_transition_start',
          'next': 'in_transition_next',
          'prev': 'in_transition_prev',
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
        'name': 'in_transition_reset',
        'events': {
          'stop': 'in_pause'
        }
      }
    ];

    return { transition_states: transition_states};

  });

})(typeof define === "function" && define.amd ? define : function(factory) {
  return module.exports = factory(require);
});














// From http://lamehacks.net/blog/implementing-a-state-machine-in-javascript/

(function(define) {
  return define('transition_train/state_machine',['require'],function(require) {

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

})(typeof define === "function" && define.amd ? define : function(factory) {
  return module.exports = factory(require);
});

(function(define) {
  return define('transition_train/transition_train',[
    'd3',
    'utils/utils',
    'transition_train/states',
    'transition_train/state_machine'
  ], function(d3, utils, states, StateMachine) {

    var TransitionTrain = function (conf) {
      var self = this;
      
      this.initial_position = conf.position;
      this.position = conf.position;
      this.selection = conf.selection;
      this.chart = conf.chart;
      this.step = conf.step;
      this.data = conf.data;

      this.state_machine = new StateMachine(states.transition_states);
      this.old_position = void 0;
      this.current_timeout = void 0;
      this.dispatch = d3.dispatch('start', 'stop', 'next', 'prev', 'reset', 'end', 'at_beginning_of_transition');
      
      this.chart.handleTransitionEnd( function () {
        self.dispatch.end.call(self);
      });
      this.selection.datum(this.data[this.position]).call(this.chart);

      // This event is dependent on the chart.handleTransitionEnd method and
      // fires on the end of every chart single transition block.
      // It is the only dispatch event that does not have a state_machine 
      // equivalent event.
      //
      // The `.transition_train` is an arbitrary namespace, as explained in the 
      // d3 docs, https://github.com/mbostock/d3/wiki/Internals#events
      //
      // If an event listener was already registered for the same type, 
      // the existing listener is removed before the new listener is added. 
      // To register multiple listeners for the same event type, the type may
      // be followed by an optional namespace, such as 'click.foo' and 'click.bar'.
      this.dispatch.on('end.transition_train', self.handleWagonEnd);

      this.dispatch.on('stop', self.handleStop);

      this.dispatch.on('start', self.handleStart);

      this.dispatch.on('next', self.handleNext);

      this.dispatch.on('prev', self.handlePrev);

      this.dispatch.on('reset', self.handleReset);

      // TODO
      //this.dispatch.on('jump_to', self.handleJumpTo);
    }


    TransitionTrain.prototype.startTransition = function () {
      var delay = this.chart.step(),
        self = this;
      clearTimeout(this.current_timeout);
      if (this.data[this.position]) {
        this.current_timeout = setTimeout(function(){
          self.selection.datum(self.data[self.position]).call(self.chart);
        }, self.delay);
      } else {
        // When no data is left to consume, let us stop the train!
        this.state_machine.consumeEvent('stop');
        // and reset the position.
        this.position = this.old_position;
      }
      self.dispatch.at_beginning_of_transition.call(self);
    }

    TransitionTrain.prototype.handleWagonEnd = function () {
      this.handleTransition();
      return this;
    }

    TransitionTrain.prototype.handleStop = function () {
      this.state_machine.consumeEvent('stop');
      return this;
    }

    // TODO: there is a lot of repetition here!

    TransitionTrain.prototype.handleStart = function () {
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
    // fired without waiting the ongoing transition block to finish. Change?

    TransitionTrain.prototype.handleNext = function () {
      this.state_machine.consumeEvent('next');
      if (this.state_machine.getStatus() === 'in_transition_next') {
        this.handleTransition();
      } else {
        console.log('State not in pause when next event was fired.');
      }
      return this;
    }

    TransitionTrain.prototype.handlePrev = function () {
      this.state_machine.consumeEvent('prev');
      if (this.state_machine.getStatus() === 'in_transition_prev') {
        this.handleTransition();
      } else {
        console.log('State not in pause when prev event was fired.');
      }
      return this;
    }

    TransitionTrain.prototype.handleReset = function () {
      this.state_machine.consumeEvent('reset');
      if (this.state_machine.getStatus() === 'in_transition_reset') {
        this.handleTransition();
      } else {
        console.log('State not in pause when reset event was fired.');
      }
      return this;
    }

    
    TransitionTrain.prototype.handleTransition = function () {
      var self = this, status = this.state_machine.getStatus();
      if (status === 'in_transition_start') {
        this.old_position = this.position;
        this.position += this.step;
        this.startTransition();
      } else if (status === 'in_transition_prev') {
        this.old_position = this.position;
        this.position -= this.step;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_next') {
        this.old_position = this.position;
        this.position += this.step;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_reset') {
        this.old_position = this.position;
        this.position = this.initial_position;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_pause') {
        return;
      } 
    }

    return TransitionTrain;

  });

})(typeof define === 'function' && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});
(function(define) {
  return define('chart',[
    "utils/utils", 
    "bar/bar",
    "bar/config", 
    "bar/orientation",
    "transition_train/transition_train",
    "transition_train/states",
    "transition_train/state_machine"
  ], function(utils, bar, __, orientation, TransitionTrain, states, StateMachine) {
    return {
      utils: utils, 
      bar:bar,
      __: __, 
      orientation: orientation,
      TransitionTrain: TransitionTrain,
      states: states, 
      StateMachine: StateMachine
    };
  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});