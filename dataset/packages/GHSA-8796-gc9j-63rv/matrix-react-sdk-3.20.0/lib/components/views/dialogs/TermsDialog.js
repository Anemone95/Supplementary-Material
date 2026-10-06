"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _serviceTypes = require("matrix-js-sdk/src/service-types");

var _dec, _class, _class2, _temp;

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
let TermsDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.TermsDialog"), _dec(_class = (_temp = _class2 = class TermsDialog extends _react.default.PureComponent {
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
      case _serviceTypes.SERVICE_TYPES.IS:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Identity Server"), /*#__PURE__*/_react.default.createElement("br", null), "(", host, ")");

      case _serviceTypes.SERVICE_TYPES.IM:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Integration Manager"), /*#__PURE__*/_react.default.createElement("br", null), "(", host, ")");
    }
  }

  _summaryForServiceType(serviceType) {
    switch (serviceType) {
      case _serviceTypes.SERVICE_TYPES.IS:
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Find others by phone or email"), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Be found by phone or email"));

      case _serviceTypes.SERVICE_TYPES.IM:
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
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
}), _temp)) || _class);
exports.default = TermsDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVGVybXNEaWFsb2cuanMiXSwibmFtZXMiOlsiVGVybXNDaGVja2JveCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImV2IiwicHJvcHMiLCJvbkNoYW5nZSIsInVybCIsInRhcmdldCIsImNoZWNrZWQiLCJyZW5kZXIiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCIsInN0cmluZyIsImJvb2wiLCJUZXJtc0RpYWxvZyIsImNvbnN0cnVjdG9yIiwib25GaW5pc2hlZCIsIk9iamVjdCIsImtleXMiLCJzdGF0ZSIsImFncmVlZFVybHMiLCJmaWx0ZXIiLCJzZXRTdGF0ZSIsImFzc2lnbiIsIl9uYW1lRm9yU2VydmljZVR5cGUiLCJzZXJ2aWNlVHlwZSIsImhvc3QiLCJTRVJWSUNFX1RZUEVTIiwiSVMiLCJJTSIsIl9zdW1tYXJ5Rm9yU2VydmljZVR5cGUiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsInJvd3MiLCJwb2xpY2llc0FuZFNlcnZpY2UiLCJwb2xpY2llc0FuZFNlcnZpY2VQYWlycyIsInBhcnNlZEJhc2VVcmwiLCJwYXJzZSIsInNlcnZpY2UiLCJiYXNlVXJsIiwicG9saWN5VmFsdWVzIiwidmFsdWVzIiwicG9saWNpZXMiLCJpIiwibGVuZ3RoIiwidGVybURvYyIsInRlcm1zTGFuZyIsImsiLCJzZXJ2aWNlTmFtZSIsInN1bW1hcnkiLCJwdXNoIiwibmFtZSIsIl9vblRlcm1zQ2hlY2tib3hDaGFuZ2UiLCJCb29sZWFuIiwiZW5hYmxlU3VibWl0IiwiZG9jc0FncmVlZEZvclNlcnZpY2UiLCJ0ZXJtcyIsImRvY0FncmVlZCIsImxhbmciLCJfb25DYW5jZWxDbGljayIsIl9vbk5leHRDbGljayIsImFycmF5IiwiYXJyYXlPZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7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QVEsRUFBRSxLQUFLMEIsY0FGbkI7QUFHSSxNQUFBLG9CQUFvQixFQUFFLEtBQUtDLFlBSC9CO0FBSUksTUFBQSxlQUFlLEVBQUUsQ0FBQ047QUFKdEIsTUFyQkosQ0FESjtBQThCSDs7QUFoS3dELEMsc0RBQ3RDO0FBQ2Y7QUFDUjtBQUNBO0FBQ0E7QUFDUW5CLEVBQUFBLHVCQUF1QixFQUFFNUIsbUJBQVVzRCxLQUFWLENBQWdCcEQsVUFMMUI7O0FBT2Y7QUFDUjtBQUNBO0FBQ1FTLEVBQUFBLFVBQVUsRUFBRVgsbUJBQVV1RCxPQUFWLENBQWtCdkQsbUJBQVVHLE1BQTVCLENBVkc7O0FBWWY7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNRSSxFQUFBQSxVQUFVLEVBQUVQLG1CQUFVQyxJQUFWLENBQWVDO0FBakJaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCwgcGlja0Jlc3RMYW5ndWFnZSB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5cbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHtTRVJWSUNFX1RZUEVTfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvc2VydmljZS10eXBlc1wiO1xuXG5jbGFzcyBUZXJtc0NoZWNrYm94IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBjaGVja2VkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIG9uQ2hhbmdlID0gKGV2KSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy51cmwsIGV2LnRhcmdldC5jaGVja2VkKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5jaGVja2VkfVxuICAgICAgICAvPjtcbiAgICB9XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuVGVybXNEaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1zRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IG9mIFtTZXJ2aWNlLCBwb2xpY2llc10gcGFpcnMsIHdoZXJlIHBvbGljaWVzIGlzIHRoZSByZXNwb25zZSBmcm9tIHRoZVxuICAgICAgICAgKiAvdGVybXMgZW5kcG9pbnQgZm9yIHRoYXQgc2VydmljZVxuICAgICAgICAgKi9cbiAgICAgICAgcG9saWNpZXNBbmRTZXJ2aWNlUGFpcnM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB1cmxzIHRoYXQgdGhlIHVzZXIgaGFzIGFscmVhZHkgYWdyZWVkIHRvXG4gICAgICAgICAqL1xuICAgICAgICBhZ3JlZWRVcmxzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc3RyaW5nKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbGVkIHdpdGg6XG4gICAgICAgICAqICAgICAqIHN1Y2Nlc3Mge2Jvb2x9IFRydWUgaWYgdGhlIHVzZXIgYWNjZXB0ZWQgYW55IGRvdW1lbnRzLCBmYWxzZSBpZiBjYW5jZWxsZWRcbiAgICAgICAgICogICAgICogYWdyZWVkVXJscyB7c3RyaW5nW119IExpc3Qgb2YgYWdyZWVkIFVSTHNcbiAgICAgICAgICovXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIHVybCAtPiBib29sZWFuXG4gICAgICAgICAgICBhZ3JlZWRVcmxzOiB7fSxcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChjb25zdCB1cmwgb2YgcHJvcHMuYWdyZWVkVXJscykge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5hZ3JlZWRVcmxzW3VybF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uQ2FuY2VsQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgX29uTmV4dENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSwgT2JqZWN0LmtleXModGhpcy5zdGF0ZS5hZ3JlZWRVcmxzKS5maWx0ZXIoKHVybCkgPT4gdGhpcy5zdGF0ZS5hZ3JlZWRVcmxzW3VybF0pKTtcbiAgICB9XG5cbiAgICBfbmFtZUZvclNlcnZpY2VUeXBlKHNlcnZpY2VUeXBlLCBob3N0KSB7XG4gICAgICAgIHN3aXRjaCAoc2VydmljZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU0VSVklDRV9UWVBFUy5JUzpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj57X3QoXCJJZGVudGl0eSBTZXJ2ZXJcIil9PGJyIC8+KHtob3N0fSk8L2Rpdj47XG4gICAgICAgICAgICBjYXNlIFNFUlZJQ0VfVFlQRVMuSU06XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXY+e190KFwiSW50ZWdyYXRpb24gTWFuYWdlclwiKX08YnIgLz4oe2hvc3R9KTwvZGl2PjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zdW1tYXJ5Rm9yU2VydmljZVR5cGUoc2VydmljZVR5cGUpIHtcbiAgICAgICAgc3dpdGNoIChzZXJ2aWNlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTRVJWSUNFX1RZUEVTLklTOlxuICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJGaW5kIG90aGVycyBieSBwaG9uZSBvciBlbWFpbFwiKX1cbiAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkJlIGZvdW5kIGJ5IHBob25lIG9yIGVtYWlsXCIpfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIGNhc2UgU0VSVklDRV9UWVBFUy5JTTpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiVXNlIGJvdHMsIGJyaWRnZXMsIHdpZGdldHMgYW5kIHN0aWNrZXIgcGFja3NcIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uVGVybXNDaGVja2JveENoYW5nZSA9ICh1cmwsIGNoZWNrZWQpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhZ3JlZWRVcmxzOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLmFncmVlZFVybHMsIHsgW3VybF06IGNoZWNrZWQgfSksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuXG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwb2xpY2llc0FuZFNlcnZpY2Ugb2YgdGhpcy5wcm9wcy5wb2xpY2llc0FuZFNlcnZpY2VQYWlycykge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkQmFzZVVybCA9IHVybC5wYXJzZShwb2xpY2llc0FuZFNlcnZpY2Uuc2VydmljZS5iYXNlVXJsKTtcblxuICAgICAgICAgICAgY29uc3QgcG9saWN5VmFsdWVzID0gT2JqZWN0LnZhbHVlcyhwb2xpY2llc0FuZFNlcnZpY2UucG9saWNpZXMpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2xpY3lWYWx1ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXJtRG9jID0gcG9saWN5VmFsdWVzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1zTGFuZyA9IHBpY2tCZXN0TGFuZ3VhZ2UoT2JqZWN0LmtleXModGVybURvYykuZmlsdGVyKChrKSA9PiBrICE9PSAndmVyc2lvbicpKTtcbiAgICAgICAgICAgICAgICBsZXQgc2VydmljZU5hbWU7XG4gICAgICAgICAgICAgICAgbGV0IHN1bW1hcnk7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZU5hbWUgPSB0aGlzLl9uYW1lRm9yU2VydmljZVR5cGUocG9saWNpZXNBbmRTZXJ2aWNlLnNlcnZpY2Uuc2VydmljZVR5cGUsIHBhcnNlZEJhc2VVcmwuaG9zdCk7XG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnkgPSB0aGlzLl9zdW1tYXJ5Rm9yU2VydmljZVR5cGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2xpY2llc0FuZFNlcnZpY2Uuc2VydmljZS5zZXJ2aWNlVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByb3dzLnB1c2goPHRyIGtleT17dGVybURvY1t0ZXJtc0xhbmddLnVybH0+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJteF9UZXJtc0RpYWxvZ19zZXJ2aWNlXCI+e3NlcnZpY2VOYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJteF9UZXJtc0RpYWxvZ19zdW1tYXJ5XCI+e3N1bW1hcnl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPnt0ZXJtRG9jW3Rlcm1zTGFuZ10ubmFtZX0gPGEgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9e3Rlcm1Eb2NbdGVybXNMYW5nXS51cmx9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVGVybXNEaWFsb2dfbGlua1wiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvYT48L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+PFRlcm1zQ2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybD17dGVybURvY1t0ZXJtc0xhbmddLnVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vblRlcm1zQ2hlY2tib3hDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtCb29sZWFuKHRoaXMuc3RhdGUuYWdyZWVkVXJsc1t0ZXJtRG9jW3Rlcm1zTGFuZ10udXJsXSl9XG4gICAgICAgICAgICAgICAgICAgIC8+PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBhbGwgdGhlIGRvY3VtZW50cyBmb3IgYXQgbGVhc3Qgb25lIHNlcnZpY2UgaGF2ZSBiZWVuIGNoZWNrZWQsIHdlIGNhbiBlbmFibGVcbiAgICAgICAgLy8gdGhlIHN1Ym1pdCBidXR0b25cbiAgICAgICAgbGV0IGVuYWJsZVN1Ym1pdCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljaWVzQW5kU2VydmljZSBvZiB0aGlzLnByb3BzLnBvbGljaWVzQW5kU2VydmljZVBhaXJzKSB7XG4gICAgICAgICAgICBsZXQgZG9jc0FncmVlZEZvclNlcnZpY2UgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0ZXJtcyBvZiBPYmplY3QudmFsdWVzKHBvbGljaWVzQW5kU2VydmljZS5wb2xpY2llcykpIHtcbiAgICAgICAgICAgICAgICBsZXQgZG9jQWdyZWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBsYW5nIG9mIE9iamVjdC5rZXlzKHRlcm1zKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFuZyA9PT0gJ3ZlcnNpb24nKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWdyZWVkVXJsc1t0ZXJtc1tsYW5nXS51cmxdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2NBZ3JlZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRvY0FncmVlZCkge1xuICAgICAgICAgICAgICAgICAgICArK2RvY3NBZ3JlZWRGb3JTZXJ2aWNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2NzQWdyZWVkRm9yU2VydmljZSA9PT0gT2JqZWN0LmtleXMocG9saWNpZXNBbmRTZXJ2aWNlLnBvbGljaWVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBlbmFibGVTdWJtaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgZml4ZWRXaWR0aD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5fb25DYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJUZXJtcyBvZiBTZXJ2aWNlXCIpfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcIlRvIGNvbnRpbnVlIHlvdSBuZWVkIHRvIGFjY2VwdCB0aGUgdGVybXMgb2YgdGhpcyBzZXJ2aWNlLlwiKX08L3A+XG5cbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIm14X1Rlcm1zRGlhbG9nX3Rlcm1zVGFibGVcIj48dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwibXhfVGVybXNEaWFsb2dfdGVybXNUYWJsZUhlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD57X3QoXCJTZXJ2aWNlXCIpfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPntfdChcIlN1bW1hcnlcIil9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+e190KFwiRG9jdW1lbnRcIil9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+e190KFwiQWNjZXB0XCIpfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAge3Jvd3N9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+PC90YWJsZT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdOZXh0Jyl9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMuX29uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vbk5leHRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXshZW5hYmxlU3VibWl0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19