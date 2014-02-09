define([
  'when',
  'd3',
  'underscore'
], function(when, d3, _) {
  'use strict';

  var inlineController = function (args) {
    var chart = args.chart,
      selection = d3.select(args.selector),
      barchart,
      draw;

    d3.json(args.data_url, function (err, data) {
      
      data = data.year.map( function(year, index) {
        return [year, data.world_urban_pop[index]];
      });

      barchart = chart.bar()
        .margin({top: 0, right: 0, bottom: 0, left: 0})
        .width(100)
        .height(20)
        .padding(0)
        .duration(0)
        .categoricalValue( function(d, i) { return d[0]; } )
        .quantativeValue( function(d, i) { return d[1]; } );
      draw = chart.draw(barchart, selection);
      draw(data);
    });

  };

  return inlineController;
  
});