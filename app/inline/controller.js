define([
  'when',
  'd3',
  'underscore'
], function(when, d3, _) {
  'use strict';

  var inlineController = function (args) {
    var chart = args.chart,
      barchart,
      selection = d3.select(args.selector);

    d3.json(args.data_url, function (err, data) {
      
      data = data.year.map( function(year, index) {
        return [year, data.world_urban_pop[index]];
      });

      barchart = chart.bar();

    });

  };

  return inlineController;
  
});