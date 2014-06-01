// **frame.frame module**

define([
  'd3',
  'utils',
  'data',
  'frame/defaults',
  'frame/states',
  'frame/state_machine'
], function(d3, utils, data_module, default_config, states, StateMachine) {

  //FIXME: if sequence starts with no data... doesn't go anywhere! (even
  //  if the data arrives in later sequences) --> data module?

  return function (user_config) {

    var config = user_config || {},
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config, {not_override: false});

    function Frame () {
  
      var self = this instanceof Frame
                 ? this
                 : new Frame();
      
      self.__ = __;
      getset(self, __);
      self.frame = __.initial_frame;
      //self.handleFrameEndCalledTwice = false;

      self.normalized_data = __.normalize_data ? data_module.normalizeData(__.data, __) : __.data;
      //self.parsed_data = data_module.groupNormalizedDataByIndex(
      //  __.frame_identifier_index, self.normalized_data, __, 
      //  {grouper: 'object', keyFunction: __.frameIdentifierKeyFunction});
  
      self.state_machine = new StateMachine(states.transition_states);
      self.dispatch = d3.dispatch(
        'start' + __.dispatch_identifier, 
        'stop' + __.dispatch_identifier, 
        'next' + __.dispatch_identifier, 
        'prev' + __.dispatch_identifier, 
        'reset' + __.dispatch_identifier, 
        'end' + __.dispatch_identifier, 
        'jump' + __.dispatch_identifier, 
        'at_beginning_of_transition' + __.dispatch_identifier
      );
      
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
      self.dispatch.on('end' + __.dispatch_identifier + '.frame', self.handleFrameEnd);
  
      self.dispatch.on('stop' + __.dispatch_identifier, self.handleStop);
  
      self.dispatch.on('start' + __.dispatch_identifier, self.handleStart);
  
      self.dispatch.on('next' + __.dispatch_identifier, self.handleNext);
  
      self.dispatch.on('prev' + __.dispatch_identifier, self.handlePrev);
  
      self.dispatch.on('reset' + __.dispatch_identifier, self.handleReset);
  
      self.dispatch.on('jump' + __.dispatch_identifier, self.handleJump);
  
      return self;
    }
  
    //getset(Frame.prototype, __);
    getset(Frame, __);
  
    Frame.prototype.startTransition = function () {
      var self = this;
      clearTimeout(__.current_timeout);
      var data = self.getDataForFrame(self.normalized_data, __);
      if (data[0] && data[0].length > 0) { //data[0] FIXME???
      __.current_timeout = setTimeout( function () {
        // Fire the draw event
        __.draw_dispatch.draw.call(self, data, {
          old_frame_identifier: __.old_frame,
          frameIdentifierKeyFunction: __.frameIdentifierKeyFunction
        });
      }, __.step);
      } else {
        // When no data is left to consume, let us stop the running frames!
        this.state_machine.consumeEvent('stop');
        this.frame = __.old_frame;
      }
      self.dispatch['at_beginning_of_transition' + __.dispatch_identifier].call(self);
    }

    Frame.prototype.getDataForFrame = function (data, __) {
      var self = this;
      if (__.frame_type == 'block') {
        return [data[this.frame]]; //FIXME!!!!
      } else {
        return data.map(function(d) { 
          return data_module.sliceGroupedNormalizedDataAtIdentifier(
            self.frame, d, __);
        });
      }
    }
  
    Frame.prototype.handleFrameEnd = function () {
      //if (__.old_frame !== this.frame) {
        this.frame_after_end_event = this.frame;
        this.handleTransition();
        return this;
      //}
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
        __.old_frame = this.frame;
        this.frame += __.delta;
        this.startTransition();
      } else if (status === 'in_transition_prev') {
        __.old_frame = this.frame;
        this.frame -= __.delta;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_next') {
        __.old_frame = this.frame;
        this.frame += __.delta;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_jump') {
        if (!value) return new Error('need to pass a value to jump!');
        __.old_frame = this.frame;
        this.frame = value;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_reset') {
        __.old_frame = this.frame;
        this.frame = __.initial_frame;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_pause') {
        return;
      } 
    }
  
    return Frame;

  };
  
});

