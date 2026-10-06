"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.levelRoleMap = levelRoleMap;
exports.textualPowerLevel = textualPowerLevel;

var _languageHandler = require("./languageHandler");

/*
Copyright 2017 Vector Creations Ltd

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
function levelRoleMap(usersDefault
/*: number*/
) {
  return {
    undefined: (0, _languageHandler._t)('Default'),
    0: (0, _languageHandler._t)('Restricted'),
    [usersDefault]: (0, _languageHandler._t)('Default'),
    50: (0, _languageHandler._t)('Moderator'),
    100: (0, _languageHandler._t)('Admin')
  };
}

function textualPowerLevel(level
/*: number*/
, usersDefault
/*: number*/
)
/*: string*/
{
  const LEVEL_ROLE_MAP = levelRoleMap(usersDefault);

  if (LEVEL_ROLE_MAP[level]) {
    return LEVEL_ROLE_MAP[level];
  } else {
    return (0, _languageHandler._t)("Custom (%(level)s)", {
      level
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Sb2xlcy50cyJdLCJuYW1lcyI6WyJsZXZlbFJvbGVNYXAiLCJ1c2Vyc0RlZmF1bHQiLCJ1bmRlZmluZWQiLCJ0ZXh0dWFsUG93ZXJMZXZlbCIsImxldmVsIiwiTEVWRUxfUk9MRV9NQVAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJTyxTQUFTQSxZQUFULENBQXNCQztBQUF0QjtBQUFBLEVBQTRDO0FBQy9DLFNBQU87QUFDSEMsSUFBQUEsU0FBUyxFQUFFLHlCQUFHLFNBQUgsQ0FEUjtBQUVILE9BQUcseUJBQUcsWUFBSCxDQUZBO0FBR0gsS0FBQ0QsWUFBRCxHQUFnQix5QkFBRyxTQUFILENBSGI7QUFJSCxRQUFJLHlCQUFHLFdBQUgsQ0FKRDtBQUtILFNBQUsseUJBQUcsT0FBSDtBQUxGLEdBQVA7QUFPSDs7QUFFTSxTQUFTRSxpQkFBVCxDQUEyQkM7QUFBM0I7QUFBQSxFQUEwQ0g7QUFBMUM7QUFBQTtBQUFBO0FBQXdFO0FBQzNFLFFBQU1JLGNBQWMsR0FBR0wsWUFBWSxDQUFDQyxZQUFELENBQW5DOztBQUNBLE1BQUlJLGNBQWMsQ0FBQ0QsS0FBRCxDQUFsQixFQUEyQjtBQUN2QixXQUFPQyxjQUFjLENBQUNELEtBQUQsQ0FBckI7QUFDSCxHQUZELE1BRU87QUFDSCxXQUFPLHlCQUFHLG9CQUFILEVBQXlCO0FBQUNBLE1BQUFBO0FBQUQsS0FBekIsQ0FBUDtBQUNIO0FBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIGxldmVsUm9sZU1hcCh1c2Vyc0RlZmF1bHQ6IG51bWJlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHVuZGVmaW5lZDogX3QoJ0RlZmF1bHQnKSxcbiAgICAgICAgMDogX3QoJ1Jlc3RyaWN0ZWQnKSxcbiAgICAgICAgW3VzZXJzRGVmYXVsdF06IF90KCdEZWZhdWx0JyksXG4gICAgICAgIDUwOiBfdCgnTW9kZXJhdG9yJyksXG4gICAgICAgIDEwMDogX3QoJ0FkbWluJyksXG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRleHR1YWxQb3dlckxldmVsKGxldmVsOiBudW1iZXIsIHVzZXJzRGVmYXVsdDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBMRVZFTF9ST0xFX01BUCA9IGxldmVsUm9sZU1hcCh1c2Vyc0RlZmF1bHQpO1xuICAgIGlmIChMRVZFTF9ST0xFX01BUFtsZXZlbF0pIHtcbiAgICAgICAgcmV0dXJuIExFVkVMX1JPTEVfTUFQW2xldmVsXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX3QoXCJDdXN0b20gKCUobGV2ZWwpcylcIiwge2xldmVsfSk7XG4gICAgfVxufVxuIl19