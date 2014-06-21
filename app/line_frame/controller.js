define([
  'd3',
  'underscore',
  'chart'
], function(d3, _, chart) {
  'use strict';

  var LineFrameController = function (args) {

    var self = this,
        selection = d3.select(args.selector),
        config = args.config,
        data = args.data,
        normalized_data,
        grouped_data,
        grouped_data_obj,
        linechart;

    this.selection = selection;
    this.config = config;
    this.colours = ['red', 'blue'];
    this.data = data;

    this.linechart = chart.composer()
      .margin({bottom: 35})
      .xValue(function(d) {return d.year})
      .yValue(function(d) {return d.population})
      .zValue(function(d) {return d.agglomeration})
      .duration(config.single_frame_duration)
      .height(400)
      .date_format('%Y')
      .x_scale('time')
      .components(['x_axis', 'y_axis', 'lines'])
      .x_axis({tickFormat: d3.time.format("%Y")})
      .lines({class_name: 'linechart'});
    normalized_data = chart.utils.normalizeData(data, this.linechart.__);
    grouped_data = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, this.linechart.__, {grouper: 'array'});
    chart.draw(this.linechart, selection, grouped_data);
  
    self.grouped_data_obj = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, this.linechart.__, {grouper: 'object'});

  }


  LineFrameController.prototype.setFrames = function(args) {

    if (args.warning) {
      return args;
    }

    var self = this,
        cities = args.cities,
        data_by_selected_town = [],
        selected_linechart,
        draw_dispatch,
        drawChart,
        frame_config, 
        frame, 
        year = this.config.start_year, 
        delta = this.config.delta, 
        draw;

    cities.forEach(function(d) {
      data_by_selected_town.push(self.grouped_data_obj[d]);
    }, this);
    selected_linechart = chart.composer(this.linechart.current_applied_configuration)
      .components(['lines'])
      .use_existing_chart(true)
      .duration(this.config.single_frame_duration)
      .drawDispatch(d3.dispatch('draw_line'))
      .identifier('year')
      .lines({
        class_name: 'selected_linechart', 
        class_name_on_path: function(d) {
          var colour;
          cities.forEach(function(town, i) {
            if (d[0] && d[0][2] === town) {
              if (self.colours.indexOf('red') === i) {
                colour = 'red';
              } else if (self.colours.indexOf('blue') === i) {
                colour = 'blue';
              }
            }
          }, this);
          return colour;
        },
        reset: true});
    draw = chart.draw(selected_linechart, this.selection);

    drawChart = function (data, options) {
      draw(data, options);
    }

    draw_dispatch = selected_linechart.drawDispatch();
    draw_dispatch.on('draw_line', drawChart);
    this.frame = chart.Frame(this.linechart.__)
      .draw_dispatch(draw_dispatch)
      .data(data_by_selected_town)
      .initial_frame(year)
      .frame_identifier_index(0)
      .dispatch_identifier('_line')
      .fill_empty_data_sequence(true)
      .frameIdentifierKeyFunction(function(d){
        return d[0].getFullYear();
      })
      .step(this.config.step)
      .frame_type('sequence')
      .delta(delta)();

    selected_linechart.handleTransitionEnd( function () {
      d3.select(self.config.year_dom_selector).text(self.frame.frame);
      self.frame.dispatch.end_line.call(self.frame);
    });

    // If the transition has no data, it is never going to jump! So we
    // need to reset the lines.
    if (data_by_selected_town.length === 0) {
      d3.select('.selected_linechart').remove();
    }
    this.frame.dispatch.jump_line.call(self.frame, year);

    this.selected_linechart = selected_linechart;

    return {
      cities: args.cities, 
      //text_selections: text_selections, 
      line_class: 'selected_linechart'
    };
  }

  LineFrameController.prototype.updateSelections = function(args) {
    var cities = args.cities,
        colours = this.colours,
        bars = d3.selectAll('#bar-frame-viz > svg g.bars rect'),
        lines = d3.selectAll('#line-frame-viz g.' + args.line_class + ' > g.line');

    d3.selectAll('#line-frame-viz g.' + args.line_class + ' > g.line.red')
      .classed('red', false);
    d3.selectAll('#line-frame-viz g.' + args.line_class + ' > g.line.blue')
      .classed('blue', false);

    setTimeout( function () {
      d3.selectAll('#line-frame-viz g.' + args.line_class + ' > g.line').each(function(d) {
        cities.forEach(function(city, i){
          var selection = d3.select(this);
          if (d[1] === city) {
            selection.classed('red', function(){
              return colours.indexOf('red') === i ? true : false;
            });
            selection.classed('blue', function(){
              return colours.indexOf('blue') === i ? true : false;
            });
          }
        }, this);
      });
    }, 100);

    return args;
  }

  LineFrameController.prototype.start = function() {
    this.frame.dispatch.start_line.call(this.frame);
  }

  LineFrameController.prototype.stop = function() {
    this.frame.dispatch.stop_line.call(this.frame);
  }

  LineFrameController.prototype.reset = function() {
    //var towns = this.data_by_selected_town.slice();
    this.selected_linechart.duration(this.config.single_frame_duration);
    this.frame.dispatch.reset_line.call(this.frame);
    return {};
  }

  LineFrameController.prototype.jump = function() {
    this.selected_linechart.duration(this.config.all_frames_duration);
    // Fixme!
    // There is a bug in the frame module. The sequence of frames will 
    // not start if the jump year is empty and as a consequence also the next
    // start sequence will brake. 
    this.frame.dispatch.jump_line.call(this.frame, this.config.end_year);
  }

  return LineFrameController;
  
});