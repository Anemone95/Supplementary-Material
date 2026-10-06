"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Whenable = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _arrays = require("./arrays");

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

/**
 * Whenables are a cheap way to have Observable patterns mixed with typical
 * usage of Promises, without having to tear down listeners or calls. Whenables
 * are intended to be used when a condition will be met multiple times and
 * the consumer needs to know *when* that happens.
 */
class Whenable
/*:: <T> implements IDestroyable*/
{
  constructor() {
    (0, _defineProperty2.default)(this, "listeners", []);
  }

  /**
   * Sets up a call to `fn` *when* the `condition` is met.
   * @param condition The condition to match.
   * @param fn The function to call.
   * @returns This.
   */
  when(condition
  /*: T*/
  , fn
  /*: WhenFn<T>*/
  )
  /*: Whenable<T>*/
  {
    this.listeners.push({
      condition,
      fn
    });
    return this;
  }
  /**
   * Sets up a call to `fn` *when* any of the `conditions` are met.
   * @param conditions The conditions to match.
   * @param fn The function to call.
   * @returns This.
   */


  whenAnyOf(conditions
  /*: T[]*/
  , fn
  /*: WhenFn<T>*/
  )
  /*: Whenable<T>*/
  {
    for (const condition of conditions) {
      this.when(condition, fn);
    }

    return this;
  }
  /**
   * Sets up a call to `fn` *when* any condition is met.
   * @param fn The function to call.
   * @returns This.
   */


  whenAnything(fn
  /*: WhenFn<T>*/
  )
  /*: Whenable<T>*/
  {
    this.listeners.push({
      condition: null,
      fn
    });
    return this;
  }
  /**
   * Notifies all the listeners of a given condition.
   * @param condition The new condition that has been met.
   */


  notifyCondition(condition
  /*: T*/
  ) {
    const listeners = (0, _arrays.arrayFastClone)(this.listeners); // clone just in case the handler modifies us

    for (const listener of listeners) {
      if (listener.condition === null || listener.condition === condition) {
        try {
          listener.fn(this);
        } catch (e) {
          console.error(`Error calling whenable listener for ${condition}:`, e);
        }
      }
    }
  }

  destroy() {
    this.listeners = [];
  }

}

exports.Whenable = Whenable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9XaGVuYWJsZS50cyJdLCJuYW1lcyI6WyJXaGVuYWJsZSIsIndoZW4iLCJjb25kaXRpb24iLCJmbiIsImxpc3RlbmVycyIsInB1c2giLCJ3aGVuQW55T2YiLCJjb25kaXRpb25zIiwid2hlbkFueXRoaW5nIiwibm90aWZ5Q29uZGl0aW9uIiwibGlzdGVuZXIiLCJlIiwiY29uc29sZSIsImVycm9yIiwiZGVzdHJveSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxNQUFlQTtBQUFmO0FBQW1EO0FBQUE7QUFBQSxxREFDTSxFQUROO0FBQUE7O0FBR3REO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNXQyxFQUFBQSxJQUFQLENBQVlDO0FBQVo7QUFBQSxJQUEwQkM7QUFBMUI7QUFBQTtBQUFBO0FBQXNEO0FBQ2xELFNBQUtDLFNBQUwsQ0FBZUMsSUFBZixDQUFvQjtBQUFDSCxNQUFBQSxTQUFEO0FBQVlDLE1BQUFBO0FBQVosS0FBcEI7QUFDQSxXQUFPLElBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ1dHLEVBQUFBLFNBQVAsQ0FBaUJDO0FBQWpCO0FBQUEsSUFBa0NKO0FBQWxDO0FBQUE7QUFBQTtBQUE4RDtBQUMxRCxTQUFLLE1BQU1ELFNBQVgsSUFBd0JLLFVBQXhCLEVBQW9DO0FBQ2hDLFdBQUtOLElBQUwsQ0FBVUMsU0FBVixFQUFxQkMsRUFBckI7QUFDSDs7QUFDRCxXQUFPLElBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztBQUNXSyxFQUFBQSxZQUFQLENBQW9CTDtBQUFwQjtBQUFBO0FBQUE7QUFBZ0Q7QUFDNUMsU0FBS0MsU0FBTCxDQUFlQyxJQUFmLENBQW9CO0FBQUNILE1BQUFBLFNBQVMsRUFBRSxJQUFaO0FBQWtCQyxNQUFBQTtBQUFsQixLQUFwQjtBQUNBLFdBQU8sSUFBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7OztBQUNjTSxFQUFBQSxlQUFWLENBQTBCUDtBQUExQjtBQUFBLElBQXdDO0FBQ3BDLFVBQU1FLFNBQVMsR0FBRyw0QkFBZSxLQUFLQSxTQUFwQixDQUFsQixDQURvQyxDQUNjOztBQUNsRCxTQUFLLE1BQU1NLFFBQVgsSUFBdUJOLFNBQXZCLEVBQWtDO0FBQzlCLFVBQUlNLFFBQVEsQ0FBQ1IsU0FBVCxLQUF1QixJQUF2QixJQUErQlEsUUFBUSxDQUFDUixTQUFULEtBQXVCQSxTQUExRCxFQUFxRTtBQUNqRSxZQUFJO0FBQ0FRLFVBQUFBLFFBQVEsQ0FBQ1AsRUFBVCxDQUFZLElBQVo7QUFDSCxTQUZELENBRUUsT0FBT1EsQ0FBUCxFQUFVO0FBQ1JDLFVBQUFBLE9BQU8sQ0FBQ0MsS0FBUixDQUFlLHVDQUFzQ1gsU0FBVSxHQUEvRCxFQUFtRVMsQ0FBbkU7QUFDSDtBQUNKO0FBQ0o7QUFDSjs7QUFFTUcsRUFBQUEsT0FBUCxHQUFpQjtBQUNiLFNBQUtWLFNBQUwsR0FBaUIsRUFBakI7QUFDSDs7QUF4RHFEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmltcG9ydCB7IElEZXN0cm95YWJsZSB9IGZyb20gXCIuL0lEZXN0cm95YWJsZVwiO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUgfSBmcm9tIFwiLi9hcnJheXNcIjtcblxuZXhwb3J0IHR5cGUgV2hlbkZuPFQ+ID0gKHc6IFdoZW5hYmxlPFQ+KSA9PiB2b2lkO1xuXG4vKipcbiAqIFdoZW5hYmxlcyBhcmUgYSBjaGVhcCB3YXkgdG8gaGF2ZSBPYnNlcnZhYmxlIHBhdHRlcm5zIG1peGVkIHdpdGggdHlwaWNhbFxuICogdXNhZ2Ugb2YgUHJvbWlzZXMsIHdpdGhvdXQgaGF2aW5nIHRvIHRlYXIgZG93biBsaXN0ZW5lcnMgb3IgY2FsbHMuIFdoZW5hYmxlc1xuICogYXJlIGludGVuZGVkIHRvIGJlIHVzZWQgd2hlbiBhIGNvbmRpdGlvbiB3aWxsIGJlIG1ldCBtdWx0aXBsZSB0aW1lcyBhbmRcbiAqIHRoZSBjb25zdW1lciBuZWVkcyB0byBrbm93ICp3aGVuKiB0aGF0IGhhcHBlbnMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBXaGVuYWJsZTxUPiBpbXBsZW1lbnRzIElEZXN0cm95YWJsZSB7XG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IHtjb25kaXRpb246IFQgfCBudWxsLCBmbjogV2hlbkZuPFQ+fVtdID0gW107XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHVwIGEgY2FsbCB0byBgZm5gICp3aGVuKiB0aGUgYGNvbmRpdGlvbmAgaXMgbWV0LlxuICAgICAqIEBwYXJhbSBjb25kaXRpb24gVGhlIGNvbmRpdGlvbiB0byBtYXRjaC5cbiAgICAgKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwuXG4gICAgICogQHJldHVybnMgVGhpcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2hlbihjb25kaXRpb246IFQsIGZuOiBXaGVuRm48VD4pOiBXaGVuYWJsZTxUPiB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2goe2NvbmRpdGlvbiwgZm59KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBhIGNhbGwgdG8gYGZuYCAqd2hlbiogYW55IG9mIHRoZSBgY29uZGl0aW9uc2AgYXJlIG1ldC5cbiAgICAgKiBAcGFyYW0gY29uZGl0aW9ucyBUaGUgY29uZGl0aW9ucyB0byBtYXRjaC5cbiAgICAgKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwuXG4gICAgICogQHJldHVybnMgVGhpcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2hlbkFueU9mKGNvbmRpdGlvbnM6IFRbXSwgZm46IFdoZW5GbjxUPik6IFdoZW5hYmxlPFQ+IHtcbiAgICAgICAgZm9yIChjb25zdCBjb25kaXRpb24gb2YgY29uZGl0aW9ucykge1xuICAgICAgICAgICAgdGhpcy53aGVuKGNvbmRpdGlvbiwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgYSBjYWxsIHRvIGBmbmAgKndoZW4qIGFueSBjb25kaXRpb24gaXMgbWV0LlxuICAgICAqIEBwYXJhbSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbC5cbiAgICAgKiBAcmV0dXJucyBUaGlzLlxuICAgICAqL1xuICAgIHB1YmxpYyB3aGVuQW55dGhpbmcoZm46IFdoZW5GbjxUPik6IFdoZW5hYmxlPFQ+IHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaCh7Y29uZGl0aW9uOiBudWxsLCBmbn0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOb3RpZmllcyBhbGwgdGhlIGxpc3RlbmVycyBvZiBhIGdpdmVuIGNvbmRpdGlvbi5cbiAgICAgKiBAcGFyYW0gY29uZGl0aW9uIFRoZSBuZXcgY29uZGl0aW9uIHRoYXQgaGFzIGJlZW4gbWV0LlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBub3RpZnlDb25kaXRpb24oY29uZGl0aW9uOiBUKSB7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGFycmF5RmFzdENsb25lKHRoaXMubGlzdGVuZXJzKTsgLy8gY2xvbmUganVzdCBpbiBjYXNlIHRoZSBoYW5kbGVyIG1vZGlmaWVzIHVzXG4gICAgICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXIuY29uZGl0aW9uID09PSBudWxsIHx8IGxpc3RlbmVyLmNvbmRpdGlvbiA9PT0gY29uZGl0aW9uKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIuZm4odGhpcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBjYWxsaW5nIHdoZW5hYmxlIGxpc3RlbmVyIGZvciAke2NvbmRpdGlvbn06YCwgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gICAgfVxufVxuIl19