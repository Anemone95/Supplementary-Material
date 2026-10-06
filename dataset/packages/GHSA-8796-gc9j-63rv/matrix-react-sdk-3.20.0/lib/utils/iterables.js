"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.iterableUnion = iterableUnion;
exports.iterableDiff = iterableDiff;

var _arrays = require("./arrays");

/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function iterableUnion
/*:: <T>*/
(a
/*: Iterable<T>*/
, b
/*: Iterable<T>*/
)
/*: Iterable<T>*/
{
  return (0, _arrays.arrayUnion)(Array.from(a), Array.from(b));
}

function iterableDiff
/*:: <T>*/
(a
/*: Iterable<T>*/
, b
/*: Iterable<T>*/
)
/*: { added: Iterable<T>, removed: Iterable<T> }*/
{
  return (0, _arrays.arrayDiff)(Array.from(a), Array.from(b));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9pdGVyYWJsZXMudHMiXSwibmFtZXMiOlsiaXRlcmFibGVVbmlvbiIsImEiLCJiIiwiQXJyYXkiLCJmcm9tIiwiaXRlcmFibGVEaWZmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQWdCQTs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSU8sU0FBU0E7QUFBVDtBQUFBLENBQTBCQztBQUExQjtBQUFBLEVBQTBDQztBQUExQztBQUFBO0FBQUE7QUFBdUU7QUFDMUUsU0FBTyx3QkFBV0MsS0FBSyxDQUFDQyxJQUFOLENBQVdILENBQVgsQ0FBWCxFQUEwQkUsS0FBSyxDQUFDQyxJQUFOLENBQVdGLENBQVgsQ0FBMUIsQ0FBUDtBQUNIOztBQUVNLFNBQVNHO0FBQVQ7QUFBQSxDQUF5Qko7QUFBekI7QUFBQSxFQUF5Q0M7QUFBekM7QUFBQTtBQUFBO0FBQXVHO0FBQzFHLFNBQU8sdUJBQVVDLEtBQUssQ0FBQ0MsSUFBTixDQUFXSCxDQUFYLENBQVYsRUFBeUJFLEtBQUssQ0FBQ0MsSUFBTixDQUFXRixDQUFYLENBQXpCLENBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgYXJyYXlEaWZmLCBhcnJheVVuaW9uIH0gZnJvbSBcIi4vYXJyYXlzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBpdGVyYWJsZVVuaW9uPFQ+KGE6IEl0ZXJhYmxlPFQ+LCBiOiBJdGVyYWJsZTxUPik6IEl0ZXJhYmxlPFQ+IHtcbiAgICByZXR1cm4gYXJyYXlVbmlvbihBcnJheS5mcm9tKGEpLCBBcnJheS5mcm9tKGIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhYmxlRGlmZjxUPihhOiBJdGVyYWJsZTxUPiwgYjogSXRlcmFibGU8VD4pOiB7IGFkZGVkOiBJdGVyYWJsZTxUPiwgcmVtb3ZlZDogSXRlcmFibGU8VD4gfSB7XG4gICAgcmV0dXJuIGFycmF5RGlmZihBcnJheS5mcm9tKGEpLCBBcnJheS5mcm9tKGIpKTtcbn1cbiJdfQ==