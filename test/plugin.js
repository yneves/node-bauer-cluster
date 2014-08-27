module.exports = function(worker) {

  worker.on("request",function(req,res) {
    res.send(req);
  });

  worker.request({ boss: true }).done(function(response) {
    console.log("boss",response);
  });

  worker.request({ boss2: true }).done(function(response) {
    console.log("boss2",response);
    worker.kill();
  });

};
