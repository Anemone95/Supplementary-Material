"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ExistingSource = exports.Tabs = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("..//dialogs/BaseDialog"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _call = require("matrix-js-sdk/src/webrtc/call");

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
let Tabs;
exports.Tabs = Tabs;

(function (Tabs) {
  Tabs["Screens"] = "screens";
  Tabs["Windows"] = "windows";
})(Tabs || (exports.Tabs = Tabs = {}));
/*:: export interface DesktopCapturerSourceIProps {
    source: DesktopCapturerSource;
    onSelect(source: DesktopCapturerSource): void;
}*/


class ExistingSource extends _react.default.Component
/*:: <DesktopCapturerSourceIProps>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onClick", ev => {
      this.props.onSelect(this.props.source);
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_desktopCapturerSourcePicker_stream_button",
      title: this.props.source.name,
      onClick: this.onClick
    }, /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_desktopCapturerSourcePicker_stream_thumbnail",
      src: this.props.source.thumbnailURL
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_desktopCapturerSourcePicker_stream_name"
    }, this.props.source.name));
  }

}
/*:: export interface DesktopCapturerSourcePickerIState {
    selectedTab: Tabs;
    sources: Array<DesktopCapturerSource>;
}*/

/*:: export interface DesktopCapturerSourcePickerIProps {
    onFinished(source: DesktopCapturerSource): void;
}*/


exports.ExistingSource = ExistingSource;

class DesktopCapturerSourcePicker extends _react.default.Component
/*:: <
    DesktopCapturerSourcePickerIProps,
    DesktopCapturerSourcePickerIState
    >*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "interval", void 0);
    (0, _defineProperty2.default)(this, "onSelect", source => {
      this.props.onFinished(source);
    });
    (0, _defineProperty2.default)(this, "onScreensClick", ev => {
      this.setState({
        selectedTab: Tabs.Screens
      });
    });
    (0, _defineProperty2.default)(this, "onWindowsClick", ev => {
      this.setState({
        selectedTab: Tabs.Windows
      });
    });
    (0, _defineProperty2.default)(this, "onCloseClick", ev => {
      this.props.onFinished(null);
    });
    this.state = {
      selectedTab: Tabs.Screens,
      sources: []
    };
  }

  async componentDidMount() {
    // setInterval() first waits and then executes, therefore
    // we call getDesktopCapturerSources() here without any delay.
    // Otherwise the dialog would be left empty for some time.
    this.setState({
      sources: await (0, _call.getDesktopCapturerSources)()
    }); // We update the sources every 500ms to get newer thumbnails

    this.interval = setInterval(async () => {
      this.setState({
        sources: await (0, _call.getDesktopCapturerSources)()
      });
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    let sources;

    if (this.state.selectedTab === Tabs.Screens) {
      sources = this.state.sources.filter(source => {
        return source.id.startsWith("screen");
      }).map(source => {
        return /*#__PURE__*/_react.default.createElement(ExistingSource, {
          source: source,
          onSelect: this.onSelect,
          key: source.id
        });
      });
    } else {
      sources = this.state.sources.filter(source => {
        return source.id.startsWith("window");
      }).map(source => {
        return /*#__PURE__*/_react.default.createElement(ExistingSource, {
          source: source,
          onSelect: this.onSelect,
          key: source.id
        });
      });
    }

    const buttonStyle = "mx_desktopCapturerSourcePicker_tabLabel";
    const screensButtonStyle = buttonStyle + (this.state.selectedTab === Tabs.Screens ? "_selected" : "");
    const windowsButtonStyle = buttonStyle + (this.state.selectedTab === Tabs.Windows ? "_selected" : "");
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_desktopCapturerSourcePicker",
      onFinished: this.onCloseClick,
      title: (0, _languageHandler._t)("Share your screen")
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_desktopCapturerSourcePicker_tabLabels"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: screensButtonStyle,
      onClick: this.onScreensClick
    }, (0, _languageHandler._t)("Screens")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: windowsButtonStyle,
      onClick: this.onWindowsClick
    }, (0, _languageHandler._t)("Windows"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_desktopCapturerSourcePicker_panel"
    }, sources));
  }

}

exports.default = DesktopCapturerSourcePicker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0Rlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlci50c3giXSwibmFtZXMiOlsiVGFicyIsIkV4aXN0aW5nU291cmNlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJvblNlbGVjdCIsInNvdXJjZSIsInJlbmRlciIsIm5hbWUiLCJvbkNsaWNrIiwidGh1bWJuYWlsVVJMIiwiRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyIiwib25GaW5pc2hlZCIsInNldFN0YXRlIiwic2VsZWN0ZWRUYWIiLCJTY3JlZW5zIiwiV2luZG93cyIsInN0YXRlIiwic291cmNlcyIsImNvbXBvbmVudERpZE1vdW50IiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY2xlYXJJbnRlcnZhbCIsImZpbHRlciIsImlkIiwic3RhcnRzV2l0aCIsIm1hcCIsImJ1dHRvblN0eWxlIiwic2NyZWVuc0J1dHRvblN0eWxlIiwid2luZG93c0J1dHRvblN0eWxlIiwib25DbG9zZUNsaWNrIiwib25TY3JlZW5zQ2xpY2siLCJvbldpbmRvd3NDbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQWNZQSxJOzs7V0FBQUEsSTtBQUFBQSxFQUFBQSxJO0FBQUFBLEVBQUFBLEk7R0FBQUEsSSxvQkFBQUEsSTs7QUE1Qlo7QUFDQTtBQUNBOzs7QUFvQ08sTUFBTUMsY0FBTixTQUE2QkMsZUFBTUM7QUFBbkM7QUFBMEU7QUFDN0VDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLG1EQUlSQyxFQUFELElBQVE7QUFD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QUFBLFNBQVMsRUFBQztBQUFmLE9BQ01mLE9BRE4sQ0FuQkosQ0FESjtBQXlCSDs7QUFqR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgxaBpbW9uIEJyYW5kbmVyIDxzaW1vbi5icmEuYWdAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi4vL2RpYWxvZ3MvQmFzZURpYWxvZ1wiXG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHtnZXREZXNrdG9wQ2FwdHVyZXJTb3VyY2VzfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGxcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEZXNrdG9wQ2FwdHVyZXJTb3VyY2Uge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHRodW1ibmFpbFVSTDtcbn1cblxuZXhwb3J0IGVudW0gVGFicyB7XG4gICAgU2NyZWVucyA9IFwic2NyZWVuc1wiLFxuICAgIFdpbmRvd3MgPSBcIndpbmRvd3NcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZXNrdG9wQ2FwdHVyZXJTb3VyY2VJUHJvcHMge1xuICAgIHNvdXJjZTogRGVza3RvcENhcHR1cmVyU291cmNlO1xuICAgIG9uU2VsZWN0KHNvdXJjZTogRGVza3RvcENhcHR1cmVyU291cmNlKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIEV4aXN0aW5nU291cmNlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PERlc2t0b3BDYXB0dXJlclNvdXJjZUlQcm9wcz4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG5cbiAgICBvbkNsaWNrID0gKGV2KSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy5zb3VyY2UpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfZGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyX3N0cmVhbV9idXR0b25cIlxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLnNvdXJjZS5uYW1lfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGlja30gPlxuICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfZGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyX3N0cmVhbV90aHVtYm5haWxcIlxuICAgICAgICAgICAgICAgICAgICBzcmM9e3RoaXMucHJvcHMuc291cmNlLnRodW1ibmFpbFVSTH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X2Rlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlcl9zdHJlYW1fbmFtZVwiPnt0aGlzLnByb3BzLnNvdXJjZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VySVN0YXRlIHtcbiAgICBzZWxlY3RlZFRhYjogVGFicztcbiAgICBzb3VyY2VzOiBBcnJheTxEZXNrdG9wQ2FwdHVyZXJTb3VyY2U+O1xufVxuZXhwb3J0IGludGVyZmFjZSBEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXJJUHJvcHMge1xuICAgIG9uRmluaXNoZWQoc291cmNlOiBEZXNrdG9wQ2FwdHVyZXJTb3VyY2UpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8XG4gICAgRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VySVByb3BzLFxuICAgIERlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlcklTdGF0ZVxuICAgID4ge1xuICAgIGludGVydmFsO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZFRhYjogVGFicy5TY3JlZW5zLFxuICAgICAgICAgICAgc291cmNlczogW10sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIC8vIHNldEludGVydmFsKCkgZmlyc3Qgd2FpdHMgYW5kIHRoZW4gZXhlY3V0ZXMsIHRoZXJlZm9yZVxuICAgICAgICAvLyB3ZSBjYWxsIGdldERlc2t0b3BDYXB0dXJlclNvdXJjZXMoKSBoZXJlIHdpdGhvdXQgYW55IGRlbGF5LlxuICAgICAgICAvLyBPdGhlcndpc2UgdGhlIGRpYWxvZyB3b3VsZCBiZSBsZWZ0IGVtcHR5IGZvciBzb21lIHRpbWUuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc291cmNlczogYXdhaXQgZ2V0RGVza3RvcENhcHR1cmVyU291cmNlcygpLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXZSB1cGRhdGUgdGhlIHNvdXJjZXMgZXZlcnkgNTAwbXMgdG8gZ2V0IG5ld2VyIHRodW1ibmFpbHNcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNvdXJjZXM6IGF3YWl0IGdldERlc2t0b3BDYXB0dXJlclNvdXJjZXMoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCA1MDApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIG9uU2VsZWN0ID0gKHNvdXJjZSkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoc291cmNlKTtcbiAgICB9XG5cbiAgICBvblNjcmVlbnNDbGljayA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFRhYjogVGFicy5TY3JlZW5zfSk7XG4gICAgfVxuXG4gICAgb25XaW5kb3dzQ2xpY2sgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRUYWI6IFRhYnMuV2luZG93c30pO1xuICAgIH1cblxuICAgIG9uQ2xvc2VDbGljayA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQobnVsbCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgc291cmNlcztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRUYWIgPT09IFRhYnMuU2NyZWVucykge1xuICAgICAgICAgICAgc291cmNlcyA9IHRoaXMuc3RhdGUuc291cmNlc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoKHNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlLmlkLnN0YXJ0c1dpdGgoXCJzY3JlZW5cIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAubWFwKChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxFeGlzdGluZ1NvdXJjZSBzb3VyY2U9e3NvdXJjZX0gb25TZWxlY3Q9e3RoaXMub25TZWxlY3R9IGtleT17c291cmNlLmlkfSAvPjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNvdXJjZXMgPSB0aGlzLnN0YXRlLnNvdXJjZXNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZS5pZC5zdGFydHNXaXRoKFwid2luZG93XCIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm1hcCgoc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiA8RXhpc3RpbmdTb3VyY2Ugc291cmNlPXtzb3VyY2V9IG9uU2VsZWN0PXt0aGlzLm9uU2VsZWN0fSBrZXk9e3NvdXJjZS5pZH0gLz47XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBidXR0b25TdHlsZSA9IFwibXhfZGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyX3RhYkxhYmVsXCI7XG4gICAgICAgIGNvbnN0IHNjcmVlbnNCdXR0b25TdHlsZSA9IGJ1dHRvblN0eWxlICsgKCh0aGlzLnN0YXRlLnNlbGVjdGVkVGFiID09PSBUYWJzLlNjcmVlbnMpID8gXCJfc2VsZWN0ZWRcIiA6IFwiXCIpO1xuICAgICAgICBjb25zdCB3aW5kb3dzQnV0dG9uU3R5bGUgPSBidXR0b25TdHlsZSArICgodGhpcy5zdGF0ZS5zZWxlY3RlZFRhYiA9PT0gVGFicy5XaW5kb3dzKSA/IFwiX3NlbGVjdGVkXCIgOiBcIlwiKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9kZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXJcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DbG9zZUNsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlNoYXJlIHlvdXIgc2NyZWVuXCIpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfZGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyX3RhYkxhYmVsc1wiPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW5zQnV0dG9uU3R5bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2NyZWVuc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJTY3JlZW5zXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3dpbmRvd3NCdXR0b25TdHlsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25XaW5kb3dzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIldpbmRvd3NcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X2Rlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlcl9wYW5lbFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHNvdXJjZXMgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==