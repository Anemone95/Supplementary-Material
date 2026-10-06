"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

/*
Copyright 2018 New Vector Ltd
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
var _default = props => {
  const brand = _SdkConfig.default.get().brand;

  const description1 = (0, _languageHandler._t)("You've previously used %(brand)s on %(host)s with lazy loading of members enabled. " + "In this version lazy loading is disabled. " + "As the local cache is not compatible between these two settings, " + "%(brand)s needs to resync your account.", {
    brand,
    host: props.host
  });
  const description2 = (0, _languageHandler._t)("If the other version of %(brand)s is still open in another tab, " + "please close it as using %(brand)s on the same host with both " + "lazy loading enabled and disabled simultaneously will cause issues.", {
    brand
  });
  return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
    hasCancelButton: false,
    title: (0, _languageHandler._t)("Incompatible local cache"),
    description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, description1), /*#__PURE__*/_react.default.createElement("p", null, description2)),
    button: (0, _languageHandler._t)("Clear cache and resync"),
    onFinished: props.onFinished
  });
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTGF6eUxvYWRpbmdEaXNhYmxlZERpYWxvZy5qcyJdLCJuYW1lcyI6WyJwcm9wcyIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwiZGVzY3JpcHRpb24xIiwiaG9zdCIsImRlc2NyaXB0aW9uMiIsIm9uRmluaXNoZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7ZUFPZ0JBLEtBQUQsSUFBVztBQUN0QixRQUFNQyxLQUFLLEdBQUdDLG1CQUFVQyxHQUFWLEdBQWdCRixLQUE5Qjs7QUFDQSxRQUFNRyxZQUFZLEdBQUcseUJBQ2pCLHdGQUNBLDRDQURBLEdBRUEsbUVBRkEsR0FHQSx5Q0FKaUIsRUFLakI7QUFDSUgsSUFBQUEsS0FESjtBQUVJSSxJQUFBQSxJQUFJLEVBQUVMLEtBQUssQ0FBQ0s7QUFGaEIsR0FMaUIsQ0FBckI7QUFVQSxRQUFNQyxZQUFZLEdBQUcseUJBQ2pCLHFFQUNBLGdFQURBLEdBRUEscUVBSGlCLEVBSWpCO0FBQ0lMLElBQUFBO0FBREosR0FKaUIsQ0FBckI7QUFTQSxzQkFBUSw2QkFBQyx1QkFBRDtBQUNKLElBQUEsZUFBZSxFQUFFLEtBRGI7QUFFSixJQUFBLEtBQUssRUFBRSx5QkFBRywwQkFBSCxDQUZIO0FBR0osSUFBQSxXQUFXLGVBQUUsdURBQUssd0NBQUlHLFlBQUosQ0FBTCxlQUEwQix3Q0FBSUUsWUFBSixDQUExQixDQUhUO0FBSUosSUFBQSxNQUFNLEVBQUUseUJBQUcsd0JBQUgsQ0FKSjtBQUtKLElBQUEsVUFBVSxFQUFFTixLQUFLLENBQUNPO0FBTGQsSUFBUjtBQU9ILEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tICcuL1F1ZXN0aW9uRGlhbG9nJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgKHByb3BzKSA9PiB7XG4gICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgY29uc3QgZGVzY3JpcHRpb24xID0gX3QoXG4gICAgICAgIFwiWW91J3ZlIHByZXZpb3VzbHkgdXNlZCAlKGJyYW5kKXMgb24gJShob3N0KXMgd2l0aCBsYXp5IGxvYWRpbmcgb2YgbWVtYmVycyBlbmFibGVkLiBcIiArXG4gICAgICAgIFwiSW4gdGhpcyB2ZXJzaW9uIGxhenkgbG9hZGluZyBpcyBkaXNhYmxlZC4gXCIgK1xuICAgICAgICBcIkFzIHRoZSBsb2NhbCBjYWNoZSBpcyBub3QgY29tcGF0aWJsZSBiZXR3ZWVuIHRoZXNlIHR3byBzZXR0aW5ncywgXCIgK1xuICAgICAgICBcIiUoYnJhbmQpcyBuZWVkcyB0byByZXN5bmMgeW91ciBhY2NvdW50LlwiLFxuICAgICAgICB7XG4gICAgICAgICAgICBicmFuZCxcbiAgICAgICAgICAgIGhvc3Q6IHByb3BzLmhvc3QsXG4gICAgICAgIH0sXG4gICAgKTtcbiAgICBjb25zdCBkZXNjcmlwdGlvbjIgPSBfdChcbiAgICAgICAgXCJJZiB0aGUgb3RoZXIgdmVyc2lvbiBvZiAlKGJyYW5kKXMgaXMgc3RpbGwgb3BlbiBpbiBhbm90aGVyIHRhYiwgXCIgK1xuICAgICAgICBcInBsZWFzZSBjbG9zZSBpdCBhcyB1c2luZyAlKGJyYW5kKXMgb24gdGhlIHNhbWUgaG9zdCB3aXRoIGJvdGggXCIgK1xuICAgICAgICBcImxhenkgbG9hZGluZyBlbmFibGVkIGFuZCBkaXNhYmxlZCBzaW11bHRhbmVvdXNseSB3aWxsIGNhdXNlIGlzc3Vlcy5cIixcbiAgICAgICAge1xuICAgICAgICAgICAgYnJhbmQsXG4gICAgICAgIH0sXG4gICAgKTtcblxuICAgIHJldHVybiAoPFF1ZXN0aW9uRGlhbG9nXG4gICAgICAgIGhhc0NhbmNlbEJ1dHRvbj17ZmFsc2V9XG4gICAgICAgIHRpdGxlPXtfdChcIkluY29tcGF0aWJsZSBsb2NhbCBjYWNoZVwiKX1cbiAgICAgICAgZGVzY3JpcHRpb249ezxkaXY+PHA+e2Rlc2NyaXB0aW9uMX08L3A+PHA+e2Rlc2NyaXB0aW9uMn08L3A+PC9kaXY+fVxuICAgICAgICBidXR0b249e190KFwiQ2xlYXIgY2FjaGUgYW5kIHJlc3luY1wiKX1cbiAgICAgICAgb25GaW5pc2hlZD17cHJvcHMub25GaW5pc2hlZH1cbiAgICAvPik7XG59O1xuIl19