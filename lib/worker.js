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

  // new Worker(cluster Cluster, uuid String, args Array, process Object) :Worker
  constructor: function(cluster,uuid,args,proc) {
    this.cluster = cluster;
    this.args = args;
    this.dead = false;
    
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
    this.process.on("exit",this.die.bind(this));
    this.process.on("error",this.die.bind(this));
    this.process.on("message",this.receive.bind(this));
  },

  // .require(name String) :void
  require: function(name) {
    var mod = require(name);
    if (factory.isFunction(mod)) {
      mod(this);
    }
  },

  // .kill(signal Number) :void
  kill: function(signal) {
    if (this.process === process) {
      this.process.exit(signal);
    } else if (this.process) {
      this.process.kill(signal);
    } else {
      this.die(signal);
    }
  },
  
  // .die(reason Number|Error) :void
  die: function(reason) {
    if (!this.dead) {
      this.emit("exit",reason);
      this.dead = true;
    }
  },

  send: {
    
    // .send(message Object) :void
    o: function(message) {
      if (this.process) {
        this.process.send({
          to: this.uuid,
          message: message
        });
      } else {
        this.emit("message",message);
      }
    }
  },
  
  // .receive(message Object) :void
  receive: function(message) {
    if (factory.isObject(message)) {
      if (this.uuid === message.to) {
        if (factory.isObject(message.message)) {
          this.emit("message",message.message);
        } else {
          this.emit("unkown",message);
        }
      }
    }
  }

});

// - -------------------------------------------------------------------- - //

module.exports = ClusterWorker;

// - -------------------------------------------------------------------- - //
