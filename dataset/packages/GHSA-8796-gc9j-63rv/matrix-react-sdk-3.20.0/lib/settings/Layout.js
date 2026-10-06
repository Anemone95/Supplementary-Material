"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayoutPropType = exports.Layout = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

/*
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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

/* TODO: This should be later reworked into something more generic */
let Layout;
/* We need this because multiple components are still using JavaScript */

exports.Layout = Layout;

(function (Layout) {
  Layout["IRC"] = "irc";
  Layout["Group"] = "group";
})(Layout || (exports.Layout = Layout = {}));

const LayoutPropType = _propTypes.default.oneOf(Object.values(Layout));

exports.LayoutPropType = LayoutPropType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXR0aW5ncy9MYXlvdXQudHMiXSwibmFtZXMiOlsiTGF5b3V0IiwiTGF5b3V0UHJvcFR5cGUiLCJQcm9wVHlwZXMiLCJvbmVPZiIsIk9iamVjdCIsInZhbHVlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUE7SUFDWUEsTTtBQUtaOzs7O1dBTFlBLE07QUFBQUEsRUFBQUEsTTtBQUFBQSxFQUFBQSxNO0dBQUFBLE0sc0JBQUFBLE07O0FBTUwsTUFBTUMsY0FBYyxHQUFHQyxtQkFBVUMsS0FBVixDQUFnQkMsTUFBTSxDQUFDQyxNQUFQLENBQWNMLE1BQWQsQ0FBaEIsQ0FBdkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgxaBpbW9uIEJyYW5kbmVyIDxzaW1vbi5icmEuYWdAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbi8qIFRPRE86IFRoaXMgc2hvdWxkIGJlIGxhdGVyIHJld29ya2VkIGludG8gc29tZXRoaW5nIG1vcmUgZ2VuZXJpYyAqL1xuZXhwb3J0IGVudW0gTGF5b3V0IHtcbiAgICBJUkMgPSBcImlyY1wiLFxuICAgIEdyb3VwID0gXCJncm91cFwiXG59XG5cbi8qIFdlIG5lZWQgdGhpcyBiZWNhdXNlIG11bHRpcGxlIGNvbXBvbmVudHMgYXJlIHN0aWxsIHVzaW5nIEphdmFTY3JpcHQgKi9cbmV4cG9ydCBjb25zdCBMYXlvdXRQcm9wVHlwZSA9IFByb3BUeXBlcy5vbmVPZihPYmplY3QudmFsdWVzKExheW91dCkpO1xuIl19