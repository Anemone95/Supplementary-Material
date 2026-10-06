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

/**
 * Represents a tag sorting algorithm.
 */

/*:: export interface IAlgorithm {
    /**
     * Sorts the given rooms according to the sorting rules of the algorithm.
     * @param {Room[]} rooms The rooms to sort.
     * @param {TagID} tagId The tag ID in which the rooms are being sorted.
     * @returns {Promise<Room[]>} Resolves to the sorted rooms.
     *-/
    sortRooms(rooms: Room[], tagId: TagID): Promise<Room[]>;
}*/
"use strict";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvdGFnLXNvcnRpbmcvSUFsZ29yaXRobS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0E7QUFDQTtBQUNBOzs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IFRhZ0lEIH0gZnJvbSBcIi4uLy4uL21vZGVsc1wiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0YWcgc29ydGluZyBhbGdvcml0aG0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSUFsZ29yaXRobSB7XG4gICAgLyoqXG4gICAgICogU29ydHMgdGhlIGdpdmVuIHJvb21zIGFjY29yZGluZyB0byB0aGUgc29ydGluZyBydWxlcyBvZiB0aGUgYWxnb3JpdGhtLlxuICAgICAqIEBwYXJhbSB7Um9vbVtdfSByb29tcyBUaGUgcm9vbXMgdG8gc29ydC5cbiAgICAgKiBAcGFyYW0ge1RhZ0lEfSB0YWdJZCBUaGUgdGFnIElEIGluIHdoaWNoIHRoZSByb29tcyBhcmUgYmVpbmcgc29ydGVkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFJvb21bXT59IFJlc29sdmVzIHRvIHRoZSBzb3J0ZWQgcm9vbXMuXG4gICAgICovXG4gICAgc29ydFJvb21zKHJvb21zOiBSb29tW10sIHRhZ0lkOiBUYWdJRCk6IFByb21pc2U8Um9vbVtdPjtcbn1cbiJdfQ==