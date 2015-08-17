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
    input = new HttpWorker();
    input.init();
  });

  afterEach(function (done) {
    input.close(worker.close.bind(worker, done));
  });

  describe('inheritance', function () {
    it('has inherited worker methods', function () {
      expect(worker).to.have.property('process');
      expect(worker).to.have.property('init');
      expect(worker).to.have.property('write');
      expect(worker).to.be.an.instanceof(HttpWorker);
      expect(worker).to.be.an.instanceof(Worker);
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
        worker.write({foo:'bar'});
      });
    });

    it('passes data from input to connection', function (done) {
      worker.init({port:1339}, function() {
        request.get('http://localhost:1339')
        .on('data', function(data){
          data = JSON.parse(data);
          expect(data, 'data').to.exist;
          expect(data.foo, 'foo').to.be.eql('bar');
          done();
        });
        worker.process = function(data){
          worker.write(data); // passthrough
        }
        worker.connect(input);
        input.write({foo:'bar'});
      });
    });

  });

});
