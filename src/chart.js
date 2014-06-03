define([
  'd3',
  'utils',
  'defaults',
  'composer',
  'draw',
  'scale',
  'layout',
  'components/components',
  'frame/frame'
], function (
  d3,
  utils,
  defaults, 
  composer,
  draw,
  scale,
  layout,
  components,
  Frame
) {

  return {
    d3: d3,
    utils: utils,
    defaults: defaults,
    composer: composer,
    draw: draw,
    scale: scale,
    layout: layout,
    components: components,
    Frame: Frame
  };

});

