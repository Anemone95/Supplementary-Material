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

var _IntegrationManagers = require("../../../integrations/IntegrationManagers");

var _matrixJsSdk = require("matrix-js-sdk");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Terms = require("../../../Terms");

var _classnames = _interopRequireDefault(require("classnames"));

var ScalarMessaging = _interopRequireWildcard(require("../../../ScalarMessaging"));

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
class TabbedIntegrationManagerDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "openManager", async (i
    /*: number*/
    , force = false) => {
      if (i === this.state.currentIndex && !force) return;
      const manager = this.state.managers[i];
      const client = manager.getScalarClient();
      this.setState({
        busy: true,
        currentIndex: i,
        currentLoading: true,
        currentConnected: false,
        currentScalarClient: client
      });
      ScalarMessaging.setOpenManagerUrl(manager.uiUrl);
      client.setTermsInteractionCallback((policyInfo, agreedUrls) => {
        // To avoid visual glitching of two modals stacking briefly, we customise the
        // terms dialog sizing when it will appear for the integration manager so that
        // it gets the same basic size as the IM's own modal.
        return (0, _Terms.dialogTermsInteractionCallback)(policyInfo, agreedUrls, 'mx_TermsDialog_forIntegrationManager');
      });

      try {
        await client.connect();

        if (!client.hasCredentials()) {
          this.setState({
            busy: false,
            currentLoading: false,
            currentConnected: false
          });
        } else {
          this.setState({
            busy: false,
            currentLoading: false,
            currentConnected: true
          });
        }
      } catch (e) {
        if (e instanceof _Terms.TermsNotSignedError) {
          return;
        }

        console.error(e);
        this.setState({
          busy: false,
          currentLoading: false,
          currentConnected: false
        });
      }
    });
    this.state = {
      managers: _IntegrationManagers.IntegrationManagers.sharedInstance().getOrderedManagers(),
      busy: true,
      currentIndex: 0,
      currentConnected: false,
      currentLoading: true,
      currentScalarClient: null
    };
  }

  componentDidMount()
  /*: void*/
  {
    this.openManager(0, true);
  }

  _renderTabs() {
    const AccessibleButton = sdk.getComponent("views.elements.AccessibleButton");
    return this.state.managers.map((m, i) => {
      const classes = (0, _classnames.default)({
        'mx_TabbedIntegrationManagerDialog_tab': true,
        'mx_TabbedIntegrationManagerDialog_currentTab': this.state.currentIndex === i
      });
      return /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: classes,
        onClick: () => this.openManager(i),
        key: `tab_${i}`,
        disabled: this.state.busy
      }, m.name);
    });
  }

  _renderTab() {
    const IntegrationManager = sdk.getComponent("views.settings.IntegrationManager");
    let uiUrl = null;

    if (this.state.currentScalarClient) {
      uiUrl = this.state.currentScalarClient.getScalarInterfaceUrlForRoom(this.props.room, this.props.screen, this.props.integrationId);
    }

    return /*#__PURE__*/_react.default.createElement(IntegrationManager, {
      configured: true,
      loading: this.state.currentLoading,
      connected: this.state.currentConnected,
      url: uiUrl,
      onFinished: () => {
        /* no-op */
      }
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TabbedIntegrationManagerDialog_container"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TabbedIntegrationManagerDialog_tabs"
    }, this._renderTabs()), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TabbedIntegrationManagerDialog_currentManager"
    }, this._renderTab()));
  }

}

exports.default = TabbedIntegrationManagerDialog;
(0, _defineProperty2.default)(TabbedIntegrationManagerDialog, "propTypes", {
  /**
   * Called with:
   *     * success {bool} True if the user accepted any douments, false if cancelled
   *     * agreedUrls {string[]} List of agreed URLs
   */
  onFinished: _propTypes.default.func.isRequired,

  /**
   * Optional room where the integration manager should be open to
   */
  room: _propTypes.default.instanceOf(_matrixJsSdk.Room),

  /**
   * Optional screen to open on the integration manager
   */
  screen: _propTypes.default.string,

  /**
   * Optional integration ID to open in the integration manager
   */
  integrationId: _propTypes.default.string
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVGFiYmVkSW50ZWdyYXRpb25NYW5hZ2VyRGlhbG9nLmpzIl0sIm5hbWVzIjpbIlRhYmJlZEludGVncmF0aW9uTWFuYWdlckRpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImkiLCJmb3JjZSIsInN0YXRlIiwiY3VycmVudEluZGV4IiwibWFuYWdlciIsIm1hbmFnZXJzIiwiY2xpZW50IiwiZ2V0U2NhbGFyQ2xpZW50Iiwic2V0U3RhdGUiLCJidXN5IiwiY3VycmVudExvYWRpbmciLCJjdXJyZW50Q29ubmVjdGVkIiwiY3VycmVudFNjYWxhckNsaWVudCIsIlNjYWxhck1lc3NhZ2luZyIsInNldE9wZW5NYW5hZ2VyVXJsIiwidWlVcmwiLCJzZXRUZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2siLCJwb2xpY3lJbmZvIiwiYWdyZWVkVXJscyIsImNvbm5lY3QiLCJoYXNDcmVkZW50aWFscyIsImUiLCJUZXJtc05vdFNpZ25lZEVycm9yIiwiY29uc29sZSIsImVycm9yIiwiSW50ZWdyYXRpb25NYW5hZ2VycyIsInNoYXJlZEluc3RhbmNlIiwiZ2V0T3JkZXJlZE1hbmFnZXJzIiwiY29tcG9uZW50RGlkTW91bnQiLCJvcGVuTWFuYWdlciIsIl9yZW5kZXJUYWJzIiwiQWNjZXNzaWJsZUJ1dHRvbiIsInNkayIsImdldENvbXBvbmVudCIsIm1hcCIsIm0iLCJjbGFzc2VzIiwibmFtZSIsIl9yZW5kZXJUYWIiLCJJbnRlZ3JhdGlvbk1hbmFnZXIiLCJnZXRTY2FsYXJJbnRlcmZhY2VVcmxGb3JSb29tIiwicm9vbSIsInNjcmVlbiIsImludGVncmF0aW9uSWQiLCJyZW5kZXIiLCJvbkZpbmlzaGVkIiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJpbnN0YW5jZU9mIiwiUm9vbSIsInN0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztB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QixNQUFQO0FBT0g7O0FBRUQ2QixFQUFBQSxNQUFNLEdBQUc7QUFDTCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0ssS0FBS2QsV0FBTCxFQURMLENBREosZUFJSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDSyxLQUFLUSxVQUFMLEVBREwsQ0FKSixDQURKO0FBVUg7O0FBakp1RTs7OzhCQUF2RDNDLDhCLGVBQ0U7QUFDZjtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ1FrRCxFQUFBQSxVQUFVLEVBQUVDLG1CQUFVQyxJQUFWLENBQWVDLFVBTlo7O0FBUWY7QUFDUjtBQUNBO0FBQ1FQLEVBQUFBLElBQUksRUFBRUssbUJBQVVHLFVBQVYsQ0FBcUJDLGlCQUFyQixDQVhTOztBQWFmO0FBQ1I7QUFDQTtBQUNRUixFQUFBQSxNQUFNLEVBQUVJLG1CQUFVSyxNQWhCSDs7QUFrQmY7QUFDUjtBQUNBO0FBQ1FSLEVBQUFBLGFBQWEsRUFBRUcsbUJBQVVLO0FBckJWLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7SW50ZWdyYXRpb25NYW5hZ2Vyc30gZnJvbSBcIi4uLy4uLy4uL2ludGVncmF0aW9ucy9JbnRlZ3JhdGlvbk1hbmFnZXJzXCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtkaWFsb2dUZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2ssIFRlcm1zTm90U2lnbmVkRXJyb3J9IGZyb20gXCIuLi8uLi8uLi9UZXJtc1wiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgKiBhcyBTY2FsYXJNZXNzYWdpbmcgZnJvbSBcIi4uLy4uLy4uL1NjYWxhck1lc3NhZ2luZ1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJiZWRJbnRlZ3JhdGlvbk1hbmFnZXJEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxsZWQgd2l0aDpcbiAgICAgICAgICogICAgICogc3VjY2VzcyB7Ym9vbH0gVHJ1ZSBpZiB0aGUgdXNlciBhY2NlcHRlZCBhbnkgZG91bWVudHMsIGZhbHNlIGlmIGNhbmNlbGxlZFxuICAgICAgICAgKiAgICAgKiBhZ3JlZWRVcmxzIHtzdHJpbmdbXX0gTGlzdCBvZiBhZ3JlZWQgVVJMc1xuICAgICAgICAgKi9cbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogT3B0aW9uYWwgcm9vbSB3aGVyZSB0aGUgaW50ZWdyYXRpb24gbWFuYWdlciBzaG91bGQgYmUgb3BlbiB0b1xuICAgICAgICAgKi9cbiAgICAgICAgcm9vbTogUHJvcFR5cGVzLmluc3RhbmNlT2YoUm9vbSksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wdGlvbmFsIHNjcmVlbiB0byBvcGVuIG9uIHRoZSBpbnRlZ3JhdGlvbiBtYW5hZ2VyXG4gICAgICAgICAqL1xuICAgICAgICBzY3JlZW46IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wdGlvbmFsIGludGVncmF0aW9uIElEIHRvIG9wZW4gaW4gdGhlIGludGVncmF0aW9uIG1hbmFnZXJcbiAgICAgICAgICovXG4gICAgICAgIGludGVncmF0aW9uSWQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbWFuYWdlcnM6IEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5nZXRPcmRlcmVkTWFuYWdlcnMoKSxcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgICAgICAgICBjdXJyZW50Q29ubmVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGN1cnJlbnRMb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgY3VycmVudFNjYWxhckNsaWVudDogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vcGVuTWFuYWdlcigwLCB0cnVlKTtcbiAgICB9XG5cbiAgICBvcGVuTWFuYWdlciA9IGFzeW5jIChpOiBudW1iZXIsIGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICAgICAgaWYgKGkgPT09IHRoaXMuc3RhdGUuY3VycmVudEluZGV4ICYmICFmb3JjZSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG1hbmFnZXIgPSB0aGlzLnN0YXRlLm1hbmFnZXJzW2ldO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBtYW5hZ2VyLmdldFNjYWxhckNsaWVudCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBjdXJyZW50SW5kZXg6IGksXG4gICAgICAgICAgICBjdXJyZW50TG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIGN1cnJlbnRDb25uZWN0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgY3VycmVudFNjYWxhckNsaWVudDogY2xpZW50LFxuICAgICAgICB9KTtcblxuICAgICAgICBTY2FsYXJNZXNzYWdpbmcuc2V0T3Blbk1hbmFnZXJVcmwobWFuYWdlci51aVVybCk7XG5cbiAgICAgICAgY2xpZW50LnNldFRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaygocG9saWN5SW5mbywgYWdyZWVkVXJscykgPT4ge1xuICAgICAgICAgICAgLy8gVG8gYXZvaWQgdmlzdWFsIGdsaXRjaGluZyBvZiB0d28gbW9kYWxzIHN0YWNraW5nIGJyaWVmbHksIHdlIGN1c3RvbWlzZSB0aGVcbiAgICAgICAgICAgIC8vIHRlcm1zIGRpYWxvZyBzaXppbmcgd2hlbiBpdCB3aWxsIGFwcGVhciBmb3IgdGhlIGludGVncmF0aW9uIG1hbmFnZXIgc28gdGhhdFxuICAgICAgICAgICAgLy8gaXQgZ2V0cyB0aGUgc2FtZSBiYXNpYyBzaXplIGFzIHRoZSBJTSdzIG93biBtb2RhbC5cbiAgICAgICAgICAgIHJldHVybiBkaWFsb2dUZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2soXG4gICAgICAgICAgICAgICAgcG9saWN5SW5mbywgYWdyZWVkVXJscywgJ214X1Rlcm1zRGlhbG9nX2ZvckludGVncmF0aW9uTWFuYWdlcicsXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LmNvbm5lY3QoKTtcbiAgICAgICAgICAgIGlmICghY2xpZW50Lmhhc0NyZWRlbnRpYWxzKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvbm5lY3RlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudExvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q29ubmVjdGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFRlcm1zTm90U2lnbmVkRXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50TG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3VycmVudENvbm5lY3RlZDogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfcmVuZGVyVGFicygpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5tYW5hZ2Vycy5tYXAoKG0sIGkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICAnbXhfVGFiYmVkSW50ZWdyYXRpb25NYW5hZ2VyRGlhbG9nX3RhYic6IHRydWUsXG4gICAgICAgICAgICAgICAgJ214X1RhYmJlZEludGVncmF0aW9uTWFuYWdlckRpYWxvZ19jdXJyZW50VGFiJzogdGhpcy5zdGF0ZS5jdXJyZW50SW5kZXggPT09IGksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLm9wZW5NYW5hZ2VyKGkpfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2B0YWJfJHtpfWB9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7bS5uYW1lfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9yZW5kZXJUYWIoKSB7XG4gICAgICAgIGNvbnN0IEludGVncmF0aW9uTWFuYWdlciA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5JbnRlZ3JhdGlvbk1hbmFnZXJcIik7XG4gICAgICAgIGxldCB1aVVybCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRTY2FsYXJDbGllbnQpIHtcbiAgICAgICAgICAgIHVpVXJsID0gdGhpcy5zdGF0ZS5jdXJyZW50U2NhbGFyQ2xpZW50LmdldFNjYWxhckludGVyZmFjZVVybEZvclJvb20oXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yb29tLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2NyZWVuLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuaW50ZWdyYXRpb25JZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxJbnRlZ3JhdGlvbk1hbmFnZXJcbiAgICAgICAgICAgIGNvbmZpZ3VyZWQ9e3RydWV9XG4gICAgICAgICAgICBsb2FkaW5nPXt0aGlzLnN0YXRlLmN1cnJlbnRMb2FkaW5nfVxuICAgICAgICAgICAgY29ubmVjdGVkPXt0aGlzLnN0YXRlLmN1cnJlbnRDb25uZWN0ZWR9XG4gICAgICAgICAgICB1cmw9e3VpVXJsfVxuICAgICAgICAgICAgb25GaW5pc2hlZD17KCkgPT4gey8qIG5vLW9wICovfX1cbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1RhYmJlZEludGVncmF0aW9uTWFuYWdlckRpYWxvZ19jb250YWluZXInPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9UYWJiZWRJbnRlZ3JhdGlvbk1hbmFnZXJEaWFsb2dfdGFicyc+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJUYWJzKCl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1RhYmJlZEludGVncmF0aW9uTWFuYWdlckRpYWxvZ19jdXJyZW50TWFuYWdlcic+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJUYWIoKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==