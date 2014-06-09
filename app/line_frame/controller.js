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
        linechart;

    this.selection = selection;

    this.linechart = chart.composer()
      .margin({bottom: 35})
      .xValue(function(d) {return d.year})
      .yValue(function(d) {return d.population})
      .zValue(function(d) {return d.agglomeration})
      .duration(400)
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
        year = 1955, 
        delta = 5, 
        draw;

    text_selections.each(function(d) {
      data_by_selected_town.push(self.grouped_data_obj[d]);
    });
    selected_linechart = chart.composer(this.linechart.current_applied_configuration)
      .components(['lines'])
      .use_existing_chart(true)
      .duration(300)
      .drawDispatch(d3.dispatch('draw_line'))
      .lines({class_name: 'selected_linechart', reset: true});
    draw = chart.draw(selected_linechart, this.selection);

    drawChart = function (data, options) {
      draw(data, options);
    }

    draw_dispatch = selected_linechart.drawDispatch();
    draw_dispatch.on('draw_line', drawChart);
    this.transition = chart.Frame(this.linechart.__)
      .draw_dispatch(draw_dispatch)
      .data(data_by_selected_town)
      .initial_frame(year)
      .frame_identifier_index(0)
      .dispatch_identifier('_line')
      .frameIdentifierKeyFunction(function(d){
        return d[0].getFullYear();
      })
      .step(50)
      .frame_type('sequence')
      .delta(delta)();

    selected_linechart.handleTransitionEnd( function () {
      self.transition.dispatch.end_line.call(self.transition);
    });

    // If the transition has no data, it is never going to jump! So we
    // need to reset the lines.
    if (data_by_selected_town.length === 0) {
      d3.select('.selected_linechart').remove();
    }
    this.transition.dispatch.jump_line.call(self.transition, year);

    this.selected_linechart = selected_linechart;

    return text_selections;
  }

  

  LineFrameController.prototype.start = function() {
    this.transition.dispatch.start_line.call(this.transition);
  }

  LineFrameController.prototype.stop = function() {
    this.transition.dispatch.stop_line.call(this.transition);
  }

  LineFrameController.prototype.reset = function() {
    this.selected_linechart.duration(300);
    this.transition.dispatch.reset_line.call(this.transition);
  }

  LineFrameController.prototype.jump = function() {
    this.selected_linechart.duration(1400);
    this.transition.dispatch.jump_line.call(this.transition, 2025);
  }

  return LineFrameController;
  
});