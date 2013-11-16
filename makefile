SRC = ./src/chart.js ./src/utils.js ./src/bar.js

build: $(SRC)
	awk 'FNR==1{print ""}1' $^ > build/chart.js