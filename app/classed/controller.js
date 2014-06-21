define([
  'd3'
], function(d3) {
  'use strict';

  var ClassedController = function(args) {
    this.config = args.config;
    this.colours = args.colours;
    this.active_rect_selector = args.active_rect_selector;
    this.active_text_selector = args.active_text_selector;
    this.cities = [];//d3.map({});

  };

  function isEqual(s1, s2) {
    return s1.__data__[1] === s2.__data__[1];
  }

  ClassedController.prototype.updateCities = function(args) {
    var city = args.city,
        existing_city_idx = this.cities.indexOf(city);
    if (existing_city_idx !== -1) {
      this.cities.splice(existing_city_idx, 1);
    } else {
      this.cities.push(city);
    }
    if (this.cities.length > 2) {
      this.cities.shift();
    }
    return {cities: this.cities, warning: args.warning};
  }

  ClassedController.prototype.resetCities = function(city) {
    this.cities = [];
  }

  ClassedController.prototype.updateBarSelections = function(args) {
    if (args.warning) {
      return args;
    }
    var current_rect_selection = args.rect_selection,
      current_text_selection = args.text_selection,
      active_rect_selections = d3.selectAll(this.active_rect_selector),
      active_text_selections = d3.selectAll(this.active_text_selector),
      current_class, exit_class, exit_index;

    if (active_rect_selections[0].length === 0) {
      current_rect_selection.classed({'active': true, 'red': true});
      current_text_selection.classed({'active': true});
      this.colours['red'] = true;
    } else if ( active_rect_selections[0].length === 1 && 
        isEqual(active_rect_selections[0][0], current_rect_selection[0][0]) ) {
      current_rect_selection.classed({'active': false, 'red': false, 'blue': false});
      current_text_selection.classed({'active': false});
      this.colours['red'] = false;
      this.colours['blue'] = false;
    } else if ( active_rect_selections[0].length === 1 && 
        !isEqual(active_rect_selections[0][0], current_rect_selection[0][0]) ) {
      current_rect_selection.classed({
        'active': true, 
        'red': !d3.select(active_rect_selections[0][0]).classed('red'),
        'blue': !d3.select(active_rect_selections[0][0]).classed('blue')
      });
      current_text_selection.classed({'active': true});
      this.colours['red'] = current_rect_selection.classed('red');
      this.colours['blue'] = current_rect_selection.classed('blue');      
    } else if ( active_rect_selections[0].length === 2 && 
        isEqual(active_rect_selections[0][0], current_rect_selection[0][0]) ||
        isEqual(active_rect_selections[0][1], current_rect_selection[0][0]) ) {
      current_class = current_rect_selection.classed('red') ? 'red' : 'blue';
      current_rect_selection.classed({
        'active': false,
        'red': false,
        'blue': false
      });
      current_text_selection.classed({'active': false});
      this.colours[current_class] = false;
    } else if ( active_rect_selections[0].length === 2 && 
        !isEqual(active_rect_selections[0][0], current_rect_selection[0][0]) ||
        !isEqual(active_rect_selections[0][1], current_rect_selection[0][0]) ) {
      exit_class = d3.select(active_rect_selections[0][0]).classed('red') ? 'red' : 'blue';
      d3.select(active_rect_selections[0][0]).classed('active', false);
      d3.select(active_rect_selections[0][0]).classed(exit_class, false);
      current_rect_selection.classed('active', true);
      current_rect_selection.classed(exit_class, true);
      exit_index = Array.prototype.indexOf.call(
        current_rect_selection[0][0].parentElement.children, 
        active_rect_selections[0][0] );
      d3.select(d3.selectAll('#bar-frame-viz > svg g.y text')[0][exit_index])
        .classed('active', false);
      current_text_selection.classed({'active': true});
    }

    return {
      text_selections: d3.selectAll('#bar-frame-viz > svg g.y text.active'),
      rect_selections: d3.selectAll(this.active_rect_selector)
    };

  }

  ClassedController.prototype.updateLineSelections = function(args) {
    var red = d3.select('#bar-frame-viz > svg g.bars rect.red'),
        blue = d3.select('#bar-frame-viz > svg g.bars rect.blue');

    setTimeout( function () {
      d3.selectAll('#line-frame-viz g.' + args.line_class + ' > g.line').each(function(d) {
        console.log(d);
  
        if (red[0][0] !== undefined && red[0][0].__data__[1] === d[0][2]) {
          d3.select(this).classed({red: true, blue: false});
        } else if (blue[0][0] !== undefined && blue[0][0].__data__[1] === d[0][2]) {
          d3.select(this).classed({red: false, blue: true});
        }
      });
    }, 100);//this.config.single_frame_duration);

    return args.text_selections;
  }

  return ClassedController;

});