"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationUtils = void 0;

var _types = require("./types");

/*
Copyright 2016 OpenMarket Ltd
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
class NotificationUtils {
  // Encodes a dictionary of {
  //   "notify": true/false,
  //   "sound": string or undefined,
  //   "highlight: true/false,
  // }
  // to a list of push actions.
  static encodeActions(action
  /*: IEncodedActions*/
  ) {
    const notify = action.notify;
    const sound = action.sound;
    const highlight = action.highlight;

    if (notify) {
      const actions
      /*: Action[]*/
      = [_types.Actions.Notify];

      if (sound) {
        actions.push({
          "set_tweak": "sound",
          "value": sound
        });
      }

      if (highlight) {
        actions.push({
          "set_tweak": "highlight"
        });
      } else {
        actions.push({
          "set_tweak": "highlight",
          "value": false
        });
      }

      return actions;
    } else {
      return [_types.Actions.DontNotify];
    }
  } // Decode a list of actions to a dictionary of {
  //   "notify": true/false,
  //   "sound": string or undefined,
  //   "highlight: true/false,
  // }
  // If the actions couldn't be decoded then returns null.


  static decodeActions(actions
  /*: Action[]*/
  )
  /*: IEncodedActions*/
  {
    let notify = false;
    let sound = null;
    let highlight = false;

    for (let i = 0; i < actions.length; ++i) {
      const action = actions[i];

      if (action === _types.Actions.Notify) {
        notify = true;
      } else if (action === _types.Actions.DontNotify) {
        notify = false;
      } else if (typeof action === "object") {
        if (action.set_tweak === "sound") {
          sound = action.value;
        } else if (action.set_tweak === "highlight") {
          highlight = action.value;
        } else {
          // We don't understand this kind of tweak, so give up.
          return null;
        }
      } else {
        // We don't understand this kind of action, so give up.
        return null;
      }
    }

    if (highlight === undefined) {
      // If a highlight tweak is missing a value then it defaults to true.
      highlight = true;
    }

    const result
    /*: IEncodedActions*/
    = {
      notify,
      highlight
    };

    if (sound !== null) {
      result.sound = sound;
    }

    return result;
  }

}

exports.NotificationUtils = NotificationUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub3RpZmljYXRpb25zL05vdGlmaWNhdGlvblV0aWxzLnRzIl0sIm5hbWVzIjpbIk5vdGlmaWNhdGlvblV0aWxzIiwiZW5jb2RlQWN0aW9ucyIsImFjdGlvbiIsIm5vdGlmeSIsInNvdW5kIiwiaGlnaGxpZ2h0IiwiYWN0aW9ucyIsIkFjdGlvbnMiLCJOb3RpZnkiLCJwdXNoIiwiRG9udE5vdGlmeSIsImRlY29kZUFjdGlvbnMiLCJpIiwibGVuZ3RoIiwic2V0X3R3ZWFrIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJyZXN1bHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFpQkE7O0FBakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVU8sTUFBTUEsaUJBQU4sQ0FBd0I7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBT0MsYUFBUCxDQUFxQkM7QUFBckI7QUFBQSxJQUE4QztBQUMxQyxVQUFNQyxNQUFNLEdBQUdELE1BQU0sQ0FBQ0MsTUFBdEI7QUFDQSxVQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0UsS0FBckI7QUFDQSxVQUFNQyxTQUFTLEdBQUdILE1BQU0sQ0FBQ0csU0FBekI7O0FBQ0EsUUFBSUYsTUFBSixFQUFZO0FBQ1IsWUFBTUc7QUFBaUI7QUFBQSxRQUFHLENBQUNDLGVBQVFDLE1BQVQsQ0FBMUI7O0FBQ0EsVUFBSUosS0FBSixFQUFXO0FBQ1BFLFFBQUFBLE9BQU8sQ0FBQ0csSUFBUixDQUFhO0FBQUMsdUJBQWEsT0FBZDtBQUF1QixtQkFBU0w7QUFBaEMsU0FBYjtBQUNIOztBQUNELFVBQUlDLFNBQUosRUFBZTtBQUNYQyxRQUFBQSxPQUFPLENBQUNHLElBQVIsQ0FBYTtBQUFDLHVCQUFhO0FBQWQsU0FBYjtBQUNILE9BRkQsTUFFTztBQUNISCxRQUFBQSxPQUFPLENBQUNHLElBQVIsQ0FBYTtBQUFDLHVCQUFhLFdBQWQ7QUFBMkIsbUJBQVM7QUFBcEMsU0FBYjtBQUNIOztBQUNELGFBQU9ILE9BQVA7QUFDSCxLQVhELE1BV087QUFDSCxhQUFPLENBQUNDLGVBQVFHLFVBQVQsQ0FBUDtBQUNIO0FBQ0osR0F6QjBCLENBMkIzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFNBQU9DLGFBQVAsQ0FBcUJMO0FBQXJCO0FBQUE7QUFBQTtBQUF5RDtBQUNyRCxRQUFJSCxNQUFNLEdBQUcsS0FBYjtBQUNBLFFBQUlDLEtBQUssR0FBRyxJQUFaO0FBQ0EsUUFBSUMsU0FBUyxHQUFHLEtBQWhCOztBQUVBLFNBQUssSUFBSU8sQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR04sT0FBTyxDQUFDTyxNQUE1QixFQUFvQyxFQUFFRCxDQUF0QyxFQUF5QztBQUNyQyxZQUFNVixNQUFNLEdBQUdJLE9BQU8sQ0FBQ00sQ0FBRCxDQUF0Qjs7QUFDQSxVQUFJVixNQUFNLEtBQUtLLGVBQVFDLE1BQXZCLEVBQStCO0FBQzNCTCxRQUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNILE9BRkQsTUFFTyxJQUFJRCxNQUFNLEtBQUtLLGVBQVFHLFVBQXZCLEVBQW1DO0FBQ3RDUCxRQUFBQSxNQUFNLEdBQUcsS0FBVDtBQUNILE9BRk0sTUFFQSxJQUFJLE9BQU9ELE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDbkMsWUFBSUEsTUFBTSxDQUFDWSxTQUFQLEtBQXFCLE9BQXpCLEVBQWtDO0FBQzlCVixVQUFBQSxLQUFLLEdBQUdGLE1BQU0sQ0FBQ2EsS0FBZjtBQUNILFNBRkQsTUFFTyxJQUFJYixNQUFNLENBQUNZLFNBQVAsS0FBcUIsV0FBekIsRUFBc0M7QUFDekNULFVBQUFBLFNBQVMsR0FBR0gsTUFBTSxDQUFDYSxLQUFuQjtBQUNILFNBRk0sTUFFQTtBQUNIO0FBQ0EsaUJBQU8sSUFBUDtBQUNIO0FBQ0osT0FUTSxNQVNBO0FBQ0g7QUFDQSxlQUFPLElBQVA7QUFDSDtBQUNKOztBQUVELFFBQUlWLFNBQVMsS0FBS1csU0FBbEIsRUFBNkI7QUFDekI7QUFDQVgsTUFBQUEsU0FBUyxHQUFHLElBQVo7QUFDSDs7QUFFRCxVQUFNWTtBQUF1QjtBQUFBLE1BQUc7QUFBRWQsTUFBQUEsTUFBRjtBQUFVRSxNQUFBQTtBQUFWLEtBQWhDOztBQUNBLFFBQUlELEtBQUssS0FBSyxJQUFkLEVBQW9CO0FBQ2hCYSxNQUFBQSxNQUFNLENBQUNiLEtBQVAsR0FBZUEsS0FBZjtBQUNIOztBQUNELFdBQU9hLE1BQVA7QUFDSDs7QUFyRTBCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7QWN0aW9uLCBBY3Rpb25zfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5pbnRlcmZhY2UgSUVuY29kZWRBY3Rpb25zIHtcbiAgICBub3RpZnk6IGJvb2xlYW47XG4gICAgc291bmQ/OiBzdHJpbmc7XG4gICAgaGlnaGxpZ2h0PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIE5vdGlmaWNhdGlvblV0aWxzIHtcbiAgICAvLyBFbmNvZGVzIGEgZGljdGlvbmFyeSBvZiB7XG4gICAgLy8gICBcIm5vdGlmeVwiOiB0cnVlL2ZhbHNlLFxuICAgIC8vICAgXCJzb3VuZFwiOiBzdHJpbmcgb3IgdW5kZWZpbmVkLFxuICAgIC8vICAgXCJoaWdobGlnaHQ6IHRydWUvZmFsc2UsXG4gICAgLy8gfVxuICAgIC8vIHRvIGEgbGlzdCBvZiBwdXNoIGFjdGlvbnMuXG4gICAgc3RhdGljIGVuY29kZUFjdGlvbnMoYWN0aW9uOiBJRW5jb2RlZEFjdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgbm90aWZ5ID0gYWN0aW9uLm5vdGlmeTtcbiAgICAgICAgY29uc3Qgc291bmQgPSBhY3Rpb24uc291bmQ7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IGFjdGlvbi5oaWdobGlnaHQ7XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbnM6IEFjdGlvbltdID0gW0FjdGlvbnMuTm90aWZ5XTtcbiAgICAgICAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaCh7XCJzZXRfdHdlYWtcIjogXCJzb3VuZFwiLCBcInZhbHVlXCI6IHNvdW5kfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICAgICAgYWN0aW9ucy5wdXNoKHtcInNldF90d2Vha1wiOiBcImhpZ2hsaWdodFwifSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaCh7XCJzZXRfdHdlYWtcIjogXCJoaWdobGlnaHRcIiwgXCJ2YWx1ZVwiOiBmYWxzZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW0FjdGlvbnMuRG9udE5vdGlmeV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWNvZGUgYSBsaXN0IG9mIGFjdGlvbnMgdG8gYSBkaWN0aW9uYXJ5IG9mIHtcbiAgICAvLyAgIFwibm90aWZ5XCI6IHRydWUvZmFsc2UsXG4gICAgLy8gICBcInNvdW5kXCI6IHN0cmluZyBvciB1bmRlZmluZWQsXG4gICAgLy8gICBcImhpZ2hsaWdodDogdHJ1ZS9mYWxzZSxcbiAgICAvLyB9XG4gICAgLy8gSWYgdGhlIGFjdGlvbnMgY291bGRuJ3QgYmUgZGVjb2RlZCB0aGVuIHJldHVybnMgbnVsbC5cbiAgICBzdGF0aWMgZGVjb2RlQWN0aW9ucyhhY3Rpb25zOiBBY3Rpb25bXSk6IElFbmNvZGVkQWN0aW9ucyB7XG4gICAgICAgIGxldCBub3RpZnkgPSBmYWxzZTtcbiAgICAgICAgbGV0IHNvdW5kID0gbnVsbDtcbiAgICAgICAgbGV0IGhpZ2hsaWdodCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gYWN0aW9uc1tpXTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09IEFjdGlvbnMuTm90aWZ5KSB7XG4gICAgICAgICAgICAgICAgbm90aWZ5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSBBY3Rpb25zLkRvbnROb3RpZnkpIHtcbiAgICAgICAgICAgICAgICBub3RpZnkgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGlmIChhY3Rpb24uc2V0X3R3ZWFrID09PSBcInNvdW5kXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc291bmQgPSBhY3Rpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24uc2V0X3R3ZWFrID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodCA9IGFjdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBkb24ndCB1bmRlcnN0YW5kIHRoaXMga2luZCBvZiB0d2Vhaywgc28gZ2l2ZSB1cC5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBkb24ndCB1bmRlcnN0YW5kIHRoaXMga2luZCBvZiBhY3Rpb24sIHNvIGdpdmUgdXAuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGlnaGxpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIElmIGEgaGlnaGxpZ2h0IHR3ZWFrIGlzIG1pc3NpbmcgYSB2YWx1ZSB0aGVuIGl0IGRlZmF1bHRzIHRvIHRydWUuXG4gICAgICAgICAgICBoaWdobGlnaHQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0OiBJRW5jb2RlZEFjdGlvbnMgPSB7IG5vdGlmeSwgaGlnaGxpZ2h0IH07XG4gICAgICAgIGlmIChzb3VuZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0LnNvdW5kID0gc291bmQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG4iXX0=