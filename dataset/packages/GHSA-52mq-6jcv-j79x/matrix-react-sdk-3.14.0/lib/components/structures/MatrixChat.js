"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLoggedIn = isLoggedIn;
exports.default = exports.Views = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard3(require("react"));

var Matrix = _interopRequireWildcard3(require("matrix-js-sdk"));

var _errors = require("matrix-js-sdk/src/errors");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

require("focus-visible");

require("what-input");

var _Analytics = _interopRequireDefault(require("../../Analytics"));

var _CountlyAnalytics = _interopRequireDefault(require("../../CountlyAnalytics"));

var _DecryptionFailureTracker = require("../../DecryptionFailureTracker");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("../../PlatformPeg"));

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _Notifier = _interopRequireDefault(require("../../Notifier"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _Tinter = _interopRequireDefault(require("../../Tinter"));

var sdk = _interopRequireWildcard3(require("../../index"));

var _RoomInvite = require("../../RoomInvite");

var Rooms = _interopRequireWildcard3(require("../../Rooms"));

var _linkifyMatrix = _interopRequireDefault(require("../../linkify-matrix"));

var Lifecycle = _interopRequireWildcard3(require("../../Lifecycle"));

require("../../stores/LifecycleStore");

var _PageTypes = _interopRequireDefault(require("../../PageTypes"));

var _createRoom = _interopRequireDefault(require("../../createRoom"));

var _languageHandler = require("../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _ThemeController = _interopRequireDefault(require("../../settings/controllers/ThemeController"));

var _Registration = require("../../Registration.js");

var _ErrorUtils = require("../../utils/ErrorUtils");

var _ResizeNotifier = _interopRequireDefault(require("../../utils/ResizeNotifier"));

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../utils/AutoDiscoveryUtils"));

var _DMRoomMap = _interopRequireDefault(require("../../utils/DMRoomMap"));

var _ThemeWatcher = _interopRequireDefault(require("../../settings/watchers/ThemeWatcher"));

var _FontWatcher = require("../../settings/watchers/FontWatcher");

var _RoomAliasCache = require("../../RoomAliasCache");

var _promise = require("../../utils/promise");

var _ToastStore = _interopRequireDefault(require("../../stores/ToastStore"));

var StorageManager = _interopRequireWildcard3(require("../../utils/StorageManager"));

var _actions = require("../../dispatcher/actions");

var _AnalyticsToast = require("../../toasts/AnalyticsToast");

var _DesktopNotificationsToast = require("../../toasts/DesktopNotificationsToast");

var _ErrorDialog = _interopRequireDefault(require("../views/dialogs/ErrorDialog"));

var _RoomNotificationStateStore = require("../../stores/notifications/RoomNotificationStateStore");

var _SettingLevel = require("../../settings/SettingLevel");

var _membership = require("../../utils/membership");

var _CreateCommunityPrototypeDialog = _interopRequireDefault(require("../views/dialogs/CreateCommunityPrototypeDialog"));

var _ThreepidInviteStore = _interopRequireDefault(require("../../stores/ThreepidInviteStore"));

var _UIFeature = require("../../settings/UIFeature");

var _CommunityPrototypeStore = require("../../stores/CommunityPrototypeStore");

var _DialPadModal = _interopRequireDefault(require("../views/voip/DialPadModal"));

var _MobileGuideToast = require("../../toasts/MobileGuideToast");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2017-2019 New Vector Ltd
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
// @ts-ignore - XXX: no idea why this import fails
// focus-visible is a Polyfill for the :focus-visible CSS pseudo-attribute used by _AccessibleButton.scss
// what-input helps improve keyboard accessibility
// LifecycleStore is not used but does listen to and dispatch actions

/** constants for MatrixChat.state.view */
let Views;
exports.Views = Views;

(function (Views) {
  Views[Views["LOADING"] = 0] = "LOADING";
  Views[Views["WELCOME"] = 1] = "WELCOME";
  Views[Views["LOGIN"] = 2] = "LOGIN";
  Views[Views["REGISTER"] = 3] = "REGISTER";
  Views[Views["FORGOT_PASSWORD"] = 4] = "FORGOT_PASSWORD";
  Views[Views["COMPLETE_SECURITY"] = 5] = "COMPLETE_SECURITY";
  Views[Views["E2E_SETUP"] = 6] = "E2E_SETUP";
  Views[Views["LOGGED_IN"] = 7] = "LOGGED_IN";
  Views[Views["SOFT_LOGOUT"] = 8] = "SOFT_LOGOUT";
})(Views || (exports.Views = Views = {}));

const AUTH_SCREENS = ["register", "login", "forgot_password", "start_sso", "start_cas"]; // Actions that are redirected through the onboarding process prior to being
// re-dispatched. NOTE: some actions are non-trivial and would require
// re-factoring to be included in this list in future.

const ONBOARDING_FLOW_STARTERS = [_actions.Action.ViewUserSettings, 'view_create_chat', 'view_create_room', 'view_create_group'];

class MatrixChat extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "firstSyncComplete", void 0);
    (0, _defineProperty2.default)(this, "firstSyncPromise", void 0);
    (0, _defineProperty2.default)(this, "screenAfterLogin", void 0);
    (0, _defineProperty2.default)(this, "windowWidth", void 0);
    (0, _defineProperty2.default)(this, "pageChanging", void 0);
    (0, _defineProperty2.default)(this, "tokenLogin", void 0);
    (0, _defineProperty2.default)(this, "accountPassword", void 0);
    (0, _defineProperty2.default)(this, "accountPasswordTimer", void 0);
    (0, _defineProperty2.default)(this, "focusComposer", void 0);
    (0, _defineProperty2.default)(this, "subTitleStatus", void 0);
    (0, _defineProperty2.default)(this, "loggedInView", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "themeWatcher", void 0);
    (0, _defineProperty2.default)(this, "fontWatcher", void 0);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      // console.log(`MatrixClientPeg.onAction: ${payload.action}`);
      const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog"); // Start the onboarding process for certain actions

      if (_MatrixClientPeg.MatrixClientPeg.get() && _MatrixClientPeg.MatrixClientPeg.get().isGuest() && ONBOARDING_FLOW_STARTERS.includes(payload.action)) {
        // This will cause `payload` to be dispatched later, once a
        // sync has reached the "prepared" state. Setting a matrix ID
        // will cause a full login and sync and finally the deferred
        // action will be dispatched.
        _dispatcher.default.dispatch({
          action: 'do_after_sync_prepared',
          deferred_action: payload
        });

        _dispatcher.default.dispatch({
          action: 'require_registration'
        });

        return;
      }

      switch (payload.action) {
        case 'MatrixActions.accountData':
          // XXX: This is a collection of several hacks to solve a minor problem. We want to
          // update our local state when the ID server changes, but don't want to put that in
          // the js-sdk as we'd be then dictating how all consumers need to behave. However,
          // this component is already bloated and we probably don't want this tiny logic in
          // here, but there's no better place in the react-sdk for it. Additionally, we're
          // abusing the MatrixActionCreator stuff to avoid errors on dispatches.
          if (payload.event_type === 'm.identity_server') {
            const fullUrl = payload.event_content ? payload.event_content['base_url'] : null;

            if (!fullUrl) {
              _MatrixClientPeg.MatrixClientPeg.get().setIdentityServerUrl(null);

              localStorage.removeItem("mx_is_access_token");
              localStorage.removeItem("mx_is_url");
            } else {
              _MatrixClientPeg.MatrixClientPeg.get().setIdentityServerUrl(fullUrl);

              localStorage.removeItem("mx_is_access_token"); // clear token

              localStorage.setItem("mx_is_url", fullUrl); // XXX: Do we still need this?
            } // redispatch the change with a more specific action


            _dispatcher.default.dispatch({
              action: 'id_server_changed'
            });
          }

          break;

        case 'logout':
          Lifecycle.logout();
          break;

        case 'require_registration':
          (0, _Registration.startAnyRegistrationFlow)(payload);
          break;

        case 'start_registration':
          if (Lifecycle.isSoftLogout()) {
            this.onSoftLogout();
            break;
          } // This starts the full registration flow


          if (payload.screenAfterLogin) {
            this.screenAfterLogin = payload.screenAfterLogin;
          }

          this.startRegistration(payload.params || {});
          break;

        case 'start_login':
          if (Lifecycle.isSoftLogout()) {
            this.onSoftLogout();
            break;
          }

          if (payload.screenAfterLogin) {
            this.screenAfterLogin = payload.screenAfterLogin;
          }

          this.setStateForNewView({
            view: Views.LOGIN
          });
          this.notifyNewScreen('login');
          _ThemeController.default.isLogin = true;
          this.themeWatcher.recheck();
          break;

        case 'start_password_recovery':
          this.setStateForNewView({
            view: Views.FORGOT_PASSWORD
          });
          this.notifyNewScreen('forgot_password');
          break;

        case 'start_chat':
          (0, _createRoom.default)({
            dmUserId: payload.user_id
          });
          break;

        case 'leave_room':
          this.leaveRoom(payload.room_id);
          break;

        case 'forget_room':
          this.forgetRoom(payload.room_id);
          break;

        case 'reject_invite':
          _Modal.default.createTrackedDialog('Reject invitation', '', QuestionDialog, {
            title: (0, _languageHandler._t)('Reject invitation'),
            description: (0, _languageHandler._t)('Are you sure you want to reject the invitation?'),
            onFinished: confirm => {
              if (confirm) {
                // FIXME: controller shouldn't be loading a view :(
                const Loader = sdk.getComponent("elements.Spinner");

                const modal = _Modal.default.createDialog(Loader, null, 'mx_Dialog_spinner');

                _MatrixClientPeg.MatrixClientPeg.get().leave(payload.room_id).then(() => {
                  modal.close();

                  if (this.state.currentRoomId === payload.room_id) {
                    _dispatcher.default.dispatch({
                      action: 'view_home_page'
                    });
                  }
                }, err => {
                  modal.close();

                  _Modal.default.createTrackedDialog('Failed to reject invitation', '', _ErrorDialog.default, {
                    title: (0, _languageHandler._t)('Failed to reject invitation'),
                    description: err.toString()
                  });
                });
              }
            }
          });

          break;

        case 'view_user_info':
          this.viewUser(payload.userId, payload.subAction);
          break;

        case 'view_room':
          {
            // Takes either a room ID or room alias: if switching to a room the client is already
            // known to be in (eg. user clicks on a room in the recents panel), supply the ID
            // If the user is clicking on a room in the context of the alias being presented
            // to them, supply the room alias. If both are supplied, the room ID will be ignored.
            const promise = this.viewRoom(payload);

            if (payload.deferred_action) {
              promise.then(() => {
                _dispatcher.default.dispatch(payload.deferred_action);
              });
            }

            break;
          }

        case _actions.Action.ViewUserSettings:
          {
            const tabPayload = payload;
            const UserSettingsDialog = sdk.getComponent("dialogs.UserSettingsDialog");

            _Modal.default.createTrackedDialog('User settings', '', UserSettingsDialog, {
              initialTabId: tabPayload.initialTabId
            },
            /*className=*/
            null,
            /*isPriority=*/
            false,
            /*isStatic=*/
            true); // View the welcome or home page if we need something to look at


            this.viewSomethingBehindModal();
            break;
          }

        case 'view_create_room':
          this.createRoom(payload.public);
          break;

        case 'view_create_group':
          {
            let CreateGroupDialog = sdk.getComponent("dialogs.CreateGroupDialog");

            if (_SettingsStore.default.getValue("feature_communities_v2_prototypes")) {
              CreateGroupDialog = _CreateCommunityPrototypeDialog.default;
            }

            _Modal.default.createTrackedDialog('Create Community', '', CreateGroupDialog);

            break;
          }

        case _actions.Action.ViewRoomDirectory:
          {
            const RoomDirectory = sdk.getComponent("structures.RoomDirectory");

            _Modal.default.createTrackedDialog('Room directory', '', RoomDirectory, {
              initialText: payload.initialText
            }, 'mx_RoomDirectory_dialogWrapper', false, true); // View the welcome or home page if we need something to look at


            this.viewSomethingBehindModal();
            break;
          }

        case 'view_my_groups':
          this.setPage(_PageTypes.default.MyGroups);
          this.notifyNewScreen('groups');
          break;

        case 'view_group':
          this.viewGroup(payload);
          break;

        case 'view_welcome_page':
          this.viewWelcome();
          break;

        case 'view_home_page':
          this.viewHome(payload.justRegistered);
          break;

        case 'view_start_chat_or_reuse':
          this.chatCreateOrReuse(payload.user_id);
          break;

        case 'view_create_chat':
          (0, _RoomInvite.showStartChatInviteDialog)(payload.initialText || "");
          break;

        case 'view_invite':
          (0, _RoomInvite.showRoomInviteDialog)(payload.roomId);
          break;

        case 'view_last_screen':
          // This function does what we want, despite the name. The idea is that it shows
          // the last room we were looking at or some reasonable default/guess. We don't
          // have to worry about email invites or similar being re-triggered because the
          // function will have cleared that state and not execute that path.
          this.showScreenAfterLogin();
          break;

        case 'toggle_my_groups':
          // We just dispatch the page change rather than have to worry about
          // what the logic is for each of these branches.
          if (this.state.page_type === _PageTypes.default.MyGroups) {
            _dispatcher.default.dispatch({
              action: 'view_last_screen'
            });
          } else {
            _dispatcher.default.dispatch({
              action: 'view_my_groups'
            });
          }

          break;

        case 'hide_left_panel':
          this.setState({
            collapseLhs: true
          }, () => {
            this.state.resizeNotifier.notifyLeftHandleResized();
          });
          break;

        case 'focus_room_filter': // for CtrlOrCmd+K to work by expanding the left panel first

        case 'show_left_panel':
          this.setState({
            collapseLhs: false
          }, () => {
            this.state.resizeNotifier.notifyLeftHandleResized();
          });
          break;

        case _actions.Action.OpenDialPad:
          _Modal.default.createTrackedDialog('Dial pad', '', _DialPadModal.default, {}, "mx_Dialog_dialPadWrapper");

          break;

        case 'on_logged_in':
          if ( // Skip this handling for token login as that always calls onLoggedIn itself
          !this.tokenLogin && !Lifecycle.isSoftLogout() && this.state.view !== Views.LOGIN && this.state.view !== Views.REGISTER && this.state.view !== Views.COMPLETE_SECURITY && this.state.view !== Views.E2E_SETUP) {
            this.onLoggedIn();
          }

          break;

        case 'on_client_not_viable':
          this.onSoftLogout();
          break;

        case 'on_logged_out':
          this.onLoggedOut();
          break;

        case 'will_start_client':
          this.setState({
            ready: false
          }, () => {
            // if the client is about to start, we are, by definition, not ready.
            // Set ready to false now, then it'll be set to true when the sync
            // listener we set below fires.
            this.onWillStartClient();
          });
          break;

        case 'client_started':
          this.onClientStarted();
          break;

        case 'send_event':
          this.onSendEvent(payload.room_id, payload.event);
          break;

        case 'aria_hide_main_app':
          this.setState({
            hideToSRUsers: true
          });
          break;

        case 'aria_unhide_main_app':
          this.setState({
            hideToSRUsers: false
          });
          break;

        case 'accept_cookies':
          _SettingsStore.default.setValue("analyticsOptIn", null, _SettingLevel.SettingLevel.DEVICE, true);

          _SettingsStore.default.setValue("showCookieBar", null, _SettingLevel.SettingLevel.DEVICE, false);

          (0, _AnalyticsToast.hideToast)();

          if (_Analytics.default.canEnable()) {
            _Analytics.default.enable();
          }

          if (_CountlyAnalytics.default.instance.canEnable()) {
            _CountlyAnalytics.default.instance.enable(
            /* anonymous = */
            false);
          }

          break;

        case 'reject_cookies':
          _SettingsStore.default.setValue("analyticsOptIn", null, _SettingLevel.SettingLevel.DEVICE, false);

          _SettingsStore.default.setValue("showCookieBar", null, _SettingLevel.SettingLevel.DEVICE, false);

          (0, _AnalyticsToast.hideToast)();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "handleResize", () => {
      const hideLhsThreshold = 1000;
      const showLhsThreshold = 1000;

      if (this.windowWidth > hideLhsThreshold && window.innerWidth <= hideLhsThreshold) {
        _dispatcher.default.dispatch({
          action: 'hide_left_panel'
        });
      }

      if (this.windowWidth <= showLhsThreshold && window.innerWidth > showLhsThreshold) {
        _dispatcher.default.dispatch({
          action: 'show_left_panel'
        });
      }

      this.state.resizeNotifier.notifyWindowResized();
      this.windowWidth = window.innerWidth;
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", () => {
      this.showScreen("register");
    });
    (0, _defineProperty2.default)(this, "onLoginClick", () => {
      this.showScreen("login");
    });
    (0, _defineProperty2.default)(this, "onForgotPasswordClick", () => {
      this.showScreen("forgot_password");
    });
    (0, _defineProperty2.default)(this, "onRegisterFlowComplete", (credentials
    /*: IMatrixClientCreds*/
    , password
    /*: string*/
    ) => {
      return this.onUserCompletedLoginFlow(credentials, password);
    });
    (0, _defineProperty2.default)(this, "onServerConfigChange", (serverConfig
    /*: ValidatedServerConfig*/
    ) => {
      this.setState({
        serverConfig
      });
    });
    (0, _defineProperty2.default)(this, "makeRegistrationUrl", (params
    /*: {[key: string]: string}*/
    ) => {
      if (this.props.startingFragmentQueryParams.referrer) {
        params.referrer = this.props.startingFragmentQueryParams.referrer;
      }

      return this.props.makeRegistrationUrl(params);
    });
    (0, _defineProperty2.default)(this, "onUserCompletedLoginFlow", async (credentials
    /*: IMatrixClientCreds*/
    , password
    /*: string*/
    ) => {
      this.accountPassword = password; // self-destruct the password after 5mins

      if (this.accountPasswordTimer !== null) clearTimeout(this.accountPasswordTimer);
      this.accountPasswordTimer = setTimeout(() => {
        this.accountPassword = null;
        this.accountPasswordTimer = null;
      }, 60 * 5 * 1000); // Create and start the client

      await Lifecycle.setLoggedIn(credentials);
      await this.postLoginSetup();
    });
    (0, _defineProperty2.default)(this, "onCompleteSecurityE2eSetupFinished", () => {
      this.onLoggedIn();
    });
    this.state = {
      view: Views.LOADING,
      collapseLhs: false,
      hideToSRUsers: false,
      syncError: null,
      // If the current syncing status is ERROR, the error object, otherwise null.
      resizeNotifier: new _ResizeNotifier.default(),
      ready: false
    };
    this.loggedInView = /*#__PURE__*/(0, _react.createRef)();

    _SdkConfig.default.put(this.props.config); // Used by _viewRoom before getting state from sync


    this.firstSyncComplete = false;
    this.firstSyncPromise = (0, _promise.defer)();

    if (this.props.config.sync_timeline_limit) {
      _MatrixClientPeg.MatrixClientPeg.opts.initialSyncLimit = this.props.config.sync_timeline_limit;
    } // a thing to call showScreen with once login completes.  this is kept
    // outside this.state because updating it should never trigger a
    // rerender.


    this.screenAfterLogin = this.props.initialScreenAfterLogin;

    if (this.screenAfterLogin) {
      const params = this.screenAfterLogin.params || {};

      if (this.screenAfterLogin.screen.startsWith("room/") && params['signurl'] && params['email']) {
        // probably a threepid invite - try to store it
        const roomId = this.screenAfterLogin.screen.substring("room/".length);

        _ThreepidInviteStore.default.instance.storeInvite(roomId, params);
      }
    }

    this.windowWidth = 10000;
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.pageChanging = false; // check we have the right tint applied for this theme.
    // N.B. we don't call the whole of setTheme() here as we may be
    // racing with the theme CSS download finishing from index.js

    _Tinter.default.tint(); // For PersistentElement


    this.state.resizeNotifier.on("middlePanelResized", this.dispatchTimelineResize); // Force users to go through the soft logout page if they're soft logged out

    if (Lifecycle.isSoftLogout()) {
      // When the session loads it'll be detected as soft logged out and a dispatch
      // will be sent out to say that, triggering this MatrixChat to show the soft
      // logout page.
      Lifecycle.loadSession();
    }

    this.accountPassword = null;
    this.accountPasswordTimer = null;
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.themeWatcher = new _ThemeWatcher.default();
    this.fontWatcher = new _FontWatcher.FontWatcher();
    this.themeWatcher.start();
    this.fontWatcher.start();
    this.focusComposer = false; // object field used for tracking the status info appended to the title tag.
    // we don't do it as react state as i'm scared about triggering needless react refreshes.

    this.subTitleStatus = ''; // this can technically be done anywhere but doing this here keeps all
    // the routing url path logic together.

    if (this.onAliasClick) {
      _linkifyMatrix.default.onAliasClick = this.onAliasClick;
    }

    if (this.onUserClick) {
      _linkifyMatrix.default.onUserClick = this.onUserClick;
    }

    if (this.onGroupClick) {
      _linkifyMatrix.default.onGroupClick = this.onGroupClick;
    } // the first thing to do is to try the token params in the query-string
    // if the session isn't soft logged out (ie: is a clean session being logged in)


    if (!Lifecycle.isSoftLogout()) {
      Lifecycle.attemptTokenLogin(this.props.realQueryParams, this.props.defaultDeviceDisplayName, this.getFragmentAfterLogin()).then(async loggedIn => {
        if (this.props.realQueryParams?.loginToken) {
          // remove the loginToken from the URL regardless
          this.props.onTokenLoginCompleted();
        }

        if (loggedIn) {
          this.tokenLogin = true; // Create and start the client

          await Lifecycle.restoreFromLocalStorage({
            ignoreGuest: true
          });
          return this.postLoginSetup();
        } // if the user has followed a login or register link, don't reanimate
        // the old creds, but rather go straight to the relevant page


        const firstScreen = this.screenAfterLogin ? this.screenAfterLogin.screen : null;

        if (firstScreen === 'login' || firstScreen === 'register' || firstScreen === 'forgot_password') {
          this.showScreenAfterLogin();
          return;
        }

        return this.loadSession();
      });
    }

    if (_SettingsStore.default.getValue("analyticsOptIn")) {
      _Analytics.default.enable();
    }

    _CountlyAnalytics.default.instance.enable(
    /* anonymous = */
    true);
  }

  async postLoginSetup() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const cryptoEnabled = cli.isCryptoEnabled();

    if (!cryptoEnabled) {
      this.onLoggedIn();
    }

    const promisesList = [this.firstSyncPromise.promise];

    if (cryptoEnabled) {
      // wait for the client to finish downloading cross-signing keys for us so we
      // know whether or not we have keys set up on this account
      promisesList.push(cli.downloadKeys([cli.getUserId()]));
    } // Now update the state to say we're waiting for the first sync to complete rather
    // than for the login to finish.


    this.setState({
      pendingInitialSync: true
    });
    await Promise.all(promisesList);

    if (!cryptoEnabled) {
      this.setState({
        pendingInitialSync: false
      });
      return;
    }

    const crossSigningIsSetUp = cli.getStoredCrossSigningForUser(cli.getUserId());

    if (crossSigningIsSetUp) {
      this.setStateForNewView({
        view: Views.COMPLETE_SECURITY
      });
    } else if (await cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing")) {
      this.setStateForNewView({
        view: Views.E2E_SETUP
      });
    } else {
      this.onLoggedIn();
    }

    this.setState({
      pendingInitialSync: false
    });
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle stage
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillUpdate(props, state) {
    if (this.shouldTrackPageChange(this.state, state)) {
      this.startPageChangeTimer();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.shouldTrackPageChange(prevState, this.state)) {
      const durationMs = this.stopPageChangeTimer();

      _Analytics.default.trackPageChange(durationMs);

      _CountlyAnalytics.default.instance.trackPageChange(durationMs);
    }

    if (this.focusComposer) {
      _dispatcher.default.fire(_actions.Action.FocusComposer);

      this.focusComposer = false;
    }
  }

  componentWillUnmount() {
    Lifecycle.stopMatrixClient();

    _dispatcher.default.unregister(this.dispatcherRef);

    this.themeWatcher.stop();
    this.fontWatcher.stop();
    window.removeEventListener('resize', this.handleResize);
    this.state.resizeNotifier.removeListener("middlePanelResized", this.dispatchTimelineResize);
    if (this.accountPasswordTimer !== null) clearTimeout(this.accountPasswordTimer);
  }

  getFallbackHsUrl() {
    if (this.props.serverConfig && this.props.serverConfig.isDefault) {
      return this.props.config.fallback_hs_url;
    } else {
      return null;
    }
  }

  getServerProperties() {
    let props = this.state.serverConfig;
    if (!props) props = this.props.serverConfig; // for unit tests

    if (!props) props = _SdkConfig.default.get()["validated_server_config"];
    return {
      serverConfig: props
    };
  }

  loadSession() {
    // the extra Promise.resolve() ensures that synchronous exceptions hit the same codepath as
    // asynchronous ones.
    return Promise.resolve().then(() => {
      return Lifecycle.loadSession({
        fragmentQueryParams: this.props.startingFragmentQueryParams,
        enableGuest: this.props.enableGuest,
        guestHsUrl: this.getServerProperties().serverConfig.hsUrl,
        guestIsUrl: this.getServerProperties().serverConfig.isUrl,
        defaultDeviceDisplayName: this.props.defaultDeviceDisplayName
      });
    }).then(loadedSession => {
      if (!loadedSession) {
        // fall back to showing the welcome screen... unless we have a 3pid invite pending
        if (_ThreepidInviteStore.default.instance.pickBestInvite()) {
          _dispatcher.default.dispatch({
            action: 'start_registration'
          });
        } else {
          _dispatcher.default.dispatch({
            action: "view_welcome_page"
          });
        }
      } else if (_SettingsStore.default.getValue("analyticsOptIn")) {
        _CountlyAnalytics.default.instance.enable(
        /* anonymous = */
        false);
      }
    }); // Note we don't catch errors from this: we catch everything within
    // loadSession as there's logic there to ask the user if they want
    // to try logging out.
  }

  startPageChangeTimer() {
    // Tor doesn't support performance
    if (!performance || !performance.mark) return null; // This shouldn't happen because UNSAFE_componentWillUpdate and componentDidUpdate
    // are used.

    if (this.pageChanging) {
      console.warn('MatrixChat.startPageChangeTimer: timer already started');
      return;
    }

    this.pageChanging = true;
    performance.mark('element_MatrixChat_page_change_start');
  }

  stopPageChangeTimer() {
    // Tor doesn't support performance
    if (!performance || !performance.mark) return null;

    if (!this.pageChanging) {
      console.warn('MatrixChat.stopPageChangeTimer: timer not started');
      return;
    }

    this.pageChanging = false;
    performance.mark('element_MatrixChat_page_change_stop');
    performance.measure('element_MatrixChat_page_change_delta', 'element_MatrixChat_page_change_start', 'element_MatrixChat_page_change_stop');
    performance.clearMarks('element_MatrixChat_page_change_start');
    performance.clearMarks('element_MatrixChat_page_change_stop');
    const measurement = performance.getEntriesByName('element_MatrixChat_page_change_delta').pop(); // In practice, sometimes the entries list is empty, so we get no measurement

    if (!measurement) return null;
    return measurement.duration;
  }

  shouldTrackPageChange(prevState
  /*: IState*/
  , state
  /*: IState*/
  ) {
    return prevState.currentRoomId !== state.currentRoomId || prevState.view !== state.view || prevState.page_type !== state.page_type;
  }

  setStateForNewView(state
  /*: Partial<IState>*/
  ) {
    if (state.view === undefined) {
      throw new Error("setStateForNewView with no view!");
    }

    const newState = {
      currentUserId: null,
      justRegistered: false
    };
    Object.assign(newState, state);
    this.setState(newState);
  }

  setPage(pageType
  /*: string*/
  ) {
    this.setState({
      page_type: pageType
    });
  }

  async startRegistration(params
  /*: {[key: string]: string}*/
  ) {
    const newState
    /*: Partial<IState>*/
    = {
      view: Views.REGISTER
    }; // Only honour params if they are all present, otherwise we reset
    // HS and IS URLs when switching to registration.

    if (params.client_secret && params.session_id && params.hs_url && params.is_url && params.sid) {
      newState.serverConfig = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(params.hs_url, params.is_url);
      newState.register_client_secret = params.client_secret;
      newState.register_session_id = params.session_id;
      newState.register_id_sid = params.sid;
    }

    this.setStateForNewView(newState);
    _ThemeController.default.isLogin = true;
    this.themeWatcher.recheck();
    this.notifyNewScreen('register');
  } // switch view to the given room
  //
  // @param {Object} roomInfo Object containing data about the room to be joined
  // @param {string=} roomInfo.room_id ID of the room to join. One of room_id or room_alias must be given.
  // @param {string=} roomInfo.room_alias Alias of the room to join. One of room_id or room_alias must be given.
  // @param {boolean=} roomInfo.auto_join If true, automatically attempt to join the room if not already a member.
  // @param {string=} roomInfo.event_id ID of the event in this room to show: this will cause a switch to the
  //                                    context of that particular event.
  // @param {boolean=} roomInfo.highlighted If true, add event_id to the hash of the URL
  //                                        and alter the EventTile to appear highlighted.
  // @param {Object=} roomInfo.threepid_invite Object containing data about the third party
  //                                           we received to join the room, if any.
  // @param {Object=} roomInfo.oob_data Object of additional data about the room
  //                               that has been passed out-of-band (eg.
  //                               room name and avatar from an invite email)


  viewRoom(roomInfo
  /*: IRoomInfo*/
  ) {
    this.focusComposer = true;

    if (roomInfo.room_alias) {
      console.log(`Switching to room alias ${roomInfo.room_alias} at event ` + roomInfo.event_id);
    } else {
      console.log(`Switching to room id ${roomInfo.room_id} at event ` + roomInfo.event_id);
    } // Wait for the first sync to complete so that if a room does have an alias,
    // it would have been retrieved.


    let waitFor = Promise.resolve(null);

    if (!this.firstSyncComplete) {
      if (!this.firstSyncPromise) {
        console.warn('Cannot view a room before first sync. room_id:', roomInfo.room_id);
        return;
      }

      waitFor = this.firstSyncPromise.promise;
    }

    return waitFor.then(() => {
      let presentedId = roomInfo.room_alias || roomInfo.room_id;

      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomInfo.room_id);

      if (room) {
        const theAlias = Rooms.getDisplayAliasForRoom(room);

        if (theAlias) {
          presentedId = theAlias; // Store display alias of the presented room in cache to speed future
          // navigation.

          (0, _RoomAliasCache.storeRoomAliasInCache)(theAlias, room.roomId);
        } // Store this as the ID of the last room accessed. This is so that we can
        // persist which room is being stored across refreshes and browser quits.


        if (localStorage) {
          localStorage.setItem('mx_last_room_id', room.roomId);
        }
      } // If we are redirecting to a Room Alias and it is for the room we already showing then replace history item


      const replaceLast = presentedId[0] === "#" && roomInfo.room_id === this.state.currentRoomId;

      if (roomInfo.event_id && roomInfo.highlighted) {
        presentedId += "/" + roomInfo.event_id;
      }

      this.setState({
        view: Views.LOGGED_IN,
        currentRoomId: roomInfo.room_id || null,
        page_type: _PageTypes.default.RoomView,
        threepidInvite: roomInfo.threepid_invite,
        roomOobData: roomInfo.oob_data,
        viaServers: roomInfo.via_servers,
        ready: true
      }, () => {
        this.notifyNewScreen('room/' + presentedId, replaceLast);
      });
    });
  }

  async viewGroup(payload) {
    const groupId = payload.group_id; // Wait for the first sync to complete

    if (!this.firstSyncComplete) {
      if (!this.firstSyncPromise) {
        console.warn('Cannot view a group before first sync. group_id:', groupId);
        return;
      }

      await this.firstSyncPromise.promise;
    }

    this.setState({
      view: Views.LOGGED_IN,
      currentGroupId: groupId,
      currentGroupIsNew: payload.group_is_new
    });
    this.setPage(_PageTypes.default.GroupView);
    this.notifyNewScreen('group/' + groupId);
  }

  viewSomethingBehindModal() {
    if (this.state.view !== Views.LOGGED_IN) {
      this.viewWelcome();
      return;
    }

    if (!this.state.currentGroupId && !this.state.currentRoomId) {
      this.viewHome();
    }
  }

  viewWelcome() {
    this.setStateForNewView({
      view: Views.WELCOME
    });
    this.notifyNewScreen('welcome');
    _ThemeController.default.isLogin = true;
    this.themeWatcher.recheck();
  }

  viewHome(justRegistered = false) {
    // The home page requires the "logged in" view, so we'll set that.
    this.setStateForNewView({
      view: Views.LOGGED_IN,
      justRegistered
    });
    this.setPage(_PageTypes.default.HomePage);
    this.notifyNewScreen('home');
    _ThemeController.default.isLogin = false;
    this.themeWatcher.recheck();
  }

  viewUser(userId
  /*: string*/
  , subAction
  /*: string*/
  ) {
    // Wait for the first sync so that `getRoom` gives us a room object if it's
    // in the sync response
    const waitForSync = this.firstSyncPromise ? this.firstSyncPromise.promise : Promise.resolve();
    waitForSync.then(() => {
      if (subAction === 'chat') {
        this.chatCreateOrReuse(userId);
        return;
      }

      this.notifyNewScreen('user/' + userId);
      this.setState({
        currentUserId: userId
      });
      this.setPage(_PageTypes.default.UserView);
    });
  }

  async createRoom(defaultPublic = false) {
    const communityId = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId();

    if (communityId) {
      // double check the user will have permission to associate this room with the community
      if (!_CommunityPrototypeStore.CommunityPrototypeStore.instance.isAdminOf(communityId)) {
        _Modal.default.createTrackedDialog('Pre-failure to create room', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Cannot create rooms in this community"),
          description: (0, _languageHandler._t)("You do not have permission to create rooms in this community.")
        });

        return;
      }
    }

    const CreateRoomDialog = sdk.getComponent('dialogs.CreateRoomDialog');

    const modal = _Modal.default.createTrackedDialog('Create Room', '', CreateRoomDialog, {
      defaultPublic
    });

    const [shouldCreate, opts] = await modal.finished;

    if (shouldCreate) {
      (0, _createRoom.default)(opts);
    }
  }

  chatCreateOrReuse(userId
  /*: string*/
  ) {
    // Use a deferred action to reshow the dialog once the user has registered
    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
      // No point in making 2 DMs with welcome bot. This assumes view_set_mxid will
      // result in a new DM with the welcome user.
      if (userId !== this.props.config.welcomeUserId) {
        _dispatcher.default.dispatch({
          action: 'do_after_sync_prepared',
          deferred_action: {
            action: 'view_start_chat_or_reuse',
            user_id: userId
          }
        });
      }

      _dispatcher.default.dispatch({
        action: 'require_registration',
        // If the set_mxid dialog is cancelled, view /welcome because if the
        // browser was pointing at /user/@someone:domain?action=chat, the URL
        // needs to be reset so that they can revisit /user/.. // (and trigger
        // `_chatCreateOrReuse` again)
        go_welcome_on_cancel: true,
        screen_after: {
          screen: `user/${this.props.config.welcomeUserId}`,
          params: {
            action: 'chat'
          }
        }
      });

      return;
    } // TODO: Immutable DMs replaces this


    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const dmRoomMap = new _DMRoomMap.default(client);
    const dmRooms = dmRoomMap.getDMRoomsForUserId(userId);

    if (dmRooms.length > 0) {
      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: dmRooms[0]
      });
    } else {
      _dispatcher.default.dispatch({
        action: 'start_chat',
        user_id: userId
      });
    }
  }

  leaveRoomWarnings(roomId
  /*: string*/
  ) {
    const roomToLeave = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId); // Show a warning if there are additional complications.


    const joinRules = roomToLeave.currentState.getStateEvents('m.room.join_rules', '');
    const warnings = [];

    if (joinRules) {
      const rule = joinRules.getContent().join_rule;

      if (rule !== "public") {
        warnings.push( /*#__PURE__*/_react.default.createElement("span", {
          className: "warning",
          key: "non_public_warning"
        }, ' '
        /* Whitespace, otherwise the sentences get smashed together */
        , (0, _languageHandler._t)("This room is not public. You will not be able to rejoin without an invite.")));
      }
    }

    return warnings;
  }

  leaveRoom(roomId
  /*: string*/
  ) {
    const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

    const roomToLeave = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    const warnings = this.leaveRoomWarnings(roomId);

    _Modal.default.createTrackedDialog('Leave room', '', QuestionDialog, {
      title: (0, _languageHandler._t)("Leave room"),
      description: /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Are you sure you want to leave the room '%(roomName)s'?", {
        roomName: roomToLeave.name
      }), warnings),
      button: (0, _languageHandler._t)("Leave"),
      onFinished: shouldLeave => {
        if (shouldLeave) {
          const d = (0, _membership.leaveRoomBehaviour)(roomId); // FIXME: controller shouldn't be loading a view :(

          const Loader = sdk.getComponent("elements.Spinner");

          const modal = _Modal.default.createDialog(Loader, null, 'mx_Dialog_spinner');

          d.finally(() => modal.close());
        }
      }
    });
  }

  forgetRoom(roomId
  /*: string*/
  ) {
    _MatrixClientPeg.MatrixClientPeg.get().forget(roomId).then(() => {
      // Switch to home page if we're currently viewing the forgotten room
      if (this.state.currentRoomId === roomId) {
        _dispatcher.default.dispatch({
          action: "view_home_page"
        });
      }
    }).catch(err => {
      const errCode = err.errcode || (0, _languageHandler._td)("unknown error code");

      _Modal.default.createTrackedDialog("Failed to forget room", '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)("Failed to forget room %(errCode)s", {
          errCode
        }),
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    });
  }
  /**
   * Starts a chat with the welcome user, if the user doesn't already have one
   * @returns {string} The room ID of the new room, or null if no room was created
   */


  async startWelcomeUserChat() {
    // We can end up with multiple tabs post-registration where the user
    // might then end up with a session and we don't want them all making
    // a chat with the welcome user: try to de-dupe.
    // We need to wait for the first sync to complete for this to
    // work though.
    let waitFor;

    if (!this.firstSyncComplete) {
      waitFor = this.firstSyncPromise.promise;
    } else {
      waitFor = Promise.resolve();
    }

    await waitFor;

    const welcomeUserRooms = _DMRoomMap.default.shared().getDMRoomsForUserId(this.props.config.welcomeUserId);

    if (welcomeUserRooms.length === 0) {
      const roomId = await (0, _createRoom.default)({
        dmUserId: this.props.config.welcomeUserId,
        // Only view the welcome user if we're NOT looking at a room
        andView: !this.state.currentRoomId,
        spinner: false // we're already showing one: we don't need another one

      }); // This is a bit of a hack, but since the deduplication relies
      // on m.direct being up to date, we need to force a sync
      // of the database, otherwise if the user goes to the other
      // tab before the next save happens (a few minutes), the
      // saved sync will be restored from the db and this code will
      // run without the update to m.direct, making another welcome
      // user room (it doesn't wait for new data from the server, just
      // the saved sync to be loaded).

      const saveWelcomeUser = ev => {
        if (ev.getType() === 'm.direct' && ev.getContent() && ev.getContent()[this.props.config.welcomeUserId]) {
          _MatrixClientPeg.MatrixClientPeg.get().store.save(true);

          _MatrixClientPeg.MatrixClientPeg.get().removeListener("accountData", saveWelcomeUser);
        }
      };

      _MatrixClientPeg.MatrixClientPeg.get().on("accountData", saveWelcomeUser);

      return roomId;
    }

    return null;
  }
  /**
   * Called when a new logged in session has started
   */


  async onLoggedIn() {
    _ThemeController.default.isLogin = false;
    this.themeWatcher.recheck();
    this.setStateForNewView({
      view: Views.LOGGED_IN
    }); // If a specific screen is set to be shown after login, show that above
    // all else, as it probably means the user clicked on something already.

    if (this.screenAfterLogin && this.screenAfterLogin.screen) {
      this.showScreen(this.screenAfterLogin.screen, this.screenAfterLogin.params);
      this.screenAfterLogin = null;
    } else if (_MatrixClientPeg.MatrixClientPeg.currentUserIsJustRegistered()) {
      _MatrixClientPeg.MatrixClientPeg.setJustRegisteredUserId(null);

      if (this.props.config.welcomeUserId && (0, _languageHandler.getCurrentLanguage)().startsWith("en")) {
        const welcomeUserRoom = await this.startWelcomeUserChat();

        if (welcomeUserRoom === null) {
          // We didn't redirect to the welcome user room, so show
          // the homepage.
          _dispatcher.default.dispatch({
            action: 'view_home_page',
            justRegistered: true
          });
        }
      } else if (_ThreepidInviteStore.default.instance.pickBestInvite()) {
        // The user has a 3pid invite pending - show them that
        const threepidInvite = _ThreepidInviteStore.default.instance.pickBestInvite(); // HACK: This is a pretty brutal way of threading the invite back through
        // our systems, but it's the safest we have for now.


        const params = _ThreepidInviteStore.default.instance.translateToWireFormat(threepidInvite);

        this.showScreen(`room/${threepidInvite.roomId}`, params);
      } else {
        // The user has just logged in after registering,
        // so show the homepage.
        _dispatcher.default.dispatch({
          action: 'view_home_page',
          justRegistered: true
        });
      }
    } else {
      this.showScreenAfterLogin();
    }

    StorageManager.tryPersistStorage(); // defer the following actions by 30 seconds to not throw them at the user immediately

    await (0, _promise.sleep)(30);

    if (_SettingsStore.default.getValue("showCookieBar") && (_Analytics.default.canEnable() || _CountlyAnalytics.default.instance.canEnable())) {
      (0, _AnalyticsToast.showToast)(this.props.config.piwik?.policyUrl);
    }

    if (_SdkConfig.default.get().mobileGuideToast) {
      // The toast contains further logic to detect mobile platforms,
      // check if it has been dismissed before, etc.
      (0, _MobileGuideToast.showToast)();
    }
  }

  showScreenAfterLogin() {
    // If screenAfterLogin is set, use that, then null it so that a second login will
    // result in view_home_page, _user_settings or _room_directory
    if (this.screenAfterLogin && this.screenAfterLogin.screen) {
      this.showScreen(this.screenAfterLogin.screen, this.screenAfterLogin.params);
      this.screenAfterLogin = null;
    } else if (localStorage && localStorage.getItem('mx_last_room_id')) {
      // Before defaulting to directory, show the last viewed room
      this.viewLastRoom();
    } else {
      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        _dispatcher.default.dispatch({
          action: 'view_welcome_page'
        });
      } else {
        _dispatcher.default.dispatch({
          action: 'view_home_page'
        });
      }
    }
  }

  viewLastRoom() {
    _dispatcher.default.dispatch({
      action: 'view_room',
      room_id: localStorage.getItem('mx_last_room_id')
    });
  }
  /**
   * Called when the session is logged out
   */


  onLoggedOut() {
    this.notifyNewScreen('login');
    this.setStateForNewView({
      view: Views.LOGIN,
      ready: false,
      collapseLhs: false,
      currentRoomId: null
    });
    this.subTitleStatus = '';
    this.setPageSubtitle();
    _ThemeController.default.isLogin = true;
    this.themeWatcher.recheck();
  }
  /**
   * Called when the session is softly logged out
   */


  onSoftLogout() {
    this.notifyNewScreen('soft_logout');
    this.setStateForNewView({
      view: Views.SOFT_LOGOUT,
      ready: false,
      collapseLhs: false,
      currentRoomId: null
    });
    this.subTitleStatus = '';
    this.setPageSubtitle();
  }
  /**
   * Called just before the matrix client is started
   * (useful for setting listeners)
   */


  onWillStartClient() {
    // reset the 'have completed first sync' flag,
    // since we're about to start the client and therefore about
    // to do the first sync
    this.firstSyncComplete = false;
    this.firstSyncPromise = (0, _promise.defer)();

    const cli = _MatrixClientPeg.MatrixClientPeg.get(); // Allow the JS SDK to reap timeline events. This reduces the amount of
    // memory consumed as the JS SDK stores multiple distinct copies of room
    // state (each of which can be 10s of MBs) for each DISJOINT timeline. This is
    // particularly noticeable when there are lots of 'limited' /sync responses
    // such as when laptops unsleep.
    // https://github.com/vector-im/element-web/issues/3307#issuecomment-282895568


    cli.setCanResetTimelineCallback(roomId => {
      console.log("Request to reset timeline in room ", roomId, " viewing:", this.state.currentRoomId);

      if (roomId !== this.state.currentRoomId) {
        // It is safe to remove events from rooms we are not viewing.
        return true;
      } // We are viewing the room which we want to reset. It is only safe to do
      // this if we are not scrolled up in the view. To find out, delegate to
      // the timeline panel. If the timeline panel doesn't exist, then we assume
      // it is safe to reset the timeline.


      if (!this.loggedInView.current) {
        return true;
      }

      return this.loggedInView.current.canResetTimelineInRoom(roomId);
    });
    cli.on('sync', (state, prevState, data) => {
      // LifecycleStore and others cannot directly subscribe to matrix client for
      // events because flux only allows store state changes during flux dispatches.
      // So dispatch directly from here. Ideally we'd use a SyncStateStore that
      // would do this dispatch and expose the sync state itself (by listening to
      // its own dispatch).
      _dispatcher.default.dispatch({
        action: 'sync_state',
        prevState,
        state
      });

      if (state === "ERROR" || state === "RECONNECTING") {
        if (data.error instanceof _errors.InvalidStoreError) {
          Lifecycle.handleInvalidStoreError(data.error);
        }

        this.setState({
          syncError: data.error || true
        });
      } else if (this.state.syncError) {
        this.setState({
          syncError: null
        });
      }

      this.updateStatusIndicator(state, prevState);

      if (state === "SYNCING" && prevState === "SYNCING") {
        return;
      }

      console.info("MatrixClient sync state => %s", state);

      if (state !== "PREPARED") {
        return;
      }

      this.firstSyncComplete = true;
      this.firstSyncPromise.resolve();

      if (_Notifier.default.shouldShowPrompt() && !_MatrixClientPeg.MatrixClientPeg.userRegisteredWithinLastHours(24)) {
        (0, _DesktopNotificationsToast.showToast)(false);
      }

      _dispatcher.default.fire(_actions.Action.FocusComposer);

      this.setState({
        ready: true
      });
    });
    cli.on('Session.logged_out', function (errObj) {
      if (Lifecycle.isLoggingOut()) return; // A modal might have been open when we were logged out by the server

      _Modal.default.closeCurrentModal('Session.logged_out');

      if (errObj.httpStatus === 401 && errObj.data && errObj.data['soft_logout']) {
        console.warn("Soft logout issued by server - avoiding data deletion");
        Lifecycle.softLogout();
        return;
      }

      _Modal.default.createTrackedDialog('Signed out', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)('Signed Out'),
        description: (0, _languageHandler._t)('For security, this session has been signed out. Please sign in again.')
      });

      _dispatcher.default.dispatch({
        action: 'logout'
      });
    });
    cli.on('no_consent', function (message, consentUri) {
      const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

      _Modal.default.createTrackedDialog('No Consent Dialog', '', QuestionDialog, {
        title: (0, _languageHandler._t)('Terms and Conditions'),
        description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, " ", (0, _languageHandler._t)('To continue using the %(homeserverDomain)s homeserver ' + 'you must review and agree to our terms and conditions.', {
          homeserverDomain: cli.getDomain()
        }))),
        button: (0, _languageHandler._t)('Review terms and conditions'),
        cancelButton: (0, _languageHandler._t)('Dismiss'),
        onFinished: confirmed => {
          if (confirmed) {
            const wnd = window.open(consentUri, '_blank');
            wnd.opener = null;
          }
        }
      }, null, true);
    });
    const dft = new _DecryptionFailureTracker.DecryptionFailureTracker((total, errorCode) => {
      _Analytics.default.trackEvent('E2E', 'Decryption failure', errorCode, total);

      _CountlyAnalytics.default.instance.track("decryption_failure", {
        errorCode
      }, null, {
        sum: total
      });
    }, errorCode => {
      // Map JS-SDK error codes to tracker codes for aggregation
      switch (errorCode) {
        case 'MEGOLM_UNKNOWN_INBOUND_SESSION_ID':
          return 'olm_keys_not_sent_error';

        case 'OLM_UNKNOWN_MESSAGE_INDEX':
          return 'olm_index_error';

        case undefined:
          return 'unexpected_error';

        default:
          return 'unspecified_error';
      }
    }); // Shelved for later date when we have time to think about persisting history of
    // tracked events across sessions.
    // dft.loadTrackedEventHashMap();

    dft.start(); // When logging out, stop tracking failures and destroy state

    cli.on("Session.logged_out", () => dft.stop());
    cli.on("Event.decrypted", (e, err) => dft.eventDecrypted(e, err));
    cli.on("Room", room => {
      if (_MatrixClientPeg.MatrixClientPeg.get().isCryptoEnabled()) {
        const blacklistEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ROOM_DEVICE, "blacklistUnverifiedDevices", room.roomId,
        /*explicit=*/
        true);

        room.setBlacklistUnverifiedDevices(blacklistEnabled);
      }
    });
    cli.on("crypto.warning", type => {
      switch (type) {
        case 'CRYPTO_WARNING_OLD_VERSION_DETECTED':
          _Modal.default.createTrackedDialog('Crypto migrated', '', _ErrorDialog.default, {
            title: (0, _languageHandler._t)('Old cryptography data detected'),
            description: (0, _languageHandler._t)("Data from an older version of %(brand)s has been detected. " + "This will have caused end-to-end cryptography to malfunction " + "in the older version. End-to-end encrypted messages exchanged " + "recently whilst using the older version may not be decryptable " + "in this version. This may also cause messages exchanged with this " + "version to fail. If you experience problems, log out and back in " + "again. To retain message history, export and re-import your keys.", {
              brand: _SdkConfig.default.get().brand
            })
          });

          break;
      }
    });
    cli.on("crypto.keyBackupFailed", async errcode => {
      let haveNewVersion;
      let newVersionInfo; // if key backup is still enabled, there must be a new backup in place

      if (_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
        haveNewVersion = true;
      } else {
        // otherwise check the server to see if there's a new one
        try {
          newVersionInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
          if (newVersionInfo !== null) haveNewVersion = true;
        } catch (e) {
          console.error("Saw key backup error but failed to check backup version!", e);
          return;
        }
      }

      if (haveNewVersion) {
        _Modal.default.createTrackedDialogAsync('New Recovery Method', 'New Recovery Method', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../async-components/views/dialogs/security/NewRecoveryMethodDialog'))), {
          newVersionInfo
        });
      } else {
        _Modal.default.createTrackedDialogAsync('Recovery Method Removed', 'Recovery Method Removed', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../async-components/views/dialogs/security/RecoveryMethodRemovedDialog'))));
      }
    });
    cli.on("crypto.keySignatureUploadFailure", (failures, source, continuation) => {
      const KeySignatureUploadFailedDialog = sdk.getComponent('views.dialogs.KeySignatureUploadFailedDialog');

      _Modal.default.createTrackedDialog('Failed to upload key signatures', 'Failed to upload key signatures', KeySignatureUploadFailedDialog, {
        failures,
        source,
        continuation
      });
    });
    cli.on("crypto.verification.request", request => {
      if (request.verifier) {
        const IncomingSasDialog = sdk.getComponent("views.dialogs.IncomingSasDialog");

        _Modal.default.createTrackedDialog('Incoming Verification', '', IncomingSasDialog, {
          verifier: request.verifier
        }, null,
        /* priority = */
        false,
        /* static = */
        true);
      } else if (request.pending) {
        _ToastStore.default.sharedInstance().addOrReplaceToast({
          key: 'verifreq_' + request.channel.transactionId,
          title: request.isSelfVerification ? (0, _languageHandler._t)("Self-verification request") : (0, _languageHandler._t)("Verification Request"),
          icon: "verification",
          props: {
            request
          },
          component: sdk.getComponent("toasts.VerificationRequestToast"),
          priority: 90
        });
      }
    }); // Fire the tinter right on startup to ensure the default theme is applied
    // A later sync can/will correct the tint to be the right value for the user

    const colorScheme = _SettingsStore.default.getValue("roomColor");

    _Tinter.default.tint(colorScheme.primary_color, colorScheme.secondary_color);
  }
  /**
   * Called shortly after the matrix client has started. Useful for
   * setting up anything that requires the client to be started.
   * @private
   */


  onClientStarted() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli.isCryptoEnabled()) {
      const blacklistEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "blacklistUnverifiedDevices");

      cli.setGlobalBlacklistUnverifiedDevices(blacklistEnabled); // With cross-signing enabled, we send to unknown devices
      // without prompting. Any bad-device status the user should
      // be aware of will be signalled through the room shield
      // changing colour. More advanced behaviour will come once
      // we implement more settings.

      cli.setGlobalErrorOnUnknownDevices(false);
    }
  }

  showScreen(screen
  /*: string*/
  , params
  /*: {[key: string]: any}*/
  ) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const isLoggedOutOrGuest = !cli || cli.isGuest();

    if (!isLoggedOutOrGuest && AUTH_SCREENS.includes(screen)) {
      // user is logged in and landing on an auth page which will uproot their session, redirect them home instead
      _dispatcher.default.dispatch({
        action: "view_home_page"
      });

      return;
    }

    if (screen === 'register') {
      _dispatcher.default.dispatch({
        action: 'start_registration',
        params: params
      });
    } else if (screen === 'login') {
      _dispatcher.default.dispatch({
        action: 'start_login',
        params: params
      });
    } else if (screen === 'forgot_password') {
      _dispatcher.default.dispatch({
        action: 'start_password_recovery',
        params: params
      });
    } else if (screen === 'soft_logout') {
      if (cli.getUserId() && !Lifecycle.isSoftLogout()) {
        // Logged in - visit a room
        this.viewLastRoom();
      } else {
        // Ultimately triggers soft_logout if needed
        _dispatcher.default.dispatch({
          action: 'start_login',
          params: params
        });
      }
    } else if (screen === 'new') {
      _dispatcher.default.dispatch({
        action: 'view_create_room'
      });
    } else if (screen === 'settings') {
      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    } else if (screen === 'welcome') {
      _dispatcher.default.dispatch({
        action: 'view_welcome_page'
      });
    } else if (screen === 'home') {
      _dispatcher.default.dispatch({
        action: 'view_home_page'
      });
    } else if (screen === 'start') {
      this.showScreen('home');

      _dispatcher.default.dispatch({
        action: 'require_registration'
      });
    } else if (screen === 'directory') {
      if (this.state.view === Views.WELCOME) {
        _CountlyAnalytics.default.instance.track("onboarding_room_directory");
      }

      _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
    } else if (screen === "start_sso" || screen === "start_cas") {
      // TODO if logged in, skip SSO
      let cli = _MatrixClientPeg.MatrixClientPeg.get();

      if (!cli) {
        const {
          hsUrl,
          isUrl
        } = this.props.serverConfig;
        cli = Matrix.createClient({
          baseUrl: hsUrl,
          idBaseUrl: isUrl
        });
      }

      const type = screen === "start_sso" ? "sso" : "cas";

      _PlatformPeg.default.get().startSingleSignOn(cli, type, this.getFragmentAfterLogin());
    } else if (screen === 'groups') {
      _dispatcher.default.dispatch({
        action: 'view_my_groups'
      });
    } else if (screen.indexOf('room/') === 0) {
      // Rooms can have the following formats:
      // #room_alias:domain or !opaque_id:domain
      const room = screen.substring(5);
      const domainOffset = room.indexOf(':') + 1; // 0 in case room does not contain a :

      let eventOffset = room.length; // room aliases can contain slashes only look for slash after domain

      if (room.substring(domainOffset).indexOf('/') > -1) {
        eventOffset = domainOffset + room.substring(domainOffset).indexOf('/');
      }

      const roomString = room.substring(0, eventOffset);
      let eventId = room.substring(eventOffset + 1); // empty string if no event id given
      // Previously we pulled the eventID from the segments in such a way
      // where if there was no eventId then we'd get undefined. However, we
      // now do a splice and join to handle v3 event IDs which results in
      // an empty string. To maintain our potential contract with the rest
      // of the app, we coerce the eventId to be undefined where applicable.

      if (!eventId) eventId = undefined; // TODO: Handle encoded room/event IDs: https://github.com/vector-im/element-web/issues/9149

      let threepidInvite
      /*: IThreepidInvite*/
      ; // if we landed here from a 3PID invite, persist it

      if (params.signurl && params.email) {
        threepidInvite = _ThreepidInviteStore.default.instance.storeInvite(roomString, params);
      } // otherwise check that this room doesn't already have a known invite


      if (!threepidInvite) {
        const invites = _ThreepidInviteStore.default.instance.getInvites();

        threepidInvite = invites.find(invite => invite.roomId === roomString);
      } // on our URLs there might be a ?via=matrix.org or similar to help
      // joins to the room succeed. We'll pass these through as an array
      // to other levels. If there's just one ?via= then params.via is a
      // single string. If someone does something like ?via=one.com&via=two.com
      // then params.via is an array of strings.


      let via = [];

      if (params.via) {
        if (typeof params.via === 'string') via = [params.via];else via = params.via;
      }

      const payload = {
        action: 'view_room',
        event_id: eventId,
        via_servers: via,
        // If an event ID is given in the URL hash, notify RoomViewStore to mark
        // it as highlighted, which will propagate to RoomView and highlight the
        // associated EventTile.
        highlighted: Boolean(eventId),
        threepid_invite: threepidInvite,
        // TODO: Replace oob_data with the threepidInvite (which has the same info).
        // This isn't done yet because it's threaded through so many more places.
        // See https://github.com/vector-im/element-web/issues/15157
        oob_data: {
          name: threepidInvite?.roomName,
          avatarUrl: threepidInvite?.roomAvatarUrl,
          inviterName: threepidInvite?.inviterName
        },
        room_alias: undefined,
        room_id: undefined
      };

      if (roomString[0] === '#') {
        payload.room_alias = roomString;
      } else {
        payload.room_id = roomString;
      }

      _dispatcher.default.dispatch(payload);
    } else if (screen.indexOf('user/') === 0) {
      const userId = screen.substring(5);

      _dispatcher.default.dispatch({
        action: 'view_user_info',
        userId: userId,
        subAction: params.action
      });
    } else if (screen.indexOf('group/') === 0) {
      const groupId = screen.substring(6); // TODO: Check valid group ID

      _dispatcher.default.dispatch({
        action: 'view_group',
        group_id: groupId
      });
    } else {
      console.info("Ignoring showScreen for '%s'", screen);
    }
  }

  notifyNewScreen(screen
  /*: string*/
  , replaceLast = false) {
    if (this.props.onNewScreen) {
      this.props.onNewScreen(screen, replaceLast);
    }

    this.setPageSubtitle();
  }

  onAliasClick(event
  /*: MouseEvent*/
  , alias
  /*: string*/
  ) {
    event.preventDefault();

    _dispatcher.default.dispatch({
      action: 'view_room',
      room_alias: alias
    });
  }

  onUserClick(event
  /*: MouseEvent*/
  , userId
  /*: string*/
  ) {
    event.preventDefault();
    const member = new _roomMember.RoomMember(null, userId);

    if (!member) {
      return;
    }

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewUser,
      member: member
    });
  }

  onGroupClick(event
  /*: MouseEvent*/
  , groupId
  /*: string*/
  ) {
    event.preventDefault();

    _dispatcher.default.dispatch({
      action: 'view_group',
      group_id: groupId
    });
  }

  onLogoutClick(event
  /*: React.MouseEvent<HTMLAnchorElement, MouseEvent>*/
  ) {
    _dispatcher.default.dispatch({
      action: 'logout'
    });

    event.stopPropagation();
    event.preventDefault();
  }

  dispatchTimelineResize() {
    _dispatcher.default.dispatch({
      action: 'timeline_resize'
    });
  }

  onRoomCreated(roomId
  /*: string*/
  ) {
    _dispatcher.default.dispatch({
      action: "view_room",
      room_id: roomId
    });
  }

  // returns a promise which resolves to the new MatrixClient
  onRegistered(credentials
  /*: IMatrixClientCreds*/
  ) {
    return Lifecycle.setLoggedIn(credentials);
  }

  onSendEvent(roomId
  /*: string*/
  , event
  /*: MatrixEvent*/
  ) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (!cli) {
      _dispatcher.default.dispatch({
        action: 'message_send_failed'
      });

      return;
    }

    cli.sendEvent(roomId, event.getType(), event.getContent()).then(() => {
      _dispatcher.default.dispatch({
        action: 'message_sent'
      });
    }, err => {
      _dispatcher.default.dispatch({
        action: 'message_send_failed'
      });
    });
  }

  setPageSubtitle(subtitle = '') {
    if (this.state.currentRoomId) {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const room = client && client.getRoom(this.state.currentRoomId);

      if (room) {
        subtitle = `${this.subTitleStatus} | ${room.name} ${subtitle}`;
      }
    } else {
      subtitle = `${this.subTitleStatus} ${subtitle}`;
    }

    const title = `${_SdkConfig.default.get().brand} ${subtitle}`;

    if (document.title !== title) {
      document.title = title;
    }
  }

  updateStatusIndicator(state
  /*: string*/
  , prevState
  /*: string*/
  ) {
    const notificationState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.globalState;
    const numUnreadRooms = notificationState.numUnreadStates; // we know that states === rooms here

    if (_PlatformPeg.default.get()) {
      _PlatformPeg.default.get().setErrorStatus(state === 'ERROR');

      _PlatformPeg.default.get().setNotificationCount(numUnreadRooms);
    }

    this.subTitleStatus = '';

    if (state === "ERROR") {
      this.subTitleStatus += `[${(0, _languageHandler._t)("Offline")}] `;
    }

    if (numUnreadRooms > 0) {
      this.subTitleStatus += `[${numUnreadRooms}]`;
    }

    this.setPageSubtitle();
  }

  onCloseAllSettings() {
    _dispatcher.default.dispatch({
      action: 'close_settings'
    });
  }

  getFragmentAfterLogin() {
    let fragmentAfterLogin = "";
    const initialScreenAfterLogin = this.props.initialScreenAfterLogin;

    if (initialScreenAfterLogin && // XXX: workaround for https://github.com/vector-im/element-web/issues/11643 causing a login-loop
    !["welcome", "login", "register", "start_sso", "start_cas"].includes(initialScreenAfterLogin.screen)) {
      fragmentAfterLogin = `/${initialScreenAfterLogin.screen}`;
    }

    return fragmentAfterLogin;
  }

  render() {
    const fragmentAfterLogin = this.getFragmentAfterLogin();
    let view = null;

    if (this.state.view === Views.LOADING) {
      const Spinner = sdk.getComponent('elements.Spinner');
      view = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MatrixChat_splash"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null));
    } else if (this.state.view === Views.COMPLETE_SECURITY) {
      const CompleteSecurity = sdk.getComponent('structures.auth.CompleteSecurity');
      view = /*#__PURE__*/_react.default.createElement(CompleteSecurity, {
        onFinished: this.onCompleteSecurityE2eSetupFinished
      });
    } else if (this.state.view === Views.E2E_SETUP) {
      const E2eSetup = sdk.getComponent('structures.auth.E2eSetup');
      view = /*#__PURE__*/_react.default.createElement(E2eSetup, {
        onFinished: this.onCompleteSecurityE2eSetupFinished,
        accountPassword: this.accountPassword,
        tokenLogin: !!this.tokenLogin
      });
    } else if (this.state.view === Views.LOGGED_IN) {
      // store errors stop the client syncing and require user intervention, so we'll
      // be showing a dialog. Don't show anything else.
      const isStoreError = this.state.syncError && this.state.syncError instanceof _errors.InvalidStoreError; // `ready` and `view==LOGGED_IN` may be set before `page_type` (because the
      // latter is set via the dispatcher). If we don't yet have a `page_type`,
      // keep showing the spinner for now.

      if (this.state.ready && this.state.page_type && !isStoreError) {
        /* for now, we stuff the entirety of our props and state into the LoggedInView.
         * we should go through and figure out what we actually need to pass down, as well
         * as using something like redux to avoid having a billion bits of state kicking around.
         */
        const LoggedInView = sdk.getComponent('structures.LoggedInView');
        view = /*#__PURE__*/_react.default.createElement(LoggedInView, (0, _extends2.default)({}, this.props, this.state, {
          ref: this.loggedInView,
          matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
          onRoomCreated: this.onRoomCreated,
          onCloseAllSettings: this.onCloseAllSettings,
          onRegistered: this.onRegistered,
          currentRoomId: this.state.currentRoomId
        }));
      } else {
        // we think we are logged in, but are still waiting for the /sync to complete
        const Spinner = sdk.getComponent('elements.Spinner');
        let errorBox;

        if (this.state.syncError && !isStoreError) {
          errorBox = /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_MatrixChat_syncError"
          }, (0, _ErrorUtils.messageForSyncError)(this.state.syncError));
        }

        view = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MatrixChat_splash"
        }, errorBox, /*#__PURE__*/_react.default.createElement(Spinner, null), /*#__PURE__*/_react.default.createElement("a", {
          href: "#",
          className: "mx_MatrixChat_splashButtons",
          onClick: this.onLogoutClick
        }, (0, _languageHandler._t)('Logout')));
      }
    } else if (this.state.view === Views.WELCOME) {
      const Welcome = sdk.getComponent('auth.Welcome');
      view = /*#__PURE__*/_react.default.createElement(Welcome, null);
    } else if (this.state.view === Views.REGISTER && _SettingsStore.default.getValue(_UIFeature.UIFeature.Registration)) {
      const Registration = sdk.getComponent('structures.auth.Registration');
      const email = _ThreepidInviteStore.default.instance.pickBestInvite()?.toEmail;
      view = /*#__PURE__*/_react.default.createElement(Registration, (0, _extends2.default)({
        clientSecret: this.state.register_client_secret,
        sessionId: this.state.register_session_id,
        idSid: this.state.register_id_sid,
        email: email,
        brand: this.props.config.brand,
        makeRegistrationUrl: this.makeRegistrationUrl,
        onLoggedIn: this.onRegisterFlowComplete,
        onLoginClick: this.onLoginClick,
        onServerConfigChange: this.onServerConfigChange,
        defaultDeviceDisplayName: this.props.defaultDeviceDisplayName,
        fragmentAfterLogin: fragmentAfterLogin
      }, this.getServerProperties()));
    } else if (this.state.view === Views.FORGOT_PASSWORD && _SettingsStore.default.getValue(_UIFeature.UIFeature.PasswordReset)) {
      const ForgotPassword = sdk.getComponent('structures.auth.ForgotPassword');
      view = /*#__PURE__*/_react.default.createElement(ForgotPassword, (0, _extends2.default)({
        onComplete: this.onLoginClick,
        onLoginClick: this.onLoginClick,
        onServerConfigChange: this.onServerConfigChange
      }, this.getServerProperties()));
    } else if (this.state.view === Views.LOGIN) {
      const showPasswordReset = _SettingsStore.default.getValue(_UIFeature.UIFeature.PasswordReset);

      const Login = sdk.getComponent('structures.auth.Login');
      view = /*#__PURE__*/_react.default.createElement(Login, (0, _extends2.default)({
        isSyncing: this.state.pendingInitialSync,
        onLoggedIn: this.onUserCompletedLoginFlow,
        onRegisterClick: this.onRegisterClick,
        fallbackHsUrl: this.getFallbackHsUrl(),
        defaultDeviceDisplayName: this.props.defaultDeviceDisplayName,
        onForgotPasswordClick: showPasswordReset ? this.onForgotPasswordClick : undefined,
        onServerConfigChange: this.onServerConfigChange,
        fragmentAfterLogin: fragmentAfterLogin
      }, this.getServerProperties()));
    } else if (this.state.view === Views.SOFT_LOGOUT) {
      const SoftLogout = sdk.getComponent('structures.auth.SoftLogout');
      view = /*#__PURE__*/_react.default.createElement(SoftLogout, {
        realQueryParams: this.props.realQueryParams,
        onTokenLoginCompleted: this.props.onTokenLoginCompleted,
        fragmentAfterLogin: fragmentAfterLogin
      });
    } else {
      console.error(`Unknown view ${this.state.view}`);
    }

    const ErrorBoundary = sdk.getComponent('elements.ErrorBoundary');
    return /*#__PURE__*/_react.default.createElement(ErrorBoundary, null, view);
  }

}

exports.default = MatrixChat;
(0, _defineProperty2.default)(MatrixChat, "displayName", "MatrixChat");
(0, _defineProperty2.default)(MatrixChat, "defaultProps", {
  realQueryParams: {},
  startingFragmentQueryParams: {},
  config: {},
  onTokenLoginCompleted: () => {}
});

function isLoggedIn()
/*: boolean*/
{
  // JRS: Maybe we should move the step that writes this to the window out of
  // `element-web` and into this file? Better yet, we should probably create a
  // store to hold this state.
  // See also https://github.com/vector-im/element-web/issues/15034.
  const app = window.matrixChat;
  return app && app.state.view === Views.LOGGED_IN;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTWF0cml4Q2hhdC50c3giXSwibmFtZXMiOlsiVmlld3MiLCJBVVRIX1NDUkVFTlMiLCJPTkJPQVJESU5HX0ZMT1dfU1RBUlRFUlMiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiTWF0cml4Q2hhdCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwicGF5bG9hZCIsIlF1ZXN0aW9uRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiaXNHdWVzdCIsImluY2x1ZGVzIiwiYWN0aW9uIiwiZGlzIiwiZGlzcGF0Y2giLCJkZWZlcnJlZF9hY3Rpb24iLCJldmVudF90eXBlIiwiZnVsbFVybCIsImV2ZW50X2NvbnRlbnQiLCJzZXRJZGVudGl0eVNlcnZlclVybCIsImxvY2FsU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJzZXRJdGVtIiwiTGlmZWN5Y2xlIiwibG9nb3V0IiwiaXNTb2Z0TG9nb3V0Iiwib25Tb2Z0TG9nb3V0Iiwic2NyZWVuQWZ0ZXJMb2dpbiIsInN0YXJ0UmVnaXN0cmF0aW9uIiwicGFyYW1zIiwic2V0U3RhdGVGb3JOZXdWaWV3IiwidmlldyIsIkxPR0lOIiwibm90aWZ5TmV3U2NyZWVuIiwiVGhlbWVDb250cm9sbGVyIiwiaXNMb2dpbiIsInRoZW1lV2F0Y2hlciIsInJlY2hlY2siLCJGT1JHT1RfUEFTU1dPUkQiLCJkbVVzZXJJZCIsInVzZXJfaWQiLCJsZWF2ZVJvb20iLCJyb29tX2lkIiwiZm9yZ2V0Um9vbSIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJvbkZpbmlzaGVkIiwiY29uZmlybSIsIkxvYWRlciIsIm1vZGFsIiwiY3JlYXRlRGlhbG9nIiwibGVhdmUiLCJ0aGVuIiwiY2xvc2UiLCJzdGF0ZSIsImN1cnJlbnRSb29tSWQiLCJlcnIiLCJFcnJvckRpYWxvZyIsInRvU3RyaW5nIiwidmlld1VzZXIiLCJ1c2VySWQiLCJzdWJBY3Rpb24iLCJwcm9taXNlIiwidmlld1Jvb20iLCJ0YWJQYXlsb2FkIiwiVXNlclNldHRpbmdzRGlhbG9nIiwiaW5pdGlhbFRhYklkIiwidmlld1NvbWV0aGluZ0JlaGluZE1vZGFsIiwiY3JlYXRlUm9vbSIsInB1YmxpYyIsIkNyZWF0ZUdyb3VwRGlhbG9nIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nIiwiVmlld1Jvb21EaXJlY3RvcnkiLCJSb29tRGlyZWN0b3J5IiwiaW5pdGlhbFRleHQiLCJzZXRQYWdlIiwiUGFnZVR5cGVzIiwiTXlHcm91cHMiLCJ2aWV3R3JvdXAiLCJ2aWV3V2VsY29tZSIsInZpZXdIb21lIiwianVzdFJlZ2lzdGVyZWQiLCJjaGF0Q3JlYXRlT3JSZXVzZSIsInJvb21JZCIsInNob3dTY3JlZW5BZnRlckxvZ2luIiwicGFnZV90eXBlIiwic2V0U3RhdGUiLCJjb2xsYXBzZUxocyIsInJlc2l6ZU5vdGlmaWVyIiwibm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQiLCJPcGVuRGlhbFBhZCIsIkRpYWxQYWRNb2RhbCIsInRva2VuTG9naW4iLCJSRUdJU1RFUiIsIkNPTVBMRVRFX1NFQ1VSSVRZIiwiRTJFX1NFVFVQIiwib25Mb2dnZWRJbiIsIm9uTG9nZ2VkT3V0IiwicmVhZHkiLCJvbldpbGxTdGFydENsaWVudCIsIm9uQ2xpZW50U3RhcnRlZCIsIm9uU2VuZEV2ZW50IiwiZXZlbnQiLCJoaWRlVG9TUlVzZXJzIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJBbmFseXRpY3MiLCJjYW5FbmFibGUiLCJlbmFibGUiLCJDb3VudGx5QW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJoaWRlTGhzVGhyZXNob2xkIiwic2hvd0xoc1RocmVzaG9sZCIsIndpbmRvd1dpZHRoIiwid2luZG93IiwiaW5uZXJXaWR0aCIsIm5vdGlmeVdpbmRvd1Jlc2l6ZWQiLCJzaG93U2NyZWVuIiwiY3JlZGVudGlhbHMiLCJwYXNzd29yZCIsIm9uVXNlckNvbXBsZXRlZExvZ2luRmxvdyIsInNlcnZlckNvbmZpZyIsInN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcyIsInJlZmVycmVyIiwibWFrZVJlZ2lzdHJhdGlvblVybCIsImFjY291bnRQYXNzd29yZCIsImFjY291bnRQYXNzd29yZFRpbWVyIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsInNldExvZ2dlZEluIiwicG9zdExvZ2luU2V0dXAiLCJMT0FESU5HIiwic3luY0Vycm9yIiwiUmVzaXplTm90aWZpZXIiLCJsb2dnZWRJblZpZXciLCJTZGtDb25maWciLCJwdXQiLCJjb25maWciLCJmaXJzdFN5bmNDb21wbGV0ZSIsImZpcnN0U3luY1Byb21pc2UiLCJzeW5jX3RpbWVsaW5lX2xpbWl0Iiwib3B0cyIsImluaXRpYWxTeW5jTGltaXQiLCJpbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbiIsInNjcmVlbiIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJUaHJlZXBpZEludml0ZVN0b3JlIiwic3RvcmVJbnZpdGUiLCJoYW5kbGVSZXNpemUiLCJhZGRFdmVudExpc3RlbmVyIiwicGFnZUNoYW5naW5nIiwiVGludGVyIiwidGludCIsIm9uIiwiZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSIsImxvYWRTZXNzaW9uIiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJUaGVtZVdhdGNoZXIiLCJmb250V2F0Y2hlciIsIkZvbnRXYXRjaGVyIiwic3RhcnQiLCJmb2N1c0NvbXBvc2VyIiwic3ViVGl0bGVTdGF0dXMiLCJvbkFsaWFzQ2xpY2siLCJsaW5raWZ5TWF0cml4Iiwib25Vc2VyQ2xpY2siLCJvbkdyb3VwQ2xpY2siLCJhdHRlbXB0VG9rZW5Mb2dpbiIsInJlYWxRdWVyeVBhcmFtcyIsImRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSIsImdldEZyYWdtZW50QWZ0ZXJMb2dpbiIsImxvZ2dlZEluIiwibG9naW5Ub2tlbiIsIm9uVG9rZW5Mb2dpbkNvbXBsZXRlZCIsInJlc3RvcmVGcm9tTG9jYWxTdG9yYWdlIiwiaWdub3JlR3Vlc3QiLCJmaXJzdFNjcmVlbiIsImNsaSIsImNyeXB0b0VuYWJsZWQiLCJpc0NyeXB0b0VuYWJsZWQiLCJwcm9taXNlc0xpc3QiLCJwdXNoIiwiZG93bmxvYWRLZXlzIiwiZ2V0VXNlcklkIiwicGVuZGluZ0luaXRpYWxTeW5jIiwiUHJvbWlzZSIsImFsbCIsImNyb3NzU2lnbmluZ0lzU2V0VXAiLCJnZXRTdG9yZWRDcm9zc1NpZ25pbmdGb3JVc2VyIiwiZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUiLCJVTlNBRkVfY29tcG9uZW50V2lsbFVwZGF0ZSIsInNob3VsZFRyYWNrUGFnZUNoYW5nZSIsInN0YXJ0UGFnZUNoYW5nZVRpbWVyIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwiZHVyYXRpb25NcyIsInN0b3BQYWdlQ2hhbmdlVGltZXIiLCJ0cmFja1BhZ2VDaGFuZ2UiLCJmaXJlIiwiRm9jdXNDb21wb3NlciIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwic3RvcE1hdHJpeENsaWVudCIsInVucmVnaXN0ZXIiLCJzdG9wIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwiZ2V0RmFsbGJhY2tIc1VybCIsImlzRGVmYXVsdCIsImZhbGxiYWNrX2hzX3VybCIsImdldFNlcnZlclByb3BlcnRpZXMiLCJyZXNvbHZlIiwiZnJhZ21lbnRRdWVyeVBhcmFtcyIsImVuYWJsZUd1ZXN0IiwiZ3Vlc3RIc1VybCIsImhzVXJsIiwiZ3Vlc3RJc1VybCIsImlzVXJsIiwibG9hZGVkU2Vzc2lvbiIsInBpY2tCZXN0SW52aXRlIiwicGVyZm9ybWFuY2UiLCJtYXJrIiwiY29uc29sZSIsIndhcm4iLCJtZWFzdXJlIiwiY2xlYXJNYXJrcyIsIm1lYXN1cmVtZW50IiwiZ2V0RW50cmllc0J5TmFtZSIsInBvcCIsImR1cmF0aW9uIiwidW5kZWZpbmVkIiwiRXJyb3IiLCJuZXdTdGF0ZSIsImN1cnJlbnRVc2VySWQiLCJPYmplY3QiLCJhc3NpZ24iLCJwYWdlVHlwZSIsImNsaWVudF9zZWNyZXQiLCJzZXNzaW9uX2lkIiwiaHNfdXJsIiwiaXNfdXJsIiwic2lkIiwiQXV0b0Rpc2NvdmVyeVV0aWxzIiwidmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyIsInJlZ2lzdGVyX2NsaWVudF9zZWNyZXQiLCJyZWdpc3Rlcl9zZXNzaW9uX2lkIiwicmVnaXN0ZXJfaWRfc2lkIiwicm9vbUluZm8iLCJyb29tX2FsaWFzIiwibG9nIiwiZXZlbnRfaWQiLCJ3YWl0Rm9yIiwicHJlc2VudGVkSWQiLCJyb29tIiwiZ2V0Um9vbSIsInRoZUFsaWFzIiwiUm9vbXMiLCJnZXREaXNwbGF5QWxpYXNGb3JSb29tIiwicmVwbGFjZUxhc3QiLCJoaWdobGlnaHRlZCIsIkxPR0dFRF9JTiIsIlJvb21WaWV3IiwidGhyZWVwaWRJbnZpdGUiLCJ0aHJlZXBpZF9pbnZpdGUiLCJyb29tT29iRGF0YSIsIm9vYl9kYXRhIiwidmlhU2VydmVycyIsInZpYV9zZXJ2ZXJzIiwiZ3JvdXBJZCIsImdyb3VwX2lkIiwiY3VycmVudEdyb3VwSWQiLCJjdXJyZW50R3JvdXBJc05ldyIsImdyb3VwX2lzX25ldyIsIkdyb3VwVmlldyIsIldFTENPTUUiLCJIb21lUGFnZSIsIndhaXRGb3JTeW5jIiwiVXNlclZpZXciLCJkZWZhdWx0UHVibGljIiwiY29tbXVuaXR5SWQiLCJDb21tdW5pdHlQcm90b3R5cGVTdG9yZSIsImdldFNlbGVjdGVkQ29tbXVuaXR5SWQiLCJpc0FkbWluT2YiLCJDcmVhdGVSb29tRGlhbG9nIiwic2hvdWxkQ3JlYXRlIiwiZmluaXNoZWQiLCJ3ZWxjb21lVXNlcklkIiwiZ29fd2VsY29tZV9vbl9jYW5jZWwiLCJzY3JlZW5fYWZ0ZXIiLCJjbGllbnQiLCJkbVJvb21NYXAiLCJETVJvb21NYXAiLCJkbVJvb21zIiwiZ2V0RE1Sb29tc0ZvclVzZXJJZCIsImxlYXZlUm9vbVdhcm5pbmdzIiwicm9vbVRvTGVhdmUiLCJqb2luUnVsZXMiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIndhcm5pbmdzIiwicnVsZSIsImdldENvbnRlbnQiLCJqb2luX3J1bGUiLCJyb29tTmFtZSIsIm5hbWUiLCJidXR0b24iLCJzaG91bGRMZWF2ZSIsImQiLCJmaW5hbGx5IiwiZm9yZ2V0IiwiY2F0Y2giLCJlcnJDb2RlIiwiZXJyY29kZSIsIm1lc3NhZ2UiLCJzdGFydFdlbGNvbWVVc2VyQ2hhdCIsIndlbGNvbWVVc2VyUm9vbXMiLCJzaGFyZWQiLCJhbmRWaWV3Iiwic3Bpbm5lciIsInNhdmVXZWxjb21lVXNlciIsImV2IiwiZ2V0VHlwZSIsInN0b3JlIiwic2F2ZSIsImN1cnJlbnRVc2VySXNKdXN0UmVnaXN0ZXJlZCIsInNldEp1c3RSZWdpc3RlcmVkVXNlcklkIiwid2VsY29tZVVzZXJSb29tIiwidHJhbnNsYXRlVG9XaXJlRm9ybWF0IiwiU3RvcmFnZU1hbmFnZXIiLCJ0cnlQZXJzaXN0U3RvcmFnZSIsInBpd2lrIiwicG9saWN5VXJsIiwibW9iaWxlR3VpZGVUb2FzdCIsImdldEl0ZW0iLCJ2aWV3TGFzdFJvb20iLCJzZXRQYWdlU3VidGl0bGUiLCJTT0ZUX0xPR09VVCIsInNldENhblJlc2V0VGltZWxpbmVDYWxsYmFjayIsImN1cnJlbnQiLCJjYW5SZXNldFRpbWVsaW5lSW5Sb29tIiwiZGF0YSIsImVycm9yIiwiSW52YWxpZFN0b3JlRXJyb3IiLCJoYW5kbGVJbnZhbGlkU3RvcmVFcnJvciIsInVwZGF0ZVN0YXR1c0luZGljYXRvciIsImluZm8iLCJOb3RpZmllciIsInNob3VsZFNob3dQcm9tcHQiLCJ1c2VyUmVnaXN0ZXJlZFdpdGhpbkxhc3RIb3VycyIsImVyck9iaiIsImlzTG9nZ2luZ091dCIsImNsb3NlQ3VycmVudE1vZGFsIiwiaHR0cFN0YXR1cyIsInNvZnRMb2dvdXQiLCJjb25zZW50VXJpIiwiaG9tZXNlcnZlckRvbWFpbiIsImdldERvbWFpbiIsImNhbmNlbEJ1dHRvbiIsImNvbmZpcm1lZCIsInduZCIsIm9wZW4iLCJvcGVuZXIiLCJkZnQiLCJEZWNyeXB0aW9uRmFpbHVyZVRyYWNrZXIiLCJ0b3RhbCIsImVycm9yQ29kZSIsInRyYWNrRXZlbnQiLCJ0cmFjayIsInN1bSIsImUiLCJldmVudERlY3J5cHRlZCIsImJsYWNrbGlzdEVuYWJsZWQiLCJnZXRWYWx1ZUF0IiwiUk9PTV9ERVZJQ0UiLCJzZXRCbGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlcyIsInR5cGUiLCJicmFuZCIsImhhdmVOZXdWZXJzaW9uIiwibmV3VmVyc2lvbkluZm8iLCJnZXRLZXlCYWNrdXBFbmFibGVkIiwiZ2V0S2V5QmFja3VwVmVyc2lvbiIsImNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYyIsImZhaWx1cmVzIiwic291cmNlIiwiY29udGludWF0aW9uIiwiS2V5U2lnbmF0dXJlVXBsb2FkRmFpbGVkRGlhbG9nIiwicmVxdWVzdCIsInZlcmlmaWVyIiwiSW5jb21pbmdTYXNEaWFsb2ciLCJwZW5kaW5nIiwiVG9hc3RTdG9yZSIsInNoYXJlZEluc3RhbmNlIiwiYWRkT3JSZXBsYWNlVG9hc3QiLCJrZXkiLCJjaGFubmVsIiwidHJhbnNhY3Rpb25JZCIsImlzU2VsZlZlcmlmaWNhdGlvbiIsImljb24iLCJjb21wb25lbnQiLCJwcmlvcml0eSIsImNvbG9yU2NoZW1lIiwicHJpbWFyeV9jb2xvciIsInNlY29uZGFyeV9jb2xvciIsInNldEdsb2JhbEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzIiwic2V0R2xvYmFsRXJyb3JPblVua25vd25EZXZpY2VzIiwiaXNMb2dnZWRPdXRPckd1ZXN0IiwiTWF0cml4IiwiY3JlYXRlQ2xpZW50IiwiYmFzZVVybCIsImlkQmFzZVVybCIsIlBsYXRmb3JtUGVnIiwic3RhcnRTaW5nbGVTaWduT24iLCJpbmRleE9mIiwiZG9tYWluT2Zmc2V0IiwiZXZlbnRPZmZzZXQiLCJyb29tU3RyaW5nIiwiZXZlbnRJZCIsInNpZ251cmwiLCJlbWFpbCIsImludml0ZXMiLCJnZXRJbnZpdGVzIiwiZmluZCIsImludml0ZSIsInZpYSIsIkJvb2xlYW4iLCJhdmF0YXJVcmwiLCJyb29tQXZhdGFyVXJsIiwiaW52aXRlck5hbWUiLCJvbk5ld1NjcmVlbiIsImFsaWFzIiwicHJldmVudERlZmF1bHQiLCJtZW1iZXIiLCJSb29tTWVtYmVyIiwiVmlld1VzZXIiLCJvbkxvZ291dENsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwib25Sb29tQ3JlYXRlZCIsIm9uUmVnaXN0ZXJlZCIsInNlbmRFdmVudCIsInN1YnRpdGxlIiwiZG9jdW1lbnQiLCJub3RpZmljYXRpb25TdGF0ZSIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiZ2xvYmFsU3RhdGUiLCJudW1VbnJlYWRSb29tcyIsIm51bVVucmVhZFN0YXRlcyIsInNldEVycm9yU3RhdHVzIiwic2V0Tm90aWZpY2F0aW9uQ291bnQiLCJvbkNsb3NlQWxsU2V0dGluZ3MiLCJmcmFnbWVudEFmdGVyTG9naW4iLCJyZW5kZXIiLCJTcGlubmVyIiwiQ29tcGxldGVTZWN1cml0eSIsIm9uQ29tcGxldGVTZWN1cml0eUUyZVNldHVwRmluaXNoZWQiLCJFMmVTZXR1cCIsImlzU3RvcmVFcnJvciIsIkxvZ2dlZEluVmlldyIsImVycm9yQm94IiwiV2VsY29tZSIsIlVJRmVhdHVyZSIsIlJlZ2lzdHJhdGlvbiIsInRvRW1haWwiLCJvblJlZ2lzdGVyRmxvd0NvbXBsZXRlIiwib25Mb2dpbkNsaWNrIiwib25TZXJ2ZXJDb25maWdDaGFuZ2UiLCJQYXNzd29yZFJlc2V0IiwiRm9yZ290UGFzc3dvcmQiLCJzaG93UGFzc3dvcmRSZXNldCIsIkxvZ2luIiwib25SZWdpc3RlckNsaWNrIiwib25Gb3Jnb3RQYXNzd29yZENsaWNrIiwiU29mdExvZ291dCIsIkVycm9yQm91bmRhcnkiLCJpc0xvZ2dlZEluIiwiYXBwIiwibWF0cml4Q2hhdCJdLCJt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QzlDLFlBQU11SSxVQUFVLEdBQUcxZCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsNEJBQWpCLENBQW5CO0FBQ0F3QixNQUFBQSxJQUFJLGdCQUNBLDZCQUFDLFVBQUQ7QUFDSSxRQUFBLGVBQWUsRUFBRSxLQUFLN0IsS0FBTCxDQUFXK0ssZUFEaEM7QUFFSSxRQUFBLHFCQUFxQixFQUFFLEtBQUsvSyxLQUFMLENBQVdvTCxxQkFGdEM7QUFHSSxRQUFBLGtCQUFrQixFQUFFb1I7QUFIeEIsUUFESjtBQU9ILEtBVE0sTUFTQTtBQUNIbk8sTUFBQUEsT0FBTyxDQUFDdUgsS0FBUixDQUFlLGdCQUFlLEtBQUt0UyxLQUFMLENBQVd6QixJQUFLLEVBQTlDO0FBQ0g7O0FBRUQsVUFBTWtjLGFBQWEsR0FBRzNkLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix3QkFBakIsQ0FBdEI7QUFDQSx3QkFBTyw2QkFBQyxhQUFELFFBQ0Z3QixJQURFLENBQVA7QUFHSDs7QUExekR1RTs7OzhCQUF2RGpDLFUsaUJBQ0ksWTs4QkFESkEsVSxrQkFHSztBQUNsQm1MLEVBQUFBLGVBQWUsRUFBRSxFQURDO0FBRWxCbEQsRUFBQUEsMkJBQTJCLEVBQUUsRUFGWDtBQUdsQmUsRUFBQUEsTUFBTSxFQUFFLEVBSFU7QUFJbEJ3QyxFQUFBQSxxQkFBcUIsRUFBRSxNQUFNLENBQUU7QUFKYixDOztBQTB6RG5CLFNBQVM0UyxVQUFUO0FBQUE7QUFBK0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFNQyxHQUFHLEdBQUc1VyxNQUFNLENBQUM2VyxVQUFuQjtBQUNBLFNBQU9ELEdBQUcsSUFBS0EsR0FBRCxDQUFvQjNhLEtBQXBCLENBQTBCekIsSUFBMUIsS0FBbUN0QyxLQUFLLENBQUNvUixTQUF2RDtBQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTctMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuLy8gQHRzLWlnbm9yZSAtIFhYWDogbm8gaWRlYSB3aHkgdGhpcyBpbXBvcnQgZmFpbHNcbmltcG9ydCAqIGFzIE1hdHJpeCBmcm9tIFwibWF0cml4LWpzLXNka1wiO1xuaW1wb3J0IHsgSW52YWxpZFN0b3JlRXJyb3IgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvZXJyb3JzXCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG4vLyBmb2N1cy12aXNpYmxlIGlzIGEgUG9seWZpbGwgZm9yIHRoZSA6Zm9jdXMtdmlzaWJsZSBDU1MgcHNldWRvLWF0dHJpYnV0ZSB1c2VkIGJ5IF9BY2Nlc3NpYmxlQnV0dG9uLnNjc3NcbmltcG9ydCAnZm9jdXMtdmlzaWJsZSc7XG4vLyB3aGF0LWlucHV0IGhlbHBzIGltcHJvdmUga2V5Ym9hcmQgYWNjZXNzaWJpbGl0eVxuaW1wb3J0ICd3aGF0LWlucHV0JztcblxuaW1wb3J0IEFuYWx5dGljcyBmcm9tIFwiLi4vLi4vQW5hbHl0aWNzXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHsgRGVjcnlwdGlvbkZhaWx1cmVUcmFja2VyIH0gZnJvbSBcIi4uLy4uL0RlY3J5cHRpb25GYWlsdXJlVHJhY2tlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnLCBJTWF0cml4Q2xpZW50Q3JlZHMgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IE5vdGlmaWVyIGZyb20gJy4uLy4uL05vdGlmaWVyJztcblxuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFRpbnRlciBmcm9tIFwiLi4vLi4vVGludGVyXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgc2hvd1Jvb21JbnZpdGVEaWFsb2csIHNob3dTdGFydENoYXRJbnZpdGVEaWFsb2cgfSBmcm9tICcuLi8uLi9Sb29tSW52aXRlJztcbmltcG9ydCAqIGFzIFJvb21zIGZyb20gJy4uLy4uL1Jvb21zJztcbmltcG9ydCBsaW5raWZ5TWF0cml4IGZyb20gXCIuLi8uLi9saW5raWZ5LW1hdHJpeFwiO1xuaW1wb3J0ICogYXMgTGlmZWN5Y2xlIGZyb20gJy4uLy4uL0xpZmVjeWNsZSc7XG4vLyBMaWZlY3ljbGVTdG9yZSBpcyBub3QgdXNlZCBidXQgZG9lcyBsaXN0ZW4gdG8gYW5kIGRpc3BhdGNoIGFjdGlvbnNcbmltcG9ydCAnLi4vLi4vc3RvcmVzL0xpZmVjeWNsZVN0b3JlJztcbmltcG9ydCBQYWdlVHlwZXMgZnJvbSAnLi4vLi4vUGFnZVR5cGVzJztcblxuaW1wb3J0IGNyZWF0ZVJvb20gZnJvbSBcIi4uLy4uL2NyZWF0ZVJvb21cIjtcbmltcG9ydCB7X3QsIF90ZCwgZ2V0Q3VycmVudExhbmd1YWdlfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBUaGVtZUNvbnRyb2xsZXIgZnJvbSBcIi4uLy4uL3NldHRpbmdzL2NvbnRyb2xsZXJzL1RoZW1lQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgc3RhcnRBbnlSZWdpc3RyYXRpb25GbG93IH0gZnJvbSBcIi4uLy4uL1JlZ2lzdHJhdGlvbi5qc1wiO1xuaW1wb3J0IHsgbWVzc2FnZUZvclN5bmNFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL0Vycm9yVXRpbHMnO1xuaW1wb3J0IFJlc2l6ZU5vdGlmaWVyIGZyb20gXCIuLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiO1xuaW1wb3J0IEF1dG9EaXNjb3ZlcnlVdGlscywgeyBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gJy4uLy4uL3V0aWxzL0RNUm9vbU1hcCc7XG5pbXBvcnQgVGhlbWVXYXRjaGVyIGZyb20gXCIuLi8uLi9zZXR0aW5ncy93YXRjaGVycy9UaGVtZVdhdGNoZXJcIjtcbmltcG9ydCB7IEZvbnRXYXRjaGVyIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3Mvd2F0Y2hlcnMvRm9udFdhdGNoZXInO1xuaW1wb3J0IHsgc3RvcmVSb29tQWxpYXNJbkNhY2hlIH0gZnJvbSAnLi4vLi4vUm9vbUFsaWFzQ2FjaGUnO1xuaW1wb3J0IHsgZGVmZXIsIElEZWZlcnJlZCwgc2xlZXAgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcHJvbWlzZVwiO1xuaW1wb3J0IFRvYXN0U3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9Ub2FzdFN0b3JlXCI7XG5pbXBvcnQgKiBhcyBTdG9yYWdlTWFuYWdlciBmcm9tIFwiLi4vLi4vdXRpbHMvU3RvcmFnZU1hbmFnZXJcIjtcbmltcG9ydCB0eXBlIExvZ2dlZEluVmlld1R5cGUgZnJvbSBcIi4vTG9nZ2VkSW5WaWV3XCI7XG5pbXBvcnQgeyBWaWV3VXNlclBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3VXNlclBheWxvYWRcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7XG4gICAgc2hvd1RvYXN0IGFzIHNob3dBbmFseXRpY3NUb2FzdCxcbiAgICBoaWRlVG9hc3QgYXMgaGlkZUFuYWx5dGljc1RvYXN0LFxufSBmcm9tIFwiLi4vLi4vdG9hc3RzL0FuYWx5dGljc1RvYXN0XCI7XG5pbXBvcnQge3Nob3dUb2FzdCBhcyBzaG93Tm90aWZpY2F0aW9uc1RvYXN0fSBmcm9tIFwiLi4vLi4vdG9hc3RzL0Rlc2t0b3BOb3RpZmljYXRpb25zVG9hc3RcIjtcbmltcG9ydCB7IE9wZW5Ub1RhYlBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9PcGVuVG9UYWJQYXlsb2FkXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uL3ZpZXdzL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1Jvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgeyBsZWF2ZVJvb21CZWhhdmlvdXIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuaW1wb3J0IENyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dcIjtcbmltcG9ydCBUaHJlZXBpZEludml0ZVN0b3JlLCB7IElUaHJlZXBpZEludml0ZSwgSVRocmVlcGlkSW52aXRlV2lyZUZvcm1hdCB9IGZyb20gXCIuLi8uLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZVwiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7IENvbW11bml0eVByb3RvdHlwZVN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Db21tdW5pdHlQcm90b3R5cGVTdG9yZVwiO1xuaW1wb3J0IERpYWxQYWRNb2RhbCBmcm9tIFwiLi4vdmlld3Mvdm9pcC9EaWFsUGFkTW9kYWxcIjtcbmltcG9ydCB7IHNob3dUb2FzdCBhcyBzaG93TW9iaWxlR3VpZGVUb2FzdCB9IGZyb20gJy4uLy4uL3RvYXN0cy9Nb2JpbGVHdWlkZVRvYXN0JztcblxuLyoqIGNvbnN0YW50cyBmb3IgTWF0cml4Q2hhdC5zdGF0ZS52aWV3ICovXG5leHBvcnQgZW51bSBWaWV3cyB7XG4gICAgLy8gYSBzcGVjaWFsIGluaXRpYWwgc3RhdGUgd2hpY2ggaXMgb25seSB1c2VkIGF0IHN0YXJ0dXAsIHdoaWxlIHdlIGFyZVxuICAgIC8vIHRyeWluZyB0byByZS1hbmltYXRlIGEgbWF0cml4IGNsaWVudCBvciByZWdpc3RlciBhcyBhIGd1ZXN0LlxuICAgIExPQURJTkcsXG5cbiAgICAvLyB3ZSBhcmUgc2hvd2luZyB0aGUgd2VsY29tZSB2aWV3XG4gICAgV0VMQ09NRSxcblxuICAgIC8vIHdlIGFyZSBzaG93aW5nIHRoZSBsb2dpbiB2aWV3XG4gICAgTE9HSU4sXG5cbiAgICAvLyB3ZSBhcmUgc2hvd2luZyB0aGUgcmVnaXN0cmF0aW9uIHZpZXdcbiAgICBSRUdJU1RFUixcblxuICAgIC8vIHNob3dpbmcgdGhlICdmb3Jnb3QgcGFzc3dvcmQnIHZpZXdcbiAgICBGT1JHT1RfUEFTU1dPUkQsXG5cbiAgICAvLyBzaG93aW5nIGZsb3cgdG8gdHJ1c3QgdGhpcyBuZXcgZGV2aWNlIHdpdGggY3Jvc3Mtc2lnbmluZ1xuICAgIENPTVBMRVRFX1NFQ1VSSVRZLFxuXG4gICAgLy8gZmxvdyB0byBzZXR1cCBTU1NTIC8gY3Jvc3Mtc2lnbmluZyBvbiB0aGlzIGFjY291bnRcbiAgICBFMkVfU0VUVVAsXG5cbiAgICAvLyB3ZSBhcmUgbG9nZ2VkIGluIHdpdGggYW4gYWN0aXZlIG1hdHJpeCBjbGllbnQuIFRoZSBsb2dnZWRfaW4gc3RhdGUgYWxzb1xuICAgIC8vIGluY2x1ZGVzIGd1ZXN0cyB1c2VycyBhcyB0aGV5IHRvbyBhcmUgbG9nZ2VkIGluIGF0IHRoZSBjbGllbnQgbGV2ZWwuXG4gICAgTE9HR0VEX0lOLFxuXG4gICAgLy8gV2UgYXJlIGxvZ2dlZCBvdXQgKGludmFsaWQgdG9rZW4pIGJ1dCBoYXZlIG91ciBsb2NhbCBzdGF0ZSBhZ2Fpbi4gVGhlIHVzZXJcbiAgICAvLyBzaG91bGQgbG9nIGJhY2sgaW4gdG8gcmVoeWRyYXRlIHRoZSBjbGllbnQuXG4gICAgU09GVF9MT0dPVVQsXG59XG5cbmNvbnN0IEFVVEhfU0NSRUVOUyA9IFtcInJlZ2lzdGVyXCIsIFwibG9naW5cIiwgXCJmb3Jnb3RfcGFzc3dvcmRcIiwgXCJzdGFydF9zc29cIiwgXCJzdGFydF9jYXNcIl07XG5cbi8vIEFjdGlvbnMgdGhhdCBhcmUgcmVkaXJlY3RlZCB0aHJvdWdoIHRoZSBvbmJvYXJkaW5nIHByb2Nlc3MgcHJpb3IgdG8gYmVpbmdcbi8vIHJlLWRpc3BhdGNoZWQuIE5PVEU6IHNvbWUgYWN0aW9ucyBhcmUgbm9uLXRyaXZpYWwgYW5kIHdvdWxkIHJlcXVpcmVcbi8vIHJlLWZhY3RvcmluZyB0byBiZSBpbmNsdWRlZCBpbiB0aGlzIGxpc3QgaW4gZnV0dXJlLlxuY29uc3QgT05CT0FSRElOR19GTE9XX1NUQVJURVJTID0gW1xuICAgIEFjdGlvbi5WaWV3VXNlclNldHRpbmdzLFxuICAgICd2aWV3X2NyZWF0ZV9jaGF0JyxcbiAgICAndmlld19jcmVhdGVfcm9vbScsXG4gICAgJ3ZpZXdfY3JlYXRlX2dyb3VwJyxcbl07XG5cbmludGVyZmFjZSBJU2NyZWVuIHtcbiAgICBzY3JlZW46IHN0cmluZztcbiAgICBwYXJhbXM/OiBvYmplY3Q7XG59XG5cbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuaW50ZXJmYWNlIElSb29tSW5mbyB7XG4gICAgcm9vbV9pZD86IHN0cmluZztcbiAgICByb29tX2FsaWFzPzogc3RyaW5nO1xuICAgIGV2ZW50X2lkPzogc3RyaW5nO1xuXG4gICAgYXV0b19qb2luPzogYm9vbGVhbjtcbiAgICBoaWdobGlnaHRlZD86IGJvb2xlYW47XG4gICAgb29iX2RhdGE/OiBvYmplY3Q7XG4gICAgdmlhX3NlcnZlcnM/OiBzdHJpbmdbXTtcbiAgICB0aHJlZXBpZF9pbnZpdGU/OiBJVGhyZWVwaWRJbnZpdGU7XG59XG4vKiBlc2xpbnQtZW5hYmxlIGNhbWVsY2FzZSAqL1xuXG5pbnRlcmZhY2UgSVByb3BzIHsgLy8gVE9ETyB0eXBlIHRoaW5ncyBiZXR0ZXJcbiAgICBjb25maWc6IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAgc2VydmVyQ29uZmlnPzogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIG9uTmV3U2NyZWVuOiAoc2NyZWVuOiBzdHJpbmcsIHJlcGxhY2VMYXN0OiBib29sZWFuKSA9PiB2b2lkO1xuICAgIGVuYWJsZUd1ZXN0PzogYm9vbGVhbjtcbiAgICAvLyB0aGUgcXVlcnlQYXJhbXMgZXh0cmFjdGVkIGZyb20gdGhlIFtyZWFsXSBxdWVyeS1zdHJpbmcgb2YgdGhlIFVSSVxuICAgIHJlYWxRdWVyeVBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgLy8gdGhlIGluaXRpYWwgcXVlcnlQYXJhbXMgZXh0cmFjdGVkIGZyb20gdGhlIGhhc2gtZnJhZ21lbnQgb2YgdGhlIFVSSVxuICAgIHN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgLy8gY2FsbGVkIHdoZW4gd2UgaGF2ZSBjb21wbGV0ZWQgYSB0b2tlbiBsb2dpblxuICAgIG9uVG9rZW5Mb2dpbkNvbXBsZXRlZD86ICgpID0+IHZvaWQ7XG4gICAgLy8gUmVwcmVzZW50cyB0aGUgc2NyZWVuIHRvIGRpc3BsYXkgYXMgYSByZXN1bHQgb2YgcGFyc2luZyB0aGUgaW5pdGlhbCB3aW5kb3cubG9jYXRpb25cbiAgICBpbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbj86IElTY3JlZW47XG4gICAgLy8gZGlzcGxheW5hbWUsIGlmIGFueSwgdG8gc2V0IG9uIHRoZSBkZXZpY2Ugd2hlbiBsb2dnaW5nIGluL3JlZ2lzdGVyaW5nLlxuICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZT86IHN0cmluZztcbiAgICAvLyBBIGZ1bmN0aW9uIHRoYXQgbWFrZXMgYSByZWdpc3RyYXRpb24gVVJMXG4gICAgbWFrZVJlZ2lzdHJhdGlvblVybDogKG9iamVjdCkgPT4gc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICAvLyB0aGUgbWFzdGVyIHZpZXcgd2UgYXJlIHNob3dpbmcuXG4gICAgdmlldzogVmlld3M7XG4gICAgLy8gV2hhdCB0aGUgTG9nZ2VkSW5WaWV3IHdvdWxkIGJlIHNob3dpbmcgaWYgdmlzaWJsZVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBwYWdlX3R5cGU/OiBQYWdlVHlwZXM7XG4gICAgLy8gVGhlIElEIG9mIHRoZSByb29tIHdlJ3JlIHZpZXdpbmcuIFRoaXMgaXMgZWl0aGVyIHBvcHVsYXRlZCBkaXJlY3RseVxuICAgIC8vIGluIHRoZSBjYXNlIHdoZXJlIHdlIHZpZXcgYSByb29tIGJ5IElEIG9yIGJ5IFJvb21WaWV3IHdoZW4gaXQgcmVzb2x2ZXNcbiAgICAvLyB3aGF0IElEIGFuIGFsaWFzIHBvaW50cyBhdC5cbiAgICBjdXJyZW50Um9vbUlkPzogc3RyaW5nO1xuICAgIGN1cnJlbnRHcm91cElkPzogc3RyaW5nO1xuICAgIGN1cnJlbnRHcm91cElzTmV3PzogYm9vbGVhbjtcbiAgICAvLyBJZiB3ZSdyZSB0cnlpbmcgdG8ganVzdCB2aWV3IGEgdXNlciBJRCAoaS5lLiAvdXNlciBVUkwpLCB0aGlzIGlzIGl0XG4gICAgY3VycmVudFVzZXJJZD86IHN0cmluZztcbiAgICAvLyB0aGlzIGlzIHBlcnNpc3RlZCBhcyBteF9saHNfc2l6ZSwgbG9hZGVkIGluIExvZ2dlZEluVmlld1xuICAgIGNvbGxhcHNlTGhzOiBib29sZWFuO1xuICAgIC8vIFBhcmFtZXRlcnMgdXNlZCBpbiB0aGUgcmVnaXN0cmF0aW9uIGRhbmNlIHdpdGggdGhlIElTXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHJlZ2lzdGVyX2NsaWVudF9zZWNyZXQ/OiBzdHJpbmc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHJlZ2lzdGVyX3Nlc3Npb25faWQ/OiBzdHJpbmc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHJlZ2lzdGVyX2lkX3NpZD86IHN0cmluZztcbiAgICAvLyBXaGVuIHNob3dpbmcgTW9kYWwgZGlhbG9ncyB3ZSBuZWVkIHRvIHNldCBhcmlhLWhpZGRlbiBvbiB0aGUgcm9vdCBhcHAgZWxlbWVudFxuICAgIC8vIGFuZCBkaXNhYmxlIGl0IHdoZW4gdGhlcmUgYXJlIG5vIGRpYWxvZ3NcbiAgICBoaWRlVG9TUlVzZXJzOiBib29sZWFuO1xuICAgIHN5bmNFcnJvcj86IEVycm9yO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICBzZXJ2ZXJDb25maWc/OiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG4gICAgcmVhZHk6IGJvb2xlYW47XG4gICAgdGhyZWVwaWRJbnZpdGU/OiBJVGhyZWVwaWRJbnZpdGUsXG4gICAgcm9vbU9vYkRhdGE/OiBvYmplY3Q7XG4gICAgdmlhU2VydmVycz86IHN0cmluZ1tdO1xuICAgIHBlbmRpbmdJbml0aWFsU3luYz86IGJvb2xlYW47XG4gICAganVzdFJlZ2lzdGVyZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXRyaXhDaGF0IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiTWF0cml4Q2hhdFwiO1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgcmVhbFF1ZXJ5UGFyYW1zOiB7fSxcbiAgICAgICAgc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zOiB7fSxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgICAgb25Ub2tlbkxvZ2luQ29tcGxldGVkOiAoKSA9PiB7fSxcbiAgICB9O1xuXG4gICAgZmlyc3RTeW5jQ29tcGxldGU6IGJvb2xlYW47XG4gICAgZmlyc3RTeW5jUHJvbWlzZTogSURlZmVycmVkPHZvaWQ+O1xuXG4gICAgcHJpdmF0ZSBzY3JlZW5BZnRlckxvZ2luPzogSVNjcmVlbjtcbiAgICBwcml2YXRlIHdpbmRvd1dpZHRoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBwYWdlQ2hhbmdpbmc6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSB0b2tlbkxvZ2luPzogYm9vbGVhbjtcbiAgICBwcml2YXRlIGFjY291bnRQYXNzd29yZD86IHN0cmluZztcbiAgICBwcml2YXRlIGFjY291bnRQYXNzd29yZFRpbWVyPzogTm9kZUpTLlRpbWVvdXQ7XG4gICAgcHJpdmF0ZSBmb2N1c0NvbXBvc2VyOiBib29sZWFuO1xuICAgIHByaXZhdGUgc3ViVGl0bGVTdGF0dXM6IHN0cmluZztcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VkSW5WaWV3OiBSZWFjdC5SZWZPYmplY3Q8TG9nZ2VkSW5WaWV3VHlwZT47XG4gICAgcHJpdmF0ZSByZWFkb25seSBkaXNwYXRjaGVyUmVmOiBhbnk7XG4gICAgcHJpdmF0ZSByZWFkb25seSB0aGVtZVdhdGNoZXI6IFRoZW1lV2F0Y2hlcjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZvbnRXYXRjaGVyOiBGb250V2F0Y2hlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmlldzogVmlld3MuTE9BRElORyxcbiAgICAgICAgICAgIGNvbGxhcHNlTGhzOiBmYWxzZSxcblxuICAgICAgICAgICAgaGlkZVRvU1JVc2VyczogZmFsc2UsXG5cbiAgICAgICAgICAgIHN5bmNFcnJvcjogbnVsbCwgLy8gSWYgdGhlIGN1cnJlbnQgc3luY2luZyBzdGF0dXMgaXMgRVJST1IsIHRoZSBlcnJvciBvYmplY3QsIG90aGVyd2lzZSBudWxsLlxuICAgICAgICAgICAgcmVzaXplTm90aWZpZXI6IG5ldyBSZXNpemVOb3RpZmllcigpLFxuICAgICAgICAgICAgcmVhZHk6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nZ2VkSW5WaWV3ID0gY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgU2RrQ29uZmlnLnB1dCh0aGlzLnByb3BzLmNvbmZpZyk7XG5cbiAgICAgICAgLy8gVXNlZCBieSBfdmlld1Jvb20gYmVmb3JlIGdldHRpbmcgc3RhdGUgZnJvbSBzeW5jXG4gICAgICAgIHRoaXMuZmlyc3RTeW5jQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlID0gZGVmZXIoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5jb25maWcuc3luY190aW1lbGluZV9saW1pdCkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLm9wdHMuaW5pdGlhbFN5bmNMaW1pdCA9IHRoaXMucHJvcHMuY29uZmlnLnN5bmNfdGltZWxpbmVfbGltaXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhIHRoaW5nIHRvIGNhbGwgc2hvd1NjcmVlbiB3aXRoIG9uY2UgbG9naW4gY29tcGxldGVzLiAgdGhpcyBpcyBrZXB0XG4gICAgICAgIC8vIG91dHNpZGUgdGhpcy5zdGF0ZSBiZWNhdXNlIHVwZGF0aW5nIGl0IHNob3VsZCBuZXZlciB0cmlnZ2VyIGFcbiAgICAgICAgLy8gcmVyZW5kZXIuXG4gICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbiA9IHRoaXMucHJvcHMuaW5pdGlhbFNjcmVlbkFmdGVyTG9naW47XG4gICAgICAgIGlmICh0aGlzLnNjcmVlbkFmdGVyTG9naW4pIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5wYXJhbXMgfHwge307XG4gICAgICAgICAgICBpZiAodGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbi5zdGFydHNXaXRoKFwicm9vbS9cIikgJiYgcGFyYW1zWydzaWdudXJsJ10gJiYgcGFyYW1zWydlbWFpbCddKSB7XG4gICAgICAgICAgICAgICAgLy8gcHJvYmFibHkgYSB0aHJlZXBpZCBpbnZpdGUgLSB0cnkgdG8gc3RvcmUgaXRcbiAgICAgICAgICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnNjcmVlbkFmdGVyTG9naW4uc2NyZWVuLnN1YnN0cmluZyhcInJvb20vXCIubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnN0b3JlSW52aXRlKHJvb21JZCwgcGFyYW1zIGFzIElUaHJlZXBpZEludml0ZVdpcmVGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53aW5kb3dXaWR0aCA9IDEwMDAwO1xuICAgICAgICB0aGlzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5oYW5kbGVSZXNpemUpO1xuXG4gICAgICAgIHRoaXMucGFnZUNoYW5naW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gY2hlY2sgd2UgaGF2ZSB0aGUgcmlnaHQgdGludCBhcHBsaWVkIGZvciB0aGlzIHRoZW1lLlxuICAgICAgICAvLyBOLkIuIHdlIGRvbid0IGNhbGwgdGhlIHdob2xlIG9mIHNldFRoZW1lKCkgaGVyZSBhcyB3ZSBtYXkgYmVcbiAgICAgICAgLy8gcmFjaW5nIHdpdGggdGhlIHRoZW1lIENTUyBkb3dubG9hZCBmaW5pc2hpbmcgZnJvbSBpbmRleC5qc1xuICAgICAgICBUaW50ZXIudGludCgpO1xuXG4gICAgICAgIC8vIEZvciBQZXJzaXN0ZW50RWxlbWVudFxuICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLm9uKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMuZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSk7XG5cbiAgICAgICAgLy8gRm9yY2UgdXNlcnMgdG8gZ28gdGhyb3VnaCB0aGUgc29mdCBsb2dvdXQgcGFnZSBpZiB0aGV5J3JlIHNvZnQgbG9nZ2VkIG91dFxuICAgICAgICBpZiAoTGlmZWN5Y2xlLmlzU29mdExvZ291dCgpKSB7XG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBzZXNzaW9uIGxvYWRzIGl0J2xsIGJlIGRldGVjdGVkIGFzIHNvZnQgbG9nZ2VkIG91dCBhbmQgYSBkaXNwYXRjaFxuICAgICAgICAgICAgLy8gd2lsbCBiZSBzZW50IG91dCB0byBzYXkgdGhhdCwgdHJpZ2dlcmluZyB0aGlzIE1hdHJpeENoYXQgdG8gc2hvdyB0aGUgc29mdFxuICAgICAgICAgICAgLy8gbG9nb3V0IHBhZ2UuXG4gICAgICAgICAgICBMaWZlY3ljbGUubG9hZFNlc3Npb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWNjb3VudFBhc3N3b3JkID0gbnVsbDtcbiAgICAgICAgdGhpcy5hY2NvdW50UGFzc3dvcmRUaW1lciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuXG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyID0gbmV3IFRoZW1lV2F0Y2hlcigpO1xuICAgICAgICB0aGlzLmZvbnRXYXRjaGVyID0gbmV3IEZvbnRXYXRjaGVyKCk7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuZm9udFdhdGNoZXIuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLmZvY3VzQ29tcG9zZXIgPSBmYWxzZTtcblxuICAgICAgICAvLyBvYmplY3QgZmllbGQgdXNlZCBmb3IgdHJhY2tpbmcgdGhlIHN0YXR1cyBpbmZvIGFwcGVuZGVkIHRvIHRoZSB0aXRsZSB0YWcuXG4gICAgICAgIC8vIHdlIGRvbid0IGRvIGl0IGFzIHJlYWN0IHN0YXRlIGFzIGknbSBzY2FyZWQgYWJvdXQgdHJpZ2dlcmluZyBuZWVkbGVzcyByZWFjdCByZWZyZXNoZXMuXG4gICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgPSAnJztcblxuICAgICAgICAvLyB0aGlzIGNhbiB0ZWNobmljYWxseSBiZSBkb25lIGFueXdoZXJlIGJ1dCBkb2luZyB0aGlzIGhlcmUga2VlcHMgYWxsXG4gICAgICAgIC8vIHRoZSByb3V0aW5nIHVybCBwYXRoIGxvZ2ljIHRvZ2V0aGVyLlxuICAgICAgICBpZiAodGhpcy5vbkFsaWFzQ2xpY2spIHtcbiAgICAgICAgICAgIGxpbmtpZnlNYXRyaXgub25BbGlhc0NsaWNrID0gdGhpcy5vbkFsaWFzQ2xpY2s7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub25Vc2VyQ2xpY2spIHtcbiAgICAgICAgICAgIGxpbmtpZnlNYXRyaXgub25Vc2VyQ2xpY2sgPSB0aGlzLm9uVXNlckNsaWNrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9uR3JvdXBDbGljaykge1xuICAgICAgICAgICAgbGlua2lmeU1hdHJpeC5vbkdyb3VwQ2xpY2sgPSB0aGlzLm9uR3JvdXBDbGljaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZSBmaXJzdCB0aGluZyB0byBkbyBpcyB0byB0cnkgdGhlIHRva2VuIHBhcmFtcyBpbiB0aGUgcXVlcnktc3RyaW5nXG4gICAgICAgIC8vIGlmIHRoZSBzZXNzaW9uIGlzbid0IHNvZnQgbG9nZ2VkIG91dCAoaWU6IGlzIGEgY2xlYW4gc2Vzc2lvbiBiZWluZyBsb2dnZWQgaW4pXG4gICAgICAgIGlmICghTGlmZWN5Y2xlLmlzU29mdExvZ291dCgpKSB7XG4gICAgICAgICAgICBMaWZlY3ljbGUuYXR0ZW1wdFRva2VuTG9naW4oXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZWFsUXVlcnlQYXJhbXMsXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5kZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRGcmFnbWVudEFmdGVyTG9naW4oKSxcbiAgICAgICAgICAgICkudGhlbihhc3luYyAobG9nZ2VkSW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFsUXVlcnlQYXJhbXM/LmxvZ2luVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBsb2dpblRva2VuIGZyb20gdGhlIFVSTCByZWdhcmRsZXNzXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25Ub2tlbkxvZ2luQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxvZ2dlZEluKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9rZW5Mb2dpbiA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBzdGFydCB0aGUgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IExpZmVjeWNsZS5yZXN0b3JlRnJvbUxvY2FsU3RvcmFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZ25vcmVHdWVzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc3RMb2dpblNldHVwKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaGFzIGZvbGxvd2VkIGEgbG9naW4gb3IgcmVnaXN0ZXIgbGluaywgZG9uJ3QgcmVhbmltYXRlXG4gICAgICAgICAgICAgICAgLy8gdGhlIG9sZCBjcmVkcywgYnV0IHJhdGhlciBnbyBzdHJhaWdodCB0byB0aGUgcmVsZXZhbnQgcGFnZVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0U2NyZWVuID0gdGhpcy5zY3JlZW5BZnRlckxvZ2luID8gdGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbiA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RTY3JlZW4gPT09ICdsb2dpbicgfHxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RTY3JlZW4gPT09ICdyZWdpc3RlcicgfHxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RTY3JlZW4gPT09ICdmb3Jnb3RfcGFzc3dvcmQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NjcmVlbkFmdGVyTG9naW4oKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRTZXNzaW9uKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYW5hbHl0aWNzT3B0SW5cIikpIHtcbiAgICAgICAgICAgIEFuYWx5dGljcy5lbmFibGUoKTtcbiAgICAgICAgfVxuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmVuYWJsZSgvKiBhbm9ueW1vdXMgPSAqLyB0cnVlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHBvc3RMb2dpblNldHVwKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGNyeXB0b0VuYWJsZWQgPSBjbGkuaXNDcnlwdG9FbmFibGVkKCk7XG4gICAgICAgIGlmICghY3J5cHRvRW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5vbkxvZ2dlZEluKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9taXNlc0xpc3QgPSBbdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2VdO1xuICAgICAgICBpZiAoY3J5cHRvRW5hYmxlZCkge1xuICAgICAgICAgICAgLy8gd2FpdCBmb3IgdGhlIGNsaWVudCB0byBmaW5pc2ggZG93bmxvYWRpbmcgY3Jvc3Mtc2lnbmluZyBrZXlzIGZvciB1cyBzbyB3ZVxuICAgICAgICAgICAgLy8ga25vdyB3aGV0aGVyIG9yIG5vdCB3ZSBoYXZlIGtleXMgc2V0IHVwIG9uIHRoaXMgYWNjb3VudFxuICAgICAgICAgICAgcHJvbWlzZXNMaXN0LnB1c2goY2xpLmRvd25sb2FkS2V5cyhbY2xpLmdldFVzZXJJZCgpXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHVwZGF0ZSB0aGUgc3RhdGUgdG8gc2F5IHdlJ3JlIHdhaXRpbmcgZm9yIHRoZSBmaXJzdCBzeW5jIHRvIGNvbXBsZXRlIHJhdGhlclxuICAgICAgICAvLyB0aGFuIGZvciB0aGUgbG9naW4gdG8gZmluaXNoLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGVuZGluZ0luaXRpYWxTeW5jOiB0cnVlIH0pO1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzTGlzdCk7XG5cbiAgICAgICAgaWYgKCFjcnlwdG9FbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGVuZGluZ0luaXRpYWxTeW5jOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNyb3NzU2lnbmluZ0lzU2V0VXAgPSBjbGkuZ2V0U3RvcmVkQ3Jvc3NTaWduaW5nRm9yVXNlcihjbGkuZ2V0VXNlcklkKCkpO1xuICAgICAgICBpZiAoY3Jvc3NTaWduaW5nSXNTZXRVcCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZUZvck5ld1ZpZXcoeyB2aWV3OiBWaWV3cy5DT01QTEVURV9TRUNVUklUWSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUoXCJvcmcubWF0cml4LmUyZV9jcm9zc19zaWduaW5nXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7IHZpZXc6IFZpZXdzLkUyRV9TRVRVUCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25Mb2dnZWRJbigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwZW5kaW5nSW5pdGlhbFN5bmM6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIHN0YWdlXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsVXBkYXRlKHByb3BzLCBzdGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5zaG91bGRUcmFja1BhZ2VDaGFuZ2UodGhpcy5zdGF0ZSwgc3RhdGUpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0UGFnZUNoYW5nZVRpbWVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkVHJhY2tQYWdlQ2hhbmdlKHByZXZTdGF0ZSwgdGhpcy5zdGF0ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uTXMgPSB0aGlzLnN0b3BQYWdlQ2hhbmdlVGltZXIoKTtcbiAgICAgICAgICAgIEFuYWx5dGljcy50cmFja1BhZ2VDaGFuZ2UoZHVyYXRpb25Ncyk7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrUGFnZUNoYW5nZShkdXJhdGlvbk1zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mb2N1c0NvbXBvc2VyKSB7XG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgICAgICAgICB0aGlzLmZvY3VzQ29tcG9zZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBMaWZlY3ljbGUuc3RvcE1hdHJpeENsaWVudCgpO1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5zdG9wKCk7XG4gICAgICAgIHRoaXMuZm9udFdhdGNoZXIuc3RvcCgpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5oYW5kbGVSZXNpemUpO1xuICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLnJlbW92ZUxpc3RlbmVyKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMuZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWNjb3VudFBhc3N3b3JkVGltZXIgIT09IG51bGwpIGNsZWFyVGltZW91dCh0aGlzLmFjY291bnRQYXNzd29yZFRpbWVyKTtcbiAgICB9XG5cbiAgICBnZXRGYWxsYmFja0hzVXJsKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcgJiYgdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcuZmFsbGJhY2tfaHNfdXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXJQcm9wZXJ0aWVzKCkge1xuICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLnN0YXRlLnNlcnZlckNvbmZpZztcbiAgICAgICAgaWYgKCFwcm9wcykgcHJvcHMgPSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZzsgLy8gZm9yIHVuaXQgdGVzdHNcbiAgICAgICAgaWYgKCFwcm9wcykgcHJvcHMgPSBTZGtDb25maWcuZ2V0KClbXCJ2YWxpZGF0ZWRfc2VydmVyX2NvbmZpZ1wiXTtcbiAgICAgICAgcmV0dXJuIHtzZXJ2ZXJDb25maWc6IHByb3BzfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRTZXNzaW9uKCkge1xuICAgICAgICAvLyB0aGUgZXh0cmEgUHJvbWlzZS5yZXNvbHZlKCkgZW5zdXJlcyB0aGF0IHN5bmNocm9ub3VzIGV4Y2VwdGlvbnMgaGl0IHRoZSBzYW1lIGNvZGVwYXRoIGFzXG4gICAgICAgIC8vIGFzeW5jaHJvbm91cyBvbmVzLlxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTGlmZWN5Y2xlLmxvYWRTZXNzaW9uKHtcbiAgICAgICAgICAgICAgICBmcmFnbWVudFF1ZXJ5UGFyYW1zOiB0aGlzLnByb3BzLnN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICBlbmFibGVHdWVzdDogdGhpcy5wcm9wcy5lbmFibGVHdWVzdCxcbiAgICAgICAgICAgICAgICBndWVzdEhzVXJsOiB0aGlzLmdldFNlcnZlclByb3BlcnRpZXMoKS5zZXJ2ZXJDb25maWcuaHNVcmwsXG4gICAgICAgICAgICAgICAgZ3Vlc3RJc1VybDogdGhpcy5nZXRTZXJ2ZXJQcm9wZXJ0aWVzKCkuc2VydmVyQ29uZmlnLmlzVXJsLFxuICAgICAgICAgICAgICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZTogdGhpcy5wcm9wcy5kZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkudGhlbigobG9hZGVkU2Vzc2lvbikgPT4ge1xuICAgICAgICAgICAgaWYgKCFsb2FkZWRTZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gZmFsbCBiYWNrIHRvIHNob3dpbmcgdGhlIHdlbGNvbWUgc2NyZWVuLi4uIHVubGVzcyB3ZSBoYXZlIGEgM3BpZCBpbnZpdGUgcGVuZGluZ1xuICAgICAgICAgICAgICAgIGlmIChUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnBpY2tCZXN0SW52aXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwidmlld193ZWxjb21lX3BhZ2VcIn0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFuYWx5dGljc09wdEluXCIpKSB7XG4gICAgICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS5lbmFibGUoLyogYW5vbnltb3VzID0gKi8gZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gTm90ZSB3ZSBkb24ndCBjYXRjaCBlcnJvcnMgZnJvbSB0aGlzOiB3ZSBjYXRjaCBldmVyeXRoaW5nIHdpdGhpblxuICAgICAgICAvLyBsb2FkU2Vzc2lvbiBhcyB0aGVyZSdzIGxvZ2ljIHRoZXJlIHRvIGFzayB0aGUgdXNlciBpZiB0aGV5IHdhbnRcbiAgICAgICAgLy8gdG8gdHJ5IGxvZ2dpbmcgb3V0LlxuICAgIH1cblxuICAgIHN0YXJ0UGFnZUNoYW5nZVRpbWVyKCkge1xuICAgICAgICAvLyBUb3IgZG9lc24ndCBzdXBwb3J0IHBlcmZvcm1hbmNlXG4gICAgICAgIGlmICghcGVyZm9ybWFuY2UgfHwgIXBlcmZvcm1hbmNlLm1hcmspIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkbid0IGhhcHBlbiBiZWNhdXNlIFVOU0FGRV9jb21wb25lbnRXaWxsVXBkYXRlIGFuZCBjb21wb25lbnREaWRVcGRhdGVcbiAgICAgICAgLy8gYXJlIHVzZWQuXG4gICAgICAgIGlmICh0aGlzLnBhZ2VDaGFuZ2luZykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXRyaXhDaGF0LnN0YXJ0UGFnZUNoYW5nZVRpbWVyOiB0aW1lciBhbHJlYWR5IHN0YXJ0ZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhZ2VDaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHBlcmZvcm1hbmNlLm1hcmsoJ2VsZW1lbnRfTWF0cml4Q2hhdF9wYWdlX2NoYW5nZV9zdGFydCcpO1xuICAgIH1cblxuICAgIHN0b3BQYWdlQ2hhbmdlVGltZXIoKSB7XG4gICAgICAgIC8vIFRvciBkb2Vzbid0IHN1cHBvcnQgcGVyZm9ybWFuY2VcbiAgICAgICAgaWYgKCFwZXJmb3JtYW5jZSB8fCAhcGVyZm9ybWFuY2UubWFyaykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKCF0aGlzLnBhZ2VDaGFuZ2luZykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXRyaXhDaGF0LnN0b3BQYWdlQ2hhbmdlVGltZXI6IHRpbWVyIG5vdCBzdGFydGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYWdlQ2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgICAgcGVyZm9ybWFuY2UubWFyaygnZWxlbWVudF9NYXRyaXhDaGF0X3BhZ2VfY2hhbmdlX3N0b3AnKTtcbiAgICAgICAgcGVyZm9ybWFuY2UubWVhc3VyZShcbiAgICAgICAgICAgICdlbGVtZW50X01hdHJpeENoYXRfcGFnZV9jaGFuZ2VfZGVsdGEnLFxuICAgICAgICAgICAgJ2VsZW1lbnRfTWF0cml4Q2hhdF9wYWdlX2NoYW5nZV9zdGFydCcsXG4gICAgICAgICAgICAnZWxlbWVudF9NYXRyaXhDaGF0X3BhZ2VfY2hhbmdlX3N0b3AnLFxuICAgICAgICApO1xuICAgICAgICBwZXJmb3JtYW5jZS5jbGVhck1hcmtzKCdlbGVtZW50X01hdHJpeENoYXRfcGFnZV9jaGFuZ2Vfc3RhcnQnKTtcbiAgICAgICAgcGVyZm9ybWFuY2UuY2xlYXJNYXJrcygnZWxlbWVudF9NYXRyaXhDaGF0X3BhZ2VfY2hhbmdlX3N0b3AnKTtcbiAgICAgICAgY29uc3QgbWVhc3VyZW1lbnQgPSBwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKCdlbGVtZW50X01hdHJpeENoYXRfcGFnZV9jaGFuZ2VfZGVsdGEnKS5wb3AoKTtcblxuICAgICAgICAvLyBJbiBwcmFjdGljZSwgc29tZXRpbWVzIHRoZSBlbnRyaWVzIGxpc3QgaXMgZW1wdHksIHNvIHdlIGdldCBubyBtZWFzdXJlbWVudFxuICAgICAgICBpZiAoIW1lYXN1cmVtZW50KSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gbWVhc3VyZW1lbnQuZHVyYXRpb247XG4gICAgfVxuXG4gICAgc2hvdWxkVHJhY2tQYWdlQ2hhbmdlKHByZXZTdGF0ZTogSVN0YXRlLCBzdGF0ZTogSVN0YXRlKSB7XG4gICAgICAgIHJldHVybiBwcmV2U3RhdGUuY3VycmVudFJvb21JZCAhPT0gc3RhdGUuY3VycmVudFJvb21JZCB8fFxuICAgICAgICAgICAgcHJldlN0YXRlLnZpZXcgIT09IHN0YXRlLnZpZXcgfHxcbiAgICAgICAgICAgIHByZXZTdGF0ZS5wYWdlX3R5cGUgIT09IHN0YXRlLnBhZ2VfdHlwZTtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZUZvck5ld1ZpZXcoc3RhdGU6IFBhcnRpYWw8SVN0YXRlPikge1xuICAgICAgICBpZiAoc3RhdGUudmlldyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXRTdGF0ZUZvck5ld1ZpZXcgd2l0aCBubyB2aWV3IVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgICAgICAgIGN1cnJlbnRVc2VySWQ6IG51bGwsXG4gICAgICAgICAgICBqdXN0UmVnaXN0ZXJlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5hc3NpZ24obmV3U3RhdGUsIHN0YXRlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgTWF0cml4Q2xpZW50UGVnLm9uQWN0aW9uOiAke3BheWxvYWQuYWN0aW9ufWApO1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBvbmJvYXJkaW5nIHByb2Nlc3MgZm9yIGNlcnRhaW4gYWN0aW9uc1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpICYmIE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkgJiZcbiAgICAgICAgICAgIE9OQk9BUkRJTkdfRkxPV19TVEFSVEVSUy5pbmNsdWRlcyhwYXlsb2FkLmFjdGlvbilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHdpbGwgY2F1c2UgYHBheWxvYWRgIHRvIGJlIGRpc3BhdGNoZWQgbGF0ZXIsIG9uY2UgYVxuICAgICAgICAgICAgLy8gc3luYyBoYXMgcmVhY2hlZCB0aGUgXCJwcmVwYXJlZFwiIHN0YXRlLiBTZXR0aW5nIGEgbWF0cml4IElEXG4gICAgICAgICAgICAvLyB3aWxsIGNhdXNlIGEgZnVsbCBsb2dpbiBhbmQgc3luYyBhbmQgZmluYWxseSB0aGUgZGVmZXJyZWRcbiAgICAgICAgICAgIC8vIGFjdGlvbiB3aWxsIGJlIGRpc3BhdGNoZWQuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2RvX2FmdGVyX3N5bmNfcHJlcGFyZWQnLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjogcGF5bG9hZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbid9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ01hdHJpeEFjdGlvbnMuYWNjb3VudERhdGEnOlxuICAgICAgICAgICAgICAgIC8vIFhYWDogVGhpcyBpcyBhIGNvbGxlY3Rpb24gb2Ygc2V2ZXJhbCBoYWNrcyB0byBzb2x2ZSBhIG1pbm9yIHByb2JsZW0uIFdlIHdhbnQgdG9cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgb3VyIGxvY2FsIHN0YXRlIHdoZW4gdGhlIElEIHNlcnZlciBjaGFuZ2VzLCBidXQgZG9uJ3Qgd2FudCB0byBwdXQgdGhhdCBpblxuICAgICAgICAgICAgICAgIC8vIHRoZSBqcy1zZGsgYXMgd2UnZCBiZSB0aGVuIGRpY3RhdGluZyBob3cgYWxsIGNvbnN1bWVycyBuZWVkIHRvIGJlaGF2ZS4gSG93ZXZlcixcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGNvbXBvbmVudCBpcyBhbHJlYWR5IGJsb2F0ZWQgYW5kIHdlIHByb2JhYmx5IGRvbid0IHdhbnQgdGhpcyB0aW55IGxvZ2ljIGluXG4gICAgICAgICAgICAgICAgLy8gaGVyZSwgYnV0IHRoZXJlJ3Mgbm8gYmV0dGVyIHBsYWNlIGluIHRoZSByZWFjdC1zZGsgZm9yIGl0LiBBZGRpdGlvbmFsbHksIHdlJ3JlXG4gICAgICAgICAgICAgICAgLy8gYWJ1c2luZyB0aGUgTWF0cml4QWN0aW9uQ3JlYXRvciBzdHVmZiB0byBhdm9pZCBlcnJvcnMgb24gZGlzcGF0Y2hlcy5cbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5ldmVudF90eXBlID09PSAnbS5pZGVudGl0eV9zZXJ2ZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxVcmwgPSBwYXlsb2FkLmV2ZW50X2NvbnRlbnQgPyBwYXlsb2FkLmV2ZW50X2NvbnRlbnRbJ2Jhc2VfdXJsJ10gOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZ1bGxVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRJZGVudGl0eVNlcnZlclVybChudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwibXhfaXNfYWNjZXNzX3Rva2VuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJteF9pc191cmxcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0SWRlbnRpdHlTZXJ2ZXJVcmwoZnVsbFVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X2lzX2FjY2Vzc190b2tlblwiKTsgLy8gY2xlYXIgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfaXNfdXJsXCIsIGZ1bGxVcmwpOyAvLyBYWFg6IERvIHdlIHN0aWxsIG5lZWQgdGhpcz9cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlZGlzcGF0Y2ggdGhlIGNoYW5nZSB3aXRoIGEgbW9yZSBzcGVjaWZpYyBhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdpZF9zZXJ2ZXJfY2hhbmdlZCd9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsb2dvdXQnOlxuICAgICAgICAgICAgICAgIExpZmVjeWNsZS5sb2dvdXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJzpcbiAgICAgICAgICAgICAgICBzdGFydEFueVJlZ2lzdHJhdGlvbkZsb3cocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdGFydF9yZWdpc3RyYXRpb24nOlxuICAgICAgICAgICAgICAgIGlmIChMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNvZnRMb2dvdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc3RhcnRzIHRoZSBmdWxsIHJlZ2lzdHJhdGlvbiBmbG93XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuc2NyZWVuQWZ0ZXJMb2dpbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4gPSBwYXlsb2FkLnNjcmVlbkFmdGVyTG9naW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRSZWdpc3RyYXRpb24ocGF5bG9hZC5wYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RhcnRfbG9naW4nOlxuICAgICAgICAgICAgICAgIGlmIChMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNvZnRMb2dvdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLnNjcmVlbkFmdGVyTG9naW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luID0gcGF5bG9hZC5zY3JlZW5BZnRlckxvZ2luO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7XG4gICAgICAgICAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0lOLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdsb2dpbicpO1xuICAgICAgICAgICAgICAgIFRoZW1lQ29udHJvbGxlci5pc0xvZ2luID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdGFydF9wYXNzd29yZF9yZWNvdmVyeSc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZUZvck5ld1ZpZXcoe1xuICAgICAgICAgICAgICAgICAgICB2aWV3OiBWaWV3cy5GT1JHT1RfUEFTU1dPUkQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ2ZvcmdvdF9wYXNzd29yZCcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RhcnRfY2hhdCc6XG4gICAgICAgICAgICAgICAgY3JlYXRlUm9vbSh7XG4gICAgICAgICAgICAgICAgICAgIGRtVXNlcklkOiBwYXlsb2FkLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWF2ZV9yb29tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmxlYXZlUm9vbShwYXlsb2FkLnJvb21faWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZm9yZ2V0X3Jvb20nOlxuICAgICAgICAgICAgICAgIHRoaXMuZm9yZ2V0Um9vbShwYXlsb2FkLnJvb21faWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVqZWN0X2ludml0ZSc6XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnUmVqZWN0IGludml0YXRpb24nLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdSZWplY3QgaW52aXRhdGlvbicpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZWplY3QgdGhlIGludml0YXRpb24/JyksXG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IChjb25maXJtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBjb250cm9sbGVyIHNob3VsZG4ndCBiZSBsb2FkaW5nIGEgdmlldyA6KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlRGlhbG9nKExvYWRlciwgbnVsbCwgJ214X0RpYWxvZ19zcGlubmVyJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubGVhdmUocGF5bG9hZC5yb29tX2lkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCA9PT0gcGF5bG9hZC5yb29tX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJ30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gcmVqZWN0IGludml0YXRpb24nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRmFpbGVkIHRvIHJlamVjdCBpbnZpdGF0aW9uJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld191c2VyX2luZm8nOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld1VzZXIocGF5bG9hZC51c2VySWQsIHBheWxvYWQuc3ViQWN0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfcm9vbSc6IHtcbiAgICAgICAgICAgICAgICAvLyBUYWtlcyBlaXRoZXIgYSByb29tIElEIG9yIHJvb20gYWxpYXM6IGlmIHN3aXRjaGluZyB0byBhIHJvb20gdGhlIGNsaWVudCBpcyBhbHJlYWR5XG4gICAgICAgICAgICAgICAgLy8ga25vd24gdG8gYmUgaW4gKGVnLiB1c2VyIGNsaWNrcyBvbiBhIHJvb20gaW4gdGhlIHJlY2VudHMgcGFuZWwpLCBzdXBwbHkgdGhlIElEXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgY2xpY2tpbmcgb24gYSByb29tIGluIHRoZSBjb250ZXh0IG9mIHRoZSBhbGlhcyBiZWluZyBwcmVzZW50ZWRcbiAgICAgICAgICAgICAgICAvLyB0byB0aGVtLCBzdXBwbHkgdGhlIHJvb20gYWxpYXMuIElmIGJvdGggYXJlIHN1cHBsaWVkLCB0aGUgcm9vbSBJRCB3aWxsIGJlIGlnbm9yZWQuXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMudmlld1Jvb20ocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuZGVmZXJyZWRfYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2gocGF5bG9hZC5kZWZlcnJlZF9hY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5WaWV3VXNlclNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFiUGF5bG9hZCA9IHBheWxvYWQgYXMgT3BlblRvVGFiUGF5bG9hZDtcbiAgICAgICAgICAgICAgICBjb25zdCBVc2VyU2V0dGluZ3NEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5Vc2VyU2V0dGluZ3NEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVXNlciBzZXR0aW5ncycsICcnLCBVc2VyU2V0dGluZ3NEaWFsb2csXG4gICAgICAgICAgICAgICAgICAgIHtpbml0aWFsVGFiSWQ6IHRhYlBheWxvYWQuaW5pdGlhbFRhYklkfSxcbiAgICAgICAgICAgICAgICAgICAgLypjbGFzc05hbWU9Ki9udWxsLCAvKmlzUHJpb3JpdHk9Ki9mYWxzZSwgLyppc1N0YXRpYz0qL3RydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gVmlldyB0aGUgd2VsY29tZSBvciBob21lIHBhZ2UgaWYgd2UgbmVlZCBzb21ldGhpbmcgdG8gbG9vayBhdFxuICAgICAgICAgICAgICAgIHRoaXMudmlld1NvbWV0aGluZ0JlaGluZE1vZGFsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICd2aWV3X2NyZWF0ZV9yb29tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb20ocGF5bG9hZC5wdWJsaWMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19jcmVhdGVfZ3JvdXAnOiB7XG4gICAgICAgICAgICAgICAgbGV0IENyZWF0ZUdyb3VwRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQ3JlYXRlR3JvdXBEaWFsb2dcIilcbiAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfY29tbXVuaXRpZXNfdjJfcHJvdG90eXBlc1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBDcmVhdGVHcm91cERpYWxvZyA9IENyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ3JlYXRlIENvbW11bml0eScsICcnLCBDcmVhdGVHcm91cERpYWxvZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5WaWV3Um9vbURpcmVjdG9yeToge1xuICAgICAgICAgICAgICAgIGNvbnN0IFJvb21EaXJlY3RvcnkgPSBzZGsuZ2V0Q29tcG9uZW50KFwic3RydWN0dXJlcy5Sb29tRGlyZWN0b3J5XCIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Jvb20gZGlyZWN0b3J5JywgJycsIFJvb21EaXJlY3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFRleHQ6IHBheWxvYWQuaW5pdGlhbFRleHQsXG4gICAgICAgICAgICAgICAgfSwgJ214X1Jvb21EaXJlY3RvcnlfZGlhbG9nV3JhcHBlcicsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIFZpZXcgdGhlIHdlbGNvbWUgb3IgaG9tZSBwYWdlIGlmIHdlIG5lZWQgc29tZXRoaW5nIHRvIGxvb2sgYXRcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdTb21ldGhpbmdCZWhpbmRNb2RhbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmlld19teV9ncm91cHMnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0UGFnZShQYWdlVHlwZXMuTXlHcm91cHMpO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdncm91cHMnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfZ3JvdXAnOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld0dyb3VwKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld193ZWxjb21lX3BhZ2UnOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld1dlbGNvbWUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfaG9tZV9wYWdlJzpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdIb21lKHBheWxvYWQuanVzdFJlZ2lzdGVyZWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19zdGFydF9jaGF0X29yX3JldXNlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXRDcmVhdGVPclJldXNlKHBheWxvYWQudXNlcl9pZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3X2NyZWF0ZV9jaGF0JzpcbiAgICAgICAgICAgICAgICBzaG93U3RhcnRDaGF0SW52aXRlRGlhbG9nKHBheWxvYWQuaW5pdGlhbFRleHQgfHwgXCJcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3X2ludml0ZSc6XG4gICAgICAgICAgICAgICAgc2hvd1Jvb21JbnZpdGVEaWFsb2cocGF5bG9hZC5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19sYXN0X3NjcmVlbic6XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBkb2VzIHdoYXQgd2Ugd2FudCwgZGVzcGl0ZSB0aGUgbmFtZS4gVGhlIGlkZWEgaXMgdGhhdCBpdCBzaG93c1xuICAgICAgICAgICAgICAgIC8vIHRoZSBsYXN0IHJvb20gd2Ugd2VyZSBsb29raW5nIGF0IG9yIHNvbWUgcmVhc29uYWJsZSBkZWZhdWx0L2d1ZXNzLiBXZSBkb24ndFxuICAgICAgICAgICAgICAgIC8vIGhhdmUgdG8gd29ycnkgYWJvdXQgZW1haWwgaW52aXRlcyBvciBzaW1pbGFyIGJlaW5nIHJlLXRyaWdnZXJlZCBiZWNhdXNlIHRoZVxuICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uIHdpbGwgaGF2ZSBjbGVhcmVkIHRoYXQgc3RhdGUgYW5kIG5vdCBleGVjdXRlIHRoYXQgcGF0aC5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dTY3JlZW5BZnRlckxvZ2luKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b2dnbGVfbXlfZ3JvdXBzJzpcbiAgICAgICAgICAgICAgICAvLyBXZSBqdXN0IGRpc3BhdGNoIHRoZSBwYWdlIGNoYW5nZSByYXRoZXIgdGhhbiBoYXZlIHRvIHdvcnJ5IGFib3V0XG4gICAgICAgICAgICAgICAgLy8gd2hhdCB0aGUgbG9naWMgaXMgZm9yIGVhY2ggb2YgdGhlc2UgYnJhbmNoZXMuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucGFnZV90eXBlID09PSBQYWdlVHlwZXMuTXlHcm91cHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2xhc3Rfc2NyZWVuJ30pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19teV9ncm91cHMnfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGlkZV9sZWZ0X3BhbmVsJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VMaHM6IHRydWUsXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLm5vdGlmeUxlZnRIYW5kbGVSZXNpemVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmb2N1c19yb29tX2ZpbHRlcic6IC8vIGZvciBDdHJsT3JDbWQrSyB0byB3b3JrIGJ5IGV4cGFuZGluZyB0aGUgbGVmdCBwYW5lbCBmaXJzdFxuICAgICAgICAgICAgY2FzZSAnc2hvd19sZWZ0X3BhbmVsJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VMaHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5yZXNpemVOb3RpZmllci5ub3RpZnlMZWZ0SGFuZGxlUmVzaXplZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uT3BlbkRpYWxQYWQ6XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRGlhbCBwYWQnLCAnJywgRGlhbFBhZE1vZGFsLCB7fSwgXCJteF9EaWFsb2dfZGlhbFBhZFdyYXBwZXJcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvbl9sb2dnZWRfaW4nOlxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCB0aGlzIGhhbmRsaW5nIGZvciB0b2tlbiBsb2dpbiBhcyB0aGF0IGFsd2F5cyBjYWxscyBvbkxvZ2dlZEluIGl0c2VsZlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy50b2tlbkxvZ2luICYmXG4gICAgICAgICAgICAgICAgICAgICFMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS52aWV3ICE9PSBWaWV3cy5MT0dJTiAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnZpZXcgIT09IFZpZXdzLlJFR0lTVEVSICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudmlldyAhPT0gVmlld3MuQ09NUExFVEVfU0VDVVJJVFkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS52aWV3ICE9PSBWaWV3cy5FMkVfU0VUVVBcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkxvZ2dlZEluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnb25fY2xpZW50X25vdF92aWFibGUnOlxuICAgICAgICAgICAgICAgIHRoaXMub25Tb2Z0TG9nb3V0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvbl9sb2dnZWRfb3V0JzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uTG9nZ2VkT3V0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd3aWxsX3N0YXJ0X2NsaWVudCc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVhZHk6IGZhbHNlfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgY2xpZW50IGlzIGFib3V0IHRvIHN0YXJ0LCB3ZSBhcmUsIGJ5IGRlZmluaXRpb24sIG5vdCByZWFkeS5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHJlYWR5IHRvIGZhbHNlIG5vdywgdGhlbiBpdCdsbCBiZSBzZXQgdG8gdHJ1ZSB3aGVuIHRoZSBzeW5jXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpc3RlbmVyIHdlIHNldCBiZWxvdyBmaXJlcy5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbldpbGxTdGFydENsaWVudCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2xpZW50X3N0YXJ0ZWQnOlxuICAgICAgICAgICAgICAgIHRoaXMub25DbGllbnRTdGFydGVkKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzZW5kX2V2ZW50JzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2VuZEV2ZW50KHBheWxvYWQucm9vbV9pZCwgcGF5bG9hZC5ldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhcmlhX2hpZGVfbWFpbl9hcHAnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBoaWRlVG9TUlVzZXJzOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXJpYV91bmhpZGVfbWFpbl9hcHAnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBoaWRlVG9TUlVzZXJzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FjY2VwdF9jb29raWVzJzpcbiAgICAgICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiYW5hbHl0aWNzT3B0SW5cIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInNob3dDb29raWVCYXJcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGhpZGVBbmFseXRpY3NUb2FzdCgpO1xuICAgICAgICAgICAgICAgIGlmIChBbmFseXRpY3MuY2FuRW5hYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgQW5hbHl0aWNzLmVuYWJsZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS5jYW5FbmFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmVuYWJsZSgvKiBhbm9ueW1vdXMgPSAqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVqZWN0X2Nvb2tpZXMnOlxuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJhbmFseXRpY3NPcHRJblwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInNob3dDb29raWVCYXJcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGhpZGVBbmFseXRpY3NUb2FzdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2V0UGFnZShwYWdlVHlwZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFnZV90eXBlOiBwYWdlVHlwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzdGFydFJlZ2lzdHJhdGlvbihwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlOiBQYXJ0aWFsPElTdGF0ZT4gPSB7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5SRUdJU1RFUixcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBPbmx5IGhvbm91ciBwYXJhbXMgaWYgdGhleSBhcmUgYWxsIHByZXNlbnQsIG90aGVyd2lzZSB3ZSByZXNldFxuICAgICAgICAvLyBIUyBhbmQgSVMgVVJMcyB3aGVuIHN3aXRjaGluZyB0byByZWdpc3RyYXRpb24uXG4gICAgICAgIGlmIChwYXJhbXMuY2xpZW50X3NlY3JldCAmJlxuICAgICAgICAgICAgcGFyYW1zLnNlc3Npb25faWQgJiZcbiAgICAgICAgICAgIHBhcmFtcy5oc191cmwgJiZcbiAgICAgICAgICAgIHBhcmFtcy5pc191cmwgJiZcbiAgICAgICAgICAgIHBhcmFtcy5zaWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdTdGF0ZS5zZXJ2ZXJDb25maWcgPSBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyhcbiAgICAgICAgICAgICAgICBwYXJhbXMuaHNfdXJsLCBwYXJhbXMuaXNfdXJsLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgbmV3U3RhdGUucmVnaXN0ZXJfY2xpZW50X3NlY3JldCA9IHBhcmFtcy5jbGllbnRfc2VjcmV0O1xuICAgICAgICAgICAgbmV3U3RhdGUucmVnaXN0ZXJfc2Vzc2lvbl9pZCA9IHBhcmFtcy5zZXNzaW9uX2lkO1xuICAgICAgICAgICAgbmV3U3RhdGUucmVnaXN0ZXJfaWRfc2lkID0gcGFyYW1zLnNpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KG5ld1N0YXRlKTtcbiAgICAgICAgVGhlbWVDb250cm9sbGVyLmlzTG9naW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdyZWdpc3RlcicpO1xuICAgIH1cblxuICAgIC8vIHN3aXRjaCB2aWV3IHRvIHRoZSBnaXZlbiByb29tXG4gICAgLy9cbiAgICAvLyBAcGFyYW0ge09iamVjdH0gcm9vbUluZm8gT2JqZWN0IGNvbnRhaW5pbmcgZGF0YSBhYm91dCB0aGUgcm9vbSB0byBiZSBqb2luZWRcbiAgICAvLyBAcGFyYW0ge3N0cmluZz19IHJvb21JbmZvLnJvb21faWQgSUQgb2YgdGhlIHJvb20gdG8gam9pbi4gT25lIG9mIHJvb21faWQgb3Igcm9vbV9hbGlhcyBtdXN0IGJlIGdpdmVuLlxuICAgIC8vIEBwYXJhbSB7c3RyaW5nPX0gcm9vbUluZm8ucm9vbV9hbGlhcyBBbGlhcyBvZiB0aGUgcm9vbSB0byBqb2luLiBPbmUgb2Ygcm9vbV9pZCBvciByb29tX2FsaWFzIG11c3QgYmUgZ2l2ZW4uXG4gICAgLy8gQHBhcmFtIHtib29sZWFuPX0gcm9vbUluZm8uYXV0b19qb2luIElmIHRydWUsIGF1dG9tYXRpY2FsbHkgYXR0ZW1wdCB0byBqb2luIHRoZSByb29tIGlmIG5vdCBhbHJlYWR5IGEgbWVtYmVyLlxuICAgIC8vIEBwYXJhbSB7c3RyaW5nPX0gcm9vbUluZm8uZXZlbnRfaWQgSUQgb2YgdGhlIGV2ZW50IGluIHRoaXMgcm9vbSB0byBzaG93OiB0aGlzIHdpbGwgY2F1c2UgYSBzd2l0Y2ggdG8gdGhlXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0IG9mIHRoYXQgcGFydGljdWxhciBldmVudC5cbiAgICAvLyBAcGFyYW0ge2Jvb2xlYW49fSByb29tSW5mby5oaWdobGlnaHRlZCBJZiB0cnVlLCBhZGQgZXZlbnRfaWQgdG8gdGhlIGhhc2ggb2YgdGhlIFVSTFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBhbHRlciB0aGUgRXZlbnRUaWxlIHRvIGFwcGVhciBoaWdobGlnaHRlZC5cbiAgICAvLyBAcGFyYW0ge09iamVjdD19IHJvb21JbmZvLnRocmVlcGlkX2ludml0ZSBPYmplY3QgY29udGFpbmluZyBkYXRhIGFib3V0IHRoZSB0aGlyZCBwYXJ0eVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlIHJlY2VpdmVkIHRvIGpvaW4gdGhlIHJvb20sIGlmIGFueS5cbiAgICAvLyBAcGFyYW0ge09iamVjdD19IHJvb21JbmZvLm9vYl9kYXRhIE9iamVjdCBvZiBhZGRpdGlvbmFsIGRhdGEgYWJvdXQgdGhlIHJvb21cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IGhhcyBiZWVuIHBhc3NlZCBvdXQtb2YtYmFuZCAoZWcuXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbSBuYW1lIGFuZCBhdmF0YXIgZnJvbSBhbiBpbnZpdGUgZW1haWwpXG4gICAgcHJpdmF0ZSB2aWV3Um9vbShyb29tSW5mbzogSVJvb21JbmZvKSB7XG4gICAgICAgIHRoaXMuZm9jdXNDb21wb3NlciA9IHRydWU7XG5cbiAgICAgICAgaWYgKHJvb21JbmZvLnJvb21fYWxpYXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGBTd2l0Y2hpbmcgdG8gcm9vbSBhbGlhcyAke3Jvb21JbmZvLnJvb21fYWxpYXN9IGF0IGV2ZW50IGAgK1xuICAgICAgICAgICAgICAgIHJvb21JbmZvLmV2ZW50X2lkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTd2l0Y2hpbmcgdG8gcm9vbSBpZCAke3Jvb21JbmZvLnJvb21faWR9IGF0IGV2ZW50IGAgK1xuICAgICAgICAgICAgICAgIHJvb21JbmZvLmV2ZW50X2lkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdhaXQgZm9yIHRoZSBmaXJzdCBzeW5jIHRvIGNvbXBsZXRlIHNvIHRoYXQgaWYgYSByb29tIGRvZXMgaGF2ZSBhbiBhbGlhcyxcbiAgICAgICAgLy8gaXQgd291bGQgaGF2ZSBiZWVuIHJldHJpZXZlZC5cbiAgICAgICAgbGV0IHdhaXRGb3IgPSBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgIGlmICghdGhpcy5maXJzdFN5bmNDb21wbGV0ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmZpcnN0U3luY1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Nhbm5vdCB2aWV3IGEgcm9vbSBiZWZvcmUgZmlyc3Qgc3luYy4gcm9vbV9pZDonLCByb29tSW5mby5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YWl0Rm9yID0gdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd2FpdEZvci50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBwcmVzZW50ZWRJZCA9IHJvb21JbmZvLnJvb21fYWxpYXMgfHwgcm9vbUluZm8ucm9vbV9pZDtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSW5mby5yb29tX2lkKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGhlQWxpYXMgPSBSb29tcy5nZXREaXNwbGF5QWxpYXNGb3JSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgIGlmICh0aGVBbGlhcykge1xuICAgICAgICAgICAgICAgICAgICBwcmVzZW50ZWRJZCA9IHRoZUFsaWFzO1xuICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSBkaXNwbGF5IGFsaWFzIG9mIHRoZSBwcmVzZW50ZWQgcm9vbSBpbiBjYWNoZSB0byBzcGVlZCBmdXR1cmVcbiAgICAgICAgICAgICAgICAgICAgLy8gbmF2aWdhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgc3RvcmVSb29tQWxpYXNJbkNhY2hlKHRoZUFsaWFzLCByb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhpcyBhcyB0aGUgSUQgb2YgdGhlIGxhc3Qgcm9vbSBhY2Nlc3NlZC4gVGhpcyBpcyBzbyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgICAgIC8vIHBlcnNpc3Qgd2hpY2ggcm9vbSBpcyBiZWluZyBzdG9yZWQgYWNyb3NzIHJlZnJlc2hlcyBhbmQgYnJvd3NlciBxdWl0cy5cbiAgICAgICAgICAgICAgICBpZiAobG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdteF9sYXN0X3Jvb21faWQnLCByb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgcmVkaXJlY3RpbmcgdG8gYSBSb29tIEFsaWFzIGFuZCBpdCBpcyBmb3IgdGhlIHJvb20gd2UgYWxyZWFkeSBzaG93aW5nIHRoZW4gcmVwbGFjZSBoaXN0b3J5IGl0ZW1cbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VMYXN0ID0gcHJlc2VudGVkSWRbMF0gPT09IFwiI1wiICYmIHJvb21JbmZvLnJvb21faWQgPT09IHRoaXMuc3RhdGUuY3VycmVudFJvb21JZDtcblxuICAgICAgICAgICAgaWYgKHJvb21JbmZvLmV2ZW50X2lkICYmIHJvb21JbmZvLmhpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgcHJlc2VudGVkSWQgKz0gXCIvXCIgKyByb29tSW5mby5ldmVudF9pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0dFRF9JTixcbiAgICAgICAgICAgICAgICBjdXJyZW50Um9vbUlkOiByb29tSW5mby5yb29tX2lkIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgcGFnZV90eXBlOiBQYWdlVHlwZXMuUm9vbVZpZXcsXG4gICAgICAgICAgICAgICAgdGhyZWVwaWRJbnZpdGU6IHJvb21JbmZvLnRocmVlcGlkX2ludml0ZSxcbiAgICAgICAgICAgICAgICByb29tT29iRGF0YTogcm9vbUluZm8ub29iX2RhdGEsXG4gICAgICAgICAgICAgICAgdmlhU2VydmVyczogcm9vbUluZm8udmlhX3NlcnZlcnMsXG4gICAgICAgICAgICAgICAgcmVhZHk6IHRydWUsXG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3Jvb20vJyArIHByZXNlbnRlZElkLCByZXBsYWNlTGFzdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB2aWV3R3JvdXAocGF5bG9hZCkge1xuICAgICAgICBjb25zdCBncm91cElkID0gcGF5bG9hZC5ncm91cF9pZDtcblxuICAgICAgICAvLyBXYWl0IGZvciB0aGUgZmlyc3Qgc3luYyB0byBjb21wbGV0ZVxuICAgICAgICBpZiAoIXRoaXMuZmlyc3RTeW5jQ29tcGxldGUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5maXJzdFN5bmNQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdDYW5ub3QgdmlldyBhIGdyb3VwIGJlZm9yZSBmaXJzdCBzeW5jLiBncm91cF9pZDonLCBncm91cElkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmZpcnN0U3luY1Byb21pc2UucHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmlldzogVmlld3MuTE9HR0VEX0lOLFxuICAgICAgICAgICAgY3VycmVudEdyb3VwSWQ6IGdyb3VwSWQsXG4gICAgICAgICAgICBjdXJyZW50R3JvdXBJc05ldzogcGF5bG9hZC5ncm91cF9pc19uZXcsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFBhZ2UoUGFnZVR5cGVzLkdyb3VwVmlldyk7XG4gICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdncm91cC8nICsgZ3JvdXBJZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3U29tZXRoaW5nQmVoaW5kTW9kYWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXcgIT09IFZpZXdzLkxPR0dFRF9JTikge1xuICAgICAgICAgICAgdGhpcy52aWV3V2VsY29tZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5jdXJyZW50R3JvdXBJZCAmJiAhdGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkKSB7XG4gICAgICAgICAgICB0aGlzLnZpZXdIb21lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdXZWxjb21lKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5XRUxDT01FLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3dlbGNvbWUnKTtcbiAgICAgICAgVGhlbWVDb250cm9sbGVyLmlzTG9naW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3SG9tZShqdXN0UmVnaXN0ZXJlZCA9IGZhbHNlKSB7XG4gICAgICAgIC8vIFRoZSBob21lIHBhZ2UgcmVxdWlyZXMgdGhlIFwibG9nZ2VkIGluXCIgdmlldywgc28gd2UnbGwgc2V0IHRoYXQuXG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0dFRF9JTixcbiAgICAgICAgICAgIGp1c3RSZWdpc3RlcmVkLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRQYWdlKFBhZ2VUeXBlcy5Ib21lUGFnZSk7XG4gICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdob21lJyk7XG4gICAgICAgIFRoZW1lQ29udHJvbGxlci5pc0xvZ2luID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnJlY2hlY2soKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdVc2VyKHVzZXJJZDogc3RyaW5nLCBzdWJBY3Rpb246IHN0cmluZykge1xuICAgICAgICAvLyBXYWl0IGZvciB0aGUgZmlyc3Qgc3luYyBzbyB0aGF0IGBnZXRSb29tYCBnaXZlcyB1cyBhIHJvb20gb2JqZWN0IGlmIGl0J3NcbiAgICAgICAgLy8gaW4gdGhlIHN5bmMgcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgd2FpdEZvclN5bmMgPSB0aGlzLmZpcnN0U3luY1Byb21pc2UgP1xuICAgICAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2UgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgd2FpdEZvclN5bmMudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3ViQWN0aW9uID09PSAnY2hhdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXRDcmVhdGVPclJldXNlKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3VzZXIvJyArIHVzZXJJZCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXJyZW50VXNlcklkOiB1c2VySWR9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0UGFnZShQYWdlVHlwZXMuVXNlclZpZXcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVJvb20oZGVmYXVsdFB1YmxpYyA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IGNvbW11bml0eUlkID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpO1xuICAgICAgICBpZiAoY29tbXVuaXR5SWQpIHtcbiAgICAgICAgICAgIC8vIGRvdWJsZSBjaGVjayB0aGUgdXNlciB3aWxsIGhhdmUgcGVybWlzc2lvbiB0byBhc3NvY2lhdGUgdGhpcyByb29tIHdpdGggdGhlIGNvbW11bml0eVxuICAgICAgICAgICAgaWYgKCFDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5pc0FkbWluT2YoY29tbXVuaXR5SWQpKSB7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnUHJlLWZhaWx1cmUgdG8gY3JlYXRlIHJvb20nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQ2Fubm90IGNyZWF0ZSByb29tcyBpbiB0aGlzIGNvbW11bml0eVwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gY3JlYXRlIHJvb21zIGluIHRoaXMgY29tbXVuaXR5LlwiKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBDcmVhdGVSb29tRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5DcmVhdGVSb29tRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ3JlYXRlIFJvb20nLCAnJywgQ3JlYXRlUm9vbURpYWxvZywgeyBkZWZhdWx0UHVibGljIH0pO1xuXG4gICAgICAgIGNvbnN0IFtzaG91bGRDcmVhdGUsIG9wdHNdID0gYXdhaXQgbW9kYWwuZmluaXNoZWQ7XG4gICAgICAgIGlmIChzaG91bGRDcmVhdGUpIHtcbiAgICAgICAgICAgIGNyZWF0ZVJvb20ob3B0cyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYXRDcmVhdGVPclJldXNlKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgICAgIC8vIFVzZSBhIGRlZmVycmVkIGFjdGlvbiB0byByZXNob3cgdGhlIGRpYWxvZyBvbmNlIHRoZSB1c2VyIGhhcyByZWdpc3RlcmVkXG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICAvLyBObyBwb2ludCBpbiBtYWtpbmcgMiBETXMgd2l0aCB3ZWxjb21lIGJvdC4gVGhpcyBhc3N1bWVzIHZpZXdfc2V0X214aWQgd2lsbFxuICAgICAgICAgICAgLy8gcmVzdWx0IGluIGEgbmV3IERNIHdpdGggdGhlIHdlbGNvbWUgdXNlci5cbiAgICAgICAgICAgIGlmICh1c2VySWQgIT09IHRoaXMucHJvcHMuY29uZmlnLndlbGNvbWVVc2VySWQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdkb19hZnRlcl9zeW5jX3ByZXBhcmVkJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRfYWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3N0YXJ0X2NoYXRfb3JfcmV1c2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbicsXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNldF9teGlkIGRpYWxvZyBpcyBjYW5jZWxsZWQsIHZpZXcgL3dlbGNvbWUgYmVjYXVzZSBpZiB0aGVcbiAgICAgICAgICAgICAgICAvLyBicm93c2VyIHdhcyBwb2ludGluZyBhdCAvdXNlci9Ac29tZW9uZTpkb21haW4/YWN0aW9uPWNoYXQsIHRoZSBVUkxcbiAgICAgICAgICAgICAgICAvLyBuZWVkcyB0byBiZSByZXNldCBzbyB0aGF0IHRoZXkgY2FuIHJldmlzaXQgL3VzZXIvLi4gLy8gKGFuZCB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgLy8gYF9jaGF0Q3JlYXRlT3JSZXVzZWAgYWdhaW4pXG4gICAgICAgICAgICAgICAgZ29fd2VsY29tZV9vbl9jYW5jZWw6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NyZWVuX2FmdGVyOiB7XG4gICAgICAgICAgICAgICAgICAgIHNjcmVlbjogYHVzZXIvJHt0aGlzLnByb3BzLmNvbmZpZy53ZWxjb21lVXNlcklkfWAsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczogeyBhY3Rpb246ICdjaGF0JyB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IEltbXV0YWJsZSBETXMgcmVwbGFjZXMgdGhpc1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgZG1Sb29tTWFwID0gbmV3IERNUm9vbU1hcChjbGllbnQpO1xuICAgICAgICBjb25zdCBkbVJvb21zID0gZG1Sb29tTWFwLmdldERNUm9vbXNGb3JVc2VySWQodXNlcklkKTtcblxuICAgICAgICBpZiAoZG1Sb29tcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogZG1Sb29tc1swXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdzdGFydF9jaGF0JyxcbiAgICAgICAgICAgICAgICB1c2VyX2lkOiB1c2VySWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbGVhdmVSb29tV2FybmluZ3Mocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgcm9vbVRvTGVhdmUgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAvLyBTaG93IGEgd2FybmluZyBpZiB0aGVyZSBhcmUgYWRkaXRpb25hbCBjb21wbGljYXRpb25zLlxuICAgICAgICBjb25zdCBqb2luUnVsZXMgPSByb29tVG9MZWF2ZS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5qb2luX3J1bGVzJywgJycpO1xuICAgICAgICBjb25zdCB3YXJuaW5ncyA9IFtdO1xuICAgICAgICBpZiAoam9pblJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gam9pblJ1bGVzLmdldENvbnRlbnQoKS5qb2luX3J1bGU7XG4gICAgICAgICAgICBpZiAocnVsZSAhPT0gXCJwdWJsaWNcIikge1xuICAgICAgICAgICAgICAgIHdhcm5pbmdzLnB1c2goKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3YXJuaW5nXCIga2V5PVwibm9uX3B1YmxpY193YXJuaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7JyAnLyogV2hpdGVzcGFjZSwgb3RoZXJ3aXNlIHRoZSBzZW50ZW5jZXMgZ2V0IHNtYXNoZWQgdG9nZXRoZXIgKi8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRoaXMgcm9vbSBpcyBub3QgcHVibGljLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byByZWpvaW4gd2l0aG91dCBhbiBpbnZpdGUuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3YXJuaW5ncztcbiAgICB9XG5cbiAgICBwcml2YXRlIGxlYXZlUm9vbShyb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCByb29tVG9MZWF2ZSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGNvbnN0IHdhcm5pbmdzID0gdGhpcy5sZWF2ZVJvb21XYXJuaW5ncyhyb29tSWQpO1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0xlYXZlIHJvb20nLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIkxlYXZlIHJvb21cIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxlYXZlIHRoZSByb29tICclKHJvb21OYW1lKXMnP1wiLCB7cm9vbU5hbWU6IHJvb21Ub0xlYXZlLm5hbWV9KSB9XG4gICAgICAgICAgICAgICAgICAgIHsgd2FybmluZ3MgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBidXR0b246IF90KFwiTGVhdmVcIiksXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoc2hvdWxkTGVhdmUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTGVhdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZCA9IGxlYXZlUm9vbUJlaGF2aW91cihyb29tSWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBjb250cm9sbGVyIHNob3VsZG4ndCBiZSBsb2FkaW5nIGEgdmlldyA6KFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBMb2FkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVEaWFsb2coTG9hZGVyLCBudWxsLCAnbXhfRGlhbG9nX3NwaW5uZXInKTtcblxuICAgICAgICAgICAgICAgICAgICBkLmZpbmFsbHkoKCkgPT4gbW9kYWwuY2xvc2UoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmb3JnZXRSb29tKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5mb3JnZXQocm9vbUlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFN3aXRjaCB0byBob21lIHBhZ2UgaWYgd2UncmUgY3VycmVudGx5IHZpZXdpbmcgdGhlIGZvcmdvdHRlbiByb29tXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkID09PSByb29tSWQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IFwidmlld19ob21lX3BhZ2VcIiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXJyQ29kZSA9IGVyci5lcnJjb2RlIHx8IF90ZChcInVua25vd24gZXJyb3IgY29kZVwiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXCJGYWlsZWQgdG8gZm9yZ2V0IHJvb21cIiwgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIGZvcmdldCByb29tICUoZXJyQ29kZSlzXCIsIHtlcnJDb2RlfSksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYSBjaGF0IHdpdGggdGhlIHdlbGNvbWUgdXNlciwgaWYgdGhlIHVzZXIgZG9lc24ndCBhbHJlYWR5IGhhdmUgb25lXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHJvb20gSUQgb2YgdGhlIG5ldyByb29tLCBvciBudWxsIGlmIG5vIHJvb20gd2FzIGNyZWF0ZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHN0YXJ0V2VsY29tZVVzZXJDaGF0KCkge1xuICAgICAgICAvLyBXZSBjYW4gZW5kIHVwIHdpdGggbXVsdGlwbGUgdGFicyBwb3N0LXJlZ2lzdHJhdGlvbiB3aGVyZSB0aGUgdXNlclxuICAgICAgICAvLyBtaWdodCB0aGVuIGVuZCB1cCB3aXRoIGEgc2Vzc2lvbiBhbmQgd2UgZG9uJ3Qgd2FudCB0aGVtIGFsbCBtYWtpbmdcbiAgICAgICAgLy8gYSBjaGF0IHdpdGggdGhlIHdlbGNvbWUgdXNlcjogdHJ5IHRvIGRlLWR1cGUuXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gd2FpdCBmb3IgdGhlIGZpcnN0IHN5bmMgdG8gY29tcGxldGUgZm9yIHRoaXMgdG9cbiAgICAgICAgLy8gd29yayB0aG91Z2guXG4gICAgICAgIGxldCB3YWl0Rm9yO1xuICAgICAgICBpZiAoIXRoaXMuZmlyc3RTeW5jQ29tcGxldGUpIHtcbiAgICAgICAgICAgIHdhaXRGb3IgPSB0aGlzLmZpcnN0U3luY1Byb21pc2UucHJvbWlzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhaXRGb3IgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB3YWl0Rm9yO1xuXG4gICAgICAgIGNvbnN0IHdlbGNvbWVVc2VyUm9vbXMgPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0RE1Sb29tc0ZvclVzZXJJZChcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY29uZmlnLndlbGNvbWVVc2VySWQsXG4gICAgICAgICk7XG4gICAgICAgIGlmICh3ZWxjb21lVXNlclJvb21zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gYXdhaXQgY3JlYXRlUm9vbSh7XG4gICAgICAgICAgICAgICAgZG1Vc2VySWQ6IHRoaXMucHJvcHMuY29uZmlnLndlbGNvbWVVc2VySWQsXG4gICAgICAgICAgICAgICAgLy8gT25seSB2aWV3IHRoZSB3ZWxjb21lIHVzZXIgaWYgd2UncmUgTk9UIGxvb2tpbmcgYXQgYSByb29tXG4gICAgICAgICAgICAgICAgYW5kVmlldzogIXRoaXMuc3RhdGUuY3VycmVudFJvb21JZCxcbiAgICAgICAgICAgICAgICBzcGlubmVyOiBmYWxzZSwgLy8gd2UncmUgYWxyZWFkeSBzaG93aW5nIG9uZTogd2UgZG9uJ3QgbmVlZCBhbm90aGVyIG9uZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgYml0IG9mIGEgaGFjaywgYnV0IHNpbmNlIHRoZSBkZWR1cGxpY2F0aW9uIHJlbGllc1xuICAgICAgICAgICAgLy8gb24gbS5kaXJlY3QgYmVpbmcgdXAgdG8gZGF0ZSwgd2UgbmVlZCB0byBmb3JjZSBhIHN5bmNcbiAgICAgICAgICAgIC8vIG9mIHRoZSBkYXRhYmFzZSwgb3RoZXJ3aXNlIGlmIHRoZSB1c2VyIGdvZXMgdG8gdGhlIG90aGVyXG4gICAgICAgICAgICAvLyB0YWIgYmVmb3JlIHRoZSBuZXh0IHNhdmUgaGFwcGVucyAoYSBmZXcgbWludXRlcyksIHRoZVxuICAgICAgICAgICAgLy8gc2F2ZWQgc3luYyB3aWxsIGJlIHJlc3RvcmVkIGZyb20gdGhlIGRiIGFuZCB0aGlzIGNvZGUgd2lsbFxuICAgICAgICAgICAgLy8gcnVuIHdpdGhvdXQgdGhlIHVwZGF0ZSB0byBtLmRpcmVjdCwgbWFraW5nIGFub3RoZXIgd2VsY29tZVxuICAgICAgICAgICAgLy8gdXNlciByb29tIChpdCBkb2Vzbid0IHdhaXQgZm9yIG5ldyBkYXRhIGZyb20gdGhlIHNlcnZlciwganVzdFxuICAgICAgICAgICAgLy8gdGhlIHNhdmVkIHN5bmMgdG8gYmUgbG9hZGVkKS5cbiAgICAgICAgICAgIGNvbnN0IHNhdmVXZWxjb21lVXNlciA9IChldikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgZXYuZ2V0VHlwZSgpID09PSAnbS5kaXJlY3QnICYmXG4gICAgICAgICAgICAgICAgICAgIGV2LmdldENvbnRlbnQoKSAmJlxuICAgICAgICAgICAgICAgICAgICBldi5nZXRDb250ZW50KClbdGhpcy5wcm9wcy5jb25maWcud2VsY29tZVVzZXJJZF1cbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnN0b3JlLnNhdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYWNjb3VudERhdGFcIiwgc2F2ZVdlbGNvbWVVc2VyLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJhY2NvdW50RGF0YVwiLCBzYXZlV2VsY29tZVVzZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gcm9vbUlkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIGEgbmV3IGxvZ2dlZCBpbiBzZXNzaW9uIGhhcyBzdGFydGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBvbkxvZ2dlZEluKCkge1xuICAgICAgICBUaGVtZUNvbnRyb2xsZXIuaXNMb2dpbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHsgdmlldzogVmlld3MuTE9HR0VEX0lOIH0pO1xuICAgICAgICAvLyBJZiBhIHNwZWNpZmljIHNjcmVlbiBpcyBzZXQgdG8gYmUgc2hvd24gYWZ0ZXIgbG9naW4sIHNob3cgdGhhdCBhYm92ZVxuICAgICAgICAvLyBhbGwgZWxzZSwgYXMgaXQgcHJvYmFibHkgbWVhbnMgdGhlIHVzZXIgY2xpY2tlZCBvbiBzb21ldGhpbmcgYWxyZWFkeS5cbiAgICAgICAgaWYgKHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbiAmJiB0aGlzLnNjcmVlbkFmdGVyTG9naW4uc2NyZWVuKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dTY3JlZW4oXG4gICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbixcbiAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4ucGFyYW1zLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbiA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoTWF0cml4Q2xpZW50UGVnLmN1cnJlbnRVc2VySXNKdXN0UmVnaXN0ZXJlZCgpKSB7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuc2V0SnVzdFJlZ2lzdGVyZWRVc2VySWQobnVsbCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmNvbmZpZy53ZWxjb21lVXNlcklkICYmIGdldEN1cnJlbnRMYW5ndWFnZSgpLnN0YXJ0c1dpdGgoXCJlblwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdlbGNvbWVVc2VyUm9vbSA9IGF3YWl0IHRoaXMuc3RhcnRXZWxjb21lVXNlckNoYXQoKTtcbiAgICAgICAgICAgICAgICBpZiAod2VsY29tZVVzZXJSb29tID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGRpZG4ndCByZWRpcmVjdCB0byB0aGUgd2VsY29tZSB1c2VyIHJvb20sIHNvIHNob3dcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGhvbWVwYWdlLlxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJywganVzdFJlZ2lzdGVyZWQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UucGlja0Jlc3RJbnZpdGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSB1c2VyIGhhcyBhIDNwaWQgaW52aXRlIHBlbmRpbmcgLSBzaG93IHRoZW0gdGhhdFxuICAgICAgICAgICAgICAgIGNvbnN0IHRocmVlcGlkSW52aXRlID0gVGhyZWVwaWRJbnZpdGVTdG9yZS5pbnN0YW5jZS5waWNrQmVzdEludml0ZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gSEFDSzogVGhpcyBpcyBhIHByZXR0eSBicnV0YWwgd2F5IG9mIHRocmVhZGluZyB0aGUgaW52aXRlIGJhY2sgdGhyb3VnaFxuICAgICAgICAgICAgICAgIC8vIG91ciBzeXN0ZW1zLCBidXQgaXQncyB0aGUgc2FmZXN0IHdlIGhhdmUgZm9yIG5vdy5cbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnRyYW5zbGF0ZVRvV2lyZUZvcm1hdCh0aHJlZXBpZEludml0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuKGByb29tLyR7dGhyZWVwaWRJbnZpdGUucm9vbUlkfWAsIHBhcmFtcylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHVzZXIgaGFzIGp1c3QgbG9nZ2VkIGluIGFmdGVyIHJlZ2lzdGVyaW5nLFxuICAgICAgICAgICAgICAgIC8vIHNvIHNob3cgdGhlIGhvbWVwYWdlLlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19ob21lX3BhZ2UnLCBqdXN0UmVnaXN0ZXJlZDogdHJ1ZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuQWZ0ZXJMb2dpbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgU3RvcmFnZU1hbmFnZXIudHJ5UGVyc2lzdFN0b3JhZ2UoKTtcblxuICAgICAgICAvLyBkZWZlciB0aGUgZm9sbG93aW5nIGFjdGlvbnMgYnkgMzAgc2Vjb25kcyB0byBub3QgdGhyb3cgdGhlbSBhdCB0aGUgdXNlciBpbW1lZGlhdGVseVxuICAgICAgICBhd2FpdCBzbGVlcCgzMCk7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0Nvb2tpZUJhclwiKSAmJlxuICAgICAgICAgICAgKEFuYWx5dGljcy5jYW5FbmFibGUoKSB8fCBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmNhbkVuYWJsZSgpKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHNob3dBbmFseXRpY3NUb2FzdCh0aGlzLnByb3BzLmNvbmZpZy5waXdpaz8ucG9saWN5VXJsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLm1vYmlsZUd1aWRlVG9hc3QpIHtcbiAgICAgICAgICAgIC8vIFRoZSB0b2FzdCBjb250YWlucyBmdXJ0aGVyIGxvZ2ljIHRvIGRldGVjdCBtb2JpbGUgcGxhdGZvcm1zLFxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgaXQgaGFzIGJlZW4gZGlzbWlzc2VkIGJlZm9yZSwgZXRjLlxuICAgICAgICAgICAgc2hvd01vYmlsZUd1aWRlVG9hc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd1NjcmVlbkFmdGVyTG9naW4oKSB7XG4gICAgICAgIC8vIElmIHNjcmVlbkFmdGVyTG9naW4gaXMgc2V0LCB1c2UgdGhhdCwgdGhlbiBudWxsIGl0IHNvIHRoYXQgYSBzZWNvbmQgbG9naW4gd2lsbFxuICAgICAgICAvLyByZXN1bHQgaW4gdmlld19ob21lX3BhZ2UsIF91c2VyX3NldHRpbmdzIG9yIF9yb29tX2RpcmVjdG9yeVxuICAgICAgICBpZiAodGhpcy5zY3JlZW5BZnRlckxvZ2luICYmIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW4pIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NjcmVlbihcbiAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4uc2NyZWVuLFxuICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5wYXJhbXMsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChsb2NhbFN0b3JhZ2UgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ214X2xhc3Rfcm9vbV9pZCcpKSB7XG4gICAgICAgICAgICAvLyBCZWZvcmUgZGVmYXVsdGluZyB0byBkaXJlY3RvcnksIHNob3cgdGhlIGxhc3Qgdmlld2VkIHJvb21cbiAgICAgICAgICAgIHRoaXMudmlld0xhc3RSb29tKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld193ZWxjb21lX3BhZ2UnfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19ob21lX3BhZ2UnfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdMYXN0Um9vbSgpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbXhfbGFzdF9yb29tX2lkJyksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBzZXNzaW9uIGlzIGxvZ2dlZCBvdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uTG9nZ2VkT3V0KCkge1xuICAgICAgICB0aGlzLm5vdGlmeU5ld1NjcmVlbignbG9naW4nKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZUZvck5ld1ZpZXcoe1xuICAgICAgICAgICAgdmlldzogVmlld3MuTE9HSU4sXG4gICAgICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgICAgICBjb2xsYXBzZUxoczogZmFsc2UsXG4gICAgICAgICAgICBjdXJyZW50Um9vbUlkOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdWJUaXRsZVN0YXR1cyA9ICcnO1xuICAgICAgICB0aGlzLnNldFBhZ2VTdWJ0aXRsZSgpO1xuICAgICAgICBUaGVtZUNvbnRyb2xsZXIuaXNMb2dpbiA9IHRydWU7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnJlY2hlY2soKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgc2Vzc2lvbiBpcyBzb2Z0bHkgbG9nZ2VkIG91dFxuICAgICAqL1xuICAgIHByaXZhdGUgb25Tb2Z0TG9nb3V0KCkge1xuICAgICAgICB0aGlzLm5vdGlmeU5ld1NjcmVlbignc29mdF9sb2dvdXQnKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZUZvck5ld1ZpZXcoe1xuICAgICAgICAgICAgdmlldzogVmlld3MuU09GVF9MT0dPVVQsXG4gICAgICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgICAgICBjb2xsYXBzZUxoczogZmFsc2UsXG4gICAgICAgICAgICBjdXJyZW50Um9vbUlkOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdWJUaXRsZVN0YXR1cyA9ICcnO1xuICAgICAgICB0aGlzLnNldFBhZ2VTdWJ0aXRsZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCBqdXN0IGJlZm9yZSB0aGUgbWF0cml4IGNsaWVudCBpcyBzdGFydGVkXG4gICAgICogKHVzZWZ1bCBmb3Igc2V0dGluZyBsaXN0ZW5lcnMpXG4gICAgICovXG4gICAgcHJpdmF0ZSBvbldpbGxTdGFydENsaWVudCgpIHtcbiAgICAgICAgLy8gcmVzZXQgdGhlICdoYXZlIGNvbXBsZXRlZCBmaXJzdCBzeW5jJyBmbGFnLFxuICAgICAgICAvLyBzaW5jZSB3ZSdyZSBhYm91dCB0byBzdGFydCB0aGUgY2xpZW50IGFuZCB0aGVyZWZvcmUgYWJvdXRcbiAgICAgICAgLy8gdG8gZG8gdGhlIGZpcnN0IHN5bmNcbiAgICAgICAgdGhpcy5maXJzdFN5bmNDb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZpcnN0U3luY1Byb21pc2UgPSBkZWZlcigpO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgLy8gQWxsb3cgdGhlIEpTIFNESyB0byByZWFwIHRpbWVsaW5lIGV2ZW50cy4gVGhpcyByZWR1Y2VzIHRoZSBhbW91bnQgb2ZcbiAgICAgICAgLy8gbWVtb3J5IGNvbnN1bWVkIGFzIHRoZSBKUyBTREsgc3RvcmVzIG11bHRpcGxlIGRpc3RpbmN0IGNvcGllcyBvZiByb29tXG4gICAgICAgIC8vIHN0YXRlIChlYWNoIG9mIHdoaWNoIGNhbiBiZSAxMHMgb2YgTUJzKSBmb3IgZWFjaCBESVNKT0lOVCB0aW1lbGluZS4gVGhpcyBpc1xuICAgICAgICAvLyBwYXJ0aWN1bGFybHkgbm90aWNlYWJsZSB3aGVuIHRoZXJlIGFyZSBsb3RzIG9mICdsaW1pdGVkJyAvc3luYyByZXNwb25zZXNcbiAgICAgICAgLy8gc3VjaCBhcyB3aGVuIGxhcHRvcHMgdW5zbGVlcC5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMzMwNyNpc3N1ZWNvbW1lbnQtMjgyODk1NTY4XG4gICAgICAgIGNsaS5zZXRDYW5SZXNldFRpbWVsaW5lQ2FsbGJhY2soKHJvb21JZCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXF1ZXN0IHRvIHJlc2V0IHRpbWVsaW5lIGluIHJvb20gXCIsIHJvb21JZCwgXCIgdmlld2luZzpcIiwgdGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tSWQgIT09IHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCkge1xuICAgICAgICAgICAgICAgIC8vIEl0IGlzIHNhZmUgdG8gcmVtb3ZlIGV2ZW50cyBmcm9tIHJvb21zIHdlIGFyZSBub3Qgdmlld2luZy5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlIGFyZSB2aWV3aW5nIHRoZSByb29tIHdoaWNoIHdlIHdhbnQgdG8gcmVzZXQuIEl0IGlzIG9ubHkgc2FmZSB0byBkb1xuICAgICAgICAgICAgLy8gdGhpcyBpZiB3ZSBhcmUgbm90IHNjcm9sbGVkIHVwIGluIHRoZSB2aWV3LiBUbyBmaW5kIG91dCwgZGVsZWdhdGUgdG9cbiAgICAgICAgICAgIC8vIHRoZSB0aW1lbGluZSBwYW5lbC4gSWYgdGhlIHRpbWVsaW5lIHBhbmVsIGRvZXNuJ3QgZXhpc3QsIHRoZW4gd2UgYXNzdW1lXG4gICAgICAgICAgICAvLyBpdCBpcyBzYWZlIHRvIHJlc2V0IHRoZSB0aW1lbGluZS5cbiAgICAgICAgICAgIGlmICghdGhpcy5sb2dnZWRJblZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9nZ2VkSW5WaWV3LmN1cnJlbnQuY2FuUmVzZXRUaW1lbGluZUluUm9vbShyb29tSWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjbGkub24oJ3N5bmMnLCAoc3RhdGUsIHByZXZTdGF0ZSwgZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gTGlmZWN5Y2xlU3RvcmUgYW5kIG90aGVycyBjYW5ub3QgZGlyZWN0bHkgc3Vic2NyaWJlIHRvIG1hdHJpeCBjbGllbnQgZm9yXG4gICAgICAgICAgICAvLyBldmVudHMgYmVjYXVzZSBmbHV4IG9ubHkgYWxsb3dzIHN0b3JlIHN0YXRlIGNoYW5nZXMgZHVyaW5nIGZsdXggZGlzcGF0Y2hlcy5cbiAgICAgICAgICAgIC8vIFNvIGRpc3BhdGNoIGRpcmVjdGx5IGZyb20gaGVyZS4gSWRlYWxseSB3ZSdkIHVzZSBhIFN5bmNTdGF0ZVN0b3JlIHRoYXRcbiAgICAgICAgICAgIC8vIHdvdWxkIGRvIHRoaXMgZGlzcGF0Y2ggYW5kIGV4cG9zZSB0aGUgc3luYyBzdGF0ZSBpdHNlbGYgKGJ5IGxpc3RlbmluZyB0b1xuICAgICAgICAgICAgLy8gaXRzIG93biBkaXNwYXRjaCkuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3N5bmNfc3RhdGUnLCBwcmV2U3RhdGUsIHN0YXRlfSk7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gXCJFUlJPUlwiIHx8IHN0YXRlID09PSBcIlJFQ09OTkVDVElOR1wiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkU3RvcmVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBMaWZlY3ljbGUuaGFuZGxlSW52YWxpZFN0b3JlRXJyb3IoZGF0YS5lcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3N5bmNFcnJvcjogZGF0YS5lcnJvciB8fCB0cnVlfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc3luY0Vycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c3luY0Vycm9yOiBudWxsfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhdHVzSW5kaWNhdG9yKHN0YXRlLCBwcmV2U3RhdGUpO1xuICAgICAgICAgICAgaWYgKHN0YXRlID09PSBcIlNZTkNJTkdcIiAmJiBwcmV2U3RhdGUgPT09IFwiU1lOQ0lOR1wiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiTWF0cml4Q2xpZW50IHN5bmMgc3RhdGUgPT4gJXNcIiwgc3RhdGUpO1xuICAgICAgICAgICAgaWYgKHN0YXRlICE9PSBcIlBSRVBBUkVEXCIpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgIHRoaXMuZmlyc3RTeW5jQ29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICAgICAgaWYgKE5vdGlmaWVyLnNob3VsZFNob3dQcm9tcHQoKSAmJiAhTWF0cml4Q2xpZW50UGVnLnVzZXJSZWdpc3RlcmVkV2l0aGluTGFzdEhvdXJzKDI0KSkge1xuICAgICAgICAgICAgICAgIHNob3dOb3RpZmljYXRpb25zVG9hc3QoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWFkeTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjbGkub24oJ1Nlc3Npb24ubG9nZ2VkX291dCcsIGZ1bmN0aW9uKGVyck9iaikge1xuICAgICAgICAgICAgaWYgKExpZmVjeWNsZS5pc0xvZ2dpbmdPdXQoKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBBIG1vZGFsIG1pZ2h0IGhhdmUgYmVlbiBvcGVuIHdoZW4gd2Ugd2VyZSBsb2dnZWQgb3V0IGJ5IHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgIE1vZGFsLmNsb3NlQ3VycmVudE1vZGFsKCdTZXNzaW9uLmxvZ2dlZF9vdXQnKTtcblxuICAgICAgICAgICAgaWYgKGVyck9iai5odHRwU3RhdHVzID09PSA0MDEgJiYgZXJyT2JqLmRhdGEgJiYgZXJyT2JqLmRhdGFbJ3NvZnRfbG9nb3V0J10pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJTb2Z0IGxvZ291dCBpc3N1ZWQgYnkgc2VydmVyIC0gYXZvaWRpbmcgZGF0YSBkZWxldGlvblwiKTtcbiAgICAgICAgICAgICAgICBMaWZlY3ljbGUuc29mdExvZ291dCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2lnbmVkIG91dCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnU2lnbmVkIE91dCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnRm9yIHNlY3VyaXR5LCB0aGlzIHNlc3Npb24gaGFzIGJlZW4gc2lnbmVkIG91dC4gUGxlYXNlIHNpZ24gaW4gYWdhaW4uJyksXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdsb2dvdXQnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGkub24oJ25vX2NvbnNlbnQnLCBmdW5jdGlvbihtZXNzYWdlLCBjb25zZW50VXJpKSB7XG4gICAgICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnTm8gQ29uc2VudCBEaWFsb2cnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1Rlcm1zIGFuZCBDb25kaXRpb25zJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwPiB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RvIGNvbnRpbnVlIHVzaW5nIHRoZSAlKGhvbWVzZXJ2ZXJEb21haW4pcyBob21lc2VydmVyICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3lvdSBtdXN0IHJldmlldyBhbmQgYWdyZWUgdG8gb3VyIHRlcm1zIGFuZCBjb25kaXRpb25zLicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGhvbWVzZXJ2ZXJEb21haW46IGNsaS5nZXREb21haW4oKSB9LFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICBidXR0b246IF90KCdSZXZpZXcgdGVybXMgYW5kIGNvbmRpdGlvbnMnKSxcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b246IF90KCdEaXNtaXNzJyksXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZDogKGNvbmZpcm1lZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3bmQgPSB3aW5kb3cub3Blbihjb25zZW50VXJpLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3bmQub3BlbmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LCBudWxsLCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZGZ0ID0gbmV3IERlY3J5cHRpb25GYWlsdXJlVHJhY2tlcigodG90YWwsIGVycm9yQ29kZSkgPT4ge1xuICAgICAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ0UyRScsICdEZWNyeXB0aW9uIGZhaWx1cmUnLCBlcnJvckNvZGUsIHRvdGFsKTtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJkZWNyeXB0aW9uX2ZhaWx1cmVcIiwgeyBlcnJvckNvZGUgfSwgbnVsbCwgeyBzdW06IHRvdGFsIH0pO1xuICAgICAgICB9LCAoZXJyb3JDb2RlKSA9PiB7XG4gICAgICAgICAgICAvLyBNYXAgSlMtU0RLIGVycm9yIGNvZGVzIHRvIHRyYWNrZXIgY29kZXMgZm9yIGFnZ3JlZ2F0aW9uXG4gICAgICAgICAgICBzd2l0Y2ggKGVycm9yQ29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ01FR09MTV9VTktOT1dOX0lOQk9VTkRfU0VTU0lPTl9JRCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnb2xtX2tleXNfbm90X3NlbnRfZXJyb3InO1xuICAgICAgICAgICAgICAgIGNhc2UgJ09MTV9VTktOT1dOX01FU1NBR0VfSU5ERVgnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ29sbV9pbmRleF9lcnJvcic7XG4gICAgICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAndW5leHBlY3RlZF9lcnJvcic7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICd1bnNwZWNpZmllZF9lcnJvcic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNoZWx2ZWQgZm9yIGxhdGVyIGRhdGUgd2hlbiB3ZSBoYXZlIHRpbWUgdG8gdGhpbmsgYWJvdXQgcGVyc2lzdGluZyBoaXN0b3J5IG9mXG4gICAgICAgIC8vIHRyYWNrZWQgZXZlbnRzIGFjcm9zcyBzZXNzaW9ucy5cbiAgICAgICAgLy8gZGZ0LmxvYWRUcmFja2VkRXZlbnRIYXNoTWFwKCk7XG5cbiAgICAgICAgZGZ0LnN0YXJ0KCk7XG5cbiAgICAgICAgLy8gV2hlbiBsb2dnaW5nIG91dCwgc3RvcCB0cmFja2luZyBmYWlsdXJlcyBhbmQgZGVzdHJveSBzdGF0ZVxuICAgICAgICBjbGkub24oXCJTZXNzaW9uLmxvZ2dlZF9vdXRcIiwgKCkgPT4gZGZ0LnN0b3AoKSk7XG4gICAgICAgIGNsaS5vbihcIkV2ZW50LmRlY3J5cHRlZFwiLCAoZSwgZXJyKSA9PiBkZnQuZXZlbnREZWNyeXB0ZWQoZSwgZXJyKSk7XG5cbiAgICAgICAgY2xpLm9uKFwiUm9vbVwiLCAocm9vbSkgPT4ge1xuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsYWNrbGlzdEVuYWJsZWQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoXG4gICAgICAgICAgICAgICAgICAgIFNldHRpbmdMZXZlbC5ST09NX0RFVklDRSxcbiAgICAgICAgICAgICAgICAgICAgXCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiLFxuICAgICAgICAgICAgICAgICAgICByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgLypleHBsaWNpdD0qL3RydWUsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByb29tLnNldEJsYWNrbGlzdFVudmVyaWZpZWREZXZpY2VzKGJsYWNrbGlzdEVuYWJsZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2xpLm9uKFwiY3J5cHRvLndhcm5pbmdcIiwgKHR5cGUpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0NSWVBUT19XQVJOSU5HX09MRF9WRVJTSU9OX0RFVEVDVEVEJzpcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ3J5cHRvIG1pZ3JhdGVkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ09sZCBjcnlwdG9ncmFwaHkgZGF0YSBkZXRlY3RlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRGF0YSBmcm9tIGFuIG9sZGVyIHZlcnNpb24gb2YgJShicmFuZClzIGhhcyBiZWVuIGRldGVjdGVkLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHdpbGwgaGF2ZSBjYXVzZWQgZW5kLXRvLWVuZCBjcnlwdG9ncmFwaHkgdG8gbWFsZnVuY3Rpb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW4gdGhlIG9sZGVyIHZlcnNpb24uIEVuZC10by1lbmQgZW5jcnlwdGVkIG1lc3NhZ2VzIGV4Y2hhbmdlZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWNlbnRseSB3aGlsc3QgdXNpbmcgdGhlIG9sZGVyIHZlcnNpb24gbWF5IG5vdCBiZSBkZWNyeXB0YWJsZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbiB0aGlzIHZlcnNpb24uIFRoaXMgbWF5IGFsc28gY2F1c2UgbWVzc2FnZXMgZXhjaGFuZ2VkIHdpdGggdGhpcyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2ZXJzaW9uIHRvIGZhaWwuIElmIHlvdSBleHBlcmllbmNlIHByb2JsZW1zLCBsb2cgb3V0IGFuZCBiYWNrIGluIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFnYWluLiBUbyByZXRhaW4gbWVzc2FnZSBoaXN0b3J5LCBleHBvcnQgYW5kIHJlLWltcG9ydCB5b3VyIGtleXMuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZDogU2RrQ29uZmlnLmdldCgpLmJyYW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjbGkub24oXCJjcnlwdG8ua2V5QmFja3VwRmFpbGVkXCIsIGFzeW5jIChlcnJjb2RlKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGF2ZU5ld1ZlcnNpb247XG4gICAgICAgICAgICBsZXQgbmV3VmVyc2lvbkluZm87XG4gICAgICAgICAgICAvLyBpZiBrZXkgYmFja3VwIGlzIHN0aWxsIGVuYWJsZWQsIHRoZXJlIG11c3QgYmUgYSBuZXcgYmFja3VwIGluIHBsYWNlXG4gICAgICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEtleUJhY2t1cEVuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIGhhdmVOZXdWZXJzaW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGNoZWNrIHRoZSBzZXJ2ZXIgdG8gc2VlIGlmIHRoZXJlJ3MgYSBuZXcgb25lXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmVyc2lvbkluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmVyc2lvbkluZm8gIT09IG51bGwpIGhhdmVOZXdWZXJzaW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJTYXcga2V5IGJhY2t1cCBlcnJvciBidXQgZmFpbGVkIHRvIGNoZWNrIGJhY2t1cCB2ZXJzaW9uIVwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhhdmVOZXdWZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKCdOZXcgUmVjb3ZlcnkgTWV0aG9kJywgJ05ldyBSZWNvdmVyeSBNZXRob2QnLFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnQoJy4uLy4uL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9OZXdSZWNvdmVyeU1ldGhvZERpYWxvZycpLFxuICAgICAgICAgICAgICAgICAgICB7IG5ld1ZlcnNpb25JbmZvIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKCdSZWNvdmVyeSBNZXRob2QgUmVtb3ZlZCcsICdSZWNvdmVyeSBNZXRob2QgUmVtb3ZlZCcsXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L1JlY292ZXJ5TWV0aG9kUmVtb3ZlZERpYWxvZycpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNsaS5vbihcImNyeXB0by5rZXlTaWduYXR1cmVVcGxvYWRGYWlsdXJlXCIsIChmYWlsdXJlcywgc291cmNlLCBjb250aW51YXRpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IEtleVNpZ25hdHVyZVVwbG9hZEZhaWxlZERpYWxvZyA9XG4gICAgICAgICAgICAgICAgc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5LZXlTaWduYXR1cmVVcGxvYWRGYWlsZWREaWFsb2cnKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byB1cGxvYWQga2V5IHNpZ25hdHVyZXMnLFxuICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gdXBsb2FkIGtleSBzaWduYXR1cmVzJyxcbiAgICAgICAgICAgICAgICBLZXlTaWduYXR1cmVVcGxvYWRGYWlsZWREaWFsb2csXG4gICAgICAgICAgICAgICAgeyBmYWlsdXJlcywgc291cmNlLCBjb250aW51YXRpb24gfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNsaS5vbihcImNyeXB0by52ZXJpZmljYXRpb24ucmVxdWVzdFwiLCByZXF1ZXN0ID0+IHtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnZlcmlmaWVyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgSW5jb21pbmdTYXNEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5JbmNvbWluZ1Nhc0RpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdJbmNvbWluZyBWZXJpZmljYXRpb24nLCAnJywgSW5jb21pbmdTYXNEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdmVyaWZpZXI6IHJlcXVlc3QudmVyaWZpZXIsXG4gICAgICAgICAgICAgICAgfSwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3QucGVuZGluZykge1xuICAgICAgICAgICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5hZGRPclJlcGxhY2VUb2FzdCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3ZlcmlmcmVxXycgKyByZXF1ZXN0LmNoYW5uZWwudHJhbnNhY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHJlcXVlc3QuaXNTZWxmVmVyaWZpY2F0aW9uID8gX3QoXCJTZWxmLXZlcmlmaWNhdGlvbiByZXF1ZXN0XCIpIDogX3QoXCJWZXJpZmljYXRpb24gUmVxdWVzdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJ2ZXJpZmljYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHtyZXF1ZXN0fSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBzZGsuZ2V0Q29tcG9uZW50KFwidG9hc3RzLlZlcmlmaWNhdGlvblJlcXVlc3RUb2FzdFwiKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IDkwLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gRmlyZSB0aGUgdGludGVyIHJpZ2h0IG9uIHN0YXJ0dXAgdG8gZW5zdXJlIHRoZSBkZWZhdWx0IHRoZW1lIGlzIGFwcGxpZWRcbiAgICAgICAgLy8gQSBsYXRlciBzeW5jIGNhbi93aWxsIGNvcnJlY3QgdGhlIHRpbnQgdG8gYmUgdGhlIHJpZ2h0IHZhbHVlIGZvciB0aGUgdXNlclxuICAgICAgICBjb25zdCBjb2xvclNjaGVtZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJyb29tQ29sb3JcIik7XG4gICAgICAgIFRpbnRlci50aW50KGNvbG9yU2NoZW1lLnByaW1hcnlfY29sb3IsIGNvbG9yU2NoZW1lLnNlY29uZGFyeV9jb2xvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHNob3J0bHkgYWZ0ZXIgdGhlIG1hdHJpeCBjbGllbnQgaGFzIHN0YXJ0ZWQuIFVzZWZ1bCBmb3JcbiAgICAgKiBzZXR0aW5nIHVwIGFueXRoaW5nIHRoYXQgcmVxdWlyZXMgdGhlIGNsaWVudCB0byBiZSBzdGFydGVkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBvbkNsaWVudFN0YXJ0ZWQoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBpZiAoY2xpLmlzQ3J5cHRvRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBibGFja2xpc3RFbmFibGVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFxuICAgICAgICAgICAgICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgICAgICAgICAgICAgXCJibGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlc1wiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNsaS5zZXRHbG9iYWxCbGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlcyhibGFja2xpc3RFbmFibGVkKTtcblxuICAgICAgICAgICAgLy8gV2l0aCBjcm9zcy1zaWduaW5nIGVuYWJsZWQsIHdlIHNlbmQgdG8gdW5rbm93biBkZXZpY2VzXG4gICAgICAgICAgICAvLyB3aXRob3V0IHByb21wdGluZy4gQW55IGJhZC1kZXZpY2Ugc3RhdHVzIHRoZSB1c2VyIHNob3VsZFxuICAgICAgICAgICAgLy8gYmUgYXdhcmUgb2Ygd2lsbCBiZSBzaWduYWxsZWQgdGhyb3VnaCB0aGUgcm9vbSBzaGllbGRcbiAgICAgICAgICAgIC8vIGNoYW5naW5nIGNvbG91ci4gTW9yZSBhZHZhbmNlZCBiZWhhdmlvdXIgd2lsbCBjb21lIG9uY2VcbiAgICAgICAgICAgIC8vIHdlIGltcGxlbWVudCBtb3JlIHNldHRpbmdzLlxuICAgICAgICAgICAgY2xpLnNldEdsb2JhbEVycm9yT25Vbmtub3duRGV2aWNlcyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93U2NyZWVuKHNjcmVlbjogc3RyaW5nLCBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGlzTG9nZ2VkT3V0T3JHdWVzdCA9ICFjbGkgfHwgY2xpLmlzR3Vlc3QoKTtcbiAgICAgICAgaWYgKCFpc0xvZ2dlZE91dE9yR3Vlc3QgJiYgQVVUSF9TQ1JFRU5TLmluY2x1ZGVzKHNjcmVlbikpIHtcbiAgICAgICAgICAgIC8vIHVzZXIgaXMgbG9nZ2VkIGluIGFuZCBsYW5kaW5nIG9uIGFuIGF1dGggcGFnZSB3aGljaCB3aWxsIHVwcm9vdCB0aGVpciBzZXNzaW9uLCByZWRpcmVjdCB0aGVtIGhvbWUgaW5zdGVhZFxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfaG9tZV9wYWdlXCIgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NyZWVuID09PSAncmVnaXN0ZXInKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0X3JlZ2lzdHJhdGlvbicsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzY3JlZW4gPT09ICdsb2dpbicpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnc3RhcnRfbG9naW4nLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnZm9yZ290X3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdzdGFydF9wYXNzd29yZF9yZWNvdmVyeScsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzY3JlZW4gPT09ICdzb2Z0X2xvZ291dCcpIHtcbiAgICAgICAgICAgIGlmIChjbGkuZ2V0VXNlcklkKCkgJiYgIUxpZmVjeWNsZS5pc1NvZnRMb2dvdXQoKSkge1xuICAgICAgICAgICAgICAgIC8vIExvZ2dlZCBpbiAtIHZpc2l0IGEgcm9vbVxuICAgICAgICAgICAgICAgIHRoaXMudmlld0xhc3RSb29tKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFVsdGltYXRlbHkgdHJpZ2dlcnMgc29mdF9sb2dvdXQgaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnc3RhcnRfbG9naW4nLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChzY3JlZW4gPT09ICduZXcnKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfY3JlYXRlX3Jvb20nLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnc2V0dGluZ3MnKSB7XG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnd2VsY29tZScpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld193ZWxjb21lX3BhZ2UnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnaG9tZScpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19ob21lX3BhZ2UnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dTY3JlZW4oJ2hvbWUnKTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnZGlyZWN0b3J5Jykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudmlldyA9PT0gVmlld3MuV0VMQ09NRSkge1xuICAgICAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2soXCJvbmJvYXJkaW5nX3Jvb21fZGlyZWN0b3J5XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdSb29tRGlyZWN0b3J5KTtcbiAgICAgICAgfSBlbHNlIGlmIChzY3JlZW4gPT09IFwic3RhcnRfc3NvXCIgfHwgc2NyZWVuID09PSBcInN0YXJ0X2Nhc1wiKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGlmIGxvZ2dlZCBpbiwgc2tpcCBTU09cbiAgICAgICAgICAgIGxldCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBpZiAoIWNsaSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtoc1VybCwgaXNVcmx9ID0gdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWc7XG4gICAgICAgICAgICAgICAgY2xpID0gTWF0cml4LmNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6IGhzVXJsLFxuICAgICAgICAgICAgICAgICAgICBpZEJhc2VVcmw6IGlzVXJsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0eXBlID0gc2NyZWVuID09PSBcInN0YXJ0X3Nzb1wiID8gXCJzc29cIiA6IFwiY2FzXCI7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zdGFydFNpbmdsZVNpZ25PbihjbGksIHR5cGUsIHRoaXMuZ2V0RnJhZ21lbnRBZnRlckxvZ2luKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2dyb3VwcycpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19teV9ncm91cHMnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuLmluZGV4T2YoJ3Jvb20vJykgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFJvb21zIGNhbiBoYXZlIHRoZSBmb2xsb3dpbmcgZm9ybWF0czpcbiAgICAgICAgICAgIC8vICNyb29tX2FsaWFzOmRvbWFpbiBvciAhb3BhcXVlX2lkOmRvbWFpblxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHNjcmVlbi5zdWJzdHJpbmcoNSk7XG4gICAgICAgICAgICBjb25zdCBkb21haW5PZmZzZXQgPSByb29tLmluZGV4T2YoJzonKSArIDE7IC8vIDAgaW4gY2FzZSByb29tIGRvZXMgbm90IGNvbnRhaW4gYSA6XG4gICAgICAgICAgICBsZXQgZXZlbnRPZmZzZXQgPSByb29tLmxlbmd0aDtcbiAgICAgICAgICAgIC8vIHJvb20gYWxpYXNlcyBjYW4gY29udGFpbiBzbGFzaGVzIG9ubHkgbG9vayBmb3Igc2xhc2ggYWZ0ZXIgZG9tYWluXG4gICAgICAgICAgICBpZiAocm9vbS5zdWJzdHJpbmcoZG9tYWluT2Zmc2V0KS5pbmRleE9mKCcvJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIGV2ZW50T2Zmc2V0ID0gZG9tYWluT2Zmc2V0ICsgcm9vbS5zdWJzdHJpbmcoZG9tYWluT2Zmc2V0KS5pbmRleE9mKCcvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByb29tU3RyaW5nID0gcm9vbS5zdWJzdHJpbmcoMCwgZXZlbnRPZmZzZXQpO1xuICAgICAgICAgICAgbGV0IGV2ZW50SWQgPSByb29tLnN1YnN0cmluZyhldmVudE9mZnNldCArIDEpOyAvLyBlbXB0eSBzdHJpbmcgaWYgbm8gZXZlbnQgaWQgZ2l2ZW5cblxuICAgICAgICAgICAgLy8gUHJldmlvdXNseSB3ZSBwdWxsZWQgdGhlIGV2ZW50SUQgZnJvbSB0aGUgc2VnbWVudHMgaW4gc3VjaCBhIHdheVxuICAgICAgICAgICAgLy8gd2hlcmUgaWYgdGhlcmUgd2FzIG5vIGV2ZW50SWQgdGhlbiB3ZSdkIGdldCB1bmRlZmluZWQuIEhvd2V2ZXIsIHdlXG4gICAgICAgICAgICAvLyBub3cgZG8gYSBzcGxpY2UgYW5kIGpvaW4gdG8gaGFuZGxlIHYzIGV2ZW50IElEcyB3aGljaCByZXN1bHRzIGluXG4gICAgICAgICAgICAvLyBhbiBlbXB0eSBzdHJpbmcuIFRvIG1haW50YWluIG91ciBwb3RlbnRpYWwgY29udHJhY3Qgd2l0aCB0aGUgcmVzdFxuICAgICAgICAgICAgLy8gb2YgdGhlIGFwcCwgd2UgY29lcmNlIHRoZSBldmVudElkIHRvIGJlIHVuZGVmaW5lZCB3aGVyZSBhcHBsaWNhYmxlLlxuICAgICAgICAgICAgaWYgKCFldmVudElkKSBldmVudElkID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBIYW5kbGUgZW5jb2RlZCByb29tL2V2ZW50IElEczogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvOTE0OVxuXG4gICAgICAgICAgICBsZXQgdGhyZWVwaWRJbnZpdGU6IElUaHJlZXBpZEludml0ZTtcbiAgICAgICAgICAgIC8vIGlmIHdlIGxhbmRlZCBoZXJlIGZyb20gYSAzUElEIGludml0ZSwgcGVyc2lzdCBpdFxuICAgICAgICAgICAgaWYgKHBhcmFtcy5zaWdudXJsICYmIHBhcmFtcy5lbWFpbCkge1xuICAgICAgICAgICAgICAgIHRocmVlcGlkSW52aXRlID0gVGhyZWVwaWRJbnZpdGVTdG9yZS5pbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAuc3RvcmVJbnZpdGUocm9vbVN0cmluZywgcGFyYW1zIGFzIElUaHJlZXBpZEludml0ZVdpcmVGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGNoZWNrIHRoYXQgdGhpcyByb29tIGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGEga25vd24gaW52aXRlXG4gICAgICAgICAgICBpZiAoIXRocmVlcGlkSW52aXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52aXRlcyA9IFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UuZ2V0SW52aXRlcygpO1xuICAgICAgICAgICAgICAgIHRocmVlcGlkSW52aXRlID0gaW52aXRlcy5maW5kKGludml0ZSA9PiBpbnZpdGUucm9vbUlkID09PSByb29tU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gb24gb3VyIFVSTHMgdGhlcmUgbWlnaHQgYmUgYSA/dmlhPW1hdHJpeC5vcmcgb3Igc2ltaWxhciB0byBoZWxwXG4gICAgICAgICAgICAvLyBqb2lucyB0byB0aGUgcm9vbSBzdWNjZWVkLiBXZSdsbCBwYXNzIHRoZXNlIHRocm91Z2ggYXMgYW4gYXJyYXlcbiAgICAgICAgICAgIC8vIHRvIG90aGVyIGxldmVscy4gSWYgdGhlcmUncyBqdXN0IG9uZSA/dmlhPSB0aGVuIHBhcmFtcy52aWEgaXMgYVxuICAgICAgICAgICAgLy8gc2luZ2xlIHN0cmluZy4gSWYgc29tZW9uZSBkb2VzIHNvbWV0aGluZyBsaWtlID92aWE9b25lLmNvbSZ2aWE9dHdvLmNvbVxuICAgICAgICAgICAgLy8gdGhlbiBwYXJhbXMudmlhIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgICAgICAgICBsZXQgdmlhID0gW107XG4gICAgICAgICAgICBpZiAocGFyYW1zLnZpYSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocGFyYW1zLnZpYSkgPT09ICdzdHJpbmcnKSB2aWEgPSBbcGFyYW1zLnZpYV07XG4gICAgICAgICAgICAgICAgZWxzZSB2aWEgPSBwYXJhbXMudmlhO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGV2ZW50SWQsXG4gICAgICAgICAgICAgICAgdmlhX3NlcnZlcnM6IHZpYSxcbiAgICAgICAgICAgICAgICAvLyBJZiBhbiBldmVudCBJRCBpcyBnaXZlbiBpbiB0aGUgVVJMIGhhc2gsIG5vdGlmeSBSb29tVmlld1N0b3JlIHRvIG1hcmtcbiAgICAgICAgICAgICAgICAvLyBpdCBhcyBoaWdobGlnaHRlZCwgd2hpY2ggd2lsbCBwcm9wYWdhdGUgdG8gUm9vbVZpZXcgYW5kIGhpZ2hsaWdodCB0aGVcbiAgICAgICAgICAgICAgICAvLyBhc3NvY2lhdGVkIEV2ZW50VGlsZS5cbiAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogQm9vbGVhbihldmVudElkKSxcbiAgICAgICAgICAgICAgICB0aHJlZXBpZF9pbnZpdGU6IHRocmVlcGlkSW52aXRlLFxuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlcGxhY2Ugb29iX2RhdGEgd2l0aCB0aGUgdGhyZWVwaWRJbnZpdGUgKHdoaWNoIGhhcyB0aGUgc2FtZSBpbmZvKS5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzbid0IGRvbmUgeWV0IGJlY2F1c2UgaXQncyB0aHJlYWRlZCB0aHJvdWdoIHNvIG1hbnkgbW9yZSBwbGFjZXMuXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE1MTU3XG4gICAgICAgICAgICAgICAgb29iX2RhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhyZWVwaWRJbnZpdGU/LnJvb21OYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHRocmVlcGlkSW52aXRlPy5yb29tQXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZTogdGhyZWVwaWRJbnZpdGU/Lmludml0ZXJOYW1lLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcm9vbV9hbGlhczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocm9vbVN0cmluZ1swXSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5yb29tX2FsaWFzID0gcm9vbVN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5yb29tX2lkID0gcm9vbVN0cmluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHBheWxvYWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbi5pbmRleE9mKCd1c2VyLycpID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VySWQgPSBzY3JlZW4uc3Vic3RyaW5nKDUpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3VzZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgdXNlcklkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgc3ViQWN0aW9uOiBwYXJhbXMuYWN0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuLmluZGV4T2YoJ2dyb3VwLycpID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBncm91cElkID0gc2NyZWVuLnN1YnN0cmluZyg2KTtcblxuICAgICAgICAgICAgLy8gVE9ETzogQ2hlY2sgdmFsaWQgZ3JvdXAgSURcblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X2dyb3VwJyxcbiAgICAgICAgICAgICAgICBncm91cF9pZDogZ3JvdXBJZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSWdub3Jpbmcgc2hvd1NjcmVlbiBmb3IgJyVzJ1wiLCBzY3JlZW4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbm90aWZ5TmV3U2NyZWVuKHNjcmVlbjogc3RyaW5nLCByZXBsYWNlTGFzdCA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uTmV3U2NyZWVuKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uTmV3U2NyZWVuKHNjcmVlbiwgcmVwbGFjZUxhc3QpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0UGFnZVN1YnRpdGxlKCk7XG4gICAgfVxuXG4gICAgb25BbGlhc0NsaWNrKGV2ZW50OiBNb3VzZUV2ZW50LCBhbGlhczogc3RyaW5nKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19yb29tJywgcm9vbV9hbGlhczogYWxpYXN9KTtcbiAgICB9XG5cbiAgICBvblVzZXJDbGljayhldmVudDogTW91c2VFdmVudCwgdXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBtZW1iZXIgPSBuZXcgUm9vbU1lbWJlcihudWxsLCB1c2VySWQpO1xuICAgICAgICBpZiAoIW1lbWJlcikgeyByZXR1cm47IH1cbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdVc2VyUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXIsXG4gICAgICAgICAgICBtZW1iZXI6IG1lbWJlcixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Hcm91cENsaWNrKGV2ZW50OiBNb3VzZUV2ZW50LCBncm91cElkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2dyb3VwJywgZ3JvdXBfaWQ6IGdyb3VwSWR9KTtcbiAgICB9XG5cbiAgICBvbkxvZ291dENsaWNrKGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxBbmNob3JFbGVtZW50LCBNb3VzZUV2ZW50Pikge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnbG9nb3V0JyxcbiAgICAgICAgfSk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgaGlkZUxoc1RocmVzaG9sZCA9IDEwMDA7XG4gICAgICAgIGNvbnN0IHNob3dMaHNUaHJlc2hvbGQgPSAxMDAwO1xuXG4gICAgICAgIGlmICh0aGlzLndpbmRvd1dpZHRoID4gaGlkZUxoc1RocmVzaG9sZCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8PSBoaWRlTGhzVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdoaWRlX2xlZnRfcGFuZWwnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLndpbmRvd1dpZHRoIDw9IHNob3dMaHNUaHJlc2hvbGQgJiYgd2luZG93LmlubmVyV2lkdGggPiBzaG93TGhzVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzaG93X2xlZnRfcGFuZWwnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZS5yZXNpemVOb3RpZmllci5ub3RpZnlXaW5kb3dSZXNpemVkKCk7XG4gICAgICAgIHRoaXMud2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBkaXNwYXRjaFRpbWVsaW5lUmVzaXplKCkge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICd0aW1lbGluZV9yZXNpemUnIH0pO1xuICAgIH1cblxuICAgIG9uUm9vbUNyZWF0ZWQocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X3Jvb21cIixcbiAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25SZWdpc3RlckNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dTY3JlZW4oXCJyZWdpc3RlclwiKTtcbiAgICB9O1xuXG4gICAgb25Mb2dpbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dTY3JlZW4oXCJsb2dpblwiKTtcbiAgICB9O1xuXG4gICAgb25Gb3Jnb3RQYXNzd29yZENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dTY3JlZW4oXCJmb3Jnb3RfcGFzc3dvcmRcIik7XG4gICAgfTtcblxuICAgIG9uUmVnaXN0ZXJGbG93Q29tcGxldGUgPSAoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5vblVzZXJDb21wbGV0ZWRMb2dpbkZsb3coY3JlZGVudGlhbHMsIHBhc3N3b3JkKTtcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJucyBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gdGhlIG5ldyBNYXRyaXhDbGllbnRcbiAgICBvblJlZ2lzdGVyZWQoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcykge1xuICAgICAgICByZXR1cm4gTGlmZWN5Y2xlLnNldExvZ2dlZEluKGNyZWRlbnRpYWxzKTtcbiAgICB9XG5cbiAgICBvblNlbmRFdmVudChyb29tSWQ6IHN0cmluZywgZXZlbnQ6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGkpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnbWVzc2FnZV9zZW5kX2ZhaWxlZCd9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsaS5zZW5kRXZlbnQocm9vbUlkLCBldmVudC5nZXRUeXBlKCksIGV2ZW50LmdldENvbnRlbnQoKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ21lc3NhZ2Vfc2VudCd9KTtcbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdtZXNzYWdlX3NlbmRfZmFpbGVkJ30pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFBhZ2VTdWJ0aXRsZShzdWJ0aXRsZSA9ICcnKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQgJiYgY2xpZW50LmdldFJvb20odGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgc3VidGl0bGUgPSBgJHt0aGlzLnN1YlRpdGxlU3RhdHVzfSB8ICR7IHJvb20ubmFtZSB9ICR7c3VidGl0bGV9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1YnRpdGxlID0gYCR7dGhpcy5zdWJUaXRsZVN0YXR1c30gJHtzdWJ0aXRsZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBgJHtTZGtDb25maWcuZ2V0KCkuYnJhbmR9ICR7c3VidGl0bGV9YDtcblxuICAgICAgICBpZiAoZG9jdW1lbnQudGl0bGUgIT09IHRpdGxlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlU3RhdHVzSW5kaWNhdG9yKHN0YXRlOiBzdHJpbmcsIHByZXZTdGF0ZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvblN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2xvYmFsU3RhdGU7XG4gICAgICAgIGNvbnN0IG51bVVucmVhZFJvb21zID0gbm90aWZpY2F0aW9uU3RhdGUubnVtVW5yZWFkU3RhdGVzOyAvLyB3ZSBrbm93IHRoYXQgc3RhdGVzID09PSByb29tcyBoZXJlXG5cbiAgICAgICAgaWYgKFBsYXRmb3JtUGVnLmdldCgpKSB7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zZXRFcnJvclN0YXR1cyhzdGF0ZSA9PT0gJ0VSUk9SJyk7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zZXROb3RpZmljYXRpb25Db3VudChudW1VbnJlYWRSb29tcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN1YlRpdGxlU3RhdHVzID0gJyc7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gXCJFUlJPUlwiKSB7XG4gICAgICAgICAgICB0aGlzLnN1YlRpdGxlU3RhdHVzICs9IGBbJHtfdChcIk9mZmxpbmVcIil9XSBgO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1VbnJlYWRSb29tcyA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgKz0gYFske251bVVucmVhZFJvb21zfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQYWdlU3VidGl0bGUoKTtcbiAgICB9XG5cbiAgICBvbkNsb3NlQWxsU2V0dGluZ3MoKSB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ2Nsb3NlX3NldHRpbmdzJyB9KTtcbiAgICB9XG5cbiAgICBvblNlcnZlckNvbmZpZ0NoYW5nZSA9IChzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZykgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZXJ2ZXJDb25maWd9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBtYWtlUmVnaXN0cmF0aW9uVXJsID0gKHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zLnJlZmVycmVyKSB7XG4gICAgICAgICAgICBwYXJhbXMucmVmZXJyZXIgPSB0aGlzLnByb3BzLnN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcy5yZWZlcnJlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5tYWtlUmVnaXN0cmF0aW9uVXJsKHBhcmFtcyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFmdGVyIHJlZ2lzdHJhdGlvbiBvciBsb2dpbiwgd2UgcnVuIHZhcmlvdXMgcG9zdC1hdXRoIHN0ZXBzIGJlZm9yZSBlbnRlcmluZyB0aGUgYXBwXG4gICAgICogcHJvcGVyLCBzdWNoIHNldHRpbmcgdXAgY3Jvc3Mtc2lnbmluZyBvciB2ZXJpZnlpbmcgdGhlIG5ldyBzZXNzaW9uLlxuICAgICAqXG4gICAgICogTm90ZTogU1NPIHVzZXJzIChhbmQgYW55IG90aGVycyB1c2luZyB0b2tlbiBsb2dpbikgY3VycmVudGx5IGRvIG5vdCBwYXNzIHRocm91Z2hcbiAgICAgKiB0aGlzLCBhcyB0aGV5IGluc3RlYWQganVtcCBzdHJhaWdodCBpbnRvIHRoZSBhcHAgYWZ0ZXIgYGF0dGVtcHRUb2tlbkxvZ2luYC5cbiAgICAgKi9cbiAgICBvblVzZXJDb21wbGV0ZWRMb2dpbkZsb3cgPSBhc3luYyAoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgICAgICAvLyBzZWxmLWRlc3RydWN0IHRoZSBwYXNzd29yZCBhZnRlciA1bWluc1xuICAgICAgICBpZiAodGhpcy5hY2NvdW50UGFzc3dvcmRUaW1lciAhPT0gbnVsbCkgY2xlYXJUaW1lb3V0KHRoaXMuYWNjb3VudFBhc3N3b3JkVGltZXIpO1xuICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZFRpbWVyID0gbnVsbDtcbiAgICAgICAgfSwgNjAgKiA1ICogMTAwMCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBzdGFydCB0aGUgY2xpZW50XG4gICAgICAgIGF3YWl0IExpZmVjeWNsZS5zZXRMb2dnZWRJbihjcmVkZW50aWFscyk7XG4gICAgICAgIGF3YWl0IHRoaXMucG9zdExvZ2luU2V0dXAoKTtcbiAgICB9O1xuXG4gICAgLy8gY29tcGxldGUgc2VjdXJpdHkgLyBlMmUgc2V0dXAgaGFzIGZpbmlzaGVkXG4gICAgb25Db21wbGV0ZVNlY3VyaXR5RTJlU2V0dXBGaW5pc2hlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5vbkxvZ2dlZEluKCk7XG4gICAgfTtcblxuICAgIGdldEZyYWdtZW50QWZ0ZXJMb2dpbigpIHtcbiAgICAgICAgbGV0IGZyYWdtZW50QWZ0ZXJMb2dpbiA9IFwiXCI7XG4gICAgICAgIGNvbnN0IGluaXRpYWxTY3JlZW5BZnRlckxvZ2luID0gdGhpcy5wcm9wcy5pbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbjtcbiAgICAgICAgaWYgKGluaXRpYWxTY3JlZW5BZnRlckxvZ2luICYmXG4gICAgICAgICAgICAvLyBYWFg6IHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzExNjQzIGNhdXNpbmcgYSBsb2dpbi1sb29wXG4gICAgICAgICAgICAhW1wid2VsY29tZVwiLCBcImxvZ2luXCIsIFwicmVnaXN0ZXJcIiwgXCJzdGFydF9zc29cIiwgXCJzdGFydF9jYXNcIl0uaW5jbHVkZXMoaW5pdGlhbFNjcmVlbkFmdGVyTG9naW4uc2NyZWVuKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGZyYWdtZW50QWZ0ZXJMb2dpbiA9IGAvJHtpbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW59YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhZ21lbnRBZnRlckxvZ2luO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnRBZnRlckxvZ2luID0gdGhpcy5nZXRGcmFnbWVudEFmdGVyTG9naW4oKTtcbiAgICAgICAgbGV0IHZpZXcgPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkxPQURJTkcpIHtcbiAgICAgICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5TcGlubmVyJyk7XG4gICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWF0cml4Q2hhdF9zcGxhc2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5DT01QTEVURV9TRUNVUklUWSkge1xuICAgICAgICAgICAgY29uc3QgQ29tcGxldGVTZWN1cml0eSA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuYXV0aC5Db21wbGV0ZVNlY3VyaXR5Jyk7XG4gICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgIDxDb21wbGV0ZVNlY3VyaXR5XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25Db21wbGV0ZVNlY3VyaXR5RTJlU2V0dXBGaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkUyRV9TRVRVUCkge1xuICAgICAgICAgICAgY29uc3QgRTJlU2V0dXAgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguRTJlU2V0dXAnKTtcbiAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPEUyZVNldHVwXG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25Db21wbGV0ZVNlY3VyaXR5RTJlU2V0dXBGaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudFBhc3N3b3JkPXt0aGlzLmFjY291bnRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgdG9rZW5Mb2dpbj17ISF0aGlzLnRva2VuTG9naW59XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5MT0dHRURfSU4pIHtcbiAgICAgICAgICAgIC8vIHN0b3JlIGVycm9ycyBzdG9wIHRoZSBjbGllbnQgc3luY2luZyBhbmQgcmVxdWlyZSB1c2VyIGludGVydmVudGlvbiwgc28gd2UnbGxcbiAgICAgICAgICAgIC8vIGJlIHNob3dpbmcgYSBkaWFsb2cuIERvbid0IHNob3cgYW55dGhpbmcgZWxzZS5cbiAgICAgICAgICAgIGNvbnN0IGlzU3RvcmVFcnJvciA9IHRoaXMuc3RhdGUuc3luY0Vycm9yICYmIHRoaXMuc3RhdGUuc3luY0Vycm9yIGluc3RhbmNlb2YgSW52YWxpZFN0b3JlRXJyb3I7XG5cbiAgICAgICAgICAgIC8vIGByZWFkeWAgYW5kIGB2aWV3PT1MT0dHRURfSU5gIG1heSBiZSBzZXQgYmVmb3JlIGBwYWdlX3R5cGVgIChiZWNhdXNlIHRoZVxuICAgICAgICAgICAgLy8gbGF0dGVyIGlzIHNldCB2aWEgdGhlIGRpc3BhdGNoZXIpLiBJZiB3ZSBkb24ndCB5ZXQgaGF2ZSBhIGBwYWdlX3R5cGVgLFxuICAgICAgICAgICAgLy8ga2VlcCBzaG93aW5nIHRoZSBzcGlubmVyIGZvciBub3cuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWFkeSAmJiB0aGlzLnN0YXRlLnBhZ2VfdHlwZSAmJiAhaXNTdG9yZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgLyogZm9yIG5vdywgd2Ugc3R1ZmYgdGhlIGVudGlyZXR5IG9mIG91ciBwcm9wcyBhbmQgc3RhdGUgaW50byB0aGUgTG9nZ2VkSW5WaWV3LlxuICAgICAgICAgICAgICAgICAqIHdlIHNob3VsZCBnbyB0aHJvdWdoIGFuZCBmaWd1cmUgb3V0IHdoYXQgd2UgYWN0dWFsbHkgbmVlZCB0byBwYXNzIGRvd24sIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgKiBhcyB1c2luZyBzb21ldGhpbmcgbGlrZSByZWR1eCB0byBhdm9pZCBoYXZpbmcgYSBiaWxsaW9uIGJpdHMgb2Ygc3RhdGUga2lja2luZyBhcm91bmQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgTG9nZ2VkSW5WaWV3ID0gc2RrLmdldENvbXBvbmVudCgnc3RydWN0dXJlcy5Mb2dnZWRJblZpZXcnKTtcbiAgICAgICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgICAgICA8TG9nZ2VkSW5WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi50aGlzLnN0YXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmxvZ2dlZEluVmlld31cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudD17TWF0cml4Q2xpZW50UGVnLmdldCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Sb29tQ3JlYXRlZD17dGhpcy5vblJvb21DcmVhdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbG9zZUFsbFNldHRpbmdzPXt0aGlzLm9uQ2xvc2VBbGxTZXR0aW5nc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVnaXN0ZXJlZD17dGhpcy5vblJlZ2lzdGVyZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um9vbUlkPXt0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgdGhpbmsgd2UgYXJlIGxvZ2dlZCBpbiwgYnV0IGFyZSBzdGlsbCB3YWl0aW5nIGZvciB0aGUgL3N5bmMgdG8gY29tcGxldGVcbiAgICAgICAgICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3Bpbm5lcicpO1xuICAgICAgICAgICAgICAgIGxldCBlcnJvckJveDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zeW5jRXJyb3IgJiYgIWlzU3RvcmVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckJveCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTWF0cml4Q2hhdF9zeW5jRXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHttZXNzYWdlRm9yU3luY0Vycm9yKHRoaXMuc3RhdGUuc3luY0Vycm9yKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01hdHJpeENoYXRfc3BsYXNoXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZXJyb3JCb3h9XG4gICAgICAgICAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzc05hbWU9XCJteF9NYXRyaXhDaGF0X3NwbGFzaEJ1dHRvbnNcIiBvbkNsaWNrPXt0aGlzLm9uTG9nb3V0Q2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdCgnTG9nb3V0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5XRUxDT01FKSB7XG4gICAgICAgICAgICBjb25zdCBXZWxjb21lID0gc2RrLmdldENvbXBvbmVudCgnYXV0aC5XZWxjb21lJyk7XG4gICAgICAgICAgICB2aWV3ID0gPFdlbGNvbWUgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5SRUdJU1RFUiAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5SZWdpc3RyYXRpb24pKSB7XG4gICAgICAgICAgICBjb25zdCBSZWdpc3RyYXRpb24gPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguUmVnaXN0cmF0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBlbWFpbCA9IFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UucGlja0Jlc3RJbnZpdGUoKT8udG9FbWFpbDtcbiAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPFJlZ2lzdHJhdGlvblxuICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ9e3RoaXMuc3RhdGUucmVnaXN0ZXJfY2xpZW50X3NlY3JldH1cbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkPXt0aGlzLnN0YXRlLnJlZ2lzdGVyX3Nlc3Npb25faWR9XG4gICAgICAgICAgICAgICAgICAgIGlkU2lkPXt0aGlzLnN0YXRlLnJlZ2lzdGVyX2lkX3NpZH1cbiAgICAgICAgICAgICAgICAgICAgZW1haWw9e2VtYWlsfVxuICAgICAgICAgICAgICAgICAgICBicmFuZD17dGhpcy5wcm9wcy5jb25maWcuYnJhbmR9XG4gICAgICAgICAgICAgICAgICAgIG1ha2VSZWdpc3RyYXRpb25Vcmw9e3RoaXMubWFrZVJlZ2lzdHJhdGlvblVybH1cbiAgICAgICAgICAgICAgICAgICAgb25Mb2dnZWRJbj17dGhpcy5vblJlZ2lzdGVyRmxvd0NvbXBsZXRlfVxuICAgICAgICAgICAgICAgICAgICBvbkxvZ2luQ2xpY2s9e3RoaXMub25Mb2dpbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvblNlcnZlckNvbmZpZ0NoYW5nZT17dGhpcy5vblNlcnZlckNvbmZpZ0NoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERldmljZURpc3BsYXlOYW1lPXt0aGlzLnByb3BzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBZnRlckxvZ2luPXtmcmFnbWVudEFmdGVyTG9naW59XG4gICAgICAgICAgICAgICAgICAgIHsuLi50aGlzLmdldFNlcnZlclByb3BlcnRpZXMoKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkZPUkdPVF9QQVNTV09SRCAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5QYXNzd29yZFJlc2V0KSkge1xuICAgICAgICAgICAgY29uc3QgRm9yZ290UGFzc3dvcmQgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguRm9yZ290UGFzc3dvcmQnKTtcbiAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPEZvcmdvdFBhc3N3b3JkXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGU9e3RoaXMub25Mb2dpbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbkxvZ2luQ2xpY2s9e3RoaXMub25Mb2dpbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvblNlcnZlckNvbmZpZ0NoYW5nZT17dGhpcy5vblNlcnZlckNvbmZpZ0NoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VydmVyUHJvcGVydGllcygpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmlldyA9PT0gVmlld3MuTE9HSU4pIHtcbiAgICAgICAgICAgIGNvbnN0IHNob3dQYXNzd29yZFJlc2V0ID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuUGFzc3dvcmRSZXNldCk7XG4gICAgICAgICAgICBjb25zdCBMb2dpbiA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuYXV0aC5Mb2dpbicpO1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8TG9naW5cbiAgICAgICAgICAgICAgICAgICAgaXNTeW5jaW5nPXt0aGlzLnN0YXRlLnBlbmRpbmdJbml0aWFsU3luY31cbiAgICAgICAgICAgICAgICAgICAgb25Mb2dnZWRJbj17dGhpcy5vblVzZXJDb21wbGV0ZWRMb2dpbkZsb3d9XG4gICAgICAgICAgICAgICAgICAgIG9uUmVnaXN0ZXJDbGljaz17dGhpcy5vblJlZ2lzdGVyQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrSHNVcmw9e3RoaXMuZ2V0RmFsbGJhY2tIc1VybCgpfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU9e3RoaXMucHJvcHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkZvcmdvdFBhc3N3b3JkQ2xpY2s9e3Nob3dQYXNzd29yZFJlc2V0ID8gdGhpcy5vbkZvcmdvdFBhc3N3b3JkQ2xpY2sgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlPXt0aGlzLm9uU2VydmVyQ29uZmlnQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e2ZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VydmVyUHJvcGVydGllcygpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmlldyA9PT0gVmlld3MuU09GVF9MT0dPVVQpIHtcbiAgICAgICAgICAgIGNvbnN0IFNvZnRMb2dvdXQgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguU29mdExvZ291dCcpO1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8U29mdExvZ291dFxuICAgICAgICAgICAgICAgICAgICByZWFsUXVlcnlQYXJhbXM9e3RoaXMucHJvcHMucmVhbFF1ZXJ5UGFyYW1zfVxuICAgICAgICAgICAgICAgICAgICBvblRva2VuTG9naW5Db21wbGV0ZWQ9e3RoaXMucHJvcHMub25Ub2tlbkxvZ2luQ29tcGxldGVkfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e2ZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gdmlldyAke3RoaXMuc3RhdGUudmlld31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEVycm9yQm91bmRhcnkgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5FcnJvckJvdW5kYXJ5Jyk7XG4gICAgICAgIHJldHVybiA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgIHt2aWV3fVxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+O1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTG9nZ2VkSW4oKTogYm9vbGVhbiB7XG4gICAgLy8gSlJTOiBNYXliZSB3ZSBzaG91bGQgbW92ZSB0aGUgc3RlcCB0aGF0IHdyaXRlcyB0aGlzIHRvIHRoZSB3aW5kb3cgb3V0IG9mXG4gICAgLy8gYGVsZW1lbnQtd2ViYCBhbmQgaW50byB0aGlzIGZpbGU/IEJldHRlciB5ZXQsIHdlIHNob3VsZCBwcm9iYWJseSBjcmVhdGUgYVxuICAgIC8vIHN0b3JlIHRvIGhvbGQgdGhpcyBzdGF0ZS5cbiAgICAvLyBTZWUgYWxzbyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNTAzNC5cbiAgICBjb25zdCBhcHAgPSB3aW5kb3cubWF0cml4Q2hhdDtcbiAgICByZXR1cm4gYXBwICYmIChhcHAgYXMgTWF0cml4Q2hhdCkuc3RhdGUudmlldyA9PT0gVmlld3MuTE9HR0VEX0lOO1xufVxuIl19