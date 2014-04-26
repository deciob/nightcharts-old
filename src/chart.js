define([
  'd3',
  'utils',
  'defaults',
  'composer',
  'draw',
  'data',
  'scale',
  'layout',
  'components/components',
], function (
  d3,
  utils,
  defaults, 
  composer,
  draw,
  data,
  scale,
  layout,
  components
) {

  return {
    d3: d3,
    utils: utils,
    defaults: defaults,
    composer: composer,
    draw: draw,
    data: data,
    scale: scale,
    layout: layout,
    components: components,
  };

});

