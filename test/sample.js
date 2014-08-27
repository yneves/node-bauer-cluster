// - -------------------------------------------------------------------- - //

var cluster = require("../");

cluster.master(function() {

  console.log("master");

  for (var i = 0; i < 10; i++) {

    var worker = this.fork("boss");

    worker.on("exit",function() {
      console.log(cluster.workers.length);
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

  }

});

cluster.worker(function(worker) {

  worker.require(__dirname + "/plugin.js");

});

cluster.start();

// - -------------------------------------------------------------------- - //
