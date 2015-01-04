var chai = require('chai');
var sinon = require('sinon');
var request = require('request');
var expect = chai.expect;
chai.use(require('sinon-chai'));

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
    try {
      worker.close();
    } catch(e){
      done(e);
    }
    done();
  });

  describe('inheritance', function () {
    it('has inherited worker methods', function () {
      expect(worker).to.have.property('process');
      expect(worker).to.have.property('init');
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

    it('starts server on first emit', function (done) {
      expect(worker).to.not.have.property('server');
      worker.emit({foo:'bar'}, done);
      expect(worker).to.have.property('server');
    });

    it('responds to requests', function (done) {
      worker.init({port:1337}, function(err, config){
        expect(err).to.not.exist;
        expect(config.port).to.eql(1337);
        worker.process = sinon.spy();
        request.get('http://localhost:1337')
        .on('socket', function(socket){
          expect(socket, 'socket').to.exist;
          expect(socket.destroyed, 'destroyed').to.be.false;
          done();
        });
      });
    });
  });


});
