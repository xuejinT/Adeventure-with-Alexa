/* */ 
"format cjs";
(function(Buffer, process) {
  (function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory((global.rollup = {}));
  }(this, function(exports) {
    'use strict';
    var babelHelpers = {};
    babelHelpers.classCallCheck = function(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };
    var Promise = window.Promise;
    var absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/;
    var relativePath = /^\.?\.\//;
    function isAbsolute(path) {
      return absolutePath.test(path);
    }
    function isRelative(path) {
      return relativePath.test(path);
    }
    function _basename(path) {
      return path.split(/(\/|\\)/).pop();
    }
    function dirname(path) {
      var match = /(\/|\\)[^\/\\]*$/.exec(path);
      if (!match)
        return '.';
      var dir = path.slice(0, -match[0].length);
      return dir ? dir : '/';
    }
    function extname(path) {
      var match = /\.[^\.]+$/.exec(_basename(path));
      if (!match)
        return '';
      return match[0];
    }
    function resolve() {
      for (var _len = arguments.length,
          paths = Array(_len),
          _key = 0; _key < _len; _key++) {
        paths[_key] = arguments[_key];
      }
      var resolvedParts = paths.shift().split(/[\/\\]/);
      paths.forEach(function(path) {
        if (isAbsolute(path)) {
          resolvedParts = path.split(/[\/\\]/);
        } else {
          var parts = path.split(/[\/\\]/);
          while (parts[0] === '.' || parts[0] === '..') {
            var part = parts.shift();
            if (part === '..') {
              resolvedParts.pop();
            }
          }
          resolvedParts.push.apply(resolvedParts, parts);
        }
      });
      return resolvedParts.join('/');
    }
    var nope = function(method) {
      return 'Cannot use fs.' + method + ' inside browser';
    };
    var isFile = function() {
      return false;
    };
    var readdirSync = nope('readdirSync');
    var readFileSync = nope('readFileSync');
    var writeFile = nope('writeFile');
    var keys = Object.keys;
    function blank() {
      return Object.create(null);
    }
    function forOwn(object, func) {
      Object.keys(object).forEach(function(key) {
        return func(object[key], key);
      });
    }
    function validateKeys(object, allowedKeys) {
      var actualKeys = keys(object);
      var i = actualKeys.length;
      while (i--) {
        var key = actualKeys[i];
        if (allowedKeys.indexOf(key) === -1) {
          return new Error('Unexpected key \'' + key + '\' found, expected one of: ' + allowedKeys.join(', '));
        }
      }
    }
    var SOURCEMAPPING_URL = 'sourceMa';
    SOURCEMAPPING_URL += 'ppingURL';
    var SOURCEMAPPING_URL$1 = SOURCEMAPPING_URL;
    var charToInteger$1 = {};
    var integerToChar$1 = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('').forEach(function(char, i) {
      charToInteger$1[char] = i;
      integerToChar$1[i] = char;
    });
    function encode$1$1(value) {
      var result,
          i;
      if (typeof value === 'number') {
        result = encodeInteger$1(value);
      } else {
        result = '';
        for (i = 0; i < value.length; i += 1) {
          result += encodeInteger$1(value[i]);
        }
      }
      return result;
    }
    function encodeInteger$1(num) {
      var result = '',
          clamped;
      if (num < 0) {
        num = (-num << 1) | 1;
      } else {
        num <<= 1;
      }
      do {
        clamped = num & 31;
        num >>= 5;
        if (num > 0) {
          clamped |= 32;
        }
        result += integerToChar$1[clamped];
      } while (num > 0);
      return result;
    }
    function Patch(start, end, content, original, storeName) {
      this.start = start;
      this.end = end;
      this.content = content;
      this.original = original;
      this.storeName = storeName;
    }
    Patch.prototype = {clone: function clone() {
        return new Patch(this.start, this.end, this.content, this.original, this.storeName);
      }};
    var _btoa = undefined;
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      _btoa = window.btoa;
    } else if (typeof Buffer === 'function') {
      _btoa = function(str) {
        return new Buffer(str).toString('base64');
      };
    } else {
      throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
    }
    var btoa = _btoa;
    function SourceMap(properties) {
      this.version = 3;
      this.file = properties.file;
      this.sources = properties.sources;
      this.sourcesContent = properties.sourcesContent;
      this.names = properties.names;
      this.mappings = properties.mappings;
    }
    SourceMap.prototype = {
      toString: function toString() {
        return JSON.stringify(this);
      },
      toUrl: function toUrl() {
        return 'data:application/json;charset=utf-8;base64,' + btoa(this.toString());
      }
    };
    function guessIndent(code) {
      var lines = code.split('\n');
      var tabbed = lines.filter(function(line) {
        return (/^\t+/.test(line));
      });
      var spaced = lines.filter(function(line) {
        return (/^ {2,}/.test(line));
      });
      if (tabbed.length === 0 && spaced.length === 0) {
        return null;
      }
      if (tabbed.length >= spaced.length) {
        return '\t';
      }
      var min = spaced.reduce(function(previous, current) {
        var numSpaces = /^ +/.exec(current)[0].length;
        return Math.min(numSpaces, previous);
      }, Infinity);
      return new Array(min + 1).join(' ');
    }
    function encodeMappings(original, intro, patches, hires, sourcemapLocations, sourceIndex, offsets, names) {
      var rawLines = [];
      var generatedCodeLine = intro.split('\n').length - 1;
      var rawSegments = rawLines[generatedCodeLine] = [];
      var originalCharIndex = 0;
      var generatedCodeColumn = 0;
      var sourceCodeLine = 0;
      var sourceCodeColumn = 0;
      function addSegmentsUntil(end) {
        var first = true;
        while (originalCharIndex < end) {
          if (hires || first || sourcemapLocations[originalCharIndex]) {
            rawSegments.push({
              generatedCodeLine: generatedCodeLine,
              generatedCodeColumn: generatedCodeColumn,
              sourceCodeLine: sourceCodeLine,
              sourceCodeColumn: sourceCodeColumn,
              sourceCodeName: -1,
              sourceIndex: sourceIndex
            });
          }
          if (original[originalCharIndex] === '\n') {
            sourceCodeLine += 1;
            sourceCodeColumn = 0;
            generatedCodeLine += 1;
            rawLines[generatedCodeLine] = rawSegments = [];
            generatedCodeColumn = 0;
          } else {
            sourceCodeColumn += 1;
            generatedCodeColumn += 1;
          }
          originalCharIndex += 1;
          first = false;
        }
      }
      for (var i = 0; i < patches.length; i += 1) {
        var patch = patches[i];
        var addSegmentForPatch = patch.storeName || patch.start > originalCharIndex;
        addSegmentsUntil(patch.start);
        if (addSegmentForPatch) {
          rawSegments.push({
            generatedCodeLine: generatedCodeLine,
            generatedCodeColumn: generatedCodeColumn,
            sourceCodeLine: sourceCodeLine,
            sourceCodeColumn: sourceCodeColumn,
            sourceCodeName: patch.storeName ? names.indexOf(patch.original) : -1,
            sourceIndex: sourceIndex
          });
        }
        var lines = patch.content.split('\n');
        var lastLine = lines.pop();
        if (lines.length) {
          generatedCodeLine += lines.length;
          rawLines[generatedCodeLine] = rawSegments = [];
          generatedCodeColumn = lastLine.length;
        } else {
          generatedCodeColumn += lastLine.length;
        }
        lines = patch.original.split('\n');
        lastLine = lines.pop();
        if (lines.length) {
          sourceCodeLine += lines.length;
          sourceCodeColumn = lastLine.length;
        } else {
          sourceCodeColumn += lastLine.length;
        }
        originalCharIndex = patch.end;
      }
      addSegmentsUntil(original.length);
      offsets.sourceIndex = offsets.sourceIndex || 0;
      offsets.sourceCodeLine = offsets.sourceCodeLine || 0;
      offsets.sourceCodeColumn = offsets.sourceCodeColumn || 0;
      offsets.sourceCodeName = offsets.sourceCodeName || 0;
      var encoded = rawLines.map(function(segments) {
        var generatedCodeColumn = 0;
        return segments.map(function(segment) {
          var arr = [segment.generatedCodeColumn - generatedCodeColumn, segment.sourceIndex - offsets.sourceIndex, segment.sourceCodeLine - offsets.sourceCodeLine, segment.sourceCodeColumn - offsets.sourceCodeColumn];
          generatedCodeColumn = segment.generatedCodeColumn;
          offsets.sourceIndex = segment.sourceIndex;
          offsets.sourceCodeLine = segment.sourceCodeLine;
          offsets.sourceCodeColumn = segment.sourceCodeColumn;
          if (~segment.sourceCodeName) {
            arr.push(segment.sourceCodeName - offsets.sourceCodeName);
            offsets.sourceCodeName = segment.sourceCodeName;
          }
          return encode$1$1(arr);
        }).join(',');
      }).join(';');
      return encoded;
    }
    function getRelativePath(from, to) {
      var fromParts = from.split(/[\/\\]/);
      var toParts = to.split(/[\/\\]/);
      fromParts.pop();
      while (fromParts[0] === toParts[0]) {
        fromParts.shift();
        toParts.shift();
      }
      if (fromParts.length) {
        var i = fromParts.length;
        while (i--) {
          fromParts[i] = '..';
        }
      }
      return fromParts.concat(toParts).join('/');
    }
    var toString = Object.prototype.toString;
    function isObject(thing) {
      return toString.call(thing) === '[object Object]';
    }
    var warned = false;
    function MagicString(string) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      Object.defineProperties(this, {
        original: {
          writable: true,
          value: string
        },
        outro: {
          writable: true,
          value: ''
        },
        intro: {
          writable: true,
          value: ''
        },
        patches: {
          writable: true,
          value: []
        },
        filename: {
          writable: true,
          value: options.filename
        },
        indentExclusionRanges: {
          writable: true,
          value: options.indentExclusionRanges
        },
        sourcemapLocations: {
          writable: true,
          value: {}
        },
        storedNames: {
          writable: true,
          value: {}
        },
        indentStr: {
          writable: true,
          value: guessIndent(string)
        }
      });
    }
    MagicString.prototype = {
      addSourcemapLocation: function addSourcemapLocation(char) {
        this.sourcemapLocations[char] = true;
      },
      append: function append(content) {
        if (typeof content !== 'string')
          throw new TypeError('outro content must be a string');
        this.outro += content;
        return this;
      },
      clone: function clone() {
        var cloned = new MagicString(this.original, {filename: this.filename});
        cloned.patches = this.patches.map(function(patch) {
          return patch.clone();
        });
        if (this.indentExclusionRanges) {
          cloned.indentExclusionRanges = typeof this.indentExclusionRanges[0] === 'number' ? [this.indentExclusionRanges[0], this.indentExclusionRanges[1]] : this.indentExclusionRanges.map(function(range) {
            return [range.start, range.end];
          });
        }
        Object.keys(this.sourcemapLocations).forEach(function(loc) {
          cloned.sourcemapLocations[loc] = true;
        });
        return cloned;
      },
      generateMap: function generateMap(options) {
        options = options || {};
        var names = Object.keys(this.storedNames);
        return new SourceMap({
          file: options.file ? options.file.split(/[\/\\]/).pop() : null,
          sources: [options.source ? getRelativePath(options.file || '', options.source) : null],
          sourcesContent: options.includeContent ? [this.original] : [null],
          names: names,
          mappings: this.getMappings(options.hires, 0, {}, names)
        });
      },
      getIndentString: function getIndentString() {
        return this.indentStr === null ? '\t' : this.indentStr;
      },
      getMappings: function getMappings(hires, sourceIndex, offsets, names) {
        return encodeMappings(this.original, this.intro, this.patches, hires, this.sourcemapLocations, sourceIndex, offsets, names);
      },
      indent: function indent(indentStr, options) {
        var _this = this;
        var pattern = /^[^\r\n]/gm;
        if (isObject(indentStr)) {
          options = indentStr;
          indentStr = undefined;
        }
        indentStr = indentStr !== undefined ? indentStr : this.indentStr || '\t';
        if (indentStr === '')
          return this;
        options = options || {};
        var isExcluded = {};
        if (options.exclude) {
          var exclusions = typeof options.exclude[0] === 'number' ? [options.exclude] : options.exclude;
          exclusions.forEach(function(exclusion) {
            for (var i = exclusion[0]; i < exclusion[1]; i += 1) {
              isExcluded[i] = true;
            }
          });
        }
        var shouldIndentNextCharacter = options.indentStart !== false;
        var replacer = function replacer(match) {
          if (shouldIndentNextCharacter)
            return '' + indentStr + match;
          shouldIndentNextCharacter = true;
          return match;
        };
        this.intro = this.intro.replace(pattern, replacer);
        var charIndex = 0;
        var patchIndex = 0;
        var indentUntil = function indentUntil(end) {
          while (charIndex < end) {
            if (!isExcluded[charIndex]) {
              var char = _this.original[charIndex];
              if (char === '\n') {
                shouldIndentNextCharacter = true;
              } else if (char !== '\r' && shouldIndentNextCharacter) {
                _this.patches.splice(patchIndex, 0, new Patch(charIndex, charIndex, indentStr, '', false));
                shouldIndentNextCharacter = false;
                patchIndex += 1;
              }
            }
            charIndex += 1;
          }
        };
        for (; patchIndex < this.patches.length; patchIndex += 1) {
          var patch = this.patches[patchIndex];
          indentUntil(patch.start);
          if (!isExcluded[charIndex]) {
            patch.content = patch.content.replace(pattern, replacer);
            if (patch.content.length) {
              shouldIndentNextCharacter = patch.content[patch.content.length - 1] === '\n';
            }
          }
          charIndex = patch.end;
        }
        indentUntil(this.original.length);
        this.outro = this.outro.replace(pattern, replacer);
        return this;
      },
      insert: function insert(index, content) {
        if (typeof content !== 'string') {
          throw new TypeError('inserted content must be a string');
        }
        this.patch(index, index, content);
        return this;
      },
      locate: function locate(character) {
        throw new Error('magicString.locate is deprecated');
      },
      locateOrigin: function locateOrigin(character) {
        throw new Error('magicString.locateOrigin is deprecated');
      },
      overwrite: function overwrite(start, end, content, storeName) {
        if (typeof content !== 'string') {
          throw new TypeError('replacement content must be a string');
        }
        this.patch(start, end, content, storeName);
        return this;
      },
      patch: function patch(start, end, content, storeName) {
        var original = this.original.slice(start, end);
        if (storeName)
          this.storedNames[original] = true;
        var i = this.patches.length;
        while (i--) {
          var previous = this.patches[i];
          if (start !== end && start <= previous.start && end >= previous.end) {
            if (previous.start === previous.end && previous.start === start)
              break;
            if (previous.start === previous.end && previous.end === end)
              continue;
            this.patches.splice(i, 1);
          } else if (start < previous.end && end > previous.start) {
            if (!previous.content.length && !content.length) {
              previous.start = Math.min(start, previous.start);
              previous.end = Math.max(end, previous.end);
              return;
            }
            throw new Error('Cannot overwrite the same content twice: \'' + original + '\'');
          } else if (start >= previous.end) {
            break;
          }
        }
        var patch = new Patch(start, end, content, original, storeName);
        this.patches.splice(i + 1, 0, patch);
        return patch;
      },
      prepend: function prepend(content) {
        if (typeof content !== 'string')
          throw new TypeError('outro content must be a string');
        this.intro = content + this.intro;
        return this;
      },
      remove: function remove(start, end) {
        if (start < 0 || end > this.original.length) {
          throw new Error('Character is out of bounds');
        }
        this.patch(start, end, '');
        return this;
      },
      replace: function replace(start, end, content) {
        if (!warned) {
          console.warn('magicString.replace(...) is deprecated. Use magicString.overwrite(...) instead');
          warned = true;
        }
        return this.overwrite(start, end, content);
      },
      slice: function slice(start) {
        var end = arguments.length <= 1 || arguments[1] === undefined ? this.original.length : arguments[1];
        while (start < 0) {
          start += this.original.length;
        }
        while (end < 0) {
          end += this.original.length;
        }
        var firstPatchIndex = 0;
        var lastPatchIndex = this.patches.length;
        while (lastPatchIndex--) {
          var patch = this.patches[lastPatchIndex];
          if (end >= patch.start && end < patch.end)
            throw new Error('Cannot use replaced characters (' + start + ', ' + end + ') as slice anchors');
          if (patch.start > end)
            continue;
          break;
        }
        for (firstPatchIndex = 0; firstPatchIndex <= lastPatchIndex; firstPatchIndex += 1) {
          var patch = this.patches[firstPatchIndex];
          if (start > patch.start && start <= patch.end)
            throw new Error('Cannot use replaced characters (' + start + ', ' + end + ') as slice anchors');
          if (start <= patch.start) {
            break;
          }
        }
        var result = '';
        var lastIndex = start;
        for (var i = firstPatchIndex; i <= lastPatchIndex; i += 1) {
          var patch = this.patches[i];
          result += this.original.slice(lastIndex, patch.start);
          result += patch.content;
          lastIndex = patch.end;
        }
        result += this.original.slice(lastIndex, end);
        return result;
      },
      snip: function snip(start, end) {
        var clone = this.clone();
        clone.remove(0, start);
        clone.remove(end, clone.original.length);
        return clone;
      },
      toString: function toString() {
        return this.intro + this.slice(0, this.original.length) + this.outro;
      },
      trimLines: function trimLines() {
        return this.trim('[\\r\\n]');
      },
      trim: function trim(charType) {
        return this.trimStart(charType).trimEnd(charType);
      },
      trimEnd: function trimEnd(charType) {
        var rx = new RegExp((charType || '\\s') + '+$');
        this.outro = this.outro.replace(rx, '');
        if (this.outro.length)
          return this;
        var charIndex = this.original.length;
        var i = this.patches.length;
        while (i--) {
          var patch = this.patches[i];
          if (charIndex > patch.end) {
            var _slice = this.original.slice(patch.end, charIndex);
            var _match = rx.exec(_slice);
            if (_match) {
              this.patch(charIndex - _match[0].length, charIndex, '');
            }
            if (!_match || _match[0].length < _slice.length) {
              return this;
            }
          }
          patch.content = patch.content.replace(rx, '');
          if (patch.content)
            return this;
          charIndex = patch.start;
        }
        var slice = this.original.slice(0, charIndex);
        var match = rx.exec(slice);
        if (match)
          this.patch(charIndex - match[0].length, charIndex, '');
        return this;
      },
      trimStart: function trimStart(charType) {
        var rx = new RegExp('^' + (charType || '\\s') + '+');
        this.intro = this.intro.replace(rx, '');
        if (this.intro.length)
          return this;
        var charIndex = 0;
        for (var i = 0; i < this.patches.length; i += 1) {
          var patch = this.patches[i];
          if (charIndex < patch.start) {
            var _slice2 = this.original.slice(charIndex, patch.start);
            var _match2 = rx.exec(_slice2);
            if (_match2)
              this.patch(charIndex, charIndex + _match2[0].length, '');
            if (!_match2 || _match2[0].length < _slice2.length) {
              return this;
            }
          }
          patch.content = patch.content.replace(rx, '');
          if (patch.content)
            return this;
          charIndex = patch.end;
        }
        var slice = this.original.slice(charIndex, this.original.length);
        var match = rx.exec(slice);
        if (match)
          this.patch(charIndex, charIndex + match[0].length, '');
        return this;
      }
    };
    var hasOwnProp = Object.prototype.hasOwnProperty;
    function Bundle$1() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      this.intro = options.intro || '';
      this.separator = options.separator !== undefined ? options.separator : '\n';
      this.sources = [];
      this.uniqueSources = [];
      this.uniqueSourceIndexByFilename = {};
    }
    Bundle$1.prototype = {
      addSource: function addSource(source) {
        if (source instanceof MagicString) {
          return this.addSource({
            content: source,
            filename: source.filename,
            separator: this.separator
          });
        }
        if (!isObject(source) || !source.content) {
          throw new Error('bundle.addSource() takes an object with a `content` property, which should be an instance of MagicString, and an optional `filename`');
        }
        ['filename', 'indentExclusionRanges', 'separator'].forEach(function(option) {
          if (!hasOwnProp.call(source, option))
            source[option] = source.content[option];
        });
        if (source.separator === undefined) {
          source.separator = this.separator;
        }
        if (source.filename) {
          if (!hasOwnProp.call(this.uniqueSourceIndexByFilename, source.filename)) {
            this.uniqueSourceIndexByFilename[source.filename] = this.uniqueSources.length;
            this.uniqueSources.push({
              filename: source.filename,
              content: source.content.original
            });
          } else {
            var uniqueSource = this.uniqueSources[this.uniqueSourceIndexByFilename[source.filename]];
            if (source.content.original !== uniqueSource.content) {
              throw new Error('Illegal source: same filename (' + source.filename + '), different contents');
            }
          }
        }
        this.sources.push(source);
        return this;
      },
      append: function append(str, options) {
        this.addSource({
          content: new MagicString(str),
          separator: options && options.separator || ''
        });
        return this;
      },
      clone: function clone() {
        var bundle = new Bundle$1({
          intro: this.intro,
          separator: this.separator
        });
        this.sources.forEach(function(source) {
          bundle.addSource({
            filename: source.filename,
            content: source.content.clone(),
            separator: source.separator
          });
        });
        return bundle;
      },
      generateMap: function generateMap(options) {
        var _this = this;
        var offsets = {};
        var names = [];
        this.sources.forEach(function(source) {
          Object.keys(source.content.storedNames).forEach(function(name) {
            if (!~names.indexOf(name))
              names.push(name);
          });
        });
        var encoded = getSemis(this.intro) + this.sources.map(function(source, i) {
          var prefix = i > 0 ? getSemis(source.separator) || ',' : '';
          var mappings = undefined;
          if (!source.filename) {
            mappings = getSemis(source.content.toString());
          } else {
            var sourceIndex = _this.uniqueSourceIndexByFilename[source.filename];
            mappings = source.content.getMappings(options.hires, sourceIndex, offsets, names);
          }
          return prefix + mappings;
        }).join('');
        return new SourceMap({
          file: options.file ? options.file.split(/[\/\\]/).pop() : null,
          sources: this.uniqueSources.map(function(source) {
            return options.file ? getRelativePath(options.file, source.filename) : source.filename;
          }),
          sourcesContent: this.uniqueSources.map(function(source) {
            return options.includeContent ? source.content : null;
          }),
          names: names,
          mappings: encoded
        });
      },
      getIndentString: function getIndentString() {
        var indentStringCounts = {};
        this.sources.forEach(function(source) {
          var indentStr = source.content.indentStr;
          if (indentStr === null)
            return;
          if (!indentStringCounts[indentStr])
            indentStringCounts[indentStr] = 0;
          indentStringCounts[indentStr] += 1;
        });
        return Object.keys(indentStringCounts).sort(function(a, b) {
          return indentStringCounts[a] - indentStringCounts[b];
        })[0] || '\t';
      },
      indent: function indent(indentStr) {
        var _this2 = this;
        if (!arguments.length) {
          indentStr = this.getIndentString();
        }
        if (indentStr === '')
          return this;
        var trailingNewline = !this.intro || this.intro.slice(-1) === '\n';
        this.sources.forEach(function(source, i) {
          var separator = source.separator !== undefined ? source.separator : _this2.separator;
          var indentStart = trailingNewline || i > 0 && /\r?\n$/.test(separator);
          source.content.indent(indentStr, {
            exclude: source.indentExclusionRanges,
            indentStart: indentStart
          });
          trailingNewline = source.content.toString().slice(0, -1) === '\n';
        });
        if (this.intro) {
          this.intro = indentStr + this.intro.replace(/^[^\n]/gm, function(match, index) {
            return index > 0 ? indentStr + match : match;
          });
        }
        return this;
      },
      prepend: function prepend(str) {
        this.intro = str + this.intro;
        return this;
      },
      toString: function toString() {
        var _this3 = this;
        var body = this.sources.map(function(source, i) {
          var separator = source.separator !== undefined ? source.separator : _this3.separator;
          var str = (i > 0 ? separator : '') + source.content.toString();
          return str;
        }).join('');
        return this.intro + body;
      },
      trimLines: function trimLines() {
        return this.trim('[\\r\\n]');
      },
      trim: function trim(charType) {
        return this.trimStart(charType).trimEnd(charType);
      },
      trimStart: function trimStart(charType) {
        var rx = new RegExp('^' + (charType || '\\s') + '+');
        this.intro = this.intro.replace(rx, '');
        if (!this.intro) {
          var source = undefined;
          var i = 0;
          do {
            source = this.sources[i];
            if (!source) {
              break;
            }
            source.content.trimStart(charType);
            i += 1;
          } while (source.content.toString() === '');
        }
        return this;
      },
      trimEnd: function trimEnd(charType) {
        var rx = new RegExp((charType || '\\s') + '+$');
        var source = undefined;
        var i = this.sources.length - 1;
        do {
          source = this.sources[i];
          if (!source) {
            this.intro = this.intro.replace(rx, '');
            break;
          }
          source.content.trimEnd(charType);
          i -= 1;
        } while (source.content.toString() === '');
        return this;
      }
    };
    function getSemis(str) {
      return new Array(str.split('\n').length).join(';');
    }
    MagicString.Bundle = Bundle$1;
    function first(candidates) {
      return function() {
        for (var _len = arguments.length,
            args = Array(_len),
            _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return candidates.reduce(function(promise, candidate) {
          return promise.then(function(result) {
            return result != null ? result : Promise.resolve(candidate.apply(undefined, args));
          });
        }, Promise.resolve());
      };
    }
    var reservedWords$1 = {
      3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
      5: "class enum extends super const export import",
      6: "enum",
      strict: "implements interface let package private protected public static yield",
      strictBind: "eval arguments"
    };
    var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
    var keywords = {
      5: ecma5AndLessKeywords,
      6: ecma5AndLessKeywords + " let const class extends export import yield super"
    };
    var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b2\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua7ad\ua7b0\ua7b1\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab5f\uab64\uab65\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
    var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d01-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf8\u1cf9\u1dc0-\u1df5\u1dfc-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2d\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
    nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
    var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 98, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 955, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 38, 17, 2, 24, 133, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 32, 4, 287, 47, 21, 1, 2, 0, 185, 46, 82, 47, 21, 0, 60, 42, 502, 63, 32, 0, 449, 56, 1288, 920, 104, 110, 2962, 1070, 13266, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 16355, 541];
    var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 16, 9, 83, 11, 168, 11, 6, 9, 8, 2, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 112, 16, 16, 9, 82, 12, 9, 9, 535, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 4305, 6, 792618, 239];
    function isInAstralSet(code, set) {
      var pos = 0x10000;
      for (var i = 0; i < set.length; i += 2) {
        pos += set[i];
        if (pos > code)
          return false;
        pos += set[i + 1];
        if (pos >= code)
          return true;
      }
    }
    function isIdentifierStart(code, astral) {
      if (code < 65)
        return code === 36;
      if (code < 91)
        return true;
      if (code < 97)
        return code === 95;
      if (code < 123)
        return true;
      if (code <= 0xffff)
        return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
      if (astral === false)
        return false;
      return isInAstralSet(code, astralIdentifierStartCodes);
    }
    function isIdentifierChar(code, astral) {
      if (code < 48)
        return code === 36;
      if (code < 58)
        return true;
      if (code < 65)
        return false;
      if (code < 91)
        return true;
      if (code < 97)
        return code === 95;
      if (code < 123)
        return true;
      if (code <= 0xffff)
        return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
      if (astral === false)
        return false;
      return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
    }
    var TokenType = function TokenType(label) {
      var conf = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      babelHelpers.classCallCheck(this, TokenType);
      this.label = label;
      this.keyword = conf.keyword;
      this.beforeExpr = !!conf.beforeExpr;
      this.startsExpr = !!conf.startsExpr;
      this.isLoop = !!conf.isLoop;
      this.isAssign = !!conf.isAssign;
      this.prefix = !!conf.prefix;
      this.postfix = !!conf.postfix;
      this.binop = conf.binop || null;
      this.updateContext = null;
    };
    function binop(name, prec) {
      return new TokenType(name, {
        beforeExpr: true,
        binop: prec
      });
    }
    var beforeExpr = {beforeExpr: true};
    var startsExpr = {startsExpr: true};
    var tt = {
      num: new TokenType("num", startsExpr),
      regexp: new TokenType("regexp", startsExpr),
      string: new TokenType("string", startsExpr),
      name: new TokenType("name", startsExpr),
      eof: new TokenType("eof"),
      bracketL: new TokenType("[", {
        beforeExpr: true,
        startsExpr: true
      }),
      bracketR: new TokenType("]"),
      braceL: new TokenType("{", {
        beforeExpr: true,
        startsExpr: true
      }),
      braceR: new TokenType("}"),
      parenL: new TokenType("(", {
        beforeExpr: true,
        startsExpr: true
      }),
      parenR: new TokenType(")"),
      comma: new TokenType(",", beforeExpr),
      semi: new TokenType(";", beforeExpr),
      colon: new TokenType(":", beforeExpr),
      dot: new TokenType("."),
      question: new TokenType("?", beforeExpr),
      arrow: new TokenType("=>", beforeExpr),
      template: new TokenType("template"),
      ellipsis: new TokenType("...", beforeExpr),
      backQuote: new TokenType("`", startsExpr),
      dollarBraceL: new TokenType("${", {
        beforeExpr: true,
        startsExpr: true
      }),
      eq: new TokenType("=", {
        beforeExpr: true,
        isAssign: true
      }),
      assign: new TokenType("_=", {
        beforeExpr: true,
        isAssign: true
      }),
      incDec: new TokenType("++/--", {
        prefix: true,
        postfix: true,
        startsExpr: true
      }),
      prefix: new TokenType("prefix", {
        beforeExpr: true,
        prefix: true,
        startsExpr: true
      }),
      logicalOR: binop("||", 1),
      logicalAND: binop("&&", 2),
      bitwiseOR: binop("|", 3),
      bitwiseXOR: binop("^", 4),
      bitwiseAND: binop("&", 5),
      equality: binop("==/!=", 6),
      relational: binop("</>", 7),
      bitShift: binop("<</>>", 8),
      plusMin: new TokenType("+/-", {
        beforeExpr: true,
        binop: 9,
        prefix: true,
        startsExpr: true
      }),
      modulo: binop("%", 10),
      star: binop("*", 10),
      slash: binop("/", 10)
    };
    var keywordTypes = {};
    function kw(name) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      options.keyword = name;
      keywordTypes[name] = tt["_" + name] = new TokenType(name, options);
    }
    kw("break");
    kw("case", beforeExpr);
    kw("catch");
    kw("continue");
    kw("debugger");
    kw("default", beforeExpr);
    kw("do", {
      isLoop: true,
      beforeExpr: true
    });
    kw("else", beforeExpr);
    kw("finally");
    kw("for", {isLoop: true});
    kw("function", startsExpr);
    kw("if");
    kw("return", beforeExpr);
    kw("switch");
    kw("throw", beforeExpr);
    kw("try");
    kw("var");
    kw("let");
    kw("const");
    kw("while", {isLoop: true});
    kw("with");
    kw("new", {
      beforeExpr: true,
      startsExpr: true
    });
    kw("this", startsExpr);
    kw("super", startsExpr);
    kw("class");
    kw("extends", beforeExpr);
    kw("export");
    kw("import");
    kw("yield", {
      beforeExpr: true,
      startsExpr: true
    });
    kw("null", startsExpr);
    kw("true", startsExpr);
    kw("false", startsExpr);
    kw("in", {
      beforeExpr: true,
      binop: 7
    });
    kw("instanceof", {
      beforeExpr: true,
      binop: 7
    });
    kw("typeof", {
      beforeExpr: true,
      prefix: true,
      startsExpr: true
    });
    kw("void", {
      beforeExpr: true,
      prefix: true,
      startsExpr: true
    });
    kw("delete", {
      beforeExpr: true,
      prefix: true,
      startsExpr: true
    });
    var lineBreak = /\r\n?|\n|\u2028|\u2029/;
    var lineBreakG = new RegExp(lineBreak.source, "g");
    function isNewLine(code) {
      return code === 10 || code === 13 || code === 0x2028 || code == 0x2029;
    }
    var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
    function isArray$1(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    }
    function has(obj, propName) {
      return Object.prototype.hasOwnProperty.call(obj, propName);
    }
    var Position = (function() {
      function Position(line, col) {
        babelHelpers.classCallCheck(this, Position);
        this.line = line;
        this.column = col;
      }
      Position.prototype.offset = function offset(n) {
        return new Position(this.line, this.column + n);
      };
      return Position;
    })();
    var SourceLocation = function SourceLocation(p, start, end) {
      babelHelpers.classCallCheck(this, SourceLocation);
      this.start = start;
      this.end = end;
      if (p.sourceFile !== null)
        this.source = p.sourceFile;
    };
    ;
    function getLineInfo(input, offset) {
      for (var line = 1,
          cur = 0; ; ) {
        lineBreakG.lastIndex = cur;
        var match = lineBreakG.exec(input);
        if (match && match.index < offset) {
          ++line;
          cur = match.index + match[0].length;
        } else {
          return new Position(line, offset - cur);
        }
      }
    }
    var defaultOptions = {
      ecmaVersion: 5,
      sourceType: "script",
      onInsertedSemicolon: null,
      onTrailingComma: null,
      allowReserved: null,
      allowReturnOutsideFunction: false,
      allowImportExportEverywhere: false,
      allowHashBang: false,
      locations: false,
      onToken: null,
      onComment: null,
      ranges: false,
      program: null,
      sourceFile: null,
      directSourceFile: null,
      preserveParens: false,
      plugins: {}
    };
    function getOptions(opts) {
      var options = {};
      for (var opt in defaultOptions) {
        options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
      }
      if (options.allowReserved == null)
        options.allowReserved = options.ecmaVersion < 5;
      if (isArray$1(options.onToken)) {
        (function() {
          var tokens = options.onToken;
          options.onToken = function(token) {
            return tokens.push(token);
          };
        })();
      }
      if (isArray$1(options.onComment))
        options.onComment = pushComment(options, options.onComment);
      return options;
    }
    function pushComment(options, array) {
      return function(block, text, start, end, startLoc, endLoc) {
        var comment = {
          type: block ? 'Block' : 'Line',
          value: text,
          start: start,
          end: end
        };
        if (options.locations)
          comment.loc = new SourceLocation(this, startLoc, endLoc);
        if (options.ranges)
          comment.range = [start, end];
        array.push(comment);
      };
    }
    var plugins = {};
    function keywordRegexp(words) {
      return new RegExp("^(" + words.replace(/ /g, "|") + ")$");
    }
    var Parser = (function() {
      function Parser(options, input, startPos) {
        babelHelpers.classCallCheck(this, Parser);
        this.options = options = getOptions(options);
        this.sourceFile = options.sourceFile;
        this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5]);
        var reserved = options.allowReserved ? "" : reservedWords$1[options.ecmaVersion] + (options.sourceType == "module" ? " await" : "");
        this.reservedWords = keywordRegexp(reserved);
        var reservedStrict = (reserved ? reserved + " " : "") + reservedWords$1.strict;
        this.reservedWordsStrict = keywordRegexp(reservedStrict);
        this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords$1.strictBind);
        this.input = String(input);
        this.containsEsc = false;
        this.loadPlugins(options.plugins);
        if (startPos) {
          this.pos = startPos;
          this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos));
          this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
        } else {
          this.pos = this.lineStart = 0;
          this.curLine = 1;
        }
        this.type = tt.eof;
        this.value = null;
        this.start = this.end = this.pos;
        this.startLoc = this.endLoc = this.curPosition();
        this.lastTokEndLoc = this.lastTokStartLoc = null;
        this.lastTokStart = this.lastTokEnd = this.pos;
        this.context = this.initialContext();
        this.exprAllowed = true;
        this.strict = this.inModule = options.sourceType === "module";
        this.potentialArrowAt = -1;
        this.inFunction = this.inGenerator = false;
        this.labels = [];
        if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!')
          this.skipLineComment(2);
      }
      Parser.prototype.isKeyword = function isKeyword(word) {
        return this.keywords.test(word);
      };
      Parser.prototype.isReservedWord = function isReservedWord(word) {
        return this.reservedWords.test(word);
      };
      Parser.prototype.extend = function extend(name, f) {
        this[name] = f(this[name]);
      };
      Parser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
        for (var _name in pluginConfigs) {
          var plugin = plugins[_name];
          if (!plugin)
            throw new Error("Plugin '" + _name + "' not found");
          plugin(this, pluginConfigs[_name]);
        }
      };
      Parser.prototype.parse = function parse() {
        var node = this.options.program || this.startNode();
        this.nextToken();
        return this.parseTopLevel(node);
      };
      return Parser;
    })();
    var pp = Parser.prototype;
    pp.isUseStrict = function(stmt) {
      return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.raw.slice(1, -1) === "use strict";
    };
    pp.eat = function(type) {
      if (this.type === type) {
        this.next();
        return true;
      } else {
        return false;
      }
    };
    pp.isContextual = function(name) {
      return this.type === tt.name && this.value === name;
    };
    pp.eatContextual = function(name) {
      return this.value === name && this.eat(tt.name);
    };
    pp.expectContextual = function(name) {
      if (!this.eatContextual(name))
        this.unexpected();
    };
    pp.canInsertSemicolon = function() {
      return this.type === tt.eof || this.type === tt.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    };
    pp.insertSemicolon = function() {
      if (this.canInsertSemicolon()) {
        if (this.options.onInsertedSemicolon)
          this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
        return true;
      }
    };
    pp.semicolon = function() {
      if (!this.eat(tt.semi) && !this.insertSemicolon())
        this.unexpected();
    };
    pp.afterTrailingComma = function(tokType) {
      if (this.type == tokType) {
        if (this.options.onTrailingComma)
          this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
        this.next();
        return true;
      }
    };
    pp.expect = function(type) {
      this.eat(type) || this.unexpected();
    };
    pp.unexpected = function(pos) {
      this.raise(pos != null ? pos : this.start, "Unexpected token");
    };
    pp.checkPatternErrors = function(refDestructuringErrors, andThrow) {
      var pos = refDestructuringErrors && refDestructuringErrors.trailingComma;
      if (!andThrow)
        return !!pos;
      if (pos)
        this.raise(pos, "Trailing comma is not permitted in destructuring patterns");
    };
    pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
      var pos = refDestructuringErrors && refDestructuringErrors.shorthandAssign;
      if (!andThrow)
        return !!pos;
      if (pos)
        this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns");
    };
    var pp$1 = Parser.prototype;
    pp$1.parseTopLevel = function(node) {
      var first = true;
      if (!node.body)
        node.body = [];
      while (this.type !== tt.eof) {
        var stmt = this.parseStatement(true, true);
        node.body.push(stmt);
        if (first) {
          if (this.isUseStrict(stmt))
            this.setStrict(true);
          first = false;
        }
      }
      this.next();
      if (this.options.ecmaVersion >= 6) {
        node.sourceType = this.options.sourceType;
      }
      return this.finishNode(node, "Program");
    };
    var loopLabel = {kind: "loop"};
    var switchLabel = {kind: "switch"};
    pp$1.parseStatement = function(declaration, topLevel) {
      var starttype = this.type,
          node = this.startNode();
      switch (starttype) {
        case tt._break:
        case tt._continue:
          return this.parseBreakContinueStatement(node, starttype.keyword);
        case tt._debugger:
          return this.parseDebuggerStatement(node);
        case tt._do:
          return this.parseDoStatement(node);
        case tt._for:
          return this.parseForStatement(node);
        case tt._function:
          if (!declaration && this.options.ecmaVersion >= 6)
            this.unexpected();
          return this.parseFunctionStatement(node);
        case tt._class:
          if (!declaration)
            this.unexpected();
          return this.parseClass(node, true);
        case tt._if:
          return this.parseIfStatement(node);
        case tt._return:
          return this.parseReturnStatement(node);
        case tt._switch:
          return this.parseSwitchStatement(node);
        case tt._throw:
          return this.parseThrowStatement(node);
        case tt._try:
          return this.parseTryStatement(node);
        case tt._let:
        case tt._const:
          if (!declaration)
            this.unexpected();
        case tt._var:
          return this.parseVarStatement(node, starttype);
        case tt._while:
          return this.parseWhileStatement(node);
        case tt._with:
          return this.parseWithStatement(node);
        case tt.braceL:
          return this.parseBlock();
        case tt.semi:
          return this.parseEmptyStatement(node);
        case tt._export:
        case tt._import:
          if (!this.options.allowImportExportEverywhere) {
            if (!topLevel)
              this.raise(this.start, "'import' and 'export' may only appear at the top level");
            if (!this.inModule)
              this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
          }
          return starttype === tt._import ? this.parseImport(node) : this.parseExport(node);
        default:
          var maybeName = this.value,
              expr = this.parseExpression();
          if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon))
            return this.parseLabeledStatement(node, maybeName, expr);
          else
            return this.parseExpressionStatement(node, expr);
      }
    };
    pp$1.parseBreakContinueStatement = function(node, keyword) {
      var isBreak = keyword == "break";
      this.next();
      if (this.eat(tt.semi) || this.insertSemicolon())
        node.label = null;
      else if (this.type !== tt.name)
        this.unexpected();
      else {
        node.label = this.parseIdent();
        this.semicolon();
      }
      for (var i = 0; i < this.labels.length; ++i) {
        var lab = this.labels[i];
        if (node.label == null || lab.name === node.label.name) {
          if (lab.kind != null && (isBreak || lab.kind === "loop"))
            break;
          if (node.label && isBreak)
            break;
        }
      }
      if (i === this.labels.length)
        this.raise(node.start, "Unsyntactic " + keyword);
      return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
    };
    pp$1.parseDebuggerStatement = function(node) {
      this.next();
      this.semicolon();
      return this.finishNode(node, "DebuggerStatement");
    };
    pp$1.parseDoStatement = function(node) {
      this.next();
      this.labels.push(loopLabel);
      node.body = this.parseStatement(false);
      this.labels.pop();
      this.expect(tt._while);
      node.test = this.parseParenExpression();
      if (this.options.ecmaVersion >= 6)
        this.eat(tt.semi);
      else
        this.semicolon();
      return this.finishNode(node, "DoWhileStatement");
    };
    pp$1.parseForStatement = function(node) {
      this.next();
      this.labels.push(loopLabel);
      this.expect(tt.parenL);
      if (this.type === tt.semi)
        return this.parseFor(node, null);
      if (this.type === tt._var || this.type === tt._let || this.type === tt._const) {
        var _init = this.startNode(),
            varKind = this.type;
        this.next();
        this.parseVar(_init, true, varKind);
        this.finishNode(_init, "VariableDeclaration");
        if ((this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1 && !(varKind !== tt._var && _init.declarations[0].init))
          return this.parseForIn(node, _init);
        return this.parseFor(node, _init);
      }
      var refDestructuringErrors = {
        shorthandAssign: 0,
        trailingComma: 0
      };
      var init = this.parseExpression(true, refDestructuringErrors);
      if (this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
        this.checkPatternErrors(refDestructuringErrors, true);
        this.toAssignable(init);
        this.checkLVal(init);
        return this.parseForIn(node, init);
      } else {
        this.checkExpressionErrors(refDestructuringErrors, true);
      }
      return this.parseFor(node, init);
    };
    pp$1.parseFunctionStatement = function(node) {
      this.next();
      return this.parseFunction(node, true);
    };
    pp$1.parseIfStatement = function(node) {
      this.next();
      node.test = this.parseParenExpression();
      node.consequent = this.parseStatement(false);
      node.alternate = this.eat(tt._else) ? this.parseStatement(false) : null;
      return this.finishNode(node, "IfStatement");
    };
    pp$1.parseReturnStatement = function(node) {
      if (!this.inFunction && !this.options.allowReturnOutsideFunction)
        this.raise(this.start, "'return' outside of function");
      this.next();
      if (this.eat(tt.semi) || this.insertSemicolon())
        node.argument = null;
      else {
        node.argument = this.parseExpression();
        this.semicolon();
      }
      return this.finishNode(node, "ReturnStatement");
    };
    pp$1.parseSwitchStatement = function(node) {
      this.next();
      node.discriminant = this.parseParenExpression();
      node.cases = [];
      this.expect(tt.braceL);
      this.labels.push(switchLabel);
      for (var cur,
          sawDefault = false; this.type != tt.braceR; ) {
        if (this.type === tt._case || this.type === tt._default) {
          var isCase = this.type === tt._case;
          if (cur)
            this.finishNode(cur, "SwitchCase");
          node.cases.push(cur = this.startNode());
          cur.consequent = [];
          this.next();
          if (isCase) {
            cur.test = this.parseExpression();
          } else {
            if (sawDefault)
              this.raise(this.lastTokStart, "Multiple default clauses");
            sawDefault = true;
            cur.test = null;
          }
          this.expect(tt.colon);
        } else {
          if (!cur)
            this.unexpected();
          cur.consequent.push(this.parseStatement(true));
        }
      }
      if (cur)
        this.finishNode(cur, "SwitchCase");
      this.next();
      this.labels.pop();
      return this.finishNode(node, "SwitchStatement");
    };
    pp$1.parseThrowStatement = function(node) {
      this.next();
      if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
        this.raise(this.lastTokEnd, "Illegal newline after throw");
      node.argument = this.parseExpression();
      this.semicolon();
      return this.finishNode(node, "ThrowStatement");
    };
    var empty = [];
    pp$1.parseTryStatement = function(node) {
      this.next();
      node.block = this.parseBlock();
      node.handler = null;
      if (this.type === tt._catch) {
        var clause = this.startNode();
        this.next();
        this.expect(tt.parenL);
        clause.param = this.parseBindingAtom();
        this.checkLVal(clause.param, true);
        this.expect(tt.parenR);
        clause.body = this.parseBlock();
        node.handler = this.finishNode(clause, "CatchClause");
      }
      node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null;
      if (!node.handler && !node.finalizer)
        this.raise(node.start, "Missing catch or finally clause");
      return this.finishNode(node, "TryStatement");
    };
    pp$1.parseVarStatement = function(node, kind) {
      this.next();
      this.parseVar(node, false, kind);
      this.semicolon();
      return this.finishNode(node, "VariableDeclaration");
    };
    pp$1.parseWhileStatement = function(node) {
      this.next();
      node.test = this.parseParenExpression();
      this.labels.push(loopLabel);
      node.body = this.parseStatement(false);
      this.labels.pop();
      return this.finishNode(node, "WhileStatement");
    };
    pp$1.parseWithStatement = function(node) {
      if (this.strict)
        this.raise(this.start, "'with' in strict mode");
      this.next();
      node.object = this.parseParenExpression();
      node.body = this.parseStatement(false);
      return this.finishNode(node, "WithStatement");
    };
    pp$1.parseEmptyStatement = function(node) {
      this.next();
      return this.finishNode(node, "EmptyStatement");
    };
    pp$1.parseLabeledStatement = function(node, maybeName, expr) {
      for (var i = 0; i < this.labels.length; ++i) {
        if (this.labels[i].name === maybeName)
          this.raise(expr.start, "Label '" + maybeName + "' is already declared");
      }
      var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null;
      for (var i = this.labels.length - 1; i >= 0; i--) {
        var label = this.labels[i];
        if (label.statementStart == node.start) {
          label.statementStart = this.start;
          label.kind = kind;
        } else
          break;
      }
      this.labels.push({
        name: maybeName,
        kind: kind,
        statementStart: this.start
      });
      node.body = this.parseStatement(true);
      this.labels.pop();
      node.label = expr;
      return this.finishNode(node, "LabeledStatement");
    };
    pp$1.parseExpressionStatement = function(node, expr) {
      node.expression = expr;
      this.semicolon();
      return this.finishNode(node, "ExpressionStatement");
    };
    pp$1.parseBlock = function(allowStrict) {
      var node = this.startNode(),
          first = true,
          oldStrict = undefined;
      node.body = [];
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        var stmt = this.parseStatement(true);
        node.body.push(stmt);
        if (first && allowStrict && this.isUseStrict(stmt)) {
          oldStrict = this.strict;
          this.setStrict(this.strict = true);
        }
        first = false;
      }
      if (oldStrict === false)
        this.setStrict(false);
      return this.finishNode(node, "BlockStatement");
    };
    pp$1.parseFor = function(node, init) {
      node.init = init;
      this.expect(tt.semi);
      node.test = this.type === tt.semi ? null : this.parseExpression();
      this.expect(tt.semi);
      node.update = this.type === tt.parenR ? null : this.parseExpression();
      this.expect(tt.parenR);
      node.body = this.parseStatement(false);
      this.labels.pop();
      return this.finishNode(node, "ForStatement");
    };
    pp$1.parseForIn = function(node, init) {
      var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement";
      this.next();
      node.left = init;
      node.right = this.parseExpression();
      this.expect(tt.parenR);
      node.body = this.parseStatement(false);
      this.labels.pop();
      return this.finishNode(node, type);
    };
    pp$1.parseVar = function(node, isFor, kind) {
      node.declarations = [];
      node.kind = kind.keyword;
      for (; ; ) {
        var decl = this.startNode();
        this.parseVarId(decl);
        if (this.eat(tt.eq)) {
          decl.init = this.parseMaybeAssign(isFor);
        } else if (kind === tt._const && !(this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
          this.unexpected();
        } else if (decl.id.type != "Identifier" && !(isFor && (this.type === tt._in || this.isContextual("of")))) {
          this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
        } else {
          decl.init = null;
        }
        node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
        if (!this.eat(tt.comma))
          break;
      }
      return node;
    };
    pp$1.parseVarId = function(decl) {
      decl.id = this.parseBindingAtom();
      this.checkLVal(decl.id, true);
    };
    pp$1.parseFunction = function(node, isStatement, allowExpressionBody) {
      this.initFunction(node);
      if (this.options.ecmaVersion >= 6)
        node.generator = this.eat(tt.star);
      if (isStatement || this.type === tt.name)
        node.id = this.parseIdent();
      this.parseFunctionParams(node);
      this.parseFunctionBody(node, allowExpressionBody);
      return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
    };
    pp$1.parseFunctionParams = function(node) {
      this.expect(tt.parenL);
      node.params = this.parseBindingList(tt.parenR, false, false, true);
    };
    pp$1.parseClass = function(node, isStatement) {
      this.next();
      this.parseClassId(node, isStatement);
      this.parseClassSuper(node);
      var classBody = this.startNode();
      var hadConstructor = false;
      classBody.body = [];
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        if (this.eat(tt.semi))
          continue;
        var method = this.startNode();
        var isGenerator = this.eat(tt.star);
        var isMaybeStatic = this.type === tt.name && this.value === "static";
        this.parsePropertyName(method);
        method.static = isMaybeStatic && this.type !== tt.parenL;
        if (method.static) {
          if (isGenerator)
            this.unexpected();
          isGenerator = this.eat(tt.star);
          this.parsePropertyName(method);
        }
        method.kind = "method";
        var isGetSet = false;
        if (!method.computed) {
          var key = method.key;
          if (!isGenerator && key.type === "Identifier" && this.type !== tt.parenL && (key.name === "get" || key.name === "set")) {
            isGetSet = true;
            method.kind = key.name;
            key = this.parsePropertyName(method);
          }
          if (!method.static && (key.type === "Identifier" && key.name === "constructor" || key.type === "Literal" && key.value === "constructor")) {
            if (hadConstructor)
              this.raise(key.start, "Duplicate constructor in the same class");
            if (isGetSet)
              this.raise(key.start, "Constructor can't have get/set modifier");
            if (isGenerator)
              this.raise(key.start, "Constructor can't be a generator");
            method.kind = "constructor";
            hadConstructor = true;
          }
        }
        this.parseClassMethod(classBody, method, isGenerator);
        if (isGetSet) {
          var paramCount = method.kind === "get" ? 0 : 1;
          if (method.value.params.length !== paramCount) {
            var start = method.value.start;
            if (method.kind === "get")
              this.raise(start, "getter should have no params");
            else
              this.raise(start, "setter should have exactly one param");
          }
          if (method.kind === "set" && method.value.params[0].type === "RestElement")
            this.raise(method.value.params[0].start, "Setter cannot use rest params");
        }
      }
      node.body = this.finishNode(classBody, "ClassBody");
      return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
    };
    pp$1.parseClassMethod = function(classBody, method, isGenerator) {
      method.value = this.parseMethod(isGenerator);
      classBody.body.push(this.finishNode(method, "MethodDefinition"));
    };
    pp$1.parseClassId = function(node, isStatement) {
      node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
    };
    pp$1.parseClassSuper = function(node) {
      node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null;
    };
    pp$1.parseExport = function(node) {
      this.next();
      if (this.eat(tt.star)) {
        this.expectContextual("from");
        node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
        this.semicolon();
        return this.finishNode(node, "ExportAllDeclaration");
      }
      if (this.eat(tt._default)) {
        var expr = this.parseMaybeAssign();
        var needsSemi = true;
        if (expr.type == "FunctionExpression" || expr.type == "ClassExpression") {
          needsSemi = false;
          if (expr.id) {
            expr.type = expr.type == "FunctionExpression" ? "FunctionDeclaration" : "ClassDeclaration";
          }
        }
        node.declaration = expr;
        if (needsSemi)
          this.semicolon();
        return this.finishNode(node, "ExportDefaultDeclaration");
      }
      if (this.shouldParseExportStatement()) {
        node.declaration = this.parseStatement(true);
        node.specifiers = [];
        node.source = null;
      } else {
        node.declaration = null;
        node.specifiers = this.parseExportSpecifiers();
        if (this.eatContextual("from")) {
          node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
        } else {
          for (var i = 0; i < node.specifiers.length; i++) {
            if (this.keywords.test(node.specifiers[i].local.name) || this.reservedWords.test(node.specifiers[i].local.name)) {
              this.unexpected(node.specifiers[i].local.start);
            }
          }
          node.source = null;
        }
        this.semicolon();
      }
      return this.finishNode(node, "ExportNamedDeclaration");
    };
    pp$1.shouldParseExportStatement = function() {
      return this.type.keyword;
    };
    pp$1.parseExportSpecifiers = function() {
      var nodes = [],
          first = true;
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        if (!first) {
          this.expect(tt.comma);
          if (this.afterTrailingComma(tt.braceR))
            break;
        } else
          first = false;
        var node = this.startNode();
        node.local = this.parseIdent(this.type === tt._default);
        node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
        nodes.push(this.finishNode(node, "ExportSpecifier"));
      }
      return nodes;
    };
    pp$1.parseImport = function(node) {
      this.next();
      if (this.type === tt.string) {
        node.specifiers = empty;
        node.source = this.parseExprAtom();
      } else {
        node.specifiers = this.parseImportSpecifiers();
        this.expectContextual("from");
        node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
      }
      this.semicolon();
      return this.finishNode(node, "ImportDeclaration");
    };
    pp$1.parseImportSpecifiers = function() {
      var nodes = [],
          first = true;
      if (this.type === tt.name) {
        var node = this.startNode();
        node.local = this.parseIdent();
        this.checkLVal(node.local, true);
        nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
        if (!this.eat(tt.comma))
          return nodes;
      }
      if (this.type === tt.star) {
        var node = this.startNode();
        this.next();
        this.expectContextual("as");
        node.local = this.parseIdent();
        this.checkLVal(node.local, true);
        nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"));
        return nodes;
      }
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        if (!first) {
          this.expect(tt.comma);
          if (this.afterTrailingComma(tt.braceR))
            break;
        } else
          first = false;
        var node = this.startNode();
        node.imported = this.parseIdent(true);
        if (this.eatContextual("as")) {
          node.local = this.parseIdent();
        } else {
          node.local = node.imported;
          if (this.isKeyword(node.local.name))
            this.unexpected(node.local.start);
          if (this.reservedWordsStrict.test(node.local.name))
            this.raise(node.local.start, "The keyword '" + node.local.name + "' is reserved");
        }
        this.checkLVal(node.local, true);
        nodes.push(this.finishNode(node, "ImportSpecifier"));
      }
      return nodes;
    };
    var pp$2 = Parser.prototype;
    pp$2.toAssignable = function(node, isBinding) {
      if (this.options.ecmaVersion >= 6 && node) {
        switch (node.type) {
          case "Identifier":
          case "ObjectPattern":
          case "ArrayPattern":
            break;
          case "ObjectExpression":
            node.type = "ObjectPattern";
            for (var i = 0; i < node.properties.length; i++) {
              var prop = node.properties[i];
              if (prop.kind !== "init")
                this.raise(prop.key.start, "Object pattern can't contain getter or setter");
              this.toAssignable(prop.value, isBinding);
            }
            break;
          case "ArrayExpression":
            node.type = "ArrayPattern";
            this.toAssignableList(node.elements, isBinding);
            break;
          case "AssignmentExpression":
            if (node.operator === "=") {
              node.type = "AssignmentPattern";
              delete node.operator;
            } else {
              this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
              break;
            }
          case "AssignmentPattern":
            if (node.right.type === "YieldExpression")
              this.raise(node.right.start, "Yield expression cannot be a default value");
            break;
          case "ParenthesizedExpression":
            node.expression = this.toAssignable(node.expression, isBinding);
            break;
          case "MemberExpression":
            if (!isBinding)
              break;
          default:
            this.raise(node.start, "Assigning to rvalue");
        }
      }
      return node;
    };
    pp$2.toAssignableList = function(exprList, isBinding) {
      var end = exprList.length;
      if (end) {
        var last = exprList[end - 1];
        if (last && last.type == "RestElement") {
          --end;
        } else if (last && last.type == "SpreadElement") {
          last.type = "RestElement";
          var arg = last.argument;
          this.toAssignable(arg, isBinding);
          if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern")
            this.unexpected(arg.start);
          --end;
        }
        if (isBinding && last.type === "RestElement" && last.argument.type !== "Identifier")
          this.unexpected(last.argument.start);
      }
      for (var i = 0; i < end; i++) {
        var elt = exprList[i];
        if (elt)
          this.toAssignable(elt, isBinding);
      }
      return exprList;
    };
    pp$2.parseSpread = function(refDestructuringErrors) {
      var node = this.startNode();
      this.next();
      node.argument = this.parseMaybeAssign(refDestructuringErrors);
      return this.finishNode(node, "SpreadElement");
    };
    pp$2.parseRest = function(allowNonIdent) {
      var node = this.startNode();
      this.next();
      if (allowNonIdent)
        node.argument = this.type === tt.name ? this.parseIdent() : this.unexpected();
      else
        node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected();
      return this.finishNode(node, "RestElement");
    };
    pp$2.parseBindingAtom = function() {
      if (this.options.ecmaVersion < 6)
        return this.parseIdent();
      switch (this.type) {
        case tt.name:
          return this.parseIdent();
        case tt.bracketL:
          var node = this.startNode();
          this.next();
          node.elements = this.parseBindingList(tt.bracketR, true, true);
          return this.finishNode(node, "ArrayPattern");
        case tt.braceL:
          return this.parseObj(true);
        default:
          this.unexpected();
      }
    };
    pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowNonIdent) {
      var elts = [],
          first = true;
      while (!this.eat(close)) {
        if (first)
          first = false;
        else
          this.expect(tt.comma);
        if (allowEmpty && this.type === tt.comma) {
          elts.push(null);
        } else if (allowTrailingComma && this.afterTrailingComma(close)) {
          break;
        } else if (this.type === tt.ellipsis) {
          var rest = this.parseRest(allowNonIdent);
          this.parseBindingListItem(rest);
          elts.push(rest);
          this.expect(close);
          break;
        } else {
          var elem = this.parseMaybeDefault(this.start, this.startLoc);
          this.parseBindingListItem(elem);
          elts.push(elem);
        }
      }
      return elts;
    };
    pp$2.parseBindingListItem = function(param) {
      return param;
    };
    pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
      left = left || this.parseBindingAtom();
      if (this.options.ecmaVersion < 6 || !this.eat(tt.eq))
        return left;
      var node = this.startNodeAt(startPos, startLoc);
      node.left = left;
      node.right = this.parseMaybeAssign();
      return this.finishNode(node, "AssignmentPattern");
    };
    pp$2.checkLVal = function(expr, isBinding, checkClashes) {
      switch (expr.type) {
        case "Identifier":
          if (this.strict && this.reservedWordsStrictBind.test(expr.name))
            this.raise(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
          if (checkClashes) {
            if (has(checkClashes, expr.name))
              this.raise(expr.start, "Argument name clash");
            checkClashes[expr.name] = true;
          }
          break;
        case "MemberExpression":
          if (isBinding)
            this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
          break;
        case "ObjectPattern":
          for (var i = 0; i < expr.properties.length; i++) {
            this.checkLVal(expr.properties[i].value, isBinding, checkClashes);
          }
          break;
        case "ArrayPattern":
          for (var i = 0; i < expr.elements.length; i++) {
            var elem = expr.elements[i];
            if (elem)
              this.checkLVal(elem, isBinding, checkClashes);
          }
          break;
        case "AssignmentPattern":
          this.checkLVal(expr.left, isBinding, checkClashes);
          break;
        case "RestElement":
          this.checkLVal(expr.argument, isBinding, checkClashes);
          break;
        case "ParenthesizedExpression":
          this.checkLVal(expr.expression, isBinding, checkClashes);
          break;
        default:
          this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
      }
    };
    var pp$3 = Parser.prototype;
    pp$3.checkPropClash = function(prop, propHash) {
      if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
        return;
      var key = prop.key;
      var name = undefined;
      switch (key.type) {
        case "Identifier":
          name = key.name;
          break;
        case "Literal":
          name = String(key.value);
          break;
        default:
          return;
      }
      var kind = prop.kind;
      if (this.options.ecmaVersion >= 6) {
        if (name === "__proto__" && kind === "init") {
          if (propHash.proto)
            this.raise(key.start, "Redefinition of __proto__ property");
          propHash.proto = true;
        }
        return;
      }
      name = "$" + name;
      var other = propHash[name];
      if (other) {
        var isGetSet = kind !== "init";
        if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
          this.raise(key.start, "Redefinition of property");
      } else {
        other = propHash[name] = {
          init: false,
          get: false,
          set: false
        };
      }
      other[kind] = true;
    };
    pp$3.parseExpression = function(noIn, refDestructuringErrors) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
      if (this.type === tt.comma) {
        var node = this.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this.eat(tt.comma))
          node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors));
        return this.finishNode(node, "SequenceExpression");
      }
      return expr;
    };
    pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
      if (this.type == tt._yield && this.inGenerator)
        return this.parseYield();
      var validateDestructuring = false;
      if (!refDestructuringErrors) {
        refDestructuringErrors = {
          shorthandAssign: 0,
          trailingComma: 0
        };
        validateDestructuring = true;
      }
      var startPos = this.start,
          startLoc = this.startLoc;
      if (this.type == tt.parenL || this.type == tt.name)
        this.potentialArrowAt = this.start;
      var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
      if (afterLeftParse)
        left = afterLeftParse.call(this, left, startPos, startLoc);
      if (this.type.isAssign) {
        if (validateDestructuring)
          this.checkPatternErrors(refDestructuringErrors, true);
        var node = this.startNodeAt(startPos, startLoc);
        node.operator = this.value;
        node.left = this.type === tt.eq ? this.toAssignable(left) : left;
        refDestructuringErrors.shorthandAssign = 0;
        this.checkLVal(left);
        this.next();
        node.right = this.parseMaybeAssign(noIn);
        return this.finishNode(node, "AssignmentExpression");
      } else {
        if (validateDestructuring)
          this.checkExpressionErrors(refDestructuringErrors, true);
      }
      return left;
    };
    pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseExprOps(noIn, refDestructuringErrors);
      if (this.checkExpressionErrors(refDestructuringErrors))
        return expr;
      if (this.eat(tt.question)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.test = expr;
        node.consequent = this.parseMaybeAssign();
        this.expect(tt.colon);
        node.alternate = this.parseMaybeAssign(noIn);
        return this.finishNode(node, "ConditionalExpression");
      }
      return expr;
    };
    pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseMaybeUnary(refDestructuringErrors);
      if (this.checkExpressionErrors(refDestructuringErrors))
        return expr;
      return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
    };
    pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
      var prec = this.type.binop;
      if (prec != null && (!noIn || this.type !== tt._in)) {
        if (prec > minPrec) {
          var node = this.startNodeAt(leftStartPos, leftStartLoc);
          node.left = left;
          node.operator = this.value;
          var op = this.type;
          this.next();
          var startPos = this.start,
              startLoc = this.startLoc;
          node.right = this.parseExprOp(this.parseMaybeUnary(), startPos, startLoc, prec, noIn);
          this.finishNode(node, op === tt.logicalOR || op === tt.logicalAND ? "LogicalExpression" : "BinaryExpression");
          return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
        }
      }
      return left;
    };
    pp$3.parseMaybeUnary = function(refDestructuringErrors) {
      if (this.type.prefix) {
        var node = this.startNode(),
            update = this.type === tt.incDec;
        node.operator = this.value;
        node.prefix = true;
        this.next();
        node.argument = this.parseMaybeUnary();
        this.checkExpressionErrors(refDestructuringErrors, true);
        if (update)
          this.checkLVal(node.argument);
        else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier")
          this.raise(node.start, "Deleting local variable in strict mode");
        return this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
      }
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseExprSubscripts(refDestructuringErrors);
      if (this.checkExpressionErrors(refDestructuringErrors))
        return expr;
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node = this.startNodeAt(startPos, startLoc);
        node.operator = this.value;
        node.prefix = false;
        node.argument = expr;
        this.checkLVal(expr);
        this.next();
        expr = this.finishNode(node, "UpdateExpression");
      }
      return expr;
    };
    pp$3.parseExprSubscripts = function(refDestructuringErrors) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseExprAtom(refDestructuringErrors);
      var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
      if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts)
        return expr;
      return this.parseSubscripts(expr, startPos, startLoc);
    };
    pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
      for (; ; ) {
        if (this.eat(tt.dot)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.object = base;
          node.property = this.parseIdent(true);
          node.computed = false;
          base = this.finishNode(node, "MemberExpression");
        } else if (this.eat(tt.bracketL)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.object = base;
          node.property = this.parseExpression();
          node.computed = true;
          this.expect(tt.bracketR);
          base = this.finishNode(node, "MemberExpression");
        } else if (!noCalls && this.eat(tt.parenL)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.callee = base;
          node.arguments = this.parseExprList(tt.parenR, false);
          base = this.finishNode(node, "CallExpression");
        } else if (this.type === tt.backQuote) {
          var node = this.startNodeAt(startPos, startLoc);
          node.tag = base;
          node.quasi = this.parseTemplate();
          base = this.finishNode(node, "TaggedTemplateExpression");
        } else {
          return base;
        }
      }
    };
    pp$3.parseExprAtom = function(refDestructuringErrors) {
      var node = undefined,
          canBeArrow = this.potentialArrowAt == this.start;
      switch (this.type) {
        case tt._super:
          if (!this.inFunction)
            this.raise(this.start, "'super' outside of function or class");
        case tt._this:
          var type = this.type === tt._this ? "ThisExpression" : "Super";
          node = this.startNode();
          this.next();
          return this.finishNode(node, type);
        case tt._yield:
          if (this.inGenerator)
            this.unexpected();
        case tt.name:
          var startPos = this.start,
              startLoc = this.startLoc;
          var id = this.parseIdent(this.type !== tt.name);
          if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow))
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id]);
          return id;
        case tt.regexp:
          var value = this.value;
          node = this.parseLiteral(value.value);
          node.regex = {
            pattern: value.pattern,
            flags: value.flags
          };
          return node;
        case tt.num:
        case tt.string:
          return this.parseLiteral(this.value);
        case tt._null:
        case tt._true:
        case tt._false:
          node = this.startNode();
          node.value = this.type === tt._null ? null : this.type === tt._true;
          node.raw = this.type.keyword;
          this.next();
          return this.finishNode(node, "Literal");
        case tt.parenL:
          return this.parseParenAndDistinguishExpression(canBeArrow);
        case tt.bracketL:
          node = this.startNode();
          this.next();
          if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
            return this.parseComprehension(node, false);
          }
          node.elements = this.parseExprList(tt.bracketR, true, true, refDestructuringErrors);
          return this.finishNode(node, "ArrayExpression");
        case tt.braceL:
          return this.parseObj(false, refDestructuringErrors);
        case tt._function:
          node = this.startNode();
          this.next();
          return this.parseFunction(node, false);
        case tt._class:
          return this.parseClass(this.startNode(), false);
        case tt._new:
          return this.parseNew();
        case tt.backQuote:
          return this.parseTemplate();
        default:
          this.unexpected();
      }
    };
    pp$3.parseLiteral = function(value) {
      var node = this.startNode();
      node.value = value;
      node.raw = this.input.slice(this.start, this.end);
      this.next();
      return this.finishNode(node, "Literal");
    };
    pp$3.parseParenExpression = function() {
      this.expect(tt.parenL);
      var val = this.parseExpression();
      this.expect(tt.parenR);
      return val;
    };
    pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
      var startPos = this.start,
          startLoc = this.startLoc,
          val = undefined;
      if (this.options.ecmaVersion >= 6) {
        this.next();
        if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
          return this.parseComprehension(this.startNodeAt(startPos, startLoc), true);
        }
        var innerStartPos = this.start,
            innerStartLoc = this.startLoc;
        var exprList = [],
            first = true;
        var refDestructuringErrors = {
          shorthandAssign: 0,
          trailingComma: 0
        },
            spreadStart = undefined,
            innerParenStart = undefined;
        while (this.type !== tt.parenR) {
          first ? first = false : this.expect(tt.comma);
          if (this.type === tt.ellipsis) {
            spreadStart = this.start;
            exprList.push(this.parseParenItem(this.parseRest()));
            break;
          } else {
            if (this.type === tt.parenL && !innerParenStart) {
              innerParenStart = this.start;
            }
            exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
          }
        }
        var innerEndPos = this.start,
            innerEndLoc = this.startLoc;
        this.expect(tt.parenR);
        if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
          this.checkPatternErrors(refDestructuringErrors, true);
          if (innerParenStart)
            this.unexpected(innerParenStart);
          return this.parseParenArrowList(startPos, startLoc, exprList);
        }
        if (!exprList.length)
          this.unexpected(this.lastTokStart);
        if (spreadStart)
          this.unexpected(spreadStart);
        this.checkExpressionErrors(refDestructuringErrors, true);
        if (exprList.length > 1) {
          val = this.startNodeAt(innerStartPos, innerStartLoc);
          val.expressions = exprList;
          this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
        } else {
          val = exprList[0];
        }
      } else {
        val = this.parseParenExpression();
      }
      if (this.options.preserveParens) {
        var par = this.startNodeAt(startPos, startLoc);
        par.expression = val;
        return this.finishNode(par, "ParenthesizedExpression");
      } else {
        return val;
      }
    };
    pp$3.parseParenItem = function(item) {
      return item;
    };
    pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
      return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
    };
    var empty$1 = [];
    pp$3.parseNew = function() {
      var node = this.startNode();
      var meta = this.parseIdent(true);
      if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
        node.meta = meta;
        node.property = this.parseIdent(true);
        if (node.property.name !== "target")
          this.raise(node.property.start, "The only valid meta property for new is new.target");
        if (!this.inFunction)
          this.raise(node.start, "new.target can only be used in functions");
        return this.finishNode(node, "MetaProperty");
      }
      var startPos = this.start,
          startLoc = this.startLoc;
      node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
      if (this.eat(tt.parenL))
        node.arguments = this.parseExprList(tt.parenR, false);
      else
        node.arguments = empty$1;
      return this.finishNode(node, "NewExpression");
    };
    pp$3.parseTemplateElement = function() {
      var elem = this.startNode();
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
        cooked: this.value
      };
      this.next();
      elem.tail = this.type === tt.backQuote;
      return this.finishNode(elem, "TemplateElement");
    };
    pp$3.parseTemplate = function() {
      var node = this.startNode();
      this.next();
      node.expressions = [];
      var curElt = this.parseTemplateElement();
      node.quasis = [curElt];
      while (!curElt.tail) {
        this.expect(tt.dollarBraceL);
        node.expressions.push(this.parseExpression());
        this.expect(tt.braceR);
        node.quasis.push(curElt = this.parseTemplateElement());
      }
      this.next();
      return this.finishNode(node, "TemplateLiteral");
    };
    pp$3.parseObj = function(isPattern, refDestructuringErrors) {
      var node = this.startNode(),
          first = true,
          propHash = {};
      node.properties = [];
      this.next();
      while (!this.eat(tt.braceR)) {
        if (!first) {
          this.expect(tt.comma);
          if (this.afterTrailingComma(tt.braceR))
            break;
        } else
          first = false;
        var prop = this.startNode(),
            isGenerator = undefined,
            startPos = undefined,
            startLoc = undefined;
        if (this.options.ecmaVersion >= 6) {
          prop.method = false;
          prop.shorthand = false;
          if (isPattern || refDestructuringErrors) {
            startPos = this.start;
            startLoc = this.startLoc;
          }
          if (!isPattern)
            isGenerator = this.eat(tt.star);
        }
        this.parsePropertyName(prop);
        this.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors);
        this.checkPropClash(prop, propHash);
        node.properties.push(this.finishNode(prop, "Property"));
      }
      return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
    };
    pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
      if (this.eat(tt.colon)) {
        prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
        prop.kind = "init";
      } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
        if (isPattern)
          this.unexpected();
        prop.kind = "init";
        prop.method = true;
        prop.value = this.parseMethod(isGenerator);
      } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && this.type != tt.comma && this.type != tt.braceR) {
        if (isGenerator || isPattern)
          this.unexpected();
        prop.kind = prop.key.name;
        this.parsePropertyName(prop);
        prop.value = this.parseMethod(false);
        var paramCount = prop.kind === "get" ? 0 : 1;
        if (prop.value.params.length !== paramCount) {
          var start = prop.value.start;
          if (prop.kind === "get")
            this.raise(start, "getter should have no params");
          else
            this.raise(start, "setter should have exactly one param");
        }
        if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
          this.raise(prop.value.params[0].start, "Setter cannot use rest params");
      } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
        prop.kind = "init";
        if (isPattern) {
          if (this.keywords.test(prop.key.name) || (this.strict ? this.reservedWordsStrictBind : this.reservedWords).test(prop.key.name))
            this.raise(prop.key.start, "Binding " + prop.key.name);
          prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
        } else if (this.type === tt.eq && refDestructuringErrors) {
          if (!refDestructuringErrors.shorthandAssign)
            refDestructuringErrors.shorthandAssign = this.start;
          prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
        } else {
          prop.value = prop.key;
        }
        prop.shorthand = true;
      } else
        this.unexpected();
    };
    pp$3.parsePropertyName = function(prop) {
      if (this.options.ecmaVersion >= 6) {
        if (this.eat(tt.bracketL)) {
          prop.computed = true;
          prop.key = this.parseMaybeAssign();
          this.expect(tt.bracketR);
          return prop.key;
        } else {
          prop.computed = false;
        }
      }
      return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true);
    };
    pp$3.initFunction = function(node) {
      node.id = null;
      if (this.options.ecmaVersion >= 6) {
        node.generator = false;
        node.expression = false;
      }
    };
    pp$3.parseMethod = function(isGenerator) {
      var node = this.startNode();
      this.initFunction(node);
      this.expect(tt.parenL);
      node.params = this.parseBindingList(tt.parenR, false, false);
      if (this.options.ecmaVersion >= 6)
        node.generator = isGenerator;
      this.parseFunctionBody(node, false);
      return this.finishNode(node, "FunctionExpression");
    };
    pp$3.parseArrowExpression = function(node, params) {
      this.initFunction(node);
      node.params = this.toAssignableList(params, true);
      this.parseFunctionBody(node, true);
      return this.finishNode(node, "ArrowFunctionExpression");
    };
    pp$3.parseFunctionBody = function(node, isArrowFunction) {
      var isExpression = isArrowFunction && this.type !== tt.braceL;
      if (isExpression) {
        node.body = this.parseMaybeAssign();
        node.expression = true;
      } else {
        var oldInFunc = this.inFunction,
            oldInGen = this.inGenerator,
            oldLabels = this.labels;
        this.inFunction = true;
        this.inGenerator = node.generator;
        this.labels = [];
        node.body = this.parseBlock(true);
        node.expression = false;
        this.inFunction = oldInFunc;
        this.inGenerator = oldInGen;
        this.labels = oldLabels;
      }
      if (this.strict || !isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) {
        var oldStrict = this.strict;
        this.strict = true;
        if (node.id)
          this.checkLVal(node.id, true);
        this.checkParams(node);
        this.strict = oldStrict;
      } else if (isArrowFunction) {
        this.checkParams(node);
      }
    };
    pp$3.checkParams = function(node) {
      var nameHash = {};
      for (var i = 0; i < node.params.length; i++) {
        this.checkLVal(node.params[i], true, nameHash);
      }
    };
    pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
      var elts = [],
          first = true;
      while (!this.eat(close)) {
        if (!first) {
          this.expect(tt.comma);
          if (this.type === close && refDestructuringErrors && !refDestructuringErrors.trailingComma) {
            refDestructuringErrors.trailingComma = this.lastTokStart;
          }
          if (allowTrailingComma && this.afterTrailingComma(close))
            break;
        } else
          first = false;
        var elt = undefined;
        if (allowEmpty && this.type === tt.comma)
          elt = null;
        else if (this.type === tt.ellipsis)
          elt = this.parseSpread(refDestructuringErrors);
        else
          elt = this.parseMaybeAssign(false, refDestructuringErrors);
        elts.push(elt);
      }
      return elts;
    };
    pp$3.parseIdent = function(liberal) {
      var node = this.startNode();
      if (liberal && this.options.allowReserved == "never")
        liberal = false;
      if (this.type === tt.name) {
        if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) && (this.options.ecmaVersion >= 6 || this.input.slice(this.start, this.end).indexOf("\\") == -1))
          this.raise(this.start, "The keyword '" + this.value + "' is reserved");
        node.name = this.value;
      } else if (liberal && this.type.keyword) {
        node.name = this.type.keyword;
      } else {
        this.unexpected();
      }
      this.next();
      return this.finishNode(node, "Identifier");
    };
    pp$3.parseYield = function() {
      var node = this.startNode();
      this.next();
      if (this.type == tt.semi || this.canInsertSemicolon() || this.type != tt.star && !this.type.startsExpr) {
        node.delegate = false;
        node.argument = null;
      } else {
        node.delegate = this.eat(tt.star);
        node.argument = this.parseMaybeAssign();
      }
      return this.finishNode(node, "YieldExpression");
    };
    pp$3.parseComprehension = function(node, isGenerator) {
      node.blocks = [];
      while (this.type === tt._for) {
        var block = this.startNode();
        this.next();
        this.expect(tt.parenL);
        block.left = this.parseBindingAtom();
        this.checkLVal(block.left, true);
        this.expectContextual("of");
        block.right = this.parseExpression();
        this.expect(tt.parenR);
        node.blocks.push(this.finishNode(block, "ComprehensionBlock"));
      }
      node.filter = this.eat(tt._if) ? this.parseParenExpression() : null;
      node.body = this.parseExpression();
      this.expect(isGenerator ? tt.parenR : tt.bracketR);
      node.generator = isGenerator;
      return this.finishNode(node, "ComprehensionExpression");
    };
    var pp$4 = Parser.prototype;
    pp$4.raise = function(pos, message) {
      var loc = getLineInfo(this.input, pos);
      message += " (" + loc.line + ":" + loc.column + ")";
      var err = new SyntaxError(message);
      err.pos = pos;
      err.loc = loc;
      err.raisedAt = this.pos;
      throw err;
    };
    pp$4.curPosition = function() {
      if (this.options.locations) {
        return new Position(this.curLine, this.pos - this.lineStart);
      }
    };
    var Node = function Node(parser, pos, loc) {
      babelHelpers.classCallCheck(this, Node);
      this.type = "";
      this.start = pos;
      this.end = 0;
      if (parser.options.locations)
        this.loc = new SourceLocation(parser, loc);
      if (parser.options.directSourceFile)
        this.sourceFile = parser.options.directSourceFile;
      if (parser.options.ranges)
        this.range = [pos, 0];
    };
    ;
    var pp$5 = Parser.prototype;
    pp$5.startNode = function() {
      return new Node(this, this.start, this.startLoc);
    };
    pp$5.startNodeAt = function(pos, loc) {
      return new Node(this, pos, loc);
    };
    function finishNodeAt(node, type, pos, loc) {
      node.type = type;
      node.end = pos;
      if (this.options.locations)
        node.loc.end = loc;
      if (this.options.ranges)
        node.range[1] = pos;
      return node;
    }
    pp$5.finishNode = function(node, type) {
      return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
    };
    pp$5.finishNodeAt = function(node, type, pos, loc) {
      return finishNodeAt.call(this, node, type, pos, loc);
    };
    var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
      babelHelpers.classCallCheck(this, TokContext);
      this.token = token;
      this.isExpr = !!isExpr;
      this.preserveSpace = !!preserveSpace;
      this.override = override;
    };
    var types = {
      b_stat: new TokContext("{", false),
      b_expr: new TokContext("{", true),
      b_tmpl: new TokContext("${", true),
      p_stat: new TokContext("(", false),
      p_expr: new TokContext("(", true),
      q_tmpl: new TokContext("`", true, true, function(p) {
        return p.readTmplToken();
      }),
      f_expr: new TokContext("function", true)
    };
    var pp$6 = Parser.prototype;
    pp$6.initialContext = function() {
      return [types.b_stat];
    };
    pp$6.braceIsBlock = function(prevType) {
      if (prevType === tt.colon) {
        var _parent = this.curContext();
        if (_parent === types.b_stat || _parent === types.b_expr)
          return !_parent.isExpr;
      }
      if (prevType === tt._return)
        return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
      if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR)
        return true;
      if (prevType == tt.braceL)
        return this.curContext() === types.b_stat;
      return !this.exprAllowed;
    };
    pp$6.updateContext = function(prevType) {
      var update = undefined,
          type = this.type;
      if (type.keyword && prevType == tt.dot)
        this.exprAllowed = false;
      else if (update = type.updateContext)
        update.call(this, prevType);
      else
        this.exprAllowed = type.beforeExpr;
    };
    tt.parenR.updateContext = tt.braceR.updateContext = function() {
      if (this.context.length == 1) {
        this.exprAllowed = true;
        return;
      }
      var out = this.context.pop();
      if (out === types.b_stat && this.curContext() === types.f_expr) {
        this.context.pop();
        this.exprAllowed = false;
      } else if (out === types.b_tmpl) {
        this.exprAllowed = true;
      } else {
        this.exprAllowed = !out.isExpr;
      }
    };
    tt.braceL.updateContext = function(prevType) {
      this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
      this.exprAllowed = true;
    };
    tt.dollarBraceL.updateContext = function() {
      this.context.push(types.b_tmpl);
      this.exprAllowed = true;
    };
    tt.parenL.updateContext = function(prevType) {
      var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while;
      this.context.push(statementParens ? types.p_stat : types.p_expr);
      this.exprAllowed = true;
    };
    tt.incDec.updateContext = function() {};
    tt._function.updateContext = function() {
      if (this.curContext() !== types.b_stat)
        this.context.push(types.f_expr);
      this.exprAllowed = false;
    };
    tt.backQuote.updateContext = function() {
      if (this.curContext() === types.q_tmpl)
        this.context.pop();
      else
        this.context.push(types.q_tmpl);
      this.exprAllowed = false;
    };
    var Token = function Token(p) {
      babelHelpers.classCallCheck(this, Token);
      this.type = p.type;
      this.value = p.value;
      this.start = p.start;
      this.end = p.end;
      if (p.options.locations)
        this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
      if (p.options.ranges)
        this.range = [p.start, p.end];
    };
    ;
    var pp$7 = Parser.prototype;
    var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]";
    pp$7.next = function() {
      if (this.options.onToken)
        this.options.onToken(new Token(this));
      this.lastTokEnd = this.end;
      this.lastTokStart = this.start;
      this.lastTokEndLoc = this.endLoc;
      this.lastTokStartLoc = this.startLoc;
      this.nextToken();
    };
    pp$7.getToken = function() {
      this.next();
      return new Token(this);
    };
    if (typeof Symbol !== "undefined")
      pp$7[Symbol.iterator] = function() {
        var self = this;
        return {next: function() {
            var token = self.getToken();
            return {
              done: token.type === tt.eof,
              value: token
            };
          }};
      };
    pp$7.setStrict = function(strict) {
      this.strict = strict;
      if (this.type !== tt.num && this.type !== tt.string)
        return;
      this.pos = this.start;
      if (this.options.locations) {
        while (this.pos < this.lineStart) {
          this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
          --this.curLine;
        }
      }
      this.nextToken();
    };
    pp$7.curContext = function() {
      return this.context[this.context.length - 1];
    };
    pp$7.nextToken = function() {
      var curContext = this.curContext();
      if (!curContext || !curContext.preserveSpace)
        this.skipSpace();
      this.start = this.pos;
      if (this.options.locations)
        this.startLoc = this.curPosition();
      if (this.pos >= this.input.length)
        return this.finishToken(tt.eof);
      if (curContext.override)
        return curContext.override(this);
      else
        this.readToken(this.fullCharCodeAtPos());
    };
    pp$7.readToken = function(code) {
      if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92)
        return this.readWord();
      return this.getTokenFromCode(code);
    };
    pp$7.fullCharCodeAtPos = function() {
      var code = this.input.charCodeAt(this.pos);
      if (code <= 0xd7ff || code >= 0xe000)
        return code;
      var next = this.input.charCodeAt(this.pos + 1);
      return (code << 10) + next - 0x35fdc00;
    };
    pp$7.skipBlockComment = function() {
      var startLoc = this.options.onComment && this.curPosition();
      var start = this.pos,
          end = this.input.indexOf("*/", this.pos += 2);
      if (end === -1)
        this.raise(this.pos - 2, "Unterminated comment");
      this.pos = end + 2;
      if (this.options.locations) {
        lineBreakG.lastIndex = start;
        var match = undefined;
        while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
          ++this.curLine;
          this.lineStart = match.index + match[0].length;
        }
      }
      if (this.options.onComment)
        this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
    };
    pp$7.skipLineComment = function(startSkip) {
      var start = this.pos;
      var startLoc = this.options.onComment && this.curPosition();
      var ch = this.input.charCodeAt(this.pos += startSkip);
      while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
        ++this.pos;
        ch = this.input.charCodeAt(this.pos);
      }
      if (this.options.onComment)
        this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
    };
    pp$7.skipSpace = function() {
      loop: while (this.pos < this.input.length) {
        var ch = this.input.charCodeAt(this.pos);
        switch (ch) {
          case 32:
          case 160:
            ++this.pos;
            break;
          case 13:
            if (this.input.charCodeAt(this.pos + 1) === 10) {
              ++this.pos;
            }
          case 10:
          case 8232:
          case 8233:
            ++this.pos;
            if (this.options.locations) {
              ++this.curLine;
              this.lineStart = this.pos;
            }
            break;
          case 47:
            switch (this.input.charCodeAt(this.pos + 1)) {
              case 42:
                this.skipBlockComment();
                break;
              case 47:
                this.skipLineComment(2);
                break;
              default:
                break loop;
            }
            break;
          default:
            if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
              ++this.pos;
            } else {
              break loop;
            }
        }
      }
    };
    pp$7.finishToken = function(type, val) {
      this.end = this.pos;
      if (this.options.locations)
        this.endLoc = this.curPosition();
      var prevType = this.type;
      this.type = type;
      this.value = val;
      this.updateContext(prevType);
    };
    pp$7.readToken_dot = function() {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next >= 48 && next <= 57)
        return this.readNumber(true);
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
        this.pos += 3;
        return this.finishToken(tt.ellipsis);
      } else {
        ++this.pos;
        return this.finishToken(tt.dot);
      }
    };
    pp$7.readToken_slash = function() {
      var next = this.input.charCodeAt(this.pos + 1);
      if (this.exprAllowed) {
        ++this.pos;
        return this.readRegexp();
      }
      if (next === 61)
        return this.finishOp(tt.assign, 2);
      return this.finishOp(tt.slash, 1);
    };
    pp$7.readToken_mult_modulo = function(code) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61)
        return this.finishOp(tt.assign, 2);
      return this.finishOp(code === 42 ? tt.star : tt.modulo, 1);
    };
    pp$7.readToken_pipe_amp = function(code) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === code)
        return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2);
      if (next === 61)
        return this.finishOp(tt.assign, 2);
      return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1);
    };
    pp$7.readToken_caret = function() {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61)
        return this.finishOp(tt.assign, 2);
      return this.finishOp(tt.bitwiseXOR, 1);
    };
    pp$7.readToken_plus_min = function(code) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === code) {
        if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 && lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
          this.skipLineComment(3);
          this.skipSpace();
          return this.nextToken();
        }
        return this.finishOp(tt.incDec, 2);
      }
      if (next === 61)
        return this.finishOp(tt.assign, 2);
      return this.finishOp(tt.plusMin, 1);
    };
    pp$7.readToken_lt_gt = function(code) {
      var next = this.input.charCodeAt(this.pos + 1);
      var size = 1;
      if (next === code) {
        size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
        if (this.input.charCodeAt(this.pos + size) === 61)
          return this.finishOp(tt.assign, size + 1);
        return this.finishOp(tt.bitShift, size);
      }
      if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 && this.input.charCodeAt(this.pos + 3) == 45) {
        if (this.inModule)
          this.unexpected();
        this.skipLineComment(4);
        this.skipSpace();
        return this.nextToken();
      }
      if (next === 61)
        size = this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2;
      return this.finishOp(tt.relational, size);
    };
    pp$7.readToken_eq_excl = function(code) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61)
        return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
      if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
        this.pos += 2;
        return this.finishToken(tt.arrow);
      }
      return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1);
    };
    pp$7.getTokenFromCode = function(code) {
      switch (code) {
        case 46:
          return this.readToken_dot();
        case 40:
          ++this.pos;
          return this.finishToken(tt.parenL);
        case 41:
          ++this.pos;
          return this.finishToken(tt.parenR);
        case 59:
          ++this.pos;
          return this.finishToken(tt.semi);
        case 44:
          ++this.pos;
          return this.finishToken(tt.comma);
        case 91:
          ++this.pos;
          return this.finishToken(tt.bracketL);
        case 93:
          ++this.pos;
          return this.finishToken(tt.bracketR);
        case 123:
          ++this.pos;
          return this.finishToken(tt.braceL);
        case 125:
          ++this.pos;
          return this.finishToken(tt.braceR);
        case 58:
          ++this.pos;
          return this.finishToken(tt.colon);
        case 63:
          ++this.pos;
          return this.finishToken(tt.question);
        case 96:
          if (this.options.ecmaVersion < 6)
            break;
          ++this.pos;
          return this.finishToken(tt.backQuote);
        case 48:
          var next = this.input.charCodeAt(this.pos + 1);
          if (next === 120 || next === 88)
            return this.readRadixNumber(16);
          if (this.options.ecmaVersion >= 6) {
            if (next === 111 || next === 79)
              return this.readRadixNumber(8);
            if (next === 98 || next === 66)
              return this.readRadixNumber(2);
          }
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
          return this.readNumber(false);
        case 34:
        case 39:
          return this.readString(code);
        case 47:
          return this.readToken_slash();
        case 37:
        case 42:
          return this.readToken_mult_modulo(code);
        case 124:
        case 38:
          return this.readToken_pipe_amp(code);
        case 94:
          return this.readToken_caret();
        case 43:
        case 45:
          return this.readToken_plus_min(code);
        case 60:
        case 62:
          return this.readToken_lt_gt(code);
        case 61:
        case 33:
          return this.readToken_eq_excl(code);
        case 126:
          return this.finishOp(tt.prefix, 1);
      }
      this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
    };
    pp$7.finishOp = function(type, size) {
      var str = this.input.slice(this.pos, this.pos + size);
      this.pos += size;
      return this.finishToken(type, str);
    };
    function tryCreateRegexp(src, flags, throwErrorAt, parser) {
      try {
        return new RegExp(src, flags);
      } catch (e) {
        if (throwErrorAt !== undefined) {
          if (e instanceof SyntaxError)
            parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message);
          throw e;
        }
      }
    }
    var regexpUnicodeSupport = !!tryCreateRegexp("\uffff", "u");
    pp$7.readRegexp = function() {
      var _this = this;
      var escaped = undefined,
          inClass = undefined,
          start = this.pos;
      for (; ; ) {
        if (this.pos >= this.input.length)
          this.raise(start, "Unterminated regular expression");
        var ch = this.input.charAt(this.pos);
        if (lineBreak.test(ch))
          this.raise(start, "Unterminated regular expression");
        if (!escaped) {
          if (ch === "[")
            inClass = true;
          else if (ch === "]" && inClass)
            inClass = false;
          else if (ch === "/" && !inClass)
            break;
          escaped = ch === "\\";
        } else
          escaped = false;
        ++this.pos;
      }
      var content = this.input.slice(start, this.pos);
      ++this.pos;
      var mods = this.readWord1();
      var tmp = content;
      if (mods) {
        var validFlags = /^[gim]*$/;
        if (this.options.ecmaVersion >= 6)
          validFlags = /^[gimuy]*$/;
        if (!validFlags.test(mods))
          this.raise(start, "Invalid regular expression flag");
        if (mods.indexOf('u') >= 0 && !regexpUnicodeSupport) {
          tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function(_match, code, offset) {
            code = Number("0x" + code);
            if (code > 0x10FFFF)
              _this.raise(start + offset + 3, "Code point out of bounds");
            return "x";
          });
          tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
        }
      }
      var value = null;
      if (!isRhino) {
        tryCreateRegexp(tmp, undefined, start, this);
        value = tryCreateRegexp(content, mods);
      }
      return this.finishToken(tt.regexp, {
        pattern: content,
        flags: mods,
        value: value
      });
    };
    pp$7.readInt = function(radix, len) {
      var start = this.pos,
          total = 0;
      for (var i = 0,
          e = len == null ? Infinity : len; i < e; ++i) {
        var code = this.input.charCodeAt(this.pos),
            val = undefined;
        if (code >= 97)
          val = code - 97 + 10;
        else if (code >= 65)
          val = code - 65 + 10;
        else if (code >= 48 && code <= 57)
          val = code - 48;
        else
          val = Infinity;
        if (val >= radix)
          break;
        ++this.pos;
        total = total * radix + val;
      }
      if (this.pos === start || len != null && this.pos - start !== len)
        return null;
      return total;
    };
    pp$7.readRadixNumber = function(radix) {
      this.pos += 2;
      var val = this.readInt(radix);
      if (val == null)
        this.raise(this.start + 2, "Expected number in radix " + radix);
      if (isIdentifierStart(this.fullCharCodeAtPos()))
        this.raise(this.pos, "Identifier directly after number");
      return this.finishToken(tt.num, val);
    };
    pp$7.readNumber = function(startsWithDot) {
      var start = this.pos,
          isFloat = false,
          octal = this.input.charCodeAt(this.pos) === 48;
      if (!startsWithDot && this.readInt(10) === null)
        this.raise(start, "Invalid number");
      var next = this.input.charCodeAt(this.pos);
      if (next === 46) {
        ++this.pos;
        this.readInt(10);
        isFloat = true;
        next = this.input.charCodeAt(this.pos);
      }
      if (next === 69 || next === 101) {
        next = this.input.charCodeAt(++this.pos);
        if (next === 43 || next === 45)
          ++this.pos;
        if (this.readInt(10) === null)
          this.raise(start, "Invalid number");
        isFloat = true;
      }
      if (isIdentifierStart(this.fullCharCodeAtPos()))
        this.raise(this.pos, "Identifier directly after number");
      var str = this.input.slice(start, this.pos),
          val = undefined;
      if (isFloat)
        val = parseFloat(str);
      else if (!octal || str.length === 1)
        val = parseInt(str, 10);
      else if (/[89]/.test(str) || this.strict)
        this.raise(start, "Invalid number");
      else
        val = parseInt(str, 8);
      return this.finishToken(tt.num, val);
    };
    pp$7.readCodePoint = function() {
      var ch = this.input.charCodeAt(this.pos),
          code = undefined;
      if (ch === 123) {
        if (this.options.ecmaVersion < 6)
          this.unexpected();
        var codePos = ++this.pos;
        code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos);
        ++this.pos;
        if (code > 0x10FFFF)
          this.raise(codePos, "Code point out of bounds");
      } else {
        code = this.readHexChar(4);
      }
      return code;
    };
    function codePointToString(code) {
      if (code <= 0xFFFF)
        return String.fromCharCode(code);
      code -= 0x10000;
      return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00);
    }
    pp$7.readString = function(quote) {
      var out = "",
          chunkStart = ++this.pos;
      for (; ; ) {
        if (this.pos >= this.input.length)
          this.raise(this.start, "Unterminated string constant");
        var ch = this.input.charCodeAt(this.pos);
        if (ch === quote)
          break;
        if (ch === 92) {
          out += this.input.slice(chunkStart, this.pos);
          out += this.readEscapedChar(false);
          chunkStart = this.pos;
        } else {
          if (isNewLine(ch))
            this.raise(this.start, "Unterminated string constant");
          ++this.pos;
        }
      }
      out += this.input.slice(chunkStart, this.pos++);
      return this.finishToken(tt.string, out);
    };
    pp$7.readTmplToken = function() {
      var out = "",
          chunkStart = this.pos;
      for (; ; ) {
        if (this.pos >= this.input.length)
          this.raise(this.start, "Unterminated template");
        var ch = this.input.charCodeAt(this.pos);
        if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
          if (this.pos === this.start && this.type === tt.template) {
            if (ch === 36) {
              this.pos += 2;
              return this.finishToken(tt.dollarBraceL);
            } else {
              ++this.pos;
              return this.finishToken(tt.backQuote);
            }
          }
          out += this.input.slice(chunkStart, this.pos);
          return this.finishToken(tt.template, out);
        }
        if (ch === 92) {
          out += this.input.slice(chunkStart, this.pos);
          out += this.readEscapedChar(true);
          chunkStart = this.pos;
        } else if (isNewLine(ch)) {
          out += this.input.slice(chunkStart, this.pos);
          ++this.pos;
          switch (ch) {
            case 13:
              if (this.input.charCodeAt(this.pos) === 10)
                ++this.pos;
            case 10:
              out += "\n";
              break;
            default:
              out += String.fromCharCode(ch);
              break;
          }
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          chunkStart = this.pos;
        } else {
          ++this.pos;
        }
      }
    };
    pp$7.readEscapedChar = function(inTemplate) {
      var ch = this.input.charCodeAt(++this.pos);
      ++this.pos;
      switch (ch) {
        case 110:
          return "\n";
        case 114:
          return "\r";
        case 120:
          return String.fromCharCode(this.readHexChar(2));
        case 117:
          return codePointToString(this.readCodePoint());
        case 116:
          return "\t";
        case 98:
          return "\b";
        case 118:
          return "\u000b";
        case 102:
          return "\f";
        case 13:
          if (this.input.charCodeAt(this.pos) === 10)
            ++this.pos;
        case 10:
          if (this.options.locations) {
            this.lineStart = this.pos;
            ++this.curLine;
          }
          return "";
        default:
          if (ch >= 48 && ch <= 55) {
            var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
            var octal = parseInt(octalStr, 8);
            if (octal > 255) {
              octalStr = octalStr.slice(0, -1);
              octal = parseInt(octalStr, 8);
            }
            if (octalStr !== "0" && (this.strict || inTemplate)) {
              this.raise(this.pos - 2, "Octal literal in strict mode");
            }
            this.pos += octalStr.length - 1;
            return String.fromCharCode(octal);
          }
          return String.fromCharCode(ch);
      }
    };
    pp$7.readHexChar = function(len) {
      var codePos = this.pos;
      var n = this.readInt(16, len);
      if (n === null)
        this.raise(codePos, "Bad character escape sequence");
      return n;
    };
    pp$7.readWord1 = function() {
      this.containsEsc = false;
      var word = "",
          first = true,
          chunkStart = this.pos;
      var astral = this.options.ecmaVersion >= 6;
      while (this.pos < this.input.length) {
        var ch = this.fullCharCodeAtPos();
        if (isIdentifierChar(ch, astral)) {
          this.pos += ch <= 0xffff ? 1 : 2;
        } else if (ch === 92) {
          this.containsEsc = true;
          word += this.input.slice(chunkStart, this.pos);
          var escStart = this.pos;
          if (this.input.charCodeAt(++this.pos) != 117)
            this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX");
          ++this.pos;
          var esc = this.readCodePoint();
          if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
            this.raise(escStart, "Invalid Unicode escape");
          word += codePointToString(esc);
          chunkStart = this.pos;
        } else {
          break;
        }
        first = false;
      }
      return word + this.input.slice(chunkStart, this.pos);
    };
    pp$7.readWord = function() {
      var word = this.readWord1();
      var type = tt.name;
      if ((this.options.ecmaVersion >= 6 || !this.containsEsc) && this.keywords.test(word))
        type = keywordTypes[word];
      return this.finishToken(type, word);
    };
    function parse(input, options) {
      return new Parser(options, input).parse();
    }
    function walk(ast, _ref) {
      var enter = _ref.enter;
      var leave = _ref.leave;
      visit(ast, null, enter, leave);
    }
    var context = {skip: function skip() {
        return context.shouldSkip = true;
      }};
    var childKeys = {};
    var toString$1 = Object.prototype.toString;
    function isArray(thing) {
      return toString$1.call(thing) === '[object Array]';
    }
    function visit(node, parent, enter, leave, prop, index) {
      if (!node)
        return;
      if (enter) {
        context.shouldSkip = false;
        enter.call(context, node, parent, prop, index);
        if (context.shouldSkip)
          return;
      }
      var keys = childKeys[node.type] || (childKeys[node.type] = Object.keys(node).filter(function(prop) {
        return typeof node[prop] === 'object';
      }));
      var key = undefined,
          value = undefined,
          i = undefined,
          j = undefined;
      i = keys.length;
      while (i--) {
        key = keys[i];
        value = node[key];
        if (isArray(value)) {
          j = value.length;
          while (j--) {
            visit(value[j], node, enter, leave, key, j);
          }
        } else if (value && value.type) {
          visit(value, node, enter, leave, key, null);
        }
      }
      if (leave) {
        leave(node, parent, prop, index);
      }
    }
    var modifierNodes = {
      AssignmentExpression: 'left',
      UpdateExpression: 'argument',
      UnaryExpression: 'argument'
    };
    function isModifierNode(node) {
      if (!(node.type in modifierNodes)) {
        return false;
      }
      if (node.type === 'UnaryExpression') {
        return node.operator === 'delete';
      }
      return true;
    }
    function isReference(node, parent) {
      if (node.type === 'MemberExpression') {
        return !node.computed && isReference(node.object, node);
      }
      if (node.type === 'Identifier') {
        if (!parent)
          return true;
        if (parent.type === 'MemberExpression' || parent.type === 'MethodDefinition') {
          return parent.computed || node === parent.object;
        }
        if (parent.type === 'Property')
          return parent.computed || node === parent.value;
        if (parent.type === 'MethodDefinition')
          return false;
        if (parent.type === 'ExportSpecifier' && node !== parent.local)
          return;
        return true;
      }
    }
    function flatten(node) {
      var parts = [];
      while (node.type === 'MemberExpression') {
        if (node.computed)
          return null;
        parts.unshift(node.property.name);
        node = node.object;
      }
      if (node.type !== 'Identifier')
        return null;
      var name = node.name;
      parts.unshift(name);
      return {
        name: name,
        keypath: parts.join('.')
      };
    }
    var pureFunctions = {};
    var arrayTypes = 'Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array'.split(' ');
    var simdTypes = 'Int8x16 Int16x8 Int32x4 Float32x4 Float64x2'.split(' ');
    var simdMethods = 'abs add and bool check div equal extractLane fromFloat32x4 fromFloat32x4Bits fromFloat64x2 fromFloat64x2Bits fromInt16x8Bits fromInt32x4 fromInt32x4Bits fromInt8x16Bits greaterThan greaterThanOrEqual lessThan lessThanOrEqual load max maxNum min minNum mul neg not notEqual or reciprocalApproximation reciprocalSqrtApproximation replaceLane select selectBits shiftLeftByScalar shiftRightArithmeticByScalar shiftRightLogicalByScalar shuffle splat sqrt store sub swizzle xor'.split(' ');
    var allSimdMethods = [];
    simdTypes.forEach(function(t) {
      simdMethods.forEach(function(m) {
        allSimdMethods.push('SIMD.' + t + '.' + m);
      });
    });
    ['Array.isArray', 'Error', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'unescape', 'Object', 'Object.create', 'Object.getNotifier', 'Object.getOwn', 'Object.getOwnPropertyDescriptor', 'Object.getOwnPropertyNames', 'Object.getOwnPropertySymbols', 'Object.getPrototypeOf', 'Object.is', 'Object.isExtensible', 'Object.isFrozen', 'Object.isSealed', 'Object.keys', 'Function', 'Boolean', 'Number', 'Number.isFinite', 'Number.isInteger', 'Number.isNaN', 'Number.isSafeInteger', 'Number.parseFloat', 'Number.parseInt', 'Symbol', 'Symbol.for', 'Symbol.keyFor', 'Math.abs', 'Math.acos', 'Math.acosh', 'Math.asin', 'Math.asinh', 'Math.atan', 'Math.atan2', 'Math.atanh', 'Math.cbrt', 'Math.ceil', 'Math.clz32', 'Math.cos', 'Math.cosh', 'Math.exp', 'Math.expm1', 'Math.floor', 'Math.fround', 'Math.hypot', 'Math.imul', 'Math.log', 'Math.log10', 'Math.log1p', 'Math.log2', 'Math.max', 'Math.min', 'Math.pow', 'Math.random', 'Math.round', 'Math.sign', 'Math.sin', 'Math.sinh', 'Math.sqrt', 'Math.tan', 'Math.tanh', 'Math.trunc', 'Date', 'Date.UTC', 'Date.now', 'Date.parse', 'String', 'String.fromCharCode', 'String.fromCodePoint', 'String.raw', 'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'ArrayBuffer', 'ArrayBuffer.isView', 'DataView', 'JSON.parse', 'JSON.stringify', 'Promise', 'Promise.all', 'Promise.race', 'Promise.reject', 'Promise.resolve', 'Intl.Collator', 'Intl.Collator.supportedLocalesOf', 'Intl.DateTimeFormat', 'Intl.DateTimeFormat.supportedLocalesOf', 'Intl.NumberFormat', 'Intl.NumberFormat.supportedLocalesOf'].concat(arrayTypes, arrayTypes.map(function(t) {
      return t + '.from';
    }), arrayTypes.map(function(t) {
      return t + '.of';
    }), simdTypes.map(function(t) {
      return 'SIMD.' + t;
    }), allSimdMethods).forEach(function(name) {
      return pureFunctions[name] = true;
    });
    function getLocation(source, charIndex) {
      var lines = source.split('\n');
      var len = lines.length;
      var lineStart = 0;
      var i = undefined;
      for (i = 0; i < len; i += 1) {
        var line = lines[i];
        var lineEnd = lineStart + line.length + 1;
        if (lineEnd > charIndex) {
          return {
            line: i + 1,
            column: charIndex - lineStart
          };
        }
        lineStart = lineEnd;
      }
      throw new Error('Could not determine location of character');
    }
    function error(props) {
      var err = new Error(props.message);
      Object.keys(props).forEach(function(key) {
        err[key] = props[key];
      });
      throw err;
    }
    function call(callee, scope, statement, strongDependencies) {
      while (callee.type === 'ParenthesizedExpression')
        callee = callee.expression;
      if (callee.type === 'Identifier') {
        var declaration = scope.findDeclaration(callee.name) || statement.module.trace(callee.name);
        if (declaration) {
          if (declaration.isNamespace) {
            error({
              message: 'Cannot call a namespace (\'' + callee.name + '\')',
              file: statement.module.id,
              pos: callee.start,
              loc: getLocation(statement.module.code, callee.start)
            });
          }
          return declaration.run(strongDependencies);
        }
        return !pureFunctions[callee.name];
      }
      if (/FunctionExpression/.test(callee.type)) {
        return run(callee.body, scope, statement, strongDependencies);
      }
      if (callee.type === 'MemberExpression') {
        var flattened = flatten(callee);
        if (flattened) {
          var declaration = scope.findDeclaration(flattened.name) || statement.module.trace(flattened.name);
          return !!declaration || !pureFunctions[flattened.keypath];
        }
      }
      return true;
    }
    function run(node, scope, statement, strongDependencies, force) {
      var hasSideEffect = false;
      walk(node, {
        enter: function(node, parent) {
          if (!force && /Function/.test(node.type))
            return this.skip();
          if (node._scope)
            scope = node._scope;
          if (isReference(node, parent)) {
            var flattened = flatten(node);
            if (flattened.name === 'arguments') {
              hasSideEffect = true;
            } else if (!scope.contains(flattened.name)) {
              var declaration = statement.module.trace(flattened.name);
              if (declaration && !declaration.isExternal) {
                var _module = declaration.module || declaration.statement.module;
                if (!_module.isExternal && !~strongDependencies.indexOf(_module))
                  strongDependencies.push(_module);
              }
            }
          } else if (node.type === 'ThrowStatement') {
            if (scope.isTopLevel)
              hasSideEffect = true;
          } else if (node.type === 'CallExpression' || node.type === 'NewExpression') {
            if (call(node.callee, scope, statement, strongDependencies)) {
              hasSideEffect = true;
            }
          } else if (isModifierNode(node)) {
            var subject = node[modifierNodes[node.type]];
            while (subject.type === 'MemberExpression')
              subject = subject.object;
            var declaration = scope.findDeclaration(subject.name);
            if (declaration) {
              if (declaration.isParam)
                hasSideEffect = true;
            } else if (!scope.isTopLevel) {
              hasSideEffect = true;
            } else {
              declaration = statement.module.trace(subject.name);
              if (!declaration || declaration.isExternal || declaration.isUsed) {
                hasSideEffect = true;
              }
            }
          }
        },
        leave: function(node) {
          if (node._scope)
            scope = scope.parent;
        }
      });
      return hasSideEffect;
    }
    var Reference = function Reference(node, scope, statement) {
      babelHelpers.classCallCheck(this, Reference);
      this.node = node;
      this.scope = scope;
      this.statement = statement;
      this.declaration = null;
      this.parts = [];
      var root = node;
      while (root.type === 'MemberExpression') {
        this.parts.unshift(root.property);
        root = root.object;
      }
      this.name = root.name;
      this.start = node.start;
      this.end = node.start + this.name.length;
      this.rewritten = false;
    };
    var SyntheticReference = function SyntheticReference(name) {
      babelHelpers.classCallCheck(this, SyntheticReference);
      this.name = name;
      this.parts = [];
    };
    var _use = function(alias) {
      return alias.use();
    };
    var Declaration = (function() {
      function Declaration(node, isParam, statement) {
        babelHelpers.classCallCheck(this, Declaration);
        if (node) {
          if (node.type === 'FunctionDeclaration') {
            this.isFunctionDeclaration = true;
            this.functionNode = node;
          } else if (node.type === 'VariableDeclarator' && node.init && /FunctionExpression/.test(node.init.type)) {
            this.isFunctionDeclaration = true;
            this.functionNode = node.init;
          }
        }
        this.statement = statement;
        this.name = null;
        this.exportName = null;
        this.isParam = isParam;
        this.isReassigned = false;
        this.aliases = [];
        this.isUsed = false;
      }
      Declaration.prototype.addAlias = function addAlias(declaration) {
        this.aliases.push(declaration);
      };
      Declaration.prototype.addReference = function addReference(reference) {
        reference.declaration = this;
        this.name = reference.name;
        if (reference.isReassignment)
          this.isReassigned = true;
      };
      Declaration.prototype.render = function render(es6) {
        if (es6)
          return this.name;
        if (!this.isReassigned || !this.exportName)
          return this.name;
        return 'exports.' + this.exportName;
      };
      Declaration.prototype.run = function run$$(strongDependencies) {
        if (this.tested)
          return this.hasSideEffects;
        if (!this.functionNode) {
          this.hasSideEffects = true;
        } else {
          if (this.running)
            return true;
          this.running = true;
          this.hasSideEffects = run(this.functionNode.body, this.functionNode._scope, this.statement, strongDependencies, false);
          this.running = false;
        }
        this.tested = true;
        return this.hasSideEffects;
      };
      Declaration.prototype.use = function use() {
        if (this.isUsed)
          return;
        this.isUsed = true;
        if (this.statement)
          this.statement.mark();
        this.aliases.forEach(_use);
      };
      return Declaration;
    })();
    var SyntheticDefaultDeclaration = (function() {
      function SyntheticDefaultDeclaration(node, statement, name) {
        babelHelpers.classCallCheck(this, SyntheticDefaultDeclaration);
        this.node = node;
        this.statement = statement;
        this.name = name;
        this.original = null;
        this.exportName = null;
        this.aliases = [];
      }
      SyntheticDefaultDeclaration.prototype.addAlias = function addAlias(declaration) {
        this.aliases.push(declaration);
      };
      SyntheticDefaultDeclaration.prototype.addReference = function addReference(reference) {
        reference.declaration = this;
        if (reference.name === 'default')
          return;
        this.name = reference.name;
      };
      SyntheticDefaultDeclaration.prototype.bind = function bind(declaration) {
        this.original = declaration;
      };
      SyntheticDefaultDeclaration.prototype.render = function render() {
        return !this.original || this.original.isReassigned ? this.name : this.original.render();
      };
      SyntheticDefaultDeclaration.prototype.run = function run$$(strongDependencies) {
        if (this.original) {
          return this.original.run(strongDependencies);
        }
        var declaration = this.node.declaration;
        while (declaration.type === 'ParenthesizedExpression')
          declaration = declaration.expression;
        if (/FunctionExpression/.test(declaration.type)) {
          return run(declaration.body, this.statement.scope, this.statement, strongDependencies, false);
        }
        return true;
      };
      SyntheticDefaultDeclaration.prototype.use = function use() {
        this.isUsed = true;
        this.statement.mark();
        if (this.original)
          this.original.use();
        this.aliases.forEach(_use);
      };
      return SyntheticDefaultDeclaration;
    })();
    var SyntheticGlobalDeclaration = (function() {
      function SyntheticGlobalDeclaration(name) {
        babelHelpers.classCallCheck(this, SyntheticGlobalDeclaration);
        this.name = name;
        this.isExternal = true;
        this.isGlobal = true;
        this.isReassigned = false;
        this.aliases = [];
        this.isUsed = false;
      }
      SyntheticGlobalDeclaration.prototype.addAlias = function addAlias(declaration) {
        this.aliases.push(declaration);
      };
      SyntheticGlobalDeclaration.prototype.addReference = function addReference(reference) {
        reference.declaration = this;
        if (reference.isReassignment)
          this.isReassigned = true;
      };
      SyntheticGlobalDeclaration.prototype.render = function render() {
        return this.name;
      };
      SyntheticGlobalDeclaration.prototype.run = function run() {
        return true;
      };
      SyntheticGlobalDeclaration.prototype.use = function use() {
        if (this.isUsed)
          return;
        this.isUsed = true;
        this.aliases.forEach(_use);
      };
      return SyntheticGlobalDeclaration;
    })();
    var SyntheticNamespaceDeclaration = (function() {
      function SyntheticNamespaceDeclaration(module) {
        var _this = this;
        babelHelpers.classCallCheck(this, SyntheticNamespaceDeclaration);
        this.isNamespace = true;
        this.module = module;
        this.name = null;
        this.needsNamespaceBlock = false;
        this.aliases = [];
        this.originals = blank();
        module.getExports().forEach(function(name) {
          _this.originals[name] = module.traceExport(name);
        });
      }
      SyntheticNamespaceDeclaration.prototype.addAlias = function addAlias(declaration) {
        this.aliases.push(declaration);
      };
      SyntheticNamespaceDeclaration.prototype.addReference = function addReference(reference) {
        if (reference.parts.length) {
          var ref = reference.parts.shift();
          reference.name = ref.name;
          reference.end = ref.end;
          var original = this.originals[reference.name];
          if (!original) {
            this.module.bundle.onwarn('Export \'' + reference.name + '\' is not defined by \'' + this.module.id + '\'');
            reference.isUndefined = true;
            return;
          }
          original.addReference(reference);
          return;
        }
        if (!this.needsNamespaceBlock) {
          this.needsNamespaceBlock = true;
          this.module.bundle.internalNamespaces.push(this);
          forOwn(this.originals, function(original, name) {
            original.addReference(new SyntheticReference(name));
          });
        }
        reference.declaration = this;
        this.name = reference.name;
      };
      SyntheticNamespaceDeclaration.prototype.renderBlock = function renderBlock(indentString) {
        var _this2 = this;
        var members = keys(this.originals).map(function(name) {
          var original = _this2.originals[name];
          if (original.isReassigned) {
            return indentString + 'get ' + name + ' () { return ' + original.render() + '; }';
          }
          return '' + indentString + name + ': ' + original.render();
        });
        return 'var ' + this.render() + ' = Object.freeze({\n' + members.join(',\n') + '\n});\n\n';
      };
      SyntheticNamespaceDeclaration.prototype.render = function render() {
        return this.name;
      };
      SyntheticNamespaceDeclaration.prototype.use = function use() {
        forOwn(this.originals, _use);
        this.aliases.forEach(_use);
      };
      return SyntheticNamespaceDeclaration;
    })();
    var ExternalDeclaration = (function() {
      function ExternalDeclaration(module, name) {
        babelHelpers.classCallCheck(this, ExternalDeclaration);
        this.module = module;
        this.name = name;
        this.safeName = null;
        this.isExternal = true;
        this.isNamespace = name === '*';
      }
      ExternalDeclaration.prototype.addAlias = function addAlias() {};
      ExternalDeclaration.prototype.addReference = function addReference(reference) {
        reference.declaration = this;
        if (this.name === 'default' || this.name === '*') {
          this.module.suggestName(reference.name);
        }
      };
      ExternalDeclaration.prototype.render = function render(es6) {
        if (this.name === '*') {
          return this.module.name;
        }
        if (this.name === 'default') {
          return !es6 && this.module.exportsNames ? this.module.name + '__default' : this.module.name;
        }
        return es6 ? this.safeName : this.module.name + '.' + this.name;
      };
      ExternalDeclaration.prototype.run = function run() {
        return true;
      };
      ExternalDeclaration.prototype.setSafeName = function setSafeName(name) {
        this.safeName = name;
      };
      ExternalDeclaration.prototype.use = function use() {};
      return ExternalDeclaration;
    })();
    function extractNames(param) {
      var names = [];
      extractors[param.type](names, param);
      return names;
    }
    var extractors = {
      Identifier: function(names, param) {
        names.push(param.name);
      },
      ObjectPattern: function(names, param) {
        param.properties.forEach(function(prop) {
          extractors[prop.value.type](names, prop.value);
        });
      },
      ArrayPattern: function(names, param) {
        param.elements.forEach(function(element) {
          if (element)
            extractors[element.type](names, element);
        });
      },
      RestElement: function(names, param) {
        extractors[param.argument.type](names, param.argument);
      },
      AssignmentPattern: function(names, param) {
        extractors[param.left.type](names, param.left);
      }
    };
    var Scope = (function() {
      function Scope(options) {
        var _this = this;
        babelHelpers.classCallCheck(this, Scope);
        options = options || {};
        this.parent = options.parent;
        this.statement = options.statement || this.parent.statement;
        this.isBlockScope = !!options.block;
        this.isTopLevel = !this.parent || this.parent.isTopLevel && this.isBlockScope;
        this.declarations = blank();
        if (options.params) {
          options.params.forEach(function(param) {
            extractNames(param).forEach(function(name) {
              _this.declarations[name] = new Declaration(param, true, _this.statement);
            });
          });
        }
      }
      Scope.prototype.addDeclaration = function addDeclaration(node, isBlockDeclaration, isVar) {
        var _this2 = this;
        if (!isBlockDeclaration && this.isBlockScope) {
          this.parent.addDeclaration(node, isBlockDeclaration, isVar);
        } else {
          extractNames(node.id).forEach(function(name) {
            _this2.declarations[name] = new Declaration(node, false, _this2.statement);
          });
        }
      };
      Scope.prototype.contains = function contains(name) {
        return this.declarations[name] || (this.parent ? this.parent.contains(name) : false);
      };
      Scope.prototype.eachDeclaration = function eachDeclaration(fn) {
        var _this3 = this;
        keys(this.declarations).forEach(function(key) {
          fn(key, _this3.declarations[key]);
        });
      };
      Scope.prototype.findDeclaration = function findDeclaration(name) {
        return this.declarations[name] || this.parent && this.parent.findDeclaration(name);
      };
      return Scope;
    })();
    var blockDeclarations = {
      'const': true,
      'let': true
    };
    function attachScopes(statement) {
      var node = statement.node;
      var scope = statement.scope;
      walk(node, {
        enter: function(node, parent) {
          if (/(Function|Class)Declaration/.test(node.type)) {
            scope.addDeclaration(node, false, false);
          }
          if (node.type === 'VariableDeclaration') {
            (function() {
              var isBlockDeclaration = blockDeclarations[node.kind];
              node.declarations.forEach(function(declarator) {
                scope.addDeclaration(declarator, isBlockDeclaration, true);
              });
            })();
          }
          var newScope = undefined;
          if (/Function/.test(node.type)) {
            newScope = new Scope({
              parent: scope,
              block: false,
              params: node.params
            });
            if (node.type === 'FunctionExpression' && node.id) {
              newScope.addDeclaration(node, false, false);
            }
          }
          if (node.type === 'BlockStatement' && (!parent || !/Function/.test(parent.type))) {
            newScope = new Scope({
              parent: scope,
              block: true
            });
          }
          if (node.type === 'CatchClause') {
            newScope = new Scope({
              parent: scope,
              params: [node.param],
              block: true
            });
          }
          if (newScope) {
            Object.defineProperty(node, '_scope', {
              value: newScope,
              configurable: true
            });
            scope = newScope;
          }
        },
        leave: function(node) {
          if (node._scope) {
            scope = scope.parent;
          }
        }
      });
    }
    function isFunctionDeclaration(node) {
      if (!node)
        return false;
      return node.type === 'FunctionDeclaration' || node.type === 'VariableDeclaration' && node.init && /FunctionExpression/.test(node.init.type);
    }
    var Statement = (function() {
      function Statement(node, module, start, end) {
        babelHelpers.classCallCheck(this, Statement);
        this.node = node;
        this.module = module;
        this.start = start;
        this.end = end;
        this.next = null;
        this.scope = new Scope({statement: this});
        this.references = [];
        this.stringLiteralRanges = [];
        this.isIncluded = false;
        this.ran = false;
        this.isImportDeclaration = node.type === 'ImportDeclaration';
        this.isExportDeclaration = /^Export/.test(node.type);
        this.isReexportDeclaration = this.isExportDeclaration && !!node.source;
        this.isFunctionDeclaration = isFunctionDeclaration(node) || this.isExportDeclaration && isFunctionDeclaration(node.declaration);
      }
      Statement.prototype.firstPass = function firstPass() {
        if (this.isImportDeclaration)
          return;
        attachScopes(this);
        var statement = this;
        var module = this.module;
        var references = this.references;
        var scope = this.scope;
        var stringLiteralRanges = this.stringLiteralRanges;
        var readDepth = 0;
        walk(this.node, {
          enter: function(node, parent, prop) {
            if (node.type === 'CallExpression' && node.callee.name === 'eval' && !scope.contains('eval')) {
              module.bundle.onwarn('Use of `eval` (in ' + module.id + ') is discouraged, as it may cause issues with minification. See https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval for more details');
            }
            if (node.type === 'ExportNamedDeclaration' && node.source)
              return this.skip();
            if (node.type === 'TemplateElement')
              stringLiteralRanges.push([node.start, node.end]);
            if (node.type === 'Literal' && typeof node.value === 'string' && /\n/.test(node.raw)) {
              stringLiteralRanges.push([node.start + 1, node.end - 1]);
            }
            if (node._scope)
              scope = node._scope;
            if (/Function/.test(node.type))
              readDepth += 1;
            var isReassignment = undefined;
            if (parent && isModifierNode(parent)) {
              var subject = parent[modifierNodes[parent.type]];
              var depth = 0;
              while (subject.type === 'MemberExpression') {
                subject = subject.object;
                depth += 1;
              }
              var importDeclaration = module.imports[subject.name];
              if (!scope.contains(subject.name) && importDeclaration) {
                var minDepth = importDeclaration.name === '*' ? 2 : 1;
                if (depth < minDepth) {
                  var err = new Error('Illegal reassignment to import \'' + subject.name + '\'');
                  err.file = module.id;
                  err.loc = getLocation(module.magicString.toString(), subject.start);
                  throw err;
                }
              }
              isReassignment = !depth;
            }
            if (isReference(node, parent)) {
              var referenceScope = parent.type === 'FunctionDeclaration' && node === parent.id ? scope.parent : scope;
              var isShorthandProperty = parent.type === 'Property' && parent.shorthand;
              if (isShorthandProperty && parent.value === parent.key && prop === 'value') {
                return;
              }
              var reference = new Reference(node, referenceScope, statement);
              reference.isReassignment = isReassignment;
              reference.isShorthandProperty = isShorthandProperty;
              references.push(reference);
              this.skip();
            }
          },
          leave: function(node) {
            if (node._scope)
              scope = scope.parent;
            if (/Function/.test(node.type))
              readDepth -= 1;
          }
        });
      };
      Statement.prototype.mark = function mark() {
        if (this.isIncluded)
          return;
        this.isIncluded = true;
        this.references.forEach(function(reference) {
          if (reference.declaration)
            reference.declaration.use();
        });
      };
      Statement.prototype.run = function run$$(strongDependencies) {
        if (this.ran && this.isIncluded || this.isImportDeclaration || this.isFunctionDeclaration)
          return;
        this.ran = true;
        if (run(this.node, this.scope, this, strongDependencies, false)) {
          this.mark();
          return true;
        }
      };
      Statement.prototype.source = function source() {
        return this.module.source.slice(this.start, this.end);
      };
      Statement.prototype.toString = function toString() {
        return this.module.magicString.slice(this.start, this.end);
      };
      return Statement;
    })();
    var reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public'.split(' ');
    var builtins = 'Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl'.split(' ');
    var blacklisted = blank();
    reservedWords.concat(builtins).forEach(function(word) {
      return blacklisted[word] = true;
    });
    function makeLegalIdentifier(str) {
      str = str.replace(/-(\w)/g, function(_, letter) {
        return letter.toUpperCase();
      }).replace(/[^$_a-zA-Z0-9]/g, '_');
      if (/\d/.test(str[0]) || blacklisted[str])
        str = '_' + str;
      return str;
    }
    function isTruthy(node) {
      if (node.type === 'Literal')
        return !!node.value;
      if (node.type === 'ParenthesizedExpression')
        return isTruthy(node.expression);
      if (node.operator in operators)
        return operators[node.operator](node);
    }
    function isFalsy(node) {
      return not(isTruthy(node));
    }
    function not(value) {
      return value === undefined ? value : !value;
    }
    function equals(a, b, strict) {
      if (a.type !== b.type)
        return undefined;
      if (a.type === 'Literal')
        return strict ? a.value === b.value : a.value == b.value;
    }
    var operators = {
      '==': function(x) {
        return equals(x.left, x.right, false);
      },
      '!=': function(x) {
        return not(operators['=='](x));
      },
      '===': function(x) {
        return equals(x.left, x.right, true);
      },
      '!==': function(x) {
        return not(operators['==='](x));
      },
      '!': function(x) {
        return isFalsy(x.argument);
      },
      '&&': function(x) {
        return isTruthy(x.left) && isTruthy(x.right);
      },
      '||': function(x) {
        return isTruthy(x.left) || isTruthy(x.right);
      }
    };
    function emptyBlockStatement(start, end) {
      return {
        start: start,
        end: end,
        type: 'BlockStatement',
        body: []
      };
    }
    var Module = (function() {
      function Module(_ref) {
        var id = _ref.id;
        var code = _ref.code;
        var originalCode = _ref.originalCode;
        var ast = _ref.ast;
        var sourceMapChain = _ref.sourceMapChain;
        var bundle = _ref.bundle;
        babelHelpers.classCallCheck(this, Module);
        this.code = code;
        this.originalCode = originalCode;
        this.sourceMapChain = sourceMapChain;
        this.bundle = bundle;
        this.id = id;
        this.sources = [];
        this.dependencies = [];
        this.resolvedIds = blank();
        this.imports = blank();
        this.exports = blank();
        this.reexports = blank();
        this.exportAllSources = [];
        this.exportAllModules = null;
        this.magicString = new MagicString(code, {
          filename: id,
          indentExclusionRanges: []
        });
        var pattern = new RegExp('\\/\\/#\\s+' + SOURCEMAPPING_URL$1 + '=.+\\n?', 'g');
        var match = undefined;
        while (match = pattern.exec(code)) {
          this.magicString.remove(match.index, match.index + match[0].length);
        }
        this.comments = [];
        this.statements = this.parse(ast);
        this.declarations = blank();
        this.analyse();
        this.strongDependencies = [];
      }
      Module.prototype.addExport = function addExport(statement) {
        var _this = this;
        var node = statement.node;
        var source = node.source && node.source.value;
        if (source) {
          if (!~this.sources.indexOf(source))
            this.sources.push(source);
          if (node.type === 'ExportAllDeclaration') {
            this.exportAllSources.push(source);
          } else {
            node.specifiers.forEach(function(specifier) {
              _this.reexports[specifier.exported.name] = {
                start: specifier.start,
                source: source,
                localName: specifier.local.name,
                module: null
              };
            });
          }
        } else if (node.type === 'ExportDefaultDeclaration') {
          var identifier = node.declaration.id && node.declaration.id.name || node.declaration.name;
          this.exports.default = {
            localName: 'default',
            identifier: identifier
          };
          this.declarations.default = new SyntheticDefaultDeclaration(node, statement, identifier || this.basename());
        } else if (node.declaration) {
          var declaration = node.declaration;
          if (declaration.type === 'VariableDeclaration') {
            declaration.declarations.forEach(function(decl) {
              extractNames(decl.id).forEach(function(localName) {
                _this.exports[localName] = {localName: localName};
              });
            });
          } else {
            var localName = declaration.id.name;
            this.exports[localName] = {localName: localName};
          }
        } else {
          if (node.specifiers.length) {
            node.specifiers.forEach(function(specifier) {
              var localName = specifier.local.name;
              var exportedName = specifier.exported.name;
              _this.exports[exportedName] = {localName: localName};
            });
          } else {
            this.bundle.onwarn('Module ' + this.id + ' has an empty export declaration');
          }
        }
      };
      Module.prototype.addImport = function addImport(statement) {
        var _this2 = this;
        var node = statement.node;
        var source = node.source.value;
        if (!~this.sources.indexOf(source))
          this.sources.push(source);
        node.specifiers.forEach(function(specifier) {
          var localName = specifier.local.name;
          if (_this2.imports[localName]) {
            var err = new Error('Duplicated import \'' + localName + '\'');
            err.file = _this2.id;
            err.loc = getLocation(_this2.code, specifier.start);
            throw err;
          }
          var isDefault = specifier.type === 'ImportDefaultSpecifier';
          var isNamespace = specifier.type === 'ImportNamespaceSpecifier';
          var name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;
          _this2.imports[localName] = {
            source: source,
            name: name,
            module: null
          };
        });
      };
      Module.prototype.analyse = function analyse() {
        var _this3 = this;
        this.statements.forEach(function(statement) {
          if (statement.isImportDeclaration)
            _this3.addImport(statement);
          else if (statement.isExportDeclaration)
            _this3.addExport(statement);
          statement.firstPass();
          statement.scope.eachDeclaration(function(name, declaration) {
            _this3.declarations[name] = declaration;
          });
        });
      };
      Module.prototype.basename = function basename() {
        var base = _basename(this.id);
        var ext = extname(this.id);
        return makeLegalIdentifier(ext ? base.slice(0, -ext.length) : base);
      };
      Module.prototype.bindAliases = function bindAliases() {
        var _this4 = this;
        keys(this.declarations).forEach(function(name) {
          if (name === '*')
            return;
          var declaration = _this4.declarations[name];
          var statement = declaration.statement;
          if (!statement || statement.node.type !== 'VariableDeclaration')
            return;
          var init = statement.node.declarations[0].init;
          if (!init || init.type === 'FunctionExpression')
            return;
          statement.references.forEach(function(reference) {
            if (reference.name === name)
              return;
            var otherDeclaration = _this4.trace(reference.name);
            if (otherDeclaration)
              otherDeclaration.addAlias(declaration);
          });
        });
      };
      Module.prototype.bindImportSpecifiers = function bindImportSpecifiers() {
        var _this5 = this;
        [this.imports, this.reexports].forEach(function(specifiers) {
          keys(specifiers).forEach(function(name) {
            var specifier = specifiers[name];
            var id = _this5.resolvedIds[specifier.source];
            specifier.module = _this5.bundle.moduleById[id];
          });
        });
        this.exportAllModules = this.exportAllSources.map(function(source) {
          var id = _this5.resolvedIds[source];
          return _this5.bundle.moduleById[id];
        });
        this.sources.forEach(function(source) {
          var id = _this5.resolvedIds[source];
          var module = _this5.bundle.moduleById[id];
          if (!module.isExternal)
            _this5.dependencies.push(module);
        });
      };
      Module.prototype.bindReferences = function bindReferences() {
        var _this6 = this;
        if (this.declarations.default) {
          if (this.exports.default.identifier) {
            var declaration = this.trace(this.exports.default.identifier);
            if (declaration)
              this.declarations.default.bind(declaration);
          }
        }
        this.statements.forEach(function(statement) {
          if (statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length) {
            if (_this6 !== _this6.bundle.entryModule)
              return;
          }
          statement.references.forEach(function(reference) {
            var declaration = reference.scope.findDeclaration(reference.name) || _this6.trace(reference.name);
            if (declaration) {
              declaration.addReference(reference);
            } else {
              _this6.bundle.assumedGlobals[reference.name] = true;
            }
          });
        });
      };
      Module.prototype.getExports = function getExports() {
        var exports = blank();
        keys(this.exports).forEach(function(name) {
          exports[name] = true;
        });
        keys(this.reexports).forEach(function(name) {
          exports[name] = true;
        });
        this.exportAllModules.forEach(function(module) {
          module.getExports().forEach(function(name) {
            if (name !== 'default')
              exports[name] = true;
          });
        });
        return keys(exports);
      };
      Module.prototype.namespace = function namespace() {
        if (!this.declarations['*']) {
          this.declarations['*'] = new SyntheticNamespaceDeclaration(this);
        }
        return this.declarations['*'];
      };
      Module.prototype.parse = function parse$$(ast) {
        var _this7 = this;
        if (!ast) {
          try {
            ast = parse(this.code, {
              ecmaVersion: 6,
              sourceType: 'module',
              onComment: function(block, text, start, end) {
                return _this7.comments.push({
                  block: block,
                  text: text,
                  start: start,
                  end: end
                });
              },
              preserveParens: true
            });
          } catch (err) {
            err.code = 'PARSE_ERROR';
            err.file = this.id;
            err.message += ' in ' + this.id;
            throw err;
          }
        }
        walk(ast, {
          enter: function(node) {
            if (node.type === 'IfStatement') {
              if (isFalsy(node.test)) {
                _this7.magicString.overwrite(node.consequent.start, node.consequent.end, '{}');
                node.consequent = emptyBlockStatement(node.consequent.start, node.consequent.end);
              } else if (node.alternate && isTruthy(node.test)) {
                _this7.magicString.overwrite(node.alternate.start, node.alternate.end, '{}');
                node.alternate = emptyBlockStatement(node.alternate.start, node.alternate.end);
              }
            }
            _this7.magicString.addSourcemapLocation(node.start);
            _this7.magicString.addSourcemapLocation(node.end);
          },
          leave: function(node, parent, prop) {
            if (node.type === 'ConditionalExpression') {
              if (isFalsy(node.test)) {
                _this7.magicString.remove(node.start, node.alternate.start);
                parent[prop] = node.alternate;
              } else if (isTruthy(node.test)) {
                _this7.magicString.remove(node.start, node.consequent.start);
                _this7.magicString.remove(node.consequent.end, node.end);
                parent[prop] = node.consequent;
              }
            }
          }
        });
        var statements = [];
        var lastChar = 0;
        var commentIndex = 0;
        ast.body.forEach(function(node) {
          if (node.type === 'EmptyStatement')
            return;
          if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'VariableDeclaration' && node.declaration.declarations && node.declaration.declarations.length > 1) {
            var syntheticNode = {
              type: 'ExportNamedDeclaration',
              specifiers: node.declaration.declarations.map(function(declarator) {
                var id = {name: declarator.id.name};
                return {
                  local: id,
                  exported: id
                };
              }),
              isSynthetic: true
            };
            var statement = new Statement(syntheticNode, _this7, node.start, node.start);
            statements.push(statement);
            _this7.magicString.remove(node.start, node.declaration.start);
            node = node.declaration;
          }
          if (node.type === 'VariableDeclaration' && node.declarations.length > 1) {
            var lastStatement = statements[statements.length - 1];
            if (!lastStatement || !lastStatement.node.isSynthetic) {
              _this7.magicString.remove(node.start, node.declarations[0].start);
            }
            node.declarations.forEach(function(declarator) {
              var start = declarator.start;
              var end = declarator.end;
              var syntheticNode = {
                type: 'VariableDeclaration',
                kind: node.kind,
                start: start,
                end: end,
                declarations: [declarator],
                isSynthetic: true
              };
              var statement = new Statement(syntheticNode, _this7, start, end);
              statements.push(statement);
            });
            lastChar = node.end;
          } else {
            var comment = undefined;
            do {
              comment = _this7.comments[commentIndex];
              if (!comment)
                break;
              if (comment.start > node.start)
                break;
              commentIndex += 1;
            } while (comment.end < lastChar);
            var start = comment ? Math.min(comment.start, node.start) : node.start;
            var end = node.end;
            var statement = new Statement(node, _this7, start, end);
            statements.push(statement);
            lastChar = end;
          }
        });
        var i = statements.length;
        var next = this.code.length;
        while (i--) {
          statements[i].next = next;
          if (!statements[i].isSynthetic)
            next = statements[i].start;
        }
        return statements;
      };
      Module.prototype.render = function render(es6) {
        var _this8 = this;
        var magicString = this.magicString.clone();
        this.statements.forEach(function(statement) {
          if (!statement.isIncluded) {
            magicString.remove(statement.start, statement.next);
            return;
          }
          statement.stringLiteralRanges.forEach(function(range) {
            return magicString.indentExclusionRanges.push(range);
          });
          if (statement.node.type === 'ExportNamedDeclaration') {
            if (statement.node.isSynthetic)
              return;
            if (statement.node.specifiers.length) {
              magicString.remove(statement.start, statement.next);
              return;
            }
          }
          if (statement.node.type === 'VariableDeclaration') {
            var declarator = statement.node.declarations[0];
            if (declarator.id.type === 'Identifier') {
              var declaration = _this8.declarations[declarator.id.name];
              if (declaration.exportName && declaration.isReassigned) {
                if (declarator.init) {
                  magicString.overwrite(statement.start, declarator.init.start, 'exports.' + declaration.exportName + ' = ');
                } else {
                  magicString.remove(statement.start, declarator.init ? declarator.start : statement.next);
                }
                return;
              }
            } else {
              extractNames(declarator.id).forEach(function(name) {
                var declaration = _this8.declarations[name];
                if (declaration.exportName && declaration.isReassigned) {
                  magicString.insert(statement.end, ';\nexports.' + name + ' = ' + declaration.render(es6));
                }
              });
            }
            if (statement.node.isSynthetic) {
              magicString.insert(statement.start, statement.node.kind + ' ');
              magicString.overwrite(statement.end, statement.next, ';\n');
            }
          }
          var toDeshadow = blank();
          statement.references.forEach(function(reference) {
            var start = reference.start;
            var end = reference.end;
            if (reference.isUndefined) {
              magicString.overwrite(start, end, 'undefined', true);
            }
            var declaration = reference.declaration;
            if (declaration) {
              var _name = declaration.render(es6);
              if (reference.name === _name && _name.length === end - start)
                return;
              reference.rewritten = true;
              var identifier = _name.match(/[^\.]+/)[0];
              if (reference.scope.contains(identifier)) {
                toDeshadow[identifier] = identifier + '$$';
              }
              if (reference.isShorthandProperty) {
                magicString.insert(end, ': ' + _name);
              } else {
                magicString.overwrite(start, end, _name, true);
              }
            }
          });
          if (keys(toDeshadow).length) {
            statement.references.forEach(function(reference) {
              if (!reference.rewritten && reference.name in toDeshadow) {
                var replacement = toDeshadow[reference.name];
                magicString.overwrite(reference.start, reference.end, reference.isShorthandProperty ? reference.name + ': ' + replacement : replacement, true);
              }
            });
          }
          if (statement.isExportDeclaration) {
            if (statement.node.type === 'ExportNamedDeclaration' && statement.node.declaration.type === 'VariableDeclaration') {
              var _name2 = extractNames(statement.node.declaration.declarations[0].id)[0];
              var declaration = _this8.declarations[_name2];
              if (!declaration)
                throw new Error('Missing declaration for ' + _name2 + '!');
              var end = declaration.exportName && declaration.isReassigned ? statement.node.declaration.declarations[0].start : statement.node.declaration.start;
              magicString.remove(statement.node.start, end);
            } else if (statement.node.type === 'ExportAllDeclaration') {
              magicString.remove(statement.start, statement.next);
            } else if (statement.node.declaration.id) {
              magicString.remove(statement.node.start, statement.node.declaration.start);
            } else if (statement.node.type === 'ExportDefaultDeclaration') {
              var defaultDeclaration = _this8.declarations.default;
              if (defaultDeclaration.original && !defaultDeclaration.original.isReassigned) {
                magicString.remove(statement.start, statement.next);
                return;
              }
              var defaultName = defaultDeclaration.render();
              if (!defaultDeclaration.exportName && !defaultDeclaration.isUsed) {
                magicString.remove(statement.start, statement.node.declaration.start);
                return;
              }
              if (statement.node.declaration.type === 'FunctionExpression') {
                magicString.overwrite(statement.node.start, statement.node.declaration.start + 8, 'function ' + defaultName);
              } else {
                magicString.overwrite(statement.node.start, statement.node.declaration.start, 'var ' + defaultName + ' = ');
              }
            } else {
              throw new Error('Unhandled export');
            }
          }
        });
        var namespace = this.declarations['*'];
        if (namespace && namespace.needsNamespaceBlock) {
          magicString.append('\n\n' + namespace.renderBlock(magicString.getIndentString()));
        }
        return magicString.trim();
      };
      Module.prototype.run = function run() {
        var _this9 = this;
        var marked = false;
        this.statements.forEach(function(statement) {
          marked = statement.run(_this9.strongDependencies) || marked;
        });
        return marked;
      };
      Module.prototype.trace = function trace(name) {
        if (name in this.declarations)
          return this.declarations[name];
        if (name in this.imports) {
          var importDeclaration = this.imports[name];
          var otherModule = importDeclaration.module;
          if (importDeclaration.name === '*' && !otherModule.isExternal) {
            return otherModule.namespace();
          }
          var declaration = otherModule.traceExport(importDeclaration.name);
          if (!declaration)
            throw new Error('Module ' + otherModule.id + ' does not export ' + importDeclaration.name + ' (imported by ' + this.id + ')');
          return declaration;
        }
        return null;
      };
      Module.prototype.traceExport = function traceExport(name) {
        var reexportDeclaration = this.reexports[name];
        if (reexportDeclaration) {
          var declaration = reexportDeclaration.module.traceExport(reexportDeclaration.localName);
          if (!declaration) {
            var err = new Error('\'' + reexportDeclaration.localName + '\' is not exported by \'' + reexportDeclaration.module.id + '\' (imported by \'' + this.id + '\')');
            err.file = this.id;
            err.loc = getLocation(this.code, reexportDeclaration.start);
            throw err;
          }
          return declaration;
        }
        var exportDeclaration = this.exports[name];
        if (exportDeclaration) {
          var _name3 = exportDeclaration.localName;
          var declaration = this.trace(_name3);
          if (declaration)
            return declaration;
          this.bundle.assumedGlobals[_name3] = true;
          return this.declarations[_name3] = new SyntheticGlobalDeclaration(_name3);
        }
        for (var i = 0; i < this.exportAllModules.length; i += 1) {
          var _module = this.exportAllModules[i];
          var declaration = _module.traceExport(name);
          if (declaration)
            return declaration;
        }
      };
      return Module;
    })();
    var ExternalModule = (function() {
      function ExternalModule(id) {
        babelHelpers.classCallCheck(this, ExternalModule);
        this.id = id;
        this.name = makeLegalIdentifier(id);
        this.nameSuggestions = blank();
        this.mostCommonSuggestion = 0;
        this.isExternal = true;
        this.declarations = blank();
        this.exportsNames = false;
      }
      ExternalModule.prototype.suggestName = function suggestName(name) {
        if (!this.nameSuggestions[name])
          this.nameSuggestions[name] = 0;
        this.nameSuggestions[name] += 1;
        if (this.nameSuggestions[name] > this.mostCommonSuggestion) {
          this.mostCommonSuggestion = this.nameSuggestions[name];
          this.name = name;
        }
      };
      ExternalModule.prototype.traceExport = function traceExport(name) {
        if (name !== 'default' && name !== '*') {
          this.exportsNames = true;
        }
        return this.declarations[name] || (this.declarations[name] = new ExternalDeclaration(this, name));
      };
      return ExternalModule;
    })();
    function getName(x) {
      return x.name;
    }
    function quoteId(x) {
      return "'" + x.id + "'";
    }
    function req(x) {
      return "require('" + x.id + "')";
    }
    function getInteropBlock(bundle) {
      return bundle.externalModules.map(function(module) {
        return module.declarations.default ? module.exportsNames ? 'var ' + module.name + '__default = \'default\' in ' + module.name + ' ? ' + module.name + '[\'default\'] : ' + module.name + ';' : module.name + ' = \'default\' in ' + module.name + ' ? ' + module.name + '[\'default\'] : ' + module.name + ';' : null;
      }).filter(Boolean).join('\n');
    }
    function getExportBlock(entryModule, exportMode) {
      var mechanism = arguments.length <= 2 || arguments[2] === undefined ? 'return' : arguments[2];
      if (exportMode === 'default') {
        return mechanism + ' ' + entryModule.traceExport('default').render(false) + ';';
      }
      return entryModule.getExports().map(function(name) {
        var prop = name === 'default' ? '[\'default\']' : '.' + name;
        var declaration = entryModule.traceExport(name);
        var lhs = 'exports' + prop;
        var rhs = declaration.render(false);
        if (lhs === rhs)
          return null;
        return lhs + ' = ' + rhs + ';';
      }).filter(Boolean).join('\n');
    }
    function getGlobalNameMaker(globals, onwarn) {
      var fn = typeof globals === 'function' ? globals : function(id) {
        return globals[id];
      };
      return function(module) {
        var name = fn(module.id);
        if (name)
          return name;
        onwarn('No name was provided for external module \'' + module.id + '\' in options.globals – guessing \'' + module.name + '\'');
        return module.name;
      };
    }
    function setupNamespace$1(name) {
      var parts = name.split('.');
      parts.pop();
      var acc = 'global';
      return parts.map(function(part) {
        return acc += '.' + part, acc + ' = ' + acc + ' || {}';
      }).concat('global.' + name).join(', ');
    }
    function umd(bundle, magicString, _ref, options) {
      var exportMode = _ref.exportMode;
      var indentString = _ref.indentString;
      if (exportMode !== 'none' && !options.moduleName) {
        throw new Error('You must supply options.moduleName for UMD bundles');
      }
      var globalNameMaker = getGlobalNameMaker(options.globals || blank(), bundle.onwarn);
      var amdDeps = bundle.externalModules.map(quoteId);
      var cjsDeps = bundle.externalModules.map(req);
      var globalDeps = bundle.externalModules.map(function(module) {
        return 'global.' + globalNameMaker(module);
      });
      var args = bundle.externalModules.map(getName);
      if (exportMode === 'named') {
        amdDeps.unshift('\'exports\'');
        cjsDeps.unshift('exports');
        globalDeps.unshift('(' + setupNamespace$1(options.moduleName) + ' = global.' + options.moduleName + ' || {})');
        args.unshift('exports');
      }
      var amdParams = (options.moduleId ? '\'' + options.moduleId + '\', ' : '') + (amdDeps.length ? '[' + amdDeps.join(', ') + '], ' : '');
      var cjsExport = exportMode === 'default' ? 'module.exports = ' : '';
      var defaultExport = exportMode === 'default' ? setupNamespace$1(options.moduleName) + ' = ' : '';
      var useStrict = options.useStrict !== false ? ' \'use strict\';' : '';
      var intro = ('(function (global, factory) {\n\t\t\ttypeof exports === \'object\' && typeof module !== \'undefined\' ? ' + cjsExport + 'factory(' + cjsDeps.join(', ') + ') :\n\t\t\ttypeof define === \'function\' && define.amd ? define(' + amdParams + 'factory) :\n\t\t\t(' + defaultExport + 'factory(' + globalDeps + '));\n\t\t}(this, function (' + args + ') {' + useStrict + '\n\n\t\t').replace(/^\t\t/gm, '').replace(/^\t/gm, magicString.getIndentString());
      var interopBlock = getInteropBlock(bundle);
      if (interopBlock)
        magicString.prepend(interopBlock + '\n\n');
      var exportBlock = getExportBlock(bundle.entryModule, exportMode);
      if (exportBlock)
        magicString.append('\n\n' + exportBlock);
      return magicString.trim().indent(indentString).append('\n\n}));').prepend(intro);
    }
    function setupNamespace(keypath) {
      var parts = keypath.split('.');
      parts.pop();
      var acc = 'this';
      return parts.map(function(part) {
        return acc += '.' + part, acc + ' = ' + acc + ' || {};';
      }).join('\n') + '\n';
    }
    function iife(bundle, magicString, _ref, options) {
      var exportMode = _ref.exportMode;
      var indentString = _ref.indentString;
      var globalNameMaker = getGlobalNameMaker(options.globals || blank(), bundle.onwarn);
      var name = options.moduleName;
      var isNamespaced = name && ~name.indexOf('.');
      var dependencies = bundle.externalModules.map(globalNameMaker);
      var args = bundle.externalModules.map(getName);
      if (exportMode !== 'none' && !name) {
        throw new Error('You must supply options.moduleName for IIFE bundles');
      }
      if (exportMode === 'named') {
        dependencies.unshift('(this.' + name + ' = this.' + name + ' || {})');
        args.unshift('exports');
      }
      var useStrict = options.useStrict !== false ? '\'use strict\';' : '';
      var intro = '(function (' + args + ') {\n';
      var outro = '\n\n}(' + dependencies + '));';
      if (exportMode === 'default') {
        intro = (isNamespaced ? 'this.' : 'var ') + (name + ' = ' + intro);
      }
      if (isNamespaced) {
        intro = setupNamespace(name) + intro;
      }
      var interopBlock = getInteropBlock(bundle);
      if (interopBlock)
        magicString.prepend(interopBlock + '\n\n');
      if (useStrict)
        magicString.prepend(useStrict + '\n\n');
      var exportBlock = getExportBlock(bundle.entryModule, exportMode);
      if (exportBlock)
        magicString.append('\n\n' + exportBlock);
      return magicString.indent(indentString).prepend(intro).append(outro);
    }
    function notDefault(name) {
      return name !== 'default';
    }
    function es6(bundle, magicString) {
      var importBlock = bundle.externalModules.map(function(module) {
        var specifiers = [];
        var specifiersList = [specifiers];
        var importedNames = keys(module.declarations).filter(function(name) {
          return name !== '*' && name !== 'default';
        });
        if (module.declarations.default) {
          specifiers.push(module.name);
        }
        var namespaceSpecifier = module.declarations['*'] ? '* as ' + module.name : null;
        var namedSpecifier = importedNames.length ? '{ ' + importedNames.join(', ') + ' }' : null;
        if (namespaceSpecifier && namedSpecifier) {
          specifiersList.push([namespaceSpecifier]);
          specifiers.push(namedSpecifier);
        } else if (namedSpecifier) {
          specifiers.push(namedSpecifier);
        } else if (namespaceSpecifier) {
          specifiers.push(namespaceSpecifier);
        }
        return specifiersList.map(function(specifiers) {
          return specifiers.length ? 'import ' + specifiers.join(', ') + ' from \'' + module.id + '\';' : 'import \'' + module.id + '\';';
        }).join('\n');
      }).join('\n');
      if (importBlock) {
        magicString.prepend(importBlock + '\n\n');
      }
      var module = bundle.entryModule;
      var specifiers = module.getExports().filter(notDefault).map(function(name) {
        var declaration = module.traceExport(name);
        var rendered = declaration.render(true);
        return rendered === name ? name : rendered + ' as ' + name;
      });
      var exportBlock = specifiers.length ? 'export { ' + specifiers.join(', ') + ' };' : '';
      var defaultExport = module.exports.default || module.reexports.default;
      if (defaultExport) {
        exportBlock += 'export default ' + module.traceExport('default').render(true) + ';';
      }
      if (exportBlock) {
        magicString.append('\n\n' + exportBlock.trim());
      }
      return magicString.trim();
    }
    function cjs(bundle, magicString, _ref, options) {
      var exportMode = _ref.exportMode;
      var intro = options.useStrict === false ? '' : '\'use strict\';\n\n';
      var hasDefaultImport = bundle.externalModules.some(function(mod) {
        return mod.declarations.default;
      });
      if (hasDefaultImport) {
        intro += 'function _interopDefault (ex) { return (ex && (typeof ex === \'object\') && \'default\' in ex) ? ex[\'default\'] : ex; }\n\n';
      }
      var importBlock = bundle.externalModules.map(function(module) {
        if (module.declarations.default) {
          if (module.exportsNames) {
            return 'var ' + module.name + ' = require(\'' + module.id + '\');' + ('\nvar ' + module.name + '__default = _interopDefault(' + module.name + ');');
          } else {
            return 'var ' + module.name + ' = _interopDefault(require(\'' + module.id + '\'));';
          }
        } else {
          return 'var ' + module.name + ' = require(\'' + module.id + '\');';
        }
      }).join('\n');
      if (importBlock) {
        intro += importBlock + '\n\n';
      }
      magicString.prepend(intro);
      var exportBlock = getExportBlock(bundle.entryModule, exportMode, 'module.exports =');
      if (exportBlock)
        magicString.append('\n\n' + exportBlock);
      return magicString;
    }
    function amd(bundle, magicString, _ref, options) {
      var exportMode = _ref.exportMode;
      var indentString = _ref.indentString;
      var deps = bundle.externalModules.map(quoteId);
      var args = bundle.externalModules.map(getName);
      if (exportMode === 'named') {
        args.unshift('exports');
        deps.unshift('\'exports\'');
      }
      var params = (options.moduleId ? '\'' + options.moduleId + '\', ' : '') + (deps.length ? '[' + deps.join(', ') + '], ' : '');
      var useStrict = options.useStrict !== false ? ' \'use strict\';' : '';
      var intro = 'define(' + params + 'function (' + args.join(', ') + ') {' + useStrict + '\n\n';
      var interopBlock = getInteropBlock(bundle);
      if (interopBlock)
        magicString.prepend(interopBlock + '\n\n');
      var exportBlock = getExportBlock(bundle.entryModule, exportMode);
      if (exportBlock)
        magicString.append('\n\n' + exportBlock);
      return magicString.indent(indentString).append('\n\n});').prepend(intro);
    }
    var finalisers = {
      amd: amd,
      cjs: cjs,
      es6: es6,
      iife: iife,
      umd: umd
    };
    function ensureArray(thing) {
      if (Array.isArray(thing))
        return thing;
      if (thing == undefined)
        return [];
      return [thing];
    }
    function load(id) {
      return readFileSync(id, 'utf-8');
    }
    function addJsExtensionIfNecessary(file) {
      if (isFile(file))
        return file;
      file += '.js';
      if (isFile(file))
        return file;
      return null;
    }
    function resolveId(importee, importer) {
      if (typeof process === 'undefined')
        throw new Error('It looks like you\'re using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions. See https://github.com/rollup/rollup/wiki/Plugins for more information');
      if (isAbsolute(importee))
        return addJsExtensionIfNecessary(importee);
      if (importer === undefined)
        return addJsExtensionIfNecessary(resolve(process.cwd(), importee));
      if (importee[0] !== '.')
        return null;
      return addJsExtensionIfNecessary(resolve(dirname(importer), importee));
    }
    function makeOnwarn() {
      var warned = blank();
      return function(msg) {
        if (msg in warned)
          return;
        console.error(msg);
        warned[msg] = true;
      };
    }
    function badExports(option, keys) {
      throw new Error('\'' + option + '\' was specified for options.exports, but entry module has following exports: ' + keys.join(', '));
    }
    function getExportMode(bundle, exportMode) {
      var exportKeys = keys(bundle.entryModule.exports).concat(keys(bundle.entryModule.reexports)).concat(bundle.entryModule.exportAllSources);
      if (exportMode === 'default') {
        if (exportKeys.length !== 1 || exportKeys[0] !== 'default') {
          badExports('default', exportKeys);
        }
      } else if (exportMode === 'none' && exportKeys.length) {
        badExports('none', exportKeys);
      }
      if (!exportMode || exportMode === 'auto') {
        if (exportKeys.length === 0) {
          exportMode = 'none';
        } else if (exportKeys.length === 1 && exportKeys[0] === 'default') {
          exportMode = 'default';
        } else {
          exportMode = 'named';
        }
      }
      if (!/(?:default|named|none)/.test(exportMode)) {
        throw new Error('options.exports must be \'default\', \'named\', \'none\', \'auto\', or left unspecified (defaults to \'auto\')');
      }
      return exportMode;
    }
    function getIndentString(magicString, options) {
      if (!('indent' in options) || options.indent === true) {
        return magicString.getIndentString();
      }
      return options.indent || '';
    }
    function unixizePath(path) {
      return path.split(/[\/\\]/).join('/');
    }
    function mapSequence(array, fn) {
      var results = [];
      var promise = Promise.resolve();
      function next(member, i) {
        return fn(member).then(function(value) {
          return results[i] = value;
        });
      }
      var _loop = function(i) {
        promise = promise.then(function() {
          return next(array[i], i);
        });
      };
      for (var i = 0; i < array.length; i += 1) {
        _loop(i);
      }
      return promise.then(function() {
        return results;
      });
    }
    function transform(source, id, transformers) {
      var sourceMapChain = [];
      if (typeof source === 'string') {
        source = {
          code: source,
          ast: null
        };
      }
      var originalCode = source.code;
      var ast = source.ast;
      return transformers.reduce(function(promise, transformer) {
        return promise.then(function(previous) {
          return Promise.resolve(transformer(previous, id)).then(function(result) {
            if (result == null)
              return previous;
            if (typeof result === 'string') {
              result = {
                code: result,
                ast: null,
                map: null
              };
            } else if (typeof result.map === 'string') {
              result.map = JSON.parse(result.map);
            }
            sourceMapChain.push(result.map);
            ast = result.ast;
            return result.code;
          });
        });
      }, Promise.resolve(source.code)).then(function(code) {
        return {
          code: code,
          originalCode: originalCode,
          ast: ast,
          sourceMapChain: sourceMapChain
        };
      });
    }
    function transformBundle(code, transformers, sourceMapChain) {
      return transformers.reduce(function(code, transformer) {
        var result = transformer(code);
        if (result == null)
          return code;
        if (typeof result === 'string') {
          result = {
            code: result,
            map: null
          };
        }
        var map = typeof result.map === 'string' ? JSON.parse(result.map) : map;
        sourceMapChain.push(map);
        return result.code;
      }, code);
    }
    var charToInteger = {};
    var integerToChar = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('').forEach(function(char, i) {
      charToInteger[char] = i;
      integerToChar[i] = char;
    });
    function decode$1(string) {
      var result = [],
          len = string.length,
          i,
          hasContinuationBit,
          shift = 0,
          value = 0,
          integer,
          shouldNegate;
      for (i = 0; i < len; i += 1) {
        integer = charToInteger[string[i]];
        if (integer === undefined) {
          throw new Error('Invalid character (' + string[i] + ')');
        }
        hasContinuationBit = integer & 32;
        integer &= 31;
        value += integer << shift;
        if (hasContinuationBit) {
          shift += 5;
        } else {
          shouldNegate = value & 1;
          value >>= 1;
          result.push(shouldNegate ? -value : value);
          value = shift = 0;
        }
      }
      return result;
    }
    function encode$1(value) {
      var result,
          i;
      if (typeof value === 'number') {
        result = encodeInteger(value);
      } else {
        result = '';
        for (i = 0; i < value.length; i += 1) {
          result += encodeInteger(value[i]);
        }
      }
      return result;
    }
    function encodeInteger(num) {
      var result = '',
          clamped;
      if (num < 0) {
        num = (-num << 1) | 1;
      } else {
        num <<= 1;
      }
      do {
        clamped = num & 31;
        num >>= 5;
        if (num > 0) {
          clamped |= 32;
        }
        result += integerToChar[clamped];
      } while (num > 0);
      return result;
    }
    function decodeSegments(encodedSegments) {
      var i = encodedSegments.length;
      var segments = new Array(i);
      while (i--) {
        segments[i] = decode$1(encodedSegments[i]);
      }
      return segments;
    }
    function decode(mappings) {
      var sourceFileIndex = 0;
      var sourceCodeLine = 0;
      var sourceCodeColumn = 0;
      var nameIndex = 0;
      var lines = mappings.split(';');
      var numLines = lines.length;
      var decoded = new Array(numLines);
      var i = undefined;
      var j = undefined;
      var line = undefined;
      var generatedCodeColumn = undefined;
      var decodedLine = undefined;
      var segments = undefined;
      var segment = undefined;
      var result = undefined;
      for (i = 0; i < numLines; i += 1) {
        line = lines[i];
        generatedCodeColumn = 0;
        decodedLine = [];
        segments = decodeSegments(line.split(','));
        for (j = 0; j < segments.length; j += 1) {
          segment = segments[j];
          if (!segment.length) {
            break;
          }
          generatedCodeColumn += segment[0];
          result = [generatedCodeColumn];
          decodedLine.push(result);
          if (segment.length === 1) {
            continue;
          }
          sourceFileIndex += segment[1];
          sourceCodeLine += segment[2];
          sourceCodeColumn += segment[3];
          result.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);
          if (segment.length === 5) {
            nameIndex += segment[4];
            result.push(nameIndex);
          }
        }
        decoded[i] = decodedLine;
      }
      return decoded;
    }
    function encode(decoded) {
      var offsets = {
        generatedCodeColumn: 0,
        sourceFileIndex: 0,
        sourceCodeLine: 0,
        sourceCodeColumn: 0,
        nameIndex: 0
      };
      return decoded.map(function(line) {
        offsets.generatedCodeColumn = 0;
        return line.map(encodeSegment).join(',');
      }).join(';');
      function encodeSegment(segment) {
        if (!segment.length) {
          return segment;
        }
        var result = new Array(segment.length);
        result[0] = segment[0] - offsets.generatedCodeColumn;
        offsets.generatedCodeColumn = segment[0];
        if (segment.length === 1) {
          return encode$1(result);
        }
        result[1] = segment[1] - offsets.sourceFileIndex;
        result[2] = segment[2] - offsets.sourceCodeLine;
        result[3] = segment[3] - offsets.sourceCodeColumn;
        offsets.sourceFileIndex = segment[1];
        offsets.sourceCodeLine = segment[2];
        offsets.sourceCodeColumn = segment[3];
        if (segment.length === 5) {
          result[4] = segment[4] - offsets.nameIndex;
          offsets.nameIndex = segment[4];
        }
        return encode$1(result);
      }
    }
    function Source(index) {
      this.isOriginal = true;
      this.index = index;
    }
    Source.prototype = {traceSegment: function(line, column, name) {
        return {
          line: line,
          column: column,
          name: name,
          index: this.index
        };
      }};
    function Link(map, sources) {
      if (!map)
        throw new Error('Cannot generate a sourcemap if non-sourcemap-generating transformers are used');
      this.sources = sources;
      this.names = map.names;
      this.mappings = decode(map.mappings);
    }
    Link.prototype = {
      traceMappings: function() {
        var _this = this;
        var names = [];
        var mappings = this.mappings.map(function(line) {
          var tracedLine = [];
          line.forEach(function(segment) {
            var source = _this.sources[segment[1]];
            var traced = source.traceSegment(segment[2], segment[3], _this.names[segment[4]]);
            if (traced) {
              var nameIndex = null;
              segment = [segment[0], traced.index, traced.line, traced.column];
              if (traced.name) {
                nameIndex = names.indexOf(traced.name);
                if (nameIndex === -1) {
                  nameIndex = names.length;
                  names.push(traced.name);
                }
                segment[4] = nameIndex;
              }
              tracedLine.push(segment);
            }
          });
          return tracedLine;
        });
        return {
          names: names,
          mappings: mappings
        };
      },
      traceSegment: function(line, column, name) {
        var segments = this.mappings[line];
        if (!segments)
          return null;
        for (var i = 0; i < segments.length; i += 1) {
          var segment = segments[i];
          if (segment[0] > column)
            return null;
          if (segment[0] === column) {
            var source = this.sources[segment[1]];
            if (!source)
              throw new Error('Bad sourcemap');
            return source.traceSegment(segment[2], segment[3], this.names[segment[4]] || name);
          }
        }
        return null;
      }
    };
    function collapseSourcemaps(map, modules, bundleSourcemapChain) {
      var sources = modules.map(function(module, i) {
        var source = new Source(i);
        module.sourceMapChain.forEach(function(map) {
          source = new Link(map, [source]);
        });
        return source;
      });
      var source = new Link(map, sources);
      bundleSourcemapChain.forEach(function(map) {
        source = new Link(map, [source]);
      });
      var _source$traceMappings = source.traceMappings();
      var names = _source$traceMappings.names;
      var mappings = _source$traceMappings.mappings;
      map.sourcesContent = modules.map(function(module) {
        return module.originalCode;
      });
      map.mappings = encode(mappings);
      map.names = names;
      return map;
    }
    function callIfFunction(thing) {
      return typeof thing === 'function' ? thing() : thing;
    }
    var Bundle = (function() {
      function Bundle(options) {
        var _this = this;
        babelHelpers.classCallCheck(this, Bundle);
        this.plugins = ensureArray(options.plugins);
        this.plugins.forEach(function(plugin) {
          if (plugin.options) {
            options = plugin.options(options) || options;
          }
        });
        this.entry = unixizePath(options.entry);
        this.entryModule = null;
        this.resolveId = first([function(id) {
          return ~_this.external.indexOf(id) ? false : null;
        }].concat(this.plugins.map(function(plugin) {
          return plugin.resolveId;
        }).filter(Boolean)).concat(resolveId));
        this.load = first(this.plugins.map(function(plugin) {
          return plugin.load;
        }).filter(Boolean).concat(load));
        this.transformers = this.plugins.map(function(plugin) {
          return plugin.transform;
        }).filter(Boolean);
        this.bundleTransformers = this.plugins.map(function(plugin) {
          return plugin.transformBundle;
        }).filter(Boolean);
        this.moduleById = blank();
        this.modules = [];
        this.externalModules = [];
        this.internalNamespaces = [];
        this.assumedGlobals = blank();
        this.external = ensureArray(options.external).map(function(id) {
          return id.replace(/[\/\\]/g, '/');
        });
        this.onwarn = options.onwarn || makeOnwarn();
        ['module', 'exports', '_interopDefault'].forEach(function(global) {
          return _this.assumedGlobals[global] = true;
        });
      }
      Bundle.prototype.build = function build() {
        var _this2 = this;
        return this.resolveId(this.entry, undefined).then(function(id) {
          return _this2.fetchModule(id, undefined);
        }).then(function(entryModule) {
          _this2.entryModule = entryModule;
          _this2.modules.forEach(function(module) {
            return module.bindImportSpecifiers();
          });
          _this2.modules.forEach(function(module) {
            return module.bindAliases();
          });
          _this2.modules.forEach(function(module) {
            return module.bindReferences();
          });
          entryModule.getExports().forEach(function(name) {
            var declaration = entryModule.traceExport(name);
            declaration.exportName = name;
            declaration.use();
          });
          var settled = false;
          while (!settled) {
            settled = true;
            _this2.modules.forEach(function(module) {
              if (module.run())
                settled = false;
            });
          }
          _this2.orderedModules = _this2.sort();
          _this2.deconflict();
        });
      };
      Bundle.prototype.deconflict = function deconflict() {
        var used = blank();
        keys(this.assumedGlobals).forEach(function(name) {
          return used[name] = 1;
        });
        function getSafeName(name) {
          while (used[name]) {
            name += '$' + used[name]++;
          }
          used[name] = 1;
          return name;
        }
        this.externalModules.forEach(function(module) {
          module.name = getSafeName(module.name);
          forOwn(module.declarations, function(declaration, name) {
            declaration.setSafeName(getSafeName(name));
          });
        });
        this.modules.forEach(function(module) {
          forOwn(module.declarations, function(declaration, originalName) {
            if (declaration.isGlobal)
              return;
            if (originalName === 'default') {
              if (declaration.original && !declaration.original.isReassigned)
                return;
            }
            declaration.name = getSafeName(declaration.name);
          });
        });
      };
      Bundle.prototype.fetchModule = function fetchModule(id, importer) {
        var _this3 = this;
        if (id in this.moduleById)
          return null;
        this.moduleById[id] = null;
        return this.load(id).catch(function(err) {
          var msg = 'Could not load ' + id;
          if (importer)
            msg += ' (imported by ' + importer + ')';
          msg += ': ' + err.message;
          throw new Error(msg);
        }).then(function(source) {
          return transform(source, id, _this3.transformers);
        }).then(function(source) {
          var code = source.code;
          var originalCode = source.originalCode;
          var ast = source.ast;
          var sourceMapChain = source.sourceMapChain;
          var module = new Module({
            id: id,
            code: code,
            originalCode: originalCode,
            ast: ast,
            sourceMapChain: sourceMapChain,
            bundle: _this3
          });
          _this3.modules.push(module);
          _this3.moduleById[id] = module;
          return _this3.fetchAllDependencies(module).then(function() {
            return module;
          });
        });
      };
      Bundle.prototype.fetchAllDependencies = function fetchAllDependencies(module) {
        var _this4 = this;
        return mapSequence(module.sources, function(source) {
          return _this4.resolveId(source, module.id).then(function(resolvedId) {
            var externalName = undefined;
            if (resolvedId) {
              externalName = resolvedId.replace(/[\/\\]/g, '/');
            } else if (isRelative(source)) {
              externalName = resolve(module.id, '..', source);
            }
            var forcedExternal = externalName && ~_this4.external.indexOf(externalName);
            if (!resolvedId || forcedExternal) {
              if (!forcedExternal) {
                if (isRelative(source))
                  throw new Error('Could not resolve ' + source + ' from ' + module.id);
                if (!~_this4.external.indexOf(source))
                  _this4.onwarn('Treating \'' + source + '\' as external dependency');
              }
              module.resolvedIds[source] = source;
              if (!_this4.moduleById[source]) {
                var _module = new ExternalModule(source);
                _this4.externalModules.push(_module);
                _this4.moduleById[source] = _module;
              }
            } else {
              if (resolvedId === module.id) {
                throw new Error('A module cannot import itself (' + resolvedId + ')');
              }
              module.resolvedIds[source] = resolvedId;
              return _this4.fetchModule(resolvedId, module.id);
            }
          });
        });
      };
      Bundle.prototype.render = function render() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var format = options.format || 'es6';
        var exportMode = getExportMode(this, options.exports);
        var magicString = new MagicString.Bundle({separator: '\n\n'});
        var usedModules = [];
        this.orderedModules.forEach(function(module) {
          var source = module.render(format === 'es6');
          if (source.toString().length) {
            magicString.addSource(source);
            usedModules.push(module);
          }
        });
        var intro = [options.intro].concat(this.plugins.map(function(plugin) {
          return plugin.intro && plugin.intro();
        })).filter(Boolean).join('\n\n');
        if (intro)
          magicString.prepend(intro + '\n');
        if (options.outro)
          magicString.append('\n' + options.outro);
        var indentString = getIndentString(magicString, options);
        var finalise = finalisers[format];
        if (!finalise)
          throw new Error('You must specify an output type - valid options are ' + keys(finalisers).join(', '));
        magicString = finalise(this, magicString.trim(), {
          exportMode: exportMode,
          indentString: indentString
        }, options);
        var banner = [options.banner].concat(this.plugins.map(function(plugin) {
          return plugin.banner;
        })).map(callIfFunction).filter(Boolean).join('\n');
        var footer = [options.footer].concat(this.plugins.map(function(plugin) {
          return plugin.footer;
        })).map(callIfFunction).filter(Boolean).join('\n');
        if (banner)
          magicString.prepend(banner + '\n');
        if (footer)
          magicString.append('\n' + footer);
        var code = magicString.toString();
        var map = null;
        var bundleSourcemapChain = [];
        code = transformBundle(code, this.bundleTransformers, bundleSourcemapChain).replace(new RegExp('\\/\\/#\\s+' + SOURCEMAPPING_URL$1 + '=.+\\n?', 'g'), '');
        if (options.sourceMap) {
          var file = options.sourceMapFile || options.dest;
          if (file)
            file = resolve(typeof process !== 'undefined' ? process.cwd() : '', file);
          map = magicString.generateMap({
            file: file,
            includeContent: true
          });
          if (this.transformers.length || this.bundleTransformers.length) {
            map = collapseSourcemaps(map, usedModules, bundleSourcemapChain);
          }
          map.sources = map.sources.map(unixizePath);
        }
        return {
          code: code,
          map: map
        };
      };
      Bundle.prototype.sort = function sort() {
        var _this5 = this;
        var seen = {};
        var hasCycles = undefined;
        var ordered = [];
        var stronglyDependsOn = blank();
        var dependsOn = blank();
        this.modules.forEach(function(module) {
          stronglyDependsOn[module.id] = blank();
          dependsOn[module.id] = blank();
        });
        this.modules.forEach(function(module) {
          function processStrongDependency(dependency) {
            if (dependency === module || stronglyDependsOn[module.id][dependency.id])
              return;
            stronglyDependsOn[module.id][dependency.id] = true;
            dependency.strongDependencies.forEach(processStrongDependency);
          }
          function processDependency(dependency) {
            if (dependency === module || dependsOn[module.id][dependency.id])
              return;
            dependsOn[module.id][dependency.id] = true;
            dependency.dependencies.forEach(processDependency);
          }
          module.strongDependencies.forEach(processStrongDependency);
          module.dependencies.forEach(processDependency);
        });
        var visit = function(module) {
          if (seen[module.id]) {
            hasCycles = true;
            return;
          }
          seen[module.id] = true;
          module.dependencies.forEach(visit);
          ordered.push(module);
        };
        visit(this.entryModule);
        if (hasCycles) {
          ordered.forEach(function(a, i) {
            var _loop = function() {
              var b = ordered[i];
              if (stronglyDependsOn[a.id][b.id]) {
                (function() {
                  var parent = '[[unknown]]';
                  var findParent = function(module) {
                    if (dependsOn[module.id][a.id] && dependsOn[module.id][b.id]) {
                      parent = module.id;
                    } else {
                      for (var _i = 0; _i < module.dependencies.length; _i += 1) {
                        var dependency = module.dependencies[_i];
                        if (findParent(dependency))
                          return;
                      }
                    }
                  };
                  findParent(_this5.entryModule);
                  _this5.onwarn('Module ' + a.id + ' may be unable to evaluate without ' + b.id + ', but is included first due to a cyclical dependency. Consider swapping the import statements in ' + parent + ' to ensure correct ordering');
                })();
              }
            };
            for (i += 1; i < ordered.length; i += 1) {
              _loop();
            }
          });
        }
        return ordered;
      };
      return Bundle;
    })();
    var VERSION = '0.25.8';
    var ALLOWED_KEYS = ['banner', 'dest', 'entry', 'exports', 'external', 'footer', 'format', 'globals', 'indent', 'intro', 'moduleId', 'moduleName', 'onwarn', 'outro', 'plugins', 'sourceMap'];
    function rollup(options) {
      if (!options || !options.entry) {
        return Promise.reject(new Error('You must supply options.entry to rollup'));
      }
      if (options.transform || options.load || options.resolveId || options.resolveExternal) {
        return Promise.reject(new Error('The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details'));
      }
      var error = validateKeys(options, ALLOWED_KEYS);
      if (error) {
        return Promise.reject(error);
      }
      var bundle = new Bundle(options);
      return bundle.build().then(function() {
        return {
          imports: bundle.externalModules.map(function(module) {
            return module.id;
          }),
          exports: keys(bundle.entryModule.exports),
          modules: bundle.orderedModules.map(function(module) {
            return {id: module.id};
          }),
          generate: function(options) {
            return bundle.render(options);
          },
          write: function(options) {
            if (!options || !options.dest) {
              throw new Error('You must supply options.dest to bundle.write');
            }
            var dest = options.dest;
            var _bundle$render = bundle.render(options);
            var code = _bundle$render.code;
            var map = _bundle$render.map;
            var promises = [];
            if (options.sourceMap) {
              var url = undefined;
              if (options.sourceMap === 'inline') {
                url = map.toUrl();
              } else {
                url = _basename(dest) + '.map';
                promises.push(writeFile(dest + '.map', map.toString()));
              }
              code += '\n//# ' + SOURCEMAPPING_URL$1 + '=' + url;
            }
            promises.push(writeFile(dest, code));
            return Promise.all(promises);
          }
        };
      });
    }
    exports.rollup = rollup;
    exports.VERSION = VERSION;
  }));
})(require('buffer').Buffer, require('process'));
