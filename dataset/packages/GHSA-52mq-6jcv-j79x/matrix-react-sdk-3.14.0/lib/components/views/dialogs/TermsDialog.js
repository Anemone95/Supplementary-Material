"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _matrixJsSdk = _interopRequireDefault(require("matrix-js-sdk"));

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
class TermsCheckbox extends _react.default.PureComponent {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onChange", ev => {
      this.props.onChange(this.props.url, ev.target.checked);
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("input", {
      type: "checkbox",
      onChange: this.onChange,
      checked: this.props.checked
    });
  }

}

(0, _defineProperty2.default)(TermsCheckbox, "propTypes", {
  onChange: _propTypes.default.func.isRequired,
  url: _propTypes.default.string.isRequired,
  checked: _propTypes.default.bool.isRequired
});

class TermsDialog extends _react.default.PureComponent {
  constructor(props) {
    super();
    (0, _defineProperty2.default)(this, "_onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onNextClick", () => {
      this.props.onFinished(true, Object.keys(this.state.agreedUrls).filter(url => this.state.agreedUrls[url]));
    });
    (0, _defineProperty2.default)(this, "_onTermsCheckboxChange", (url, checked) => {
      this.setState({
        agreedUrls: Object.assign({}, this.state.agreedUrls, {
          [url]: checked
        })
      });
    });
    this.state = {
      // url -> boolean
      agreedUrls: {}
    };

    for (const url of props.agreedUrls) {
      this.state.agreedUrls[url] = true;
    }
  }

  _nameForServiceType(serviceType, host) {
    switch (serviceType) {
      case _matrixJsSdk.default.SERVICE_TYPES.IS:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Identity Server"), /*#__PURE__*/_react.default.createElement("br", null), "(", host, ")");

      case _matrixJsSdk.default.SERVICE_TYPES.IM:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Integration Manager"), /*#__PURE__*/_react.default.createElement("br", null), "(", host, ")");
    }
  }

  _summaryForServiceType(serviceType) {
    switch (serviceType) {
      case _matrixJsSdk.default.SERVICE_TYPES.IS:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Find others by phone or email"), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Be found by phone or email"));

      case _matrixJsSdk.default.SERVICE_TYPES.IM:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Use bots, bridges, widgets and sticker packs"));
    }
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    const rows = [];

    for (const policiesAndService of this.props.policiesAndServicePairs) {
      const parsedBaseUrl = _url.default.parse(policiesAndService.service.baseUrl);

      const policyValues = Object.values(policiesAndService.policies);

      for (let i = 0; i < policyValues.length; ++i) {
        const termDoc = policyValues[i];
        const termsLang = (0, _languageHandler.pickBestLanguage)(Object.keys(termDoc).filter(k => k !== 'version'));
        let serviceName;
        let summary;

        if (i === 0) {
          serviceName = this._nameForServiceType(policiesAndService.service.serviceType, parsedBaseUrl.host);
          summary = this._summaryForServiceType(policiesAndService.service.serviceType);
        }

        rows.push( /*#__PURE__*/_react.default.createElement("tr", {
          key: termDoc[termsLang].url
        }, /*#__PURE__*/_react.default.createElement("td", {
          className: "mx_TermsDialog_service"
        }, serviceName), /*#__PURE__*/_react.default.createElement("td", {
          className: "mx_TermsDialog_summary"
        }, summary), /*#__PURE__*/_react.default.createElement("td", null, termDoc[termsLang].name, " ", /*#__PURE__*/_react.default.createElement("a", {
          rel: "noreferrer noopener",
          target: "_blank",
          href: termDoc[termsLang].url
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_TermsDialog_link"
        }))), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement(TermsCheckbox, {
          url: termDoc[termsLang].url,
          onChange: this._onTermsCheckboxChange,
          checked: Boolean(this.state.agreedUrls[termDoc[termsLang].url])
        }))));
      }
    } // if all the documents for at least one service have been checked, we can enable
    // the submit button


    let enableSubmit = false;

    for (const policiesAndService of this.props.policiesAndServicePairs) {
      let docsAgreedForService = 0;

      for (const terms of Object.values(policiesAndService.policies)) {
        let docAgreed = false;

        for (const lang of Object.keys(terms)) {
          if (lang === 'version') continue;

          if (this.state.agreedUrls[terms[lang].url]) {
            docAgreed = true;
            break;
          }
        }

        if (docAgreed) {
          ++docsAgreedForService;
        }
      }

      if (docsAgreedForService === Object.keys(policiesAndService.policies).length) {
        enableSubmit = true;
        break;
      }
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      fixedWidth: false,
      onFinished: this._onCancelClick,
      title: (0, _languageHandler._t)("Terms of Service"),
      contentId: "mx_Dialog_content",
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To continue you need to accept the terms of this service.")), /*#__PURE__*/_react.default.createElement("table", {
      className: "mx_TermsDialog_termsTable"
    }, /*#__PURE__*/_react.default.createElement("tbody", null, /*#__PURE__*/_react.default.createElement("tr", {
      className: "mx_TermsDialog_termsTableHeader"
    }, /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Service")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Summary")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Document")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Accept"))), rows))), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)('Next'),
      hasCancel: true,
      onCancel: this._onCancelClick,
      onPrimaryButtonClick: this._onNextClick,
      primaryDisabled: !enableSubmit
    }));
  }

}

exports.default = TermsDialog;
(0, _defineProperty2.default)(TermsDialog, "propTypes", {
  /**
   * Array of [Service, policies] pairs, where policies is the response from the
   * /terms endpoint for that service
   */
  policiesAndServicePairs: _propTypes.default.array.isRequired,

  /**
   * urls that the user has already agreed to
   */
  agreedUrls: _propTypes.default.arrayOf(_propTypes.default.string),

  /**
   * Called with:
   *     * success {bool} True if the user accepted any douments, false if cancelled
   *     * agreedUrls {string[]} List of agreed URLs
   */
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVGVybXNEaWFsb2cuanMiXSwibmFtZXMiOlsiVGVybXNDaGVja2JveCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImV2IiwicHJvcHMiLCJvbkNoYW5nZSIsInVybCIsInRhcmdldCIsImNoZWNrZWQiLCJyZW5kZXIiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCIsInN0cmluZyIsImJvb2wiLCJUZXJtc0RpYWxvZyIsImNvbnN0cnVjdG9yIiwib25GaW5pc2hlZCIsIk9iamVjdCIsImtleXMiLCJzdGF0ZSIsImFncmVlZFVybHMiLCJmaWx0ZXIiLCJzZXRTdGF0ZSIsImFzc2lnbiIsIl9uYW1lRm9yU2VydmljZVR5cGUiLCJzZXJ2aWNlVHlwZSIsImhvc3QiLCJNYXRyaXgiLCJTRVJWSUNFX1RZUEVTIiwiSVMiLCJJTSIsIl9zdW1tYXJ5Rm9yU2VydmljZVR5cGUiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsInJvd3MiLCJwb2xpY2llc0FuZFNlcnZpY2UiLCJwb2xpY2llc0FuZFNlcnZpY2VQYWlycyIsInBhcnNlZEJhc2VVcmwiLCJwYXJzZSIsInNlcnZpY2UiLCJiYXNlVXJsIiwicG9saWN5VmFsdWVzIiwidmFsdWVzIiwicG9saWNpZXMiLCJpIiwibGVuZ3RoIiwidGVybURvYyIsInRlcm1zTGFuZyIsImsiLCJzZXJ2aWNlTmFtZSIsInN1bW1hcnkiLCJwdXNoIiwibmFtZSIsIl9vblRlcm1zQ2hlY2tib3hDaGFuZ2UiLCJCb29sZWFuIiwiZW5hYmxlU3VibWl0IiwiZG9jc0FncmVlZEZvclNlcnZpY2UiLCJ0ZXJtcyIsImRvY0FncmVlZCIsImxhbmciLCJfb25DYW5jZWxDbGljayIsIl9vbk5leHRDbGljayIsImFycmF5IiwiYXJyYXlPZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFD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QVBKLGVBcUJJLDZCQUFDLGFBQUQ7QUFBZSxNQUFBLGFBQWEsRUFBRSx5QkFBRyxNQUFILENBQTlCO0FBQ0ksTUFBQSxTQUFTLEVBQUUsSUFEZjtBQUVJLE1BQUEsUUFBUSxFQUFFLEtBQUswQixjQUZuQjtBQUdJLE1BQUEsb0JBQW9CLEVBQUUsS0FBS0MsWUFIL0I7QUFJSSxNQUFBLGVBQWUsRUFBRSxDQUFDTjtBQUp0QixNQXJCSixDQURKO0FBOEJIOztBQWhLd0Q7Ozs4QkFBeEMzQyxXLGVBQ0U7QUFDZjtBQUNSO0FBQ0E7QUFDQTtBQUNRd0IsRUFBQUEsdUJBQXVCLEVBQUU3QixtQkFBVXVELEtBQVYsQ0FBZ0JyRCxVQUwxQjs7QUFPZjtBQUNSO0FBQ0E7QUFDUVMsRUFBQUEsVUFBVSxFQUFFWCxtQkFBVXdELE9BQVYsQ0FBa0J4RCxtQkFBVUcsTUFBNUIsQ0FWRzs7QUFZZjtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ1FJLEVBQUFBLFVBQVUsRUFBRVAsbUJBQVVDLElBQVYsQ0FBZUM7QUFqQlosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90LCBwaWNrQmVzdExhbmd1YWdlIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuaW1wb3J0IE1hdHJpeCBmcm9tICdtYXRyaXgtanMtc2RrJztcblxuY2xhc3MgVGVybXNDaGVja2JveCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICB1cmw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgY2hlY2tlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB9XG5cbiAgICBvbkNoYW5nZSA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMudXJsLCBldi50YXJnZXQuY2hlY2tlZCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGlucHV0IHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuY2hlY2tlZH1cbiAgICAgICAgLz47XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJtc0RpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSBvZiBbU2VydmljZSwgcG9saWNpZXNdIHBhaXJzLCB3aGVyZSBwb2xpY2llcyBpcyB0aGUgcmVzcG9uc2UgZnJvbSB0aGVcbiAgICAgICAgICogL3Rlcm1zIGVuZHBvaW50IGZvciB0aGF0IHNlcnZpY2VcbiAgICAgICAgICovXG4gICAgICAgIHBvbGljaWVzQW5kU2VydmljZVBhaXJzOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogdXJscyB0aGF0IHRoZSB1c2VyIGhhcyBhbHJlYWR5IGFncmVlZCB0b1xuICAgICAgICAgKi9cbiAgICAgICAgYWdyZWVkVXJsczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCB3aXRoOlxuICAgICAgICAgKiAgICAgKiBzdWNjZXNzIHtib29sfSBUcnVlIGlmIHRoZSB1c2VyIGFjY2VwdGVkIGFueSBkb3VtZW50cywgZmFsc2UgaWYgY2FuY2VsbGVkXG4gICAgICAgICAqICAgICAqIGFncmVlZFVybHMge3N0cmluZ1tdfSBMaXN0IG9mIGFncmVlZCBVUkxzXG4gICAgICAgICAqL1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyB1cmwgLT4gYm9vbGVhblxuICAgICAgICAgICAgYWdyZWVkVXJsczoge30sXG4gICAgICAgIH07XG4gICAgICAgIGZvciAoY29uc3QgdXJsIG9mIHByb3BzLmFncmVlZFVybHMpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYWdyZWVkVXJsc1t1cmxdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbkNhbmNlbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH1cblxuICAgIF9vbk5leHRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUsIE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuYWdyZWVkVXJscykuZmlsdGVyKCh1cmwpID0+IHRoaXMuc3RhdGUuYWdyZWVkVXJsc1t1cmxdKSk7XG4gICAgfVxuXG4gICAgX25hbWVGb3JTZXJ2aWNlVHlwZShzZXJ2aWNlVHlwZSwgaG9zdCkge1xuICAgICAgICBzd2l0Y2ggKHNlcnZpY2VUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIE1hdHJpeC5TRVJWSUNFX1RZUEVTLklTOlxuICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2PntfdChcIklkZW50aXR5IFNlcnZlclwiKX08YnIgLz4oe2hvc3R9KTwvZGl2PjtcbiAgICAgICAgICAgIGNhc2UgTWF0cml4LlNFUlZJQ0VfVFlQRVMuSU06XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXY+e190KFwiSW50ZWdyYXRpb24gTWFuYWdlclwiKX08YnIgLz4oe2hvc3R9KTwvZGl2PjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zdW1tYXJ5Rm9yU2VydmljZVR5cGUoc2VydmljZVR5cGUpIHtcbiAgICAgICAgc3dpdGNoIChzZXJ2aWNlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBNYXRyaXguU0VSVklDRV9UWVBFUy5JUzpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiRmluZCBvdGhlcnMgYnkgcGhvbmUgb3IgZW1haWxcIil9XG4gICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJCZSBmb3VuZCBieSBwaG9uZSBvciBlbWFpbFwiKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICBjYXNlIE1hdHJpeC5TRVJWSUNFX1RZUEVTLklNOlxuICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJVc2UgYm90cywgYnJpZGdlcywgd2lkZ2V0cyBhbmQgc3RpY2tlciBwYWNrc1wiKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25UZXJtc0NoZWNrYm94Q2hhbmdlID0gKHVybCwgY2hlY2tlZCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFncmVlZFVybHM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuYWdyZWVkVXJscywgeyBbdXJsXTogY2hlY2tlZCB9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG5cbiAgICAgICAgY29uc3Qgcm93cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljaWVzQW5kU2VydmljZSBvZiB0aGlzLnByb3BzLnBvbGljaWVzQW5kU2VydmljZVBhaXJzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRCYXNlVXJsID0gdXJsLnBhcnNlKHBvbGljaWVzQW5kU2VydmljZS5zZXJ2aWNlLmJhc2VVcmwpO1xuXG4gICAgICAgICAgICBjb25zdCBwb2xpY3lWYWx1ZXMgPSBPYmplY3QudmFsdWVzKHBvbGljaWVzQW5kU2VydmljZS5wb2xpY2llcyk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvbGljeVZhbHVlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1Eb2MgPSBwb2xpY3lWYWx1ZXNbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgdGVybXNMYW5nID0gcGlja0Jlc3RMYW5ndWFnZShPYmplY3Qua2V5cyh0ZXJtRG9jKS5maWx0ZXIoKGspID0+IGsgIT09ICd2ZXJzaW9uJykpO1xuICAgICAgICAgICAgICAgIGxldCBzZXJ2aWNlTmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgc3VtbWFyeTtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlTmFtZSA9IHRoaXMuX25hbWVGb3JTZXJ2aWNlVHlwZShwb2xpY2llc0FuZFNlcnZpY2Uuc2VydmljZS5zZXJ2aWNlVHlwZSwgcGFyc2VkQmFzZVVybC5ob3N0KTtcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeSA9IHRoaXMuX3N1bW1hcnlGb3JTZXJ2aWNlVHlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvbGljaWVzQW5kU2VydmljZS5zZXJ2aWNlLnNlcnZpY2VUeXBlLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJvd3MucHVzaCg8dHIga2V5PXt0ZXJtRG9jW3Rlcm1zTGFuZ10udXJsfT5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm14X1Rlcm1zRGlhbG9nX3NlcnZpY2VcIj57c2VydmljZU5hbWV9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIm14X1Rlcm1zRGlhbG9nX3N1bW1hcnlcIj57c3VtbWFyeX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e3Rlcm1Eb2NbdGVybXNMYW5nXS5uYW1lfSA8YSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj17dGVybURvY1t0ZXJtc0xhbmddLnVybH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9UZXJtc0RpYWxvZ19saW5rXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD48VGVybXNDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXt0ZXJtRG9jW3Rlcm1zTGFuZ10udXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uVGVybXNDaGVja2JveENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e0Jvb2xlYW4odGhpcy5zdGF0ZS5hZ3JlZWRVcmxzW3Rlcm1Eb2NbdGVybXNMYW5nXS51cmxdKX1cbiAgICAgICAgICAgICAgICAgICAgLz48L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGFsbCB0aGUgZG9jdW1lbnRzIGZvciBhdCBsZWFzdCBvbmUgc2VydmljZSBoYXZlIGJlZW4gY2hlY2tlZCwgd2UgY2FuIGVuYWJsZVxuICAgICAgICAvLyB0aGUgc3VibWl0IGJ1dHRvblxuICAgICAgICBsZXQgZW5hYmxlU3VibWl0ID0gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3QgcG9saWNpZXNBbmRTZXJ2aWNlIG9mIHRoaXMucHJvcHMucG9saWNpZXNBbmRTZXJ2aWNlUGFpcnMpIHtcbiAgICAgICAgICAgIGxldCBkb2NzQWdyZWVkRm9yU2VydmljZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRlcm1zIG9mIE9iamVjdC52YWx1ZXMocG9saWNpZXNBbmRTZXJ2aWNlLnBvbGljaWVzKSkge1xuICAgICAgICAgICAgICAgIGxldCBkb2NBZ3JlZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxhbmcgb2YgT2JqZWN0LmtleXModGVybXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYW5nID09PSAndmVyc2lvbicpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5hZ3JlZWRVcmxzW3Rlcm1zW2xhbmddLnVybF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY0FncmVlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZG9jQWdyZWVkKSB7XG4gICAgICAgICAgICAgICAgICAgICsrZG9jc0FncmVlZEZvclNlcnZpY2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvY3NBZ3JlZWRGb3JTZXJ2aWNlID09PSBPYmplY3Qua2V5cyhwb2xpY2llc0FuZFNlcnZpY2UucG9saWNpZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGVuYWJsZVN1Ym1pdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBmaXhlZFdpZHRoPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlRlcm1zIG9mIFNlcnZpY2VcIil9XG4gICAgICAgICAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgPHA+e190KFwiVG8gY29udGludWUgeW91IG5lZWQgdG8gYWNjZXB0IHRoZSB0ZXJtcyBvZiB0aGlzIHNlcnZpY2UuXCIpfTwvcD5cblxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwibXhfVGVybXNEaWFsb2dfdGVybXNUYWJsZVwiPjx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJteF9UZXJtc0RpYWxvZ190ZXJtc1RhYmxlSGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPntfdChcIlNlcnZpY2VcIil9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+e190KFwiU3VtbWFyeVwiKX08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD57X3QoXCJEb2N1bWVudFwiKX08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD57X3QoXCJBY2NlcHRcIil9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cm93c31cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT48L3RhYmxlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ05leHQnKX1cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uTmV4dENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5RGlzYWJsZWQ9eyFlbmFibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=