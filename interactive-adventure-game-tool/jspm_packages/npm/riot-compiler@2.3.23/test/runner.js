/* */ 
describe('Compiler Tests', function() {
  expect = require('expect.js');
  compiler = require('../lib/compiler');
  require('./specs/html');
  require('./specs/css');
  require('./specs/js');
  require('./specs/tag');
  require('./specs/parsers/_suite');
});
