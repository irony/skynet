var Stream = require('stream');
var request = require('request');

function Worker(config)
{
  this.output = new Stream();
  this.config = config;
  this.process = function(){ throw new Error('Not process method defined'); }
}

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

Worker.prototype.emit = function(data){
  this.output.write(data);
}

module.exports = Worker;