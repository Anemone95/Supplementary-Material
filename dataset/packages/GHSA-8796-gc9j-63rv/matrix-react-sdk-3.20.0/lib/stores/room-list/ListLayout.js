"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListLayout = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

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
const TILE_HEIGHT_PX = 44;

class ListLayout {
  constructor(tagId
  /*: TagID*/
  ) {
    this.tagId
    /*:: */
    = tagId
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "_n", 0);
    (0, _defineProperty2.default)(this, "_previews", false);
    (0, _defineProperty2.default)(this, "_collapsed", false);
    const serialized = localStorage.getItem(this.key);

    if (serialized) {
      // We don't use the setters as they cause writes.
      const parsed = JSON.parse(serialized);
      this._n = parsed.numTiles;
      this._previews = parsed.showPreviews;
      this._collapsed = parsed.collapsed;
    }
  }

  get isCollapsed()
  /*: boolean*/
  {
    return this._collapsed;
  }

  set isCollapsed(v
  /*: boolean*/
  ) {
    this._collapsed = v;
    this.save();
  }

  get showPreviews()
  /*: boolean*/
  {
    return this._previews;
  }

  set showPreviews(v
  /*: boolean*/
  ) {
    this._previews = v;
    this.save();
  }

  get tileHeight()
  /*: number*/
  {
    return TILE_HEIGHT_PX;
  }

  get key()
  /*: string*/
  {
    return `mx_sublist_layout_${this.tagId}_boxed`;
  }

  get visibleTiles()
  /*: number*/
  {
    if (this._n === 0) return this.defaultVisibleTiles;
    return Math.max(this._n, this.minVisibleTiles);
  }

  set visibleTiles(v
  /*: number*/
  ) {
    this._n = v;
    this.save();
  }

  get minVisibleTiles()
  /*: number*/
  {
    return 1;
  }

  get defaultVisibleTiles()
  /*: number*/
  {
    // This number is what "feels right", and mostly subject to design's opinion.
    return 8;
  }

  tilesWithPadding(n
  /*: number*/
  , paddingPx
  /*: number*/
  )
  /*: number*/
  {
    return this.pixelsToTiles(this.tilesToPixelsWithPadding(n, paddingPx));
  }

  tilesToPixelsWithPadding(n
  /*: number*/
  , paddingPx
  /*: number*/
  )
  /*: number*/
  {
    return this.tilesToPixels(n) + paddingPx;
  }

  tilesToPixels(n
  /*: number*/
  )
  /*: number*/
  {
    return n * this.tileHeight;
  }

  pixelsToTiles(px
  /*: number*/
  )
  /*: number*/
  {
    return px / this.tileHeight;
  }

  reset() {
    localStorage.removeItem(this.key);
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.serialize()));
  }

  serialize()
  /*: ISerializedListLayout*/
  {
    return {
      numTiles: this.visibleTiles,
      showPreviews: this.showPreviews,
      collapsed: this.isCollapsed
    };
  }

}

exports.ListLayout = ListLayout;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L0xpc3RMYXlvdXQudHMiXSwibmFtZXMiOlsiVElMRV9IRUlHSFRfUFgiLCJMaXN0TGF5b3V0IiwiY29uc3RydWN0b3IiLCJ0YWdJZCIsInNlcmlhbGl6ZWQiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwia2V5IiwicGFyc2VkIiwiSlNPTiIsInBhcnNlIiwiX24iLCJudW1UaWxlcyIsIl9wcmV2aWV3cyIsInNob3dQcmV2aWV3cyIsIl9jb2xsYXBzZWQiLCJjb2xsYXBzZWQiLCJpc0NvbGxhcHNlZCIsInYiLCJzYXZlIiwidGlsZUhlaWdodCIsInZpc2libGVUaWxlcyIsImRlZmF1bHRWaXNpYmxlVGlsZXMiLCJNYXRoIiwibWF4IiwibWluVmlzaWJsZVRpbGVzIiwidGlsZXNXaXRoUGFkZGluZyIsIm4iLCJwYWRkaW5nUHgiLCJwaXhlbHNUb1RpbGVzIiwidGlsZXNUb1BpeGVsc1dpdGhQYWRkaW5nIiwidGlsZXNUb1BpeGVscyIsInB4IiwicmVzZXQiLCJyZW1vdmVJdGVtIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsInNlcmlhbGl6ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJQSxNQUFNQSxjQUFjLEdBQUcsRUFBdkI7O0FBUU8sTUFBTUMsVUFBTixDQUFpQjtBQUtwQkMsRUFBQUEsV0FBVyxDQUFpQkM7QUFBakI7QUFBQSxJQUErQjtBQUFBLFNBQWRBO0FBQWM7QUFBQSxNQUFkQTtBQUFjO0FBQUE7QUFBQSw4Q0FKN0IsQ0FJNkI7QUFBQSxxREFIdEIsS0FHc0I7QUFBQSxzREFGckIsS0FFcUI7QUFDdEMsVUFBTUMsVUFBVSxHQUFHQyxZQUFZLENBQUNDLE9BQWIsQ0FBcUIsS0FBS0MsR0FBMUIsQ0FBbkI7O0FBQ0EsUUFBSUgsVUFBSixFQUFnQjtBQUNa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eC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBUYWdJRCB9IGZyb20gXCIuL21vZGVsc1wiO1xuXG5jb25zdCBUSUxFX0hFSUdIVF9QWCA9IDQ0O1xuXG5pbnRlcmZhY2UgSVNlcmlhbGl6ZWRMaXN0TGF5b3V0IHtcbiAgICBudW1UaWxlczogbnVtYmVyO1xuICAgIHNob3dQcmV2aWV3czogYm9vbGVhbjtcbiAgICBjb2xsYXBzZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBMaXN0TGF5b3V0IHtcbiAgICBwcml2YXRlIF9uID0gMDtcbiAgICBwcml2YXRlIF9wcmV2aWV3cyA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2NvbGxhcHNlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IHRhZ0lkOiBUYWdJRCkge1xuICAgICAgICBjb25zdCBzZXJpYWxpemVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5rZXkpO1xuICAgICAgICBpZiAoc2VyaWFsaXplZCkge1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgdXNlIHRoZSBzZXR0ZXJzIGFzIHRoZXkgY2F1c2Ugd3JpdGVzLlxuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gPElTZXJpYWxpemVkTGlzdExheW91dD5KU09OLnBhcnNlKHNlcmlhbGl6ZWQpO1xuICAgICAgICAgICAgdGhpcy5fbiA9IHBhcnNlZC5udW1UaWxlcztcbiAgICAgICAgICAgIHRoaXMuX3ByZXZpZXdzID0gcGFyc2VkLnNob3dQcmV2aWV3cztcbiAgICAgICAgICAgIHRoaXMuX2NvbGxhcHNlZCA9IHBhcnNlZC5jb2xsYXBzZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzQ29sbGFwc2VkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29sbGFwc2VkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgaXNDb2xsYXBzZWQodjogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9jb2xsYXBzZWQgPSB2O1xuICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHNob3dQcmV2aWV3cygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZXZpZXdzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgc2hvd1ByZXZpZXdzKHY6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fcHJldmlld3MgPSB2O1xuICAgICAgICB0aGlzLnNhdmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHRpbGVIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIFRJTEVfSEVJR0hUX1BYO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGtleSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYG14X3N1Ymxpc3RfbGF5b3V0XyR7dGhpcy50YWdJZH1fYm94ZWRgO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdmlzaWJsZVRpbGVzKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9uID09PSAwKSByZXR1cm4gdGhpcy5kZWZhdWx0VmlzaWJsZVRpbGVzO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5fbiwgdGhpcy5taW5WaXNpYmxlVGlsZXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgdmlzaWJsZVRpbGVzKHY6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9uID0gdjtcbiAgICAgICAgdGhpcy5zYXZlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBtaW5WaXNpYmxlVGlsZXMoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkZWZhdWx0VmlzaWJsZVRpbGVzKCk6IG51bWJlciB7XG4gICAgICAgIC8vIFRoaXMgbnVtYmVyIGlzIHdoYXQgXCJmZWVscyByaWdodFwiLCBhbmQgbW9zdGx5IHN1YmplY3QgdG8gZGVzaWduJ3Mgb3Bpbmlvbi5cbiAgICAgICAgcmV0dXJuIDg7XG4gICAgfVxuXG4gICAgcHVibGljIHRpbGVzV2l0aFBhZGRpbmcobjogbnVtYmVyLCBwYWRkaW5nUHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpeGVsc1RvVGlsZXModGhpcy50aWxlc1RvUGl4ZWxzV2l0aFBhZGRpbmcobiwgcGFkZGluZ1B4KSk7XG4gICAgfVxuXG4gICAgcHVibGljIHRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyhuOiBudW1iZXIsIHBhZGRpbmdQeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNUb1BpeGVscyhuKSArIHBhZGRpbmdQeDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdGlsZXNUb1BpeGVscyhuOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gbiAqIHRoaXMudGlsZUhlaWdodDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcGl4ZWxzVG9UaWxlcyhweDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHB4IC8gdGhpcy50aWxlSGVpZ2h0O1xuICAgIH1cblxuICAgIHB1YmxpYyByZXNldCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5rZXkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2F2ZSgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5rZXksIEpTT04uc3RyaW5naWZ5KHRoaXMuc2VyaWFsaXplKCkpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlcmlhbGl6ZSgpOiBJU2VyaWFsaXplZExpc3RMYXlvdXQge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbnVtVGlsZXM6IHRoaXMudmlzaWJsZVRpbGVzLFxuICAgICAgICAgICAgc2hvd1ByZXZpZXdzOiB0aGlzLnNob3dQcmV2aWV3cyxcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdGhpcy5pc0NvbGxhcHNlZCxcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=