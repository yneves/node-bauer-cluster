/*!
**  bauer-cluster -- Just another cluster library.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-cluster>
*/
// - -------------------------------------------------------------------- - //

"use strict";

var cp = require("child_process");
var events = require("events");
var factory = require("bauer-factory");

var Worker = require("./worker.js");

// - -------------------------------------------------------------------- - //


// @Cluster
var Cluster = factory.class({

	inherits: events.EventEmitter,
  
	constructor: function() {
		this.isWorker = process.argv[2] === "worker";
		this.isMaster = !this.isWorker;
		this.workers = [];
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
			var args = process.argv.slice(3);
			var worker = new Worker(this,process,args);
			this.emit("worker",worker);
		} else {
			this.emit("master");
		}
	},

	// .fork(arg0, arg1, ...)
	fork: function() {
		var args = ["worker"];
		var len = arguments.length;
		for (var i = 0; i < len; i++) {
			if (factory.isString(arguments[i])) {
				args.push(arguments[i]);
			}
		}
		var file = process.argv[1];
		var child = cp.fork(file,args);
		var worker = new Worker(this,child,args.slice(1));
		worker.on("exit",function() {
			var index = -1;
			this.workers.forEach(function(w,i) {
				if (w.id === worker.id) {
					index = i;
				}
			});
			if (index >= 0) {
				this.workers.splice(index,1);
			}
		}.bind(this));
		this.workers.push(worker);
		this.emit("fork",worker);
		return worker;
	},

});

// - -------------------------------------------------------------------- - //

module.exports = Cluster;

// - -------------------------------------------------------------------- - //
