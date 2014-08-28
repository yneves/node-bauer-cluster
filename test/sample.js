// - -------------------------------------------------------------------- - //

var cluster = require("../");

cluster.require("./queue.js");

cluster.master(function() {

  console.log("master");

  var worker = this.fork("boss");

  worker.on("exit",function() {
    console.log("master exit");
  });

  worker.on("request",function(req,res) {
    res.send(req);
  });

  worker.request({ doSomething: true }).done(function(response) {
    console.log("something done!",response);
  });

  worker.request({ doShit: true }).done(function(response) {
    console.log("shit done!",response);
  });

});

cluster.worker(function(worker) {

  worker.on("exit",function() {
    console.log("worker exit");
  });

  worker.on("request",function(req,res) {
    res.send(req);
  });

  worker.request({ boss: true }).done(function(response) {
    console.log("boss",response);
  });

  worker.request({ boss2: true }).done(function(response) {
    console.log("boss2",response);
    // worker.kill();
  });


  // worker.require(__dirname + "/plugin.js");

});

cluster.start();

// - -------------------------------------------------------------------- - //
