(function(define) {
  return define([
    "utils/utils",
    "bar/bar",
    "bar/config", 
    "bar/orientation",
    "frame/frame",
    "frame/states",
    "frame/state_machine",
    "draw"
  ], function(utils, bar, __, orientation, Frame, states, StateMachine, draw) {
    return {
      utils: utils, 
      bar:bar,
      __: __, 
      orientation: orientation,
      Frame: Frame,
      states: states, 
      StateMachine: StateMachine,
      draw: draw,
    };
  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});