define([
  'd3',
  'underscore',
  'chart'
], function(d3, _, chart) {
  'use strict';

  var LineFrameController = function (args) {

    var self = this,
        selection = d3.select(args.selector),
        data = args.data,
        normalized_data,
        grouped_data,
        grouped_data_obj,
        data_by_selected_town,
        linechart,
        selected_linechart,
        draw_dispatch,
        drawChart,
        frame_config, 
        frame, 
        year = 1950, 
        delta = 5, 
        draw;

    linechart = chart.composer()
      .margin({bottom: 35})
      .xValue(function(d) {return d.year})
      .yValue(function(d) {return d.population})
      .zValue(function(d) {return d.agglomeration})
      .duration(1000)
      .height(400)
      .date_format('%Y')
      .x_scale('time')
      .components(['x_axis', 'y_axis', 'lines'])
      .x_axis({tickFormat: d3.time.format("%Y")})
      .lines({class_name: 'linechart'});
    normalized_data = chart.utils.normalizeData(data, linechart.__);
    grouped_data = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, linechart.__, {grouper: 'array'});
    chart.draw(linechart, selection, grouped_data);
  
    self.grouped_data_obj = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, linechart.__, {grouper: 'object'});
    data_by_selected_town = [
      self.grouped_data_obj['São Paulo'], 
      self.grouped_data_obj['New York']
    ];
    selected_linechart = chart.composer(linechart.current_applied_configuration)
      .components(['lines'])
      .use_existing_chart(true)
      .duration(400)
      .drawDispatch(d3.dispatch('draw_line'))
      .lines({class_name: 'selected_linechart'});
    draw = chart.draw(selected_linechart, selection);

    drawChart = function (data, options) {
      draw(data, options);
    }

    draw_dispatch = selected_linechart.drawDispatch();
    draw_dispatch.on('draw_line', drawChart);
    this.transition = chart.Frame(linechart.__)
      .draw_dispatch(draw_dispatch)
      .data(data_by_selected_town)
      .initial_frame(year)
      .frame_identifier_index(0)
      .dispatch_identifier('_line')
      .frameIdentifierKeyFunction(function(d){
        return d[0].getFullYear();
      })
      .step(60)
      .frame_type('sequence')
      .delta(delta)();

    selected_linechart.handleTransitionEnd( function () {
      self.transition.dispatch.end_line.call(self.transition);
    });

    this.transition.dispatch.jump_line.call(self.transition, year);

  }






  LineFrameController.prototype.setFrames = function(args) {
    args.selections.forEach(function(selection) {
      console.log(selection);
    });
  }

  LineFrameController.prototype.setSelections = function(event) {
    console.log(event.target.__data__);
    var selection = event.target.__data__;

    //args.selections.forEach(function(selection) {
    //  console.log(selection);
    //});
  }






  LineFrameController.prototype.start = function() {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa');
    this.transition.dispatch.start_line.call(this.transition);
  }

  LineFrameController.prototype.stop = function() {
    this.transition.dispatch.stop_line.call(this.transition);
  }

  LineFrameController.prototype.reset = function() {
    this.transition.dispatch.reset_line.call(this.transition);
  }

  return LineFrameController;
  
});