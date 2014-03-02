define([
  "draw",
  "base_config",
  "utils/utils",
  "mixins/common_mixins",
  "mixins/bar_mixins",
  "mixins/line_mixins",
  "bar/config", 
  "bar/bar",
  "line/config",
  "line/line",
  "frame/states",
  "frame/state_machine",
  "frame/frame"
], function(draw, base_config, utils, common_mixins, bar_mixins, line_mixins, bar_config, bar, line_config, line, states, StateMachine, Frame) {

  return {
    draw: draw,
    base_config: base_config,
    utils: utils,
    common_mixins: common_mixins,
    bar_mixins: bar_mixins,
    line_mixins: line_mixins,
    bar_config: bar_config,
    bar: bar,
    line_config: line_config,
    line: line,
    Frame: Frame,
    states: states, 
    StateMachine: StateMachine,
  };

});

