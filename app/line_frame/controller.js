define([
  'd3',
  'underscore',
  'chart'
], function(d3, _, chart) {
  'use strict';

  var LineFrameController = function (args) {

    var self = this,
        selection = d3.select(args.selector),
        config = args.config,
        data = args.data,
        normalized_data,
        grouped_data,
        grouped_data_obj,
        linechart;

    this.selection = selection;
    this.config = config;

    this.linechart = chart.composer()
      .margin({bottom: 35})
      .xValue(function(d) {return d.year})
      .yValue(function(d) {return d.population})
      .zValue(function(d) {return d.agglomeration})
      .duration(config.single_frame_duration)
      .height(400)
      .date_format('%Y')
      .x_scale('time')
      .components(['x_axis', 'y_axis', 'lines'])
      .x_axis({tickFormat: d3.time.format("%Y")})
      .lines({class_name: 'linechart'});
    normalized_data = chart.utils.normalizeData(data, this.linechart.__);
    grouped_data = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, this.linechart.__, {grouper: 'array'});
    chart.draw(this.linechart, selection, grouped_data);
  
    self.grouped_data_obj = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, this.linechart.__, {grouper: 'object'});

  }


  LineFrameController.prototype.setFrames = function(text_selections) {

    var self = this,
        data_by_selected_town = [],
        selected_linechart,
        draw_dispatch,
        drawChart,
        frame_config, 
        frame, 
        year = this.config.start_year, 
        delta = this.config.delta, 
        draw;

    this.towns = [];

    text_selections.each(function(d) {
      self.towns.push(d);
      data_by_selected_town.push(self.grouped_data_obj[d]);
    });
    selected_linechart = chart.composer(this.linechart.current_applied_configuration)
      .components(['lines'])
      .use_existing_chart(true)
      .duration(this.config.single_frame_duration)
      .drawDispatch(d3.dispatch('draw_line'))
      .lines({class_name: 'selected_linechart', reset: true});
    draw = chart.draw(selected_linechart, this.selection);

    drawChart = function (data, options) {
      draw(data, options);
    }

    draw_dispatch = selected_linechart.drawDispatch();
    draw_dispatch.on('draw_line', drawChart);
    this.frame = chart.Frame(this.linechart.__)
      .draw_dispatch(draw_dispatch)
      .data(data_by_selected_town)
      .initial_frame(year)
      .frame_identifier_index(0)
      .dispatch_identifier('_line')
      .fill_empty_data_sequence(true)
      .frameIdentifierKeyFunction(function(d){
        return d[0].getFullYear();
      })
      .step(this.config.step)
      .frame_type('sequence')
      .delta(delta)();

    selected_linechart.handleTransitionEnd( function () {
      self.frame.dispatch.end_line.call(self.frame);
    });

    // If the transition has no data, it is never going to jump! So we
    // need to reset the lines.
    if (data_by_selected_town.length === 0) {
      d3.select('.selected_linechart').remove();
    }
    this.frame.dispatch.jump_line.call(self.frame, year);

    this.selected_linechart = selected_linechart;

    return text_selections;
  }

  

  LineFrameController.prototype.start = function() {
    this.frame.dispatch.start_line.call(this.frame);
  }

  LineFrameController.prototype.stop = function() {
    this.frame.dispatch.stop_line.call(this.frame);
  }

  LineFrameController.prototype.reset = function() {
    //var towns = this.data_by_selected_town.slice();
    this.selected_linechart.duration(this.config.single_frame_duration);
    this.frame.dispatch.reset_line.call(this.frame);
    return this.towns;
  }

  LineFrameController.prototype.jump = function() {
    this.selected_linechart.duration(this.config.all_frames_duration);
    this.frame.dispatch.jump_line.call(this.frame, this.config.end_year);
  }

  return LineFrameController;
  
});