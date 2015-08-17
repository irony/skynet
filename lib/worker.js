var Stream = require('./stream');
var util = require('util');

function Worker(config)
{
  Stream.call(this);
  this.config = config;
  this.state = {};
  this.process = function(data){ 
    // default to passthrough
    this.write(data); 
  }
}

util.inherits(Worker, Stream);

Worker.prototype.connect = function(inputs){
  var worker = this;
  if (!inputs.length) inputs = [inputs];
  inputs.map(function(input){
    input.on('data', function(data){
      var result = worker.process(data);
      if (result !== undefined){
        worker.write(result);
      }
    });
  })
}

var _pipe = Worker.prototype.pipe;

Worker.prototype.pipe = function(to){
  if ( to instanceof Worker) {
    to.connect(this);
    return to;
  }
  return _pipe.apply(this, arguments);
}



module.exports = Worker;