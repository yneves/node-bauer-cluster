// - -------------------------------------------------------------------- - //
// - libs

var cp = require("child_process");
var assert = require("assert");

// - -------------------------------------------------------------------- - //

describe("Cluster",function() {

	it("cluster",function(done) {
		var proc = cp.spawn("node",[__dirname + "/sample/sample.js"],{ stdio: "pipe" });
		var output = "";
		proc.stdout.on("data",function(data) {
			output += data.toString("utf8");
		});
		var error = "";
		proc.stderr.on("data",function(data) {
			error += data.toString("utf8");
		});
		proc.on("exit",function() {
			// assert.equal(error,"");
			// assert.equal(output,"worker.messagehellomaster.messagehimaster.exit");
			done();
		});
	});

});

// - -------------------------------------------------------------------- - //
