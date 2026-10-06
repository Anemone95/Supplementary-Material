"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PlatformPeg = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2016 OpenMarket Ltd
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

/*
 * Holds the current Platform object used by the code to do anything
 * specific to the platform we're running on (eg. web, electron)
 * Platforms are provided by the app layer.
 * This allows the app layer to set a Platform without necessarily
 * having to have a MatrixChat object
 */
class PlatformPeg {
  constructor() {
    (0, _defineProperty2.default)(this, "platform", null);
  }

  /**
   * Returns the current Platform object for the application.
   * This should be an instance of a class extending BasePlatform.
   */
  get() {
    return this.platform;
  }
  /**
   * Sets the current platform handler object to use for the
   * application.
   * This should be an instance of a class extending BasePlatform.
   */


  set(plaf
  /*: BasePlatform*/
  ) {
    this.platform = plaf;
  }

}

exports.PlatformPeg = PlatformPeg;

if (!window.mxPlatformPeg) {
  window.mxPlatformPeg = new PlatformPeg();
}

var _default = window.mxPlatformPeg;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9QbGF0Zm9ybVBlZy50cyJdLCJuYW1lcyI6WyJQbGF0Zm9ybVBlZyIsImdldCIsInBsYXRmb3JtIiwic2V0IiwicGxhZiIsIndpbmRvdyIsIm14UGxhdGZvcm1QZWciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxNQUFNQSxXQUFOLENBQWtCO0FBQUE7QUFBQSxvREFDSSxJQURKO0FBQUE7O0FBR3JCO0FBQ0o7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLEdBQUcsR0FBRztBQUNGLFdBQU8sS0FBS0MsUUFBWjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0lDLEVBQUFBLEdBQUcsQ0FBQ0M7QUFBRDtBQUFBLElBQXFCO0FBQ3BCLFNBQUtGLFFBQUwsR0FBZ0JFLElBQWhCO0FBQ0g7O0FBbEJvQjs7OztBQXFCekIsSUFBSSxDQUFDQyxNQUFNLENBQUNDLGFBQVosRUFBMkI7QUFDdkJELEVBQUFBLE1BQU0sQ0FBQ0MsYUFBUCxHQUF1QixJQUFJTixXQUFKLEVBQXZCO0FBQ0g7O2VBQ2NLLE1BQU0sQ0FBQ0MsYSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgQmFzZVBsYXRmb3JtIGZyb20gXCIuL0Jhc2VQbGF0Zm9ybVwiO1xuXG4vKlxuICogSG9sZHMgdGhlIGN1cnJlbnQgUGxhdGZvcm0gb2JqZWN0IHVzZWQgYnkgdGhlIGNvZGUgdG8gZG8gYW55dGhpbmdcbiAqIHNwZWNpZmljIHRvIHRoZSBwbGF0Zm9ybSB3ZSdyZSBydW5uaW5nIG9uIChlZy4gd2ViLCBlbGVjdHJvbilcbiAqIFBsYXRmb3JtcyBhcmUgcHJvdmlkZWQgYnkgdGhlIGFwcCBsYXllci5cbiAqIFRoaXMgYWxsb3dzIHRoZSBhcHAgbGF5ZXIgdG8gc2V0IGEgUGxhdGZvcm0gd2l0aG91dCBuZWNlc3NhcmlseVxuICogaGF2aW5nIHRvIGhhdmUgYSBNYXRyaXhDaGF0IG9iamVjdFxuICovXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1QZWcge1xuICAgIHBsYXRmb3JtOiBCYXNlUGxhdGZvcm0gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBQbGF0Zm9ybSBvYmplY3QgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAgICAgKiBUaGlzIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBhIGNsYXNzIGV4dGVuZGluZyBCYXNlUGxhdGZvcm0uXG4gICAgICovXG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjdXJyZW50IHBsYXRmb3JtIGhhbmRsZXIgb2JqZWN0IHRvIHVzZSBmb3IgdGhlXG4gICAgICogYXBwbGljYXRpb24uXG4gICAgICogVGhpcyBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgYSBjbGFzcyBleHRlbmRpbmcgQmFzZVBsYXRmb3JtLlxuICAgICAqL1xuICAgIHNldChwbGFmOiBCYXNlUGxhdGZvcm0pIHtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybSA9IHBsYWY7XG4gICAgfVxufVxuXG5pZiAoIXdpbmRvdy5teFBsYXRmb3JtUGVnKSB7XG4gICAgd2luZG93Lm14UGxhdGZvcm1QZWcgPSBuZXcgUGxhdGZvcm1QZWcoKTtcbn1cbmV4cG9ydCBkZWZhdWx0IHdpbmRvdy5teFBsYXRmb3JtUGVnO1xuIl19