node-bauer-cluster
================

Just another cluster library.

## Installation

```
npm install bauer-cluster
```

## Usage

Please note that ```bauer-cluster``` takes over the script file, since it uses ```process.argv``` for internal control.

```js
var cluster = require("bauer-cluster");

// executed when in main process
// same as cluster.on('master', ... )
cluster.master(function() {

  console.log(cluster.isMaster); // true
  console.log(cluster.isWorker); // false

  var worker = cluster.fork("one","two");

});

// executed when in child processes
// same as cluster.on('worker', ... )
cluster.worker(function(worker) {

  console.log(cluster.isMaster); // false
  console.log(cluster.isWorker); // true

  console.log(worker.args); // ["one","two"]

});

cluster.start();
```

## License

MIT
