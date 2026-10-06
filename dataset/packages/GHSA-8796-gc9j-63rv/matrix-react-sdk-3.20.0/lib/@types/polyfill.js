"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.polyfillTouchEvent = polyfillTouchEvent;

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
// This is intended to fix re-resizer because of its unguarded `instanceof TouchEvent` checks.
function polyfillTouchEvent() {
  // Firefox doesn't have touch events without touch devices being present, so create a fake
  // one we can rely on lying about.
  if (!window.TouchEvent) {
    // We have no intention of actually using this, so just lie.
    window.TouchEvent = class TouchEvent extends UIEvent {
      get altKey()
      /*: boolean*/
      {
        return false;
      }

      get changedTouches()
      /*: any*/
      {
        return [];
      }

      get ctrlKey()
      /*: boolean*/
      {
        return false;
      }

      get metaKey()
      /*: boolean*/
      {
        return false;
      }

      get shiftKey()
      /*: boolean*/
      {
        return false;
      }

      get targetTouches()
      /*: any*/
      {
        return [];
      }

      get touches()
      /*: any*/
      {
        return [];
      }

      get rotation()
      /*: number*/
      {
        return 0.0;
      }

      get scale()
      /*: number*/
      {
        return 0.0;
      }

      constructor(eventType
      /*: string*/
      , params
      /*: any*/
      ) {
        super(eventType, params);
      }

    };
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9AdHlwZXMvcG9seWZpbGwudHMiXSwibmFtZXMiOlsicG9seWZpbGxUb3VjaEV2ZW50Iiwid2luZG93IiwiVG91Y2hFdmVudCIsIlVJRXZlbnQiLCJhbHRLZXkiLCJjaGFuZ2VkVG91Y2hlcyIsImN0cmxLZXkiLCJtZXRhS2V5Iiwic2hpZnRLZXkiLCJ0YXJnZXRUb3VjaGVzIiwidG91Y2hlcyIsInJvdGF0aW9uIiwic2NhbGUiLCJjb25zdHJ1Y3RvciIsImV2ZW50VHlwZSIsInBhcmFtcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ08sU0FBU0Esa0JBQVQsR0FBOEI7QUFDakM7QUFDQTtBQUNBLE1BQUksQ0FBQ0MsTUFBTSxDQUFDQyxVQUFaLEVBQXdCO0FBQ3BCO0FBQ0FELElBQUFBLE1BQU0sQ0FBQ0MsVUFBUCxHQUFvQixNQUFNQSxVQUFOLFNBQXlCQyxPQUF6QixDQUFpQztBQUNqRCxVQUFXQyxNQUFYO0FBQUE7QUFBNkI7QUFBRSxlQUFPLEtBQVA7QUFBZTs7QUFDOUMsVUFBV0MsY0FBWDtBQUFBO0FBQWlDO0FBQUUsZUFBTyxFQUFQO0FBQVk7O0FBQy9DLFVBQVdDLE9BQVg7QUFBQTtBQUE4QjtBQUFFLGVBQU8sS0FBUDtBQUFlOztBQUMvQyxVQUFXQyxPQUFYO0FBQUE7QUFBOEI7QUFBRSxlQUFPLEtBQVA7QUFBZTs7QUFDL0MsVUFBV0MsUUFBWDtBQUFBO0FBQStCO0FBQUUsZUFBTyxLQUFQO0FBQWU7O0FBQ2hELFVBQVdDLGFBQVg7QUFBQTtBQUFnQztBQUFFLGVBQU8sRUFBUDtBQUFZOztBQUM5QyxVQUFXQyxPQUFYO0FBQUE7QUFBMEI7QUFBRSxlQUFPLEVBQVA7QUFBWTs7QUFDeEMsVUFBV0MsUUFBWDtBQUFBO0FBQThCO0FBQUUsZUFBTyxHQUFQO0FBQWE7O0FBQzdDLFVBQVdDLEtBQVg7QUFBQTtBQUEyQjtBQUFFLGVBQU8sR0FBUDtBQUFhOztBQUMxQ0MsTUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsUUFBb0JDO0FBQXBCO0FBQUEsUUFBa0M7QUFDekMsY0FBTUQsU0FBTixFQUFpQkMsTUFBakI7QUFDSDs7QUFaZ0QsS0FBckQ7QUFjSDtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gVGhpcyBpcyBpbnRlbmRlZCB0byBmaXggcmUtcmVzaXplciBiZWNhdXNlIG9mIGl0cyB1bmd1YXJkZWQgYGluc3RhbmNlb2YgVG91Y2hFdmVudGAgY2hlY2tzLlxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlmaWxsVG91Y2hFdmVudCgpIHtcbiAgICAvLyBGaXJlZm94IGRvZXNuJ3QgaGF2ZSB0b3VjaCBldmVudHMgd2l0aG91dCB0b3VjaCBkZXZpY2VzIGJlaW5nIHByZXNlbnQsIHNvIGNyZWF0ZSBhIGZha2VcbiAgICAvLyBvbmUgd2UgY2FuIHJlbHkgb24gbHlpbmcgYWJvdXQuXG4gICAgaWYgKCF3aW5kb3cuVG91Y2hFdmVudCkge1xuICAgICAgICAvLyBXZSBoYXZlIG5vIGludGVudGlvbiBvZiBhY3R1YWxseSB1c2luZyB0aGlzLCBzbyBqdXN0IGxpZS5cbiAgICAgICAgd2luZG93LlRvdWNoRXZlbnQgPSBjbGFzcyBUb3VjaEV2ZW50IGV4dGVuZHMgVUlFdmVudCB7XG4gICAgICAgICAgICBwdWJsaWMgZ2V0IGFsdEtleSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgICAgICBwdWJsaWMgZ2V0IGNoYW5nZWRUb3VjaGVzKCk6IGFueSB7IHJldHVybiBbXTsgfVxuICAgICAgICAgICAgcHVibGljIGdldCBjdHJsS2V5KCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIHB1YmxpYyBnZXQgbWV0YUtleSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgICAgICBwdWJsaWMgZ2V0IHNoaWZ0S2V5KCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIHB1YmxpYyBnZXQgdGFyZ2V0VG91Y2hlcygpOiBhbnkgeyByZXR1cm4gW107IH1cbiAgICAgICAgICAgIHB1YmxpYyBnZXQgdG91Y2hlcygpOiBhbnkgeyByZXR1cm4gW107IH1cbiAgICAgICAgICAgIHB1YmxpYyBnZXQgcm90YXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIDAuMDsgfVxuICAgICAgICAgICAgcHVibGljIGdldCBzY2FsZSgpOiBudW1iZXIgeyByZXR1cm4gMC4wOyB9XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihldmVudFR5cGU6IHN0cmluZywgcGFyYW1zPzogYW55KSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoZXZlbnRUeXBlLCBwYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==