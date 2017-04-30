/* */ 
(function(process) {
  var common = require('./common');
  var fs = require('fs');
  var path = require('path');
  var XP_DEFAULT_PATHEXT = '.com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh';
  function splitPath(p) {
    if (!p)
      return [];
    if (common.platform === 'win')
      return p.split(';');
    else
      return p.split(':');
  }
  function checkPath(path) {
    return fs.existsSync(path) && !fs.statSync(path).isDirectory();
  }
  function _which(options, cmd) {
    if (!cmd)
      common.error('must specify command');
    var pathEnv = process.env.path || process.env.Path || process.env.PATH,
        pathArray = splitPath(pathEnv),
        where = null;
    if (cmd.search(/\//) === -1) {
      pathArray.forEach(function(dir) {
        if (where)
          return;
        var attempt = path.resolve(dir, cmd);
        if (common.platform === 'win') {
          attempt = attempt.toUpperCase();
          var pathExtEnv = process.env.PATHEXT || XP_DEFAULT_PATHEXT;
          var pathExtArray = splitPath(pathExtEnv.toUpperCase());
          var i;
          for (i = 0; i < pathExtArray.length; i++) {
            var ext = pathExtArray[i];
            if (attempt.slice(-ext.length) === ext && checkPath(attempt)) {
              where = attempt;
              return;
            }
          }
          var baseAttempt = attempt;
          for (i = 0; i < pathExtArray.length; i++) {
            attempt = baseAttempt + pathExtArray[i];
            if (checkPath(attempt)) {
              where = attempt;
              return;
            }
          }
        } else {
          if (checkPath(attempt)) {
            where = attempt;
            return;
          }
        }
      });
    }
    if (!checkPath(cmd) && !where)
      return null;
    where = where || path.resolve(cmd);
    return common.ShellString(where);
  }
  module.exports = _which;
})(require('process'));