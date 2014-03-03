{
  baseUrl: "../src/",
  paths: {
    d3: '../lib/d3/d3',
    d3_tip: '../lib/d3-tip/index', 
    almond: '../lib/almond/almond',
    chart: '../src/chart'
  },
  //exclude: ['d3', 'd3_tip'],
  //shim: {
  //  d3: {
  //    exports: 'd3'
  //  },
  //  d3_tip: {
  //    exports: 'd3_tip'
  //  }
  //},


  wrap: {
    startFile: '../module_wrappers/module_prefix.js',
    endFile: '../module_wrappers/module_suffix.js'
  },
  name: 'almond',
  include: ['chart'],
  //findNestedDependencies: true
}