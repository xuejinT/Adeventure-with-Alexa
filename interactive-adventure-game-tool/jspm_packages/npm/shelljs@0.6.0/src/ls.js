/* */ 
var path = require('path');
var fs = require('fs');
var common = require('./common');
var _cd = require('./cd');
var _pwd = require('./pwd');
function _ls(options, paths) {
  options = common.parseOptions(options, {
    'R': 'recursive',
    'A': 'all',
    'a': 'all_deprecated',
    'd': 'directory',
    'l': 'long'
  });
  if (options.all_deprecated) {
    common.log('ls: Option -a is deprecated. Use -A instead');
    options.all = true;
  }
  if (!paths)
    paths = ['.'];
  else if (typeof paths === 'object')
    paths = paths;
  else if (typeof paths === 'string')
    paths = [].slice.call(arguments, 1);
  var list = [];
  function pushFile(file, query) {
    var name = file.name || file;
    if (path.basename(name)[0] === '.') {
      if (!options.all && !(path.basename(query)[0] === '.' && path.basename(query).length > 1))
        return false;
    }
    if (common.platform === 'win')
      name = name.replace(/\\/g, '/');
    if (file.name) {
      file.name = name;
    } else {
      file = name;
    }
    list.push(file);
    return true;
  }
  paths.forEach(function(p) {
    if (fs.existsSync(p)) {
      var stats = ls_stat(p);
      if (stats.isFile()) {
        if (options.long) {
          pushFile(stats, p);
        } else {
          pushFile(p, p);
        }
        return;
      }
      if (options.directory) {
        pushFile(p, p);
        return;
      } else if (stats.isDirectory()) {
        fs.readdirSync(p).forEach(function(file) {
          var orig_file = file;
          if (options.long)
            file = ls_stat(path.join(p, file));
          if (!pushFile(file, p))
            return;
          if (options.recursive) {
            var oldDir = _pwd();
            _cd('', p);
            if (fs.statSync(orig_file).isDirectory())
              list = list.concat(_ls('-R' + (options.all ? 'A' : ''), orig_file + '/*'));
            _cd('', oldDir);
          }
        });
        return;
      }
    }
    var basename = path.basename(p);
    var dirname = path.dirname(p);
    if (basename.search(/\*/) > -1 && fs.existsSync(dirname) && fs.statSync(dirname).isDirectory) {
      var regexp = basename.replace(/(\^|\$|\(|\)|<|>|\[|\]|\{|\}|\.|\+|\?)/g, '\\$1');
      regexp = '^' + regexp.replace(/\*/g, '.*') + '$';
      fs.readdirSync(dirname).forEach(function(file) {
        if (file.match(new RegExp(regexp))) {
          var file_path = path.join(dirname, file);
          file_path = options.long ? ls_stat(file_path) : file_path;
          if (file_path.name)
            file_path.name = path.normalize(file_path.name);
          else
            file_path = path.normalize(file_path);
          if (!pushFile(file_path, basename))
            return;
          if (options.recursive) {
            var pp = dirname + '/' + file;
            if (fs.lstatSync(pp).isDirectory())
              list = list.concat(_ls('-R' + (options.all ? 'A' : ''), pp + '/*'));
          }
        }
      });
      return;
    }
    common.error('no such file or directory: ' + p, true);
  });
  return list;
}
module.exports = _ls;
function ls_stat(path) {
  var stats = fs.statSync(path);
  stats.name = path;
  stats.toString = function() {
    return [this.mode, this.nlink, this.uid, this.gid, this.size, this.mtime, this.name].join(' ');
  };
  return stats;
}
