var Stream = require('./stream');
var util = require('util');

function Worker(config)
{
  Stream.call(this);
  this.config = config;
  this.process = function(){ throw new Error('Not process method defined'); }
}

util.inherits(Worker, Stream);

Worker.prototype.listen = function(inputs){
  var worker = this;
  if (!inputs.length) inputs = [inputs];
  inputs.map(function(input){
    input.on('data', function(data){
      worker.process(data);
    });
  })
}

module.exports = Worker;