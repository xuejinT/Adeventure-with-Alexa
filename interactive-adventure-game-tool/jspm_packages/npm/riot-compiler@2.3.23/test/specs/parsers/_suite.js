/* */ 
var path = require('path'),
    fs = require('fs'),
    norm = require('../helpers').normalizeJS,
    reqname = require('../helpers').requireName;
var fixtures = __dirname,
    expected = path.join(fixtures, 'js'),
    parsers = compiler.parsers;
function have(mod, req) {
  if (parsers._req(mod, req))
    return true;
  if (mod !== 'unknown') {
    if (!req)
      req = reqname(mod);
    console.error('\tnot installed locally: ' + req + ' alias "' + mod + '"');
  }
  return false;
}
function cat(dir, filename) {
  return fs.readFileSync(path.join(dir, filename), 'utf8');
}
function testParser(name, opts, save) {
  opts = opts || {};
  var file = name + (opts.type ? '.' + opts.type : ''),
      str1 = cat(fixtures, file + '.tag'),
      str2 = cat(expected, file + '.js'),
      js = compiler.compile(str1, opts, path.join(fixtures, file + '.tag'));
  if (save) {
    fs.writeFile(path.join(expected, file + '_out.js'), js, function(err) {
      if (err)
        throw err;
    });
  }
  expect(norm(js)).to.be(norm(str2));
}
describe('HTML parsers', function() {
  this.timeout(12000);
  function testStr(str, resStr, opts) {
    expect(compiler.html(str, opts || {})).to.be(resStr);
  }
  it('jade', function() {
    if (have('jade') && have('coffee')) {
      testParser('test.jade', {template: 'jade'});
      testParser('slide.jade', {template: 'jade'});
    }
  });
  describe('Custom parser in expressions', function() {
    var opts = {
      parser: function(str) {
        return '@' + str;
      },
      expr: true
    };
    it('don\'t touch format before run parser, compact & trim after (2.3.0)', function() {
      testStr('<a href={\na\r\n}>', '<a href="{@ a}">', opts);
      testStr('<a>{\tb\n }</a>', '<a>{@\tb}</a>', opts);
    });
    it('plays with the custom parser', function() {
      testStr('<a href={a}>', '<a href="{@a}">', opts);
      testStr('<a>{ b }</a>', '<a>{@ b}</a>', opts);
    });
    it('plays with quoted values', function() {
      testStr('<a href={ "a" }>', '<a href="{@ \u2057a\u2057}">', opts);
      testStr('<a>{"b"}</a>', '<a>{@\u2057b\u2057}</a>', opts);
    });
    it('remove the last semi-colon', function() {
      testStr('<a href={ a; }>', '<a href="{@ a}">', opts);
      testStr('<a>{ b ;}</a>', '<a>{@ b}</a>', opts);
    });
    it('prefixing the expression with "^" prevents the parser (2.3.0)', function() {
      testStr('<a href={^ a }>', '<a href="{a}">', opts);
      testStr('<a>{^ b }</a>', '<a>{b}</a>', opts);
    });
  });
});
describe('JavaScript parsers', function() {
  function _custom() {
    return 'var foo';
  }
  this.timeout(45000);
  it('complex tag structure', function() {
    if (have('none')) {
      testParser('complex');
    } else {
      expect().fail('parsers.js must have a "none" property');
    }
  });
  it('javascript (root container)', function() {
    testParser('test', {expr: true});
  });
  it('javascript (comment hack)', function() {
    testParser('test-alt', {expr: true});
  });
  it('mixed riotjs and javascript types', function() {
    if (have('javascript')) {
      testParser('mixed-js');
    } else {
      expect().fail('parsers.js must have a "javascript" property');
    }
  });
  it('coffeescript', function() {
    if (have('coffee')) {
      testParser('test', {
        type: 'coffee',
        expr: true
      });
    }
  });
  it('livescript', function() {
    if (have('livescript')) {
      testParser('test', {type: 'livescript'});
    }
  });
  it('typescript', function() {
    if (have('typescript')) {
      testParser('test', {type: 'typescript'});
    }
  });
  it('es6', function() {
    if (have('es6')) {
      testParser('test', {type: 'es6'});
    }
  });
  it('babel', function() {
    if (have('babel')) {
      testParser('test', {type: 'babel'});
    }
  });
  it('coffee with shorthands (fix #1090)', function() {
    if (have('coffeescript')) {
      testParser('test-attr', {
        type: 'coffeescript',
        expr: true
      });
    }
  });
  it('custom js parser', function() {
    parsers.js.custom = _custom;
    testParser('test', {type: 'custom'});
  });
  it('the javascript parser is an alias of "none" and does nothing', function() {
    var code = 'fn () {\n}\n';
    expect(parsers.js.javascript(code)).to.be(code);
  });
});
describe('Style parsers', function() {
  this.timeout(12000);
  parsers.css.postcss = function(tag, css) {
    return require('postcss')([require('autoprefixer')]).process(css).css;
  };
  it('default style', function() {
    testParser('style');
  });
  it('scoped styles', function() {
    testParser('style.scoped');
  });
  it('stylus', function() {
    if (have('stylus')) {
      testParser('stylus');
      testParser('stylus-import');
    }
  });
  it('sass, indented 2, margin 0', function() {
    if (have('sass')) {
      testParser('sass');
    }
  });
  it('scss (no indentedSyntax)', function() {
    if (have('scss')) {
      testParser('scss');
      testParser('scss-import');
    }
  });
  it('custom style options', function() {
    if (have('sass')) {
      testParser('sass.options');
    }
  });
  it('custom parser using postcss + autoprefixer', function() {
    if (have('postcss', 'postcss')) {
      testParser('postcss');
    }
  });
  it('less', function() {
    if (have('less')) {
      testParser('less');
      testParser('less-import');
    }
  });
  it('mixing CSS blocks with different type', function() {
    testParser('mixed-css');
  });
  it('the style option for setting the CSS parser (v2.3.13)', function() {
    var source = ['<style-option>', '  <style>', '    p {top:0}', '  </style>', '</style-option>'].join('\n'),
        result;
    parsers.css.myParser2 = function(t, s) {
      return s.replace(/\bp\b/g, 'P');
    };
    result = compiler.compile(source, {style: 'myParser2'});
    expect(result).to.contain('P {top:0}');
  });
});
describe('Other', function() {
  it('unknown HTML template parser throws an error', function() {
    var str1 = cat(fixtures, 'test.tag');
    expect(compiler.compile).withArgs(str1, {template: 'unknown'}).to.throwError();
  });
  it('unknown JS & CSS parsers throws an error', function() {
    var str1 = cat(fixtures, 'test.tag'),
        str2 = ['<error>', "<style type='unknown'>p{top:0}</style>", '</error>'].join('\n');
    expect(compiler.compile).withArgs(str1, {type: 'unknown'}).to.throwError();
    expect(compiler.compile).withArgs(str2).to.throwError();
    expect(have('unknown')).to.be(false);
  });
  it('using different brackets', function() {
    testParser('brackets', {brackets: '${ }'});
  });
});
