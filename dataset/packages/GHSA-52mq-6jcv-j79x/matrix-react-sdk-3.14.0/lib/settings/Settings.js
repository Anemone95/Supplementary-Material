"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SETTINGS = void 0;

var _client = require("matrix-js-sdk/src/client");

var _languageHandler = require("../languageHandler");

var _NotificationControllers = require("./controllers/NotificationControllers");

var _CustomStatusController = _interopRequireDefault(require("./controllers/CustomStatusController"));

var _ThemeController = _interopRequireDefault(require("./controllers/ThemeController"));

var _PushToMatrixClientController = _interopRequireDefault(require("./controllers/PushToMatrixClientController"));

var _ReloadOnChangeController = _interopRequireDefault(require("./controllers/ReloadOnChangeController"));

var _FontSizeController = _interopRequireDefault(require("./controllers/FontSizeController"));

var _SystemFontController = _interopRequireDefault(require("./controllers/SystemFontController"));

var _UseSystemFontController = _interopRequireDefault(require("./controllers/UseSystemFontController"));

var _SettingLevel = require("./SettingLevel");

var _RightPanelStorePhases = require("../stores/RightPanelStorePhases");

var _Keyboard = require("../Keyboard");

var _UIFeatureController = _interopRequireDefault(require("./controllers/UIFeatureController"));

var _UIFeature = require("./UIFeature");

var _OrderedMultiController = require("./controllers/OrderedMultiController");

/*
Copyright 2017 Travis Ralston
Copyright 2018, 2019, 2020 The Matrix.org Foundation C.I.C.

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
// These are just a bunch of helper arrays to avoid copy/pasting a bunch of times
const LEVELS_ROOM_SETTINGS = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_ROOM_OR_ACCOUNT = [_SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT];
const LEVELS_ROOM_SETTINGS_WITH_ROOM = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.CONFIG, _SettingLevel.SettingLevel.ROOM];
const LEVELS_ACCOUNT_SETTINGS = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_FEATURE = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_DEVICE_ONLY_SETTINGS = [_SettingLevel.SettingLevel.DEVICE];
const LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.CONFIG];
const LEVELS_UI_FEATURE = [_SettingLevel.SettingLevel.CONFIG // in future we might have a .well-known level or something
];
/*:: export interface ISetting {
    // Must be set to true for features. Default is 'false'.
    isFeature?: boolean;

    // Display names are strongly recommended for clarity.
    // Display name can also be an object for different levels.
    displayName?: string | {
        // @ts-ignore - TS wants the key to be a string, but we know better
        [level: SettingLevel]: string;
    };

    // The supported levels are required. Preferably, use the preset arrays
    // at the top of this file to define this rather than a custom array.
    supportedLevels?: SettingLevel[];

    // Required. Can be any data type. The value specified here should match
    // the data being stored (ie: if a boolean is used, the setting should
    // represent a boolean).
    default: any;

    // Optional settings controller. See SettingsController for more information.
    controller?: SettingController;

    // Optional flag to make supportedLevels be respected as the order to handle
    // settings. The first element is treated as "most preferred". The "default"
    // level is always appended to the end.
    supportedLevelsAreOrdered?: boolean;

    // Optional value to invert a boolean setting's value. The string given will
    // be read as the setting's ID instead of the one provided as the key for the
    // setting definition. By setting this, the returned value will automatically
    // be inverted, except for when the default value is returned. Inversion will
    // occur after the controller is asked for an override. This should be used by
    // historical settings which we don't want existing user's values be wiped. Do
    // not use this for new settings.
    invertedSettingName?: string;
}*/

const SETTINGS
/*: {[setting: string]: ISetting}*/
= {
  "feature_latex_maths": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Render LaTeX maths in messages"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_communities_v2_prototypes": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Communities v2 prototypes. Requires compatible homeserver. " + "Highly experimental - use with caution."),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_new_spinner": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("New spinner design"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_pinning": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Message Pinning"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_custom_status": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Custom user status messages"),
    supportedLevels: LEVELS_FEATURE,
    default: false,
    controller: new _CustomStatusController.default()
  },
  "feature_custom_tags": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Group & filter rooms by custom tags (refresh to apply changes)"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_state_counters": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Render simple counters in room header"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_many_integration_managers": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Multiple integration managers"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_mjolnir": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Try out new ways to ignore people (experimental)"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_custom_themes": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Support adding custom themes"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_roomlist_preview_reactions_dms": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Show message previews for reactions in DMs"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_roomlist_preview_reactions_all": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Show message previews for reactions in all rooms"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_dehydration": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Offline encrypted messaging using dehydrated devices"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "advancedRoomListLogging": {
    // TODO: Remove flag before launch: https://github.com/vector-im/element-web/issues/14231
    displayName: (0, _languageHandler._td)("Enable advanced debugging for the room list"),
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "mjolnirRooms": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "mjolnirPersonalRoom": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: null
  },
  "feature_bridge_state": {
    isFeature: true,
    supportedLevels: LEVELS_FEATURE,
    displayName: (0, _languageHandler._td)("Show info about bridges in room settings"),
    default: false
  },
  "RoomList.backgroundImage": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: null
  },
  "baseFontSize": {
    displayName: (0, _languageHandler._td)("Font size"),
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: 10,
    controller: new _FontSizeController.default()
  },
  "useCustomFontSize": {
    displayName: (0, _languageHandler._td)("Use custom size"),
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "MessageComposerInput.suggestEmoji": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable Emoji suggestions while typing'),
    default: true,
    invertedSettingName: 'MessageComposerInput.dontSuggestEmoji'
  },
  "MessageComposerInput.showStickersButton": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show stickers button'),
    default: true
  },
  // TODO: Wire up appropriately to UI (FTUE notifications)
  "Notifications.alwaysShowBadgeCounts": {
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: false
  },
  "useCompactLayout": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)('Use a more compact ‘Modern’ layout'),
    default: false
  },
  "showRedactions": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show a placeholder for removed messages'),
    default: true,
    invertedSettingName: 'hideRedactions'
  },
  "showJoinLeaves": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show join/leave messages (invites/kicks/bans unaffected)'),
    default: true,
    invertedSettingName: 'hideJoinLeaves'
  },
  "showAvatarChanges": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show avatar changes'),
    default: true,
    invertedSettingName: 'hideAvatarChanges'
  },
  "showDisplaynameChanges": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)('Show display name changes'),
    default: true,
    invertedSettingName: 'hideDisplaynameChanges'
  },
  "showReadReceipts": {
    supportedLevels: LEVELS_ROOM_SETTINGS,
    displayName: (0, _languageHandler._td)('Show read receipts sent by other users'),
    default: true,
    invertedSettingName: 'hideReadReceipts'
  },
  "showTwelveHourTimestamps": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show timestamps in 12 hour format (e.g. 2:30pm)'),
    default: false
  },
  "alwaysShowTimestamps": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Always show message timestamps'),
    default: false
  },
  "autoplayGifsAndVideos": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Autoplay GIFs and videos'),
    default: false
  },
  "enableSyntaxHighlightLanguageDetection": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable automatic language detection for syntax highlighting'),
    default: false
  },
  "expandCodeByDefault": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Expand code blocks by default'),
    default: false
  },
  "showCodeLineNumbers": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show line numbers in code blocks'),
    default: true
  },
  "Pill.shouldShowPillAvatar": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show avatars in user and room mentions'),
    default: true,
    invertedSettingName: 'Pill.shouldHidePillAvatar'
  },
  "TextualBody.enableBigEmoji": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable big emoji in chat'),
    default: true,
    invertedSettingName: 'TextualBody.disableBigEmoji'
  },
  "MessageComposerInput.isRichTextEnabled": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "MessageComposer.showFormatting": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: false
  },
  "sendTypingNotifications": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Send typing notifications"),
    default: true,
    invertedSettingName: 'dontSendTypingNotifications'
  },
  "showTypingNotifications": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show typing notifications"),
    default: true
  },
  "ctrlFForSearch": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: _Keyboard.isMac ? (0, _languageHandler._td)("Use Command + F to search") : (0, _languageHandler._td)("Use Ctrl + F to search"),
    default: false
  },
  "MessageComposerInput.ctrlEnterToSend": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: _Keyboard.isMac ? (0, _languageHandler._td)("Use Command + Enter to send a message") : (0, _languageHandler._td)("Use Ctrl + Enter to send a message"),
    default: false
  },
  "MessageComposerInput.autoReplaceEmoji": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Automatically replace plain text Emoji'),
    default: false
  },
  "VideoView.flipVideoHorizontally": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Mirror local video feed'),
    default: false
  },
  "TagPanel.enableTagPanel": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable Community Filter Panel'),
    default: true,
    invertedSettingName: 'TagPanel.disableTagPanel',
    // We force the value to true because the invertedSettingName causes it to flip
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.Communities, true)
  },
  "theme": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: "light",
    controller: new _ThemeController.default()
  },
  "custom_themes": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: []
  },
  "use_system_theme": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: true,
    displayName: (0, _languageHandler._td)("Match system theme")
  },
  "useSystemFont": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false,
    displayName: (0, _languageHandler._td)("Use a system font"),
    controller: new _UseSystemFontController.default()
  },
  "systemFont": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: "",
    displayName: (0, _languageHandler._td)("System font name"),
    controller: new _SystemFontController.default()
  },
  "webRtcAllowPeerToPeer": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    displayName: (0, _languageHandler._td)('Allow Peer-to-Peer for 1:1 calls'),
    default: true,
    invertedSettingName: 'webRtcForceTURN'
  },
  "webrtc_audiooutput": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: null
  },
  "webrtc_audioinput": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: null
  },
  "webrtc_videoinput": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: null
  },
  "language": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: "en"
  },
  "breadcrumb_rooms": {
    // not really a setting
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "recent_emoji": {
    // not really a setting
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "room_directory_servers": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: []
  },
  "integrationProvisioning": {
    supportedLevels: [_SettingLevel.SettingLevel.ACCOUNT],
    default: true
  },
  "allowedWidgets": {
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ROOM_DEVICE],
    supportedLevelsAreOrdered: true,
    default: {} // none allowed

  },
  "analyticsOptIn": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    displayName: (0, _languageHandler._td)('Send analytics data'),
    default: false
  },
  "showCookieBar": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: true
  },
  "autocompleteDelay": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: 200
  },
  "readMarkerInViewThresholdMs": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: 3000
  },
  "readMarkerOutOfViewThresholdMs": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: 30000
  },
  "blacklistUnverifiedDevices": {
    // We specifically want to have room-device > device so that users may set a device default
    // with a per-room override.
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.DEVICE],
    supportedLevelsAreOrdered: true,
    displayName: {
      "default": (0, _languageHandler._td)('Never send encrypted messages to unverified sessions from this session'),
      "room-device": (0, _languageHandler._td)('Never send encrypted messages to unverified sessions in this room from this session')
    },
    default: false,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.AdvancedEncryption)
  },
  "urlPreviewsEnabled": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: {
      "default": (0, _languageHandler._td)('Enable inline URL previews by default'),
      "room-account": (0, _languageHandler._td)("Enable URL previews for this room (only affects you)"),
      "room": (0, _languageHandler._td)("Enable URL previews by default for participants in this room")
    },
    default: true,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.URLPreviews)
  },
  "urlPreviewsEnabled_e2ee": {
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT],
    displayName: {
      "room-account": (0, _languageHandler._td)("Enable URL previews for this room (only affects you)")
    },
    default: false,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.URLPreviews)
  },
  "roomColor": {
    supportedLevels: LEVELS_ROOM_SETTINGS_WITH_ROOM,
    displayName: (0, _languageHandler._td)("Room Colour"),
    default: {
      primary_color: null,
      // Hex string, eg: #000000
      secondary_color: null // Hex string, eg: #000000

    }
  },
  "notificationsEnabled": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false,
    controller: new _NotificationControllers.NotificationsEnabledController()
  },
  "notificationSound": {
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: false
  },
  "notificationBodyEnabled": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: true,
    controller: new _NotificationControllers.NotificationBodyEnabledController()
  },
  "audioNotificationsEnabled": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: true
  },
  "enableWidgetScreenshots": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Enable widget screenshots on supported widgets'),
    default: false
  },
  "PinnedEvents.isOpen": {
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE],
    default: false
  },
  "promptBeforeInviteUnknownUsers": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Prompt before sending invites to potentially invalid matrix IDs'),
    default: true
  },
  "showDeveloperTools": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Show developer tools'),
    default: false
  },
  "widgetOpenIDPermissions": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: {
      allow: [],
      deny: []
    }
  },
  // TODO: Remove setting: https://github.com/vector-im/element-web/issues/14373
  "RoomList.orderAlphabetically": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Order rooms by name"),
    default: false
  },
  // TODO: Remove setting: https://github.com/vector-im/element-web/issues/14373
  "RoomList.orderByImportance": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show rooms with unread notifications first"),
    default: true
  },
  "breadcrumbs": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show shortcuts to recently viewed rooms above the room list"),
    default: true
  },
  "showHiddenEventsInTimeline": {
    displayName: (0, _languageHandler._td)("Show hidden events in timeline"),
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "lowBandwidth": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    displayName: (0, _languageHandler._td)('Low bandwidth mode'),
    default: false,
    controller: new _ReloadOnChangeController.default()
  },
  "fallbackICEServerAllowed": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("Allow fallback call assist server turn.matrix.org when your homeserver " + "does not offer one (your IP address would be shared during a call)"),
    // This is a tri-state value, where `null` means "prompt the user".
    default: null
  },
  "showImages": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show previews/thumbnails for images"),
    default: true
  },
  "showRightPanelInRoom": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "showRightPanelInGroup": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: false
  },
  "lastRightPanelPhaseForRoom": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: _RightPanelStorePhases.RightPanelPhases.RoomSummary
  },
  "lastRightPanelPhaseForGroup": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    default: _RightPanelStorePhases.RightPanelPhases.GroupMemberList
  },
  "enableEventIndexing": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("Enable message search in encrypted rooms"),
    default: true
  },
  "crawlerSleepTime": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("How fast should messages be downloaded."),
    default: 3000
  },
  "showCallButtonsInComposer": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS_WITH_CONFIG,
    default: true,
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.Voip)
  },
  "e2ee.manuallyVerifyAllSessions": {
    supportedLevels: LEVELS_DEVICE_ONLY_SETTINGS,
    displayName: (0, _languageHandler._td)("Manually verify all remote sessions"),
    default: false,
    controller: new _OrderedMultiController.OrderedMultiController([// Apply the feature controller first to ensure that the setting doesn't
    // show up and can't be toggled. PushToMatrixClientController doesn't
    // do any overrides anyways.
    new _UIFeatureController.default(_UIFeature.UIFeature.AdvancedEncryption), new _PushToMatrixClientController.default(_client.MatrixClient.prototype.setCryptoTrustCrossSignedDevices, true)])
  },
  "ircDisplayNameWidth": {
    // We specifically want to have room-device > device so that users may set a device default
    // with a per-room override.
    supportedLevels: [_SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.DEVICE],
    supportedLevelsAreOrdered: true,
    displayName: (0, _languageHandler._td)("IRC display name width"),
    default: 80
  },
  "useIRCLayout": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Enable experimental, compact IRC style layout"),
    default: false
  },
  "showChatEffects": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show chat effects"),
    default: true
  },
  "Widgets.pinned": {
    // deprecated
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: {}
  },
  "Widgets.layout": {
    supportedLevels: LEVELS_ROOM_OR_ACCOUNT,
    default: {}
  },
  "Widgets.leftPanel": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: null
  },
  [_UIFeature.UIFeature.RoomHistorySettings]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.AdvancedEncryption]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.URLPreviews]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Widgets]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Voip]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Feedback]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Registration]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.PasswordReset]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Deactivate]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.ShareQRCode]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.ShareSocial]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.IdentityServer]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true,
    // Identity Server (Discovery) Settings make no sense if 3PIDs in general are hidden
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.ThirdPartyID)
  },
  [_UIFeature.UIFeature.ThirdPartyID]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.Flair]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true,
    // Disable Flair when Communities are disabled
    controller: new _UIFeatureController.default(_UIFeature.UIFeature.Communities)
  },
  [_UIFeature.UIFeature.Communities]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  },
  [_UIFeature.UIFeature.AdvancedSettings]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  }
};
exports.SETTINGS = SETTINGS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXR0aW5ncy9TZXR0aW5ncy50cyJdLCJuYW1lcyI6WyJMRVZFTFNfUk9PTV9TRVRUSU5HUyIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIlJPT01fREVWSUNFIiwiUk9PTV9BQ0NPVU5UIiwiQUNDT1VOVCIsIkNPTkZJRyIsIkxFVkVMU19ST09NX09SX0FDQ09VTlQiLCJMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00iLCJST09NIiwiTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MiLCJMRVZFTFNfRkVBVFVSRSIsIkxFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyIsIkxFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyIsIkxFVkVMU19VSV9GRUFUVVJFIiwiU0VUVElOR1MiLCJpc0ZlYXR1cmUiLCJkaXNwbGF5TmFtZSIsInN1cHBvcnRlZExldmVscyIsImRlZmF1bHQiLCJjb250cm9sbGVyIiwiQ3VzdG9tU3RhdHVzQ29udHJvbGxlciIsIkZvbnRTaXplQ29udHJvbGxlciIsImludmVydGVkU2V0dGluZ05hbWUiLCJpc01hYyIsIlVJRmVhdHVyZUNvbnRyb2xsZXIiLCJVSUZlYXR1cmUiLCJDb21tdW5pdGllcyIsIlRoZW1lQ29udHJvbGxlciIsIlVzZVN5c3RlbUZvbnRDb250cm9sbGVyIiwiU3lzdGVtRm9udENvbnRyb2xsZXIiLCJzdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkIiwiQWR2YW5jZWRFbmNyeXB0aW9uIiwiVVJMUHJldmlld3MiLCJwcmltYXJ5X2NvbG9yIiwic2Vjb25kYXJ5X2NvbG9yIiwiTm90aWZpY2F0aW9uc0VuYWJsZWRDb250cm9sbGVyIiwiTm90aWZpY2F0aW9uQm9keUVuYWJsZWRDb250cm9sbGVyIiwiYWxsb3ciLCJkZW55IiwiUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyIiwiUmlnaHRQYW5lbFBoYXNlcyIsIlJvb21TdW1tYXJ5IiwiR3JvdXBNZW1iZXJMaXN0IiwiVm9pcCIsIk9yZGVyZWRNdWx0aUNvbnRyb2xsZXIiLCJQdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyIiwiTWF0cml4Q2xpZW50IiwicHJvdG90eXBlIiwic2V0Q3J5cHRvVHJ1c3RDcm9zc1NpZ25lZERldmljZXMiLCJSb29tSGlzdG9yeVNldHRpbmdzIiwiV2lkZ2V0cyIsIkZlZWRiYWNrIiwiUmVnaXN0cmF0aW9uIiwiUGFzc3dvcmRSZXNldCIsIkRlYWN0aXZhdGUiLCJTaGFyZVFSQ29kZSIsIlNoYXJlU29jaWFsIiwiSWRlbnRpdHlTZXJ2ZXIiLCJUaGlyZFBhcnR5SUQiLCJGbGFpciIsIkFkdmFuY2VkU2V0dGluZ3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF3QkE7QUFDQSxNQUFNQSxvQkFBb0IsR0FBRyxDQUN6QkMsMkJBQWFDLE1BRFksRUFFekJELDJCQUFhRSxXQUZZLEVBR3pCRiwyQkFBYUcsWUFIWSxFQUl6QkgsMkJBQWFJLE9BSlksRUFLekJKLDJCQUFhSyxNQUxZLENBQTdCO0FBT0EsTUFBTUMsc0JBQXNCLEdBQUcsQ0FDM0JOLDJCQUFhRyxZQURjLEVBRTNCSCwyQkFBYUksT0FGYyxDQUEvQjtBQUlBLE1BQU1HLDhCQUE4QixHQUFHLENBQ25DUCwyQkFBYUMsTUFEc0IsRUFFbkNELDJCQUFhRSxXQUZzQixFQUduQ0YsMkJBQWFHLFlBSHNCLEVBSW5DSCwyQkFBYUksT0FKc0IsRUFLbkNKLDJCQUFhSyxNQUxzQixFQU1uQ0wsMkJBQWFRLElBTnNCLENBQXZDO0FBUUEsTUFBTUMsdUJBQXVCLEdBQUcsQ0FDNUJULDJCQUFhQyxNQURlLEVBRTVCRCwyQkFBYUksT0FGZSxFQUc1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QTRCO0FBQ3hCeEMsSUFBQUEsZUFBZSxFQUFFSixpQkFETztBQUV4QkssSUFBQUEsT0FBTyxFQUFFLElBRmU7QUFHeEI7QUFDQUMsSUFBQUEsVUFBVSxFQUFFLElBQUlLLDRCQUFKLENBQXdCQyxxQkFBVWlDLFlBQWxDO0FBSlksR0FqbEJ1QjtBQXVsQm5ELEdBQUNqQyxxQkFBVWlDLFlBQVgsR0FBMEI7QUFDdEJ6QyxJQUFBQSxlQUFlLEVBQUVKLGlCQURLO0FBRXRCSyxJQUFBQSxPQUFPLEVBQUU7QUFGYSxHQXZsQnlCO0FBMmxCbkQsR0FBQ08scUJBQVVrQyxLQUFYLEdBQW1CO0FBQ2YxQyxJQUFBQSxlQUFlLEVBQUVKLGlCQURGO0FBRWZLLElBQUFBLE9BQU8sRUFBRSxJQUZNO0FBR2Y7QUFDQUMsSUFBQUEsVUFBVSxFQUFFLElBQUlLLDRCQUFKLENBQXdCQyxxQkFBVUMsV0FBbEM7QUFKRyxHQTNsQmdDO0FBaW1CbkQsR0FBQ0QscUJBQVVDLFdBQVgsR0FBeUI7QUFDckJULElBQUFBLGVBQWUsRUFBRUosaUJBREk7QUFFckJLLElBQUFBLE9BQU8sRUFBRTtBQUZZLEdBam1CMEI7QUFxbUJuRCxHQUFDTyxxQkFBVW1DLGdCQUFYLEdBQThCO0FBQzFCM0MsSUFBQUEsZUFBZSxFQUFFSixpQkFEUztBQUUxQkssSUFBQUEsT0FBTyxFQUFFO0FBRmlCO0FBcm1CcUIsQ0FBaEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVHJhdmlzIFJhbHN0b25cbkNvcHlyaWdodCAyMDE4LCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcblxuaW1wb3J0IHsgX3RkIH0gZnJvbSAnLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7XG4gICAgTm90aWZpY2F0aW9uQm9keUVuYWJsZWRDb250cm9sbGVyLFxuICAgIE5vdGlmaWNhdGlvbnNFbmFibGVkQ29udHJvbGxlcixcbn0gZnJvbSBcIi4vY29udHJvbGxlcnMvTm90aWZpY2F0aW9uQ29udHJvbGxlcnNcIjtcbmltcG9ydCBDdXN0b21TdGF0dXNDb250cm9sbGVyIGZyb20gXCIuL2NvbnRyb2xsZXJzL0N1c3RvbVN0YXR1c0NvbnRyb2xsZXJcIjtcbmltcG9ydCBUaGVtZUNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9UaGVtZUNvbnRyb2xsZXInO1xuaW1wb3J0IFB1c2hUb01hdHJpeENsaWVudENvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9QdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyJztcbmltcG9ydCBSZWxvYWRPbkNoYW5nZUNvbnRyb2xsZXIgZnJvbSBcIi4vY29udHJvbGxlcnMvUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgRm9udFNpemVDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvRm9udFNpemVDb250cm9sbGVyJztcbmltcG9ydCBTeXN0ZW1Gb250Q29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL1N5c3RlbUZvbnRDb250cm9sbGVyJztcbmltcG9ydCBVc2VTeXN0ZW1Gb250Q29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL1VzZVN5c3RlbUZvbnRDb250cm9sbGVyJztcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNldHRpbmdDb250cm9sbGVyIGZyb20gXCIuL2NvbnRyb2xsZXJzL1NldHRpbmdDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSBcIi4uL3N0b3Jlcy9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCB7IGlzTWFjIH0gZnJvbSAnLi4vS2V5Ym9hcmQnO1xuaW1wb3J0IFVJRmVhdHVyZUNvbnRyb2xsZXIgZnJvbSBcIi4vY29udHJvbGxlcnMvVUlGZWF0dXJlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSBcIi4vVUlGZWF0dXJlXCI7XG5pbXBvcnQgeyBPcmRlcmVkTXVsdGlDb250cm9sbGVyIH0gZnJvbSBcIi4vY29udHJvbGxlcnMvT3JkZXJlZE11bHRpQ29udHJvbGxlclwiO1xuXG4vLyBUaGVzZSBhcmUganVzdCBhIGJ1bmNoIG9mIGhlbHBlciBhcnJheXMgdG8gYXZvaWQgY29weS9wYXN0aW5nIGEgYnVuY2ggb2YgdGltZXNcbmNvbnN0IExFVkVMU19ST09NX1NFVFRJTkdTID0gW1xuICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLlJPT01fREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlQsXG4gICAgU2V0dGluZ0xldmVsLkFDQ09VTlQsXG4gICAgU2V0dGluZ0xldmVsLkNPTkZJRyxcbl07XG5jb25zdCBMRVZFTFNfUk9PTV9PUl9BQ0NPVU5UID0gW1xuICAgIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlQsXG4gICAgU2V0dGluZ0xldmVsLkFDQ09VTlQsXG5dO1xuY29uc3QgTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NID0gW1xuICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLlJPT01fREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlQsXG4gICAgU2V0dGluZ0xldmVsLkFDQ09VTlQsXG4gICAgU2V0dGluZ0xldmVsLkNPTkZJRyxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTSxcbl07XG5jb25zdCBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5DT05GSUcsXG5dO1xuY29uc3QgTEVWRUxTX0ZFQVRVUkUgPSBbXG4gICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuQ09ORklHLFxuXTtcbmNvbnN0IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuXTtcbmNvbnN0IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5DT05GSUcsXG5dO1xuY29uc3QgTEVWRUxTX1VJX0ZFQVRVUkUgPSBbXG4gICAgU2V0dGluZ0xldmVsLkNPTkZJRyxcbiAgICAvLyBpbiBmdXR1cmUgd2UgbWlnaHQgaGF2ZSBhIC53ZWxsLWtub3duIGxldmVsIG9yIHNvbWV0aGluZ1xuXTtcblxuZXhwb3J0IGludGVyZmFjZSBJU2V0dGluZyB7XG4gICAgLy8gTXVzdCBiZSBzZXQgdG8gdHJ1ZSBmb3IgZmVhdHVyZXMuIERlZmF1bHQgaXMgJ2ZhbHNlJy5cbiAgICBpc0ZlYXR1cmU/OiBib29sZWFuO1xuXG4gICAgLy8gRGlzcGxheSBuYW1lcyBhcmUgc3Ryb25nbHkgcmVjb21tZW5kZWQgZm9yIGNsYXJpdHkuXG4gICAgLy8gRGlzcGxheSBuYW1lIGNhbiBhbHNvIGJlIGFuIG9iamVjdCBmb3IgZGlmZmVyZW50IGxldmVscy5cbiAgICBkaXNwbGF5TmFtZT86IHN0cmluZyB8IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoZSBrZXkgdG8gYmUgYSBzdHJpbmcsIGJ1dCB3ZSBrbm93IGJldHRlclxuICAgICAgICBbbGV2ZWw6IFNldHRpbmdMZXZlbF06IHN0cmluZztcbiAgICB9O1xuXG4gICAgLy8gVGhlIHN1cHBvcnRlZCBsZXZlbHMgYXJlIHJlcXVpcmVkLiBQcmVmZXJhYmx5LCB1c2UgdGhlIHByZXNldCBhcnJheXNcbiAgICAvLyBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZSB0byBkZWZpbmUgdGhpcyByYXRoZXIgdGhhbiBhIGN1c3RvbSBhcnJheS5cbiAgICBzdXBwb3J0ZWRMZXZlbHM/OiBTZXR0aW5nTGV2ZWxbXTtcblxuICAgIC8vIFJlcXVpcmVkLiBDYW4gYmUgYW55IGRhdGEgdHlwZS4gVGhlIHZhbHVlIHNwZWNpZmllZCBoZXJlIHNob3VsZCBtYXRjaFxuICAgIC8vIHRoZSBkYXRhIGJlaW5nIHN0b3JlZCAoaWU6IGlmIGEgYm9vbGVhbiBpcyB1c2VkLCB0aGUgc2V0dGluZyBzaG91bGRcbiAgICAvLyByZXByZXNlbnQgYSBib29sZWFuKS5cbiAgICBkZWZhdWx0OiBhbnk7XG5cbiAgICAvLyBPcHRpb25hbCBzZXR0aW5ncyBjb250cm9sbGVyLiBTZWUgU2V0dGluZ3NDb250cm9sbGVyIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgIGNvbnRyb2xsZXI/OiBTZXR0aW5nQ29udHJvbGxlcjtcblxuICAgIC8vIE9wdGlvbmFsIGZsYWcgdG8gbWFrZSBzdXBwb3J0ZWRMZXZlbHMgYmUgcmVzcGVjdGVkIGFzIHRoZSBvcmRlciB0byBoYW5kbGVcbiAgICAvLyBzZXR0aW5ncy4gVGhlIGZpcnN0IGVsZW1lbnQgaXMgdHJlYXRlZCBhcyBcIm1vc3QgcHJlZmVycmVkXCIuIFRoZSBcImRlZmF1bHRcIlxuICAgIC8vIGxldmVsIGlzIGFsd2F5cyBhcHBlbmRlZCB0byB0aGUgZW5kLlxuICAgIHN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQ/OiBib29sZWFuO1xuXG4gICAgLy8gT3B0aW9uYWwgdmFsdWUgdG8gaW52ZXJ0IGEgYm9vbGVhbiBzZXR0aW5nJ3MgdmFsdWUuIFRoZSBzdHJpbmcgZ2l2ZW4gd2lsbFxuICAgIC8vIGJlIHJlYWQgYXMgdGhlIHNldHRpbmcncyBJRCBpbnN0ZWFkIG9mIHRoZSBvbmUgcHJvdmlkZWQgYXMgdGhlIGtleSBmb3IgdGhlXG4gICAgLy8gc2V0dGluZyBkZWZpbml0aW9uLiBCeSBzZXR0aW5nIHRoaXMsIHRoZSByZXR1cm5lZCB2YWx1ZSB3aWxsIGF1dG9tYXRpY2FsbHlcbiAgICAvLyBiZSBpbnZlcnRlZCwgZXhjZXB0IGZvciB3aGVuIHRoZSBkZWZhdWx0IHZhbHVlIGlzIHJldHVybmVkLiBJbnZlcnNpb24gd2lsbFxuICAgIC8vIG9jY3VyIGFmdGVyIHRoZSBjb250cm9sbGVyIGlzIGFza2VkIGZvciBhbiBvdmVycmlkZS4gVGhpcyBzaG91bGQgYmUgdXNlZCBieVxuICAgIC8vIGhpc3RvcmljYWwgc2V0dGluZ3Mgd2hpY2ggd2UgZG9uJ3Qgd2FudCBleGlzdGluZyB1c2VyJ3MgdmFsdWVzIGJlIHdpcGVkLiBEb1xuICAgIC8vIG5vdCB1c2UgdGhpcyBmb3IgbmV3IHNldHRpbmdzLlxuICAgIGludmVydGVkU2V0dGluZ05hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBTRVRUSU5HUzoge1tzZXR0aW5nOiBzdHJpbmddOiBJU2V0dGluZ30gPSB7XG4gICAgXCJmZWF0dXJlX2xhdGV4X21hdGhzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiUmVuZGVyIExhVGVYIG1hdGhzIGluIG1lc3NhZ2VzXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9jb21tdW5pdGllc192Ml9wcm90b3R5cGVzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFxuICAgICAgICAgICAgXCJDb21tdW5pdGllcyB2MiBwcm90b3R5cGVzLiBSZXF1aXJlcyBjb21wYXRpYmxlIGhvbWVzZXJ2ZXIuIFwiICtcbiAgICAgICAgICAgIFwiSGlnaGx5IGV4cGVyaW1lbnRhbCAtIHVzZSB3aXRoIGNhdXRpb24uXCIsXG4gICAgICAgICksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX25ld19zcGlubmVyXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiTmV3IHNwaW5uZXIgZGVzaWduXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9waW5uaW5nXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiTWVzc2FnZSBQaW5uaW5nXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9jdXN0b21fc3RhdHVzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiQ3VzdG9tIHVzZXIgc3RhdHVzIG1lc3NhZ2VzXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IEN1c3RvbVN0YXR1c0NvbnRyb2xsZXIoKSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9jdXN0b21fdGFnc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkdyb3VwICYgZmlsdGVyIHJvb21zIGJ5IGN1c3RvbSB0YWdzIChyZWZyZXNoIHRvIGFwcGx5IGNoYW5nZXMpXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9zdGF0ZV9jb3VudGVyc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlJlbmRlciBzaW1wbGUgY291bnRlcnMgaW4gcm9vbSBoZWFkZXJcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX21hbnlfaW50ZWdyYXRpb25fbWFuYWdlcnNcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJNdWx0aXBsZSBpbnRlZ3JhdGlvbiBtYW5hZ2Vyc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfbWpvbG5pclwiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRyeSBvdXQgbmV3IHdheXMgdG8gaWdub3JlIHBlb3BsZSAoZXhwZXJpbWVudGFsKVwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfY3VzdG9tX3RoZW1lc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlN1cHBvcnQgYWRkaW5nIGN1c3RvbSB0aGVtZXNcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX3Jvb21saXN0X3ByZXZpZXdfcmVhY3Rpb25zX2Rtc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgbWVzc2FnZSBwcmV2aWV3cyBmb3IgcmVhY3Rpb25zIGluIERNc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfcm9vbWxpc3RfcHJldmlld19yZWFjdGlvbnNfYWxsXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBtZXNzYWdlIHByZXZpZXdzIGZvciByZWFjdGlvbnMgaW4gYWxsIHJvb21zXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9kZWh5ZHJhdGlvblwiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk9mZmxpbmUgZW5jcnlwdGVkIG1lc3NhZ2luZyB1c2luZyBkZWh5ZHJhdGVkIGRldmljZXNcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJhZHZhbmNlZFJvb21MaXN0TG9nZ2luZ1wiOiB7XG4gICAgICAgIC8vIFRPRE86IFJlbW92ZSBmbGFnIGJlZm9yZSBsYXVuY2g6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MjMxXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJFbmFibGUgYWR2YW5jZWQgZGVidWdnaW5nIGZvciB0aGUgcm9vbSBsaXN0XCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIm1qb2xuaXJSb29tc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcIm1qb2xuaXJQZXJzb25hbFJvb21cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuQUNDT1VOVF0sXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfYnJpZGdlX3N0YXRlXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBpbmZvIGFib3V0IGJyaWRnZXMgaW4gcm9vbSBzZXR0aW5nc1wiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIlJvb21MaXN0LmJhY2tncm91bmRJbWFnZVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcImJhc2VGb250U2l6ZVwiOiB7XG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJGb250IHNpemVcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IDEwLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgRm9udFNpemVDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcInVzZUN1c3RvbUZvbnRTaXplXCI6IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlVzZSBjdXN0b20gc2l6ZVwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIk1lc3NhZ2VDb21wb3NlcklucHV0LnN1Z2dlc3RFbW9qaVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBFbW9qaSBzdWdnZXN0aW9ucyB3aGlsZSB0eXBpbmcnKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZTogJ01lc3NhZ2VDb21wb3NlcklucHV0LmRvbnRTdWdnZXN0RW1vamknLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93U3RpY2tlcnNCdXR0b25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IHN0aWNrZXJzIGJ1dHRvbicpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgLy8gVE9ETzogV2lyZSB1cCBhcHByb3ByaWF0ZWx5IHRvIFVJIChGVFVFIG5vdGlmaWNhdGlvbnMpXG4gICAgXCJOb3RpZmljYXRpb25zLmFsd2F5c1Nob3dCYWRnZUNvdW50c1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fT1JfQUNDT1VOVCxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInVzZUNvbXBhY3RMYXlvdXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnVXNlIGEgbW9yZSBjb21wYWN0IOKAmE1vZGVybuKAmSBsYXlvdXQnKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dSZWRhY3Rpb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Nob3cgYSBwbGFjZWhvbGRlciBmb3IgcmVtb3ZlZCBtZXNzYWdlcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZVJlZGFjdGlvbnMnLFxuICAgIH0sXG4gICAgXCJzaG93Sm9pbkxlYXZlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGpvaW4vbGVhdmUgbWVzc2FnZXMgKGludml0ZXMva2lja3MvYmFucyB1bmFmZmVjdGVkKScpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZUpvaW5MZWF2ZXMnLFxuICAgIH0sXG4gICAgXCJzaG93QXZhdGFyQ2hhbmdlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGF2YXRhciBjaGFuZ2VzJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdoaWRlQXZhdGFyQ2hhbmdlcycsXG4gICAgfSxcbiAgICBcInNob3dEaXNwbGF5bmFtZUNoYW5nZXNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX1NFVFRJTkdTX1dJVEhfUk9PTSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnU2hvdyBkaXNwbGF5IG5hbWUgY2hhbmdlcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZURpc3BsYXluYW1lQ2hhbmdlcycsXG4gICAgfSxcbiAgICBcInNob3dSZWFkUmVjZWlwdHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IHJlYWQgcmVjZWlwdHMgc2VudCBieSBvdGhlciB1c2VycycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZVJlYWRSZWNlaXB0cycsXG4gICAgfSxcbiAgICBcInNob3dUd2VsdmVIb3VyVGltZXN0YW1wc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Nob3cgdGltZXN0YW1wcyBpbiAxMiBob3VyIGZvcm1hdCAoZS5nLiAyOjMwcG0pJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJhbHdheXNTaG93VGltZXN0YW1wc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0Fsd2F5cyBzaG93IG1lc3NhZ2UgdGltZXN0YW1wcycpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiYXV0b3BsYXlHaWZzQW5kVmlkZW9zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnQXV0b3BsYXkgR0lGcyBhbmQgdmlkZW9zJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJlbmFibGVTeW50YXhIaWdobGlnaHRMYW5ndWFnZURldGVjdGlvblwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBhdXRvbWF0aWMgbGFuZ3VhZ2UgZGV0ZWN0aW9uIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJleHBhbmRDb2RlQnlEZWZhdWx0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnRXhwYW5kIGNvZGUgYmxvY2tzIGJ5IGRlZmF1bHQnKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dDb2RlTGluZU51bWJlcnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGxpbmUgbnVtYmVycyBpbiBjb2RlIGJsb2NrcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJQaWxsLnNob3VsZFNob3dQaWxsQXZhdGFyXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnU2hvdyBhdmF0YXJzIGluIHVzZXIgYW5kIHJvb20gbWVudGlvbnMnKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZTogJ1BpbGwuc2hvdWxkSGlkZVBpbGxBdmF0YXInLFxuICAgIH0sXG4gICAgXCJUZXh0dWFsQm9keS5lbmFibGVCaWdFbW9qaVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBiaWcgZW1vamkgaW4gY2hhdCcpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnVGV4dHVhbEJvZHkuZGlzYWJsZUJpZ0Vtb2ppJyxcbiAgICB9LFxuICAgIFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuaXNSaWNoVGV4dEVuYWJsZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiTWVzc2FnZUNvbXBvc2VyLnNob3dGb3JtYXR0aW5nXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNlbmRUeXBpbmdOb3RpZmljYXRpb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNlbmQgdHlwaW5nIG5vdGlmaWNhdGlvbnNcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdkb250U2VuZFR5cGluZ05vdGlmaWNhdGlvbnMnLFxuICAgIH0sXG4gICAgXCJzaG93VHlwaW5nTm90aWZpY2F0aW9uc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IHR5cGluZyBub3RpZmljYXRpb25zXCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJjdHJsRkZvclNlYXJjaFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBpc01hYyA/IF90ZChcIlVzZSBDb21tYW5kICsgRiB0byBzZWFyY2hcIikgOiBfdGQoXCJVc2UgQ3RybCArIEYgdG8gc2VhcmNoXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuY3RybEVudGVyVG9TZW5kXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IGlzTWFjID8gX3RkKFwiVXNlIENvbW1hbmQgKyBFbnRlciB0byBzZW5kIGEgbWVzc2FnZVwiKSA6IF90ZChcIlVzZSBDdHJsICsgRW50ZXIgdG8gc2VuZCBhIG1lc3NhZ2VcIiksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5hdXRvUmVwbGFjZUVtb2ppXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnQXV0b21hdGljYWxseSByZXBsYWNlIHBsYWluIHRleHQgRW1vamknKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIlZpZGVvVmlldy5mbGlwVmlkZW9Ib3Jpem9udGFsbHlcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdNaXJyb3IgbG9jYWwgdmlkZW8gZmVlZCcpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiVGFnUGFuZWwuZW5hYmxlVGFnUGFuZWxcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdFbmFibGUgQ29tbXVuaXR5IEZpbHRlciBQYW5lbCcpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnVGFnUGFuZWwuZGlzYWJsZVRhZ1BhbmVsJyxcbiAgICAgICAgLy8gV2UgZm9yY2UgdGhlIHZhbHVlIHRvIHRydWUgYmVjYXVzZSB0aGUgaW52ZXJ0ZWRTZXR0aW5nTmFtZSBjYXVzZXMgaXQgdG8gZmxpcFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuQ29tbXVuaXRpZXMsIHRydWUpLFxuICAgIH0sXG4gICAgXCJ0aGVtZVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IFwibGlnaHRcIixcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFRoZW1lQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJjdXN0b21fdGhlbWVzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcInVzZV9zeXN0ZW1fdGhlbWVcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk1hdGNoIHN5c3RlbSB0aGVtZVwiKSxcbiAgICB9LFxuICAgIFwidXNlU3lzdGVtRm9udFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlVzZSBhIHN5c3RlbSBmb250XCIpLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVXNlU3lzdGVtRm9udENvbnRyb2xsZXIoKSxcbiAgICB9LFxuICAgIFwic3lzdGVtRm9udFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBcIlwiLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU3lzdGVtIGZvbnQgbmFtZVwiKSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFN5c3RlbUZvbnRDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcIndlYlJ0Y0FsbG93UGVlclRvUGVlclwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTX1dJVEhfQ09ORklHLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdBbGxvdyBQZWVyLXRvLVBlZXIgZm9yIDE6MSBjYWxscycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnd2ViUnRjRm9yY2VUVVJOJyxcbiAgICB9LFxuICAgIFwid2VicnRjX2F1ZGlvb3V0cHV0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcIndlYnJ0Y19hdWRpb2lucHV0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcIndlYnJ0Y192aWRlb2lucHV0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcImxhbmd1YWdlXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRlZmF1bHQ6IFwiZW5cIixcbiAgICB9LFxuICAgIFwiYnJlYWRjcnVtYl9yb29tc1wiOiB7XG4gICAgICAgIC8vIG5vdCByZWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcInJlY2VudF9lbW9qaVwiOiB7XG4gICAgICAgIC8vIG5vdCByZWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcInJvb21fZGlyZWN0b3J5X3NlcnZlcnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuQUNDT1VOVF0sXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgIH0sXG4gICAgXCJpbnRlZ3JhdGlvblByb3Zpc2lvbmluZ1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiYWxsb3dlZFdpZGdldHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULCBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0VdLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkOiB0cnVlLFxuICAgICAgICBkZWZhdWx0OiB7fSwgLy8gbm9uZSBhbGxvd2VkXG4gICAgfSxcbiAgICBcImFuYWx5dGljc09wdEluXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1NlbmQgYW5hbHl0aWNzIGRhdGEnKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dDb29raWVCYXJcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiYXV0b2NvbXBsZXRlRGVsYXlcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogMjAwLFxuICAgIH0sXG4gICAgXCJyZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogMzAwMCxcbiAgICB9LFxuICAgIFwicmVhZE1hcmtlck91dE9mVmlld1RocmVzaG9sZE1zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRlZmF1bHQ6IDMwMDAwLFxuICAgIH0sXG4gICAgXCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiOiB7XG4gICAgICAgIC8vIFdlIHNwZWNpZmljYWxseSB3YW50IHRvIGhhdmUgcm9vbS1kZXZpY2UgPiBkZXZpY2Ugc28gdGhhdCB1c2VycyBtYXkgc2V0IGEgZGV2aWNlIGRlZmF1bHRcbiAgICAgICAgLy8gd2l0aCBhIHBlci1yb29tIG92ZXJyaWRlLlxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsIFNldHRpbmdMZXZlbC5ERVZJQ0VdLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZToge1xuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IF90ZCgnTmV2ZXIgc2VuZCBlbmNyeXB0ZWQgbWVzc2FnZXMgdG8gdW52ZXJpZmllZCBzZXNzaW9ucyBmcm9tIHRoaXMgc2Vzc2lvbicpLFxuICAgICAgICAgICAgXCJyb29tLWRldmljZVwiOiBfdGQoJ05ldmVyIHNlbmQgZW5jcnlwdGVkIG1lc3NhZ2VzIHRvIHVudmVyaWZpZWQgc2Vzc2lvbnMgaW4gdGhpcyByb29tIGZyb20gdGhpcyBzZXNzaW9uJyksXG4gICAgICAgIH0sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuQWR2YW5jZWRFbmNyeXB0aW9uKSxcbiAgICB9LFxuICAgIFwidXJsUHJldmlld3NFbmFibGVkXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00sXG4gICAgICAgIGRpc3BsYXlOYW1lOiB7XG4gICAgICAgICAgICBcImRlZmF1bHRcIjogX3RkKCdFbmFibGUgaW5saW5lIFVSTCBwcmV2aWV3cyBieSBkZWZhdWx0JyksXG4gICAgICAgICAgICBcInJvb20tYWNjb3VudFwiOiBfdGQoXCJFbmFibGUgVVJMIHByZXZpZXdzIGZvciB0aGlzIHJvb20gKG9ubHkgYWZmZWN0cyB5b3UpXCIpLFxuICAgICAgICAgICAgXCJyb29tXCI6IF90ZChcIkVuYWJsZSBVUkwgcHJldmlld3MgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVJRmVhdHVyZUNvbnRyb2xsZXIoVUlGZWF0dXJlLlVSTFByZXZpZXdzKSxcbiAgICB9LFxuICAgIFwidXJsUHJldmlld3NFbmFibGVkX2UyZWVcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlRdLFxuICAgICAgICBkaXNwbGF5TmFtZToge1xuICAgICAgICAgICAgXCJyb29tLWFjY291bnRcIjogX3RkKFwiRW5hYmxlIFVSTCBwcmV2aWV3cyBmb3IgdGhpcyByb29tIChvbmx5IGFmZmVjdHMgeW91KVwiKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5VUkxQcmV2aWV3cyksXG4gICAgfSxcbiAgICBcInJvb21Db2xvclwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiUm9vbSBDb2xvdXJcIiksXG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIHByaW1hcnlfY29sb3I6IG51bGwsIC8vIEhleCBzdHJpbmcsIGVnOiAjMDAwMDAwXG4gICAgICAgICAgICBzZWNvbmRhcnlfY29sb3I6IG51bGwsIC8vIEhleCBzdHJpbmcsIGVnOiAjMDAwMDAwXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBcIm5vdGlmaWNhdGlvbnNFbmFibGVkXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgTm90aWZpY2F0aW9uc0VuYWJsZWRDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcIm5vdGlmaWNhdGlvblNvdW5kXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9PUl9BQ0NPVU5ULFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwibm90aWZpY2F0aW9uQm9keUVuYWJsZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IE5vdGlmaWNhdGlvbkJvZHlFbmFibGVkQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJhdWRpb05vdGlmaWNhdGlvbnNFbmFibGVkXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImVuYWJsZVdpZGdldFNjcmVlbnNob3RzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnRW5hYmxlIHdpZGdldCBzY3JlZW5zaG90cyBvbiBzdXBwb3J0ZWQgd2lkZ2V0cycpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiUGlubmVkRXZlbnRzLmlzT3BlblwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5ST09NX0RFVklDRV0sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJwcm9tcHRCZWZvcmVJbnZpdGVVbmtub3duVXNlcnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdQcm9tcHQgYmVmb3JlIHNlbmRpbmcgaW52aXRlcyB0byBwb3RlbnRpYWxseSBpbnZhbGlkIG1hdHJpeCBJRHMnKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwic2hvd0RldmVsb3BlclRvb2xzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnU2hvdyBkZXZlbG9wZXIgdG9vbHMnKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIndpZGdldE9wZW5JRFBlcm1pc3Npb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGFsbG93OiBbXSxcbiAgICAgICAgICAgIGRlbnk6IFtdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgLy8gVE9ETzogUmVtb3ZlIHNldHRpbmc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MzczXG4gICAgXCJSb29tTGlzdC5vcmRlckFscGhhYmV0aWNhbGx5XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk9yZGVyIHJvb21zIGJ5IG5hbWVcIiksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgLy8gVE9ETzogUmVtb3ZlIHNldHRpbmc6IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MzczXG4gICAgXCJSb29tTGlzdC5vcmRlckJ5SW1wb3J0YW5jZVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IHJvb21zIHdpdGggdW5yZWFkIG5vdGlmaWNhdGlvbnMgZmlyc3RcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImJyZWFkY3J1bWJzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgc2hvcnRjdXRzIHRvIHJlY2VudGx5IHZpZXdlZCByb29tcyBhYm92ZSB0aGUgcm9vbSBsaXN0XCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJzaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZVwiOiB7XG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IGhpZGRlbiBldmVudHMgaW4gdGltZWxpbmVcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwibG93QmFuZHdpZHRoXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0xvdyBiYW5kd2lkdGggbW9kZScpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFJlbG9hZE9uQ2hhbmdlQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcbiAgICAgICAgICAgIFwiQWxsb3cgZmFsbGJhY2sgY2FsbCBhc3Npc3Qgc2VydmVyIHR1cm4ubWF0cml4Lm9yZyB3aGVuIHlvdXIgaG9tZXNlcnZlciBcIiArXG4gICAgICAgICAgICBcImRvZXMgbm90IG9mZmVyIG9uZSAoeW91ciBJUCBhZGRyZXNzIHdvdWxkIGJlIHNoYXJlZCBkdXJpbmcgYSBjYWxsKVwiLFxuICAgICAgICApLFxuICAgICAgICAvLyBUaGlzIGlzIGEgdHJpLXN0YXRlIHZhbHVlLCB3aGVyZSBgbnVsbGAgbWVhbnMgXCJwcm9tcHQgdGhlIHVzZXJcIi5cbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwic2hvd0ltYWdlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IHByZXZpZXdzL3RodW1ibmFpbHMgZm9yIGltYWdlc1wiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwic2hvd1JpZ2h0UGFuZWxJblJvb21cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dSaWdodFBhbmVsSW5Hcm91cFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwibGFzdFJpZ2h0UGFuZWxQaGFzZUZvclJvb21cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogUmlnaHRQYW5lbFBoYXNlcy5Sb29tU3VtbWFyeSxcbiAgICB9LFxuICAgIFwibGFzdFJpZ2h0UGFuZWxQaGFzZUZvckdyb3VwXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IFJpZ2h0UGFuZWxQaGFzZXMuR3JvdXBNZW1iZXJMaXN0LFxuICAgIH0sXG4gICAgXCJlbmFibGVFdmVudEluZGV4aW5nXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJFbmFibGUgbWVzc2FnZSBzZWFyY2ggaW4gZW5jcnlwdGVkIHJvb21zXCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJjcmF3bGVyU2xlZXBUaW1lXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJIb3cgZmFzdCBzaG91bGQgbWVzc2FnZXMgYmUgZG93bmxvYWRlZC5cIiksXG4gICAgICAgIGRlZmF1bHQ6IDMwMDAsXG4gICAgfSxcbiAgICBcInNob3dDYWxsQnV0dG9uc0luQ29tcG9zZXJcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVJRmVhdHVyZUNvbnRyb2xsZXIoVUlGZWF0dXJlLlZvaXApLFxuICAgIH0sXG4gICAgXCJlMmVlLm1hbnVhbGx5VmVyaWZ5QWxsU2Vzc2lvbnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk1hbnVhbGx5IHZlcmlmeSBhbGwgcmVtb3RlIHNlc3Npb25zXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IE9yZGVyZWRNdWx0aUNvbnRyb2xsZXIoW1xuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIGZlYXR1cmUgY29udHJvbGxlciBmaXJzdCB0byBlbnN1cmUgdGhhdCB0aGUgc2V0dGluZyBkb2Vzbid0XG4gICAgICAgICAgICAvLyBzaG93IHVwIGFuZCBjYW4ndCBiZSB0b2dnbGVkLiBQdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyIGRvZXNuJ3RcbiAgICAgICAgICAgIC8vIGRvIGFueSBvdmVycmlkZXMgYW55d2F5cy5cbiAgICAgICAgICAgIG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5BZHZhbmNlZEVuY3J5cHRpb24pLFxuICAgICAgICAgICAgbmV3IFB1c2hUb01hdHJpeENsaWVudENvbnRyb2xsZXIoXG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50LnByb3RvdHlwZS5zZXRDcnlwdG9UcnVzdENyb3NzU2lnbmVkRGV2aWNlcywgdHJ1ZSxcbiAgICAgICAgICAgICksXG4gICAgICAgIF0pLFxuICAgIH0sXG4gICAgXCJpcmNEaXNwbGF5TmFtZVdpZHRoXCI6IHtcbiAgICAgICAgLy8gV2Ugc3BlY2lmaWNhbGx5IHdhbnQgdG8gaGF2ZSByb29tLWRldmljZSA+IGRldmljZSBzbyB0aGF0IHVzZXJzIG1heSBzZXQgYSBkZXZpY2UgZGVmYXVsdFxuICAgICAgICAvLyB3aXRoIGEgcGVyLXJvb20gb3ZlcnJpZGUuXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5ST09NX0RFVklDRSwgU2V0dGluZ0xldmVsLkRFVklDRV0sXG4gICAgICAgIHN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQ6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJJUkMgZGlzcGxheSBuYW1lIHdpZHRoXCIpLFxuICAgICAgICBkZWZhdWx0OiA4MCxcbiAgICB9LFxuICAgIFwidXNlSVJDTGF5b3V0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkVuYWJsZSBleHBlcmltZW50YWwsIGNvbXBhY3QgSVJDIHN0eWxlIGxheW91dFwiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dDaGF0RWZmZWN0c1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTaG93IGNoYXQgZWZmZWN0c1wiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiV2lkZ2V0cy5waW5uZWRcIjogeyAvLyBkZXByZWNhdGVkXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fT1JfQUNDT1VOVCxcbiAgICAgICAgZGVmYXVsdDoge30sXG4gICAgfSxcbiAgICBcIldpZGdldHMubGF5b3V0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9PUl9BQ0NPVU5ULFxuICAgICAgICBkZWZhdWx0OiB7fSxcbiAgICB9LFxuICAgIFwiV2lkZ2V0cy5sZWZ0UGFuZWxcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5Sb29tSGlzdG9yeVNldHRpbmdzXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5BZHZhbmNlZEVuY3J5cHRpb25dOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlVSTFByZXZpZXdzXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5XaWRnZXRzXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5Wb2lwXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5GZWVkYmFja106IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuUmVnaXN0cmF0aW9uXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5QYXNzd29yZFJlc2V0XToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5EZWFjdGl2YXRlXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5TaGFyZVFSQ29kZV06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuU2hhcmVTb2NpYWxdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLklkZW50aXR5U2VydmVyXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAvLyBJZGVudGl0eSBTZXJ2ZXIgKERpc2NvdmVyeSkgU2V0dGluZ3MgbWFrZSBubyBzZW5zZSBpZiAzUElEcyBpbiBnZW5lcmFsIGFyZSBoaWRkZW5cbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVJRmVhdHVyZUNvbnRyb2xsZXIoVUlGZWF0dXJlLlRoaXJkUGFydHlJRCksXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlRoaXJkUGFydHlJRF06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuRmxhaXJdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIC8vIERpc2FibGUgRmxhaXIgd2hlbiBDb21tdW5pdGllcyBhcmUgZGlzYWJsZWRcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVJRmVhdHVyZUNvbnRyb2xsZXIoVUlGZWF0dXJlLkNvbW11bml0aWVzKSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuQ29tbXVuaXRpZXNdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLkFkdmFuY2VkU2V0dGluZ3NdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbn07XG4iXX0=