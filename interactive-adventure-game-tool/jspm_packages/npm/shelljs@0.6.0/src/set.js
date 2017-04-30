/* */ 
var common = require('./common');
function _set(options) {
  if (!options) {
    var args = [].slice.call(arguments, 0);
    if (args.length < 2)
      common.error('must provide an argument');
    options = args[1];
  }
  var negate = (options[0] === '+');
  if (negate) {
    options = '-' + options.slice(1);
  }
  options = common.parseOptions(options, {
    'e': 'fatal',
    'v': 'verbose'
  });
  var key;
  if (negate) {
    for (key in options)
      options[key] = !options[key];
  }
  for (key in options) {
    if (negate !== options[key]) {
      common.config[key] = options[key];
    }
  }
  return;
}
module.exports = _set;
