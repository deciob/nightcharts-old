r.js -o build.js out=../dist/nightcharts.js optimize=none
r.js -o build-almond.js out=../dist/nightcharts-wrap.js optimize=none wrap=true
docco --output ../docs ../dist/nightcharts.js