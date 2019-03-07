(() => {
  'use strict';
  const assert = require('assert');
  const myHello = require('./public_html/index.js');
  describe('Test', function() {
    it('should say hello before something', function() {
      assert.equal(myHello.hello('test'), 'hello test');
    });
  });
})();
