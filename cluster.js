/*!
**  bauer-cluster -- Just another cluster library.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-cluster>
*/
// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	cp: require("child_process"),
	path: require("path"),
	factory: require("bauer-factory"),
};

// - -------------------------------------------------------------------- - //

// @Worker
var Worker = lib.factory.class({

	inherits: "events.EventEmitter",

	// new Worker(cluster,process,arguments)
	constructor: function(cluster,proc,args) {
		this.cluster = cluster;
		this.id = proc.pid;
		this.process = proc;
		this.args = args;
		this.config = {};
		this.process.on("message",function(message) {
			this.emit("message",message);
		}.bind(this));
		this.process.on("exit",function(code) {
			this.emit("exit",code);
		}.bind(this));
	},

	defaults: {

		// .defaults(config)
		o: function(config) {
			function recurse(source,target) {
				Object.keys(source).forEach(function(key) {
					if (lib.factory.isObject(target[key])) {
						if (lib.factory.isObject(source[key])) {
							recurse(source[key],target[key]);
						}
					} else if (lib.factory.isNull(target[key])) {
						target[key] = source[key];
					}
				});
			}
			recurse(config,this.config);
		},

	},

	configure: {

		// .configure(config)
		o: function(config) {
			function recurse(source,target) {
				Object.keys(source).forEach(function(key) {
					if (lib.factory.isObject(source[key])) {
						if (!lib.factory.isObject(target[key])) {
							target[key] = {};
						}
						recurse(source[key],target[key]);
					} else {
						target[key] = source[key];
					}
				});
			}
			recurse(config,this.config);
		},

	},

	// .require(name)
	require: function(name) {
		var module = require(name);
		if (lib.factory.isFunction(module)) {
			module(this);
		}
	},

	// .kill(signal)
	kill: function(signal) {
		if (this.process === process) {
			this.process.exit(signal);
		} else {
			this.process.kill(signal);
		}
	},

	// .send(message)
	send: function(message) {
		this.process.send(message);
	},

});

// - -------------------------------------------------------------------- - //

// @Cluster
var Cluster = lib.factory.class({

	inherits: "events.EventEmitter",
	constructor: function() {
		this.isWorker = process.argv[2] == "worker";
		this.isMaster = !this.isWorker;
		this.workers = [];
	},

	// .require(name)
	require: function(name) {
		var module = require(name);
		if (lib.factory.isFunction(module)) {
			module(this);
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
			if (lib.factory.isString(arguments[i])) {
				args.push(arguments[i]);
			}
		}
		var file = process.argv[1];
		var child = lib.cp.fork(file,args);
		var worker = new Worker(this,child,args.slice(1));
		worker.on("exit",function() {
			var index = -1;
			this.workers.forEach(function(w,i) {
				if (w.id == worker.id) {
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

exports = new Cluster();

exports.cls = {};
exports.cls.Worker = Worker;
exports.cls.Cluster = Cluster;

module.exports = exports;

// - -------------------------------------------------------------------- - //
