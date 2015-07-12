/*!
**  bauer-cluster -- Just another cluster library.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-cluster>
*/
// - -------------------------------------------------------------------- - //

"use strict";

var Guid = require("guid");
var cp = require("child_process");
var events = require("events");
var factory = require("bauer-factory");

var ClusterWorker = require("./worker.js");

var WORKER_TOKEN = "_WORKER_";

// - -------------------------------------------------------------------- - //


// @Cluster
var Cluster = factory.createClass({

  inherits: events.EventEmitter,
  
  // new Cluster() :Cluster
  constructor: function() {
    this.isWorker = this.getWorkerArgsOffset() > -1;
    this.isMaster = !this.isWorker;
    this.workers = [];
  },
  
  // .getWorkerArgsOffset() :Number
  getWorkerArgsOffset: function() {
    var argv = process.argv;
    var offset = -1;
    var i;
    for (i = 0; i < argv.length; i++) {
      if (argv[i] === WORKER_TOKEN) {
        offset = i + 1;
        break;
      }
    }
    return offset;
  },

  // .require(name)
  require: function(name) {
    var mod = require(name);
    if (factory.isFunction(mod)) {
      mod(this);
    }
  },

  // .master(callback)
  master: {
    f: function(callback) {
      this.on("master",callback);
    },
  },

  // .worker(callback)
  worker: {
    f: function(callback) {
      this.on("worker",callback);
    },
  },

  // .start()
  start: function() {
    if (this.isWorker) {
      var args = process.argv.slice(this.getWorkerArgsOffset());
      var guid = new Guid(args.shift());
      var worker = new ClusterWorker(this,guid,args,process);
      this.emit("worker",worker);
    } else {
      this.emit("master");
    }
  },

  // .fork(arg0, arg1, ...)
  fork: function() {
    
    var argv = process.argv;
    var argvLength = argv.length;
    var argsLength = arguments.length;
    var forkFile = argv[1];
    var forkArgs = [];
    var guid = Guid.create();
    var workerArgs = [];
    var i;
    
    if (argvLength > 2) {
      for (i = 2; i < argvLength; i++) {
        forkArgs.push(argv[i]);
      }
    }
    
    forkArgs.push(WORKER_TOKEN,guid.value);
    
    for (i = 0; i < argsLength; i++) {
      if (factory.isString(arguments[i])) {
        forkArgs.push(arguments[i]);
        workerArgs.push(argv[i]);
      }
    }
    
    var child = cp.fork(forkFile,forkArgs);
    var worker = this.createWorker(guid,workerArgs,child);
    this.emit("fork",worker);
    
    return worker;
  },
  
  // .removeWorker(worker Worker) :void
  removeWorker: function(worker) {
    if (worker instanceof ClusterWorker) {
      var index = -1;
      this.workers.forEach(function(w,i) {
        if (worker.guid.equals(w.guid)) {
          index = i;
        }
      });
      if (index >= 0) {
        this.workers.splice(index,1);
      }
    }
  },
  
  createWorker: {
    
    // .createWorker(guid Guid, args Array) :Worker
    oa: function(guid,args) {
      var worker = new ClusterWorker(this,guid,args);
      this.workers.push(worker);
      worker.on("exit",this.removeWorker.bind(this,worker));
      this.emit("worker",worker);
      return worker;
    },
    
    // .createWorker(guid Guid, args Array, process Object) :Worker
    oao: function(guid,args,proc) {
      var worker = new ClusterWorker(this,guid,args,proc);
      this.workers.push(worker);
      worker.on("exit",this.removeWorker.bind(this,worker));
      return worker;
    }
  }

});

// - -------------------------------------------------------------------- - //

module.exports = Cluster;

// - -------------------------------------------------------------------- - //
