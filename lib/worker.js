/*!
**  bauer-cluster -- Just another cluster library.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-cluster>
*/
// - -------------------------------------------------------------------- - //

"use strict";

var Guid = require("guid");
var events = require("events");
var factory = require("bauer-factory");

// - -------------------------------------------------------------------- - //

var ClusterWorker = factory.createClass({

  inherits: events.EventEmitter,

  // new ClusterWorker(cluster Cluster, args Array, process Object) :Worker
  constructor: function(cluster,guid,args,proc) {
    this.cluster = cluster;
    this.args = args;
    
    if (Guid.isGuid(guid)) {
      this.guid = guid;
    } else {
      throw new Error("invalid guid");
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
        if (this.guid.equals(message.to)) {
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
        to: this.guid.value,
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
