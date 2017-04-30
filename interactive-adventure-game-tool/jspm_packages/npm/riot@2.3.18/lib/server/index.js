/* */ 
(function(process) {
  var riot = module.exports = require(process.env.RIOT || require('path').resolve(__dirname, '../../riot'));
  var compiler = require('riot-compiler');
  riot.compile = compiler.compile;
  riot.parsers = compiler.parsers;
  require.extensions['.tag'] = function(module, filename) {
    var src = riot.compile(require('fs').readFileSync(filename, 'utf8'));
    module._compile('var riot = require(process.env.RIOT || "riot/riot.js");module.exports =' + src, filename);
  };
  var sdom = require('./sdom');
  riot.render = function(tagName, opts) {
    var tag = riot.render.tag(tagName, opts),
        html = sdom.serialize(tag.root);
    tag.unmount();
    return html;
  };
  riot.render.dom = function(tagName, opts) {
    return riot.render.tag(tagName, opts).root;
  };
  riot.render.tag = function(tagName, opts) {
    var root = document.createElement(tagName),
        tag = riot.mount(root, opts)[0];
    return tag;
  };
})(require('process'));
