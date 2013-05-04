
define(function(require) {

  require(["chai", "mocha", "../spec/charter/barchart_spec"], 
    function(chai, mocha, barchart_spec) {
      mocha.setup('bdd');
      mocha.run();
  });
  
});