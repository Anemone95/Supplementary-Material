"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

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
 * A wrapper for a SettingsHandler that performs local echo on
 * changes to settings. This wrapper will use the underlying
 * handler as much as possible to ensure values are not stale.
 */
class LocalEchoWrapper extends _SettingsHandler.default {
  /**
   * Creates a new local echo wrapper
   * @param {SettingsHandler} handler The handler to wrap
   */
  constructor(handler
  /*: SettingsHandler*/
  ) {
    super();
    this.handler
    /*:: */
    = handler
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "cache", {});
  }

  getValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  )
  /*: any*/
  {
    const cacheRoomId = roomId ? roomId : "UNDEFINED"; // avoid weird keys

    const bySetting = this.cache[settingName];

    if (bySetting && bySetting.hasOwnProperty(cacheRoomId)) {
      return bySetting[cacheRoomId];
    }

    return this.handler.getValue(settingName, roomId);
  }

  setValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  , newValue
  /*: any*/
  )
  /*: Promise<void>*/
  {
    if (!this.cache[settingName]) this.cache[settingName] = {};
    const bySetting = this.cache[settingName];
    const cacheRoomId = roomId ? roomId : "UNDEFINED"; // avoid weird keys

    bySetting[cacheRoomId] = newValue;
    const handlerPromise = this.handler.setValue(settingName, roomId, newValue);
    return Promise.resolve(handlerPromise).finally(() => {
      delete bySetting[cacheRoomId];
    });
  }

  canSetValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  )
  /*: boolean*/
  {
    return this.handler.canSetValue(settingName, roomId);
  }

  isSupported()
  /*: boolean*/
  {
    return this.handler.isSupported();
  }

}

exports.default = LocalEchoWrapper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXR0aW5ncy9oYW5kbGVycy9Mb2NhbEVjaG9XcmFwcGVyLnRzIl0sIm5hbWVzIjpbIkxvY2FsRWNob1dyYXBwZXIiLCJTZXR0aW5nc0hhbmRsZXIiLCJjb25zdHJ1Y3RvciIsImhhbmRsZXIiLCJnZXRWYWx1ZSIsInNldHRpbmdOYW1lIiwicm9vbUlkIiwiY2FjaGVSb29tSWQiLCJieVNldHRpbmciLCJjYWNoZSIsImhhc093blByb3BlcnR5Iiwic2V0VmFsdWUiLCJuZXdWYWx1ZSIsImhhbmRsZXJQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJmaW5hbGx5IiwiY2FuU2V0VmFsdWUiLCJpc1N1cHBvcnRlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxnQkFBTixTQUErQkMsd0JBQS9CLENBQStDO0FBTzFEO0FBQ0o7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLFdBQVcsQ0FBU0M7QUFBVDtBQUFBLElBQW1DO0FBQzFDO0FBRDBDLFNBQTFCQTtBQUEwQjtBQUFBLE1BQTFCQTtBQUEwQjtBQUFBO0FBQUEsaURBTjFDLEVBTTBDO0FBRTdDOztBQUVNQyxFQUFBQSxRQUFQLENBQWdCQztBQUFoQjtBQUFBLElBQXFDQztBQUFyQztBQUFBO0FBQUE7QUFBMEQ7QUFDdEQsVUFBTUMsV0FBVyxHQUFHRCxNQUFNLEdBQUdBLE1BQUgsR0FBWSxXQUF0QyxDQURzRCxDQUNIOztBQUNuRCxVQUFNRSxTQUFTLEdBQUcsS0FBS0MsS0FBTCxDQUFXSixXQUFYLENBQWxCOztBQUNBLFFBQUlHLFNBQVMsSUFBSUEsU0FBUyxDQUFDRSxjQUFWLENBQXlCSCxXQUF6QixDQUFqQixFQUF3RDtBQUNwRCxhQUFPQyxTQUFTLENBQUNELFdBQUQsQ0FBaEI7QUFDSDs7QUFFRCxXQUFPLEtBQUtKLE9BQUwsQ0FBYUMsUUFBYixDQUFzQkMsV0FBdEIsRUFBbUNDLE1BQW5DLENBQVA7QUFDSDs7QUFFTUssRUFBQUEsUUFBUCxDQUFnQk47QUFBaEI7QUFBQSxJQUFxQ0M7QUFBckM7QUFBQSxJQUFxRE07QUFBckQ7QUFBQTtBQUFBO0FBQW1GO0FBQy9FLFFBQUksQ0FBQyxLQUFLSCxLQUFMLENBQVdKLFdBQVgsQ0FBTCxFQUE4QixLQUFLSSxLQUFMLENBQVdKLFdBQVgsSUFBMEIsRUFBMUI7QUFDOUIsVUFBTUcsU0FBUyxHQUFHLEtBQUtDLEtBQUwsQ0FBV0osV0FBWCxDQUFsQjtBQUVBLFVBQU1FLFdBQVcsR0FBR0QsTUFBTSxHQUFHQSxNQUFILEdBQVksV0FBdEMsQ0FKK0UsQ0FJNUI7O0FBQ25ERSxJQUFBQSxTQUFTLENBQUNELFdBQUQsQ0FBVCxHQUF5QkssUUFBekI7QUFFQSxVQUFNQyxjQUFjLEdBQUcsS0FBS1YsT0FBTCxDQUFhUSxRQUFiLENBQXNCTixXQUF0QixFQUFtQ0MsTUFBbkMsRUFBMkNNLFFBQTNDLENBQXZCO0FBQ0EsV0FBT0UsT0FBTyxDQUFDQyxPQUFSLENBQWdCRixjQUFoQixFQUFnQ0csT0FBaEMsQ0FBd0MsTUFBTTtBQUNqRCxhQUFPUixTQUFTLENBQUNELFdBQUQsQ0FBaEI7QUFDSCxLQUZNLENBQVA7QUFHSDs7QUFFTVUsRUFBQUEsV0FBUCxDQUFtQlo7QUFBbkI7QUFBQSxJQUF3Q0M7QUFBeEM7QUFBQTtBQUFBO0FBQWlFO0FBQzdELFdBQU8sS0FBS0gsT0FBTCxDQUFhYyxXQUFiLENBQXlCWixXQUF6QixFQUFzQ0MsTUFBdEMsQ0FBUDtBQUNIOztBQUVNWSxFQUFBQSxXQUFQO0FBQUE7QUFBOEI7QUFDMUIsV0FBTyxLQUFLZixPQUFMLENBQWFlLFdBQWIsRUFBUDtBQUNIOztBQTVDeUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVHJhdmlzIFJhbHN0b25cbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFNldHRpbmdzSGFuZGxlciBmcm9tIFwiLi9TZXR0aW5nc0hhbmRsZXJcIjtcblxuLyoqXG4gKiBBIHdyYXBwZXIgZm9yIGEgU2V0dGluZ3NIYW5kbGVyIHRoYXQgcGVyZm9ybXMgbG9jYWwgZWNobyBvblxuICogY2hhbmdlcyB0byBzZXR0aW5ncy4gVGhpcyB3cmFwcGVyIHdpbGwgdXNlIHRoZSB1bmRlcmx5aW5nXG4gKiBoYW5kbGVyIGFzIG11Y2ggYXMgcG9zc2libGUgdG8gZW5zdXJlIHZhbHVlcyBhcmUgbm90IHN0YWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NhbEVjaG9XcmFwcGVyIGV4dGVuZHMgU2V0dGluZ3NIYW5kbGVyIHtcbiAgICBwcml2YXRlIGNhY2hlOiB7XG4gICAgICAgIFtzZXR0aW5nTmFtZTogc3RyaW5nXToge1xuICAgICAgICAgICAgW3Jvb21JZDogc3RyaW5nXTogYW55O1xuICAgICAgICB9O1xuICAgIH0gPSB7fTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgbG9jYWwgZWNobyB3cmFwcGVyXG4gICAgICogQHBhcmFtIHtTZXR0aW5nc0hhbmRsZXJ9IGhhbmRsZXIgVGhlIGhhbmRsZXIgdG8gd3JhcFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaGFuZGxlcjogU2V0dGluZ3NIYW5kbGVyKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFZhbHVlKHNldHRpbmdOYW1lOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3QgY2FjaGVSb29tSWQgPSByb29tSWQgPyByb29tSWQgOiBcIlVOREVGSU5FRFwiOyAvLyBhdm9pZCB3ZWlyZCBrZXlzXG4gICAgICAgIGNvbnN0IGJ5U2V0dGluZyA9IHRoaXMuY2FjaGVbc2V0dGluZ05hbWVdO1xuICAgICAgICBpZiAoYnlTZXR0aW5nICYmIGJ5U2V0dGluZy5oYXNPd25Qcm9wZXJ0eShjYWNoZVJvb21JZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBieVNldHRpbmdbY2FjaGVSb29tSWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlci5nZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VmFsdWUoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcsIG5ld1ZhbHVlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNhY2hlW3NldHRpbmdOYW1lXSkgdGhpcy5jYWNoZVtzZXR0aW5nTmFtZV0gPSB7fTtcbiAgICAgICAgY29uc3QgYnlTZXR0aW5nID0gdGhpcy5jYWNoZVtzZXR0aW5nTmFtZV07XG5cbiAgICAgICAgY29uc3QgY2FjaGVSb29tSWQgPSByb29tSWQgPyByb29tSWQgOiBcIlVOREVGSU5FRFwiOyAvLyBhdm9pZCB3ZWlyZCBrZXlzXG4gICAgICAgIGJ5U2V0dGluZ1tjYWNoZVJvb21JZF0gPSBuZXdWYWx1ZTtcblxuICAgICAgICBjb25zdCBoYW5kbGVyUHJvbWlzZSA9IHRoaXMuaGFuZGxlci5zZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaGFuZGxlclByb21pc2UpLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIGJ5U2V0dGluZ1tjYWNoZVJvb21JZF07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5TZXRWYWx1ZShzZXR0aW5nTmFtZTogc3RyaW5nLCByb29tSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmNhblNldFZhbHVlKHNldHRpbmdOYW1lLCByb29tSWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1N1cHBvcnRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlci5pc1N1cHBvcnRlZCgpO1xuICAgIH1cbn1cbiJdfQ==