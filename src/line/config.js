// **The default configuration module for the line.line module**

define('line/config',[
    "base_config",
    "utils/utils",
  ], function(base_config, utils) {
    
  var config = {
    // TODO this is an yAxis offset....
    date_adjust: 5
  };

  return utils.extend(base_config, config);
  
});

