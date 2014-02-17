define([
  'when',
  'd3',
  'underscore',
  'chart'
], function(when, d3, _, chart) {
  'use strict';

  var tooltipController = function (args) {
    var selection = d3.select(args.selector),
      barchart,
      draw,
      tooltip_conf;

    tooltip_conf = {
      html: function (d, i) {
        return '<b>Period:</b> ' 
          + d[0] + ' <br> <b>Rate of change:</b> ' + d[1] + '%';
      },
      offset: [-5, 0]  // [top, left]
    }

    d3.json(args.data_url, function (err, data) {
      
      data = data.year.map( function(year, index) {
        return [year, data.urban_pop_average_annual_rate_change[index]];
      });

      barchart = chart.bar()
        .margin({top: 20, right: 20, bottom: 5, left: 30})
        .width(600)
        .height(200)
        .duration(0)
        .tooltip(tooltip_conf);
      chart.draw(barchart, selection, data);
    });

  };

  return tooltipController;
  
});