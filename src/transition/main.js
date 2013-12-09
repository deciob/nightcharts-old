(function(define) {
  return define([
    "d3",
    "meld",
    "utils",
    "transition/states",
    "transition/state_machine",
    "transition/dispatch"
  ], function(d3, meld, utils, states, StateMachine, dispatch) {
  
    var state_machine = new StateMachine(states.transition_states),
      position, 
      old_position,
      current_timeout,
      dispatch = d3.dispatch("start", "stop", "next", "prev", "reset", "end"),
      transition_methods = {},
      selection, 
      chart,
      step,
      methods = {};

    function handleTransitionEnd () {
      dispatch.end();
    } 

    function startTransition () {
      var delay = chart.step();
      clearTimeout(current_timeout);
      if (data[position]) {
        current_timeout = setTimeout(function(){
          selection.datum(data[position]).call(chart);
        }, delay);
      } else {
        state_machine.consumeEvent('in_pause');
      }

    }
    
    function transition (c) {
      var status = state_machine.getStatus();
      // if no position, we start the dance!
      if (!position) {
        position = c.position;
        selection = c.selection;
        chart = c.chart;
        step = c.step;
        data = c.data;
        chart.handleTransitionEnd(handleTransitionEnd);
        c.selection.datum(c.data[position]).call(c.chart);
        return;
      }
      
      if (status === 'in_transition') {
        old_position = position;
        position += step;
      } else if (status === 'in_transition_reverse') {
        old_position = position;
        position -= step;
      }
      startTransition.apply(this);
    }

    dispatch.on('end', function () {
      transition();
    });

    dispatch.on('stop', function () {
      state_machine.consumeEvent('stop');
      transition();
    });

    dispatch.on('start', function () {
      state_machine.consumeEvent('forward');
      transition();
    });

    //methods.transition = transition;
    //meld.around(methods, 'transition', function(methodCall) {
    //  console.log('@@@@@@@@', this, methodCall)
    //});

    transition.dispatch = dispatch;
    return transition;

  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});