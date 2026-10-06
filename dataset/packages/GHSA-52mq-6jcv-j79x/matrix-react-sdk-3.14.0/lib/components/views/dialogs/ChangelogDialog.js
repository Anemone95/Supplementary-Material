"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _languageHandler = require("../../../languageHandler");

/*
 Copyright 2016 Aviral Dasgupta
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
const REPOS = ['vector-im/element-web', 'matrix-org/matrix-react-sdk', 'matrix-org/matrix-js-sdk'];

class ChangelogDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const version = this.props.newVersion.split('-');
    const version2 = this.props.version.split('-');
    if (version == null || version2 == null) return; // parse versions of form: [vectorversion]-react-[react-sdk-version]-js-[js-sdk-version]

    for (let i = 0; i < REPOS.length; i++) {
      const oldVersion = version2[2 * i];
      const newVersion = version[2 * i];
      const url = `https://riot.im/github/repos/${REPOS[i]}/compare/${oldVersion}...${newVersion}`;
      (0, _browserRequest.default)(url, (err, response, body) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          this.setState({
            [REPOS[i]]: response.statusText
          });
          return;
        }

        this.setState({
          [REPOS[i]]: JSON.parse(body).commits
        });
      });
    }
  }

  _elementsForCommit(commit) {
    return /*#__PURE__*/_react.default.createElement("li", {
      key: commit.sha,
      className: "mx_ChangelogDialog_li"
    }, /*#__PURE__*/_react.default.createElement("a", {
      href: commit.html_url,
      target: "_blank",
      rel: "noreferrer noopener"
    }, commit.commit.message.split('\n')[0]));
  }

  render() {
    const Spinner = sdk.getComponent('views.elements.Spinner');
    const QuestionDialog = sdk.getComponent('dialogs.QuestionDialog');
    const logs = REPOS.map(repo => {
      let content;

      if (this.state[repo] == null) {
        content = /*#__PURE__*/_react.default.createElement(Spinner, {
          key: repo
        });
      } else if (typeof this.state[repo] === "string") {
        content = (0, _languageHandler._t)("Unable to load commit detail: %(msg)s", {
          msg: this.state[repo]
        });
      } else {
        content = this.state[repo].map(this._elementsForCommit);
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        key: repo
      }, /*#__PURE__*/_react.default.createElement("h2", null, repo), /*#__PURE__*/_react.default.createElement("ul", null, content));
    });

    const content = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ChangelogDialog_content"
    }, this.props.version == null || this.props.newVersion == null ? /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Unavailable")) : logs);

    return /*#__PURE__*/_react.default.createElement(QuestionDialog, {
      title: (0, _languageHandler._t)("Changelog"),
      description: content,
      button: (0, _languageHandler._t)("Update"),
      onFinished: this.props.onFinished
    });
  }

}

exports.default = ChangelogDialog;
ChangelogDialog.propTypes = {
  version: _propTypes.default.string.isRequired,
  newVersion: _propTypes.default.string.isRequired,
  onFinished: _propTypes.default.func.isRequired
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ2hhbmdlbG9nRGlhbG9nLmpzIl0sIm5hbWVzIjpbIlJFUE9TIiwiQ2hhbmdlbG9nRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic3RhdGUiLCJjb21wb25lbnREaWRNb3VudCIsInZlcnNpb24iLCJuZXdWZXJzaW9uIiwic3BsaXQiLCJ2ZXJzaW9uMiIsImkiLCJsZW5ndGgiLCJvbGRWZXJzaW9uIiwidXJsIiwiZXJyIiwicmVzcG9uc2UiLCJib2R5Iiwic3RhdHVzQ29kZSIsInNldFN0YXRlIiwic3RhdHVzVGV4dCIsIkpTT04iLCJwYXJzZSIsImNvbW1pdHMiLCJfZWxlbWVudHNGb3JDb21taXQiLCJjb21taXQiLCJzaGEiLCJodG1sX3VybCIsIm1lc3NhZ2UiLCJyZW5kZXIiLCJTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiUXVlc3Rpb25EaWFsb2ciLCJsb2dzIiwibWFwIiwicmVwbyIsImNvbnRlbnQiLCJtc2ciLCJvbkZpbmlzaGVkIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiaXNSZXF1aXJlZCIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFBLE1BQU1BLEtBQUssR0FBRyxDQUFDLHVCQUFELEVBQTBCLDZCQUExQixFQUF5RCwwQkFBekQsQ0FBZDs7QUFFZSxNQUFNQyxlQUFOLFNBQThCQyxlQUFNQyxTQUFwQyxDQUE4QztBQUN6REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRUEsU0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDSDs7QUFFREMsRUFB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RUFBRVk7QUFBVixzQkFDSSx5Q0FBS0EsSUFBTCxDQURKLGVBRUkseUNBQUtDLE9BQUwsQ0FGSixDQURKO0FBTUgsS0FqQlksQ0FBYjs7QUFtQkEsVUFBTUEsT0FBTyxnQkFDVDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDSyxLQUFLakMsS0FBTCxDQUFXRyxPQUFYLElBQXNCLElBQXRCLElBQThCLEtBQUtILEtBQUwsQ0FBV0ksVUFBWCxJQUF5QixJQUF2RCxnQkFBOEQseUNBQUsseUJBQUcsYUFBSCxDQUFMLENBQTlELEdBQTZGMEIsSUFEbEcsQ0FESjs7QUFPQSx3QkFDSSw2QkFBQyxjQUFEO0FBQ0ksTUFBQSxLQUFLLEVBQUUseUJBQUcsV0FBSCxDQURYO0FBRUksTUFBQSxXQUFXLEVBQUVHLE9BRmpCO0FBR0ksTUFBQSxNQUFNLEVBQUUseUJBQUcsUUFBSCxDQUhaO0FBSUksTUFBQSxVQUFVLEVBQUUsS0FBS2pDLEtBQUwsQ0FBV21DO0FBSjNCLE1BREo7QUFRSDs7QUExRXdEOzs7QUE2RTdEdkMsZUFBZSxDQUFDd0MsU0FBaEIsR0FBNEI7QUFDeEJqQyxFQUFBQSxPQUFPLEVBQUVrQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFERjtBQUV4Qm5DLEVBQUFBLFVBQVUsRUFBRWlDLG1CQUFVQyxNQUFWLENBQWlCQyxVQUZMO0FBR3hCSixFQUFBQSxVQUFVLEVBQUVFLG1CQUFVRyxJQUFWLENBQWVEO0FBSEgsQ0FBNUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDE2IEF2aXJhbCBEYXNndXB0YVxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYnJvd3Nlci1yZXF1ZXN0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuY29uc3QgUkVQT1MgPSBbJ3ZlY3Rvci1pbS9lbGVtZW50LXdlYicsICdtYXRyaXgtb3JnL21hdHJpeC1yZWFjdC1zZGsnLCAnbWF0cml4LW9yZy9tYXRyaXgtanMtc2RrJ107XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYW5nZWxvZ0RpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IHRoaXMucHJvcHMubmV3VmVyc2lvbi5zcGxpdCgnLScpO1xuICAgICAgICBjb25zdCB2ZXJzaW9uMiA9IHRoaXMucHJvcHMudmVyc2lvbi5zcGxpdCgnLScpO1xuICAgICAgICBpZiAodmVyc2lvbiA9PSBudWxsIHx8IHZlcnNpb24yID09IG51bGwpIHJldHVybjtcbiAgICAgICAgLy8gcGFyc2UgdmVyc2lvbnMgb2YgZm9ybTogW3ZlY3RvcnZlcnNpb25dLXJlYWN0LVtyZWFjdC1zZGstdmVyc2lvbl0tanMtW2pzLXNkay12ZXJzaW9uXVxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8UkVQT1MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9sZFZlcnNpb24gPSB2ZXJzaW9uMlsyKmldO1xuICAgICAgICAgICAgY29uc3QgbmV3VmVyc2lvbiA9IHZlcnNpb25bMippXTtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3Jpb3QuaW0vZ2l0aHViL3JlcG9zLyR7UkVQT1NbaV19L2NvbXBhcmUvJHtvbGRWZXJzaW9ufS4uLiR7bmV3VmVyc2lvbn1gO1xuICAgICAgICAgICAgcmVxdWVzdCh1cmwsIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IFtSRVBPU1tpXV06IHJlc3BvbnNlLnN0YXR1c1RleHQgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W1JFUE9TW2ldXTogSlNPTi5wYXJzZShib2R5KS5jb21taXRzfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9lbGVtZW50c0ZvckNvbW1pdChjb21taXQpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaSBrZXk9e2NvbW1pdC5zaGF9IGNsYXNzTmFtZT1cIm14X0NoYW5nZWxvZ0RpYWxvZ19saVwiPlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9e2NvbW1pdC5odG1sX3VybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPlxuICAgICAgICAgICAgICAgICAgICB7Y29tbWl0LmNvbW1pdC5tZXNzYWdlLnNwbGl0KCdcXG4nKVswXX1cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLlNwaW5uZXInKTtcbiAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nJyk7XG5cbiAgICAgICAgY29uc3QgbG9ncyA9IFJFUE9TLm1hcChyZXBvID0+IHtcbiAgICAgICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGVbcmVwb10gPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSA8U3Bpbm5lciBrZXk9e3JlcG99IC8+O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5zdGF0ZVtyZXBvXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBfdChcIlVuYWJsZSB0byBsb2FkIGNvbW1pdCBkZXRhaWw6ICUobXNnKXNcIiwge1xuICAgICAgICAgICAgICAgICAgICBtc2c6IHRoaXMuc3RhdGVbcmVwb10sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnN0YXRlW3JlcG9dLm1hcCh0aGlzLl9lbGVtZW50c0ZvckNvbW1pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyZXBvfT5cbiAgICAgICAgICAgICAgICAgICAgPGgyPntyZXBvfTwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDx1bD57Y29udGVudH08L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY29udGVudCA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2hhbmdlbG9nRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy52ZXJzaW9uID09IG51bGwgfHwgdGhpcy5wcm9wcy5uZXdWZXJzaW9uID09IG51bGwgPyA8aDI+e190KFwiVW5hdmFpbGFibGVcIil9PC9oMj4gOiBsb2dzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFF1ZXN0aW9uRGlhbG9nXG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiQ2hhbmdlbG9nXCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtjb250ZW50fVxuICAgICAgICAgICAgICAgIGJ1dHRvbj17X3QoXCJVcGRhdGVcIil9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5DaGFuZ2Vsb2dEaWFsb2cucHJvcFR5cGVzID0ge1xuICAgIHZlcnNpb246IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBuZXdWZXJzaW9uOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbn07XG4iXX0=