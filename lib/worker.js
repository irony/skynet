var Stream = require('./stream');
var request = require('request');
var util = require('util');

function Worker(config)
{
  Stream.call(this);
  this.config = config;
  this.process = function(){ throw new Error('Not process method defined'); }
}

util.inherits(Worker, Stream);


Worker.prototype.connect = function(urls){
  var self = this;
  if (!urls.length) urls = [urls];
  urls.map(function(url){
    var input;
    if (typeof(url) === 'string'){
      input = request({ method:'get', uri: url, json:true });
    } else {
      input = url;
    }

    input.on('data', function(data){
      self.process(data);
    });

    if (self.error){
      input.on('error', function(err){
        self.error(err);
      });
    }
  })
}

module.exports = Worker;