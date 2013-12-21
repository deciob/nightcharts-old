(function(define) {
  return define([
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