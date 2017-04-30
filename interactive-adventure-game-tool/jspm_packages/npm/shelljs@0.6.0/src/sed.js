/* */ 
var common = require('./common');
var fs = require('fs');
function _sed(options, regex, replacement, files) {
  options = common.parseOptions(options, {'i': 'inplace'});
  if (typeof replacement === 'string' || typeof replacement === 'function')
    replacement = replacement;
  else if (typeof replacement === 'number')
    replacement = replacement.toString();
  else
    common.error('invalid replacement string');
  if (typeof regex === 'string')
    regex = RegExp(regex);
  if (!files)
    common.error('no files given');
  if (typeof files === 'string')
    files = [].slice.call(arguments, 3);
  files = common.expand(files);
  var sed = [];
  files.forEach(function(file) {
    if (!fs.existsSync(file)) {
      common.error('no such file or directory: ' + file, true);
      return;
    }
    var result = fs.readFileSync(file, 'utf8').split('\n').map(function(line) {
      return line.replace(regex, replacement);
    }).join('\n');
    sed.push(result);
    if (options.inplace)
      fs.writeFileSync(file, result, 'utf8');
  });
  return common.ShellString(sed.join('\n'));
}
module.exports = _sed;
