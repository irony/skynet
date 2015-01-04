var stream = require('stream');
var util = require('util');

function Stream() {
  stream.PassThrough.call(this, { objectMode: true });
  return this;
}

util.inherits(Stream, stream.PassThrough);

module.exports = Stream;