// **The default configuration module for the line.line module**

define('line/config',[
  "d3", 
  "base_config",
  "utils/mixins",
], function(d3, base_config, utils_mixins) {
    
  var config = {
        x_scale: 'time',
      },
      utils = utils_mixins();

  return utils.extend(base_config, config);
  
});

