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
      
      data = data.month.map( function(month, index) {
        return [month, data.temperature[index]];
      });

      barchart = chart.bar()
        .margin({left: 80})
        .width(600)
        .height(200)
        .duration(0)
        .parseDate(d3.time.format("%m").parse);
      chart.draw(barchart, selection, data);
    });

  };

  return timeseriesController;
  
});