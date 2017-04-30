/* */ 
(function(process) {
  var path = require('path');
  var common = require('./common');
  function _pwd() {
    var pwd = path.resolve(process.cwd());
    return common.ShellString(pwd);
  }
  module.exports = _pwd;
})(require('process'));
