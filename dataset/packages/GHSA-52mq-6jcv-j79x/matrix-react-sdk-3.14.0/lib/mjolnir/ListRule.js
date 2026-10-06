"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recommendationToStable = recommendationToStable;
exports.ListRule = exports.RECOMMENDATION_BAN_TYPES = exports.RECOMMENDATION_BAN = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _MatrixGlob = require("../utils/MatrixGlob");

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
// Inspiration largely taken from Mjolnir itself
const RECOMMENDATION_BAN = "m.ban";
exports.RECOMMENDATION_BAN = RECOMMENDATION_BAN;
const RECOMMENDATION_BAN_TYPES = [RECOMMENDATION_BAN, "org.matrix.mjolnir.ban"];
exports.RECOMMENDATION_BAN_TYPES = RECOMMENDATION_BAN_TYPES;

function recommendationToStable(recommendation
/*: string*/
, unstable = true)
/*: string*/
{
  if (RECOMMENDATION_BAN_TYPES.includes(recommendation)) {
    return unstable ? RECOMMENDATION_BAN_TYPES[RECOMMENDATION_BAN_TYPES.length - 1] : RECOMMENDATION_BAN;
  }

  return null;
}

class ListRule {
  constructor(entity
  /*: string*/
  , action
  /*: string*/
  , reason
  /*: string*/
  , kind
  /*: string*/
  ) {
    (0, _defineProperty2.default)(this, "_glob", void 0);
    (0, _defineProperty2.default)(this, "_entity", void 0);
    (0, _defineProperty2.default)(this, "_action", void 0);
    (0, _defineProperty2.default)(this, "_reason", void 0);
    (0, _defineProperty2.default)(this, "_kind", void 0);
    this._glob = new _MatrixGlob.MatrixGlob(entity);
    this._entity = entity;
    this._action = recommendationToStable(action, false);
    this._reason = reason;
    this._kind = kind;
  }

  get entity()
  /*: string*/
  {
    return this._entity;
  }

  get reason()
  /*: string*/
  {
    return this._reason;
  }

  get kind()
  /*: string*/
  {
    return this._kind;
  }

  get recommendation()
  /*: string*/
  {
    return this._action;
  }

  isMatch(entity
  /*: string*/
  )
  /*: boolean*/
  {
    return this._glob.test(entity);
  }

}

exports.ListRule = ListRule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tam9sbmlyL0xpc3RSdWxlLmpzIl0sIm5hbWVzIjpbIlJFQ09NTUVOREFUSU9OX0JBTiIsIlJFQ09NTUVOREFUSU9OX0JBTl9UWVBFUyIsInJlY29tbWVuZGF0aW9uVG9TdGFibGUiLCJyZWNvbW1lbmRhdGlvbiIsInVuc3RhYmxlIiwiaW5jbHVkZXMiLCJsZW5ndGgiLCJMaXN0UnVsZSIsImNvbnN0cnVjdG9yIiwiZW50aXR5IiwiYWN0aW9uIiwicmVhc29uIiwia2luZCIsIl9nbG9iIiwiTWF0cml4R2xvYiIsIl9lbnRpdHkiLCJfYWN0aW9uIiwiX3JlYXNvbiIsIl9raW5kIiwiaXNNYXRjaCIsInRlc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFFTyxNQUFNQSxrQkFBa0IsR0FBRyxPQUEzQjs7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxDQUFDRCxrQkFBRCxFQUFxQix3QkFBckIsQ0FBakM7OztBQUVBLFNBQVNFLHNCQUFULENBQWdDQztBQUFoQztBQUFBLEVBQXdEQyxRQUFRLEdBQUcsSUFBbkU7QUFBQTtBQUFpRjtBQUNwRixNQUFJSCx3QkFBd0IsQ0FBQ0ksUUFBekIsQ0FBa0NGLGNBQWxDLENBQUosRUFBdUQ7QUFDbkQsV0FBT0MsUUFBUSxHQUFHSCx3QkFBd0IsQ0FBQ0Esd0JBQXdCLENBQUNLLE1BQXpCLEdBQWtDLENBQW5DLENBQTNCLEdBQW1FTixrQkFBbEY7QUFDSDs7QUFDRCxTQUFPLElBQVA7QUFDSDs7QUFFTSxNQUFNTyxRQUFOLENBQWU7QUFPbEJDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQWlCQztBQUFqQjtBQUFBLElBQWlDQztBQUFqQztBQUFBLElBQWlEQztBQUFqRDtBQUFBLElBQStEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN0RSxTQUFLQyxLQUFMLEdBQWEsSUFBSUMsc0JBQUosQ0FBZUwsTUFBZixDQUFiO0FBQ0EsU0FBS00sT0FBTCxHQUFlTixNQUFmO0FBQ0EsU0FBS08sT0FBTCxHQUFlZCxzQkFBc0IsQ0FBQ1EsTUFBRCxFQUFTLEtBQVQsQ0FBckM7QUFDQSxTQUFLTyxPQUFMLEdBQWVOLE1BQWY7QUFDQSxTQUFLTyxLQUFMLEdBQWFOLElBQWI7QUFDSDs7QUFFRCxNQUFJSCxNQUFKO0FBQUE7QUFBcUI7QUFDakIsV0FBTyxLQUFLTSxPQUFaO0FBQ0g7O0FBRUQsTUFBSUosTUFBSjtBQUFBO0FBQXFCO0FBQ2pCLFdBQU8sS0FBS00sT0FBWjtBQUNIOztBQUVELE1BQUlMLElBQUo7QUFBQTtBQUFtQjtBQUNmLFdBQU8sS0FBS00sS0FBWjtBQUNIOztBQUVELE1BQUlmLGNBQUo7QUFBQTtBQUE2QjtBQUN6QixXQUFPLEtBQUthLE9BQVo7QUFDSDs7QUFFREcsRUFBQUEsT0FBTyxDQUFDVjtBQUFEO0FBQUE7QUFBQTtBQUEwQjtBQUM3QixXQUFPLEtBQUtJLEtBQUwsQ0FBV08sSUFBWCxDQUFnQlgsTUFBaEIsQ0FBUDtBQUNIOztBQWpDaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge01hdHJpeEdsb2J9IGZyb20gXCIuLi91dGlscy9NYXRyaXhHbG9iXCI7XG5cbi8vIEluc3BpcmF0aW9uIGxhcmdlbHkgdGFrZW4gZnJvbSBNam9sbmlyIGl0c2VsZlxuXG5leHBvcnQgY29uc3QgUkVDT01NRU5EQVRJT05fQkFOID0gXCJtLmJhblwiO1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREFUSU9OX0JBTl9UWVBFUyA9IFtSRUNPTU1FTkRBVElPTl9CQU4sIFwib3JnLm1hdHJpeC5tam9sbmlyLmJhblwiXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlY29tbWVuZGF0aW9uVG9TdGFibGUocmVjb21tZW5kYXRpb246IHN0cmluZywgdW5zdGFibGUgPSB0cnVlKTogc3RyaW5nIHtcbiAgICBpZiAoUkVDT01NRU5EQVRJT05fQkFOX1RZUEVTLmluY2x1ZGVzKHJlY29tbWVuZGF0aW9uKSkge1xuICAgICAgICByZXR1cm4gdW5zdGFibGUgPyBSRUNPTU1FTkRBVElPTl9CQU5fVFlQRVNbUkVDT01NRU5EQVRJT05fQkFOX1RZUEVTLmxlbmd0aCAtIDFdIDogUkVDT01NRU5EQVRJT05fQkFOO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIExpc3RSdWxlIHtcbiAgICBfZ2xvYjogTWF0cml4R2xvYjtcbiAgICBfZW50aXR5OiBzdHJpbmc7XG4gICAgX2FjdGlvbjogc3RyaW5nO1xuICAgIF9yZWFzb246IHN0cmluZztcbiAgICBfa2luZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZW50aXR5OiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCByZWFzb246IHN0cmluZywga2luZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2dsb2IgPSBuZXcgTWF0cml4R2xvYihlbnRpdHkpO1xuICAgICAgICB0aGlzLl9lbnRpdHkgPSBlbnRpdHk7XG4gICAgICAgIHRoaXMuX2FjdGlvbiA9IHJlY29tbWVuZGF0aW9uVG9TdGFibGUoYWN0aW9uLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX3JlYXNvbiA9IHJlYXNvbjtcbiAgICAgICAgdGhpcy5fa2luZCA9IGtpbmQ7XG4gICAgfVxuXG4gICAgZ2V0IGVudGl0eSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZW50aXR5O1xuICAgIH1cblxuICAgIGdldCByZWFzb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlYXNvbjtcbiAgICB9XG5cbiAgICBnZXQga2luZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fa2luZDtcbiAgICB9XG5cbiAgICBnZXQgcmVjb21tZW5kYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvbjtcbiAgICB9XG5cbiAgICBpc01hdGNoKGVudGl0eTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nbG9iLnRlc3QoZW50aXR5KTtcbiAgICB9XG59XG4iXX0=