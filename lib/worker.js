var Stream = require('./stream');
var util = require('util');
var passThrough = function(data){ 
  this.write(data); 
}

function Worker()
{
  Stream.call(this);
  // so we can initialize the worker with a process function directly
  if (typeof(arguments[0]) === 'function') {
    this.process = arguments[0].bind(this);
    this.config = arguments[1] || {};
  } else {
    this.config = arguments [0] || {}
    this.process = passThrough;
  } 
  this.state = this.config.state || {};
  
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

Worker.prototype.write = function(data){
  this.emit('output', data);
  this.push(data);
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