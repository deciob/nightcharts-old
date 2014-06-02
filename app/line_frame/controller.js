define([
  'when',
  'd3',
  'underscore',
  'chart'
], function(when, d3, _, chart) {
  'use strict';

  var lineFrameController = function (args) {
    var selection = d3.select(args.selector),
      linechart,
      selected_linechart,
      transition,
      draw;

    function accessor(d) {
      // csv headers:
      // year,rank,country,agglomeration,population
      return {
        year: +d.year,
        rank: d.rank,
        country: d.country,
        agglomeration: d.agglomeration,
        population: +d.population
      };
    }

    d3.csv(args.data_url, accessor , function(error, data) {

      var draw, draw_dispatch, drawChart, handleFrameEnd, frame_config, 
          frame, year = 1950, delta = 5, 
          year_div = document.getElementById('line-frame-viz-year');

      linechart = chart.composer()
        .xValue(function(d) {return d.year})
        .yValue(function(d) {return d.population})
        .zValue(function(d) {return d.agglomeration})
        .duration(1000)
        .date_format('%Y')
        .x_scale('time')
        .components(['x_axis', 'y_axis', 'lines'])
        .x_axis({tickFormat: d3.time.format("%Y")})
        .lines({class_name: 'linechart'});
      var normalized_data = chart.data.normalizeData(data, linechart.__);
      var grouped_data = chart.data.groupNormalizedDataByIndex(
        2, normalized_data, linechart.__, {grouper: 'array'});
      chart.draw(linechart, selection, grouped_data);
      

      var grouped_data_obj = chart.data.groupNormalizedDataByIndex(
        2, normalized_data, linechart.__, {grouper: 'object'});
      var data_by_selected_town = [
        grouped_data_obj['São Paulo'], 
        grouped_data_obj['New York']
      ];
      selected_linechart = chart.composer(linechart.current_applied_configuration)
        .components(['lines'])
        .use_existing_chart(true)
        .duration(200)
        .drawDispatch(d3.dispatch('draw_line'))
        .lines({class_name: 'selected_linechart'});
      draw = chart.draw(selected_linechart, selection);
      drawChart = function (data, options) {
        draw(data, options);
        //year_div.innerText = this.frame;
      }
      draw_dispatch = selected_linechart.drawDispatch();
      draw_dispatch.on('draw_line', drawChart);
      transition = chart.Frame(linechart.__)
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
        transition.dispatch.end_line.call(transition);
      });

      transition.dispatch.jump_line.call(transition, year);
      document.getElementById('start-transition-line').onclick = function(e){
        console.log('transition.dispatch.jump_line', transition.dispatch_identifier());
        transition.dispatch.start_line.call(transition);
      }
      document.getElementById('stop-transition-line').onclick = function(e){
        transition.dispatch.stop_line.call(transition);
      }
      document.getElementById('reset-transition-line').onclick = function(e){
        transition.dispatch.reset_line.call(transition);
      }

    });

  };

  return lineFrameController;
  
});