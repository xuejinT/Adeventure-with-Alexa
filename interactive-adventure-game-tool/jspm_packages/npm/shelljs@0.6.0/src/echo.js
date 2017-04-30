/* */ 
var common = require('./common');
function _echo() {
  var messages = [].slice.call(arguments, 0);
  console.log.apply(console, messages);
  return common.ShellString(messages.join(' '));
}
module.exports = _echo;
