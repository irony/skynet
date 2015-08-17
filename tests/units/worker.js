var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var Worker = require('../../lib/worker');
var Stream = require('../../lib/Stream');

describe('## worker', function () {
  var worker;
  var input;

  beforeEach(function () {
    worker = new Worker();
    input = new Stream();
  });

  it('has correct properties', function () {
    expect(worker).to.have.property('process');
    expect(worker).to.have.property('pipe');
    expect(worker).to.not.have.property('server');
  });

  it('handles input correctly', function (done) {
    worker.connect(input);
    worker.process = function(data){
      expect(data).to.have.property('foo');
      done();
    }
    input.write({foo:'bar'});
  });

  it('handles multiple inputs', function (done) {
    var inputs = [new Stream(), new Stream(), new Stream()];
    worker.connect(inputs);
    worker.process = sinon.spy();
    inputs.forEach(function(input, i){
      input.write({ nr : i });
    });
    expect(worker.process).calledThrice;
    done();
  });

});
