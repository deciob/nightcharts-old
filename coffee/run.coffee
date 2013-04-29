requirejs.config
  
  # Specify dependency libraries
  paths:
    d3: "../lib/d3/d3"
    almond: "../node_modules/grunt-requirejs/node_modules/almond/almond"
    barchart: "charts/barchart"

  # Not AMD-capable per default,
  # so we need to use the AMD wrapping of RequireJS.
  shim:
    d3:
      exports: "d3"

  name: "almond"
  include: ["barchart"]
  
  insertRequire: ["barchart"] 

  wrap: #true
    startFile: "../wrap/start.frag"
    endFile: "../wrap/end.frag"

