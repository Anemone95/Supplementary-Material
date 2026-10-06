"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilterPriority = exports.FILTER_CHANGED = void 0;

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
const FILTER_CHANGED = "filter_changed";
exports.FILTER_CHANGED = FILTER_CHANGED;
let FilterPriority;
/**
 * A filter condition for the room list, determining if a room
 * should be shown or not.
 *
 * All filter conditions are expected to be stable executions,
 * meaning that given the same input the same answer will be
 * returned (thus allowing caching). As such, filter conditions
 * can, but shouldn't, do heavier logic and not worry about being
 * called constantly by the room list. When the condition changes
 * such that different inputs lead to different answers (such
 * as a change in the user's input), this emits FILTER_CHANGED.
 */

exports.FilterPriority = FilterPriority;

(function (FilterPriority) {
  FilterPriority[FilterPriority["Lowest"] = 0] = "Lowest";
  FilterPriority[FilterPriority["Highest"] = 1] = "Highest";
})(FilterPriority || (exports.FilterPriority = FilterPriority = {}));
/*:: export interface IFilterCondition extends EventEmitter {
    /**
     * The relative priority that this filter should be applied with.
     * Lower priorities get applied first.
     *-/
    relativePriority: FilterPriority;

    /**
     * Determines if a given room should be visible under this
     * condition.
     * @param room The room to check.
     * @returns True if the room should be visible.
     *-/
    isVisible(room: Room): boolean;
}*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2ZpbHRlcnMvSUZpbHRlckNvbmRpdGlvbi50cyJdLCJuYW1lcyI6WyJGSUxURVJfQ0hBTkdFRCIsIkZpbHRlclByaW9yaXR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS08sTUFBTUEsY0FBYyxHQUFHLGdCQUF2Qjs7SUFFS0MsYztBQU1aO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQWpCWUEsYztBQUFBQSxFQUFBQSxjLENBQUFBLGM7QUFBQUEsRUFBQUEsYyxDQUFBQSxjO0dBQUFBLGMsOEJBQUFBLGM7O0FBckJaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiZXZlbnRzXCI7XG5cbmV4cG9ydCBjb25zdCBGSUxURVJfQ0hBTkdFRCA9IFwiZmlsdGVyX2NoYW5nZWRcIjtcblxuZXhwb3J0IGVudW0gRmlsdGVyUHJpb3JpdHkge1xuICAgIExvd2VzdCxcbiAgICAvLyBpbiB0aGUgbWlkZGxlIHdvdWxkIGJlIExvdywgTm9ybWFsLCBhbmQgSGlnaCBpZiB3ZSBoYWQgYSBuZWVkXG4gICAgSGlnaGVzdCxcbn1cblxuLyoqXG4gKiBBIGZpbHRlciBjb25kaXRpb24gZm9yIHRoZSByb29tIGxpc3QsIGRldGVybWluaW5nIGlmIGEgcm9vbVxuICogc2hvdWxkIGJlIHNob3duIG9yIG5vdC5cbiAqXG4gKiBBbGwgZmlsdGVyIGNvbmRpdGlvbnMgYXJlIGV4cGVjdGVkIHRvIGJlIHN0YWJsZSBleGVjdXRpb25zLFxuICogbWVhbmluZyB0aGF0IGdpdmVuIHRoZSBzYW1lIGlucHV0IHRoZSBzYW1lIGFuc3dlciB3aWxsIGJlXG4gKiByZXR1cm5lZCAodGh1cyBhbGxvd2luZyBjYWNoaW5nKS4gQXMgc3VjaCwgZmlsdGVyIGNvbmRpdGlvbnNcbiAqIGNhbiwgYnV0IHNob3VsZG4ndCwgZG8gaGVhdmllciBsb2dpYyBhbmQgbm90IHdvcnJ5IGFib3V0IGJlaW5nXG4gKiBjYWxsZWQgY29uc3RhbnRseSBieSB0aGUgcm9vbSBsaXN0LiBXaGVuIHRoZSBjb25kaXRpb24gY2hhbmdlc1xuICogc3VjaCB0aGF0IGRpZmZlcmVudCBpbnB1dHMgbGVhZCB0byBkaWZmZXJlbnQgYW5zd2VycyAoc3VjaFxuICogYXMgYSBjaGFuZ2UgaW4gdGhlIHVzZXIncyBpbnB1dCksIHRoaXMgZW1pdHMgRklMVEVSX0NIQU5HRUQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlckNvbmRpdGlvbiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgLyoqXG4gICAgICogVGhlIHJlbGF0aXZlIHByaW9yaXR5IHRoYXQgdGhpcyBmaWx0ZXIgc2hvdWxkIGJlIGFwcGxpZWQgd2l0aC5cbiAgICAgKiBMb3dlciBwcmlvcml0aWVzIGdldCBhcHBsaWVkIGZpcnN0LlxuICAgICAqL1xuICAgIHJlbGF0aXZlUHJpb3JpdHk6IEZpbHRlclByaW9yaXR5O1xuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBpZiBhIGdpdmVuIHJvb20gc2hvdWxkIGJlIHZpc2libGUgdW5kZXIgdGhpc1xuICAgICAqIGNvbmRpdGlvbi5cbiAgICAgKiBAcGFyYW0gcm9vbSBUaGUgcm9vbSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSByb29tIHNob3VsZCBiZSB2aXNpYmxlLlxuICAgICAqL1xuICAgIGlzVmlzaWJsZShyb29tOiBSb29tKTogYm9vbGVhbjtcbn1cbiJdfQ==