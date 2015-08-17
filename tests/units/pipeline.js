var Promise = require('promise');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Worker = require('../../lib/worker');
var HttpWorker = require('../../lib/httpworker');
var Stream = require('../../lib/Stream');

var passThrough = function(data){ this.write(data); };

describe('## pipeline', function () {
  var worker1;
  var worker2;
  var worker3;

  describe('standard worker', function () {
    beforeEach(function () {
      worker1 = new Worker();
      worker2 = new Worker();
      worker3 = new Worker();
      worker1.process=passThrough;
      worker2.process=passThrough;
      worker3.process=passThrough;
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
      worker1.process=passThrough;
      worker2.process=passThrough;
      worker3.process=passThrough;
      // start
      worker1.init();
      worker2.init();
      worker3.init();
    });

    afterEach(function (done) {
      Promise.all([worker1.close(), worker2.close(), worker3.close()]).then(function(){
        done();
      });
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

    it('can pipe output', function(done){
      
      //connect
      worker1.pipe(worker2).pipe(worker3);

      // test
      worker1.write({foo:'bar'});
      worker3.on('data', function(data){
        expect(data).to.have.property('foo');
        done();
      });
    });

    it('can change data', function(done){
      
      //connect
      worker1.pipe(worker2).pipe(worker3)

      // test
      worker1.write({foo:'bar'});
      worker2.process = function(data){
        data.changed = true;
        this.write(data);
      }
      worker3.on('data', function(data){
        expect(data).to.have.property('foo');
        expect(data).to.have.property('changed');
        done();
      });
    });

    it('closes the ports correctly', function (done) {
      
      var worker = new HttpWorker({port:9999});
      worker.init();
      worker.close(function(){
        var reuse = new HttpWorker({port:9999});
        reuse.close(done);
      })
    });
  });
});
