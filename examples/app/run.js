(function () {

  curl.config({
    baseUrl: '../../',
    paths: {
      d3: {
        location: 'lib/d3/d3.js',
        config: {
          loader: 'lib/curl/src/curl/loader/legacy',
          exports: 'd3',  // leaving trailing comma! :)
        }
      }
    },
    packages: {
      curl: { location: 'lib/curl/src/curl/' },
      when: { location: 'lib/when', main: 'when' },
      meld: { location: 'lib/meld', main: 'meld' },
      lodash: { location: 'lib/lodash/dist', main: 'lodash' },
      bar: { location: 'src/barchart/', main: 'bar' },
      utils: { location: 'src/utils', main: 'utils' },
      app: { location: 'examples/app', main: 'main' },
    }
  });

  curl(['app']).then(start, fail);

  function start(promise) {
    promise.then(function (data) {
      console.log(data);
    });
  }

  function fail(ex) {
    // show a meaningful error to the user.
  }

}());