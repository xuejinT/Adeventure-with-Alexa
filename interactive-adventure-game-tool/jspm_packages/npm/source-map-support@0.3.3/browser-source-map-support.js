/* */ 
(function(Buffer, process) {
  (this.define || function(K, N) {
    this.sourceMapSupport = N();
  })("browser-source-map-support", function(K) {
    (function n(w, t, e) {
      function r(g, b) {
        if (!t[g]) {
          if (!w[g]) {
            var f = "function" == typeof require && require;
            if (!b && f)
              return f(g, !0);
            if (l)
              return l(g, !0);
            throw Error("Cannot find module '" + g + "'");
          }
          f = t[g] = {exports: {}};
          w[g][0].call(f.exports, function(b) {
            var a = w[g][1][b];
            return r(a ? a : b);
          }, f, f.exports, n, w, t, e);
        }
        return t[g].exports;
      }
      for (var l = "function" == typeof require && require,
          m = 0; m < e.length; m++)
        r(e[m]);
      return r;
    })({
      1: [function(n, w, t) {
        K = n("./source-map-support");
      }, {"./source-map-support": 18}],
      2: [function(n, w, t) {
        (function(e, r) {
          w.exports = function(l, m) {
            function g(c, d) {
              var a;
              if (c && "." === c.charAt(0) && d) {
                a = d.split("/");
                a = a.slice(0, a.length - 1);
                var b = a = a.concat(c.split("/")),
                    f,
                    k;
                for (f = 0; b[f]; f += 1)
                  if (k = b[f], "." === k)
                    b.splice(f, 1), --f;
                  else if (".." === k)
                    if (1 !== f || ".." !== b[2] && ".." !== b[0])
                      0 < f && (b.splice(f - 1, 2), f -= 2);
                    else
                      break;
                c = a.join("/");
              }
              return c;
            }
            function b(c) {
              return function(a) {
                return g(a, c);
              };
            }
            function f(c) {
              function a(b) {
                d[c] = b;
              }
              a.fromText = function(c, a) {
                throw Error("amdefine does not implement load.fromText");
              };
              return a;
            }
            function k(c, a, b) {
              var f,
                  k,
                  g;
              if (c)
                k = d[c] = {}, g = {
                  id: c,
                  uri: r,
                  exports: k
                }, f = A(m, k, g, c);
              else {
                if (y)
                  throw Error("amdefine with no module ID cannot be called more than once per file.");
                y = !0;
                k = l.exports;
                g = l;
                f = A(m, k, g, l.id);
              }
              a && (a = a.map(function(c) {
                return f(c);
              }));
              a = "function" === typeof b ? b.apply(g.exports, a) : b;
              void 0 !== a && (g.exports = a, c && (d[c] = g.exports));
            }
            function a(a, d, b) {
              Array.isArray(a) ? (b = d, d = a, a = void 0) : "string" !== typeof a && (b = a, a = d = void 0);
              d && !Array.isArray(d) && (b = d, d = void 0);
              d || (d = ["require", "exports", "module"]);
              a ? c[a] = [a, d, b] : k(a, d, b);
            }
            var c = {},
                d = {},
                y = !1,
                x = n("path"),
                A,
                B;
            A = function(c, a, d, b) {
              function f(k, g) {
                if ("string" === typeof k)
                  return B(c, a, d, k, b);
                k = k.map(function(f) {
                  return B(c, a, d, f, b);
                });
                g && e.nextTick(function() {
                  g.apply(null, k);
                });
              }
              f.toUrl = function(c) {
                return 0 === c.indexOf(".") ? g(c, x.dirname(d.filename)) : c;
              };
              return f;
            };
            m = m || function() {
              return l.require.apply(l, arguments);
            };
            B = function(a, e, y, m, x) {
              var l = m.indexOf("!"),
                  r = m;
              if (-1 === l) {
                m = g(m, x);
                if ("require" === m)
                  return A(a, e, y, x);
                if ("exports" === m)
                  return e;
                if ("module" === m)
                  return y;
                if (d.hasOwnProperty(m))
                  return d[m];
                if (c[m])
                  return k.apply(null, c[m]), d[m];
                if (a)
                  return a(r);
                throw Error("No module with ID: " + m);
              }
              r = m.substring(0, l);
              m = m.substring(l + 1, m.length);
              l = B(a, e, y, r, x);
              m = l.normalize ? l.normalize(m, b(x)) : g(m, x);
              d[m] || l.load(m, A(a, e, y, x), f(m), {});
              return d[m];
            };
            a.require = function(a) {
              if (d[a])
                return d[a];
              if (c[a])
                return k.apply(null, c[a]), d[a];
            };
            a.amd = {};
            return a;
          };
        }).call(this, n("node_modules/process/browser.js"), "/node_modules/amdefine/amdefine.js");
      }, {
        "node_modules/process/browser.js": 8,
        path: 7
      }],
      3: [function(n, w, t) {
        (function(e) {
          function r(e) {
            e = e.charCodeAt(0);
            if (43 === e || 45 === e)
              return 62;
            if (47 === e || 95 === e)
              return 63;
            if (48 > e)
              return -1;
            if (58 > e)
              return e - 48 + 52;
            if (91 > e)
              return e - 65;
            if (123 > e)
              return e - 97 + 26;
          }
          var l = "undefined" !== typeof Uint8Array ? Uint8Array : Array;
          e.toByteArray = function(e) {
            function g(a) {
              c[d++] = a;
            }
            var b,
                f,
                k,
                a,
                c;
            if (0 < e.length % 4)
              throw Error("Invalid string. Length must be a multiple of 4");
            b = e.length;
            a = "=" === e.charAt(b - 2) ? 2 : "=" === e.charAt(b - 1) ? 1 : 0;
            c = new l(3 * e.length / 4 - a);
            f = 0 < a ? e.length - 4 : e.length;
            var d = 0;
            for (b = 0; b < f; b += 4)
              k = r(e.charAt(b)) << 18 | r(e.charAt(b + 1)) << 12 | r(e.charAt(b + 2)) << 6 | r(e.charAt(b + 3)), g((k & 16711680) >> 16), g((k & 65280) >> 8), g(k & 255);
            2 === a ? (k = r(e.charAt(b)) << 2 | r(e.charAt(b + 1)) >> 4, g(k & 255)) : 1 === a && (k = r(e.charAt(b)) << 10 | r(e.charAt(b + 1)) << 4 | r(e.charAt(b + 2)) >> 2, g(k >> 8 & 255), g(k & 255));
            return c;
          };
          e.fromByteArray = function(e) {
            var g,
                b = e.length % 3,
                f = "",
                k,
                a;
            g = 0;
            for (a = e.length - b; g < a; g += 3)
              k = (e[g] << 16) + (e[g + 1] << 8) + e[g + 2], k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k >> 18 & 63) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k >> 12 & 63) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k >> 6 & 63) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k & 63), f += k;
            switch (b) {
              case 1:
                k = e[e.length - 1];
                f += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k >> 2);
                f += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k << 4 & 63);
                f += "==";
                break;
              case 2:
                k = (e[e.length - 2] << 8) + e[e.length - 1], f += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k >> 10), f += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k >> 4 & 63), f += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(k << 2 & 63), f += "=";
            }
            return f;
          };
        })("undefined" === typeof t ? this.base64js = {} : t);
      }, {}],
      4: [function(n, w, t) {}, {}],
      5: [function(n, w, t) {
        function e(h, q, c) {
          if (!(this instanceof e))
            return new e(h, q, c);
          var a = typeof h;
          if ("base64" === q && "string" === a)
            for (h = h.trim ? h.trim() : h.replace(/^\s+|\s+$/g, ""); 0 !== h.length % 4; )
              h += "=";
          var d;
          if ("number" === a)
            d = F(h);
          else if ("string" === a)
            d = e.byteLength(h, q);
          else if ("object" === a)
            d = F(h.length);
          else
            throw Error("First argument needs to be a number, array or string.");
          var b;
          e._useTypedArrays ? b = e._augment(new Uint8Array(d)) : (b = this, b.length = d, b._isBuffer = !0);
          if (e._useTypedArrays && "number" === typeof h.byteLength)
            b._set(h);
          else {
            var f = h;
            if (E(f) || e.isBuffer(f) || f && "object" === typeof f && "number" === typeof f.length)
              for (q = 0; q < d; q++)
                e.isBuffer(h) ? b[q] = h.readUInt8(q) : b[q] = h[q];
            else if ("string" === a)
              b.write(h, 0, q);
            else if ("number" === a && !e._useTypedArrays && !c)
              for (q = 0; q < d; q++)
                b[q] = 0;
          }
          return b;
        }
        function r(h, q, c) {
          var a = "";
          for (c = Math.min(h.length, c); q < c; q++)
            a += String.fromCharCode(h[q]);
          return a;
        }
        function l(h, q, c, a) {
          a || (p("boolean" === typeof c, "missing or invalid endian"), p(void 0 !== q && null !== q, "missing offset"), p(q + 1 < h.length, "Trying to read beyond buffer length"));
          a = h.length;
          if (!(q >= a))
            return c ? (c = h[q], q + 1 < a && (c |= h[q + 1] << 8)) : (c = h[q] << 8, q + 1 < a && (c |= h[q + 1])), c;
        }
        function m(h, q, c, a) {
          a || (p("boolean" === typeof c, "missing or invalid endian"), p(void 0 !== q && null !== q, "missing offset"), p(q + 3 < h.length, "Trying to read beyond buffer length"));
          a = h.length;
          if (!(q >= a)) {
            var d;
            c ? (q + 2 < a && (d = h[q + 2] << 16), q + 1 < a && (d |= h[q + 1] << 8), d |= h[q], q + 3 < a && (d += h[q + 3] << 24 >>> 0)) : (q + 1 < a && (d = h[q + 1] << 16), q + 2 < a && (d |= h[q + 2] << 8), q + 3 < a && (d |= h[q + 3]), d += h[q] << 24 >>> 0);
            return d;
          }
        }
        function g(h, q, a, c) {
          c || (p("boolean" === typeof a, "missing or invalid endian"), p(void 0 !== q && null !== q, "missing offset"), p(q + 1 < h.length, "Trying to read beyond buffer length"));
          if (!(q >= h.length))
            return h = l(h, q, a, !0), h & 32768 ? -1 * (65535 - h + 1) : h;
        }
        function b(h, q, a, c) {
          c || (p("boolean" === typeof a, "missing or invalid endian"), p(void 0 !== q && null !== q, "missing offset"), p(q + 3 < h.length, "Trying to read beyond buffer length"));
          if (!(q >= h.length))
            return h = m(h, q, a, !0), h & 2147483648 ? -1 * (4294967295 - h + 1) : h;
        }
        function f(h, q, a, c) {
          c || (p("boolean" === typeof a, "missing or invalid endian"), p(q + 3 < h.length, "Trying to read beyond buffer length"));
          return I.read(h, q, a, 23, 4);
        }
        function k(h, q, a, c) {
          c || (p("boolean" === typeof a, "missing or invalid endian"), p(q + 7 < h.length, "Trying to read beyond buffer length"));
          return I.read(h, q, a, 52, 8);
        }
        function a(h, a, c, d, b) {
          b || (p(void 0 !== a && null !== a, "missing value"), p("boolean" === typeof d, "missing or invalid endian"), p(void 0 !== c && null !== c, "missing offset"), p(c + 1 < h.length, "trying to write beyond buffer length"), H(a, 65535));
          var f = h.length;
          if (!(c >= f))
            for (b = 0, f = Math.min(f - c, 2); b < f; b++)
              h[c + b] = (a & 255 << 8 * (d ? b : 1 - b)) >>> 8 * (d ? b : 1 - b);
        }
        function c(h, a, c, d, b) {
          b || (p(void 0 !== a && null !== a, "missing value"), p("boolean" === typeof d, "missing or invalid endian"), p(void 0 !== c && null !== c, "missing offset"), p(c + 3 < h.length, "trying to write beyond buffer length"), H(a, 4294967295));
          var f = h.length;
          if (!(c >= f))
            for (b = 0, f = Math.min(f - c, 4); b < f; b++)
              h[c + b] = a >>> 8 * (d ? b : 3 - b) & 255;
        }
        function d(h, c, d, b, f) {
          f || (p(void 0 !== c && null !== c, "missing value"), p("boolean" === typeof b, "missing or invalid endian"), p(void 0 !== d && null !== d, "missing offset"), p(d + 1 < h.length, "Trying to write beyond buffer length"), L(c, 32767, -32768));
          d >= h.length || (0 <= c ? a(h, c, d, b, f) : a(h, 65535 + c + 1, d, b, f));
        }
        function y(h, a, d, b, f) {
          f || (p(void 0 !== a && null !== a, "missing value"), p("boolean" === typeof b, "missing or invalid endian"), p(void 0 !== d && null !== d, "missing offset"), p(d + 3 < h.length, "Trying to write beyond buffer length"), L(a, 2147483647, -2147483648));
          d >= h.length || (0 <= a ? c(h, a, d, b, f) : c(h, 4294967295 + a + 1, d, b, f));
        }
        function x(h, a, c, d, b) {
          b || (p(void 0 !== a && null !== a, "missing value"), p("boolean" === typeof d, "missing or invalid endian"), p(void 0 !== c && null !== c, "missing offset"), p(c + 3 < h.length, "Trying to write beyond buffer length"), M(a, 3.4028234663852886E38, -3.4028234663852886E38));
          c >= h.length || I.write(h, a, c, d, 23, 4);
        }
        function A(h, c, a, d, b) {
          b || (p(void 0 !== c && null !== c, "missing value"), p("boolean" === typeof d, "missing or invalid endian"), p(void 0 !== a && null !== a, "missing offset"), p(a + 7 < h.length, "Trying to write beyond buffer length"), M(c, 1.7976931348623157E308, -1.7976931348623157E308));
          a >= h.length || I.write(h, c, a, d, 52, 8);
        }
        function B(h, a, c) {
          if ("number" !== typeof h)
            return c;
          h = ~~h;
          if (h >= a)
            return a;
          if (0 <= h)
            return h;
          h += a;
          return 0 <= h ? h : 0;
        }
        function F(h) {
          h = ~~Math.ceil(+h);
          return 0 > h ? 0 : h;
        }
        function E(h) {
          return (Array.isArray || function(h) {
            return "[object Array]" === Object.prototype.toString.call(h);
          })(h);
        }
        function G(h) {
          return 16 > h ? "0" + h.toString(16) : h.toString(16);
        }
        function u(h) {
          for (var a = [],
              c = 0; c < h.length; c++) {
            var d = h.charCodeAt(c);
            if (127 >= d)
              a.push(h.charCodeAt(c));
            else {
              var b = c;
              55296 <= d && 57343 >= d && c++;
              d = encodeURIComponent(h.slice(b, c + 1)).substr(1).split("%");
              for (b = 0; b < d.length; b++)
                a.push(parseInt(d[b], 16));
            }
          }
          return a;
        }
        function C(h) {
          for (var c = [],
              a = 0; a < h.length; a++)
            c.push(h.charCodeAt(a) & 255);
          return c;
        }
        function z(h, c, a, d) {
          for (var b = 0; b < d && !(b + a >= c.length || b >= h.length); b++)
            c[b + a] = h[b];
          return b;
        }
        function D(h) {
          try {
            return decodeURIComponent(h);
          } catch (c) {
            return String.fromCharCode(65533);
          }
        }
        function H(h, c) {
          p("number" === typeof h, "cannot write a non-number as a number");
          p(0 <= h, "specified a negative value for writing an unsigned value");
          p(h <= c, "value is larger than maximum value for type");
          p(Math.floor(h) === h, "value has a fractional component");
        }
        function L(h, c, a) {
          p("number" === typeof h, "cannot write a non-number as a number");
          p(h <= c, "value larger than maximum allowed value");
          p(h >= a, "value smaller than minimum allowed value");
          p(Math.floor(h) === h, "value has a fractional component");
        }
        function M(h, c, a) {
          p("number" === typeof h, "cannot write a non-number as a number");
          p(h <= c, "value larger than maximum allowed value");
          p(h >= a, "value smaller than minimum allowed value");
        }
        function p(h, c) {
          if (!h)
            throw Error(c || "Failed assertion");
        }
        var J = n("base64-js"),
            I = n("ieee754");
        t.Buffer = e;
        t.SlowBuffer = e;
        t.INSPECT_MAX_BYTES = 50;
        e.poolSize = 8192;
        e._useTypedArrays = function() {
          try {
            var h = new ArrayBuffer(0),
                c = new Uint8Array(h);
            c.foo = function() {
              return 42;
            };
            return 42 === c.foo() && "function" === typeof c.subarray;
          } catch (a) {
            return !1;
          }
        }();
        e.isEncoding = function(h) {
          switch (String(h).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "raw":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return !0;
            default:
              return !1;
          }
        };
        e.isBuffer = function(h) {
          return !(null === h || void 0 === h || !h._isBuffer);
        };
        e.byteLength = function(h, c) {
          var a;
          h += "";
          switch (c || "utf8") {
            case "hex":
              a = h.length / 2;
              break;
            case "utf8":
            case "utf-8":
              a = u(h).length;
              break;
            case "ascii":
            case "binary":
            case "raw":
              a = h.length;
              break;
            case "base64":
              a = J.toByteArray(h).length;
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              a = 2 * h.length;
              break;
            default:
              throw Error("Unknown encoding");
          }
          return a;
        };
        e.concat = function(h, c) {
          p(E(h), "Usage: Buffer.concat(list, [totalLength])\nlist should be an Array.");
          if (0 === h.length)
            return new e(0);
          if (1 === h.length)
            return h[0];
          var a;
          if ("number" !== typeof c)
            for (a = c = 0; a < h.length; a++)
              c += h[a].length;
          var d = new e(c),
              b = 0;
          for (a = 0; a < h.length; a++) {
            var f = h[a];
            f.copy(d, b);
            b += f.length;
          }
          return d;
        };
        e.prototype.write = function(h, c, a, d) {
          if (isFinite(c))
            isFinite(a) || (d = a, a = void 0);
          else {
            var b = d;
            d = c;
            c = a;
            a = b;
          }
          c = Number(c) || 0;
          b = this.length - c;
          a ? (a = Number(a), a > b && (a = b)) : a = b;
          d = String(d || "utf8").toLowerCase();
          switch (d) {
            case "hex":
              c = Number(c) || 0;
              d = this.length - c;
              a ? (a = Number(a), a > d && (a = d)) : a = d;
              d = h.length;
              p(0 === d % 2, "Invalid hex string");
              a > d / 2 && (a = d / 2);
              for (d = 0; d < a; d++)
                b = parseInt(h.substr(2 * d, 2), 16), p(!isNaN(b), "Invalid hex string"), this[c + d] = b;
              e._charsWritten = 2 * d;
              h = d;
              break;
            case "utf8":
            case "utf-8":
              h = e._charsWritten = z(u(h), this, c, a);
              break;
            case "ascii":
              h = e._charsWritten = z(C(h), this, c, a);
              break;
            case "binary":
              h = e._charsWritten = z(C(h), this, c, a);
              break;
            case "base64":
              h = e._charsWritten = z(J.toByteArray(h), this, c, a);
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              for (var f,
                  b = [],
                  k = 0; k < h.length; k++)
                f = h.charCodeAt(k), d = f >> 8, f %= 256, b.push(f), b.push(d);
              h = e._charsWritten = z(b, this, c, a);
              break;
            default:
              throw Error("Unknown encoding");
          }
          return h;
        };
        e.prototype.toString = function(a, c, d) {
          a = String(a || "utf8").toLowerCase();
          c = Number(c) || 0;
          d = void 0 !== d ? Number(d) : d = this.length;
          if (d === c)
            return "";
          switch (a) {
            case "hex":
              a = this.length;
              if (!c || 0 > c)
                c = 0;
              if (!d || 0 > d || d > a)
                d = a;
              for (a = ""; c < d; c++)
                a += G(this[c]);
              d = a;
              break;
            case "utf8":
            case "utf-8":
              var b = a = "";
              for (d = Math.min(this.length, d); c < d; c++)
                127 >= this[c] ? (a += D(b) + String.fromCharCode(this[c]), b = "") : b += "%" + this[c].toString(16);
              d = a + D(b);
              break;
            case "ascii":
              d = r(this, c, d);
              break;
            case "binary":
              d = r(this, c, d);
              break;
            case "base64":
              d = 0 === c && d === this.length ? J.fromByteArray(this) : J.fromByteArray(this.slice(c, d));
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              d = this.slice(c, d);
              c = "";
              for (a = 0; a < d.length; a += 2)
                c += String.fromCharCode(d[a] + 256 * d[a + 1]);
              d = c;
              break;
            default:
              throw Error("Unknown encoding");
          }
          return d;
        };
        e.prototype.toJSON = function() {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0)
          };
        };
        e.prototype.copy = function(a, c, d, b) {
          d || (d = 0);
          b || 0 === b || (b = this.length);
          c || (c = 0);
          if (b !== d && 0 !== a.length && 0 !== this.length)
            if (p(b >= d, "sourceEnd < sourceStart"), p(0 <= c && c < a.length, "targetStart out of bounds"), p(0 <= d && d < this.length, "sourceStart out of bounds"), p(0 <= b && b <= this.length, "sourceEnd out of bounds"), b > this.length && (b = this.length), a.length - c < b - d && (b = a.length - c + d), b -= d, 100 > b || !e._useTypedArrays)
              for (var f = 0; f < b; f++)
                a[f + c] = this[f + d];
            else
              a._set(this.subarray(d, d + b), c);
        };
        e.prototype.slice = function(a, c) {
          var d = this.length;
          a = B(a, d, 0);
          c = B(c, d, d);
          if (e._useTypedArrays)
            return e._augment(this.subarray(a, c));
          for (var d = c - a,
              b = new e(d, void 0, !0),
              f = 0; f < d; f++)
            b[f] = this[f + a];
          return b;
        };
        e.prototype.get = function(a) {
          console.log(".get() is deprecated. Access using array indexes instead.");
          return this.readUInt8(a);
        };
        e.prototype.set = function(a, c) {
          console.log(".set() is deprecated. Access using array indexes instead.");
          return this.writeUInt8(a, c);
        };
        e.prototype.readUInt8 = function(a, c) {
          c || (p(void 0 !== a && null !== a, "missing offset"), p(a < this.length, "Trying to read beyond buffer length"));
          if (!(a >= this.length))
            return this[a];
        };
        e.prototype.readUInt16LE = function(a, c) {
          return l(this, a, !0, c);
        };
        e.prototype.readUInt16BE = function(a, c) {
          return l(this, a, !1, c);
        };
        e.prototype.readUInt32LE = function(a, c) {
          return m(this, a, !0, c);
        };
        e.prototype.readUInt32BE = function(a, c) {
          return m(this, a, !1, c);
        };
        e.prototype.readInt8 = function(a, c) {
          c || (p(void 0 !== a && null !== a, "missing offset"), p(a < this.length, "Trying to read beyond buffer length"));
          if (!(a >= this.length))
            return this[a] & 128 ? -1 * (255 - this[a] + 1) : this[a];
        };
        e.prototype.readInt16LE = function(a, c) {
          return g(this, a, !0, c);
        };
        e.prototype.readInt16BE = function(a, c) {
          return g(this, a, !1, c);
        };
        e.prototype.readInt32LE = function(a, c) {
          return b(this, a, !0, c);
        };
        e.prototype.readInt32BE = function(a, c) {
          return b(this, a, !1, c);
        };
        e.prototype.readFloatLE = function(a, c) {
          return f(this, a, !0, c);
        };
        e.prototype.readFloatBE = function(a, c) {
          return f(this, a, !1, c);
        };
        e.prototype.readDoubleLE = function(a, c) {
          return k(this, a, !0, c);
        };
        e.prototype.readDoubleBE = function(a, c) {
          return k(this, a, !1, c);
        };
        e.prototype.writeUInt8 = function(a, c, d) {
          d || (p(void 0 !== a && null !== a, "missing value"), p(void 0 !== c && null !== c, "missing offset"), p(c < this.length, "trying to write beyond buffer length"), H(a, 255));
          c >= this.length || (this[c] = a);
        };
        e.prototype.writeUInt16LE = function(c, d, b) {
          a(this, c, d, !0, b);
        };
        e.prototype.writeUInt16BE = function(c, d, b) {
          a(this, c, d, !1, b);
        };
        e.prototype.writeUInt32LE = function(a, d, b) {
          c(this, a, d, !0, b);
        };
        e.prototype.writeUInt32BE = function(a, d, b) {
          c(this, a, d, !1, b);
        };
        e.prototype.writeInt8 = function(a, c, d) {
          d || (p(void 0 !== a && null !== a, "missing value"), p(void 0 !== c && null !== c, "missing offset"), p(c < this.length, "Trying to write beyond buffer length"), L(a, 127, -128));
          c >= this.length || (0 <= a ? this.writeUInt8(a, c, d) : this.writeUInt8(255 + a + 1, c, d));
        };
        e.prototype.writeInt16LE = function(a, c, b) {
          d(this, a, c, !0, b);
        };
        e.prototype.writeInt16BE = function(a, c, b) {
          d(this, a, c, !1, b);
        };
        e.prototype.writeInt32LE = function(a, c, d) {
          y(this, a, c, !0, d);
        };
        e.prototype.writeInt32BE = function(a, c, d) {
          y(this, a, c, !1, d);
        };
        e.prototype.writeFloatLE = function(a, c, d) {
          x(this, a, c, !0, d);
        };
        e.prototype.writeFloatBE = function(a, c, d) {
          x(this, a, c, !1, d);
        };
        e.prototype.writeDoubleLE = function(a, c, d) {
          A(this, a, c, !0, d);
        };
        e.prototype.writeDoubleBE = function(a, c, d) {
          A(this, a, c, !1, d);
        };
        e.prototype.fill = function(a, c, d) {
          a || (a = 0);
          c || (c = 0);
          d || (d = this.length);
          "string" === typeof a && (a = a.charCodeAt(0));
          p("number" === typeof a && !isNaN(a), "value is not a number");
          p(d >= c, "end < start");
          if (d !== c && 0 !== this.length)
            for (p(0 <= c && c < this.length, "start out of bounds"), p(0 <= d && d <= this.length, "end out of bounds"); c < d; c++)
              this[c] = a;
        };
        e.prototype.inspect = function() {
          for (var a = [],
              c = this.length,
              d = 0; d < c; d++)
            if (a[d] = G(this[d]), d === t.INSPECT_MAX_BYTES) {
              a[d + 1] = "...";
              break;
            }
          return "<Buffer " + a.join(" ") + ">";
        };
        e.prototype.toArrayBuffer = function() {
          if ("undefined" !== typeof Uint8Array) {
            if (e._useTypedArrays)
              return (new e(this)).buffer;
            for (var a = new Uint8Array(this.length),
                c = 0,
                d = a.length; c < d; c += 1)
              a[c] = this[c];
            return a.buffer;
          }
          throw Error("Buffer.toArrayBuffer not supported in this browser");
        };
        var v = e.prototype;
        e._augment = function(a) {
          a._isBuffer = !0;
          a._get = a.get;
          a._set = a.set;
          a.get = v.get;
          a.set = v.set;
          a.write = v.write;
          a.toString = v.toString;
          a.toLocaleString = v.toString;
          a.toJSON = v.toJSON;
          a.copy = v.copy;
          a.slice = v.slice;
          a.readUInt8 = v.readUInt8;
          a.readUInt16LE = v.readUInt16LE;
          a.readUInt16BE = v.readUInt16BE;
          a.readUInt32LE = v.readUInt32LE;
          a.readUInt32BE = v.readUInt32BE;
          a.readInt8 = v.readInt8;
          a.readInt16LE = v.readInt16LE;
          a.readInt16BE = v.readInt16BE;
          a.readInt32LE = v.readInt32LE;
          a.readInt32BE = v.readInt32BE;
          a.readFloatLE = v.readFloatLE;
          a.readFloatBE = v.readFloatBE;
          a.readDoubleLE = v.readDoubleLE;
          a.readDoubleBE = v.readDoubleBE;
          a.writeUInt8 = v.writeUInt8;
          a.writeUInt16LE = v.writeUInt16LE;
          a.writeUInt16BE = v.writeUInt16BE;
          a.writeUInt32LE = v.writeUInt32LE;
          a.writeUInt32BE = v.writeUInt32BE;
          a.writeInt8 = v.writeInt8;
          a.writeInt16LE = v.writeInt16LE;
          a.writeInt16BE = v.writeInt16BE;
          a.writeInt32LE = v.writeInt32LE;
          a.writeInt32BE = v.writeInt32BE;
          a.writeFloatLE = v.writeFloatLE;
          a.writeFloatBE = v.writeFloatBE;
          a.writeDoubleLE = v.writeDoubleLE;
          a.writeDoubleBE = v.writeDoubleBE;
          a.fill = v.fill;
          a.inspect = v.inspect;
          a.toArrayBuffer = v.toArrayBuffer;
          return a;
        };
      }, {
        "base64-js": 3,
        ieee754: 6
      }],
      6: [function(n, w, t) {
        t.read = function(e, r, l, m, g) {
          var b;
          b = 8 * g - m - 1;
          var f = (1 << b) - 1,
              k = f >> 1,
              a = -7;
          g = l ? g - 1 : 0;
          var c = l ? -1 : 1,
              d = e[r + g];
          g += c;
          l = d & (1 << -a) - 1;
          d >>= -a;
          for (a += b; 0 < a; l = 256 * l + e[r + g], g += c, a -= 8)
            ;
          b = l & (1 << -a) - 1;
          l >>= -a;
          for (a += m; 0 < a; b = 256 * b + e[r + g], g += c, a -= 8)
            ;
          if (0 === l)
            l = 1 - k;
          else {
            if (l === f)
              return b ? NaN : Infinity * (d ? -1 : 1);
            b += Math.pow(2, m);
            l -= k;
          }
          return (d ? -1 : 1) * b * Math.pow(2, l - m);
        };
        t.write = function(e, r, l, m, g, b) {
          var f,
              k = 8 * b - g - 1,
              a = (1 << k) - 1,
              c = a >> 1,
              d = 23 === g ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
          b = m ? 0 : b - 1;
          var y = m ? 1 : -1,
              x = 0 > r || 0 === r && 0 > 1 / r ? 1 : 0;
          r = Math.abs(r);
          isNaN(r) || Infinity === r ? (r = isNaN(r) ? 1 : 0, m = a) : (m = Math.floor(Math.log(r) / Math.LN2), 1 > r * (f = Math.pow(2, -m)) && (m--, f *= 2), r = 1 <= m + c ? r + d / f : r + d * Math.pow(2, 1 - c), 2 <= r * f && (m++, f /= 2), m + c >= a ? (r = 0, m = a) : 1 <= m + c ? (r = (r * f - 1) * Math.pow(2, g), m += c) : (r = r * Math.pow(2, c - 1) * Math.pow(2, g), m = 0));
          for (; 8 <= g; e[l + b] = r & 255, b += y, r /= 256, g -= 8)
            ;
          m = m << g | r;
          for (k += g; 0 < k; e[l + b] = m & 255, b += y, m /= 256, k -= 8)
            ;
          e[l + b - y] |= 128 * x;
        };
      }, {}],
      7: [function(n, w, t) {
        (function(e) {
          function r(b, f) {
            for (var e = 0,
                a = b.length - 1; 0 <= a; a--) {
              var c = b[a];
              "." === c ? b.splice(a, 1) : ".." === c ? (b.splice(a, 1), e++) : e && (b.splice(a, 1), e--);
            }
            if (f)
              for (; e--; e)
                b.unshift("..");
            return b;
          }
          function l(b, f) {
            if (b.filter)
              return b.filter(f);
            for (var e = [],
                a = 0; a < b.length; a++)
              f(b[a], a, b) && e.push(b[a]);
            return e;
          }
          var m = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          t.resolve = function() {
            for (var b = "",
                f = !1,
                k = arguments.length - 1; -1 <= k && !f; k--) {
              var a = 0 <= k ? arguments[k] : e.cwd();
              if ("string" !== typeof a)
                throw new TypeError("Arguments to path.resolve must be strings");
              a && (b = a + "/" + b, f = "/" === a.charAt(0));
            }
            b = r(l(b.split("/"), function(a) {
              return !!a;
            }), !f).join("/");
            return (f ? "/" : "") + b || ".";
          };
          t.normalize = function(b) {
            var f = t.isAbsolute(b),
                e = "/" === g(b, -1);
            (b = r(l(b.split("/"), function(a) {
              return !!a;
            }), !f).join("/")) || f || (b = ".");
            b && e && (b += "/");
            return (f ? "/" : "") + b;
          };
          t.isAbsolute = function(b) {
            return "/" === b.charAt(0);
          };
          t.join = function() {
            var b = Array.prototype.slice.call(arguments, 0);
            return t.normalize(l(b, function(b, e) {
              if ("string" !== typeof b)
                throw new TypeError("Arguments to path.join must be strings");
              return b;
            }).join("/"));
          };
          t.relative = function(b, f) {
            function e(a) {
              for (var c = 0; c < a.length && "" === a[c]; c++)
                ;
              for (var d = a.length - 1; 0 <= d && "" === a[d]; d--)
                ;
              return c > d ? [] : a.slice(c, d - c + 1);
            }
            b = t.resolve(b).substr(1);
            f = t.resolve(f).substr(1);
            for (var a = e(b.split("/")),
                c = e(f.split("/")),
                d = Math.min(a.length, c.length),
                g = d,
                x = 0; x < d; x++)
              if (a[x] !== c[x]) {
                g = x;
                break;
              }
            d = [];
            for (x = g; x < a.length; x++)
              d.push("..");
            d = d.concat(c.slice(g));
            return d.join("/");
          };
          t.sep = "/";
          t.delimiter = ":";
          t.dirname = function(b) {
            var f = m.exec(b).slice(1);
            b = f[0];
            f = f[1];
            if (!b && !f)
              return ".";
            f && (f = f.substr(0, f.length - 1));
            return b + f;
          };
          t.basename = function(b, f) {
            var e = m.exec(b).slice(1)[2];
            f && e.substr(-1 * f.length) === f && (e = e.substr(0, e.length - f.length));
            return e;
          };
          t.extname = function(b) {
            return m.exec(b).slice(1)[3];
          };
          var g = "b" === "ab".substr(-1) ? function(b, f, e) {
            return b.substr(f, e);
          } : function(b, f, e) {
            0 > f && (f = b.length + f);
            return b.substr(f, e);
          };
        }).call(this, n("node_modules/process/browser.js"));
      }, {"node_modules/process/browser.js": 8}],
      8: [function(n, w, t) {
        function e() {}
        n = w.exports = {};
        n.nextTick = function() {
          if ("undefined" !== typeof window && window.setImmediate)
            return function(e) {
              return window.setImmediate(e);
            };
          if ("undefined" !== typeof window && window.postMessage && window.addEventListener) {
            var e = [];
            window.addEventListener("message", function(l) {
              var m = l.source;
              m !== window && null !== m || "process-tick" !== l.data || (l.stopPropagation(), 0 < e.length && e.shift()());
            }, !0);
            return function(l) {
              e.push(l);
              window.postMessage("process-tick", "*");
            };
          }
          return function(e) {
            setTimeout(e, 0);
          };
        }();
        n.title = "browser";
        n.browser = !0;
        n.env = {};
        n.argv = [];
        n.on = e;
        n.once = e;
        n.off = e;
        n.emit = e;
        n.binding = function(e) {
          throw Error("process.binding is not supported");
        };
        n.cwd = function() {
          return "/";
        };
        n.chdir = function(e) {
          throw Error("process.chdir is not supported");
        };
      }, {}],
      9: [function(n, w, t) {
        t.SourceMapGenerator = n("./source-map/source-map-generator").SourceMapGenerator;
        t.SourceMapConsumer = n("./source-map/source-map-consumer").SourceMapConsumer;
        t.SourceNode = n("./source-map/source-node").SourceNode;
      }, {
        "./source-map/source-map-consumer": 14,
        "./source-map/source-map-generator": 15,
        "./source-map/source-node": 16
      }],
      10: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          function g() {
            this._array = [];
            this._set = {};
          }
          var b = e("./util");
          g.fromArray = function(b, e) {
            for (var a = new g,
                c = 0,
                d = b.length; c < d; c++)
              a.add(b[c], e);
            return a;
          };
          g.prototype.add = function(f, e) {
            var a = this.has(f),
                c = this._array.length;
            a && !e || this._array.push(f);
            a || (this._set[b.toSetString(f)] = c);
          };
          g.prototype.has = function(f) {
            return Object.prototype.hasOwnProperty.call(this._set, b.toSetString(f));
          };
          g.prototype.indexOf = function(f) {
            if (this.has(f))
              return this._set[b.toSetString(f)];
            throw Error('"' + f + '" is not in the set.');
          };
          g.prototype.at = function(b) {
            if (0 <= b && b < this._array.length)
              return this._array[b];
            throw Error("No element indexed by " + b);
          };
          g.prototype.toArray = function() {
            return this._array.slice();
          };
          l.ArraySet = g;
        });
      }, {
        "./util": 17,
        amdefine: 2
      }],
      11: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          var g = e("./base64");
          l.encode = function(b) {
            var e = "",
                k = 0 > b ? (-b << 1) + 1 : (b << 1) + 0;
            do
              b = k & 31, k >>>= 5, 0 < k && (b |= 32), e += g.encode(b);
 while (0 < k);
            return e;
          };
          l.decode = function(b) {
            var e = 0,
                k = b.length,
                a = 0,
                c = 0,
                d,
                y;
            do {
              if (e >= k)
                throw Error("Expected more digits in base 64 VLQ value.");
              y = g.decode(b.charAt(e++));
              d = !!(y & 32);
              y &= 31;
              a += y << c;
              c += 5;
            } while (d);
            k = a >> 1;
            return {
              value: 1 === (a & 1) ? -k : k,
              rest: b.slice(e)
            };
          };
        });
      }, {
        "./base64": 12,
        amdefine: 2
      }],
      12: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          var g = {},
              b = {};
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("").forEach(function(e, k) {
            g[e] = k;
            b[k] = e;
          });
          l.encode = function(e) {
            if (e in b)
              return b[e];
            throw new TypeError("Must be between 0 and 63: " + e);
          };
          l.decode = function(b) {
            if (b in g)
              return g[b];
            throw new TypeError("Not a valid base 64 digit: " + b);
          };
        });
      }, {amdefine: 2}],
      13: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          function g(b, e, k, a, c) {
            var d = Math.floor((e - b) / 2) + b,
                y = c(k, a[d], !0);
            return 0 === y ? a[d] : 0 < y ? 1 < e - d ? g(d, e, k, a, c) : a[d] : 1 < d - b ? g(b, d, k, a, c) : 0 > b ? null : a[b];
          }
          l.search = function(b, e, k) {
            return 0 < e.length ? g(-1, e.length, b, e, k) : null;
          };
        });
      }, {amdefine: 2}],
      14: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          function g(a) {
            var d = a;
            "string" === typeof a && (d = JSON.parse(a.replace(/^\)\]\}'/, "")));
            a = b.getArg(d, "version");
            var e = b.getArg(d, "sources"),
                f = b.getArg(d, "names", []),
                g = b.getArg(d, "sourceRoot", null),
                l = b.getArg(d, "sourcesContent", null),
                m = b.getArg(d, "mappings"),
                d = b.getArg(d, "file", null);
            if (a != this._version)
              throw Error("Unsupported version: " + a);
            this._names = k.fromArray(f, !0);
            this._sources = k.fromArray(e, !0);
            this.sourceRoot = g;
            this.sourcesContent = l;
            this._mappings = m;
            this.file = d;
          }
          var b = e("./util"),
              f = e("./binary-search"),
              k = e("./array-set").ArraySet,
              a = e("./base64-vlq");
          g.fromSourceMap = function(a) {
            var d = Object.create(g.prototype);
            d._names = k.fromArray(a._names.toArray(), !0);
            d._sources = k.fromArray(a._sources.toArray(), !0);
            d.sourceRoot = a._sourceRoot;
            d.sourcesContent = a._generateSourcesContent(d._sources.toArray(), d.sourceRoot);
            d.file = a._file;
            d.__generatedMappings = a._mappings.slice().sort(b.compareByGeneratedPositions);
            d.__originalMappings = a._mappings.slice().sort(b.compareByOriginalPositions);
            return d;
          };
          g.prototype._version = 3;
          Object.defineProperty(g.prototype, "sources", {get: function() {
              return this._sources.toArray().map(function(a) {
                return this.sourceRoot ? b.join(this.sourceRoot, a) : a;
              }, this);
            }});
          g.prototype.__generatedMappings = null;
          Object.defineProperty(g.prototype, "_generatedMappings", {get: function() {
              this.__generatedMappings || (this.__generatedMappings = [], this.__originalMappings = [], this._parseMappings(this._mappings, this.sourceRoot));
              return this.__generatedMappings;
            }});
          g.prototype.__originalMappings = null;
          Object.defineProperty(g.prototype, "_originalMappings", {get: function() {
              this.__originalMappings || (this.__generatedMappings = [], this.__originalMappings = [], this._parseMappings(this._mappings, this.sourceRoot));
              return this.__originalMappings;
            }});
          g.prototype._parseMappings = function(c, d) {
            for (var e = 1,
                f = 0,
                g = 0,
                k = 0,
                l = 0,
                m = 0,
                r = /^[,;]/,
                u = c,
                n; 0 < u.length; )
              if (";" === u.charAt(0))
                e++, u = u.slice(1), f = 0;
              else if ("," === u.charAt(0))
                u = u.slice(1);
              else {
                n = {};
                n.generatedLine = e;
                u = a.decode(u);
                n.generatedColumn = f + u.value;
                f = n.generatedColumn;
                u = u.rest;
                if (0 < u.length && !r.test(u.charAt(0))) {
                  u = a.decode(u);
                  n.source = this._sources.at(l + u.value);
                  l += u.value;
                  u = u.rest;
                  if (0 === u.length || r.test(u.charAt(0)))
                    throw Error("Found a source, but no line and column");
                  u = a.decode(u);
                  n.originalLine = g + u.value;
                  g = n.originalLine;
                  n.originalLine += 1;
                  u = u.rest;
                  if (0 === u.length || r.test(u.charAt(0)))
                    throw Error("Found a source and line, but no column");
                  u = a.decode(u);
                  n.originalColumn = k + u.value;
                  k = n.originalColumn;
                  u = u.rest;
                  0 < u.length && !r.test(u.charAt(0)) && (u = a.decode(u), n.name = this._names.at(m + u.value), m += u.value, u = u.rest);
                }
                this.__generatedMappings.push(n);
                "number" === typeof n.originalLine && this.__originalMappings.push(n);
              }
            this.__generatedMappings.sort(b.compareByGeneratedPositions);
            this.__originalMappings.sort(b.compareByOriginalPositions);
          };
          g.prototype._findMapping = function(a, d, b, e, g) {
            if (0 >= a[b])
              throw new TypeError("Line must be greater than or equal to 1, got " + a[b]);
            if (0 > a[e])
              throw new TypeError("Column must be greater than or equal to 0, got " + a[e]);
            return f.search(a, d, g);
          };
          g.prototype.originalPositionFor = function(a) {
            a = {
              generatedLine: b.getArg(a, "line"),
              generatedColumn: b.getArg(a, "column")
            };
            if (a = this._findMapping(a, this._generatedMappings, "generatedLine", "generatedColumn", b.compareByGeneratedPositions)) {
              var d = b.getArg(a, "source", null);
              d && this.sourceRoot && (d = b.join(this.sourceRoot, d));
              return {
                source: d,
                line: b.getArg(a, "originalLine", null),
                column: b.getArg(a, "originalColumn", null),
                name: b.getArg(a, "name", null)
              };
            }
            return {
              source: null,
              line: null,
              column: null,
              name: null
            };
          };
          g.prototype.sourceContentFor = function(a) {
            if (!this.sourcesContent)
              return null;
            this.sourceRoot && (a = b.relative(this.sourceRoot, a));
            if (this._sources.has(a))
              return this.sourcesContent[this._sources.indexOf(a)];
            var d;
            if (this.sourceRoot && (d = b.urlParse(this.sourceRoot))) {
              var e = a.replace(/^file:\/\//, "");
              if ("file" == d.scheme && this._sources.has(e))
                return this.sourcesContent[this._sources.indexOf(e)];
              if ((!d.path || "/" == d.path) && this._sources.has("/" + a))
                return this.sourcesContent[this._sources.indexOf("/" + a)];
            }
            throw Error('"' + a + '" is not in the SourceMap.');
          };
          g.prototype.generatedPositionFor = function(a) {
            a = {
              source: b.getArg(a, "source"),
              originalLine: b.getArg(a, "line"),
              originalColumn: b.getArg(a, "column")
            };
            this.sourceRoot && (a.source = b.relative(this.sourceRoot, a.source));
            return (a = this._findMapping(a, this._originalMappings, "originalLine", "originalColumn", b.compareByOriginalPositions)) ? {
              line: b.getArg(a, "generatedLine", null),
              column: b.getArg(a, "generatedColumn", null)
            } : {
              line: null,
              column: null
            };
          };
          g.GENERATED_ORDER = 1;
          g.ORIGINAL_ORDER = 2;
          g.prototype.eachMapping = function(a, d, e) {
            d = d || null;
            switch (e || g.GENERATED_ORDER) {
              case g.GENERATED_ORDER:
                e = this._generatedMappings;
                break;
              case g.ORIGINAL_ORDER:
                e = this._originalMappings;
                break;
              default:
                throw Error("Unknown order of iteration.");
            }
            var f = this.sourceRoot;
            e.map(function(a) {
              var c = a.source;
              c && f && (c = b.join(f, c));
              return {
                source: c,
                generatedLine: a.generatedLine,
                generatedColumn: a.generatedColumn,
                originalLine: a.originalLine,
                originalColumn: a.originalColumn,
                name: a.name
              };
            }).forEach(a, d);
          };
          l.SourceMapConsumer = g;
        });
      }, {
        "./array-set": 10,
        "./base64-vlq": 11,
        "./binary-search": 13,
        "./util": 17,
        amdefine: 2
      }],
      15: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          function g(a) {
            this._file = f.getArg(a, "file");
            this._sourceRoot = f.getArg(a, "sourceRoot", null);
            this._sources = new k;
            this._names = new k;
            this._mappings = [];
            this._sourcesContents = null;
          }
          var b = e("./base64-vlq"),
              f = e("./util"),
              k = e("./array-set").ArraySet;
          g.prototype._version = 3;
          g.fromSourceMap = function(a) {
            var c = a.sourceRoot,
                d = new g({
                  file: a.file,
                  sourceRoot: c
                });
            a.eachMapping(function(a) {
              var b = {generated: {
                  line: a.generatedLine,
                  column: a.generatedColumn
                }};
              a.source && (b.source = a.source, c && (b.source = f.relative(c, b.source)), b.original = {
                line: a.originalLine,
                column: a.originalColumn
              }, a.name && (b.name = a.name));
              d.addMapping(b);
            });
            a.sources.forEach(function(c) {
              var b = a.sourceContentFor(c);
              b && d.setSourceContent(c, b);
            });
            return d;
          };
          g.prototype.addMapping = function(a) {
            var c = f.getArg(a, "generated"),
                d = f.getArg(a, "original", null),
                b = f.getArg(a, "source", null);
            a = f.getArg(a, "name", null);
            this._validateMapping(c, d, b, a);
            b && !this._sources.has(b) && this._sources.add(b);
            a && !this._names.has(a) && this._names.add(a);
            this._mappings.push({
              generatedLine: c.line,
              generatedColumn: c.column,
              originalLine: null != d && d.line,
              originalColumn: null != d && d.column,
              source: b,
              name: a
            });
          };
          g.prototype.setSourceContent = function(a, c) {
            var d = a;
            this._sourceRoot && (d = f.relative(this._sourceRoot, d));
            null !== c ? (this._sourcesContents || (this._sourcesContents = {}), this._sourcesContents[f.toSetString(d)] = c) : (delete this._sourcesContents[f.toSetString(d)], 0 === Object.keys(this._sourcesContents).length && (this._sourcesContents = null));
          };
          g.prototype.applySourceMap = function(a, c) {
            c || (c = a.file);
            var d = this._sourceRoot;
            d && (c = f.relative(d, c));
            var b = new k,
                e = new k;
            this._mappings.forEach(function(g) {
              if (g.source === c && g.originalLine) {
                var k = a.originalPositionFor({
                  line: g.originalLine,
                  column: g.originalColumn
                });
                null !== k.source && (g.source = d ? f.relative(d, k.source) : k.source, g.originalLine = k.line, g.originalColumn = k.column, null !== k.name && null !== g.name && (g.name = k.name));
              }
              (k = g.source) && !b.has(k) && b.add(k);
              (g = g.name) && !e.has(g) && e.add(g);
            }, this);
            this._sources = b;
            this._names = e;
            a.sources.forEach(function(c) {
              var b = a.sourceContentFor(c);
              b && (d && (c = f.relative(d, c)), this.setSourceContent(c, b));
            }, this);
          };
          g.prototype._validateMapping = function(a, c, d, b) {
            if (!(a && "line" in a && "column" in a && 0 < a.line && 0 <= a.column && !c && !d && !b || a && "line" in a && "column" in a && c && "line" in c && "column" in c && 0 < a.line && 0 <= a.column && 0 < c.line && 0 <= c.column && d))
              throw Error("Invalid mapping: " + JSON.stringify({
                generated: a,
                source: d,
                original: c,
                name: b
              }));
          };
          g.prototype._serializeMappings = function() {
            var a = 0,
                c = 1,
                d = 0,
                e = 0,
                g = 0,
                k = 0,
                l = "",
                m;
            this._mappings.sort(f.compareByGeneratedPositions);
            for (var n = 0,
                r = this._mappings.length; n < r; n++) {
              m = this._mappings[n];
              if (m.generatedLine !== c)
                for (a = 0; m.generatedLine !== c; )
                  l += ";", c++;
              else if (0 < n) {
                if (!f.compareByGeneratedPositions(m, this._mappings[n - 1]))
                  continue;
                l += ",";
              }
              l += b.encode(m.generatedColumn - a);
              a = m.generatedColumn;
              m.source && (l += b.encode(this._sources.indexOf(m.source) - k), k = this._sources.indexOf(m.source), l += b.encode(m.originalLine - 1 - e), e = m.originalLine - 1, l += b.encode(m.originalColumn - d), d = m.originalColumn, m.name && (l += b.encode(this._names.indexOf(m.name) - g), g = this._names.indexOf(m.name)));
            }
            return l;
          };
          g.prototype._generateSourcesContent = function(a, c) {
            return a.map(function(a) {
              if (!this._sourcesContents)
                return null;
              c && (a = f.relative(c, a));
              a = f.toSetString(a);
              return Object.prototype.hasOwnProperty.call(this._sourcesContents, a) ? this._sourcesContents[a] : null;
            }, this);
          };
          g.prototype.toJSON = function() {
            var a = {
              version: this._version,
              file: this._file,
              sources: this._sources.toArray(),
              names: this._names.toArray(),
              mappings: this._serializeMappings()
            };
            this._sourceRoot && (a.sourceRoot = this._sourceRoot);
            this._sourcesContents && (a.sourcesContent = this._generateSourcesContent(a.sources, a.sourceRoot));
            return a;
          };
          g.prototype.toString = function() {
            return JSON.stringify(this);
          };
          l.SourceMapGenerator = g;
        });
      }, {
        "./array-set": 10,
        "./base64-vlq": 11,
        "./util": 17,
        amdefine: 2
      }],
      16: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          function g(b, a, c, d, e) {
            this.children = [];
            this.sourceContents = {};
            this.line = void 0 === b ? null : b;
            this.column = void 0 === a ? null : a;
            this.source = void 0 === c ? null : c;
            this.name = void 0 === e ? null : e;
            null != d && this.add(d);
          }
          var b = e("./source-map-generator").SourceMapGenerator,
              f = e("./util");
          g.fromStringWithSourceMap = function(b, a) {
            function c(a, c) {
              null === a || void 0 === a.source ? d.add(c) : d.add(new g(a.originalLine, a.originalColumn, a.source, c, a.name));
            }
            var d = new g,
                e = b.split("\n"),
                f = 1,
                l = 0,
                m = null;
            a.eachMapping(function(a) {
              if (null === m) {
                for (; f < a.generatedLine; )
                  d.add(e.shift() + "\n"), f++;
                if (l < a.generatedColumn) {
                  var b = e[0];
                  d.add(b.substr(0, a.generatedColumn));
                  e[0] = b.substr(a.generatedColumn);
                  l = a.generatedColumn;
                }
              } else {
                if (f < a.generatedLine) {
                  var g = "";
                  do
                    g += e.shift() + "\n", f++, l = 0;
 while (f < a.generatedLine);
                  l < a.generatedColumn && (b = e[0], g += b.substr(0, a.generatedColumn), e[0] = b.substr(a.generatedColumn), l = a.generatedColumn);
                } else
                  b = e[0], g = b.substr(0, a.generatedColumn - l), e[0] = b.substr(a.generatedColumn - l), l = a.generatedColumn;
                c(m, g);
              }
              m = a;
            }, this);
            c(m, e.join("\n"));
            a.sources.forEach(function(c) {
              var b = a.sourceContentFor(c);
              b && d.setSourceContent(c, b);
            });
            return d;
          };
          g.prototype.add = function(b) {
            if (Array.isArray(b))
              b.forEach(function(a) {
                this.add(a);
              }, this);
            else if (b instanceof g || "string" === typeof b)
              b && this.children.push(b);
            else
              throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + b);
            return this;
          };
          g.prototype.prepend = function(b) {
            if (Array.isArray(b))
              for (var a = b.length - 1; 0 <= a; a--)
                this.prepend(b[a]);
            else if (b instanceof g || "string" === typeof b)
              this.children.unshift(b);
            else
              throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + b);
            return this;
          };
          g.prototype.walk = function(b) {
            for (var a,
                c = 0,
                d = this.children.length; c < d; c++)
              a = this.children[c], a instanceof g ? a.walk(b) : "" !== a && b(a, {
                source: this.source,
                line: this.line,
                column: this.column,
                name: this.name
              });
          };
          g.prototype.join = function(b) {
            var a,
                c,
                d = this.children.length;
            if (0 < d) {
              a = [];
              for (c = 0; c < d - 1; c++)
                a.push(this.children[c]), a.push(b);
              a.push(this.children[c]);
              this.children = a;
            }
            return this;
          };
          g.prototype.replaceRight = function(b, a) {
            var c = this.children[this.children.length - 1];
            c instanceof g ? c.replaceRight(b, a) : "string" === typeof c ? this.children[this.children.length - 1] = c.replace(b, a) : this.children.push("".replace(b, a));
            return this;
          };
          g.prototype.setSourceContent = function(b, a) {
            this.sourceContents[f.toSetString(b)] = a;
          };
          g.prototype.walkSourceContents = function(b) {
            for (var a = 0,
                c = this.children.length; a < c; a++)
              this.children[a] instanceof g && this.children[a].walkSourceContents(b);
            for (var d = Object.keys(this.sourceContents),
                a = 0,
                c = d.length; a < c; a++)
              b(f.fromSetString(d[a]), this.sourceContents[d[a]]);
          };
          g.prototype.toString = function() {
            var b = "";
            this.walk(function(a) {
              b += a;
            });
            return b;
          };
          g.prototype.toStringWithSourceMap = function(e) {
            var a = "",
                c = 1,
                d = 0,
                f = new b(e),
                g = !1,
                l = null,
                m = null,
                n = null,
                r = null;
            this.walk(function(b, e) {
              a += b;
              null !== e.source && null !== e.line && null !== e.column ? (l === e.source && m === e.line && n === e.column && r === e.name || f.addMapping({
                source: e.source,
                original: {
                  line: e.line,
                  column: e.column
                },
                generated: {
                  line: c,
                  column: d
                },
                name: e.name
              }), l = e.source, m = e.line, n = e.column, r = e.name, g = !0) : g && (f.addMapping({generated: {
                  line: c,
                  column: d
                }}), l = null, g = !1);
              b.split("").forEach(function(a) {
                "\n" === a ? (c++, d = 0) : d++;
              });
            });
            this.walkSourceContents(function(a, c) {
              f.setSourceContent(a, c);
            });
            return {
              code: a,
              map: f
            };
          };
          l.SourceNode = g;
        });
      }, {
        "./source-map-generator": 15,
        "./util": 17,
        amdefine: 2
      }],
      17: [function(n, w, t) {
        if ("function" !== typeof e)
          var e = n("amdefine")(w, n);
        e(function(e, l, m) {
          function g(a) {
            return (a = a.match(k)) ? {
              scheme: a[1],
              auth: a[3],
              host: a[4],
              port: a[6],
              path: a[7]
            } : null;
          }
          function b(a) {
            var b = a.scheme + "://";
            a.auth && (b += a.auth + "@");
            a.host && (b += a.host);
            a.port && (b += ":" + a.port);
            a.path && (b += a.path);
            return b;
          }
          function f(a, b) {
            var e = a || "",
                f = b || "";
            return (e > f) - (e < f);
          }
          l.getArg = function(a, b, e) {
            if (b in a)
              return a[b];
            if (3 === arguments.length)
              return e;
            throw Error('"' + b + '" is a required argument.');
          };
          var k = /([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/,
              a = /^data:.+\,.+/;
          l.urlParse = g;
          l.urlGenerate = b;
          l.join = function(c, d) {
            var e;
            return d.match(k) || d.match(a) ? d : "/" === d.charAt(0) && (e = g(c)) ? (e.path = d, b(e)) : c.replace(/\/$/, "") + "/" + d;
          };
          l.toSetString = function(a) {
            return "$" + a;
          };
          l.fromSetString = function(a) {
            return a.substr(1);
          };
          l.relative = function(a, b) {
            a = a.replace(/\/$/, "");
            var e = g(a);
            return "/" == b.charAt(0) && e && "/" == e.path ? b.slice(1) : 0 === b.indexOf(a + "/") ? b.substr(a.length + 1) : b;
          };
          l.compareByOriginalPositions = function(a, b, e) {
            var g;
            return (g = f(a.source, b.source)) || (g = a.originalLine - b.originalLine) || (g = a.originalColumn - b.originalColumn) || e || (g = f(a.name, b.name)) ? g : (g = a.generatedLine - b.generatedLine) ? g : a.generatedColumn - b.generatedColumn;
          };
          l.compareByGeneratedPositions = function(a, b, e) {
            var g;
            return (g = a.generatedLine - b.generatedLine) || (g = a.generatedColumn - b.generatedColumn) || e || (g = f(a.source, b.source)) || (g = a.originalLine - b.originalLine) ? g : (g = a.originalColumn - b.originalColumn) ? g : f(a.name, b.name);
          };
        });
      }, {amdefine: 2}],
      18: [function(n, w, t) {
        (function(e, r) {
          function l() {
            return "browser" === C ? !0 : "node" === C ? !1 : "undefined" !== typeof window && "function" === typeof XMLHttpRequest;
          }
          function m(a) {
            a = a.trim();
            if (a in z)
              return z[a];
            try {
              if (l()) {
                var b = new XMLHttpRequest;
                b.open("GET", a, !1);
                b.send(null);
                var c = null;
                4 === b.readyState && 200 === b.status && (c = b.responseText);
              } else
                c = E.readFileSync(a, "utf8");
            } catch (d) {
              c = null;
            }
            return z[a] = c;
          }
          function g(a, b) {
            if (!a)
              return b;
            var c = F.dirname(a),
                d = /^\w+:\/\/[^\/]*/.exec(c),
                d = d ? d[0] : "";
            return d + F.resolve(c.slice(d.length), b);
          }
          function b(a) {
            var b;
            a: {
              var c;
              if (l() && (c = new XMLHttpRequest, c.open("GET", a, !1), c.send(null), c = c.getResponseHeader("SourceMap") || c.getResponseHeader("X-SourceMap"))) {
                b = c;
                break a;
              }
              c = m(a);
              for (var d = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/)[ \t]*$)/mg,
                  e; e = d.exec(c); )
                b = e;
              b = b ? b[1] : null;
            }
            if (!b)
              return null;
            H.test(b) ? (a = b.slice(b.indexOf(",") + 1), a = (new r(a, "base64")).toString(), b = null) : (b = g(a, b), a = m(b));
            return a ? {
              url: b,
              map: a
            } : null;
          }
          function f(a) {
            var c = D[a.source];
            if (!c) {
              var d = b(a.source);
              d ? (c = D[a.source] = {
                url: d.url,
                map: new B(d.map)
              }, c.map.sourcesContent && c.map.sources.forEach(function(a, b) {
                var d = c.map.sourcesContent[b];
                if (d) {
                  var e = g(c.url, a);
                  z[e] = d;
                }
              })) : c = D[a.source] = {
                url: null,
                map: null
              };
            }
            return c && c.map && (d = c.map.originalPositionFor(a), null !== d.source) ? (d.source = g(c.url, d.source), d) : a;
          }
          function k(a) {
            var b = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(a);
            return b ? (a = f({
              source: b[2],
              line: b[3],
              column: b[4] - 1
            }), "eval at " + b[1] + " (" + a.source + ":" + a.line + ":" + (a.column + 1) + ")") : (b = /^eval at ([^(]+) \((.+)\)$/.exec(a)) ? "eval at " + b[1] + " (" + k(b[2]) + ")" : a;
          }
          function a() {
            var a,
                b = "";
            this.isNative() ? b = "native" : (a = this.getScriptNameOrSourceURL(), !a && this.isEval() && (b = this.getEvalOrigin(), b += ", "), b = a ? b + a : b + "<anonymous>", a = this.getLineNumber(), null != a && (b += ":" + a, (a = this.getColumnNumber()) && (b += ":" + a)));
            a = "";
            var c = this.getFunctionName(),
                d = !0,
                e = this.isConstructor();
            if (this.isToplevel() || e)
              e ? a += "new " + (c || "<anonymous>") : c ? a += c : (a += b, d = !1);
            else {
              var e = this.getTypeName(),
                  f = this.getMethodName();
              c ? (e && 0 != c.indexOf(e) && (a += e + "."), a += c, f && c.indexOf("." + f) != c.length - f.length - 1 && (a += " [as " + f + "]")) : a += e + "." + (f || "<anonymous>");
            }
            d && (a += " (" + b + ")");
            return a;
          }
          function c(b) {
            var c = {};
            Object.getOwnPropertyNames(Object.getPrototypeOf(b)).forEach(function(a) {
              c[a] = /^(?:is|get)/.test(a) ? function() {
                return b[a].call(b);
              } : b[a];
            });
            c.toString = a;
            return c;
          }
          function d(a) {
            var b = a.getFileName() || a.getScriptNameOrSourceURL();
            if (b) {
              var d = a.getLineNumber(),
                  e = a.getColumnNumber() - 1;
              1 !== d || l() || a.isEval() || (e -= 62);
              var g = f({
                source: b,
                line: d,
                column: e
              });
              a = c(a);
              a.getFileName = function() {
                return g.source;
              };
              a.getLineNumber = function() {
                return g.line;
              };
              a.getColumnNumber = function() {
                return g.column + 1;
              };
              a.getScriptNameOrSourceURL = function() {
                return g.source;
              };
              return a;
            }
            var m = a.isEval() && a.getEvalOrigin();
            m && (m = k(m), a = c(a), a.getEvalOrigin = function() {
              return m;
            });
            return a;
          }
          function w(a, b) {
            u && (z = {}, D = {});
            return a + b.map(function(a) {
              return "\n    at " + d(a);
            }).join("");
          }
          function x(a) {
            var b = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(a.stack);
            if (b) {
              a = b[1];
              var c = +b[2],
                  b = +b[3],
                  d = z[a];
              !d && E.existsSync(a) && (d = E.readFileSync(a, "utf8"));
              if (d && (d = d.split(/(?:\r\n|\r|\n)/)[c - 1]))
                return a + ":" + c + "\n" + d + "\n" + Array(b).join(" ") + "^";
            }
            return null;
          }
          function A() {
            var a = e.emit;
            e.emit = function(b) {
              if ("uncaughtException" === b) {
                var c = arguments[1] && arguments[1].stack,
                    d = 0 < this.listeners(b).length;
                if (c && !d) {
                  c = arguments[1];
                  if (d = x(c))
                    console.error(), console.error(d);
                  console.error(c.stack);
                  e.exit(1);
                  return;
                }
              }
              return a.apply(this, arguments);
            };
          }
          var B = n("source-map").SourceMapConsumer,
              F = n("path"),
              E = n("fs"),
              G = !1,
              u = !1,
              C = "auto",
              z = {},
              D = {},
              H = /^data:application\/json[^,]+base64,/;
          t.wrapCallSite = d;
          t.getErrorSource = x;
          t.mapSourcePosition = f;
          t.retrieveSourceMap = b;
          t.install = function(a) {
            if (!G) {
              G = !0;
              Error.prepareStackTrace = w;
              a = a || {};
              var c = "handleUncaughtExceptions" in a ? a.handleUncaughtExceptions : !0;
              u = "emptyCacheBetweenOperations" in a ? a.emptyCacheBetweenOperations : !1;
              if (a.environment && (C = a.environment, -1 === ["node", "browser", "auto"].indexOf(C)))
                throw Error("environment " + C + " was unknown. Available options are {auto, browser, node}");
              a.retrieveFile && (m = a.retrieveFile);
              a.retrieveSourceMap && (b = a.retrieveSourceMap);
              c && "object" === typeof e && null !== e && "function" === typeof e.on && A();
            }
          };
        }).call(this, n("node_modules/process/browser.js"), n("buffer").Buffer);
      }, {
        "node_modules/process/browser.js": 8,
        buffer: 5,
        fs: 4,
        path: 7,
        "source-map": 9
      }]
    }, {}, [1]);
    return K;
  });
})(require('buffer').Buffer, require('process'));
