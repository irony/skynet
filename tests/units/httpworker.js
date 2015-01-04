/*jshint -W030 */
var chai = require('chai');
var sinon = require('sinon');
var request = require('request');
var expect = chai.expect;
chai.use(require('sinon-chai'));

var Worker = require('../../lib/worker');
var HttpWorker = require('../../lib/httpworker');
var Stream = require('../../lib/Stream');

describe('## httpworker', function () {
  var worker;
  var input;

  beforeEach(function () {
    worker = new HttpWorker();
    input = new Stream();
  });

  afterEach(function (done) {
    worker.close(done);
  });

  describe('inheritance', function () {
    it('has inherited worker methods', function () {
      expect(worker).to.have.property('process');
      expect(worker).to.have.property('init');
      expect(worker).to.be.an.instanceof(HttpWorker);
      expect(worker).to.be.an.instanceof(Worker);
    });

    it('handles standard input correctly', function (done) {
      worker.connect(input);
      worker.process = function(data){
        expect(data).to.have.property('foo');
        done();
      }
      input.write({foo:'bar'});
    });
  });

  describe('http server', function () {
    it('starts correctly', function (done) {
      worker.init({foo:'bar'}, done);
      expect(worker).to.have.property('server');
    });

    it('responds to requests', function (done) {
      worker.init({port:1337}, function(err, config){
        expect(err).to.not.exist;
        expect(config.port).to.eql(1337);
        worker.process = sinon.spy();
        request.get('http://localhost:1337')
        .on('error', sinon.spy())
        .on('socket', function(socket){
          expect(socket, 'socket').to.exist;
          expect(socket.destroyed, 'destroyed').to.be.false;
          done();
        });
      });
    });

    it('writes data to output', function (done) {
      worker.init({port:1338}, function(err) {
        expect(err).to.not.exist;
        request.get('http://localhost:1338')
        .on('data', function(data){
          data = JSON.parse(data);
          expect(data, 'data').to.exist;
          expect(data.foo, 'foo').to.be.eql('bar');
          done();
        });
        worker.emit({foo:'bar'});
      });
    });
  });


});
