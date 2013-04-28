requirejs.config
  
  # The path where your JavaScripts are located
  #/home/deciob/dev/charts/js/barchart.js
  #baseUrl: "../js"
  
  # Specify dependency libraries
  paths:
    d3: "../lib/d3/d3"

  # Not AMD-capable per default,
  # so we need to use the AMD wrapping of RequireJS.
  shim:
    d3:
      exports: "d3"

  #packages: [
  #  { name: 'charter', location: 'charts/barcharts', main: 'charter' }
  #]

  name: "charts/barchart"
  #include: ["js/charts/barchart"]
  wrap: true
  #  startFile: "../wrap/start.frag"
  #  endFile: "../wrap/end.frag"
