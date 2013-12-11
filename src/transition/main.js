(function(define) {
  return define([
    "d3",
    "meld",
    "utils",
    "transition/states",
    "transition/state_machine",
    "transition/dispatch"
  ], function(d3, meld, utils, states, StateMachine, dispatch) {

    var TransitionTrain = function (conf) {
      var self = this;
      
      this.position = conf.position;
      this.selection = conf.selection;
      this.chart = conf.chart;
      this.step = conf.step;
      this.data = conf.data;

      this.state_machine = new StateMachine(states.transition_states);
      this.old_position = void 0;
      this.current_timeout = void 0;
      this.dispatch = d3.dispatch("start", "stop", "next", "prev", "reset", "end");
      
      this.chart.handleTransitionEnd(function () {self.dispatch.end();});
      this.selection.datum(this.data[this.position]).call(this.chart);

      this.dispatch.on('reset', function () {
        self.state_machine.consumeEvent('reset');
        self.transition();
        self.state_machine.consumeEvent('stop');
      });

      this.dispatch.on('end', function () {
        self.transition();
      });

      this.dispatch.on('stop', function () {
        self.state_machine.consumeEvent('stop');
      });

      this.dispatch.on('start', function () {
        self.state_machine.consumeEvent('forward');
        self.transition();
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
        this.state_machine.consumeEvent('stop');
      }
    }
    
    TransitionTrain.prototype.transition = function () {
      var status = this.state_machine.getStatus();
      if (status === 'in_transition') {
        this.old_position = this.position;
        this.position += this.step;
      } else if (status === 'in_transition_reverse') {
        this.old_position = this.position;
        this.position -= this.step;
      }
      this.startTransition();
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