/* */ 
(function(process) {
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
  function parseOptions(opt, map) {
    if (!map)
      error('parseOptions() internal error: no map given');
    var options = {};
    for (var letter in map) {
      if (map[letter][0] !== '!')
        options[map[letter]] = false;
    }
    if (!opt)
      return options;
    var optionName;
    if (typeof opt === 'string') {
      if (opt[0] !== '-')
        return options;
      var chars = opt.slice(1).split('');
      chars.forEach(function(c) {
        if (c in map) {
          optionName = map[c];
          if (optionName[0] === '!')
            options[optionName.slice(1, optionName.length - 1)] = false;
          else
            options[optionName] = true;
        } else {
          error('option not recognized: ' + c);
        }
      });
    } else if (typeof opt === 'object') {
      for (var key in opt) {
        var c = key[1];
        if (c in map) {
          optionName = map[c];
          options[optionName] = opt[key];
        } else {
          error('option not recognized: ' + c);
        }
      }
    } else {
      error('options must be strings or key-value pairs');
    }
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
          if (typeof args[0] === 'object' && args[0].constructor.name === 'Object') {
            args = args;
          } else if (args.length === 0 || typeof args[0] !== 'string' || args[0].length <= 1 || args[0][0] !== '-') {
            args.unshift('');
          }
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
})(require('process'));
