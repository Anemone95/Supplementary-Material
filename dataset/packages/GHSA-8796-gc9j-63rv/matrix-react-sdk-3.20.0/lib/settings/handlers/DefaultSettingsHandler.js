"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SettingsHandler = _interopRequireDefault(require("./SettingsHandler"));

/*
Copyright 2017 Travis Ralston
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
 * Gets settings at the "default" level. This handler does not support setting values.
 * This handler does not make use of the roomId parameter.
 */
class DefaultSettingsHandler extends _SettingsHandler.default {
  /**
   * Creates a new default settings handler with the given defaults
   * @param {object} defaults The default setting values, keyed by setting name.
   * @param {object} invertedDefaults The default inverted setting values, keyed by setting name.
   */
  constructor(defaults
  /*: Record<string, any>*/
  , invertedDefaults
  /*: Record<string, any>*/
  ) {
    super();
    this.defaults
    /*:: */
    = defaults
    /*:: */
    ;
    this.invertedDefaults
    /*:: */
    = invertedDefaults
    /*:: */
    ;
  }

  getValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  )
  /*: any*/
  {
    let value = this.defaults[settingName];

    if (value === undefined) {
      value = this.invertedDefaults[settingName];
    }

    return value;
  }

  async setValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  , newValue
  /*: any*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Cannot set values on the default level handler");
  }

  canSetValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  ) {
    return false;
  }

  isSupported()
  /*: boolean*/
  {
    return true;
  }

}

exports.default = DefaultSettingsHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXR0aW5ncy9oYW5kbGVycy9EZWZhdWx0U2V0dGluZ3NIYW5kbGVyLnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRTZXR0aW5nc0hhbmRsZXIiLCJTZXR0aW5nc0hhbmRsZXIiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHRzIiwiaW52ZXJ0ZWREZWZhdWx0cyIsImdldFZhbHVlIiwic2V0dGluZ05hbWUiLCJyb29tSWQiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInNldFZhbHVlIiwibmV3VmFsdWUiLCJFcnJvciIsImNhblNldFZhbHVlIiwiaXNTdXBwb3J0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxzQkFBTixTQUFxQ0Msd0JBQXJDLENBQXFEO0FBQ2hFO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsV0FBVyxDQUFTQztBQUFUO0FBQUEsSUFBZ0RDO0FBQWhEO0FBQUEsSUFBdUY7QUFDOUY7QUFEOEYsU0FBOUVEO0FBQThFO0FBQUEsTUFBOUVBO0FBQThFO0FBQUE7QUFBQSxTQUF2Q0M7QUFBdUM7QUFBQSxNQUF2Q0E7QUFBdUM7QUFBQTtBQUVqRzs7QUFFTUMsRUFBQUEsUUFBUCxDQUFnQkM7QUFBaEI7QUFBQSxJQUFxQ0M7QUFBckM7QUFBQTtBQUFBO0FBQTBEO0FBQ3RELFFBQUlDLEtBQUssR0FBRyxLQUFLTCxRQUFMLENBQWNHLFdBQWQsQ0FBWjs7QUFDQSxRQUFJRSxLQUFLLEtBQUtDLFNBQWQsRUFBeUI7QUFDckJELE1BQUFBLEtBQUssR0FBRyxLQUFLSixnQkFBTCxDQUFzQkUsV0FBdEIsQ0FBUjtBQUNIOztBQUNELFdBQU9FLEtBQVA7QUFDSDs7QUFFRCxRQUFhRSxRQUFiLENBQXNCSjtBQUF0QjtBQUFBLElBQTJDQztBQUEzQztBQUFBLElBQTJESTtBQUEzRDtBQUFBO0FBQUE7QUFBeUY7QUFDckYsVUFBTSxJQUFJQyxLQUFKLENBQVUsZ0RBQVYsQ0FBTjtBQUNIOztBQUVNQyxFQUFBQSxXQUFQLENBQW1CUDtBQUFuQjtBQUFBLElBQXdDQztBQUF4QztBQUFBLElBQXdEO0FBQ3BELFdBQU8sS0FBUDtBQUNIOztBQUVNTyxFQUFBQSxXQUFQO0FBQUE7QUFBOEI7QUFDMUIsV0FBTyxJQUFQO0FBQ0g7O0FBNUIrRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL1NldHRpbmdzSGFuZGxlclwiO1xuXG4vKipcbiAqIEdldHMgc2V0dGluZ3MgYXQgdGhlIFwiZGVmYXVsdFwiIGxldmVsLiBUaGlzIGhhbmRsZXIgZG9lcyBub3Qgc3VwcG9ydCBzZXR0aW5nIHZhbHVlcy5cbiAqIFRoaXMgaGFuZGxlciBkb2VzIG5vdCBtYWtlIHVzZSBvZiB0aGUgcm9vbUlkIHBhcmFtZXRlci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmYXVsdFNldHRpbmdzSGFuZGxlciBleHRlbmRzIFNldHRpbmdzSGFuZGxlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBkZWZhdWx0IHNldHRpbmdzIGhhbmRsZXIgd2l0aCB0aGUgZ2l2ZW4gZGVmYXVsdHNcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGVmYXVsdHMgVGhlIGRlZmF1bHQgc2V0dGluZyB2YWx1ZXMsIGtleWVkIGJ5IHNldHRpbmcgbmFtZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gaW52ZXJ0ZWREZWZhdWx0cyBUaGUgZGVmYXVsdCBpbnZlcnRlZCBzZXR0aW5nIHZhbHVlcywga2V5ZWQgYnkgc2V0dGluZyBuYW1lLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVmYXVsdHM6IFJlY29yZDxzdHJpbmcsIGFueT4sIHByaXZhdGUgaW52ZXJ0ZWREZWZhdWx0czogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWYWx1ZShzZXR0aW5nTmFtZTogc3RyaW5nLCByb29tSWQ6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZGVmYXVsdHNbc2V0dGluZ05hbWVdO1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmludmVydGVkRGVmYXVsdHNbc2V0dGluZ05hbWVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0VmFsdWUoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcsIG5ld1ZhbHVlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHNldCB2YWx1ZXMgb24gdGhlIGRlZmF1bHQgbGV2ZWwgaGFuZGxlclwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FuU2V0VmFsdWUoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1N1cHBvcnRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIl19