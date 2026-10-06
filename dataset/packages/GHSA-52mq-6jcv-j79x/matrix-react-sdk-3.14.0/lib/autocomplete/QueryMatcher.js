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
    } // By default, match anywhere in the string being searched. If enabled, only return
    // matches that are prefixed with the query.


    if (this._options.shouldMatchPrefix === undefined) {
      this._options.shouldMatchPrefix = false;
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

      if (index !== -1 && (!this._options.shouldMatchPrefix || index === 0)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRvY29tcGxldGUvUXVlcnlNYXRjaGVyLnRzIl0sIm5hbWVzIjpbIlF1ZXJ5TWF0Y2hlciIsImNvbnN0cnVjdG9yIiwib2JqZWN0cyIsIm9wdGlvbnMiLCJrZXlzIiwiX29wdGlvbnMiLCJzZXRPYmplY3RzIiwic2hvdWxkTWF0Y2hXb3Jkc09ubHkiLCJ1bmRlZmluZWQiLCJzaG91bGRNYXRjaFByZWZpeCIsIl9pdGVtcyIsIk1hcCIsIm9iamVjdCIsImtleVZhbHVlcyIsImZ1bmNzIiwiZiIsInB1c2giLCJpbmRleCIsImtleVZhbHVlIiwiT2JqZWN0IiwiZW50cmllcyIsImtleSIsInByb2Nlc3NRdWVyeSIsImhhcyIsInNldCIsImdldCIsImtleVdlaWdodCIsIk51bWJlciIsIm1hdGNoIiwicXVlcnkiLCJyZXBsYWNlIiwibGVuZ3RoIiwibWF0Y2hlcyIsImNhbmRpZGF0ZXMiLCJyZXN1bHRLZXkiLCJpbmRleE9mIiwibWFwIiwiY2FuZGlkYXRlIiwic29ydCIsImEiLCJiIiwiZnV6enkiLCJ0b0xvd2VyQ2FzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7Ozs7OztBQVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQTtBQUFOO0FBQXFDO0FBSWhEQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFlQztBQUFvQjtBQUFBLElBQUc7QUFBRUMsSUFBQUEsSUFBSSxFQUFFO0FBQVIsR0FBdEMsRUFBb0Q7QUFBQTtBQUFBO0FBQzNELFNBQUtDLFFBQUwsR0FBZ0JGLE9BQWhCO0FBRUEsU0FBS0csVUFBTCxDQUFnQkosT0FBaEIsRUFIMkQsQ0FLM0Q7QUFDQTs7QUFDQSxRQUFJLEtBQUtHLFFBQUwsQ0FBY0Usb0JBQWQsS0FBdUNDLFNBQTNDLEVBQXNEO0FBQ2xELFdBQUtILFFBQUwsQ0FBY0Usb0JBQWQsR0FBcUMs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Q0F5QnRCO0FBQ0E7OztBQUNBTCxJQUFBQSxPQUFPLENBQUNNLElBQVIsQ0FBYSxDQUFDQyxDQUFELEVBQUlDLENBQUosS0FBVTtBQUNuQixVQUFJRCxDQUFDLENBQUN0QixLQUFGLEdBQVV1QixDQUFDLENBQUN2QixLQUFoQixFQUF1QjtBQUNuQixlQUFPLENBQUMsQ0FBUjtBQUNILE9BRkQsTUFFTyxJQUFJc0IsQ0FBQyxDQUFDdEIsS0FBRixLQUFZdUIsQ0FBQyxDQUFDdkIsS0FBbEIsRUFBeUI7QUFDNUIsWUFBSXNCLENBQUMsQ0FBQ2IsU0FBRixHQUFjYyxDQUFDLENBQUNkLFNBQXBCLEVBQStCO0FBQzNCLGlCQUFPLENBQUMsQ0FBUjtBQUNILFNBRkQsTUFFTyxJQUFJYSxDQUFDLENBQUNiLFNBQUYsS0FBZ0JjLENBQUMsQ0FBQ2QsU0FBdEIsRUFBaUM7QUFDcEMsaUJBQU8sQ0FBUDtBQUNIO0FBQ0o7O0FBRUQsYUFBTyxDQUFQO0FBQ0gsS0FaRCxFQTNCc0IsQ0F5Q3RCOztBQUNBLFdBQU8sa0JBQUtNLE9BQU8sQ0FBQ0ksR0FBUixDQUFhUixLQUFELElBQVdBLEtBQUssQ0FBQ2hCLE1BQTdCLENBQUwsQ0FBUDtBQUNIOztBQUVPVSxFQUFBQSxZQUFSLENBQXFCTztBQUFyQjtBQUFBO0FBQUE7QUFBNEM7QUFDeEMsUUFBSSxLQUFLeEIsUUFBTCxDQUFjb0MsS0FBZCxLQUF3QixLQUE1QixFQUFtQztBQUMvQjtBQUNBLGFBQU8sOEJBQWtCWixLQUFLLENBQUNhLFdBQU4sRUFBbEIsRUFBdUNBLFdBQXZDLEVBQVA7QUFDSDs7QUFDRCxXQUFPYixLQUFLLENBQUNhLFdBQU4sRUFBUDtBQUNIOztBQXZHK0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgQXZpcmFsIERhc2d1cHRhXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHthdCwgdW5pcX0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7cmVtb3ZlSGlkZGVuQ2hhcnN9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuXG5pbnRlcmZhY2UgSU9wdGlvbnM8VCBleHRlbmRzIHt9PiB7XG4gICAga2V5czogQXJyYXk8c3RyaW5nIHwga2V5b2YgVD47XG4gICAgZnVuY3M/OiBBcnJheTwoVCkgPT4gc3RyaW5nPjtcbiAgICBzaG91bGRNYXRjaFdvcmRzT25seT86IGJvb2xlYW47XG4gICAgc2hvdWxkTWF0Y2hQcmVmaXg/OiBib29sZWFuO1xuICAgIC8vIHdoZXRoZXIgdG8gYXBwbHkgdW5ob21vZ2x5cGggYW5kIHN0cmlwIGRpYWNyaXRpY3MgdG8gZnV6eiB1cCB0aGUgc2VhcmNoLiBEZWZhdWx0cyB0byB0cnVlXG4gICAgZnV6enk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFNpbXBsZSBzZWFyY2ggbWF0Y2hlciB0aGF0IG1hdGNoZXMgYW55IHJlc3VsdHMgd2l0aCB0aGUgcXVlcnkgc3RyaW5nIGFueXdoZXJlXG4gKiBpbiB0aGUgc2VhcmNoIHN0cmluZy4gUmV0dXJucyBtYXRjaGVzIGluIHRoZSBvcmRlciB0aGUgcXVlcnkgc3RyaW5nIGFwcGVhcnNcbiAqIGluIHRoZSBzZWFyY2gga2V5LCBlYXJsaWVzdCBmaXJzdCwgdGhlbiBpbiB0aGUgb3JkZXIgdGhlIHNlYXJjaCBrZXkgYXBwZWFyc1xuICogaW4gdGhlIHByb3ZpZGVkIGFycmF5IG9mIGtleXMsIHRoZW4gaW4gdGhlIG9yZGVyIHRoZSBpdGVtcyBhcHBlYXJlZCBpbiB0aGVcbiAqIHNvdXJjZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdFtdfSBvYmplY3RzIEluaXRpYWwgbGlzdCBvZiBvYmplY3RzLiBFcXVpdmFsZW50IHRvIGNhbGxpbmdcbiAqICAgICBzZXRPYmplY3RzKCkgYWZ0ZXIgY29uc3RydWN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmdbXX0gb3B0aW9ucy5rZXlzIExpc3Qgb2Yga2V5cyB0byB1c2UgYXMgaW5kZXhlcyBvbiB0aGUgb2JqZWN0c1xuICogQHBhcmFtIHtmdW5jdGlvbltdfSBvcHRpb25zLmZ1bmNzIExpc3Qgb2YgZnVuY3Rpb25zIHRoYXQgd2hlbiBjYWxsZWQgd2l0aCB0aGVcbiAqICAgICBvYmplY3QgYXMgYW4gYXJnIHdpbGwgcmV0dXJuIGEgc3RyaW5nIHRvIHVzZSBhcyBhbiBpbmRleFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWVyeU1hdGNoZXI8VCBleHRlbmRzIE9iamVjdD4ge1xuICAgIHByaXZhdGUgX29wdGlvbnM6IElPcHRpb25zPFQ+O1xuICAgIHByaXZhdGUgX2l0ZW1zOiBNYXA8c3RyaW5nLCB7b2JqZWN0OiBULCBrZXlXZWlnaHQ6IG51bWJlcn1bXT47XG5cbiAgICBjb25zdHJ1Y3RvcihvYmplY3RzOiBUW10sIG9wdGlvbnM6IElPcHRpb25zPFQ+ID0geyBrZXlzOiBbXSB9KSB7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIHRoaXMuc2V0T2JqZWN0cyhvYmplY3RzKTtcblxuICAgICAgICAvLyBCeSBkZWZhdWx0LCB3ZSByZW1vdmUgYW55IG5vbi1hbHBoYW51bWVyaWMgY2hhcmFjdGVycyAoW15BLVphLXowLTlfXSkgZnJvbSB0aGVcbiAgICAgICAgLy8gcXVlcnkgYW5kIHRoZSB2YWx1ZSBiZWluZyBxdWVyaWVkIGJlZm9yZSBtYXRjaGluZ1xuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5zaG91bGRNYXRjaFdvcmRzT25seSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zLnNob3VsZE1hdGNoV29yZHNPbmx5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ5IGRlZmF1bHQsIG1hdGNoIGFueXdoZXJlIGluIHRoZSBzdHJpbmcgYmVpbmcgc2VhcmNoZWQuIElmIGVuYWJsZWQsIG9ubHkgcmV0dXJuXG4gICAgICAgIC8vIG1hdGNoZXMgdGhhdCBhcmUgcHJlZml4ZWQgd2l0aCB0aGUgcXVlcnkuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLnNob3VsZE1hdGNoUHJlZml4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMuc2hvdWxkTWF0Y2hQcmVmaXggPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldE9iamVjdHMob2JqZWN0czogVFtdKSB7XG4gICAgICAgIHRoaXMuX2l0ZW1zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIG9iamVjdHMpIHtcbiAgICAgICAgICAgIC8vIE5lZWQgdG8gdXNlIHVuc2FmZSBjb2VyY2UgaGVyZSBiZWNhdXNlIHRoZSBvYmplY3RzIGNhbiBoYXZlIGFueVxuICAgICAgICAgICAgLy8gdHlwZSBmb3IgdGhlaXIgdmFsdWVzLiBXZSBhc3N1bWUgdGhhdCB0aG9zZSB2YWx1ZXMgd2hvJ3Mga2V5cyBoYXZlXG4gICAgICAgICAgICAvLyBiZWVuIHNwZWNpZmllZCB3aWxsIGJlIHN0cmluZy4gQWxzbywgd2UgY2Fubm90IGluZmVyIGFsbCB0aGVcbiAgICAgICAgICAgIC8vIHR5cGVzIG9mIHRoZSBrZXlzIG9mIHRoZSBvYmplY3RzIGF0IGNvbXBpbGUuXG4gICAgICAgICAgICBjb25zdCBrZXlWYWx1ZXMgPSBhdDxzdHJpbmc+KDxhbnk+b2JqZWN0LCB0aGlzLl9vcHRpb25zLmtleXMpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy5mdW5jcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZiBvZiB0aGlzLl9vcHRpb25zLmZ1bmNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleVZhbHVlcy5wdXNoKGYob2JqZWN0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtpbmRleCwga2V5VmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGtleVZhbHVlcykpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWtleVZhbHVlKSBjb250aW51ZTsgLy8gc2tpcCBmYWxzeSBrZXlWYWx1ZXNcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLnByb2Nlc3NRdWVyeShrZXlWYWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pdGVtcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pdGVtcy5zZXQoa2V5LCBbXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2l0ZW1zLmdldChrZXkpLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBrZXlXZWlnaHQ6IE51bWJlcihpbmRleCksXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1hdGNoKHF1ZXJ5OiBzdHJpbmcpOiBUW10ge1xuICAgICAgICBxdWVyeSA9IHRoaXMucHJvY2Vzc1F1ZXJ5KHF1ZXJ5KTtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuc2hvdWxkTWF0Y2hXb3Jkc09ubHkpIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gcXVlcnkucmVwbGFjZSgvW15cXHddL2csICcnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocXVlcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IFtdO1xuICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIG1hcCAmIGNoZWNrIGVhY2gga2V5LlxuICAgICAgICAvLyBFUzYgTWFwIGl0ZXJhdGlvbiBvcmRlciBpcyBkZWZpbmVkIHRvIGJlIGluc2VydGlvbiBvcmRlciwgc28gcmVzdWx0c1xuICAgICAgICAvLyBoZXJlIHdpbGwgY29tZSBvdXQgaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSBwdXQgaW4uXG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgY2FuZGlkYXRlc10gb2YgdGhpcy5faXRlbXMuZW50cmllcygpKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0S2V5ID0ga2V5O1xuICAgICAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuc2hvdWxkTWF0Y2hXb3Jkc09ubHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRLZXkgPSByZXN1bHRLZXkucmVwbGFjZSgvW15cXHddL2csICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVzdWx0S2V5LmluZGV4T2YocXVlcnkpO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSAmJiAoIXRoaXMuX29wdGlvbnMuc2hvdWxkTWF0Y2hQcmVmaXggfHwgaW5kZXggPT09IDApKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAuLi5jYW5kaWRhdGVzLm1hcCgoY2FuZGlkYXRlKSA9PiAoe2luZGV4LCAuLi5jYW5kaWRhdGV9KSksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNvcnQgbWF0Y2hlcyBieSB3aGVyZSB0aGUgcXVlcnkgYXBwZWFyZWQgaW4gdGhlIHNlYXJjaCBrZXksIHRoZW4gYnlcbiAgICAgICAgLy8gd2hlcmUgdGhlIG1hdGNoZWQga2V5IGFwcGVhcmVkIGluIHRoZSBwcm92aWRlZCBhcnJheSBvZiBrZXlzLlxuICAgICAgICBtYXRjaGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhLmluZGV4IDwgYi5pbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5pbmRleCA9PT0gYi5pbmRleCkge1xuICAgICAgICAgICAgICAgIGlmIChhLmtleVdlaWdodCA8IGIua2V5V2VpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGEua2V5V2VpZ2h0ID09PSBiLmtleVdlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgbWFwIHRoZSBrZXlzIHRvIHRoZSByZXN1bHQgb2JqZWN0cy4gQWxzbyByZW1vdmUgYW55IGR1cGxpY2F0ZXMuXG4gICAgICAgIHJldHVybiB1bmlxKG1hdGNoZXMubWFwKChtYXRjaCkgPT4gbWF0Y2gub2JqZWN0KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzUXVlcnkocXVlcnk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmZ1enp5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gbG93ZXIgY2FzZSBib3RoIHRoZSBpbnB1dCBhbmQgdGhlIG91dHB1dCBmb3IgY29uc2lzdGVuY3lcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVIaWRkZW5DaGFycyhxdWVyeS50b0xvd2VyQ2FzZSgpKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbn1cbiJdfQ==