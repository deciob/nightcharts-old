(function(define) {
  return define([
    "d3", 
    "lodash", 
    "when", 
    "bar"
  ], function(d3, _, when, bar) {

    var d = when.defer();

    function accessor(d) {
      // csv headers:
      // year,rank,country,agglomeration,population
      return {
        year: +d.year, //new Date(+d.year, 0, 1), // convert "Year" column to Date
        rank: d.rank,
        country: d.country,
        agglomeration: d.agglomeration,
        population: +d.population
      };
    }

    d3.csv("data/WUP2011-F11a-30_Largest_Cities.csv",
     accessor  , function(error, data) {
        var current_year, current_timeout, data_by_year, selection, barchart,
          info = d3.select("#info"), stop_transition = false, 
          initial_year = 1950, current_year = initial_year, transition_conf;
        data_by_year = _.groupBy( data, function (obj) {
          return obj.year;
        });
        selection = d3.select("#viz");
        info.text(current_year);

        transition_conf = {
          data: data_by_year,
          start: initial_year,
          step: 5
        }


        barchart = bar()
          .margin({top: 10, right: 20, bottom: 20, left: 400})
          .width(1100)
          .height(700)
          //.duration(1600)
          .step(400)
          .max(40)
          .xValue( function(d) { return d['agglomeration']; } )
          .yValue( function(d) { return d['population']; } )
          //.handleTransitionEnd( handleTransitionEnd )
          .orient( 'horizontal' )
          //.orient( 'vertical' );
          .transition_conf( transition_conf );
        selection.datum(data_by_year[current_year]).call(barchart);

        d3.select("#start").on('click', function () {
          barchart.dispatch.start.apply(barchart, [selection]);
        });

        d.resolve(data);
        //debugger


    });

    return d.promise;

  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});
