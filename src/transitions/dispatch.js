(function(define) {
  return define([
    "meld",
    "d3", 
    "utils"
  ], function(meld, d3, utils) {



    var current_key, prev_key,
      dispatch = d3.dispatch("start", "stop", "next", "prev", "reset", "end"),
      current_timeout,
      //stateMachine = new StateMachine(states.transition_states),
      start;

    function startTransition (selection) {
      var transition_conf = this.transition_conf();
      stateMachine.consumeEvent('in_transition');
      if (!current_key) {
        current_key = transition_conf.start;
      }
      clearTimeout(current_timeout);
      current_timeout = setTimeout( function() {
        if (stateMachine.getStatus() === 'in_pause') { 
          clearTimeout(current_timeout);
          return; 
        }
        selection.datum(data[current_key]).call(bar);
        prev_key = current_key;
        current_key = prev_key + transition_conf.step;
      }, 400);
    }
    //function startTransition (selection) {
    //  nextTransition.call(this, selection);
    //}

    //function aroundFunction (methodCall) {
    //  var result = methodCall.proceed();
    //  debugger;
    //  return result;
    //}

    //start = meld.around(startTransition, dispatch_aspects.start);

    dispatch.on('start.bar', startTransition);

    //});

    return dispatch;

  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});