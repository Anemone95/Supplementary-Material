"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _InteractiveAuth = require("../../structures/InteractiveAuth");

var _InteractiveAuthEntryComponents = require("../auth/InteractiveAuthEntryComponents");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let InteractiveAuthDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.InteractiveAuthDialog"), _dec(_class = (_temp = _class2 = class InteractiveAuthDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      authError: null,
      // See _onUpdateStagePhase()
      uiaStage: null,
      uiaStagePhase: null
    });
    (0, _defineProperty2.default)(this, "_onAuthFinished", (success, result) => {
      if (success) {
        this.props.onFinished(true, result);
      } else {
        if (result === _InteractiveAuth.ERROR_USER_CANCELLED) {
          this.props.onFinished(false, null);
        } else {
          this.setState({
            authError: result
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "_onUpdateStagePhase", (newStage, newPhase) => {
      // We copy the stage and stage phase params into state for title selection in render()
      this.setState({
        uiaStage: newStage,
        uiaStagePhase: newPhase
      });
    });
    (0, _defineProperty2.default)(this, "_onDismissClick", () => {
      this.props.onFinished(false);
    });
  }

  _getDefaultDialogAesthetics() {
    const ssoAesthetics = {
      [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
        title: (0, _languageHandler._t)("Use Single Sign On to continue"),
        body: (0, _languageHandler._t)("To continue, use Single Sign On to prove your identity."),
        continueText: (0, _languageHandler._t)("Single Sign On"),
        continueKind: "primary"
      },
      [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
        title: (0, _languageHandler._t)("Confirm to continue"),
        body: (0, _languageHandler._t)("Click the button below to confirm your identity."),
        continueText: (0, _languageHandler._t)("Confirm"),
        continueKind: "primary"
      }
    };
    return {
      [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: ssoAesthetics,
      [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: ssoAesthetics
    };
  }

  render() {
    const InteractiveAuth = sdk.getComponent("structures.InteractiveAuth");
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog'); // Let's pick a title, body, and other params text that we'll show to the user. The order
    // is most specific first, so stagePhase > our props > defaults.

    let title = this.state.authError ? 'Error' : this.props.title || (0, _languageHandler._t)('Authentication');
    let body = this.state.authError ? null : this.props.body;
    let continueText = null;
    let continueKind = null;

    const dialogAesthetics = this.props.aestheticsForStagePhases || this._getDefaultDialogAesthetics();

    if (!this.state.authError && dialogAesthetics) {
      if (dialogAesthetics[this.state.uiaStage]) {
        const aesthetics = dialogAesthetics[this.state.uiaStage][this.state.uiaStagePhase];
        if (aesthetics && aesthetics.title) title = aesthetics.title;
        if (aesthetics && aesthetics.body) body = aesthetics.body;
        if (aesthetics && aesthetics.continueText) continueText = aesthetics.continueText;
        if (aesthetics && aesthetics.continueKind) continueKind = aesthetics.continueKind;
      }
    }

    let content;

    if (this.state.authError) {
      content = /*#__PURE__*/_react.default.createElement("div", {
        id: "mx_Dialog_content"
      }, /*#__PURE__*/_react.default.createElement("div", {
        role: "alert"
      }, this.state.authError.message || this.state.authError.toString()), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onDismissClick,
        className: "mx_GeneralButton",
        autoFocus: "true"
      }, (0, _languageHandler._t)("Dismiss")));
    } else {
      content = /*#__PURE__*/_react.default.createElement("div", {
        id: "mx_Dialog_content"
      }, body, /*#__PURE__*/_react.default.createElement(InteractiveAuth, {
        ref: this._collectInteractiveAuth,
        matrixClient: this.props.matrixClient,
        authData: this.props.authData,
        makeRequest: this.props.makeRequest,
        onAuthFinished: this._onAuthFinished,
        onStagePhaseChange: this._onUpdateStagePhase,
        continueText: continueText,
        continueKind: continueKind
      }));
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_InteractiveAuthDialog",
      onFinished: this.props.onFinished,
      title: title,
      contentId: "mx_Dialog_content"
    }, content);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // matrix client to use for UI auth requests
  matrixClient: _propTypes.default.object.isRequired,
  // response from initial request. If not supplied, will do a request on
  // mount.
  authData: _propTypes.default.shape({
    flows: _propTypes.default.array,
    params: _propTypes.default.object,
    session: _propTypes.default.string
  }),
  // callback
  makeRequest: _propTypes.default.func.isRequired,
  onFinished: _propTypes.default.func.isRequired,
  // Optional title and body to show when not showing a particular stage
  title: _propTypes.default.string,
  body: _propTypes.default.string,
  // Optional title and body pairs for particular stages and phases within
  // those stages. Object structure/example is:
  // {
  //     "org.example.stage_type": {
  //         1: {
  //             "body": "This is a body for phase 1" of org.example.stage_type,
  //             "title": "Title for phase 1 of org.example.stage_type"
  //         },
  //         2: {
  //             "body": "This is a body for phase 2 of org.example.stage_type",
  //             "title": "Title for phase 2 of org.example.stage_type"
  //             "continueText": "Confirm identity with Example Auth",
  //             "continueKind": "danger"
  //         }
  //     }
  // }
  //
  // Default is defined in _getDefaultDialogAesthetics()
  aestheticsForStagePhases: _propTypes.default.object
}), _temp)) || _class);
exports.default = InteractiveAuthDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSW50ZXJhY3RpdmVBdXRoRGlhbG9nLmpzIl0sIm5hbWVzIjpbIkludGVyYWN0aXZlQXV0aERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiYXV0aEVycm9yIiwidWlhU3RhZ2UiLCJ1aWFTdGFnZVBoYXNlIiwic3VjY2VzcyIsInJlc3VsdCIsInByb3BzIiwib25GaW5pc2hlZCIsIkVSUk9SX1VTRVJfQ0FOQ0VMTEVEIiwic2V0U3RhdGUiLCJuZXdTdGFnZSIsIm5ld1BoYXNlIiwiX2dldERlZmF1bHREaWFsb2dBZXN0aGV0aWNzIiwic3NvQWVzdGhldGljcyIsIlNTT0F1dGhFbnRyeSIsIlBIQVNFX1BSRUFVVEgiLCJ0aXRsZSIsImJvZHkiLCJjb250aW51ZVRleHQiLCJjb250aW51ZUtpbmQiLCJQSEFTRV9QT1NUQVVUSCIsIkxPR0lOX1RZUEUiLCJVTlNUQUJMRV9MT0dJTl9UWVBFIiwicmVuZGVyIiwiSW50ZXJhY3RpdmVBdXRoIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiQmFzZURpYWxvZyIsInN0YXRlIiwiZGlhbG9nQWVzdGhldGljcyIsImFlc3RoZXRpY3NGb3JTdGFnZVBoYXNlcyIsImFlc3RoZXRpY3MiLCJjb250ZW50IiwibWVzc2FnZSIsInRvU3RyaW5nIiwiX29uRGlzbWlzc0NsaWNrIiwiX2NvbGxlY3RJbnRlcmFjdGl2ZUF1dGgiLCJtYXRyaXhDbGllbnQiLCJhdXRoRGF0YSIsIm1ha2VSZXF1ZXN0IiwiX29uQXV0aEZpbmlzaGVkIiwiX29uVXBkYXRlU3RhZ2VQaGFzZSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJzaGFwZSIsImZsb3dzIiwiYXJyYXkiLCJwYXJhbXMiLCJzZXNzaW9uIiwic3RyaW5nIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7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QkFBVVEsTUFuQkQ7QUFxQmY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FwQixFQUFBQSx3QkFBd0IsRUFBRVksbUJBQVVDO0FBdkNyQixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQge0VSUk9SX1VTRVJfQ0FOQ0VMTEVEfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9JbnRlcmFjdGl2ZUF1dGhcIjtcbmltcG9ydCB7U1NPQXV0aEVudHJ5fSBmcm9tIFwiLi4vYXV0aC9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLkludGVyYWN0aXZlQXV0aERpYWxvZ1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJhY3RpdmVBdXRoRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBtYXRyaXggY2xpZW50IHRvIHVzZSBmb3IgVUkgYXV0aCByZXF1ZXN0c1xuICAgICAgICBtYXRyaXhDbGllbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyByZXNwb25zZSBmcm9tIGluaXRpYWwgcmVxdWVzdC4gSWYgbm90IHN1cHBsaWVkLCB3aWxsIGRvIGEgcmVxdWVzdCBvblxuICAgICAgICAvLyBtb3VudC5cbiAgICAgICAgYXV0aERhdGE6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICBmbG93czogUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICAgICAgcGFyYW1zOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAgICAgc2Vzc2lvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgfSksXG5cbiAgICAgICAgLy8gY2FsbGJhY2tcbiAgICAgICAgbWFrZVJlcXVlc3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyBPcHRpb25hbCB0aXRsZSBhbmQgYm9keSB0byBzaG93IHdoZW4gbm90IHNob3dpbmcgYSBwYXJ0aWN1bGFyIHN0YWdlXG4gICAgICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBib2R5OiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIE9wdGlvbmFsIHRpdGxlIGFuZCBib2R5IHBhaXJzIGZvciBwYXJ0aWN1bGFyIHN0YWdlcyBhbmQgcGhhc2VzIHdpdGhpblxuICAgICAgICAvLyB0aG9zZSBzdGFnZXMuIE9iamVjdCBzdHJ1Y3R1cmUvZXhhbXBsZSBpczpcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgICAgXCJvcmcuZXhhbXBsZS5zdGFnZV90eXBlXCI6IHtcbiAgICAgICAgLy8gICAgICAgICAxOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIFwiYm9keVwiOiBcIlRoaXMgaXMgYSBib2R5IGZvciBwaGFzZSAxXCIgb2Ygb3JnLmV4YW1wbGUuc3RhZ2VfdHlwZSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIlRpdGxlIGZvciBwaGFzZSAxIG9mIG9yZy5leGFtcGxlLnN0YWdlX3R5cGVcIlxuICAgICAgICAvLyAgICAgICAgIH0sXG4gICAgICAgIC8vICAgICAgICAgMjoge1xuICAgICAgICAvLyAgICAgICAgICAgICBcImJvZHlcIjogXCJUaGlzIGlzIGEgYm9keSBmb3IgcGhhc2UgMiBvZiBvcmcuZXhhbXBsZS5zdGFnZV90eXBlXCIsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwidGl0bGVcIjogXCJUaXRsZSBmb3IgcGhhc2UgMiBvZiBvcmcuZXhhbXBsZS5zdGFnZV90eXBlXCJcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJjb250aW51ZVRleHRcIjogXCJDb25maXJtIGlkZW50aXR5IHdpdGggRXhhbXBsZSBBdXRoXCIsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiY29udGludWVLaW5kXCI6IFwiZGFuZ2VyXCJcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGVmYXVsdCBpcyBkZWZpbmVkIGluIF9nZXREZWZhdWx0RGlhbG9nQWVzdGhldGljcygpXG4gICAgICAgIGFlc3RoZXRpY3NGb3JTdGFnZVBoYXNlczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGF1dGhFcnJvcjogbnVsbCxcblxuICAgICAgICAvLyBTZWUgX29uVXBkYXRlU3RhZ2VQaGFzZSgpXG4gICAgICAgIHVpYVN0YWdlOiBudWxsLFxuICAgICAgICB1aWFTdGFnZVBoYXNlOiBudWxsLFxuICAgIH07XG5cbiAgICBfZ2V0RGVmYXVsdERpYWxvZ0Flc3RoZXRpY3MoKSB7XG4gICAgICAgIGNvbnN0IHNzb0Flc3RoZXRpY3MgPSB7XG4gICAgICAgICAgICBbU1NPQXV0aEVudHJ5LlBIQVNFX1BSRUFVVEhdOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVXNlIFNpbmdsZSBTaWduIE9uIHRvIGNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgIGJvZHk6IF90KFwiVG8gY29udGludWUsIHVzZSBTaW5nbGUgU2lnbiBPbiB0byBwcm92ZSB5b3VyIGlkZW50aXR5LlwiKSxcbiAgICAgICAgICAgICAgICBjb250aW51ZVRleHQ6IF90KFwiU2luZ2xlIFNpZ24gT25cIiksXG4gICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcInByaW1hcnlcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbU1NPQXV0aEVudHJ5LlBIQVNFX1BPU1RBVVRIXToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkNvbmZpcm0gdG8gY29udGludWVcIiksXG4gICAgICAgICAgICAgICAgYm9keTogX3QoXCJDbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbmZpcm0geW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIkNvbmZpcm1cIiksXG4gICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcInByaW1hcnlcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFtTU09BdXRoRW50cnkuTE9HSU5fVFlQRV06IHNzb0Flc3RoZXRpY3MsXG4gICAgICAgICAgICBbU1NPQXV0aEVudHJ5LlVOU1RBQkxFX0xPR0lOX1RZUEVdOiBzc29BZXN0aGV0aWNzLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9vbkF1dGhGaW5pc2hlZCA9IChzdWNjZXNzLCByZXN1bHQpID0+IHtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlLCByZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gRVJST1JfVVNFUl9DQU5DRUxMRUQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UsIG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aEVycm9yOiByZXN1bHQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uVXBkYXRlU3RhZ2VQaGFzZSA9IChuZXdTdGFnZSwgbmV3UGhhc2UpID0+IHtcbiAgICAgICAgLy8gV2UgY29weSB0aGUgc3RhZ2UgYW5kIHN0YWdlIHBoYXNlIHBhcmFtcyBpbnRvIHN0YXRlIGZvciB0aXRsZSBzZWxlY3Rpb24gaW4gcmVuZGVyKClcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dWlhU3RhZ2U6IG5ld1N0YWdlLCB1aWFTdGFnZVBoYXNlOiBuZXdQaGFzZX0pO1xuICAgIH07XG5cbiAgICBfb25EaXNtaXNzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgSW50ZXJhY3RpdmVBdXRoID0gc2RrLmdldENvbXBvbmVudChcInN0cnVjdHVyZXMuSW50ZXJhY3RpdmVBdXRoXCIpO1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG5cbiAgICAgICAgLy8gTGV0J3MgcGljayBhIHRpdGxlLCBib2R5LCBhbmQgb3RoZXIgcGFyYW1zIHRleHQgdGhhdCB3ZSdsbCBzaG93IHRvIHRoZSB1c2VyLiBUaGUgb3JkZXJcbiAgICAgICAgLy8gaXMgbW9zdCBzcGVjaWZpYyBmaXJzdCwgc28gc3RhZ2VQaGFzZSA+IG91ciBwcm9wcyA+IGRlZmF1bHRzLlxuXG4gICAgICAgIGxldCB0aXRsZSA9IHRoaXMuc3RhdGUuYXV0aEVycm9yID8gJ0Vycm9yJyA6ICh0aGlzLnByb3BzLnRpdGxlIHx8IF90KCdBdXRoZW50aWNhdGlvbicpKTtcbiAgICAgICAgbGV0IGJvZHkgPSB0aGlzLnN0YXRlLmF1dGhFcnJvciA/IG51bGwgOiB0aGlzLnByb3BzLmJvZHk7XG4gICAgICAgIGxldCBjb250aW51ZVRleHQgPSBudWxsO1xuICAgICAgICBsZXQgY29udGludWVLaW5kID0gbnVsbDtcbiAgICAgICAgY29uc3QgZGlhbG9nQWVzdGhldGljcyA9IHRoaXMucHJvcHMuYWVzdGhldGljc0ZvclN0YWdlUGhhc2VzIHx8IHRoaXMuX2dldERlZmF1bHREaWFsb2dBZXN0aGV0aWNzKCk7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5hdXRoRXJyb3IgJiYgZGlhbG9nQWVzdGhldGljcykge1xuICAgICAgICAgICAgaWYgKGRpYWxvZ0Flc3RoZXRpY3NbdGhpcy5zdGF0ZS51aWFTdGFnZV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZXN0aGV0aWNzID0gZGlhbG9nQWVzdGhldGljc1t0aGlzLnN0YXRlLnVpYVN0YWdlXVt0aGlzLnN0YXRlLnVpYVN0YWdlUGhhc2VdO1xuICAgICAgICAgICAgICAgIGlmIChhZXN0aGV0aWNzICYmIGFlc3RoZXRpY3MudGl0bGUpIHRpdGxlID0gYWVzdGhldGljcy50aXRsZTtcbiAgICAgICAgICAgICAgICBpZiAoYWVzdGhldGljcyAmJiBhZXN0aGV0aWNzLmJvZHkpIGJvZHkgPSBhZXN0aGV0aWNzLmJvZHk7XG4gICAgICAgICAgICAgICAgaWYgKGFlc3RoZXRpY3MgJiYgYWVzdGhldGljcy5jb250aW51ZVRleHQpIGNvbnRpbnVlVGV4dCA9IGFlc3RoZXRpY3MuY29udGludWVUZXh0O1xuICAgICAgICAgICAgICAgIGlmIChhZXN0aGV0aWNzICYmIGFlc3RoZXRpY3MuY29udGludWVLaW5kKSBjb250aW51ZUtpbmQgPSBhZXN0aGV0aWNzLmNvbnRpbnVlS2luZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hdXRoRXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBpZD0nbXhfRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHJvbGU9XCJhbGVydFwiPnsgdGhpcy5zdGF0ZS5hdXRoRXJyb3IubWVzc2FnZSB8fCB0aGlzLnN0YXRlLmF1dGhFcnJvci50b1N0cmluZygpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uRGlzbWlzc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR2VuZXJhbEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRpc21pc3NcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIHtib2R5fVxuICAgICAgICAgICAgICAgICAgICA8SW50ZXJhY3RpdmVBdXRoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX2NvbGxlY3RJbnRlcmFjdGl2ZUF1dGh9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ9e3RoaXMucHJvcHMubWF0cml4Q2xpZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aERhdGE9e3RoaXMucHJvcHMuYXV0aERhdGF9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWtlUmVxdWVzdD17dGhpcy5wcm9wcy5tYWtlUmVxdWVzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQXV0aEZpbmlzaGVkPXt0aGlzLl9vbkF1dGhGaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU3RhZ2VQaGFzZUNoYW5nZT17dGhpcy5fb25VcGRhdGVTdGFnZVBoYXNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0PXtjb250aW51ZVRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZUtpbmQ9e2NvbnRpbnVlS2luZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfSW50ZXJhY3RpdmVBdXRoRGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=