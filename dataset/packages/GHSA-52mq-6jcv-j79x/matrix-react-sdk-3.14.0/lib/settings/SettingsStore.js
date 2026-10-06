"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _DeviceSettingsHandler = _interopRequireDefault(require("./handlers/DeviceSettingsHandler"));

var _RoomDeviceSettingsHandler = _interopRequireDefault(require("./handlers/RoomDeviceSettingsHandler"));

var _DefaultSettingsHandler = _interopRequireDefault(require("./handlers/DefaultSettingsHandler"));

var _RoomAccountSettingsHandler = _interopRequireDefault(require("./handlers/RoomAccountSettingsHandler"));

var _AccountSettingsHandler = _interopRequireDefault(require("./handlers/AccountSettingsHandler"));

var _RoomSettingsHandler = _interopRequireDefault(require("./handlers/RoomSettingsHandler"));

var _ConfigSettingsHandler = _interopRequireDefault(require("./handlers/ConfigSettingsHandler"));

var _languageHandler = require("../languageHandler");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _Settings = require("./Settings");

var _LocalEchoWrapper = _interopRequireDefault(require("./handlers/LocalEchoWrapper"));

var _WatchManager = require("./WatchManager");

var _SettingLevel = require("./SettingLevel");

/*
Copyright 2017 Travis Ralston
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const defaultWatchManager = new _WatchManager.WatchManager(); // Convert the settings to easier to manage objects for the handlers

const defaultSettings = {};
const invertedDefaultSettings = {};
const featureNames = [];

for (const key of Object.keys(_Settings.SETTINGS)) {
  defaultSettings[key] = _Settings.SETTINGS[key].default;
  if (_Settings.SETTINGS[key].isFeature) featureNames.push(key);

  if (_Settings.SETTINGS[key].invertedSettingName) {
    // Invert now so that the rest of the system will invert it back
    // to what was intended.
    invertedDefaultSettings[_Settings.SETTINGS[key].invertedSettingName] = !_Settings.SETTINGS[key].default;
  }
}

const LEVEL_HANDLERS = {
  [_SettingLevel.SettingLevel.DEVICE]: new _DeviceSettingsHandler.default(featureNames, defaultWatchManager),
  [_SettingLevel.SettingLevel.ROOM_DEVICE]: new _RoomDeviceSettingsHandler.default(defaultWatchManager),
  [_SettingLevel.SettingLevel.ROOM_ACCOUNT]: new _RoomAccountSettingsHandler.default(defaultWatchManager),
  [_SettingLevel.SettingLevel.ACCOUNT]: new _AccountSettingsHandler.default(defaultWatchManager),
  [_SettingLevel.SettingLevel.ROOM]: new _RoomSettingsHandler.default(defaultWatchManager),
  [_SettingLevel.SettingLevel.CONFIG]: new _ConfigSettingsHandler.default(featureNames),
  [_SettingLevel.SettingLevel.DEFAULT]: new _DefaultSettingsHandler.default(defaultSettings, invertedDefaultSettings)
}; // Wrap all the handlers with local echo

for (const key of Object.keys(LEVEL_HANDLERS)) {
  LEVEL_HANDLERS[key] = new _LocalEchoWrapper.default(LEVEL_HANDLERS[key]);
}

const LEVEL_ORDER = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.ROOM, _SettingLevel.SettingLevel.CONFIG, _SettingLevel.SettingLevel.DEFAULT];
/*:: export type CallbackFn = (
    settingName: string,
    roomId: string,
    atLevel: SettingLevel,
    newValAtLevel: any,
    newVal: any,
) => void;*/

/*:: export type LabsFeatureState = "labs" | "disable" | "enable" | string;*/

/**
 * Controls and manages application settings by providing varying levels at which the
 * setting value may be specified. The levels are then used to determine what the setting
 * value should be given a set of circumstances. The levels, in priority order, are:
 * - SettingLevel.DEVICE         - Values are determined by the current device
 * - SettingLevel.ROOM_DEVICE    - Values are determined by the current device for a particular room
 * - SettingLevel.ROOM_ACCOUNT   - Values are determined by the current account for a particular room
 * - SettingLevel.ACCOUNT        - Values are determined by the current account
 * - SettingLevel.ROOM           - Values are determined by a particular room (by the room admins)
 * - SettingLevel.CONFIG         - Values are determined by the config.json
 * - SettingLevel.DEFAULT        - Values are determined by the hardcoded defaults
 *
 * Each level has a different method to storing the setting value. For implementation
 * specific details, please see the handlers. The "config" and "default" levels are
 * both always supported on all platforms. All other settings should be guarded by
 * isLevelSupported() prior to attempting to set the value.
 *
 * Settings can also represent features. Features are significant portions of the
 * application that warrant a dedicated setting to toggle them on or off. Features are
 * special-cased to ensure that their values respect the configuration (for example, a
 * feature may be reported as disabled even though a user has specifically requested it
 * be enabled).
 */
class SettingsStore {
  // We support watching settings for changes, and do this by tracking which callbacks have
  // been given to us. We end up returning the callbackRef to the caller so they can unsubscribe
  // at a later point.
  //
  // We also maintain a list of monitors which are special watchers: they cause dispatches
  // when the setting changes. We track which rooms we're monitoring though to ensure we
  // don't duplicate updates on the bus.
  // { callbackRef => { callbackFn } }
  // { settingName => { roomId => callbackRef } }
  // Counter used for generation of watcher IDs

  /**
   * Gets all the feature-style setting names.
   * @returns {string[]} The names of the feature settings.
   */
  static getFeatureSettingNames()
  /*: string[]*/
  {
    return Object.keys(_Settings.SETTINGS).filter(n => SettingsStore.isFeature(n));
  }
  /**
   * Watches for changes in a particular setting. This is done without any local echo
   * wrapping and fires whenever a change is detected in a setting's value, at any level.
   * Watching is intended to be used in scenarios where the app needs to react to changes
   * made by other devices. It is otherwise expected that callers will be able to use the
   * Controller system or track their own changes to settings. Callers should retain the
   * returned reference to later unsubscribe from updates.
   * @param {string} settingName The setting name to watch
   * @param {String} roomId The room ID to watch for changes in. May be null for 'all'.
   * @param {function} callbackFn A function to be called when a setting change is
   * detected. Five arguments can be expected: the setting name, the room ID (may be null),
   * the level the change happened at, the new value at the given level, and finally the new
   * value for the setting regardless of level. The callback is responsible for determining
   * if the change in value is worthwhile enough to react upon.
   * @returns {string} A reference to the watcher that was employed.
   */


  static watchSetting(settingName
  /*: string*/
  , roomId
  /*: string*/
  , callbackFn
  /*: CallbackFn*/
  )
  /*: string*/
  {
    const setting = _Settings.SETTINGS[settingName];
    const originalSettingName = settingName;
    if (!setting) throw new Error(`${settingName} is not a setting`);

    if (setting.invertedSettingName) {
      settingName = setting.invertedSettingName;
    }

    const watcherId = `${new Date().getTime()}_${SettingsStore.watcherCount++}_${settingName}_${roomId}`;

    const localizedCallback = (changedInRoomId, atLevel, newValAtLevel) => {
      const newValue = SettingsStore.getValue(originalSettingName);
      callbackFn(originalSettingName, changedInRoomId, atLevel, newValAtLevel, newValue);
    };

    SettingsStore.watchers[watcherId] = localizedCallback;
    defaultWatchManager.watchSetting(settingName, roomId, localizedCallback);
    return watcherId;
  }
  /**
   * Stops the SettingsStore from watching a setting. This is a no-op if the watcher
   * provided is not found.
   * @param {string} watcherReference The watcher reference (received from #watchSetting)
   * to cancel.
   */


  static unwatchSetting(watcherReference
  /*: string*/
  ) {
    if (!SettingsStore.watchers[watcherReference]) {
      console.warn(`Ending non-existent watcher ID ${watcherReference}`);
      return;
    }

    defaultWatchManager.unwatchSetting(SettingsStore.watchers[watcherReference]);
    delete SettingsStore.watchers[watcherReference];
  }
  /**
   * Sets up a monitor for a setting. This behaves similar to #watchSetting except instead
   * of making a call to a callback, it forwards all changes to the dispatcher. Callers can
   * expect to listen for the 'setting_updated' action with an object containing settingName,
   * roomId, level, newValueAtLevel, and newValue.
   * @param {string} settingName The setting name to monitor.
   * @param {String} roomId The room ID to monitor for changes in. Use null for all rooms.
   */


  static monitorSetting(settingName
  /*: string*/
  , roomId
  /*: string*/
  ) {
    roomId = roomId || null; // the thing wants null specifically to work, so appease it.

    if (!this.monitors[settingName]) this.monitors[settingName] = {};

    const registerWatcher = () => {
      this.monitors[settingName][roomId] = SettingsStore.watchSetting(settingName, roomId, (settingName, inRoomId, level, newValueAtLevel, newValue) => {
        _dispatcher.default.dispatch({
          action: 'setting_updated',
          settingName,
          roomId: inRoomId,
          level,
          newValueAtLevel,
          newValue
        });
      });
    };

    const hasRoom = Object.keys(this.monitors[settingName]).find(r => r === roomId || r === null);

    if (!hasRoom) {
      registerWatcher();
    } else {
      if (roomId === null) {
        // Unregister all existing watchers and register the new one
        for (const roomId of Object.keys(this.monitors[settingName])) {
          SettingsStore.unwatchSetting(this.monitors[settingName][roomId]);
        }

        this.monitors[settingName] = {};
        registerWatcher();
      } // else a watcher is already registered for the room, so don't bother registering it again

    }
  }
  /**
   * Gets the translated display name for a given setting
   * @param {string} settingName The setting to look up.
   * @param {SettingLevel} atLevel
   * The level to get the display name for; Defaults to 'default'.
   * @return {String} The display name for the setting, or null if not found.
   */


  static getDisplayName(settingName
  /*: string*/
  , atLevel = _SettingLevel.SettingLevel.DEFAULT) {
    if (!_Settings.SETTINGS[settingName] || !_Settings.SETTINGS[settingName].displayName) return null;
    let displayName = _Settings.SETTINGS[settingName].displayName;

    if (displayName instanceof Object) {
      if (displayName[atLevel]) displayName = displayName[atLevel];else displayName = displayName["default"];
    }

    return (0, _languageHandler._t)(displayName);
  }
  /**
   * Determines if a setting is also a feature.
   * @param {string} settingName The setting to look up.
   * @return {boolean} True if the setting is a feature.
   */


  static isFeature(settingName
  /*: string*/
  ) {
    if (!_Settings.SETTINGS[settingName]) return false;
    return _Settings.SETTINGS[settingName].isFeature;
  }
  /**
   * Determines if a setting is enabled.
   * If a setting is disabled then it should be hidden from the user.
   * @param {string} settingName The setting to look up.
   * @return {boolean} True if the setting is enabled.
   */


  static isEnabled(settingName
  /*: string*/
  )
  /*: boolean*/
  {
    if (!_Settings.SETTINGS[settingName]) return false;
    return _Settings.SETTINGS[settingName].controller ? !_Settings.SETTINGS[settingName].controller.settingDisabled : true;
  }
  /**
   * Gets the value of a setting. The room ID is optional if the setting is not to
   * be applied to any particular room, otherwise it should be supplied.
   * @param {string} settingName The name of the setting to read the value of.
   * @param {String} roomId The room ID to read the setting value in, may be null.
   * @param {boolean} excludeDefault True to disable using the default value.
   * @return {*} The value, or null if not found
   */


  static getValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  = null, excludeDefault = false)
  /*: T*/
  {
    // Verify that the setting is actually a setting
    if (!_Settings.SETTINGS[settingName]) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const setting = _Settings.SETTINGS[settingName];
    const levelOrder = setting.supportedLevelsAreOrdered ? setting.supportedLevels : LEVEL_ORDER;
    return SettingsStore.getValueAt(levelOrder[0], settingName, roomId, false, excludeDefault);
  }
  /**
   * Gets a setting's value at a particular level, ignoring all levels that are more specific.
   * @param {SettingLevel|"config"|"default"} level The
   * level to look at.
   * @param {string} settingName The name of the setting to read.
   * @param {String} roomId The room ID to read the setting value in, may be null.
   * @param {boolean} explicit If true, this method will not consider other levels, just the one
   * provided. Defaults to false.
   * @param {boolean} excludeDefault True to disable using the default value.
   * @return {*} The value, or null if not found.
   */


  static getValueAt(level
  /*: SettingLevel*/
  , settingName
  /*: string*/
  , roomId
  /*: string*/
  = null, explicit = false, excludeDefault = false)
  /*: any*/
  {
    // Verify that the setting is actually a setting
    const setting = _Settings.SETTINGS[settingName];

    if (!setting) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const levelOrder = setting.supportedLevelsAreOrdered ? setting.supportedLevels : LEVEL_ORDER;
    if (!levelOrder.includes(_SettingLevel.SettingLevel.DEFAULT)) levelOrder.push(_SettingLevel.SettingLevel.DEFAULT); // always include default

    const minIndex = levelOrder.indexOf(level);
    if (minIndex === -1) throw new Error("Level " + level + " is not prioritized");
    const handlers = SettingsStore.getHandlers(settingName); // Check if we need to invert the setting at all. Do this after we get the setting
    // handlers though, otherwise we'll fail to read the value.

    if (setting.invertedSettingName) {
      //console.warn(`Inverting ${settingName} to be ${setting.invertedSettingName} - legacy setting`);
      settingName = setting.invertedSettingName;
    }

    if (explicit) {
      const handler = handlers[level];

      if (!handler) {
        return SettingsStore.getFinalValue(setting, level, roomId, null, null);
      }

      const value = handler.getValue(settingName, roomId);
      return SettingsStore.getFinalValue(setting, level, roomId, value, level);
    }

    for (let i = minIndex; i < levelOrder.length; i++) {
      const handler = handlers[levelOrder[i]];
      if (!handler) continue;
      if (excludeDefault && levelOrder[i] === "default") continue;
      const value = handler.getValue(settingName, roomId);
      if (value === null || value === undefined) continue;
      return SettingsStore.getFinalValue(setting, level, roomId, value, levelOrder[i]);
    }

    return SettingsStore.getFinalValue(setting, level, roomId, null, null);
  }
  /**
   * Gets the default value of a setting.
   * @param {string} settingName The name of the setting to read the value of.
   * @param {String} roomId The room ID to read the setting value in, may be null.
   * @return {*} The default value
   */


  static getDefaultValue(settingName
  /*: string*/
  )
  /*: any*/
  {
    // Verify that the setting is actually a setting
    if (!_Settings.SETTINGS[settingName]) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    return _Settings.SETTINGS[settingName].default;
  }

  static getFinalValue(setting
  /*: ISetting*/
  , level
  /*: SettingLevel*/
  , roomId
  /*: string*/
  , calculatedValue
  /*: any*/
  , calculatedAtLevel
  /*: SettingLevel*/
  )
  /*: any*/
  {
    let resultingValue = calculatedValue;

    if (setting.controller) {
      const actualValue = setting.controller.getValueOverride(level, roomId, calculatedValue, calculatedAtLevel);
      if (actualValue !== undefined && actualValue !== null) resultingValue = actualValue;
    }

    if (setting.invertedSettingName) resultingValue = !resultingValue;
    return resultingValue;
  }
  /* eslint-disable valid-jsdoc */
  //https://github.com/eslint/eslint/issues/7307

  /**
   * Sets the value for a setting. The room ID is optional if the setting is not being
   * set for a particular room, otherwise it should be supplied. The value may be null
   * to indicate that the level should no longer have an override.
   * @param {string} settingName The name of the setting to change.
   * @param {String} roomId The room ID to change the value in, may be null.
   * @param {SettingLevel} level The level
   * to change the value at.
   * @param {*} value The new value of the setting, may be null.
   * @return {Promise} Resolves when the setting has been changed.
   */

  /* eslint-enable valid-jsdoc */


  static async setValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  , level
  /*: SettingLevel*/
  , value
  /*: any*/
  )
  /*: Promise<void>*/
  {
    // Verify that the setting is actually a setting
    const setting = _Settings.SETTINGS[settingName];

    if (!setting) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const handler = SettingsStore.getHandler(settingName, level);

    if (!handler) {
      throw new Error("Setting " + settingName + " does not have a handler for " + level);
    }

    if (setting.invertedSettingName) {
      // Note: We can't do this when the `level` is "default", however we also
      // know that the user can't possible change the default value through this
      // function so we don't bother checking it.
      //console.warn(`Inverting ${settingName} to be ${setting.invertedSettingName} - legacy setting`);
      settingName = setting.invertedSettingName;
      value = !value;
    }

    if (!handler.canSetValue(settingName, roomId)) {
      throw new Error("User cannot set " + settingName + " at " + level + " in " + roomId);
    }

    await handler.setValue(settingName, roomId, value);
    const controller = setting.controller;

    if (controller) {
      controller.onChange(level, roomId, value);
    }
  }
  /**
   * Determines if the current user is permitted to set the given setting at the given
   * level for a particular room. The room ID is optional if the setting is not being
   * set for a particular room, otherwise it should be supplied.
   * @param {string} settingName The name of the setting to check.
   * @param {String} roomId The room ID to check in, may be null.
   * @param {SettingLevel} level The level to
   * check at.
   * @return {boolean} True if the user may set the setting, false otherwise.
   */


  static canSetValue(settingName
  /*: string*/
  , roomId
  /*: string*/
  , level
  /*: SettingLevel*/
  )
  /*: boolean*/
  {
    // Verify that the setting is actually a setting
    if (!_Settings.SETTINGS[settingName]) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    } // When features are specified in the config.json, we force them as enabled or disabled.


    if (SettingsStore.isFeature(settingName)) {
      const configVal = SettingsStore.getValueAt(_SettingLevel.SettingLevel.CONFIG, settingName, roomId, true, true);
      if (configVal === true || configVal === false) return false;
    }

    const handler = SettingsStore.getHandler(settingName, level);
    if (!handler) return false;
    return handler.canSetValue(settingName, roomId);
  }
  /**
   * Determines if the given level is supported on this device.
   * @param {SettingLevel} level The level
   * to check the feasibility of.
   * @return {boolean} True if the level is supported, false otherwise.
   */


  static isLevelSupported(level
  /*: SettingLevel*/
  )
  /*: boolean*/
  {
    if (!LEVEL_HANDLERS[level]) return false;
    return LEVEL_HANDLERS[level].isSupported();
  }
  /**
   * Determines the first supported level out of all the levels that can be used for a
   * specific setting.
   * @param {string} settingName The setting name.
   * @return {SettingLevel}
   */


  static firstSupportedLevel(settingName
  /*: string*/
  )
  /*: SettingLevel*/
  {
    // Verify that the setting is actually a setting
    const setting = _Settings.SETTINGS[settingName];

    if (!setting) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const levelOrder = setting.supportedLevelsAreOrdered ? setting.supportedLevels : LEVEL_ORDER;
    if (!levelOrder.includes(_SettingLevel.SettingLevel.DEFAULT)) levelOrder.push(_SettingLevel.SettingLevel.DEFAULT); // always include default

    const handlers = SettingsStore.getHandlers(settingName);

    for (const level of levelOrder) {
      const handler = handlers[level];
      if (!handler) continue;
      return level;
    }

    return null;
  }
  /**
   * Debugging function for reading explicit setting values without going through the
   * complicated/biased functions in the SettingsStore. This will print information to
   * the console for analysis. Not intended to be used within the application.
   * @param {string} realSettingName The setting name to try and read.
   * @param {string} roomId Optional room ID to test the setting in.
   */


  static debugSetting(realSettingName
  /*: string*/
  , roomId
  /*: string*/
  ) {
    console.log(`--- DEBUG ${realSettingName}`); // Note: we intentionally use JSON.stringify here to avoid the console masking the
    // problem if there's a type representation issue. Also, this way it is guaranteed
    // to show up in a rageshake if required.

    const def = _Settings.SETTINGS[realSettingName];
    console.log(`--- definition: ${def ? JSON.stringify(def) : '<NOT_FOUND>'}`);
    console.log(`--- default level order: ${JSON.stringify(LEVEL_ORDER)}`);
    console.log(`--- registered handlers: ${JSON.stringify(Object.keys(LEVEL_HANDLERS))}`);

    const doChecks = settingName => {
      for (const handlerName of Object.keys(LEVEL_HANDLERS)) {
        const handler = LEVEL_HANDLERS[handlerName];

        try {
          const value = handler.getValue(settingName, roomId);
          console.log(`---     ${handlerName}@${roomId || '<no_room>'} = ${JSON.stringify(value)}`);
        } catch (e) {
          console.log(`---     ${handler}@${roomId || '<no_room>'} THREW ERROR: ${e.message}`);
          console.error(e);
        }

        if (roomId) {
          try {
            const value = handler.getValue(settingName, null);
            console.log(`---     ${handlerName}@<no_room> = ${JSON.stringify(value)}`);
          } catch (e) {
            console.log(`---     ${handler}@<no_room> THREW ERROR: ${e.message}`);
            console.error(e);
          }
        }
      }

      console.log(`--- calculating as returned by SettingsStore`);
      console.log(`--- these might not match if the setting uses a controller - be warned!`);

      try {
        const value = SettingsStore.getValue(settingName, roomId);
        console.log(`---     SettingsStore#generic@${roomId || '<no_room>'}  = ${JSON.stringify(value)}`);
      } catch (e) {
        console.log(`---     SettingsStore#generic@${roomId || '<no_room>'} THREW ERROR: ${e.message}`);
        console.error(e);
      }

      if (roomId) {
        try {
          const value = SettingsStore.getValue(settingName, null);
          console.log(`---     SettingsStore#generic@<no_room>  = ${JSON.stringify(value)}`);
        } catch (e) {
          console.log(`---     SettingsStore#generic@$<no_room> THREW ERROR: ${e.message}`);
          console.error(e);
        }
      }

      for (const level of LEVEL_ORDER) {
        try {
          const value = SettingsStore.getValueAt(level, settingName, roomId);
          console.log(`---     SettingsStore#${level}@${roomId || '<no_room>'} = ${JSON.stringify(value)}`);
        } catch (e) {
          console.log(`---     SettingsStore#${level}@${roomId || '<no_room>'} THREW ERROR: ${e.message}`);
          console.error(e);
        }

        if (roomId) {
          try {
            const value = SettingsStore.getValueAt(level, settingName, null);
            console.log(`---     SettingsStore#${level}@<no_room> = ${JSON.stringify(value)}`);
          } catch (e) {
            console.log(`---     SettingsStore#${level}@$<no_room> THREW ERROR: ${e.message}`);
            console.error(e);
          }
        }
      }
    };

    doChecks(realSettingName);

    if (def.invertedSettingName) {
      console.log(`--- TESTING INVERTED SETTING NAME`);
      console.log(`--- inverted: ${def.invertedSettingName}`);
      doChecks(def.invertedSettingName);
    }

    console.log(`--- END DEBUG`);
  }

  static getHandler(settingName
  /*: string*/
  , level
  /*: SettingLevel*/
  )
  /*: SettingsHandler*/
  {
    const handlers = SettingsStore.getHandlers(settingName);
    if (!handlers[level]) return null;
    return handlers[level];
  }

  static getHandlers(settingName
  /*: string*/
  )
  /*: IHandlerMap*/
  {
    if (!_Settings.SETTINGS[settingName]) return {};
    const handlers = {};

    for (const level of _Settings.SETTINGS[settingName].supportedLevels) {
      if (!LEVEL_HANDLERS[level]) throw new Error("Unexpected level " + level);
      if (SettingsStore.isLevelSupported(level)) handlers[level] = LEVEL_HANDLERS[level];
    } // Always support 'default'


    if (!handlers['default']) handlers['default'] = LEVEL_HANDLERS['default'];
    return handlers;
  }

} // For debugging purposes


exports.default = SettingsStore;
(0, _defineProperty2.default)(SettingsStore, "watchers", {});
(0, _defineProperty2.default)(SettingsStore, "monitors", {});
(0, _defineProperty2.default)(SettingsStore, "watcherCount", 1);
window.mxSettingsStore = SettingsStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlLnRzIl0sIm5hbWVzIjpbImRlZmF1bHRXYXRjaE1hbmFnZXIiLCJXYXRjaE1hbmFnZXIiLCJkZWZhdWx0U2V0dGluZ3MiLCJpbnZlcnRlZERlZmF1bHRTZXR0aW5ncyIsImZlYXR1cmVOYW1lcyIsImtleSIsIk9iamVjdCIsImtleXMiLCJTRVRUSU5HUyIsImRlZmF1bHQiLCJpc0ZlYXR1cmUiLCJwdXNoIiwiaW52ZXJ0ZWRTZXR0aW5nTmFtZSIsIkxFVkVMX0hBTkRMRVJTIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwiRGV2aWNlU2V0dGluZ3NIYW5kbGVyIiwiUk9PTV9ERVZJQ0UiLCJSb29tRGV2aWNlU2V0dGluZ3NIYW5kbGVyIiwiUk9PTV9BQ0NPVU5UIiwiUm9vbUFjY291bnRTZXR0aW5nc0hhbmRsZXIiLCJBQ0NPVU5UIiwiQWNjb3VudFNldHRpbmdzSGFuZGxlciIsIlJPT00iLCJSb29tU2V0dGluZ3NIYW5kbGVyIiwiQ09ORklHIiwiQ29uZmlnU2V0dGluZ3NIYW5kbGVyIiwiREVGQVVMVCIsIkRlZmF1bHRTZXR0aW5nc0hhbmRsZXIiLCJMb2NhbEVjaG9XcmFwcGVyIiwiTEVWRUxfT1JERVIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0RmVhdHVyZVNldHRpbmdOYW1lcyIsImZpbHRlciIsIm4iLCJ3YXRjaFNldHRpbmciLCJzZXR0aW5nTmFtZSIsInJvb21JZCIsImNhbGxiYWNrRm4iLCJzZXR0aW5nIiwib3JpZ2luYWxTZXR0aW5nTmFtZSIsIkVycm9yIiwid2F0Y2hlcklkIiwiRGF0ZSIsImdldFRpbWUiLCJ3YXRjaGVyQ291bnQiLCJsb2NhbGl6ZWRDYWxsYmFjayIsImNoYW5nZWRJblJvb21JZCIsImF0TGV2ZWwiLCJuZXdWYWxBdExldmVsIiwibmV3VmFsdWUiLCJnZXRWYWx1ZSIsIndhdGNoZXJzIiwidW53YXRjaFNldHRpbmciLCJ3YXRjaGVyUmVmZXJlbmNlIiwiY29uc29sZSIsIndhcm4iLCJtb25pdG9yU2V0dGluZyIsIm1vbml0b3JzIiwicmVnaXN0ZXJXYXRjaGVyIiwiaW5Sb29tSWQiLCJsZXZlbCIsIm5ld1ZhbHVlQXRMZXZlbCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiaGFzUm9vbSIsImZpbmQiLCJyIiwiZ2V0RGlzcGxheU5hbWUiLCJkaXNwbGF5TmFtZSIsImlzRW5hYmxlZCIsImNvbnRyb2xsZXIiLCJzZXR0aW5nRGlzYWJsZWQiLCJleGNsdWRlRGVmYXVsdCIsImxldmVsT3JkZXIiLCJzdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkIiwic3VwcG9ydGVkTGV2ZWxzIiwiZ2V0VmFsdWVBdCIsImV4cGxpY2l0IiwiaW5jbHVkZXMiLCJtaW5JbmRleCIsImluZGV4T2YiLCJoYW5kbGVycyIsImdldEhhbmRsZXJzIiwiaGFuZGxlciIsImdldEZpbmFsVmFsdWUiLCJ2YWx1ZSIsImkiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJnZXREZWZhdWx0VmFsdWUiLCJjYWxjdWxhdGVkVmFsdWUiLCJjYWxjdWxhdGVkQXRMZXZlbCIsInJlc3VsdGluZ1ZhbHVlIiwiYWN0dWFsVmFsdWUiLCJnZXRWYWx1ZU92ZXJyaWRlIiwic2V0VmFsdWUiLCJnZXRIYW5kbGVyIiwiY2FuU2V0VmFsdWUiLCJvbkNoYW5nZSIsImNvbmZpZ1ZhbCIsImlzTGV2ZWxTdXBwb3J0ZWQiLCJpc1N1cHBvcnRlZCIsImZpcnN0U3VwcG9ydGVkTGV2ZWwiLCJkZWJ1Z1NldHRpbmciLCJyZWFsU2V0dGluZ05hbWUiLCJsb2ciLCJkZWYiLCJKU09OIiwic3RyaW5naWZ5IiwiZG9DaGVja3MiLCJoYW5kbGVyTmFtZSIsImUiLCJtZXNzYWdlIiwiZXJyb3IiLCJ3aW5kb3ciLCJteFNldHRpbmdzU3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTdCQTtBQUNB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RCxjQUFjLENBQUNnRCxLQUFELENBQWhDO0FBQzlDLEtBUHdELENBU3pEOzs7QUFDQSxRQUFJLENBQUNzQixRQUFRLENBQUMsU0FBRCxDQUFiLEVBQTBCQSxRQUFRLENBQUMsU0FBRCxDQUFSLEdBQXNCdEUsY0FBYyxDQUFDLFNBQUQsQ0FBcEM7QUFFMUIsV0FBT3NFLFFBQVA7QUFDSDs7QUFsZjhCLEMsQ0FxZm5DOzs7OzhCQXJmcUJwRCxhLGNBUVMsRTs4QkFSVEEsYSxjQVNTLEU7OEJBVFRBLGEsa0JBWWEsQztBQTBlbENxRixNQUFNLENBQUNDLGVBQVAsR0FBeUJ0RixhQUF6QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgRGV2aWNlU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL0RldmljZVNldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IFJvb21EZXZpY2VTZXR0aW5nc0hhbmRsZXIgZnJvbSBcIi4vaGFuZGxlcnMvUm9vbURldmljZVNldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IERlZmF1bHRTZXR0aW5nc0hhbmRsZXIgZnJvbSBcIi4vaGFuZGxlcnMvRGVmYXVsdFNldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IFJvb21BY2NvdW50U2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL1Jvb21BY2NvdW50U2V0dGluZ3NIYW5kbGVyXCI7XG5pbXBvcnQgQWNjb3VudFNldHRpbmdzSGFuZGxlciBmcm9tIFwiLi9oYW5kbGVycy9BY2NvdW50U2V0dGluZ3NIYW5kbGVyXCI7XG5pbXBvcnQgUm9vbVNldHRpbmdzSGFuZGxlciBmcm9tIFwiLi9oYW5kbGVycy9Sb29tU2V0dGluZ3NIYW5kbGVyXCI7XG5pbXBvcnQgQ29uZmlnU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL0NvbmZpZ1NldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGRpcyBmcm9tICcuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgSVNldHRpbmcsIFNFVFRJTkdTIH0gZnJvbSBcIi4vU2V0dGluZ3NcIjtcbmltcG9ydCBMb2NhbEVjaG9XcmFwcGVyIGZyb20gXCIuL2hhbmRsZXJzL0xvY2FsRWNob1dyYXBwZXJcIjtcbmltcG9ydCB7IFdhdGNoTWFuYWdlciB9IGZyb20gXCIuL1dhdGNoTWFuYWdlclwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4vU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL1NldHRpbmdzSGFuZGxlclwiO1xuXG5jb25zdCBkZWZhdWx0V2F0Y2hNYW5hZ2VyID0gbmV3IFdhdGNoTWFuYWdlcigpO1xuXG4vLyBDb252ZXJ0IHRoZSBzZXR0aW5ncyB0byBlYXNpZXIgdG8gbWFuYWdlIG9iamVjdHMgZm9yIHRoZSBoYW5kbGVyc1xuY29uc3QgZGVmYXVsdFNldHRpbmdzID0ge307XG5jb25zdCBpbnZlcnRlZERlZmF1bHRTZXR0aW5ncyA9IHt9O1xuY29uc3QgZmVhdHVyZU5hbWVzID0gW107XG5mb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhTRVRUSU5HUykpIHtcbiAgICBkZWZhdWx0U2V0dGluZ3Nba2V5XSA9IFNFVFRJTkdTW2tleV0uZGVmYXVsdDtcbiAgICBpZiAoU0VUVElOR1Nba2V5XS5pc0ZlYXR1cmUpIGZlYXR1cmVOYW1lcy5wdXNoKGtleSk7XG4gICAgaWYgKFNFVFRJTkdTW2tleV0uaW52ZXJ0ZWRTZXR0aW5nTmFtZSkge1xuICAgICAgICAvLyBJbnZlcnQgbm93IHNvIHRoYXQgdGhlIHJlc3Qgb2YgdGhlIHN5c3RlbSB3aWxsIGludmVydCBpdCBiYWNrXG4gICAgICAgIC8vIHRvIHdoYXQgd2FzIGludGVuZGVkLlxuICAgICAgICBpbnZlcnRlZERlZmF1bHRTZXR0aW5nc1tTRVRUSU5HU1trZXldLmludmVydGVkU2V0dGluZ05hbWVdID0gIVNFVFRJTkdTW2tleV0uZGVmYXVsdDtcbiAgICB9XG59XG5cbmNvbnN0IExFVkVMX0hBTkRMRVJTID0ge1xuICAgIFtTZXR0aW5nTGV2ZWwuREVWSUNFXTogbmV3IERldmljZVNldHRpbmdzSGFuZGxlcihmZWF0dXJlTmFtZXMsIGRlZmF1bHRXYXRjaE1hbmFnZXIpLFxuICAgIFtTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0VdOiBuZXcgUm9vbURldmljZVNldHRpbmdzSGFuZGxlcihkZWZhdWx0V2F0Y2hNYW5hZ2VyKSxcbiAgICBbU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVF06IG5ldyBSb29tQWNjb3VudFNldHRpbmdzSGFuZGxlcihkZWZhdWx0V2F0Y2hNYW5hZ2VyKSxcbiAgICBbU2V0dGluZ0xldmVsLkFDQ09VTlRdOiBuZXcgQWNjb3VudFNldHRpbmdzSGFuZGxlcihkZWZhdWx0V2F0Y2hNYW5hZ2VyKSxcbiAgICBbU2V0dGluZ0xldmVsLlJPT01dOiBuZXcgUm9vbVNldHRpbmdzSGFuZGxlcihkZWZhdWx0V2F0Y2hNYW5hZ2VyKSxcbiAgICBbU2V0dGluZ0xldmVsLkNPTkZJR106IG5ldyBDb25maWdTZXR0aW5nc0hhbmRsZXIoZmVhdHVyZU5hbWVzKSxcbiAgICBbU2V0dGluZ0xldmVsLkRFRkFVTFRdOiBuZXcgRGVmYXVsdFNldHRpbmdzSGFuZGxlcihkZWZhdWx0U2V0dGluZ3MsIGludmVydGVkRGVmYXVsdFNldHRpbmdzKSxcbn07XG5cbi8vIFdyYXAgYWxsIHRoZSBoYW5kbGVycyB3aXRoIGxvY2FsIGVjaG9cbmZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKExFVkVMX0hBTkRMRVJTKSkge1xuICAgIExFVkVMX0hBTkRMRVJTW2tleV0gPSBuZXcgTG9jYWxFY2hvV3JhcHBlcihMRVZFTF9IQU5ETEVSU1trZXldKTtcbn1cblxuY29uc3QgTEVWRUxfT1JERVIgPSBbXG4gICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTSxcbiAgICBTZXR0aW5nTGV2ZWwuQ09ORklHLFxuICAgIFNldHRpbmdMZXZlbC5ERUZBVUxULFxuXTtcblxuZXhwb3J0IHR5cGUgQ2FsbGJhY2tGbiA9IChcbiAgICBzZXR0aW5nTmFtZTogc3RyaW5nLFxuICAgIHJvb21JZDogc3RyaW5nLFxuICAgIGF0TGV2ZWw6IFNldHRpbmdMZXZlbCxcbiAgICBuZXdWYWxBdExldmVsOiBhbnksXG4gICAgbmV3VmFsOiBhbnksXG4pID0+IHZvaWQ7XG5cbmludGVyZmFjZSBJSGFuZGxlck1hcCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoaXMgdG8gYmUgYSBzdHJpbmcga2V5IGJ1dCB3ZSBrbm93IGJldHRlclxuICAgIFtsZXZlbDogU2V0dGluZ0xldmVsXTogU2V0dGluZ3NIYW5kbGVyO1xufVxuXG5leHBvcnQgdHlwZSBMYWJzRmVhdHVyZVN0YXRlID0gXCJsYWJzXCIgfCBcImRpc2FibGVcIiB8IFwiZW5hYmxlXCIgfCBzdHJpbmc7XG5cbi8qKlxuICogQ29udHJvbHMgYW5kIG1hbmFnZXMgYXBwbGljYXRpb24gc2V0dGluZ3MgYnkgcHJvdmlkaW5nIHZhcnlpbmcgbGV2ZWxzIGF0IHdoaWNoIHRoZVxuICogc2V0dGluZyB2YWx1ZSBtYXkgYmUgc3BlY2lmaWVkLiBUaGUgbGV2ZWxzIGFyZSB0aGVuIHVzZWQgdG8gZGV0ZXJtaW5lIHdoYXQgdGhlIHNldHRpbmdcbiAqIHZhbHVlIHNob3VsZCBiZSBnaXZlbiBhIHNldCBvZiBjaXJjdW1zdGFuY2VzLiBUaGUgbGV2ZWxzLCBpbiBwcmlvcml0eSBvcmRlciwgYXJlOlxuICogLSBTZXR0aW5nTGV2ZWwuREVWSUNFICAgICAgICAgLSBWYWx1ZXMgYXJlIGRldGVybWluZWQgYnkgdGhlIGN1cnJlbnQgZGV2aWNlXG4gKiAtIFNldHRpbmdMZXZlbC5ST09NX0RFVklDRSAgICAtIFZhbHVlcyBhcmUgZGV0ZXJtaW5lZCBieSB0aGUgY3VycmVudCBkZXZpY2UgZm9yIGEgcGFydGljdWxhciByb29tXG4gKiAtIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlQgICAtIFZhbHVlcyBhcmUgZGV0ZXJtaW5lZCBieSB0aGUgY3VycmVudCBhY2NvdW50IGZvciBhIHBhcnRpY3VsYXIgcm9vbVxuICogLSBTZXR0aW5nTGV2ZWwuQUNDT1VOVCAgICAgICAgLSBWYWx1ZXMgYXJlIGRldGVybWluZWQgYnkgdGhlIGN1cnJlbnQgYWNjb3VudFxuICogLSBTZXR0aW5nTGV2ZWwuUk9PTSAgICAgICAgICAgLSBWYWx1ZXMgYXJlIGRldGVybWluZWQgYnkgYSBwYXJ0aWN1bGFyIHJvb20gKGJ5IHRoZSByb29tIGFkbWlucylcbiAqIC0gU2V0dGluZ0xldmVsLkNPTkZJRyAgICAgICAgIC0gVmFsdWVzIGFyZSBkZXRlcm1pbmVkIGJ5IHRoZSBjb25maWcuanNvblxuICogLSBTZXR0aW5nTGV2ZWwuREVGQVVMVCAgICAgICAgLSBWYWx1ZXMgYXJlIGRldGVybWluZWQgYnkgdGhlIGhhcmRjb2RlZCBkZWZhdWx0c1xuICpcbiAqIEVhY2ggbGV2ZWwgaGFzIGEgZGlmZmVyZW50IG1ldGhvZCB0byBzdG9yaW5nIHRoZSBzZXR0aW5nIHZhbHVlLiBGb3IgaW1wbGVtZW50YXRpb25cbiAqIHNwZWNpZmljIGRldGFpbHMsIHBsZWFzZSBzZWUgdGhlIGhhbmRsZXJzLiBUaGUgXCJjb25maWdcIiBhbmQgXCJkZWZhdWx0XCIgbGV2ZWxzIGFyZVxuICogYm90aCBhbHdheXMgc3VwcG9ydGVkIG9uIGFsbCBwbGF0Zm9ybXMuIEFsbCBvdGhlciBzZXR0aW5ncyBzaG91bGQgYmUgZ3VhcmRlZCBieVxuICogaXNMZXZlbFN1cHBvcnRlZCgpIHByaW9yIHRvIGF0dGVtcHRpbmcgdG8gc2V0IHRoZSB2YWx1ZS5cbiAqXG4gKiBTZXR0aW5ncyBjYW4gYWxzbyByZXByZXNlbnQgZmVhdHVyZXMuIEZlYXR1cmVzIGFyZSBzaWduaWZpY2FudCBwb3J0aW9ucyBvZiB0aGVcbiAqIGFwcGxpY2F0aW9uIHRoYXQgd2FycmFudCBhIGRlZGljYXRlZCBzZXR0aW5nIHRvIHRvZ2dsZSB0aGVtIG9uIG9yIG9mZi4gRmVhdHVyZXMgYXJlXG4gKiBzcGVjaWFsLWNhc2VkIHRvIGVuc3VyZSB0aGF0IHRoZWlyIHZhbHVlcyByZXNwZWN0IHRoZSBjb25maWd1cmF0aW9uIChmb3IgZXhhbXBsZSwgYVxuICogZmVhdHVyZSBtYXkgYmUgcmVwb3J0ZWQgYXMgZGlzYWJsZWQgZXZlbiB0aG91Z2ggYSB1c2VyIGhhcyBzcGVjaWZpY2FsbHkgcmVxdWVzdGVkIGl0XG4gKiBiZSBlbmFibGVkKS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0dGluZ3NTdG9yZSB7XG4gICAgLy8gV2Ugc3VwcG9ydCB3YXRjaGluZyBzZXR0aW5ncyBmb3IgY2hhbmdlcywgYW5kIGRvIHRoaXMgYnkgdHJhY2tpbmcgd2hpY2ggY2FsbGJhY2tzIGhhdmVcbiAgICAvLyBiZWVuIGdpdmVuIHRvIHVzLiBXZSBlbmQgdXAgcmV0dXJuaW5nIHRoZSBjYWxsYmFja1JlZiB0byB0aGUgY2FsbGVyIHNvIHRoZXkgY2FuIHVuc3Vic2NyaWJlXG4gICAgLy8gYXQgYSBsYXRlciBwb2ludC5cbiAgICAvL1xuICAgIC8vIFdlIGFsc28gbWFpbnRhaW4gYSBsaXN0IG9mIG1vbml0b3JzIHdoaWNoIGFyZSBzcGVjaWFsIHdhdGNoZXJzOiB0aGV5IGNhdXNlIGRpc3BhdGNoZXNcbiAgICAvLyB3aGVuIHRoZSBzZXR0aW5nIGNoYW5nZXMuIFdlIHRyYWNrIHdoaWNoIHJvb21zIHdlJ3JlIG1vbml0b3JpbmcgdGhvdWdoIHRvIGVuc3VyZSB3ZVxuICAgIC8vIGRvbid0IGR1cGxpY2F0ZSB1cGRhdGVzIG9uIHRoZSBidXMuXG4gICAgcHJpdmF0ZSBzdGF0aWMgd2F0Y2hlcnMgPSB7fTsgLy8geyBjYWxsYmFja1JlZiA9PiB7IGNhbGxiYWNrRm4gfSB9XG4gICAgcHJpdmF0ZSBzdGF0aWMgbW9uaXRvcnMgPSB7fTsgLy8geyBzZXR0aW5nTmFtZSA9PiB7IHJvb21JZCA9PiBjYWxsYmFja1JlZiB9IH1cblxuICAgIC8vIENvdW50ZXIgdXNlZCBmb3IgZ2VuZXJhdGlvbiBvZiB3YXRjaGVyIElEc1xuICAgIHByaXZhdGUgc3RhdGljIHdhdGNoZXJDb3VudCA9IDE7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFsbCB0aGUgZmVhdHVyZS1zdHlsZSBzZXR0aW5nIG5hbWVzLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gVGhlIG5hbWVzIG9mIHRoZSBmZWF0dXJlIHNldHRpbmdzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RmVhdHVyZVNldHRpbmdOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhTRVRUSU5HUykuZmlsdGVyKG4gPT4gU2V0dGluZ3NTdG9yZS5pc0ZlYXR1cmUobikpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgZm9yIGNoYW5nZXMgaW4gYSBwYXJ0aWN1bGFyIHNldHRpbmcuIFRoaXMgaXMgZG9uZSB3aXRob3V0IGFueSBsb2NhbCBlY2hvXG4gICAgICogd3JhcHBpbmcgYW5kIGZpcmVzIHdoZW5ldmVyIGEgY2hhbmdlIGlzIGRldGVjdGVkIGluIGEgc2V0dGluZydzIHZhbHVlLCBhdCBhbnkgbGV2ZWwuXG4gICAgICogV2F0Y2hpbmcgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBpbiBzY2VuYXJpb3Mgd2hlcmUgdGhlIGFwcCBuZWVkcyB0byByZWFjdCB0byBjaGFuZ2VzXG4gICAgICogbWFkZSBieSBvdGhlciBkZXZpY2VzLiBJdCBpcyBvdGhlcndpc2UgZXhwZWN0ZWQgdGhhdCBjYWxsZXJzIHdpbGwgYmUgYWJsZSB0byB1c2UgdGhlXG4gICAgICogQ29udHJvbGxlciBzeXN0ZW0gb3IgdHJhY2sgdGhlaXIgb3duIGNoYW5nZXMgdG8gc2V0dGluZ3MuIENhbGxlcnMgc2hvdWxkIHJldGFpbiB0aGVcbiAgICAgKiByZXR1cm5lZCByZWZlcmVuY2UgdG8gbGF0ZXIgdW5zdWJzY3JpYmUgZnJvbSB1cGRhdGVzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5nTmFtZSBUaGUgc2V0dGluZyBuYW1lIHRvIHdhdGNoXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBJRCB0byB3YXRjaCBmb3IgY2hhbmdlcyBpbi4gTWF5IGJlIG51bGwgZm9yICdhbGwnLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrRm4gQSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBhIHNldHRpbmcgY2hhbmdlIGlzXG4gICAgICogZGV0ZWN0ZWQuIEZpdmUgYXJndW1lbnRzIGNhbiBiZSBleHBlY3RlZDogdGhlIHNldHRpbmcgbmFtZSwgdGhlIHJvb20gSUQgKG1heSBiZSBudWxsKSxcbiAgICAgKiB0aGUgbGV2ZWwgdGhlIGNoYW5nZSBoYXBwZW5lZCBhdCwgdGhlIG5ldyB2YWx1ZSBhdCB0aGUgZ2l2ZW4gbGV2ZWwsIGFuZCBmaW5hbGx5IHRoZSBuZXdcbiAgICAgKiB2YWx1ZSBmb3IgdGhlIHNldHRpbmcgcmVnYXJkbGVzcyBvZiBsZXZlbC4gVGhlIGNhbGxiYWNrIGlzIHJlc3BvbnNpYmxlIGZvciBkZXRlcm1pbmluZ1xuICAgICAqIGlmIHRoZSBjaGFuZ2UgaW4gdmFsdWUgaXMgd29ydGh3aGlsZSBlbm91Z2ggdG8gcmVhY3QgdXBvbi5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBBIHJlZmVyZW5jZSB0byB0aGUgd2F0Y2hlciB0aGF0IHdhcyBlbXBsb3llZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHdhdGNoU2V0dGluZyhzZXR0aW5nTmFtZTogc3RyaW5nLCByb29tSWQ6IHN0cmluZywgY2FsbGJhY2tGbjogQ2FsbGJhY2tGbik6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHNldHRpbmcgPSBTRVRUSU5HU1tzZXR0aW5nTmFtZV07XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsU2V0dGluZ05hbWUgPSBzZXR0aW5nTmFtZTtcbiAgICAgICAgaWYgKCFzZXR0aW5nKSB0aHJvdyBuZXcgRXJyb3IoYCR7c2V0dGluZ05hbWV9IGlzIG5vdCBhIHNldHRpbmdgKTtcblxuICAgICAgICBpZiAoc2V0dGluZy5pbnZlcnRlZFNldHRpbmdOYW1lKSB7XG4gICAgICAgICAgICBzZXR0aW5nTmFtZSA9IHNldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdhdGNoZXJJZCA9IGAke25ldyBEYXRlKCkuZ2V0VGltZSgpfV8ke1NldHRpbmdzU3RvcmUud2F0Y2hlckNvdW50Kyt9XyR7c2V0dGluZ05hbWV9XyR7cm9vbUlkfWA7XG5cbiAgICAgICAgY29uc3QgbG9jYWxpemVkQ2FsbGJhY2sgPSAoY2hhbmdlZEluUm9vbUlkLCBhdExldmVsLCBuZXdWYWxBdExldmVsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUob3JpZ2luYWxTZXR0aW5nTmFtZSk7XG4gICAgICAgICAgICBjYWxsYmFja0ZuKG9yaWdpbmFsU2V0dGluZ05hbWUsIGNoYW5nZWRJblJvb21JZCwgYXRMZXZlbCwgbmV3VmFsQXRMZXZlbCwgbmV3VmFsdWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hlcnNbd2F0Y2hlcklkXSA9IGxvY2FsaXplZENhbGxiYWNrO1xuICAgICAgICBkZWZhdWx0V2F0Y2hNYW5hZ2VyLndhdGNoU2V0dGluZyhzZXR0aW5nTmFtZSwgcm9vbUlkLCBsb2NhbGl6ZWRDYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHdhdGNoZXJJZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyB0aGUgU2V0dGluZ3NTdG9yZSBmcm9tIHdhdGNoaW5nIGEgc2V0dGluZy4gVGhpcyBpcyBhIG5vLW9wIGlmIHRoZSB3YXRjaGVyXG4gICAgICogcHJvdmlkZWQgaXMgbm90IGZvdW5kLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVyUmVmZXJlbmNlIFRoZSB3YXRjaGVyIHJlZmVyZW5jZSAocmVjZWl2ZWQgZnJvbSAjd2F0Y2hTZXR0aW5nKVxuICAgICAqIHRvIGNhbmNlbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHVud2F0Y2hTZXR0aW5nKHdhdGNoZXJSZWZlcmVuY2U6IHN0cmluZykge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUud2F0Y2hlcnNbd2F0Y2hlclJlZmVyZW5jZV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRW5kaW5nIG5vbi1leGlzdGVudCB3YXRjaGVyIElEICR7d2F0Y2hlclJlZmVyZW5jZX1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHRXYXRjaE1hbmFnZXIudW53YXRjaFNldHRpbmcoU2V0dGluZ3NTdG9yZS53YXRjaGVyc1t3YXRjaGVyUmVmZXJlbmNlXSk7XG4gICAgICAgIGRlbGV0ZSBTZXR0aW5nc1N0b3JlLndhdGNoZXJzW3dhdGNoZXJSZWZlcmVuY2VdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgYSBtb25pdG9yIGZvciBhIHNldHRpbmcuIFRoaXMgYmVoYXZlcyBzaW1pbGFyIHRvICN3YXRjaFNldHRpbmcgZXhjZXB0IGluc3RlYWRcbiAgICAgKiBvZiBtYWtpbmcgYSBjYWxsIHRvIGEgY2FsbGJhY2ssIGl0IGZvcndhcmRzIGFsbCBjaGFuZ2VzIHRvIHRoZSBkaXNwYXRjaGVyLiBDYWxsZXJzIGNhblxuICAgICAqIGV4cGVjdCB0byBsaXN0ZW4gZm9yIHRoZSAnc2V0dGluZ191cGRhdGVkJyBhY3Rpb24gd2l0aCBhbiBvYmplY3QgY29udGFpbmluZyBzZXR0aW5nTmFtZSxcbiAgICAgKiByb29tSWQsIGxldmVsLCBuZXdWYWx1ZUF0TGV2ZWwsIGFuZCBuZXdWYWx1ZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIHNldHRpbmcgbmFtZSB0byBtb25pdG9yLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIHJvb20gSUQgdG8gbW9uaXRvciBmb3IgY2hhbmdlcyBpbi4gVXNlIG51bGwgZm9yIGFsbCByb29tcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vbml0b3JTZXR0aW5nKHNldHRpbmdOYW1lOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIHJvb21JZCA9IHJvb21JZCB8fCBudWxsOyAvLyB0aGUgdGhpbmcgd2FudHMgbnVsbCBzcGVjaWZpY2FsbHkgdG8gd29yaywgc28gYXBwZWFzZSBpdC5cblxuICAgICAgICBpZiAoIXRoaXMubW9uaXRvcnNbc2V0dGluZ05hbWVdKSB0aGlzLm1vbml0b3JzW3NldHRpbmdOYW1lXSA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHJlZ2lzdGVyV2F0Y2hlciA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubW9uaXRvcnNbc2V0dGluZ05hbWVdW3Jvb21JZF0gPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcbiAgICAgICAgICAgICAgICBzZXR0aW5nTmFtZSwgcm9vbUlkLCAoc2V0dGluZ05hbWUsIGluUm9vbUlkLCBsZXZlbCwgbmV3VmFsdWVBdExldmVsLCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnc2V0dGluZ191cGRhdGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiBpblJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVBdExldmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGhhc1Jvb20gPSBPYmplY3Qua2V5cyh0aGlzLm1vbml0b3JzW3NldHRpbmdOYW1lXSkuZmluZCgocikgPT4gciA9PT0gcm9vbUlkIHx8IHIgPT09IG51bGwpO1xuICAgICAgICBpZiAoIWhhc1Jvb20pIHtcbiAgICAgICAgICAgIHJlZ2lzdGVyV2F0Y2hlcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHJvb21JZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFVucmVnaXN0ZXIgYWxsIGV4aXN0aW5nIHdhdGNoZXJzIGFuZCByZWdpc3RlciB0aGUgbmV3IG9uZVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgcm9vbUlkIG9mIE9iamVjdC5rZXlzKHRoaXMubW9uaXRvcnNbc2V0dGluZ05hbWVdKSkge1xuICAgICAgICAgICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMubW9uaXRvcnNbc2V0dGluZ05hbWVdW3Jvb21JZF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm1vbml0b3JzW3NldHRpbmdOYW1lXSA9IHt9O1xuICAgICAgICAgICAgICAgIHJlZ2lzdGVyV2F0Y2hlcigpO1xuICAgICAgICAgICAgfSAvLyBlbHNlIGEgd2F0Y2hlciBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQgZm9yIHRoZSByb29tLCBzbyBkb24ndCBib3RoZXIgcmVnaXN0ZXJpbmcgaXQgYWdhaW5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHRyYW5zbGF0ZWQgZGlzcGxheSBuYW1lIGZvciBhIGdpdmVuIHNldHRpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIHNldHRpbmcgdG8gbG9vayB1cC5cbiAgICAgKiBAcGFyYW0ge1NldHRpbmdMZXZlbH0gYXRMZXZlbFxuICAgICAqIFRoZSBsZXZlbCB0byBnZXQgdGhlIGRpc3BsYXkgbmFtZSBmb3I7IERlZmF1bHRzIHRvICdkZWZhdWx0Jy5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBkaXNwbGF5IG5hbWUgZm9yIHRoZSBzZXR0aW5nLCBvciBudWxsIGlmIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldERpc3BsYXlOYW1lKHNldHRpbmdOYW1lOiBzdHJpbmcsIGF0TGV2ZWwgPSBTZXR0aW5nTGV2ZWwuREVGQVVMVCkge1xuICAgICAgICBpZiAoIVNFVFRJTkdTW3NldHRpbmdOYW1lXSB8fCAhU0VUVElOR1Nbc2V0dGluZ05hbWVdLmRpc3BsYXlOYW1lKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQgZGlzcGxheU5hbWUgPSBTRVRUSU5HU1tzZXR0aW5nTmFtZV0uZGlzcGxheU5hbWU7XG4gICAgICAgIGlmIChkaXNwbGF5TmFtZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgaWYgKGRpc3BsYXlOYW1lW2F0TGV2ZWxdKSBkaXNwbGF5TmFtZSA9IGRpc3BsYXlOYW1lW2F0TGV2ZWxdO1xuICAgICAgICAgICAgZWxzZSBkaXNwbGF5TmFtZSA9IGRpc3BsYXlOYW1lW1wiZGVmYXVsdFwiXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfdChkaXNwbGF5TmFtZSBhcyBzdHJpbmcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgaWYgYSBzZXR0aW5nIGlzIGFsc28gYSBmZWF0dXJlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5nTmFtZSBUaGUgc2V0dGluZyB0byBsb29rIHVwLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNldHRpbmcgaXMgYSBmZWF0dXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaXNGZWF0dXJlKHNldHRpbmdOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFTRVRUSU5HU1tzZXR0aW5nTmFtZV0pIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIFNFVFRJTkdTW3NldHRpbmdOYW1lXS5pc0ZlYXR1cmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBpZiBhIHNldHRpbmcgaXMgZW5hYmxlZC5cbiAgICAgKiBJZiBhIHNldHRpbmcgaXMgZGlzYWJsZWQgdGhlbiBpdCBzaG91bGQgYmUgaGlkZGVuIGZyb20gdGhlIHVzZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBzZXR0aW5nIHRvIGxvb2sgdXAuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc2V0dGluZyBpcyBlbmFibGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaXNFbmFibGVkKHNldHRpbmdOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFTRVRUSU5HU1tzZXR0aW5nTmFtZV0pIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIFNFVFRJTkdTW3NldHRpbmdOYW1lXS5jb250cm9sbGVyID8gIVNFVFRJTkdTW3NldHRpbmdOYW1lXS5jb250cm9sbGVyLnNldHRpbmdEaXNhYmxlZCA6IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzZXR0aW5nLiBUaGUgcm9vbSBJRCBpcyBvcHRpb25hbCBpZiB0aGUgc2V0dGluZyBpcyBub3QgdG9cbiAgICAgKiBiZSBhcHBsaWVkIHRvIGFueSBwYXJ0aWN1bGFyIHJvb20sIG90aGVyd2lzZSBpdCBzaG91bGQgYmUgc3VwcGxpZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBuYW1lIG9mIHRoZSBzZXR0aW5nIHRvIHJlYWQgdGhlIHZhbHVlIG9mLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIHJvb20gSUQgdG8gcmVhZCB0aGUgc2V0dGluZyB2YWx1ZSBpbiwgbWF5IGJlIG51bGwuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBleGNsdWRlRGVmYXVsdCBUcnVlIHRvIGRpc2FibGUgdXNpbmcgdGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIHZhbHVlLCBvciBudWxsIGlmIG5vdCBmb3VuZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmFsdWU8VCA9IGFueT4oc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcgPSBudWxsLCBleGNsdWRlRGVmYXVsdCA9IGZhbHNlKTogVCB7XG4gICAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBzZXR0aW5nIGlzIGFjdHVhbGx5IGEgc2V0dGluZ1xuICAgICAgICBpZiAoIVNFVFRJTkdTW3NldHRpbmdOYW1lXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyAnXCIgKyBzZXR0aW5nTmFtZSArIFwiJyBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBzZXR0aW5nLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNldHRpbmcgPSBTRVRUSU5HU1tzZXR0aW5nTmFtZV07XG4gICAgICAgIGNvbnN0IGxldmVsT3JkZXIgPSAoc2V0dGluZy5zdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkID8gc2V0dGluZy5zdXBwb3J0ZWRMZXZlbHMgOiBMRVZFTF9PUkRFUik7XG5cbiAgICAgICAgcmV0dXJuIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChsZXZlbE9yZGVyWzBdLCBzZXR0aW5nTmFtZSwgcm9vbUlkLCBmYWxzZSwgZXhjbHVkZURlZmF1bHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYSBzZXR0aW5nJ3MgdmFsdWUgYXQgYSBwYXJ0aWN1bGFyIGxldmVsLCBpZ25vcmluZyBhbGwgbGV2ZWxzIHRoYXQgYXJlIG1vcmUgc3BlY2lmaWMuXG4gICAgICogQHBhcmFtIHtTZXR0aW5nTGV2ZWx8XCJjb25maWdcInxcImRlZmF1bHRcIn0gbGV2ZWwgVGhlXG4gICAgICogbGV2ZWwgdG8gbG9vayBhdC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIG5hbWUgb2YgdGhlIHNldHRpbmcgdG8gcmVhZC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcm9vbUlkIFRoZSByb29tIElEIHRvIHJlYWQgdGhlIHNldHRpbmcgdmFsdWUgaW4sIG1heSBiZSBudWxsLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXhwbGljaXQgSWYgdHJ1ZSwgdGhpcyBtZXRob2Qgd2lsbCBub3QgY29uc2lkZXIgb3RoZXIgbGV2ZWxzLCBqdXN0IHRoZSBvbmVcbiAgICAgKiBwcm92aWRlZC4gRGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBleGNsdWRlRGVmYXVsdCBUcnVlIHRvIGRpc2FibGUgdXNpbmcgdGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIHZhbHVlLCBvciBudWxsIGlmIG5vdCBmb3VuZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldFZhbHVlQXQoXG4gICAgICAgIGxldmVsOiBTZXR0aW5nTGV2ZWwsXG4gICAgICAgIHNldHRpbmdOYW1lOiBzdHJpbmcsXG4gICAgICAgIHJvb21JZDogc3RyaW5nID0gbnVsbCxcbiAgICAgICAgZXhwbGljaXQgPSBmYWxzZSxcbiAgICAgICAgZXhjbHVkZURlZmF1bHQgPSBmYWxzZSxcbiAgICApOiBhbnkge1xuICAgICAgICAvLyBWZXJpZnkgdGhhdCB0aGUgc2V0dGluZyBpcyBhY3R1YWxseSBhIHNldHRpbmdcbiAgICAgICAgY29uc3Qgc2V0dGluZyA9IFNFVFRJTkdTW3NldHRpbmdOYW1lXTtcbiAgICAgICAgaWYgKCFzZXR0aW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nICdcIiArIHNldHRpbmdOYW1lICsgXCInIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHNldHRpbmcuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGV2ZWxPcmRlciA9IChzZXR0aW5nLnN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQgPyBzZXR0aW5nLnN1cHBvcnRlZExldmVscyA6IExFVkVMX09SREVSKTtcbiAgICAgICAgaWYgKCFsZXZlbE9yZGVyLmluY2x1ZGVzKFNldHRpbmdMZXZlbC5ERUZBVUxUKSkgbGV2ZWxPcmRlci5wdXNoKFNldHRpbmdMZXZlbC5ERUZBVUxUKTsgLy8gYWx3YXlzIGluY2x1ZGUgZGVmYXVsdFxuXG4gICAgICAgIGNvbnN0IG1pbkluZGV4ID0gbGV2ZWxPcmRlci5pbmRleE9mKGxldmVsKTtcbiAgICAgICAgaWYgKG1pbkluZGV4ID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKFwiTGV2ZWwgXCIgKyBsZXZlbCArIFwiIGlzIG5vdCBwcmlvcml0aXplZFwiKTtcblxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IFNldHRpbmdzU3RvcmUuZ2V0SGFuZGxlcnMoc2V0dGluZ05hbWUpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHdlIG5lZWQgdG8gaW52ZXJ0IHRoZSBzZXR0aW5nIGF0IGFsbC4gRG8gdGhpcyBhZnRlciB3ZSBnZXQgdGhlIHNldHRpbmdcbiAgICAgICAgLy8gaGFuZGxlcnMgdGhvdWdoLCBvdGhlcndpc2Ugd2UnbGwgZmFpbCB0byByZWFkIHRoZSB2YWx1ZS5cbiAgICAgICAgaWYgKHNldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZSkge1xuICAgICAgICAgICAgLy9jb25zb2xlLndhcm4oYEludmVydGluZyAke3NldHRpbmdOYW1lfSB0byBiZSAke3NldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZX0gLSBsZWdhY3kgc2V0dGluZ2ApO1xuICAgICAgICAgICAgc2V0dGluZ05hbWUgPSBzZXR0aW5nLmludmVydGVkU2V0dGluZ05hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhwbGljaXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBoYW5kbGVyc1tsZXZlbF07XG4gICAgICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gU2V0dGluZ3NTdG9yZS5nZXRGaW5hbFZhbHVlKHNldHRpbmcsIGxldmVsLCByb29tSWQsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBoYW5kbGVyLmdldFZhbHVlKHNldHRpbmdOYW1lLCByb29tSWQpO1xuICAgICAgICAgICAgcmV0dXJuIFNldHRpbmdzU3RvcmUuZ2V0RmluYWxWYWx1ZShzZXR0aW5nLCBsZXZlbCwgcm9vbUlkLCB2YWx1ZSwgbGV2ZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IG1pbkluZGV4OyBpIDwgbGV2ZWxPcmRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGhhbmRsZXJzW2xldmVsT3JkZXJbaV1dO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChleGNsdWRlRGVmYXVsdCAmJiBsZXZlbE9yZGVyW2ldID09PSBcImRlZmF1bHRcIikgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaGFuZGxlci5nZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBTZXR0aW5nc1N0b3JlLmdldEZpbmFsVmFsdWUoc2V0dGluZywgbGV2ZWwsIHJvb21JZCwgdmFsdWUsIGxldmVsT3JkZXJbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFNldHRpbmdzU3RvcmUuZ2V0RmluYWxWYWx1ZShzZXR0aW5nLCBsZXZlbCwgcm9vbUlkLCBudWxsLCBudWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkZWZhdWx0IHZhbHVlIG9mIGEgc2V0dGluZy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIG5hbWUgb2YgdGhlIHNldHRpbmcgdG8gcmVhZCB0aGUgdmFsdWUgb2YuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBJRCB0byByZWFkIHRoZSBzZXR0aW5nIHZhbHVlIGluLCBtYXkgYmUgbnVsbC5cbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgZGVmYXVsdCB2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGVmYXVsdFZhbHVlKHNldHRpbmdOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAvLyBWZXJpZnkgdGhhdCB0aGUgc2V0dGluZyBpcyBhY3R1YWxseSBhIHNldHRpbmdcbiAgICAgICAgaWYgKCFTRVRUSU5HU1tzZXR0aW5nTmFtZV0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldHRpbmcgJ1wiICsgc2V0dGluZ05hbWUgKyBcIicgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgc2V0dGluZy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gU0VUVElOR1Nbc2V0dGluZ05hbWVdLmRlZmF1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0RmluYWxWYWx1ZShcbiAgICAgICAgc2V0dGluZzogSVNldHRpbmcsXG4gICAgICAgIGxldmVsOiBTZXR0aW5nTGV2ZWwsXG4gICAgICAgIHJvb21JZDogc3RyaW5nLFxuICAgICAgICBjYWxjdWxhdGVkVmFsdWU6IGFueSxcbiAgICAgICAgY2FsY3VsYXRlZEF0TGV2ZWw6IFNldHRpbmdMZXZlbCxcbiAgICApOiBhbnkge1xuICAgICAgICBsZXQgcmVzdWx0aW5nVmFsdWUgPSBjYWxjdWxhdGVkVmFsdWU7XG5cbiAgICAgICAgaWYgKHNldHRpbmcuY29udHJvbGxlcikge1xuICAgICAgICAgICAgY29uc3QgYWN0dWFsVmFsdWUgPSBzZXR0aW5nLmNvbnRyb2xsZXIuZ2V0VmFsdWVPdmVycmlkZShsZXZlbCwgcm9vbUlkLCBjYWxjdWxhdGVkVmFsdWUsIGNhbGN1bGF0ZWRBdExldmVsKTtcbiAgICAgICAgICAgIGlmIChhY3R1YWxWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIGFjdHVhbFZhbHVlICE9PSBudWxsKSByZXN1bHRpbmdWYWx1ZSA9IGFjdHVhbFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZSkgcmVzdWx0aW5nVmFsdWUgPSAhcmVzdWx0aW5nVmFsdWU7XG4gICAgICAgIHJldHVybiByZXN1bHRpbmdWYWx1ZTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSB2YWxpZC1qc2RvYyAqLyAvL2h0dHBzOi8vZ2l0aHViLmNvbS9lc2xpbnQvZXNsaW50L2lzc3Vlcy83MzA3XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdmFsdWUgZm9yIGEgc2V0dGluZy4gVGhlIHJvb20gSUQgaXMgb3B0aW9uYWwgaWYgdGhlIHNldHRpbmcgaXMgbm90IGJlaW5nXG4gICAgICogc2V0IGZvciBhIHBhcnRpY3VsYXIgcm9vbSwgb3RoZXJ3aXNlIGl0IHNob3VsZCBiZSBzdXBwbGllZC4gVGhlIHZhbHVlIG1heSBiZSBudWxsXG4gICAgICogdG8gaW5kaWNhdGUgdGhhdCB0aGUgbGV2ZWwgc2hvdWxkIG5vIGxvbmdlciBoYXZlIGFuIG92ZXJyaWRlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5nTmFtZSBUaGUgbmFtZSBvZiB0aGUgc2V0dGluZyB0byBjaGFuZ2UuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBJRCB0byBjaGFuZ2UgdGhlIHZhbHVlIGluLCBtYXkgYmUgbnVsbC5cbiAgICAgKiBAcGFyYW0ge1NldHRpbmdMZXZlbH0gbGV2ZWwgVGhlIGxldmVsXG4gICAgICogdG8gY2hhbmdlIHRoZSB2YWx1ZSBhdC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBuZXcgdmFsdWUgb2YgdGhlIHNldHRpbmcsIG1heSBiZSBudWxsLlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIHNldHRpbmcgaGFzIGJlZW4gY2hhbmdlZC5cbiAgICAgKi9cblxuICAgIC8qIGVzbGludC1lbmFibGUgdmFsaWQtanNkb2MgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHNldFZhbHVlKHNldHRpbmdOYW1lOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nLCBsZXZlbDogU2V0dGluZ0xldmVsLCB2YWx1ZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBzZXR0aW5nIGlzIGFjdHVhbGx5IGEgc2V0dGluZ1xuICAgICAgICBjb25zdCBzZXR0aW5nID0gU0VUVElOR1Nbc2V0dGluZ05hbWVdO1xuICAgICAgICBpZiAoIXNldHRpbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldHRpbmcgJ1wiICsgc2V0dGluZ05hbWUgKyBcIicgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGEgc2V0dGluZy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYW5kbGVyID0gU2V0dGluZ3NTdG9yZS5nZXRIYW5kbGVyKHNldHRpbmdOYW1lLCBsZXZlbCk7XG4gICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyBcIiArIHNldHRpbmdOYW1lICsgXCIgZG9lcyBub3QgaGF2ZSBhIGhhbmRsZXIgZm9yIFwiICsgbGV2ZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZSkge1xuICAgICAgICAgICAgLy8gTm90ZTogV2UgY2FuJ3QgZG8gdGhpcyB3aGVuIHRoZSBgbGV2ZWxgIGlzIFwiZGVmYXVsdFwiLCBob3dldmVyIHdlIGFsc29cbiAgICAgICAgICAgIC8vIGtub3cgdGhhdCB0aGUgdXNlciBjYW4ndCBwb3NzaWJsZSBjaGFuZ2UgdGhlIGRlZmF1bHQgdmFsdWUgdGhyb3VnaCB0aGlzXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBzbyB3ZSBkb24ndCBib3RoZXIgY2hlY2tpbmcgaXQuXG4gICAgICAgICAgICAvL2NvbnNvbGUud2FybihgSW52ZXJ0aW5nICR7c2V0dGluZ05hbWV9IHRvIGJlICR7c2V0dGluZy5pbnZlcnRlZFNldHRpbmdOYW1lfSAtIGxlZ2FjeSBzZXR0aW5nYCk7XG4gICAgICAgICAgICBzZXR0aW5nTmFtZSA9IHNldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZTtcbiAgICAgICAgICAgIHZhbHVlID0gIXZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYW5kbGVyLmNhblNldFZhbHVlKHNldHRpbmdOYW1lLCByb29tSWQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc2VyIGNhbm5vdCBzZXQgXCIgKyBzZXR0aW5nTmFtZSArIFwiIGF0IFwiICsgbGV2ZWwgKyBcIiBpbiBcIiArIHJvb21JZCk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBoYW5kbGVyLnNldFZhbHVlKHNldHRpbmdOYW1lLCByb29tSWQsIHZhbHVlKTtcblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gc2V0dGluZy5jb250cm9sbGVyO1xuICAgICAgICBpZiAoY29udHJvbGxlcikge1xuICAgICAgICAgICAgY29udHJvbGxlci5vbkNoYW5nZShsZXZlbCwgcm9vbUlkLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgcGVybWl0dGVkIHRvIHNldCB0aGUgZ2l2ZW4gc2V0dGluZyBhdCB0aGUgZ2l2ZW5cbiAgICAgKiBsZXZlbCBmb3IgYSBwYXJ0aWN1bGFyIHJvb20uIFRoZSByb29tIElEIGlzIG9wdGlvbmFsIGlmIHRoZSBzZXR0aW5nIGlzIG5vdCBiZWluZ1xuICAgICAqIHNldCBmb3IgYSBwYXJ0aWN1bGFyIHJvb20sIG90aGVyd2lzZSBpdCBzaG91bGQgYmUgc3VwcGxpZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBuYW1lIG9mIHRoZSBzZXR0aW5nIHRvIGNoZWNrLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIHJvb20gSUQgdG8gY2hlY2sgaW4sIG1heSBiZSBudWxsLlxuICAgICAqIEBwYXJhbSB7U2V0dGluZ0xldmVsfSBsZXZlbCBUaGUgbGV2ZWwgdG9cbiAgICAgKiBjaGVjayBhdC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSB1c2VyIG1heSBzZXQgdGhlIHNldHRpbmcsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNhblNldFZhbHVlKHNldHRpbmdOYW1lOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nLCBsZXZlbDogU2V0dGluZ0xldmVsKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBzZXR0aW5nIGlzIGFjdHVhbGx5IGEgc2V0dGluZ1xuICAgICAgICBpZiAoIVNFVFRJTkdTW3NldHRpbmdOYW1lXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyAnXCIgKyBzZXR0aW5nTmFtZSArIFwiJyBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBzZXR0aW5nLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gZmVhdHVyZXMgYXJlIHNwZWNpZmllZCBpbiB0aGUgY29uZmlnLmpzb24sIHdlIGZvcmNlIHRoZW0gYXMgZW5hYmxlZCBvciBkaXNhYmxlZC5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuaXNGZWF0dXJlKHNldHRpbmdOYW1lKSkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnVmFsID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFNldHRpbmdMZXZlbC5DT05GSUcsIHNldHRpbmdOYW1lLCByb29tSWQsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ1ZhbCA9PT0gdHJ1ZSB8fCBjb25maWdWYWwgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYW5kbGVyID0gU2V0dGluZ3NTdG9yZS5nZXRIYW5kbGVyKHNldHRpbmdOYW1lLCBsZXZlbCk7XG4gICAgICAgIGlmICghaGFuZGxlcikgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gaGFuZGxlci5jYW5TZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBnaXZlbiBsZXZlbCBpcyBzdXBwb3J0ZWQgb24gdGhpcyBkZXZpY2UuXG4gICAgICogQHBhcmFtIHtTZXR0aW5nTGV2ZWx9IGxldmVsIFRoZSBsZXZlbFxuICAgICAqIHRvIGNoZWNrIHRoZSBmZWFzaWJpbGl0eSBvZi5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBsZXZlbCBpcyBzdXBwb3J0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGlzTGV2ZWxTdXBwb3J0ZWQobGV2ZWw6IFNldHRpbmdMZXZlbCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIUxFVkVMX0hBTkRMRVJTW2xldmVsXSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gTEVWRUxfSEFORExFUlNbbGV2ZWxdLmlzU3VwcG9ydGVkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgZmlyc3Qgc3VwcG9ydGVkIGxldmVsIG91dCBvZiBhbGwgdGhlIGxldmVscyB0aGF0IGNhbiBiZSB1c2VkIGZvciBhXG4gICAgICogc3BlY2lmaWMgc2V0dGluZy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIHNldHRpbmcgbmFtZS5cbiAgICAgKiBAcmV0dXJuIHtTZXR0aW5nTGV2ZWx9XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmaXJzdFN1cHBvcnRlZExldmVsKHNldHRpbmdOYW1lOiBzdHJpbmcpOiBTZXR0aW5nTGV2ZWwge1xuICAgICAgICAvLyBWZXJpZnkgdGhhdCB0aGUgc2V0dGluZyBpcyBhY3R1YWxseSBhIHNldHRpbmdcbiAgICAgICAgY29uc3Qgc2V0dGluZyA9IFNFVFRJTkdTW3NldHRpbmdOYW1lXTtcbiAgICAgICAgaWYgKCFzZXR0aW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nICdcIiArIHNldHRpbmdOYW1lICsgXCInIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHNldHRpbmcuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGV2ZWxPcmRlciA9IChzZXR0aW5nLnN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQgPyBzZXR0aW5nLnN1cHBvcnRlZExldmVscyA6IExFVkVMX09SREVSKTtcbiAgICAgICAgaWYgKCFsZXZlbE9yZGVyLmluY2x1ZGVzKFNldHRpbmdMZXZlbC5ERUZBVUxUKSkgbGV2ZWxPcmRlci5wdXNoKFNldHRpbmdMZXZlbC5ERUZBVUxUKTsgLy8gYWx3YXlzIGluY2x1ZGUgZGVmYXVsdFxuXG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gU2V0dGluZ3NTdG9yZS5nZXRIYW5kbGVycyhzZXR0aW5nTmFtZSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBsZXZlbCBvZiBsZXZlbE9yZGVyKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnNbbGV2ZWxdO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBsZXZlbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWJ1Z2dpbmcgZnVuY3Rpb24gZm9yIHJlYWRpbmcgZXhwbGljaXQgc2V0dGluZyB2YWx1ZXMgd2l0aG91dCBnb2luZyB0aHJvdWdoIHRoZVxuICAgICAqIGNvbXBsaWNhdGVkL2JpYXNlZCBmdW5jdGlvbnMgaW4gdGhlIFNldHRpbmdzU3RvcmUuIFRoaXMgd2lsbCBwcmludCBpbmZvcm1hdGlvbiB0b1xuICAgICAqIHRoZSBjb25zb2xlIGZvciBhbmFseXNpcy4gTm90IGludGVuZGVkIHRvIGJlIHVzZWQgd2l0aGluIHRoZSBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVhbFNldHRpbmdOYW1lIFRoZSBzZXR0aW5nIG5hbWUgdG8gdHJ5IGFuZCByZWFkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb29tSWQgT3B0aW9uYWwgcm9vbSBJRCB0byB0ZXN0IHRoZSBzZXR0aW5nIGluLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGVidWdTZXR0aW5nKHJlYWxTZXR0aW5nTmFtZTogc3RyaW5nLCByb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zb2xlLmxvZyhgLS0tIERFQlVHICR7cmVhbFNldHRpbmdOYW1lfWApO1xuXG4gICAgICAgIC8vIE5vdGU6IHdlIGludGVudGlvbmFsbHkgdXNlIEpTT04uc3RyaW5naWZ5IGhlcmUgdG8gYXZvaWQgdGhlIGNvbnNvbGUgbWFza2luZyB0aGVcbiAgICAgICAgLy8gcHJvYmxlbSBpZiB0aGVyZSdzIGEgdHlwZSByZXByZXNlbnRhdGlvbiBpc3N1ZS4gQWxzbywgdGhpcyB3YXkgaXQgaXMgZ3VhcmFudGVlZFxuICAgICAgICAvLyB0byBzaG93IHVwIGluIGEgcmFnZXNoYWtlIGlmIHJlcXVpcmVkLlxuXG4gICAgICAgIGNvbnN0IGRlZiA9IFNFVFRJTkdTW3JlYWxTZXR0aW5nTmFtZV07XG4gICAgICAgIGNvbnNvbGUubG9nKGAtLS0gZGVmaW5pdGlvbjogJHtkZWYgPyBKU09OLnN0cmluZ2lmeShkZWYpIDogJzxOT1RfRk9VTkQ+J31gKTtcbiAgICAgICAgY29uc29sZS5sb2coYC0tLSBkZWZhdWx0IGxldmVsIG9yZGVyOiAke0pTT04uc3RyaW5naWZ5KExFVkVMX09SREVSKX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYC0tLSByZWdpc3RlcmVkIGhhbmRsZXJzOiAke0pTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKExFVkVMX0hBTkRMRVJTKSl9YCk7XG5cbiAgICAgICAgY29uc3QgZG9DaGVja3MgPSAoc2V0dGluZ05hbWUpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaGFuZGxlck5hbWUgb2YgT2JqZWN0LmtleXMoTEVWRUxfSEFORExFUlMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IExFVkVMX0hBTkRMRVJTW2hhbmRsZXJOYW1lXTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaGFuZGxlci5nZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0tLSAgICAgJHtoYW5kbGVyTmFtZX1AJHtyb29tSWQgfHwgJzxub19yb29tPid9ID0gJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgLS0tICAgICAke2hhbmRsZXJ9QCR7cm9vbUlkIHx8ICc8bm9fcm9vbT4nfSBUSFJFVyBFUlJPUjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBoYW5kbGVyLmdldFZhbHVlKHNldHRpbmdOYW1lLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtLS0gICAgICR7aGFuZGxlck5hbWV9QDxub19yb29tPiA9ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgLS0tICAgICAke2hhbmRsZXJ9QDxub19yb29tPiBUSFJFVyBFUlJPUjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgLS0tIGNhbGN1bGF0aW5nIGFzIHJldHVybmVkIGJ5IFNldHRpbmdzU3RvcmVgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtLS0gdGhlc2UgbWlnaHQgbm90IG1hdGNoIGlmIHRoZSBzZXR0aW5nIHVzZXMgYSBjb250cm9sbGVyIC0gYmUgd2FybmVkIWApO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgLS0tICAgICBTZXR0aW5nc1N0b3JlI2dlbmVyaWNAJHtyb29tSWQgfHwgJzxub19yb29tPid9ICA9ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtLS0gICAgIFNldHRpbmdzU3RvcmUjZ2VuZXJpY0Ake3Jvb21JZCB8fCAnPG5vX3Jvb20+J30gVEhSRVcgRVJST1I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyb29tSWQpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoc2V0dGluZ05hbWUsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgLS0tICAgICBTZXR0aW5nc1N0b3JlI2dlbmVyaWNAPG5vX3Jvb20+ICA9ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSNnZW5lcmljQCQ8bm9fcm9vbT4gVEhSRVcgRVJST1I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCBsZXZlbCBvZiBMRVZFTF9PUkRFUikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KGxldmVsLCBzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSMke2xldmVsfUAke3Jvb21JZCB8fCAnPG5vX3Jvb20+J30gPSAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtLS0gICAgIFNldHRpbmdzU3RvcmUjJHtsZXZlbH1AJHtyb29tSWQgfHwgJzxub19yb29tPid9IFRIUkVXIEVSUk9SOiAke2UubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChsZXZlbCwgc2V0dGluZ05hbWUsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSMke2xldmVsfUA8bm9fcm9vbT4gPSAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSMke2xldmVsfUAkPG5vX3Jvb20+IFRIUkVXIEVSUk9SOiAke2UubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZG9DaGVja3MocmVhbFNldHRpbmdOYW1lKTtcblxuICAgICAgICBpZiAoZGVmLmludmVydGVkU2V0dGluZ05hbWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtLS0gVEVTVElORyBJTlZFUlRFRCBTRVRUSU5HIE5BTUVgKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtLS0gaW52ZXJ0ZWQ6ICR7ZGVmLmludmVydGVkU2V0dGluZ05hbWV9YCk7XG4gICAgICAgICAgICBkb0NoZWNrcyhkZWYuaW52ZXJ0ZWRTZXR0aW5nTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgLS0tIEVORCBERUJVR2ApO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldEhhbmRsZXIoc2V0dGluZ05hbWU6IHN0cmluZywgbGV2ZWw6IFNldHRpbmdMZXZlbCk6IFNldHRpbmdzSGFuZGxlciB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gU2V0dGluZ3NTdG9yZS5nZXRIYW5kbGVycyhzZXR0aW5nTmFtZSk7XG4gICAgICAgIGlmICghaGFuZGxlcnNbbGV2ZWxdKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJzW2xldmVsXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRIYW5kbGVycyhzZXR0aW5nTmFtZTogc3RyaW5nKTogSUhhbmRsZXJNYXAge1xuICAgICAgICBpZiAoIVNFVFRJTkdTW3NldHRpbmdOYW1lXSkgcmV0dXJuIHt9O1xuXG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgU0VUVElOR1Nbc2V0dGluZ05hbWVdLnN1cHBvcnRlZExldmVscykge1xuICAgICAgICAgICAgaWYgKCFMRVZFTF9IQU5ETEVSU1tsZXZlbF0pIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgbGV2ZWwgXCIgKyBsZXZlbCk7XG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5pc0xldmVsU3VwcG9ydGVkKGxldmVsKSkgaGFuZGxlcnNbbGV2ZWxdID0gTEVWRUxfSEFORExFUlNbbGV2ZWxdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWx3YXlzIHN1cHBvcnQgJ2RlZmF1bHQnXG4gICAgICAgIGlmICghaGFuZGxlcnNbJ2RlZmF1bHQnXSkgaGFuZGxlcnNbJ2RlZmF1bHQnXSA9IExFVkVMX0hBTkRMRVJTWydkZWZhdWx0J107XG5cbiAgICAgICAgcmV0dXJuIGhhbmRsZXJzO1xuICAgIH1cbn1cblxuLy8gRm9yIGRlYnVnZ2luZyBwdXJwb3Nlc1xud2luZG93Lm14U2V0dGluZ3NTdG9yZSA9IFNldHRpbmdzU3RvcmU7XG4iXX0=