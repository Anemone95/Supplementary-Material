"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultNumber = defaultNumber;
exports.clamp = clamp;
exports.sum = sum;
exports.percentageWithin = percentageWithin;
exports.percentageOf = percentageOf;

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

/**
 * Returns the default number if the given value, i, is not a number. Otherwise
 * returns the given value.
 * @param {*} i The value to check.
 * @param {number} def The default value.
 * @returns {number} Either the value or the default value, whichever is a number.
 */
function defaultNumber(i
/*: unknown*/
, def
/*: number*/
)
/*: number*/
{
  return Number.isFinite(i) ? Number(i) : def;
}

function clamp(i
/*: number*/
, min
/*: number*/
, max
/*: number*/
)
/*: number*/
{
  return Math.min(Math.max(i, min), max);
}

function sum(...i)
/*: number*/
{
  return [...i].reduce((p, c) => c + p, 0);
}

function percentageWithin(pct
/*: number*/
, min
/*: number*/
, max
/*: number*/
)
/*: number*/
{
  return pct * (max - min) + min;
}

function percentageOf(val
/*: number*/
, min
/*: number*/
, max
/*: number*/
)
/*: number*/
{
  return (val - min) / (max - min);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9udW1iZXJzLnRzIl0sIm5hbWVzIjpbImRlZmF1bHROdW1iZXIiLCJpIiwiZGVmIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJjbGFtcCIsIm1pbiIsIm1heCIsIk1hdGgiLCJzdW0iLCJyZWR1Y2UiLCJwIiwiYyIsInBlcmNlbnRhZ2VXaXRoaW4iLCJwY3QiLCJwZXJjZW50YWdlT2YiLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sU0FBU0EsYUFBVCxDQUF1QkM7QUFBdkI7QUFBQSxFQUFtQ0M7QUFBbkM7QUFBQTtBQUFBO0FBQXdEO0FBQzNELFNBQU9DLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkgsQ0FBaEIsSUFBcUJFLE1BQU0sQ0FBQ0YsQ0FBRCxDQUEzQixHQUFpQ0MsR0FBeEM7QUFDSDs7QUFFTSxTQUFTRyxLQUFULENBQWVKO0FBQWY7QUFBQSxFQUEwQks7QUFBMUI7QUFBQSxFQUF1Q0M7QUFBdkM7QUFBQTtBQUFBO0FBQTREO0FBQy9ELFNBQU9DLElBQUksQ0FBQ0YsR0FBTCxDQUFTRSxJQUFJLENBQUNELEdBQUwsQ0FBU04sQ0FBVCxFQUFZSyxHQUFaLENBQVQsRUFBMkJDLEdBQTNCLENBQVA7QUFDSDs7QUFFTSxTQUFTRSxHQUFULENBQWEsR0FBR1IsQ0FBaEI7QUFBQTtBQUFxQztBQUN4QyxTQUFPLENBQUMsR0FBR0EsQ0FBSixFQUFPUyxNQUFQLENBQWMsQ0FBQ0MsQ0FBRCxFQUFJQyxDQUFKLEtBQVVBLENBQUMsR0FBR0QsQ0FBNUIsRUFBK0IsQ0FBL0IsQ0FBUDtBQUNIOztBQUVNLFNBQVNFLGdCQUFULENBQTBCQztBQUExQjtBQUFBLEVBQXVDUjtBQUF2QztBQUFBLEVBQW9EQztBQUFwRDtBQUFBO0FBQUE7QUFBeUU7QUFDNUUsU0FBUU8sR0FBRyxJQUFJUCxHQUFHLEdBQUdELEdBQVYsQ0FBSixHQUFzQkEsR0FBN0I7QUFDSDs7QUFFTSxTQUFTUyxZQUFULENBQXNCQztBQUF0QjtBQUFBLEVBQW1DVjtBQUFuQztBQUFBLEVBQWdEQztBQUFoRDtBQUFBO0FBQUE7QUFBcUU7QUFDeEUsU0FBTyxDQUFDUyxHQUFHLEdBQUdWLEdBQVAsS0FBZUMsR0FBRyxHQUFHRCxHQUFyQixDQUFQO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGRlZmF1bHQgbnVtYmVyIGlmIHRoZSBnaXZlbiB2YWx1ZSwgaSwgaXMgbm90IGEgbnVtYmVyLiBPdGhlcndpc2VcbiAqIHJldHVybnMgdGhlIGdpdmVuIHZhbHVlLlxuICogQHBhcmFtIHsqfSBpIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWYgVGhlIGRlZmF1bHQgdmFsdWUuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBFaXRoZXIgdGhlIHZhbHVlIG9yIHRoZSBkZWZhdWx0IHZhbHVlLCB3aGljaGV2ZXIgaXMgYSBudW1iZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0TnVtYmVyKGk6IHVua25vd24sIGRlZjogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKGkpID8gTnVtYmVyKGkpIDogZGVmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAoaTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChpLCBtaW4pLCBtYXgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VtKC4uLmk6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgICByZXR1cm4gWy4uLmldLnJlZHVjZSgocCwgYykgPT4gYyArIHAsIDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGVyY2VudGFnZVdpdGhpbihwY3Q6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKHBjdCAqIChtYXggLSBtaW4pKSArIG1pbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBlcmNlbnRhZ2VPZih2YWw6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKHZhbCAtIG1pbikgLyAobWF4IC0gbWluKTtcbn1cbiJdfQ==