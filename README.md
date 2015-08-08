# bauer-cluster

Multi-process development library.

## Installation

```
npm install bauer-cluster
```

## Usage

```js
var Cluster = require("bauer-cluster").Cluster;

var myCluster = new Cluster();

// executed when in main process
myCluster.master(function() {
  
  this === myCluster // true
  
  this.isMaster; // true
  this.isWorker; // false

  var worker = this.fork("one","two");

  worker.args; // ["one","two"]
  worker.process; // child process produced by fork
  
  worker.on("message",function(message) {
    if (message.pong) {
      worker.send({ ping: true });
    }
  });
  
  worker.send({ ping: true });

});

// executed when in child process
myCluster.worker(function(worker) {

  this === myCluster // true
  
  this.isMaster; // false
  this.isWorker; // true

  worker.args; // ["one","two"]
  worker.process; // global process object
  
  worker.on("message",function(message) {
    if (message.ping) {
      worker.send({ pong: true });
    }
  });

});

myCluster.start();
```

## API Summary

  * `Cluster`
    * `new Cluster() :Cluster`
    * `.getWorkerArgsOffset() :Number`
    * `.require(name String) :void`
    * `.master(callback Function) :void`
    * `.worker(callback Function) :void`
    * `.start() :void`
    * `.fork(arg0, arg1, ...) :Worker`
    * `.removeWorker(worker Worker) :void`
    * `.createWorker(uuid String, args Array) :Worker`
    * `.createWorker(uuid String, args Array, process Object) :Worker`


  * `Worker`
    * `new Worker(cluster Cluster, uuid String, args Array, process Object) :Worker`
    * `.setupProcess(proc) :void`
    * `.require(name String) :void`
    * `.kill(signal Number) :void`
    * `.die(reason Number|Error) :void`
    * `.send(message Object) :void`
    * `.receive(message Object) :void`


## License

[MIT](./LICENSE)
