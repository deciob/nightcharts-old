define([
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
