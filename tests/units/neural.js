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

describe('## state', function () {
  var input;
  var processor;
  var output;

  describe('math', function () {
    beforeEach(function () {
      input = new Worker();
      processor = new Worker();
      output = new Worker();

    });

    it('can remember state', function(done){
      
      //connect
      input.pipe(processor).pipe(output);

      processor.state.sum = 0;

      processor.process =  function(number){
      	this.state.sum += number;
      	if (this.state.sum >= 10) {
      	  this.write(this.state.sum);
      	}
      }

      var spy = sinon.spy();
      output.on('data', spy);

      // test
      input.write(5);
      input.write(5);

      // verify
      expect(spy).calledWith(10);
	    done();
    });

  });
});
