(function(define) {
  return define([
    "meld",
    "d3", 
    "utils",
    "utils/states", 
    "utils/state_machine",
  ], function(meld, d3, utils, states, StateMachine) {

      var current_key, prev_key;
  
      function startBarsTransition (methodCall) {
        debugger;
        if (current_key) {
          prev_key = current_key;
          current_key = 5
        }
      }
  
      return {
        start: startBarsTransition
      };
      
    });

  })(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});