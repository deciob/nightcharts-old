var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/_spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/src',

    paths: {
        'chai': '../lib/chai/chai',
        'd3': '../lib/d3/d3',
        'd3_tip': '../lib/d3-tip/index',
        'data': '../test/data',
        'data_array': '../test/data_array',
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});