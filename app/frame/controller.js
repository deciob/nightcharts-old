define([
  'when',
  'd3',
  'underscore',
  'chart'
], function(when, d3, _, chart) {
  'use strict';

  var frameController = function (args) {
    var selection = d3.select(args.selector),
      barchart;

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
      var draw, draw_dispatch, drawChart, handleFrameEnd, transition_config, 
          transition, year = 1955, delta = 5, 
          year_div = document.getElementById('frame-viz-year');

      //var data_by_year = _.groupBy( data, function (obj) {
      //  return obj.year;
      //});
      //// wraps every year value in an array
      //_.forEach(data_by_year, function(num, k) { 
      //  data_by_year[k] = [num]; 
      //});

      barchart = chart.composer()
        .margin({left: 150, bottom: 35})
        .ratio(.6)
        .duration(200)
        .yValue( function(d) { return d['agglomeration']; } )
        .xValue( function(d) { return d['population']; } )
        .zValue(function(d) {return d.year})
        .components(['x_axis', 'y_axis', 'bars'])
        .scale_bounds('0,40')
        .invert_data(true)
        //.quantitative_scale('x')
        .y_scale('ordinal')
        .x_scale('linear');
      var normalized_data = chart.data.normalizeData(data, barchart.__);
      var grouped_data = chart.data.groupNormalizedDataByIndex(
        2, normalized_data, barchart.__, {grouper: 'object'});
      draw = chart.draw(barchart, selection);

      drawChart = function (data, options) {
        draw(data, options);
        year_div.innerText = this.frame;
      }
      draw_dispatch = barchart.drawDispatch();
      draw_dispatch.on('draw', drawChart);

      transition = chart.Frame(barchart.__)
        .draw_dispatch(draw_dispatch)
        .data(grouped_data)
        .initial_frame(year)
        .step(50)
        .delta(delta)
        //.frame_type('block')
        .dispatch_identifier('_bar')
        .frame_identifier_index(0)();

      barchart.handleTransitionEnd( function () {
        transition.dispatch.end_bar.call(transition);
      });

      transition.dispatch.jump_bar.call(transition, year);
      document.getElementById('start-transition').onclick = function(e){
        transition.dispatch.start_bar.call(transition);
      }
      document.getElementById('stop-transition').onclick = function(e){
        transition.dispatch.stop_bar.call(transition);
      }
      document.getElementById('reset-transition').onclick = function(e){
        transition.dispatch.reset_bar.call(transition);
      }

    });

  };

  return frameController;
  
});