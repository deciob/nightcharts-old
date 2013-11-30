SRC = \
  ./module_wrappers/module_prefix.js\
  ./src/chart.js\
  ./src/utils.js\
  ./src/bar_config.js\
  ./src/bar_orient.js\
  ./src/bar.js\
  ./module_wrappers/module_suffix.js\

build: $(SRC)
	awk 'FNR==1{print ""}1' $^ > build/chart.js