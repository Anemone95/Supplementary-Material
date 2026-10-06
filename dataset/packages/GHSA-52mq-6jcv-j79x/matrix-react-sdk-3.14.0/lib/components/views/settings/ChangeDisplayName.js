"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
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
class ChangeDisplayName extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_getDisplayName", async () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        const res = await cli.getProfileInfo(cli.getUserId());
        return res.displayname;
      } catch (e) {
        throw new Error("Failed to fetch display name");
      }
    });
    (0, _defineProperty2.default)(this, "_changeDisplayName", newDisplayname => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      return cli.setDisplayName(newDisplayname).catch(function (e) {
        throw new Error("Failed to set display name", e);
      });
    });
  }

  render() {
    const EditableTextContainer = sdk.getComponent('elements.EditableTextContainer');
    return /*#__PURE__*/_react.default.createElement(EditableTextContainer, {
      getInitialValue: this._getDisplayName,
      placeholder: (0, _languageHandler._t)("No display name"),
      blurToSubmit: true,
      onSubmit: this._changeDisplayName
    });
  }

}

exports.default = ChangeDisplayName;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0NoYW5nZURpc3BsYXlOYW1lLmpzIl0sIm5hbWVzIjpbIkNoYW5nZURpc3BsYXlOYW1lIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyZXMiLCJnZXRQcm9maWxlSW5mbyIsImdldFVzZXJJZCIsImRpc3BsYXluYW1lIiwiZSIsIkVycm9yIiwibmV3RGlzcGxheW5hbWUiLCJzZXREaXNwbGF5TmFtZSIsImNhdGNoIiwicmVuZGVyIiwiRWRpdGFibGVUZXh0Q29udGFpbmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiX2dldERpc3BsYXlOYW1lIiwiX2NoYW5nZURpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT2UsTUFBTUEsaUJBQU4sU0FBZ0NDLGVBQU1DLFNBQXRDLENBQWdEO0FBQUE7QUFBQTtBQUFBLDJEQUN6QyxZQUFZO0FBQzFCLFlBQU1DLEdBQUcsR0FBR0MsaUNBQWdCQyxHQUFoQixFQUFaOztBQUNBLFVBQUk7QUFDQSxjQUFNQyxHQUFHLEdBQUcsTUFBTUgsR0FBRyxDQUFDSSxjQUFKLENBQW1CSixHQUFHLENBQUNLLFNBQUosRUFBbkIsQ0FBbEI7QUFDQSxlQUFPRixHQUFHLENBQUNHLFdBQVg7QUFDSCxPQUhELENBR0UsT0FBT0MsQ0FBUCxFQUFVO0FBQ1IsY0FBTSxJQUFJQyxLQUFKLENBQVUsOEJBQVYsQ0FBTjtBQUNIO0FBQ0osS0FUMEQ7QUFBQSw4REFXckNDLGNBQUQsSUFBb0I7QUFDckMsWUFBTVQsR0FBRyxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEVBQVo7O0FBQ0EsYUFBT0YsR0FBRyxDQUFDVSxjQUFKLENBQW1CRCxjQUFuQixFQUFtQ0UsS0FBbkMsQ0FBeUMsVUFBU0osQ0FBVCxFQUFZO0FBQ3hELGNBQU0sSUFBSUMsS0FBSixDQUFVLDRCQUFWLEVBQXdDRCxDQUF4QyxDQUFOO0FBQ0gsT0FGTSxDQUFQO0FBR0gsS0FoQjBEO0FBQUE7O0FBa0IzREssRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMscUJBQXFCLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixnQ0FBakIsQ0FBOUI7QUFDQSx3QkFDSSw2QkFBQyxxQkFBRDtBQUNJLE1BQUEsZUFBZSxFQUFFLEtBQUtDLGVBRDFCO0FBRUksTUFBQSxXQUFXLEVBQUUseUJBQUcsaUJBQUgsQ0FGakI7QUFHSSxNQUFBLFlBQVksRUFBRSxJQUhsQjtBQUlJLE1BQUEsUUFBUSxFQUFFLEtBQUtDO0FBSm5CLE1BREo7QUFPSDs7QUEzQjBEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFuZ2VEaXNwbGF5TmFtZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgX2dldERpc3BsYXlOYW1lID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBjbGkuZ2V0UHJvZmlsZUluZm8oY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGlzcGxheW5hbWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmZXRjaCBkaXNwbGF5IG5hbWVcIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2NoYW5nZURpc3BsYXlOYW1lID0gKG5ld0Rpc3BsYXluYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgcmV0dXJuIGNsaS5zZXREaXNwbGF5TmFtZShuZXdEaXNwbGF5bmFtZSkuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHNldCBkaXNwbGF5IG5hbWVcIiwgZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEVkaXRhYmxlVGV4dENvbnRhaW5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkVkaXRhYmxlVGV4dENvbnRhaW5lcicpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEVkaXRhYmxlVGV4dENvbnRhaW5lclxuICAgICAgICAgICAgICAgIGdldEluaXRpYWxWYWx1ZT17dGhpcy5fZ2V0RGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiTm8gZGlzcGxheSBuYW1lXCIpfVxuICAgICAgICAgICAgICAgIGJsdXJUb1N1Ym1pdD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5fY2hhbmdlRGlzcGxheU5hbWV9IC8+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19