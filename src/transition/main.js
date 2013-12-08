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
      data,
      bar,
      config;

    function handleTransitionEnd () {
      dispatch.end();
    } 

    transition_methods
      .startTransition = function () {
        var delay = bar.step();
        //if ( state_machine.getStatus() === 'in_pause' ) {
        //  return;
        //}
        clearTimeout(current_timeout);
        if (data[position]) {
          current_timeout = setTimeout(function(){
            selection.datum(data[position]).call(bar);
          }, delay);
        } else {
          state_machine.consumeEvent('in_pause');
        }

      }

    function setGlobals () {
      selection = arguments[0];
      data = arguments[1];
      bar = arguments[2];
      config = arguments[3];
    }
    
    function transition (selection, data, bar, config) {
      var status = state_machine.getStatus();
      if (arguments.length === 4) {
        bar.handleTransitionEnd(handleTransitionEnd);
        setGlobals(selection, data, bar, config);
      }
      
      if (status === 'in_transition') {
        position += config.step;
      } else if (status === 'in_transition_reverse') {
        position -= config.step;
      }

      transition_methods.startTransition.apply(this);
    }

    dispatch.on('end', function () {
      transition();
    });

    dispatch.on('stop', function () {
      state_machine.consumeEvent('in_pause');
      transition();
    });

    dispatch.on('start', function () {
      state_machine.consumeEvent('in_transition');
      transition();
    });



    meld.before(transition_methods, 'startTransition', 
      function(selection, data, bar, config) {

      });

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