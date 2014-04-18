define([
  'when',
  'd3',
  'underscore',
  'chart'
], function(when, d3, _, chart) {
  'use strict';

  var frameController = function (args) {
    var selection = d3.select(args.selector),
      barchart,
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
      var draw, draw_dispatch, drawChart, handleFrameEnd, transition_config, 
          transition, year = 1955, delta = 5, 
          year_div = document.getElementById('frame-viz-year');

      var data_by_year = _.groupBy( data, function (obj) {
        return obj.year;
      });
      // wraps every year value in an array
      _.forEach(data_by_year, function(num, k) { 
        data_by_year[k] = [num]; 
      });

      barchart = chart.Bar()
        .margin({left: 150, bottom: 35})
        .ratio(.6)
        .duration(200)
        .categoricalValue( function(d) { return d['agglomeration']; } )
        .quantativeValue( function(d) { return d['population']; } )
        .scale_bounds('0,40')
        .invert_data(true)
        .quantitative_scale('x')
        .y_scale('ordinal')
        .x_scale('linear');
      //chart.draw(barchart, selection, data_by_year[1950]);
      draw = chart.draw(barchart, selection);

      drawChart = function (data, old_frame) {
        draw(data);
        year_div.innerText = this.frame;
      }
      draw_dispatch = barchart.drawDispatch();
      draw_dispatch.on('draw', drawChart);

      transition = chart.Frame()
        .draw_dispatch(draw_dispatch)
        .data(data_by_year)
        .initial_frame(year)
        .step(50)
        .delta(delta)();

      barchart.handleTransitionEnd( function () {
        transition.dispatch.end.call(transition);
      });

      transition.dispatch.jump.call(transition, year);
      document.getElementById('start-transition').onclick = function(e){
        transition.dispatch.start.call(transition);
      }
      document.getElementById('stop-transition').onclick = function(e){
        transition.dispatch.stop.call(transition);
      }
      document.getElementById('reset-transition').onclick = function(e){
        transition.dispatch.reset.call(transition);
      }

    });

  };

  return frameController;
  
});