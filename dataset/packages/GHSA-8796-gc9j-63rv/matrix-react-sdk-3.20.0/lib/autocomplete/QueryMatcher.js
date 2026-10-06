"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _utils = require("matrix-js-sdk/src/utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Simple search matcher that matches any results with the query string anywhere
 * in the search string. Returns matches in the order the query string appears
 * in the search key, earliest first, then in the order the search key appears
 * in the provided array of keys, then in the order the items appeared in the
 * source array.
 *
 * @param {Object[]} objects Initial list of objects. Equivalent to calling
 *     setObjects() after construction
 * @param {Object} options Options object
 * @param {string[]} options.keys List of keys to use as indexes on the objects
 * @param {function[]} options.funcs List of functions that when called with the
 *     object as an arg will return a string to use as an index
 */
class QueryMatcher
/*:: <T extends Object>*/
{
  constructor(objects
  /*: T[]*/
  , options
  /*: IOptions<T>*/
  = {
    keys: []
  }) {
    (0, _defineProperty2.default)(this, "_options", void 0);
    (0, _defineProperty2.default)(this, "_items", void 0);
    this._options = options;
    this.setObjects(objects); // By default, we remove any non-alphanumeric characters ([^A-Za-z0-9_]) from the
    // query and the value being queried before matching

    if (this._options.shouldMatchWordsOnly === undefined) {
      this._options.shouldMatchWordsOnly = true;
    }
  }

  setObjects(objects
  /*: T[]*/
  ) {
    this._items = new Map();

    for (const object of objects) {
      // Need to use unsafe coerce here because the objects can have any
      // type for their values. We assume that those values who's keys have
      // been specified will be string. Also, we cannot infer all the
      // types of the keys of the objects at compile.
      const keyValues = (0, _lodash.at)(object, this._options.keys);

      if (this._options.funcs) {
        for (const f of this._options.funcs) {
          keyValues.push(f(object));
        }
      }

      for (const [index, keyValue] of Object.entries(keyValues)) {
        if (!keyValue) continue; // skip falsy keyValues

        const key = this.processQuery(keyValue);

        if (!this._items.has(key)) {
          this._items.set(key, []);
        }

        this._items.get(key).push({
          keyWeight: Number(index),
          object
        });
      }
    }
  }

  match(query
  /*: string*/
  )
  /*: T[]*/
  {
    query = this.processQuery(query);

    if (this._options.shouldMatchWordsOnly) {
      query = query.replace(/[^\w]/g, '');
    }

    if (query.length === 0) {
      return [];
    }

    const matches = []; // Iterate through the map & check each key.
    // ES6 Map iteration order is defined to be insertion order, so results
    // here will come out in the order they were put in.

    for (const [key, candidates] of this._items.entries()) {
      let resultKey = key;

      if (this._options.shouldMatchWordsOnly) {
        resultKey = resultKey.replace(/[^\w]/g, '');
      }

      const index = resultKey.indexOf(query);

      if (index !== -1) {
        matches.push(...candidates.map(candidate => _objectSpread({
          index
        }, candidate)));
      }
    } // Sort matches by where the query appeared in the search key, then by
    // where the matched key appeared in the provided array of keys.


    matches.sort((a, b) => {
      if (a.index < b.index) {
        return -1;
      } else if (a.index === b.index) {
        if (a.keyWeight < b.keyWeight) {
          return -1;
        } else if (a.keyWeight === b.keyWeight) {
          return 0;
        }
      }

      return 1;
    }); // Now map the keys to the result objects. Also remove any duplicates.

    return (0, _lodash.uniq)(matches.map(match => match.object));
  }

  processQuery(query
  /*: string*/
  )
  /*: string*/
  {
    if (this._options.fuzzy !== false) {
      // lower case both the input and the output for consistency
      return (0, _utils.removeHiddenChars)(query.toLowerCase()).toLowerCase();
    }

    return query.toLowerCase();
  }

}

exports.default = QueryMatcher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvUXVlcnlNYXRjaGVyLnRzIl0sIm5hbWVzIjpbIlF1ZXJ5TWF0Y2hlciIsImNvbnN0cnVjdG9yIiwib2JqZWN0cyIsIm9wdGlvbnMiLCJrZXlzIiwiX29wdGlvbnMiLCJzZXRPYmplY3RzIiwic2hvdWxkTWF0Y2hXb3Jkc09ubHkiLCJ1bmRlZmluZWQiLCJfaXRlbXMiLCJNYXAiLCJvYmplY3QiLCJrZXlWYWx1ZXMiLCJmdW5jcyIsImYiLCJwdXNoIiwiaW5kZXgiLCJrZXlWYWx1ZSIsIk9iamVjdCIsImVudHJpZXMiLCJrZXkiLCJwcm9jZXNzUXVlcnkiLCJoYXMiLCJzZXQiLCJnZXQiLCJrZXlXZWlnaHQiLCJOdW1iZXIiLCJtYXRjaCIsInF1ZXJ5IiwicmVwbGFjZSIsImxlbmd0aCIsIm1hdGNoZXMiLCJjYW5kaWRhdGVzIiwicmVzdWx0S2V5IiwiaW5kZXhPZiIsIm1hcCIsImNhbmRpZGF0ZSIsInNvcnQiLCJhIiwiYiIsImZ1enp5IiwidG9Mb3dlckNhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOzs7Ozs7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUE7QUFBTjtBQUFxQztBQUloREMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZUM7QUFBb0I7QUFBQSxJQUFHO0FBQUVDLElBQUFBLElBQUksRUFBRTtBQUFSLEdBQXRDLEVBQW9EO0FBQUE7QUFBQTtBQUMzRCxTQUFLQyxRQUFMLEdBQWdCRixPQUFoQjtBQUVBLFNBQUtHLFVBQUwsQ0FBZ0JKLE9BQWhCLEVBSDJELENBSzNEO0FBQ0E7O0FBQ0EsUUFBSSxLQUFLRyxRQUFMLENBQWNFLG9CQUFkLEtBQXVDQyxTQUEzQyxFQUFzRDtBQUNsRCxXQUFLSCxRQUFMLENBQWNFLG9CQUFkLEdBQXFDLElBQXJDO0FBQ0g7QUFDSjs7QUFFREQsRUFBQUEsVUFBVSxDQUFDSjtBQUFEO0FBQUEsSUFBZTtBQUNyQixTQUFLTyxNQUFMLEdBQWMsSUFBSUMsR0FBSixFQUFkOztBQUVBLFNBQUssTUFBTUMsTUFBWCxJQUFxQlQsT0FBckIsRUFBOEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFNVSxTQUFTLEdBQUcsZ0JBQWdCRCxNQUFoQixFQUF3QixLQUFLTixRQUFMLENBQWNELElBQXRDLENBQWxCOztBQUVBLFVBQUksS0FBS0MsUUFBTCxDQUFjUSxLQUFsQixFQUF5QjtBQUNyQixhQUFLLE1BQU1DLENBQVgsSUFBZ0IsS0FBS1QsUUFBTCxDQUFjUSxLQUE5QixFQUFxQztBQUNqQ0QsVUFBQUEsU0FBUyxDQUFDRyxJQUFWLENBQWVELENBQUMsQ0FBQ0gsTUFBRCxDQUFoQjtBQUNIO0FBQ0o7O0FBRUQsV0FBSyxNQUFNLENBQUNLLEtBQUQsRUFBUUMsUUFBUixDQUFYLElBQWdDQyxNQUFNLENBQUNDLE9BQVAsQ0FBZVAsU0FBZixDQUFoQyxFQUEyRDtBQUN2RCxZQUFJLENBQUNLLFFBQUwsRUFBZSxTQUR3QyxDQUM5Qjs7QUFDekIsY0FBTUcsR0FBRyxHQUFHLEtBQUtDLFlBQUwsQ0FBa0JKLFFBQWxCLENBQVo7O0FBQ0EsWUFBSSxDQUFDLEtBQUtSLE1BQUwsQ0FBWWEsR0FBWixDQUFnQkYsR0FBaEIsQ0FBTCxFQUEyQjtBQUN2QixlQUFLWCxNQUFMLENBQVljLEdBQVosQ0FBZ0JILEdBQWhCLEVBQXFCLEVBQXJCO0FBQ0g7O0FBQ0QsYUFBS1gsTUFBTCxDQUFZZSxHQUFaLENBQWdCSixHQUFoQixFQUFxQkwsSUFBckIsQ0FBMEI7QUFDdEJVLFVBQUFBLFNBQVMsRUFBRUMsTUFBTSxDQUFDVixLQUFELENBREs7QUFFdEJMLFVBQUFBO0FBRnNCLFNBQTFCO0FBSUg7QUFDSjtBQUNKOztBQUVEZ0IsRUFBQUEsS0FBSyxDQUFDQztBQUFEO0FBQUE7QUFBQTtBQUFxQjtBQUN0QkEsSUFBQUEsS0FBSyxHQUFHLEtBQUtQLFlBQUwsQ0FBa0JPLEtBQWxCLENBQVI7O0FBQ0EsUUFBSSxLQUFLdkIsUUFBTCxDQUFjRSxvQkFBbEIsRUFBd0M7QUFDcENxQixNQUFBQSxLQUFLLEdBQUdBLEtBQUssQ0FBQ0MsT0FBTixDQUFjLFFBQWQsRUFBd0IsRUFBeEIsQ0FBUjtBQUNIOztBQUNELFFBQUlELEtBQUssQ0FBQ0UsTUFBTixLQUFpQixDQUFyQixFQUF3QjtBQUNwQixhQUFPLEVBQVA7QUFDSDs7QUFDRCxVQUFNQyxPQUFPLEdBQUcsRUFBaEIsQ0FSc0IsQ0FTdEI7QUFDQTtBQUNBOztBQUNBLFNBQUssTUFBTSxDQUFDWCxHQUFELEVBQU1ZLFVBQU4sQ0FBWCxJQUFnQyxLQUFLdkIsTUFBTCxDQUFZVSxPQUFaLEVBQWhDLEVBQXVEO0FBQ25ELFVBQUljLFNBQVMsR0FBR2IsR0FBaEI7O0FBQ0EsVUFBSSxLQUFLZixRQUFMLENBQWNFLG9CQUFsQixFQUF3QztBQUNwQzBCLFFBQUFBLFNBQVMsR0FBR0EsU0FBUyxDQUFDSixPQUFWLENBQWtCLFFBQWxCLEVBQTRCLEVBQTVCLENBQVo7QUFDSDs7QUFDRCxZQUFNYixLQUFLLEdBQUdpQixTQUFTLENBQUNDLE9BQVYsQ0FBa0JOLEtBQWxCLENBQWQ7O0FBQ0EsVUFBSVosS0FBSyxLQUFLLENBQUMsQ0FBZixFQUFrQjtBQUNkZSxRQUFBQSxPQUFPLENBQUNoQixJQUFSLENBQ0ksR0FBR2lCLFVBQVUsQ0FBQ0csR0FBWCxDQUFnQkMsU0FBRDtBQUFpQnBCLFVBQUFBO0FBQWpCLFdBQTJCb0IsU0FBM0IsQ0FBZixDQURQO0FBR0g7QUFDSixLQXZCcUIsQ0F5QnRCO0FBQ0E7OztBQUNBTCxJQUFBQSxPQUFPLENBQUNNLElBQVIsQ0FBYSxDQUFDQyxDQUFELEVBQUlDLENBQUosS0FBVTtBQUNuQixVQUFJRCxDQUFDLENBQUN0QixLQUFGLEdBQVV1QixDQUFDLENBQUN2QixLQUFoQixFQUF1QjtBQUNuQixlQUFPLENBQUMsQ0FBUjtBQUNILE9BRkQsTUFFTyxJQUFJc0IsQ0FBQyxDQUFDdEIsS0FBRixLQUFZdUIsQ0FBQyxDQUFDdkIsS0FBbEIsRUFBeUI7QUFDNUIsWUFBSXNCLENBQUMsQ0FBQ2IsU0FBRixHQUFjYyxDQUFDLENBQUNkLFNBQXBCLEVBQStCO0FBQzNCLGlCQUFPLENBQUMsQ0FBUjtBQUNILFNBRkQsTUFFTyxJQUFJYSxDQUFDLENBQUNiLFNBQUYsS0FBZ0JjLENBQUMsQ0FBQ2QsU0FBdEIsRUFBaUM7QUFDcEMsaUJBQU8sQ0FBUDtBQUNIO0FBQ0o7O0FBRUQsYUFBTyxDQUFQO0FBQ0gsS0FaRCxFQTNCc0IsQ0F5Q3RCOztBQUNBLFdBQU8sa0JBQUtNLE9BQU8sQ0FBQ0ksR0FBUixDQUFhUixLQUFELElBQVdBLEtBQUssQ0FBQ2hCLE1BQTdCLENBQUwsQ0FBUDtBQUNIOztBQUVPVSxFQUFBQSxZQUFSLENBQXFCTztBQUFyQjtBQUFBO0FBQUE7QUFBNEM7QUFDeEMsUUFBSSxLQUFLdkIsUUFBTCxDQUFjbUMsS0FBZCxLQUF3QixLQUE1QixFQUFtQztBQUMvQjtBQUNBLGFBQU8sOEJBQWtCWixLQUFLLENBQUNhLFdBQU4sRUFBbEIsRUFBdUNBLFdBQXZDLEVBQVA7QUFDSDs7QUFDRCxXQUFPYixLQUFLLENBQUNhLFdBQU4sRUFBUDtBQUNIOztBQWpHK0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgQXZpcmFsIERhc2d1cHRhXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHthdCwgdW5pcX0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7cmVtb3ZlSGlkZGVuQ2hhcnN9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuXG5pbnRlcmZhY2UgSU9wdGlvbnM8VCBleHRlbmRzIHt9PiB7XG4gICAga2V5czogQXJyYXk8c3RyaW5nIHwga2V5b2YgVD47XG4gICAgZnVuY3M/OiBBcnJheTwoVCkgPT4gc3RyaW5nPjtcbiAgICBzaG91bGRNYXRjaFdvcmRzT25seT86IGJvb2xlYW47XG4gICAgLy8gd2hldGhlciB0byBhcHBseSB1bmhvbW9nbHlwaCBhbmQgc3RyaXAgZGlhY3JpdGljcyB0byBmdXp6IHVwIHRoZSBzZWFyY2guIERlZmF1bHRzIHRvIHRydWVcbiAgICBmdXp6eT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogU2ltcGxlIHNlYXJjaCBtYXRjaGVyIHRoYXQgbWF0Y2hlcyBhbnkgcmVzdWx0cyB3aXRoIHRoZSBxdWVyeSBzdHJpbmcgYW55d2hlcmVcbiAqIGluIHRoZSBzZWFyY2ggc3RyaW5nLiBSZXR1cm5zIG1hdGNoZXMgaW4gdGhlIG9yZGVyIHRoZSBxdWVyeSBzdHJpbmcgYXBwZWFyc1xuICogaW4gdGhlIHNlYXJjaCBrZXksIGVhcmxpZXN0IGZpcnN0LCB0aGVuIGluIHRoZSBvcmRlciB0aGUgc2VhcmNoIGtleSBhcHBlYXJzXG4gKiBpbiB0aGUgcHJvdmlkZWQgYXJyYXkgb2Yga2V5cywgdGhlbiBpbiB0aGUgb3JkZXIgdGhlIGl0ZW1zIGFwcGVhcmVkIGluIHRoZVxuICogc291cmNlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0W119IG9iamVjdHMgSW5pdGlhbCBsaXN0IG9mIG9iamVjdHMuIEVxdWl2YWxlbnQgdG8gY2FsbGluZ1xuICogICAgIHNldE9iamVjdHMoKSBhZnRlciBjb25zdHJ1Y3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBvcHRpb25zLmtleXMgTGlzdCBvZiBrZXlzIHRvIHVzZSBhcyBpbmRleGVzIG9uIHRoZSBvYmplY3RzXG4gKiBAcGFyYW0ge2Z1bmN0aW9uW119IG9wdGlvbnMuZnVuY3MgTGlzdCBvZiBmdW5jdGlvbnMgdGhhdCB3aGVuIGNhbGxlZCB3aXRoIHRoZVxuICogICAgIG9iamVjdCBhcyBhbiBhcmcgd2lsbCByZXR1cm4gYSBzdHJpbmcgdG8gdXNlIGFzIGFuIGluZGV4XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXJ5TWF0Y2hlcjxUIGV4dGVuZHMgT2JqZWN0PiB7XG4gICAgcHJpdmF0ZSBfb3B0aW9uczogSU9wdGlvbnM8VD47XG4gICAgcHJpdmF0ZSBfaXRlbXM6IE1hcDxzdHJpbmcsIHtvYmplY3Q6IFQsIGtleVdlaWdodDogbnVtYmVyfVtdPjtcblxuICAgIGNvbnN0cnVjdG9yKG9iamVjdHM6IFRbXSwgb3B0aW9uczogSU9wdGlvbnM8VD4gPSB7IGtleXM6IFtdIH0pIHtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5zZXRPYmplY3RzKG9iamVjdHMpO1xuXG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIHdlIHJlbW92ZSBhbnkgbm9uLWFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzIChbXkEtWmEtejAtOV9dKSBmcm9tIHRoZVxuICAgICAgICAvLyBxdWVyeSBhbmQgdGhlIHZhbHVlIGJlaW5nIHF1ZXJpZWQgYmVmb3JlIG1hdGNoaW5nXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLnNob3VsZE1hdGNoV29yZHNPbmx5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMuc2hvdWxkTWF0Y2hXb3Jkc09ubHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0T2JqZWN0cyhvYmplY3RzOiBUW10pIHtcbiAgICAgICAgdGhpcy5faXRlbXMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBvYmplY3Qgb2Ygb2JqZWN0cykge1xuICAgICAgICAgICAgLy8gTmVlZCB0byB1c2UgdW5zYWZlIGNvZXJjZSBoZXJlIGJlY2F1c2UgdGhlIG9iamVjdHMgY2FuIGhhdmUgYW55XG4gICAgICAgICAgICAvLyB0eXBlIGZvciB0aGVpciB2YWx1ZXMuIFdlIGFzc3VtZSB0aGF0IHRob3NlIHZhbHVlcyB3aG8ncyBrZXlzIGhhdmVcbiAgICAgICAgICAgIC8vIGJlZW4gc3BlY2lmaWVkIHdpbGwgYmUgc3RyaW5nLiBBbHNvLCB3ZSBjYW5ub3QgaW5mZXIgYWxsIHRoZVxuICAgICAgICAgICAgLy8gdHlwZXMgb2YgdGhlIGtleXMgb2YgdGhlIG9iamVjdHMgYXQgY29tcGlsZS5cbiAgICAgICAgICAgIGNvbnN0IGtleVZhbHVlcyA9IGF0PHN0cmluZz4oPGFueT5vYmplY3QsIHRoaXMuX29wdGlvbnMua2V5cyk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmZ1bmNzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmIG9mIHRoaXMuX29wdGlvbnMuZnVuY3MpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5VmFsdWVzLnB1c2goZihvYmplY3QpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgW2luZGV4LCBrZXlWYWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoa2V5VmFsdWVzKSkge1xuICAgICAgICAgICAgICAgIGlmICgha2V5VmFsdWUpIGNvbnRpbnVlOyAvLyBza2lwIGZhbHN5IGtleVZhbHVlc1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMucHJvY2Vzc1F1ZXJ5KGtleVZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2l0ZW1zLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2l0ZW1zLnNldChrZXksIFtdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5faXRlbXMuZ2V0KGtleSkucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleVdlaWdodDogTnVtYmVyKGluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbWF0Y2gocXVlcnk6IHN0cmluZyk6IFRbXSB7XG4gICAgICAgIHF1ZXJ5ID0gdGhpcy5wcm9jZXNzUXVlcnkocXVlcnkpO1xuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zaG91bGRNYXRjaFdvcmRzT25seSkge1xuICAgICAgICAgICAgcXVlcnkgPSBxdWVyeS5yZXBsYWNlKC9bXlxcd10vZywgJycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXRjaGVzID0gW107XG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgbWFwICYgY2hlY2sgZWFjaCBrZXkuXG4gICAgICAgIC8vIEVTNiBNYXAgaXRlcmF0aW9uIG9yZGVyIGlzIGRlZmluZWQgdG8gYmUgaW5zZXJ0aW9uIG9yZGVyLCBzbyByZXN1bHRzXG4gICAgICAgIC8vIGhlcmUgd2lsbCBjb21lIG91dCBpbiB0aGUgb3JkZXIgdGhleSB3ZXJlIHB1dCBpbi5cbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBjYW5kaWRhdGVzXSBvZiB0aGlzLl9pdGVtcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHRLZXkgPSBrZXk7XG4gICAgICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zaG91bGRNYXRjaFdvcmRzT25seSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdEtleSA9IHJlc3VsdEtleS5yZXBsYWNlKC9bXlxcd10vZywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZXN1bHRLZXkuaW5kZXhPZihxdWVyeSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAuLi5jYW5kaWRhdGVzLm1hcCgoY2FuZGlkYXRlKSA9PiAoe2luZGV4LCAuLi5jYW5kaWRhdGV9KSksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNvcnQgbWF0Y2hlcyBieSB3aGVyZSB0aGUgcXVlcnkgYXBwZWFyZWQgaW4gdGhlIHNlYXJjaCBrZXksIHRoZW4gYnlcbiAgICAgICAgLy8gd2hlcmUgdGhlIG1hdGNoZWQga2V5IGFwcGVhcmVkIGluIHRoZSBwcm92aWRlZCBhcnJheSBvZiBrZXlzLlxuICAgICAgICBtYXRjaGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhLmluZGV4IDwgYi5pbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5pbmRleCA9PT0gYi5pbmRleCkge1xuICAgICAgICAgICAgICAgIGlmIChhLmtleVdlaWdodCA8IGIua2V5V2VpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGEua2V5V2VpZ2h0ID09PSBiLmtleVdlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgbWFwIHRoZSBrZXlzIHRvIHRoZSByZXN1bHQgb2JqZWN0cy4gQWxzbyByZW1vdmUgYW55IGR1cGxpY2F0ZXMuXG4gICAgICAgIHJldHVybiB1bmlxKG1hdGNoZXMubWFwKChtYXRjaCkgPT4gbWF0Y2gub2JqZWN0KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzUXVlcnkocXVlcnk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmZ1enp5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gbG93ZXIgY2FzZSBib3RoIHRoZSBpbnB1dCBhbmQgdGhlIG91dHB1dCBmb3IgY29uc2lzdGVuY3lcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVIaWRkZW5DaGFycyhxdWVyeS50b0xvd2VyQ2FzZSgpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbn1cbiJdfQ==