var http = require('http');
var Worker = require('./worker');
var request = require('request');
var util = require('util');
var nextPort = 2011+4+19; // april 19 2011 Skynet was first implemented

function HttpWorker(config){
  Worker.call(this, config);
  this.clients = [];
  //this.init(config, done);
}
util.inherits(HttpWorker, Worker);


HttpWorker.prototype.write = function(data, done){
  var worker = this;
  if (!this.server) {
    worker.init(worker.config, function(){
      worker.push(data);
      return done && done();
    });
  } else {
    worker.push(data);
    return done && done();
  }
}

HttpWorker.prototype.init = function(config, done){
  var worker = this;
  worker.server = http.createServer(function (req, res) {
    worker.clients.push(res); // so we can disconnect them later
    worker.on('data', function(data){
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
  worker.server.timeout=worker.config.timeout || 0;
  worker.server.listen(worker.config.port, worker.config.host, function(err){
    return done && done(err, config);
  });
}


Worker.prototype.connect = function(urls){
  var worker = this;
  if (!urls.length) urls = [urls];
  urls.map(function(url){
    // so you can write worker2.connect(worker1);
    if (url.config) url = url.config;
    // url === config
    if (url.port && url.host) url = 'http://' + url.host + ':' + url.port;

    var input;
    input = request.get({url:url, json:true});
    input.on('data', function(data){
      worker.process(JSON.parse(data.toString()));
    });
  })
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

