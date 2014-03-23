define([
  "d3", 
  "d3_tip",
  "draw",
  "base_config",
  "utils/mixins",
  ////"utils/mixins",
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
  "bar/config",
  //"bar/bar_helpers", 
  //"bar/scaffolding",
  "bar/bar"
  //"line/config",
  //"line/scaffolding",
  //"line/line",
  //"circle/config",
  //"circle/scaffolding",
  //"circle/circle",
  //"frame/states",
  //"frame/state_machine",
  //"frame/frame"
], function(
  d3, 
  d3_tip,
  draw, 
  base_config, 
  utils_mixins,
  ////utils_mixins, 
  data_mixins, 
  layout_mixins, 
  scale_mixins,
  axis_mixins,
  chart_mixins,
  bar_config,
  //bar_helpers,
  //bar_scaffolding,
  Bar
  //line_config,
  //line_scaffolding,
  //Line,
  //circle_config,
  //circle_scaffolding,
  //Circle
  //states, 
  //StateMachine, 
  //Frame
) {

  d3.d3_tip = d3_tip;

  return {
    d3: d3,
    draw: draw,
    base_config: base_config,
    utils_mixins: utils_mixins,
    ////utils_mixins: utils_mixins,
    data_mixins: data_mixins,
    layout_mixins: layout_mixins,
    scale_mixins: scale_mixins,
    axis_mixins: axis_mixins,
    chart_mixins: chart_mixins,
    bar_config: bar_config,
    //bar_helpers: bar_helpers,
    //bar_scaffolding: bar_scaffolding,
    Bar: Bar
    //line_config: line_config,
    //line_scaffolding: line_scaffolding,
    //Line: Line,
    //circle_config: circle_config,
    //circle_scaffolding: circle_scaffolding,
    //Circle: Circle,
    //Frame: Frame,
    //states: states, 
    //StateMachine: StateMachine,
  };

});

