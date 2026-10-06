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

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _notifications = require("../../../notifications");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _LabelledToggleSwitch = _interopRequireDefault(require("../elements/LabelledToggleSwitch"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _UIFeature = require("../../../settings/UIFeature");

/*
Copyright 2016 OpenMarket Ltd
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
// TODO: this "view" component still has far too much application logic in it,
// which should be factored out to other files.
// TODO: this component also does a lot of direct poking into this.state, which
// is VERY NAUGHTY.

/**
 * Rules that Vector used to set in order to override the actions of default rules.
 * These are used to port peoples existing overrides to match the current API.
 * These can be removed and forgotten once everyone has moved to the new client.
 */
const LEGACY_RULES = {
  "im.vector.rule.contains_display_name": ".m.rule.contains_display_name",
  "im.vector.rule.room_one_to_one": ".m.rule.room_one_to_one",
  "im.vector.rule.room_message": ".m.rule.message",
  "im.vector.rule.invite_for_me": ".m.rule.invite_for_me",
  "im.vector.rule.call": ".m.rule.call",
  "im.vector.rule.notices": ".m.rule.suppress_notices"
};

function portLegacyActions(actions) {
  const decoded = _notifications.NotificationUtils.decodeActions(actions);

  if (decoded !== null) {
    return _notifications.NotificationUtils.encodeActions(decoded);
  } else {
    // We don't recognise one of the actions here, so we don't try to
    // canonicalise them.
    return actions;
  }
}

class Notifications extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      phase: Notifications.phases.LOADING,
      masterPushRule: undefined,
      // The master rule ('.m.rule.master')
      vectorPushRules: [],
      // HS default push rules displayed in Vector UI
      vectorContentRules: {
        // Keyword push rules displayed in Vector UI
        vectorState: _notifications.PushRuleVectorState.ON,
        rules: []
      },
      externalPushRules: [],
      // Push rules (except content rule) that have been defined outside Vector UI
      externalContentRules: [],
      // Keyword push rules that have been defined outside Vector UI
      threepids: [] // used for email notifications

    });
    (0, _defineProperty2.default)(this, "onEnableNotificationsChange", checked => {
      const self = this;
      this.setState({
        phase: Notifications.phases.LOADING
      });

      _MatrixClientPeg.MatrixClientPeg.get().setPushRuleEnabled('global', self.state.masterPushRule.kind, self.state.masterPushRule.rule_id, !checked).then(function () {
        self._refreshFromServer();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableDesktopNotificationsChange", checked => {
      _SettingsStore.default.setValue("notificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked).finally(() => {
        this.forceUpdate();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableDesktopNotificationBodyChange", checked => {
      _SettingsStore.default.setValue("notificationBodyEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked).finally(() => {
        this.forceUpdate();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableAudioNotificationsChange", checked => {
      _SettingsStore.default.setValue("audioNotificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked).finally(() => {
        this.forceUpdate();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableEmailNotificationsChange", (address, checked) => {
      let emailPusherPromise;

      if (checked) {
        const data = {};
        data['brand'] = _SdkConfig.default.get().brand;
        emailPusherPromise = _MatrixClientPeg.MatrixClientPeg.get().setPusher({
          kind: 'email',
          app_id: 'm.email',
          pushkey: address,
          app_display_name: 'Email Notifications',
          device_display_name: address,
          lang: navigator.language,
          data: data,
          append: true // We always append for email pushers since we don't want to stop other accounts notifying to the same email address

        });
      } else {
        const emailPusher = this.getEmailPusher(this.state.pushers, address);
        emailPusher.kind = null;
        emailPusherPromise = _MatrixClientPeg.MatrixClientPeg.get().setPusher(emailPusher);
      }

      emailPusherPromise.then(() => {
        this._refreshFromServer();
      }, error => {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Error saving email notification preferences', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error saving email notification preferences'),
          description: (0, _languageHandler._t)('An error occurred whilst saving your email notification preferences.')
        });
      });
    });
    (0, _defineProperty2.default)(this, "onNotifStateButtonClicked", event => {
      // FIXME: use .bind() rather than className metadata here surely
      const vectorRuleId = event.target.className.split("-")[0];
      const newPushRuleVectorState = event.target.className.split("-")[1];

      if ("_keywords" === vectorRuleId) {
        this._setKeywordsPushRuleVectorState(newPushRuleVectorState);
      } else {
        const rule = this.getRule(vectorRuleId);

        if (rule) {
          this._setPushRuleVectorState(rule, newPushRuleVectorState);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onKeywordsClicked", event => {
      // Compute the keywords list to display
      let keywords = [];

      for (const i in this.state.vectorContentRules.rules) {
        const rule = this.state.vectorContentRules.rules[i];
        keywords.push(rule.pattern);
      }

      if (keywords.length) {
        // As keeping the order of per-word push rules hs side is a bit tricky to code,
        // display the keywords in alphabetical order to the user
        keywords.sort();
        keywords = keywords.join(", ");
      } else {
        keywords = "";
      }

      const TextInputDialog = sdk.getComponent("dialogs.TextInputDialog");

      _Modal.default.createTrackedDialog('Keywords Dialog', '', TextInputDialog, {
        title: (0, _languageHandler._t)('Keywords'),
        description: (0, _languageHandler._t)('Enter keywords separated by a comma:'),
        button: (0, _languageHandler._t)('OK'),
        value: keywords,
        onFinished: (shouldLeave, newValue) => {
          if (shouldLeave && newValue !== keywords) {
            let newKeywords = newValue.split(',');

            for (const i in newKeywords) {
              newKeywords[i] = newKeywords[i].trim();
            } // Remove duplicates and empty


            newKeywords = newKeywords.reduce(function (array, keyword) {
              if (keyword !== "" && array.indexOf(keyword) < 0) {
                array.push(keyword);
              }

              return array;
            }, []);

            this._setKeywords(newKeywords);
          }
        }
      });
    });
    (0, _defineProperty2.default)(this, "_refreshFromServer", () => {
      const self = this;

      const pushRulesPromise = _MatrixClientPeg.MatrixClientPeg.get().getPushRules().then(self._portRulesToNewAPI).then(function (rulesets) {
        /// XXX seriously? wtf is this?
        _MatrixClientPeg.MatrixClientPeg.get().pushRules = rulesets; // Get homeserver default rules and triage them by categories

        const ruleCategories = {
          // The master rule (all notifications disabling)
          '.m.rule.master': 'master',
          // The default push rules displayed by Vector UI
          '.m.rule.contains_display_name': 'vector',
          '.m.rule.contains_user_name': 'vector',
          '.m.rule.roomnotif': 'vector',
          '.m.rule.room_one_to_one': 'vector',
          '.m.rule.encrypted_room_one_to_one': 'vector',
          '.m.rule.message': 'vector',
          '.m.rule.encrypted': 'vector',
          '.m.rule.invite_for_me': 'vector',
          //'.m.rule.member_event': 'vector',
          '.m.rule.call': 'vector',
          '.m.rule.suppress_notices': 'vector',
          '.m.rule.tombstone': 'vector' // Others go to others

        }; // HS default rules

        const defaultRules = {
          master: [],
          vector: {},
          others: []
        };

        for (const kind in rulesets.global) {
          for (let i = 0; i < Object.keys(rulesets.global[kind]).length; ++i) {
            const r = rulesets.global[kind][i];
            const cat = ruleCategories[r.rule_id];
            r.kind = kind;

            if (r.rule_id[0] === '.') {
              if (cat === 'vector') {
                defaultRules.vector[r.rule_id] = r;
              } else if (cat === 'master') {
                defaultRules.master.push(r);
              } else {
                defaultRules['others'].push(r);
              }
            }
          }
        } // Get the master rule if any defined by the hs


        if (defaultRules.master.length > 0) {
          self.state.masterPushRule = defaultRules.master[0];
        } // parse the keyword rules into our state


        const contentRules = _notifications.ContentRules.parseContentRules(rulesets);

        self.state.vectorContentRules = {
          vectorState: contentRules.vectorState,
          rules: contentRules.rules
        };
        self.state.externalContentRules = contentRules.externalRules; // Build the rules displayed in the Vector UI matrix table

        self.state.vectorPushRules = [];
        self.state.externalPushRules = [];
        const vectorRuleIds = ['.m.rule.contains_display_name', '.m.rule.contains_user_name', '.m.rule.roomnotif', '_keywords', '.m.rule.room_one_to_one', '.m.rule.encrypted_room_one_to_one', '.m.rule.message', '.m.rule.encrypted', '.m.rule.invite_for_me', //'im.vector.rule.member_event',
        '.m.rule.call', '.m.rule.suppress_notices', '.m.rule.tombstone'];

        for (const i in vectorRuleIds) {
          const vectorRuleId = vectorRuleIds[i];

          if (vectorRuleId === '_keywords') {
            // keywords needs a special handling
            // For Vector UI, this is a single global push rule but translated in Matrix,
            // it corresponds to all content push rules (stored in self.state.vectorContentRule)
            self.state.vectorPushRules.push({
              "vectorRuleId": "_keywords",
              "description": /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)('Messages containing <span>keywords</span>', {}, {
                'span': sub => /*#__PURE__*/_react.default.createElement("span", {
                  className: "mx_UserNotifSettings_keywords",
                  onClick: self.onKeywordsClicked
                }, sub)
              })),
              "vectorState": self.state.vectorContentRules.vectorState
            });
          } else {
            const ruleDefinition = _notifications.VectorPushRulesDefinitions[vectorRuleId];
            const rule = defaultRules.vector[vectorRuleId];
            const vectorState = ruleDefinition.ruleToVectorState(rule); //console.log("Refreshing vectorPushRules for " + vectorRuleId +", "+ ruleDefinition.description +", " + rule +", " + vectorState);

            self.state.vectorPushRules.push({
              "vectorRuleId": vectorRuleId,
              "description": (0, _languageHandler._t)(ruleDefinition.description),
              // Text from VectorPushRulesDefinitions.js
              "rule": rule,
              "vectorState": vectorState
            }); // if there was a rule which we couldn't parse, add it to the external list

            if (rule && !vectorState) {
              rule.description = ruleDefinition.description;
              self.state.externalPushRules.push(rule);
            }
          }
        } // Build the rules not managed by Vector UI


        const otherRulesDescriptions = {
          '.m.rule.message': (0, _languageHandler._t)('Notify for all other messages/rooms'),
          '.m.rule.fallback': (0, _languageHandler._t)('Notify me for anything else')
        };

        for (const i in defaultRules.others) {
          const rule = defaultRules.others[i];
          const ruleDescription = otherRulesDescriptions[rule.rule_id]; // Show enabled default rules that was modified by the user

          if (ruleDescription && rule.enabled && !rule.default) {
            rule.description = ruleDescription;
            self.state.externalPushRules.push(rule);
          }
        }
      });

      const pushersPromise = _MatrixClientPeg.MatrixClientPeg.get().getPushers().then(function (resp) {
        self.setState({
          pushers: resp.pushers
        });
      });

      Promise.all([pushRulesPromise, pushersPromise]).then(function () {
        self.setState({
          phase: Notifications.phases.DISPLAY
        });
      }, function (error) {
        console.error(error);
        self.setState({
          phase: Notifications.phases.ERROR
        });
      }).finally(() => {
        // actually explicitly update our state  having been deep-manipulating it
        self.setState({
          masterPushRule: self.state.masterPushRule,
          vectorContentRules: self.state.vectorContentRules,
          vectorPushRules: self.state.vectorPushRules,
          externalContentRules: self.state.externalContentRules,
          externalPushRules: self.state.externalPushRules
        });
      });

      _MatrixClientPeg.MatrixClientPeg.get().getThreePids().then(r => this.setState({
        threepids: r.threepids
      }));
    });
    (0, _defineProperty2.default)(this, "_onClearNotifications", () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      cli.getRooms().forEach(r => {
        if (r.getUnreadNotificationCount() > 0) {
          const events = r.getLiveTimeline().getEvents();
          if (events.length) cli.sendReadReceipt(events.pop());
        }
      });
    });
  }

  componentDidMount() {
    this._refreshFromServer();
  }

  /*
   * Returns the email pusher (pusher of type 'email') for a given
   * email address. Email pushers all have the same app ID, so since
   * pushers are unique over (app ID, pushkey), there will be at most
   * one such pusher.
   */
  getEmailPusher(pushers, address) {
    if (pushers === undefined) {
      return undefined;
    }

    for (let i = 0; i < pushers.length; ++i) {
      if (pushers[i].kind === 'email' && pushers[i].pushkey === address) {
        return pushers[i];
      }
    }

    return undefined;
  }

  getRule(vectorRuleId) {
    for (const i in this.state.vectorPushRules) {
      const rule = this.state.vectorPushRules[i];

      if (rule.vectorRuleId === vectorRuleId) {
        return rule;
      }
    }
  }

  _setPushRuleVectorState(rule, newPushRuleVectorState) {
    if (rule && rule.vectorState !== newPushRuleVectorState) {
      this.setState({
        phase: Notifications.phases.LOADING
      });
      const self = this;

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const deferreds = [];
      const ruleDefinition = _notifications.VectorPushRulesDefinitions[rule.vectorRuleId];

      if (rule.rule) {
        const actions = ruleDefinition.vectorStateToActions[newPushRuleVectorState];

        if (!actions) {
          // The new state corresponds to disabling the rule.
          deferreds.push(cli.setPushRuleEnabled('global', rule.rule.kind, rule.rule.rule_id, false));
        } else {
          // The new state corresponds to enabling the rule and setting specific actions
          deferreds.push(this._updatePushRuleActions(rule.rule, actions, true));
        }
      }

      Promise.all(deferreds).then(function () {
        self._refreshFromServer();
      }, function (error) {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        console.error("Failed to change settings: " + error);

        _Modal.default.createTrackedDialog('Failed to change settings', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Failed to change settings'),
          description: error && error.message ? error.message : (0, _languageHandler._t)('Operation failed'),
          onFinished: self._refreshFromServer
        });
      });
    }
  }

  _setKeywordsPushRuleVectorState(newPushRuleVectorState) {
    // Is there really a change?
    if (this.state.vectorContentRules.vectorState === newPushRuleVectorState || this.state.vectorContentRules.rules.length === 0) {
      return;
    }

    const self = this;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    this.setState({
      phase: Notifications.phases.LOADING
    }); // Update all rules in self.state.vectorContentRules

    const deferreds = [];

    for (const i in this.state.vectorContentRules.rules) {
      const rule = this.state.vectorContentRules.rules[i];
      let enabled;
      let actions;

      switch (newPushRuleVectorState) {
        case _notifications.PushRuleVectorState.ON:
          if (rule.actions.length !== 1) {
            actions = _notifications.PushRuleVectorState.actionsFor(_notifications.PushRuleVectorState.ON);
          }

          if (this.state.vectorContentRules.vectorState === _notifications.PushRuleVectorState.OFF) {
            enabled = true;
          }

          break;

        case _notifications.PushRuleVectorState.LOUD:
          if (rule.actions.length !== 3) {
            actions = _notifications.PushRuleVectorState.actionsFor(_notifications.PushRuleVectorState.LOUD);
          }

          if (this.state.vectorContentRules.vectorState === _notifications.PushRuleVectorState.OFF) {
            enabled = true;
          }

          break;

        case _notifications.PushRuleVectorState.OFF:
          enabled = false;
          break;
      }

      if (actions) {
        // Note that the workaround in _updatePushRuleActions will automatically
        // enable the rule
        deferreds.push(this._updatePushRuleActions(rule, actions, enabled));
      } else if (enabled != undefined) {
        deferreds.push(cli.setPushRuleEnabled('global', rule.kind, rule.rule_id, enabled));
      }
    }

    Promise.all(deferreds).then(function (resps) {
      self._refreshFromServer();
    }, function (error) {
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      console.error("Can't update user notification settings: " + error);

      _Modal.default.createTrackedDialog('Can\'t update user notifcation settings', '', ErrorDialog, {
        title: (0, _languageHandler._t)('Can\'t update user notification settings'),
        description: error && error.message ? error.message : (0, _languageHandler._t)('Operation failed'),
        onFinished: self._refreshFromServer
      });
    });
  }

  _setKeywords(newKeywords) {
    this.setState({
      phase: Notifications.phases.LOADING
    });
    const self = this;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const removeDeferreds = []; // Remove per-word push rules of keywords that are no more in the list

    const vectorContentRulesPatterns = [];

    for (const i in self.state.vectorContentRules.rules) {
      const rule = self.state.vectorContentRules.rules[i];
      vectorContentRulesPatterns.push(rule.pattern);

      if (newKeywords.indexOf(rule.pattern) < 0) {
        removeDeferreds.push(cli.deletePushRule('global', rule.kind, rule.rule_id));
      }
    } // If the keyword is part of `externalContentRules`, remove the rule
    // before recreating it in the right Vector path


    for (const i in self.state.externalContentRules) {
      const rule = self.state.externalContentRules[i];

      if (newKeywords.indexOf(rule.pattern) >= 0) {
        removeDeferreds.push(cli.deletePushRule('global', rule.kind, rule.rule_id));
      }
    }

    const onError = function (error) {
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      console.error("Failed to update keywords: " + error);

      _Modal.default.createTrackedDialog('Failed to update keywords', '', ErrorDialog, {
        title: (0, _languageHandler._t)('Failed to update keywords'),
        description: error && error.message ? error.message : (0, _languageHandler._t)('Operation failed'),
        onFinished: self._refreshFromServer
      });
    }; // Then, add the new ones


    Promise.all(removeDeferreds).then(function (resps) {
      const deferreds = [];
      let pushRuleVectorStateKind = self.state.vectorContentRules.vectorState;

      if (pushRuleVectorStateKind === _notifications.PushRuleVectorState.OFF) {
        // When the current global keywords rule is OFF, we need to look at
        // the flavor of rules in 'vectorContentRules' to apply the same actions
        // when creating the new rule.
        // Thus, this new rule will join the 'vectorContentRules' set.
        if (self.state.vectorContentRules.rules.length) {
          pushRuleVectorStateKind = _notifications.PushRuleVectorState.contentRuleVectorStateKind(self.state.vectorContentRules.rules[0]);
        } else {
          // ON is default
          pushRuleVectorStateKind = _notifications.PushRuleVectorState.ON;
        }
      }

      for (const i in newKeywords) {
        const keyword = newKeywords[i];

        if (vectorContentRulesPatterns.indexOf(keyword) < 0) {
          if (self.state.vectorContentRules.vectorState !== _notifications.PushRuleVectorState.OFF) {
            deferreds.push(cli.addPushRule('global', 'content', keyword, {
              actions: _notifications.PushRuleVectorState.actionsFor(pushRuleVectorStateKind),
              pattern: keyword
            }));
          } else {
            deferreds.push(self._addDisabledPushRule('global', 'content', keyword, {
              actions: _notifications.PushRuleVectorState.actionsFor(pushRuleVectorStateKind),
              pattern: keyword
            }));
          }
        }
      }

      Promise.all(deferreds).then(function (resps) {
        self._refreshFromServer();
      }, onError);
    }, onError);
  } // Create a push rule but disabled


  _addDisabledPushRule(scope, kind, ruleId, body) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    return cli.addPushRule(scope, kind, ruleId, body).then(() => cli.setPushRuleEnabled(scope, kind, ruleId, false));
  } // Check if any legacy im.vector rules need to be ported to the new API
  // for overriding the actions of default rules.


  _portRulesToNewAPI(rulesets) {
    const needsUpdate = [];

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    for (const kind in rulesets.global) {
      const ruleset = rulesets.global[kind];

      for (let i = 0; i < ruleset.length; ++i) {
        const rule = ruleset[i];

        if (rule.rule_id in LEGACY_RULES) {
          console.log("Porting legacy rule", rule);
          needsUpdate.push(function (kind, rule) {
            return cli.setPushRuleActions('global', kind, LEGACY_RULES[rule.rule_id], portLegacyActions(rule.actions)).then(() => cli.deletePushRule('global', kind, rule.rule_id)).catch(e => {
              console.warn(`Error when porting legacy rule: ${e}`);
            });
          }(kind, rule));
        }
      }
    }

    if (needsUpdate.length > 0) {
      // If some of the rules need to be ported then wait for the porting
      // to happen and then fetch the rules again.
      return Promise.all(needsUpdate).then(() => cli.getPushRules());
    } else {
      // Otherwise return the rules that we already have.
      return rulesets;
    }
  }

  _updatePushRuleActions(rule, actions, enabled) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    return cli.setPushRuleActions('global', rule.kind, rule.rule_id, actions).then(function () {
      // Then, if requested, enabled or disabled the rule
      if (undefined != enabled) {
        return cli.setPushRuleEnabled('global', rule.kind, rule.rule_id, enabled);
      }
    });
  }

  renderNotifRulesTableRow(title, className, pushRuleVectorState) {
    return /*#__PURE__*/_react.default.createElement("tr", {
      key: className
    }, /*#__PURE__*/_react.default.createElement("th", null, title), /*#__PURE__*/_react.default.createElement("th", null, /*#__PURE__*/_react.default.createElement("input", {
      className: className + "-" + _notifications.PushRuleVectorState.OFF,
      type: "radio",
      checked: pushRuleVectorState === _notifications.PushRuleVectorState.OFF,
      onChange: this.onNotifStateButtonClicked
    })), /*#__PURE__*/_react.default.createElement("th", null, /*#__PURE__*/_react.default.createElement("input", {
      className: className + "-" + _notifications.PushRuleVectorState.ON,
      type: "radio",
      checked: pushRuleVectorState === _notifications.PushRuleVectorState.ON,
      onChange: this.onNotifStateButtonClicked
    })), /*#__PURE__*/_react.default.createElement("th", null, /*#__PURE__*/_react.default.createElement("input", {
      className: className + "-" + _notifications.PushRuleVectorState.LOUD,
      type: "radio",
      checked: pushRuleVectorState === _notifications.PushRuleVectorState.LOUD,
      onChange: this.onNotifStateButtonClicked
    })));
  }

  renderNotifRulesTableRows() {
    const rows = [];

    for (const i in this.state.vectorPushRules) {
      const rule = this.state.vectorPushRules[i];

      if (rule.rule === undefined && rule.vectorRuleId.startsWith(".m.")) {
        console.warn(`Skipping render of rule ${rule.vectorRuleId} due to no underlying rule`);
        continue;
      } //console.log("rendering: " + rule.description + ", " + rule.vectorRuleId + ", " + rule.vectorState);


      rows.push(this.renderNotifRulesTableRow(rule.description, rule.vectorRuleId, rule.vectorState));
    }

    return rows;
  }

  hasEmailPusher(pushers, address) {
    if (pushers === undefined) {
      return false;
    }

    for (let i = 0; i < pushers.length; ++i) {
      if (pushers[i].kind === 'email' && pushers[i].pushkey === address) {
        return true;
      }
    }

    return false;
  }

  emailNotificationsRow(address, label) {
    return /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: this.hasEmailPusher(this.state.pushers, address),
      onChange: this.onEnableEmailNotificationsChange.bind(this, address),
      label: label,
      key: `emailNotif_${label}`
    });
  }

  render() {
    let spinner;

    if (this.state.phase === Notifications.phases.LOADING) {
      const Loader = sdk.getComponent("elements.Spinner");
      spinner = /*#__PURE__*/_react.default.createElement(Loader, null);
    }

    let masterPushRuleDiv;

    if (this.state.masterPushRule) {
      masterPushRuleDiv = /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
        value: !this.state.masterPushRule.enabled,
        onChange: this.onEnableNotificationsChange,
        label: (0, _languageHandler._t)('Enable notifications for this account')
      });
    }

    let clearNotificationsButton;

    if (_MatrixClientPeg.MatrixClientPeg.get().getRooms().some(r => r.getUnreadNotificationCount() > 0)) {
      clearNotificationsButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onClearNotifications,
        kind: "danger"
      }, (0, _languageHandler._t)("Clear notifications"));
    } // When enabled, the master rule inhibits all existing rules
    // So do not show all notification settings


    if (this.state.masterPushRule && this.state.masterPushRule.enabled) {
      return /*#__PURE__*/_react.default.createElement("div", null, masterPushRuleDiv, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserNotifSettings_notifTable"
      }, (0, _languageHandler._t)('All notifications are currently disabled for all targets.')), clearNotificationsButton);
    }

    const emailThreepids = this.state.threepids.filter(tp => tp.medium === "email");
    let emailNotificationsRows;

    if (emailThreepids.length > 0) {
      emailNotificationsRows = emailThreepids.map(threePid => this.emailNotificationsRow(threePid.address, `${(0, _languageHandler._t)('Enable email notifications')} (${threePid.address})`));
    } else if (_SettingsStore.default.getValue(_UIFeature.UIFeature.ThirdPartyID)) {
      emailNotificationsRows = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Add an email address to configure email notifications'));
    } // Build external push rules


    const externalRules = [];

    for (const i in this.state.externalPushRules) {
      const rule = this.state.externalPushRules[i];
      externalRules.push( /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)(rule.description)));
    } // Show keywords not displayed by the vector UI as a single external push rule


    let externalKeywords = [];

    for (const i in this.state.externalContentRules) {
      const rule = this.state.externalContentRules[i];
      externalKeywords.push(rule.pattern);
    }

    if (externalKeywords.length) {
      externalKeywords = externalKeywords.join(", ");
      externalRules.push( /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)('Notifications on the following keywords follow rules which can’t be displayed here:'), externalKeywords));
    }

    let devicesSection;

    if (this.state.pushers === undefined) {
      devicesSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, (0, _languageHandler._t)('Unable to fetch notification target list'));
    } else if (this.state.pushers.length === 0) {
      devicesSection = null;
    } else {
      // TODO: It would be great to be able to delete pushers from here too,
      // and this wouldn't be hard to add.
      const rows = [];

      for (let i = 0; i < this.state.pushers.length; ++i) {
        rows.push( /*#__PURE__*/_react.default.createElement("tr", {
          key: i
        }, /*#__PURE__*/_react.default.createElement("td", null, this.state.pushers[i].app_display_name), /*#__PURE__*/_react.default.createElement("td", null, this.state.pushers[i].device_display_name)));
      }

      devicesSection = /*#__PURE__*/_react.default.createElement("table", {
        className: "mx_UserNotifSettings_devicesTable"
      }, /*#__PURE__*/_react.default.createElement("tbody", null, rows));
    }

    if (devicesSection) {
      devicesSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Notification targets')), devicesSection);
    }

    let advancedSettings;

    if (externalRules.length) {
      const brand = _SdkConfig.default.get().brand;

      advancedSettings = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Advanced notification settings')), (0, _languageHandler._t)('There are advanced notifications which are not shown here.'), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)('You might have configured them in a client other than %(brand)s. ' + 'You cannot tune them in %(brand)s but they still apply.', {
        brand
      }), /*#__PURE__*/_react.default.createElement("ul", null, externalRules));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, masterPushRuleDiv, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserNotifSettings_notifTable"
    }, spinner, /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: _SettingsStore.default.getValue("notificationsEnabled"),
      onChange: this.onEnableDesktopNotificationsChange,
      label: (0, _languageHandler._t)('Enable desktop notifications for this session')
    }), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: _SettingsStore.default.getValue("notificationBodyEnabled"),
      onChange: this.onEnableDesktopNotificationBodyChange,
      label: (0, _languageHandler._t)('Show message in desktop notification')
    }), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: _SettingsStore.default.getValue("audioNotificationsEnabled"),
      onChange: this.onEnableAudioNotificationsChange,
      label: (0, _languageHandler._t)('Enable audible notifications for this session')
    }), emailNotificationsRows, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserNotifSettings_pushRulesTableWrapper"
    }, /*#__PURE__*/_react.default.createElement("table", {
      className: "mx_UserNotifSettings_pushRulesTable"
    }, /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", {
      width: "55%"
    }), /*#__PURE__*/_react.default.createElement("th", {
      width: "15%"
    }, (0, _languageHandler._t)('Off')), /*#__PURE__*/_react.default.createElement("th", {
      width: "15%"
    }, (0, _languageHandler._t)('On')), /*#__PURE__*/_react.default.createElement("th", {
      width: "15%"
    }, (0, _languageHandler._t)('Noisy')))), /*#__PURE__*/_react.default.createElement("tbody", null, this.renderNotifRulesTableRows()))), advancedSettings, devicesSection, clearNotificationsButton));
  }

}

exports.default = Notifications;
(0, _defineProperty2.default)(Notifications, "phases", {
  LOADING: "LOADING",
  // The component is loading or sending data to the hs
  DISPLAY: "DISPLAY",
  // The component is ready and display data
  ERROR: "ERROR" // There was an error

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL05vdGlmaWNhdGlvbnMuanMiXSwibmFtZXMiOlsiTEVHQUNZX1JVTEVTIiwicG9ydExlZ2FjeUFjdGlvbnMiLCJhY3Rpb25zIiwiZGVjb2RlZCIsIk5vdGlmaWNhdGlvblV0aWxzIiwiZGVjb2RlQWN0aW9ucyIsImVuY29kZUFjdGlvbnMiLCJOb3RpZmljYXRpb25zIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwaGFzZSIsInBoYXNlcyIsIkxPQURJTkciLCJtYXN0ZXJQdXNoUnVsZSIsInVuZGVmaW5lZCIsInZlY3RvclB1c2hSdWxlcyIsInZlY3RvckNvbnRlbnRSdWxlcyIsInZlY3RvclN0YXRlIiwiUHVzaFJ1bGVWZWN0b3JTdGF0ZSIsIk9OIiwicnVsZXMiLCJleHRlcm5hbFB1c2hSdWxlcyIsImV4dGVybmFsQ29udGVudFJ1bGVzIiwidGhyZWVwaWRzIiwiY2hlY2tlZCIsInNlbGYiLCJzZXRTdGF0ZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNldFB1c2hSdWxlRW5hYmxlZCIsInN0YXRlIiwia2luZCIsInJ1bGVfaWQiLCJ0aGVuIiwiX3JlZnJlc2hGcm9tU2VydmVyIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwiZmluYWxseSIsImZvcmNlVXBkYXRlIiwiYWRkcmVzcyIsImVtYWlsUHVzaGVyUHJvbWlzZSIsImRhdGEiLCJTZGtDb25maWciLCJicmFuZCIsInNldFB1c2hlciIsImFwcF9pZCIsInB1c2hrZXkiLCJhcHBfZGlzcGxheV9uYW1lIiwiZGV2aWNlX2Rpc3BsYXlfbmFtZSIsImxhbmciLCJuYXZpZ2F0b3IiLCJsYW5ndWFnZSIsImFwcGVuZCIsImVtYWlsUHVzaGVyIiwiZ2V0RW1haWxQdXNoZXIiLCJwdXNoZXJzIiwiZXJyb3IiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJldmVudCIsInZlY3RvclJ1bGVJZCIsInRhcmdldCIsImNsYXNzTmFtZSIsInNwbGl0IiwibmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZSIsIl9zZXRLZXl3b3Jkc1B1c2hSdWxlVmVjdG9yU3RhdGUiLCJydWxlIiwiZ2V0UnVsZSIsIl9zZXRQdXNoUnVsZVZlY3RvclN0YXRlIiwia2V5d29yZHMiLCJpIiwicHVzaCIsInBhdHRlcm4iLCJsZW5ndGgiLCJzb3J0Iiwiam9pbiIsIlRleHRJbnB1dERpYWxvZyIsImJ1dHRvbiIsInZhbHVlIiwib25GaW5pc2hlZCIsInNob3VsZExlYXZlIiwibmV3VmFsdWUiLCJuZXdLZXl3b3JkcyIsInRyaW0iLCJyZWR1Y2UiLCJhcnJheSIsImtleXdvcmQiLCJpbmRleE9mIiwiX3NldEtleXdvcmRzIiwicHVzaFJ1bGVzUHJvbWlzZSIsImdldFB1c2hSdWxlcyIsIl9wb3J0UnVsZXNUb05ld0FQSSIsInJ1bGVzZXRzIiwicHVzaFJ1bGVzIiwicnVsZUNhdGVnb3JpZXMiLCJkZWZhdWx0UnVsZXMiLCJtYXN0ZXIiLCJ2ZWN0b3IiLCJvdGhlcnMiLCJnbG9iYWwiLCJPYmplY3QiLCJrZXlzIiwiciIsImNhdCIsImNvbnRlbnRSdWxlcyIsIkNvbnRlbnRSdWxlcyIsInBhcnNlQ29udGVudFJ1bGVzIiwiZXh0ZXJuYWxSdWxlcyIsInZlY3RvclJ1bGVJZHMiLCJzdWIiLCJvbktleXdvcmRzQ2xpY2tlZCIsInJ1bGVEZWZpbml0aW9uIiwiVmVjdG9yUHVzaFJ1bGVzRGVmaW5pdGlvbnMiLCJydWxlVG9WZWN0b3JTdGF0ZSIsIm90aGVyUnVsZXNEZXNjcmlwdGlvbnMiLCJydWxlRGVzY3JpcHRpb24iLCJlbmFibGVkIiwiZGVmYXVsdCIsInB1c2hlcnNQcm9taXNlIiwiZ2V0UHVzaGVycyIsInJlc3AiLCJQcm9taXNlIiwiYWxsIiwiRElTUExBWSIsImNvbnNvbGUiLCJFUlJPUiIsImdldFRocmVlUGlkcyIsImNsaSIsImdldFJvb21zIiwiZm9yRWFjaCIsImdldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50IiwiZXZlbnRzIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZ2V0RXZlbnRzIiwic2VuZFJlYWRSZWNlaXB0IiwicG9wIiwiY29tcG9uZW50RGlkTW91bnQiLCJkZWZlcnJlZHMiLCJ2ZWN0b3JTdGF0ZVRvQWN0aW9ucyIsIl91cGRhdGVQdXNoUnVsZUFjdGlvbnMiLCJtZXNzYWdlIiwiYWN0aW9uc0ZvciIsIk9GRiIsIkxPVUQiLCJyZXNwcyIsInJlbW92ZURlZmVycmVkcyIsInZlY3RvckNvbnRlbnRSdWxlc1BhdHRlcm5zIiwiZGVsZXRlUHVzaFJ1bGUiLCJvbkVycm9yIiwicHVzaFJ1bGVWZWN0b3JTdGF0ZUtpbmQiLCJjb250ZW50UnVsZVZlY3RvclN0YXRlS2luZCIsImFkZFB1c2hSdWxlIiwiX2FkZERpc2FibGVkUHVzaFJ1bGUiLCJzY29wZSIsInJ1bGVJZCIsImJvZHkiLCJuZWVkc1VwZGF0ZSIsInJ1bGVzZXQiLCJsb2ciLCJzZXRQdXNoUnVsZUFjdGlvbnMiLCJjYXRjaCIsImUiLCJ3YXJuIiwicmVuZGVyTm90aWZSdWxlc1RhYmxlUm93IiwicHVzaFJ1bGVWZWN0b3JTdGF0ZSIsIm9uTm90aWZTdGF0ZUJ1dHRvbkNsaWNrZWQiLCJyZW5kZXJOb3RpZlJ1bGVzVGFibGVSb3dzIiwicm93cyIsInN0YXJ0c1dpdGgiLCJoYXNFbWFpbFB1c2hlciIsImVtYWlsTm90aWZpY2F0aW9uc1JvdyIsImxhYmVsIiwib25FbmFibGVFbWFpbE5vdGlmaWNhdGlvbnNDaGFuZ2UiLCJiaW5kIiwicmVuZGVyIiwic3Bpbm5lciIsIkxvYWRlciIsIm1hc3RlclB1c2hSdWxlRGl2Iiwib25FbmFibGVOb3RpZmljYXRpb25zQ2hhbmdlIiwiY2xlYXJOb3RpZmljYXRpb25zQnV0dG9uIiwic29tZSIsIl9vbkNsZWFyTm90aWZpY2F0aW9ucyIsImVtYWlsVGhyZWVwaWRzIiwiZmlsdGVyIiwidHAiLCJtZWRpdW0iLCJlbWFpbE5vdGlmaWNhdGlvbnNSb3dzIiwibWFwIiwidGhyZWVQaWQiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIlRoaXJkUGFydHlJRCIsImV4dGVybmFsS2V5d29yZHMiLCJkZXZpY2VzU2VjdGlvbiIsImFkdmFuY2VkU2V0dGluZ3MiLCJvbkVuYWJsZURlc2t0b3BOb3RpZmljYXRpb25zQ2hhbmdlIiwib25FbmFibGVEZXNrdG9wTm90aWZpY2F0aW9uQm9keUNoYW5nZSIsIm9uRW5hYmxlQXVkaW9Ob3RpZmljYXRpb25zQ2hhbmdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQWpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CQTtBQUNBO0FBRUE7QUFDQTs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsWUFBWSxHQUFHO0FBQ2pCLDBDQUF3QywrQkFEdkI7QUFFakIsb0NBQWtDLHlCQUZqQjtBQUdqQixpQ0FBK0IsaUJBSGQ7QUFJakIsa0NBQWdDLHVCQUpmO0FBS2pCLHlCQUF1QixjQUxOO0FBTWpCLDRCQUEwQjtBQU5ULENBQXJCOztBQVNBLFNBQVNDLGlCQUFULENBQTJCQyxPQUEzQixFQUFvQztBQUNoQyxRQUFNQyxPQUFPLEdBQUdDLGlDQUFrQkMsYUFBbEIsQ0FBZ0NILE9BQWhDLENBQWhCOztBQUNBLE1BQUlDLE9BQU8sS0FBSyxJQUFoQixFQUFzQjtBQUNsQixXQUFPQyxpQ0FBa0JFLGFBQWxCLENBQWdDSCxPQUFoQyxDQUFQO0FBQ0gsR0FGRCxNQUVPO0FBQ0g7QUFDQTtBQUNBLFdBQU9ELE9BQVA7QUFDSDtBQUNKOztBQUVjLE1BQU1LLGFBQU4sU0FBNEJDLGVBQU1DLFNBQWxDLENBQTRDO0FBQUE7QUFBQTtBQUFBLGlEQU8vQztB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RUFBQztBQUFmLG9CQUNJO0FBQU8sTUFBQSxTQUFTLEVBQUM7QUFBakIsb0JBQ0kseURBQ0ksc0RBQ0k7QUFBSSxNQUFBLEtBQUssRUFBQztBQUFWLE1BREosZUFFSTtBQUFJLE1BQUEsS0FBSyxFQUFDO0FBQVYsT0FBa0IseUJBQUcsS0FBSCxDQUFsQixDQUZKLGVBR0k7QUFBSSxNQUFBLEtBQUssRUFBQztBQUFWLE9BQWtCLHlCQUFHLElBQUgsQ0FBbEIsQ0FISixlQUlJO0FBQUksTUFBQSxLQUFLLEVBQUM7QUFBVixPQUFrQix5QkFBRyxPQUFILENBQWxCLENBSkosQ0FESixDQURKLGVBU0ksNENBRU0sS0FBS3BCLHlCQUFMLEVBRk4sQ0FUSixDQURKLENBbEJKLEVBb0NNNEIsZ0JBcENOLEVBc0NNRCxjQXRDTixFQXdDTWQsd0JBeENOLENBSkosQ0FESjtBQWtESDs7QUEvMEJzRDs7OzhCQUF0Q25MLGEsWUFDRDtBQUNaSyxFQUFBQSxPQUFPLEVBQUUsU0FERztBQUNRO0FBQ3BCc0gsRUFBQUEsT0FBTyxFQUFFLFNBRkc7QUFFUTtBQUNwQkUsRUFBQUEsS0FBSyxFQUFFLE9BSEssQ0FHSTs7QUFISixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQge1xuICAgIE5vdGlmaWNhdGlvblV0aWxzLFxuICAgIFZlY3RvclB1c2hSdWxlc0RlZmluaXRpb25zLFxuICAgIFB1c2hSdWxlVmVjdG9yU3RhdGUsXG4gICAgQ29udGVudFJ1bGVzLFxufSBmcm9tICcuLi8uLi8uLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IExhYmVsbGVkVG9nZ2xlU3dpdGNoIGZyb20gXCIuLi9lbGVtZW50cy9MYWJlbGxlZFRvZ2dsZVN3aXRjaFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuXG4vLyBUT0RPOiB0aGlzIFwidmlld1wiIGNvbXBvbmVudCBzdGlsbCBoYXMgZmFyIHRvbyBtdWNoIGFwcGxpY2F0aW9uIGxvZ2ljIGluIGl0LFxuLy8gd2hpY2ggc2hvdWxkIGJlIGZhY3RvcmVkIG91dCB0byBvdGhlciBmaWxlcy5cblxuLy8gVE9ETzogdGhpcyBjb21wb25lbnQgYWxzbyBkb2VzIGEgbG90IG9mIGRpcmVjdCBwb2tpbmcgaW50byB0aGlzLnN0YXRlLCB3aGljaFxuLy8gaXMgVkVSWSBOQVVHSFRZLlxuXG5cbi8qKlxuICogUnVsZXMgdGhhdCBWZWN0b3IgdXNlZCB0byBzZXQgaW4gb3JkZXIgdG8gb3ZlcnJpZGUgdGhlIGFjdGlvbnMgb2YgZGVmYXVsdCBydWxlcy5cbiAqIFRoZXNlIGFyZSB1c2VkIHRvIHBvcnQgcGVvcGxlcyBleGlzdGluZyBvdmVycmlkZXMgdG8gbWF0Y2ggdGhlIGN1cnJlbnQgQVBJLlxuICogVGhlc2UgY2FuIGJlIHJlbW92ZWQgYW5kIGZvcmdvdHRlbiBvbmNlIGV2ZXJ5b25lIGhhcyBtb3ZlZCB0byB0aGUgbmV3IGNsaWVudC5cbiAqL1xuY29uc3QgTEVHQUNZX1JVTEVTID0ge1xuICAgIFwiaW0udmVjdG9yLnJ1bGUuY29udGFpbnNfZGlzcGxheV9uYW1lXCI6IFwiLm0ucnVsZS5jb250YWluc19kaXNwbGF5X25hbWVcIixcbiAgICBcImltLnZlY3Rvci5ydWxlLnJvb21fb25lX3RvX29uZVwiOiBcIi5tLnJ1bGUucm9vbV9vbmVfdG9fb25lXCIsXG4gICAgXCJpbS52ZWN0b3IucnVsZS5yb29tX21lc3NhZ2VcIjogXCIubS5ydWxlLm1lc3NhZ2VcIixcbiAgICBcImltLnZlY3Rvci5ydWxlLmludml0ZV9mb3JfbWVcIjogXCIubS5ydWxlLmludml0ZV9mb3JfbWVcIixcbiAgICBcImltLnZlY3Rvci5ydWxlLmNhbGxcIjogXCIubS5ydWxlLmNhbGxcIixcbiAgICBcImltLnZlY3Rvci5ydWxlLm5vdGljZXNcIjogXCIubS5ydWxlLnN1cHByZXNzX25vdGljZXNcIixcbn07XG5cbmZ1bmN0aW9uIHBvcnRMZWdhY3lBY3Rpb25zKGFjdGlvbnMpIHtcbiAgICBjb25zdCBkZWNvZGVkID0gTm90aWZpY2F0aW9uVXRpbHMuZGVjb2RlQWN0aW9ucyhhY3Rpb25zKTtcbiAgICBpZiAoZGVjb2RlZCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gTm90aWZpY2F0aW9uVXRpbHMuZW5jb2RlQWN0aW9ucyhkZWNvZGVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBkb24ndCByZWNvZ25pc2Ugb25lIG9mIHRoZSBhY3Rpb25zIGhlcmUsIHNvIHdlIGRvbid0IHRyeSB0b1xuICAgICAgICAvLyBjYW5vbmljYWxpc2UgdGhlbS5cbiAgICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb3RpZmljYXRpb25zIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcGhhc2VzID0ge1xuICAgICAgICBMT0FESU5HOiBcIkxPQURJTkdcIiwgLy8gVGhlIGNvbXBvbmVudCBpcyBsb2FkaW5nIG9yIHNlbmRpbmcgZGF0YSB0byB0aGUgaHNcbiAgICAgICAgRElTUExBWTogXCJESVNQTEFZXCIsIC8vIFRoZSBjb21wb25lbnQgaXMgcmVhZHkgYW5kIGRpc3BsYXkgZGF0YVxuICAgICAgICBFUlJPUjogXCJFUlJPUlwiLCAvLyBUaGVyZSB3YXMgYW4gZXJyb3JcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHBoYXNlOiBOb3RpZmljYXRpb25zLnBoYXNlcy5MT0FESU5HLFxuICAgICAgICBtYXN0ZXJQdXNoUnVsZTogdW5kZWZpbmVkLCAvLyBUaGUgbWFzdGVyIHJ1bGUgKCcubS5ydWxlLm1hc3RlcicpXG4gICAgICAgIHZlY3RvclB1c2hSdWxlczogW10sIC8vIEhTIGRlZmF1bHQgcHVzaCBydWxlcyBkaXNwbGF5ZWQgaW4gVmVjdG9yIFVJXG4gICAgICAgIHZlY3RvckNvbnRlbnRSdWxlczogeyAvLyBLZXl3b3JkIHB1c2ggcnVsZXMgZGlzcGxheWVkIGluIFZlY3RvciBVSVxuICAgICAgICAgICAgdmVjdG9yU3RhdGU6IFB1c2hSdWxlVmVjdG9yU3RhdGUuT04sXG4gICAgICAgICAgICBydWxlczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVybmFsUHVzaFJ1bGVzOiBbXSwgLy8gUHVzaCBydWxlcyAoZXhjZXB0IGNvbnRlbnQgcnVsZSkgdGhhdCBoYXZlIGJlZW4gZGVmaW5lZCBvdXRzaWRlIFZlY3RvciBVSVxuICAgICAgICBleHRlcm5hbENvbnRlbnRSdWxlczogW10sIC8vIEtleXdvcmQgcHVzaCBydWxlcyB0aGF0IGhhdmUgYmVlbiBkZWZpbmVkIG91dHNpZGUgVmVjdG9yIFVJXG4gICAgICAgIHRocmVlcGlkczogW10sIC8vIHVzZWQgZm9yIGVtYWlsIG5vdGlmaWNhdGlvbnNcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3JlZnJlc2hGcm9tU2VydmVyKCk7XG4gICAgfVxuXG4gICAgb25FbmFibGVOb3RpZmljYXRpb25zQ2hhbmdlID0gKGNoZWNrZWQpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IE5vdGlmaWNhdGlvbnMucGhhc2VzLkxPQURJTkcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRQdXNoUnVsZUVuYWJsZWQoXG4gICAgICAgICAgICAnZ2xvYmFsJywgc2VsZi5zdGF0ZS5tYXN0ZXJQdXNoUnVsZS5raW5kLCBzZWxmLnN0YXRlLm1hc3RlclB1c2hSdWxlLnJ1bGVfaWQsICFjaGVja2VkLFxuICAgICAgICApLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgIHNlbGYuX3JlZnJlc2hGcm9tU2VydmVyKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbkVuYWJsZURlc2t0b3BOb3RpZmljYXRpb25zQ2hhbmdlID0gKGNoZWNrZWQpID0+IHtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcbiAgICAgICAgICAgIFwibm90aWZpY2F0aW9uc0VuYWJsZWRcIiwgbnVsbCxcbiAgICAgICAgICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgICAgICAgICBjaGVja2VkLFxuICAgICAgICApLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25FbmFibGVEZXNrdG9wTm90aWZpY2F0aW9uQm9keUNoYW5nZSA9IChjaGVja2VkKSA9PiB7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXG4gICAgICAgICAgICBcIm5vdGlmaWNhdGlvbkJvZHlFbmFibGVkXCIsIG51bGwsXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgICAgICAgICAgY2hlY2tlZCxcbiAgICAgICAgKS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uRW5hYmxlQXVkaW9Ob3RpZmljYXRpb25zQ2hhbmdlID0gKGNoZWNrZWQpID0+IHtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcbiAgICAgICAgICAgIFwiYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZFwiLCBudWxsLFxuICAgICAgICAgICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICAgICAgICAgIGNoZWNrZWQsXG4gICAgICAgICkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIFJldHVybnMgdGhlIGVtYWlsIHB1c2hlciAocHVzaGVyIG9mIHR5cGUgJ2VtYWlsJykgZm9yIGEgZ2l2ZW5cbiAgICAgKiBlbWFpbCBhZGRyZXNzLiBFbWFpbCBwdXNoZXJzIGFsbCBoYXZlIHRoZSBzYW1lIGFwcCBJRCwgc28gc2luY2VcbiAgICAgKiBwdXNoZXJzIGFyZSB1bmlxdWUgb3ZlciAoYXBwIElELCBwdXNoa2V5KSwgdGhlcmUgd2lsbCBiZSBhdCBtb3N0XG4gICAgICogb25lIHN1Y2ggcHVzaGVyLlxuICAgICAqL1xuICAgIGdldEVtYWlsUHVzaGVyKHB1c2hlcnMsIGFkZHJlc3MpIHtcbiAgICAgICAgaWYgKHB1c2hlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHB1c2hlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChwdXNoZXJzW2ldLmtpbmQgPT09ICdlbWFpbCcgJiYgcHVzaGVyc1tpXS5wdXNoa2V5ID09PSBhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB1c2hlcnNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBvbkVuYWJsZUVtYWlsTm90aWZpY2F0aW9uc0NoYW5nZSA9IChhZGRyZXNzLCBjaGVja2VkKSA9PiB7XG4gICAgICAgIGxldCBlbWFpbFB1c2hlclByb21pc2U7XG4gICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0ge307XG4gICAgICAgICAgICBkYXRhWydicmFuZCddID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICAgICAgZW1haWxQdXNoZXJQcm9taXNlID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldFB1c2hlcih7XG4gICAgICAgICAgICAgICAga2luZDogJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICBhcHBfaWQ6ICdtLmVtYWlsJyxcbiAgICAgICAgICAgICAgICBwdXNoa2V5OiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgIGFwcF9kaXNwbGF5X25hbWU6ICdFbWFpbCBOb3RpZmljYXRpb25zJyxcbiAgICAgICAgICAgICAgICBkZXZpY2VfZGlzcGxheV9uYW1lOiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgIGxhbmc6IG5hdmlnYXRvci5sYW5ndWFnZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgIGFwcGVuZDogdHJ1ZSwgLy8gV2UgYWx3YXlzIGFwcGVuZCBmb3IgZW1haWwgcHVzaGVycyBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIHN0b3Agb3RoZXIgYWNjb3VudHMgbm90aWZ5aW5nIHRvIHRoZSBzYW1lIGVtYWlsIGFkZHJlc3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZW1haWxQdXNoZXIgPSB0aGlzLmdldEVtYWlsUHVzaGVyKHRoaXMuc3RhdGUucHVzaGVycywgYWRkcmVzcyk7XG4gICAgICAgICAgICBlbWFpbFB1c2hlci5raW5kID0gbnVsbDtcbiAgICAgICAgICAgIGVtYWlsUHVzaGVyUHJvbWlzZSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRQdXNoZXIoZW1haWxQdXNoZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVtYWlsUHVzaGVyUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hGcm9tU2VydmVyKCk7XG4gICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0Vycm9yIHNhdmluZyBlbWFpbCBub3RpZmljYXRpb24gcHJlZmVyZW5jZXMnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIHNhdmluZyBlbWFpbCBub3RpZmljYXRpb24gcHJlZmVyZW5jZXMnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ0FuIGVycm9yIG9jY3VycmVkIHdoaWxzdCBzYXZpbmcgeW91ciBlbWFpbCBub3RpZmljYXRpb24gcHJlZmVyZW5jZXMuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uTm90aWZTdGF0ZUJ1dHRvbkNsaWNrZWQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgLy8gRklYTUU6IHVzZSAuYmluZCgpIHJhdGhlciB0aGFuIGNsYXNzTmFtZSBtZXRhZGF0YSBoZXJlIHN1cmVseVxuICAgICAgICBjb25zdCB2ZWN0b3JSdWxlSWQgPSBldmVudC50YXJnZXQuY2xhc3NOYW1lLnNwbGl0KFwiLVwiKVswXTtcbiAgICAgICAgY29uc3QgbmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZSA9IGV2ZW50LnRhcmdldC5jbGFzc05hbWUuc3BsaXQoXCItXCIpWzFdO1xuXG4gICAgICAgIGlmIChcIl9rZXl3b3Jkc1wiID09PSB2ZWN0b3JSdWxlSWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3NldEtleXdvcmRzUHVzaFJ1bGVWZWN0b3JTdGF0ZShuZXdQdXNoUnVsZVZlY3RvclN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSB0aGlzLmdldFJ1bGUodmVjdG9yUnVsZUlkKTtcbiAgICAgICAgICAgIGlmIChydWxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UHVzaFJ1bGVWZWN0b3JTdGF0ZShydWxlLCBuZXdQdXNoUnVsZVZlY3RvclN0YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbktleXdvcmRzQ2xpY2tlZCA9IChldmVudCkgPT4ge1xuICAgICAgICAvLyBDb21wdXRlIHRoZSBrZXl3b3JkcyBsaXN0IHRvIGRpc3BsYXlcbiAgICAgICAgbGV0IGtleXdvcmRzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy5ydWxlcykge1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IHRoaXMuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnJ1bGVzW2ldO1xuICAgICAgICAgICAga2V5d29yZHMucHVzaChydWxlLnBhdHRlcm4pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXl3b3Jkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIEFzIGtlZXBpbmcgdGhlIG9yZGVyIG9mIHBlci13b3JkIHB1c2ggcnVsZXMgaHMgc2lkZSBpcyBhIGJpdCB0cmlja3kgdG8gY29kZSxcbiAgICAgICAgICAgIC8vIGRpc3BsYXkgdGhlIGtleXdvcmRzIGluIGFscGhhYmV0aWNhbCBvcmRlciB0byB0aGUgdXNlclxuICAgICAgICAgICAga2V5d29yZHMuc29ydCgpO1xuXG4gICAgICAgICAgICBrZXl3b3JkcyA9IGtleXdvcmRzLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXdvcmRzID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFRleHRJbnB1dERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlRleHRJbnB1dERpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnS2V5d29yZHMgRGlhbG9nJywgJycsIFRleHRJbnB1dERpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KCdLZXl3b3JkcycpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdFbnRlciBrZXl3b3JkcyBzZXBhcmF0ZWQgYnkgYSBjb21tYTonKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoJ09LJyksXG4gICAgICAgICAgICB2YWx1ZToga2V5d29yZHMsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoc2hvdWxkTGVhdmUsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExlYXZlICYmIG5ld1ZhbHVlICE9PSBrZXl3b3Jkcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3S2V5d29yZHMgPSBuZXdWYWx1ZS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGkgaW4gbmV3S2V5d29yZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0tleXdvcmRzW2ldID0gbmV3S2V5d29yZHNbaV0udHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgYW5kIGVtcHR5XG4gICAgICAgICAgICAgICAgICAgIG5ld0tleXdvcmRzID0gbmV3S2V5d29yZHMucmVkdWNlKGZ1bmN0aW9uKGFycmF5LCBrZXl3b3JkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5d29yZCAhPT0gXCJcIiAmJiBhcnJheS5pbmRleE9mKGtleXdvcmQpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goa2V5d29yZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRLZXl3b3JkcyhuZXdLZXl3b3Jkcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGdldFJ1bGUodmVjdG9yUnVsZUlkKSB7XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnN0YXRlLnZlY3RvclB1c2hSdWxlcykge1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IHRoaXMuc3RhdGUudmVjdG9yUHVzaFJ1bGVzW2ldO1xuICAgICAgICAgICAgaWYgKHJ1bGUudmVjdG9yUnVsZUlkID09PSB2ZWN0b3JSdWxlSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zZXRQdXNoUnVsZVZlY3RvclN0YXRlKHJ1bGUsIG5ld1B1c2hSdWxlVmVjdG9yU3RhdGUpIHtcbiAgICAgICAgaWYgKHJ1bGUgJiYgcnVsZS52ZWN0b3JTdGF0ZSAhPT0gbmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IE5vdGlmaWNhdGlvbnMucGhhc2VzLkxPQURJTkcsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCBkZWZlcnJlZHMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGVEZWZpbml0aW9uID0gVmVjdG9yUHVzaFJ1bGVzRGVmaW5pdGlvbnNbcnVsZS52ZWN0b3JSdWxlSWRdO1xuXG4gICAgICAgICAgICBpZiAocnVsZS5ydWxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IHJ1bGVEZWZpbml0aW9uLnZlY3RvclN0YXRlVG9BY3Rpb25zW25ld1B1c2hSdWxlVmVjdG9yU3RhdGVdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFhY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBuZXcgc3RhdGUgY29ycmVzcG9uZHMgdG8gZGlzYWJsaW5nIHRoZSBydWxlLlxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZHMucHVzaChjbGkuc2V0UHVzaFJ1bGVFbmFibGVkKCdnbG9iYWwnLCBydWxlLnJ1bGUua2luZCwgcnVsZS5ydWxlLnJ1bGVfaWQsIGZhbHNlKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG5ldyBzdGF0ZSBjb3JyZXNwb25kcyB0byBlbmFibGluZyB0aGUgcnVsZSBhbmQgc2V0dGluZyBzcGVjaWZpYyBhY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkcy5wdXNoKHRoaXMuX3VwZGF0ZVB1c2hSdWxlQWN0aW9ucyhydWxlLnJ1bGUsIGFjdGlvbnMsIHRydWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFByb21pc2UuYWxsKGRlZmVycmVkcykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZWZyZXNoRnJvbVNlcnZlcigpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY2hhbmdlIHNldHRpbmdzOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gY2hhbmdlIHNldHRpbmdzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRmFpbGVkIHRvIGNoYW5nZSBzZXR0aW5ncycpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnJvciAmJiBlcnJvci5tZXNzYWdlKSA/IGVycm9yLm1lc3NhZ2UgOiBfdCgnT3BlcmF0aW9uIGZhaWxlZCcpKSxcbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZDogc2VsZi5fcmVmcmVzaEZyb21TZXJ2ZXIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zZXRLZXl3b3Jkc1B1c2hSdWxlVmVjdG9yU3RhdGUobmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZSkge1xuICAgICAgICAvLyBJcyB0aGVyZSByZWFsbHkgYSBjaGFuZ2U/XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy52ZWN0b3JTdGF0ZSA9PT0gbmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZVxuICAgICAgICAgICAgfHwgdGhpcy5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMucnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IE5vdGlmaWNhdGlvbnMucGhhc2VzLkxPQURJTkcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBhbGwgcnVsZXMgaW4gc2VsZi5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXNcbiAgICAgICAgY29uc3QgZGVmZXJyZWRzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy5ydWxlcykge1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IHRoaXMuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnJ1bGVzW2ldO1xuXG4gICAgICAgICAgICBsZXQgZW5hYmxlZDsgbGV0IGFjdGlvbnM7XG4gICAgICAgICAgICBzd2l0Y2ggKG5ld1B1c2hSdWxlVmVjdG9yU3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFB1c2hSdWxlVmVjdG9yU3RhdGUuT046XG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLmFjdGlvbnMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25zID0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5hY3Rpb25zRm9yKFB1c2hSdWxlVmVjdG9yU3RhdGUuT04pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnZlY3RvclN0YXRlID09PSBQdXNoUnVsZVZlY3RvclN0YXRlLk9GRikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFB1c2hSdWxlVmVjdG9yU3RhdGUuTE9VRDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUuYWN0aW9ucy5sZW5ndGggIT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnMgPSBQdXNoUnVsZVZlY3RvclN0YXRlLmFjdGlvbnNGb3IoUHVzaFJ1bGVWZWN0b3JTdGF0ZS5MT1VEKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy52ZWN0b3JTdGF0ZSA9PT0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PRkYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBQdXNoUnVsZVZlY3RvclN0YXRlLk9GRjpcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhlIHdvcmthcm91bmQgaW4gX3VwZGF0ZVB1c2hSdWxlQWN0aW9ucyB3aWxsIGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICAgICAgICAvLyBlbmFibGUgdGhlIHJ1bGVcbiAgICAgICAgICAgICAgICBkZWZlcnJlZHMucHVzaCh0aGlzLl91cGRhdGVQdXNoUnVsZUFjdGlvbnMocnVsZSwgYWN0aW9ucywgZW5hYmxlZCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbmFibGVkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkcy5wdXNoKGNsaS5zZXRQdXNoUnVsZUVuYWJsZWQoJ2dsb2JhbCcsIHJ1bGUua2luZCwgcnVsZS5ydWxlX2lkLCBlbmFibGVkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBQcm9taXNlLmFsbChkZWZlcnJlZHMpLnRoZW4oZnVuY3Rpb24ocmVzcHMpIHtcbiAgICAgICAgICAgIHNlbGYuX3JlZnJlc2hGcm9tU2VydmVyKCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNhbid0IHVwZGF0ZSB1c2VyIG5vdGlmaWNhdGlvbiBzZXR0aW5nczogXCIgKyBlcnJvcik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYW5cXCd0IHVwZGF0ZSB1c2VyIG5vdGlmY2F0aW9uIHNldHRpbmdzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdDYW5cXCd0IHVwZGF0ZSB1c2VyIG5vdGlmaWNhdGlvbiBzZXR0aW5ncycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVycm9yICYmIGVycm9yLm1lc3NhZ2UpID8gZXJyb3IubWVzc2FnZSA6IF90KCdPcGVyYXRpb24gZmFpbGVkJykpLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IHNlbGYuX3JlZnJlc2hGcm9tU2VydmVyLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9zZXRLZXl3b3JkcyhuZXdLZXl3b3Jkcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBOb3RpZmljYXRpb25zLnBoYXNlcy5MT0FESU5HLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByZW1vdmVEZWZlcnJlZHMgPSBbXTtcblxuICAgICAgICAvLyBSZW1vdmUgcGVyLXdvcmQgcHVzaCBydWxlcyBvZiBrZXl3b3JkcyB0aGF0IGFyZSBubyBtb3JlIGluIHRoZSBsaXN0XG4gICAgICAgIGNvbnN0IHZlY3RvckNvbnRlbnRSdWxlc1BhdHRlcm5zID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy5ydWxlcykge1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IHNlbGYuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnJ1bGVzW2ldO1xuXG4gICAgICAgICAgICB2ZWN0b3JDb250ZW50UnVsZXNQYXR0ZXJucy5wdXNoKHJ1bGUucGF0dGVybik7XG5cbiAgICAgICAgICAgIGlmIChuZXdLZXl3b3Jkcy5pbmRleE9mKHJ1bGUucGF0dGVybikgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRGVmZXJyZWRzLnB1c2goY2xpLmRlbGV0ZVB1c2hSdWxlKCdnbG9iYWwnLCBydWxlLmtpbmQsIHJ1bGUucnVsZV9pZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIGtleXdvcmQgaXMgcGFydCBvZiBgZXh0ZXJuYWxDb250ZW50UnVsZXNgLCByZW1vdmUgdGhlIHJ1bGVcbiAgICAgICAgLy8gYmVmb3JlIHJlY3JlYXRpbmcgaXQgaW4gdGhlIHJpZ2h0IFZlY3RvciBwYXRoXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBzZWxmLnN0YXRlLmV4dGVybmFsQ29udGVudFJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gc2VsZi5zdGF0ZS5leHRlcm5hbENvbnRlbnRSdWxlc1tpXTtcblxuICAgICAgICAgICAgaWYgKG5ld0tleXdvcmRzLmluZGV4T2YocnVsZS5wYXR0ZXJuKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRGVmZXJyZWRzLnB1c2goY2xpLmRlbGV0ZVB1c2hSdWxlKCdnbG9iYWwnLCBydWxlLmtpbmQsIHJ1bGUucnVsZV9pZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb25FcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB1cGRhdGUga2V5d29yZHM6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHVwZGF0ZSBrZXl3b3JkcycsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRmFpbGVkIHRvIHVwZGF0ZSBrZXl3b3JkcycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVycm9yICYmIGVycm9yLm1lc3NhZ2UpID8gZXJyb3IubWVzc2FnZSA6IF90KCdPcGVyYXRpb24gZmFpbGVkJykpLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IHNlbGYuX3JlZnJlc2hGcm9tU2VydmVyLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGhlbiwgYWRkIHRoZSBuZXcgb25lc1xuICAgICAgICBQcm9taXNlLmFsbChyZW1vdmVEZWZlcnJlZHMpLnRoZW4oZnVuY3Rpb24ocmVzcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZmVycmVkcyA9IFtdO1xuXG4gICAgICAgICAgICBsZXQgcHVzaFJ1bGVWZWN0b3JTdGF0ZUtpbmQgPSBzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy52ZWN0b3JTdGF0ZTtcbiAgICAgICAgICAgIGlmIChwdXNoUnVsZVZlY3RvclN0YXRlS2luZCA9PT0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PRkYpIHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBjdXJyZW50IGdsb2JhbCBrZXl3b3JkcyBydWxlIGlzIE9GRiwgd2UgbmVlZCB0byBsb29rIGF0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGZsYXZvciBvZiBydWxlcyBpbiAndmVjdG9yQ29udGVudFJ1bGVzJyB0byBhcHBseSB0aGUgc2FtZSBhY3Rpb25zXG4gICAgICAgICAgICAgICAgLy8gd2hlbiBjcmVhdGluZyB0aGUgbmV3IHJ1bGUuXG4gICAgICAgICAgICAgICAgLy8gVGh1cywgdGhpcyBuZXcgcnVsZSB3aWxsIGpvaW4gdGhlICd2ZWN0b3JDb250ZW50UnVsZXMnIHNldC5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMucnVsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hSdWxlVmVjdG9yU3RhdGVLaW5kID0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5jb250ZW50UnVsZVZlY3RvclN0YXRlS2luZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnJ1bGVzWzBdLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9OIGlzIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgICAgcHVzaFJ1bGVWZWN0b3JTdGF0ZUtpbmQgPSBQdXNoUnVsZVZlY3RvclN0YXRlLk9OO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCBpIGluIG5ld0tleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5d29yZCA9IG5ld0tleXdvcmRzW2ldO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZlY3RvckNvbnRlbnRSdWxlc1BhdHRlcm5zLmluZGV4T2Yoa2V5d29yZCkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy52ZWN0b3JTdGF0ZSAhPT0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PRkYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkcy5wdXNoKGNsaS5hZGRQdXNoUnVsZSgnZ2xvYmFsJywgJ2NvbnRlbnQnLCBrZXl3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogUHVzaFJ1bGVWZWN0b3JTdGF0ZS5hY3Rpb25zRm9yKHB1c2hSdWxlVmVjdG9yU3RhdGVLaW5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuOiBrZXl3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRzLnB1c2goc2VsZi5fYWRkRGlzYWJsZWRQdXNoUnVsZSgnZ2xvYmFsJywgJ2NvbnRlbnQnLCBrZXl3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBQdXNoUnVsZVZlY3RvclN0YXRlLmFjdGlvbnNGb3IocHVzaFJ1bGVWZWN0b3JTdGF0ZUtpbmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybjoga2V5d29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgUHJvbWlzZS5hbGwoZGVmZXJyZWRzKS50aGVuKGZ1bmN0aW9uKHJlc3BzKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICAgICAgICAgIH0sIG9uRXJyb3IpO1xuICAgICAgICB9LCBvbkVycm9yKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBwdXNoIHJ1bGUgYnV0IGRpc2FibGVkXG4gICAgX2FkZERpc2FibGVkUHVzaFJ1bGUoc2NvcGUsIGtpbmQsIHJ1bGVJZCwgYm9keSkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHJldHVybiBjbGkuYWRkUHVzaFJ1bGUoc2NvcGUsIGtpbmQsIHJ1bGVJZCwgYm9keSkudGhlbigoKSA9PlxuICAgICAgICAgICAgY2xpLnNldFB1c2hSdWxlRW5hYmxlZChzY29wZSwga2luZCwgcnVsZUlkLCBmYWxzZSksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYW55IGxlZ2FjeSBpbS52ZWN0b3IgcnVsZXMgbmVlZCB0byBiZSBwb3J0ZWQgdG8gdGhlIG5ldyBBUElcbiAgICAvLyBmb3Igb3ZlcnJpZGluZyB0aGUgYWN0aW9ucyBvZiBkZWZhdWx0IHJ1bGVzLlxuICAgIF9wb3J0UnVsZXNUb05ld0FQSShydWxlc2V0cykge1xuICAgICAgICBjb25zdCBuZWVkc1VwZGF0ZSA9IFtdO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBraW5kIGluIHJ1bGVzZXRzLmdsb2JhbCkge1xuICAgICAgICAgICAgY29uc3QgcnVsZXNldCA9IHJ1bGVzZXRzLmdsb2JhbFtraW5kXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZXNldC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBydWxlc2V0W2ldO1xuICAgICAgICAgICAgICAgIGlmIChydWxlLnJ1bGVfaWQgaW4gTEVHQUNZX1JVTEVTKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUG9ydGluZyBsZWdhY3kgcnVsZVwiLCBydWxlKTtcbiAgICAgICAgICAgICAgICAgICAgbmVlZHNVcGRhdGUucHVzaCggZnVuY3Rpb24oa2luZCwgcnVsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsaS5zZXRQdXNoUnVsZUFjdGlvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2dsb2JhbCcsIGtpbmQsIExFR0FDWV9SVUxFU1tydWxlLnJ1bGVfaWRdLCBwb3J0TGVnYWN5QWN0aW9ucyhydWxlLmFjdGlvbnMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgKS50aGVuKCgpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpLmRlbGV0ZVB1c2hSdWxlKCdnbG9iYWwnLCBraW5kLCBydWxlLnJ1bGVfaWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgKS5jYXRjaCggKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEVycm9yIHdoZW4gcG9ydGluZyBsZWdhY3kgcnVsZTogJHtlfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0oa2luZCwgcnVsZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZWVkc1VwZGF0ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBJZiBzb21lIG9mIHRoZSBydWxlcyBuZWVkIHRvIGJlIHBvcnRlZCB0aGVuIHdhaXQgZm9yIHRoZSBwb3J0aW5nXG4gICAgICAgICAgICAvLyB0byBoYXBwZW4gYW5kIHRoZW4gZmV0Y2ggdGhlIHJ1bGVzIGFnYWluLlxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKG5lZWRzVXBkYXRlKS50aGVuKCgpID0+XG4gICAgICAgICAgICAgICAgY2xpLmdldFB1c2hSdWxlcygpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSByZXR1cm4gdGhlIHJ1bGVzIHRoYXQgd2UgYWxyZWFkeSBoYXZlLlxuICAgICAgICAgICAgcmV0dXJuIHJ1bGVzZXRzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3JlZnJlc2hGcm9tU2VydmVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgY29uc3QgcHVzaFJ1bGVzUHJvbWlzZSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRQdXNoUnVsZXMoKS50aGVuKFxuICAgICAgICAgICAgc2VsZi5fcG9ydFJ1bGVzVG9OZXdBUEksXG4gICAgICAgICkudGhlbihmdW5jdGlvbihydWxlc2V0cykge1xuICAgICAgICAgICAgLy8vIFhYWCBzZXJpb3VzbHk/IHd0ZiBpcyB0aGlzP1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnB1c2hSdWxlcyA9IHJ1bGVzZXRzO1xuXG4gICAgICAgICAgICAvLyBHZXQgaG9tZXNlcnZlciBkZWZhdWx0IHJ1bGVzIGFuZCB0cmlhZ2UgdGhlbSBieSBjYXRlZ29yaWVzXG4gICAgICAgICAgICBjb25zdCBydWxlQ2F0ZWdvcmllcyA9IHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgbWFzdGVyIHJ1bGUgKGFsbCBub3RpZmljYXRpb25zIGRpc2FibGluZylcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5tYXN0ZXInOiAnbWFzdGVyJyxcblxuICAgICAgICAgICAgICAgIC8vIFRoZSBkZWZhdWx0IHB1c2ggcnVsZXMgZGlzcGxheWVkIGJ5IFZlY3RvciBVSVxuICAgICAgICAgICAgICAgICcubS5ydWxlLmNvbnRhaW5zX2Rpc3BsYXlfbmFtZSc6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLmNvbnRhaW5zX3VzZXJfbmFtZSc6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLnJvb21ub3RpZic6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLnJvb21fb25lX3RvX29uZSc6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLmVuY3J5cHRlZF9yb29tX29uZV90b19vbmUnOiAndmVjdG9yJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5tZXNzYWdlJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuZW5jcnlwdGVkJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuaW52aXRlX2Zvcl9tZSc6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgIC8vJy5tLnJ1bGUubWVtYmVyX2V2ZW50JzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuY2FsbCc6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLnN1cHByZXNzX25vdGljZXMnOiAndmVjdG9yJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS50b21ic3RvbmUnOiAndmVjdG9yJyxcblxuICAgICAgICAgICAgICAgIC8vIE90aGVycyBnbyB0byBvdGhlcnNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEhTIGRlZmF1bHQgcnVsZXNcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRSdWxlcyA9IHttYXN0ZXI6IFtdLCB2ZWN0b3I6IHt9LCBvdGhlcnM6IFtdfTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBraW5kIGluIHJ1bGVzZXRzLmdsb2JhbCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgT2JqZWN0LmtleXMocnVsZXNldHMuZ2xvYmFsW2tpbmRdKS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByID0gcnVsZXNldHMuZ2xvYmFsW2tpbmRdW2ldO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXQgPSBydWxlQ2F0ZWdvcmllc1tyLnJ1bGVfaWRdO1xuICAgICAgICAgICAgICAgICAgICByLmtpbmQgPSBraW5kO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyLnJ1bGVfaWRbMF0gPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdCA9PT0gJ3ZlY3RvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UnVsZXMudmVjdG9yW3IucnVsZV9pZF0gPSByO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYXQgPT09ICdtYXN0ZXInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFJ1bGVzLm1hc3Rlci5wdXNoKHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UnVsZXNbJ290aGVycyddLnB1c2gocik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgbWFzdGVyIHJ1bGUgaWYgYW55IGRlZmluZWQgYnkgdGhlIGhzXG4gICAgICAgICAgICBpZiAoZGVmYXVsdFJ1bGVzLm1hc3Rlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdGF0ZS5tYXN0ZXJQdXNoUnVsZSA9IGRlZmF1bHRSdWxlcy5tYXN0ZXJbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHBhcnNlIHRoZSBrZXl3b3JkIHJ1bGVzIGludG8gb3VyIHN0YXRlXG4gICAgICAgICAgICBjb25zdCBjb250ZW50UnVsZXMgPSBDb250ZW50UnVsZXMucGFyc2VDb250ZW50UnVsZXMocnVsZXNldHMpO1xuICAgICAgICAgICAgc2VsZi5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMgPSB7XG4gICAgICAgICAgICAgICAgdmVjdG9yU3RhdGU6IGNvbnRlbnRSdWxlcy52ZWN0b3JTdGF0ZSxcbiAgICAgICAgICAgICAgICBydWxlczogY29udGVudFJ1bGVzLnJ1bGVzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNlbGYuc3RhdGUuZXh0ZXJuYWxDb250ZW50UnVsZXMgPSBjb250ZW50UnVsZXMuZXh0ZXJuYWxSdWxlcztcblxuICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHJ1bGVzIGRpc3BsYXllZCBpbiB0aGUgVmVjdG9yIFVJIG1hdHJpeCB0YWJsZVxuICAgICAgICAgICAgc2VsZi5zdGF0ZS52ZWN0b3JQdXNoUnVsZXMgPSBbXTtcbiAgICAgICAgICAgIHNlbGYuc3RhdGUuZXh0ZXJuYWxQdXNoUnVsZXMgPSBbXTtcblxuICAgICAgICAgICAgY29uc3QgdmVjdG9yUnVsZUlkcyA9IFtcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5jb250YWluc19kaXNwbGF5X25hbWUnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLmNvbnRhaW5zX3VzZXJfbmFtZScsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUucm9vbW5vdGlmJyxcbiAgICAgICAgICAgICAgICAnX2tleXdvcmRzJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5yb29tX29uZV90b19vbmUnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLmVuY3J5cHRlZF9yb29tX29uZV90b19vbmUnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLm1lc3NhZ2UnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLmVuY3J5cHRlZCcsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuaW52aXRlX2Zvcl9tZScsXG4gICAgICAgICAgICAgICAgLy8naW0udmVjdG9yLnJ1bGUubWVtYmVyX2V2ZW50JyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5jYWxsJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5zdXBwcmVzc19ub3RpY2VzJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS50b21ic3RvbmUnLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiB2ZWN0b3JSdWxlSWRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmVjdG9yUnVsZUlkID0gdmVjdG9yUnVsZUlkc1tpXTtcblxuICAgICAgICAgICAgICAgIGlmICh2ZWN0b3JSdWxlSWQgPT09ICdfa2V5d29yZHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGtleXdvcmRzIG5lZWRzIGEgc3BlY2lhbCBoYW5kbGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgVmVjdG9yIFVJLCB0aGlzIGlzIGEgc2luZ2xlIGdsb2JhbCBwdXNoIHJ1bGUgYnV0IHRyYW5zbGF0ZWQgaW4gTWF0cml4LFxuICAgICAgICAgICAgICAgICAgICAvLyBpdCBjb3JyZXNwb25kcyB0byBhbGwgY29udGVudCBwdXNoIHJ1bGVzIChzdG9yZWQgaW4gc2VsZi5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZSlcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGF0ZS52ZWN0b3JQdXNoUnVsZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInZlY3RvclJ1bGVJZFwiOiBcIl9rZXl3b3Jkc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnTWVzc2FnZXMgY29udGFpbmluZyA8c3Bhbj5rZXl3b3Jkczwvc3Bhbj4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAnc3Bhbic6IChzdWIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTm90aWZTZXR0aW5nc19rZXl3b3Jkc1wiIG9uQ2xpY2s9eyBzZWxmLm9uS2V5d29yZHNDbGlja2VkIH0+e3N1Yn08L3NwYW4+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidmVjdG9yU3RhdGVcIjogc2VsZi5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMudmVjdG9yU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGVEZWZpbml0aW9uID0gVmVjdG9yUHVzaFJ1bGVzRGVmaW5pdGlvbnNbdmVjdG9yUnVsZUlkXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcnVsZSA9IGRlZmF1bHRSdWxlcy52ZWN0b3JbdmVjdG9yUnVsZUlkXTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ZWN0b3JTdGF0ZSA9IHJ1bGVEZWZpbml0aW9uLnJ1bGVUb1ZlY3RvclN0YXRlKHJ1bGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJSZWZyZXNoaW5nIHZlY3RvclB1c2hSdWxlcyBmb3IgXCIgKyB2ZWN0b3JSdWxlSWQgK1wiLCBcIisgcnVsZURlZmluaXRpb24uZGVzY3JpcHRpb24gK1wiLCBcIiArIHJ1bGUgK1wiLCBcIiArIHZlY3RvclN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXRlLnZlY3RvclB1c2hSdWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidmVjdG9yUnVsZUlkXCI6IHZlY3RvclJ1bGVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY3JpcHRpb25cIjogX3QocnVsZURlZmluaXRpb24uZGVzY3JpcHRpb24pLCAvLyBUZXh0IGZyb20gVmVjdG9yUHVzaFJ1bGVzRGVmaW5pdGlvbnMuanNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicnVsZVwiOiBydWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2ZWN0b3JTdGF0ZVwiOiB2ZWN0b3JTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgd2FzIGEgcnVsZSB3aGljaCB3ZSBjb3VsZG4ndCBwYXJzZSwgYWRkIGl0IHRvIHRoZSBleHRlcm5hbCBsaXN0XG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlICYmICF2ZWN0b3JTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5kZXNjcmlwdGlvbiA9IHJ1bGVEZWZpbml0aW9uLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGF0ZS5leHRlcm5hbFB1c2hSdWxlcy5wdXNoKHJ1bGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCdWlsZCB0aGUgcnVsZXMgbm90IG1hbmFnZWQgYnkgVmVjdG9yIFVJXG4gICAgICAgICAgICBjb25zdCBvdGhlclJ1bGVzRGVzY3JpcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICcubS5ydWxlLm1lc3NhZ2UnOiBfdCgnTm90aWZ5IGZvciBhbGwgb3RoZXIgbWVzc2FnZXMvcm9vbXMnKSxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5mYWxsYmFjayc6IF90KCdOb3RpZnkgbWUgZm9yIGFueXRoaW5nIGVsc2UnKSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiBkZWZhdWx0UnVsZXMub3RoZXJzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcnVsZSA9IGRlZmF1bHRSdWxlcy5vdGhlcnNbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgcnVsZURlc2NyaXB0aW9uID0gb3RoZXJSdWxlc0Rlc2NyaXB0aW9uc1tydWxlLnJ1bGVfaWRdO1xuXG4gICAgICAgICAgICAgICAgLy8gU2hvdyBlbmFibGVkIGRlZmF1bHQgcnVsZXMgdGhhdCB3YXMgbW9kaWZpZWQgYnkgdGhlIHVzZXJcbiAgICAgICAgICAgICAgICBpZiAocnVsZURlc2NyaXB0aW9uICYmIHJ1bGUuZW5hYmxlZCAmJiAhcnVsZS5kZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGUuZGVzY3JpcHRpb24gPSBydWxlRGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc3RhdGUuZXh0ZXJuYWxQdXNoUnVsZXMucHVzaChydWxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHB1c2hlcnNQcm9taXNlID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFB1c2hlcnMoKS50aGVuKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe3B1c2hlcnM6IHJlc3AucHVzaGVyc30pO1xuICAgICAgICB9KTtcblxuICAgICAgICBQcm9taXNlLmFsbChbcHVzaFJ1bGVzUHJvbWlzZSwgcHVzaGVyc1Byb21pc2VdKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IE5vdGlmaWNhdGlvbnMucGhhc2VzLkRJU1BMQVksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IE5vdGlmaWNhdGlvbnMucGhhc2VzLkVSUk9SLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgLy8gYWN0dWFsbHkgZXhwbGljaXRseSB1cGRhdGUgb3VyIHN0YXRlICBoYXZpbmcgYmVlbiBkZWVwLW1hbmlwdWxhdGluZyBpdFxuICAgICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbWFzdGVyUHVzaFJ1bGU6IHNlbGYuc3RhdGUubWFzdGVyUHVzaFJ1bGUsXG4gICAgICAgICAgICAgICAgdmVjdG9yQ29udGVudFJ1bGVzOiBzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcyxcbiAgICAgICAgICAgICAgICB2ZWN0b3JQdXNoUnVsZXM6IHNlbGYuc3RhdGUudmVjdG9yUHVzaFJ1bGVzLFxuICAgICAgICAgICAgICAgIGV4dGVybmFsQ29udGVudFJ1bGVzOiBzZWxmLnN0YXRlLmV4dGVybmFsQ29udGVudFJ1bGVzLFxuICAgICAgICAgICAgICAgIGV4dGVybmFsUHVzaFJ1bGVzOiBzZWxmLnN0YXRlLmV4dGVybmFsUHVzaFJ1bGVzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUaHJlZVBpZHMoKS50aGVuKChyKSA9PiB0aGlzLnNldFN0YXRlKHt0aHJlZXBpZHM6IHIudGhyZWVwaWRzfSkpO1xuICAgIH07XG5cbiAgICBfb25DbGVhck5vdGlmaWNhdGlvbnMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBjbGkuZ2V0Um9vbXMoKS5mb3JFYWNoKHIgPT4ge1xuICAgICAgICAgICAgaWYgKHIuZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudHMgPSByLmdldExpdmVUaW1lbGluZSgpLmdldEV2ZW50cygpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudHMubGVuZ3RoKSBjbGkuc2VuZFJlYWRSZWNlaXB0KGV2ZW50cy5wb3AoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfdXBkYXRlUHVzaFJ1bGVBY3Rpb25zKHJ1bGUsIGFjdGlvbnMsIGVuYWJsZWQpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIHJldHVybiBjbGkuc2V0UHVzaFJ1bGVBY3Rpb25zKFxuICAgICAgICAgICAgJ2dsb2JhbCcsIHJ1bGUua2luZCwgcnVsZS5ydWxlX2lkLCBhY3Rpb25zLFxuICAgICAgICApLnRoZW4oIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gVGhlbiwgaWYgcmVxdWVzdGVkLCBlbmFibGVkIG9yIGRpc2FibGVkIHRoZSBydWxlXG4gICAgICAgICAgICBpZiAodW5kZWZpbmVkICE9IGVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xpLnNldFB1c2hSdWxlRW5hYmxlZChcbiAgICAgICAgICAgICAgICAgICAgJ2dsb2JhbCcsIHJ1bGUua2luZCwgcnVsZS5ydWxlX2lkLCBlbmFibGVkLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlck5vdGlmUnVsZXNUYWJsZVJvdyh0aXRsZSwgY2xhc3NOYW1lLCBwdXNoUnVsZVZlY3RvclN0YXRlKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8dHIga2V5PXsgY2xhc3NOYW1lIH0+XG4gICAgICAgICAgICAgICAgPHRoPlxuICAgICAgICAgICAgICAgICAgICB7IHRpdGxlIH1cbiAgICAgICAgICAgICAgICA8L3RoPlxuXG4gICAgICAgICAgICAgICAgPHRoPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPSB7Y2xhc3NOYW1lICsgXCItXCIgKyBQdXNoUnVsZVZlY3RvclN0YXRlLk9GRn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXsgcHVzaFJ1bGVWZWN0b3JTdGF0ZSA9PT0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PRkYgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyB0aGlzLm9uTm90aWZTdGF0ZUJ1dHRvbkNsaWNrZWQgfSAvPlxuICAgICAgICAgICAgICAgIDwvdGg+XG5cbiAgICAgICAgICAgICAgICA8dGg+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9IHtjbGFzc05hbWUgKyBcIi1cIiArIFB1c2hSdWxlVmVjdG9yU3RhdGUuT059XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17IHB1c2hSdWxlVmVjdG9yU3RhdGUgPT09IFB1c2hSdWxlVmVjdG9yU3RhdGUuT04gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyB0aGlzLm9uTm90aWZTdGF0ZUJ1dHRvbkNsaWNrZWQgfSAvPlxuICAgICAgICAgICAgICAgIDwvdGg+XG5cbiAgICAgICAgICAgICAgICA8dGg+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9IHtjbGFzc05hbWUgKyBcIi1cIiArIFB1c2hSdWxlVmVjdG9yU3RhdGUuTE9VRH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXsgcHVzaFJ1bGVWZWN0b3JTdGF0ZSA9PT0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5MT1VEIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsgdGhpcy5vbk5vdGlmU3RhdGVCdXR0b25DbGlja2VkIH0gLz5cbiAgICAgICAgICAgICAgICA8L3RoPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXJOb3RpZlJ1bGVzVGFibGVSb3dzKCkge1xuICAgICAgICBjb25zdCByb3dzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnN0YXRlLnZlY3RvclB1c2hSdWxlcykge1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IHRoaXMuc3RhdGUudmVjdG9yUHVzaFJ1bGVzW2ldO1xuICAgICAgICAgICAgaWYgKHJ1bGUucnVsZSA9PT0gdW5kZWZpbmVkICYmIHJ1bGUudmVjdG9yUnVsZUlkLnN0YXJ0c1dpdGgoXCIubS5cIikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFNraXBwaW5nIHJlbmRlciBvZiBydWxlICR7cnVsZS52ZWN0b3JSdWxlSWR9IGR1ZSB0byBubyB1bmRlcmx5aW5nIHJ1bGVgKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJyZW5kZXJpbmc6IFwiICsgcnVsZS5kZXNjcmlwdGlvbiArIFwiLCBcIiArIHJ1bGUudmVjdG9yUnVsZUlkICsgXCIsIFwiICsgcnVsZS52ZWN0b3JTdGF0ZSk7XG4gICAgICAgICAgICByb3dzLnB1c2godGhpcy5yZW5kZXJOb3RpZlJ1bGVzVGFibGVSb3cocnVsZS5kZXNjcmlwdGlvbiwgcnVsZS52ZWN0b3JSdWxlSWQsIHJ1bGUudmVjdG9yU3RhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93cztcbiAgICB9XG5cbiAgICBoYXNFbWFpbFB1c2hlcihwdXNoZXJzLCBhZGRyZXNzKSB7XG4gICAgICAgIGlmIChwdXNoZXJzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHB1c2hlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChwdXNoZXJzW2ldLmtpbmQgPT09ICdlbWFpbCcgJiYgcHVzaGVyc1tpXS5wdXNoa2V5ID09PSBhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGVtYWlsTm90aWZpY2F0aW9uc1JvdyhhZGRyZXNzLCBsYWJlbCkge1xuICAgICAgICByZXR1cm4gPExhYmVsbGVkVG9nZ2xlU3dpdGNoIHZhbHVlPXt0aGlzLmhhc0VtYWlsUHVzaGVyKHRoaXMuc3RhdGUucHVzaGVycywgYWRkcmVzcyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmFibGVFbWFpbE5vdGlmaWNhdGlvbnNDaGFuZ2UuYmluZCh0aGlzLCBhZGRyZXNzKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17bGFiZWx9IGtleT17YGVtYWlsTm90aWZfJHtsYWJlbH1gfSAvPjtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBzcGlubmVyO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5waGFzZSA9PT0gTm90aWZpY2F0aW9ucy5waGFzZXMuTE9BRElORykge1xuICAgICAgICAgICAgY29uc3QgTG9hZGVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICBzcGlubmVyID0gPExvYWRlciAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtYXN0ZXJQdXNoUnVsZURpdjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWFzdGVyUHVzaFJ1bGUpIHtcbiAgICAgICAgICAgIG1hc3RlclB1c2hSdWxlRGl2ID0gPExhYmVsbGVkVG9nZ2xlU3dpdGNoIHZhbHVlPXshdGhpcy5zdGF0ZS5tYXN0ZXJQdXNoUnVsZS5lbmFibGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmFibGVOb3RpZmljYXRpb25zQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdFbmFibGUgbm90aWZpY2F0aW9ucyBmb3IgdGhpcyBhY2NvdW50Jyl9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNsZWFyTm90aWZpY2F0aW9uc0J1dHRvbjtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tcygpLnNvbWUociA9PiByLmdldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50KCkgPiAwKSkge1xuICAgICAgICAgICAgY2xlYXJOb3RpZmljYXRpb25zQnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25DbGVhck5vdGlmaWNhdGlvbnN9IGtpbmQ9J2Rhbmdlcic+XG4gICAgICAgICAgICAgICAge190KFwiQ2xlYXIgbm90aWZpY2F0aW9uc1wiKX1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXaGVuIGVuYWJsZWQsIHRoZSBtYXN0ZXIgcnVsZSBpbmhpYml0cyBhbGwgZXhpc3RpbmcgcnVsZXNcbiAgICAgICAgLy8gU28gZG8gbm90IHNob3cgYWxsIG5vdGlmaWNhdGlvbiBzZXR0aW5nc1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tYXN0ZXJQdXNoUnVsZSAmJiB0aGlzLnN0YXRlLm1hc3RlclB1c2hSdWxlLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAge21hc3RlclB1c2hSdWxlRGl2fVxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck5vdGlmU2V0dGluZ3Nfbm90aWZUYWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnQWxsIG5vdGlmaWNhdGlvbnMgYXJlIGN1cnJlbnRseSBkaXNhYmxlZCBmb3IgYWxsIHRhcmdldHMuJykgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICB7Y2xlYXJOb3RpZmljYXRpb25zQnV0dG9ufVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVtYWlsVGhyZWVwaWRzID0gdGhpcy5zdGF0ZS50aHJlZXBpZHMuZmlsdGVyKCh0cCkgPT4gdHAubWVkaXVtID09PSBcImVtYWlsXCIpO1xuICAgICAgICBsZXQgZW1haWxOb3RpZmljYXRpb25zUm93cztcbiAgICAgICAgaWYgKGVtYWlsVGhyZWVwaWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGVtYWlsTm90aWZpY2F0aW9uc1Jvd3MgPSBlbWFpbFRocmVlcGlkcy5tYXAoKHRocmVlUGlkKSA9PiB0aGlzLmVtYWlsTm90aWZpY2F0aW9uc1JvdyhcbiAgICAgICAgICAgICAgICB0aHJlZVBpZC5hZGRyZXNzLCBgJHtfdCgnRW5hYmxlIGVtYWlsIG5vdGlmaWNhdGlvbnMnKX0gKCR7dGhyZWVQaWQuYWRkcmVzc30pYCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9IGVsc2UgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLlRoaXJkUGFydHlJRCkpIHtcbiAgICAgICAgICAgIGVtYWlsTm90aWZpY2F0aW9uc1Jvd3MgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIHsgX3QoJ0FkZCBhbiBlbWFpbCBhZGRyZXNzIHRvIGNvbmZpZ3VyZSBlbWFpbCBub3RpZmljYXRpb25zJykgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgZXh0ZXJuYWwgcHVzaCBydWxlc1xuICAgICAgICBjb25zdCBleHRlcm5hbFJ1bGVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnN0YXRlLmV4dGVybmFsUHVzaFJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gdGhpcy5zdGF0ZS5leHRlcm5hbFB1c2hSdWxlc1tpXTtcbiAgICAgICAgICAgIGV4dGVybmFsUnVsZXMucHVzaCg8bGk+eyBfdChydWxlLmRlc2NyaXB0aW9uKSB9PC9saT4pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2hvdyBrZXl3b3JkcyBub3QgZGlzcGxheWVkIGJ5IHRoZSB2ZWN0b3IgVUkgYXMgYSBzaW5nbGUgZXh0ZXJuYWwgcHVzaCBydWxlXG4gICAgICAgIGxldCBleHRlcm5hbEtleXdvcmRzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnN0YXRlLmV4dGVybmFsQ29udGVudFJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gdGhpcy5zdGF0ZS5leHRlcm5hbENvbnRlbnRSdWxlc1tpXTtcbiAgICAgICAgICAgIGV4dGVybmFsS2V5d29yZHMucHVzaChydWxlLnBhdHRlcm4pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHRlcm5hbEtleXdvcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgZXh0ZXJuYWxLZXl3b3JkcyA9IGV4dGVybmFsS2V5d29yZHMuam9pbihcIiwgXCIpO1xuICAgICAgICAgICAgZXh0ZXJuYWxSdWxlcy5wdXNoKDxsaT5cbiAgICAgICAgICAgICAgICB7X3QoJ05vdGlmaWNhdGlvbnMgb24gdGhlIGZvbGxvd2luZyBrZXl3b3JkcyBmb2xsb3cgcnVsZXMgd2hpY2ggY2Fu4oCZdCBiZSBkaXNwbGF5ZWQgaGVyZTonKSB9XG4gICAgICAgICAgICAgICAgeyBleHRlcm5hbEtleXdvcmRzIH1cbiAgICAgICAgICAgIDwvbGk+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZXZpY2VzU2VjdGlvbjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucHVzaGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkZXZpY2VzU2VjdGlvbiA9IDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIj57IF90KCdVbmFibGUgdG8gZmV0Y2ggbm90aWZpY2F0aW9uIHRhcmdldCBsaXN0JykgfTwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnB1c2hlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkZXZpY2VzU2VjdGlvbiA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBJdCB3b3VsZCBiZSBncmVhdCB0byBiZSBhYmxlIHRvIGRlbGV0ZSBwdXNoZXJzIGZyb20gaGVyZSB0b28sXG4gICAgICAgICAgICAvLyBhbmQgdGhpcyB3b3VsZG4ndCBiZSBoYXJkIHRvIGFkZC5cbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdGF0ZS5wdXNoZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKDx0ciBrZXk9eyBpIH0+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57dGhpcy5zdGF0ZS5wdXNoZXJzW2ldLmFwcF9kaXNwbGF5X25hbWV9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPnt0aGlzLnN0YXRlLnB1c2hlcnNbaV0uZGV2aWNlX2Rpc3BsYXlfbmFtZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRldmljZXNTZWN0aW9uID0gKDx0YWJsZSBjbGFzc05hbWU9XCJteF9Vc2VyTm90aWZTZXR0aW5nc19kZXZpY2VzVGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgIHtyb3dzfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRldmljZXNTZWN0aW9uKSB7XG4gICAgICAgICAgICBkZXZpY2VzU2VjdGlvbiA9ICg8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMz57IF90KCdOb3RpZmljYXRpb24gdGFyZ2V0cycpIH08L2gzPlxuICAgICAgICAgICAgICAgIHsgZGV2aWNlc1NlY3Rpb24gfVxuICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhZHZhbmNlZFNldHRpbmdzO1xuICAgICAgICBpZiAoZXh0ZXJuYWxSdWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICAgICAgYWR2YW5jZWRTZXR0aW5ncyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDM+eyBfdCgnQWR2YW5jZWQgbm90aWZpY2F0aW9uIHNldHRpbmdzJykgfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ1RoZXJlIGFyZSBhZHZhbmNlZCBub3RpZmljYXRpb25zIHdoaWNoIGFyZSBub3Qgc2hvd24gaGVyZS4nKSB9PGJyIC8+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICdZb3UgbWlnaHQgaGF2ZSBjb25maWd1cmVkIHRoZW0gaW4gYSBjbGllbnQgb3RoZXIgdGhhbiAlKGJyYW5kKXMuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1lvdSBjYW5ub3QgdHVuZSB0aGVtIGluICUoYnJhbmQpcyBidXQgdGhleSBzdGlsbCBhcHBseS4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGV4dGVybmFsUnVsZXMgfVxuICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuXG4gICAgICAgICAgICAgICAge21hc3RlclB1c2hSdWxlRGl2fVxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTm90aWZTZXR0aW5nc19ub3RpZlRhYmxlXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgeyBzcGlubmVyIH1cblxuICAgICAgICAgICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2ggdmFsdWU9e1NldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJub3RpZmljYXRpb25zRW5hYmxlZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRW5hYmxlRGVza3RvcE5vdGlmaWNhdGlvbnNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ0VuYWJsZSBkZXNrdG9wIG5vdGlmaWNhdGlvbnMgZm9yIHRoaXMgc2Vzc2lvbicpfSAvPlxuXG4gICAgICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaCB2YWx1ZT17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIm5vdGlmaWNhdGlvbkJvZHlFbmFibGVkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmFibGVEZXNrdG9wTm90aWZpY2F0aW9uQm9keUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnU2hvdyBtZXNzYWdlIGluIGRlc2t0b3Agbm90aWZpY2F0aW9uJyl9IC8+XG5cbiAgICAgICAgICAgICAgICAgICAgPExhYmVsbGVkVG9nZ2xlU3dpdGNoIHZhbHVlPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRW5hYmxlQXVkaW9Ob3RpZmljYXRpb25zQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdFbmFibGUgYXVkaWJsZSBub3RpZmljYXRpb25zIGZvciB0aGlzIHNlc3Npb24nKX0gLz5cblxuICAgICAgICAgICAgICAgICAgICB7IGVtYWlsTm90aWZpY2F0aW9uc1Jvd3MgfVxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck5vdGlmU2V0dGluZ3NfcHVzaFJ1bGVzVGFibGVXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwibXhfVXNlck5vdGlmU2V0dGluZ3NfcHVzaFJ1bGVzVGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCB3aWR0aD1cIjU1JVwiPjwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggd2lkdGg9XCIxNSVcIj57IF90KCdPZmYnKSB9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCB3aWR0aD1cIjE1JVwiPnsgX3QoJ09uJykgfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggd2lkdGg9XCIxNSVcIj57IF90KCdOb2lzeScpIH08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJOb3RpZlJ1bGVzVGFibGVSb3dzKCkgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIHsgYWR2YW5jZWRTZXR0aW5ncyB9XG5cbiAgICAgICAgICAgICAgICAgICAgeyBkZXZpY2VzU2VjdGlvbiB9XG5cbiAgICAgICAgICAgICAgICAgICAgeyBjbGVhck5vdGlmaWNhdGlvbnNCdXR0b24gfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=