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

var _Layout = require("./Layout");

var _ReducedMotionController = _interopRequireDefault(require("./controllers/ReducedMotionController"));

var _IncompatibleController = _interopRequireDefault(require("./controllers/IncompatibleController"));

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
  "feature_spaces": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Spaces prototype. Incompatible with Communities, Communities v2 and Custom Tags. " + "Requires compatible homeserver for some features."),
    supportedLevels: LEVELS_FEATURE,
    default: false,
    controller: new _ReloadOnChangeController.default()
  },
  "feature_dnd": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Show options to enable 'Do not disturb' mode"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
  "feature_voice_messages": {
    isFeature: true,
    displayName: (0, _languageHandler._td)("Send and receive voice messages (in development)"),
    supportedLevels: LEVELS_FEATURE,
    default: false
  },
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
    default: false,
    controller: new _IncompatibleController.default("feature_spaces")
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
    default: false,
    controller: new _IncompatibleController.default("feature_spaces")
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
    default: false,
    // this option is a subset of `feature_roomlist_preview_reactions_all` so disable it when that one is enabled
    controller: new _IncompatibleController.default("feature_roomlist_preview_reactions_all")
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
  "doNotDisturb": {
    supportedLevels: [_SettingLevel.SettingLevel.DEVICE],
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
  "scrollToBottomOnMessageSent": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)('Jump to the bottom of the timeline when you send a message'),
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
    // Dev note: This is no longer "in composer" but is instead "in room header".
    // TODO: Rename with settings v3
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
  "layout": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    default: _Layout.Layout.Group
  },
  "showChatEffects": {
    supportedLevels: LEVELS_ACCOUNT_SETTINGS,
    displayName: (0, _languageHandler._td)("Show chat effects (animations when receiving e.g. confetti)"),
    default: true,
    controller: new _ReducedMotionController.default()
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
    default: true,
    controller: new _IncompatibleController.default("feature_spaces")
  },
  [_UIFeature.UIFeature.AdvancedSettings]: {
    supportedLevels: LEVELS_UI_FEATURE,
    default: true
  }
};
exports.SETTINGS = SETTINGS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXR0aW5ncy9TZXR0aW5ncy50cyJdLCJuYW1lcyI6WyJMRVZFTFNfUk9PTV9TRVRUSU5HUyIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIlJPT01fREVWSUNFIiwiUk9PTV9BQ0NPVU5UIiwiQUNDT1VOVCIsIkNPTkZJRyIsIkxFVkVMU19ST09NX09SX0FDQ09VTlQiLCJMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00iLCJST09NIiwiTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MiLCJMRVZFTFNfRkVBVFVSRSIsIkxFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyIsIkxFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyIsIkxFVkVMU19VSV9GRUFUVVJFIiwiU0VUVElOR1MiLCJpc0ZlYXR1cmUiLCJkaXNwbGF5TmFtZSIsInN1cHBvcnRlZExldmVscyIsImRlZmF1bHQiLCJjb250cm9sbGVyIiwiUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyIiwiSW5jb21wYXRpYmxlQ29udHJvbGxlciIsIkN1c3RvbVN0YXR1c0NvbnRyb2xsZXIiLCJGb250U2l6ZUNvbnRyb2xsZXIiLCJpbnZlcnRlZFNldHRpbmdOYW1lIiwiaXNNYWMiLCJVSUZlYXR1cmVDb250cm9sbGVyIiwiVUlGZWF0dXJlIiwiQ29tbXVuaXRpZXMiLCJUaGVtZUNvbnRyb2xsZXIiLCJVc2VTeXN0ZW1Gb250Q29udHJvbGxlciIsIlN5c3RlbUZvbnRDb250cm9sbGVyIiwic3VwcG9ydGVkTGV2ZWxzQXJlT3JkZXJlZCIsIkFkdmFuY2VkRW5jcnlwdGlvbiIsIlVSTFByZXZpZXdzIiwicHJpbWFyeV9jb2xvciIsInNlY29uZGFyeV9jb2xvciIsIk5vdGlmaWNhdGlvbnNFbmFibGVkQ29udHJvbGxlciIsIk5vdGlmaWNhdGlvbkJvZHlFbmFibGVkQ29udHJvbGxlciIsImFsbG93IiwiZGVueSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJSb29tU3VtbWFyeSIsIkdyb3VwTWVtYmVyTGlzdCIsIlZvaXAiLCJPcmRlcmVkTXVsdGlDb250cm9sbGVyIiwiUHVzaFRvTWF0cml4Q2xpZW50Q29udHJvbGxlciIsIk1hdHJpeENsaWVudCIsInByb3RvdHlwZSIsInNldENyeXB0b1RydXN0Q3Jvc3NTaWduZWREZXZpY2VzIiwiTGF5b3V0IiwiR3JvdXAiLCJSZWR1Y2VkTW90aW9uQ29udHJvbGxlciIsIlJvb21IaXN0b3J5U2V0dGluZ3MiLCJXaWRnZXRzIiwiRmVlZGJhY2siLCJSZWdpc3RyYXRpb24iLCJQYXNzd29yZFJlc2V0IiwiRGVhY3RpdmF0ZSIsIlNoYXJlUVJDb2RlIiwiU2hhcmVTb2NpYWwiLCJJZGVudGl0eVNlcnZlciIsIlRoaXJkUGFydHlJRCIsIkZsYWlyIiwiQWR2YW5jZWRTZXR0aW5ncyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUNBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTJCQTtBQUNBLE1BQU1BLG9CQUFvQixHQUFHLENBQ3pCQywyQkFBYUMsTUFEWSxFQUV6QkQsMkJBQWFFLFdBRlksRUFHekJGLDJCQUFhRyxZQUhZLEVBSXpCSCwyQkFBYUksT0FKWSxFQUt6QkosMkJBQWFLLE1BTFksQ0FBN0I7QUFPQSxNQUFNQyxzQkFBc0IsR0FBRyxDQUMzQk4sMkJBQWFHLFlBRGMsRUFFM0JILDJCQUFhSSxPQUZjLENBQS9CO0FBSUEsTUFBTUcsOEJBQThCLEdBQUcsQ0FDbkNQLDJCQUFhQyxNQURzQixFQUVuQ0QsMkJBQWFFLFdBRnNCLEVBR25DRiwyQkFBYUcsWUFIc0IsRUFJbkNILDJCQUFhSSxPQUpzQixFQUtuQ0osMkJBQWFLLE1BTHNCLEVBTW5DTCwyQkFBYVEsSUFOc0IsQ0FBdkM7QUFRQSxNQUFNQyx1QkFBdUIsR0FBRyxDQUM1QlQsMkJBQWFDLE1BRGUsRUFFNUJELDJCQUFhSSxPQUZlLEVBRzVCSiwyQkFBYUssTUFIZSxDQUFoQztBQUtBLE1BQU1LLGNBQWMsR0FBRyxDQUNuQlYsMkJBQWFDLE1BRE0sRUFFbkJELDJCQUFhSyxNQUZNLENBQXZCO0FBSUEsTUFBTU0sMkJBQTJCLEdBQUcsQ0FDaENYLDJCQUFhQyxNQURtQixDQUFwQztBQUdBLE1BQU1XLHVDQUF1QyxHQUFHLENBQzVDWiwyQkFBYUMsTUFEK0IsRUFFNUNELDJCQUFhSyxNQUYrQixDQUFoRDtBQUlBLE1BQU1RLGlCQUFpQixHQUFHLENBQ3RCYiwyQkFBYUssTUFEUyxDQUV0QjtBQUZzQixDQUExQjs7QUE5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXNGTyxNQUFNUztBQUF1QztBQUFBLEVBQUc7QUFDbkQsb0JBQWtCO0FBQ2RDLElBQUFBLFNBQVMsRUFBRSxJQURHO0FBRWRDLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxzRkFDYixtREFEUyxDQUZDO0FBSWRDLElBQUFBLGVBQWUsRUFBRVAsY0FKSDtBQUtkUSxJQUFBQSxPQUFPLEVBQUUsS0FMSztBQU1kQyxJQUFBQSxVQUFVLEVBQUUsSUFBSUMsaUNBQUo7QUFORSxHQURpQztBQVNuRCxpQkFBZTtBQUNYTCxJQUFBQSxTQUFTLEVBQUUsSUFEQTtBQUVYQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksOENBQUosQ0FGRjtBQUdYQyxJQUFBQSxlQUFlLEVBQUVQLGNBSE47QUFJWFEsSUFBQUEsT0FBTyxFQUFFO0FBSkUsR0FUb0M7QUFlbkQsNEJBQTBCO0FBQ3RCSCxJQUFBQSxTQUFTLEVBQUUsSUFEVztBQUV0QkMsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLGtEQUFKLENBRlM7QUFHdEJDLElBQUFBLGVBQWUsRUFBRVAsY0FISztBQUl0QlEsSUFBQUEsT0FBTyxFQUFFO0FBSmEsR0FmeUI7QUFxQm5ELHlCQUF1QjtBQUNuQkgsSUFBQUEsU0FBUyxFQUFFLElBRFE7QUFFbkJDLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxnQ0FBSixDQUZNO0FBR25CQyxJQUFBQSxlQUFlLEVBQUVQLGNBSEU7QUFJbkJRLElBQUFBLE9BQU8sRUFBRTtBQUpVLEdBckI0QjtBQTJCbkQsdUNBQXFDO0FBQ2pDSCxJQUFBQSxTQUFTLEVBQUUsSUFEc0I7QUFFakNDLElBQUFBLFdBQVcsRUFBRSwwQkFDVCxnRUFDQSx5Q0FGUyxDQUZvQjtBQU1qQ0MsSUFBQUEsZUFBZSxFQUFFUCxjQU5nQjtBQU9qQ1EsSUFBQUEsT0FBTyxFQUFFLEtBUHdCO0FBUWpDQyxJQUFBQSxVQUFVLEVBQUUsSUFBSUUsK0JBQUosQ0FBMkIsZ0JBQTNCO0FBUnFCLEdBM0JjO0FBcUNuRCx5QkFBdUI7QUFDbkJOLElBQUFBLFNBQVMsRUFBRSxJQURRO0FBRW5CQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksb0JBQUosQ0FGTTtBQUduQkMsSUFBQUEsZUFBZSxFQUFFUCxjQUhFO0FBSW5CUSxJQUFBQSxPQUFPLEVBQUU7QUFKVSxHQXJDNEI7QUEyQ25ELHFCQUFtQjtBQUNmSCxJQUFBQSxTQUFTLEVBQUUsSUFESTtBQUVmQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksaUJBQUosQ0FGRTtBQUdmQyxJQUFBQSxlQUFlLEVBQUVQLGNBSEY7QUFJZlEsSUFBQUEsT0FBTyxFQUFFO0FBSk0sR0EzQ2dDO0FBaURuRCwyQkFBeUI7QUFDckJILElBQUFBLFNBQVMsRUFBRSxJQURVO0FBRXJCQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksNkJBQUosQ0FGUTtBQUdyQkMsSUFBQUEsZUFBZSxFQUFFUCxjQUhJO0FBSXJCUSxJQUFBQSxPQUFPLEVBQUUsS0FKWTtBQUtyQkMsSUFBQUEsVUFBVSxFQUFFLElBQUlHLCtCQUFKO0FBTFMsR0FqRDBCO0FBd0RuRCx5QkFBdUI7QUFDbkJQLElBQUFBLFNBQVMsRUFBRSxJQURRO0FBRW5CQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksZ0VBQUosQ0FGTTtBQUduQkMsSUFBQUEsZUFBZSxFQUFFUCxjQUhFO0FBSW5CUSxJQUFBQSxPQUFPLEVBQUUsS0FKVTtBQUtuQkMsSUFBQUEsVUFBVSxFQUFFLElBQUlFLCtCQUFKLENBQTJCLGdCQUEzQjtBQUxPLEdBeEQ0QjtBQStEbkQsNEJBQTBCO0FBQ3RCTixJQUFBQSxTQUFTLEVBQUUsSUFEVztBQUV0QkMsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLHVDQUFKLENBRlM7QUFHdEJDLElBQUFBLGVBQWUsRUFBRVAsY0FISztBQUl0QlEsSUFBQUEsT0FBTyxFQUFFO0FBSmEsR0EvRHlCO0FBcUVuRCx1Q0FBcUM7QUFDakNILElBQUFBLFNBQVMsRUFBRSxJQURzQjtBQUVqQ0MsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLCtCQUFKLENBRm9CO0FBR2pDQyxJQUFBQSxlQUFlLEVBQUVQLGNBSGdCO0FBSWpDUSxJQUFBQSxPQUFPLEVBQUU7QUFKd0IsR0FyRWM7QUEyRW5ELHFCQUFtQjtBQUNmSCxJQUFBQSxTQUFTLEVBQUUsSUFESTtBQUVmQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksa0RBQUosQ0FGRTtBQUdmQyxJQUFBQSxlQUFlLEVBQUVQLGNBSEY7QUFJZlEsSUFBQUEsT0FBTyxFQUFFO0FBSk0sR0EzRWdDO0FBaUZuRCwyQkFBeUI7QUFDckJILElBQUFBLFNBQVMsRUFBRSxJQURVO0FBRXJCQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksOEJBQUosQ0FGUTtBQUdyQkMsSUFBQUEsZUFBZSxFQUFFUCxjQUhJO0FBSXJCUSxJQUFBQSxPQUFPLEVBQUU7QUFKWSxHQWpGMEI7QUF1Rm5ELDRDQUEwQztBQUN0Q0gsSUFBQUEsU0FBUyxFQUFFLElBRDJCO0FBRXRDQyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksNENBQUosQ0FGeUI7QUFHdENDLElBQUFBLGVBQWUsRUFBRVAsY0FIcUI7QUFJdENRLElBQUFBLE9BQU8sRUFBRSxLQUo2QjtBQUt0QztBQUNBQyxJQUFBQSxVQUFVLEVBQUUsSUFBSUUsK0JBQUosQ0FBMkIsd0NBQTNCO0FBTjBCLEdBdkZTO0FBK0ZuRCw0Q0FBMEM7QUFDdENOLElBQUFBLFNBQVMsRUFBRSxJQUQyQjtBQUV0Q0MsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLGtEQUFKLENBRnlCO0FBR3RDQyxJQUFBQSxlQUFlLEVBQUVQLGNBSHFCO0FBSXRDUSxJQUFBQSxPQUFPLEVBQUU7QUFKNkIsR0EvRlM7QUFxR25ELHlCQUF1QjtBQUNuQkgsSUFBQUEsU0FBUyxFQUFFLElBRFE7QUFFbkJDLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxzREFBSixDQUZNO0FBR25CQyxJQUFBQSxlQUFlLEVBQUVQLGNBSEU7QUFJbkJRLElBQUFBLE9BQU8sRUFBRTtBQUpVLEdBckc0QjtBQTJHbkQsNkJBQTJCO0FBQ3ZCO0FBQ0FGLElBQUFBLFdBQVcsRUFBRSwwQkFBSSw2Q0FBSixDQUZVO0FBR3ZCQyxJQUFBQSxlQUFlLEVBQUVOLDJCQUhNO0FBSXZCTyxJQUFBQSxPQUFPLEVBQUU7QUFKYyxHQTNHd0I7QUFpSG5ELGtCQUFnQjtBQUNaRCxJQUFBQSxlQUFlLEVBQUUsQ0FBQ2pCLDJCQUFhQyxNQUFkLENBREw7QUFFWmlCLElBQUFBLE9BQU8sRUFBRTtBQUZHLEdBakhtQztBQXFIbkQsa0JBQWdCO0FBQ1pELElBQUFBLGVBQWUsRUFBRSxDQUFDakIsMkJBQWFJLE9BQWQsQ0FETDtBQUVaYyxJQUFBQSxPQUFPLEVBQUU7QUFGRyxHQXJIbUM7QUF5SG5ELHlCQUF1QjtBQUNuQkQsSUFBQUEsZUFBZSxFQUFFLENBQUNqQiwyQkFBYUksT0FBZCxDQURFO0FBRW5CYyxJQUFBQSxPQUFPLEVBQUU7QUFGVSxHQXpINEI7QUE2SG5ELDBCQUF3QjtBQUNwQkgsSUFBQUEsU0FBUyxFQUFFLElBRFM7QUFFcEJFLElBQUFBLGVBQWUsRUFBRVAsY0FGRztBQUdwQk0sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLDBDQUFKLENBSE87QUFJcEJFLElBQUFBLE9BQU8sRUFBRTtBQUpXLEdBN0gyQjtBQW1JbkQsOEJBQTRCO0FBQ3hCRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURPO0FBRXhCUyxJQUFBQSxPQUFPLEVBQUU7QUFGZSxHQW5JdUI7QUF1SW5ELGtCQUFnQjtBQUNaRixJQUFBQSxXQUFXLEVBQUUsMEJBQUksV0FBSixDQUREO0FBRVpDLElBQUFBLGVBQWUsRUFBRVIsdUJBRkw7QUFHWlMsSUFBQUEsT0FBTyxFQUFFLEVBSEc7QUFJWkMsSUFBQUEsVUFBVSxFQUFFLElBQUlJLDJCQUFKO0FBSkEsR0F2SW1DO0FBNkluRCx1QkFBcUI7QUFDakJQLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxpQkFBSixDQURJO0FBRWpCQyxJQUFBQSxlQUFlLEVBQUVSLHVCQUZBO0FBR2pCUyxJQUFBQSxPQUFPLEVBQUU7QUFIUSxHQTdJOEI7QUFrSm5ELHVDQUFxQztBQUNqQ0QsSUFBQUEsZUFBZSxFQUFFUix1QkFEZ0I7QUFFakNPLElBQUFBLFdBQVcsRUFBRSwwQkFBSSx1Q0FBSixDQUZvQjtBQUdqQ0UsSUFBQUEsT0FBTyxFQUFFLElBSHdCO0FBSWpDTSxJQUFBQSxtQkFBbUIsRUFBRTtBQUpZLEdBbEpjO0FBd0puRCw2Q0FBMkM7QUFDdkNQLElBQUFBLGVBQWUsRUFBRVIsdUJBRHNCO0FBRXZDTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksc0JBQUosQ0FGMEI7QUFHdkNFLElBQUFBLE9BQU8sRUFBRTtBQUg4QixHQXhKUTtBQTZKbkQ7QUFDQSx5Q0FBdUM7QUFDbkNELElBQUFBLGVBQWUsRUFBRVgsc0JBRGtCO0FBRW5DWSxJQUFBQSxPQUFPLEVBQUU7QUFGMEIsR0E5Slk7QUFrS25ELHNCQUFvQjtBQUNoQkQsSUFBQUEsZUFBZSxFQUFFTiwyQkFERDtBQUVoQkssSUFBQUEsV0FBVyxFQUFFLDBCQUFJLG9DQUFKLENBRkc7QUFHaEJFLElBQUFBLE9BQU8sRUFBRTtBQUhPLEdBbEsrQjtBQXVLbkQsb0JBQWtCO0FBQ2RELElBQUFBLGVBQWUsRUFBRVYsOEJBREg7QUFFZFMsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLHlDQUFKLENBRkM7QUFHZEUsSUFBQUEsT0FBTyxFQUFFLElBSEs7QUFJZE0sSUFBQUEsbUJBQW1CLEVBQUU7QUFKUCxHQXZLaUM7QUE2S25ELG9CQUFrQjtBQUNkUCxJQUFBQSxlQUFlLEVBQUVWLDhCQURIO0FBRWRTLElBQUFBLFdBQVcsRUFBRSwwQkFBSSwwREFBSixDQUZDO0FBR2RFLElBQUFBLE9BQU8sRUFBRSxJQUhLO0FBSWRNLElBQUFBLG1CQUFtQixFQUFFO0FBSlAsR0E3S2lDO0FBbUxuRCx1QkFBcUI7QUFDakJQLElBQUFBLGVBQWUsRUFBRVYsOEJBREE7QUFFakJTLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxxQkFBSixDQUZJO0FBR2pCRSxJQUFBQSxPQUFPLEVBQUUsSUFIUTtBQUlqQk0sSUFBQUEsbUJBQW1CLEVBQUU7QUFKSixHQW5MOEI7QUF5TG5ELDRCQUEwQjtBQUN0QlAsSUFBQUEsZUFBZSxFQUFFViw4QkFESztBQUV0QlMsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLDJCQUFKLENBRlM7QUFHdEJFLElBQUFBLE9BQU8sRUFBRSxJQUhhO0FBSXRCTSxJQUFBQSxtQkFBbUIsRUFBRTtBQUpDLEdBekx5QjtBQStMbkQsc0JBQW9CO0FBQ2hCUCxJQUFBQSxlQUFlLEVBQUVsQixvQkFERDtBQUVoQmlCLElBQUFBLFdBQVcsRUFBRSwwQkFBSSx3Q0FBSixDQUZHO0FBR2hCRSxJQUFBQSxPQUFPLEVBQUUsSUFITztBQUloQk0sSUFBQUEsbUJBQW1CLEVBQUU7QUFKTCxHQS9MK0I7QUFxTW5ELDhCQUE0QjtBQUN4QlAsSUFBQUEsZUFBZSxFQUFFUix1QkFETztBQUV4Qk8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLGlEQUFKLENBRlc7QUFHeEJFLElBQUFBLE9BQU8sRUFBRTtBQUhlLEdBck11QjtBQTBNbkQsMEJBQXdCO0FBQ3BCRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURHO0FBRXBCTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksZ0NBQUosQ0FGTztBQUdwQkUsSUFBQUEsT0FBTyxFQUFFO0FBSFcsR0ExTTJCO0FBK01uRCwyQkFBeUI7QUFDckJELElBQUFBLGVBQWUsRUFBRVIsdUJBREk7QUFFckJPLElBQUFBLFdBQVcsRUFBRSwwQkFBSSwwQkFBSixDQUZRO0FBR3JCRSxJQUFBQSxPQUFPLEVBQUU7QUFIWSxHQS9NMEI7QUFvTm5ELDRDQUEwQztBQUN0Q0QsSUFBQUEsZUFBZSxFQUFFUix1QkFEcUI7QUFFdENPLElBQUFBLFdBQVcsRUFBRSwwQkFBSSw2REFBSixDQUZ5QjtBQUd0Q0UsSUFBQUEsT0FBTyxFQUFFO0FBSDZCLEdBcE5TO0FBeU5uRCx5QkFBdUI7QUFDbkJELElBQUFBLGVBQWUsRUFBRVIsdUJBREU7QUFFbkJPLElBQUFBLFdBQVcsRUFBRSwwQkFBSSwrQkFBSixDQUZNO0FBR25CRSxJQUFBQSxPQUFPLEVBQUU7QUFIVSxHQXpONEI7QUE4Tm5ELHlCQUF1QjtBQUNuQkQsSUFBQUEsZUFBZSxFQUFFUix1QkFERTtBQUVuQk8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLGtDQUFKLENBRk07QUFHbkJFLElBQUFBLE9BQU8sRUFBRTtBQUhVLEdBOU40QjtBQW1PbkQsaUNBQStCO0FBQzNCRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURVO0FBRTNCTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksNERBQUosQ0FGYztBQUczQkUsSUFBQUEsT0FBTyxFQUFFO0FBSGtCLEdBbk9vQjtBQXdPbkQsK0JBQTZCO0FBQ3pCRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURRO0FBRXpCTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksd0NBQUosQ0FGWTtBQUd6QkUsSUFBQUEsT0FBTyxFQUFFLElBSGdCO0FBSXpCTSxJQUFBQSxtQkFBbUIsRUFBRTtBQUpJLEdBeE9zQjtBQThPbkQsZ0NBQThCO0FBQzFCUCxJQUFBQSxlQUFlLEVBQUVSLHVCQURTO0FBRTFCTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksMEJBQUosQ0FGYTtBQUcxQkUsSUFBQUEsT0FBTyxFQUFFLElBSGlCO0FBSTFCTSxJQUFBQSxtQkFBbUIsRUFBRTtBQUpLLEdBOU9xQjtBQW9QbkQsNENBQTBDO0FBQ3RDUCxJQUFBQSxlQUFlLEVBQUVSLHVCQURxQjtBQUV0Q1MsSUFBQUEsT0FBTyxFQUFFO0FBRjZCLEdBcFBTO0FBd1BuRCxvQ0FBa0M7QUFDOUJELElBQUFBLGVBQWUsRUFBRVIsdUJBRGE7QUFFOUJTLElBQUFBLE9BQU8sRUFBRTtBQUZxQixHQXhQaUI7QUE0UG5ELDZCQUEyQjtBQUN2QkQsSUFBQUEsZUFBZSxFQUFFUix1QkFETTtBQUV2Qk8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLDJCQUFKLENBRlU7QUFHdkJFLElBQUFBLE9BQU8sRUFBRSxJQUhjO0FBSXZCTSxJQUFBQSxtQkFBbUIsRUFBRTtBQUpFLEdBNVB3QjtBQWtRbkQsNkJBQTJCO0FBQ3ZCUCxJQUFBQSxlQUFlLEVBQUVSLHVCQURNO0FBRXZCTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksMkJBQUosQ0FGVTtBQUd2QkUsSUFBQUEsT0FBTyxFQUFFO0FBSGMsR0FsUXdCO0FBdVFuRCxvQkFBa0I7QUFDZEQsSUFBQUEsZUFBZSxFQUFFUix1QkFESDtBQUVkTyxJQUFBQSxXQUFXLEVBQUVTLGtCQUFRLDBCQUFJLDJCQUFKLENBQVIsR0FBMkMsMEJBQUksd0JBQUosQ0FGMUM7QUFHZFAsSUFBQUEsT0FBTyxFQUFFO0FBSEssR0F2UWlDO0FBNFFuRCwwQ0FBd0M7QUFDcENELElBQUFBLGVBQWUsRUFBRVIsdUJBRG1CO0FBRXBDTyxJQUFBQSxXQUFXLEVBQUVTLGtCQUFRLDBCQUFJLHVDQUFKLENBQVIsR0FBdUQsMEJBQUksb0NBQUosQ0FGaEM7QUFHcENQLElBQUFBLE9BQU8sRUFBRTtBQUgyQixHQTVRVztBQWlSbkQsMkNBQXlDO0FBQ3JDRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURvQjtBQUVyQ08sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLHdDQUFKLENBRndCO0FBR3JDRSxJQUFBQSxPQUFPLEVBQUU7QUFINEIsR0FqUlU7QUFzUm5ELHFDQUFtQztBQUMvQkQsSUFBQUEsZUFBZSxFQUFFUix1QkFEYztBQUUvQk8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLHlCQUFKLENBRmtCO0FBRy9CRSxJQUFBQSxPQUFPLEVBQUU7QUFIc0IsR0F0UmdCO0FBMlJuRCw2QkFBMkI7QUFDdkJELElBQUFBLGVBQWUsRUFBRVIsdUJBRE07QUFFdkJPLElBQUFBLFdBQVcsRUFBRSwwQkFBSSwrQkFBSixDQUZVO0FBR3ZCRSxJQUFBQSxPQUFPLEVBQUUsSUFIYztBQUl2Qk0sSUFBQUEsbUJBQW1CLEVBQUUsMEJBSkU7QUFLdkI7QUFDQUwsSUFBQUEsVUFBVSxFQUFFLElBQUlPLDRCQUFKLENBQXdCQyxxQkFBVUMsV0FBbEMsRUFBK0MsSUFBL0M7QUFOVyxHQTNSd0I7QUFtU25ELFdBQVM7QUFDTFgsSUFBQUEsZUFBZSxFQUFFUix1QkFEWjtBQUVMUyxJQUFBQSxPQUFPLEVBQUUsT0FGSjtBQUdMQyxJQUFBQSxVQUFVLEVBQUUsSUFBSVUsd0JBQUo7QUFIUCxHQW5TMEM7QUF3U25ELG1CQUFpQjtBQUNiWixJQUFBQSxlQUFlLEVBQUVSLHVCQURKO0FBRWJTLElBQUFBLE9BQU8sRUFBRTtBQUZJLEdBeFNrQztBQTRTbkQsc0JBQW9CO0FBQ2hCRCxJQUFBQSxlQUFlLEVBQUVOLDJCQUREO0FBRWhCTyxJQUFBQSxPQUFPLEVBQUUsSUFGTztBQUdoQkYsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLG9CQUFKO0FBSEcsR0E1UytCO0FBaVRuRCxtQkFBaUI7QUFDYkMsSUFBQUEsZUFBZSxFQUFFTiwyQkFESjtBQUViTyxJQUFBQSxPQUFPLEVBQUUsS0FGSTtBQUdiRixJQUFBQSxXQUFXLEVBQUUsMEJBQUksbUJBQUosQ0FIQTtBQUliRyxJQUFBQSxVQUFVLEVBQUUsSUFBSVcsZ0NBQUo7QUFKQyxHQWpUa0M7QUF1VG5ELGdCQUFjO0FBQ1ZiLElBQUFBLGVBQWUsRUFBRU4sMkJBRFA7QUFFVk8sSUFBQUEsT0FBTyxFQUFFLEVBRkM7QUFHVkYsSUFBQUEsV0FBVyxFQUFFLDBCQUFJLGtCQUFKLENBSEg7QUFJVkcsSUFBQUEsVUFBVSxFQUFFLElBQUlZLDZCQUFKO0FBSkYsR0F2VHFDO0FBNlRuRCwyQkFBeUI7QUFDckJkLElBQUFBLGVBQWUsRUFBRUwsdUNBREk7QUFFckJJLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxrQ0FBSixDQUZRO0FBR3JCRSxJQUFBQSxPQUFPLEVBQUUsSUFIWTtBQUlyQk0sSUFBQUEsbUJBQW1CLEVBQUU7QUFKQSxHQTdUMEI7QUFtVW5ELHdCQUFzQjtBQUNsQlAsSUFBQUEsZUFBZSxFQUFFTiwyQkFEQztBQUVsQk8sSUFBQUEsT0FBTyxFQUFFO0FBRlMsR0FuVTZCO0FBdVVuRCx1QkFBcUI7QUFDakJELElBQUFBLGVBQWUsRUFBRU4sMkJBREE7QUFFakJPLElBQUFBLE9BQU8sRUFBRTtBQUZRLEdBdlU4QjtBQTJVbkQsdUJBQXFCO0FBQ2pCRCxJQUFBQSxlQUFlLEVBQUVOLDJCQURBO0FBRWpCTyxJQUFBQSxPQUFPLEVBQUU7QUFGUSxHQTNVOEI7QUErVW5ELGNBQVk7QUFDUkQsSUFBQUEsZUFBZSxFQUFFTCx1Q0FEVDtBQUVSTSxJQUFBQSxPQUFPLEVBQUU7QUFGRCxHQS9VdUM7QUFtVm5ELHNCQUFvQjtBQUNoQjtBQUNBRCxJQUFBQSxlQUFlLEVBQUUsQ0FBQ2pCLDJCQUFhSSxPQUFkLENBRkQ7QUFHaEJjLElBQUFBLE9BQU8sRUFBRTtBQUhPLEdBblYrQjtBQXdWbkQsa0JBQWdCO0FBQ1o7QUFDQUQsSUFBQUEsZUFBZSxFQUFFLENBQUNqQiwyQkFBYUksT0FBZCxDQUZMO0FBR1pjLElBQUFBLE9BQU8sRUFBRTtBQUhHLEdBeFZtQztBQTZWbkQsNEJBQTBCO0FBQ3RCRCxJQUFBQSxlQUFlLEVBQUUsQ0FBQ2pCLDJCQUFhSSxPQUFkLENBREs7QUFFdEJjLElBQUFBLE9BQU8sRUFBRTtBQUZhLEdBN1Z5QjtBQWlXbkQsNkJBQTJCO0FBQ3ZCRCxJQUFBQSxlQUFlLEVBQUUsQ0FBQ2pCLDJCQUFhSSxPQUFkLENBRE07QUFFdkJjLElBQUFBLE9BQU8sRUFBRTtBQUZjLEdBald3QjtBQXFXbkQsb0JBQWtCO0FBQ2RELElBQUFBLGVBQWUsRUFBRSxDQUFDakIsMkJBQWFHLFlBQWQsRUFBNEJILDJCQUFhRSxXQUF6QyxDQURIO0FBRWQ4QixJQUFBQSx5QkFBeUIsRUFBRSxJQUZiO0FBR2RkLElBQUFBLE9BQU8sRUFBRSxFQUhLLENBR0Q7O0FBSEMsR0FyV2lDO0FBMFduRCxvQkFBa0I7QUFDZEQsSUFBQUEsZUFBZSxFQUFFTCx1Q0FESDtBQUVkSSxJQUFBQSxXQUFXLEVBQUUsMEJBQUkscUJBQUosQ0FGQztBQUdkRSxJQUFBQSxPQUFPLEVBQUU7QUFISyxHQTFXaUM7QUErV25ELG1CQUFpQjtBQUNiRCxJQUFBQSxlQUFlLEVBQUVMLHVDQURKO0FBRWJNLElBQUFBLE9BQU8sRUFBRTtBQUZJLEdBL1drQztBQW1YbkQsdUJBQXFCO0FBQ2pCRCxJQUFBQSxlQUFlLEVBQUVMLHVDQURBO0FBRWpCTSxJQUFBQSxPQUFPLEVBQUU7QUFGUSxHQW5YOEI7QUF1WG5ELGlDQUErQjtBQUMzQkQsSUFBQUEsZUFBZSxFQUFFTCx1Q0FEVTtBQUUzQk0sSUFBQUEsT0FBTyxFQUFFO0FBRmtCLEdBdlhvQjtBQTJYbkQsb0NBQWtDO0FBQzlCRCxJQUFBQSxlQUFlLEVBQUVMLHVDQURhO0FBRTlCTSxJQUFBQSxPQUFPLEVBQUU7QUFGcUIsR0EzWGlCO0FBK1huRCxnQ0FBOEI7QUFDMUI7QUFDQTtBQUNBRCxJQUFBQSxlQUFlLEVBQUUsQ0FBQ2pCLDJCQUFhRSxXQUFkLEVBQTJCRiwyQkFBYUMsTUFBeEMsQ0FIUztBQUkxQitCLElBQUFBLHlCQUF5QixFQUFFLElBSkQ7QUFLMUJoQixJQUFBQSxXQUFXLEVBQUU7QUFDVCxpQkFBVywwQkFBSSx3RUFBSixDQURGO0FBRVQscUJBQWUsMEJBQUkscUZBQUo7QUFGTixLQUxhO0FBUzFCRSxJQUFBQSxPQUFPLEVBQUUsS0FUaUI7QUFVMUJDLElBQUFBLFVBQVUsRUFBRSxJQUFJTyw0QkFBSixDQUF3QkMscUJBQVVNLGtCQUFsQztBQVZjLEdBL1hxQjtBQTJZbkQsd0JBQXNCO0FBQ2xCaEIsSUFBQUEsZUFBZSxFQUFFViw4QkFEQztBQUVsQlMsSUFBQUEsV0FBVyxFQUFFO0FBQ1QsaUJBQVcsMEJBQUksdUNBQUosQ0FERjtBQUVULHNCQUFnQiwwQkFBSSxzREFBSixDQUZQO0FBR1QsY0FBUSwwQkFBSSw4REFBSjtBQUhDLEtBRks7QUFPbEJFLElBQUFBLE9BQU8sRUFBRSxJQVBTO0FBUWxCQyxJQUFBQSxVQUFVLEVBQUUsSUFBSU8sNEJBQUosQ0FBd0JDLHFCQUFVTyxXQUFsQztBQVJNLEdBM1k2QjtBQXFabkQsNkJBQTJCO0FBQ3ZCakIsSUFBQUEsZUFBZSxFQUFFLENBQUNqQiwyQkFBYUUsV0FBZCxFQUEyQkYsMkJBQWFHLFlBQXhDLENBRE07QUFFdkJhLElBQUFBLFdBQVcsRUFBRTtBQUNULHNCQUFnQiwwQkFBSSxzREFBSjtBQURQLEtBRlU7QUFLdkJFLElBQUFBLE9BQU8sRUFBRSxLQUxjO0FBTXZCQyxJQUFBQSxVQUFVLEVBQUUsSUFBSU8sNEJBQUosQ0FBd0JDLHFCQUFVTyxXQUFsQztBQU5XLEdBclp3QjtBQTZabkQsZUFBYTtBQUNUakIsSUFBQUEsZUFBZSxFQUFFViw4QkFEUjtBQUVUUyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksYUFBSixDQUZKO0FBR1RFLElBQUFBLE9BQU8sRUFBRTtBQUNMaUIsTUFBQUEsYUFBYSxFQUFFLElBRFY7QUFDZ0I7QUFDckJDLE1BQUFBLGVBQWUsRUFBRSxJQUZaLENBRWtCOztBQUZsQjtBQUhBLEdBN1pzQztBQXFhbkQsMEJBQXdCO0FBQ3BCbkIsSUFBQUEsZUFBZSxFQUFFTiwyQkFERztBQUVwQk8sSUFBQUEsT0FBTyxFQUFFLEtBRlc7QUFHcEJDLElBQUFBLFVBQVUsRUFBRSxJQUFJa0IsdURBQUo7QUFIUSxHQXJhMkI7QUEwYW5ELHVCQUFxQjtBQUNqQnBCLElBQUFBLGVBQWUsRUFBRVgsc0JBREE7QUFFakJZLElBQUFBLE9BQU8sRUFBRTtBQUZRLEdBMWE4QjtBQThhbkQsNkJBQTJCO0FBQ3ZCRCxJQUFBQSxlQUFlLEVBQUVOLDJCQURNO0FBRXZCTyxJQUFBQSxPQUFPLEVBQUUsSUFGYztBQUd2QkMsSUFBQUEsVUFBVSxFQUFFLElBQUltQiwwREFBSjtBQUhXLEdBOWF3QjtBQW1ibkQsK0JBQTZCO0FBQ3pCckIsSUFBQUEsZUFBZSxFQUFFTiwyQkFEUTtBQUV6Qk8sSUFBQUEsT0FBTyxFQUFFO0FBRmdCLEdBbmJzQjtBQXVibkQsNkJBQTJCO0FBQ3ZCRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURNO0FBRXZCTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksZ0RBQUosQ0FGVTtBQUd2QkUsSUFBQUEsT0FBTyxFQUFFO0FBSGMsR0F2YndCO0FBNGJuRCx5QkFBdUI7QUFDbkJELElBQUFBLGVBQWUsRUFBRSxDQUFDakIsMkJBQWFFLFdBQWQsQ0FERTtBQUVuQmdCLElBQUFBLE9BQU8sRUFBRTtBQUZVLEdBNWI0QjtBQWdjbkQsb0NBQWtDO0FBQzlCRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURhO0FBRTlCTyxJQUFBQSxXQUFXLEVBQUUsMEJBQUksaUVBQUosQ0FGaUI7QUFHOUJFLElBQUFBLE9BQU8sRUFBRTtBQUhxQixHQWhjaUI7QUFxY25ELHdCQUFzQjtBQUNsQkQsSUFBQUEsZUFBZSxFQUFFUix1QkFEQztBQUVsQk8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLHNCQUFKLENBRks7QUFHbEJFLElBQUFBLE9BQU8sRUFBRTtBQUhTLEdBcmM2QjtBQTBjbkQsNkJBQTJCO0FBQ3ZCRCxJQUFBQSxlQUFlLEVBQUVOLDJCQURNO0FBRXZCTyxJQUFBQSxPQUFPLEVBQUU7QUFDTHFCLE1BQUFBLEtBQUssRUFBRSxFQURGO0FBRUxDLE1BQUFBLElBQUksRUFBRTtBQUZEO0FBRmMsR0ExY3dCO0FBaWRuRDtBQUNBLGtDQUFnQztBQUM1QnZCLElBQUFBLGVBQWUsRUFBRVIsdUJBRFc7QUFFNUJPLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxxQkFBSixDQUZlO0FBRzVCRSxJQUFBQSxPQUFPLEVBQUU7QUFIbUIsR0FsZG1CO0FBdWRuRDtBQUNBLGdDQUE4QjtBQUMxQkQsSUFBQUEsZUFBZSxFQUFFUix1QkFEUztBQUUxQk8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLDRDQUFKLENBRmE7QUFHMUJFLElBQUFBLE9BQU8sRUFBRTtBQUhpQixHQXhkcUI7QUE2ZG5ELGlCQUFlO0FBQ1hELElBQUFBLGVBQWUsRUFBRVIsdUJBRE47QUFFWE8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLDZEQUFKLENBRkY7QUFHWEUsSUFBQUEsT0FBTyxFQUFFO0FBSEUsR0E3ZG9DO0FBa2VuRCxnQ0FBOEI7QUFDMUJGLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxnQ0FBSixDQURhO0FBRTFCQyxJQUFBQSxlQUFlLEVBQUVOLDJCQUZTO0FBRzFCTyxJQUFBQSxPQUFPLEVBQUU7QUFIaUIsR0FsZXFCO0FBdWVuRCxrQkFBZ0I7QUFDWkQsSUFBQUEsZUFBZSxFQUFFTCx1Q0FETDtBQUVaSSxJQUFBQSxXQUFXLEVBQUUsMEJBQUksb0JBQUosQ0FGRDtBQUdaRSxJQUFBQSxPQUFPLEVBQUUsS0FIRztBQUlaQyxJQUFBQSxVQUFVLEVBQUUsSUFBSUMsaUNBQUo7QUFKQSxHQXZlbUM7QUE2ZW5ELDhCQUE0QjtBQUN4QkgsSUFBQUEsZUFBZSxFQUFFTiwyQkFETztBQUV4QkssSUFBQUEsV0FBVyxFQUFFLDBCQUNULDRFQUNBLG9FQUZTLENBRlc7QUFNeEI7QUFDQUUsSUFBQUEsT0FBTyxFQUFFO0FBUGUsR0E3ZXVCO0FBc2ZuRCxnQkFBYztBQUNWRCxJQUFBQSxlQUFlLEVBQUVSLHVCQURQO0FBRVZPLElBQUFBLFdBQVcsRUFBRSwwQkFBSSxxQ0FBSixDQUZIO0FBR1ZFLElBQUFBLE9BQU8sRUFBRTtBQUhDLEdBdGZxQztBQTJmbkQsMEJBQXdCO0FBQ3BCRCxJQUFBQSxlQUFlLEVBQUVOLDJCQURHO0FBRXBCTyxJQUFBQSxPQUFPLEVBQUU7QUFGVyxHQTNmMkI7QUErZm5ELDJCQUF5QjtBQUNyQkQsSUFBQUEsZUFBZSxFQUFFTiwyQkFESTtBQUVyQk8sSUFBQUEsT0FBTyxFQUFFO0FBRlksR0EvZjBCO0FBbWdCbkQsZ0NBQThCO0FBQzFCRCxJQUFBQSxlQUFlLEVBQUVOLDJCQURTO0FBRTFCTyxJQUFBQSxPQUFPLEVBQUV1Qix3Q0FBaUJDO0FBRkEsR0FuZ0JxQjtBQXVnQm5ELGlDQUErQjtBQUMzQnpCLElBQUFBLGVBQWUsRUFBRU4sMkJBRFU7QUFFM0JPLElBQUFBLE9BQU8sRUFBRXVCLHdDQUFpQkU7QUFGQyxHQXZnQm9CO0FBMmdCbkQseUJBQXVCO0FBQ25CMUIsSUFBQUEsZUFBZSxFQUFFTiwyQkFERTtBQUVuQkssSUFBQUEsV0FBVyxFQUFFLDBCQUFJLDBDQUFKLENBRk07QUFHbkJFLElBQUFBLE9BQU8sRUFBRTtBQUhVLEdBM2dCNEI7QUFnaEJuRCxzQkFBb0I7QUFDaEJELElBQUFBLGVBQWUsRUFBRU4sMkJBREQ7QUFFaEJLLElBQUFBLFdBQVcsRUFBRSwwQkFBSSx5Q0FBSixDQUZHO0FBR2hCRSxJQUFBQSxPQUFPLEVBQUU7QUFITyxHQWhoQitCO0FBcWhCbkQsK0JBQTZCO0FBQ3pCO0FBQ0E7QUFDQUQsSUFBQUEsZUFBZSxFQUFFTCx1Q0FIUTtBQUl6Qk0sSUFBQUEsT0FBTyxFQUFFLElBSmdCO0FBS3pCQyxJQUFBQSxVQUFVLEVBQUUsSUFBSU8sNEJBQUosQ0FBd0JDLHFCQUFVaUIsSUFBbEM7QUFMYSxHQXJoQnNCO0FBNGhCbkQsb0NBQWtDO0FBQzlCM0IsSUFBQUEsZUFBZSxFQUFFTiwyQkFEYTtBQUU5QkssSUFBQUEsV0FBVyxFQUFFLDBCQUFJLHFDQUFKLENBRmlCO0FBRzlCRSxJQUFBQSxPQUFPLEVBQUUsS0FIcUI7QUFJOUJDLElBQUFBLFVBQVUsRUFBRSxJQUFJMEIsOENBQUosQ0FBMkIsQ0FDbkM7QUFDQTtBQUNBO0FBQ0EsUUFBSW5CLDRCQUFKLENBQXdCQyxxQkFBVU0sa0JBQWxDLENBSm1DLEVBS25DLElBQUlhLHFDQUFKLENBQ0lDLHFCQUFhQyxTQUFiLENBQXVCQyxnQ0FEM0IsRUFDNkQsSUFEN0QsQ0FMbUMsQ0FBM0I7QUFKa0IsR0E1aEJpQjtBQTBpQm5ELHlCQUF1QjtBQUNuQjtBQUNBO0FBQ0FoQyxJQUFBQSxlQUFlLEVBQUUsQ0FBQ2pCLDJCQUFhRSxXQUFkLEVBQTJCRiwyQkFBYUMsTUFBeEMsQ0FIRTtBQUluQitCLElBQUFBLHlCQUF5QixFQUFFLElBSlI7QUFLbkJoQixJQUFBQSxXQUFXLEVBQUUsMEJBQUksd0JBQUosQ0FMTTtBQU1uQkUsSUFBQUEsT0FBTyxFQUFFO0FBTlUsR0ExaUI0QjtBQWtqQm5ELFlBQVU7QUFDTkQsSUFBQUEsZUFBZSxFQUFFUix1QkFEWDtBQUVOUyxJQUFBQSxPQUFPLEVBQUVnQyxlQUFPQztBQUZWLEdBbGpCeUM7QUFzakJuRCxxQkFBbUI7QUFDZmxDLElBQUFBLGVBQWUsRUFBRVIsdUJBREY7QUFFZk8sSUFBQUEsV0FBVyxFQUFFLDBCQUFJLDZEQUFKLENBRkU7QUFHZkUsSUFBQUEsT0FBTyxFQUFFLElBSE07QUFJZkMsSUFBQUEsVUFBVSxFQUFFLElBQUlpQyxnQ0FBSjtBQUpHLEdBdGpCZ0M7QUE0akJuRCxvQkFBa0I7QUFBRTtBQUNoQm5DLElBQUFBLGVBQWUsRUFBRVgsc0JBREg7QUFFZFksSUFBQUEsT0FBTyxFQUFFO0FBRkssR0E1akJpQztBQWdrQm5ELG9CQUFrQjtBQUNkRCxJQUFBQSxlQUFlLEVBQUVYLHNCQURIO0FBRWRZLElBQUFBLE9BQU8sRUFBRTtBQUZLLEdBaGtCaUM7QUFva0JuRCx1QkFBcUI7QUFDakJELElBQUFBLGVBQWUsRUFBRVIsdUJBREE7QUFFakJTLElBQUFBLE9BQU8sRUFBRTtBQUZRLEdBcGtCOEI7QUF3a0JuRCxHQUFDUyxxQkFBVTBCLG1CQUFYLEdBQWlDO0FBQzdCcEMsSUFBQUEsZUFBZSxFQUFFSixpQkFEWTtBQUU3QkssSUFBQUEsT0FBTyxFQUFFO0FBRm9CLEdBeGtCa0I7QUE0a0JuRCxHQUFDUyxxQkFBVU0sa0JBQVgsR0FBZ0M7QUFDNUJoQixJQUFBQSxlQUFlLEVBQUVKLGlCQURXO0FBRTVCSyxJQUFBQSxPQUFPLEVBQUU7QUFGbUIsR0E1a0JtQjtBQWdsQm5ELEdBQUNTLHFCQUFVTyxXQUFYLEdBQXlCO0FBQ3JCakIsSUFBQUEsZUFBZSxFQUFFSixpQkFESTtBQUVyQkssSUFBQUEsT0FBTyxFQUFFO0FBRlksR0FobEIwQjtBQW9sQm5ELEdBQUNTLHFCQUFVMkIsT0FBWCxHQUFxQjtBQUNqQnJDLElBQUFBLGVBQWUsRUFBRUosaUJBREE7QUFFakJLLElBQUFBLE9BQU8sRUFBRTtBQUZRLEdBcGxCOEI7QUF3bEJuRCxHQUFDUyxxQkFBVWlCLElBQVgsR0FBa0I7QUFDZDNCLElBQUFBLGVBQWUsRUFBRUosaUJBREg7QUFFZEssSUFBQUEsT0FBTyxFQUFFO0FBRkssR0F4bEJpQztBQTRsQm5ELEdBQUNTLHFCQUFVNEIsUUFBWCxHQUFzQjtBQUNsQnRDLElBQUFBLGVBQWUsRUFBRUosaUJBREM7QUFFbEJLLElBQUFBLE9BQU8sRUFBRTtBQUZTLEdBNWxCNkI7QUFnbUJuRCxHQUFDUyxxQkFBVTZCLFlBQVgsR0FBMEI7QUFDdEJ2QyxJQUFBQSxlQUFlLEVBQUVKLGlCQURLO0FBRXRCSyxJQUFBQSxPQUFPLEVBQUU7QUFGYSxHQWhtQnlCO0FBb21CbkQsR0FBQ1MscUJBQVU4QixhQUFYLEdBQTJCO0FBQ3ZCeEMsSUFBQUEsZUFBZSxFQUFFSixpQkFETTtBQUV2QkssSUFBQUEsT0FBTyxFQUFFO0FBRmMsR0FwbUJ3QjtBQXdtQm5ELEdBQUNTLHFCQUFVK0IsVUFBWCxHQUF3QjtBQUNwQnpDLElBQUFBLGVBQWUsRUFBRUosaUJBREc7QUFFcEJLLElBQUFBLE9BQU8sRUFBRTtBQUZXLEdBeG1CMkI7QUE0bUJuRCxHQUFDUyxxQkFBVWdDLFdBQVgsR0FBeUI7QUFDckIxQyxJQUFBQSxlQUFlLEVBQUVKLGlCQURJO0FBRXJCSyxJQUFBQSxPQUFPLEVBQUU7QUFGWSxHQTVtQjBCO0FBZ25CbkQsR0FBQ1MscUJBQVVpQyxXQUFYLEdBQXlCO0FBQ3JCM0MsSUFBQUEsZUFBZSxFQUFFSixpQkFESTtBQUVyQkssSUFBQUEsT0FBTyxFQUFFO0FBRlksR0FobkIwQjtBQW9uQm5ELEdBQUNTLHFCQUFVa0MsY0FBWCxHQUE0QjtBQUN4QjVDLElBQUFBLGVBQWUsRUFBRUosaUJBRE87QUFFeEJLLElBQUFBLE9BQU8sRUFBRSxJQUZlO0FBR3hCO0FBQ0FDLElBQUFBLFVBQVUsRUFBRSxJQUFJTyw0QkFBSixDQUF3QkMscUJBQVVtQyxZQUFsQztBQUpZLEdBcG5CdUI7QUEwbkJuRCxHQUFDbkMscUJBQVVtQyxZQUFYLEdBQTBCO0FBQ3RCN0MsSUFBQUEsZUFBZSxFQUFFSixpQkFESztBQUV0QkssSUFBQUEsT0FBTyxFQUFFO0FBRmEsR0ExbkJ5QjtBQThuQm5ELEdBQUNTLHFCQUFVb0MsS0FBWCxHQUFtQjtBQUNmOUMsSUFBQUEsZUFBZSxFQUFFSixpQkFERjtBQUVmSyxJQUFBQSxPQUFPLEVBQUUsSUFGTTtBQUdmO0FBQ0FDLElBQUFBLFVBQVUsRUFBRSxJQUFJTyw0QkFBSixDQUF3QkMscUJBQVVDLFdBQWxDO0FBSkcsR0E5bkJnQztBQW9vQm5ELEdBQUNELHFCQUFVQyxXQUFYLEdBQXlCO0FBQ3JCWCxJQUFBQSxlQUFlLEVBQUVKLGlCQURJO0FBRXJCSyxJQUFBQSxPQUFPLEVBQUUsSUFGWTtBQUdyQkMsSUFBQUEsVUFBVSxFQUFFLElBQUlFLCtCQUFKLENBQTJCLGdCQUEzQjtBQUhTLEdBcG9CMEI7QUF5b0JuRCxHQUFDTSxxQkFBVXFDLGdCQUFYLEdBQThCO0FBQzFCL0MsSUFBQUEsZUFBZSxFQUFFSixpQkFEUztBQUUxQkssSUFBQUEsT0FBTyxFQUFFO0FBRmlCO0FBem9CcUIsQ0FBaEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVHJhdmlzIFJhbHN0b25cbkNvcHlyaWdodCAyMDE4LCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcblxuaW1wb3J0IHsgX3RkIH0gZnJvbSAnLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7XG4gICAgTm90aWZpY2F0aW9uQm9keUVuYWJsZWRDb250cm9sbGVyLFxuICAgIE5vdGlmaWNhdGlvbnNFbmFibGVkQ29udHJvbGxlcixcbn0gZnJvbSBcIi4vY29udHJvbGxlcnMvTm90aWZpY2F0aW9uQ29udHJvbGxlcnNcIjtcbmltcG9ydCBDdXN0b21TdGF0dXNDb250cm9sbGVyIGZyb20gXCIuL2NvbnRyb2xsZXJzL0N1c3RvbVN0YXR1c0NvbnRyb2xsZXJcIjtcbmltcG9ydCBUaGVtZUNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9UaGVtZUNvbnRyb2xsZXInO1xuaW1wb3J0IFB1c2hUb01hdHJpeENsaWVudENvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9QdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyJztcbmltcG9ydCBSZWxvYWRPbkNoYW5nZUNvbnRyb2xsZXIgZnJvbSBcIi4vY29udHJvbGxlcnMvUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgRm9udFNpemVDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvRm9udFNpemVDb250cm9sbGVyJztcbmltcG9ydCBTeXN0ZW1Gb250Q29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL1N5c3RlbUZvbnRDb250cm9sbGVyJztcbmltcG9ydCBVc2VTeXN0ZW1Gb250Q29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL1VzZVN5c3RlbUZvbnRDb250cm9sbGVyJztcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFNldHRpbmdDb250cm9sbGVyIGZyb20gXCIuL2NvbnRyb2xsZXJzL1NldHRpbmdDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSBcIi4uL3N0b3Jlcy9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCB7IGlzTWFjIH0gZnJvbSAnLi4vS2V5Ym9hcmQnO1xuaW1wb3J0IFVJRmVhdHVyZUNvbnRyb2xsZXIgZnJvbSBcIi4vY29udHJvbGxlcnMvVUlGZWF0dXJlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSBcIi4vVUlGZWF0dXJlXCI7XG5pbXBvcnQgeyBPcmRlcmVkTXVsdGlDb250cm9sbGVyIH0gZnJvbSBcIi4vY29udHJvbGxlcnMvT3JkZXJlZE11bHRpQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4vTGF5b3V0XCI7XG5pbXBvcnQgUmVkdWNlZE1vdGlvbkNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9SZWR1Y2VkTW90aW9uQ29udHJvbGxlcic7XG5pbXBvcnQgSW5jb21wYXRpYmxlQ29udHJvbGxlciBmcm9tIFwiLi9jb250cm9sbGVycy9JbmNvbXBhdGlibGVDb250cm9sbGVyXCI7XG5cbi8vIFRoZXNlIGFyZSBqdXN0IGEgYnVuY2ggb2YgaGVscGVyIGFycmF5cyB0byBhdm9pZCBjb3B5L3Bhc3RpbmcgYSBidW5jaCBvZiB0aW1lc1xuY29uc3QgTEVWRUxTX1JPT01fU0VUVElOR1MgPSBbXG4gICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuQ09ORklHLFxuXTtcbmNvbnN0IExFVkVMU19ST09NX09SX0FDQ09VTlQgPSBbXG4gICAgU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuQUNDT1VOVCxcbl07XG5jb25zdCBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00gPSBbXG4gICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuQUNDT1VOVCxcbiAgICBTZXR0aW5nTGV2ZWwuQ09ORklHLFxuICAgIFNldHRpbmdMZXZlbC5ST09NLFxuXTtcbmNvbnN0IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTID0gW1xuICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLkFDQ09VTlQsXG4gICAgU2V0dGluZ0xldmVsLkNPTkZJRyxcbl07XG5jb25zdCBMRVZFTFNfRkVBVFVSRSA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5DT05GSUcsXG5dO1xuY29uc3QgTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTID0gW1xuICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG5dO1xuY29uc3QgTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTX1dJVEhfQ09ORklHID0gW1xuICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgU2V0dGluZ0xldmVsLkNPTkZJRyxcbl07XG5jb25zdCBMRVZFTFNfVUlfRkVBVFVSRSA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuQ09ORklHLFxuICAgIC8vIGluIGZ1dHVyZSB3ZSBtaWdodCBoYXZlIGEgLndlbGwta25vd24gbGV2ZWwgb3Igc29tZXRoaW5nXG5dO1xuXG5leHBvcnQgaW50ZXJmYWNlIElTZXR0aW5nIHtcbiAgICAvLyBNdXN0IGJlIHNldCB0byB0cnVlIGZvciBmZWF0dXJlcy4gRGVmYXVsdCBpcyAnZmFsc2UnLlxuICAgIGlzRmVhdHVyZT86IGJvb2xlYW47XG5cbiAgICAvLyBEaXNwbGF5IG5hbWVzIGFyZSBzdHJvbmdseSByZWNvbW1lbmRlZCBmb3IgY2xhcml0eS5cbiAgICAvLyBEaXNwbGF5IG5hbWUgY2FuIGFsc28gYmUgYW4gb2JqZWN0IGZvciBkaWZmZXJlbnQgbGV2ZWxzLlxuICAgIGRpc3BsYXlOYW1lPzogc3RyaW5nIHwge1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gVFMgd2FudHMgdGhlIGtleSB0byBiZSBhIHN0cmluZywgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgICAgIFtsZXZlbDogU2V0dGluZ0xldmVsXTogc3RyaW5nO1xuICAgIH07XG5cbiAgICAvLyBUaGUgc3VwcG9ydGVkIGxldmVscyBhcmUgcmVxdWlyZWQuIFByZWZlcmFibHksIHVzZSB0aGUgcHJlc2V0IGFycmF5c1xuICAgIC8vIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlIHRvIGRlZmluZSB0aGlzIHJhdGhlciB0aGFuIGEgY3VzdG9tIGFycmF5LlxuICAgIHN1cHBvcnRlZExldmVscz86IFNldHRpbmdMZXZlbFtdO1xuXG4gICAgLy8gUmVxdWlyZWQuIENhbiBiZSBhbnkgZGF0YSB0eXBlLiBUaGUgdmFsdWUgc3BlY2lmaWVkIGhlcmUgc2hvdWxkIG1hdGNoXG4gICAgLy8gdGhlIGRhdGEgYmVpbmcgc3RvcmVkIChpZTogaWYgYSBib29sZWFuIGlzIHVzZWQsIHRoZSBzZXR0aW5nIHNob3VsZFxuICAgIC8vIHJlcHJlc2VudCBhIGJvb2xlYW4pLlxuICAgIGRlZmF1bHQ6IGFueTtcblxuICAgIC8vIE9wdGlvbmFsIHNldHRpbmdzIGNvbnRyb2xsZXIuIFNlZSBTZXR0aW5nc0NvbnRyb2xsZXIgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgY29udHJvbGxlcj86IFNldHRpbmdDb250cm9sbGVyO1xuXG4gICAgLy8gT3B0aW9uYWwgZmxhZyB0byBtYWtlIHN1cHBvcnRlZExldmVscyBiZSByZXNwZWN0ZWQgYXMgdGhlIG9yZGVyIHRvIGhhbmRsZVxuICAgIC8vIHNldHRpbmdzLiBUaGUgZmlyc3QgZWxlbWVudCBpcyB0cmVhdGVkIGFzIFwibW9zdCBwcmVmZXJyZWRcIi4gVGhlIFwiZGVmYXVsdFwiXG4gICAgLy8gbGV2ZWwgaXMgYWx3YXlzIGFwcGVuZGVkIHRvIHRoZSBlbmQuXG4gICAgc3VwcG9ydGVkTGV2ZWxzQXJlT3JkZXJlZD86IGJvb2xlYW47XG5cbiAgICAvLyBPcHRpb25hbCB2YWx1ZSB0byBpbnZlcnQgYSBib29sZWFuIHNldHRpbmcncyB2YWx1ZS4gVGhlIHN0cmluZyBnaXZlbiB3aWxsXG4gICAgLy8gYmUgcmVhZCBhcyB0aGUgc2V0dGluZydzIElEIGluc3RlYWQgb2YgdGhlIG9uZSBwcm92aWRlZCBhcyB0aGUga2V5IGZvciB0aGVcbiAgICAvLyBzZXR0aW5nIGRlZmluaXRpb24uIEJ5IHNldHRpbmcgdGhpcywgdGhlIHJldHVybmVkIHZhbHVlIHdpbGwgYXV0b21hdGljYWxseVxuICAgIC8vIGJlIGludmVydGVkLCBleGNlcHQgZm9yIHdoZW4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgcmV0dXJuZWQuIEludmVyc2lvbiB3aWxsXG4gICAgLy8gb2NjdXIgYWZ0ZXIgdGhlIGNvbnRyb2xsZXIgaXMgYXNrZWQgZm9yIGFuIG92ZXJyaWRlLiBUaGlzIHNob3VsZCBiZSB1c2VkIGJ5XG4gICAgLy8gaGlzdG9yaWNhbCBzZXR0aW5ncyB3aGljaCB3ZSBkb24ndCB3YW50IGV4aXN0aW5nIHVzZXIncyB2YWx1ZXMgYmUgd2lwZWQuIERvXG4gICAgLy8gbm90IHVzZSB0aGlzIGZvciBuZXcgc2V0dGluZ3MuXG4gICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTOiB7W3NldHRpbmc6IHN0cmluZ106IElTZXR0aW5nfSA9IHtcbiAgICBcImZlYXR1cmVfc3BhY2VzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU3BhY2VzIHByb3RvdHlwZS4gSW5jb21wYXRpYmxlIHdpdGggQ29tbXVuaXRpZXMsIENvbW11bml0aWVzIHYyIGFuZCBDdXN0b20gVGFncy4gXCIgK1xuICAgICAgICAgICAgXCJSZXF1aXJlcyBjb21wYXRpYmxlIGhvbWVzZXJ2ZXIgZm9yIHNvbWUgZmVhdHVyZXMuXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFJlbG9hZE9uQ2hhbmdlQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX2RuZFwiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgb3B0aW9ucyB0byBlbmFibGUgJ0RvIG5vdCBkaXN0dXJiJyBtb2RlXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV92b2ljZV9tZXNzYWdlc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNlbmQgYW5kIHJlY2VpdmUgdm9pY2UgbWVzc2FnZXMgKGluIGRldmVsb3BtZW50KVwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfbGF0ZXhfbWF0aHNcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJSZW5kZXIgTGFUZVggbWF0aHMgaW4gbWVzc2FnZXNcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX2NvbW11bml0aWVzX3YyX3Byb3RvdHlwZXNcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXG4gICAgICAgICAgICBcIkNvbW11bml0aWVzIHYyIHByb3RvdHlwZXMuIFJlcXVpcmVzIGNvbXBhdGlibGUgaG9tZXNlcnZlci4gXCIgK1xuICAgICAgICAgICAgXCJIaWdobHkgZXhwZXJpbWVudGFsIC0gdXNlIHdpdGggY2F1dGlvbi5cIixcbiAgICAgICAgKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBJbmNvbXBhdGlibGVDb250cm9sbGVyKFwiZmVhdHVyZV9zcGFjZXNcIiksXG4gICAgfSxcbiAgICBcImZlYXR1cmVfbmV3X3NwaW5uZXJcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJOZXcgc3Bpbm5lciBkZXNpZ25cIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX3Bpbm5pbmdcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJNZXNzYWdlIFBpbm5pbmdcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX2N1c3RvbV9zdGF0dXNcIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJDdXN0b20gdXNlciBzdGF0dXMgbWVzc2FnZXNcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgQ3VzdG9tU3RhdHVzQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX2N1c3RvbV90YWdzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiR3JvdXAgJiBmaWx0ZXIgcm9vbXMgYnkgY3VzdG9tIHRhZ3MgKHJlZnJlc2ggdG8gYXBwbHkgY2hhbmdlcylcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgSW5jb21wYXRpYmxlQ29udHJvbGxlcihcImZlYXR1cmVfc3BhY2VzXCIpLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX3N0YXRlX2NvdW50ZXJzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiUmVuZGVyIHNpbXBsZSBjb3VudGVycyBpbiByb29tIGhlYWRlclwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfbWFueV9pbnRlZ3JhdGlvbl9tYW5hZ2Vyc1wiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk11bHRpcGxlIGludGVncmF0aW9uIG1hbmFnZXJzXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9tam9sbmlyXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiVHJ5IG91dCBuZXcgd2F5cyB0byBpZ25vcmUgcGVvcGxlIChleHBlcmltZW50YWwpXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiZmVhdHVyZV9jdXN0b21fdGhlbWVzXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU3VwcG9ydCBhZGRpbmcgY3VzdG9tIHRoZW1lc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfcm9vbWxpc3RfcHJldmlld19yZWFjdGlvbnNfZG1zXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBtZXNzYWdlIHByZXZpZXdzIGZvciByZWFjdGlvbnMgaW4gRE1zXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgLy8gdGhpcyBvcHRpb24gaXMgYSBzdWJzZXQgb2YgYGZlYXR1cmVfcm9vbWxpc3RfcHJldmlld19yZWFjdGlvbnNfYWxsYCBzbyBkaXNhYmxlIGl0IHdoZW4gdGhhdCBvbmUgaXMgZW5hYmxlZFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgSW5jb21wYXRpYmxlQ29udHJvbGxlcihcImZlYXR1cmVfcm9vbWxpc3RfcHJldmlld19yZWFjdGlvbnNfYWxsXCIpLFxuICAgIH0sXG4gICAgXCJmZWF0dXJlX3Jvb21saXN0X3ByZXZpZXdfcmVhY3Rpb25zX2FsbFwiOiB7XG4gICAgICAgIGlzRmVhdHVyZTogdHJ1ZSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgbWVzc2FnZSBwcmV2aWV3cyBmb3IgcmVhY3Rpb25zIGluIGFsbCByb29tc1wiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfZGVoeWRyYXRpb25cIjoge1xuICAgICAgICBpc0ZlYXR1cmU6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJPZmZsaW5lIGVuY3J5cHRlZCBtZXNzYWdpbmcgdXNpbmcgZGVoeWRyYXRlZCBkZXZpY2VzXCIpLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiYWR2YW5jZWRSb29tTGlzdExvZ2dpbmdcIjoge1xuICAgICAgICAvLyBUT0RPOiBSZW1vdmUgZmxhZyBiZWZvcmUgbGF1bmNoOiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDIzMVxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiRW5hYmxlIGFkdmFuY2VkIGRlYnVnZ2luZyBmb3IgdGhlIHJvb20gbGlzdFwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJkb05vdERpc3R1cmJcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuREVWSUNFXSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIm1qb2xuaXJSb29tc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcIm1qb2xuaXJQZXJzb25hbFJvb21cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IFtTZXR0aW5nTGV2ZWwuQUNDT1VOVF0sXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcImZlYXR1cmVfYnJpZGdlX3N0YXRlXCI6IHtcbiAgICAgICAgaXNGZWF0dXJlOiB0cnVlLFxuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19GRUFUVVJFLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBpbmZvIGFib3V0IGJyaWRnZXMgaW4gcm9vbSBzZXR0aW5nc1wiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIlJvb21MaXN0LmJhY2tncm91bmRJbWFnZVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBcImJhc2VGb250U2l6ZVwiOiB7XG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJGb250IHNpemVcIiksXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IDEwLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgRm9udFNpemVDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcInVzZUN1c3RvbUZvbnRTaXplXCI6IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlVzZSBjdXN0b20gc2l6ZVwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIk1lc3NhZ2VDb21wb3NlcklucHV0LnN1Z2dlc3RFbW9qaVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBFbW9qaSBzdWdnZXN0aW9ucyB3aGlsZSB0eXBpbmcnKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZTogJ01lc3NhZ2VDb21wb3NlcklucHV0LmRvbnRTdWdnZXN0RW1vamknLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93U3RpY2tlcnNCdXR0b25cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IHN0aWNrZXJzIGJ1dHRvbicpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgLy8gVE9ETzogV2lyZSB1cCBhcHByb3ByaWF0ZWx5IHRvIFVJIChGVFVFIG5vdGlmaWNhdGlvbnMpXG4gICAgXCJOb3RpZmljYXRpb25zLmFsd2F5c1Nob3dCYWRnZUNvdW50c1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fT1JfQUNDT1VOVCxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInVzZUNvbXBhY3RMYXlvdXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnVXNlIGEgbW9yZSBjb21wYWN0IOKAmE1vZGVybuKAmSBsYXlvdXQnKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dSZWRhY3Rpb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Nob3cgYSBwbGFjZWhvbGRlciBmb3IgcmVtb3ZlZCBtZXNzYWdlcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZVJlZGFjdGlvbnMnLFxuICAgIH0sXG4gICAgXCJzaG93Sm9pbkxlYXZlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGpvaW4vbGVhdmUgbWVzc2FnZXMgKGludml0ZXMva2lja3MvYmFucyB1bmFmZmVjdGVkKScpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZUpvaW5MZWF2ZXMnLFxuICAgIH0sXG4gICAgXCJzaG93QXZhdGFyQ2hhbmdlc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1JPT01fU0VUVElOR1NfV0lUSF9ST09NLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGF2YXRhciBjaGFuZ2VzJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdoaWRlQXZhdGFyQ2hhbmdlcycsXG4gICAgfSxcbiAgICBcInNob3dEaXNwbGF5bmFtZUNoYW5nZXNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX1NFVFRJTkdTX1dJVEhfUk9PTSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnU2hvdyBkaXNwbGF5IG5hbWUgY2hhbmdlcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZURpc3BsYXluYW1lQ2hhbmdlcycsXG4gICAgfSxcbiAgICBcInNob3dSZWFkUmVjZWlwdHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IHJlYWQgcmVjZWlwdHMgc2VudCBieSBvdGhlciB1c2VycycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnaGlkZVJlYWRSZWNlaXB0cycsXG4gICAgfSxcbiAgICBcInNob3dUd2VsdmVIb3VyVGltZXN0YW1wc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Nob3cgdGltZXN0YW1wcyBpbiAxMiBob3VyIGZvcm1hdCAoZS5nLiAyOjMwcG0pJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJhbHdheXNTaG93VGltZXN0YW1wc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0Fsd2F5cyBzaG93IG1lc3NhZ2UgdGltZXN0YW1wcycpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiYXV0b3BsYXlHaWZzQW5kVmlkZW9zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnQXV0b3BsYXkgR0lGcyBhbmQgdmlkZW9zJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJlbmFibGVTeW50YXhIaWdobGlnaHRMYW5ndWFnZURldGVjdGlvblwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBhdXRvbWF0aWMgbGFuZ3VhZ2UgZGV0ZWN0aW9uIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJleHBhbmRDb2RlQnlEZWZhdWx0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnRXhwYW5kIGNvZGUgYmxvY2tzIGJ5IGRlZmF1bHQnKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInNob3dDb2RlTGluZU51bWJlcnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGxpbmUgbnVtYmVycyBpbiBjb2RlIGJsb2NrcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJzY3JvbGxUb0JvdHRvbU9uTWVzc2FnZVNlbnRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdKdW1wIHRvIHRoZSBib3R0b20gb2YgdGhlIHRpbWVsaW5lIHdoZW4geW91IHNlbmQgYSBtZXNzYWdlJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGF2YXRhcnMgaW4gdXNlciBhbmQgcm9vbSBtZW50aW9ucycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBpbnZlcnRlZFNldHRpbmdOYW1lOiAnUGlsbC5zaG91bGRIaWRlUGlsbEF2YXRhcicsXG4gICAgfSxcbiAgICBcIlRleHR1YWxCb2R5LmVuYWJsZUJpZ0Vtb2ppXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnRW5hYmxlIGJpZyBlbW9qaSBpbiBjaGF0JyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdUZXh0dWFsQm9keS5kaXNhYmxlQmlnRW1vamknLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5pc1JpY2hUZXh0RW5hYmxlZFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXIuc2hvd0Zvcm1hdHRpbmdcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwic2VuZFR5cGluZ05vdGlmaWNhdGlvbnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2VuZCB0eXBpbmcgbm90aWZpY2F0aW9uc1wiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgaW52ZXJ0ZWRTZXR0aW5nTmFtZTogJ2RvbnRTZW5kVHlwaW5nTm90aWZpY2F0aW9ucycsXG4gICAgfSxcbiAgICBcInNob3dUeXBpbmdOb3RpZmljYXRpb25zXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgdHlwaW5nIG5vdGlmaWNhdGlvbnNcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImN0cmxGRm9yU2VhcmNoXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IGlzTWFjID8gX3RkKFwiVXNlIENvbW1hbmQgKyBGIHRvIHNlYXJjaFwiKSA6IF90ZChcIlVzZSBDdHJsICsgRiB0byBzZWFyY2hcIiksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5jdHJsRW50ZXJUb1NlbmRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogaXNNYWMgPyBfdGQoXCJVc2UgQ29tbWFuZCArIEVudGVyIHRvIHNlbmQgYSBtZXNzYWdlXCIpIDogX3RkKFwiVXNlIEN0cmwgKyBFbnRlciB0byBzZW5kIGEgbWVzc2FnZVwiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcIk1lc3NhZ2VDb21wb3NlcklucHV0LmF1dG9SZXBsYWNlRW1vamlcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdBdXRvbWF0aWNhbGx5IHJlcGxhY2UgcGxhaW4gdGV4dCBFbW9qaScpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwiVmlkZW9WaWV3LmZsaXBWaWRlb0hvcml6b250YWxseVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ01pcnJvciBsb2NhbCB2aWRlbyBmZWVkJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJUYWdQYW5lbC5lbmFibGVUYWdQYW5lbFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0VuYWJsZSBDb21tdW5pdHkgRmlsdGVyIFBhbmVsJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICdUYWdQYW5lbC5kaXNhYmxlVGFnUGFuZWwnLFxuICAgICAgICAvLyBXZSBmb3JjZSB0aGUgdmFsdWUgdG8gdHJ1ZSBiZWNhdXNlIHRoZSBpbnZlcnRlZFNldHRpbmdOYW1lIGNhdXNlcyBpdCB0byBmbGlwXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5Db21tdW5pdGllcywgdHJ1ZSksXG4gICAgfSxcbiAgICBcInRoZW1lXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogXCJsaWdodFwiLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVGhlbWVDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcImN1c3RvbV90aGVtZXNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICB9LFxuICAgIFwidXNlX3N5c3RlbV90aGVtZVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiTWF0Y2ggc3lzdGVtIHRoZW1lXCIpLFxuICAgIH0sXG4gICAgXCJ1c2VTeXN0ZW1Gb250XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiVXNlIGEgc3lzdGVtIGZvbnRcIiksXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBVc2VTeXN0ZW1Gb250Q29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJzeXN0ZW1Gb250XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IFwiXCIsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTeXN0ZW0gZm9udCBuYW1lXCIpLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgU3lzdGVtRm9udENvbnRyb2xsZXIoKSxcbiAgICB9LFxuICAgIFwid2ViUnRjQWxsb3dQZWVyVG9QZWVyXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1NfV0lUSF9DT05GSUcsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ0FsbG93IFBlZXItdG8tUGVlciBmb3IgMToxIGNhbGxzJyksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGludmVydGVkU2V0dGluZ05hbWU6ICd3ZWJSdGNGb3JjZVRVUk4nLFxuICAgIH0sXG4gICAgXCJ3ZWJydGNfYXVkaW9vdXRwdXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwid2VicnRjX2F1ZGlvaW5wdXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwid2VicnRjX3ZpZGVvaW5wdXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIFwibGFuZ3VhZ2VcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogXCJlblwiLFxuICAgIH0sXG4gICAgXCJicmVhZGNydW1iX3Jvb21zXCI6IHtcbiAgICAgICAgLy8gbm90IHJlYWxseSBhIHNldHRpbmdcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBbU2V0dGluZ0xldmVsLkFDQ09VTlRdLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICB9LFxuICAgIFwicmVjZW50X2Vtb2ppXCI6IHtcbiAgICAgICAgLy8gbm90IHJlYWxseSBhIHNldHRpbmdcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBbU2V0dGluZ0xldmVsLkFDQ09VTlRdLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICB9LFxuICAgIFwicm9vbV9kaXJlY3Rvcnlfc2VydmVyc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5BQ0NPVU5UXSxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgICBcImludGVncmF0aW9uUHJvdmlzaW9uaW5nXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBbU2V0dGluZ0xldmVsLkFDQ09VTlRdLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJhbGxvd2VkV2lkZ2V0c1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5ST09NX0FDQ09VTlQsIFNldHRpbmdMZXZlbC5ST09NX0RFVklDRV0sXG4gICAgICAgIHN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQ6IHRydWUsXG4gICAgICAgIGRlZmF1bHQ6IHt9LCAvLyBub25lIGFsbG93ZWRcbiAgICB9LFxuICAgIFwiYW5hbHl0aWNzT3B0SW5cIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnU2VuZCBhbmFseXRpY3MgZGF0YScpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwic2hvd0Nvb2tpZUJhclwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTX1dJVEhfQ09ORklHLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJhdXRvY29tcGxldGVEZWxheVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTX1dJVEhfQ09ORklHLFxuICAgICAgICBkZWZhdWx0OiAyMDAsXG4gICAgfSxcbiAgICBcInJlYWRNYXJrZXJJblZpZXdUaHJlc2hvbGRNc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTX1dJVEhfQ09ORklHLFxuICAgICAgICBkZWZhdWx0OiAzMDAwLFxuICAgIH0sXG4gICAgXCJyZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogMzAwMDAsXG4gICAgfSxcbiAgICBcImJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzXCI6IHtcbiAgICAgICAgLy8gV2Ugc3BlY2lmaWNhbGx5IHdhbnQgdG8gaGF2ZSByb29tLWRldmljZSA+IGRldmljZSBzbyB0aGF0IHVzZXJzIG1heSBzZXQgYSBkZXZpY2UgZGVmYXVsdFxuICAgICAgICAvLyB3aXRoIGEgcGVyLXJvb20gb3ZlcnJpZGUuXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5ST09NX0RFVklDRSwgU2V0dGluZ0xldmVsLkRFVklDRV0sXG4gICAgICAgIHN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQ6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiB7XG4gICAgICAgICAgICBcImRlZmF1bHRcIjogX3RkKCdOZXZlciBzZW5kIGVuY3J5cHRlZCBtZXNzYWdlcyB0byB1bnZlcmlmaWVkIHNlc3Npb25zIGZyb20gdGhpcyBzZXNzaW9uJyksXG4gICAgICAgICAgICBcInJvb20tZGV2aWNlXCI6IF90ZCgnTmV2ZXIgc2VuZCBlbmNyeXB0ZWQgbWVzc2FnZXMgdG8gdW52ZXJpZmllZCBzZXNzaW9ucyBpbiB0aGlzIHJvb20gZnJvbSB0aGlzIHNlc3Npb24nKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5BZHZhbmNlZEVuY3J5cHRpb24pLFxuICAgIH0sXG4gICAgXCJ1cmxQcmV2aWV3c0VuYWJsZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX1NFVFRJTkdTX1dJVEhfUk9PTSxcbiAgICAgICAgZGlzcGxheU5hbWU6IHtcbiAgICAgICAgICAgIFwiZGVmYXVsdFwiOiBfdGQoJ0VuYWJsZSBpbmxpbmUgVVJMIHByZXZpZXdzIGJ5IGRlZmF1bHQnKSxcbiAgICAgICAgICAgIFwicm9vbS1hY2NvdW50XCI6IF90ZChcIkVuYWJsZSBVUkwgcHJldmlld3MgZm9yIHRoaXMgcm9vbSAob25seSBhZmZlY3RzIHlvdSlcIiksXG4gICAgICAgICAgICBcInJvb21cIjogX3RkKFwiRW5hYmxlIFVSTCBwcmV2aWV3cyBieSBkZWZhdWx0IGZvciBwYXJ0aWNpcGFudHMgaW4gdGhpcyByb29tXCIpLFxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuVVJMUHJldmlld3MpLFxuICAgIH0sXG4gICAgXCJ1cmxQcmV2aWV3c0VuYWJsZWRfZTJlZVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5ST09NX0RFVklDRSwgU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVF0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiB7XG4gICAgICAgICAgICBcInJvb20tYWNjb3VudFwiOiBfdGQoXCJFbmFibGUgVVJMIHByZXZpZXdzIGZvciB0aGlzIHJvb20gKG9ubHkgYWZmZWN0cyB5b3UpXCIpLFxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVJRmVhdHVyZUNvbnRyb2xsZXIoVUlGZWF0dXJlLlVSTFByZXZpZXdzKSxcbiAgICB9LFxuICAgIFwicm9vbUNvbG9yXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9TRVRUSU5HU19XSVRIX1JPT00sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJSb29tIENvbG91clwiKSxcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgcHJpbWFyeV9jb2xvcjogbnVsbCwgLy8gSGV4IHN0cmluZywgZWc6ICMwMDAwMDBcbiAgICAgICAgICAgIHNlY29uZGFyeV9jb2xvcjogbnVsbCwgLy8gSGV4IHN0cmluZywgZWc6ICMwMDAwMDBcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIFwibm90aWZpY2F0aW9uc0VuYWJsZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBOb3RpZmljYXRpb25zRW5hYmxlZENvbnRyb2xsZXIoKSxcbiAgICB9LFxuICAgIFwibm90aWZpY2F0aW9uU291bmRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX09SX0FDQ09VTlQsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJub3RpZmljYXRpb25Cb2R5RW5hYmxlZFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgTm90aWZpY2F0aW9uQm9keUVuYWJsZWRDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcImF1ZGlvTm90aWZpY2F0aW9uc0VuYWJsZWRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiZW5hYmxlV2lkZ2V0U2NyZWVuc2hvdHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdFbmFibGUgd2lkZ2V0IHNjcmVlbnNob3RzIG9uIHN1cHBvcnRlZCB3aWRnZXRzJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJQaW5uZWRFdmVudHMuaXNPcGVuXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBbU2V0dGluZ0xldmVsLlJPT01fREVWSUNFXSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICBcInByb21wdEJlZm9yZUludml0ZVVua25vd25Vc2Vyc1wiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoJ1Byb21wdCBiZWZvcmUgc2VuZGluZyBpbnZpdGVzIHRvIHBvdGVudGlhbGx5IGludmFsaWQgbWF0cml4IElEcycpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJzaG93RGV2ZWxvcGVyVG9vbHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKCdTaG93IGRldmVsb3BlciB0b29scycpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwid2lkZ2V0T3BlbklEUGVybWlzc2lvbnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgYWxsb3c6IFtdLFxuICAgICAgICAgICAgZGVueTogW10sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBUT0RPOiBSZW1vdmUgc2V0dGluZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQzNzNcbiAgICBcIlJvb21MaXN0Lm9yZGVyQWxwaGFiZXRpY2FsbHlcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiT3JkZXIgcm9vbXMgYnkgbmFtZVwiKSxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgICAvLyBUT0RPOiBSZW1vdmUgc2V0dGluZzogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTQzNzNcbiAgICBcIlJvb21MaXN0Lm9yZGVyQnlJbXBvcnRhbmNlXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgcm9vbXMgd2l0aCB1bnJlYWQgbm90aWZpY2F0aW9ucyBmaXJzdFwiKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFwiYnJlYWRjcnVtYnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBzaG9ydGN1dHMgdG8gcmVjZW50bHkgdmlld2VkIHJvb21zIGFib3ZlIHRoZSByb29tIGxpc3RcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcInNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXCI6IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgaGlkZGVuIGV2ZW50cyBpbiB0aW1lbGluZVwiKSxcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJsb3dCYW5kd2lkdGhcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZCgnTG93IGJhbmR3aWR0aCBtb2RlJyksXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgUmVsb2FkT25DaGFuZ2VDb250cm9sbGVyKCksXG4gICAgfSxcbiAgICBcImZhbGxiYWNrSUNFU2VydmVyQWxsb3dlZFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFxuICAgICAgICAgICAgXCJBbGxvdyBmYWxsYmFjayBjYWxsIGFzc2lzdCBzZXJ2ZXIgdHVybi5tYXRyaXgub3JnIHdoZW4geW91ciBob21lc2VydmVyIFwiICtcbiAgICAgICAgICAgIFwiZG9lcyBub3Qgb2ZmZXIgb25lICh5b3VyIElQIGFkZHJlc3Mgd291bGQgYmUgc2hhcmVkIGR1cmluZyBhIGNhbGwpXCIsXG4gICAgICAgICksXG4gICAgICAgIC8vIFRoaXMgaXMgYSB0cmktc3RhdGUgdmFsdWUsIHdoZXJlIGBudWxsYCBtZWFucyBcInByb21wdCB0aGUgdXNlclwiLlxuICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgIH0sXG4gICAgXCJzaG93SW1hZ2VzXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlNob3cgcHJldmlld3MvdGh1bWJuYWlscyBmb3IgaW1hZ2VzXCIpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgXCJzaG93UmlnaHRQYW5lbEluUm9vbVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIFwic2hvd1JpZ2h0UGFuZWxJbkdyb3VwXCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfREVWSUNFX09OTFlfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgXCJsYXN0UmlnaHRQYW5lbFBoYXNlRm9yUm9vbVwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0RFVklDRV9PTkxZX1NFVFRJTkdTLFxuICAgICAgICBkZWZhdWx0OiBSaWdodFBhbmVsUGhhc2VzLlJvb21TdW1tYXJ5LFxuICAgIH0sXG4gICAgXCJsYXN0UmlnaHRQYW5lbFBoYXNlRm9yR3JvdXBcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogUmlnaHRQYW5lbFBoYXNlcy5Hcm91cE1lbWJlckxpc3QsXG4gICAgfSxcbiAgICBcImVuYWJsZUV2ZW50SW5kZXhpbmdcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkVuYWJsZSBtZXNzYWdlIHNlYXJjaCBpbiBlbmNyeXB0ZWQgcm9vbXNcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBcImNyYXdsZXJTbGVlcFRpbWVcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkhvdyBmYXN0IHNob3VsZCBtZXNzYWdlcyBiZSBkb3dubG9hZGVkLlwiKSxcbiAgICAgICAgZGVmYXVsdDogMzAwMCxcbiAgICB9LFxuICAgIFwic2hvd0NhbGxCdXR0b25zSW5Db21wb3NlclwiOiB7XG4gICAgICAgIC8vIERldiBub3RlOiBUaGlzIGlzIG5vIGxvbmdlciBcImluIGNvbXBvc2VyXCIgYnV0IGlzIGluc3RlYWQgXCJpbiByb29tIGhlYWRlclwiLlxuICAgICAgICAvLyBUT0RPOiBSZW5hbWUgd2l0aCBzZXR0aW5ncyB2M1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HU19XSVRIX0NPTkZJRyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IFVJRmVhdHVyZUNvbnRyb2xsZXIoVUlGZWF0dXJlLlZvaXApLFxuICAgIH0sXG4gICAgXCJlMmVlLm1hbnVhbGx5VmVyaWZ5QWxsU2Vzc2lvbnNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ERVZJQ0VfT05MWV9TRVRUSU5HUyxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk1hbnVhbGx5IHZlcmlmeSBhbGwgcmVtb3RlIHNlc3Npb25zXCIpLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IE9yZGVyZWRNdWx0aUNvbnRyb2xsZXIoW1xuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIGZlYXR1cmUgY29udHJvbGxlciBmaXJzdCB0byBlbnN1cmUgdGhhdCB0aGUgc2V0dGluZyBkb2Vzbid0XG4gICAgICAgICAgICAvLyBzaG93IHVwIGFuZCBjYW4ndCBiZSB0b2dnbGVkLiBQdXNoVG9NYXRyaXhDbGllbnRDb250cm9sbGVyIGRvZXNuJ3RcbiAgICAgICAgICAgIC8vIGRvIGFueSBvdmVycmlkZXMgYW55d2F5cy5cbiAgICAgICAgICAgIG5ldyBVSUZlYXR1cmVDb250cm9sbGVyKFVJRmVhdHVyZS5BZHZhbmNlZEVuY3J5cHRpb24pLFxuICAgICAgICAgICAgbmV3IFB1c2hUb01hdHJpeENsaWVudENvbnRyb2xsZXIoXG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50LnByb3RvdHlwZS5zZXRDcnlwdG9UcnVzdENyb3NzU2lnbmVkRGV2aWNlcywgdHJ1ZSxcbiAgICAgICAgICAgICksXG4gICAgICAgIF0pLFxuICAgIH0sXG4gICAgXCJpcmNEaXNwbGF5TmFtZVdpZHRoXCI6IHtcbiAgICAgICAgLy8gV2Ugc3BlY2lmaWNhbGx5IHdhbnQgdG8gaGF2ZSByb29tLWRldmljZSA+IGRldmljZSBzbyB0aGF0IHVzZXJzIG1heSBzZXQgYSBkZXZpY2UgZGVmYXVsdFxuICAgICAgICAvLyB3aXRoIGEgcGVyLXJvb20gb3ZlcnJpZGUuXG4gICAgICAgIHN1cHBvcnRlZExldmVsczogW1NldHRpbmdMZXZlbC5ST09NX0RFVklDRSwgU2V0dGluZ0xldmVsLkRFVklDRV0sXG4gICAgICAgIHN1cHBvcnRlZExldmVsc0FyZU9yZGVyZWQ6IHRydWUsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJJUkMgZGlzcGxheSBuYW1lIHdpZHRoXCIpLFxuICAgICAgICBkZWZhdWx0OiA4MCxcbiAgICB9LFxuICAgIFwibGF5b3V0XCI6IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfQUNDT1VOVF9TRVRUSU5HUyxcbiAgICAgICAgZGVmYXVsdDogTGF5b3V0Lkdyb3VwLFxuICAgIH0sXG4gICAgXCJzaG93Q2hhdEVmZmVjdHNcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19BQ0NPVU5UX1NFVFRJTkdTLFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2hvdyBjaGF0IGVmZmVjdHMgKGFuaW1hdGlvbnMgd2hlbiByZWNlaXZpbmcgZS5nLiBjb25mZXR0aSlcIiksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIGNvbnRyb2xsZXI6IG5ldyBSZWR1Y2VkTW90aW9uQ29udHJvbGxlcigpLFxuICAgIH0sXG4gICAgXCJXaWRnZXRzLnBpbm5lZFwiOiB7IC8vIGRlcHJlY2F0ZWRcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfUk9PTV9PUl9BQ0NPVU5ULFxuICAgICAgICBkZWZhdWx0OiB7fSxcbiAgICB9LFxuICAgIFwiV2lkZ2V0cy5sYXlvdXRcIjoge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19ST09NX09SX0FDQ09VTlQsXG4gICAgICAgIGRlZmF1bHQ6IHt9LFxuICAgIH0sXG4gICAgXCJXaWRnZXRzLmxlZnRQYW5lbFwiOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX0FDQ09VTlRfU0VUVElOR1MsXG4gICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlJvb21IaXN0b3J5U2V0dGluZ3NdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLkFkdmFuY2VkRW5jcnlwdGlvbl06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuVVJMUHJldmlld3NdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLldpZGdldHNdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlZvaXBdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLkZlZWRiYWNrXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5SZWdpc3RyYXRpb25dOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlBhc3N3b3JkUmVzZXRdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLkRlYWN0aXZhdGVdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBbVUlGZWF0dXJlLlNoYXJlUVJDb2RlXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5TaGFyZVNvY2lhbF06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuSWRlbnRpdHlTZXJ2ZXJdOiB7XG4gICAgICAgIHN1cHBvcnRlZExldmVsczogTEVWRUxTX1VJX0ZFQVRVUkUsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIC8vIElkZW50aXR5IFNlcnZlciAoRGlzY292ZXJ5KSBTZXR0aW5ncyBtYWtlIG5vIHNlbnNlIGlmIDNQSURzIGluIGdlbmVyYWwgYXJlIGhpZGRlblxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuVGhpcmRQYXJ0eUlEKSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuVGhpcmRQYXJ0eUlEXToge1xuICAgICAgICBzdXBwb3J0ZWRMZXZlbHM6IExFVkVMU19VSV9GRUFUVVJFLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5GbGFpcl06IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgLy8gRGlzYWJsZSBGbGFpciB3aGVuIENvbW11bml0aWVzIGFyZSBkaXNhYmxlZFxuICAgICAgICBjb250cm9sbGVyOiBuZXcgVUlGZWF0dXJlQ29udHJvbGxlcihVSUZlYXR1cmUuQ29tbXVuaXRpZXMpLFxuICAgIH0sXG4gICAgW1VJRmVhdHVyZS5Db21tdW5pdGllc106IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbGxlcjogbmV3IEluY29tcGF0aWJsZUNvbnRyb2xsZXIoXCJmZWF0dXJlX3NwYWNlc1wiKSxcbiAgICB9LFxuICAgIFtVSUZlYXR1cmUuQWR2YW5jZWRTZXR0aW5nc106IHtcbiAgICAgICAgc3VwcG9ydGVkTGV2ZWxzOiBMRVZFTFNfVUlfRkVBVFVSRSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxufTtcbiJdfQ==