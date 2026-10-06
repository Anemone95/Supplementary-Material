"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class DocumentOffset {
  constructor(offset
  /*: number*/
  , atNodeEnd
  /*: boolean*/
  ) {
    this.offset
    /*:: */
    = offset
    /*:: */
    ;
    this.atNodeEnd
    /*:: */
    = atNodeEnd
    /*:: */
    ;
  }

  asPosition(model
  /*: EditorModel*/
  ) {
    return model.positionForOffset(this.offset, this.atNodeEnd);
  }

  add(delta
  /*: number*/
  , atNodeEnd = false) {
    return new DocumentOffset(this.offset + delta, atNodeEnd);
  }

}

exports.default = DocumentOffset;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZGl0b3Ivb2Zmc2V0LnRzIl0sIm5hbWVzIjpbIkRvY3VtZW50T2Zmc2V0IiwiY29uc3RydWN0b3IiLCJvZmZzZXQiLCJhdE5vZGVFbmQiLCJhc1Bvc2l0aW9uIiwibW9kZWwiLCJwb3NpdGlvbkZvck9mZnNldCIsImFkZCIsImRlbHRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSWUsTUFBTUEsY0FBTixDQUFxQjtBQUNoQ0MsRUFBQUEsV0FBVyxDQUFRQztBQUFSO0FBQUEsSUFBd0NDO0FBQXhDO0FBQUEsSUFBNEQ7QUFBQSxTQUFwREQ7QUFBb0Q7QUFBQSxNQUFwREE7QUFBb0Q7QUFBQTtBQUFBLFNBQXBCQztBQUFvQjtBQUFBLE1BQXBCQTtBQUFvQjtBQUFBO0FBQ3RFOztBQUVEQyxFQUFBQSxVQUFVLENBQUNDO0FBQUQ7QUFBQSxJQUFxQjtBQUMzQixXQUFPQSxLQUFLLENBQUNDLGlCQUFOLENBQXdCLEtBQUtKLE1BQTdCLEVBQXFDLEtBQUtDLFNBQTFDLENBQVA7QUFDSDs7QUFFREksRUFBQUEsR0FBRyxDQUFDQztBQUFEO0FBQUEsSUFBZ0JMLFNBQVMsR0FBRyxLQUE1QixFQUFtQztBQUNsQyxXQUFPLElBQUlILGNBQUosQ0FBbUIsS0FBS0UsTUFBTCxHQUFjTSxLQUFqQyxFQUF3Q0wsU0FBeEMsQ0FBUDtBQUNIOztBQVYrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tIFwiLi9tb2RlbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2N1bWVudE9mZnNldCB7XG4gICAgY29uc3RydWN0b3IocHVibGljIG9mZnNldDogbnVtYmVyLCBwdWJsaWMgcmVhZG9ubHkgYXROb2RlRW5kOiBib29sZWFuKSB7XG4gICAgfVxuXG4gICAgYXNQb3NpdGlvbihtb2RlbDogRWRpdG9yTW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KHRoaXMub2Zmc2V0LCB0aGlzLmF0Tm9kZUVuZCk7XG4gICAgfVxuXG4gICAgYWRkKGRlbHRhOiBudW1iZXIsIGF0Tm9kZUVuZCA9IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnRPZmZzZXQodGhpcy5vZmZzZXQgKyBkZWx0YSwgYXROb2RlRW5kKTtcbiAgICB9XG59XG4iXX0=