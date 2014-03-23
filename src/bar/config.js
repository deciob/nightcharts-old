// **The default configuration module for the bar.bar module**

define('bar/config', [
  "base_config",
  "utils/mixins",
], function(base_config, utils_mixins) {
    
  var config = {
        orientation: 'vertical',
        padding: .1,    
        barOffSet: 4,
      },
      utils = utils_mixins();

  return utils.extend(base_config, config);
  
});

