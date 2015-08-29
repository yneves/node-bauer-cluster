// - -------------------------------------------------------------------- - //

var mod = require("../../");

var cluster = new mod.Cluster();

cluster.master(function() {

  var worker = this.fork();

  worker.on("exit",function() {
    process.stdout.write("master.exit");
  });

  worker.on("message",function(message) {
    process.stdout.write("master.message");
    process.stdout.write(message.msg);
    worker.kill();
  });

  worker.send({ msg: "hello" });

});

cluster.worker(function(worker) {

  worker.on("exit",function() {
    process.stdout.write("worker.exit");
  });

  worker.on("message",function(message) {
    process.stdout.write("worker.message");
    process.stdout.write(message.msg);
    worker.send({ msg: "hi" });
  });

});

cluster.start();

// - -------------------------------------------------------------------- - //
