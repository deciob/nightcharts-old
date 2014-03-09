// **The default configuration module for the bar.bar module**

define('bar/config',[
    "base_config",
    "utils/utils",
  ], function(base_config, utils) {
    
  var config = {
    orientation: 'vertical',
    padding: .1,    
    barOffSet: 4,
  };

  return utils.extend(base_config, config);
  
});

