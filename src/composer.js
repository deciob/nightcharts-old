define([
  'd3',
  'utils',
  'defaults',
  'data',
  'scale',
  'layout',
  'components/components',
], function(
  d3,
  utils,
  defaults,
  data_module,
  scale,
  layout,
  components_module
) {
  'use strict';

  var defaults = defaults,
      utils  = utils,
      extend = utils.extend,
      getset = utils.getset;

  function composer (user_config) {

    var config = user_config || {},
        __     = extend(defaults, config);

    function compose (selection, options) {

      var is_frame = (!options || options.is_frame === "undefined") ? false : options.is_frame,
          old_frame_identifier = (!options || options.old_frame_identifier === "undefined") ? void 0 : options.old_frame_identifier,
          frameIdentifierKeyFunction = (!options || options.frameIdentifierKeyFunction === "undefined") ? void 0 : options.frameIdentifierKeyFunction,
          data = selection.datum(),
          svg,
          g,
          transition;

      // TODO: run a validation function on __, if debug mode.

      compose.current_configuration = extend ({}, __, {use_clone: true});

      __.data = data;
      __.old_frame_identifier = old_frame_identifier;
      __.frameIdentifierKeyFunction = frameIdentifierKeyFunction;
      __ = data_module.setDelay(data, __); //FIXME and TESTME
      if (!__.use_existing_chart) {
        __ = layout.setDimensions(selection, __);
        __ = scale.setScales(__);
  
        scale.applyScales(__); //TESTME
  
        compose.current_applied_configuration = extend ({}, __, {use_clone: true});

      }

      if (__.use_existing_chart) {
        g = selection.select('g');
      } else {
        // Select the svg element, if it exists.
        svg = selection.selectAll("svg").data([data]);
        // Otherwise, create the skeletal chart.
        g = svg.enter().append("svg").append("g");
        // Update the outer dimensions.
        svg.attr("width", __.width).attr("height", __.height);
        // Update the inner dimensions.
        g.attr("transform", "translate(" + 
          __.margin.left + "," + __.margin.top + ")");
      }
      // Transitions root.
      g = selection.select('svg > g');
      transition = g.transition().duration(__.duration);

      __.components.forEach( function (component) {
        var method_name;
        if (components_module[component]) {
          method_name = utils.toCamelCase('draw_' + component);
          components_module[component][method_name](g, transition, __, data);
        }
      });

    }

    getset(compose, __);
    //compose.getCurrentConfiguration = __;
    compose.__ = __;

    return compose;

  }

  return composer;

});