// **The default configuration module for the line.line module**

define('line/config',[
  "d3", 
  "base_config",
  "utils/utils",
], function(d3, base_config, utils) {
    
  var config = {
    x_scale: 'time',
    // TODO this is an yAxis offset....
    //date_adjust: 5
  };

  return utils.extend(base_config, config);
  
});

