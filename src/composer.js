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

  var defaults = defaults,
      utils  = utils,
      extend = utils.extend,
      getset = utils.getset;

  function composer (user_config) {

    var config = user_config || {},
        __     = extend(defaults, config);

    function chart (selection, options) {
      var is_frame = (!options || options.is_frame === "undefined") ? false : options.is_frame,
          old_frame_identifier = (!options || options.old_frame_identifier === "undefined") ? void 0 : options.old_frame_identifier,
          components = d3.map(__.components),
          data = selection.datum();

      data = data_module.normalizeData.call(composer, __, data);
      //layout.setDimensions.call(composer, __);
      //scale.setScales.call(composer, __);

      //components.forEach( function (key, values) {
      //  var method_name;
      //  if (components_module[key]) {
      //    method_name = composer.toCamelCase('set_' + [key]);
      //    components_module[key][method_name].call(composer, values);
      //  }
      //});

    }

    getset(chart, __, {exclude: ['components']});

    return chart;

  }

  d3.keys(utils).forEach( function (k) { d3.rebind(composer, utils, k); });
  return composer;

});