/*!
**  bauer-cluster -- Just another cluster library.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-cluster>
*/
// - -------------------------------------------------------------------- - //

"use strict";

var Cluster = require("./cluster.js");
var ClusterWorker = require("./worker.js");

module.exports = {
  Worker: ClusterWorker,
  Cluster: Cluster
};

// - -------------------------------------------------------------------- - //
