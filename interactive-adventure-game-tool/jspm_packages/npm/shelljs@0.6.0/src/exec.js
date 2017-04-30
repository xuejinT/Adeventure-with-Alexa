/* */ 
(function(process) {
  var common = require('./common');
  var _tempDir = require('./tempdir');
  var _pwd = require('./pwd');
  var path = require('path');
  var fs = require('fs');
  var child = require('child_process');
  var DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024;
  function execSync(cmd, opts) {
    var tempDir = _tempDir();
    var stdoutFile = path.resolve(tempDir + '/' + common.randomFileName()),
        stderrFile = path.resolve(tempDir + '/' + common.randomFileName()),
        codeFile = path.resolve(tempDir + '/' + common.randomFileName()),
        scriptFile = path.resolve(tempDir + '/' + common.randomFileName()),
        sleepFile = path.resolve(tempDir + '/' + common.randomFileName());
    opts = common.extend({
      silent: common.config.silent,
      cwd: _pwd(),
      env: process.env,
      maxBuffer: DEFAULT_MAXBUFFER_SIZE
    }, opts);
    var previousStdoutContent = '',
        previousStderrContent = '';
    function updateStream(streamFile) {
      if (opts.silent || !fs.existsSync(streamFile))
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
    var script;
    if (typeof child.execSync === 'function') {
      script = ["var child = require('child_process')", "  , fs = require('fs');", "var childProcess = child.exec('" + escape(cmd) + "', {env: process.env, maxBuffer: " + opts.maxBuffer + "}, function(err) {", "  fs.writeFileSync('" + escape(codeFile) + "', err ? err.code.toString() : '0');", "});", "var stdoutStream = fs.createWriteStream('" + escape(stdoutFile) + "');", "var stderrStream = fs.createWriteStream('" + escape(stderrFile) + "');", "childProcess.stdout.pipe(stdoutStream, {end: false});", "childProcess.stderr.pipe(stderrStream, {end: false});", "childProcess.stdout.pipe(process.stdout);", "childProcess.stderr.pipe(process.stderr);", "var stdoutEnded = false, stderrEnded = false;", "function tryClosingStdout(){ if(stdoutEnded){ stdoutStream.end(); } }", "function tryClosingStderr(){ if(stderrEnded){ stderrStream.end(); } }", "childProcess.stdout.on('end', function(){ stdoutEnded = true; tryClosingStdout(); });", "childProcess.stderr.on('end', function(){ stderrEnded = true; tryClosingStderr(); });"].join('\n');
      fs.writeFileSync(scriptFile, script);
      if (opts.silent) {
        opts.stdio = 'ignore';
      } else {
        opts.stdio = [0, 1, 2];
      }
      child.execSync(execCommand, opts);
    } else {
      cmd += ' > ' + stdoutFile + ' 2> ' + stderrFile;
      script = ["var child = require('child_process')", "  , fs = require('fs');", "var childProcess = child.exec('" + escape(cmd) + "', {env: process.env, maxBuffer: " + opts.maxBuffer + "}, function(err) {", "  fs.writeFileSync('" + escape(codeFile) + "', err ? err.code.toString() : '0');", "});"].join('\n');
      fs.writeFileSync(scriptFile, script);
      child.exec(execCommand, opts);
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
    opts = common.extend({
      silent: common.config.silent,
      cwd: _pwd(),
      env: process.env,
      maxBuffer: DEFAULT_MAXBUFFER_SIZE
    }, opts);
    var c = child.exec(cmd, opts, function(err) {
      if (callback)
        callback(err ? err.code : 0, stdout, stderr);
    });
    c.stdout.on('data', function(data) {
      stdout += data;
      if (!opts.silent)
        process.stdout.write(data);
    });
    c.stderr.on('data', function(data) {
      stderr += data;
      if (!opts.silent)
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
    try {
      if (options.async)
        return execAsync(command, options, callback);
      else
        return execSync(command, options);
    } catch (e) {
      common.error('internal error');
    }
  }
  module.exports = _exec;
})(require('process'));
