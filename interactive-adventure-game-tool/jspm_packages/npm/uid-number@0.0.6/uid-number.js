/* */ 
(function(process) {
  module.exports = uidNumber;
  var child_process = require('child_process'),
      path = require('path'),
      uidSupport = process.getuid && process.setuid,
      uidCache = {},
      gidCache = {};
  function uidNumber(uid, gid, cb) {
    if (!uidSupport)
      return cb();
    if (typeof cb !== "function")
      cb = gid, gid = null;
    if (typeof cb !== "function")
      cb = uid, uid = null;
    if (gid == null)
      gid = process.getgid();
    if (uid == null)
      uid = process.getuid();
    if (!isNaN(gid))
      gid = gidCache[gid] = +gid;
    if (!isNaN(uid))
      uid = uidCache[uid] = +uid;
    if (uidCache.hasOwnProperty(uid))
      uid = uidCache[uid];
    if (gidCache.hasOwnProperty(gid))
      gid = gidCache[gid];
    if (typeof gid === "number" && typeof uid === "number") {
      return process.nextTick(cb.bind(null, null, uid, gid));
    }
    var getter = require.resolve("./get-uid-gid.js");
    child_process.execFile(process.execPath, [getter, uid, gid], function(code, out, stderr) {
      if (code) {
        var er = new Error("could not get uid/gid\n" + stderr);
        er.code = code;
        return cb(er);
      }
      try {
        out = JSON.parse(out + "");
      } catch (ex) {
        return cb(ex);
      }
      if (out.error) {
        var er = new Error(out.error);
        er.errno = out.errno;
        return cb(er);
      }
      if (isNaN(out.uid) || isNaN(out.gid))
        return cb(new Error("Could not get uid/gid: " + JSON.stringify(out)));
      cb(null, uidCache[uid] = +out.uid, gidCache[gid] = +out.gid);
    });
  }
})(require('process'));
