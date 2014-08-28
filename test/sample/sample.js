// - -------------------------------------------------------------------- - //

var cluster = require("../../");

cluster.master(function() {

  var worker = this.fork();

  worker.on("exit",function() {
    process.stdout.write("master.exit");
  });

  worker.on("message",function(message) {
    process.stdout.write("master.message");
    process.stdout.write(message);
    worker.kill();
  });

  worker.send("hello");

});

cluster.worker(function(worker) {

  worker.on("exit",function() {
    process.stdout.write("worker.exit")
    process.stdout.write(message);
  });

  worker.on("message",function(message) {
    process.stdout.write("worker.message")
    process.stdout.write(message);
    this.send("hi");
  });

});

cluster.start();

// - -------------------------------------------------------------------- - //
