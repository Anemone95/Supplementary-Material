"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MarkedExecution = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

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
 * A utility to ensure that a function is only called once triggered with
 * a mark applied. Multiple marks can be applied to the function, however
 * the function will only be called once upon trigger().
 *
 * The function starts unmarked.
 */
class MarkedExecution {
  /**
   * Creates a MarkedExecution for the provided function.
   * @param fn The function to be called upon trigger if marked.
   */
  constructor(fn
  /*: () => void*/
  ) {
    this.fn
    /*:: */
    = fn
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "marked", false);
  }
  /**
   * Resets the mark without calling the function.
   */


  reset() {
    this.marked = false;
  }
  /**
   * Marks the function to be called upon trigger().
   */


  mark() {
    this.marked = true;
  }
  /**
   * If marked, the function will be called, otherwise this does nothing.
   */


  trigger() {
    if (!this.marked) return;
    this.reset(); // reset first just in case the fn() causes a trigger()

    this.fn();
  }

}

exports.MarkedExecution = MarkedExecution;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9NYXJrZWRFeGVjdXRpb24udHMiXSwibmFtZXMiOlsiTWFya2VkRXhlY3V0aW9uIiwiY29uc3RydWN0b3IiLCJmbiIsInJlc2V0IiwibWFya2VkIiwibWFyayIsInRyaWdnZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsZUFBTixDQUFzQjtBQUd6QjtBQUNKO0FBQ0E7QUFDQTtBQUNJQyxFQUFBQSxXQUFXLENBQVNDO0FBQVQ7QUFBQSxJQUF5QjtBQUFBLFNBQWhCQTtBQUFnQjtBQUFBLE1BQWhCQTtBQUFnQjtBQUFBO0FBQUEsa0RBTm5CLEtBTW1CO0FBQ25DO0FBRUQ7QUFDSjtBQUNBOzs7QUFDV0MsRUFBQUEsS0FBUCxHQUFlO0FBQ1gsU0FBS0MsTUFBTCxHQUFjLEtBQWQ7QUFDSDtBQUVEO0FBQ0o7QUFDQTs7O0FBQ1dDLEVBQUFBLElBQVAsR0FBYztBQUNWLFNBQUtELE1BQUwsR0FBYyxJQUFkO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7OztBQUNXRSxFQUFBQSxPQUFQLEdBQWlCO0FBQ2IsUUFBSSxDQUFDLEtBQUtGLE1BQVYsRUFBa0I7QUFDbEIsU0FBS0QsS0FBTCxHQUZhLENBRUM7O0FBQ2QsU0FBS0QsRUFBTDtBQUNIOztBQS9Cd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbiAqIEEgdXRpbGl0eSB0byBlbnN1cmUgdGhhdCBhIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIG9uY2UgdHJpZ2dlcmVkIHdpdGhcbiAqIGEgbWFyayBhcHBsaWVkLiBNdWx0aXBsZSBtYXJrcyBjYW4gYmUgYXBwbGllZCB0byB0aGUgZnVuY3Rpb24sIGhvd2V2ZXJcbiAqIHRoZSBmdW5jdGlvbiB3aWxsIG9ubHkgYmUgY2FsbGVkIG9uY2UgdXBvbiB0cmlnZ2VyKCkuXG4gKlxuICogVGhlIGZ1bmN0aW9uIHN0YXJ0cyB1bm1hcmtlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hcmtlZEV4ZWN1dGlvbiB7XG4gICAgcHJpdmF0ZSBtYXJrZWQgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBNYXJrZWRFeGVjdXRpb24gZm9yIHRoZSBwcm92aWRlZCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gZm4gVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB1cG9uIHRyaWdnZXIgaWYgbWFya2VkLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZm46ICgpID0+IHZvaWQpIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIG1hcmsgd2l0aG91dCBjYWxsaW5nIHRoZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMubWFya2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFya3MgdGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB1cG9uIHRyaWdnZXIoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgbWFyaygpIHtcbiAgICAgICAgdGhpcy5tYXJrZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIG1hcmtlZCwgdGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkLCBvdGhlcndpc2UgdGhpcyBkb2VzIG5vdGhpbmcuXG4gICAgICovXG4gICAgcHVibGljIHRyaWdnZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5tYXJrZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5yZXNldCgpOyAvLyByZXNldCBmaXJzdCBqdXN0IGluIGNhc2UgdGhlIGZuKCkgY2F1c2VzIGEgdHJpZ2dlcigpXG4gICAgICAgIHRoaXMuZm4oKTtcbiAgICB9XG59XG4iXX0=