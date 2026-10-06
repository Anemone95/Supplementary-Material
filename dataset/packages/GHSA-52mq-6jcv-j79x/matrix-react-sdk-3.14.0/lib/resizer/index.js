"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "FixedDistributor", {
  enumerable: true,
  get: function () {
    return _fixed.default;
  }
});
Object.defineProperty(exports, "PercentageDistributor", {
  enumerable: true,
  get: function () {
    return _percentage.default;
  }
});
Object.defineProperty(exports, "CollapseDistributor", {
  enumerable: true,
  get: function () {
    return _collapse.default;
  }
});
Object.defineProperty(exports, "Resizer", {
  enumerable: true,
  get: function () {
    return _resizer.default;
  }
});

var _fixed = _interopRequireDefault(require("./distributors/fixed"));

var _percentage = _interopRequireDefault(require("./distributors/percentage"));

var _collapse = _interopRequireDefault(require("./distributors/collapse"));

var _resizer = _interopRequireDefault(require("./resizer"));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXNpemVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuZXhwb3J0IHtkZWZhdWx0IGFzIEZpeGVkRGlzdHJpYnV0b3J9IGZyb20gXCIuL2Rpc3RyaWJ1dG9ycy9maXhlZFwiO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFBlcmNlbnRhZ2VEaXN0cmlidXRvcn0gZnJvbSBcIi4vZGlzdHJpYnV0b3JzL3BlcmNlbnRhZ2VcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBDb2xsYXBzZURpc3RyaWJ1dG9yfSBmcm9tIFwiLi9kaXN0cmlidXRvcnMvY29sbGFwc2VcIjtcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSZXNpemVyfSBmcm9tIFwiLi9yZXNpemVyXCI7XG4iXX0=