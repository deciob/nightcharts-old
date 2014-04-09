// **The default configuration module for the line.line module**

define('line/config',[
  "d3", 
  "base_config",
  "utils/utils",
], function(d3, base_config, utils) {
    
  var config = {
    x_scale: 'time',
  };

  return utils.extend(base_config, config);
  
});

