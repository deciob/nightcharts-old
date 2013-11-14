SRC = ./src/chart.js ./src/utils.js ./src/bar.js

build: $(SRC)
	cat $^ > build/chart.js