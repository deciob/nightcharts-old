(function(define) {
  return define([
    "d3",
    "utils/utils",
    "transition_train/states",
    "transition_train/state_machine"
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
      this.dispatch = d3.dispatch("start", "stop", "next", "prev", "reset", "end");
      
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
      // be followed by an optional namespace, such as "click.foo" and "click.bar".
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
      }
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

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});