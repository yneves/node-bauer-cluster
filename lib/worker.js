/*!
**  bauer-cluster -- Just another cluster library.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-cluster>
*/
// - -------------------------------------------------------------------- - //

"use strict";

var events = require("events");
var factory = require("bauer-factory");

// - -------------------------------------------------------------------- - //

var Worker = factory.class({

	inherits: events.EventEmitter,

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
					if (factory.isObject(target[key])) {
						if (factory.isObject(source[key])) {
							recurse(source[key],target[key]);
						}
					} else if (!factory.isDefined(target[key])) {
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
					if (factory.isObject(source[key])) {
						if (!factory.isObject(target[key])) {
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
		var mod = require(name);
		if (factory.isFunction(mod)) {
			mod(this);
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

module.exports = Worker;

// - -------------------------------------------------------------------- - //
