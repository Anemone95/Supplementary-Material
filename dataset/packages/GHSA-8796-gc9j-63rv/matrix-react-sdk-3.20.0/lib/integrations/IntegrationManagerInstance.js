"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IntegrationManagerInstance = exports.Kind = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _ScalarAuthClient = _interopRequireDefault(require("../ScalarAuthClient"));

var _Terms = require("../Terms");

var _Modal = _interopRequireDefault(require("../Modal"));

var _url = _interopRequireDefault(require("url"));

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _IntegrationManager = _interopRequireDefault(require("../components/views/settings/IntegrationManager"));

var _IntegrationManagers = require("./IntegrationManagers");

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
let Kind;
exports.Kind = Kind;

(function (Kind) {
  Kind["Account"] = "account";
  Kind["Config"] = "config";
  Kind["Homeserver"] = "homeserver";
})(Kind || (exports.Kind = Kind = {}));

class IntegrationManagerInstance {
  // only applicable in some cases
  // Per the spec: UI URL is optional.
  constructor(kind
  /*: string*/
  , apiUrl
  /*: string*/
  , uiUrl
  /*: string*/
  = apiUrl, id
  /*: string*/
  ) {
    (0, _defineProperty2.default)(this, "apiUrl", void 0);
    (0, _defineProperty2.default)(this, "uiUrl", void 0);
    (0, _defineProperty2.default)(this, "kind", void 0);
    (0, _defineProperty2.default)(this, "id", void 0);
    this.kind = kind;
    this.apiUrl = apiUrl;
    this.uiUrl = uiUrl;
    this.id = id;
  }

  get name()
  /*: string*/
  {
    const parsed = _url.default.parse(this.uiUrl);

    return parsed.host;
  }

  get trimmedApiUrl()
  /*: string*/
  {
    const parsed = _url.default.parse(this.apiUrl);

    parsed.pathname = '';
    parsed.path = '';
    return _url.default.format(parsed);
  }

  getScalarClient()
  /*: ScalarAuthClient*/
  {
    return new _ScalarAuthClient.default(this.apiUrl, this.uiUrl);
  }

  async open(room
  /*: Room*/
  = null, screen
  /*: string*/
  = null, integrationId
  /*: string*/
  = null)
  /*: Promise<void>*/
  {
    if (!_SettingsStore.default.getValue("integrationProvisioning")) {
      return _IntegrationManagers.IntegrationManagers.sharedInstance().showDisabledDialog();
    }

    const dialog = _Modal.default.createTrackedDialog('Integration Manager', '', _IntegrationManager.default, {
      loading: true
    }, 'mx_IntegrationManager');

    const client = this.getScalarClient();
    client.setTermsInteractionCallback((policyInfo, agreedUrls) => {
      // To avoid visual glitching of two modals stacking briefly, we customise the
      // terms dialog sizing when it will appear for the integration manager so that
      // it gets the same basic size as the IM's own modal.
      return (0, _Terms.dialogTermsInteractionCallback)(policyInfo, agreedUrls, 'mx_TermsDialog_forIntegrationManager');
    });
    const newProps = {};

    try {
      await client.connect();

      if (!client.hasCredentials()) {
        newProps["connected"] = false;
      } else {
        newProps["url"] = client.getScalarInterfaceUrlForRoom(room, screen, integrationId);
      }
    } catch (e) {
      if (e instanceof _Terms.TermsNotSignedError) {
        dialog.close();
        return;
      }

      console.error(e);
      newProps["connected"] = false;
    } // Close the old dialog and open a new one


    dialog.close();

    _Modal.default.createTrackedDialog('Integration Manager', '', _IntegrationManager.default, newProps, 'mx_IntegrationManager');
  }

}

exports.IntegrationManagerInstance = IntegrationManagerInstance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlZ3JhdGlvbnMvSW50ZWdyYXRpb25NYW5hZ2VySW5zdGFuY2UudHMiXSwibmFtZXMiOlsiS2luZCIsIkludGVncmF0aW9uTWFuYWdlckluc3RhbmNlIiwiY29uc3RydWN0b3IiLCJraW5kIiwiYXBpVXJsIiwidWlVcmwiLCJpZCIsIm5hbWUiLCJwYXJzZWQiLCJ1cmwiLCJwYXJzZSIsImhvc3QiLCJ0cmltbWVkQXBpVXJsIiwicGF0aG5hbWUiLCJwYXRoIiwiZm9ybWF0IiwiZ2V0U2NhbGFyQ2xpZW50IiwiU2NhbGFyQXV0aENsaWVudCIsIm9wZW4iLCJyb29tIiwic2NyZWVuIiwiaW50ZWdyYXRpb25JZCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIkludGVncmF0aW9uTWFuYWdlcnMiLCJzaGFyZWRJbnN0YW5jZSIsInNob3dEaXNhYmxlZERpYWxvZyIsImRpYWxvZyIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIkludGVncmF0aW9uTWFuYWdlciIsImxvYWRpbmciLCJjbGllbnQiLCJzZXRUZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2siLCJwb2xpY3lJbmZvIiwiYWdyZWVkVXJscyIsIm5ld1Byb3BzIiwiY29ubmVjdCIsImhhc0NyZWRlbnRpYWxzIiwiZ2V0U2NhbGFySW50ZXJmYWNlVXJsRm9yUm9vbSIsImUiLCJUZXJtc05vdFNpZ25lZEVycm9yIiwiY2xvc2UiLCJjb25zb2xlIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFZWUEsSTs7O1dBQUFBLEk7QUFBQUEsRUFBQUEsSTtBQUFBQSxFQUFBQSxJO0FBQUFBLEVBQUFBLEk7R0FBQUEsSSxvQkFBQUEsSTs7QUFNTCxNQUFNQyww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QTFFbUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgdHlwZSB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5cbmltcG9ydCBTY2FsYXJBdXRoQ2xpZW50IGZyb20gXCIuLi9TY2FsYXJBdXRoQ2xpZW50XCI7XG5pbXBvcnQge2RpYWxvZ1Rlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaywgVGVybXNOb3RTaWduZWRFcnJvcn0gZnJvbSBcIi4uL1Rlcm1zXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vTW9kYWwnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBJbnRlZ3JhdGlvbk1hbmFnZXIgZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvSW50ZWdyYXRpb25NYW5hZ2VyXCI7XG5pbXBvcnQge0ludGVncmF0aW9uTWFuYWdlcnN9IGZyb20gXCIuL0ludGVncmF0aW9uTWFuYWdlcnNcIjtcblxuZXhwb3J0IGVudW0gS2luZCB7XG4gICAgQWNjb3VudCA9IFwiYWNjb3VudFwiLFxuICAgIENvbmZpZyA9IFwiY29uZmlnXCIsXG4gICAgSG9tZXNlcnZlciA9IFwiaG9tZXNlcnZlclwiLFxufVxuXG5leHBvcnQgY2xhc3MgSW50ZWdyYXRpb25NYW5hZ2VySW5zdGFuY2Uge1xuICAgIHB1YmxpYyByZWFkb25seSBhcGlVcmw6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHkgdWlVcmw6IHN0cmluZztcbiAgICBwdWJsaWMgcmVhZG9ubHkga2luZDogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nOyAvLyBvbmx5IGFwcGxpY2FibGUgaW4gc29tZSBjYXNlc1xuXG4gICAgLy8gUGVyIHRoZSBzcGVjOiBVSSBVUkwgaXMgb3B0aW9uYWwuXG4gICAgY29uc3RydWN0b3Ioa2luZDogc3RyaW5nLCBhcGlVcmw6IHN0cmluZywgdWlVcmw6IHN0cmluZyA9IGFwaVVybCwgaWQ/OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5raW5kID0ga2luZDtcbiAgICAgICAgdGhpcy5hcGlVcmwgPSBhcGlVcmw7XG4gICAgICAgIHRoaXMudWlVcmwgPSB1aVVybDtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cblxuICAgIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHVybC5wYXJzZSh0aGlzLnVpVXJsKTtcbiAgICAgICAgcmV0dXJuIHBhcnNlZC5ob3N0O1xuICAgIH1cblxuICAgIGdldCB0cmltbWVkQXBpVXJsKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHVybC5wYXJzZSh0aGlzLmFwaVVybCk7XG4gICAgICAgIHBhcnNlZC5wYXRobmFtZSA9ICcnO1xuICAgICAgICBwYXJzZWQucGF0aCA9ICcnO1xuICAgICAgICByZXR1cm4gdXJsLmZvcm1hdChwYXJzZWQpO1xuICAgIH1cblxuICAgIGdldFNjYWxhckNsaWVudCgpOiBTY2FsYXJBdXRoQ2xpZW50IHtcbiAgICAgICAgcmV0dXJuIG5ldyBTY2FsYXJBdXRoQ2xpZW50KHRoaXMuYXBpVXJsLCB0aGlzLnVpVXJsKTtcbiAgICB9XG5cbiAgICBhc3luYyBvcGVuKHJvb206IFJvb20gPSBudWxsLCBzY3JlZW46IHN0cmluZyA9IG51bGwsIGludGVncmF0aW9uSWQ6IHN0cmluZyA9IG51bGwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiaW50ZWdyYXRpb25Qcm92aXNpb25pbmdcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuc2hvd0Rpc2FibGVkRGlhbG9nKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkaWFsb2cgPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgJ0ludGVncmF0aW9uIE1hbmFnZXInLCAnJywgSW50ZWdyYXRpb25NYW5hZ2VyLFxuICAgICAgICAgICAge2xvYWRpbmc6IHRydWV9LCAnbXhfSW50ZWdyYXRpb25NYW5hZ2VyJyxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmdldFNjYWxhckNsaWVudCgpO1xuICAgICAgICBjbGllbnQuc2V0VGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrKChwb2xpY3lJbmZvLCBhZ3JlZWRVcmxzKSA9PiB7XG4gICAgICAgICAgICAvLyBUbyBhdm9pZCB2aXN1YWwgZ2xpdGNoaW5nIG9mIHR3byBtb2RhbHMgc3RhY2tpbmcgYnJpZWZseSwgd2UgY3VzdG9taXNlIHRoZVxuICAgICAgICAgICAgLy8gdGVybXMgZGlhbG9nIHNpemluZyB3aGVuIGl0IHdpbGwgYXBwZWFyIGZvciB0aGUgaW50ZWdyYXRpb24gbWFuYWdlciBzbyB0aGF0XG4gICAgICAgICAgICAvLyBpdCBnZXRzIHRoZSBzYW1lIGJhc2ljIHNpemUgYXMgdGhlIElNJ3Mgb3duIG1vZGFsLlxuICAgICAgICAgICAgcmV0dXJuIGRpYWxvZ1Rlcm1zSW50ZXJhY3Rpb25DYWxsYmFjayhcbiAgICAgICAgICAgICAgICBwb2xpY3lJbmZvLCBhZ3JlZWRVcmxzLCAnbXhfVGVybXNEaWFsb2dfZm9ySW50ZWdyYXRpb25NYW5hZ2VyJyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG5ld1Byb3BzID0ge307XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQuY29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKCFjbGllbnQuaGFzQ3JlZGVudGlhbHMoKSkge1xuICAgICAgICAgICAgICAgIG5ld1Byb3BzW1wiY29ubmVjdGVkXCJdID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1Byb3BzW1widXJsXCJdID0gY2xpZW50LmdldFNjYWxhckludGVyZmFjZVVybEZvclJvb20ocm9vbSwgc2NyZWVuLCBpbnRlZ3JhdGlvbklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBUZXJtc05vdFNpZ25lZEVycm9yKSB7XG4gICAgICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgbmV3UHJvcHNbXCJjb25uZWN0ZWRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsb3NlIHRoZSBvbGQgZGlhbG9nIGFuZCBvcGVuIGEgbmV3IG9uZVxuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcbiAgICAgICAgICAgICdJbnRlZ3JhdGlvbiBNYW5hZ2VyJywgJycsIEludGVncmF0aW9uTWFuYWdlcixcbiAgICAgICAgICAgIG5ld1Byb3BzLCAnbXhfSW50ZWdyYXRpb25NYW5hZ2VyJyxcbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=