"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

/*
Copyright 2015, 2016 OpenMarket Ltd
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
const Spinner = ({
  w = 32,
  h = 32,
  imgClassName,
  message
}) => {
  let imageSource;

  if (_SettingsStore.default.getValue('feature_new_spinner')) {
    imageSource = require("../../../../res/img/spinner.svg");
  } else {
    imageSource = require("../../../../res/img/spinner.gif");
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Spinner"
  }, message && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Spinner_Msg"
  }, message), "\xA0"), /*#__PURE__*/_react.default.createElement("img", {
    src: imageSource,
    width: w,
    height: h,
    className: imgClassName,
    "aria-label": (0, _languageHandler._t)("Loading...")
  }));
};

Spinner.propTypes = {
  w: _propTypes.default.number,
  h: _propTypes.default.number,
  imgClassName: _propTypes.default.string,
  message: _propTypes.default.node
};
var _default = Spinner;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1NwaW5uZXIuanMiXSwibmFtZXMiOlsiU3Bpbm5lciIsInciLCJoIiwiaW1nQ2xhc3NOYW1lIiwibWVzc2FnZSIsImltYWdlU291cmNlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicmVxdWlyZSIsInByb3BUeXBlcyIsIlByb3BUeXBlcyIsIm51bWJlciIsInN0cmluZyIsIm5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQSxNQUFNQSxPQUFPLEdBQUcsQ0FBQztBQUFDQyxFQUFBQSxDQUFDLEdBQUcsRUFBTDtBQUFTQyxFQUFBQSxDQUFDLEdBQUcsRUFBYjtBQUFpQkMsRUFBQUEsWUFBakI7QUFBK0JDLEVBQUFBO0FBQS9CLENBQUQsS0FBNkM7QUFDekQsTUFBSUMsV0FBSjs7QUFDQSxNQUFJQyx1QkFBY0MsUUFBZCxDQUF1QixxQkFBdkIsQ0FBSixFQUFtRDtBQUMvQ0YsSUFBQUEsV0FBVyxHQUFHRyxPQUFPLENBQUMsaUNBQUQsQ0FBckI7QUFDSCxHQUZELE1BRU87QUFDSEgsSUFBQUEsV0FBVyxHQUFHRyxPQUFPLENBQUMsaUNBQUQsQ0FBckI7QUFDSDs7QUFFRCxzQkFDSTtBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsS0FDTUosT0FBTyxpQkFBSSw2QkFBQyxjQUFELENBQU8sUUFBUCxxQkFBZ0I7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQWtDQSxPQUFsQyxDQUFoQixTQURqQixlQUVJO0FBQ0ksSUFBQSxHQUFHLEVBQUVDLFdBRFQ7QUFFSSxJQUFBLEtBQUssRUFBRUosQ0FGWDtBQUdJLElBQUEsTUFBTSxFQUFFQyxDQUhaO0FBSUksSUFBQSxTQUFTLEVBQUVDLFlBSmY7QUFLSSxrQkFBWSx5QkFBRyxZQUFIO0FBTGhCLElBRkosQ0FESjtBQVlILENBcEJEOztBQXFCQUgsT0FBTyxDQUFDUyxTQUFSLEdBQW9CO0FBQ2hCUixFQUFBQSxDQUFDLEVBQUVTLG1CQUFVQyxNQURHO0FBRWhCVCxFQUFBQSxDQUFDLEVBQUVRLG1CQUFVQyxNQUZHO0FBR2hCUixFQUFBQSxZQUFZLEVBQUVPLG1CQUFVRSxNQUhSO0FBSWhCUixFQUFBQSxPQUFPLEVBQUVNLG1CQUFVRztBQUpILENBQXBCO2VBT2ViLE8iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcblxuY29uc3QgU3Bpbm5lciA9ICh7dyA9IDMyLCBoID0gMzIsIGltZ0NsYXNzTmFtZSwgbWVzc2FnZX0pID0+IHtcbiAgICBsZXQgaW1hZ2VTb3VyY2U7XG4gICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ2ZlYXR1cmVfbmV3X3NwaW5uZXInKSkge1xuICAgICAgICBpbWFnZVNvdXJjZSA9IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3NwaW5uZXIuc3ZnXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGltYWdlU291cmNlID0gcmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvc3Bpbm5lci5naWZcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGlubmVyXCI+XG4gICAgICAgICAgICB7IG1lc3NhZ2UgJiYgPFJlYWN0LkZyYWdtZW50PjxkaXYgY2xhc3NOYW1lPVwibXhfU3Bpbm5lcl9Nc2dcIj57IG1lc3NhZ2V9PC9kaXY+Jm5ic3A7PC9SZWFjdC5GcmFnbWVudD4gfVxuICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIHNyYz17aW1hZ2VTb3VyY2V9XG4gICAgICAgICAgICAgICAgd2lkdGg9e3d9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXtofVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aW1nQ2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiTG9hZGluZy4uLlwiKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59O1xuU3Bpbm5lci5wcm9wVHlwZXMgPSB7XG4gICAgdzogUHJvcFR5cGVzLm51bWJlcixcbiAgICBoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGltZ0NsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtZXNzYWdlOiBQcm9wVHlwZXMubm9kZSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNwaW5uZXI7XG4iXX0=