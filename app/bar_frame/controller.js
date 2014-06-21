define([
  'd3',
  'underscore',
  'chart'
], function(d3, _, chart) {
  'use strict';

  var BarFrameController = function (args) {

    var self = this,
        selection = d3.select(args.selector),
        active_line_selector = args.active_line_selector,
        config = args.config,
        data = args.data,
        normalized_data,
        grouped_data,
        barchart,
        draw_dispatch,
        drawChart,
        frame_config, 
        frame, 
        year = config.start_year, 
        delta = config.delta,
        draw;

    this.config = config;
    this.colours = ['red', 'blue'];
    this.cities = [];

    barchart = chart.composer()
      .margin({left: 230, bottom: 35})
      .height(600)
      .duration(config.single_frame_duration)
      .yValue( function(d) { return d['agglomeration']; } )
      .xValue( function(d) { return d['population']; } )
      .zValue(function(d) {return d.year})
      .components(['x_axis', 'y_axis', 'bars'])
      //.bars({
      //  class_name_on_rect: function(d) {
      //    var classed = '';
      //    d3.selectAll(active_line_selector).each(function(l) {
      //      console.log(this.__data__[0][0][2], l[0][0][2]);
      //      if (this.__data__[0] && this.__data__[0][0][2] === l[0][0][2]) {
      //        classed = d3.select(this).select('path').classed('red') ? 'red' : 'blue';
      //      }
      //    });
      //    return classed;
      //  }
      //})
      .scale_bounds('0,40')
      .invert_data(true)
      .y_scale('ordinal')
      .x_scale('linear')
      .x_axis({tickValues: ['0', '20', '40']})
      .delay(function(){return 0;})
      .identifier('year')
      .drawDispatch(d3.dispatch('draw_bar'));
    normalized_data = chart.utils.normalizeData(data, barchart.__);
    grouped_data = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, barchart.__, {grouper: 'object'});
    //console.log(grouped_data);
    draw = chart.draw(barchart, selection);


    drawChart = function (data, options) {
      draw(data, options);
    }

    draw_dispatch = barchart.drawDispatch();
    draw_dispatch.on('draw_bar', drawChart);
  
    this.transition = chart.Frame(barchart.__)
      .draw_dispatch(draw_dispatch)
      .data(grouped_data)
      .initial_frame(year)
      .step(config.step)
      .delta(config.delta)
      .dispatch_identifier('_bar')
      .frame_identifier_index(0)();
  
    barchart.handleTransitionEnd( function () {
      self.transition.dispatch.end_bar.call(self.transition);
    });
  
    this.transition.dispatch.jump_bar.call(this.transition, year);

    this.barchart = barchart;

  };

  BarFrameController.prototype.getSelections = function(event) {
    var city,
        tag_name = event.target.tagName;

    if ( tag_name == 'text' ) {
      city = event.target.__data__;
    } else {
      if (event.target.__data__[2] !== this.config.start_year) {
        return {warning: true};
      }
      city = event.target.__data__[1];
    }

    return {city: city};
  }

  BarFrameController.prototype.setSelections = function(args) {
    d3.selectAll(args.selector).each(function(d) {
      args.cities.forEach(function(city, i){
        var selection = d3.select(this);
        if (d[1] === city) {
          selection.classed('red', function(){
            return args.colours.indexOf('red') === i ? true : false;
          });
          selection.classed('blue', function(){
            return args.colours.indexOf('blue') === i ? true : false;
          });
        }
      }, this);
    });
  }

  BarFrameController.prototype.updateSelections = function(args) {
    var cities = args.cities || this.cities,
        colours = this.colours,
        selector = '#bar-frame-viz > svg g.bars rect';
    this.cities = cities;
    d3.select('#bar-frame-viz > svg g.bars rect.red').classed('red', false);
    d3.select('#bar-frame-viz > svg g.bars rect.blue').classed('blue', false);
    this.setSelections({
      selector: selector,
      cities: cities,
      colours: colours
    });
    return args;
  }

  BarFrameController.prototype.recoverSelections = function() {
    // FIXME: callback or promise to handle stuff like:
    // this.transition.dispatch.jump_bar.call(this.transition, 2020)
    // instead of using this setTimeout here!
    var cities = this.cities,
        colours = this.colours,
        selector = '#bar-frame-viz > svg g.bars rect',
        setSelections = this.setSelections;
    setTimeout( function () {
      setSelections({
        selector: selector,
        cities: cities,
        colours: colours
      });
    }, this.config.single_frame_duration);
  }

  BarFrameController.prototype.start = function() {
    this.transition.dispatch.start_bar.call(this.transition);
  }

  BarFrameController.prototype.stop = function() {
    this.transition.dispatch.stop_bar.call(this.transition);
  }

  BarFrameController.prototype.reset = function() {
    this.barchart.duration(this.config.single_frame_duration);
    this.transition.dispatch.reset_bar.call(this.transition);
  }

  BarFrameController.prototype.jump = function() {
    this.barchart.duration(this.config.all_frames_duration);
    this.transition.dispatch.jump_bar.call(this.transition, this.config.end_year);
  }

  return BarFrameController;
  
});