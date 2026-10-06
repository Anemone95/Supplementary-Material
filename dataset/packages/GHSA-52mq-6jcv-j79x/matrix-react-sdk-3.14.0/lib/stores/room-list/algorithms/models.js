"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListAlgorithm = exports.SortAlgorithm = void 0;

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
let SortAlgorithm;
exports.SortAlgorithm = SortAlgorithm;

(function (SortAlgorithm) {
  SortAlgorithm["Manual"] = "MANUAL";
  SortAlgorithm["Alphabetic"] = "ALPHABETIC";
  SortAlgorithm["Recent"] = "RECENT";
})(SortAlgorithm || (exports.SortAlgorithm = SortAlgorithm = {}));

let ListAlgorithm;
exports.ListAlgorithm = ListAlgorithm;

(function (ListAlgorithm) {
  ListAlgorithm["Importance"] = "IMPORTANCE";
  ListAlgorithm["Natural"] = "NATURAL";
})(ListAlgorithm || (exports.ListAlgorithm = ListAlgorithm = {}));
/*:: export interface ITagSortingMap {
    // @ts-ignore - TypeScript really wants this to be [tagId: string] but we know better.
    [tagId: TagID]: SortAlgorithm;
}*/

/*:: export interface IListOrderingMap {
    // @ts-ignore - TypeScript really wants this to be [tagId: string] but we know better.
    [tagId: TagID]: ListAlgorithm;
}*/

/*:: export interface IOrderingAlgorithmMap {
    // @ts-ignore - TypeScript really wants this to be [tagId: string] but we know better.
    [tagId: TagID]: OrderingAlgorithm;
}*/

/*:: export interface ITagMap {
    // @ts-ignore - TypeScript really wants this to be [tagId: string] but we know better.
    [tagId: TagID]: Room[];
}*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvbW9kZWxzLnRzIl0sIm5hbWVzIjpbIlNvcnRBbGdvcml0aG0iLCJMaXN0QWxnb3JpdGhtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTVlBLGE7OztXQUFBQSxhO0FBQUFBLEVBQUFBLGE7QUFBQUEsRUFBQUEsYTtBQUFBQSxFQUFBQSxhO0dBQUFBLGEsNkJBQUFBLGE7O0lBTUFDLGE7OztXQUFBQSxhO0FBQUFBLEVBQUFBLGE7QUFBQUEsRUFBQUEsYTtHQUFBQSxhLDZCQUFBQSxhOztBQTFCWjtBQUNBO0FBQ0E7OztBQUZBO0FBQ0E7QUFDQTs7O0FBRkE7QUFDQTtBQUNBOzs7QUFGQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBUYWdJRCB9IGZyb20gXCIuLi9tb2RlbHNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IE9yZGVyaW5nQWxnb3JpdGhtIH0gZnJvbSBcIi4vbGlzdC1vcmRlcmluZy9PcmRlcmluZ0FsZ29yaXRobVwiO1xuXG5leHBvcnQgZW51bSBTb3J0QWxnb3JpdGhtIHtcbiAgICBNYW51YWwgPSBcIk1BTlVBTFwiLFxuICAgIEFscGhhYmV0aWMgPSBcIkFMUEhBQkVUSUNcIixcbiAgICBSZWNlbnQgPSBcIlJFQ0VOVFwiLFxufVxuXG5leHBvcnQgZW51bSBMaXN0QWxnb3JpdGhtIHtcbiAgICAvLyBPcmRlcnMgUmVkID4gR3JleSA+IEJvbGQgPiBJZGxlXG4gICAgSW1wb3J0YW5jZSA9IFwiSU1QT1JUQU5DRVwiLFxuXG4gICAgLy8gT3JkZXJzIGhvd2V2ZXIgdGhlIFNvcnRBbGdvcml0aG0gZGVjaWRlc1xuICAgIE5hdHVyYWwgPSBcIk5BVFVSQUxcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVGFnU29ydGluZ01hcCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFR5cGVTY3JpcHQgcmVhbGx5IHdhbnRzIHRoaXMgdG8gYmUgW3RhZ0lkOiBzdHJpbmddIGJ1dCB3ZSBrbm93IGJldHRlci5cbiAgICBbdGFnSWQ6IFRhZ0lEXTogU29ydEFsZ29yaXRobTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTGlzdE9yZGVyaW5nTWFwIHtcbiAgICAvLyBAdHMtaWdub3JlIC0gVHlwZVNjcmlwdCByZWFsbHkgd2FudHMgdGhpcyB0byBiZSBbdGFnSWQ6IHN0cmluZ10gYnV0IHdlIGtub3cgYmV0dGVyLlxuICAgIFt0YWdJZDogVGFnSURdOiBMaXN0QWxnb3JpdGhtO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElPcmRlcmluZ0FsZ29yaXRobU1hcCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFR5cGVTY3JpcHQgcmVhbGx5IHdhbnRzIHRoaXMgdG8gYmUgW3RhZ0lkOiBzdHJpbmddIGJ1dCB3ZSBrbm93IGJldHRlci5cbiAgICBbdGFnSWQ6IFRhZ0lEXTogT3JkZXJpbmdBbGdvcml0aG07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRhZ01hcCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFR5cGVTY3JpcHQgcmVhbGx5IHdhbnRzIHRoaXMgdG8gYmUgW3RhZ0lkOiBzdHJpbmddIGJ1dCB3ZSBrbm93IGJldHRlci5cbiAgICBbdGFnSWQ6IFRhZ0lEXTogUm9vbVtdO1xufVxuIl19