"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../.."));

var _objects = require("../../../utils/objects");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

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
class InlineTermsAgreement extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_togglePolicy", index => {
      const policies = (0, _objects.objectClone)(this.state.policies);
      policies[index].checked = !policies[index].checked;
      this.setState({
        policies
      });
    });
    (0, _defineProperty2.default)(this, "_onContinue", () => {
      const hasUnchecked = !!this.state.policies.some(p => !p.checked);
      if (hasUnchecked) return;
      this.setState({
        busy: true
      });
      this.props.onFinished(this.state.policies.map(p => p.url));
    });
    this.state = {
      policies: [],
      busy: false
    };
  }

  componentDidMount() {
    // Build all the terms the user needs to accept
    const policies = []; // { checked, url, name }

    for (const servicePolicies of this.props.policiesAndServicePairs) {
      const availablePolicies = Object.values(servicePolicies.policies);

      for (const policy of availablePolicies) {
        const language = (0, _languageHandler.pickBestLanguage)(Object.keys(policy).filter(p => p !== 'version'));
        const renderablePolicy = {
          checked: false,
          url: policy[language].url,
          name: policy[language].name
        };
        policies.push(renderablePolicy);
      }
    }

    this.setState({
      policies
    });
  }

  _renderCheckboxes() {
    const rendered = [];

    for (let i = 0; i < this.state.policies.length; i++) {
      const policy = this.state.policies[i];
      const introText = (0, _languageHandler._t)("Accept <policyLink /> to continue:", {}, {
        policyLink: () => {
          return /*#__PURE__*/_react.default.createElement("a", {
            href: policy.url,
            rel: "noreferrer noopener",
            target: "_blank"
          }, policy.name, /*#__PURE__*/_react.default.createElement("span", {
            className: "mx_InlineTermsAgreement_link"
          }));
        }
      });
      rendered.push( /*#__PURE__*/_react.default.createElement("div", {
        key: i,
        className: "mx_InlineTermsAgreement_cbContainer"
      }, /*#__PURE__*/_react.default.createElement("div", null, introText), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InlineTermsAgreement_checkbox"
      }, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        onChange: () => this._togglePolicy(i),
        checked: policy.checked
      }, (0, _languageHandler._t)("Accept")))));
    }

    return rendered;
  }

  render() {
    const AccessibleButton = sdk.getComponent("views.elements.AccessibleButton");
    const hasUnchecked = !!this.state.policies.some(p => !p.checked);
    return /*#__PURE__*/_react.default.createElement("div", null, this.props.introElement, this._renderCheckboxes(), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      onClick: this._onContinue,
      disabled: hasUnchecked || this.state.busy,
      kind: "primary_sm"
    }, (0, _languageHandler._t)("Continue")));
  }

}

exports.default = InlineTermsAgreement;
(0, _defineProperty2.default)(InlineTermsAgreement, "propTypes", {
  policiesAndServicePairs: _propTypes.default.array.isRequired,
  // array of service/policy pairs
  agreedUrls: _propTypes.default.array.isRequired,
  // array of URLs the user has accepted
  onFinished: _propTypes.default.func.isRequired,
  // takes an argument of accepted URLs
  introElement: _propTypes.default.node
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Rlcm1zL0lubGluZVRlcm1zQWdyZWVtZW50LmpzIl0sIm5hbWVzIjpbIklubGluZVRlcm1zQWdyZWVtZW50IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsImluZGV4IiwicG9saWNpZXMiLCJzdGF0ZSIsImNoZWNrZWQiLCJzZXRTdGF0ZSIsImhhc1VuY2hlY2tlZCIsInNvbWUiLCJwIiwiYnVzeSIsInByb3BzIiwib25GaW5pc2hlZCIsIm1hcCIsInVybCIsImNvbXBvbmVudERpZE1vdW50Iiwic2VydmljZVBvbGljaWVzIiwicG9saWNpZXNBbmRTZXJ2aWNlUGFpcnMiLCJhdmFpbGFibGVQb2xpY2llcyIsIk9iamVjdCIsInZhbHVlcyIsInBvbGljeSIsImxhbmd1YWdlIiwia2V5cyIsImZpbHRlciIsInJlbmRlcmFibGVQb2xpY3kiLCJuYW1lIiwicHVzaCIsIl9yZW5kZXJDaGVja2JveGVzIiwicmVuZGVyZWQiLCJpIiwibGVuZ3RoIiwiaW50cm9UZXh0IiwicG9saWN5TGluayIsIl90b2dnbGVQb2xpY3kiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiaW50cm9FbGVtZW50IiwiX29uQ29udGludWUiLCJQcm9wVHlwZXMiLCJhcnJheSIsImlzUmVxdWlyZWQiLCJhZ3JlZWRVcmxzIiwiZnVuYyIsIm5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNlLE1BQU1BLG9CQUFOLFNBQW1DQyxlQUFNQyxTQUF6QyxDQUFtRDtBQVE5REMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSx5REE0QkdDLEtBQUQsSUFBVztBQUN2QixZQUFNQyxRQUFRLEdBQUcsMEJBQVksS0FBS0MsS0FBTCxDQUFXRCxRQUF2QixDQUFqQjtBQUNBQSxNQUFBQSxRQUFRLENBQUNELEtBQUQsQ0FBUixDQUFnQkcsT0FBaEIsR0FBMEIsQ0FBQ0YsUUFBUSxDQUFDRCxLQUFELENBQVIsQ0FBZ0JHLE9BQTNDO0FBQ0EsV0FBS0MsUUFBTCxDQUFjO0FBQUNILFFBQUFBO0FBQUQsT0FBZDtBQUNILEtBaENhO0FBQUEsdURBa0NBLE1BQU07QUFDaEIsWUFBTUksWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLSCxLQUFMLENBQVdELFFBQVgsQ0FBb0JLLElBQXBCLENBQXlCQyxDQUFDLElBQUksQ0FBQ0EsQ0FBQyxDQUFDSixPQUFqQyxDQUF2QjtBQUNBLFVBQUlFLFlBQUosRUFBa0I7QUFFbEIsV0FBS0QsUUFBTCxDQUFjO0FBQUNJLFFBQUFBLElBQUksRUFBRTtBQUFQLE9BQWQ7QUFDQSxXQUFLQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsS0FBS1IsS0FBTCxDQUFXRCxRQUFYLENBQW9CVSxHQUFwQixDQUF3QkosQ0FBQyxJQUFJQSxDQUFDLENBQUNLLEdBQS9CLENBQXRCO0FBQ0gsS0F4Q2E7QUFHVixTQUFLVixLQUFMLEdBQWE7QUFDVEQsTUFBQUEsUUFBUSxFQUFFLEVBREQ7QUFFVE8sTUFBQUEsSUFBSSxFQUFFO0FBRkcsS0FBYjtBQUlIOztBQUVESyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQjtBQUNBLFVBQU1aLFFBQVEsR0FBRyxFQUFqQixDQUZnQixDQUVLOztBQUNyQixTQUFLLE1BQU1hLGVBQVgsSUFBOEIsS0FBS0wsS0FBTCxDQUFXTSx1QkFBekMsRUFBa0U7QUFDOUQsWUFBTUMsaUJBQWlCLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjSixlQUFlLENBQUNiLFFBQTlCLENBQTFCOztBQUNBLFdBQUssTUFBTWtCLE1BQVgsSUFBcUJILGlCQUFyQixFQUF3QztBQUNwQyxjQUFNSSxRQUFRLEdBQUcsdUNBQWlCSCxNQUFNLENBQUNJLElBQVAsQ0FBWUYsTUFBWixFQUFvQkcsTUFBcEIsQ0FBMkJmLENBQUMsSUFBSUEsQ0FBQyxLQUFLLFNBQXRDLENBQWpCLENBQWpCO0FBQ0EsY0FBTWdCLGdCQUFnQixHQUFHO0FBQ3JCcEIsVUFBQUEsT0FBTyxFQUFFLEtBRFk7QUFFckJTLFVBQUFBLEdBQUcsRUFBRU8sTUFBTSxDQUFDQyxRQUFELENBQU4sQ0FBaUJSLEdBRkQ7QUFHckJZLFVBQUFBLElBQUksRUFBRUwsTUFBTSxDQUFDQyxRQUFELENBQU4sQ0FBaUJJO0FBSEYsU0FBekI7QUFLQXZCLFFBQUFBLFFBQVEsQ0FBQ3dCLElBQVQsQ0FBY0YsZ0JBQWQ7QUFDSDtBQUNKOztBQUVELFNBQUtuQixRQUFMLENBQWM7QUFBQ0gsTUFBQUE7QUFBRCxLQUFkO0FBQ0g7O0FBZ0JEeUIsRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEIsVUFBTUMsUUFBUSxHQUFHLEVBQWpCOztBQUNBLFNBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxLQUFLMUIsS0FBTCxDQUFXRCxRQUFYLENBQW9CNEIsTUFBeEMsRUFBZ0RELENBQUMsRUFBakQsRUFBcUQ7QUFDakQsWUFBTVQsTUFBTSxHQUFHLEtBQUtqQixLQUFMLENBQVdELFFBQVgsQ0FBb0IyQixDQUFwQixDQUFmO0FBQ0EsWUFBTUUsU0FBUyxHQUFHLHlCQUNkLG9DQURjLEVBQ3dCLEVBRHhCLEVBQzRCO0FBQ3RDQyxRQUFBQSxVQUFVLEVBQUUsTUFBTTtBQUNkLDhCQUNJO0FBQUcsWUFBQSxJQUFJLEVBQUVaLE1BQU0sQ0FBQ1AsR0FBaEI7QUFBcUIsWUFBQSxHQUFHLEVBQUMscUJBQXpCO0FBQStDLFlBQUEsTUFBTSxFQUFDO0FBQXRELGFBQ0tPLE1BQU0sQ0FBQ0ssSUFEWixlQUVJO0FBQU0sWUFBQSxTQUFTLEVBQUM7QUFBaEIsWUFGSixDQURKO0FBTUg7QUFScUMsT0FENUIsQ0FBbEI7QUFZQUcsTUFBQUEsUUFBUSxDQUFDRixJQUFULGVBQ0k7QUFBSyxRQUFBLEdBQUcsRUFBRUcsQ0FBVjtBQUFhLFFBQUEsU0FBUyxFQUFDO0FBQXZCLHNCQUNJLDBDQUFNRSxTQUFOLENBREosZUFFSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksNkJBQUMsdUJBQUQ7QUFBZ0IsUUFBQSxRQUFRLEVBQUUsTUFBTSxLQUFLRSxhQUFMLENBQW1CSixDQUFuQixDQUFoQztBQUF1RCxRQUFBLE9BQU8sRUFBRVQsTUFBTSxDQUFDaEI7QUFBdkUsU0FDSyx5QkFBRyxRQUFILENBREwsQ0FESixDQUZKLENBREo7QUFVSDs7QUFDRCxXQUFPd0IsUUFBUDtBQUNIOztBQUVETSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxnQkFBZ0IsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLGlDQUFqQixDQUF6QjtBQUNBLFVBQU0vQixZQUFZLEdBQUcsQ0FBQyxDQUFDLEtBQUtILEtBQUwsQ0FBV0QsUUFBWCxDQUFvQkssSUFBcEIsQ0FBeUJDLENBQUMsSUFBSSxDQUFDQSxDQUFDLENBQUNKLE9BQWpDLENBQXZCO0FBRUEsd0JBQ0ksMENBQ0ssS0FBS00sS0FBTCxDQUFXNEIsWUFEaEIsRUFFSyxLQUFLWCxpQkFBTCxFQUZMLGVBR0ksNkJBQUMsZ0JBQUQ7QUFDSSxNQUFBLE9BQU8sRUFBRSxLQUFLWSxXQURsQjtBQUVJLE1BQUEsUUFBUSxFQUFFakMsWUFBWSxJQUFJLEtBQUtILEtBQUwsQ0FBV00sSUFGekM7QUFHSSxNQUFBLElBQUksRUFBQztBQUhULE9BS0sseUJBQUcsVUFBSCxDQUxMLENBSEosQ0FESjtBQWFIOztBQWpHNkQ7Ozs4QkFBN0NaLG9CLGVBQ0U7QUFDZm1CLEVBQUFBLHVCQUF1QixFQUFFd0IsbUJBQVVDLEtBQVYsQ0FBZ0JDLFVBRDFCO0FBQ3NDO0FBQ3JEQyxFQUFBQSxVQUFVLEVBQUVILG1CQUFVQyxLQUFWLENBQWdCQyxVQUZiO0FBRXlCO0FBQ3hDL0IsRUFBQUEsVUFBVSxFQUFFNkIsbUJBQVVJLElBQVYsQ0FBZUYsVUFIWjtBQUd3QjtBQUN2Q0osRUFBQUEsWUFBWSxFQUFFRSxtQkFBVUs7QUFKVCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiO1xuaW1wb3J0IHtfdCwgcGlja0Jlc3RMYW5ndWFnZX0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLlwiO1xuaW1wb3J0IHtvYmplY3RDbG9uZX0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL29iamVjdHNcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5saW5lVGVybXNBZ3JlZW1lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHBvbGljaWVzQW5kU2VydmljZVBhaXJzOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCwgLy8gYXJyYXkgb2Ygc2VydmljZS9wb2xpY3kgcGFpcnNcbiAgICAgICAgYWdyZWVkVXJsczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsIC8vIGFycmF5IG9mIFVSTHMgdGhlIHVzZXIgaGFzIGFjY2VwdGVkXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsIC8vIHRha2VzIGFuIGFyZ3VtZW50IG9mIGFjY2VwdGVkIFVSTHNcbiAgICAgICAgaW50cm9FbGVtZW50OiBQcm9wVHlwZXMubm9kZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBvbGljaWVzOiBbXSxcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAvLyBCdWlsZCBhbGwgdGhlIHRlcm1zIHRoZSB1c2VyIG5lZWRzIHRvIGFjY2VwdFxuICAgICAgICBjb25zdCBwb2xpY2llcyA9IFtdOyAvLyB7IGNoZWNrZWQsIHVybCwgbmFtZSB9XG4gICAgICAgIGZvciAoY29uc3Qgc2VydmljZVBvbGljaWVzIG9mIHRoaXMucHJvcHMucG9saWNpZXNBbmRTZXJ2aWNlUGFpcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZVBvbGljaWVzID0gT2JqZWN0LnZhbHVlcyhzZXJ2aWNlUG9saWNpZXMucG9saWNpZXMpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBwb2xpY3kgb2YgYXZhaWxhYmxlUG9saWNpZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYW5ndWFnZSA9IHBpY2tCZXN0TGFuZ3VhZ2UoT2JqZWN0LmtleXMocG9saWN5KS5maWx0ZXIocCA9PiBwICE9PSAndmVyc2lvbicpKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJhYmxlUG9saWN5ID0ge1xuICAgICAgICAgICAgICAgICAgICBjaGVja2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBwb2xpY3lbbGFuZ3VhZ2VdLnVybCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcG9saWN5W2xhbmd1YWdlXS5uYW1lLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcG9saWNpZXMucHVzaChyZW5kZXJhYmxlUG9saWN5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3BvbGljaWVzfSk7XG4gICAgfVxuXG4gICAgX3RvZ2dsZVBvbGljeSA9IChpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBwb2xpY2llcyA9IG9iamVjdENsb25lKHRoaXMuc3RhdGUucG9saWNpZXMpO1xuICAgICAgICBwb2xpY2llc1tpbmRleF0uY2hlY2tlZCA9ICFwb2xpY2llc1tpbmRleF0uY2hlY2tlZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cG9saWNpZXN9KTtcbiAgICB9O1xuXG4gICAgX29uQ29udGludWUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhc1VuY2hlY2tlZCA9ICEhdGhpcy5zdGF0ZS5wb2xpY2llcy5zb21lKHAgPT4gIXAuY2hlY2tlZCk7XG4gICAgICAgIGlmIChoYXNVbmNoZWNrZWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0aGlzLnN0YXRlLnBvbGljaWVzLm1hcChwID0+IHAudXJsKSk7XG4gICAgfTtcblxuICAgIF9yZW5kZXJDaGVja2JveGVzKCkge1xuICAgICAgICBjb25zdCByZW5kZXJlZCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3RhdGUucG9saWNpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBvbGljeSA9IHRoaXMuc3RhdGUucG9saWNpZXNbaV07XG4gICAgICAgICAgICBjb25zdCBpbnRyb1RleHQgPSBfdChcbiAgICAgICAgICAgICAgICBcIkFjY2VwdCA8cG9saWN5TGluayAvPiB0byBjb250aW51ZTpcIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgcG9saWN5TGluazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXtwb2xpY3kudXJsfSByZWw9J25vcmVmZXJyZXIgbm9vcGVuZXInIHRhcmdldD0nX2JsYW5rJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3BvbGljeS5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0lubGluZVRlcm1zQWdyZWVtZW50X2xpbmsnIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJlbmRlcmVkLnB1c2goXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT0nbXhfSW5saW5lVGVybXNBZ3JlZW1lbnRfY2JDb250YWluZXInPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PntpbnRyb1RleHR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9JbmxpbmVUZXJtc0FncmVlbWVudF9jaGVja2JveCc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkQ2hlY2tib3ggb25DaGFuZ2U9eygpID0+IHRoaXMuX3RvZ2dsZVBvbGljeShpKX0gY2hlY2tlZD17cG9saWN5LmNoZWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkFjY2VwdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkQ2hlY2tib3g+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlbmRlcmVkO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uXCIpO1xuICAgICAgICBjb25zdCBoYXNVbmNoZWNrZWQgPSAhIXRoaXMuc3RhdGUucG9saWNpZXMuc29tZShwID0+ICFwLmNoZWNrZWQpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmludHJvRWxlbWVudH1cbiAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyQ2hlY2tib3hlcygpfVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ29udGludWV9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtoYXNVbmNoZWNrZWQgfHwgdGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9zbVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJDb250aW51ZVwiKX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=