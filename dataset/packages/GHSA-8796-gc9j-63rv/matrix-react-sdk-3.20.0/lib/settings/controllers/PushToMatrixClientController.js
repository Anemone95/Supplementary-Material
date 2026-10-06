"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _SettingController = _interopRequireDefault(require("./SettingController"));

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
 * When the value changes, call a setter function on the matrix client with the new value
 */
class PushToMatrixClientController extends _SettingController.default {
  constructor(setter
  /*: Function*/
  , inverse
  /*: boolean*/
  ) {
    super();
    this.setter
    /*:: */
    = setter
    /*:: */
    ;
    this.inverse
    /*:: */
    = inverse
    /*:: */
    ;
  }

  onChange(level
  /*: SettingLevel*/
  , roomId
  /*: string*/
  , newValue
  /*: any*/
  ) {
    // XXX does this work? This surely isn't necessarily the effective value,
    // but it's what NotificationsEnabledController does...
    this.setter.call(_MatrixClientPeg.MatrixClientPeg.get(), this.inverse ? !newValue : newValue);
  }

}

exports.default = PushToMatrixClientController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXR0aW5ncy9jb250cm9sbGVycy9QdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbIlB1c2hUb01hdHJpeENsaWVudENvbnRyb2xsZXIiLCJTZXR0aW5nQ29udHJvbGxlciIsImNvbnN0cnVjdG9yIiwic2V0dGVyIiwiaW52ZXJzZSIsIm9uQ2hhbmdlIiwibGV2ZWwiLCJyb29tSWQiLCJuZXdWYWx1ZSIsImNhbGwiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQU1BO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLDRCQUFOLFNBQTJDQywwQkFBM0MsQ0FBNkQ7QUFDeEVDLEVBQUFBLFdBQVcsQ0FBU0M7QUFBVDtBQUFBLElBQW1DQztBQUFuQztBQUFBLElBQXFEO0FBQzVEO0FBRDRELFNBQTVDRDtBQUE0QztBQUFBLE1BQTVDQTtBQUE0QztBQUFBO0FBQUEsU0FBbEJDO0FBQWtCO0FBQUEsTUFBbEJBO0FBQWtCO0FBQUE7QUFFL0Q7O0FBRU1DLEVBQUFBLFFBQVAsQ0FBZ0JDO0FBQWhCO0FBQUEsSUFBcUNDO0FBQXJDO0FBQUEsSUFBcURDO0FBQXJEO0FBQUEsSUFBb0U7QUFDaEU7QUFDQTtBQUNBLFNBQUtMLE1BQUwsQ0FBWU0sSUFBWixDQUFpQkMsaUNBQWdCQyxHQUFoQixFQUFqQixFQUF3QyxLQUFLUCxPQUFMLEdBQWUsQ0FBQ0ksUUFBaEIsR0FBMkJBLFFBQW5FO0FBQ0g7O0FBVHVFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBTZXR0aW5nQ29udHJvbGxlciBmcm9tIFwiLi9TZXR0aW5nQ29udHJvbGxlclwiO1xuXG4vKipcbiAqIFdoZW4gdGhlIHZhbHVlIGNoYW5nZXMsIGNhbGwgYSBzZXR0ZXIgZnVuY3Rpb24gb24gdGhlIG1hdHJpeCBjbGllbnQgd2l0aCB0aGUgbmV3IHZhbHVlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB1c2hUb01hdHJpeENsaWVudENvbnRyb2xsZXIgZXh0ZW5kcyBTZXR0aW5nQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzZXR0ZXI6IEZ1bmN0aW9uLCBwcml2YXRlIGludmVyc2U6IGJvb2xlYW4pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25DaGFuZ2UobGV2ZWw6IFNldHRpbmdMZXZlbCwgcm9vbUlkOiBzdHJpbmcsIG5ld1ZhbHVlOiBhbnkpIHtcbiAgICAgICAgLy8gWFhYIGRvZXMgdGhpcyB3b3JrPyBUaGlzIHN1cmVseSBpc24ndCBuZWNlc3NhcmlseSB0aGUgZWZmZWN0aXZlIHZhbHVlLFxuICAgICAgICAvLyBidXQgaXQncyB3aGF0IE5vdGlmaWNhdGlvbnNFbmFibGVkQ29udHJvbGxlciBkb2VzLi4uXG4gICAgICAgIHRoaXMuc2V0dGVyLmNhbGwoTWF0cml4Q2xpZW50UGVnLmdldCgpLCB0aGlzLmludmVyc2UgPyAhbmV3VmFsdWUgOiBuZXdWYWx1ZSk7XG4gICAgfVxufVxuIl19