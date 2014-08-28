node-bauer-cluster
================

As any other cluster library, ```bauer-cluster``` provide an API for multi-process development. It also provide a common API to work on both sides, parent and child processes.

## Installation

```
npm install bauer-cluster
```

## Usage

Please note that ```bauer-cluster``` takes over the script file, since it uses ```process.argv``` for internal control.

```js
var cluster = require("bauer-cluster");

// executed when in main process
cluster.master(function() {

  cluster.isMaster; // true
  cluster.isWorker; // false

  var worker = cluster.fork("one","two");

  worker.args; // ["one","two"]
  worker.process; // child process produced by fork

});

// executed when in child processes
cluster.worker(function(worker) {

  cluster.isMaster; // false
  cluster.isWorker; // true

  worker.args; // ["one","two"]
  worker.process; // global process object

});

cluster.start();
```

## Cluster

The `Cluster` class can be extended by adding methods to its prototype.

```js
cluster.cls.Cluster.prototype.newMethod = function() {}
```

### Events

The `Cluster` class inherits from `EventEmitter`. The following events are available.

 * `master` - emitted when cluster starts in parent process.
 * `worker` - emitted when cluster starts in child process.
 * `fork` - emitted when a new worker is created.

### .master

Attach a listener to the ```master``` event, which is emitted when the cluster is started on the parent process.

```js
cluster.master(function() {});
// same as
cluster.on("master",function() {});
```

### .worker

Attach a listener to the ```worker``` event, which is emitted when the cluster is started on the child process. Callbacks gets the ```Worker``` object as its first argument.

```js
cluster.worker(function(worker) {});
// same as
cluster.on("worker",function(worker) {});
```

### .start

Starts the cluster. Must be called after callbacks were attached otherwise nothing will happen.

```js
cluster.start();
```

### .fork

Creates a new worker passing the provided arguments. These arguments will be available as the ```.args``` property of the worker object. Returns a ```Worker``` object. This will emit a ```fork``` event.

```js
var worker = cluster.fork("arg0","arg1");
```

### .plugin

Load a module as a plugin. The module is loaded by ```require``` so it will be relative to ```cwd```. It must export a function which will be called with the ```Cluster``` object as first argument.

```js
cluster.plugin("./cluster-plugin.js");
```

```js
// contents of ./cluster-plugin.js
module.exports = function(cluster) {
  // do stuff with the Cluster object
};
```


## Worker

The `Worker` class can be extended by adding methods to its prototype.

```js
cluster.cls.Worker.prototype.newMethod = function() {}
```

### Events

The `Worker` class inherits from `EventEmitter`. The following events are available.

 * `messsage` - emitted when the worker receives a message.
 * `exit` - emitted when the worker is killed or the process exists.

### .process

Contains the process object relative to the worker. In the parent process it holds the forked child process. In the child process it holds the global process object.

```js
var isWorker = worker.process === process;
var isMaster = worker.process !== process;
```

### .args

Array containing the arguments passed to the worker when ```cluster.fork``` is called. You can use it to define the role of the workers by example.

```js
var role = worker.args[0];
```

### .send

Sends a message to the other side. The content can be of any type. When the message arrives an ```message``` event will be emitted by the ```Worker``` object. Messages can go both ways.

```js
cluster.master(function() {
  var worker = cluster.fork();
  worker.on("message",function(message) {
    // receives "I'm alive"
  });
  worker.send("Are you alive?");
});

cluster.worker(function(worker) {
  worker.on("message",function(message) {
    // receives "Are you alive?" and sends the answer
    worker.send("Yes, i'm alive!");
  });
});
```

### .plugin

Load a module as a plugin. The module is loaded by ```require``` so it will be relative to ```cwd```. It must export a function which will be called with the ```Worker``` object as first argument.

```js
worker.plugin("./worker-plugin.js");
```

```js
// contents of ./worker-plugin.js
module.exports = function(worker) {
  // do stuff with the Worker object
};
```

### .kill

Kills the worker. In the parent process it kills the process with the passed signal. In the child process it calls ```process.exit``` with the passed exit code.

```js
worker.kill();
worker.kill(code);
worker.kill(signal);
```

## License

MIT
