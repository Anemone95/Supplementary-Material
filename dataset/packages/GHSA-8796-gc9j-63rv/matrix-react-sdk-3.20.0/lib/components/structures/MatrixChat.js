"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLoggedIn = isLoggedIn;
exports.default = exports.Views = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard3(require("react"));

var _matrix = require("matrix-js-sdk/src/matrix");

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

var _pages = require("../../utils/pages");

var _SpaceStore = _interopRequireDefault(require("../../stores/SpaceStore"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _RoomListStore = _interopRequireDefault(require("../../stores/room-list/RoomListStore"));

var _models = require("../../stores/room-list/models");

var _Security = _interopRequireDefault(require("../../customisations/Security"));

var _dec, _class, _class2, _temp;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
let MatrixChat = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.MatrixChat"), _dec(_class = (_temp = _class2 = class MatrixChat extends _react.default.PureComponent
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
          _dispatcher.default.dispatch({
            action: "hangup_all"
          });

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

          this.viewLogin();
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
            if (_SpaceStore.default.instance.activeSpace) {
              _dispatcher.default.dispatch({
                action: "view_room",
                room_id: _SpaceStore.default.instance.activeSpace.roomId
              });
            } else {
              const RoomDirectory = sdk.getComponent("structures.RoomDirectory");

              _Modal.default.createTrackedDialog('Room directory', '', RoomDirectory, {
                initialText: payload.initialText
              }, 'mx_RoomDirectory_dialogWrapper', false, true);
            } // View the welcome or home page if we need something to look at


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
      if (_Security.default.SHOW_ENCRYPTION_SETUP_UI === false) {
        this.onLoggedIn();
      } else {
        this.setStateForNewView({
          view: Views.COMPLETE_SECURITY
        });
      }
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
        ready: true,
        roomJustCreatedOpts: roomInfo.justCreatedOpts
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
    if ((0, _pages.shouldUseLoginForWelcome)(_SdkConfig.default.get())) {
      return this.viewLogin();
    }

    this.setStateForNewView({
      view: Views.WELCOME
    });
    this.notifyNewScreen('welcome');
    _ThemeController.default.isLogin = true;
    this.themeWatcher.recheck();
  }

  viewLogin(otherState
  /*: any*/
  ) {
    this.setStateForNewView(_objectSpread({
      view: Views.LOGIN
    }, otherState));
    this.notifyNewScreen('login');
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
    const roomToLeave = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    const isSpace = roomToLeave?.isSpaceRoom(); // Show a warning if there are additional complications.

    const warnings = [];
    const memberCount = roomToLeave.currentState.getJoinedMemberCount();

    if (memberCount === 1) {
      warnings.push( /*#__PURE__*/_react.default.createElement("span", {
        className: "warning",
        key: "only_member_warning"
      }, ' '
      /* Whitespace, otherwise the sentences get smashed together */
      , (0, _languageHandler._t)("You are the only person here. " + "If you leave, no one will be able to join in the future, including you.")));
      return warnings;
    }

    const joinRules = roomToLeave.currentState.getStateEvents('m.room.join_rules', '');

    if (joinRules) {
      const rule = joinRules.getContent().join_rule;

      if (rule !== "public") {
        warnings.push( /*#__PURE__*/_react.default.createElement("span", {
          className: "warning",
          key: "non_public_warning"
        }, ' '
        /* Whitespace, otherwise the sentences get smashed together */
        , isSpace ? (0, _languageHandler._t)("This space is not public. You will not be able to rejoin without an invite.") : (0, _languageHandler._t)("This room is not public. You will not be able to rejoin without an invite.")));
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
    const isSpace = roomToLeave?.isSpaceRoom();

    _Modal.default.createTrackedDialog(isSpace ? "Leave space" : "Leave room", '', QuestionDialog, {
      title: isSpace ? (0, _languageHandler._t)("Leave space") : (0, _languageHandler._t)("Leave room"),
      description: /*#__PURE__*/_react.default.createElement("span", null, isSpace ? (0, _languageHandler._t)("Are you sure you want to leave the space '%(spaceName)s'?", {
        spaceName: roomToLeave.name
      }) : (0, _languageHandler._t)("Are you sure you want to leave the room '%(roomName)s'?", {
        roomName: roomToLeave.name
      }), warnings),
      button: (0, _languageHandler._t)("Leave"),
      onFinished: shouldLeave => {
        if (shouldLeave) {
          const d = (0, _membership.leaveRoomBehaviour)(roomId); // FIXME: controller shouldn't be loading a view :(

          const Loader = sdk.getComponent("elements.Spinner");

          const modal = _Modal.default.createDialog(Loader, null, 'mx_Dialog_spinner');

          d.finally(() => modal.close());

          _dispatcher.default.dispatch({
            action: "after_leave_room",
            room_id: roomId
          });
        }
      }
    });
  }

  forgetRoom(roomId
  /*: string*/
  ) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    _MatrixClientPeg.MatrixClientPeg.get().forget(roomId).then(() => {
      // Switch to home page if we're currently viewing the forgotten room
      if (this.state.currentRoomId === roomId) {
        _dispatcher.default.dispatch({
          action: "view_home_page"
        });
      } // We have to manually update the room list because the forgotten room will not
      // be notified to us, therefore the room list will have no other way of knowing
      // the room is forgotten.


      _RoomListStore.default.instance.manualRoomUpdate(room, _models.RoomUpdateCause.RoomRemoved);
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
    this.viewLogin({
      ready: false,
      collapseLhs: false,
      currentRoomId: null
    });
    this.subTitleStatus = '';
    this.setPageSubtitle();
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
          title: (0, _languageHandler._t)("Verification requested"),
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
        cli = (0, _matrix.createClient)({
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

}, (0, _defineProperty2.default)(_class2, "displayName", "MatrixChat"), (0, _defineProperty2.default)(_class2, "defaultProps", {
  realQueryParams: {},
  startingFragmentQueryParams: {},
  config: {},
  onTokenLoginCompleted: () => {}
}), _temp)) || _class);
exports.default = MatrixChat;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTWF0cml4Q2hhdC50c3giXSwibmFtZXMiOlsiVmlld3MiLCJBVVRIX1NDUkVFTlMiLCJPTkJPQVJESU5HX0ZMT1dfU1RBUlRFUlMiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwiTWF0cml4Q2hhdCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwicGF5bG9hZCIsIlF1ZXN0aW9uRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiaXNHdWVzdCIsImluY2x1ZGVzIiwiYWN0aW9uIiwiZGlzIiwiZGlzcGF0Y2giLCJkZWZlcnJlZF9hY3Rpb24iLCJldmVudF90eXBlIiwiZnVsbFVybCIsImV2ZW50X2NvbnRlbnQiLCJzZXRJZGVudGl0eVNlcnZlclVybCIsImxvY2FsU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJzZXRJdGVtIiwiTGlmZWN5Y2xlIiwibG9nb3V0IiwiaXNTb2Z0TG9nb3V0Iiwib25Tb2Z0TG9nb3V0Iiwic2NyZWVuQWZ0ZXJMb2dpbiIsInN0YXJ0UmVnaXN0cmF0aW9uIiwicGFyYW1zIiwidmlld0xvZ2luIiwic2V0U3RhdGVGb3JOZXdWaWV3IiwidmlldyIsIkZPUkdPVF9QQVNTV09SRCIsIm5vdGlmeU5ld1NjcmVlbiIsImRtVXNlcklkIiwidXNlcl9pZCIsImxlYXZlUm9vbSIsInJvb21faWQiLCJmb3JnZXRSb29tIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm9uRmluaXNoZWQiLCJjb25maXJtIiwiTG9hZGVyIiwibW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJsZWF2ZSIsInRoZW4iLCJjbG9zZSIsInN0YXRlIiwiY3VycmVudFJvb21JZCIsImVyciIsIkVycm9yRGlhbG9nIiwidG9TdHJpbmciLCJ2aWV3VXNlciIsInVzZXJJZCIsInN1YkFjdGlvbiIsInByb21pc2UiLCJ2aWV3Um9vbSIsInRhYlBheWxvYWQiLCJVc2VyU2V0dGluZ3NEaWFsb2ciLCJpbml0aWFsVGFiSWQiLCJ2aWV3U29tZXRoaW5nQmVoaW5kTW9kYWwiLCJjcmVhdGVSb29tIiwicHVibGljIiwiQ3JlYXRlR3JvdXBEaWFsb2ciLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJDcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2ciLCJWaWV3Um9vbURpcmVjdG9yeSIsIlNwYWNlU3RvcmUiLCJpbnN0YW5jZSIsImFjdGl2ZVNwYWNlIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJyb29tSWQiLCJSb29tRGlyZWN0b3J5IiwiaW5pdGlhbFRleHQiLCJzZXRQYWdlIiwiUGFnZVR5cGVzIiwiTXlHcm91cHMiLCJ2aWV3R3JvdXAiLCJ2aWV3V2VsY29tZSIsInZpZXdIb21lIiwianVzdFJlZ2lzdGVyZWQiLCJjaGF0Q3JlYXRlT3JSZXVzZSIsInNob3dTY3JlZW5BZnRlckxvZ2luIiwicGFnZV90eXBlIiwic2V0U3RhdGUiLCJjb2xsYXBzZUxocyIsInJlc2l6ZU5vdGlmaWVyIiwibm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQiLCJPcGVuRGlhbFBhZCIsIkRpYWxQYWRNb2RhbCIsInRva2VuTG9naW4iLCJMT0dJTiIsIlJFR0lTVEVSIiwiQ09NUExFVEVfU0VDVVJJVFkiLCJFMkVfU0VUVVAiLCJvbkxvZ2dlZEluIiwib25Mb2dnZWRPdXQiLCJyZWFkeSIsIm9uV2lsbFN0YXJ0Q2xpZW50Iiwib25DbGllbnRTdGFydGVkIiwib25TZW5kRXZlbnQiLCJldmVudCIsImhpZGVUb1NSVXNlcnMiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIkFuYWx5dGljcyIsImNhbkVuYWJsZSIsImVuYWJsZSIsIkNvdW50bHlBbmFseXRpY3MiLCJoaWRlTGhzVGhyZXNob2xkIiwic2hvd0xoc1RocmVzaG9sZCIsIndpbmRvd1dpZHRoIiwid2luZG93IiwiaW5uZXJXaWR0aCIsIm5vdGlmeVdpbmRvd1Jlc2l6ZWQiLCJzaG93U2NyZWVuIiwiY3JlZGVudGlhbHMiLCJwYXNzd29yZCIsIm9uVXNlckNvbXBsZXRlZExvZ2luRmxvdyIsInNlcnZlckNvbmZpZyIsInN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcyIsInJlZmVycmVyIiwibWFrZVJlZ2lzdHJhdGlvblVybCIsImFjY291bnRQYXNzd29yZCIsImFjY291bnRQYXNzd29yZFRpbWVyIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsInNldExvZ2dlZEluIiwicG9zdExvZ2luU2V0dXAiLCJMT0FESU5HIiwic3luY0Vycm9yIiwiUmVzaXplTm90aWZpZXIiLCJsb2dnZWRJblZpZXciLCJTZGtDb25maWciLCJwdXQiLCJjb25maWciLCJmaXJzdFN5bmNDb21wbGV0ZSIsImZpcnN0U3luY1Byb21pc2UiLCJzeW5jX3RpbWVsaW5lX2xpbWl0Iiwib3B0cyIsImluaXRpYWxTeW5jTGltaXQiLCJpbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbiIsInNjcmVlbiIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJsZW5ndGgiLCJUaHJlZXBpZEludml0ZVN0b3JlIiwic3RvcmVJbnZpdGUiLCJoYW5kbGVSZXNpemUiLCJhZGRFdmVudExpc3RlbmVyIiwicGFnZUNoYW5naW5nIiwiVGludGVyIiwidGludCIsIm9uIiwiZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSIsImxvYWRTZXNzaW9uIiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJ0aGVtZVdhdGNoZXIiLCJUaGVtZVdhdGNoZXIiLCJmb250V2F0Y2hlciIsIkZvbnRXYXRjaGVyIiwic3RhcnQiLCJmb2N1c0NvbXBvc2VyIiwic3ViVGl0bGVTdGF0dXMiLCJvbkFsaWFzQ2xpY2siLCJsaW5raWZ5TWF0cml4Iiwib25Vc2VyQ2xpY2siLCJvbkdyb3VwQ2xpY2siLCJhdHRlbXB0VG9rZW5Mb2dpbiIsInJlYWxRdWVyeVBhcmFtcyIsImRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSIsImdldEZyYWdtZW50QWZ0ZXJMb2dpbiIsImxvZ2dlZEluIiwibG9naW5Ub2tlbiIsIm9uVG9rZW5Mb2dpbkNvbXBsZXRlZCIsInJlc3RvcmVGcm9tTG9jYWxTdG9yYWdlIiwiaWdub3JlR3Vlc3QiLCJmaXJzdFNjcmVlbiIsImNsaSIsImNyeXB0b0VuYWJsZWQiLCJpc0NyeXB0b0VuYWJsZWQiLCJwcm9taXNlc0xpc3QiLCJwdXNoIiwiZG93bmxvYWRLZXlzIiwiZ2V0VXNlcklkIiwicGVuZGluZ0luaXRpYWxTeW5jIiwiUHJvbWlzZSIsImFsbCIsImNyb3NzU2lnbmluZ0lzU2V0VXAiLCJnZXRTdG9yZWRDcm9zc1NpZ25pbmdGb3JVc2VyIiwiU2VjdXJpdHlDdXN0b21pc2F0aW9ucyIsIlNIT1dfRU5DUllQVElPTl9TRVRVUF9VSSIsImRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxVcGRhdGUiLCJzaG91bGRUcmFja1BhZ2VDaGFuZ2UiLCJzdGFydFBhZ2VDaGFuZ2VUaW1lciIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsImR1cmF0aW9uTXMiLCJzdG9wUGFnZUNoYW5nZVRpbWVyIiwidHJhY2tQYWdlQ2hhbmdlIiwiZmlyZSIsIkZvY3VzQ29tcG9zZXIiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInN0b3BNYXRyaXhDbGllbnQiLCJ1bnJlZ2lzdGVyIiwic3RvcCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImdldEZhbGxiYWNrSHNVcmwiLCJpc0RlZmF1bHQiLCJmYWxsYmFja19oc191cmwiLCJnZXRTZXJ2ZXJQcm9wZXJ0aWVzIiwicmVzb2x2ZSIsImZyYWdtZW50UXVlcnlQYXJhbXMiLCJlbmFibGVHdWVzdCIsImd1ZXN0SHNVcmwiLCJoc1VybCIsImd1ZXN0SXNVcmwiLCJpc1VybCIsImxvYWRlZFNlc3Npb24iLCJwaWNrQmVzdEludml0ZSIsInBlcmZvcm1hbmNlIiwibWFyayIsImNvbnNvbGUiLCJ3YXJuIiwibWVhc3VyZSIsImNsZWFyTWFya3MiLCJtZWFzdXJlbWVudCIsImdldEVudHJpZXNCeU5hbWUiLCJwb3AiLCJkdXJhdGlvbiIsInVuZGVmaW5lZCIsIkVycm9yIiwibmV3U3RhdGUiLCJjdXJyZW50VXNlcklkIiwiT2JqZWN0IiwiYXNzaWduIiwicGFnZVR5cGUiLCJjbGllbnRfc2VjcmV0Iiwic2Vzc2lvbl9pZCIsImhzX3VybCIsImlzX3VybCIsInNpZCIsIkF1dG9EaXNjb3ZlcnlVdGlscyIsInZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMiLCJyZWdpc3Rlcl9jbGllbnRfc2VjcmV0IiwicmVnaXN0ZXJfc2Vzc2lvbl9pZCIsInJlZ2lzdGVyX2lkX3NpZCIsIlRoZW1lQ29udHJvbGxlciIsImlzTG9naW4iLCJyZWNoZWNrIiwicm9vbUluZm8iLCJyb29tX2FsaWFzIiwibG9nIiwiZXZlbnRfaWQiLCJ3YWl0Rm9yIiwicHJlc2VudGVkSWQiLCJyb29tIiwiZ2V0Um9vbSIsInRoZUFsaWFzIiwiUm9vbXMiLCJnZXREaXNwbGF5QWxpYXNGb3JSb29tIiwicmVwbGFjZUxhc3QiLCJoaWdobGlnaHRlZCIsIkxPR0dFRF9JTiIsIlJvb21WaWV3IiwidGhyZWVwaWRJbnZpdGUiLCJ0aHJlZXBpZF9pbnZpdGUiLCJyb29tT29iRGF0YSIsIm9vYl9kYXRhIiwicm9vbUp1c3RDcmVhdGVkT3B0cyIsImp1c3RDcmVhdGVkT3B0cyIsImdyb3VwSWQiLCJncm91cF9pZCIsImN1cnJlbnRHcm91cElkIiwiY3VycmVudEdyb3VwSXNOZXciLCJncm91cF9pc19uZXciLCJHcm91cFZpZXciLCJXRUxDT01FIiwib3RoZXJTdGF0ZSIsIkhvbWVQYWdlIiwid2FpdEZvclN5bmMiLCJVc2VyVmlldyIsImRlZmF1bHRQdWJsaWMiLCJjb21tdW5pdHlJZCIsIkNvbW11bml0eVByb3RvdHlwZVN0b3JlIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCIsImlzQWRtaW5PZiIsIkNyZWF0ZVJvb21EaWFsb2ciLCJzaG91bGRDcmVhdGUiLCJmaW5pc2hlZCIsIndlbGNvbWVVc2VySWQiLCJnb193ZWxjb21lX29uX2NhbmNlbCIsInNjcmVlbl9hZnRlciIsImNsaWVudCIsImRtUm9vbU1hcCIsIkRNUm9vbU1hcCIsImRtUm9vbXMiLCJnZXRETVJvb21zRm9yVXNlcklkIiwibGVhdmVSb29tV2FybmluZ3MiLCJyb29tVG9MZWF2ZSIsImlzU3BhY2UiLCJpc1NwYWNlUm9vbSIsIndhcm5pbmdzIiwibWVtYmVyQ291bnQiLCJjdXJyZW50U3RhdGUiLCJnZXRKb2luZWRNZW1iZXJDb3VudCIsImpvaW5SdWxlcyIsImdldFN0YXRlRXZlbnRzIiwicnVsZSIsImdldENvbnRlbnQiLCJqb2luX3J1bGUiLCJzcGFjZU5hbWUiLCJuYW1lIiwicm9vbU5hbWUiLCJidXR0b24iLCJzaG91bGRMZWF2ZSIsImQiLCJmaW5hbGx5IiwiZm9yZ2V0IiwiUm9vbUxpc3RTdG9yZSIsIm1hbnVhbFJvb21VcGRhdGUiLCJSb29tVXBkYXRlQ2F1c2UiLCJSb29tUmVtb3ZlZCIsImNhdGNoIiwiZXJyQ29kZSIsImVycmNvZGUiLCJtZXNzYWdlIiwic3RhcnRXZWxjb21lVXNlckNoYXQiLCJ3ZWxjb21lVXNlclJvb21zIiwic2hhcmVkIiwiYW5kVmlldyIsInNwaW5uZXIiLCJzYXZlV2VsY29tZVVzZXIiLCJldiIsImdldFR5cGUiLCJzdG9yZSIsInNhdmUiLCJjdXJyZW50VXNlcklzSnVzdFJlZ2lzdGVyZWQiLCJzZXRKdXN0UmVnaXN0ZXJlZFVzZXJJZCIsIndlbGNvbWVVc2VyUm9vbSIsInRyYW5zbGF0ZVRvV2lyZUZvcm1hdCIsIlN0b3JhZ2VNYW5hZ2VyIiwidHJ5UGVyc2lzdFN0b3JhZ2UiLCJwaXdpayIsInBvbGljeVVybCIsIm1vYmlsZUd1aWRlVG9hc3QiLCJnZXRJdGVtIiwidmlld0xhc3RSb29tIiwic2V0UGFnZVN1YnRpdGxlIiwiU09GVF9MT0dPVVQiLCJzZXRDYW5SZXNldFRpbWVsaW5lQ2FsbGJhY2siLCJjdXJyZW50IiwiY2FuUmVzZXRUaW1lbGluZUluUm9vbSIsImRhdGEiLCJlcnJvciIsIkludmFsaWRTdG9yZUVycm9yIiwiaGFuZGxlSW52YWxpZFN0b3JlRXJyb3IiLCJ1cGRhdGVTdGF0dXNJbmRpY2F0b3IiLCJpbmZvIiwiTm90aWZpZXIiLCJzaG91bGRTaG93UHJvbXB0IiwidXNlclJlZ2lzdGVyZWRXaXRoaW5MYXN0SG91cnMiLCJlcnJPYmoiLCJpc0xvZ2dpbmdPdXQiLCJjbG9zZUN1cnJlbnRNb2RhbCIsImh0dHBTdGF0dXMiLCJzb2Z0TG9nb3V0IiwiY29uc2VudFVyaSIsImhvbWVzZXJ2ZXJEb21haW4iLCJnZXREb21haW4iLCJjYW5jZWxCdXR0b24iLCJjb25maXJtZWQiLCJ3bmQiLCJvcGVuIiwib3BlbmVyIiwiZGZ0IiwiRGVjcnlwdGlvbkZhaWx1cmVUcmFja2VyIiwidG90YWwiLCJlcnJvckNvZGUiLCJ0cmFja0V2ZW50IiwidHJhY2siLCJzdW0iLCJlIiwiZXZlbnREZWNyeXB0ZWQiLCJibGFja2xpc3RFbmFibGVkIiwiZ2V0VmFsdWVBdCIsIlJPT01fREVWSUNFIiwic2V0QmxhY2tsaXN0VW52ZXJpZmllZERldmljZXMiLCJ0eXBlIiwiYnJhbmQiLCJoYXZlTmV3VmVyc2lvbiIsIm5ld1ZlcnNpb25JbmZvIiwiZ2V0S2V5QmFja3VwRW5hYmxlZCIsImdldEtleUJhY2t1cFZlcnNpb24iLCJjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMiLCJmYWlsdXJlcyIsInNvdXJjZSIsImNvbnRpbnVhdGlvbiIsIktleVNpZ25hdHVyZVVwbG9hZEZhaWxlZERpYWxvZyIsInJlcXVlc3QiLCJ2ZXJpZmllciIsIkluY29taW5nU2FzRGlhbG9nIiwicGVuZGluZyIsIlRvYXN0U3RvcmUiLCJzaGFyZWRJbnN0YW5jZSIsImFkZE9yUmVwbGFjZVRvYXN0Iiwia2V5IiwiY2hhbm5lbCIsInRyYW5zYWN0aW9uSWQiLCJpY29uIiwiY29tcG9uZW50IiwicHJpb3JpdHkiLCJjb2xvclNjaGVtZSIsInByaW1hcnlfY29sb3IiLCJzZWNvbmRhcnlfY29sb3IiLCJzZXRHbG9iYWxCbGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlcyIsInNldEdsb2JhbEVycm9yT25Vbmtub3duRGV2aWNlcyIsImlzTG9nZ2VkT3V0T3JHdWVzdCIsImJhc2VVcmwiLCJpZEJhc2VVcmwiLCJQbGF0Zm9ybVBlZyIsInN0YXJ0U2luZ2xlU2lnbk9uIiwiaW5kZXhPZiIsImRvbWFpbk9mZnNldCIsImV2ZW50T2Zmc2V0Iiwicm9vbVN0cmluZyIsImV2ZW50SWQiLCJzaWdudXJsIiwiZW1haWwiLCJpbnZpdGVzIiwiZ2V0SW52aXRlcyIsImZpbmQiLCJpbnZpdGUiLCJ2aWEiLCJ2aWFfc2VydmVycyIsIkJvb2xlYW4iLCJhdmF0YXJVcmwiLCJyb29tQXZhdGFyVXJsIiwiaW52aXRlck5hbWUiLCJvbk5ld1NjcmVlbiIsImFsaWFzIiwicHJldmVudERlZmF1bHQiLCJtZW1iZXIiLCJSb29tTWVtYmVyIiwiVmlld1VzZXIiLCJvbkxvZ291dENsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwib25Sb29tQ3JlYXRlZCIsIm9uUmVnaXN0ZXJlZCIsInNlbmRFdmVudCIsInN1YnRpdGxlIiwiZG9jdW1lbnQiLCJub3RpZmljYXRpb25TdGF0ZSIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiZ2xvYmFsU3RhdGUiLCJudW1VbnJlYWRSb29tcyIsIm51bVVucmVhZFN0YXRlcyIsInNldEVycm9yU3RhdHVzIiwic2V0Tm90aWZpY2F0aW9uQ291bnQiLCJvbkNsb3NlQWxsU2V0dGluZ3MiLCJmcmFnbWVudEFmdGVyTG9naW4iLCJyZW5kZXIiLCJTcGlubmVyIiwiQ29tcGxldGVTZWN1cml0eSIsIm9uQ29tcGxldGVTZWN1cml0eUUyZVNldHVwRmluaXNoZWQiLCJFMmVTZXR1cCIsImlzU3RvcmVFcnJvciIsIkxvZ2dlZEluVmlldyIsImVycm9yQm94IiwiV2VsY29tZSIsIlVJRmVhdHVyZSIsIlJlZ2lzdHJhdGlvbiIsInRvRW1haWwiLCJvblJlZ2lzdGVyRmxvd0NvbXBsZXRlIiwib25Mb2dpbkNsaWNrIiwib25TZXJ2ZXJDb25maWdDaGFuZ2UiLCJQYXNzd29yZFJlc2V0IiwiRm9yZ290UGFzc3dvcmQiLCJzaG93UGFzc3dvcmRSZXNldCIsIkxvZ2luIiwib25SZWdpc3RlckNsaWNrIiwib25Gb3Jnb3RQYXNzd29yZENsaWNrIiwiU29mdExvZ291dCIsIkVycm9yQm91bmRhcnkiLCJpc0xvZ2dlZEluIiwiYXBwIiwibWF0cml4Q2hhdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUlBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7OztBQUVBO0lBQ1lBLEs7OztXQUFBQSxLO0FBQUFBLEVBQUFBLEssQ0FBQUEsSztBQUFBQSxFQUFBQSxLLENBQUFBLEs7QUFBQUEsRUFBQUEsSyxDQUFBQSxLO0FBQUFBLEVBQUFBLEssQ0FBQUEsSztBQUFBQSxFQUFBQSxLLENBQUFBLEs7QUFBQUEsRUFBQUEsSyxDQUFBQSxLO0FBQUFBLEVBQUFBLEssQ0FBQUEsSztBQUFBQSxFQUFBQSxLLENBQUFBLEs7QUFBQUEsRUFBQUEsSyxDQUFBQSxLO0dBQUFBLEsscUJBQUFBLEs7O0FBZ0NaLE1BQU1DLFlBQVksR0FBRyxDQUFDLFVBQUQsRUFBYSxP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RUFBRSxFQUhVO0FBSWxCeUMsRUFBQUEscUJBQXFCLEVBQUUsTUFBTSxDQUFFO0FBSmIsQzs7O0FBdzJEbkIsU0FBU3lULFVBQVQ7QUFBQTtBQUErQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU1DLEdBQUcsR0FBRzFYLE1BQU0sQ0FBQzJYLFVBQW5CO0FBQ0EsU0FBT0QsR0FBRyxJQUFLQSxHQUFELENBQW9CN2IsS0FBcEIsQ0FBMEJwQixJQUExQixLQUFtQ3ZDLEtBQUssQ0FBQzBSLFNBQXZEO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUtMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbWF0cml4XCI7XG5pbXBvcnQgeyBJbnZhbGlkU3RvcmVFcnJvciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9lcnJvcnNcIjtcbmltcG9ydCB7IFJvb21NZW1iZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbi8vIGZvY3VzLXZpc2libGUgaXMgYSBQb2x5ZmlsbCBmb3IgdGhlIDpmb2N1cy12aXNpYmxlIENTUyBwc2V1ZG8tYXR0cmlidXRlIHVzZWQgYnkgX0FjY2Vzc2libGVCdXR0b24uc2Nzc1xuaW1wb3J0ICdmb2N1cy12aXNpYmxlJztcbi8vIHdoYXQtaW5wdXQgaGVscHMgaW1wcm92ZSBrZXlib2FyZCBhY2Nlc3NpYmlsaXR5XG5pbXBvcnQgJ3doYXQtaW5wdXQnO1xuXG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gXCIuLi8uLi9BbmFseXRpY3NcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuLi8uLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5pbXBvcnQgeyBEZWNyeXB0aW9uRmFpbHVyZVRyYWNrZXIgfSBmcm9tIFwiLi4vLi4vRGVjcnlwdGlvbkZhaWx1cmVUcmFja2VyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcsIElNYXRyaXhDbGllbnRDcmVkcyB9IGZyb20gXCIuLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi4vLi4vUGxhdGZvcm1QZWdcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgTm90aWZpZXIgZnJvbSAnLi4vLi4vTm90aWZpZXInO1xuXG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uL01vZGFsXCI7XG5pbXBvcnQgVGludGVyIGZyb20gXCIuLi8uLi9UaW50ZXJcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBzaG93Um9vbUludml0ZURpYWxvZywgc2hvd1N0YXJ0Q2hhdEludml0ZURpYWxvZyB9IGZyb20gJy4uLy4uL1Jvb21JbnZpdGUnO1xuaW1wb3J0ICogYXMgUm9vbXMgZnJvbSAnLi4vLi4vUm9vbXMnO1xuaW1wb3J0IGxpbmtpZnlNYXRyaXggZnJvbSBcIi4uLy4uL2xpbmtpZnktbWF0cml4XCI7XG5pbXBvcnQgKiBhcyBMaWZlY3ljbGUgZnJvbSAnLi4vLi4vTGlmZWN5Y2xlJztcbi8vIExpZmVjeWNsZVN0b3JlIGlzIG5vdCB1c2VkIGJ1dCBkb2VzIGxpc3RlbiB0byBhbmQgZGlzcGF0Y2ggYWN0aW9uc1xuaW1wb3J0ICcuLi8uLi9zdG9yZXMvTGlmZWN5Y2xlU3RvcmUnO1xuaW1wb3J0IFBhZ2VUeXBlcyBmcm9tICcuLi8uLi9QYWdlVHlwZXMnO1xuXG5pbXBvcnQgY3JlYXRlUm9vbSwge0lPcHRzfSBmcm9tIFwiLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IHtfdCwgX3RkLCBnZXRDdXJyZW50TGFuZ3VhZ2V9IGZyb20gJy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFRoZW1lQ29udHJvbGxlciBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvY29udHJvbGxlcnMvVGhlbWVDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBzdGFydEFueVJlZ2lzdHJhdGlvbkZsb3cgfSBmcm9tIFwiLi4vLi4vUmVnaXN0cmF0aW9uLmpzXCI7XG5pbXBvcnQgeyBtZXNzYWdlRm9yU3luY0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvRXJyb3JVdGlscyc7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgQXV0b0Rpc2NvdmVyeVV0aWxzLCB7IFZhbGlkYXRlZFNlcnZlckNvbmZpZyB9IGZyb20gXCIuLi8uLi91dGlscy9BdXRvRGlzY292ZXJ5VXRpbHNcIjtcbmltcG9ydCBETVJvb21NYXAgZnJvbSAnLi4vLi4vdXRpbHMvRE1Sb29tTWFwJztcbmltcG9ydCBUaGVtZVdhdGNoZXIgZnJvbSBcIi4uLy4uL3NldHRpbmdzL3dhdGNoZXJzL1RoZW1lV2F0Y2hlclwiO1xuaW1wb3J0IHsgRm9udFdhdGNoZXIgfSBmcm9tICcuLi8uLi9zZXR0aW5ncy93YXRjaGVycy9Gb250V2F0Y2hlcic7XG5pbXBvcnQgeyBzdG9yZVJvb21BbGlhc0luQ2FjaGUgfSBmcm9tICcuLi8uLi9Sb29tQWxpYXNDYWNoZSc7XG5pbXBvcnQgeyBkZWZlciwgSURlZmVycmVkLCBzbGVlcCB9IGZyb20gXCIuLi8uLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQgVG9hc3RTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL1RvYXN0U3RvcmVcIjtcbmltcG9ydCAqIGFzIFN0b3JhZ2VNYW5hZ2VyIGZyb20gXCIuLi8uLi91dGlscy9TdG9yYWdlTWFuYWdlclwiO1xuaW1wb3J0IHR5cGUgTG9nZ2VkSW5WaWV3VHlwZSBmcm9tIFwiLi9Mb2dnZWRJblZpZXdcIjtcbmltcG9ydCB7IFZpZXdVc2VyUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdVc2VyUGF5bG9hZFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHtcbiAgICBzaG93VG9hc3QgYXMgc2hvd0FuYWx5dGljc1RvYXN0LFxuICAgIGhpZGVUb2FzdCBhcyBoaWRlQW5hbHl0aWNzVG9hc3QsXG59IGZyb20gXCIuLi8uLi90b2FzdHMvQW5hbHl0aWNzVG9hc3RcIjtcbmltcG9ydCB7c2hvd1RvYXN0IGFzIHNob3dOb3RpZmljYXRpb25zVG9hc3R9IGZyb20gXCIuLi8uLi90b2FzdHMvRGVza3RvcE5vdGlmaWNhdGlvbnNUb2FzdFwiO1xuaW1wb3J0IHsgT3BlblRvVGFiUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5Ub1RhYlBheWxvYWRcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IHsgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7IGxlYXZlUm9vbUJlaGF2aW91ciB9IGZyb20gXCIuLi8uLi91dGlscy9tZW1iZXJzaGlwXCI7XG5pbXBvcnQgQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nIGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ1wiO1xuaW1wb3J0IFRocmVlcGlkSW52aXRlU3RvcmUsIHsgSVRocmVlcGlkSW52aXRlLCBJVGhyZWVwaWRJbnZpdGVXaXJlRm9ybWF0IH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9UaHJlZXBpZEludml0ZVN0b3JlXCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5pbXBvcnQgRGlhbFBhZE1vZGFsIGZyb20gXCIuLi92aWV3cy92b2lwL0RpYWxQYWRNb2RhbFwiO1xuaW1wb3J0IHsgc2hvd1RvYXN0IGFzIHNob3dNb2JpbGVHdWlkZVRvYXN0IH0gZnJvbSAnLi4vLi4vdG9hc3RzL01vYmlsZUd1aWRlVG9hc3QnO1xuaW1wb3J0IHsgc2hvdWxkVXNlTG9naW5Gb3JXZWxjb21lIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3BhZ2VzXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHtSb29tVXBkYXRlQ2F1c2V9IGZyb20gXCIuLi8uLi9zdG9yZXMvcm9vbS1saXN0L21vZGVsc1wiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBTZWN1cml0eUN1c3RvbWlzYXRpb25zIGZyb20gXCIuLi8uLi9jdXN0b21pc2F0aW9ucy9TZWN1cml0eVwiO1xuXG4vKiogY29uc3RhbnRzIGZvciBNYXRyaXhDaGF0LnN0YXRlLnZpZXcgKi9cbmV4cG9ydCBlbnVtIFZpZXdzIHtcbiAgICAvLyBhIHNwZWNpYWwgaW5pdGlhbCBzdGF0ZSB3aGljaCBpcyBvbmx5IHVzZWQgYXQgc3RhcnR1cCwgd2hpbGUgd2UgYXJlXG4gICAgLy8gdHJ5aW5nIHRvIHJlLWFuaW1hdGUgYSBtYXRyaXggY2xpZW50IG9yIHJlZ2lzdGVyIGFzIGEgZ3Vlc3QuXG4gICAgTE9BRElORyxcblxuICAgIC8vIHdlIGFyZSBzaG93aW5nIHRoZSB3ZWxjb21lIHZpZXdcbiAgICBXRUxDT01FLFxuXG4gICAgLy8gd2UgYXJlIHNob3dpbmcgdGhlIGxvZ2luIHZpZXdcbiAgICBMT0dJTixcblxuICAgIC8vIHdlIGFyZSBzaG93aW5nIHRoZSByZWdpc3RyYXRpb24gdmlld1xuICAgIFJFR0lTVEVSLFxuXG4gICAgLy8gc2hvd2luZyB0aGUgJ2ZvcmdvdCBwYXNzd29yZCcgdmlld1xuICAgIEZPUkdPVF9QQVNTV09SRCxcblxuICAgIC8vIHNob3dpbmcgZmxvdyB0byB0cnVzdCB0aGlzIG5ldyBkZXZpY2Ugd2l0aCBjcm9zcy1zaWduaW5nXG4gICAgQ09NUExFVEVfU0VDVVJJVFksXG5cbiAgICAvLyBmbG93IHRvIHNldHVwIFNTU1MgLyBjcm9zcy1zaWduaW5nIG9uIHRoaXMgYWNjb3VudFxuICAgIEUyRV9TRVRVUCxcblxuICAgIC8vIHdlIGFyZSBsb2dnZWQgaW4gd2l0aCBhbiBhY3RpdmUgbWF0cml4IGNsaWVudC4gVGhlIGxvZ2dlZF9pbiBzdGF0ZSBhbHNvXG4gICAgLy8gaW5jbHVkZXMgZ3Vlc3RzIHVzZXJzIGFzIHRoZXkgdG9vIGFyZSBsb2dnZWQgaW4gYXQgdGhlIGNsaWVudCBsZXZlbC5cbiAgICBMT0dHRURfSU4sXG5cbiAgICAvLyBXZSBhcmUgbG9nZ2VkIG91dCAoaW52YWxpZCB0b2tlbikgYnV0IGhhdmUgb3VyIGxvY2FsIHN0YXRlIGFnYWluLiBUaGUgdXNlclxuICAgIC8vIHNob3VsZCBsb2cgYmFjayBpbiB0byByZWh5ZHJhdGUgdGhlIGNsaWVudC5cbiAgICBTT0ZUX0xPR09VVCxcbn1cblxuY29uc3QgQVVUSF9TQ1JFRU5TID0gW1wicmVnaXN0ZXJcIiwgXCJsb2dpblwiLCBcImZvcmdvdF9wYXNzd29yZFwiLCBcInN0YXJ0X3Nzb1wiLCBcInN0YXJ0X2Nhc1wiXTtcblxuLy8gQWN0aW9ucyB0aGF0IGFyZSByZWRpcmVjdGVkIHRocm91Z2ggdGhlIG9uYm9hcmRpbmcgcHJvY2VzcyBwcmlvciB0byBiZWluZ1xuLy8gcmUtZGlzcGF0Y2hlZC4gTk9URTogc29tZSBhY3Rpb25zIGFyZSBub24tdHJpdmlhbCBhbmQgd291bGQgcmVxdWlyZVxuLy8gcmUtZmFjdG9yaW5nIHRvIGJlIGluY2x1ZGVkIGluIHRoaXMgbGlzdCBpbiBmdXR1cmUuXG5jb25zdCBPTkJPQVJESU5HX0ZMT1dfU1RBUlRFUlMgPSBbXG4gICAgQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MsXG4gICAgJ3ZpZXdfY3JlYXRlX2NoYXQnLFxuICAgICd2aWV3X2NyZWF0ZV9yb29tJyxcbiAgICAndmlld19jcmVhdGVfZ3JvdXAnLFxuXTtcblxuaW50ZXJmYWNlIElTY3JlZW4ge1xuICAgIHNjcmVlbjogc3RyaW5nO1xuICAgIHBhcmFtcz86IG9iamVjdDtcbn1cblxuLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5pbnRlcmZhY2UgSVJvb21JbmZvIHtcbiAgICByb29tX2lkPzogc3RyaW5nO1xuICAgIHJvb21fYWxpYXM/OiBzdHJpbmc7XG4gICAgZXZlbnRfaWQ/OiBzdHJpbmc7XG5cbiAgICBhdXRvX2pvaW4/OiBib29sZWFuO1xuICAgIGhpZ2hsaWdodGVkPzogYm9vbGVhbjtcbiAgICBvb2JfZGF0YT86IG9iamVjdDtcbiAgICB2aWFfc2VydmVycz86IHN0cmluZ1tdO1xuICAgIHRocmVlcGlkX2ludml0ZT86IElUaHJlZXBpZEludml0ZTtcblxuICAgIGp1c3RDcmVhdGVkT3B0cz86IElPcHRzO1xufVxuLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UgKi9cblxuaW50ZXJmYWNlIElQcm9wcyB7IC8vIFRPRE8gdHlwZSB0aGluZ3MgYmV0dGVyXG4gICAgY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAgIHNlcnZlckNvbmZpZz86IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICBvbk5ld1NjcmVlbjogKHNjcmVlbjogc3RyaW5nLCByZXBsYWNlTGFzdDogYm9vbGVhbikgPT4gdm9pZDtcbiAgICBlbmFibGVHdWVzdD86IGJvb2xlYW47XG4gICAgLy8gdGhlIHF1ZXJ5UGFyYW1zIGV4dHJhY3RlZCBmcm9tIHRoZSBbcmVhbF0gcXVlcnktc3RyaW5nIG9mIHRoZSBVUklcbiAgICByZWFsUXVlcnlQYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIC8vIHRoZSBpbml0aWFsIHF1ZXJ5UGFyYW1zIGV4dHJhY3RlZCBmcm9tIHRoZSBoYXNoLWZyYWdtZW50IG9mIHRoZSBVUklcbiAgICBzdGFydGluZ0ZyYWdtZW50UXVlcnlQYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIC8vIGNhbGxlZCB3aGVuIHdlIGhhdmUgY29tcGxldGVkIGEgdG9rZW4gbG9naW5cbiAgICBvblRva2VuTG9naW5Db21wbGV0ZWQ/OiAoKSA9PiB2b2lkO1xuICAgIC8vIFJlcHJlc2VudHMgdGhlIHNjcmVlbiB0byBkaXNwbGF5IGFzIGEgcmVzdWx0IG9mIHBhcnNpbmcgdGhlIGluaXRpYWwgd2luZG93LmxvY2F0aW9uXG4gICAgaW5pdGlhbFNjcmVlbkFmdGVyTG9naW4/OiBJU2NyZWVuO1xuICAgIC8vIGRpc3BsYXluYW1lLCBpZiBhbnksIHRvIHNldCBvbiB0aGUgZGV2aWNlIHdoZW4gbG9nZ2luZyBpbi9yZWdpc3RlcmluZy5cbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gICAgLy8gQSBmdW5jdGlvbiB0aGF0IG1ha2VzIGEgcmVnaXN0cmF0aW9uIFVSTFxuICAgIG1ha2VSZWdpc3RyYXRpb25Vcmw6IChvYmplY3QpID0+IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgLy8gdGhlIG1hc3RlciB2aWV3IHdlIGFyZSBzaG93aW5nLlxuICAgIHZpZXc6IFZpZXdzO1xuICAgIC8vIFdoYXQgdGhlIExvZ2dlZEluVmlldyB3b3VsZCBiZSBzaG93aW5nIGlmIHZpc2libGVcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgcGFnZV90eXBlPzogUGFnZVR5cGVzO1xuICAgIC8vIFRoZSBJRCBvZiB0aGUgcm9vbSB3ZSdyZSB2aWV3aW5nLiBUaGlzIGlzIGVpdGhlciBwb3B1bGF0ZWQgZGlyZWN0bHlcbiAgICAvLyBpbiB0aGUgY2FzZSB3aGVyZSB3ZSB2aWV3IGEgcm9vbSBieSBJRCBvciBieSBSb29tVmlldyB3aGVuIGl0IHJlc29sdmVzXG4gICAgLy8gd2hhdCBJRCBhbiBhbGlhcyBwb2ludHMgYXQuXG4gICAgY3VycmVudFJvb21JZD86IHN0cmluZztcbiAgICBjdXJyZW50R3JvdXBJZD86IHN0cmluZztcbiAgICBjdXJyZW50R3JvdXBJc05ldz86IGJvb2xlYW47XG4gICAgLy8gSWYgd2UncmUgdHJ5aW5nIHRvIGp1c3QgdmlldyBhIHVzZXIgSUQgKGkuZS4gL3VzZXIgVVJMKSwgdGhpcyBpcyBpdFxuICAgIGN1cnJlbnRVc2VySWQ/OiBzdHJpbmc7XG4gICAgLy8gdGhpcyBpcyBwZXJzaXN0ZWQgYXMgbXhfbGhzX3NpemUsIGxvYWRlZCBpbiBMb2dnZWRJblZpZXdcbiAgICBjb2xsYXBzZUxoczogYm9vbGVhbjtcbiAgICAvLyBQYXJhbWV0ZXJzIHVzZWQgaW4gdGhlIHJlZ2lzdHJhdGlvbiBkYW5jZSB3aXRoIHRoZSBJU1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICByZWdpc3Rlcl9jbGllbnRfc2VjcmV0Pzogc3RyaW5nO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICByZWdpc3Rlcl9zZXNzaW9uX2lkPzogc3RyaW5nO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICByZWdpc3Rlcl9pZF9zaWQ/OiBzdHJpbmc7XG4gICAgLy8gV2hlbiBzaG93aW5nIE1vZGFsIGRpYWxvZ3Mgd2UgbmVlZCB0byBzZXQgYXJpYS1oaWRkZW4gb24gdGhlIHJvb3QgYXBwIGVsZW1lbnRcbiAgICAvLyBhbmQgZGlzYWJsZSBpdCB3aGVuIHRoZXJlIGFyZSBubyBkaWFsb2dzXG4gICAgaGlkZVRvU1JVc2VyczogYm9vbGVhbjtcbiAgICBzeW5jRXJyb3I/OiBFcnJvcjtcbiAgICByZXNpemVOb3RpZmllcjogUmVzaXplTm90aWZpZXI7XG4gICAgc2VydmVyQ29uZmlnPzogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIHJlYWR5OiBib29sZWFuO1xuICAgIHRocmVlcGlkSW52aXRlPzogSVRocmVlcGlkSW52aXRlLFxuICAgIHJvb21Pb2JEYXRhPzogb2JqZWN0O1xuICAgIHBlbmRpbmdJbml0aWFsU3luYz86IGJvb2xlYW47XG4gICAganVzdFJlZ2lzdGVyZWQ/OiBib29sZWFuO1xuICAgIHJvb21KdXN0Q3JlYXRlZE9wdHM/OiBJT3B0cztcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5NYXRyaXhDaGF0XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXRyaXhDaGF0IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiTWF0cml4Q2hhdFwiO1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgcmVhbFF1ZXJ5UGFyYW1zOiB7fSxcbiAgICAgICAgc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zOiB7fSxcbiAgICAgICAgY29uZmlnOiB7fSxcbiAgICAgICAgb25Ub2tlbkxvZ2luQ29tcGxldGVkOiAoKSA9PiB7fSxcbiAgICB9O1xuXG4gICAgZmlyc3RTeW5jQ29tcGxldGU6IGJvb2xlYW47XG4gICAgZmlyc3RTeW5jUHJvbWlzZTogSURlZmVycmVkPHZvaWQ+O1xuXG4gICAgcHJpdmF0ZSBzY3JlZW5BZnRlckxvZ2luPzogSVNjcmVlbjtcbiAgICBwcml2YXRlIHdpbmRvd1dpZHRoOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBwYWdlQ2hhbmdpbmc6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSB0b2tlbkxvZ2luPzogYm9vbGVhbjtcbiAgICBwcml2YXRlIGFjY291bnRQYXNzd29yZD86IHN0cmluZztcbiAgICBwcml2YXRlIGFjY291bnRQYXNzd29yZFRpbWVyPzogTm9kZUpTLlRpbWVvdXQ7XG4gICAgcHJpdmF0ZSBmb2N1c0NvbXBvc2VyOiBib29sZWFuO1xuICAgIHByaXZhdGUgc3ViVGl0bGVTdGF0dXM6IHN0cmluZztcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VkSW5WaWV3OiBSZWFjdC5SZWZPYmplY3Q8TG9nZ2VkSW5WaWV3VHlwZT47XG4gICAgcHJpdmF0ZSByZWFkb25seSBkaXNwYXRjaGVyUmVmOiBhbnk7XG4gICAgcHJpdmF0ZSByZWFkb25seSB0aGVtZVdhdGNoZXI6IFRoZW1lV2F0Y2hlcjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZvbnRXYXRjaGVyOiBGb250V2F0Y2hlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmlldzogVmlld3MuTE9BRElORyxcbiAgICAgICAgICAgIGNvbGxhcHNlTGhzOiBmYWxzZSxcblxuICAgICAgICAgICAgaGlkZVRvU1JVc2VyczogZmFsc2UsXG5cbiAgICAgICAgICAgIHN5bmNFcnJvcjogbnVsbCwgLy8gSWYgdGhlIGN1cnJlbnQgc3luY2luZyBzdGF0dXMgaXMgRVJST1IsIHRoZSBlcnJvciBvYmplY3QsIG90aGVyd2lzZSBudWxsLlxuICAgICAgICAgICAgcmVzaXplTm90aWZpZXI6IG5ldyBSZXNpemVOb3RpZmllcigpLFxuICAgICAgICAgICAgcmVhZHk6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nZ2VkSW5WaWV3ID0gY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgU2RrQ29uZmlnLnB1dCh0aGlzLnByb3BzLmNvbmZpZyk7XG5cbiAgICAgICAgLy8gVXNlZCBieSBfdmlld1Jvb20gYmVmb3JlIGdldHRpbmcgc3RhdGUgZnJvbSBzeW5jXG4gICAgICAgIHRoaXMuZmlyc3RTeW5jQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlID0gZGVmZXIoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5jb25maWcuc3luY190aW1lbGluZV9saW1pdCkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLm9wdHMuaW5pdGlhbFN5bmNMaW1pdCA9IHRoaXMucHJvcHMuY29uZmlnLnN5bmNfdGltZWxpbmVfbGltaXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhIHRoaW5nIHRvIGNhbGwgc2hvd1NjcmVlbiB3aXRoIG9uY2UgbG9naW4gY29tcGxldGVzLiAgdGhpcyBpcyBrZXB0XG4gICAgICAgIC8vIG91dHNpZGUgdGhpcy5zdGF0ZSBiZWNhdXNlIHVwZGF0aW5nIGl0IHNob3VsZCBuZXZlciB0cmlnZ2VyIGFcbiAgICAgICAgLy8gcmVyZW5kZXIuXG4gICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbiA9IHRoaXMucHJvcHMuaW5pdGlhbFNjcmVlbkFmdGVyTG9naW47XG4gICAgICAgIGlmICh0aGlzLnNjcmVlbkFmdGVyTG9naW4pIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5wYXJhbXMgfHwge307XG4gICAgICAgICAgICBpZiAodGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbi5zdGFydHNXaXRoKFwicm9vbS9cIikgJiYgcGFyYW1zWydzaWdudXJsJ10gJiYgcGFyYW1zWydlbWFpbCddKSB7XG4gICAgICAgICAgICAgICAgLy8gcHJvYmFibHkgYSB0aHJlZXBpZCBpbnZpdGUgLSB0cnkgdG8gc3RvcmUgaXRcbiAgICAgICAgICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnNjcmVlbkFmdGVyTG9naW4uc2NyZWVuLnN1YnN0cmluZyhcInJvb20vXCIubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnN0b3JlSW52aXRlKHJvb21JZCwgcGFyYW1zIGFzIElUaHJlZXBpZEludml0ZVdpcmVGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53aW5kb3dXaWR0aCA9IDEwMDAwO1xuICAgICAgICB0aGlzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5oYW5kbGVSZXNpemUpO1xuXG4gICAgICAgIHRoaXMucGFnZUNoYW5naW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gY2hlY2sgd2UgaGF2ZSB0aGUgcmlnaHQgdGludCBhcHBsaWVkIGZvciB0aGlzIHRoZW1lLlxuICAgICAgICAvLyBOLkIuIHdlIGRvbid0IGNhbGwgdGhlIHdob2xlIG9mIHNldFRoZW1lKCkgaGVyZSBhcyB3ZSBtYXkgYmVcbiAgICAgICAgLy8gcmFjaW5nIHdpdGggdGhlIHRoZW1lIENTUyBkb3dubG9hZCBmaW5pc2hpbmcgZnJvbSBpbmRleC5qc1xuICAgICAgICBUaW50ZXIudGludCgpO1xuXG4gICAgICAgIC8vIEZvciBQZXJzaXN0ZW50RWxlbWVudFxuICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLm9uKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMuZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSk7XG5cbiAgICAgICAgLy8gRm9yY2UgdXNlcnMgdG8gZ28gdGhyb3VnaCB0aGUgc29mdCBsb2dvdXQgcGFnZSBpZiB0aGV5J3JlIHNvZnQgbG9nZ2VkIG91dFxuICAgICAgICBpZiAoTGlmZWN5Y2xlLmlzU29mdExvZ291dCgpKSB7XG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBzZXNzaW9uIGxvYWRzIGl0J2xsIGJlIGRldGVjdGVkIGFzIHNvZnQgbG9nZ2VkIG91dCBhbmQgYSBkaXNwYXRjaFxuICAgICAgICAgICAgLy8gd2lsbCBiZSBzZW50IG91dCB0byBzYXkgdGhhdCwgdHJpZ2dlcmluZyB0aGlzIE1hdHJpeENoYXQgdG8gc2hvdyB0aGUgc29mdFxuICAgICAgICAgICAgLy8gbG9nb3V0IHBhZ2UuXG4gICAgICAgICAgICBMaWZlY3ljbGUubG9hZFNlc3Npb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWNjb3VudFBhc3N3b3JkID0gbnVsbDtcbiAgICAgICAgdGhpcy5hY2NvdW50UGFzc3dvcmRUaW1lciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuXG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyID0gbmV3IFRoZW1lV2F0Y2hlcigpO1xuICAgICAgICB0aGlzLmZvbnRXYXRjaGVyID0gbmV3IEZvbnRXYXRjaGVyKCk7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuZm9udFdhdGNoZXIuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLmZvY3VzQ29tcG9zZXIgPSBmYWxzZTtcblxuICAgICAgICAvLyBvYmplY3QgZmllbGQgdXNlZCBmb3IgdHJhY2tpbmcgdGhlIHN0YXR1cyBpbmZvIGFwcGVuZGVkIHRvIHRoZSB0aXRsZSB0YWcuXG4gICAgICAgIC8vIHdlIGRvbid0IGRvIGl0IGFzIHJlYWN0IHN0YXRlIGFzIGknbSBzY2FyZWQgYWJvdXQgdHJpZ2dlcmluZyBuZWVkbGVzcyByZWFjdCByZWZyZXNoZXMuXG4gICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgPSAnJztcblxuICAgICAgICAvLyB0aGlzIGNhbiB0ZWNobmljYWxseSBiZSBkb25lIGFueXdoZXJlIGJ1dCBkb2luZyB0aGlzIGhlcmUga2VlcHMgYWxsXG4gICAgICAgIC8vIHRoZSByb3V0aW5nIHVybCBwYXRoIGxvZ2ljIHRvZ2V0aGVyLlxuICAgICAgICBpZiAodGhpcy5vbkFsaWFzQ2xpY2spIHtcbiAgICAgICAgICAgIGxpbmtpZnlNYXRyaXgub25BbGlhc0NsaWNrID0gdGhpcy5vbkFsaWFzQ2xpY2s7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub25Vc2VyQ2xpY2spIHtcbiAgICAgICAgICAgIGxpbmtpZnlNYXRyaXgub25Vc2VyQ2xpY2sgPSB0aGlzLm9uVXNlckNsaWNrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9uR3JvdXBDbGljaykge1xuICAgICAgICAgICAgbGlua2lmeU1hdHJpeC5vbkdyb3VwQ2xpY2sgPSB0aGlzLm9uR3JvdXBDbGljaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZSBmaXJzdCB0aGluZyB0byBkbyBpcyB0byB0cnkgdGhlIHRva2VuIHBhcmFtcyBpbiB0aGUgcXVlcnktc3RyaW5nXG4gICAgICAgIC8vIGlmIHRoZSBzZXNzaW9uIGlzbid0IHNvZnQgbG9nZ2VkIG91dCAoaWU6IGlzIGEgY2xlYW4gc2Vzc2lvbiBiZWluZyBsb2dnZWQgaW4pXG4gICAgICAgIGlmICghTGlmZWN5Y2xlLmlzU29mdExvZ291dCgpKSB7XG4gICAgICAgICAgICBMaWZlY3ljbGUuYXR0ZW1wdFRva2VuTG9naW4oXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZWFsUXVlcnlQYXJhbXMsXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5kZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRGcmFnbWVudEFmdGVyTG9naW4oKSxcbiAgICAgICAgICAgICkudGhlbihhc3luYyAobG9nZ2VkSW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFsUXVlcnlQYXJhbXM/LmxvZ2luVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBsb2dpblRva2VuIGZyb20gdGhlIFVSTCByZWdhcmRsZXNzXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25Ub2tlbkxvZ2luQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGxvZ2dlZEluKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9rZW5Mb2dpbiA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuZCBzdGFydCB0aGUgY2xpZW50XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IExpZmVjeWNsZS5yZXN0b3JlRnJvbUxvY2FsU3RvcmFnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZ25vcmVHdWVzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc3RMb2dpblNldHVwKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaGFzIGZvbGxvd2VkIGEgbG9naW4gb3IgcmVnaXN0ZXIgbGluaywgZG9uJ3QgcmVhbmltYXRlXG4gICAgICAgICAgICAgICAgLy8gdGhlIG9sZCBjcmVkcywgYnV0IHJhdGhlciBnbyBzdHJhaWdodCB0byB0aGUgcmVsZXZhbnQgcGFnZVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0U2NyZWVuID0gdGhpcy5zY3JlZW5BZnRlckxvZ2luID8gdGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbiA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RTY3JlZW4gPT09ICdsb2dpbicgfHxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RTY3JlZW4gPT09ICdyZWdpc3RlcicgfHxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RTY3JlZW4gPT09ICdmb3Jnb3RfcGFzc3dvcmQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NjcmVlbkFmdGVyTG9naW4oKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRTZXNzaW9uKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYW5hbHl0aWNzT3B0SW5cIikpIHtcbiAgICAgICAgICAgIEFuYWx5dGljcy5lbmFibGUoKTtcbiAgICAgICAgfVxuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmVuYWJsZSgvKiBhbm9ueW1vdXMgPSAqLyB0cnVlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHBvc3RMb2dpblNldHVwKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGNyeXB0b0VuYWJsZWQgPSBjbGkuaXNDcnlwdG9FbmFibGVkKCk7XG4gICAgICAgIGlmICghY3J5cHRvRW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5vbkxvZ2dlZEluKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9taXNlc0xpc3QgPSBbdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2VdO1xuICAgICAgICBpZiAoY3J5cHRvRW5hYmxlZCkge1xuICAgICAgICAgICAgLy8gd2FpdCBmb3IgdGhlIGNsaWVudCB0byBmaW5pc2ggZG93bmxvYWRpbmcgY3Jvc3Mtc2lnbmluZyBrZXlzIGZvciB1cyBzbyB3ZVxuICAgICAgICAgICAgLy8ga25vdyB3aGV0aGVyIG9yIG5vdCB3ZSBoYXZlIGtleXMgc2V0IHVwIG9uIHRoaXMgYWNjb3VudFxuICAgICAgICAgICAgcHJvbWlzZXNMaXN0LnB1c2goY2xpLmRvd25sb2FkS2V5cyhbY2xpLmdldFVzZXJJZCgpXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHVwZGF0ZSB0aGUgc3RhdGUgdG8gc2F5IHdlJ3JlIHdhaXRpbmcgZm9yIHRoZSBmaXJzdCBzeW5jIHRvIGNvbXBsZXRlIHJhdGhlclxuICAgICAgICAvLyB0aGFuIGZvciB0aGUgbG9naW4gdG8gZmluaXNoLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGVuZGluZ0luaXRpYWxTeW5jOiB0cnVlIH0pO1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzTGlzdCk7XG5cbiAgICAgICAgaWYgKCFjcnlwdG9FbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGVuZGluZ0luaXRpYWxTeW5jOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNyb3NzU2lnbmluZ0lzU2V0VXAgPSBjbGkuZ2V0U3RvcmVkQ3Jvc3NTaWduaW5nRm9yVXNlcihjbGkuZ2V0VXNlcklkKCkpO1xuICAgICAgICBpZiAoY3Jvc3NTaWduaW5nSXNTZXRVcCkge1xuICAgICAgICAgICAgaWYgKFNlY3VyaXR5Q3VzdG9taXNhdGlvbnMuU0hPV19FTkNSWVBUSU9OX1NFVFVQX1VJID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Mb2dnZWRJbigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7dmlldzogVmlld3MuQ09NUExFVEVfU0VDVVJJVFl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUoXCJvcmcubWF0cml4LmUyZV9jcm9zc19zaWduaW5nXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7IHZpZXc6IFZpZXdzLkUyRV9TRVRVUCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25Mb2dnZWRJbigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwZW5kaW5nSW5pdGlhbFN5bmM6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIHN0YWdlXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsVXBkYXRlKHByb3BzLCBzdGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5zaG91bGRUcmFja1BhZ2VDaGFuZ2UodGhpcy5zdGF0ZSwgc3RhdGUpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0UGFnZUNoYW5nZVRpbWVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkVHJhY2tQYWdlQ2hhbmdlKHByZXZTdGF0ZSwgdGhpcy5zdGF0ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uTXMgPSB0aGlzLnN0b3BQYWdlQ2hhbmdlVGltZXIoKTtcbiAgICAgICAgICAgIEFuYWx5dGljcy50cmFja1BhZ2VDaGFuZ2UoZHVyYXRpb25Ncyk7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrUGFnZUNoYW5nZShkdXJhdGlvbk1zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mb2N1c0NvbXBvc2VyKSB7XG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgICAgICAgICB0aGlzLmZvY3VzQ29tcG9zZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBMaWZlY3ljbGUuc3RvcE1hdHJpeENsaWVudCgpO1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5zdG9wKCk7XG4gICAgICAgIHRoaXMuZm9udFdhdGNoZXIuc3RvcCgpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5oYW5kbGVSZXNpemUpO1xuICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLnJlbW92ZUxpc3RlbmVyKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMuZGlzcGF0Y2hUaW1lbGluZVJlc2l6ZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWNjb3VudFBhc3N3b3JkVGltZXIgIT09IG51bGwpIGNsZWFyVGltZW91dCh0aGlzLmFjY291bnRQYXNzd29yZFRpbWVyKTtcbiAgICB9XG5cbiAgICBnZXRGYWxsYmFja0hzVXJsKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcgJiYgdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcuZmFsbGJhY2tfaHNfdXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXJQcm9wZXJ0aWVzKCkge1xuICAgICAgICBsZXQgcHJvcHMgPSB0aGlzLnN0YXRlLnNlcnZlckNvbmZpZztcbiAgICAgICAgaWYgKCFwcm9wcykgcHJvcHMgPSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZzsgLy8gZm9yIHVuaXQgdGVzdHNcbiAgICAgICAgaWYgKCFwcm9wcykgcHJvcHMgPSBTZGtDb25maWcuZ2V0KClbXCJ2YWxpZGF0ZWRfc2VydmVyX2NvbmZpZ1wiXTtcbiAgICAgICAgcmV0dXJuIHtzZXJ2ZXJDb25maWc6IHByb3BzfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRTZXNzaW9uKCkge1xuICAgICAgICAvLyB0aGUgZXh0cmEgUHJvbWlzZS5yZXNvbHZlKCkgZW5zdXJlcyB0aGF0IHN5bmNocm9ub3VzIGV4Y2VwdGlvbnMgaGl0IHRoZSBzYW1lIGNvZGVwYXRoIGFzXG4gICAgICAgIC8vIGFzeW5jaHJvbm91cyBvbmVzLlxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTGlmZWN5Y2xlLmxvYWRTZXNzaW9uKHtcbiAgICAgICAgICAgICAgICBmcmFnbWVudFF1ZXJ5UGFyYW1zOiB0aGlzLnByb3BzLnN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICBlbmFibGVHdWVzdDogdGhpcy5wcm9wcy5lbmFibGVHdWVzdCxcbiAgICAgICAgICAgICAgICBndWVzdEhzVXJsOiB0aGlzLmdldFNlcnZlclByb3BlcnRpZXMoKS5zZXJ2ZXJDb25maWcuaHNVcmwsXG4gICAgICAgICAgICAgICAgZ3Vlc3RJc1VybDogdGhpcy5nZXRTZXJ2ZXJQcm9wZXJ0aWVzKCkuc2VydmVyQ29uZmlnLmlzVXJsLFxuICAgICAgICAgICAgICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZTogdGhpcy5wcm9wcy5kZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkudGhlbigobG9hZGVkU2Vzc2lvbikgPT4ge1xuICAgICAgICAgICAgaWYgKCFsb2FkZWRTZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gZmFsbCBiYWNrIHRvIHNob3dpbmcgdGhlIHdlbGNvbWUgc2NyZWVuLi4uIHVubGVzcyB3ZSBoYXZlIGEgM3BpZCBpbnZpdGUgcGVuZGluZ1xuICAgICAgICAgICAgICAgIGlmIChUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnBpY2tCZXN0SW52aXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwidmlld193ZWxjb21lX3BhZ2VcIn0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFuYWx5dGljc09wdEluXCIpKSB7XG4gICAgICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS5lbmFibGUoLyogYW5vbnltb3VzID0gKi8gZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gTm90ZSB3ZSBkb24ndCBjYXRjaCBlcnJvcnMgZnJvbSB0aGlzOiB3ZSBjYXRjaCBldmVyeXRoaW5nIHdpdGhpblxuICAgICAgICAvLyBsb2FkU2Vzc2lvbiBhcyB0aGVyZSdzIGxvZ2ljIHRoZXJlIHRvIGFzayB0aGUgdXNlciBpZiB0aGV5IHdhbnRcbiAgICAgICAgLy8gdG8gdHJ5IGxvZ2dpbmcgb3V0LlxuICAgIH1cblxuICAgIHN0YXJ0UGFnZUNoYW5nZVRpbWVyKCkge1xuICAgICAgICAvLyBUb3IgZG9lc24ndCBzdXBwb3J0IHBlcmZvcm1hbmNlXG4gICAgICAgIGlmICghcGVyZm9ybWFuY2UgfHwgIXBlcmZvcm1hbmNlLm1hcmspIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkbid0IGhhcHBlbiBiZWNhdXNlIFVOU0FGRV9jb21wb25lbnRXaWxsVXBkYXRlIGFuZCBjb21wb25lbnREaWRVcGRhdGVcbiAgICAgICAgLy8gYXJlIHVzZWQuXG4gICAgICAgIGlmICh0aGlzLnBhZ2VDaGFuZ2luZykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXRyaXhDaGF0LnN0YXJ0UGFnZUNoYW5nZVRpbWVyOiB0aW1lciBhbHJlYWR5IHN0YXJ0ZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhZ2VDaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHBlcmZvcm1hbmNlLm1hcmsoJ2VsZW1lbnRfTWF0cml4Q2hhdF9wYWdlX2NoYW5nZV9zdGFydCcpO1xuICAgIH1cblxuICAgIHN0b3BQYWdlQ2hhbmdlVGltZXIoKSB7XG4gICAgICAgIC8vIFRvciBkb2Vzbid0IHN1cHBvcnQgcGVyZm9ybWFuY2VcbiAgICAgICAgaWYgKCFwZXJmb3JtYW5jZSB8fCAhcGVyZm9ybWFuY2UubWFyaykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKCF0aGlzLnBhZ2VDaGFuZ2luZykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdNYXRyaXhDaGF0LnN0b3BQYWdlQ2hhbmdlVGltZXI6IHRpbWVyIG5vdCBzdGFydGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYWdlQ2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgICAgcGVyZm9ybWFuY2UubWFyaygnZWxlbWVudF9NYXRyaXhDaGF0X3BhZ2VfY2hhbmdlX3N0b3AnKTtcbiAgICAgICAgcGVyZm9ybWFuY2UubWVhc3VyZShcbiAgICAgICAgICAgICdlbGVtZW50X01hdHJpeENoYXRfcGFnZV9jaGFuZ2VfZGVsdGEnLFxuICAgICAgICAgICAgJ2VsZW1lbnRfTWF0cml4Q2hhdF9wYWdlX2NoYW5nZV9zdGFydCcsXG4gICAgICAgICAgICAnZWxlbWVudF9NYXRyaXhDaGF0X3BhZ2VfY2hhbmdlX3N0b3AnLFxuICAgICAgICApO1xuICAgICAgICBwZXJmb3JtYW5jZS5jbGVhck1hcmtzKCdlbGVtZW50X01hdHJpeENoYXRfcGFnZV9jaGFuZ2Vfc3RhcnQnKTtcbiAgICAgICAgcGVyZm9ybWFuY2UuY2xlYXJNYXJrcygnZWxlbWVudF9NYXRyaXhDaGF0X3BhZ2VfY2hhbmdlX3N0b3AnKTtcbiAgICAgICAgY29uc3QgbWVhc3VyZW1lbnQgPSBwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKCdlbGVtZW50X01hdHJpeENoYXRfcGFnZV9jaGFuZ2VfZGVsdGEnKS5wb3AoKTtcblxuICAgICAgICAvLyBJbiBwcmFjdGljZSwgc29tZXRpbWVzIHRoZSBlbnRyaWVzIGxpc3QgaXMgZW1wdHksIHNvIHdlIGdldCBubyBtZWFzdXJlbWVudFxuICAgICAgICBpZiAoIW1lYXN1cmVtZW50KSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gbWVhc3VyZW1lbnQuZHVyYXRpb247XG4gICAgfVxuXG4gICAgc2hvdWxkVHJhY2tQYWdlQ2hhbmdlKHByZXZTdGF0ZTogSVN0YXRlLCBzdGF0ZTogSVN0YXRlKSB7XG4gICAgICAgIHJldHVybiBwcmV2U3RhdGUuY3VycmVudFJvb21JZCAhPT0gc3RhdGUuY3VycmVudFJvb21JZCB8fFxuICAgICAgICAgICAgcHJldlN0YXRlLnZpZXcgIT09IHN0YXRlLnZpZXcgfHxcbiAgICAgICAgICAgIHByZXZTdGF0ZS5wYWdlX3R5cGUgIT09IHN0YXRlLnBhZ2VfdHlwZTtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZUZvck5ld1ZpZXcoc3RhdGU6IFBhcnRpYWw8SVN0YXRlPikge1xuICAgICAgICBpZiAoc3RhdGUudmlldyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXRTdGF0ZUZvck5ld1ZpZXcgd2l0aCBubyB2aWV3IVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgICAgICAgIGN1cnJlbnRVc2VySWQ6IG51bGwsXG4gICAgICAgICAgICBqdXN0UmVnaXN0ZXJlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICAgIE9iamVjdC5hc3NpZ24obmV3U3RhdGUsIHN0YXRlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgTWF0cml4Q2xpZW50UGVnLm9uQWN0aW9uOiAke3BheWxvYWQuYWN0aW9ufWApO1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBvbmJvYXJkaW5nIHByb2Nlc3MgZm9yIGNlcnRhaW4gYWN0aW9uc1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpICYmIE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkgJiZcbiAgICAgICAgICAgIE9OQk9BUkRJTkdfRkxPV19TVEFSVEVSUy5pbmNsdWRlcyhwYXlsb2FkLmFjdGlvbilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHdpbGwgY2F1c2UgYHBheWxvYWRgIHRvIGJlIGRpc3BhdGNoZWQgbGF0ZXIsIG9uY2UgYVxuICAgICAgICAgICAgLy8gc3luYyBoYXMgcmVhY2hlZCB0aGUgXCJwcmVwYXJlZFwiIHN0YXRlLiBTZXR0aW5nIGEgbWF0cml4IElEXG4gICAgICAgICAgICAvLyB3aWxsIGNhdXNlIGEgZnVsbCBsb2dpbiBhbmQgc3luYyBhbmQgZmluYWxseSB0aGUgZGVmZXJyZWRcbiAgICAgICAgICAgIC8vIGFjdGlvbiB3aWxsIGJlIGRpc3BhdGNoZWQuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2RvX2FmdGVyX3N5bmNfcHJlcGFyZWQnLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjogcGF5bG9hZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbid9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ01hdHJpeEFjdGlvbnMuYWNjb3VudERhdGEnOlxuICAgICAgICAgICAgICAgIC8vIFhYWDogVGhpcyBpcyBhIGNvbGxlY3Rpb24gb2Ygc2V2ZXJhbCBoYWNrcyB0byBzb2x2ZSBhIG1pbm9yIHByb2JsZW0uIFdlIHdhbnQgdG9cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgb3VyIGxvY2FsIHN0YXRlIHdoZW4gdGhlIElEIHNlcnZlciBjaGFuZ2VzLCBidXQgZG9uJ3Qgd2FudCB0byBwdXQgdGhhdCBpblxuICAgICAgICAgICAgICAgIC8vIHRoZSBqcy1zZGsgYXMgd2UnZCBiZSB0aGVuIGRpY3RhdGluZyBob3cgYWxsIGNvbnN1bWVycyBuZWVkIHRvIGJlaGF2ZS4gSG93ZXZlcixcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGNvbXBvbmVudCBpcyBhbHJlYWR5IGJsb2F0ZWQgYW5kIHdlIHByb2JhYmx5IGRvbid0IHdhbnQgdGhpcyB0aW55IGxvZ2ljIGluXG4gICAgICAgICAgICAgICAgLy8gaGVyZSwgYnV0IHRoZXJlJ3Mgbm8gYmV0dGVyIHBsYWNlIGluIHRoZSByZWFjdC1zZGsgZm9yIGl0LiBBZGRpdGlvbmFsbHksIHdlJ3JlXG4gICAgICAgICAgICAgICAgLy8gYWJ1c2luZyB0aGUgTWF0cml4QWN0aW9uQ3JlYXRvciBzdHVmZiB0byBhdm9pZCBlcnJvcnMgb24gZGlzcGF0Y2hlcy5cbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5ldmVudF90eXBlID09PSAnbS5pZGVudGl0eV9zZXJ2ZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxVcmwgPSBwYXlsb2FkLmV2ZW50X2NvbnRlbnQgPyBwYXlsb2FkLmV2ZW50X2NvbnRlbnRbJ2Jhc2VfdXJsJ10gOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZ1bGxVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRJZGVudGl0eVNlcnZlclVybChudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwibXhfaXNfYWNjZXNzX3Rva2VuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJteF9pc191cmxcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0SWRlbnRpdHlTZXJ2ZXJVcmwoZnVsbFVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X2lzX2FjY2Vzc190b2tlblwiKTsgLy8gY2xlYXIgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfaXNfdXJsXCIsIGZ1bGxVcmwpOyAvLyBYWFg6IERvIHdlIHN0aWxsIG5lZWQgdGhpcz9cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlZGlzcGF0Y2ggdGhlIGNoYW5nZSB3aXRoIGEgbW9yZSBzcGVjaWZpYyBhY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdpZF9zZXJ2ZXJfY2hhbmdlZCd9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsb2dvdXQnOlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBcImhhbmd1cF9hbGxcIn0pO1xuICAgICAgICAgICAgICAgIExpZmVjeWNsZS5sb2dvdXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJzpcbiAgICAgICAgICAgICAgICBzdGFydEFueVJlZ2lzdHJhdGlvbkZsb3cocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdGFydF9yZWdpc3RyYXRpb24nOlxuICAgICAgICAgICAgICAgIGlmIChMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNvZnRMb2dvdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc3RhcnRzIHRoZSBmdWxsIHJlZ2lzdHJhdGlvbiBmbG93XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuc2NyZWVuQWZ0ZXJMb2dpbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4gPSBwYXlsb2FkLnNjcmVlbkFmdGVyTG9naW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRSZWdpc3RyYXRpb24ocGF5bG9hZC5wYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RhcnRfbG9naW4nOlxuICAgICAgICAgICAgICAgIGlmIChMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNvZnRMb2dvdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLnNjcmVlbkFmdGVyTG9naW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luID0gcGF5bG9hZC5zY3JlZW5BZnRlckxvZ2luO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdMb2dpbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RhcnRfcGFzc3dvcmRfcmVjb3ZlcnknOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgdmlldzogVmlld3MuRk9SR09UX1BBU1NXT1JELFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdmb3Jnb3RfcGFzc3dvcmQnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0X2NoYXQnOlxuICAgICAgICAgICAgICAgIGNyZWF0ZVJvb20oe1xuICAgICAgICAgICAgICAgICAgICBkbVVzZXJJZDogcGF5bG9hZC51c2VyX2lkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVhdmVfcm9vbSc6XG4gICAgICAgICAgICAgICAgdGhpcy5sZWF2ZVJvb20ocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2ZvcmdldF9yb29tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmZvcmdldFJvb20ocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlamVjdF9pbnZpdGUnOlxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1JlamVjdCBpbnZpdGF0aW9uJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnUmVqZWN0IGludml0YXRpb24nKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVqZWN0IHRoZSBpbnZpdGF0aW9uPycpLFxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiAoY29uZmlybSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogY29udHJvbGxlciBzaG91bGRuJ3QgYmUgbG9hZGluZyBhIHZpZXcgOihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBMb2FkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2RhbCA9IE1vZGFsLmNyZWF0ZURpYWxvZyhMb2FkZXIsIG51bGwsICdteF9EaWFsb2dfc3Bpbm5lcicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmxlYXZlKHBheWxvYWQucm9vbV9pZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWQgPT09IHBheWxvYWQucm9vbV9pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2hvbWVfcGFnZSd9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHJlamVjdCBpbnZpdGF0aW9uJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byByZWplY3QgaW52aXRhdGlvbicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGVyci50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfdXNlcl9pbmZvJzpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdVc2VyKHBheWxvYWQudXNlcklkLCBwYXlsb2FkLnN1YkFjdGlvbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3X3Jvb20nOiB7XG4gICAgICAgICAgICAgICAgLy8gVGFrZXMgZWl0aGVyIGEgcm9vbSBJRCBvciByb29tIGFsaWFzOiBpZiBzd2l0Y2hpbmcgdG8gYSByb29tIHRoZSBjbGllbnQgaXMgYWxyZWFkeVxuICAgICAgICAgICAgICAgIC8vIGtub3duIHRvIGJlIGluIChlZy4gdXNlciBjbGlja3Mgb24gYSByb29tIGluIHRoZSByZWNlbnRzIHBhbmVsKSwgc3VwcGx5IHRoZSBJRFxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSB1c2VyIGlzIGNsaWNraW5nIG9uIGEgcm9vbSBpbiB0aGUgY29udGV4dCBvZiB0aGUgYWxpYXMgYmVpbmcgcHJlc2VudGVkXG4gICAgICAgICAgICAgICAgLy8gdG8gdGhlbSwgc3VwcGx5IHRoZSByb29tIGFsaWFzLiBJZiBib3RoIGFyZSBzdXBwbGllZCwgdGhlIHJvb20gSUQgd2lsbCBiZSBpZ25vcmVkLlxuICAgICAgICAgICAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLnZpZXdSb29tKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLmRlZmVycmVkX2FjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHBheWxvYWQuZGVmZXJyZWRfYWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVmlld1VzZXJTZXR0aW5nczoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhYlBheWxvYWQgPSBwYXlsb2FkIGFzIE9wZW5Ub1RhYlBheWxvYWQ7XG4gICAgICAgICAgICAgICAgY29uc3QgVXNlclNldHRpbmdzRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuVXNlclNldHRpbmdzRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1VzZXIgc2V0dGluZ3MnLCAnJywgVXNlclNldHRpbmdzRGlhbG9nLFxuICAgICAgICAgICAgICAgICAgICB7aW5pdGlhbFRhYklkOiB0YWJQYXlsb2FkLmluaXRpYWxUYWJJZH0sXG4gICAgICAgICAgICAgICAgICAgIC8qY2xhc3NOYW1lPSovbnVsbCwgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlKTtcblxuICAgICAgICAgICAgICAgIC8vIFZpZXcgdGhlIHdlbGNvbWUgb3IgaG9tZSBwYWdlIGlmIHdlIG5lZWQgc29tZXRoaW5nIHRvIGxvb2sgYXRcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdTb21ldGhpbmdCZWhpbmRNb2RhbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmlld19jcmVhdGVfcm9vbSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tKHBheWxvYWQucHVibGljKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfY3JlYXRlX2dyb3VwJzoge1xuICAgICAgICAgICAgICAgIGxldCBDcmVhdGVHcm91cERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkNyZWF0ZUdyb3VwRGlhbG9nXCIpXG4gICAgICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2NvbW11bml0aWVzX3YyX3Byb3RvdHlwZXNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgQ3JlYXRlR3JvdXBEaWFsb2cgPSBDcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2c7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NyZWF0ZSBDb21tdW5pdHknLCAnJywgQ3JlYXRlR3JvdXBEaWFsb2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVmlld1Jvb21EaXJlY3Rvcnk6IHtcbiAgICAgICAgICAgICAgICBpZiAoU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwidmlld19yb29tXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgUm9vbURpcmVjdG9yeSA9IHNkay5nZXRDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLlJvb21EaXJlY3RvcnlcIik7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Jvb20gZGlyZWN0b3J5JywgJycsIFJvb21EaXJlY3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxUZXh0OiBwYXlsb2FkLmluaXRpYWxUZXh0LFxuICAgICAgICAgICAgICAgICAgICB9LCAnbXhfUm9vbURpcmVjdG9yeV9kaWFsb2dXcmFwcGVyJywgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFZpZXcgdGhlIHdlbGNvbWUgb3IgaG9tZSBwYWdlIGlmIHdlIG5lZWQgc29tZXRoaW5nIHRvIGxvb2sgYXRcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdTb21ldGhpbmdCZWhpbmRNb2RhbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAndmlld19teV9ncm91cHMnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0UGFnZShQYWdlVHlwZXMuTXlHcm91cHMpO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdncm91cHMnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfZ3JvdXAnOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld0dyb3VwKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld193ZWxjb21lX3BhZ2UnOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld1dlbGNvbWUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfaG9tZV9wYWdlJzpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdIb21lKHBheWxvYWQuanVzdFJlZ2lzdGVyZWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19zdGFydF9jaGF0X29yX3JldXNlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXRDcmVhdGVPclJldXNlKHBheWxvYWQudXNlcl9pZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3X2NyZWF0ZV9jaGF0JzpcbiAgICAgICAgICAgICAgICBzaG93U3RhcnRDaGF0SW52aXRlRGlhbG9nKHBheWxvYWQuaW5pdGlhbFRleHQgfHwgXCJcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2aWV3X2ludml0ZSc6XG4gICAgICAgICAgICAgICAgc2hvd1Jvb21JbnZpdGVEaWFsb2cocGF5bG9hZC5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19sYXN0X3NjcmVlbic6XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBkb2VzIHdoYXQgd2Ugd2FudCwgZGVzcGl0ZSB0aGUgbmFtZS4gVGhlIGlkZWEgaXMgdGhhdCBpdCBzaG93c1xuICAgICAgICAgICAgICAgIC8vIHRoZSBsYXN0IHJvb20gd2Ugd2VyZSBsb29raW5nIGF0IG9yIHNvbWUgcmVhc29uYWJsZSBkZWZhdWx0L2d1ZXNzLiBXZSBkb24ndFxuICAgICAgICAgICAgICAgIC8vIGhhdmUgdG8gd29ycnkgYWJvdXQgZW1haWwgaW52aXRlcyBvciBzaW1pbGFyIGJlaW5nIHJlLXRyaWdnZXJlZCBiZWNhdXNlIHRoZVxuICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uIHdpbGwgaGF2ZSBjbGVhcmVkIHRoYXQgc3RhdGUgYW5kIG5vdCBleGVjdXRlIHRoYXQgcGF0aC5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dTY3JlZW5BZnRlckxvZ2luKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b2dnbGVfbXlfZ3JvdXBzJzpcbiAgICAgICAgICAgICAgICAvLyBXZSBqdXN0IGRpc3BhdGNoIHRoZSBwYWdlIGNoYW5nZSByYXRoZXIgdGhhbiBoYXZlIHRvIHdvcnJ5IGFib3V0XG4gICAgICAgICAgICAgICAgLy8gd2hhdCB0aGUgbG9naWMgaXMgZm9yIGVhY2ggb2YgdGhlc2UgYnJhbmNoZXMuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucGFnZV90eXBlID09PSBQYWdlVHlwZXMuTXlHcm91cHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2xhc3Rfc2NyZWVuJ30pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19teV9ncm91cHMnfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGlkZV9sZWZ0X3BhbmVsJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VMaHM6IHRydWUsXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnJlc2l6ZU5vdGlmaWVyLm5vdGlmeUxlZnRIYW5kbGVSZXNpemVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmb2N1c19yb29tX2ZpbHRlcic6IC8vIGZvciBDdHJsT3JDbWQrSyB0byB3b3JrIGJ5IGV4cGFuZGluZyB0aGUgbGVmdCBwYW5lbCBmaXJzdFxuICAgICAgICAgICAgY2FzZSAnc2hvd19sZWZ0X3BhbmVsJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VMaHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5yZXNpemVOb3RpZmllci5ub3RpZnlMZWZ0SGFuZGxlUmVzaXplZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uT3BlbkRpYWxQYWQ6XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRGlhbCBwYWQnLCAnJywgRGlhbFBhZE1vZGFsLCB7fSwgXCJteF9EaWFsb2dfZGlhbFBhZFdyYXBwZXJcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvbl9sb2dnZWRfaW4nOlxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCB0aGlzIGhhbmRsaW5nIGZvciB0b2tlbiBsb2dpbiBhcyB0aGF0IGFsd2F5cyBjYWxscyBvbkxvZ2dlZEluIGl0c2VsZlxuICAgICAgICAgICAgICAgICAgICAhdGhpcy50b2tlbkxvZ2luICYmXG4gICAgICAgICAgICAgICAgICAgICFMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS52aWV3ICE9PSBWaWV3cy5MT0dJTiAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnZpZXcgIT09IFZpZXdzLlJFR0lTVEVSICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudmlldyAhPT0gVmlld3MuQ09NUExFVEVfU0VDVVJJVFkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS52aWV3ICE9PSBWaWV3cy5FMkVfU0VUVVBcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkxvZ2dlZEluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnb25fY2xpZW50X25vdF92aWFibGUnOlxuICAgICAgICAgICAgICAgIHRoaXMub25Tb2Z0TG9nb3V0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvbl9sb2dnZWRfb3V0JzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uTG9nZ2VkT3V0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd3aWxsX3N0YXJ0X2NsaWVudCc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cmVhZHk6IGZhbHNlfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgY2xpZW50IGlzIGFib3V0IHRvIHN0YXJ0LCB3ZSBhcmUsIGJ5IGRlZmluaXRpb24sIG5vdCByZWFkeS5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHJlYWR5IHRvIGZhbHNlIG5vdywgdGhlbiBpdCdsbCBiZSBzZXQgdG8gdHJ1ZSB3aGVuIHRoZSBzeW5jXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpc3RlbmVyIHdlIHNldCBiZWxvdyBmaXJlcy5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbldpbGxTdGFydENsaWVudCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2xpZW50X3N0YXJ0ZWQnOlxuICAgICAgICAgICAgICAgIHRoaXMub25DbGllbnRTdGFydGVkKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzZW5kX2V2ZW50JzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2VuZEV2ZW50KHBheWxvYWQucm9vbV9pZCwgcGF5bG9hZC5ldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhcmlhX2hpZGVfbWFpbl9hcHAnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBoaWRlVG9TUlVzZXJzOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXJpYV91bmhpZGVfbWFpbl9hcHAnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBoaWRlVG9TUlVzZXJzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FjY2VwdF9jb29raWVzJzpcbiAgICAgICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiYW5hbHl0aWNzT3B0SW5cIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInNob3dDb29raWVCYXJcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGhpZGVBbmFseXRpY3NUb2FzdCgpO1xuICAgICAgICAgICAgICAgIGlmIChBbmFseXRpY3MuY2FuRW5hYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgQW5hbHl0aWNzLmVuYWJsZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS5jYW5FbmFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmVuYWJsZSgvKiBhbm9ueW1vdXMgPSAqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVqZWN0X2Nvb2tpZXMnOlxuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJhbmFseXRpY3NPcHRJblwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInNob3dDb29raWVCYXJcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGhpZGVBbmFseXRpY3NUb2FzdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2V0UGFnZShwYWdlVHlwZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFnZV90eXBlOiBwYWdlVHlwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzdGFydFJlZ2lzdHJhdGlvbihwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlOiBQYXJ0aWFsPElTdGF0ZT4gPSB7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5SRUdJU1RFUixcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBPbmx5IGhvbm91ciBwYXJhbXMgaWYgdGhleSBhcmUgYWxsIHByZXNlbnQsIG90aGVyd2lzZSB3ZSByZXNldFxuICAgICAgICAvLyBIUyBhbmQgSVMgVVJMcyB3aGVuIHN3aXRjaGluZyB0byByZWdpc3RyYXRpb24uXG4gICAgICAgIGlmIChwYXJhbXMuY2xpZW50X3NlY3JldCAmJlxuICAgICAgICAgICAgcGFyYW1zLnNlc3Npb25faWQgJiZcbiAgICAgICAgICAgIHBhcmFtcy5oc191cmwgJiZcbiAgICAgICAgICAgIHBhcmFtcy5pc191cmwgJiZcbiAgICAgICAgICAgIHBhcmFtcy5zaWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdTdGF0ZS5zZXJ2ZXJDb25maWcgPSBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyhcbiAgICAgICAgICAgICAgICBwYXJhbXMuaHNfdXJsLCBwYXJhbXMuaXNfdXJsLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgbmV3U3RhdGUucmVnaXN0ZXJfY2xpZW50X3NlY3JldCA9IHBhcmFtcy5jbGllbnRfc2VjcmV0O1xuICAgICAgICAgICAgbmV3U3RhdGUucmVnaXN0ZXJfc2Vzc2lvbl9pZCA9IHBhcmFtcy5zZXNzaW9uX2lkO1xuICAgICAgICAgICAgbmV3U3RhdGUucmVnaXN0ZXJfaWRfc2lkID0gcGFyYW1zLnNpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KG5ld1N0YXRlKTtcbiAgICAgICAgVGhlbWVDb250cm9sbGVyLmlzTG9naW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdyZWdpc3RlcicpO1xuICAgIH1cblxuICAgIC8vIHN3aXRjaCB2aWV3IHRvIHRoZSBnaXZlbiByb29tXG4gICAgLy9cbiAgICAvLyBAcGFyYW0ge09iamVjdH0gcm9vbUluZm8gT2JqZWN0IGNvbnRhaW5pbmcgZGF0YSBhYm91dCB0aGUgcm9vbSB0byBiZSBqb2luZWRcbiAgICAvLyBAcGFyYW0ge3N0cmluZz19IHJvb21JbmZvLnJvb21faWQgSUQgb2YgdGhlIHJvb20gdG8gam9pbi4gT25lIG9mIHJvb21faWQgb3Igcm9vbV9hbGlhcyBtdXN0IGJlIGdpdmVuLlxuICAgIC8vIEBwYXJhbSB7c3RyaW5nPX0gcm9vbUluZm8ucm9vbV9hbGlhcyBBbGlhcyBvZiB0aGUgcm9vbSB0byBqb2luLiBPbmUgb2Ygcm9vbV9pZCBvciByb29tX2FsaWFzIG11c3QgYmUgZ2l2ZW4uXG4gICAgLy8gQHBhcmFtIHtib29sZWFuPX0gcm9vbUluZm8uYXV0b19qb2luIElmIHRydWUsIGF1dG9tYXRpY2FsbHkgYXR0ZW1wdCB0byBqb2luIHRoZSByb29tIGlmIG5vdCBhbHJlYWR5IGEgbWVtYmVyLlxuICAgIC8vIEBwYXJhbSB7c3RyaW5nPX0gcm9vbUluZm8uZXZlbnRfaWQgSUQgb2YgdGhlIGV2ZW50IGluIHRoaXMgcm9vbSB0byBzaG93OiB0aGlzIHdpbGwgY2F1c2UgYSBzd2l0Y2ggdG8gdGhlXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0IG9mIHRoYXQgcGFydGljdWxhciBldmVudC5cbiAgICAvLyBAcGFyYW0ge2Jvb2xlYW49fSByb29tSW5mby5oaWdobGlnaHRlZCBJZiB0cnVlLCBhZGQgZXZlbnRfaWQgdG8gdGhlIGhhc2ggb2YgdGhlIFVSTFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBhbHRlciB0aGUgRXZlbnRUaWxlIHRvIGFwcGVhciBoaWdobGlnaHRlZC5cbiAgICAvLyBAcGFyYW0ge09iamVjdD19IHJvb21JbmZvLnRocmVlcGlkX2ludml0ZSBPYmplY3QgY29udGFpbmluZyBkYXRhIGFib3V0IHRoZSB0aGlyZCBwYXJ0eVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlIHJlY2VpdmVkIHRvIGpvaW4gdGhlIHJvb20sIGlmIGFueS5cbiAgICAvLyBAcGFyYW0ge09iamVjdD19IHJvb21JbmZvLm9vYl9kYXRhIE9iamVjdCBvZiBhZGRpdGlvbmFsIGRhdGEgYWJvdXQgdGhlIHJvb21cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0IGhhcyBiZWVuIHBhc3NlZCBvdXQtb2YtYmFuZCAoZWcuXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbSBuYW1lIGFuZCBhdmF0YXIgZnJvbSBhbiBpbnZpdGUgZW1haWwpXG4gICAgcHJpdmF0ZSB2aWV3Um9vbShyb29tSW5mbzogSVJvb21JbmZvKSB7XG4gICAgICAgIHRoaXMuZm9jdXNDb21wb3NlciA9IHRydWU7XG5cbiAgICAgICAgaWYgKHJvb21JbmZvLnJvb21fYWxpYXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGBTd2l0Y2hpbmcgdG8gcm9vbSBhbGlhcyAke3Jvb21JbmZvLnJvb21fYWxpYXN9IGF0IGV2ZW50IGAgK1xuICAgICAgICAgICAgICAgIHJvb21JbmZvLmV2ZW50X2lkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTd2l0Y2hpbmcgdG8gcm9vbSBpZCAke3Jvb21JbmZvLnJvb21faWR9IGF0IGV2ZW50IGAgK1xuICAgICAgICAgICAgICAgIHJvb21JbmZvLmV2ZW50X2lkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdhaXQgZm9yIHRoZSBmaXJzdCBzeW5jIHRvIGNvbXBsZXRlIHNvIHRoYXQgaWYgYSByb29tIGRvZXMgaGF2ZSBhbiBhbGlhcyxcbiAgICAgICAgLy8gaXQgd291bGQgaGF2ZSBiZWVuIHJldHJpZXZlZC5cbiAgICAgICAgbGV0IHdhaXRGb3IgPSBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgIGlmICghdGhpcy5maXJzdFN5bmNDb21wbGV0ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmZpcnN0U3luY1Byb21pc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Nhbm5vdCB2aWV3IGEgcm9vbSBiZWZvcmUgZmlyc3Qgc3luYy4gcm9vbV9pZDonLCByb29tSW5mby5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YWl0Rm9yID0gdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd2FpdEZvci50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBwcmVzZW50ZWRJZCA9IHJvb21JbmZvLnJvb21fYWxpYXMgfHwgcm9vbUluZm8ucm9vbV9pZDtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSW5mby5yb29tX2lkKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGhlQWxpYXMgPSBSb29tcy5nZXREaXNwbGF5QWxpYXNGb3JSb29tKHJvb20pO1xuICAgICAgICAgICAgICAgIGlmICh0aGVBbGlhcykge1xuICAgICAgICAgICAgICAgICAgICBwcmVzZW50ZWRJZCA9IHRoZUFsaWFzO1xuICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSBkaXNwbGF5IGFsaWFzIG9mIHRoZSBwcmVzZW50ZWQgcm9vbSBpbiBjYWNoZSB0byBzcGVlZCBmdXR1cmVcbiAgICAgICAgICAgICAgICAgICAgLy8gbmF2aWdhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgc3RvcmVSb29tQWxpYXNJbkNhY2hlKHRoZUFsaWFzLCByb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhpcyBhcyB0aGUgSUQgb2YgdGhlIGxhc3Qgcm9vbSBhY2Nlc3NlZC4gVGhpcyBpcyBzbyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgICAgIC8vIHBlcnNpc3Qgd2hpY2ggcm9vbSBpcyBiZWluZyBzdG9yZWQgYWNyb3NzIHJlZnJlc2hlcyBhbmQgYnJvd3NlciBxdWl0cy5cbiAgICAgICAgICAgICAgICBpZiAobG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdteF9sYXN0X3Jvb21faWQnLCByb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgcmVkaXJlY3RpbmcgdG8gYSBSb29tIEFsaWFzIGFuZCBpdCBpcyBmb3IgdGhlIHJvb20gd2UgYWxyZWFkeSBzaG93aW5nIHRoZW4gcmVwbGFjZSBoaXN0b3J5IGl0ZW1cbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VMYXN0ID0gcHJlc2VudGVkSWRbMF0gPT09IFwiI1wiICYmIHJvb21JbmZvLnJvb21faWQgPT09IHRoaXMuc3RhdGUuY3VycmVudFJvb21JZDtcblxuICAgICAgICAgICAgaWYgKHJvb21JbmZvLmV2ZW50X2lkICYmIHJvb21JbmZvLmhpZ2hsaWdodGVkKSB7XG4gICAgICAgICAgICAgICAgcHJlc2VudGVkSWQgKz0gXCIvXCIgKyByb29tSW5mby5ldmVudF9pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0dFRF9JTixcbiAgICAgICAgICAgICAgICBjdXJyZW50Um9vbUlkOiByb29tSW5mby5yb29tX2lkIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgcGFnZV90eXBlOiBQYWdlVHlwZXMuUm9vbVZpZXcsXG4gICAgICAgICAgICAgICAgdGhyZWVwaWRJbnZpdGU6IHJvb21JbmZvLnRocmVlcGlkX2ludml0ZSxcbiAgICAgICAgICAgICAgICByb29tT29iRGF0YTogcm9vbUluZm8ub29iX2RhdGEsXG4gICAgICAgICAgICAgICAgcmVhZHk6IHRydWUsXG4gICAgICAgICAgICAgICAgcm9vbUp1c3RDcmVhdGVkT3B0czogcm9vbUluZm8uanVzdENyZWF0ZWRPcHRzLFxuICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdyb29tLycgKyBwcmVzZW50ZWRJZCwgcmVwbGFjZUxhc3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdmlld0dyb3VwKHBheWxvYWQpIHtcbiAgICAgICAgY29uc3QgZ3JvdXBJZCA9IHBheWxvYWQuZ3JvdXBfaWQ7XG5cbiAgICAgICAgLy8gV2FpdCBmb3IgdGhlIGZpcnN0IHN5bmMgdG8gY29tcGxldGVcbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0U3luY0NvbXBsZXRlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZmlyc3RTeW5jUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2Fubm90IHZpZXcgYSBncm91cCBiZWZvcmUgZmlyc3Qgc3luYy4gZ3JvdXBfaWQ6JywgZ3JvdXBJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0dFRF9JTixcbiAgICAgICAgICAgIGN1cnJlbnRHcm91cElkOiBncm91cElkLFxuICAgICAgICAgICAgY3VycmVudEdyb3VwSXNOZXc6IHBheWxvYWQuZ3JvdXBfaXNfbmV3LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRQYWdlKFBhZ2VUeXBlcy5Hcm91cFZpZXcpO1xuICAgICAgICB0aGlzLm5vdGlmeU5ld1NjcmVlbignZ3JvdXAvJyArIGdyb3VwSWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmlld1NvbWV0aGluZ0JlaGluZE1vZGFsKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52aWV3ICE9PSBWaWV3cy5MT0dHRURfSU4pIHtcbiAgICAgICAgICAgIHRoaXMudmlld1dlbGNvbWUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY3VycmVudEdyb3VwSWQgJiYgIXRoaXMuc3RhdGUuY3VycmVudFJvb21JZCkge1xuICAgICAgICAgICAgdGhpcy52aWV3SG9tZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3V2VsY29tZSgpIHtcbiAgICAgICAgaWYgKHNob3VsZFVzZUxvZ2luRm9yV2VsY29tZShTZGtDb25maWcuZ2V0KCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3TG9naW4oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5XRUxDT01FLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3dlbGNvbWUnKTtcbiAgICAgICAgVGhlbWVDb250cm9sbGVyLmlzTG9naW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3TG9naW4ob3RoZXJTdGF0ZT86IGFueSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlRm9yTmV3Vmlldyh7XG4gICAgICAgICAgICB2aWV3OiBWaWV3cy5MT0dJTixcbiAgICAgICAgICAgIC4uLm90aGVyU3RhdGUsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5vdGlmeU5ld1NjcmVlbignbG9naW4nKTtcbiAgICAgICAgVGhlbWVDb250cm9sbGVyLmlzTG9naW4gPSB0cnVlO1xuICAgICAgICB0aGlzLnRoZW1lV2F0Y2hlci5yZWNoZWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWV3SG9tZShqdXN0UmVnaXN0ZXJlZCA9IGZhbHNlKSB7XG4gICAgICAgIC8vIFRoZSBob21lIHBhZ2UgcmVxdWlyZXMgdGhlIFwibG9nZ2VkIGluXCIgdmlldywgc28gd2UnbGwgc2V0IHRoYXQuXG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLkxPR0dFRF9JTixcbiAgICAgICAgICAgIGp1c3RSZWdpc3RlcmVkLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRQYWdlKFBhZ2VUeXBlcy5Ib21lUGFnZSk7XG4gICAgICAgIHRoaXMubm90aWZ5TmV3U2NyZWVuKCdob21lJyk7XG4gICAgICAgIFRoZW1lQ29udHJvbGxlci5pc0xvZ2luID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnJlY2hlY2soKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdVc2VyKHVzZXJJZDogc3RyaW5nLCBzdWJBY3Rpb246IHN0cmluZykge1xuICAgICAgICAvLyBXYWl0IGZvciB0aGUgZmlyc3Qgc3luYyBzbyB0aGF0IGBnZXRSb29tYCBnaXZlcyB1cyBhIHJvb20gb2JqZWN0IGlmIGl0J3NcbiAgICAgICAgLy8gaW4gdGhlIHN5bmMgcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgd2FpdEZvclN5bmMgPSB0aGlzLmZpcnN0U3luY1Byb21pc2UgP1xuICAgICAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlLnByb21pc2UgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgd2FpdEZvclN5bmMudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3ViQWN0aW9uID09PSAnY2hhdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXRDcmVhdGVPclJldXNlKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3VzZXIvJyArIHVzZXJJZCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXJyZW50VXNlcklkOiB1c2VySWR9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0UGFnZShQYWdlVHlwZXMuVXNlclZpZXcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVJvb20oZGVmYXVsdFB1YmxpYyA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IGNvbW11bml0eUlkID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpO1xuICAgICAgICBpZiAoY29tbXVuaXR5SWQpIHtcbiAgICAgICAgICAgIC8vIGRvdWJsZSBjaGVjayB0aGUgdXNlciB3aWxsIGhhdmUgcGVybWlzc2lvbiB0byBhc3NvY2lhdGUgdGhpcyByb29tIHdpdGggdGhlIGNvbW11bml0eVxuICAgICAgICAgICAgaWYgKCFDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5pc0FkbWluT2YoY29tbXVuaXR5SWQpKSB7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnUHJlLWZhaWx1cmUgdG8gY3JlYXRlIHJvb20nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQ2Fubm90IGNyZWF0ZSByb29tcyBpbiB0aGlzIGNvbW11bml0eVwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gY3JlYXRlIHJvb21zIGluIHRoaXMgY29tbXVuaXR5LlwiKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBDcmVhdGVSb29tRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5DcmVhdGVSb29tRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ3JlYXRlIFJvb20nLCAnJywgQ3JlYXRlUm9vbURpYWxvZywgeyBkZWZhdWx0UHVibGljIH0pO1xuXG4gICAgICAgIGNvbnN0IFtzaG91bGRDcmVhdGUsIG9wdHNdID0gYXdhaXQgbW9kYWwuZmluaXNoZWQ7XG4gICAgICAgIGlmIChzaG91bGRDcmVhdGUpIHtcbiAgICAgICAgICAgIGNyZWF0ZVJvb20ob3B0cyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoYXRDcmVhdGVPclJldXNlKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgICAgIC8vIFVzZSBhIGRlZmVycmVkIGFjdGlvbiB0byByZXNob3cgdGhlIGRpYWxvZyBvbmNlIHRoZSB1c2VyIGhhcyByZWdpc3RlcmVkXG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICAvLyBObyBwb2ludCBpbiBtYWtpbmcgMiBETXMgd2l0aCB3ZWxjb21lIGJvdC4gVGhpcyBhc3N1bWVzIHZpZXdfc2V0X214aWQgd2lsbFxuICAgICAgICAgICAgLy8gcmVzdWx0IGluIGEgbmV3IERNIHdpdGggdGhlIHdlbGNvbWUgdXNlci5cbiAgICAgICAgICAgIGlmICh1c2VySWQgIT09IHRoaXMucHJvcHMuY29uZmlnLndlbGNvbWVVc2VySWQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdkb19hZnRlcl9zeW5jX3ByZXBhcmVkJyxcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRfYWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3N0YXJ0X2NoYXRfb3JfcmV1c2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbicsXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNldF9teGlkIGRpYWxvZyBpcyBjYW5jZWxsZWQsIHZpZXcgL3dlbGNvbWUgYmVjYXVzZSBpZiB0aGVcbiAgICAgICAgICAgICAgICAvLyBicm93c2VyIHdhcyBwb2ludGluZyBhdCAvdXNlci9Ac29tZW9uZTpkb21haW4/YWN0aW9uPWNoYXQsIHRoZSBVUkxcbiAgICAgICAgICAgICAgICAvLyBuZWVkcyB0byBiZSByZXNldCBzbyB0aGF0IHRoZXkgY2FuIHJldmlzaXQgL3VzZXIvLi4gLy8gKGFuZCB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgLy8gYF9jaGF0Q3JlYXRlT3JSZXVzZWAgYWdhaW4pXG4gICAgICAgICAgICAgICAgZ29fd2VsY29tZV9vbl9jYW5jZWw6IHRydWUsXG4gICAgICAgICAgICAgICAgc2NyZWVuX2FmdGVyOiB7XG4gICAgICAgICAgICAgICAgICAgIHNjcmVlbjogYHVzZXIvJHt0aGlzLnByb3BzLmNvbmZpZy53ZWxjb21lVXNlcklkfWAsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczogeyBhY3Rpb246ICdjaGF0JyB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IEltbXV0YWJsZSBETXMgcmVwbGFjZXMgdGhpc1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgZG1Sb29tTWFwID0gbmV3IERNUm9vbU1hcChjbGllbnQpO1xuICAgICAgICBjb25zdCBkbVJvb21zID0gZG1Sb29tTWFwLmdldERNUm9vbXNGb3JVc2VySWQodXNlcklkKTtcblxuICAgICAgICBpZiAoZG1Sb29tcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogZG1Sb29tc1swXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdzdGFydF9jaGF0JyxcbiAgICAgICAgICAgICAgICB1c2VyX2lkOiB1c2VySWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbGVhdmVSb29tV2FybmluZ3Mocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgcm9vbVRvTGVhdmUgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBjb25zdCBpc1NwYWNlID0gcm9vbVRvTGVhdmU/LmlzU3BhY2VSb29tKCk7XG4gICAgICAgIC8vIFNob3cgYSB3YXJuaW5nIGlmIHRoZXJlIGFyZSBhZGRpdGlvbmFsIGNvbXBsaWNhdGlvbnMuXG4gICAgICAgIGNvbnN0IHdhcm5pbmdzID0gW107XG5cbiAgICAgICAgY29uc3QgbWVtYmVyQ291bnQgPSByb29tVG9MZWF2ZS5jdXJyZW50U3RhdGUuZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKTtcbiAgICAgICAgaWYgKG1lbWJlckNvdW50ID09PSAxKSB7XG4gICAgICAgICAgICB3YXJuaW5ncy5wdXNoKChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3YXJuaW5nXCIga2V5PVwib25seV9tZW1iZXJfd2FybmluZ1wiPlxuICAgICAgICAgICAgICAgICAgICB7JyAnLyogV2hpdGVzcGFjZSwgb3RoZXJ3aXNlIHRoZSBzZW50ZW5jZXMgZ2V0IHNtYXNoZWQgdG9nZXRoZXIgKi8gfVxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiWW91IGFyZSB0aGUgb25seSBwZXJzb24gaGVyZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJJZiB5b3UgbGVhdmUsIG5vIG9uZSB3aWxsIGJlIGFibGUgdG8gam9pbiBpbiB0aGUgZnV0dXJlLCBpbmNsdWRpbmcgeW91LlwiKSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB3YXJuaW5ncztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGpvaW5SdWxlcyA9IHJvb21Ub0xlYXZlLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLmpvaW5fcnVsZXMnLCAnJyk7XG4gICAgICAgIGlmIChqb2luUnVsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBqb2luUnVsZXMuZ2V0Q29udGVudCgpLmpvaW5fcnVsZTtcbiAgICAgICAgICAgIGlmIChydWxlICE9PSBcInB1YmxpY1wiKSB7XG4gICAgICAgICAgICAgICAgd2FybmluZ3MucHVzaCgoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndhcm5pbmdcIiBrZXk9XCJub25fcHVibGljX3dhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsnICcvKiBXaGl0ZXNwYWNlLCBvdGhlcndpc2UgdGhlIHNlbnRlbmNlcyBnZXQgc21hc2hlZCB0b2dldGhlciAqLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlzU3BhY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiVGhpcyBzcGFjZSBpcyBub3QgcHVibGljLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byByZWpvaW4gd2l0aG91dCBhbiBpbnZpdGUuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlRoaXMgcm9vbSBpcyBub3QgcHVibGljLiBZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byByZWpvaW4gd2l0aG91dCBhbiBpbnZpdGUuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3YXJuaW5ncztcbiAgICB9XG5cbiAgICBwcml2YXRlIGxlYXZlUm9vbShyb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCByb29tVG9MZWF2ZSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGNvbnN0IHdhcm5pbmdzID0gdGhpcy5sZWF2ZVJvb21XYXJuaW5ncyhyb29tSWQpO1xuXG4gICAgICAgIGNvbnN0IGlzU3BhY2UgPSByb29tVG9MZWF2ZT8uaXNTcGFjZVJvb20oKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhpc1NwYWNlID8gXCJMZWF2ZSBzcGFjZVwiIDogXCJMZWF2ZSByb29tXCIsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IGlzU3BhY2UgPyBfdChcIkxlYXZlIHNwYWNlXCIpIDogX3QoXCJMZWF2ZSByb29tXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IChcbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgeyBpc1NwYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGxlYXZlIHRoZSBzcGFjZSAnJShzcGFjZU5hbWUpcyc/XCIsIHtzcGFjZU5hbWU6IHJvb21Ub0xlYXZlLm5hbWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsZWF2ZSB0aGUgcm9vbSAnJShyb29tTmFtZSlzJz9cIiwge3Jvb21OYW1lOiByb29tVG9MZWF2ZS5uYW1lfSkgfVxuICAgICAgICAgICAgICAgICAgICB7IHdhcm5pbmdzIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIkxlYXZlXCIpLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKHNob3VsZExlYXZlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExlYXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBsZWF2ZVJvb21CZWhhdmlvdXIocm9vbUlkKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogY29udHJvbGxlciBzaG91bGRuJ3QgYmUgbG9hZGluZyBhIHZpZXcgOihcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgTG9hZGVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlRGlhbG9nKExvYWRlciwgbnVsbCwgJ214X0RpYWxvZ19zcGlubmVyJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZC5maW5hbGx5KCgpID0+IG1vZGFsLmNsb3NlKCkpO1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImFmdGVyX2xlYXZlX3Jvb21cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmb3JnZXRSb29tKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZm9yZ2V0KHJvb21JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBTd2l0Y2ggdG8gaG9tZSBwYWdlIGlmIHdlJ3JlIGN1cnJlbnRseSB2aWV3aW5nIHRoZSBmb3Jnb3R0ZW4gcm9vbVxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCA9PT0gcm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfaG9tZV9wYWdlXCIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gbWFudWFsbHkgdXBkYXRlIHRoZSByb29tIGxpc3QgYmVjYXVzZSB0aGUgZm9yZ290dGVuIHJvb20gd2lsbCBub3RcbiAgICAgICAgICAgIC8vIGJlIG5vdGlmaWVkIHRvIHVzLCB0aGVyZWZvcmUgdGhlIHJvb20gbGlzdCB3aWxsIGhhdmUgbm8gb3RoZXIgd2F5IG9mIGtub3dpbmdcbiAgICAgICAgICAgIC8vIHRoZSByb29tIGlzIGZvcmdvdHRlbi5cbiAgICAgICAgICAgIFJvb21MaXN0U3RvcmUuaW5zdGFuY2UubWFudWFsUm9vbVVwZGF0ZShyb29tLCBSb29tVXBkYXRlQ2F1c2UuUm9vbVJlbW92ZWQpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnJDb2RlID0gZXJyLmVycmNvZGUgfHwgX3RkKFwidW5rbm93biBlcnJvciBjb2RlXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIkZhaWxlZCB0byBmb3JnZXQgcm9vbVwiLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gZm9yZ2V0IHJvb20gJShlcnJDb2RlKXNcIiwge2VyckNvZGV9KSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhIGNoYXQgd2l0aCB0aGUgd2VsY29tZSB1c2VyLCBpZiB0aGUgdXNlciBkb2Vzbid0IGFscmVhZHkgaGF2ZSBvbmVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcm9vbSBJRCBvZiB0aGUgbmV3IHJvb20sIG9yIG51bGwgaWYgbm8gcm9vbSB3YXMgY3JlYXRlZFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgc3RhcnRXZWxjb21lVXNlckNoYXQoKSB7XG4gICAgICAgIC8vIFdlIGNhbiBlbmQgdXAgd2l0aCBtdWx0aXBsZSB0YWJzIHBvc3QtcmVnaXN0cmF0aW9uIHdoZXJlIHRoZSB1c2VyXG4gICAgICAgIC8vIG1pZ2h0IHRoZW4gZW5kIHVwIHdpdGggYSBzZXNzaW9uIGFuZCB3ZSBkb24ndCB3YW50IHRoZW0gYWxsIG1ha2luZ1xuICAgICAgICAvLyBhIGNoYXQgd2l0aCB0aGUgd2VsY29tZSB1c2VyOiB0cnkgdG8gZGUtZHVwZS5cbiAgICAgICAgLy8gV2UgbmVlZCB0byB3YWl0IGZvciB0aGUgZmlyc3Qgc3luYyB0byBjb21wbGV0ZSBmb3IgdGhpcyB0b1xuICAgICAgICAvLyB3b3JrIHRob3VnaC5cbiAgICAgICAgbGV0IHdhaXRGb3I7XG4gICAgICAgIGlmICghdGhpcy5maXJzdFN5bmNDb21wbGV0ZSkge1xuICAgICAgICAgICAgd2FpdEZvciA9IHRoaXMuZmlyc3RTeW5jUHJvbWlzZS5wcm9taXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2FpdEZvciA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHdhaXRGb3I7XG5cbiAgICAgICAgY29uc3Qgd2VsY29tZVVzZXJSb29tcyA9IERNUm9vbU1hcC5zaGFyZWQoKS5nZXRETVJvb21zRm9yVXNlcklkKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5jb25maWcud2VsY29tZVVzZXJJZCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHdlbGNvbWVVc2VyUm9vbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBhd2FpdCBjcmVhdGVSb29tKHtcbiAgICAgICAgICAgICAgICBkbVVzZXJJZDogdGhpcy5wcm9wcy5jb25maWcud2VsY29tZVVzZXJJZCxcbiAgICAgICAgICAgICAgICAvLyBPbmx5IHZpZXcgdGhlIHdlbGNvbWUgdXNlciBpZiB3ZSdyZSBOT1QgbG9va2luZyBhdCBhIHJvb21cbiAgICAgICAgICAgICAgICBhbmRWaWV3OiAhdGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkLFxuICAgICAgICAgICAgICAgIHNwaW5uZXI6IGZhbHNlLCAvLyB3ZSdyZSBhbHJlYWR5IHNob3dpbmcgb25lOiB3ZSBkb24ndCBuZWVkIGFub3RoZXIgb25lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBiaXQgb2YgYSBoYWNrLCBidXQgc2luY2UgdGhlIGRlZHVwbGljYXRpb24gcmVsaWVzXG4gICAgICAgICAgICAvLyBvbiBtLmRpcmVjdCBiZWluZyB1cCB0byBkYXRlLCB3ZSBuZWVkIHRvIGZvcmNlIGEgc3luY1xuICAgICAgICAgICAgLy8gb2YgdGhlIGRhdGFiYXNlLCBvdGhlcndpc2UgaWYgdGhlIHVzZXIgZ29lcyB0byB0aGUgb3RoZXJcbiAgICAgICAgICAgIC8vIHRhYiBiZWZvcmUgdGhlIG5leHQgc2F2ZSBoYXBwZW5zIChhIGZldyBtaW51dGVzKSwgdGhlXG4gICAgICAgICAgICAvLyBzYXZlZCBzeW5jIHdpbGwgYmUgcmVzdG9yZWQgZnJvbSB0aGUgZGIgYW5kIHRoaXMgY29kZSB3aWxsXG4gICAgICAgICAgICAvLyBydW4gd2l0aG91dCB0aGUgdXBkYXRlIHRvIG0uZGlyZWN0LCBtYWtpbmcgYW5vdGhlciB3ZWxjb21lXG4gICAgICAgICAgICAvLyB1c2VyIHJvb20gKGl0IGRvZXNuJ3Qgd2FpdCBmb3IgbmV3IGRhdGEgZnJvbSB0aGUgc2VydmVyLCBqdXN0XG4gICAgICAgICAgICAvLyB0aGUgc2F2ZWQgc3luYyB0byBiZSBsb2FkZWQpLlxuICAgICAgICAgICAgY29uc3Qgc2F2ZVdlbGNvbWVVc2VyID0gKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBldi5nZXRUeXBlKCkgPT09ICdtLmRpcmVjdCcgJiZcbiAgICAgICAgICAgICAgICAgICAgZXYuZ2V0Q29udGVudCgpICYmXG4gICAgICAgICAgICAgICAgICAgIGV2LmdldENvbnRlbnQoKVt0aGlzLnByb3BzLmNvbmZpZy53ZWxjb21lVXNlcklkXVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcmUuc2F2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhY2NvdW50RGF0YVwiLCBzYXZlV2VsY29tZVVzZXIsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcImFjY291bnREYXRhXCIsIHNhdmVXZWxjb21lVXNlcik7XG5cbiAgICAgICAgICAgIHJldHVybiByb29tSWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gYSBuZXcgbG9nZ2VkIGluIHNlc3Npb24gaGFzIHN0YXJ0ZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIG9uTG9nZ2VkSW4oKSB7XG4gICAgICAgIFRoZW1lQ29udHJvbGxlci5pc0xvZ2luID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyLnJlY2hlY2soKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZUZvck5ld1ZpZXcoeyB2aWV3OiBWaWV3cy5MT0dHRURfSU4gfSk7XG4gICAgICAgIC8vIElmIGEgc3BlY2lmaWMgc2NyZWVuIGlzIHNldCB0byBiZSBzaG93biBhZnRlciBsb2dpbiwgc2hvdyB0aGF0IGFib3ZlXG4gICAgICAgIC8vIGFsbCBlbHNlLCBhcyBpdCBwcm9iYWJseSBtZWFucyB0aGUgdXNlciBjbGlja2VkIG9uIHNvbWV0aGluZyBhbHJlYWR5LlxuICAgICAgICBpZiAodGhpcy5zY3JlZW5BZnRlckxvZ2luICYmIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW4pIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NjcmVlbihcbiAgICAgICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4uc2NyZWVuLFxuICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5wYXJhbXMsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmIChNYXRyaXhDbGllbnRQZWcuY3VycmVudFVzZXJJc0p1c3RSZWdpc3RlcmVkKCkpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5zZXRKdXN0UmVnaXN0ZXJlZFVzZXJJZChudWxsKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuY29uZmlnLndlbGNvbWVVc2VySWQgJiYgZ2V0Q3VycmVudExhbmd1YWdlKCkuc3RhcnRzV2l0aChcImVuXCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2VsY29tZVVzZXJSb29tID0gYXdhaXQgdGhpcy5zdGFydFdlbGNvbWVVc2VyQ2hhdCgpO1xuICAgICAgICAgICAgICAgIGlmICh3ZWxjb21lVXNlclJvb20gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgZGlkbid0IHJlZGlyZWN0IHRvIHRoZSB3ZWxjb21lIHVzZXIgcm9vbSwgc28gc2hvd1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgaG9tZXBhZ2UuXG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19ob21lX3BhZ2UnLCBqdXN0UmVnaXN0ZXJlZDogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoVGhyZWVwaWRJbnZpdGVTdG9yZS5pbnN0YW5jZS5waWNrQmVzdEludml0ZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHVzZXIgaGFzIGEgM3BpZCBpbnZpdGUgcGVuZGluZyAtIHNob3cgdGhlbSB0aGF0XG4gICAgICAgICAgICAgICAgY29uc3QgdGhyZWVwaWRJbnZpdGUgPSBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnBpY2tCZXN0SW52aXRlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBIQUNLOiBUaGlzIGlzIGEgcHJldHR5IGJydXRhbCB3YXkgb2YgdGhyZWFkaW5nIHRoZSBpbnZpdGUgYmFjayB0aHJvdWdoXG4gICAgICAgICAgICAgICAgLy8gb3VyIHN5c3RlbXMsIGJ1dCBpdCdzIHRoZSBzYWZlc3Qgd2UgaGF2ZSBmb3Igbm93LlxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UudHJhbnNsYXRlVG9XaXJlRm9ybWF0KHRocmVlcGlkSW52aXRlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dTY3JlZW4oYHJvb20vJHt0aHJlZXBpZEludml0ZS5yb29tSWR9YCwgcGFyYW1zKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgdXNlciBoYXMganVzdCBsb2dnZWQgaW4gYWZ0ZXIgcmVnaXN0ZXJpbmcsXG4gICAgICAgICAgICAgICAgLy8gc28gc2hvdyB0aGUgaG9tZXBhZ2UuXG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2hvbWVfcGFnZScsIGp1c3RSZWdpc3RlcmVkOiB0cnVlfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3dTY3JlZW5BZnRlckxvZ2luKCk7XG4gICAgICAgIH1cblxuICAgICAgICBTdG9yYWdlTWFuYWdlci50cnlQZXJzaXN0U3RvcmFnZSgpO1xuXG4gICAgICAgIC8vIGRlZmVyIHRoZSBmb2xsb3dpbmcgYWN0aW9ucyBieSAzMCBzZWNvbmRzIHRvIG5vdCB0aHJvdyB0aGVtIGF0IHRoZSB1c2VyIGltbWVkaWF0ZWx5XG4gICAgICAgIGF3YWl0IHNsZWVwKDMwKTtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93Q29va2llQmFyXCIpICYmXG4gICAgICAgICAgICAoQW5hbHl0aWNzLmNhbkVuYWJsZSgpIHx8IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UuY2FuRW5hYmxlKCkpXG4gICAgICAgICkge1xuICAgICAgICAgICAgc2hvd0FuYWx5dGljc1RvYXN0KHRoaXMucHJvcHMuY29uZmlnLnBpd2lrPy5wb2xpY3lVcmwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChTZGtDb25maWcuZ2V0KCkubW9iaWxlR3VpZGVUb2FzdCkge1xuICAgICAgICAgICAgLy8gVGhlIHRvYXN0IGNvbnRhaW5zIGZ1cnRoZXIgbG9naWMgdG8gZGV0ZWN0IG1vYmlsZSBwbGF0Zm9ybXMsXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBpdCBoYXMgYmVlbiBkaXNtaXNzZWQgYmVmb3JlLCBldGMuXG4gICAgICAgICAgICBzaG93TW9iaWxlR3VpZGVUb2FzdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93U2NyZWVuQWZ0ZXJMb2dpbigpIHtcbiAgICAgICAgLy8gSWYgc2NyZWVuQWZ0ZXJMb2dpbiBpcyBzZXQsIHVzZSB0aGF0LCB0aGVuIG51bGwgaXQgc28gdGhhdCBhIHNlY29uZCBsb2dpbiB3aWxsXG4gICAgICAgIC8vIHJlc3VsdCBpbiB2aWV3X2hvbWVfcGFnZSwgX3VzZXJfc2V0dGluZ3Mgb3IgX3Jvb21fZGlyZWN0b3J5XG4gICAgICAgIGlmICh0aGlzLnNjcmVlbkFmdGVyTG9naW4gJiYgdGhpcy5zY3JlZW5BZnRlckxvZ2luLnNjcmVlbikge1xuICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuKFxuICAgICAgICAgICAgICAgIHRoaXMuc2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW4sXG4gICAgICAgICAgICAgICAgdGhpcy5zY3JlZW5BZnRlckxvZ2luLnBhcmFtcyxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnNjcmVlbkFmdGVyTG9naW4gPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbXhfbGFzdF9yb29tX2lkJykpIHtcbiAgICAgICAgICAgIC8vIEJlZm9yZSBkZWZhdWx0aW5nIHRvIGRpcmVjdG9yeSwgc2hvdyB0aGUgbGFzdCB2aWV3ZWQgcm9vbVxuICAgICAgICAgICAgdGhpcy52aWV3TGFzdFJvb20oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X3dlbGNvbWVfcGFnZSd9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2hvbWVfcGFnZSd9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlld0xhc3RSb29tKCkge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIHJvb21faWQ6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdteF9sYXN0X3Jvb21faWQnKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIHNlc3Npb24gaXMgbG9nZ2VkIG91dFxuICAgICAqL1xuICAgIHByaXZhdGUgb25Mb2dnZWRPdXQoKSB7XG4gICAgICAgIHRoaXMudmlld0xvZ2luKHtcbiAgICAgICAgICAgIHJlYWR5OiBmYWxzZSxcbiAgICAgICAgICAgIGNvbGxhcHNlTGhzOiBmYWxzZSxcbiAgICAgICAgICAgIGN1cnJlbnRSb29tSWQ6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnN1YlRpdGxlU3RhdHVzID0gJyc7XG4gICAgICAgIHRoaXMuc2V0UGFnZVN1YnRpdGxlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIHNlc3Npb24gaXMgc29mdGx5IGxvZ2dlZCBvdXRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uU29mdExvZ291dCgpIHtcbiAgICAgICAgdGhpcy5ub3RpZnlOZXdTY3JlZW4oJ3NvZnRfbG9nb3V0Jyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGVGb3JOZXdWaWV3KHtcbiAgICAgICAgICAgIHZpZXc6IFZpZXdzLlNPRlRfTE9HT1VULFxuICAgICAgICAgICAgcmVhZHk6IGZhbHNlLFxuICAgICAgICAgICAgY29sbGFwc2VMaHM6IGZhbHNlLFxuICAgICAgICAgICAgY3VycmVudFJvb21JZDogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgPSAnJztcbiAgICAgICAgdGhpcy5zZXRQYWdlU3VidGl0bGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQganVzdCBiZWZvcmUgdGhlIG1hdHJpeCBjbGllbnQgaXMgc3RhcnRlZFxuICAgICAqICh1c2VmdWwgZm9yIHNldHRpbmcgbGlzdGVuZXJzKVxuICAgICAqL1xuICAgIHByaXZhdGUgb25XaWxsU3RhcnRDbGllbnQoKSB7XG4gICAgICAgIC8vIHJlc2V0IHRoZSAnaGF2ZSBjb21wbGV0ZWQgZmlyc3Qgc3luYycgZmxhZyxcbiAgICAgICAgLy8gc2luY2Ugd2UncmUgYWJvdXQgdG8gc3RhcnQgdGhlIGNsaWVudCBhbmQgdGhlcmVmb3JlIGFib3V0XG4gICAgICAgIC8vIHRvIGRvIHRoZSBmaXJzdCBzeW5jXG4gICAgICAgIHRoaXMuZmlyc3RTeW5jQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5maXJzdFN5bmNQcm9taXNlID0gZGVmZXIoKTtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIC8vIEFsbG93IHRoZSBKUyBTREsgdG8gcmVhcCB0aW1lbGluZSBldmVudHMuIFRoaXMgcmVkdWNlcyB0aGUgYW1vdW50IG9mXG4gICAgICAgIC8vIG1lbW9yeSBjb25zdW1lZCBhcyB0aGUgSlMgU0RLIHN0b3JlcyBtdWx0aXBsZSBkaXN0aW5jdCBjb3BpZXMgb2Ygcm9vbVxuICAgICAgICAvLyBzdGF0ZSAoZWFjaCBvZiB3aGljaCBjYW4gYmUgMTBzIG9mIE1CcykgZm9yIGVhY2ggRElTSk9JTlQgdGltZWxpbmUuIFRoaXMgaXNcbiAgICAgICAgLy8gcGFydGljdWxhcmx5IG5vdGljZWFibGUgd2hlbiB0aGVyZSBhcmUgbG90cyBvZiAnbGltaXRlZCcgL3N5bmMgcmVzcG9uc2VzXG4gICAgICAgIC8vIHN1Y2ggYXMgd2hlbiBsYXB0b3BzIHVuc2xlZXAuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzMzMDcjaXNzdWVjb21tZW50LTI4Mjg5NTU2OFxuICAgICAgICBjbGkuc2V0Q2FuUmVzZXRUaW1lbGluZUNhbGxiYWNrKChyb29tSWQpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVxdWVzdCB0byByZXNldCB0aW1lbGluZSBpbiByb29tIFwiLCByb29tSWQsIFwiIHZpZXdpbmc6XCIsIHRoaXMuc3RhdGUuY3VycmVudFJvb21JZCk7XG4gICAgICAgICAgICBpZiAocm9vbUlkICE9PSB0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWQpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCBpcyBzYWZlIHRvIHJlbW92ZSBldmVudHMgZnJvbSByb29tcyB3ZSBhcmUgbm90IHZpZXdpbmcuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBXZSBhcmUgdmlld2luZyB0aGUgcm9vbSB3aGljaCB3ZSB3YW50IHRvIHJlc2V0LiBJdCBpcyBvbmx5IHNhZmUgdG8gZG9cbiAgICAgICAgICAgIC8vIHRoaXMgaWYgd2UgYXJlIG5vdCBzY3JvbGxlZCB1cCBpbiB0aGUgdmlldy4gVG8gZmluZCBvdXQsIGRlbGVnYXRlIHRvXG4gICAgICAgICAgICAvLyB0aGUgdGltZWxpbmUgcGFuZWwuIElmIHRoZSB0aW1lbGluZSBwYW5lbCBkb2Vzbid0IGV4aXN0LCB0aGVuIHdlIGFzc3VtZVxuICAgICAgICAgICAgLy8gaXQgaXMgc2FmZSB0byByZXNldCB0aGUgdGltZWxpbmUuXG4gICAgICAgICAgICBpZiAoIXRoaXMubG9nZ2VkSW5WaWV3LmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvZ2dlZEluVmlldy5jdXJyZW50LmNhblJlc2V0VGltZWxpbmVJblJvb20ocm9vbUlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2xpLm9uKCdzeW5jJywgKHN0YXRlLCBwcmV2U3RhdGUsIGRhdGEpID0+IHtcbiAgICAgICAgICAgIC8vIExpZmVjeWNsZVN0b3JlIGFuZCBvdGhlcnMgY2Fubm90IGRpcmVjdGx5IHN1YnNjcmliZSB0byBtYXRyaXggY2xpZW50IGZvclxuICAgICAgICAgICAgLy8gZXZlbnRzIGJlY2F1c2UgZmx1eCBvbmx5IGFsbG93cyBzdG9yZSBzdGF0ZSBjaGFuZ2VzIGR1cmluZyBmbHV4IGRpc3BhdGNoZXMuXG4gICAgICAgICAgICAvLyBTbyBkaXNwYXRjaCBkaXJlY3RseSBmcm9tIGhlcmUuIElkZWFsbHkgd2UnZCB1c2UgYSBTeW5jU3RhdGVTdG9yZSB0aGF0XG4gICAgICAgICAgICAvLyB3b3VsZCBkbyB0aGlzIGRpc3BhdGNoIGFuZCBleHBvc2UgdGhlIHN5bmMgc3RhdGUgaXRzZWxmIChieSBsaXN0ZW5pbmcgdG9cbiAgICAgICAgICAgIC8vIGl0cyBvd24gZGlzcGF0Y2gpLlxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdzeW5jX3N0YXRlJywgcHJldlN0YXRlLCBzdGF0ZX0pO1xuXG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFwiRVJST1JcIiB8fCBzdGF0ZSA9PT0gXCJSRUNPTk5FQ1RJTkdcIikge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmVycm9yIGluc3RhbmNlb2YgSW52YWxpZFN0b3JlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgTGlmZWN5Y2xlLmhhbmRsZUludmFsaWRTdG9yZUVycm9yKGRhdGEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzeW5jRXJyb3I6IGRhdGEuZXJyb3IgfHwgdHJ1ZX0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnN5bmNFcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3N5bmNFcnJvcjogbnVsbH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXR1c0luZGljYXRvcihzdGF0ZSwgcHJldlN0YXRlKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gXCJTWU5DSU5HXCIgJiYgcHJldlN0YXRlID09PSBcIlNZTkNJTkdcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIk1hdHJpeENsaWVudCBzeW5jIHN0YXRlID0+ICVzXCIsIHN0YXRlKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSAhPT0gXCJQUkVQQVJFRFwiKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgICB0aGlzLmZpcnN0U3luY0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RTeW5jUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgICAgIGlmIChOb3RpZmllci5zaG91bGRTaG93UHJvbXB0KCkgJiYgIU1hdHJpeENsaWVudFBlZy51c2VyUmVnaXN0ZXJlZFdpdGhpbkxhc3RIb3VycygyNCkpIHtcbiAgICAgICAgICAgICAgICBzaG93Tm90aWZpY2F0aW9uc1RvYXN0KGZhbHNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGlzLmZpcmUoQWN0aW9uLkZvY3VzQ29tcG9zZXIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVhZHk6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2xpLm9uKCdTZXNzaW9uLmxvZ2dlZF9vdXQnLCBmdW5jdGlvbihlcnJPYmopIHtcbiAgICAgICAgICAgIGlmIChMaWZlY3ljbGUuaXNMb2dnaW5nT3V0KCkpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gQSBtb2RhbCBtaWdodCBoYXZlIGJlZW4gb3BlbiB3aGVuIHdlIHdlcmUgbG9nZ2VkIG91dCBieSB0aGUgc2VydmVyXG4gICAgICAgICAgICBNb2RhbC5jbG9zZUN1cnJlbnRNb2RhbCgnU2Vzc2lvbi5sb2dnZWRfb3V0Jyk7XG5cbiAgICAgICAgICAgIGlmIChlcnJPYmouaHR0cFN0YXR1cyA9PT0gNDAxICYmIGVyck9iai5kYXRhICYmIGVyck9iai5kYXRhWydzb2Z0X2xvZ291dCddKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiU29mdCBsb2dvdXQgaXNzdWVkIGJ5IHNlcnZlciAtIGF2b2lkaW5nIGRhdGEgZGVsZXRpb25cIik7XG4gICAgICAgICAgICAgICAgTGlmZWN5Y2xlLnNvZnRMb2dvdXQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1NpZ25lZCBvdXQnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1NpZ25lZCBPdXQnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ0ZvciBzZWN1cml0eSwgdGhpcyBzZXNzaW9uIGhhcyBiZWVuIHNpZ25lZCBvdXQuIFBsZWFzZSBzaWduIGluIGFnYWluLicpLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbG9nb3V0JyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY2xpLm9uKCdub19jb25zZW50JywgZnVuY3Rpb24obWVzc2FnZSwgY29uc2VudFVyaSkge1xuICAgICAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ05vIENvbnNlbnQgRGlhbG9nJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdUZXJtcyBhbmQgQ29uZGl0aW9ucycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cD4geyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICdUbyBjb250aW51ZSB1c2luZyB0aGUgJShob21lc2VydmVyRG9tYWluKXMgaG9tZXNlcnZlciAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICd5b3UgbXVzdCByZXZpZXcgYW5kIGFncmVlIHRvIG91ciB0ZXJtcyBhbmQgY29uZGl0aW9ucy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBob21lc2VydmVyRG9tYWluOiBjbGkuZ2V0RG9tYWluKCkgfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdCgnUmV2aWV3IHRlcm1zIGFuZCBjb25kaXRpb25zJyksXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uOiBfdCgnRGlzbWlzcycpLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IChjb25maXJtZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd25kID0gd2luZG93Lm9wZW4oY29uc2VudFVyaSwgJ19ibGFuaycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd25kLm9wZW5lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRmdCA9IG5ldyBEZWNyeXB0aW9uRmFpbHVyZVRyYWNrZXIoKHRvdGFsLCBlcnJvckNvZGUpID0+IHtcbiAgICAgICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCdFMkUnLCAnRGVjcnlwdGlvbiBmYWlsdXJlJywgZXJyb3JDb2RlLCB0b3RhbCk7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwiZGVjcnlwdGlvbl9mYWlsdXJlXCIsIHsgZXJyb3JDb2RlIH0sIG51bGwsIHsgc3VtOiB0b3RhbCB9KTtcbiAgICAgICAgfSwgKGVycm9yQ29kZSkgPT4ge1xuICAgICAgICAgICAgLy8gTWFwIEpTLVNESyBlcnJvciBjb2RlcyB0byB0cmFja2VyIGNvZGVzIGZvciBhZ2dyZWdhdGlvblxuICAgICAgICAgICAgc3dpdGNoIChlcnJvckNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdNRUdPTE1fVU5LTk9XTl9JTkJPVU5EX1NFU1NJT05fSUQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ29sbV9rZXlzX25vdF9zZW50X2Vycm9yJztcbiAgICAgICAgICAgICAgICBjYXNlICdPTE1fVU5LTk9XTl9NRVNTQUdFX0lOREVYJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdvbG1faW5kZXhfZXJyb3InO1xuICAgICAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3VuZXhwZWN0ZWRfZXJyb3InO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAndW5zcGVjaWZpZWRfZXJyb3InO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTaGVsdmVkIGZvciBsYXRlciBkYXRlIHdoZW4gd2UgaGF2ZSB0aW1lIHRvIHRoaW5rIGFib3V0IHBlcnNpc3RpbmcgaGlzdG9yeSBvZlxuICAgICAgICAvLyB0cmFja2VkIGV2ZW50cyBhY3Jvc3Mgc2Vzc2lvbnMuXG4gICAgICAgIC8vIGRmdC5sb2FkVHJhY2tlZEV2ZW50SGFzaE1hcCgpO1xuXG4gICAgICAgIGRmdC5zdGFydCgpO1xuXG4gICAgICAgIC8vIFdoZW4gbG9nZ2luZyBvdXQsIHN0b3AgdHJhY2tpbmcgZmFpbHVyZXMgYW5kIGRlc3Ryb3kgc3RhdGVcbiAgICAgICAgY2xpLm9uKFwiU2Vzc2lvbi5sb2dnZWRfb3V0XCIsICgpID0+IGRmdC5zdG9wKCkpO1xuICAgICAgICBjbGkub24oXCJFdmVudC5kZWNyeXB0ZWRcIiwgKGUsIGVycikgPT4gZGZ0LmV2ZW50RGVjcnlwdGVkKGUsIGVycikpO1xuXG4gICAgICAgIGNsaS5vbihcIlJvb21cIiwgKHJvb20pID0+IHtcbiAgICAgICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNDcnlwdG9FbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBibGFja2xpc3RFbmFibGVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFxuICAgICAgICAgICAgICAgICAgICBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsXG4gICAgICAgICAgICAgICAgICAgIFwiYmxhY2tsaXN0VW52ZXJpZmllZERldmljZXNcIixcbiAgICAgICAgICAgICAgICAgICAgcm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIC8qZXhwbGljaXQ9Ki90cnVlLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcm9vbS5zZXRCbGFja2xpc3RVbnZlcmlmaWVkRGV2aWNlcyhibGFja2xpc3RFbmFibGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNsaS5vbihcImNyeXB0by53YXJuaW5nXCIsICh0eXBlKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdDUllQVE9fV0FSTklOR19PTERfVkVSU0lPTl9ERVRFQ1RFRCc6XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NyeXB0byBtaWdyYXRlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdPbGQgY3J5cHRvZ3JhcGh5IGRhdGEgZGV0ZWN0ZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRhdGEgZnJvbSBhbiBvbGRlciB2ZXJzaW9uIG9mICUoYnJhbmQpcyBoYXMgYmVlbiBkZXRlY3RlZC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyB3aWxsIGhhdmUgY2F1c2VkIGVuZC10by1lbmQgY3J5cHRvZ3JhcGh5IHRvIG1hbGZ1bmN0aW9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluIHRoZSBvbGRlciB2ZXJzaW9uLiBFbmQtdG8tZW5kIGVuY3J5cHRlZCBtZXNzYWdlcyBleGNoYW5nZWQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVjZW50bHkgd2hpbHN0IHVzaW5nIHRoZSBvbGRlciB2ZXJzaW9uIG1heSBub3QgYmUgZGVjcnlwdGFibGUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW4gdGhpcyB2ZXJzaW9uLiBUaGlzIG1heSBhbHNvIGNhdXNlIG1lc3NhZ2VzIGV4Y2hhbmdlZCB3aXRoIHRoaXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmVyc2lvbiB0byBmYWlsLiBJZiB5b3UgZXhwZXJpZW5jZSBwcm9ibGVtcywgbG9nIG91dCBhbmQgYmFjayBpbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhZ2Fpbi4gVG8gcmV0YWluIG1lc3NhZ2UgaGlzdG9yeSwgZXhwb3J0IGFuZCByZS1pbXBvcnQgeW91ciBrZXlzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYnJhbmQ6IFNka0NvbmZpZy5nZXQoKS5icmFuZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2xpLm9uKFwiY3J5cHRvLmtleUJhY2t1cEZhaWxlZFwiLCBhc3luYyAoZXJyY29kZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGhhdmVOZXdWZXJzaW9uO1xuICAgICAgICAgICAgbGV0IG5ld1ZlcnNpb25JbmZvO1xuICAgICAgICAgICAgLy8gaWYga2V5IGJhY2t1cCBpcyBzdGlsbCBlbmFibGVkLCB0aGVyZSBtdXN0IGJlIGEgbmV3IGJhY2t1cCBpbiBwbGFjZVxuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRLZXlCYWNrdXBFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICBoYXZlTmV3VmVyc2lvbiA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBjaGVjayB0aGUgc2VydmVyIHRvIHNlZSBpZiB0aGVyZSdzIGEgbmV3IG9uZVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZlcnNpb25JbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEtleUJhY2t1cFZlcnNpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZlcnNpb25JbmZvICE9PSBudWxsKSBoYXZlTmV3VmVyc2lvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiU2F3IGtleSBiYWNrdXAgZXJyb3IgYnV0IGZhaWxlZCB0byBjaGVjayBiYWNrdXAgdmVyc2lvbiFcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoYXZlTmV3VmVyc2lvbikge1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnTmV3IFJlY292ZXJ5IE1ldGhvZCcsICdOZXcgUmVjb3ZlcnkgTWV0aG9kJyxcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0KCcuLi8uLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvTmV3UmVjb3ZlcnlNZXRob2REaWFsb2cnKSxcbiAgICAgICAgICAgICAgICAgICAgeyBuZXdWZXJzaW9uSW5mbyB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnUmVjb3ZlcnkgTWV0aG9kIFJlbW92ZWQnLCAnUmVjb3ZlcnkgTWV0aG9kIFJlbW92ZWQnLFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnQoJy4uLy4uL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9SZWNvdmVyeU1ldGhvZFJlbW92ZWREaWFsb2cnKSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjbGkub24oXCJjcnlwdG8ua2V5U2lnbmF0dXJlVXBsb2FkRmFpbHVyZVwiLCAoZmFpbHVyZXMsIHNvdXJjZSwgY29udGludWF0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBLZXlTaWduYXR1cmVVcGxvYWRGYWlsZWREaWFsb2cgPVxuICAgICAgICAgICAgICAgIHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuS2V5U2lnbmF0dXJlVXBsb2FkRmFpbGVkRGlhbG9nJyk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gdXBsb2FkIGtleSBzaWduYXR1cmVzJyxcbiAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIHVwbG9hZCBrZXkgc2lnbmF0dXJlcycsXG4gICAgICAgICAgICAgICAgS2V5U2lnbmF0dXJlVXBsb2FkRmFpbGVkRGlhbG9nLFxuICAgICAgICAgICAgICAgIHsgZmFpbHVyZXMsIHNvdXJjZSwgY29udGludWF0aW9uIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjbGkub24oXCJjcnlwdG8udmVyaWZpY2F0aW9uLnJlcXVlc3RcIiwgcmVxdWVzdCA9PiB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC52ZXJpZmllcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IEluY29taW5nU2FzRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuSW5jb21pbmdTYXNEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnSW5jb21pbmcgVmVyaWZpY2F0aW9uJywgJycsIEluY29taW5nU2FzRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmaWVyOiByZXF1ZXN0LnZlcmlmaWVyLFxuICAgICAgICAgICAgICAgIH0sIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LnBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkuYWRkT3JSZXBsYWNlVG9hc3Qoe1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICd2ZXJpZnJlcV8nICsgcmVxdWVzdC5jaGFubmVsLnRyYW5zYWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlZlcmlmaWNhdGlvbiByZXF1ZXN0ZWRcIiksXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwidmVyaWZpY2F0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiB7cmVxdWVzdH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogc2RrLmdldENvbXBvbmVudChcInRvYXN0cy5WZXJpZmljYXRpb25SZXF1ZXN0VG9hc3RcIiksXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiA5MCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEZpcmUgdGhlIHRpbnRlciByaWdodCBvbiBzdGFydHVwIHRvIGVuc3VyZSB0aGUgZGVmYXVsdCB0aGVtZSBpcyBhcHBsaWVkXG4gICAgICAgIC8vIEEgbGF0ZXIgc3luYyBjYW4vd2lsbCBjb3JyZWN0IHRoZSB0aW50IHRvIGJlIHRoZSByaWdodCB2YWx1ZSBmb3IgdGhlIHVzZXJcbiAgICAgICAgY29uc3QgY29sb3JTY2hlbWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwicm9vbUNvbG9yXCIpO1xuICAgICAgICBUaW50ZXIudGludChjb2xvclNjaGVtZS5wcmltYXJ5X2NvbG9yLCBjb2xvclNjaGVtZS5zZWNvbmRhcnlfY29sb3IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCBzaG9ydGx5IGFmdGVyIHRoZSBtYXRyaXggY2xpZW50IGhhcyBzdGFydGVkLiBVc2VmdWwgZm9yXG4gICAgICogc2V0dGluZyB1cCBhbnl0aGluZyB0aGF0IHJlcXVpcmVzIHRoZSBjbGllbnQgdG8gYmUgc3RhcnRlZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgb25DbGllbnRTdGFydGVkKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgaWYgKGNsaS5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgYmxhY2tsaXN0RW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChcbiAgICAgICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgICAgICAgICAgICAgIFwiYmxhY2tsaXN0VW52ZXJpZmllZERldmljZXNcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjbGkuc2V0R2xvYmFsQmxhY2tsaXN0VW52ZXJpZmllZERldmljZXMoYmxhY2tsaXN0RW5hYmxlZCk7XG5cbiAgICAgICAgICAgIC8vIFdpdGggY3Jvc3Mtc2lnbmluZyBlbmFibGVkLCB3ZSBzZW5kIHRvIHVua25vd24gZGV2aWNlc1xuICAgICAgICAgICAgLy8gd2l0aG91dCBwcm9tcHRpbmcuIEFueSBiYWQtZGV2aWNlIHN0YXR1cyB0aGUgdXNlciBzaG91bGRcbiAgICAgICAgICAgIC8vIGJlIGF3YXJlIG9mIHdpbGwgYmUgc2lnbmFsbGVkIHRocm91Z2ggdGhlIHJvb20gc2hpZWxkXG4gICAgICAgICAgICAvLyBjaGFuZ2luZyBjb2xvdXIuIE1vcmUgYWR2YW5jZWQgYmVoYXZpb3VyIHdpbGwgY29tZSBvbmNlXG4gICAgICAgICAgICAvLyB3ZSBpbXBsZW1lbnQgbW9yZSBzZXR0aW5ncy5cbiAgICAgICAgICAgIGNsaS5zZXRHbG9iYWxFcnJvck9uVW5rbm93bkRldmljZXMoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvd1NjcmVlbihzY3JlZW46IHN0cmluZywgcGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBpc0xvZ2dlZE91dE9yR3Vlc3QgPSAhY2xpIHx8IGNsaS5pc0d1ZXN0KCk7XG4gICAgICAgIGlmICghaXNMb2dnZWRPdXRPckd1ZXN0ICYmIEFVVEhfU0NSRUVOUy5pbmNsdWRlcyhzY3JlZW4pKSB7XG4gICAgICAgICAgICAvLyB1c2VyIGlzIGxvZ2dlZCBpbiBhbmQgbGFuZGluZyBvbiBhbiBhdXRoIHBhZ2Ugd2hpY2ggd2lsbCB1cHJvb3QgdGhlaXIgc2Vzc2lvbiwgcmVkaXJlY3QgdGhlbSBob21lIGluc3RlYWRcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJ2aWV3X2hvbWVfcGFnZVwiIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNjcmVlbiA9PT0gJ3JlZ2lzdGVyJykge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnbG9naW4nKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0X2xvZ2luJyxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2ZvcmdvdF9wYXNzd29yZCcpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnc3RhcnRfcGFzc3dvcmRfcmVjb3ZlcnknLFxuICAgICAgICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnc29mdF9sb2dvdXQnKSB7XG4gICAgICAgICAgICBpZiAoY2xpLmdldFVzZXJJZCgpICYmICFMaWZlY3ljbGUuaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgICAgICAgICAvLyBMb2dnZWQgaW4gLSB2aXNpdCBhIHJvb21cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdMYXN0Um9vbSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBVbHRpbWF0ZWx5IHRyaWdnZXJzIHNvZnRfbG9nb3V0IGlmIG5lZWRlZFxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0X2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSAnbmV3Jykge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X2NyZWF0ZV9yb29tJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ3NldHRpbmdzJykge1xuICAgICAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ3dlbGNvbWUnKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfd2VsY29tZV9wYWdlJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgdGhpcy5zaG93U2NyZWVuKCdob21lJyk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2RpcmVjdG9yeScpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLldFTENPTUUpIHtcbiAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrKFwib25ib2FyZGluZ19yb29tX2RpcmVjdG9yeVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3Um9vbURpcmVjdG9yeSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuID09PSBcInN0YXJ0X3Nzb1wiIHx8IHNjcmVlbiA9PT0gXCJzdGFydF9jYXNcIikge1xuICAgICAgICAgICAgLy8gVE9ETyBpZiBsb2dnZWQgaW4sIHNraXAgU1NPXG4gICAgICAgICAgICBsZXQgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgaWYgKCFjbGkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7aHNVcmwsIGlzVXJsfSA9IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnO1xuICAgICAgICAgICAgICAgIGNsaSA9IGNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6IGhzVXJsLFxuICAgICAgICAgICAgICAgICAgICBpZEJhc2VVcmw6IGlzVXJsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0eXBlID0gc2NyZWVuID09PSBcInN0YXJ0X3Nzb1wiID8gXCJzc29cIiA6IFwiY2FzXCI7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zdGFydFNpbmdsZVNpZ25PbihjbGksIHR5cGUsIHRoaXMuZ2V0RnJhZ21lbnRBZnRlckxvZ2luKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbiA9PT0gJ2dyb3VwcycpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19teV9ncm91cHMnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuLmluZGV4T2YoJ3Jvb20vJykgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFJvb21zIGNhbiBoYXZlIHRoZSBmb2xsb3dpbmcgZm9ybWF0czpcbiAgICAgICAgICAgIC8vICNyb29tX2FsaWFzOmRvbWFpbiBvciAhb3BhcXVlX2lkOmRvbWFpblxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHNjcmVlbi5zdWJzdHJpbmcoNSk7XG4gICAgICAgICAgICBjb25zdCBkb21haW5PZmZzZXQgPSByb29tLmluZGV4T2YoJzonKSArIDE7IC8vIDAgaW4gY2FzZSByb29tIGRvZXMgbm90IGNvbnRhaW4gYSA6XG4gICAgICAgICAgICBsZXQgZXZlbnRPZmZzZXQgPSByb29tLmxlbmd0aDtcbiAgICAgICAgICAgIC8vIHJvb20gYWxpYXNlcyBjYW4gY29udGFpbiBzbGFzaGVzIG9ubHkgbG9vayBmb3Igc2xhc2ggYWZ0ZXIgZG9tYWluXG4gICAgICAgICAgICBpZiAocm9vbS5zdWJzdHJpbmcoZG9tYWluT2Zmc2V0KS5pbmRleE9mKCcvJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIGV2ZW50T2Zmc2V0ID0gZG9tYWluT2Zmc2V0ICsgcm9vbS5zdWJzdHJpbmcoZG9tYWluT2Zmc2V0KS5pbmRleE9mKCcvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByb29tU3RyaW5nID0gcm9vbS5zdWJzdHJpbmcoMCwgZXZlbnRPZmZzZXQpO1xuICAgICAgICAgICAgbGV0IGV2ZW50SWQgPSByb29tLnN1YnN0cmluZyhldmVudE9mZnNldCArIDEpOyAvLyBlbXB0eSBzdHJpbmcgaWYgbm8gZXZlbnQgaWQgZ2l2ZW5cblxuICAgICAgICAgICAgLy8gUHJldmlvdXNseSB3ZSBwdWxsZWQgdGhlIGV2ZW50SUQgZnJvbSB0aGUgc2VnbWVudHMgaW4gc3VjaCBhIHdheVxuICAgICAgICAgICAgLy8gd2hlcmUgaWYgdGhlcmUgd2FzIG5vIGV2ZW50SWQgdGhlbiB3ZSdkIGdldCB1bmRlZmluZWQuIEhvd2V2ZXIsIHdlXG4gICAgICAgICAgICAvLyBub3cgZG8gYSBzcGxpY2UgYW5kIGpvaW4gdG8gaGFuZGxlIHYzIGV2ZW50IElEcyB3aGljaCByZXN1bHRzIGluXG4gICAgICAgICAgICAvLyBhbiBlbXB0eSBzdHJpbmcuIFRvIG1haW50YWluIG91ciBwb3RlbnRpYWwgY29udHJhY3Qgd2l0aCB0aGUgcmVzdFxuICAgICAgICAgICAgLy8gb2YgdGhlIGFwcCwgd2UgY29lcmNlIHRoZSBldmVudElkIHRvIGJlIHVuZGVmaW5lZCB3aGVyZSBhcHBsaWNhYmxlLlxuICAgICAgICAgICAgaWYgKCFldmVudElkKSBldmVudElkID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBIYW5kbGUgZW5jb2RlZCByb29tL2V2ZW50IElEczogaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvOTE0OVxuXG4gICAgICAgICAgICBsZXQgdGhyZWVwaWRJbnZpdGU6IElUaHJlZXBpZEludml0ZTtcbiAgICAgICAgICAgIC8vIGlmIHdlIGxhbmRlZCBoZXJlIGZyb20gYSAzUElEIGludml0ZSwgcGVyc2lzdCBpdFxuICAgICAgICAgICAgaWYgKHBhcmFtcy5zaWdudXJsICYmIHBhcmFtcy5lbWFpbCkge1xuICAgICAgICAgICAgICAgIHRocmVlcGlkSW52aXRlID0gVGhyZWVwaWRJbnZpdGVTdG9yZS5pbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAuc3RvcmVJbnZpdGUocm9vbVN0cmluZywgcGFyYW1zIGFzIElUaHJlZXBpZEludml0ZVdpcmVGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGNoZWNrIHRoYXQgdGhpcyByb29tIGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGEga25vd24gaW52aXRlXG4gICAgICAgICAgICBpZiAoIXRocmVlcGlkSW52aXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52aXRlcyA9IFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UuZ2V0SW52aXRlcygpO1xuICAgICAgICAgICAgICAgIHRocmVlcGlkSW52aXRlID0gaW52aXRlcy5maW5kKGludml0ZSA9PiBpbnZpdGUucm9vbUlkID09PSByb29tU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gb24gb3VyIFVSTHMgdGhlcmUgbWlnaHQgYmUgYSA/dmlhPW1hdHJpeC5vcmcgb3Igc2ltaWxhciB0byBoZWxwXG4gICAgICAgICAgICAvLyBqb2lucyB0byB0aGUgcm9vbSBzdWNjZWVkLiBXZSdsbCBwYXNzIHRoZXNlIHRocm91Z2ggYXMgYW4gYXJyYXlcbiAgICAgICAgICAgIC8vIHRvIG90aGVyIGxldmVscy4gSWYgdGhlcmUncyBqdXN0IG9uZSA/dmlhPSB0aGVuIHBhcmFtcy52aWEgaXMgYVxuICAgICAgICAgICAgLy8gc2luZ2xlIHN0cmluZy4gSWYgc29tZW9uZSBkb2VzIHNvbWV0aGluZyBsaWtlID92aWE9b25lLmNvbSZ2aWE9dHdvLmNvbVxuICAgICAgICAgICAgLy8gdGhlbiBwYXJhbXMudmlhIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgICAgICAgICBsZXQgdmlhID0gW107XG4gICAgICAgICAgICBpZiAocGFyYW1zLnZpYSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocGFyYW1zLnZpYSkgPT09ICdzdHJpbmcnKSB2aWEgPSBbcGFyYW1zLnZpYV07XG4gICAgICAgICAgICAgICAgZWxzZSB2aWEgPSBwYXJhbXMudmlhO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGV2ZW50SWQsXG4gICAgICAgICAgICAgICAgdmlhX3NlcnZlcnM6IHZpYSxcbiAgICAgICAgICAgICAgICAvLyBJZiBhbiBldmVudCBJRCBpcyBnaXZlbiBpbiB0aGUgVVJMIGhhc2gsIG5vdGlmeSBSb29tVmlld1N0b3JlIHRvIG1hcmtcbiAgICAgICAgICAgICAgICAvLyBpdCBhcyBoaWdobGlnaHRlZCwgd2hpY2ggd2lsbCBwcm9wYWdhdGUgdG8gUm9vbVZpZXcgYW5kIGhpZ2hsaWdodCB0aGVcbiAgICAgICAgICAgICAgICAvLyBhc3NvY2lhdGVkIEV2ZW50VGlsZS5cbiAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogQm9vbGVhbihldmVudElkKSxcbiAgICAgICAgICAgICAgICB0aHJlZXBpZF9pbnZpdGU6IHRocmVlcGlkSW52aXRlLFxuICAgICAgICAgICAgICAgIC8vIFRPRE86IFJlcGxhY2Ugb29iX2RhdGEgd2l0aCB0aGUgdGhyZWVwaWRJbnZpdGUgKHdoaWNoIGhhcyB0aGUgc2FtZSBpbmZvKS5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzbid0IGRvbmUgeWV0IGJlY2F1c2UgaXQncyB0aHJlYWRlZCB0aHJvdWdoIHNvIG1hbnkgbW9yZSBwbGFjZXMuXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE1MTU3XG4gICAgICAgICAgICAgICAgb29iX2RhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGhyZWVwaWRJbnZpdGU/LnJvb21OYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHRocmVlcGlkSW52aXRlPy5yb29tQXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZTogdGhyZWVwaWRJbnZpdGU/Lmludml0ZXJOYW1lLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcm9vbV9hbGlhczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocm9vbVN0cmluZ1swXSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5yb29tX2FsaWFzID0gcm9vbVN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5yb29tX2lkID0gcm9vbVN0cmluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHBheWxvYWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcmVlbi5pbmRleE9mKCd1c2VyLycpID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VySWQgPSBzY3JlZW4uc3Vic3RyaW5nKDUpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3VzZXJfaW5mbycsXG4gICAgICAgICAgICAgICAgdXNlcklkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgc3ViQWN0aW9uOiBwYXJhbXMuYWN0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NyZWVuLmluZGV4T2YoJ2dyb3VwLycpID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBncm91cElkID0gc2NyZWVuLnN1YnN0cmluZyg2KTtcblxuICAgICAgICAgICAgLy8gVE9ETzogQ2hlY2sgdmFsaWQgZ3JvdXAgSURcblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X2dyb3VwJyxcbiAgICAgICAgICAgICAgICBncm91cF9pZDogZ3JvdXBJZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiSWdub3Jpbmcgc2hvd1NjcmVlbiBmb3IgJyVzJ1wiLCBzY3JlZW4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbm90aWZ5TmV3U2NyZWVuKHNjcmVlbjogc3RyaW5nLCByZXBsYWNlTGFzdCA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uTmV3U2NyZWVuKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uTmV3U2NyZWVuKHNjcmVlbiwgcmVwbGFjZUxhc3QpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0UGFnZVN1YnRpdGxlKCk7XG4gICAgfVxuXG4gICAgb25BbGlhc0NsaWNrKGV2ZW50OiBNb3VzZUV2ZW50LCBhbGlhczogc3RyaW5nKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19yb29tJywgcm9vbV9hbGlhczogYWxpYXN9KTtcbiAgICB9XG5cbiAgICBvblVzZXJDbGljayhldmVudDogTW91c2VFdmVudCwgdXNlcklkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBtZW1iZXIgPSBuZXcgUm9vbU1lbWJlcihudWxsLCB1c2VySWQpO1xuICAgICAgICBpZiAoIW1lbWJlcikgeyByZXR1cm47IH1cbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdVc2VyUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXIsXG4gICAgICAgICAgICBtZW1iZXI6IG1lbWJlcixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Hcm91cENsaWNrKGV2ZW50OiBNb3VzZUV2ZW50LCBncm91cElkOiBzdHJpbmcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X2dyb3VwJywgZ3JvdXBfaWQ6IGdyb3VwSWR9KTtcbiAgICB9XG5cbiAgICBvbkxvZ291dENsaWNrKGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxBbmNob3JFbGVtZW50LCBNb3VzZUV2ZW50Pikge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnbG9nb3V0JyxcbiAgICAgICAgfSk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgaGlkZUxoc1RocmVzaG9sZCA9IDEwMDA7XG4gICAgICAgIGNvbnN0IHNob3dMaHNUaHJlc2hvbGQgPSAxMDAwO1xuXG4gICAgICAgIGlmICh0aGlzLndpbmRvd1dpZHRoID4gaGlkZUxoc1RocmVzaG9sZCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8PSBoaWRlTGhzVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdoaWRlX2xlZnRfcGFuZWwnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLndpbmRvd1dpZHRoIDw9IHNob3dMaHNUaHJlc2hvbGQgJiYgd2luZG93LmlubmVyV2lkdGggPiBzaG93TGhzVGhyZXNob2xkKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzaG93X2xlZnRfcGFuZWwnIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZS5yZXNpemVOb3RpZmllci5ub3RpZnlXaW5kb3dSZXNpemVkKCk7XG4gICAgICAgIHRoaXMud2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBkaXNwYXRjaFRpbWVsaW5lUmVzaXplKCkge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICd0aW1lbGluZV9yZXNpemUnIH0pO1xuICAgIH1cblxuICAgIG9uUm9vbUNyZWF0ZWQocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X3Jvb21cIixcbiAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25SZWdpc3RlckNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dTY3JlZW4oXCJyZWdpc3RlclwiKTtcbiAgICB9O1xuXG4gICAgb25Mb2dpbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dTY3JlZW4oXCJsb2dpblwiKTtcbiAgICB9O1xuXG4gICAgb25Gb3Jnb3RQYXNzd29yZENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dTY3JlZW4oXCJmb3Jnb3RfcGFzc3dvcmRcIik7XG4gICAgfTtcblxuICAgIG9uUmVnaXN0ZXJGbG93Q29tcGxldGUgPSAoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5vblVzZXJDb21wbGV0ZWRMb2dpbkZsb3coY3JlZGVudGlhbHMsIHBhc3N3b3JkKTtcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJucyBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gdGhlIG5ldyBNYXRyaXhDbGllbnRcbiAgICBvblJlZ2lzdGVyZWQoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcykge1xuICAgICAgICByZXR1cm4gTGlmZWN5Y2xlLnNldExvZ2dlZEluKGNyZWRlbnRpYWxzKTtcbiAgICB9XG5cbiAgICBvblNlbmRFdmVudChyb29tSWQ6IHN0cmluZywgZXZlbnQ6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGkpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnbWVzc2FnZV9zZW5kX2ZhaWxlZCd9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsaS5zZW5kRXZlbnQocm9vbUlkLCBldmVudC5nZXRUeXBlKCksIGV2ZW50LmdldENvbnRlbnQoKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ21lc3NhZ2Vfc2VudCd9KTtcbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdtZXNzYWdlX3NlbmRfZmFpbGVkJ30pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldFBhZ2VTdWJ0aXRsZShzdWJ0aXRsZSA9ICcnKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQgJiYgY2xpZW50LmdldFJvb20odGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgc3VidGl0bGUgPSBgJHt0aGlzLnN1YlRpdGxlU3RhdHVzfSB8ICR7IHJvb20ubmFtZSB9ICR7c3VidGl0bGV9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1YnRpdGxlID0gYCR7dGhpcy5zdWJUaXRsZVN0YXR1c30gJHtzdWJ0aXRsZX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBgJHtTZGtDb25maWcuZ2V0KCkuYnJhbmR9ICR7c3VidGl0bGV9YDtcblxuICAgICAgICBpZiAoZG9jdW1lbnQudGl0bGUgIT09IHRpdGxlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlU3RhdHVzSW5kaWNhdG9yKHN0YXRlOiBzdHJpbmcsIHByZXZTdGF0ZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvblN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2xvYmFsU3RhdGU7XG4gICAgICAgIGNvbnN0IG51bVVucmVhZFJvb21zID0gbm90aWZpY2F0aW9uU3RhdGUubnVtVW5yZWFkU3RhdGVzOyAvLyB3ZSBrbm93IHRoYXQgc3RhdGVzID09PSByb29tcyBoZXJlXG5cbiAgICAgICAgaWYgKFBsYXRmb3JtUGVnLmdldCgpKSB7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zZXRFcnJvclN0YXR1cyhzdGF0ZSA9PT0gJ0VSUk9SJyk7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zZXROb3RpZmljYXRpb25Db3VudChudW1VbnJlYWRSb29tcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN1YlRpdGxlU3RhdHVzID0gJyc7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gXCJFUlJPUlwiKSB7XG4gICAgICAgICAgICB0aGlzLnN1YlRpdGxlU3RhdHVzICs9IGBbJHtfdChcIk9mZmxpbmVcIil9XSBgO1xuICAgICAgICB9XG4gICAgICAgIGlmIChudW1VbnJlYWRSb29tcyA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc3ViVGl0bGVTdGF0dXMgKz0gYFske251bVVucmVhZFJvb21zfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQYWdlU3VidGl0bGUoKTtcbiAgICB9XG5cbiAgICBvbkNsb3NlQWxsU2V0dGluZ3MoKSB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ2Nsb3NlX3NldHRpbmdzJyB9KTtcbiAgICB9XG5cbiAgICBvblNlcnZlckNvbmZpZ0NoYW5nZSA9IChzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZykgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZXJ2ZXJDb25maWd9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBtYWtlUmVnaXN0cmF0aW9uVXJsID0gKHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc3RhcnRpbmdGcmFnbWVudFF1ZXJ5UGFyYW1zLnJlZmVycmVyKSB7XG4gICAgICAgICAgICBwYXJhbXMucmVmZXJyZXIgPSB0aGlzLnByb3BzLnN0YXJ0aW5nRnJhZ21lbnRRdWVyeVBhcmFtcy5yZWZlcnJlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5tYWtlUmVnaXN0cmF0aW9uVXJsKHBhcmFtcyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFmdGVyIHJlZ2lzdHJhdGlvbiBvciBsb2dpbiwgd2UgcnVuIHZhcmlvdXMgcG9zdC1hdXRoIHN0ZXBzIGJlZm9yZSBlbnRlcmluZyB0aGUgYXBwXG4gICAgICogcHJvcGVyLCBzdWNoIHNldHRpbmcgdXAgY3Jvc3Mtc2lnbmluZyBvciB2ZXJpZnlpbmcgdGhlIG5ldyBzZXNzaW9uLlxuICAgICAqXG4gICAgICogTm90ZTogU1NPIHVzZXJzIChhbmQgYW55IG90aGVycyB1c2luZyB0b2tlbiBsb2dpbikgY3VycmVudGx5IGRvIG5vdCBwYXNzIHRocm91Z2hcbiAgICAgKiB0aGlzLCBhcyB0aGV5IGluc3RlYWQganVtcCBzdHJhaWdodCBpbnRvIHRoZSBhcHAgYWZ0ZXIgYGF0dGVtcHRUb2tlbkxvZ2luYC5cbiAgICAgKi9cbiAgICBvblVzZXJDb21wbGV0ZWRMb2dpbkZsb3cgPSBhc3luYyAoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgICAgICAvLyBzZWxmLWRlc3RydWN0IHRoZSBwYXNzd29yZCBhZnRlciA1bWluc1xuICAgICAgICBpZiAodGhpcy5hY2NvdW50UGFzc3dvcmRUaW1lciAhPT0gbnVsbCkgY2xlYXJUaW1lb3V0KHRoaXMuYWNjb3VudFBhc3N3b3JkVGltZXIpO1xuICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmFjY291bnRQYXNzd29yZFRpbWVyID0gbnVsbDtcbiAgICAgICAgfSwgNjAgKiA1ICogMTAwMCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBzdGFydCB0aGUgY2xpZW50XG4gICAgICAgIGF3YWl0IExpZmVjeWNsZS5zZXRMb2dnZWRJbihjcmVkZW50aWFscyk7XG4gICAgICAgIGF3YWl0IHRoaXMucG9zdExvZ2luU2V0dXAoKTtcbiAgICB9O1xuXG4gICAgLy8gY29tcGxldGUgc2VjdXJpdHkgLyBlMmUgc2V0dXAgaGFzIGZpbmlzaGVkXG4gICAgb25Db21wbGV0ZVNlY3VyaXR5RTJlU2V0dXBGaW5pc2hlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5vbkxvZ2dlZEluKCk7XG4gICAgfTtcblxuICAgIGdldEZyYWdtZW50QWZ0ZXJMb2dpbigpIHtcbiAgICAgICAgbGV0IGZyYWdtZW50QWZ0ZXJMb2dpbiA9IFwiXCI7XG4gICAgICAgIGNvbnN0IGluaXRpYWxTY3JlZW5BZnRlckxvZ2luID0gdGhpcy5wcm9wcy5pbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbjtcbiAgICAgICAgaWYgKGluaXRpYWxTY3JlZW5BZnRlckxvZ2luICYmXG4gICAgICAgICAgICAvLyBYWFg6IHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzExNjQzIGNhdXNpbmcgYSBsb2dpbi1sb29wXG4gICAgICAgICAgICAhW1wid2VsY29tZVwiLCBcImxvZ2luXCIsIFwicmVnaXN0ZXJcIiwgXCJzdGFydF9zc29cIiwgXCJzdGFydF9jYXNcIl0uaW5jbHVkZXMoaW5pdGlhbFNjcmVlbkFmdGVyTG9naW4uc2NyZWVuKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGZyYWdtZW50QWZ0ZXJMb2dpbiA9IGAvJHtpbml0aWFsU2NyZWVuQWZ0ZXJMb2dpbi5zY3JlZW59YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnJhZ21lbnRBZnRlckxvZ2luO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnRBZnRlckxvZ2luID0gdGhpcy5nZXRGcmFnbWVudEFmdGVyTG9naW4oKTtcbiAgICAgICAgbGV0IHZpZXcgPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkxPQURJTkcpIHtcbiAgICAgICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5TcGlubmVyJyk7XG4gICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWF0cml4Q2hhdF9zcGxhc2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5DT01QTEVURV9TRUNVUklUWSkge1xuICAgICAgICAgICAgY29uc3QgQ29tcGxldGVTZWN1cml0eSA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuYXV0aC5Db21wbGV0ZVNlY3VyaXR5Jyk7XG4gICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgIDxDb21wbGV0ZVNlY3VyaXR5XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25Db21wbGV0ZVNlY3VyaXR5RTJlU2V0dXBGaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkUyRV9TRVRVUCkge1xuICAgICAgICAgICAgY29uc3QgRTJlU2V0dXAgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguRTJlU2V0dXAnKTtcbiAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPEUyZVNldHVwXG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25Db21wbGV0ZVNlY3VyaXR5RTJlU2V0dXBGaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudFBhc3N3b3JkPXt0aGlzLmFjY291bnRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgdG9rZW5Mb2dpbj17ISF0aGlzLnRva2VuTG9naW59XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5MT0dHRURfSU4pIHtcbiAgICAgICAgICAgIC8vIHN0b3JlIGVycm9ycyBzdG9wIHRoZSBjbGllbnQgc3luY2luZyBhbmQgcmVxdWlyZSB1c2VyIGludGVydmVudGlvbiwgc28gd2UnbGxcbiAgICAgICAgICAgIC8vIGJlIHNob3dpbmcgYSBkaWFsb2cuIERvbid0IHNob3cgYW55dGhpbmcgZWxzZS5cbiAgICAgICAgICAgIGNvbnN0IGlzU3RvcmVFcnJvciA9IHRoaXMuc3RhdGUuc3luY0Vycm9yICYmIHRoaXMuc3RhdGUuc3luY0Vycm9yIGluc3RhbmNlb2YgSW52YWxpZFN0b3JlRXJyb3I7XG5cbiAgICAgICAgICAgIC8vIGByZWFkeWAgYW5kIGB2aWV3PT1MT0dHRURfSU5gIG1heSBiZSBzZXQgYmVmb3JlIGBwYWdlX3R5cGVgIChiZWNhdXNlIHRoZVxuICAgICAgICAgICAgLy8gbGF0dGVyIGlzIHNldCB2aWEgdGhlIGRpc3BhdGNoZXIpLiBJZiB3ZSBkb24ndCB5ZXQgaGF2ZSBhIGBwYWdlX3R5cGVgLFxuICAgICAgICAgICAgLy8ga2VlcCBzaG93aW5nIHRoZSBzcGlubmVyIGZvciBub3cuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWFkeSAmJiB0aGlzLnN0YXRlLnBhZ2VfdHlwZSAmJiAhaXNTdG9yZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgLyogZm9yIG5vdywgd2Ugc3R1ZmYgdGhlIGVudGlyZXR5IG9mIG91ciBwcm9wcyBhbmQgc3RhdGUgaW50byB0aGUgTG9nZ2VkSW5WaWV3LlxuICAgICAgICAgICAgICAgICAqIHdlIHNob3VsZCBnbyB0aHJvdWdoIGFuZCBmaWd1cmUgb3V0IHdoYXQgd2UgYWN0dWFsbHkgbmVlZCB0byBwYXNzIGRvd24sIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgKiBhcyB1c2luZyBzb21ldGhpbmcgbGlrZSByZWR1eCB0byBhdm9pZCBoYXZpbmcgYSBiaWxsaW9uIGJpdHMgb2Ygc3RhdGUga2lja2luZyBhcm91bmQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgTG9nZ2VkSW5WaWV3ID0gc2RrLmdldENvbXBvbmVudCgnc3RydWN0dXJlcy5Mb2dnZWRJblZpZXcnKTtcbiAgICAgICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgICAgICA8TG9nZ2VkSW5WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi50aGlzLnN0YXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmxvZ2dlZEluVmlld31cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudD17TWF0cml4Q2xpZW50UGVnLmdldCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Sb29tQ3JlYXRlZD17dGhpcy5vblJvb21DcmVhdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbG9zZUFsbFNldHRpbmdzPXt0aGlzLm9uQ2xvc2VBbGxTZXR0aW5nc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVnaXN0ZXJlZD17dGhpcy5vblJlZ2lzdGVyZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um9vbUlkPXt0aGlzLnN0YXRlLmN1cnJlbnRSb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgdGhpbmsgd2UgYXJlIGxvZ2dlZCBpbiwgYnV0IGFyZSBzdGlsbCB3YWl0aW5nIGZvciB0aGUgL3N5bmMgdG8gY29tcGxldGVcbiAgICAgICAgICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3Bpbm5lcicpO1xuICAgICAgICAgICAgICAgIGxldCBlcnJvckJveDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zeW5jRXJyb3IgJiYgIWlzU3RvcmVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckJveCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTWF0cml4Q2hhdF9zeW5jRXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHttZXNzYWdlRm9yU3luY0Vycm9yKHRoaXMuc3RhdGUuc3luY0Vycm9yKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2aWV3ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01hdHJpeENoYXRfc3BsYXNoXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZXJyb3JCb3h9XG4gICAgICAgICAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzc05hbWU9XCJteF9NYXRyaXhDaGF0X3NwbGFzaEJ1dHRvbnNcIiBvbkNsaWNrPXt0aGlzLm9uTG9nb3V0Q2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdCgnTG9nb3V0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5XRUxDT01FKSB7XG4gICAgICAgICAgICBjb25zdCBXZWxjb21lID0gc2RrLmdldENvbXBvbmVudCgnYXV0aC5XZWxjb21lJyk7XG4gICAgICAgICAgICB2aWV3ID0gPFdlbGNvbWUgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3ID09PSBWaWV3cy5SRUdJU1RFUiAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5SZWdpc3RyYXRpb24pKSB7XG4gICAgICAgICAgICBjb25zdCBSZWdpc3RyYXRpb24gPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguUmVnaXN0cmF0aW9uJyk7XG4gICAgICAgICAgICBjb25zdCBlbWFpbCA9IFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UucGlja0Jlc3RJbnZpdGUoKT8udG9FbWFpbDtcbiAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPFJlZ2lzdHJhdGlvblxuICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ9e3RoaXMuc3RhdGUucmVnaXN0ZXJfY2xpZW50X3NlY3JldH1cbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkPXt0aGlzLnN0YXRlLnJlZ2lzdGVyX3Nlc3Npb25faWR9XG4gICAgICAgICAgICAgICAgICAgIGlkU2lkPXt0aGlzLnN0YXRlLnJlZ2lzdGVyX2lkX3NpZH1cbiAgICAgICAgICAgICAgICAgICAgZW1haWw9e2VtYWlsfVxuICAgICAgICAgICAgICAgICAgICBicmFuZD17dGhpcy5wcm9wcy5jb25maWcuYnJhbmR9XG4gICAgICAgICAgICAgICAgICAgIG1ha2VSZWdpc3RyYXRpb25Vcmw9e3RoaXMubWFrZVJlZ2lzdHJhdGlvblVybH1cbiAgICAgICAgICAgICAgICAgICAgb25Mb2dnZWRJbj17dGhpcy5vblJlZ2lzdGVyRmxvd0NvbXBsZXRlfVxuICAgICAgICAgICAgICAgICAgICBvbkxvZ2luQ2xpY2s9e3RoaXMub25Mb2dpbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvblNlcnZlckNvbmZpZ0NoYW5nZT17dGhpcy5vblNlcnZlckNvbmZpZ0NoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERldmljZURpc3BsYXlOYW1lPXt0aGlzLnByb3BzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBZnRlckxvZ2luPXtmcmFnbWVudEFmdGVyTG9naW59XG4gICAgICAgICAgICAgICAgICAgIHsuLi50aGlzLmdldFNlcnZlclByb3BlcnRpZXMoKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZpZXcgPT09IFZpZXdzLkZPUkdPVF9QQVNTV09SRCAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5QYXNzd29yZFJlc2V0KSkge1xuICAgICAgICAgICAgY29uc3QgRm9yZ290UGFzc3dvcmQgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguRm9yZ290UGFzc3dvcmQnKTtcbiAgICAgICAgICAgIHZpZXcgPSAoXG4gICAgICAgICAgICAgICAgPEZvcmdvdFBhc3N3b3JkXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGU9e3RoaXMub25Mb2dpbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbkxvZ2luQ2xpY2s9e3RoaXMub25Mb2dpbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvblNlcnZlckNvbmZpZ0NoYW5nZT17dGhpcy5vblNlcnZlckNvbmZpZ0NoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VydmVyUHJvcGVydGllcygpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmlldyA9PT0gVmlld3MuTE9HSU4pIHtcbiAgICAgICAgICAgIGNvbnN0IHNob3dQYXNzd29yZFJlc2V0ID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuUGFzc3dvcmRSZXNldCk7XG4gICAgICAgICAgICBjb25zdCBMb2dpbiA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuYXV0aC5Mb2dpbicpO1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8TG9naW5cbiAgICAgICAgICAgICAgICAgICAgaXNTeW5jaW5nPXt0aGlzLnN0YXRlLnBlbmRpbmdJbml0aWFsU3luY31cbiAgICAgICAgICAgICAgICAgICAgb25Mb2dnZWRJbj17dGhpcy5vblVzZXJDb21wbGV0ZWRMb2dpbkZsb3d9XG4gICAgICAgICAgICAgICAgICAgIG9uUmVnaXN0ZXJDbGljaz17dGhpcy5vblJlZ2lzdGVyQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrSHNVcmw9e3RoaXMuZ2V0RmFsbGJhY2tIc1VybCgpfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU9e3RoaXMucHJvcHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkZvcmdvdFBhc3N3b3JkQ2xpY2s9e3Nob3dQYXNzd29yZFJlc2V0ID8gdGhpcy5vbkZvcmdvdFBhc3N3b3JkQ2xpY2sgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlPXt0aGlzLm9uU2VydmVyQ29uZmlnQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e2ZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAgICAgey4uLnRoaXMuZ2V0U2VydmVyUHJvcGVydGllcygpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmlldyA9PT0gVmlld3MuU09GVF9MT0dPVVQpIHtcbiAgICAgICAgICAgIGNvbnN0IFNvZnRMb2dvdXQgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLmF1dGguU29mdExvZ291dCcpO1xuICAgICAgICAgICAgdmlldyA9IChcbiAgICAgICAgICAgICAgICA8U29mdExvZ291dFxuICAgICAgICAgICAgICAgICAgICByZWFsUXVlcnlQYXJhbXM9e3RoaXMucHJvcHMucmVhbFF1ZXJ5UGFyYW1zfVxuICAgICAgICAgICAgICAgICAgICBvblRva2VuTG9naW5Db21wbGV0ZWQ9e3RoaXMucHJvcHMub25Ub2tlbkxvZ2luQ29tcGxldGVkfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e2ZyYWdtZW50QWZ0ZXJMb2dpbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVua25vd24gdmlldyAke3RoaXMuc3RhdGUudmlld31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEVycm9yQm91bmRhcnkgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5FcnJvckJvdW5kYXJ5Jyk7XG4gICAgICAgIHJldHVybiA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgIHt2aWV3fVxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+O1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTG9nZ2VkSW4oKTogYm9vbGVhbiB7XG4gICAgLy8gSlJTOiBNYXliZSB3ZSBzaG91bGQgbW92ZSB0aGUgc3RlcCB0aGF0IHdyaXRlcyB0aGlzIHRvIHRoZSB3aW5kb3cgb3V0IG9mXG4gICAgLy8gYGVsZW1lbnQtd2ViYCBhbmQgaW50byB0aGlzIGZpbGU/IEJldHRlciB5ZXQsIHdlIHNob3VsZCBwcm9iYWJseSBjcmVhdGUgYVxuICAgIC8vIHN0b3JlIHRvIGhvbGQgdGhpcyBzdGF0ZS5cbiAgICAvLyBTZWUgYWxzbyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNTAzNC5cbiAgICBjb25zdCBhcHAgPSB3aW5kb3cubWF0cml4Q2hhdDtcbiAgICByZXR1cm4gYXBwICYmIChhcHAgYXMgTWF0cml4Q2hhdCkuc3RhdGUudmlldyA9PT0gVmlld3MuTE9HR0VEX0lOO1xufVxuIl19