var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Worker = require('../../lib/worker');
var HttpWorker = require('../../lib/httpworker');
var Stream = require('../../lib/Stream');

describe('## pipeline', function () {
  var worker1;
  var worker2;
  var worker3;

  describe('standard worker', function () {
    beforeEach(function () {
      worker1 = new Worker();
      worker2 = new Worker();
      worker3 = new Worker();
      worker1.process=function(data){worker3.write(data)};
      worker2.process=function(data){worker3.write(data)};
      worker3.process=function(data){worker3.write(data)};
    });

    it('can pipe standard workers together', function (done) {
      worker1.pipe(worker2).pipe(worker3);
      worker1.write({foo:'bar'});
      worker3.on('data', function(data){
        expect(data).to.have.property('foo');
        done();
      });
    });
  });
  
  describe('http worker', function () {
    beforeEach(function () {
      worker1 = new HttpWorker();
      worker2 = new HttpWorker();
      worker3 = new HttpWorker();
      worker1.process=function(data){worker3.emit(data)};
      worker2.process=function(data){worker3.emit(data)};
      worker3.process=function(data){worker3.emit(data)};
      // start
      worker1.init();
      worker2.init();
      worker3.init();
    });

    it('can connect workers together', function (done) {
      
      //connect
      worker2.connect(worker1.config);
      worker3.connect(worker2.config);

      // test
      worker1.write({foo:'bar'});
      worker3.on('data', function(data){
        expect(data).to.have.property('foo');
        done();
      });
    });
  });
});
