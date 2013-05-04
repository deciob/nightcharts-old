(function() {
  define(["charts/barchart"], function(barchart) {
    var charter;

    charter = {};
    charter.barchart = barchart;
    console.log(charter);
    return charter;
  });

}).call(this);
