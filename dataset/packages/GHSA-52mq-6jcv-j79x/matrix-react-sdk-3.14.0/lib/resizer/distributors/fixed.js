"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _item = _interopRequireDefault(require("../item"));

var _sizer = _interopRequireDefault(require("../sizer"));

/*
Copyright 2019 - 2020 The Matrix.org Foundation C.I.C.

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
distributors translate a moving cursor into
CSS/DOM changes by calling the sizer

they have two methods:
    `resize` receives then new item size
    `resizeFromContainerOffset` receives resize handle location
        within the container bounding box. For internal use.
        This method usually ends up calling `resize` once the start offset is subtracted.
*/
class FixedDistributor
/*:: <C extends IConfig, I extends ResizeItem<any> = ResizeItem<C>>*/
{
  static createItem(resizeHandle
  /*: HTMLDivElement*/
  , resizer
  /*: Resizer*/
  , sizer
  /*: Sizer*/
  )
  /*: ResizeItem*/
  {
    return new _item.default(resizeHandle, resizer, sizer);
  }

  static createSizer(containerElement
  /*: HTMLElement*/
  , vertical
  /*: boolean*/
  , reverse
  /*: boolean*/
  )
  /*: Sizer*/
  {
    return new _sizer.default(containerElement, vertical, reverse);
  }

  constructor(item
  /*: I*/
  ) {
    this.item
    /*:: */
    = item
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "beforeOffset", void 0);
    this.beforeOffset = item.offset();
  }

  get size() {
    return this.item.getSize();
  }

  set size(size
  /*: string*/
  ) {
    this.item.setRawSize(size);
  }

  resize(size
  /*: number*/
  ) {
    this.item.setSize(size);
  }

  resizeFromContainerOffset(offset
  /*: number*/
  ) {
    this.resize(offset - this.beforeOffset);
  }

  start() {
    this.item.start();
  }

  finish() {
    this.item.finish();
  }

}

exports.default = FixedDistributor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNpemVyL2Rpc3RyaWJ1dG9ycy9maXhlZC50cyJdLCJuYW1lcyI6WyJGaXhlZERpc3RyaWJ1dG9yIiwiY3JlYXRlSXRlbSIsInJlc2l6ZUhhbmRsZSIsInJlc2l6ZXIiLCJzaXplciIsIlJlc2l6ZUl0ZW0iLCJjcmVhdGVTaXplciIsImNvbnRhaW5lckVsZW1lbnQiLCJ2ZXJ0aWNhbCIsInJldmVyc2UiLCJTaXplciIsImNvbnN0cnVjdG9yIiwiaXRlbSIsImJlZm9yZU9mZnNldCIsIm9mZnNldCIsInNpemUiLCJnZXRTaXplIiwic2V0UmF3U2l6ZSIsInJlc2l6ZSIsInNldFNpemUiLCJyZXNpemVGcm9tQ29udGFpbmVyT2Zmc2V0Iiwic3RhcnQiLCJmaW5pc2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQTtBQUFOO0FBQXFGO0FBQ2hHLFNBQU9DLFVBQVAsQ0FBa0JDO0FBQWxCO0FBQUEsSUFBZ0RDO0FBQWhEO0FBQUEsSUFBa0VDO0FBQWxFO0FBQUE7QUFBQTtBQUE0RjtBQUN4RixXQUFPLElBQUlDLGFBQUosQ0FBZUgsWUFBZixFQUE2QkMsT0FBN0IsRUFBc0NDLEtBQXRDLENBQVA7QUFDSDs7QUFFRCxTQUFPRSxXQUFQLENBQW1CQztBQUFuQjtBQUFBLElBQWtEQztBQUFsRDtBQUFBLElBQXFFQztBQUFyRTtBQUFBO0FBQUE7QUFBOEY7QUFDMUYsV0FBTyxJQUFJQyxjQUFKLENBQVVILGdCQUFWLEVBQTRCQyxRQUE1QixFQUFzQ0MsT0FBdEMsQ0FBUDtBQUNIOztBQUlERSxFQUFBQSxXQUFXLENBQWlCQztBQUFqQjtBQUFBLElBQTBCO0FBQUEsU0FBVEE7QUFBUztBQUFBLE1BQVRBO0FBQVM7QUFBQTtBQUFBO0FBQ2pDLFNBQUtDLFlBQUwsR0FBb0JELElBQUksQ0FBQ0UsTUFBTCxFQUFwQjtBQUNIOztBQUVELE1BQVdDLElBQVgsR0FBa0I7QUFDZCxXQUFPLEtBQUtILElBQUwsQ0FBVUksT0FBVixFQUFQO0FBQ0g7O0FBRUQsTUFBV0QsSUFBWCxDQUFnQkE7QUFBaEI7QUFBQSxJQUE4QjtBQUMxQixTQUFLSCxJQUFMLENBQVVLLFVBQVYsQ0FBcUJGLElBQXJCO0FBQ0g7O0FBRU1HLEVBQUFBLE1BQVAsQ0FBY0g7QUFBZDtBQUFBLElBQTRCO0FBQ3hCLFNBQUtILElBQUwsQ0FBVU8sT0FBVixDQUFrQkosSUFBbEI7QUFDSDs7QUFFTUssRUFBQUEseUJBQVAsQ0FBaUNOO0FBQWpDO0FBQUEsSUFBaUQ7QUFDN0MsU0FBS0ksTUFBTCxDQUFZSixNQUFNLEdBQUcsS0FBS0QsWUFBMUI7QUFDSDs7QUFFTVEsRUFBQUEsS0FBUCxHQUFlO0FBQ1gsU0FBS1QsSUFBTCxDQUFVUyxLQUFWO0FBQ0g7O0FBRU1DLEVBQUFBLE1BQVAsR0FBZ0I7QUFDWixTQUFLVixJQUFMLENBQVVVLE1BQVY7QUFDSDs7QUFyQytGIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IC0gMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZXNpemVJdGVtIGZyb20gXCIuLi9pdGVtXCI7XG5pbXBvcnQgU2l6ZXIgZnJvbSBcIi4uL3NpemVyXCI7XG5pbXBvcnQgUmVzaXplciwge0lDb25maWd9IGZyb20gXCIuLi9yZXNpemVyXCI7XG5cbi8qKlxuZGlzdHJpYnV0b3JzIHRyYW5zbGF0ZSBhIG1vdmluZyBjdXJzb3IgaW50b1xuQ1NTL0RPTSBjaGFuZ2VzIGJ5IGNhbGxpbmcgdGhlIHNpemVyXG5cbnRoZXkgaGF2ZSB0d28gbWV0aG9kczpcbiAgICBgcmVzaXplYCByZWNlaXZlcyB0aGVuIG5ldyBpdGVtIHNpemVcbiAgICBgcmVzaXplRnJvbUNvbnRhaW5lck9mZnNldGAgcmVjZWl2ZXMgcmVzaXplIGhhbmRsZSBsb2NhdGlvblxuICAgICAgICB3aXRoaW4gdGhlIGNvbnRhaW5lciBib3VuZGluZyBib3guIEZvciBpbnRlcm5hbCB1c2UuXG4gICAgICAgIFRoaXMgbWV0aG9kIHVzdWFsbHkgZW5kcyB1cCBjYWxsaW5nIGByZXNpemVgIG9uY2UgdGhlIHN0YXJ0IG9mZnNldCBpcyBzdWJ0cmFjdGVkLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpeGVkRGlzdHJpYnV0b3I8QyBleHRlbmRzIElDb25maWcsIEkgZXh0ZW5kcyBSZXNpemVJdGVtPGFueT4gPSBSZXNpemVJdGVtPEM+PiB7XG4gICAgc3RhdGljIGNyZWF0ZUl0ZW0ocmVzaXplSGFuZGxlOiBIVE1MRGl2RWxlbWVudCwgcmVzaXplcjogUmVzaXplciwgc2l6ZXI6IFNpemVyKTogUmVzaXplSXRlbSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzaXplSXRlbShyZXNpemVIYW5kbGUsIHJlc2l6ZXIsIHNpemVyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlU2l6ZXIoY29udGFpbmVyRWxlbWVudDogSFRNTEVsZW1lbnQsIHZlcnRpY2FsOiBib29sZWFuLCByZXZlcnNlOiBib29sZWFuKTogU2l6ZXIge1xuICAgICAgICByZXR1cm4gbmV3IFNpemVyKGNvbnRhaW5lckVsZW1lbnQsIHZlcnRpY2FsLCByZXZlcnNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IGJlZm9yZU9mZnNldDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGl0ZW06IEkpIHtcbiAgICAgICAgdGhpcy5iZWZvcmVPZmZzZXQgPSBpdGVtLm9mZnNldCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbS5nZXRTaXplKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBzaXplKHNpemU6IHN0cmluZykge1xuICAgICAgICB0aGlzLml0ZW0uc2V0UmF3U2l6ZShzaXplKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzaXplKHNpemU6IG51bWJlcikge1xuICAgICAgICB0aGlzLml0ZW0uc2V0U2l6ZShzaXplKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzaXplRnJvbUNvbnRhaW5lck9mZnNldChvZmZzZXQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJlc2l6ZShvZmZzZXQgLSB0aGlzLmJlZm9yZU9mZnNldCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLml0ZW0uc3RhcnQoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmluaXNoKCkge1xuICAgICAgICB0aGlzLml0ZW0uZmluaXNoKCk7XG4gICAgfVxufVxuIl19