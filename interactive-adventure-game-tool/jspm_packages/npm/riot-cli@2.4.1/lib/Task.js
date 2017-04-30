/* */ 
'use strict';
const helpers = require('./helpers'),
    path = require('path'),
    sh = require('shelljs'),
    compiler = global.compiler || require('riot-compiler'),
    constants = require('./const'),
    NO_FILE_FOUND = constants.NO_FILE_FOUND,
    PREPROCESSOR_NOT_FOUND = constants.PREPROCESSOR_NOT_FOUND;
class Task {
  constructor(opt) {
    if (this.called)
      return;
    this.called = true;
    opt.parsers = helpers.extend(opt.parsers || {}, {
      html: {},
      js: {},
      css: {}
    });
    this.error = opt.compiler ? this.validate(opt.compiler, opt.parsers) : false;
    this.extRegex = new RegExp(`\\.${opt.ext || 'tag'}$`);
    if (!opt.to)
      opt.to = this.extRegex.test(opt.from) ? path.dirname(opt.from) : opt.from;
    opt.from = path.resolve(opt.from);
    opt.to = path.resolve(opt.to);
    if (!sh.test('-e', opt.from))
      this.error = NO_FILE_FOUND;
    if (this.error) {
      if (opt.isCli)
        helpers.err(this.error);
      else
        return this.error;
    }
    opt.flow = (this.extRegex.test(opt.from) ? 'f' : 'd') + (/\.(js|html|css)$/.test(opt.to) ? 'f' : 'd');
    if (!opt.compiler)
      opt.compiler = {};
    return this.run(opt);
  }
  has(name) {
    return !!compiler.parsers._req(name);
  }
  validate(opt, parsers) {
    var template = opt.template,
        type = opt.type,
        style = opt.style;
    if (template && !parsers.html[template] && !this.has(template))
      return PREPROCESSOR_NOT_FOUND('html', template);
    else if (type && !parsers.js[type] && !this.has(type))
      return PREPROCESSOR_NOT_FOUND('javascript', type);
    else if (style && !parsers.css[style] && !this.has(style))
      return PREPROCESSOR_NOT_FOUND('css', style);
    return false;
  }
}
module.exports = Task;
