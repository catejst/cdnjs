/*jslint indent: 2, eqeqeq: false, onevar: false, forin: true, nomen: false*/
/*global module, require, __dirname*/
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010 Christian Johansen
 */
var sinon = (function () {
  return {
    wrapMethod: function wrapMethod(object, property, method) {
      if (!object) {
        throw new TypeError("Should wrap property of object");
      }

      if (typeof method != "function") {
        throw new TypeError("Method wrapper should be function");
      }

      var wrappedMethod = object[property];
      var type = typeof wrappedMethod;

      if (type != "function") {
        throw new TypeError("Attempted to wrap " + type + " property " + property +
                            " as function");
      }

      if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
        throw new TypeError("Attempted to wrap " + property + " which is already wrapped");
      }

      if (wrappedMethod.calledBefore) {
        var verb = !!wrappedMethod.returns ? "stubbed" : "spied on";
        throw new TypeError("Attempted to wrap " + property + " which is already " + verb);
      }

      object[property] = method;
      method.displayName = property;

      method.restore = function () {
        object[property] = wrappedMethod;
      };

      method.restore.sinon = true;

      return method;
    },

    extend: function extend(target) {
      for (var i = 1, l = arguments.length; i < l; i += 1) {
        for (var prop in arguments[i]) {
          if (arguments[i].hasOwnProperty(prop)) {
            target[prop] = arguments[i][prop];
          }
        }
      }

      return target;
    },

    create: function create(proto) {
      if (Object.create) {
        return Object.create(proto);
      } else {
        var F = function () {};
        F.prototype = proto;
        return new F();
      }
    },

    deepEqual: function deepEqual(a, b) {
      if (typeof a != "object" || typeof b != "object") {
        return a === b;
      }

      if (a === b) {
        return true;
      }

      if (Object.prototype.toString.call(a) == "[object Array]") {
        if (a.length !== b.length) {
          return false;
        }

        for (var i = 0, l = a.length; i < l; i += 1) {
          if (!deepEqual(a[i], b[i])) {
            return false;
          }
        }

        return true;
      }

      var prop, aLength = 0, bLength = 0;

      for (prop in a) {
        aLength += 1;

        if (!deepEqual(a[prop], b[prop])) {
          return false;
        }
      }

      for (prop in b) {
        bLength += 1;
      }

      if (aLength != bLength) {
        return false;
      }

      return true;
    },

    keys: function keys(object) {
      var objectKeys = [];

      for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
          objectKeys.push(prop);
        }
      }

      return objectKeys.sort();
    },

    functionName: function functionName(func) {
      var name = func.displayName || func.name;

      // Use function decomposition as a last resort to get function
      // name. Does not rely on function decomposition to work - if it
      // doesn't debugging will be slightly less informative
      // (i.e. toString will say 'spy' rather than 'myFunc').
      if (!name) {
        var matches = func.toString().match(/function ([^\s\(]+)/);
        name = matches && matches[1];
      }

      return name;
    },

    functionToString: function toString() {
      if (this.getCall && this.callCount) {
        var thisObj, prop, i = this.callCount;

        while (i--) {
          thisObj = this.getCall(i).thisObj;

          for (prop in thisObj) {
            if (thisObj[prop] === this) {
              return prop;
            }
          }
        }
      }

      return this.displayName || "sinon fake";
    }
  };
}());

if (typeof module == "object" && typeof require == "function") {
  require.paths.unshift(__dirname);
  module.exports = sinon;
  module.exports.spy = require("sinon/spy");
  module.exports.stub = require("sinon/stub");
  module.exports.mock = require("sinon/mock");
  module.exports.collection = require("sinon/collection");
  module.exports.assert = require("sinon/assert");
  module.exports.test = require("sinon/test");
  module.exports.testCase = require("sinon/test_case");
  require.paths.shift();
}
