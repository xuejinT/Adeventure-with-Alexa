/* */ 
var mixobj = require('./_utils').mixobj,
    parser = require('jade');
var defopts = {
  pretty: true,
  doctype: 'html'
};
module.exports = function _jade(html, opts, url) {
  opts = mixobj(defopts, {filename: url}, opts);
  return parser.render(html, opts);
};
