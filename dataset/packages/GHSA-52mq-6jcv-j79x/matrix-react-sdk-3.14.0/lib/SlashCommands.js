"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseCommandString = parseCommandString;
exports.getCommand = getCommand;
exports.CommandMap = exports.Commands = exports.Command = exports.CommandCategories = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var sdk = _interopRequireWildcard(require("./index"));

var _languageHandler = require("./languageHandler");

var _Modal = _interopRequireDefault(require("./Modal"));

var _MultiInviter = _interopRequireDefault(require("./utils/MultiInviter"));

var _HtmlUtils = require("./HtmlUtils");

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _colour = require("./utils/colour");

var _UserAddress = require("./UserAddress");

var _UrlUtils = require("./utils/UrlUtils");

var _IdentityServerUtils = require("./utils/IdentityServerUtils");

var _Permalinks = require("./utils/permalinks/Permalinks");

var _RoomInvite = require("./RoomInvite");

var _WidgetType = require("./widgets/WidgetType");

var _Jitsi = require("./widgets/Jitsi");

var _parse = require("parse5");

var _BugReportDialog = _interopRequireDefault(require("./components/views/dialogs/BugReportDialog"));

var _createRoom = require("./createRoom");

var _actions = require("./dispatcher/actions");

var _membership = require("./utils/membership");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _UIFeature = require("./settings/UIFeature");

var _effects = require("./effects");

var _CallHandler = _interopRequireDefault(require("./CallHandler"));

var _Rooms = require("./Rooms");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const singleMxcUpload = async () =>
/*: Promise<any>*/
{
  return new Promise(resolve => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');

    fileSelector.onchange = (ev
    /*: HTMLInputEvent*/
    ) => {
      const file = ev.target.files[0];
      const UploadConfirmDialog = sdk.getComponent("dialogs.UploadConfirmDialog");

      _Modal.default.createTrackedDialog('Upload Files confirmation', '', UploadConfirmDialog, {
        file,
        onFinished: shouldContinue => {
          resolve(shouldContinue ? _MatrixClientPeg.MatrixClientPeg.get().uploadContent(file) : null);
        }
      });
    };

    fileSelector.click();
  });
};

const CommandCategories = {
  "messages": (0, _languageHandler._td)("Messages"),
  "actions": (0, _languageHandler._td)("Actions"),
  "admin": (0, _languageHandler._td)("Admin"),
  "advanced": (0, _languageHandler._td)("Advanced"),
  "effects": (0, _languageHandler._td)("Effects"),
  "other": (0, _languageHandler._td)("Other")
};
exports.CommandCategories = CommandCategories;

class Command {
  constructor(opts
  /*: ICommandOpts*/
  ) {
    (0, _defineProperty2.default)(this, "command", void 0);
    (0, _defineProperty2.default)(this, "aliases", void 0);
    (0, _defineProperty2.default)(this, "args", void 0);
    (0, _defineProperty2.default)(this, "description", void 0);
    (0, _defineProperty2.default)(this, "runFn", void 0);
    (0, _defineProperty2.default)(this, "category", void 0);
    (0, _defineProperty2.default)(this, "hideCompletionAfterSpace", void 0);
    (0, _defineProperty2.default)(this, "_isEnabled", void 0);
    this.command = opts.command;
    this.aliases = opts.aliases || [];
    this.args = opts.args || "";
    this.description = opts.description;
    this.runFn = opts.runFn;
    this.category = opts.category || CommandCategories.other;
    this.hideCompletionAfterSpace = opts.hideCompletionAfterSpace || false;
    this._isEnabled = opts.isEnabled;
  }

  getCommand() {
    return `/${this.command}`;
  }

  getCommandWithArgs() {
    return this.getCommand() + " " + this.args;
  }

  run(roomId
  /*: string*/
  , args
  /*: string*/
  , cmd
  /*: string*/
  ) {
    // if it has no runFn then its an ignored/nop command (autocomplete only) e.g `/me`
    if (!this.runFn) return reject((0, _languageHandler._t)("Command error"));
    return this.runFn.bind(this)(roomId, args, cmd);
  }

  getUsage() {
    return (0, _languageHandler._t)('Usage') + ': ' + this.getCommandWithArgs();
  }

  isEnabled() {
    return this._isEnabled ? this._isEnabled() : true;
  }

}

exports.Command = Command;

function reject(error) {
  return {
    error
  };
}

function success(promise
/*: Promise<any>*/
) {
  return {
    promise
  };
}
/* Disable the "unexpected this" error for these commands - all of the run
 * functions are called with `this` bound to the Command instance.
 */


const Commands = [new Command({
  command: 'shrug',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ¯\\_(ツ)_/¯ to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '¯\\_(ツ)_/¯';

    if (args) {
      message = message + ' ' + args;
    }

    return success(_MatrixClientPeg.MatrixClientPeg.get().sendTextMessage(roomId, message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'tableflip',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends (╯°□°）╯︵ ┻━┻ to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '(╯°□°）╯︵ ┻━┻';

    if (args) {
      message = message + ' ' + args;
    }

    return success(_MatrixClientPeg.MatrixClientPeg.get().sendTextMessage(roomId, message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'unflip',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ┬──┬ ノ( ゜-゜ノ) to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '┬──┬ ノ( ゜-゜ノ)';

    if (args) {
      message = message + ' ' + args;
    }

    return success(_MatrixClientPeg.MatrixClientPeg.get().sendTextMessage(roomId, message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'lenny',
  args: '<message>',
  description: (0, _languageHandler._td)('Prepends ( ͡° ͜ʖ ͡°) to a plain-text message'),
  runFn: function (roomId, args) {
    let message = '( ͡° ͜ʖ ͡°)';

    if (args) {
      message = message + ' ' + args;
    }

    return success(_MatrixClientPeg.MatrixClientPeg.get().sendTextMessage(roomId, message));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'plain',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends a message as plain text, without interpreting it as markdown'),
  runFn: function (roomId, messages) {
    return success(_MatrixClientPeg.MatrixClientPeg.get().sendTextMessage(roomId, messages));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'html',
  args: '<message>',
  description: (0, _languageHandler._td)('Sends a message as html, without interpreting it as markdown'),
  runFn: function (roomId, messages) {
    return success(_MatrixClientPeg.MatrixClientPeg.get().sendHtmlMessage(roomId, messages, messages));
  },
  category: CommandCategories.messages
}), new Command({
  command: 'ddg',
  args: '<query>',
  description: (0, _languageHandler._td)('Searches DuckDuckGo for results'),
  runFn: function () {
    const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog'); // TODO Don't explain this away, actually show a search UI here.

    _Modal.default.createTrackedDialog('Slash Commands', '/ddg is not a command', ErrorDialog, {
      title: (0, _languageHandler._t)('/ddg is not a command'),
      description: (0, _languageHandler._t)('To use it, just wait for autocomplete results to load and tab through them.')
    });

    return success();
  },
  category: CommandCategories.actions,
  hideCompletionAfterSpace: true
}), new Command({
  command: 'upgraderoom',
  args: '<new_version>',
  description: (0, _languageHandler._td)('Upgrades a room to a new version'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(roomId);

      if (!room.currentState.mayClientSendStateEvent("m.room.tombstone", cli)) {
        return reject((0, _languageHandler._t)("You do not have the required permissions to use this command."));
      }

      const RoomUpgradeWarningDialog = sdk.getComponent("dialogs.RoomUpgradeWarningDialog");

      const {
        finished
      } = _Modal.default.createTrackedDialog('Slash Commands', 'upgrade room confirmation', RoomUpgradeWarningDialog, {
        roomId: roomId,
        targetVersion: args
      },
      /*className=*/
      null,
      /*isPriority=*/
      false,
      /*isStatic=*/
      true);

      return success(finished.then(async ([resp]) => {
        if (!resp.continue) return;
        let checkForUpgradeFn;

        try {
          const upgradePromise = cli.upgradeRoom(roomId, args); // We have to wait for the js-sdk to give us the room back so
          // we can more effectively abuse the MultiInviter behaviour
          // which heavily relies on the Room object being available.

          if (resp.invite) {
            checkForUpgradeFn = async newRoom => {
              // The upgradePromise should be done by the time we await it here.
              const {
                replacement_room: newRoomId
              } = await upgradePromise;
              if (newRoom.roomId !== newRoomId) return;
              const toInvite = [...room.getMembersWithMembership("join"), ...room.getMembersWithMembership("invite")].map(m => m.userId).filter(m => m !== cli.getUserId());

              if (toInvite.length > 0) {
                // Errors are handled internally to this function
                await (0, _RoomInvite.inviteUsersToRoom)(newRoomId, toInvite);
              }

              cli.removeListener('Room', checkForUpgradeFn);
            };

            cli.on('Room', checkForUpgradeFn);
          } // We have to await after so that the checkForUpgradesFn has a proper reference
          // to the new room's ID.


          await upgradePromise;
        } catch (e) {
          console.error(e);
          if (checkForUpgradeFn) cli.removeListener('Room', checkForUpgradeFn);
          const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'room upgrade error', ErrorDialog, {
            title: (0, _languageHandler._t)('Error upgrading room'),
            description: (0, _languageHandler._t)('Double check that your server supports the room version chosen and try again.')
          });
        }
      }));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'nick',
  args: '<display_name>',
  description: (0, _languageHandler._td)('Changes your display nickname'),
  runFn: function (roomId, args) {
    if (args) {
      return success(_MatrixClientPeg.MatrixClientPeg.get().setDisplayName(args));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'myroomnick',
  aliases: ['roomnick'],
  args: '<display_name>',
  description: (0, _languageHandler._td)('Changes your display nickname in the current room only'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const ev = cli.getRoom(roomId).currentState.getStateEvents('m.room.member', cli.getUserId());

      const content = _objectSpread(_objectSpread({}, ev ? ev.getContent() : {
        membership: 'join'
      }), {}, {
        displayname: args
      });

      return success(cli.sendStateEvent(roomId, 'm.room.member', content, cli.getUserId()));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'roomavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes the avatar of the current room'),
  runFn: function (roomId, args) {
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      return _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(roomId, 'm.room.avatar', {
        url
      }, '');
    }));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'myroomavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes your avatar in this current room only'),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(roomId);
    const userId = cli.getUserId();
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      const ev = room.currentState.getStateEvents('m.room.member', userId);

      const content = _objectSpread(_objectSpread({}, ev ? ev.getContent() : {
        membership: 'join'
      }), {}, {
        avatar_url: url
      });

      return cli.sendStateEvent(roomId, 'm.room.member', content, userId);
    }));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'myavatar',
  args: '[<mxc_url>]',
  description: (0, _languageHandler._td)('Changes your avatar in all rooms'),
  runFn: function (roomId, args) {
    let promise = Promise.resolve(args);

    if (!args) {
      promise = singleMxcUpload();
    }

    return success(promise.then(url => {
      if (!url) return;
      return _MatrixClientPeg.MatrixClientPeg.get().setAvatarUrl(url);
    }));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'topic',
  args: '[<topic>]',
  description: (0, _languageHandler._td)('Gets or sets the room topic'),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (args) {
      return success(cli.setRoomTopic(roomId, args));
    }

    const room = cli.getRoom(roomId);
    if (!room) return reject((0, _languageHandler._t)("Failed to set topic"));
    const topicEvents = room.currentState.getStateEvents('m.room.topic', '');
    const topic = topicEvents && topicEvents.getContent().topic;
    const topicHtml = topic ? (0, _HtmlUtils.linkifyAndSanitizeHtml)(topic) : (0, _languageHandler._t)('This room has no topic.');
    const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

    _Modal.default.createTrackedDialog('Slash Commands', 'Topic', InfoDialog, {
      title: room.name,
      description: /*#__PURE__*/React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: topicHtml
        }
      }),
      hasCloseButton: true
    });

    return success();
  },
  category: CommandCategories.admin
}), new Command({
  command: 'roomname',
  args: '<name>',
  description: (0, _languageHandler._td)('Sets the room name'),
  runFn: function (roomId, args) {
    if (args) {
      return success(_MatrixClientPeg.MatrixClientPeg.get().setRoomName(roomId, args));
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'invite',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Invites user with given id to current room'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        // We use a MultiInviter to re-use the invite logic, even though
        // we're only inviting one user.
        const address = matches[1]; // If we need an identity server but don't have one, things
        // get a bit more complex here, but we try to show something
        // meaningful.

        let prom = Promise.resolve();

        if ((0, _UserAddress.getAddressType)(address) === 'email' && !_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()) {
          const defaultIdentityServerUrl = (0, _IdentityServerUtils.getDefaultIdentityServerUrl)();

          if (defaultIdentityServerUrl) {
            const {
              finished
            } = _Modal.default.createTrackedDialog('Slash Commands', 'Identity server', _QuestionDialog.default, {
              title: (0, _languageHandler._t)("Use an identity server"),
              description: /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Use an identity server to invite by email. " + "Click continue to use the default identity server " + "(%(defaultIdentityServerName)s) or manage in Settings.", {
                defaultIdentityServerName: (0, _UrlUtils.abbreviateUrl)(defaultIdentityServerUrl)
              })),
              button: (0, _languageHandler._t)("Continue")
            });

            prom = finished.then(([useDefault]) => {
              if (useDefault) {
                (0, _IdentityServerUtils.useDefaultIdentityServer)();
                return;
              }

              throw new Error((0, _languageHandler._t)("Use an identity server to invite by email. Manage in Settings."));
            });
          } else {
            return reject((0, _languageHandler._t)("Use an identity server to invite by email. Manage in Settings."));
          }
        }

        const inviter = new _MultiInviter.default(roomId);
        return success(prom.then(() => {
          return inviter.invite([address]);
        }).then(() => {
          if (inviter.getCompletionState(address) !== "invited") {
            throw new Error(inviter.getErrorText(address));
          }
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'join',
  aliases: ['j', 'goto'],
  args: '<room-address>',
  description: (0, _languageHandler._td)('Joins room with given address'),
  runFn: function (_, args) {
    if (args) {
      // Note: we support 2 versions of this command. The first is
      // the public-facing one for most users and the other is a
      // power-user edition where someone may join via permalink or
      // room ID with optional servers. Practically, this results
      // in the following variations:
      //   /join #example:example.org
      //   /join !example:example.org
      //   /join !example:example.org altserver.com elsewhere.ca
      //   /join https://matrix.to/#/!example:example.org?via=altserver.com
      // The command also supports event permalinks transparently:
      //   /join https://matrix.to/#/!example:example.org/$something:example.org
      //   /join https://matrix.to/#/!example:example.org/$something:example.org?via=altserver.com
      const params = args.split(' ');
      if (params.length < 1) return reject(this.getUsage());
      let isPermalink = false;

      if (params[0].startsWith("http:") || params[0].startsWith("https:")) {
        // It's at least a URL - try and pull out a hostname to check against the
        // permalink handler
        const parsedUrl = new URL(params[0]);
        const hostname = parsedUrl.host || parsedUrl.hostname; // takes first non-falsey value
        // if we're using a Element permalink handler, this will catch it before we get much further.
        // see below where we make assumptions about parsing the URL.

        if ((0, _Permalinks.isPermalinkHost)(hostname)) {
          isPermalink = true;
        }
      }

      if (params[0][0] === '#') {
        let roomAlias = params[0];

        if (!roomAlias.includes(':')) {
          roomAlias += ':' + _MatrixClientPeg.MatrixClientPeg.get().getDomain();
        }

        _dispatcher.default.dispatch({
          action: 'view_room',
          room_alias: roomAlias,
          auto_join: true,
          _type: "slash_command" // instrumentation

        });

        return success();
      } else if (params[0][0] === '!') {
        const [roomId, ...viaServers] = params;

        _dispatcher.default.dispatch({
          action: 'view_room',
          room_id: roomId,
          opts: {
            // These are passed down to the js-sdk's /join call
            viaServers: viaServers
          },
          via_servers: viaServers,
          // for the rejoin button
          auto_join: true,
          _type: "slash_command" // instrumentation

        });

        return success();
      } else if (isPermalink) {
        const permalinkParts = (0, _Permalinks.parsePermalink)(params[0]); // This check technically isn't needed because we already did our
        // safety checks up above. However, for good measure, let's be sure.

        if (!permalinkParts) {
          return reject(this.getUsage());
        } // If for some reason someone wanted to join a group or user, we should
        // stop them now.


        if (!permalinkParts.roomIdOrAlias) {
          return reject(this.getUsage());
        }

        const entity = permalinkParts.roomIdOrAlias;
        const viaServers = permalinkParts.viaServers;
        const eventId = permalinkParts.eventId;
        const dispatch = {
          action: 'view_room',
          auto_join: true,
          _type: "slash_command" // instrumentation

        };
        if (entity[0] === '!') dispatch["room_id"] = entity;else dispatch["room_alias"] = entity;

        if (eventId) {
          dispatch["event_id"] = eventId;
          dispatch["highlighted"] = true;
        }

        if (viaServers) {
          // For the join
          dispatch["opts"] = {
            // These are passed down to the js-sdk's /join call
            viaServers: viaServers
          }; // For if the join fails (rejoin button)

          dispatch['via_servers'] = viaServers;
        }

        _dispatcher.default.dispatch(dispatch);

        return success();
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'part',
  args: '[<room-address>]',
  description: (0, _languageHandler._td)('Leave room'),
  runFn: function (roomId, args) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    let targetRoomId;

    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        let roomAlias = matches[1];
        if (roomAlias[0] !== '#') return reject(this.getUsage());

        if (!roomAlias.includes(':')) {
          roomAlias += ':' + cli.getDomain();
        } // Try to find a room with this alias


        const rooms = cli.getRooms();

        for (let i = 0; i < rooms.length; i++) {
          const aliasEvents = rooms[i].currentState.getStateEvents('m.room.aliases');

          for (let j = 0; j < aliasEvents.length; j++) {
            const aliases = aliasEvents[j].getContent().aliases || [];

            for (let k = 0; k < aliases.length; k++) {
              if (aliases[k] === roomAlias) {
                targetRoomId = rooms[i].roomId;
                break;
              }
            }

            if (targetRoomId) break;
          }

          if (targetRoomId) break;
        }

        if (!targetRoomId) return reject((0, _languageHandler._t)('Unrecognised room address:') + ' ' + roomAlias);
      }
    }

    if (!targetRoomId) targetRoomId = roomId;
    return success((0, _membership.leaveRoomBehaviour)(targetRoomId));
  },
  category: CommandCategories.actions
}), new Command({
  command: 'kick',
  args: '<user-id> [reason]',
  description: (0, _languageHandler._td)('Kicks user with given id'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(.*))?$/);

      if (matches) {
        return success(_MatrixClientPeg.MatrixClientPeg.get().kick(roomId, matches[1], matches[3]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'ban',
  args: '<user-id> [reason]',
  description: (0, _languageHandler._td)('Bans user with given id'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(.*))?$/);

      if (matches) {
        return success(_MatrixClientPeg.MatrixClientPeg.get().ban(roomId, matches[1], matches[3]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'unban',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Unbans user with given ID'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        // Reset the user membership to "leave" to unban him
        return success(_MatrixClientPeg.MatrixClientPeg.get().unban(roomId, matches[1]));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'ignore',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Ignores a user, hiding their messages from you'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const matches = args.match(/^(@[^:]+:\S+)$/);

      if (matches) {
        const userId = matches[1];
        const ignoredUsers = cli.getIgnoredUsers();
        ignoredUsers.push(userId); // de-duped internally in the js-sdk

        return success(cli.setIgnoredUsers(ignoredUsers).then(() => {
          const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'User ignored', InfoDialog, {
            title: (0, _languageHandler._t)('Ignored user'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('You are now ignoring %(userId)s', {
              userId
            })))
          });
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'unignore',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Stops ignoring a user, showing their messages going forward'),
  runFn: function (roomId, args) {
    if (args) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const matches = args.match(/(^@[^:]+:\S+$)/);

      if (matches) {
        const userId = matches[1];
        const ignoredUsers = cli.getIgnoredUsers();
        const index = ignoredUsers.indexOf(userId);
        if (index !== -1) ignoredUsers.splice(index, 1);
        return success(cli.setIgnoredUsers(ignoredUsers).then(() => {
          const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'User unignored', InfoDialog, {
            title: (0, _languageHandler._t)('Unignored user'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('You are no longer ignoring %(userId)s', {
              userId
            })))
          });
        }));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: 'op',
  args: '<user-id> [<power-level>]',
  description: (0, _languageHandler._td)('Define the power level of a user'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+?)( +(-?\d+))?$/);
      let powerLevel = 50; // default power level for op

      if (matches) {
        const userId = matches[1];

        if (matches.length === 4 && undefined !== matches[3]) {
          powerLevel = parseInt(matches[3], 10);
        }

        if (!isNaN(powerLevel)) {
          const cli = _MatrixClientPeg.MatrixClientPeg.get();

          const room = cli.getRoom(roomId);
          if (!room) return reject((0, _languageHandler._t)("Command failed"));
          const member = room.getMember(userId);

          if (!member || (0, _membership.getEffectiveMembership)(member.membership) === _membership.EffectiveMembership.Leave) {
            return reject((0, _languageHandler._t)("Could not find user in room"));
          }

          const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
          return success(cli.setPowerLevel(roomId, userId, powerLevel, powerLevelEvent));
        }
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'deop',
  args: '<user-id>',
  description: (0, _languageHandler._td)('Deops user with given id'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+)$/);

      if (matches) {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const room = cli.getRoom(roomId);
        if (!room) return reject((0, _languageHandler._t)("Command failed"));
        const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
        if (!powerLevelEvent.getContent().users[args]) return reject((0, _languageHandler._t)("Could not find user in room"));
        return success(cli.setPowerLevel(roomId, args, undefined, powerLevelEvent));
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.admin
}), new Command({
  command: 'devtools',
  description: (0, _languageHandler._td)('Opens the Developer Tools dialog'),
  runFn: function (roomId) {
    const DevtoolsDialog = sdk.getComponent('dialogs.DevtoolsDialog');

    _Modal.default.createDialog(DevtoolsDialog, {
      roomId
    });

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: 'addwidget',
  args: '<url | embed code | Jitsi url>',
  description: (0, _languageHandler._td)('Adds a custom widget by URL to the room'),
  isEnabled: () => _SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets),
  runFn: function (roomId, widgetUrl) {
    if (!widgetUrl) {
      return reject((0, _languageHandler._t)("Please supply a widget URL or embed code"));
    } // Try and parse out a widget URL from iframes


    if (widgetUrl.toLowerCase().startsWith("<iframe ")) {
      // We use parse5, which doesn't render/create a DOM node. It instead runs
      // some superfast regex over the text so we don't have to.
      const embed = (0, _parse.parseFragment)(widgetUrl);

      if (embed && embed.childNodes && embed.childNodes.length === 1) {
        const iframe = embed.childNodes[0];

        if (iframe.tagName.toLowerCase() === 'iframe' && iframe.attrs) {
          const srcAttr = iframe.attrs.find(a => a.name === 'src');
          console.log("Pulling URL out of iframe (embed code)");
          widgetUrl = srcAttr.value;
        }
      }
    }

    if (!widgetUrl.startsWith("https://") && !widgetUrl.startsWith("http://")) {
      return reject((0, _languageHandler._t)("Please supply a https:// or http:// widget URL"));
    }

    if (_WidgetUtils.default.canUserModifyWidgets(roomId)) {
      const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      const nowMs = new Date().getTime();
      const widgetId = encodeURIComponent(`${roomId}_${userId}_${nowMs}`);
      let type = _WidgetType.WidgetType.CUSTOM;
      let name = "Custom Widget";
      let data = {}; // Make the widget a Jitsi widget if it looks like a Jitsi widget

      const jitsiData = _Jitsi.Jitsi.getInstance().parsePreferredConferenceUrl(widgetUrl);

      if (jitsiData) {
        console.log("Making /addwidget widget a Jitsi conference");
        type = _WidgetType.WidgetType.JITSI;
        name = "Jitsi Conference";
        data = jitsiData;
        widgetUrl = _WidgetUtils.default.getLocalJitsiWrapperUrl();
      }

      return success(_WidgetUtils.default.setRoomWidget(roomId, widgetId, type, widgetUrl, name, data));
    } else {
      return reject((0, _languageHandler._t)("You cannot modify widgets in this room."));
    }
  },
  category: CommandCategories.admin
}), new Command({
  command: 'verify',
  args: '<user-id> <device-id> <device-signing-key>',
  description: (0, _languageHandler._td)('Verifies a user, session, and pubkey tuple'),
  runFn: function (roomId, args) {
    if (args) {
      const matches = args.match(/^(\S+) +(\S+) +(\S+)$/);

      if (matches) {
        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        const userId = matches[1];
        const deviceId = matches[2];
        const fingerprint = matches[3];
        return success((async () => {
          const device = cli.getStoredDevice(userId, deviceId);

          if (!device) {
            throw new Error((0, _languageHandler._t)('Unknown (user, session) pair:') + ` (${userId}, ${deviceId})`);
          }

          const deviceTrust = await cli.checkDeviceTrust(userId, deviceId);

          if (deviceTrust.isVerified()) {
            if (device.getFingerprint() === fingerprint) {
              throw new Error((0, _languageHandler._t)('Session already verified!'));
            } else {
              throw new Error((0, _languageHandler._t)('WARNING: Session already verified, but keys do NOT MATCH!'));
            }
          }

          if (device.getFingerprint() !== fingerprint) {
            const fprint = device.getFingerprint();
            throw new Error((0, _languageHandler._t)('WARNING: KEY VERIFICATION FAILED! The signing key for %(userId)s and session' + ' %(deviceId)s is "%(fprint)s" which does not match the provided key ' + '"%(fingerprint)s". This could mean your communications are being intercepted!', {
              fprint,
              userId,
              deviceId,
              fingerprint
            }));
          }

          await cli.setDeviceVerified(userId, deviceId, true); // Tell the user we verified everything

          const InfoDialog = sdk.getComponent('dialogs.InfoDialog');

          _Modal.default.createTrackedDialog('Slash Commands', 'Verified key', InfoDialog, {
            title: (0, _languageHandler._t)('Verified key'),
            description: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)('The signing key you provided matches the signing key you received ' + 'from %(userId)s\'s session %(deviceId)s. Session marked as verified.', {
              userId,
              deviceId
            })))
          });
        })());
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.advanced
}), new Command({
  command: 'discardsession',
  description: (0, _languageHandler._td)('Forces the current outbound group session in an encrypted room to be discarded'),
  runFn: function (roomId) {
    try {
      _MatrixClientPeg.MatrixClientPeg.get().forceDiscardSession(roomId);
    } catch (e) {
      return reject(e.message);
    }

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "rainbow",
  description: (0, _languageHandler._td)("Sends the given message coloured as a rainbow"),
  args: '<message>',
  runFn: function (roomId, args) {
    if (!args) return reject(this.getUserId());
    return success(_MatrixClientPeg.MatrixClientPeg.get().sendHtmlMessage(roomId, args, (0, _colour.textToHtmlRainbow)(args)));
  },
  category: CommandCategories.messages
}), new Command({
  command: "rainbowme",
  description: (0, _languageHandler._td)("Sends the given emote coloured as a rainbow"),
  args: '<message>',
  runFn: function (roomId, args) {
    if (!args) return reject(this.getUserId());
    return success(_MatrixClientPeg.MatrixClientPeg.get().sendHtmlEmote(roomId, args, (0, _colour.textToHtmlRainbow)(args)));
  },
  category: CommandCategories.messages
}), new Command({
  command: "help",
  description: (0, _languageHandler._td)("Displays list of commands with usages and descriptions"),
  runFn: function () {
    const SlashCommandHelpDialog = sdk.getComponent('dialogs.SlashCommandHelpDialog');

    _Modal.default.createTrackedDialog('Slash Commands', 'Help', SlashCommandHelpDialog);

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "whois",
  description: (0, _languageHandler._td)("Displays information about a user"),
  args: "<user-id>",
  runFn: function (roomId, userId) {
    if (!userId || !userId.startsWith("@") || !userId.includes(":")) {
      return reject(this.getUsage());
    }

    const member = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId).getMember(userId);

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewUser,
      // XXX: We should be using a real member object and not assuming what the
      // receiver wants.
      member: member || {
        userId
      }
    });

    return success();
  },
  category: CommandCategories.advanced
}), new Command({
  command: "rageshake",
  aliases: ["bugreport"],
  description: (0, _languageHandler._td)("Send a bug report with logs"),
  isEnabled: () => !!_SdkConfig.default.get().bug_report_endpoint_url,
  args: "<description>",
  runFn: function (roomId, args) {
    return success(_Modal.default.createTrackedDialog('Slash Commands', 'Bug Report Dialog', _BugReportDialog.default, {
      initialText: args
    }).finished);
  },
  category: CommandCategories.advanced
}), new Command({
  command: "query",
  description: (0, _languageHandler._td)("Opens chat with the given user"),
  args: "<user-id>",
  runFn: function (roomId, userId) {
    // easter-egg for now: look up phone numbers through the thirdparty API
    // (very dumb phone number detection...)
    const isPhoneNumber = userId && /^\+?[0123456789]+$/.test(userId);

    if (!userId || (!userId.startsWith("@") || !userId.includes(":")) && !isPhoneNumber) {
      return reject(this.getUsage());
    }

    return success((async () => {
      if (isPhoneNumber) {
        const results = await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser('im.vector.protocol.pstn', {
          'm.id.phone': userId
        });

        if (!results || results.length === 0 || !results[0].userid) {
          throw new Error("Unable to find Matrix ID for phone number");
        }

        userId = results[0].userid;
      }

      const roomId = await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), userId);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: roomId
      });
    })());
  },
  category: CommandCategories.actions
}), new Command({
  command: "msg",
  description: (0, _languageHandler._td)("Sends a message to the given user"),
  args: "<user-id> <message>",
  runFn: function (_, args) {
    if (args) {
      // matches the first whitespace delimited group and then the rest of the string
      const matches = args.match(/^(\S+?)(?: +(.*))?$/s);

      if (matches) {
        const [userId, msg] = matches.slice(1);

        if (msg && userId && userId.startsWith("@") && userId.includes(":")) {
          return success((async () => {
            const cli = _MatrixClientPeg.MatrixClientPeg.get();

            const roomId = await (0, _createRoom.ensureDMExists)(cli, userId);

            _dispatcher.default.dispatch({
              action: 'view_room',
              room_id: roomId
            });

            cli.sendTextMessage(roomId, msg);
          })());
        }
      }
    }

    return reject(this.getUsage());
  },
  category: CommandCategories.actions
}), new Command({
  command: "holdcall",
  description: (0, _languageHandler._td)("Places the call in the current room on hold"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const call = _CallHandler.default.sharedInstance().getCallForRoom(roomId);

    if (!call) {
      return reject("No active call in this room");
    }

    call.setRemoteOnHold(true);
    return success();
  }
}), new Command({
  command: "unholdcall",
  description: (0, _languageHandler._td)("Takes the call in the current room off hold"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const call = _CallHandler.default.sharedInstance().getCallForRoom(roomId);

    if (!call) {
      return reject("No active call in this room");
    }

    call.setRemoteOnHold(false);
    return success();
  }
}), new Command({
  command: "converttodm",
  description: (0, _languageHandler._td)("Converts the room to a DM"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    return success((0, _Rooms.guessAndSetDMRoom)(room, true));
  }
}), new Command({
  command: "converttoroom",
  description: (0, _languageHandler._td)("Converts the DM to a room"),
  category: CommandCategories.other,
  runFn: function (roomId, args) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    return success((0, _Rooms.guessAndSetDMRoom)(room, false));
  }
}), // Command definitions for autocompletion ONLY:
// /me is special because its not handled by SlashCommands.js and is instead done inside the Composer classes
new Command({
  command: "me",
  args: '<message>',
  description: (0, _languageHandler._td)('Displays action'),
  category: CommandCategories.messages,
  hideCompletionAfterSpace: true
}), ..._effects.CHAT_EFFECTS.map(effect => {
  return new Command({
    command: effect.command,
    description: effect.description(),
    args: '<message>',
    runFn: function (roomId, args) {
      return success((async () => {
        if (!args) {
          args = effect.fallbackMessage();

          _MatrixClientPeg.MatrixClientPeg.get().sendEmoteMessage(roomId, args);
        } else {
          const content = {
            msgtype: effect.msgType,
            body: args
          };

          _MatrixClientPeg.MatrixClientPeg.get().sendMessage(roomId, content);
        }

        _dispatcher.default.dispatch({
          action: `effects.${effect.command}`
        });
      })());
    },
    category: CommandCategories.effects
  });
})]; // build a map from names and aliases to the Command objects.

exports.Commands = Commands;
const CommandMap = new Map();
exports.CommandMap = CommandMap;
Commands.forEach(cmd => {
  CommandMap.set(cmd.command, cmd);
  cmd.aliases.forEach(alias => {
    CommandMap.set(alias, cmd);
  });
});

function parseCommandString(input
/*: string*/
) {
  // trim any trailing whitespace, as it can confuse the parser for
  // IRC-style commands
  input = input.replace(/\s+$/, '');
  if (input[0] !== '/') return {}; // not a command

  const bits = input.match(/^(\S+?)(?: +((.|\n)*))?$/);
  let cmd;
  let args;

  if (bits) {
    cmd = bits[1].substring(1).toLowerCase();
    args = bits[2];
  } else {
    cmd = input;
  }

  return {
    cmd,
    args
  };
}
/**
 * Process the given text for /commands and return a bound method to perform them.
 * @param {string} roomId The room in which the command was performed.
 * @param {string} input The raw text input by the user.
 * @return {null|function(): Object} Function returning an object with the property 'error' if there was an error
 * processing the command, or 'promise' if a request was sent out.
 * Returns null if the input didn't match a command.
 */


function getCommand(roomId
/*: string*/
, input
/*: string*/
) {
  const {
    cmd,
    args
  } = parseCommandString(input);

  if (CommandMap.has(cmd) && CommandMap.get(cmd).isEnabled()) {
    return () => CommandMap.get(cmd).run(roomId, args, cmd);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TbGFzaENvbW1hbmRzLnRzeCJdLCJuYW1lcyI6WyJzaW5nbGVNeGNVcGxvYWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZpbGVTZWxlY3RvciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsIm9uY2hhbmdlIiwiZXYiLCJmaWxlIiwidGFyZ2V0IiwiZmlsZXMiLCJVcGxvYWRDb25maXJtRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwib25GaW5pc2hlZCIsInNob3VsZENvbnRpbnVlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwidXBsb2FkQ29udGVudCIsImNsaWNrIiwiQ29tbWFuZENhdGVnb3JpZXMiLCJDb21tYW5kIiwiY29uc3RydWN0b3IiLCJvcHRzIiwiY29tbWFuZCIsImFsaWFzZXMiLCJhcmdzIiwiZGVzY3JpcHRpb24iLCJydW5GbiIsImNhdGVnb3J5Iiwib3RoZXIiLCJoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2UiLCJfaXNFbmFibGVkIiwiaXNFbmFibGVkIiwiZ2V0Q29tbWFuZCIsImdldENvbW1hbmRXaXRoQXJncyIsInJ1biIsInJvb21JZCIsImNtZCIsInJlamVjdCIsImJpbmQiLCJnZXRVc2FnZSIsImVycm9yIiwic3VjY2VzcyIsInByb21pc2UiLCJDb21tYW5kcyIsIm1lc3NhZ2UiLCJzZW5kVGV4dE1lc3NhZ2UiLCJtZXNzYWdlcyIsInNlbmRIdG1sTWVzc2FnZSIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJhY3Rpb25zIiwiY2xpIiwicm9vbSIsImdldFJvb20iLCJjdXJyZW50U3RhdGUiLCJtYXlDbGllbnRTZW5kU3RhdGVFdmVudCIsIlJvb21VcGdyYWRlV2FybmluZ0RpYWxvZyIsImZpbmlzaGVkIiwidGFyZ2V0VmVyc2lvbiIsInRoZW4iLCJyZXNwIiwiY29udGludWUiLCJjaGVja0ZvclVwZ3JhZGVGbiIsInVwZ3JhZGVQcm9taXNlIiwidXBncmFkZVJvb20iLCJpbnZpdGUiLCJuZXdSb29tIiwicmVwbGFjZW1lbnRfcm9vbSIsIm5ld1Jvb21JZCIsInRvSW52aXRlIiwiZ2V0TWVtYmVyc1dpdGhNZW1iZXJzaGlwIiwibWFwIiwibSIsInVzZXJJZCIsImZpbHRlciIsImdldFVzZXJJZCIsImxlbmd0aCIsInJlbW92ZUxpc3RlbmVyIiwib24iLCJlIiwiY29uc29sZSIsImFkbWluIiwic2V0RGlzcGxheU5hbWUiLCJnZXRTdGF0ZUV2ZW50cyIsImNvbnRlbnQiLCJnZXRDb250ZW50IiwibWVtYmVyc2hpcCIsImRpc3BsYXluYW1lIiwic2VuZFN0YXRlRXZlbnQiLCJ1cmwiLCJhdmF0YXJfdXJsIiwic2V0QXZhdGFyVXJsIiwic2V0Um9vbVRvcGljIiwidG9waWNFdmVudHMiLCJ0b3BpYyIsInRvcGljSHRtbCIsIkluZm9EaWFsb2ciLCJuYW1lIiwiX19odG1sIiwiaGFzQ2xvc2VCdXR0b24iLCJzZXRSb29tTmFtZSIsIm1hdGNoZXMiLCJtYXRjaCIsImFkZHJlc3MiLCJwcm9tIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJRdWVzdGlvbkRpYWxvZyIsImRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWUiLCJidXR0b24iLCJ1c2VEZWZhdWx0IiwiRXJyb3IiLCJpbnZpdGVyIiwiTXVsdGlJbnZpdGVyIiwiZ2V0Q29tcGxldGlvblN0YXRlIiwiZ2V0RXJyb3JUZXh0IiwiXyIsInBhcmFtcyIsInNwbGl0IiwiaXNQZXJtYWxpbmsiLCJzdGFydHNXaXRoIiwicGFyc2VkVXJsIiwiVVJMIiwiaG9zdG5hbWUiLCJob3N0Iiwicm9vbUFsaWFzIiwiaW5jbHVkZXMiLCJnZXREb21haW4iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21fYWxpYXMiLCJhdXRvX2pvaW4iLCJfdHlwZSIsInZpYVNlcnZlcnMiLCJyb29tX2lkIiwidmlhX3NlcnZlcnMiLCJwZXJtYWxpbmtQYXJ0cyIsInJvb21JZE9yQWxpYXMiLCJlbnRpdHkiLCJldmVudElkIiwidGFyZ2V0Um9vbUlkIiwicm9vbXMiLCJnZXRSb29tcyIsImkiLCJhbGlhc0V2ZW50cyIsImoiLCJrIiwia2ljayIsImJhbiIsInVuYmFuIiwiaWdub3JlZFVzZXJzIiwiZ2V0SWdub3JlZFVzZXJzIiwicHVzaCIsInNldElnbm9yZWRVc2VycyIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInBvd2VyTGV2ZWwiLCJ1bmRlZmluZWQiLCJwYXJzZUludCIsImlzTmFOIiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwiRWZmZWN0aXZlTWVtYmVyc2hpcCIsIkxlYXZlIiwicG93ZXJMZXZlbEV2ZW50Iiwic2V0UG93ZXJMZXZlbCIsInVzZXJzIiwiRGV2dG9vbHNEaWFsb2ciLCJjcmVhdGVEaWFsb2ciLCJhZHZhbmNlZCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIldpZGdldHMiLCJ3aWRnZXRVcmwiLCJ0b0xvd2VyQ2FzZSIsImVtYmVkIiwiY2hpbGROb2RlcyIsImlmcmFtZSIsInRhZ05hbWUiLCJhdHRycyIsInNyY0F0dHIiLCJmaW5kIiwiYSIsImxvZyIsInZhbHVlIiwiV2lkZ2V0VXRpbHMiLCJjYW5Vc2VyTW9kaWZ5V2lkZ2V0cyIsIm5vd01zIiwiRGF0ZSIsImdldFRpbWUiLCJ3aWRnZXRJZCIsImVuY29kZVVSSUNvbXBvbmVudCIsInR5cGUiLCJXaWRnZXRUeXBlIiwiQ1VTVE9NIiwiZGF0YSIsImppdHNpRGF0YSIsIkppdHNpIiwiZ2V0SW5zdGFuY2UiLCJwYXJzZVByZWZlcnJlZENvbmZlcmVuY2VVcmwiLCJKSVRTSSIsImdldExvY2FsSml0c2lXcmFwcGVyVXJsIiwic2V0Um9vbVdpZGdldCIsImRldmljZUlkIiwiZmluZ2VycHJpbnQiLCJkZXZpY2UiLCJnZXRTdG9yZWREZXZpY2UiLCJkZXZpY2VUcnVzdCIsImNoZWNrRGV2aWNlVHJ1c3QiLCJpc1ZlcmlmaWVkIiwiZ2V0RmluZ2VycHJpbnQiLCJmcHJpbnQiLCJzZXREZXZpY2VWZXJpZmllZCIsImZvcmNlRGlzY2FyZFNlc3Npb24iLCJzZW5kSHRtbEVtb3RlIiwiU2xhc2hDb21tYW5kSGVscERpYWxvZyIsIkFjdGlvbiIsIlZpZXdVc2VyIiwiU2RrQ29uZmlnIiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJCdWdSZXBvcnREaWFsb2ciLCJpbml0aWFsVGV4dCIsImlzUGhvbmVOdW1iZXIiLCJ0ZXN0IiwicmVzdWx0cyIsImdldFRoaXJkcGFydHlVc2VyIiwidXNlcmlkIiwibXNnIiwic2xpY2UiLCJjYWxsIiwiQ2FsbEhhbmRsZXIiLCJzaGFyZWRJbnN0YW5jZSIsImdldENhbGxGb3JSb29tIiwic2V0UmVtb3RlT25Ib2xkIiwiQ0hBVF9FRkZFQ1RTIiwiZWZmZWN0IiwiZmFsbGJhY2tNZXNzYWdlIiwic2VuZEVtb3RlTWVzc2FnZSIsIm1zZ3R5cGUiLCJtc2dUeXBlIiwiYm9keSIsInNlbmRNZXNzYWdlIiwiZWZmZWN0cyIsIkNvbW1hbmRNYXAiLCJNYXAiLCJmb3JFYWNoIiwic2V0IiwiYWxpYXMiLCJwYXJzZUNvbW1hbmRTdHJpbmciLCJpbnB1dCIsInJlcGxhY2UiLCJiaXRzIiwic3Vic3RyaW5nIiwiaGFzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQU9BLE1BQU1BLGVBQWUsR0FBRztBQUFBO0FBQTBCO0FBQzlDLFNBQU8sSUFBSUMsT0FBSixDQUFhQyxPQUFELElBQWE7QUFDNUIsVUFBTUMsWUFBWSxHQUFHQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBckI7QUFDQUYsSUFBQUEsWUFBWSxD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QUFBcEM7QUFBQSxFQUFtRDtBQUN0RCxRQUFNO0FBQUN4TixJQUFBQSxHQUFEO0FBQU1aLElBQUFBO0FBQU4sTUFBY21PLGtCQUFrQixDQUFDQyxLQUFELENBQXRDOztBQUVBLE1BQUlOLFVBQVUsQ0FBQ1UsR0FBWCxDQUFlNU4sR0FBZixLQUF1QmtOLFVBQVUsQ0FBQ3ZPLEdBQVgsQ0FBZXFCLEdBQWYsRUFBb0JMLFNBQXBCLEVBQTNCLEVBQTREO0FBQ3hELFdBQU8sTUFBTXVOLFVBQVUsQ0FBQ3ZPLEdBQVgsQ0FBZXFCLEdBQWYsRUFBb0JGLEdBQXBCLENBQXdCQyxNQUF4QixFQUFnQ1gsSUFBaEMsRUFBc0NZLEdBQXRDLENBQWI7QUFDSDtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQge190LCBfdGR9IGZyb20gJy4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCBNdWx0aUludml0ZXIgZnJvbSAnLi91dGlscy9NdWx0aUludml0ZXInO1xuaW1wb3J0IHsgbGlua2lmeUFuZFNhbml0aXplSHRtbCB9IGZyb20gJy4vSHRtbFV0aWxzJztcbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBXaWRnZXRVdGlscyBmcm9tIFwiLi91dGlscy9XaWRnZXRVdGlsc1wiO1xuaW1wb3J0IHt0ZXh0VG9IdG1sUmFpbmJvd30gZnJvbSBcIi4vdXRpbHMvY29sb3VyXCI7XG5pbXBvcnQgeyBnZXRBZGRyZXNzVHlwZSB9IGZyb20gJy4vVXNlckFkZHJlc3MnO1xuaW1wb3J0IHsgYWJicmV2aWF0ZVVybCB9IGZyb20gJy4vdXRpbHMvVXJsVXRpbHMnO1xuaW1wb3J0IHsgZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsLCB1c2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXIgfSBmcm9tICcuL3V0aWxzL0lkZW50aXR5U2VydmVyVXRpbHMnO1xuaW1wb3J0IHtpc1Blcm1hbGlua0hvc3QsIHBhcnNlUGVybWFsaW5rfSBmcm9tIFwiLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7aW52aXRlVXNlcnNUb1Jvb219IGZyb20gXCIuL1Jvb21JbnZpdGVcIjtcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7IEppdHNpIH0gZnJvbSBcIi4vd2lkZ2V0cy9KaXRzaVwiO1xuaW1wb3J0IHsgcGFyc2VGcmFnbWVudCBhcyBwYXJzZUh0bWwgfSBmcm9tIFwicGFyc2U1XCI7XG5pbXBvcnQgQnVnUmVwb3J0RGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9CdWdSZXBvcnREaWFsb2dcIjtcbmltcG9ydCB7IGVuc3VyZURNRXhpc3RzIH0gZnJvbSBcIi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IHsgVmlld1VzZXJQYXlsb2FkIH0gZnJvbSBcIi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3VXNlclBheWxvYWRcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgRWZmZWN0aXZlTWVtYmVyc2hpcCwgZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcCwgbGVhdmVSb29tQmVoYXZpb3VyIH0gZnJvbSBcIi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi9TZGtDb25maWdcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7Q0hBVF9FRkZFQ1RTfSBmcm9tIFwiLi9lZmZlY3RzXCJcbmltcG9ydCBDYWxsSGFuZGxlciBmcm9tIFwiLi9DYWxsSGFuZGxlclwiO1xuaW1wb3J0IHtndWVzc0FuZFNldERNUm9vbX0gZnJvbSBcIi4vUm9vbXNcIjtcblxuLy8gWFhYOiB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzMxODE2XG5pbnRlcmZhY2UgSFRNTElucHV0RXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gICAgdGFyZ2V0OiBIVE1MSW5wdXRFbGVtZW50ICYgRXZlbnRUYXJnZXQ7XG59XG5cbmNvbnN0IHNpbmdsZU14Y1VwbG9hZCA9IGFzeW5jICgpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlU2VsZWN0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBmaWxlU2VsZWN0b3Iuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2ZpbGUnKTtcbiAgICAgICAgZmlsZVNlbGVjdG9yLm9uY2hhbmdlID0gKGV2OiBIVE1MSW5wdXRFdmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGV2LnRhcmdldC5maWxlc1swXTtcblxuICAgICAgICAgICAgY29uc3QgVXBsb2FkQ29uZmlybURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlVwbG9hZENvbmZpcm1EaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdVcGxvYWQgRmlsZXMgY29uZmlybWF0aW9uJywgJycsIFVwbG9hZENvbmZpcm1EaWFsb2csIHtcbiAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IChzaG91bGRDb250aW51ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNob3VsZENvbnRpbnVlID8gTWF0cml4Q2xpZW50UGVnLmdldCgpLnVwbG9hZENvbnRlbnQoZmlsZSkgOiBudWxsKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZmlsZVNlbGVjdG9yLmNsaWNrKCk7XG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgQ29tbWFuZENhdGVnb3JpZXMgPSB7XG4gICAgXCJtZXNzYWdlc1wiOiBfdGQoXCJNZXNzYWdlc1wiKSxcbiAgICBcImFjdGlvbnNcIjogX3RkKFwiQWN0aW9uc1wiKSxcbiAgICBcImFkbWluXCI6IF90ZChcIkFkbWluXCIpLFxuICAgIFwiYWR2YW5jZWRcIjogX3RkKFwiQWR2YW5jZWRcIiksXG4gICAgXCJlZmZlY3RzXCI6IF90ZChcIkVmZmVjdHNcIiksXG4gICAgXCJvdGhlclwiOiBfdGQoXCJPdGhlclwiKSxcbn07XG5cbnR5cGUgUnVuRm4gPSAoKHJvb21JZDogc3RyaW5nLCBhcmdzOiBzdHJpbmcsIGNtZDogc3RyaW5nKSA9PiB7ZXJyb3I6IGFueX0gfCB7cHJvbWlzZTogUHJvbWlzZTxhbnk+fSk7XG5cbmludGVyZmFjZSBJQ29tbWFuZE9wdHMge1xuICAgIGNvbW1hbmQ6IHN0cmluZztcbiAgICBhbGlhc2VzPzogc3RyaW5nW107XG4gICAgYXJncz86IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHJ1bkZuPzogUnVuRm47XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2U/OiBib29sZWFuO1xuICAgIGlzRW5hYmxlZD8oKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbW1hbmQge1xuICAgIGNvbW1hbmQ6IHN0cmluZztcbiAgICBhbGlhc2VzOiBzdHJpbmdbXTtcbiAgICBhcmdzOiB1bmRlZmluZWQgfCBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBydW5GbjogdW5kZWZpbmVkIHwgUnVuRm47XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2U6IGJvb2xlYW47XG4gICAgX2lzRW5hYmxlZD86ICgpID0+IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRzOiBJQ29tbWFuZE9wdHMpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gb3B0cy5jb21tYW5kO1xuICAgICAgICB0aGlzLmFsaWFzZXMgPSBvcHRzLmFsaWFzZXMgfHwgW107XG4gICAgICAgIHRoaXMuYXJncyA9IG9wdHMuYXJncyB8fCBcIlwiO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gb3B0cy5kZXNjcmlwdGlvbjtcbiAgICAgICAgdGhpcy5ydW5GbiA9IG9wdHMucnVuRm47XG4gICAgICAgIHRoaXMuY2F0ZWdvcnkgPSBvcHRzLmNhdGVnb3J5IHx8IENvbW1hbmRDYXRlZ29yaWVzLm90aGVyO1xuICAgICAgICB0aGlzLmhpZGVDb21wbGV0aW9uQWZ0ZXJTcGFjZSA9IG9wdHMuaGlkZUNvbXBsZXRpb25BZnRlclNwYWNlIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLl9pc0VuYWJsZWQgPSBvcHRzLmlzRW5hYmxlZDtcbiAgICB9XG5cbiAgICBnZXRDb21tYW5kKCkge1xuICAgICAgICByZXR1cm4gYC8ke3RoaXMuY29tbWFuZH1gO1xuICAgIH1cblxuICAgIGdldENvbW1hbmRXaXRoQXJncygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29tbWFuZCgpICsgXCIgXCIgKyB0aGlzLmFyZ3M7XG4gICAgfVxuXG4gICAgcnVuKHJvb21JZDogc3RyaW5nLCBhcmdzOiBzdHJpbmcsIGNtZDogc3RyaW5nKSB7XG4gICAgICAgIC8vIGlmIGl0IGhhcyBubyBydW5GbiB0aGVuIGl0cyBhbiBpZ25vcmVkL25vcCBjb21tYW5kIChhdXRvY29tcGxldGUgb25seSkgZS5nIGAvbWVgXG4gICAgICAgIGlmICghdGhpcy5ydW5GbikgcmV0dXJuIHJlamVjdChfdChcIkNvbW1hbmQgZXJyb3JcIikpO1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5Gbi5iaW5kKHRoaXMpKHJvb21JZCwgYXJncywgY21kKTtcbiAgICB9XG5cbiAgICBnZXRVc2FnZSgpIHtcbiAgICAgICAgcmV0dXJuIF90KCdVc2FnZScpICsgJzogJyArIHRoaXMuZ2V0Q29tbWFuZFdpdGhBcmdzKCk7XG4gICAgfVxuXG4gICAgaXNFbmFibGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNFbmFibGVkID8gdGhpcy5faXNFbmFibGVkKCkgOiB0cnVlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVqZWN0KGVycm9yKSB7XG4gICAgcmV0dXJuIHtlcnJvcn07XG59XG5cbmZ1bmN0aW9uIHN1Y2Nlc3MocHJvbWlzZT86IFByb21pc2U8YW55Pikge1xuICAgIHJldHVybiB7cHJvbWlzZX07XG59XG5cbi8qIERpc2FibGUgdGhlIFwidW5leHBlY3RlZCB0aGlzXCIgZXJyb3IgZm9yIHRoZXNlIGNvbW1hbmRzIC0gYWxsIG9mIHRoZSBydW5cbiAqIGZ1bmN0aW9ucyBhcmUgY2FsbGVkIHdpdGggYHRoaXNgIGJvdW5kIHRvIHRoZSBDb21tYW5kIGluc3RhbmNlLlxuICovXG5cbmV4cG9ydCBjb25zdCBDb21tYW5kcyA9IFtcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdzaHJ1ZycsXG4gICAgICAgIGFyZ3M6ICc8bWVzc2FnZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdQcmVwZW5kcyDCr1xcXFxfKOODhClfL8KvIHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJ8KvXFxcXF8o44OEKV8vwq8nO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSArICcgJyArIGFyZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFRleHRNZXNzYWdlKHJvb21JZCwgbWVzc2FnZSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndGFibGVmbGlwJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ByZXBlbmRzICjila/CsOKWocKw77yJ4pWv77i1IOKUu+KUgeKUuyB0byBhIHBsYWluLXRleHQgbWVzc2FnZScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICco4pWvwrDilqHCsO+8ieKVr++4tSDilLvilIHilLsnO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSArICcgJyArIGFyZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFRleHRNZXNzYWdlKHJvb21JZCwgbWVzc2FnZSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndW5mbGlwJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ByZXBlbmRzIOKUrOKUgOKUgOKUrCDjg44oIOOCnC3jgpzjg44pIHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJ+KUrOKUgOKUgOKUrCDjg44oIOOCnC3jgpzjg44pJztcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgKyAnICcgKyBhcmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRUZXh0TWVzc2FnZShyb29tSWQsIG1lc3NhZ2UpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2xlbm55JyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1ByZXBlbmRzICggzaHCsCDNnMqWIM2hwrApIHRvIGEgcGxhaW4tdGV4dCBtZXNzYWdlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJyggzaHCsCDNnMqWIM2hwrApJztcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UgKyAnICcgKyBhcmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRUZXh0TWVzc2FnZShyb29tSWQsIG1lc3NhZ2UpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3BsYWluJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1NlbmRzIGEgbWVzc2FnZSBhcyBwbGFpbiB0ZXh0LCB3aXRob3V0IGludGVycHJldGluZyBpdCBhcyBtYXJrZG93bicpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBtZXNzYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRUZXh0TWVzc2FnZShyb29tSWQsIG1lc3NhZ2VzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdodG1sJyxcbiAgICAgICAgYXJnczogJzxtZXNzYWdlPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1NlbmRzIGEgbWVzc2FnZSBhcyBodG1sLCB3aXRob3V0IGludGVycHJldGluZyBpdCBhcyBtYXJrZG93bicpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBtZXNzYWdlcykge1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRIdG1sTWVzc2FnZShyb29tSWQsIG1lc3NhZ2VzLCBtZXNzYWdlcykpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnZGRnJyxcbiAgICAgICAgYXJnczogJzxxdWVyeT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdTZWFyY2hlcyBEdWNrRHVja0dvIGZvciByZXN1bHRzJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5FcnJvckRpYWxvZycpO1xuICAgICAgICAgICAgLy8gVE9ETyBEb24ndCBleHBsYWluIHRoaXMgYXdheSwgYWN0dWFsbHkgc2hvdyBhIHNlYXJjaCBVSSBoZXJlLlxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2xhc2ggQ29tbWFuZHMnLCAnL2RkZyBpcyBub3QgYSBjb21tYW5kJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJy9kZGcgaXMgbm90IGEgY29tbWFuZCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnVG8gdXNlIGl0LCBqdXN0IHdhaXQgZm9yIGF1dG9jb21wbGV0ZSByZXN1bHRzIHRvIGxvYWQgYW5kIHRhYiB0aHJvdWdoIHRoZW0uJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgICAgICBoaWRlQ29tcGxldGlvbkFmdGVyU3BhY2U6IHRydWUsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndXBncmFkZXJvb20nLFxuICAgICAgICBhcmdzOiAnPG5ld192ZXJzaW9uPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ1VwZ3JhZGVzIGEgcm9vbSB0byBhIG5ldyB2ZXJzaW9uJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmICghcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoXCJtLnJvb20udG9tYnN0b25lXCIsIGNsaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChfdChcIllvdSBkbyBub3QgaGF2ZSB0aGUgcmVxdWlyZWQgcGVybWlzc2lvbnMgdG8gdXNlIHRoaXMgY29tbWFuZC5cIikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IFJvb21VcGdyYWRlV2FybmluZ0RpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlJvb21VcGdyYWRlV2FybmluZ0RpYWxvZ1wiKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICd1cGdyYWRlIHJvb20gY29uZmlybWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgUm9vbVVwZ3JhZGVXYXJuaW5nRGlhbG9nLCB7cm9vbUlkOiByb29tSWQsIHRhcmdldFZlcnNpb246IGFyZ3N9LCAvKmNsYXNzTmFtZT0qL251bGwsXG4gICAgICAgICAgICAgICAgICAgIC8qaXNQcmlvcml0eT0qL2ZhbHNlLCAvKmlzU3RhdGljPSovdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhmaW5pc2hlZC50aGVuKGFzeW5jIChbcmVzcF0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwLmNvbnRpbnVlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrRm9yVXBncmFkZUZuO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBncmFkZVByb21pc2UgPSBjbGkudXBncmFkZVJvb20ocm9vbUlkLCBhcmdzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byB3YWl0IGZvciB0aGUganMtc2RrIHRvIGdpdmUgdXMgdGhlIHJvb20gYmFjayBzb1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuIG1vcmUgZWZmZWN0aXZlbHkgYWJ1c2UgdGhlIE11bHRpSW52aXRlciBiZWhhdmlvdXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIGhlYXZpbHkgcmVsaWVzIG9uIHRoZSBSb29tIG9iamVjdCBiZWluZyBhdmFpbGFibGUuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5pbnZpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja0ZvclVwZ3JhZGVGbiA9IGFzeW5jIChuZXdSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSB1cGdyYWRlUHJvbWlzZSBzaG91bGQgYmUgZG9uZSBieSB0aGUgdGltZSB3ZSBhd2FpdCBpdCBoZXJlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7cmVwbGFjZW1lbnRfcm9vbTogbmV3Um9vbUlkfSA9IGF3YWl0IHVwZ3JhZGVQcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Um9vbS5yb29tSWQgIT09IG5ld1Jvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvSW52aXRlID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoXCJqb2luXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucm9vbS5nZXRNZW1iZXJzV2l0aE1lbWJlcnNoaXAoXCJpbnZpdGVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0ubWFwKG0gPT4gbS51c2VySWQpLmZpbHRlcihtID0+IG0gIT09IGNsaS5nZXRVc2VySWQoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvSW52aXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVycm9ycyBhcmUgaGFuZGxlZCBpbnRlcm5hbGx5IHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGludml0ZVVzZXJzVG9Sb29tKG5ld1Jvb21JZCwgdG9JbnZpdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKCdSb29tJywgY2hlY2tGb3JVcGdyYWRlRm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpLm9uKCdSb29tJywgY2hlY2tGb3JVcGdyYWRlRm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGF3YWl0IGFmdGVyIHNvIHRoYXQgdGhlIGNoZWNrRm9yVXBncmFkZXNGbiBoYXMgYSBwcm9wZXIgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0byB0aGUgbmV3IHJvb20ncyBJRC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHVwZ3JhZGVQcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tGb3JVcGdyYWRlRm4pIGNsaS5yZW1vdmVMaXN0ZW5lcignUm9vbScsIGNoZWNrRm9yVXBncmFkZUZuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLkVycm9yRGlhbG9nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICdyb29tIHVwZ3JhZGUgZXJyb3InLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3IgdXBncmFkaW5nIHJvb20nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEb3VibGUgY2hlY2sgdGhhdCB5b3VyIHNlcnZlciBzdXBwb3J0cyB0aGUgcm9vbSB2ZXJzaW9uIGNob3NlbiBhbmQgdHJ5IGFnYWluLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICduaWNrJyxcbiAgICAgICAgYXJnczogJzxkaXNwbGF5X25hbWU+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnQ2hhbmdlcyB5b3VyIGRpc3BsYXkgbmlja25hbWUnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0RGlzcGxheU5hbWUoYXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdteXJvb21uaWNrJyxcbiAgICAgICAgYWxpYXNlczogWydyb29tbmljayddLFxuICAgICAgICBhcmdzOiAnPGRpc3BsYXlfbmFtZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdDaGFuZ2VzIHlvdXIgZGlzcGxheSBuaWNrbmFtZSBpbiB0aGUgY3VycmVudCByb29tIG9ubHknKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXYgPSBjbGkuZ2V0Um9vbShyb29tSWQpLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLm1lbWJlcicsIGNsaS5nZXRVc2VySWQoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uZXYgPyBldi5nZXRDb250ZW50KCkgOiB7IG1lbWJlcnNoaXA6ICdqb2luJyB9LFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5bmFtZTogYXJncyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGNsaS5zZW5kU3RhdGVFdmVudChyb29tSWQsICdtLnJvb20ubWVtYmVyJywgY29udGVudCwgY2xpLmdldFVzZXJJZCgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ3Jvb21hdmF0YXInLFxuICAgICAgICBhcmdzOiAnWzxteGNfdXJsPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdDaGFuZ2VzIHRoZSBhdmF0YXIgb2YgdGhlIGN1cnJlbnQgcm9vbScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShhcmdzKTtcbiAgICAgICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgICAgICAgIHByb21pc2UgPSBzaW5nbGVNeGNVcGxvYWQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MocHJvbWlzZS50aGVuKCh1cmwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXVybCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCAnbS5yb29tLmF2YXRhcicsIHt1cmx9LCAnJyk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ215cm9vbWF2YXRhcicsXG4gICAgICAgIGFyZ3M6ICdbPG14Y191cmw+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0NoYW5nZXMgeW91ciBhdmF0YXIgaW4gdGhpcyBjdXJyZW50IHJvb20gb25seScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcblxuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoYXJncyk7XG4gICAgICAgICAgICBpZiAoIWFyZ3MpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gc2luZ2xlTXhjVXBsb2FkKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKHByb21pc2UudGhlbigodXJsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBldiA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ubWVtYmVyJywgdXNlcklkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5ldiA/IGV2LmdldENvbnRlbnQoKSA6IHsgbWVtYmVyc2hpcDogJ2pvaW4nIH0sXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHVybCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGkuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCAnbS5yb29tLm1lbWJlcicsIGNvbnRlbnQsIHVzZXJJZCk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ215YXZhdGFyJyxcbiAgICAgICAgYXJnczogJ1s8bXhjX3VybD5dJyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnQ2hhbmdlcyB5b3VyIGF2YXRhciBpbiBhbGwgcm9vbXMnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoYXJncyk7XG4gICAgICAgICAgICBpZiAoIWFyZ3MpIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlID0gc2luZ2xlTXhjVXBsb2FkKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKHByb21pc2UudGhlbigodXJsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybjtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldEF2YXRhclVybCh1cmwpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICd0b3BpYycsXG4gICAgICAgIGFyZ3M6ICdbPHRvcGljPl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdHZXRzIG9yIHNldHMgdGhlIHJvb20gdG9waWMnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhjbGkuc2V0Um9vbVRvcGljKHJvb21JZCwgYXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIXJvb20pIHJldHVybiByZWplY3QoX3QoXCJGYWlsZWQgdG8gc2V0IHRvcGljXCIpKTtcblxuICAgICAgICAgICAgY29uc3QgdG9waWNFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnRvcGljJywgJycpO1xuICAgICAgICAgICAgY29uc3QgdG9waWMgPSB0b3BpY0V2ZW50cyAmJiB0b3BpY0V2ZW50cy5nZXRDb250ZW50KCkudG9waWM7XG4gICAgICAgICAgICBjb25zdCB0b3BpY0h0bWwgPSB0b3BpYyA/IGxpbmtpZnlBbmRTYW5pdGl6ZUh0bWwodG9waWMpIDogX3QoJ1RoaXMgcm9vbSBoYXMgbm8gdG9waWMuJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IEluZm9EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLkluZm9EaWFsb2cnKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1NsYXNoIENvbW1hbmRzJywgJ1RvcGljJywgSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiByb29tLm5hbWUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiB0b3BpY0h0bWwgfX0gLz4sXG4gICAgICAgICAgICAgICAgaGFzQ2xvc2VCdXR0b246IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdyb29tbmFtZScsXG4gICAgICAgIGFyZ3M6ICc8bmFtZT4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdTZXRzIHRoZSByb29tIG5hbWUnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Um9vbU5hbWUocm9vbUlkLCBhcmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdpbnZpdGUnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnSW52aXRlcyB1c2VyIHdpdGggZ2l2ZW4gaWQgdG8gY3VycmVudCByb29tJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKykkLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgdXNlIGEgTXVsdGlJbnZpdGVyIHRvIHJlLXVzZSB0aGUgaW52aXRlIGxvZ2ljLCBldmVuIHRob3VnaFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBvbmx5IGludml0aW5nIG9uZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgbmVlZCBhbiBpZGVudGl0eSBzZXJ2ZXIgYnV0IGRvbid0IGhhdmUgb25lLCB0aGluZ3NcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGEgYml0IG1vcmUgY29tcGxleCBoZXJlLCBidXQgd2UgdHJ5IHRvIHNob3cgc29tZXRoaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIG1lYW5pbmdmdWwuXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9tID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEFkZHJlc3NUeXBlKGFkZHJlc3MpID09PSAnZW1haWwnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwgPSBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nPFtib29sZWFuXT4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdTbGFzaCBDb21tYW5kcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJZGVudGl0eSBzZXJ2ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVXNlIGFuIGlkZW50aXR5IHNlcnZlclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIHRvIGludml0ZSBieSBlbWFpbC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ2xpY2sgY29udGludWUgdG8gdXNlIHRoZSBkZWZhdWx0IGlkZW50aXR5IHNlcnZlciBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIoJShkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJOYW1lKXMpIG9yIG1hbmFnZSBpbiBTZXR0aW5ncy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRJZGVudGl0eVNlcnZlck5hbWU6IGFiYnJldmlhdGVVcmwoZGVmYXVsdElkZW50aXR5U2VydmVyVXJsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX08L3A+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIkNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9tID0gZmluaXNoZWQudGhlbigoW3VzZURlZmF1bHRdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VEZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoX3QoXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIHRvIGludml0ZSBieSBlbWFpbC4gTWFuYWdlIGluIFNldHRpbmdzLlwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoX3QoXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIHRvIGludml0ZSBieSBlbWFpbC4gTWFuYWdlIGluIFNldHRpbmdzLlwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW52aXRlciA9IG5ldyBNdWx0aUludml0ZXIocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MocHJvbS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnZpdGVyLmludml0ZShbYWRkcmVzc10pO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnZpdGVyLmdldENvbXBsZXRpb25TdGF0ZShhZGRyZXNzKSAhPT0gXCJpbnZpdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW52aXRlci5nZXRFcnJvclRleHQoYWRkcmVzcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdqb2luJyxcbiAgICAgICAgYWxpYXNlczogWydqJywgJ2dvdG8nXSxcbiAgICAgICAgYXJnczogJzxyb29tLWFkZHJlc3M+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnSm9pbnMgcm9vbSB3aXRoIGdpdmVuIGFkZHJlc3MnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKF8sIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgLy8gTm90ZTogd2Ugc3VwcG9ydCAyIHZlcnNpb25zIG9mIHRoaXMgY29tbWFuZC4gVGhlIGZpcnN0IGlzXG4gICAgICAgICAgICAgICAgLy8gdGhlIHB1YmxpYy1mYWNpbmcgb25lIGZvciBtb3N0IHVzZXJzIGFuZCB0aGUgb3RoZXIgaXMgYVxuICAgICAgICAgICAgICAgIC8vIHBvd2VyLXVzZXIgZWRpdGlvbiB3aGVyZSBzb21lb25lIG1heSBqb2luIHZpYSBwZXJtYWxpbmsgb3JcbiAgICAgICAgICAgICAgICAvLyByb29tIElEIHdpdGggb3B0aW9uYWwgc2VydmVycy4gUHJhY3RpY2FsbHksIHRoaXMgcmVzdWx0c1xuICAgICAgICAgICAgICAgIC8vIGluIHRoZSBmb2xsb3dpbmcgdmFyaWF0aW9uczpcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luICNleGFtcGxlOmV4YW1wbGUub3JnXG4gICAgICAgICAgICAgICAgLy8gICAvam9pbiAhZXhhbXBsZTpleGFtcGxlLm9yZ1xuICAgICAgICAgICAgICAgIC8vICAgL2pvaW4gIWV4YW1wbGU6ZXhhbXBsZS5vcmcgYWx0c2VydmVyLmNvbSBlbHNld2hlcmUuY2FcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luIGh0dHBzOi8vbWF0cml4LnRvLyMvIWV4YW1wbGU6ZXhhbXBsZS5vcmc/dmlhPWFsdHNlcnZlci5jb21cbiAgICAgICAgICAgICAgICAvLyBUaGUgY29tbWFuZCBhbHNvIHN1cHBvcnRzIGV2ZW50IHBlcm1hbGlua3MgdHJhbnNwYXJlbnRseTpcbiAgICAgICAgICAgICAgICAvLyAgIC9qb2luIGh0dHBzOi8vbWF0cml4LnRvLyMvIWV4YW1wbGU6ZXhhbXBsZS5vcmcvJHNvbWV0aGluZzpleGFtcGxlLm9yZ1xuICAgICAgICAgICAgICAgIC8vICAgL2pvaW4gaHR0cHM6Ly9tYXRyaXgudG8vIy8hZXhhbXBsZTpleGFtcGxlLm9yZy8kc29tZXRoaW5nOmV4YW1wbGUub3JnP3ZpYT1hbHRzZXJ2ZXIuY29tXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gYXJncy5zcGxpdCgnICcpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMSkgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGlzUGVybWFsaW5rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtc1swXS5zdGFydHNXaXRoKFwiaHR0cDpcIikgfHwgcGFyYW1zWzBdLnN0YXJ0c1dpdGgoXCJodHRwczpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSXQncyBhdCBsZWFzdCBhIFVSTCAtIHRyeSBhbmQgcHVsbCBvdXQgYSBob3N0bmFtZSB0byBjaGVjayBhZ2FpbnN0IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBwZXJtYWxpbmsgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRVcmwgPSBuZXcgVVJMKHBhcmFtc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhvc3RuYW1lID0gcGFyc2VkVXJsLmhvc3QgfHwgcGFyc2VkVXJsLmhvc3RuYW1lOyAvLyB0YWtlcyBmaXJzdCBub24tZmFsc2V5IHZhbHVlXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UncmUgdXNpbmcgYSBFbGVtZW50IHBlcm1hbGluayBoYW5kbGVyLCB0aGlzIHdpbGwgY2F0Y2ggaXQgYmVmb3JlIHdlIGdldCBtdWNoIGZ1cnRoZXIuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlZSBiZWxvdyB3aGVyZSB3ZSBtYWtlIGFzc3VtcHRpb25zIGFib3V0IHBhcnNpbmcgdGhlIFVSTC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUGVybWFsaW5rSG9zdChob3N0bmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUGVybWFsaW5rID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zWzBdWzBdID09PSAnIycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvb21BbGlhcyA9IHBhcmFtc1swXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tQWxpYXMuaW5jbHVkZXMoJzonKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUFsaWFzICs9ICc6JyArIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9hbGlhczogcm9vbUFsaWFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b19qb2luOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3R5cGU6IFwic2xhc2hfY29tbWFuZFwiLCAvLyBpbnN0cnVtZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbXNbMF1bMF0gPT09ICchJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbcm9vbUlkLCAuLi52aWFTZXJ2ZXJzXSA9IHBhcmFtcztcblxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBhcmUgcGFzc2VkIGRvd24gdG8gdGhlIGpzLXNkaydzIC9qb2luIGNhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFTZXJ2ZXJzOiB2aWFTZXJ2ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpYV9zZXJ2ZXJzOiB2aWFTZXJ2ZXJzLCAvLyBmb3IgdGhlIHJlam9pbiBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9fam9pbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF90eXBlOiBcInNsYXNoX2NvbW1hbmRcIiwgLy8gaW5zdHJ1bWVudGF0aW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQZXJtYWxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGVybWFsaW5rUGFydHMgPSBwYXJzZVBlcm1hbGluayhwYXJhbXNbMF0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2hlY2sgdGVjaG5pY2FsbHkgaXNuJ3QgbmVlZGVkIGJlY2F1c2Ugd2UgYWxyZWFkeSBkaWQgb3VyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNhZmV0eSBjaGVja3MgdXAgYWJvdmUuIEhvd2V2ZXIsIGZvciBnb29kIG1lYXN1cmUsIGxldCdzIGJlIHN1cmUuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGVybWFsaW5rUGFydHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGZvciBzb21lIHJlYXNvbiBzb21lb25lIHdhbnRlZCB0byBqb2luIGEgZ3JvdXAgb3IgdXNlciwgd2Ugc2hvdWxkXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3AgdGhlbSBub3cuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGVybWFsaW5rUGFydHMucm9vbUlkT3JBbGlhcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW50aXR5ID0gcGVybWFsaW5rUGFydHMucm9vbUlkT3JBbGlhcztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmlhU2VydmVycyA9IHBlcm1hbGlua1BhcnRzLnZpYVNlcnZlcnM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50SWQgPSBwZXJtYWxpbmtQYXJ0cy5ldmVudElkO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BhdGNoID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9fam9pbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF90eXBlOiBcInNsYXNoX2NvbW1hbmRcIiwgLy8gaW5zdHJ1bWVudGF0aW9uXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eVswXSA9PT0gJyEnKSBkaXNwYXRjaFtcInJvb21faWRcIl0gPSBlbnRpdHk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgZGlzcGF0Y2hbXCJyb29tX2FsaWFzXCJdID0gZW50aXR5O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaFtcImV2ZW50X2lkXCJdID0gZXZlbnRJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoW1wiaGlnaGxpZ2h0ZWRcIl0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHZpYVNlcnZlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciB0aGUgam9pblxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2hbXCJvcHRzXCJdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIGFyZSBwYXNzZWQgZG93biB0byB0aGUganMtc2RrJ3MgL2pvaW4gY2FsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpYVNlcnZlcnM6IHZpYVNlcnZlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaWYgdGhlIGpvaW4gZmFpbHMgKHJlam9pbiBidXR0b24pXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaFsndmlhX3NlcnZlcnMnXSA9IHZpYVNlcnZlcnM7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goZGlzcGF0Y2gpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAncGFydCcsXG4gICAgICAgIGFyZ3M6ICdbPHJvb20tYWRkcmVzcz5dJyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnTGVhdmUgcm9vbScpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgICAgIGxldCB0YXJnZXRSb29tSWQ7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKFxcUyspJC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb29tQWxpYXMgPSBtYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbUFsaWFzWzBdICE9PSAnIycpIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvb21BbGlhcy5pbmNsdWRlcygnOicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tQWxpYXMgKz0gJzonICsgY2xpLmdldERvbWFpbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgYSByb29tIHdpdGggdGhpcyBhbGlhc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tcyA9IGNsaS5nZXRSb29tcygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvb21zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGlhc0V2ZW50cyA9IHJvb21zW2ldLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLmFsaWFzZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYWxpYXNFdmVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGlhc2VzID0gYWxpYXNFdmVudHNbal0uZ2V0Q29udGVudCgpLmFsaWFzZXMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBhbGlhc2VzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGlhc2VzW2tdID09PSByb29tQWxpYXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFJvb21JZCA9IHJvb21zW2ldLnJvb21JZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRSb29tSWQpIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldFJvb21JZCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRSb29tSWQpIHJldHVybiByZWplY3QoX3QoJ1VucmVjb2duaXNlZCByb29tIGFkZHJlc3M6JykgKyAnICcgKyByb29tQWxpYXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0YXJnZXRSb29tSWQpIHRhcmdldFJvb21JZCA9IHJvb21JZDtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGxlYXZlUm9vbUJlaGF2aW91cih0YXJnZXRSb29tSWQpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAna2ljaycsXG4gICAgICAgIGFyZ3M6ICc8dXNlci1pZD4gW3JlYXNvbl0nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdLaWNrcyB1c2VyIHdpdGggZ2l2ZW4gaWQnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrPykoICsoLiopKT8kLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLmtpY2socm9vbUlkLCBtYXRjaGVzWzFdLCBtYXRjaGVzWzNdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnYmFuJyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPiBbcmVhc29uXScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0JhbnMgdXNlciB3aXRoIGdpdmVuIGlkJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKz8pKCArKC4qKSk/JC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKE1hdHJpeENsaWVudFBlZy5nZXQoKS5iYW4ocm9vbUlkLCBtYXRjaGVzWzFdLCBtYXRjaGVzWzNdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndW5iYW4nLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnVW5iYW5zIHVzZXIgd2l0aCBnaXZlbiBJRCcpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBhcmdzLm1hdGNoKC9eKFxcUyspJC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IHRoZSB1c2VyIG1lbWJlcnNoaXAgdG8gXCJsZWF2ZVwiIHRvIHVuYmFuIGhpbVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhNYXRyaXhDbGllbnRQZWcuZ2V0KCkudW5iYW4ocm9vbUlkLCBtYXRjaGVzWzFdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnaWdub3JlJyxcbiAgICAgICAgYXJnczogJzx1c2VyLWlkPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0lnbm9yZXMgYSB1c2VyLCBoaWRpbmcgdGhlaXIgbWVzc2FnZXMgZnJvbSB5b3UnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihAW146XSs6XFxTKykkLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWdub3JlZFVzZXJzID0gY2xpLmdldElnbm9yZWRVc2VycygpO1xuICAgICAgICAgICAgICAgICAgICBpZ25vcmVkVXNlcnMucHVzaCh1c2VySWQpOyAvLyBkZS1kdXBlZCBpbnRlcm5hbGx5IGluIHRoZSBqcy1zZGtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGkuc2V0SWdub3JlZFVzZXJzKGlnbm9yZWRVc2VycykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgSW5mb0RpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuSW5mb0RpYWxvZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1NsYXNoIENvbW1hbmRzJywgJ1VzZXIgaWdub3JlZCcsIEluZm9EaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdJZ25vcmVkIHVzZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD57IF90KCdZb3UgYXJlIG5vdyBpZ25vcmluZyAlKHVzZXJJZClzJywge3VzZXJJZH0pIH08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAndW5pZ25vcmUnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnU3RvcHMgaWdub3JpbmcgYSB1c2VyLCBzaG93aW5nIHRoZWlyIG1lc3NhZ2VzIGdvaW5nIGZvcndhcmQnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvKF5AW146XSs6XFxTKyQpLyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaWdub3JlZFVzZXJzID0gY2xpLmdldElnbm9yZWRVc2VycygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGlnbm9yZWRVc2Vycy5pbmRleE9mKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIGlnbm9yZWRVc2Vycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaS5zZXRJZ25vcmVkVXNlcnMoaWdub3JlZFVzZXJzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBJbmZvRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5JbmZvRGlhbG9nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2xhc2ggQ29tbWFuZHMnLCAnVXNlciB1bmlnbm9yZWQnLCBJbmZvRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVW5pZ25vcmVkIHVzZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD57IF90KCdZb3UgYXJlIG5vIGxvbmdlciBpZ25vcmluZyAlKHVzZXJJZClzJywge3VzZXJJZH0pIH08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFjdGlvbnMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnb3AnLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+IFs8cG93ZXItbGV2ZWw+XScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0RlZmluZSB0aGUgcG93ZXIgbGV2ZWwgb2YgYSB1c2VyJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKz8pKCArKC0/XFxkKykpPyQvKTtcbiAgICAgICAgICAgICAgICBsZXQgcG93ZXJMZXZlbCA9IDUwOyAvLyBkZWZhdWx0IHBvd2VyIGxldmVsIGZvciBvcFxuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IG1hdGNoZXNbMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gNCAmJiB1bmRlZmluZWQgIT09IG1hdGNoZXNbM10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvd2VyTGV2ZWwgPSBwYXJzZUludChtYXRjaGVzWzNdLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihwb3dlckxldmVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJvb20pIHJldHVybiByZWplY3QoX3QoXCJDb21tYW5kIGZhaWxlZFwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIgfHwgZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcChtZW1iZXIubWVtYmVyc2hpcCkgPT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuTGVhdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KF90KFwiQ291bGQgbm90IGZpbmQgdXNlciBpbiByb29tXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvd2VyTGV2ZWxFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ucG93ZXJfbGV2ZWxzJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoY2xpLnNldFBvd2VyTGV2ZWwocm9vbUlkLCB1c2VySWQsIHBvd2VyTGV2ZWwsIHBvd2VyTGV2ZWxFdmVudCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWRtaW4sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnZGVvcCcsXG4gICAgICAgIGFyZ3M6ICc8dXNlci1pZD4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdEZW9wcyB1c2VyIHdpdGggZ2l2ZW4gaWQnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gYXJncy5tYXRjaCgvXihcXFMrKSQvKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvb20pIHJldHVybiByZWplY3QoX3QoXCJDb21tYW5kIGZhaWxlZFwiKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG93ZXJMZXZlbEV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5wb3dlcl9sZXZlbHMnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcG93ZXJMZXZlbEV2ZW50LmdldENvbnRlbnQoKS51c2Vyc1thcmdzXSkgcmV0dXJuIHJlamVjdChfdChcIkNvdWxkIG5vdCBmaW5kIHVzZXIgaW4gcm9vbVwiKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKGNsaS5zZXRQb3dlckxldmVsKHJvb21JZCwgYXJncywgdW5kZWZpbmVkLCBwb3dlckxldmVsRXZlbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdkZXZ0b29scycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ09wZW5zIHRoZSBEZXZlbG9wZXIgVG9vbHMgZGlhbG9nJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IERldnRvb2xzRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5EZXZ0b29sc0RpYWxvZycpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKERldnRvb2xzRGlhbG9nLCB7cm9vbUlkfSk7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnYWRkd2lkZ2V0JyxcbiAgICAgICAgYXJnczogJzx1cmwgfCBlbWJlZCBjb2RlIHwgSml0c2kgdXJsPicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoJ0FkZHMgYSBjdXN0b20gd2lkZ2V0IGJ5IFVSTCB0byB0aGUgcm9vbScpLFxuICAgICAgICBpc0VuYWJsZWQ6ICgpID0+IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLldpZGdldHMpLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCB3aWRnZXRVcmwpIHtcbiAgICAgICAgICAgIGlmICghd2lkZ2V0VXJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChfdChcIlBsZWFzZSBzdXBwbHkgYSB3aWRnZXQgVVJMIG9yIGVtYmVkIGNvZGVcIikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUcnkgYW5kIHBhcnNlIG91dCBhIHdpZGdldCBVUkwgZnJvbSBpZnJhbWVzXG4gICAgICAgICAgICBpZiAod2lkZ2V0VXJsLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChcIjxpZnJhbWUgXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgdXNlIHBhcnNlNSwgd2hpY2ggZG9lc24ndCByZW5kZXIvY3JlYXRlIGEgRE9NIG5vZGUuIEl0IGluc3RlYWQgcnVuc1xuICAgICAgICAgICAgICAgIC8vIHNvbWUgc3VwZXJmYXN0IHJlZ2V4IG92ZXIgdGhlIHRleHQgc28gd2UgZG9uJ3QgaGF2ZSB0by5cbiAgICAgICAgICAgICAgICBjb25zdCBlbWJlZCA9IHBhcnNlSHRtbCh3aWRnZXRVcmwpO1xuICAgICAgICAgICAgICAgIGlmIChlbWJlZCAmJiBlbWJlZC5jaGlsZE5vZGVzICYmIGVtYmVkLmNoaWxkTm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlmcmFtZSA9IGVtYmVkLmNoaWxkTm9kZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZnJhbWUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaWZyYW1lJyAmJiBpZnJhbWUuYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNyY0F0dHIgPSBpZnJhbWUuYXR0cnMuZmluZChhID0+IGEubmFtZSA9PT0gJ3NyYycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQdWxsaW5nIFVSTCBvdXQgb2YgaWZyYW1lIChlbWJlZCBjb2RlKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldFVybCA9IHNyY0F0dHIudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghd2lkZ2V0VXJsLnN0YXJ0c1dpdGgoXCJodHRwczovL1wiKSAmJiAhd2lkZ2V0VXJsLnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChfdChcIlBsZWFzZSBzdXBwbHkgYSBodHRwczovLyBvciBodHRwOi8vIHdpZGdldCBVUkxcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFdpZGdldFV0aWxzLmNhblVzZXJNb2RpZnlXaWRnZXRzKHJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm93TXMgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdpZGdldElkID0gZW5jb2RlVVJJQ29tcG9uZW50KGAke3Jvb21JZH1fJHt1c2VySWR9XyR7bm93TXN9YCk7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSBXaWRnZXRUeXBlLkNVU1RPTTtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IFwiQ3VzdG9tIFdpZGdldFwiO1xuICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge307XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIHRoZSB3aWRnZXQgYSBKaXRzaSB3aWRnZXQgaWYgaXQgbG9va3MgbGlrZSBhIEppdHNpIHdpZGdldFxuICAgICAgICAgICAgICAgIGNvbnN0IGppdHNpRGF0YSA9IEppdHNpLmdldEluc3RhbmNlKCkucGFyc2VQcmVmZXJyZWRDb25mZXJlbmNlVXJsKHdpZGdldFVybCk7XG4gICAgICAgICAgICAgICAgaWYgKGppdHNpRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk1ha2luZyAvYWRkd2lkZ2V0IHdpZGdldCBhIEppdHNpIGNvbmZlcmVuY2VcIik7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSBXaWRnZXRUeXBlLkpJVFNJO1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gXCJKaXRzaSBDb25mZXJlbmNlXCI7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBqaXRzaURhdGE7XG4gICAgICAgICAgICAgICAgICAgIHdpZGdldFVybCA9IFdpZGdldFV0aWxzLmdldExvY2FsSml0c2lXcmFwcGVyVXJsKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoV2lkZ2V0VXRpbHMuc2V0Um9vbVdpZGdldChyb29tSWQsIHdpZGdldElkLCB0eXBlLCB3aWRnZXRVcmwsIG5hbWUsIGRhdGEpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChfdChcIllvdSBjYW5ub3QgbW9kaWZ5IHdpZGdldHMgaW4gdGhpcyByb29tLlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZG1pbixcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICd2ZXJpZnknLFxuICAgICAgICBhcmdzOiAnPHVzZXItaWQ+IDxkZXZpY2UtaWQ+IDxkZXZpY2Utc2lnbmluZy1rZXk+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnVmVyaWZpZXMgYSB1c2VyLCBzZXNzaW9uLCBhbmQgcHVia2V5IHR1cGxlJyksXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKykgKyhcXFMrKSArKFxcUyspJC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSBtYXRjaGVzWzFdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VJZCA9IG1hdGNoZXNbMl07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmdlcnByaW50ID0gbWF0Y2hlc1szXTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcygoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gY2xpLmdldFN0b3JlZERldmljZSh1c2VySWQsIGRldmljZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGV2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKF90KCdVbmtub3duICh1c2VyLCBzZXNzaW9uKSBwYWlyOicpICsgYCAoJHt1c2VySWR9LCAke2RldmljZUlkfSlgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZVRydXN0ID0gYXdhaXQgY2xpLmNoZWNrRGV2aWNlVHJ1c3QodXNlcklkLCBkZXZpY2VJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlLmdldEZpbmdlcnByaW50KCkgPT09IGZpbmdlcnByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihfdCgnU2Vzc2lvbiBhbHJlYWR5IHZlcmlmaWVkIScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoX3QoJ1dBUk5JTkc6IFNlc3Npb24gYWxyZWFkeSB2ZXJpZmllZCwgYnV0IGtleXMgZG8gTk9UIE1BVENIIScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpY2UuZ2V0RmluZ2VycHJpbnQoKSAhPT0gZmluZ2VycHJpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmcHJpbnQgPSBkZXZpY2UuZ2V0RmluZ2VycHJpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90KCdXQVJOSU5HOiBLRVkgVkVSSUZJQ0FUSU9OIEZBSUxFRCEgVGhlIHNpZ25pbmcga2V5IGZvciAlKHVzZXJJZClzIGFuZCBzZXNzaW9uJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICUoZGV2aWNlSWQpcyBpcyBcIiUoZnByaW50KXNcIiB3aGljaCBkb2VzIG5vdCBtYXRjaCB0aGUgcHJvdmlkZWQga2V5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1wiJShmaW5nZXJwcmludClzXCIuIFRoaXMgY291bGQgbWVhbiB5b3VyIGNvbW11bmljYXRpb25zIGFyZSBiZWluZyBpbnRlcmNlcHRlZCEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcHJpbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmdlcnByaW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5zZXREZXZpY2VWZXJpZmllZCh1c2VySWQsIGRldmljZUlkLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVsbCB0aGUgdXNlciB3ZSB2ZXJpZmllZCBldmVyeXRoaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBJbmZvRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5JbmZvRGlhbG9nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICdWZXJpZmllZCBrZXknLCBJbmZvRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdWZXJpZmllZCBrZXknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3QoJ1RoZSBzaWduaW5nIGtleSB5b3UgcHJvdmlkZWQgbWF0Y2hlcyB0aGUgc2lnbmluZyBrZXkgeW91IHJlY2VpdmVkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZnJvbSAlKHVzZXJJZClzXFwncyBzZXNzaW9uICUoZGV2aWNlSWQpcy4gU2Vzc2lvbiBtYXJrZWQgYXMgdmVyaWZpZWQuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlcklkLCBkZXZpY2VJZH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdCh0aGlzLmdldFVzYWdlKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnZGlzY2FyZHNlc3Npb24nLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKCdGb3JjZXMgdGhlIGN1cnJlbnQgb3V0Ym91bmQgZ3JvdXAgc2Vzc2lvbiBpbiBhbiBlbmNyeXB0ZWQgcm9vbSB0byBiZSBkaXNjYXJkZWQnKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZm9yY2VEaXNjYXJkU2Vzc2lvbihyb29tSWQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZHZhbmNlZCxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwicmFpbmJvd1wiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiU2VuZHMgdGhlIGdpdmVuIG1lc3NhZ2UgY29sb3VyZWQgYXMgYSByYWluYm93XCIpLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKCFhcmdzKSByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNlcklkKCkpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRIdG1sTWVzc2FnZShyb29tSWQsIGFyZ3MsIHRleHRUb0h0bWxSYWluYm93KGFyZ3MpKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwicmFpbmJvd21lXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJTZW5kcyB0aGUgZ2l2ZW4gZW1vdGUgY29sb3VyZWQgYXMgYSByYWluYm93XCIpLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgaWYgKCFhcmdzKSByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNlcklkKCkpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRIdG1sRW1vdGUocm9vbUlkLCBhcmdzLCB0ZXh0VG9IdG1sUmFpbmJvdyhhcmdzKSkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcImhlbHBcIixcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIkRpc3BsYXlzIGxpc3Qgb2YgY29tbWFuZHMgd2l0aCB1c2FnZXMgYW5kIGRlc2NyaXB0aW9uc1wiKSxcbiAgICAgICAgcnVuRm46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3QgU2xhc2hDb21tYW5kSGVscERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuU2xhc2hDb21tYW5kSGVscERpYWxvZycpO1xuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdTbGFzaCBDb21tYW5kcycsICdIZWxwJywgU2xhc2hDb21tYW5kSGVscERpYWxvZyk7XG4gICAgICAgICAgICByZXR1cm4gc3VjY2VzcygpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWR2YW5jZWQsXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcIndob2lzXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJEaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCBhIHVzZXJcIiksXG4gICAgICAgIGFyZ3M6IFwiPHVzZXItaWQ+XCIsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIHVzZXJJZCkge1xuICAgICAgICAgICAgaWYgKCF1c2VySWQgfHwgIXVzZXJJZC5zdGFydHNXaXRoKFwiQFwiKSB8fCAhdXNlcklkLmluY2x1ZGVzKFwiOlwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QodGhpcy5nZXRVc2FnZSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocm9vbUlkKS5nZXRNZW1iZXIodXNlcklkKTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3VXNlclBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3VXNlcixcbiAgICAgICAgICAgICAgICAvLyBYWFg6IFdlIHNob3VsZCBiZSB1c2luZyBhIHJlYWwgbWVtYmVyIG9iamVjdCBhbmQgbm90IGFzc3VtaW5nIHdoYXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gcmVjZWl2ZXIgd2FudHMuXG4gICAgICAgICAgICAgICAgbWVtYmVyOiBtZW1iZXIgfHwge3VzZXJJZH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hZHZhbmNlZCxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwicmFnZXNoYWtlXCIsXG4gICAgICAgIGFsaWFzZXM6IFtcImJ1Z3JlcG9ydFwiXSxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZChcIlNlbmQgYSBidWcgcmVwb3J0IHdpdGggbG9nc1wiKSxcbiAgICAgICAgaXNFbmFibGVkOiAoKSA9PiAhIVNka0NvbmZpZy5nZXQoKS5idWdfcmVwb3J0X2VuZHBvaW50X3VybCxcbiAgICAgICAgYXJnczogXCI8ZGVzY3JpcHRpb24+XCIsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKFxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1NsYXNoIENvbW1hbmRzJywgJ0J1ZyBSZXBvcnQgRGlhbG9nJywgQnVnUmVwb3J0RGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxUZXh0OiBhcmdzLFxuICAgICAgICAgICAgICAgIH0pLmZpbmlzaGVkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLmFkdmFuY2VkLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJxdWVyeVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiT3BlbnMgY2hhdCB3aXRoIHRoZSBnaXZlbiB1c2VyXCIpLFxuICAgICAgICBhcmdzOiBcIjx1c2VyLWlkPlwiLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCB1c2VySWQpIHtcbiAgICAgICAgICAgIC8vIGVhc3Rlci1lZ2cgZm9yIG5vdzogbG9vayB1cCBwaG9uZSBudW1iZXJzIHRocm91Z2ggdGhlIHRoaXJkcGFydHkgQVBJXG4gICAgICAgICAgICAvLyAodmVyeSBkdW1iIHBob25lIG51bWJlciBkZXRlY3Rpb24uLi4pXG4gICAgICAgICAgICBjb25zdCBpc1Bob25lTnVtYmVyID0gdXNlcklkICYmIC9eXFwrP1swMTIzNDU2Nzg5XSskLy50ZXN0KHVzZXJJZCk7XG4gICAgICAgICAgICBpZiAoIXVzZXJJZCB8fCAoIXVzZXJJZC5zdGFydHNXaXRoKFwiQFwiKSB8fCAhdXNlcklkLmluY2x1ZGVzKFwiOlwiKSkgJiYgIWlzUGhvbmVOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzUGhvbmVOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUaGlyZHBhcnR5VXNlcignaW0udmVjdG9yLnByb3RvY29sLnBzdG4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbS5pZC5waG9uZSc6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCA9PT0gMCB8fCAhcmVzdWx0c1swXS51c2VyaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBmaW5kIE1hdHJpeCBJRCBmb3IgcGhvbmUgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZCA9IHJlc3VsdHNbMF0udXNlcmlkO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGF3YWl0IGVuc3VyZURNRXhpc3RzKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgdXNlcklkKTtcblxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICB9LFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMuYWN0aW9ucyxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwibXNnXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIGdpdmVuIHVzZXJcIiksXG4gICAgICAgIGFyZ3M6IFwiPHVzZXItaWQ+IDxtZXNzYWdlPlwiLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24oXywgYXJncykge1xuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAvLyBtYXRjaGVzIHRoZSBmaXJzdCB3aGl0ZXNwYWNlIGRlbGltaXRlZCBncm91cCBhbmQgdGhlbiB0aGUgcmVzdCBvZiB0aGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGFyZ3MubWF0Y2goL14oXFxTKz8pKD86ICsoLiopKT8kL3MpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFt1c2VySWQsIG1zZ10gPSBtYXRjaGVzLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobXNnICYmIHVzZXJJZCAmJiB1c2VySWQuc3RhcnRzV2l0aChcIkBcIikgJiYgdXNlcklkLmluY2x1ZGVzKFwiOlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gYXdhaXQgZW5zdXJlRE1FeGlzdHMoY2xpLCB1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGkuc2VuZFRleHRNZXNzYWdlKHJvb21JZCwgbXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHRoaXMuZ2V0VXNhZ2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5hY3Rpb25zLFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJob2xkY2FsbFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiUGxhY2VzIHRoZSBjYWxsIGluIHRoZSBjdXJyZW50IHJvb20gb24gaG9sZFwiKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm90aGVyLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRDYWxsRm9yUm9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcIk5vIGFjdGl2ZSBjYWxsIGluIHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoKTtcbiAgICAgICAgfSxcbiAgICB9KSxcbiAgICBuZXcgQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6IFwidW5ob2xkY2FsbFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogX3RkKFwiVGFrZXMgdGhlIGNhbGwgaW4gdGhlIGN1cnJlbnQgcm9vbSBvZmYgaG9sZFwiKSxcbiAgICAgICAgY2F0ZWdvcnk6IENvbW1hbmRDYXRlZ29yaWVzLm90aGVyLFxuICAgICAgICBydW5GbjogZnVuY3Rpb24ocm9vbUlkLCBhcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRDYWxsRm9yUm9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcIk5vIGFjdGl2ZSBjYWxsIGluIHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKCk7XG4gICAgICAgIH0sXG4gICAgfSksXG4gICAgbmV3IENvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcImNvbnZlcnR0b2RtXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJDb252ZXJ0cyB0aGUgcm9vbSB0byBhIERNXCIpLFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMub3RoZXIsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoZ3Vlc3NBbmRTZXRETVJvb20ocm9vbSwgdHJ1ZSkpO1xuICAgICAgICB9LFxuICAgIH0pLFxuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJjb252ZXJ0dG9yb29tXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdGQoXCJDb252ZXJ0cyB0aGUgRE0gdG8gYSByb29tXCIpLFxuICAgICAgICBjYXRlZ29yeTogQ29tbWFuZENhdGVnb3JpZXMub3RoZXIsXG4gICAgICAgIHJ1bkZuOiBmdW5jdGlvbihyb29tSWQsIGFyZ3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3MoZ3Vlc3NBbmRTZXRETVJvb20ocm9vbSwgZmFsc2UpKTtcbiAgICAgICAgfSxcbiAgICB9KSxcblxuICAgIC8vIENvbW1hbmQgZGVmaW5pdGlvbnMgZm9yIGF1dG9jb21wbGV0aW9uIE9OTFk6XG4gICAgLy8gL21lIGlzIHNwZWNpYWwgYmVjYXVzZSBpdHMgbm90IGhhbmRsZWQgYnkgU2xhc2hDb21tYW5kcy5qcyBhbmQgaXMgaW5zdGVhZCBkb25lIGluc2lkZSB0aGUgQ29tcG9zZXIgY2xhc3Nlc1xuICAgIG5ldyBDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogXCJtZVwiLFxuICAgICAgICBhcmdzOiAnPG1lc3NhZ2U+JyxcbiAgICAgICAgZGVzY3JpcHRpb246IF90ZCgnRGlzcGxheXMgYWN0aW9uJyksXG4gICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcyxcbiAgICAgICAgaGlkZUNvbXBsZXRpb25BZnRlclNwYWNlOiB0cnVlLFxuICAgIH0pLFxuXG4gICAgLi4uQ0hBVF9FRkZFQ1RTLm1hcCgoZWZmZWN0KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tbWFuZCh7XG4gICAgICAgICAgICBjb21tYW5kOiBlZmZlY3QuY29tbWFuZCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlZmZlY3QuZGVzY3JpcHRpb24oKSxcbiAgICAgICAgICAgIGFyZ3M6ICc8bWVzc2FnZT4nLFxuICAgICAgICAgICAgcnVuRm46IGZ1bmN0aW9uKHJvb21JZCwgYXJncykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzKChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncyA9IGVmZmVjdC5mYWxsYmFja01lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kRW1vdGVNZXNzYWdlKHJvb21JZCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZ3R5cGU6IGVmZmVjdC5tc2dUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IGFyZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRNZXNzYWdlKHJvb21JZCwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IGBlZmZlY3RzLiR7ZWZmZWN0LmNvbW1hbmR9YH0pO1xuICAgICAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcmllcy5lZmZlY3RzLFxuICAgICAgICB9KVxuICAgIH0pLFxuXTtcblxuLy8gYnVpbGQgYSBtYXAgZnJvbSBuYW1lcyBhbmQgYWxpYXNlcyB0byB0aGUgQ29tbWFuZCBvYmplY3RzLlxuZXhwb3J0IGNvbnN0IENvbW1hbmRNYXAgPSBuZXcgTWFwKCk7XG5Db21tYW5kcy5mb3JFYWNoKGNtZCA9PiB7XG4gICAgQ29tbWFuZE1hcC5zZXQoY21kLmNvbW1hbmQsIGNtZCk7XG4gICAgY21kLmFsaWFzZXMuZm9yRWFjaChhbGlhcyA9PiB7XG4gICAgICAgIENvbW1hbmRNYXAuc2V0KGFsaWFzLCBjbWQpO1xuICAgIH0pO1xufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1hbmRTdHJpbmcoaW5wdXQ6IHN0cmluZykge1xuICAgIC8vIHRyaW0gYW55IHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFzIGl0IGNhbiBjb25mdXNlIHRoZSBwYXJzZXIgZm9yXG4gICAgLy8gSVJDLXN0eWxlIGNvbW1hbmRzXG4gICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9cXHMrJC8sICcnKTtcbiAgICBpZiAoaW5wdXRbMF0gIT09ICcvJykgcmV0dXJuIHt9OyAvLyBub3QgYSBjb21tYW5kXG5cbiAgICBjb25zdCBiaXRzID0gaW5wdXQubWF0Y2goL14oXFxTKz8pKD86ICsoKC58XFxuKSopKT8kLyk7XG4gICAgbGV0IGNtZDtcbiAgICBsZXQgYXJncztcbiAgICBpZiAoYml0cykge1xuICAgICAgICBjbWQgPSBiaXRzWzFdLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBhcmdzID0gYml0c1syXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjbWQgPSBpbnB1dDtcbiAgICB9XG5cbiAgICByZXR1cm4ge2NtZCwgYXJnc307XG59XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgZ2l2ZW4gdGV4dCBmb3IgL2NvbW1hbmRzIGFuZCByZXR1cm4gYSBib3VuZCBtZXRob2QgdG8gcGVyZm9ybSB0aGVtLlxuICogQHBhcmFtIHtzdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBpbiB3aGljaCB0aGUgY29tbWFuZCB3YXMgcGVyZm9ybWVkLlxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IFRoZSByYXcgdGV4dCBpbnB1dCBieSB0aGUgdXNlci5cbiAqIEByZXR1cm4ge251bGx8ZnVuY3Rpb24oKTogT2JqZWN0fSBGdW5jdGlvbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnR5ICdlcnJvcicgaWYgdGhlcmUgd2FzIGFuIGVycm9yXG4gKiBwcm9jZXNzaW5nIHRoZSBjb21tYW5kLCBvciAncHJvbWlzZScgaWYgYSByZXF1ZXN0IHdhcyBzZW50IG91dC5cbiAqIFJldHVybnMgbnVsbCBpZiB0aGUgaW5wdXQgZGlkbid0IG1hdGNoIGEgY29tbWFuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbW1hbmQocm9vbUlkOiBzdHJpbmcsIGlucHV0OiBzdHJpbmcpIHtcbiAgICBjb25zdCB7Y21kLCBhcmdzfSA9IHBhcnNlQ29tbWFuZFN0cmluZyhpbnB1dCk7XG5cbiAgICBpZiAoQ29tbWFuZE1hcC5oYXMoY21kKSAmJiBDb21tYW5kTWFwLmdldChjbWQpLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBDb21tYW5kTWFwLmdldChjbWQpLnJ1bihyb29tSWQsIGFyZ3MsIGNtZCk7XG4gICAgfVxufVxuIl19