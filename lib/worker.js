/*!
**  bauer-cluster -- Just another cluster library.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-cluster>
*/
// - -------------------------------------------------------------------- - //

"use strict";

var UUID = require("node-uuid");
var events = require("events");
var factory = require("bauer-factory");

// - -------------------------------------------------------------------- - //

var ClusterWorker = factory.createClass({

  inherits: events.EventEmitter,

  // new ClusterWorker(cluster Cluster, uuid String, args Array, process Object) :Worker
  constructor: function(cluster,uuid,args,proc) {
    this.cluster = cluster;
    this.args = args;
    
    if (uuid) {
      this.uuid = uuid;
    } else {
      this.uuid = UUID.v4();
    }
    
    if (factory.isDefined(proc)) {
      this.setupProcess(proc);
    }
  },
  
  // .setupProcess(proc) :void
  setupProcess: function(proc) {
    this.process = proc;
    this.process.on("message",function(message) {
      if (factory.isObject(message)) {
        if (this.uuid === message.to) {
          this.emit("message",message.message);
        }
      }
    }.bind(this));
    this.process.on("exit",function(code) {
      this.emit("exit",code);
    }.bind(this));
  },

  // .require(name)
  require: function(name) {
    var mod = require(name);
    if (factory.isFunction(mod)) {
      mod(this);
    }
  },

  // .kill(signal)
  kill: function(signal) {
    if (this.process === process) {
      this.process.exit(signal);
    } else if (this.process) {
      this.process.kill(signal);
    } else {
      this.emit("exit",signal);
    }
  },

  // .send(message)
  send: function(message) {
    if (this.process) {
      this.process.send({
        to: this.uuid,
        message: message
      });
    } else {
      this.emit("message",message);
    }
  },

});

// - -------------------------------------------------------------------- - //

module.exports = ClusterWorker;

// - -------------------------------------------------------------------- - //
