"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallHangupEvent = void 0;

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
class CallHangupEvent
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
        return (0, _languageHandler._t)("You ended the call");
      } else {
        return (0, _languageHandler._t)("%(senderName)s ended the call", {
          senderName: (0, _utils.getSenderName)(event)
        });
      }
    } else {
      return (0, _languageHandler._t)("Call ended");
    }
  }

}

exports.CallHangupEvent = CallHangupEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L3ByZXZpZXdzL0NhbGxIYW5ndXBFdmVudC50cyJdLCJuYW1lcyI6WyJDYWxsSGFuZ3VwRXZlbnQiLCJnZXRUZXh0Rm9yIiwiZXZlbnQiLCJ0YWdJZCIsImdldFJvb21JZCIsInNlbmRlck5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFPLE1BQU1BO0FBQU47QUFBMEM7QUFDdENDLEVBQUFBLFVBQVAsQ0FBa0JDO0FBQWxCO0FBQUEsSUFBc0NDO0FBQXRDO0FBQUE7QUFBQTtBQUE2RDtBQUN6RCxRQUFJLG1DQUF1QkQsS0FBSyxDQUFDRSxTQUFOLEVBQXZCLEVBQTBDRCxLQUExQyxDQUFKLEVBQXNEO0FBQ2xELFVBQUksbUJBQU9ELEtBQVAsQ0FBSixFQUFtQjtBQUNmLGVBQU8seUJBQUcsb0JBQUgsQ0FBUDtBQUNILE9BRkQsTUFFTztBQUNILGVBQU8seUJBQUcsK0JBQUgsRUFBb0M7QUFBQ0csVUFBQUEsVUFBVSxFQUFFLDBCQUFjSCxLQUFkO0FBQWIsU0FBcEMsQ0FBUDtBQUNIO0FBQ0osS0FORCxNQU1PO0FBQ0gsYUFBTyx5QkFBRyxZQUFILENBQVA7QUFDSDtBQUNKOztBQVg0QyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IElQcmV2aWV3IH0gZnJvbSBcIi4vSVByZXZpZXdcIjtcbmltcG9ydCB7IFRhZ0lEIH0gZnJvbSBcIi4uL21vZGVsc1wiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBnZXRTZW5kZXJOYW1lLCBpc1NlbGYsIHNob3VsZFByZWZpeE1lc3NhZ2VzSW4gfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBDYWxsSGFuZ3VwRXZlbnQgaW1wbGVtZW50cyBJUHJldmlldyB7XG4gICAgcHVibGljIGdldFRleHRGb3IoZXZlbnQ6IE1hdHJpeEV2ZW50LCB0YWdJZD86IFRhZ0lEKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHNob3VsZFByZWZpeE1lc3NhZ2VzSW4oZXZlbnQuZ2V0Um9vbUlkKCksIHRhZ0lkKSkge1xuICAgICAgICAgICAgaWYgKGlzU2VsZihldmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCJZb3UgZW5kZWQgdGhlIGNhbGxcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIGVuZGVkIHRoZSBjYWxsXCIsIHtzZW5kZXJOYW1lOiBnZXRTZW5kZXJOYW1lKGV2ZW50KX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiQ2FsbCBlbmRlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==