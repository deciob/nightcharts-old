(function() {
  var config;

  config = {
    base_url: "../",
    pluginPath: 'lib/curl/src/curl/plugin',
    packages: [
      {
        name: "curl",
        location: "lib/curl/dist/curl",
        main: "curl"
      }, {
        name: "d3",
        location: "lib/d3",
        main: "d3"
      }
    ]
  };

  curl(config, ["js!d3"]).next(["js/main"]).then(function(main) {
    return main();
  }, function(err) {
    return console.log(err);
  });

}).call(this);
