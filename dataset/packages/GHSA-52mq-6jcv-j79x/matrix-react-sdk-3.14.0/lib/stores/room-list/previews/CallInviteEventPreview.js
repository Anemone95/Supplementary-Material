"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallInviteEventPreview = void 0;

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
class CallInviteEventPreview
/*:: implements IPreview*/
{
  getTextFor(event
  /*: MatrixEvent*/
  , tagId
  /*: TagID*/
  )
  /*: string*/
  {
    if ((0, _utils.shouldPrefixMessagesIn)(event.getRoomId(), tagId)) {
      if ((0, _utils.isSelf)(event)) {
        return (0, _languageHandler._t)("You started a call");
      } else {
        return (0, _languageHandler._t)("%(senderName)s started a call", {
          senderName: (0, _utils.getSenderName)(event)
        });
      }
    } else {
      if ((0, _utils.isSelf)(event)) {
        return (0, _languageHandler._t)("Waiting for answer");
      } else {
        return (0, _languageHandler._t)("%(senderName)s is calling", {
          senderName: (0, _utils.getSenderName)(event)
        });
      }
    }
  }

}

exports.CallInviteEventPreview = CallInviteEventPreview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L3ByZXZpZXdzL0NhbGxJbnZpdGVFdmVudFByZXZpZXcudHMiXSwibmFtZXMiOlsiQ2FsbEludml0ZUV2ZW50UHJldmlldyIsImdldFRleHRGb3IiLCJldmVudCIsInRhZ0lkIiwiZ2V0Um9vbUlkIiwic2VuZGVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQW1CQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUU8sTUFBTUE7QUFBTjtBQUFpRDtBQUM3Q0MsRUFBQUEsVUFBUCxDQUFrQkM7QUFBbEI7QUFBQSxJQUFzQ0M7QUFBdEM7QUFBQTtBQUFBO0FBQTZEO0FBQ3pELFFBQUksbUNBQXVCRCxLQUFLLENBQUNFLFNBQU4sRUFBdkIsRUFBMENELEtBQTFDLENBQUosRUFBc0Q7QUFDbEQsVUFBSSxtQkFBT0QsS0FBUCxDQUFKLEVBQW1CO0FBQ2YsZUFBTyx5QkFBRyxvQkFBSCxDQUFQO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsZUFBTyx5QkFBRywrQkFBSCxFQUFvQztBQUFDRyxVQUFBQSxVQUFVLEVBQUUsMEJBQWNILEtBQWQ7QUFBYixTQUFwQyxDQUFQO0FBQ0g7QUFDSixLQU5ELE1BTU87QUFDSCxVQUFJLG1CQUFPQSxLQUFQLENBQUosRUFBbUI7QUFDZixlQUFPLHlCQUFHLG9CQUFILENBQVA7QUFDSCxPQUZELE1BRU87QUFDSCxlQUFPLHlCQUFHLDJCQUFILEVBQWdDO0FBQUNHLFVBQUFBLFVBQVUsRUFBRSwwQkFBY0gsS0FBZDtBQUFiLFNBQWhDLENBQVA7QUFDSDtBQUNKO0FBQ0o7O0FBZm1EIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgSVByZXZpZXcgfSBmcm9tIFwiLi9JUHJldmlld1wiO1xuaW1wb3J0IHsgVGFnSUQgfSBmcm9tIFwiLi4vbW9kZWxzXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IGdldFNlbmRlck5hbWUsIGlzU2VsZiwgc2hvdWxkUHJlZml4TWVzc2FnZXNJbiB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcblxuZXhwb3J0IGNsYXNzIENhbGxJbnZpdGVFdmVudFByZXZpZXcgaW1wbGVtZW50cyBJUHJldmlldyB7XG4gICAgcHVibGljIGdldFRleHRGb3IoZXZlbnQ6IE1hdHJpeEV2ZW50LCB0YWdJZD86IFRhZ0lEKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHNob3VsZFByZWZpeE1lc3NhZ2VzSW4oZXZlbnQuZ2V0Um9vbUlkKCksIHRhZ0lkKSkge1xuICAgICAgICAgICAgaWYgKGlzU2VsZihldmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCJZb3Ugc3RhcnRlZCBhIGNhbGxcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIHN0YXJ0ZWQgYSBjYWxsXCIsIHtzZW5kZXJOYW1lOiBnZXRTZW5kZXJOYW1lKGV2ZW50KX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzU2VsZihldmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCJXYWl0aW5nIGZvciBhbnN3ZXJcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIGlzIGNhbGxpbmdcIiwge3NlbmRlck5hbWU6IGdldFNlbmRlck5hbWUoZXZlbnQpfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=