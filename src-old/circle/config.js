// **The default configuration module for the point.point module**

define('circle/config', [
  "base_config",
  "utils/mixins",
], function(base_config, utils_mixins) {
    
  var config = {},
      utils = utils_mixins();

  return utils.extend(base_config, config);
  
});

