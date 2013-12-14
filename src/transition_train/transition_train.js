(function(define) {
  return define([
    "d3",
    "meld",
    "utils",
    "transition/states",
    "transition/state_machine"
  ], function(d3, meld, utils, states, StateMachine) {

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
        self.dispatch.end();
      });
      this.selection.datum(this.data[this.position]).call(this.chart);

      // This event is dependent on the chart.handleTransitionEnd method and
      // fires on the end of every chart single transition block.
      // It is the only dispatch event that does not have a state_machine 
      // equivalent event.
      this.dispatch.on('end', function () {
        self.handleTransition();
      });

      this.dispatch.on('stop', function () {
        self.state_machine.consumeEvent('stop');
      });

      this.dispatch.on('start', function () {
        self.state_machine.consumeEvent('start');
        self.handleTransition();
      });

      this.dispatch.on('next', function () {
        self.state_machine.consumeEvent('next');
        self.handleTransition();
      });

      this.dispatch.on('prev', function () {
        self.state_machine.consumeEvent('prev');
        self.handleTransition();
      });

      this.dispatch.on('reset', function () {
        self.state_machine.consumeEvent('reset');
        if (self.state_machine.getStatus() === 'in_transition_reset') {
          self.handleTransition();
        } else {
          console.log('State not in pause when reset event was fired.');
        }
      });

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