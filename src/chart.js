define([
  "draw",
  "utils/utils",
  "mixins/common_mixins",
  "mixins/bar_mixins",
  "bar/config", 
  "bar/bar",
  //"bar/orientation",
  "frame/states",
  "frame/state_machine",
  "frame/frame"
], function(draw, utils, common_mixins, bar_mixins, __, bar, states, StateMachine, Frame) {

  return {
    utils: utils,
    common_mixins: common_mixins,
    bar_mixins: bar_mixins,
    bar:bar,
    __: __, 
    Frame: Frame,
    states: states, 
    StateMachine: StateMachine,
    draw: draw,
  };

});

