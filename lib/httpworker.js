var http = require('http');
var Worker = require('./worker');
var util = require('util');
var nextPort = 2011+4+19; // april 19 2011 Skynet was first implemented

function HttpWorker(config){
  Worker.call(this, config);
  this.clients = [];
  //this.init(config, done);
}
util.inherits(HttpWorker, Worker);


HttpWorker.prototype.emit = function(data, done){
  var worker = this;
  if (!this.server) {
    worker.init(worker.config, function(){
      worker.output.write(data);
      return done && done();
    });
  } else {
    worker.output.write(data);
    return done && done();
  }
}

HttpWorker.prototype.init = function(config, done){
  var worker = this;
  worker.server = http.createServer(function (req, res) {
    worker.clients.push(res);
    worker.output.on('data', function(data){
      if (typeof data === 'object') {
        res.write(JSON.stringify(data, null, 2));
      } else{
        res.write(data);
      }
    });
    // worker.input.pipe(res);
  });
  
  
  worker.config = config || worker.config || {};
  worker.config.port = worker.config.port || nextPort++;
  worker.config.host = worker.config.host || '127.0.0.1';
  worker.server.timeout=config.timeout || 0;
  worker.server.listen(worker.config.port, worker.config.host, function(err){
    return done && done(err, config);
  });
}

HttpWorker.prototype.close = function(done){
  if (this.server){
    this.clients.map(function(res){
      res.end();
    });
    this.server.close(done);
  } else {
    done();
  }
}

module.exports = HttpWorker;

