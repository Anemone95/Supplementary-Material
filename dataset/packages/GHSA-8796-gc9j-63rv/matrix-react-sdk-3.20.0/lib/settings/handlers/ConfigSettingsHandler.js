"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _SettingsHandler = _interopRequireDefault(require("./SettingsHandler"));

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _utils = require("matrix-js-sdk/src/utils");

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
 * Gets and sets settings at the "config" level. This handler does not make use of the
 * roomId parameter.
 */
class ConfigSettingsHandler extends _SettingsHandler.default {
  constructor(featureNames
  /*: string[]*/
  ) {
    super();
    this.featureNames
    /*:: */
    = featureNames
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
    const config = _SdkConfig.default.get() || {};

    if (this.featureNames.includes(settingName)) {
      const labsConfig = config["features"] || {};
      const val = labsConfig[settingName];
      if ((0, _utils.isNullOrUndefined)(val)) return null; // no definition at this level

      if (val === true || val === false) return val; // new style: mapped as a boolean

      if (val === "enable") return true; // backwards compat

      if (val === "disable") return false; // backwards compat

      if (val === "labs") return null; // backwards compat, no override

      return null; // fallback in the case of invalid input
    } // Special case themes


    if (settingName === "theme") {
      return config["default_theme"];
    }

    const settingsConfig = config["settingDefaults"];
    if (!settingsConfig || (0, _utils.isNullOrUndefined)(settingsConfig[settingName])) return null;
    return settingsConfig[settingName];
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
    throw new Error("Cannot change settings at the config level");
  }

  canSetValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  )
  /*: boolean*/
  {
    return false;
  }

  isSupported()
  /*: boolean*/
  {
    return true; // SdkConfig is always there
  }

}

exports.default = ConfigSettingsHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXR0aW5ncy9oYW5kbGVycy9Db25maWdTZXR0aW5nc0hhbmRsZXIudHMiXSwibmFtZXMiOlsiQ29uZmlnU2V0dGluZ3NIYW5kbGVyIiwiU2V0dGluZ3NIYW5kbGVyIiwiY29uc3RydWN0b3IiLCJmZWF0dXJlTmFtZXMiLCJnZXRWYWx1ZSIsInNldHRpbmdOYW1lIiwicm9vbUlkIiwiY29uZmlnIiwiU2RrQ29uZmlnIiwiZ2V0IiwiaW5jbHVkZXMiLCJsYWJzQ29uZmlnIiwidmFsIiwic2V0dGluZ3NDb25maWciLCJzZXRWYWx1ZSIsIm5ld1ZhbHVlIiwiRXJyb3IiLCJjYW5TZXRWYWx1ZSIsImlzU3VwcG9ydGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEscUJBQU4sU0FBb0NDLHdCQUFwQyxDQUFvRDtBQUN4REMsRUFBQUEsV0FBUCxDQUEyQkM7QUFBM0I7QUFBQSxJQUFtRDtBQUMvQztBQUQrQyxTQUF4QkE7QUFBd0I7QUFBQSxNQUF4QkE7QUFBd0I7QUFBQTtBQUVsRDs7QUFFTUMsRUFBQUEsUUFBUCxDQUFnQkM7QUFBaEI7QUFBQSxJQUFxQ0M7QUFBckM7QUFBQTtBQUFBO0FBQTBEO0FBQ3RELFVBQU1DLE1BQU0sR0FBR0MsbUJBQVVDLEdBQVYsTUFBbUIsRUFBbEM7O0FBRUEsUUFBSSxLQUFLTixZQUFMLENBQWtCTyxRQUFsQixDQUEyQkwsV0FBM0IsQ0FBSixFQUE2QztBQUN6QyxZQUFNTSxVQUFVLEdBQUdKLE1BQU0sQ0FBQyxVQUFELENBQU4sSUFBc0IsRUFBekM7QUFDQSxZQUFNSyxHQUFHLEdBQUdELFVBQVUsQ0FBQ04sV0FBRCxDQUF0QjtBQUNBLFVBQUksOEJBQWtCTyxHQUFsQixDQUFKLEVBQTRCLE9BQU8sSUFBUCxDQUhhLENBR0E7O0FBQ3pDLFVBQUlBLEdBQUcsS0FBSyxJQUFSLElBQWdCQSxHQUFHLEtBQUssS0FBNUIsRUFBbUMsT0FBT0EsR0FBUCxDQUpNLENBSU07O0FBQy9DLFVBQUlBLEdBQUcsS0FBSyxRQUFaLEVBQXNCLE9BQU8sSUFBUCxDQUxtQixDQUtOOztBQUNuQyxVQUFJQSxHQUFHLEtBQUssU0FBWixFQUF1QixPQUFPLEtBQVAsQ0FOa0IsQ0FNSjs7QUFDckMsVUFBSUEsR0FBRyxLQUFLLE1BQVosRUFBb0IsT0FBTyxJQUFQLENBUHFCLENBT1I7O0FBQ2pDLGFBQU8sSUFBUCxDQVJ5QyxDQVE1QjtBQUNoQixLQVpxRCxDQWN0RDs7O0FBQ0EsUUFBSVAsV0FBVyxLQUFLLE9BQXBCLEVBQTZCO0FBQ3pCLGFBQU9FLE1BQU0sQ0FBQyxlQUFELENBQWI7QUFDSDs7QUFFRCxVQUFNTSxjQUFjLEdBQUdOLE1BQU0sQ0FBQyxpQkFBRCxDQUE3QjtBQUNBLFFBQUksQ0FBQ00sY0FBRCxJQUFtQiw4QkFBa0JBLGNBQWMsQ0FBQ1IsV0FBRCxDQUFoQyxDQUF2QixFQUF1RSxPQUFPLElBQVA7QUFDdkUsV0FBT1EsY0FBYyxDQUFDUixXQUFELENBQXJCO0FBQ0g7O0FBRUQsUUFBYVMsUUFBYixDQUFzQlQ7QUFBdEI7QUFBQSxJQUEyQ0M7QUFBM0M7QUFBQSxJQUEyRFM7QUFBM0Q7QUFBQTtBQUFBO0FBQXlGO0FBQ3JGLFVBQU0sSUFBSUMsS0FBSixDQUFVLDRDQUFWLENBQU47QUFDSDs7QUFFTUMsRUFBQUEsV0FBUCxDQUFtQlo7QUFBbkI7QUFBQSxJQUF3Q0M7QUFBeEM7QUFBQTtBQUFBO0FBQWlFO0FBQzdELFdBQU8sS0FBUDtBQUNIOztBQUVNWSxFQUFBQSxXQUFQO0FBQUE7QUFBOEI7QUFDMUIsV0FBTyxJQUFQLENBRDBCLENBQ2I7QUFDaEI7O0FBdkM4RCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL1NldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQge2lzTnVsbE9yVW5kZWZpbmVkfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcblxuLyoqXG4gKiBHZXRzIGFuZCBzZXRzIHNldHRpbmdzIGF0IHRoZSBcImNvbmZpZ1wiIGxldmVsLiBUaGlzIGhhbmRsZXIgZG9lcyBub3QgbWFrZSB1c2Ugb2YgdGhlXG4gKiByb29tSWQgcGFyYW1ldGVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWdTZXR0aW5nc0hhbmRsZXIgZXh0ZW5kcyBTZXR0aW5nc0hhbmRsZXIge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIGZlYXR1cmVOYW1lczogc3RyaW5nW10pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VmFsdWUoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBjb25maWcgPSBTZGtDb25maWcuZ2V0KCkgfHwge307XG5cbiAgICAgICAgaWYgKHRoaXMuZmVhdHVyZU5hbWVzLmluY2x1ZGVzKHNldHRpbmdOYW1lKSkge1xuICAgICAgICAgICAgY29uc3QgbGFic0NvbmZpZyA9IGNvbmZpZ1tcImZlYXR1cmVzXCJdIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgdmFsID0gbGFic0NvbmZpZ1tzZXR0aW5nTmFtZV07XG4gICAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodmFsKSkgcmV0dXJuIG51bGw7IC8vIG5vIGRlZmluaXRpb24gYXQgdGhpcyBsZXZlbFxuICAgICAgICAgICAgaWYgKHZhbCA9PT0gdHJ1ZSB8fCB2YWwgPT09IGZhbHNlKSByZXR1cm4gdmFsOyAvLyBuZXcgc3R5bGU6IG1hcHBlZCBhcyBhIGJvb2xlYW5cbiAgICAgICAgICAgIGlmICh2YWwgPT09IFwiZW5hYmxlXCIpIHJldHVybiB0cnVlOyAvLyBiYWNrd2FyZHMgY29tcGF0XG4gICAgICAgICAgICBpZiAodmFsID09PSBcImRpc2FibGVcIikgcmV0dXJuIGZhbHNlOyAvLyBiYWNrd2FyZHMgY29tcGF0XG4gICAgICAgICAgICBpZiAodmFsID09PSBcImxhYnNcIikgcmV0dXJuIG51bGw7IC8vIGJhY2t3YXJkcyBjb21wYXQsIG5vIG92ZXJyaWRlXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gZmFsbGJhY2sgaW4gdGhlIGNhc2Ugb2YgaW52YWxpZCBpbnB1dFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlIHRoZW1lc1xuICAgICAgICBpZiAoc2V0dGluZ05hbWUgPT09IFwidGhlbWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ1tcImRlZmF1bHRfdGhlbWVcIl07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXR0aW5nc0NvbmZpZyA9IGNvbmZpZ1tcInNldHRpbmdEZWZhdWx0c1wiXTtcbiAgICAgICAgaWYgKCFzZXR0aW5nc0NvbmZpZyB8fCBpc051bGxPclVuZGVmaW5lZChzZXR0aW5nc0NvbmZpZ1tzZXR0aW5nTmFtZV0pKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHNldHRpbmdzQ29uZmlnW3NldHRpbmdOYW1lXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0VmFsdWUoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcsIG5ld1ZhbHVlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNoYW5nZSBzZXR0aW5ncyBhdCB0aGUgY29uZmlnIGxldmVsXCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5TZXRWYWx1ZShzZXR0aW5nTmFtZTogc3RyaW5nLCByb29tSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGlzU3VwcG9ydGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gU2RrQ29uZmlnIGlzIGFsd2F5cyB0aGVyZVxuICAgIH1cbn1cbiJdfQ==