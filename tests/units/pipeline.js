var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Worker = require('../../lib/worker');
var Stream = require('../../lib/Stream');

describe('## pipeline', function () {
  var worker1;
  var worker2;
  var worker3;
  var input;

  beforeEach(function () {
    worker1 = new Worker();
    worker2 = new Worker();
    worker3 = new Worker();
    worker1.process=function(data){worker3.emit(data)};
    worker2.process=function(data){worker3.emit(data)};
    worker3.process=function(data){worker3.emit(data)};
    input = new Stream();
  });

  it('can pipe workers together', function (done) {
    worker1.pipe(worker2).pipe(worker3);
    worker1.write({foo:'bar'});
    worker3.on('data', function(data){
      expect(data).to.have.property('foo');
      done();
    })

  });
});
