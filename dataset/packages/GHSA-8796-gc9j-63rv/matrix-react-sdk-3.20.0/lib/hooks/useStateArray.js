"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStateArray = void 0;

var _react = require("react");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
// Hook to simplify managing state of arrays of a common type
const useStateArray = (initialSize
/*: number*/
, initialState
/*: T | T[]*/
) =>
/*: [T[], (i: number, v: T) => void]*/
{
  const [data, setData] = (0, _react.useState)(() => {
    return Array.isArray(initialState) ? initialState : new Array(initialSize).fill(initialState);
  });
  return [data, (index
  /*: number*/
  , value
  /*: T*/
  ) => setData(data => {
    const copy = [...data];
    copy[index] = value;
    return copy;
  })];
};

exports.useStateArray = useStateArray;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob29rcy91c2VTdGF0ZUFycmF5LnRzIl0sIm5hbWVzIjpbInVzZVN0YXRlQXJyYXkiLCJpbml0aWFsU2l6ZSIsImluaXRpYWxTdGF0ZSIsImRhdGEiLCJzZXREYXRhIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsbCIsImluZGV4IiwidmFsdWUiLCJjb3B5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJQTtBQUNPLE1BQU1BLGFBQWEsR0FBRyxDQUFJQztBQUFKO0FBQUEsRUFBeUJDO0FBQXpCO0FBQUE7QUFBQTtBQUFxRjtBQUM5RyxRQUFNLENBQUNDLElBQUQsRUFBT0MsT0FBUCxJQUFrQixxQkFBYyxNQUFNO0FBQ3hDLFdBQU9DLEtBQUssQ0FBQ0MsT0FBTixDQUFjSixZQUFkLElBQThCQSxZQUE5QixHQUE2QyxJQUFJRyxLQUFKLENBQVVKLFdBQVYsRUFBdUJNLElBQXZCLENBQTRCTCxZQUE1QixDQUFwRDtBQUNILEdBRnVCLENBQXhCO0FBR0EsU0FBTyxDQUFDQyxJQUFELEVBQU8sQ0FBQ0s7QUFBRDtBQUFBLElBQWdCQztBQUFoQjtBQUFBLE9BQTZCTCxPQUFPLENBQUNELElBQUksSUFBSTtBQUN2RCxVQUFNTyxJQUFJLEdBQUcsQ0FBQyxHQUFHUCxJQUFKLENBQWI7QUFDQU8sSUFBQUEsSUFBSSxDQUFDRixLQUFELENBQUosR0FBY0MsS0FBZDtBQUNBLFdBQU9DLElBQVA7QUFDSCxHQUppRCxDQUEzQyxDQUFQO0FBS0gsQ0FUTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7dXNlU3RhdGV9IGZyb20gXCJyZWFjdFwiO1xuXG4vLyBIb29rIHRvIHNpbXBsaWZ5IG1hbmFnaW5nIHN0YXRlIG9mIGFycmF5cyBvZiBhIGNvbW1vbiB0eXBlXG5leHBvcnQgY29uc3QgdXNlU3RhdGVBcnJheSA9IDxUPihpbml0aWFsU2l6ZTogbnVtYmVyLCBpbml0aWFsU3RhdGU6IFQgfCBUW10pOiBbVFtdLCAoaTogbnVtYmVyLCB2OiBUKSA9PiB2b2lkXSA9PiB7XG4gICAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGU8VFtdPigoKSA9PiB7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGluaXRpYWxTdGF0ZSkgPyBpbml0aWFsU3RhdGUgOiBuZXcgQXJyYXkoaW5pdGlhbFNpemUpLmZpbGwoaW5pdGlhbFN0YXRlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2RhdGEsIChpbmRleDogbnVtYmVyLCB2YWx1ZTogVCkgPT4gc2V0RGF0YShkYXRhID0+IHtcbiAgICAgICAgY29uc3QgY29weSA9IFsuLi5kYXRhXTtcbiAgICAgICAgY29weVtpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfSldXG59O1xuIl19