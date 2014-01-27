define([
  'd3',
  'utils/utils',
  'frame/states',
  'frame/state_machine'
], function(d3, utils, states, StateMachine) {

  // **frame.frame module**

  var Frame = function (conf) {
    var self = this;
    
    this.initial_frame = this.frame = conf.frame;
    this.old_frame = void 0;
    this.current_timeout = void 0;
    this.chart = conf.chart;
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
    
    this.chart.handleTransitionEnd( function () {
      self.dispatch.end.call(self);
      return self;
    });
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

