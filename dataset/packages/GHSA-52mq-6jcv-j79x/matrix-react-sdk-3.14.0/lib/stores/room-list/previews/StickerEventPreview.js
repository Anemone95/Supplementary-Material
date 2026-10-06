"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StickerEventPreview = void 0;

var _utils = require("./utils");

var _languageHandler = require("../../../languageHandler");

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
class StickerEventPreview
/*:: implements IPreview*/
{
  getTextFor(event
  /*: MatrixEvent*/
  , tagId
  /*: TagID*/
  )
  /*: string*/
  {
    const stickerName = event.getContent()['body'];
    if (!stickerName) return null;

    if ((0, _utils.isSelf)(event) || !(0, _utils.shouldPrefixMessagesIn)(event.getRoomId(), tagId)) {
      return stickerName;
    } else {
      return (0, _languageHandler._t)("%(senderName)s: %(stickerName)s", {
        senderName: (0, _utils.getSenderName)(event),
        stickerName
      });
    }
  }

}

exports.StickerEventPreview = StickerEventPreview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L3ByZXZpZXdzL1N0aWNrZXJFdmVudFByZXZpZXcudHMiXSwibmFtZXMiOlsiU3RpY2tlckV2ZW50UHJldmlldyIsImdldFRleHRGb3IiLCJldmVudCIsInRhZ0lkIiwic3RpY2tlck5hbWUiLCJnZXRDb250ZW50IiwiZ2V0Um9vbUlkIiwic2VuZGVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQW1CQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUU8sTUFBTUE7QUFBTjtBQUE4QztBQUMxQ0MsRUFBQUEsVUFBUCxDQUFrQkM7QUFBbEI7QUFBQSxJQUFzQ0M7QUFBdEM7QUFBQTtBQUFBO0FBQTZEO0FBQ3pELFVBQU1DLFdBQVcsR0FBR0YsS0FBSyxDQUFDRyxVQUFOLEdBQW1CLE1BQW5CLENBQXBCO0FBQ0EsUUFBSSxDQUFDRCxXQUFMLEVBQWtCLE9BQU8sSUFBUDs7QUFFbEIsUUFBSSxtQkFBT0YsS0FBUCxLQUFpQixDQUFDLG1DQUF1QkEsS0FBSyxDQUFDSSxTQUFOLEVBQXZCLEVBQTBDSCxLQUExQyxDQUF0QixFQUF3RTtBQUNwRSxhQUFPQyxXQUFQO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsYUFBTyx5QkFBRyxpQ0FBSCxFQUFzQztBQUFDRyxRQUFBQSxVQUFVLEVBQUUsMEJBQWNMLEtBQWQsQ0FBYjtBQUFtQ0UsUUFBQUE7QUFBbkMsT0FBdEMsQ0FBUDtBQUNIO0FBQ0o7O0FBVmdEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgSVByZXZpZXcgfSBmcm9tIFwiLi9JUHJldmlld1wiO1xuaW1wb3J0IHsgVGFnSUQgfSBmcm9tIFwiLi4vbW9kZWxzXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IGdldFNlbmRlck5hbWUsIGlzU2VsZiwgc2hvdWxkUHJlZml4TWVzc2FnZXNJbiB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcblxuZXhwb3J0IGNsYXNzIFN0aWNrZXJFdmVudFByZXZpZXcgaW1wbGVtZW50cyBJUHJldmlldyB7XG4gICAgcHVibGljIGdldFRleHRGb3IoZXZlbnQ6IE1hdHJpeEV2ZW50LCB0YWdJZD86IFRhZ0lEKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3Qgc3RpY2tlck5hbWUgPSBldmVudC5nZXRDb250ZW50KClbJ2JvZHknXTtcbiAgICAgICAgaWYgKCFzdGlja2VyTmFtZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKGlzU2VsZihldmVudCkgfHwgIXNob3VsZFByZWZpeE1lc3NhZ2VzSW4oZXZlbnQuZ2V0Um9vbUlkKCksIHRhZ0lkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0aWNrZXJOYW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXM6ICUoc3RpY2tlck5hbWUpc1wiLCB7c2VuZGVyTmFtZTogZ2V0U2VuZGVyTmFtZShldmVudCksIHN0aWNrZXJOYW1lfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=