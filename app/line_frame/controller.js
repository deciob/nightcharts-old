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
          frame, year = 1955, delta = 5, 
          year_div = document.getElementById('line-frame-viz-year');

      var data_by_selected_town = _.filter(data, function (obj) {
        return obj.agglomeration == 'Tokyo';
      });
      //var data_by_year = _.groupBy( data_by_selected_town, function (obj) {
      //  return obj.year;
      //});

      // wraps every year value in an array
      //_.forEach(data_by_year, function(num, k) { 
      //  data_by_year[k] = [num]; 
      //});



      linechart = chart.Line()
        .margin({left: 150, bottom: 35})
        .ratio(.6)
        .duration(600)
        .categoricalValue( function(d) { return d['year']; } )
        .quantativeValue( function(d) { return d['population']; } )
        .scale_bounds('0,40')
        .x_scale('ordinal');
      draw = chart.draw(linechart, selection);

      drawChart = function (data, old_frame_identifier) {
        draw(data, old_frame_identifier);
        year_div.innerText = this.frame;
      }
      draw_dispatch = linechart.drawDispatch();
      draw_dispatch.on('draw', drawChart);


//          __ = {
//      initial_frame: 1950,  // Start date in data.
//      draw_dispatch: d3.dispatch('draw'),
//      delta: 5,
//      step: 500,
//      data: data_array,
//      frame_type: 'block',
//      frame_identifier: 'year',
//      },
//      FrameConstructor = Frame(__);
//      frame = FrameConstructor();
//  
//      frame = chart.Frame()
//          .draw_dispatch(draw_dispatch)
//          .data(data_by_year)
//          .initial_frame(year)
//          .step(50)
//          .delta(delta)();

      frame = chart.Frame()
        .step(50)
        .draw_dispatch(draw_dispatch)
        .data(data_by_selected_town)
        .initial_frame(year)
        .delta(delta)
        .frame_identifier('year')
        .frame_type('sequence')();

      linechart.handleTransitionEnd( function () {
        frame.dispatch.end.call(frame);
      });

      frame.dispatch.jump.call(frame, year);
      document.getElementById('start-transition').onclick = function(e){
        frame.dispatch.start.call(frame);
      }
      document.getElementById('stop-transition').onclick = function(e){
        frame.dispatch.stop.call(frame);
      }
      document.getElementById('reset-transition').onclick = function(e){
        frame.dispatch.reset.call(frame);
      }

    });

  };

  return lineFrameController;
  
});