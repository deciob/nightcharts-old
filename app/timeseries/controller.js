define([
  'when',
  'd3',
  'underscore',
  'chart',
], function(when, d3, _, chart) {
  'use strict';

  var timeseriesController = function (args) {
    var selection = d3.select(args.selector),
      barchart,
      draw;

    d3.json(args.data_url, function (err, data) {
      
      data = data.year.map( function(year, index) {
        console.log(year)
        return [year.toString(), data.world_urban_pop[index]];
      });

      barchart = chart.bar()
        .margin({left: 80})
        .width(600)
        .height(200)
        .duration(0)
        .parseTime(d3.time.format("%Y").parse);
      chart.draw(barchart, selection, data);
    });

  };

  return timeseriesController;
  
});