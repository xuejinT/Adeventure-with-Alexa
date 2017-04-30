/* */ 
var common = require('./common');
var fs = require('fs');
function _cat(options, files) {
  var cat = '';
  if (!files)
    common.error('no paths given');
  if (typeof files === 'string')
    files = [].slice.call(arguments, 1);
  files = common.expand(files);
  files.forEach(function(file) {
    if (!fs.existsSync(file))
      common.error('no such file or directory: ' + file);
    cat += fs.readFileSync(file, 'utf8');
  });
  return common.ShellString(cat);
}
module.exports = _cat;
