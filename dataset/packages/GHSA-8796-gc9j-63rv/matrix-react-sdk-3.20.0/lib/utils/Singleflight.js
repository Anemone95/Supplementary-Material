"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Singleflight = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _maps = require("./maps");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// Inspired by https://pkg.go.dev/golang.org/x/sync/singleflight
const keyMap = new _maps.EnhancedMap();
/**
 * Access class to get a singleflight context. Singleflights execute a
 * function exactly once, unless instructed to forget about a result.
 *
 * Typically this is used to de-duplicate an action, such as a save button
 * being pressed, without having to track state internally for an operation
 * already being in progress. This doesn't expose a flag which can be used
 * to disable a button, however it would be capable of returning a Promise
 * from the first call.
 *
 * The result of the function call is cached indefinitely, just in case a
 * second call comes through late. There are various functions named "forget"
 * to have the cache be cleared of a result.
 *
 * Singleflights in our usecase are tied to an instance of something, combined
 * with a string key to differentiate between multiple possible actions. This
 * means that a "save" key will be scoped to the instance which defined it and
 * not leak between other instances. This is done to avoid having to concatenate
 * variables to strings to essentially namespace the field, for most cases.
 */

class Singleflight {
  constructor() {}
  /**
   * A void marker to help with returning a value in a singleflight context.
   * If your code doesn't return anything, return this instead.
   */


  /**
   * Acquire a singleflight context.
   * @param {Object} instance An instance to associate the context with. Can be any object.
   * @param {string} key A string key relevant to that instance to namespace under.
   * @returns {SingleflightContext} Returns the context to execute the function.
   */
  static for(instance
  /*: Object*/
  , key
  /*: string*/
  )
  /*: SingleflightContext*/
  {
    if (!instance || !key) throw new Error("An instance and key must be supplied");
    return new SingleflightContext(instance, key);
  }
  /**
   * Forgets all results for a given instance.
   * @param {Object} instance The instance to forget about.
   */


  static forgetAllFor(instance
  /*: Object*/
  ) {
    keyMap.delete(instance);
  }
  /**
   * Forgets all cached results for all instances. Intended for use by tests.
   */


  static forgetAll() {
    for (const k of keyMap.keys()) {
      keyMap.remove(k);
    }
  }

}

exports.Singleflight = Singleflight;
(0, _defineProperty2.default)(Singleflight, "Void", Symbol("void"));

class SingleflightContext {
  constructor(instance
  /*: Object*/
  , key
  /*: string*/
  ) {
    this.instance
    /*:: */
    = instance
    /*:: */
    ;
    this.key
    /*:: */
    = key
    /*:: */
    ;
  }
  /**
   * Forget this particular instance and key combination, discarding the result.
   */


  forget() {
    const map = keyMap.get(this.instance);
    if (!map) return;
    map.remove(this.key);
    if (!map.size) keyMap.remove(this.instance);
  }
  /**
   * Execute a function. If a result is already known, that will be returned instead
   * of executing the provided function. However, if no result is known then the function
   * will be called, with its return value cached. The function must return a value
   * other than `undefined` - take a look at Singleflight.Void if you don't have a return
   * to make.
   *
   * Note that this technically allows the caller to provide a different function each time:
   * this is largely considered a bad idea and should not be done. Singleflights work off the
   * premise that something needs to happen once, so duplicate executions will be ignored.
   *
   * For ideal performance and behaviour, functions which return promises are preferred. If
   * a function is not returning a promise, it should return as soon as possible to avoid a
   * second call potentially racing it. The promise returned by this function will be that
   * of the first execution of the function, even on duplicate calls.
   * @param {Function} fn The function to execute.
   * @returns The recorded value.
   */


  do(fn
  /*: () => T*/
  )
  /*: T*/
  {
    const map = keyMap.getOrCreate(this.instance, new _maps.EnhancedMap()); // We have to manually getOrCreate() because we need to execute the fn

    let val = map.get(this.key);

    if (val === undefined) {
      val = fn();
      map.set(this.key, val);
    }

    return val;
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9TaW5nbGVmbGlnaHQudHMiXSwibmFtZXMiOlsia2V5TWFwIiwiRW5oYW5jZWRNYXAiLCJTaW5nbGVmbGlnaHQiLCJjb25zdHJ1Y3RvciIsImZvciIsImluc3RhbmNlIiwia2V5IiwiRXJyb3IiLCJTaW5nbGVmbGlnaHRDb250ZXh0IiwiZm9yZ2V0QWxsRm9yIiwiZGVsZXRlIiwiZm9yZ2V0QWxsIiwiayIsImtleXMiLCJyZW1vdmUiLCJTeW1ib2wiLCJmb3JnZXQiLCJtYXAiLCJnZXQiLCJzaXplIiwiZG8iLCJmbiIsImdldE9yQ3JlYXRlIiwidmFsIiwidW5kZWZpbmVkIiwic2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFFQSxNQUFNQSxNQUFNLEdBQUcsSUFBSUMsaUJBQUosRUFBZjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ08sTUFBTUMsWUFBTixDQUFtQjtBQUNkQyxFQUFBQSxXQUFSLEdBQXNCLENBQ3JCO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7OztBQUdJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJLFNBQWNDLEdBQWQsQ0FBa0JDO0FBQWxCO0FBQUEsSUFBb0NDO0FBQXBDO0FBQUE7QUFBQTtBQUFzRTtBQUNsRSxRQUFJLENBQUNELFFBQUQsSUFBYSxDQUFDQyxHQUFsQixFQUF1QixNQUFNLElBQUlDLEtBQUosQ0FBVSxzQ0FBVixDQUFOO0FBQ3ZCLFdBQU8sSUFBSUMsbUJBQUosQ0FBd0JILFFBQXhCLEVBQWtDQyxHQUFsQyxDQUFQO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0FBQ0ksU0FBY0csWUFBZCxDQUEyQko7QUFBM0I7QUFBQSxJQUE2QztBQUN6Q0wsSUFBQUEsTUFBTSxDQUFDVSxNQUFQLENBQWNMLFFBQWQ7QUFDSDtBQUVEO0FBQ0o7QUFDQTs7O0FBQ0ksU0FBY00sU0FBZCxHQUEwQjtBQUN0QixTQUFLLE1BQU1DLENBQVgsSUFBZ0JaLE1BQU0sQ0FBQ2EsSUFBUCxFQUFoQixFQUErQjtBQUMzQmIsTUFBQUEsTUFBTSxDQUFDYyxNQUFQLENBQWNGLENBQWQ7QUFDSDtBQUNKOztBQXBDcUI7Ozs4QkFBYlYsWSxVQVFZYSxNQUFNLENBQUMsTUFBRCxDOztBQStCL0IsTUFBTVAsbUJBQU4sQ0FBMEI7QUFDZkwsRUFBQUEsV0FBUCxDQUEyQkU7QUFBM0I7QUFBQSxJQUFxREM7QUFBckQ7QUFBQSxJQUFrRTtBQUFBLFNBQXZDRDtBQUF1QztBQUFBLE1BQXZDQTtBQUF1QztBQUFBO0FBQUEsU0FBYkM7QUFBYTtBQUFBLE1BQWJBO0FBQWE7QUFBQTtBQUNqRTtBQUVEO0FBQ0o7QUFDQTs7O0FBQ1dVLEVBQUFBLE1BQVAsR0FBZ0I7QUFDWixVQUFNQyxHQUFHLEdBQUdqQixNQUFNLENBQUNrQixHQUFQLENBQVcsS0FBS2IsUUFBaEIsQ0FBWjtBQUNBLFFBQUksQ0FBQ1ksR0FBTCxFQUFVO0FBQ1ZBLElBQUFBLEdBQUcsQ0FBQ0gsTUFBSixDQUFXLEtBQUtSLEdBQWhCO0FBQ0EsUUFBSSxDQUFDVyxHQUFHLENBQUNFLElBQVQsRUFBZW5CLE1BQU0sQ0FBQ2MsTUFBUCxDQUFjLEtBQUtULFFBQW5CO0FBQ2xCO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDV2UsRUFBQUEsRUFBUCxDQUFhQztBQUFiO0FBQUE7QUFBQTtBQUE2QjtBQUN6QixVQUFNSixHQUFHLEdBQUdqQixNQUFNLENBQUNzQixXQUFQLENBQW1CLEtBQUtqQixRQUF4QixFQUFrQyxJQUFJSixpQkFBSixFQUFsQyxDQUFaLENBRHlCLENBR3pCOztBQUNBLFFBQUlzQixHQUFHLEdBQU1OLEdBQUcsQ0FBQ0MsR0FBSixDQUFRLEtBQUtaLEdBQWIsQ0FBYjs7QUFDQSxRQUFJaUIsR0FBRyxLQUFLQyxTQUFaLEVBQXVCO0FBQ25CRCxNQUFBQSxHQUFHLEdBQUdGLEVBQUUsRUFBUjtBQUNBSixNQUFBQSxHQUFHLENBQUNRLEdBQUosQ0FBUSxLQUFLbkIsR0FBYixFQUFrQmlCLEdBQWxCO0FBQ0g7O0FBRUQsV0FBT0EsR0FBUDtBQUNIOztBQTNDcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge0VuaGFuY2VkTWFwfSBmcm9tIFwiLi9tYXBzXCI7XG5cbi8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vcGtnLmdvLmRldi9nb2xhbmcub3JnL3gvc3luYy9zaW5nbGVmbGlnaHRcblxuY29uc3Qga2V5TWFwID0gbmV3IEVuaGFuY2VkTWFwPE9iamVjdCwgRW5oYW5jZWRNYXA8c3RyaW5nLCB1bmtub3duPj4oKTtcblxuLyoqXG4gKiBBY2Nlc3MgY2xhc3MgdG8gZ2V0IGEgc2luZ2xlZmxpZ2h0IGNvbnRleHQuIFNpbmdsZWZsaWdodHMgZXhlY3V0ZSBhXG4gKiBmdW5jdGlvbiBleGFjdGx5IG9uY2UsIHVubGVzcyBpbnN0cnVjdGVkIHRvIGZvcmdldCBhYm91dCBhIHJlc3VsdC5cbiAqXG4gKiBUeXBpY2FsbHkgdGhpcyBpcyB1c2VkIHRvIGRlLWR1cGxpY2F0ZSBhbiBhY3Rpb24sIHN1Y2ggYXMgYSBzYXZlIGJ1dHRvblxuICogYmVpbmcgcHJlc3NlZCwgd2l0aG91dCBoYXZpbmcgdG8gdHJhY2sgc3RhdGUgaW50ZXJuYWxseSBmb3IgYW4gb3BlcmF0aW9uXG4gKiBhbHJlYWR5IGJlaW5nIGluIHByb2dyZXNzLiBUaGlzIGRvZXNuJ3QgZXhwb3NlIGEgZmxhZyB3aGljaCBjYW4gYmUgdXNlZFxuICogdG8gZGlzYWJsZSBhIGJ1dHRvbiwgaG93ZXZlciBpdCB3b3VsZCBiZSBjYXBhYmxlIG9mIHJldHVybmluZyBhIFByb21pc2VcbiAqIGZyb20gdGhlIGZpcnN0IGNhbGwuXG4gKlxuICogVGhlIHJlc3VsdCBvZiB0aGUgZnVuY3Rpb24gY2FsbCBpcyBjYWNoZWQgaW5kZWZpbml0ZWx5LCBqdXN0IGluIGNhc2UgYVxuICogc2Vjb25kIGNhbGwgY29tZXMgdGhyb3VnaCBsYXRlLiBUaGVyZSBhcmUgdmFyaW91cyBmdW5jdGlvbnMgbmFtZWQgXCJmb3JnZXRcIlxuICogdG8gaGF2ZSB0aGUgY2FjaGUgYmUgY2xlYXJlZCBvZiBhIHJlc3VsdC5cbiAqXG4gKiBTaW5nbGVmbGlnaHRzIGluIG91ciB1c2VjYXNlIGFyZSB0aWVkIHRvIGFuIGluc3RhbmNlIG9mIHNvbWV0aGluZywgY29tYmluZWRcbiAqIHdpdGggYSBzdHJpbmcga2V5IHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBtdWx0aXBsZSBwb3NzaWJsZSBhY3Rpb25zLiBUaGlzXG4gKiBtZWFucyB0aGF0IGEgXCJzYXZlXCIga2V5IHdpbGwgYmUgc2NvcGVkIHRvIHRoZSBpbnN0YW5jZSB3aGljaCBkZWZpbmVkIGl0IGFuZFxuICogbm90IGxlYWsgYmV0d2VlbiBvdGhlciBpbnN0YW5jZXMuIFRoaXMgaXMgZG9uZSB0byBhdm9pZCBoYXZpbmcgdG8gY29uY2F0ZW5hdGVcbiAqIHZhcmlhYmxlcyB0byBzdHJpbmdzIHRvIGVzc2VudGlhbGx5IG5hbWVzcGFjZSB0aGUgZmllbGQsIGZvciBtb3N0IGNhc2VzLlxuICovXG5leHBvcnQgY2xhc3MgU2luZ2xlZmxpZ2h0IHtcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgdm9pZCBtYXJrZXIgdG8gaGVscCB3aXRoIHJldHVybmluZyBhIHZhbHVlIGluIGEgc2luZ2xlZmxpZ2h0IGNvbnRleHQuXG4gICAgICogSWYgeW91ciBjb2RlIGRvZXNuJ3QgcmV0dXJuIGFueXRoaW5nLCByZXR1cm4gdGhpcyBpbnN0ZWFkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgVm9pZCA9IFN5bWJvbChcInZvaWRcIik7XG5cbiAgICAvKipcbiAgICAgKiBBY3F1aXJlIGEgc2luZ2xlZmxpZ2h0IGNvbnRleHQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlIEFuIGluc3RhbmNlIHRvIGFzc29jaWF0ZSB0aGUgY29udGV4dCB3aXRoLiBDYW4gYmUgYW55IG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IEEgc3RyaW5nIGtleSByZWxldmFudCB0byB0aGF0IGluc3RhbmNlIHRvIG5hbWVzcGFjZSB1bmRlci5cbiAgICAgKiBAcmV0dXJucyB7U2luZ2xlZmxpZ2h0Q29udGV4dH0gUmV0dXJucyB0aGUgY29udGV4dCB0byBleGVjdXRlIHRoZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZvcihpbnN0YW5jZTogT2JqZWN0LCBrZXk6IHN0cmluZyk6IFNpbmdsZWZsaWdodENvbnRleHQge1xuICAgICAgICBpZiAoIWluc3RhbmNlIHx8ICFrZXkpIHRocm93IG5ldyBFcnJvcihcIkFuIGluc3RhbmNlIGFuZCBrZXkgbXVzdCBiZSBzdXBwbGllZFwiKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTaW5nbGVmbGlnaHRDb250ZXh0KGluc3RhbmNlLCBrZXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvcmdldHMgYWxsIHJlc3VsdHMgZm9yIGEgZ2l2ZW4gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlIFRoZSBpbnN0YW5jZSB0byBmb3JnZXQgYWJvdXQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmb3JnZXRBbGxGb3IoaW5zdGFuY2U6IE9iamVjdCkge1xuICAgICAgICBrZXlNYXAuZGVsZXRlKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb3JnZXRzIGFsbCBjYWNoZWQgcmVzdWx0cyBmb3IgYWxsIGluc3RhbmNlcy4gSW50ZW5kZWQgZm9yIHVzZSBieSB0ZXN0cy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZvcmdldEFsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIGtleU1hcC5rZXlzKCkpIHtcbiAgICAgICAgICAgIGtleU1hcC5yZW1vdmUoayk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIFNpbmdsZWZsaWdodENvbnRleHQge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIGluc3RhbmNlOiBPYmplY3QsIHByaXZhdGUga2V5OiBzdHJpbmcpIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGb3JnZXQgdGhpcyBwYXJ0aWN1bGFyIGluc3RhbmNlIGFuZCBrZXkgY29tYmluYXRpb24sIGRpc2NhcmRpbmcgdGhlIHJlc3VsdC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZm9yZ2V0KCkge1xuICAgICAgICBjb25zdCBtYXAgPSBrZXlNYXAuZ2V0KHRoaXMuaW5zdGFuY2UpO1xuICAgICAgICBpZiAoIW1hcCkgcmV0dXJuO1xuICAgICAgICBtYXAucmVtb3ZlKHRoaXMua2V5KTtcbiAgICAgICAgaWYgKCFtYXAuc2l6ZSkga2V5TWFwLnJlbW92ZSh0aGlzLmluc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGEgZnVuY3Rpb24uIElmIGEgcmVzdWx0IGlzIGFscmVhZHkga25vd24sIHRoYXQgd2lsbCBiZSByZXR1cm5lZCBpbnN0ZWFkXG4gICAgICogb2YgZXhlY3V0aW5nIHRoZSBwcm92aWRlZCBmdW5jdGlvbi4gSG93ZXZlciwgaWYgbm8gcmVzdWx0IGlzIGtub3duIHRoZW4gdGhlIGZ1bmN0aW9uXG4gICAgICogd2lsbCBiZSBjYWxsZWQsIHdpdGggaXRzIHJldHVybiB2YWx1ZSBjYWNoZWQuIFRoZSBmdW5jdGlvbiBtdXN0IHJldHVybiBhIHZhbHVlXG4gICAgICogb3RoZXIgdGhhbiBgdW5kZWZpbmVkYCAtIHRha2UgYSBsb29rIGF0IFNpbmdsZWZsaWdodC5Wb2lkIGlmIHlvdSBkb24ndCBoYXZlIGEgcmV0dXJuXG4gICAgICogdG8gbWFrZS5cbiAgICAgKlxuICAgICAqIE5vdGUgdGhhdCB0aGlzIHRlY2huaWNhbGx5IGFsbG93cyB0aGUgY2FsbGVyIHRvIHByb3ZpZGUgYSBkaWZmZXJlbnQgZnVuY3Rpb24gZWFjaCB0aW1lOlxuICAgICAqIHRoaXMgaXMgbGFyZ2VseSBjb25zaWRlcmVkIGEgYmFkIGlkZWEgYW5kIHNob3VsZCBub3QgYmUgZG9uZS4gU2luZ2xlZmxpZ2h0cyB3b3JrIG9mZiB0aGVcbiAgICAgKiBwcmVtaXNlIHRoYXQgc29tZXRoaW5nIG5lZWRzIHRvIGhhcHBlbiBvbmNlLCBzbyBkdXBsaWNhdGUgZXhlY3V0aW9ucyB3aWxsIGJlIGlnbm9yZWQuXG4gICAgICpcbiAgICAgKiBGb3IgaWRlYWwgcGVyZm9ybWFuY2UgYW5kIGJlaGF2aW91ciwgZnVuY3Rpb25zIHdoaWNoIHJldHVybiBwcm9taXNlcyBhcmUgcHJlZmVycmVkLiBJZlxuICAgICAqIGEgZnVuY3Rpb24gaXMgbm90IHJldHVybmluZyBhIHByb21pc2UsIGl0IHNob3VsZCByZXR1cm4gYXMgc29vbiBhcyBwb3NzaWJsZSB0byBhdm9pZCBhXG4gICAgICogc2Vjb25kIGNhbGwgcG90ZW50aWFsbHkgcmFjaW5nIGl0LiBUaGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgdGhhdFxuICAgICAqIG9mIHRoZSBmaXJzdCBleGVjdXRpb24gb2YgdGhlIGZ1bmN0aW9uLCBldmVuIG9uIGR1cGxpY2F0ZSBjYWxscy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gZXhlY3V0ZS5cbiAgICAgKiBAcmV0dXJucyBUaGUgcmVjb3JkZWQgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIGRvPFQ+KGZuOiAoKSA9PiBUKTogVCB7XG4gICAgICAgIGNvbnN0IG1hcCA9IGtleU1hcC5nZXRPckNyZWF0ZSh0aGlzLmluc3RhbmNlLCBuZXcgRW5oYW5jZWRNYXA8c3RyaW5nLCB1bmtub3duPigpKTtcblxuICAgICAgICAvLyBXZSBoYXZlIHRvIG1hbnVhbGx5IGdldE9yQ3JlYXRlKCkgYmVjYXVzZSB3ZSBuZWVkIHRvIGV4ZWN1dGUgdGhlIGZuXG4gICAgICAgIGxldCB2YWwgPSA8VD5tYXAuZ2V0KHRoaXMua2V5KTtcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSBmbigpO1xuICAgICAgICAgICAgbWFwLnNldCh0aGlzLmtleSwgdmFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxufVxuIl19