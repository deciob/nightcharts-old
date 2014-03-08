define([
  "draw",
  "base_config",
  "utils/utils",
  "mixins/data_methods",
  "mixins/layout_methods",
  "mixins/scale_methods",
  "mixins/axis_methods",
  "mixins/scaffolding",
  //"bar/config", 
  //"bar/bar",
  "line/config",
  "line/line",
  "circle/config",
  "circle/circle",
  //"frame/states",
  //"frame/state_machine",
  //"frame/frame"
], function(
  draw, 
  base_config, 
  utils, 
  data_methods, 
  layout_methods, 
  scale_methods,
  axis_methods,
  scaffolding,
  //bar_config, 
  //Bar, 
  line_config, 
  Line,
  circle_config,
  Circle
  //states, 
  //StateMachine, 
  //Frame
) {

  return {
    draw: draw,
    base_config: base_config,
    utils: utils,
    data_methods: data_methods,
    layout_methods: layout_methods,
    scale_methods: scale_methods,
    axis_methods: axis_methods,
    scaffolding: scaffolding,
    //bar_config: bar_config,
    //Bar: Bar,
    line_config: line_config,
    Line: Line,
    circle_config: circle_config,
    Circle: Circle,
    //Frame: Frame,
    //states: states, 
    //StateMachine: StateMachine,
  };

});

