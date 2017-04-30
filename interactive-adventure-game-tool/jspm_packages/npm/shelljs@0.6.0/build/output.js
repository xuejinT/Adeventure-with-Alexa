/* */ 
(function(Buffer, process) {
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
  var fs = require('fs');
  var common = require('./common');
  function _cd(options, dir) {
    if (!dir)
      dir = common.getUserHome();
    if (dir === '-') {
      if (!common.state.previousDir)
        common.error('could not find previous directory');
      else
        dir = common.state.previousDir;
    }
    if (!fs.existsSync(dir))
      common.error('no such file or directory: ' + dir);
    if (!fs.statSync(dir).isDirectory())
      common.error('not a directory: ' + dir);
    common.state.previousDir = process.cwd();
    process.chdir(dir);
  }
  module.exports = _cd;
  var common = require('./common');
  var fs = require('fs');
  var path = require('path');
  var PERMS = (function(base) {
    return {
      OTHER_EXEC: base.EXEC,
      OTHER_WRITE: base.WRITE,
      OTHER_READ: base.READ,
      GROUP_EXEC: base.EXEC << 3,
      GROUP_WRITE: base.WRITE << 3,
      GROUP_READ: base.READ << 3,
      OWNER_EXEC: base.EXEC << 6,
      OWNER_WRITE: base.WRITE << 6,
      OWNER_READ: base.READ << 6,
      STICKY: parseInt('01000', 8),
      SETGID: parseInt('02000', 8),
      SETUID: parseInt('04000', 8),
      TYPE_MASK: parseInt('0770000', 8)
    };
  })({
    EXEC: 1,
    WRITE: 2,
    READ: 4
  });
  function _chmod(options, mode, filePattern) {
    if (!filePattern) {
      if (options.length > 0 && options.charAt(0) === '-') {
        filePattern = mode;
        mode = options;
        options = '';
      } else {
        common.error('You must specify a file.');
      }
    }
    options = common.parseOptions(options, {
      'R': 'recursive',
      'c': 'changes',
      'v': 'verbose'
    });
    if (typeof filePattern === 'string') {
      filePattern = [filePattern];
    }
    var files;
    if (options.recursive) {
      files = [];
      common.expand(filePattern).forEach(function addFile(expandedFile) {
        var stat = fs.lstatSync(expandedFile);
        if (!stat.isSymbolicLink()) {
          files.push(expandedFile);
          if (stat.isDirectory()) {
            fs.readdirSync(expandedFile).forEach(function(child) {
              addFile(expandedFile + '/' + child);
            });
          }
        }
      });
    } else {
      files = common.expand(filePattern);
    }
    files.forEach(function innerChmod(file) {
      file = path.resolve(file);
      if (!fs.existsSync(file)) {
        common.error('File not found: ' + file);
      }
      if (options.recursive && fs.lstatSync(file).isSymbolicLink()) {
        return;
      }
      var stat = fs.statSync(file);
      var isDir = stat.isDirectory();
      var perms = stat.mode;
      var type = perms & PERMS.TYPE_MASK;
      var newPerms = perms;
      if (isNaN(parseInt(mode, 8))) {
        mode.split(',').forEach(function(symbolicMode) {
          var pattern = /([ugoa]*)([=\+-])([rwxXst]*)/i;
          var matches = pattern.exec(symbolicMode);
          if (matches) {
            var applyTo = matches[1];
            var operator = matches[2];
            var change = matches[3];
            var changeOwner = applyTo.indexOf('u') != -1 || applyTo === 'a' || applyTo === '';
            var changeGroup = applyTo.indexOf('g') != -1 || applyTo === 'a' || applyTo === '';
            var changeOther = applyTo.indexOf('o') != -1 || applyTo === 'a' || applyTo === '';
            var changeRead = change.indexOf('r') != -1;
            var changeWrite = change.indexOf('w') != -1;
            var changeExec = change.indexOf('x') != -1;
            var changeExecDir = change.indexOf('X') != -1;
            var changeSticky = change.indexOf('t') != -1;
            var changeSetuid = change.indexOf('s') != -1;
            if (changeExecDir && isDir)
              changeExec = true;
            var mask = 0;
            if (changeOwner) {
              mask |= (changeRead ? PERMS.OWNER_READ : 0) + (changeWrite ? PERMS.OWNER_WRITE : 0) + (changeExec ? PERMS.OWNER_EXEC : 0) + (changeSetuid ? PERMS.SETUID : 0);
            }
            if (changeGroup) {
              mask |= (changeRead ? PERMS.GROUP_READ : 0) + (changeWrite ? PERMS.GROUP_WRITE : 0) + (changeExec ? PERMS.GROUP_EXEC : 0) + (changeSetuid ? PERMS.SETGID : 0);
            }
            if (changeOther) {
              mask |= (changeRead ? PERMS.OTHER_READ : 0) + (changeWrite ? PERMS.OTHER_WRITE : 0) + (changeExec ? PERMS.OTHER_EXEC : 0);
            }
            if (changeSticky) {
              mask |= PERMS.STICKY;
            }
            switch (operator) {
              case '+':
                newPerms |= mask;
                break;
              case '-':
                newPerms &= ~mask;
                break;
              case '=':
                newPerms = type + mask;
                if (fs.statSync(file).isDirectory()) {
                  newPerms |= (PERMS.SETUID + PERMS.SETGID) & perms;
                }
                break;
            }
            if (options.verbose) {
              console.log(file + ' -> ' + newPerms.toString(8));
            }
            if (perms != newPerms) {
              if (!options.verbose && options.changes) {
                console.log(file + ' -> ' + newPerms.toString(8));
              }
              fs.chmodSync(file, newPerms);
              perms = newPerms;
            }
          } else {
            common.error('Invalid symbolic mode change: ' + symbolicMode);
          }
        });
      } else {
        newPerms = type + parseInt(mode, 8);
        if (fs.statSync(file).isDirectory()) {
          newPerms |= (PERMS.SETUID + PERMS.SETGID) & perms;
        }
        fs.chmodSync(file, newPerms);
      }
    });
  }
  module.exports = _chmod;
  var os = require('os');
  var fs = require('fs');
  var _ls = require('./ls');
  var config = {
    silent: false,
    fatal: false,
    verbose: false
  };
  exports.config = config;
  var state = {
    error: null,
    currentCmd: 'shell.js',
    previousDir: null,
    tempDir: null
  };
  exports.state = state;
  var platform = os.type().match(/^Win/) ? 'win' : 'unix';
  exports.platform = platform;
  function log() {
    if (!config.silent)
      console.error.apply(console, arguments);
  }
  exports.log = log;
  function error(msg, _continue) {
    if (state.error === null)
      state.error = '';
    var log_entry = state.currentCmd + ': ' + msg;
    if (state.error === '')
      state.error = log_entry;
    else
      state.error += '\n' + log_entry;
    if (msg.length > 0)
      log(log_entry);
    if (config.fatal)
      process.exit(1);
    if (!_continue)
      throw '';
  }
  exports.error = error;
  function ShellString(str) {
    return str;
  }
  exports.ShellString = ShellString;
  function getUserHome() {
    var result;
    if (os.homedir)
      result = os.homedir();
    else
      result = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    return result;
  }
  exports.getUserHome = getUserHome;
  function parseOptions(str, map) {
    if (!map)
      error('parseOptions() internal error: no map given');
    var options = {};
    for (var letter in map) {
      if (!map[letter].match('^!'))
        options[map[letter]] = false;
    }
    if (!str)
      return options;
    if (typeof str !== 'string')
      error('parseOptions() internal error: wrong str');
    var match = str.match(/^\-(.+)/);
    if (!match)
      return options;
    var chars = match[1].split('');
    var opt;
    chars.forEach(function(c) {
      if (c in map) {
        opt = map[c];
        if (opt.match('^!'))
          options[opt.slice(1, opt.length - 1)] = false;
        else
          options[opt] = true;
      } else {
        error('option not recognized: ' + c);
      }
    });
    return options;
  }
  exports.parseOptions = parseOptions;
  function expand(list) {
    var expanded = [];
    list.forEach(function(listEl) {
      if (listEl.search(/\*[^\/]*\//) > -1 || listEl.search(/\*\*[^\/]*\//) > -1) {
        var match = listEl.match(/^([^*]+\/|)(.*)/);
        var root = match[1];
        var rest = match[2];
        var restRegex = rest.replace(/\*\*/g, ".*").replace(/\*/g, "[^\\/]*");
        restRegex = new RegExp(restRegex);
        _ls('-R', root).filter(function(e) {
          return restRegex.test(e);
        }).forEach(function(file) {
          expanded.push(file);
        });
      } else if (listEl.search(/\*/) > -1) {
        _ls('', listEl).forEach(function(file) {
          expanded.push(file);
        });
      } else {
        expanded.push(listEl);
      }
    });
    return expanded;
  }
  exports.expand = expand;
  function unlinkSync(file) {
    try {
      fs.unlinkSync(file);
    } catch (e) {
      if (e.code === 'EPERM') {
        fs.chmodSync(file, '0666');
        fs.unlinkSync(file);
      } else {
        throw e;
      }
    }
  }
  exports.unlinkSync = unlinkSync;
  function randomFileName() {
    function randomHash(count) {
      if (count === 1)
        return parseInt(16 * Math.random(), 10).toString(16);
      else {
        var hash = '';
        for (var i = 0; i < count; i++)
          hash += randomHash(1);
        return hash;
      }
    }
    return 'shelljs_' + randomHash(20);
  }
  exports.randomFileName = randomFileName;
  function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var key in source)
        target[key] = source[key];
    });
    return target;
  }
  exports.extend = extend;
  function wrap(cmd, fn, options) {
    return function() {
      var retValue = null;
      state.currentCmd = cmd;
      state.error = null;
      try {
        var args = [].slice.call(arguments, 0);
        if (config.verbose) {
          args.unshift(cmd);
          console.log.apply(console, args);
          args.shift();
        }
        if (options && options.notUnix) {
          retValue = fn.apply(this, args);
        } else {
          if (args.length === 0 || typeof args[0] !== 'string' || args[0].length <= 1 || args[0][0] !== '-')
            args.unshift('');
          var homeDir = getUserHome();
          args = args.map(function(arg) {
            if (typeof arg === 'string' && arg.slice(0, 2) === '~/' || arg === '~')
              return arg.replace(/^~/, homeDir);
            else
              return arg;
          });
          retValue = fn.apply(this, args);
        }
      } catch (e) {
        if (!state.error) {
          console.log('shell.js: internal error');
          console.log(e.stack || e);
          process.exit(1);
        }
        if (config.fatal)
          throw e;
      }
      state.currentCmd = 'shell.js';
      return retValue;
    };
  }
  exports.wrap = wrap;
  var fs = require('fs');
  var path = require('path');
  var common = require('./common');
  var os = require('os');
  function copyFileSync(srcFile, destFile) {
    if (!fs.existsSync(srcFile))
      common.error('copyFileSync: no such file or directory: ' + srcFile);
    var BUF_LENGTH = 64 * 1024,
        buf = new Buffer(BUF_LENGTH),
        bytesRead = BUF_LENGTH,
        pos = 0,
        fdr = null,
        fdw = null;
    try {
      fdr = fs.openSync(srcFile, 'r');
    } catch (e) {
      common.error('copyFileSync: could not read src file (' + srcFile + ')');
    }
    try {
      fdw = fs.openSync(destFile, 'w');
    } catch (e) {
      common.error('copyFileSync: could not write to dest file (code=' + e.code + '):' + destFile);
    }
    while (bytesRead === BUF_LENGTH) {
      bytesRead = fs.readSync(fdr, buf, 0, BUF_LENGTH, pos);
      fs.writeSync(fdw, buf, 0, bytesRead);
      pos += bytesRead;
    }
    fs.closeSync(fdr);
    fs.closeSync(fdw);
    fs.chmodSync(destFile, fs.statSync(srcFile).mode);
  }
  function cpdirSyncRecursive(sourceDir, destDir, opts) {
    if (!opts)
      opts = {};
    var checkDir = fs.statSync(sourceDir);
    try {
      fs.mkdirSync(destDir, checkDir.mode);
    } catch (e) {
      if (e.code !== 'EEXIST')
        throw e;
    }
    var files = fs.readdirSync(sourceDir);
    for (var i = 0; i < files.length; i++) {
      var srcFile = sourceDir + "/" + files[i];
      var destFile = destDir + "/" + files[i];
      var srcFileStat = fs.lstatSync(srcFile);
      if (srcFileStat.isDirectory()) {
        cpdirSyncRecursive(srcFile, destFile, opts);
      } else if (srcFileStat.isSymbolicLink()) {
        var symlinkFull = fs.readlinkSync(srcFile);
        fs.symlinkSync(symlinkFull, destFile, os.platform() === "win32" ? "junction" : null);
      } else {
        if (fs.existsSync(destFile) && opts.no_force) {
          common.log('skipping existing file: ' + files[i]);
        } else {
          copyFileSync(srcFile, destFile);
        }
      }
    }
  }
  function _cp(options, sources, dest) {
    options = common.parseOptions(options, {
      'f': '!no_force',
      'n': 'no_force',
      'R': 'recursive',
      'r': 'recursive'
    });
    if (arguments.length < 3) {
      common.error('missing <source> and/or <dest>');
    } else if (arguments.length > 3) {
      sources = [].slice.call(arguments, 1, arguments.length - 1);
      dest = arguments[arguments.length - 1];
    } else if (typeof sources === 'string') {
      sources = [sources];
    } else if ('length' in sources) {
      sources = sources;
    } else {
      common.error('invalid arguments');
    }
    var exists = fs.existsSync(dest),
        stats = exists && fs.statSync(dest);
    if ((!exists || !stats.isDirectory()) && sources.length > 1)
      common.error('dest is not a directory (too many sources)');
    if (exists && stats.isFile() && options.no_force)
      common.error('dest file already exists: ' + dest);
    if (options.recursive) {
      sources.forEach(function(src, i) {
        if (src[src.length - 1] === '/') {
          sources[i] += '*';
        } else if (fs.statSync(src).isDirectory() && !exists) {
          sources[i] += '/*';
        }
      });
      try {
        fs.mkdirSync(dest, parseInt('0777', 8));
      } catch (e) {}
    }
    sources = common.expand(sources);
    sources.forEach(function(src) {
      if (!fs.existsSync(src)) {
        common.error('no such file or directory: ' + src, true);
        return;
      }
      if (fs.statSync(src).isDirectory()) {
        if (!options.recursive) {
          common.log(src + ' is a directory (not copied)');
        } else {
          var newDest = path.join(dest, path.basename(src)),
              checkDir = fs.statSync(src);
          try {
            fs.mkdirSync(newDest, checkDir.mode);
          } catch (e) {
            if (e.code !== 'EEXIST') {
              common.error('dest file no such file or directory: ' + newDest, true);
              throw e;
            }
          }
          cpdirSyncRecursive(src, newDest, {no_force: options.no_force});
        }
        return;
      }
      var thisDest = dest;
      if (fs.existsSync(dest) && fs.statSync(dest).isDirectory())
        thisDest = path.normalize(dest + '/' + path.basename(src));
      if (fs.existsSync(thisDest) && options.no_force) {
        common.error('dest file already exists: ' + thisDest, true);
        return;
      }
      copyFileSync(src, thisDest);
    });
  }
  module.exports = _cp;
  var common = require('./common');
  var _cd = require('./cd');
  var path = require('path');
  var _dirStack = [];
  function _isStackIndex(index) {
    return (/^[\-+]\d+$/).test(index);
  }
  function _parseStackIndex(index) {
    if (_isStackIndex(index)) {
      if (Math.abs(index) < _dirStack.length + 1) {
        return (/^-/).test(index) ? Number(index) - 1 : Number(index);
      } else {
        common.error(index + ': directory stack index out of range');
      }
    } else {
      common.error(index + ': invalid number');
    }
  }
  function _actualDirStack() {
    return [process.cwd()].concat(_dirStack);
  }
  function _pushd(options, dir) {
    if (_isStackIndex(options)) {
      dir = options;
      options = '';
    }
    options = common.parseOptions(options, {'n': 'no-cd'});
    var dirs = _actualDirStack();
    if (dir === '+0') {
      return dirs;
    } else if (!dir) {
      if (dirs.length > 1) {
        dirs = dirs.splice(1, 1).concat(dirs);
      } else {
        return common.error('no other directory');
      }
    } else if (_isStackIndex(dir)) {
      var n = _parseStackIndex(dir);
      dirs = dirs.slice(n).concat(dirs.slice(0, n));
    } else {
      if (options['no-cd']) {
        dirs.splice(1, 0, dir);
      } else {
        dirs.unshift(dir);
      }
    }
    if (options['no-cd']) {
      dirs = dirs.slice(1);
    } else {
      dir = path.resolve(dirs.shift());
      _cd('', dir);
    }
    _dirStack = dirs;
    return _dirs('');
  }
  exports.pushd = _pushd;
  function _popd(options, index) {
    if (_isStackIndex(options)) {
      index = options;
      options = '';
    }
    options = common.parseOptions(options, {'n': 'no-cd'});
    if (!_dirStack.length) {
      return common.error('directory stack empty');
    }
    index = _parseStackIndex(index || '+0');
    if (options['no-cd'] || index > 0 || _dirStack.length + index === 0) {
      index = index > 0 ? index - 1 : index;
      _dirStack.splice(index, 1);
    } else {
      var dir = path.resolve(_dirStack.shift());
      _cd('', dir);
    }
    return _dirs('');
  }
  exports.popd = _popd;
  function _dirs(options, index) {
    if (_isStackIndex(options)) {
      index = options;
      options = '';
    }
    options = common.parseOptions(options, {'c': 'clear'});
    if (options['clear']) {
      _dirStack = [];
      return _dirStack;
    }
    var stack = _actualDirStack();
    if (index) {
      index = _parseStackIndex(index);
      if (index < 0) {
        index = stack.length + index;
      }
      common.log(stack[index]);
      return stack[index];
    }
    common.log(stack.join(' '));
    return stack;
  }
  exports.dirs = _dirs;
  var common = require('./common');
  function _echo() {
    var messages = [].slice.call(arguments, 0);
    console.log.apply(console, messages);
    return common.ShellString(messages.join(' '));
  }
  module.exports = _echo;
  var common = require('./common');
  function error() {
    return common.state.error;
  }
  module.exports = error;
  var common = require('./common');
  var _tempDir = require('./tempdir');
  var _pwd = require('./pwd');
  var path = require('path');
  var fs = require('fs');
  var child = require('child_process');
  function execSync(cmd, opts) {
    var tempDir = _tempDir();
    var stdoutFile = path.resolve(tempDir + '/' + common.randomFileName()),
        stderrFile = path.resolve(tempDir + '/' + common.randomFileName()),
        codeFile = path.resolve(tempDir + '/' + common.randomFileName()),
        scriptFile = path.resolve(tempDir + '/' + common.randomFileName()),
        sleepFile = path.resolve(tempDir + '/' + common.randomFileName());
    var options = common.extend({silent: common.config.silent}, opts);
    var previousStdoutContent = '',
        previousStderrContent = '';
    function updateStream(streamFile) {
      if (options.silent || !fs.existsSync(streamFile))
        return;
      var previousStreamContent,
          proc_stream;
      if (streamFile === stdoutFile) {
        previousStreamContent = previousStdoutContent;
        proc_stream = process.stdout;
      } else {
        previousStreamContent = previousStderrContent;
        proc_stream = process.stderr;
      }
      var streamContent = fs.readFileSync(streamFile, 'utf8');
      if (streamContent.length <= previousStreamContent.length)
        return;
      proc_stream.write(streamContent.substr(previousStreamContent.length));
      previousStreamContent = streamContent;
    }
    function escape(str) {
      return (str + '').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
    }
    if (fs.existsSync(scriptFile))
      common.unlinkSync(scriptFile);
    if (fs.existsSync(stdoutFile))
      common.unlinkSync(stdoutFile);
    if (fs.existsSync(stderrFile))
      common.unlinkSync(stderrFile);
    if (fs.existsSync(codeFile))
      common.unlinkSync(codeFile);
    var execCommand = '"' + process.execPath + '" ' + scriptFile;
    var execOptions = {
      env: process.env,
      cwd: _pwd(),
      maxBuffer: 20 * 1024 * 1024
    };
    var script;
    if (typeof child.execSync === 'function') {
      script = ["var child = require('child_process')", "  , fs = require('fs');", "var childProcess = child.exec('" + escape(cmd) + "', {env: process.env, maxBuffer: 20*1024*1024}, function(err) {", "  fs.writeFileSync('" + escape(codeFile) + "', err ? err.code.toString() : '0');", "});", "var stdoutStream = fs.createWriteStream('" + escape(stdoutFile) + "');", "var stderrStream = fs.createWriteStream('" + escape(stderrFile) + "');", "childProcess.stdout.pipe(stdoutStream, {end: false});", "childProcess.stderr.pipe(stderrStream, {end: false});", "childProcess.stdout.pipe(process.stdout);", "childProcess.stderr.pipe(process.stderr);", "var stdoutEnded = false, stderrEnded = false;", "function tryClosingStdout(){ if(stdoutEnded){ stdoutStream.end(); } }", "function tryClosingStderr(){ if(stderrEnded){ stderrStream.end(); } }", "childProcess.stdout.on('end', function(){ stdoutEnded = true; tryClosingStdout(); });", "childProcess.stderr.on('end', function(){ stderrEnded = true; tryClosingStderr(); });"].join('\n');
      fs.writeFileSync(scriptFile, script);
      if (options.silent) {
        execOptions.stdio = 'ignore';
      } else {
        execOptions.stdio = [0, 1, 2];
      }
      child.execSync(execCommand, execOptions);
    } else {
      cmd += ' > ' + stdoutFile + ' 2> ' + stderrFile;
      script = ["var child = require('child_process')", "  , fs = require('fs');", "var childProcess = child.exec('" + escape(cmd) + "', {env: process.env, maxBuffer: 20*1024*1024}, function(err) {", "  fs.writeFileSync('" + escape(codeFile) + "', err ? err.code.toString() : '0');", "});"].join('\n');
      fs.writeFileSync(scriptFile, script);
      child.exec(execCommand, execOptions);
      while (!fs.existsSync(codeFile)) {
        updateStream(stdoutFile);
        fs.writeFileSync(sleepFile, 'a');
      }
      while (!fs.existsSync(stdoutFile)) {
        updateStream(stdoutFile);
        fs.writeFileSync(sleepFile, 'a');
      }
      while (!fs.existsSync(stderrFile)) {
        updateStream(stderrFile);
        fs.writeFileSync(sleepFile, 'a');
      }
    }
    var code = parseInt('', 10);
    while (isNaN(code)) {
      code = parseInt(fs.readFileSync(codeFile, 'utf8'), 10);
    }
    var stdout = fs.readFileSync(stdoutFile, 'utf8');
    var stderr = fs.readFileSync(stderrFile, 'utf8');
    try {
      common.unlinkSync(scriptFile);
    } catch (e) {}
    try {
      common.unlinkSync(stdoutFile);
    } catch (e) {}
    try {
      common.unlinkSync(stderrFile);
    } catch (e) {}
    try {
      common.unlinkSync(codeFile);
    } catch (e) {}
    try {
      common.unlinkSync(sleepFile);
    } catch (e) {}
    if (code === 1 || code === 2 || code >= 126) {
      common.error('', true);
    }
    var obj = {
      code: code,
      output: stdout,
      stdout: stdout,
      stderr: stderr
    };
    return obj;
  }
  function execAsync(cmd, opts, callback) {
    var stdout = '';
    var stderr = '';
    var options = common.extend({silent: common.config.silent}, opts);
    var c = child.exec(cmd, {
      env: process.env,
      maxBuffer: 20 * 1024 * 1024
    }, function(err) {
      if (callback)
        callback(err ? err.code : 0, stdout, stderr);
    });
    c.stdout.on('data', function(data) {
      stdout += data;
      if (!options.silent)
        process.stdout.write(data);
    });
    c.stderr.on('data', function(data) {
      stderr += data;
      if (!options.silent)
        process.stderr.write(data);
    });
    return c;
  }
  function _exec(command, options, callback) {
    if (!command)
      common.error('must specify command');
    if (typeof options === 'function') {
      callback = options;
      options = {async: true};
    }
    if (typeof options === 'object' && typeof callback === 'function') {
      options.async = true;
    }
    options = common.extend({
      silent: common.config.silent,
      async: false
    }, options);
    if (options.async)
      return execAsync(command, options, callback);
    else
      return execSync(command, options);
  }
  module.exports = _exec;
  var fs = require('fs');
  var common = require('./common');
  var _ls = require('./ls');
  function _find(options, paths) {
    if (!paths)
      common.error('no path specified');
    else if (typeof paths === 'object')
      paths = paths;
    else if (typeof paths === 'string')
      paths = [].slice.call(arguments, 1);
    var list = [];
    function pushFile(file) {
      if (common.platform === 'win')
        file = file.replace(/\\/g, '/');
      list.push(file);
    }
    paths.forEach(function(file) {
      pushFile(file);
      if (fs.statSync(file).isDirectory()) {
        _ls('-RA', file + '/*').forEach(function(subfile) {
          pushFile(subfile);
        });
      }
    });
    return list;
  }
  module.exports = _find;
  var common = require('./common');
  var fs = require('fs');
  function _grep(options, regex, files) {
    options = common.parseOptions(options, {'v': 'inverse'});
    if (!files)
      common.error('no paths given');
    if (typeof files === 'string')
      files = [].slice.call(arguments, 2);
    files = common.expand(files);
    var grep = '';
    files.forEach(function(file) {
      if (!fs.existsSync(file)) {
        common.error('no such file or directory: ' + file, true);
        return;
      }
      var contents = fs.readFileSync(file, 'utf8'),
          lines = contents.split(/\r*\n/);
      lines.forEach(function(line) {
        var matched = line.match(regex);
        if ((options.inverse && !matched) || (!options.inverse && matched))
          grep += line + '\n';
      });
    });
    return common.ShellString(grep);
  }
  module.exports = _grep;
  var fs = require('fs');
  var path = require('path');
  var common = require('./common');
  function _ln(options, source, dest) {
    options = common.parseOptions(options, {
      's': 'symlink',
      'f': 'force'
    });
    if (!source || !dest) {
      common.error('Missing <source> and/or <dest>');
    }
    source = String(source);
    var sourcePath = path.normalize(source).replace(RegExp(path.sep + '$'), '');
    var isAbsolute = (path.resolve(source) === sourcePath);
    dest = path.resolve(process.cwd(), String(dest));
    if (fs.existsSync(dest)) {
      if (!options.force) {
        common.error('Destination file exists', true);
      }
      fs.unlinkSync(dest);
    }
    if (options.symlink) {
      var isWindows = common.platform === 'win';
      var linkType = isWindows ? 'file' : null;
      var resolvedSourcePath = isAbsolute ? sourcePath : path.resolve(process.cwd(), path.dirname(dest), source);
      if (!fs.existsSync(resolvedSourcePath)) {
        common.error('Source file does not exist', true);
      } else if (isWindows && fs.statSync(resolvedSourcePath).isDirectory()) {
        linkType = 'junction';
      }
      try {
        fs.symlinkSync(linkType === 'junction' ? resolvedSourcePath : source, dest, linkType);
      } catch (err) {
        common.error(err.message);
      }
    } else {
      if (!fs.existsSync(source)) {
        common.error('Source file does not exist', true);
      }
      try {
        fs.linkSync(source, dest);
      } catch (err) {
        common.error(err.message);
      }
    }
  }
  module.exports = _ln;
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
  var common = require('./common');
  var fs = require('fs');
  var path = require('path');
  function mkdirSyncRecursive(dir) {
    var baseDir = path.dirname(dir);
    if (fs.existsSync(baseDir)) {
      fs.mkdirSync(dir, parseInt('0777', 8));
      return;
    }
    mkdirSyncRecursive(baseDir);
    fs.mkdirSync(dir, parseInt('0777', 8));
  }
  function _mkdir(options, dirs) {
    options = common.parseOptions(options, {'p': 'fullpath'});
    if (!dirs)
      common.error('no paths given');
    if (typeof dirs === 'string')
      dirs = [].slice.call(arguments, 1);
    dirs.forEach(function(dir) {
      if (fs.existsSync(dir)) {
        if (!options.fullpath)
          common.error('path already exists: ' + dir, true);
        return;
      }
      var baseDir = path.dirname(dir);
      if (!fs.existsSync(baseDir) && !options.fullpath) {
        common.error('no such file or directory: ' + baseDir, true);
        return;
      }
      if (options.fullpath)
        mkdirSyncRecursive(dir);
      else
        fs.mkdirSync(dir, parseInt('0777', 8));
    });
  }
  module.exports = _mkdir;
  var fs = require('fs');
  var path = require('path');
  var common = require('./common');
  function _mv(options, sources, dest) {
    options = common.parseOptions(options, {
      'f': '!no_force',
      'n': 'no_force'
    });
    if (arguments.length < 3) {
      common.error('missing <source> and/or <dest>');
    } else if (arguments.length > 3) {
      sources = [].slice.call(arguments, 1, arguments.length - 1);
      dest = arguments[arguments.length - 1];
    } else if (typeof sources === 'string') {
      sources = [sources];
    } else if ('length' in sources) {
      sources = sources;
    } else {
      common.error('invalid arguments');
    }
    sources = common.expand(sources);
    var exists = fs.existsSync(dest),
        stats = exists && fs.statSync(dest);
    if ((!exists || !stats.isDirectory()) && sources.length > 1)
      common.error('dest is not a directory (too many sources)');
    if (exists && stats.isFile() && options.no_force)
      common.error('dest file already exists: ' + dest);
    sources.forEach(function(src) {
      if (!fs.existsSync(src)) {
        common.error('no such file or directory: ' + src, true);
        return;
      }
      var thisDest = dest;
      if (fs.existsSync(dest) && fs.statSync(dest).isDirectory())
        thisDest = path.normalize(dest + '/' + path.basename(src));
      if (fs.existsSync(thisDest) && options.no_force) {
        common.error('dest file already exists: ' + thisDest, true);
        return;
      }
      if (path.resolve(src) === path.dirname(path.resolve(thisDest))) {
        common.error('cannot move to self: ' + src, true);
        return;
      }
      fs.renameSync(src, thisDest);
    });
  }
  module.exports = _mv;
  var path = require('path');
  var common = require('./common');
  function _pwd() {
    var pwd = path.resolve(process.cwd());
    return common.ShellString(pwd);
  }
  module.exports = _pwd;
  var common = require('./common');
  var fs = require('fs');
  function rmdirSyncRecursive(dir, force) {
    var files;
    files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
      var file = dir + "/" + files[i],
          currFile = fs.lstatSync(file);
      if (currFile.isDirectory()) {
        rmdirSyncRecursive(file, force);
      } else if (currFile.isSymbolicLink()) {
        if (force || isWriteable(file)) {
          try {
            common.unlinkSync(file);
          } catch (e) {
            common.error('could not remove file (code ' + e.code + '): ' + file, true);
          }
        }
      } else if (force || isWriteable(file)) {
        try {
          common.unlinkSync(file);
        } catch (e) {
          common.error('could not remove file (code ' + e.code + '): ' + file, true);
        }
      }
    }
    var result;
    try {
      var start = Date.now();
      while (true) {
        try {
          result = fs.rmdirSync(dir);
          if (fs.existsSync(dir))
            throw {code: "EAGAIN"};
          break;
        } catch (er) {
          if (process.platform === "win32" && (er.code === "ENOTEMPTY" || er.code === "EBUSY" || er.code === "EPERM" || er.code === "EAGAIN")) {
            if (Date.now() - start > 1000)
              throw er;
          } else if (er.code === "ENOENT") {
            break;
          } else {
            throw er;
          }
        }
      }
    } catch (e) {
      common.error('could not remove directory (code ' + e.code + '): ' + dir, true);
    }
    return result;
  }
  function isWriteable(file) {
    var writePermission = true;
    try {
      var __fd = fs.openSync(file, 'a');
      fs.closeSync(__fd);
    } catch (e) {
      writePermission = false;
    }
    return writePermission;
  }
  function _rm(options, files) {
    options = common.parseOptions(options, {
      'f': 'force',
      'r': 'recursive',
      'R': 'recursive'
    });
    if (!files)
      common.error('no paths given');
    if (typeof files === 'string')
      files = [].slice.call(arguments, 1);
    files = common.expand(files);
    files.forEach(function(file) {
      if (!fs.existsSync(file)) {
        if (!options.force)
          common.error('no such file or directory: ' + file, true);
        return;
      }
      var stats = fs.lstatSync(file);
      if (stats.isFile() || stats.isSymbolicLink()) {
        if (options.force) {
          common.unlinkSync(file);
          return;
        }
        if (isWriteable(file))
          common.unlinkSync(file);
        else
          common.error('permission denied: ' + file, true);
        return;
      }
      if (stats.isDirectory() && !options.recursive) {
        common.error('path is a directory', true);
        return;
      }
      if (stats.isDirectory() && options.recursive) {
        rmdirSyncRecursive(file, options.force);
      }
    });
  }
  module.exports = _rm;
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
  var common = require('./common');
  var os = require('os');
  var fs = require('fs');
  function writeableDir(dir) {
    if (!dir || !fs.existsSync(dir))
      return false;
    if (!fs.statSync(dir).isDirectory())
      return false;
    var testFile = dir + '/' + common.randomFileName();
    try {
      fs.writeFileSync(testFile, ' ');
      common.unlinkSync(testFile);
      return dir;
    } catch (e) {
      return false;
    }
  }
  function _tempDir() {
    var state = common.state;
    if (state.tempDir)
      return state.tempDir;
    state.tempDir = writeableDir(os.tmpdir && os.tmpdir()) || writeableDir(os.tmpDir && os.tmpDir()) || writeableDir(process.env['TMPDIR']) || writeableDir(process.env['TEMP']) || writeableDir(process.env['TMP']) || writeableDir(process.env['Wimp$ScrapDir']) || writeableDir('C:\\TEMP') || writeableDir('C:\\TMP') || writeableDir('\\TEMP') || writeableDir('\\TMP') || writeableDir('/tmp') || writeableDir('/var/tmp') || writeableDir('/usr/tmp') || writeableDir('.');
    return state.tempDir;
  }
  module.exports = _tempDir;
  var common = require('./common');
  var fs = require('fs');
  function _test(options, path) {
    if (!path)
      common.error('no path given');
    options = common.parseOptions(options, {
      'b': 'block',
      'c': 'character',
      'd': 'directory',
      'e': 'exists',
      'f': 'file',
      'L': 'link',
      'p': 'pipe',
      'S': 'socket'
    });
    var canInterpret = false;
    for (var key in options)
      if (options[key] === true) {
        canInterpret = true;
        break;
      }
    if (!canInterpret)
      common.error('could not interpret expression');
    if (options.link) {
      try {
        return fs.lstatSync(path).isSymbolicLink();
      } catch (e) {
        return false;
      }
    }
    if (!fs.existsSync(path))
      return false;
    if (options.exists)
      return true;
    var stats = fs.statSync(path);
    if (options.block)
      return stats.isBlockDevice();
    if (options.character)
      return stats.isCharacterDevice();
    if (options.directory)
      return stats.isDirectory();
    if (options.file)
      return stats.isFile();
    if (options.pipe)
      return stats.isFIFO();
    if (options.socket)
      return stats.isSocket();
  }
  module.exports = _test;
  var common = require('./common');
  var fs = require('fs');
  var path = require('path');
  function _to(options, file) {
    if (!file)
      common.error('wrong arguments');
    if (!fs.existsSync(path.dirname(file)))
      common.error('no such file or directory: ' + path.dirname(file));
    try {
      fs.writeFileSync(file, this.toString(), 'utf8');
      return this;
    } catch (e) {
      common.error('could not write to file (code ' + e.code + '): ' + file, true);
    }
  }
  module.exports = _to;
  var common = require('./common');
  var fs = require('fs');
  var path = require('path');
  function _toEnd(options, file) {
    if (!file)
      common.error('wrong arguments');
    if (!fs.existsSync(path.dirname(file)))
      common.error('no such file or directory: ' + path.dirname(file));
    try {
      fs.appendFileSync(file, this.toString(), 'utf8');
      return this;
    } catch (e) {
      common.error('could not append to file (code ' + e.code + '): ' + file, true);
    }
  }
  module.exports = _toEnd;
  var common = require('./common');
  var fs = require('fs');
  function _touch(opts, files) {
    opts = common.parseOptions(opts, {
      'a': 'atime_only',
      'c': 'no_create',
      'd': 'date',
      'm': 'mtime_only',
      'r': 'reference'
    });
    if (!files) {
      common.error('no paths given');
    }
    if (Array.isArray(files)) {
      files.forEach(function(f) {
        touchFile(opts, f);
      });
    } else if (typeof files === 'string') {
      touchFile(opts, files);
    } else {
      common.error('file arg should be a string file path or an Array of string file paths');
    }
  }
  function touchFile(opts, file) {
    var stat = tryStatFile(file);
    if (stat && stat.isDirectory()) {
      return;
    }
    if (!stat && opts.no_create) {
      return;
    }
    fs.closeSync(fs.openSync(file, 'a'));
    var now = new Date();
    var mtime = opts.date || now;
    var atime = opts.date || now;
    if (opts.reference) {
      var refStat = tryStatFile(opts.reference);
      if (!refStat) {
        common.error('failed to get attributess of ' + opts.reference);
      }
      mtime = refStat.mtime;
      atime = refStat.atime;
    } else if (opts.date) {
      mtime = opts.date;
      atime = opts.date;
    }
    if (opts.atime_only && opts.mtime_only) {} else if (opts.atime_only) {
      mtime = stat.mtime;
    } else if (opts.mtime_only) {
      atime = stat.atime;
    }
    fs.utimesSync(file, atime, mtime);
  }
  module.exports = _touch;
  function tryStatFile(filePath) {
    try {
      return fs.statSync(filePath);
    } catch (e) {
      return null;
    }
  }
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
})(require('buffer').Buffer, require('process'));
