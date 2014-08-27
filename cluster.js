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

function guid() {
	var uid = "";
	for (var i = 0; i < 8 ; i++) {
		uid += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return uid;
}

// - -------------------------------------------------------------------- - //

var Response = lib.factory.class({
	inherits: "events.EventEmitter",
	constructor: function(worker,id) {
		this.worker = worker;
		this.id = id;
	},
	send: function(response) {
		this.worker.send({
			id: this.id,
			response: response,
		});
	},
});

// - -------------------------------------------------------------------- - //

var Request = lib.factory.class({
	inherits: "events.EventEmitter",
	constructor: function(worker) {
		this.id = guid();
		this.worker = worker;
	},
	send: function(request) {
		this.worker.send({
			id: this.id,
			request: request,
		});
		var wait = function(message) {
			if (lib.factory.isObject(message) && message.id === this.id) {
				this.emit("done",message.response);
				this.worker.removeListener("message",wait);
			}
		}.bind(this);
		this.worker.on("message",wait);
	},
	done: {
		f: function(callback) {
			this.on("done",callback);
		},
	},
});

// - -------------------------------------------------------------------- - //

var Worker = lib.factory.class({

	inherits: "events.EventEmitter",

	constructor: function(proc,args) {
		this.id = proc.pid;
		this.process = proc;
		this.args = args;

		this.process.on("message",function(message) {
			this.emit("message",message);
			if (lib.factory.isObject(message) && lib.factory.isString(message.id)) {
				var response = new Response(this,message.id);
				this.emit("request",message.request,response);
			}
		}.bind(this));

		this.process.on("exit",function(code) {
			this.emit("exit",code);
		}.bind(this));

	},

	require: function(name) {
		var module = require(name);
		if (lib.factory.isFunction(module)) {
			module(this);
		}
	},

	kill: function(signal) {
		if (this.process === process) {
			this.process.exit(signal);
		} else {
			this.process.kill(signal);
		}
	},

	send: function(message) {
		this.process.send(message);
	},

	request: {

		0: function() {
			return new Request(this);
		},

		1: function(params) {
			var request = new Request(this);
			request.send(params);
			return request;
		},

	},

});

// - -------------------------------------------------------------------- - //

var cluster = lib.factory.object({

	inherits: "events.EventEmitter",

	constructor: function() {
		this.isWorker = process.argv[2] == "worker";
		this.isMaster = !this.isWorker;
		this.workers = [];
	},

	master: {
		f: function(callback) {
			this.on("master",callback);
		},
	},

	worker: {
		f: function(callback) {
			this.on("worker",callback);
		},
	},

	start: function() {
		if (this.isWorker) {
			var args = process.argv.slice(3);
			var worker = new Worker(process,args);
			this.emit("worker",worker);
		} else {
			this.emit("master");
		}
	},

	fork: function() {
		var args = ["worker"];
		var len = arguments.length;
		for (var i = 0; i < len; i++) {
			if (typeof arguments[i] == "string") {
				args.push(arguments[i]);
			}
		}
		var file = process.argv[1];
		var child = lib.cp.fork(file,args);
		var worker = new Worker(child,args);
		worker.on("exit",function() {
			var index = -1;
			this.workers.forEach(function(w,i) {
				if (w.id == worker.id) {
					index = i;
				}
			});
			if (index >= 0) {
				this.workers.splice(index,1);
				worker.emit("exit");
			}
		}.bind(this));
		this.workers.push(worker);
		return worker;
	},


});

// - -------------------------------------------------------------------- - //

module.exports = cluster;

// - -------------------------------------------------------------------- - //
