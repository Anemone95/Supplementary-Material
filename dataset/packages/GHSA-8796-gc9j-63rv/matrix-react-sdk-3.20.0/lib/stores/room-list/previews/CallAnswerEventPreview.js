"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallAnswerEventPreview = void 0;

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
class CallAnswerEventPreview
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
        return (0, _languageHandler._t)("You joined the call");
      } else {
        return (0, _languageHandler._t)("%(senderName)s joined the call", {
          senderName: (0, _utils.getSenderName)(event)
        });
      }
    } else {
      return (0, _languageHandler._t)("Call in progress");
    }
  }

}

exports.CallAnswerEventPreview = CallAnswerEventPreview;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L3ByZXZpZXdzL0NhbGxBbnN3ZXJFdmVudFByZXZpZXcudHMiXSwibmFtZXMiOlsiQ2FsbEFuc3dlckV2ZW50UHJldmlldyIsImdldFRleHRGb3IiLCJldmVudCIsInRhZ0lkIiwiZ2V0Um9vbUlkIiwic2VuZGVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQW1CQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUU8sTUFBTUE7QUFBTjtBQUFpRDtBQUM3Q0MsRUFBQUEsVUFBUCxDQUFrQkM7QUFBbEI7QUFBQSxJQUFzQ0M7QUFBdEM7QUFBQTtBQUFBO0FBQTZEO0FBQ3pELFFBQUksbUNBQXVCRCxLQUFLLENBQUNFLFNBQU4sRUFBdkIsRUFBMENELEtBQTFDLENBQUosRUFBc0Q7QUFDbEQsVUFBSSxtQkFBT0QsS0FBUCxDQUFKLEVBQW1CO0FBQ2YsZUFBTyx5QkFBRyxxQkFBSCxDQUFQO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsZUFBTyx5QkFBRyxnQ0FBSCxFQUFxQztBQUFDRyxVQUFBQSxVQUFVLEVBQUUsMEJBQWNILEtBQWQ7QUFBYixTQUFyQyxDQUFQO0FBQ0g7QUFDSixLQU5ELE1BTU87QUFDSCxhQUFPLHlCQUFHLGtCQUFILENBQVA7QUFDSDtBQUNKOztBQVhtRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IElQcmV2aWV3IH0gZnJvbSBcIi4vSVByZXZpZXdcIjtcbmltcG9ydCB7IFRhZ0lEIH0gZnJvbSBcIi4uL21vZGVsc1wiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBnZXRTZW5kZXJOYW1lLCBpc1NlbGYsIHNob3VsZFByZWZpeE1lc3NhZ2VzSW4gfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBDYWxsQW5zd2VyRXZlbnRQcmV2aWV3IGltcGxlbWVudHMgSVByZXZpZXcge1xuICAgIHB1YmxpYyBnZXRUZXh0Rm9yKGV2ZW50OiBNYXRyaXhFdmVudCwgdGFnSWQ/OiBUYWdJRCk6IHN0cmluZyB7XG4gICAgICAgIGlmIChzaG91bGRQcmVmaXhNZXNzYWdlc0luKGV2ZW50LmdldFJvb21JZCgpLCB0YWdJZCkpIHtcbiAgICAgICAgICAgIGlmIChpc1NlbGYoZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiWW91IGpvaW5lZCB0aGUgY2FsbFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgam9pbmVkIHRoZSBjYWxsXCIsIHtzZW5kZXJOYW1lOiBnZXRTZW5kZXJOYW1lKGV2ZW50KX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiQ2FsbCBpbiBwcm9ncmVzc1wiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==