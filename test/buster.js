var config = module.exports;

config["Chart tests"] = {
    environment: "browser",
    rootPath: "../",
    sources: [            
        "lib/d3/d3.js", 
        "build/chart.js"
    ],
    tests: [
        "test/**/*-test.js"
    ]
};
