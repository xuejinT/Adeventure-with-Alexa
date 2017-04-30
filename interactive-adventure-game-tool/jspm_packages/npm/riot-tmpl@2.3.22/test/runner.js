/* */ 
var isNode = typeof window === 'undefined';
describe('Observable Tests', function() {
  if (isNode) {
    expect = require('expect.js');
    tmpl = require('../dist/tmpl').tmpl;
    brackets = require('../dist/tmpl').brackets;
    require('./specs/core.specs');
    require('./specs/brackets.specs');
  }
});
