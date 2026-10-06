"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("./index"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("./languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd
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

/**
 * Wrap an asynchronous loader function with a react component which shows a
 * spinner until the real component loads.
 */
class AsyncWrapper extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      component: null,
      error: null
    });
    (0, _defineProperty2.default)(this, "_onWrapperCancelClick", () => {
      this.props.onFinished(false);
    });
  }

  componentDidMount() {
    this._unmounted = false; // XXX: temporary logging to try to diagnose
    // https://github.com/vector-im/element-web/issues/3148

    console.log('Starting load of AsyncWrapper for modal');
    this.props.prom.then(result => {
      if (this._unmounted) {
        return;
      } // Take the 'default' member if it's there, then we support
      // passing in just an import()ed module, since ES6 async import
      // always returns a module *namespace*.


      const component = result.default ? result.default : result;
      this.setState({
        component
      });
    }).catch(e => {
      console.warn('AsyncWrapper promise failed', e);
      this.setState({
        error: e
      });
    });
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  render() {
    if (this.state.component) {
      const Component = this.state.component;
      return /*#__PURE__*/_react.default.createElement(Component, this.props);
    } else if (this.state.error) {
      const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
      const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
      return /*#__PURE__*/_react.default.createElement(BaseDialog, {
        onFinished: this.props.onFinished,
        title: (0, _languageHandler._t)("Error")
      }, (0, _languageHandler._t)("Unable to load! Check your network connectivity and try again."), /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)("Dismiss"),
        onPrimaryButtonClick: this._onWrapperCancelClick,
        hasCancel: false
      }));
    } else {
      // show a spinner until the component is loaded.
      const Spinner = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement(Spinner, null);
    }
  }

}

exports.default = AsyncWrapper;
(0, _defineProperty2.default)(AsyncWrapper, "propTypes", {
  /** A promise which resolves with the real component
   */
  prom: _propTypes.default.object.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Bc3luY1dyYXBwZXIuanMiXSwibmFtZXMiOlsiQXN5bmNXcmFwcGVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb21wb25lbnQiLCJlcnJvciIsInByb3BzIiwib25GaW5pc2hlZCIsImNvbXBvbmVudERpZE1vdW50IiwiX3VubW91bnRlZCIsImNvbnNvbGUiLCJsb2ciLCJwcm9tIiwidGhlbiIsInJlc3VsdCIsImRlZmF1bHQiLCJzZXRTdGF0ZSIsImNhdGNoIiwiZSIsIndhcm4iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbmRlciIsInN0YXRlIiwiQmFzZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIkRpYWxvZ0J1dHRvbnMiLCJfb25XcmFwcGVyQ2FuY2VsQ2xpY2siLCJTcGlubmVyIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxZQUFOLFNBQTJCQyxlQUFNQyxTQUFqQyxDQUEyQztBQUFBO0FBQUE7QUFBQSxpREFPOUM7QUFDSkMsTUFBQUEsU0FBUyxFQUFFLElBRFA7QUFFSkMsTUFBQUEsS0FBSyxFQUFFO0FBRkgsS0FQOEM7QUFBQSxpRUFvQzlCLE1BQU07QUFDMUIsV0FBS0MsS0FBTCxDQUFXQyxVQUFYLENBQXNCLEtBQXRCO0FBQ0gsS0F0Q3FEO0FBQUE7O0FBWXREQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQixTQUFLQyxVQUFMLEdBQWtCLEtBQWxCLENBRGdCLENBRWhCO0FBQ0E7O0FBQ0FDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHlDQUFaO0FBQ0EsU0FBS0wsS0FBTCxDQUFXTSxJQUFYLENBQWdCQyxJQUFoQixDQUFzQkMsTUFBRCxJQUFZO0FBQzdCLFVBQUksS0FBS0wsVUFBVCxFQUFxQjtBQUNqQjtBQUNILE9BSDRCLENBSTdCO0FBQ0E7QUFDQTs7O0FBQ0EsWUFBTUwsU0FBUyxHQUFHVSxNQUFNLENBQUNDLE9BQVAsR0FBaUJELE1BQU0sQ0FBQ0MsT0FBeEIsR0FBa0NELE1BQXBEO0FBQ0EsV0FBS0UsUUFBTCxDQUFjO0FBQUNaLFFBQUFBO0FBQUQsT0FBZDtBQUNILEtBVEQsRUFTR2EsS0FUSCxDQVNVQyxDQUFELElBQU87QUFDWlIsTUFBQUEsT0FBTyxDQUFDUyxJQUFSLENBQWEsNkJBQWIsRUFBNENELENBQTVDO0FBQ0EsV0FBS0YsUUFBTCxDQUFjO0FBQUNYLFFBQUFBLEtBQUssRUFBRWE7QUFBUixPQUFkO0FBQ0gsS0FaRDtBQWFIOztBQUVERSxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQixTQUFLWCxVQUFMLEdBQWtCLElBQWxCO0FBQ0g7O0FBTURZLEVBQUFBLE1BQU0sR0FBRztBQUNMLFFBQUksS0FBS0MsS0FBTCxDQUFXbEIsU0FBZixFQUEwQjtBQUN0QixZQUFNRCxTQUFTLEdBQUcsS0FBS21CLEtBQUwsQ0FBV2xCLFNBQTdCO0FBQ0EsMEJBQU8sNkJBQUMsU0FBRCxFQUFlLEtBQUtFLEtBQXBCLENBQVA7QUFDSCxLQUhELE1BR08sSUFBSSxLQUFLZ0IsS0FBTCxDQUFXakIsS0FBZixFQUFzQjtBQUN6QixZQUFNa0IsVUFBVSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMEJBQWpCLENBQW5CO0FBQ0EsWUFBTUMsYUFBYSxHQUFHRixHQUFHLENBQUNDLFlBQUosQ0FBaUIsOEJBQWpCLENBQXRCO0FBQ0EsMEJBQU8sNkJBQUMsVUFBRDtBQUFZLFFBQUEsVUFBVSxFQUFFLEtBQUtuQixLQUFMLENBQVdDLFVBQW5DO0FBQ0gsUUFBQSxLQUFLLEVBQUUseUJBQUcsT0FBSDtBQURKLFNBR0YseUJBQUcsZ0VBQUgsQ0FIRSxlQUlILDZCQUFDLGFBQUQ7QUFBZSxRQUFBLGFBQWEsRUFBRSx5QkFBRyxTQUFILENBQTlCO0FBQ0ksUUFBQSxvQkFBb0IsRUFBRSxLQUFLb0IscUJBRC9CO0FBRUksUUFBQSxTQUFTLEVBQUU7QUFGZixRQUpHLENBQVA7QUFTSCxLQVpNLE1BWUE7QUFDSDtBQUNBLFlBQU1DLE9BQU8sR0FBR0osR0FBRyxDQUFDQyxZQUFKLENBQWlCLGtCQUFqQixDQUFoQjtBQUNBLDBCQUFPLDZCQUFDLE9BQUQsT0FBUDtBQUNIO0FBQ0o7O0FBN0RxRDs7OzhCQUFyQ3hCLFksZUFDRTtBQUNmO0FBQ1I7QUFDUVcsRUFBQUEsSUFBSSxFQUFFaUIsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBSFIsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5cbi8qKlxuICogV3JhcCBhbiBhc3luY2hyb25vdXMgbG9hZGVyIGZ1bmN0aW9uIHdpdGggYSByZWFjdCBjb21wb25lbnQgd2hpY2ggc2hvd3MgYVxuICogc3Bpbm5lciB1bnRpbCB0aGUgcmVhbCBjb21wb25lbnQgbG9hZHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzeW5jV3JhcHBlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyoqIEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIHRoZSByZWFsIGNvbXBvbmVudFxuICAgICAgICAgKi9cbiAgICAgICAgcHJvbTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgY29tcG9uZW50OiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAvLyBYWFg6IHRlbXBvcmFyeSBsb2dnaW5nIHRvIHRyeSB0byBkaWFnbm9zZVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8zMTQ4XG4gICAgICAgIGNvbnNvbGUubG9nKCdTdGFydGluZyBsb2FkIG9mIEFzeW5jV3JhcHBlciBmb3IgbW9kYWwnKTtcbiAgICAgICAgdGhpcy5wcm9wcy5wcm9tLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRha2UgdGhlICdkZWZhdWx0JyBtZW1iZXIgaWYgaXQncyB0aGVyZSwgdGhlbiB3ZSBzdXBwb3J0XG4gICAgICAgICAgICAvLyBwYXNzaW5nIGluIGp1c3QgYW4gaW1wb3J0KCllZCBtb2R1bGUsIHNpbmNlIEVTNiBhc3luYyBpbXBvcnRcbiAgICAgICAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGEgbW9kdWxlICpuYW1lc3BhY2UqLlxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzdWx0LmRlZmF1bHQgPyByZXN1bHQuZGVmYXVsdCA6IHJlc3VsdDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbXBvbmVudH0pO1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdBc3luY1dyYXBwZXIgcHJvbWlzZSBmYWlsZWQnLCBlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2Vycm9yOiBlfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIF9vbldyYXBwZXJDYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IENvbXBvbmVudCA9IHRoaXMuc3RhdGUuY29tcG9uZW50O1xuICAgICAgICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IC8+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgICAgICByZXR1cm4gPEJhc2VEaWFsb2cgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkVycm9yXCIpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtfdChcIlVuYWJsZSB0byBsb2FkISBDaGVjayB5b3VyIG5ldHdvcmsgY29ubmVjdGl2aXR5IGFuZCB0cnkgYWdhaW4uXCIpfVxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KFwiRGlzbWlzc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uV3JhcHBlckNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2hvdyBhIHNwaW5uZXIgdW50aWwgdGhlIGNvbXBvbmVudCBpcyBsb2FkZWQuXG4gICAgICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiJdfQ==