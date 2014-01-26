define([
  "draw",
  "utils/utils",
  "bar/config", 
  "bar/bar",
  "bar/orientation",
  "frame/states",
  "frame/state_machine",
  "frame/frame"
], function(draw, utils, __, bar, orientation, states, StateMachine, Frame) {

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

