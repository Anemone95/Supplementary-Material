"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../index"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _HtmlUtils = require("../../HtmlUtils");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _DirectoryUtils = require("../../utils/DirectoryUtils");

var _Analytics = _interopRequireDefault(require("../../Analytics"));

var _contentRepo = require("matrix-js-sdk/src/content-repo");

var _NetworkDropdown = require("../views/directory/NetworkDropdown");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _GroupFilterOrderStore = _interopRequireDefault(require("../../stores/GroupFilterOrderStore"));

var _GroupStore = _interopRequireDefault(require("../../stores/GroupStore"));

var _FlairStore = _interopRequireDefault(require("../../stores/FlairStore"));

var _CountlyAnalytics = _interopRequireDefault(require("../../CountlyAnalytics"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
const MAX_NAME_LENGTH = 80;
const MAX_TOPIC_LENGTH = 800;

function track(action) {
  _Analytics.default.trackEvent('RoomDirectory', action);
}

class RoomDirectory extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "refreshRoomList", () => {
      if (this.state.selectedCommunityId) {
        this.setState({
          publicRooms: _GroupStore.default.getGroupRooms(this.state.selectedCommunityId).map(r => {
            return {
              // Translate all the group properties to the directory format
              room_id: r.roomId,
              name: r.name,
              topic: r.topic,
              canonical_alias: r.canonicalAlias,
              num_joined_members: r.numJoinedMembers,
              avatarUrl: r.avatarUrl,
              world_readable: r.worldReadable,
              guest_can_join: r.guestsCanJoin
            };
          }).filter(r => {
            const filterString = this.state.filterString;

            if (filterString) {
              const containedIn = (s
              /*: string*/
              ) => (s || "").toLowerCase().includes(filterString.toLowerCase());

              return containedIn(r.name) || containedIn(r.topic) || containedIn(r.canonical_alias);
            }

            return true;
          }),
          loading: false
        });
        return;
      }

      this.nextBatch = null;
      this.setState({
        publicRooms: [],
        loading: true
      });
      this.getMoreRooms();
    });
    (0, _defineProperty2.default)(this, "onRoomClicked", (room, ev) => {
      if (ev.shiftKey && !this.state.selectedCommunityId) {
        ev.preventDefault();
        this.removeFromDirectory(room);
      } else {
        this.showRoom(room);
      }
    });
    (0, _defineProperty2.default)(this, "onOptionChange", (server, instanceId) => {
      // clear next batch so we don't try to load more rooms
      this.nextBatch = null;
      this.setState({
        // Clear the public rooms out here otherwise we needlessly
        // spend time filtering lots of rooms when we're about to
        // to clear the list anyway.
        publicRooms: [],
        roomServer: server,
        instanceId: instanceId,
        error: null
      }, this.refreshRoomList); // We also refresh the room list each time even though this
      // filtering is client-side. It hopefully won't be client side
      // for very long, and we may have fetched a thousand rooms to
      // find the five gitter ones, at which point we do not want
      // to render all those rooms when switching back to 'all networks'.
      // Easiest to just blow away the state & re-fetch.
    });
    (0, _defineProperty2.default)(this, "onFillRequest", backwards => {
      if (backwards || !this.nextBatch) return Promise.resolve(false);
      return this.getMoreRooms();
    });
    (0, _defineProperty2.default)(this, "onFilterChange", alias => {
      this.setState({
        filterString: alias || null
      }); // don't send the request for a little bit,
      // no point hammering the server with a
      // request for every keystroke, let the
      // user finish typing.

      if (this.filterTimeout) {
        clearTimeout(this.filterTimeout);
      }

      this.filterTimeout = setTimeout(() => {
        this.filterTimeout = null;
        this.refreshRoomList();
      }, 700);
    });
    (0, _defineProperty2.default)(this, "onFilterClear", () => {
      // update immediately
      this.setState({
        filterString: null
      }, this.refreshRoomList);

      if (this.filterTimeout) {
        clearTimeout(this.filterTimeout);
      }
    });
    (0, _defineProperty2.default)(this, "onJoinFromSearchClick", alias => {
      // If we don't have a particular instance id selected, just show that rooms alias
      if (!this.state.instanceId || this.state.instanceId === _NetworkDropdown.ALL_ROOMS) {
        // If the user specified an alias without a domain, add on whichever server is selected
        // in the dropdown
        if (alias.indexOf(':') == -1) {
          alias = alias + ':' + this.state.roomServer;
        }

        this.showRoomAlias(alias, true);
      } else {
        // This is a 3rd party protocol. Let's see if we can join it
        const protocolName = (0, _DirectoryUtils.protocolNameForInstanceId)(this.protocols, this.state.instanceId);
        const instance = (0, _DirectoryUtils.instanceForInstanceId)(this.protocols, this.state.instanceId);
        const fields = protocolName ? this._getFieldsForThirdPartyLocation(alias, this.protocols[protocolName], instance) : null;

        if (!fields) {
          const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

          const brand = _SdkConfig.default.get().brand;

          _Modal.default.createTrackedDialog('Unable to join network', '', ErrorDialog, {
            title: (0, _languageHandler._t)('Unable to join network'),
            description: (0, _languageHandler._t)('%(brand)s does not know how to join a room on this network', {
              brand
            })
          });

          return;
        }

        _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyLocation(protocolName, fields).then(resp => {
          if (resp.length > 0 && resp[0].alias) {
            this.showRoomAlias(resp[0].alias, true);
          } else {
            const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

            _Modal.default.createTrackedDialog('Room not found', '', ErrorDialog, {
              title: (0, _languageHandler._t)('Room not found'),
              description: (0, _languageHandler._t)('Couldn\'t find a matching Matrix room')
            });
          }
        }, e => {
          const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

          _Modal.default.createTrackedDialog('Fetching third party location failed', '', ErrorDialog, {
            title: (0, _languageHandler._t)('Fetching third party location failed'),
            description: (0, _languageHandler._t)('Unable to look up room ID from server')
          });
        });
      }
    });
    (0, _defineProperty2.default)(this, "onPreviewClick", (ev, room) => {
      this.showRoom(room, null, false, true);
      ev.stopPropagation();
    });
    (0, _defineProperty2.default)(this, "onViewClick", (ev, room) => {
      this.showRoom(room);
      ev.stopPropagation();
    });
    (0, _defineProperty2.default)(this, "onJoinClick", (ev, room) => {
      this.showRoom(room, null, true);
      ev.stopPropagation();
    });
    (0, _defineProperty2.default)(this, "onCreateRoomClick", room => {
      this.onFinished();

      _dispatcher.default.dispatch({
        action: 'view_create_room',
        public: true
      });
    });
    (0, _defineProperty2.default)(this, "collectScrollPanel", element => {
      this.scrollPanel = element;
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      if (this.scrollPanel) {
        this.scrollPanel.handleScrollKey(ev);
      }
    });
    (0, _defineProperty2.default)(this, "onFinished", () => {
      _CountlyAnalytics.default.instance.trackRoomDirectory(this.startTime);

      this.props.onFinished();
    });

    _CountlyAnalytics.default.instance.trackRoomDirectoryBegin();

    this.startTime = _CountlyAnalytics.default.getTimestamp();

    const selectedCommunityId = _GroupFilterOrderStore.default.getSelectedTags()[0];

    this.state = {
      publicRooms: [],
      loading: true,
      protocolsLoading: true,
      error: null,
      instanceId: undefined,
      roomServer: _MatrixClientPeg.MatrixClientPeg.getHomeserverName(),
      filterString: this.props.initialText || "",
      selectedCommunityId: _SettingsStore.default.getValue("feature_communities_v2_prototypes") ? selectedCommunityId : null,
      communityName: null
    };
    this._unmounted = false;
    this.nextBatch = null;
    this.filterTimeout = null;
    this.scrollPanel = null;
    this.protocols = null;
    this.state.protocolsLoading = true;

    if (!_MatrixClientPeg.MatrixClientPeg.get()) {
      // We may not have a client yet when invoked from welcome page
      this.state.protocolsLoading = false;
      return;
    }

    if (!this.state.selectedCommunityId) {
      _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyProtocols().then(response => {
        this.protocols = response;
        this.setState({
          protocolsLoading: false
        });
      }, err => {
        console.warn(`error loading third party protocols: ${err}`);
        this.setState({
          protocolsLoading: false
        });

        if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
          // Guests currently aren't allowed to use this API, so
          // ignore this as otherwise this error is literally the
          // thing you see when loading the client!
          return;
        }

        track('Failed to get protocol list from homeserver');

        const brand = _SdkConfig.default.get().brand;

        this.setState({
          error: (0, _languageHandler._t)('%(brand)s failed to get the protocol list from the homeserver. ' + 'The homeserver may be too old to support third party networks.', {
            brand
          })
        });
      });
    } else {
      // We don't use the protocols in the communities v2 prototype experience
      this.state.protocolsLoading = false; // Grab the profile info async

      _FlairStore.default.getGroupProfileCached(_MatrixClientPeg.MatrixClientPeg.get(), this.state.selectedCommunityId).then(profile => {
        this.setState({
          communityName: profile.name
        });
      });
    }
  }

  componentDidMount() {
    this.refreshRoomList();
  }

  componentWillUnmount() {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this._unmounted = true;
  }

  getMoreRooms() {
    if (this.state.selectedCommunityId) return Promise.resolve(); // no more rooms

    if (!_MatrixClientPeg.MatrixClientPeg.get()) return Promise.resolve();
    this.setState({
      loading: true
    });
    const my_filter_string = this.state.filterString;
    const my_server = this.state.roomServer; // remember the next batch token when we sent the request
    // too. If it's changed, appending to the list will corrupt it.

    const my_next_batch = this.nextBatch;
    const opts = {
      limit: 20
    };

    if (my_server != _MatrixClientPeg.MatrixClientPeg.getHomeserverName()) {
      opts.server = my_server;
    }

    if (this.state.instanceId === _NetworkDropdown.ALL_ROOMS) {
      opts.include_all_networks = true;
    } else if (this.state.instanceId) {
      opts.third_party_instance_id = this.state.instanceId;
    }

    if (this.nextBatch) opts.since = this.nextBatch;
    if (my_filter_string) opts.filter = {
      generic_search_term: my_filter_string
    };
    return _MatrixClientPeg.MatrixClientPeg.get().publicRooms(opts).then(data => {
      if (my_filter_string != this.state.filterString || my_server != this.state.roomServer || my_next_batch != this.nextBatch) {
        // if the filter or server has changed since this request was sent,
        // throw away the result (don't even clear the busy flag
        // since we must still have a request in flight)
        return;
      }

      if (this._unmounted) {
        // if we've been unmounted, we don't care either.
        return;
      }

      if (this.state.filterString) {
        const count = data.total_room_count_estimate || data.chunk.length;

        _CountlyAnalytics.default.instance.trackRoomDirectorySearch(count, this.state.filterString);
      }

      this.nextBatch = data.next_batch;
      this.setState(s => {
        s.publicRooms.push(...(data.chunk || []));
        s.loading = false;
        return s;
      });
      return Boolean(data.next_batch);
    }, err => {
      if (my_filter_string != this.state.filterString || my_server != this.state.roomServer || my_next_batch != this.nextBatch) {
        // as above: we don't care about errors for old
        // requests either
        return;
      }

      if (this._unmounted) {
        // if we've been unmounted, we don't care either.
        return;
      }

      console.error("Failed to get publicRooms: %s", JSON.stringify(err));
      track('Failed to get public room list');

      const brand = _SdkConfig.default.get().brand;

      this.setState({
        loading: false,
        error: (0, _languageHandler._t)('%(brand)s failed to get the public room list.', {
          brand
        }) + (err && err.message) ? err.message : (0, _languageHandler._t)('The homeserver may be unavailable or overloaded.')
      });
    });
  }
  /**
   * A limited interface for removing rooms from the directory.
   * Will set the room to not be publicly visible and delete the
   * default alias. In the long term, it would be better to allow
   * HS admins to do this through the RoomSettings interface, but
   * this needs SPEC-417.
   */


  removeFromDirectory(room) {
    const alias = get_display_alias_for_room(room);
    const name = room.name || alias || (0, _languageHandler._t)('Unnamed room');
    const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");
    const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
    let desc;

    if (alias) {
      desc = (0, _languageHandler._t)('Delete the room address %(alias)s and remove %(name)s from the directory?', {
        alias,
        name
      });
    } else {
      desc = (0, _languageHandler._t)('Remove %(name)s from the directory?', {
        name: name
      });
    }

    _Modal.default.createTrackedDialog('Remove from Directory', '', QuestionDialog, {
      title: (0, _languageHandler._t)('Remove from Directory'),
      description: desc,
      onFinished: should_delete => {
        if (!should_delete) return;
        const Loader = sdk.getComponent("elements.Spinner");

        const modal = _Modal.default.createDialog(Loader);

        let step = (0, _languageHandler._t)('remove %(name)s from the directory.', {
          name: name
        });

        _MatrixClientPeg.MatrixClientPeg.get().setRoomDirectoryVisibility(room.room_id, 'private').then(() => {
          if (!alias) return;
          step = (0, _languageHandler._t)('delete the address.');
          return _MatrixClientPeg.MatrixClientPeg.get().deleteAlias(alias);
        }).then(() => {
          modal.close();
          this.refreshRoomList();
        }, err => {
          modal.close();
          this.refreshRoomList();
          console.error("Failed to " + step + ": " + err);

          _Modal.default.createTrackedDialog('Remove from Directory Error', '', ErrorDialog, {
            title: (0, _languageHandler._t)('Error'),
            description: err && err.message ? err.message : (0, _languageHandler._t)('The server may be unavailable or overloaded')
          });
        });
      }
    });
  }

  showRoomAlias(alias, autoJoin = false) {
    this.showRoom(null, alias, autoJoin);
  }

  showRoom(room, room_alias, autoJoin = false, shouldPeek = false) {
    this.onFinished();
    const payload = {
      action: 'view_room',
      auto_join: autoJoin,
      should_peek: shouldPeek,
      _type: "room_directory" // instrumentation

    };

    if (room) {
      // Don't let the user view a room they won't be able to either
      // peek or join: fail earlier so they don't have to click back
      // to the directory.
      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        if (!room.world_readable && !room.guest_can_join) {
          _dispatcher.default.dispatch({
            action: 'require_registration'
          });

          return;
        }
      }

      if (!room_alias) {
        room_alias = get_display_alias_for_room(room);
      }

      payload.oob_data = {
        avatarUrl: room.avatar_url,
        // XXX: This logic is duplicated from the JS SDK which
        // would normally decide what the name is.
        name: room.name || room_alias || (0, _languageHandler._t)('Unnamed room')
      };

      if (this.state.roomServer) {
        payload.via_servers = [this.state.roomServer];
        payload.opts = {
          viaServers: [this.state.roomServer]
        };
      }
    } // It's not really possible to join Matrix rooms by ID because the HS has no way to know
    // which servers to start querying. However, there's no other way to join rooms in
    // this list without aliases at present, so if roomAlias isn't set here we have no
    // choice but to supply the ID.


    if (room_alias) {
      payload.room_alias = room_alias;
    } else {
      payload.room_id = room.room_id;
    }

    _dispatcher.default.dispatch(payload);
  }

  createRoomCells(room) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const clientRoom = client.getRoom(room.room_id);
    const hasJoinedRoom = clientRoom && clientRoom.getMyMembership() === "join";
    const isGuest = client.isGuest();
    const BaseAvatar = sdk.getComponent('avatars.BaseAvatar');
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let previewButton;
    let joinOrViewButton; // Element Web currently does not allow guests to join rooms, so we
    // instead show them preview buttons for all rooms. If the room is not
    // world readable, a modal will appear asking you to register first. If
    // it is readable, the preview appears as normal.

    if (!hasJoinedRoom && (room.world_readable || isGuest)) {
      previewButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "secondary",
        onClick: ev => this.onPreviewClick(ev, room)
      }, (0, _languageHandler._t)("Preview"));
    }

    if (hasJoinedRoom) {
      joinOrViewButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "secondary",
        onClick: ev => this.onViewClick(ev, room)
      }, (0, _languageHandler._t)("View"));
    } else if (!isGuest) {
      joinOrViewButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "primary",
        onClick: ev => this.onJoinClick(ev, room)
      }, (0, _languageHandler._t)("Join"));
    }

    let name = room.name || get_display_alias_for_room(room) || (0, _languageHandler._t)('Unnamed room');

    if (name.length > MAX_NAME_LENGTH) {
      name = `${name.substring(0, MAX_NAME_LENGTH)}...`;
    }

    let topic = room.topic || ''; // Additional truncation based on line numbers is done via CSS,
    // but to ensure that the DOM is not polluted with a huge string
    // we give it a hard limit before rendering.

    if (topic.length > MAX_TOPIC_LENGTH) {
      topic = `${topic.substring(0, MAX_TOPIC_LENGTH)}...`;
    }

    topic = (0, _HtmlUtils.linkifyAndSanitizeHtml)(topic);
    const avatarUrl = (0, _contentRepo.getHttpUriForMxc)(_MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl(), room.avatar_url, 32, 32, "crop");
    return [/*#__PURE__*/_react.default.createElement("div", {
      key: `${room.room_id}_avatar`,
      onClick: ev => this.onRoomClicked(room, ev) // cancel onMouseDown otherwise shift-clicking highlights text
      ,
      onMouseDown: ev => {
        ev.preventDefault();
      },
      className: "mx_RoomDirectory_roomAvatar"
    }, /*#__PURE__*/_react.default.createElement(BaseAvatar, {
      width: 32,
      height: 32,
      resizeMethod: "crop",
      name: name,
      idName: name,
      url: avatarUrl
    })), /*#__PURE__*/_react.default.createElement("div", {
      key: `${room.room_id}_description`,
      onClick: ev => this.onRoomClicked(room, ev) // cancel onMouseDown otherwise shift-clicking highlights text
      ,
      onMouseDown: ev => {
        ev.preventDefault();
      },
      className: "mx_RoomDirectory_roomDescription"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomDirectory_name"
    }, name), "\xA0", /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomDirectory_topic",
      onClick: ev => {
        ev.stopPropagation();
      },
      dangerouslySetInnerHTML: {
        __html: topic
      }
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomDirectory_alias"
    }, get_display_alias_for_room(room))), /*#__PURE__*/_react.default.createElement("div", {
      key: `${room.room_id}_memberCount`,
      onClick: ev => this.onRoomClicked(room, ev) // cancel onMouseDown otherwise shift-clicking highlights text
      ,
      onMouseDown: ev => {
        ev.preventDefault();
      },
      className: "mx_RoomDirectory_roomMemberCount"
    }, room.num_joined_members), /*#__PURE__*/_react.default.createElement("div", {
      key: `${room.room_id}_preview`,
      onClick: ev => this.onRoomClicked(room, ev) // cancel onMouseDown otherwise shift-clicking highlights text
      ,
      onMouseDown: ev => {
        ev.preventDefault();
      },
      className: "mx_RoomDirectory_preview"
    }, previewButton), /*#__PURE__*/_react.default.createElement("div", {
      key: `${room.room_id}_join`,
      onClick: ev => this.onRoomClicked(room, ev) // cancel onMouseDown otherwise shift-clicking highlights text
      ,
      onMouseDown: ev => {
        ev.preventDefault();
      },
      className: "mx_RoomDirectory_join"
    }, joinOrViewButton)];
  }

  _stringLooksLikeId(s, field_type) {
    let pat = /^#[^\s]+:[^\s]/;

    if (field_type && field_type.regexp) {
      pat = new RegExp(field_type.regexp);
    }

    return pat.test(s);
  }

  _getFieldsForThirdPartyLocation(userInput, protocol, instance) {
    // make an object with the fields specified by that protocol. We
    // require that the values of all but the last field come from the
    // instance. The last is the user input.
    const requiredFields = protocol.location_fields;
    if (!requiredFields) return null;
    const fields = {};

    for (let i = 0; i < requiredFields.length - 1; ++i) {
      const thisField = requiredFields[i];
      if (instance.fields[thisField] === undefined) return null;
      fields[thisField] = instance.fields[thisField];
    }

    fields[requiredFields[requiredFields.length - 1]] = userInput;
    return fields;
  }
  /**
   * called by the parent component when PageUp/Down/etc is pressed.
   *
   * We pass it down to the scroll panel.
   */


  render() {
    const Loader = sdk.getComponent("elements.Spinner");
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let content;

    if (this.state.error) {
      content = this.state.error;
    } else if (this.state.protocolsLoading) {
      content = /*#__PURE__*/_react.default.createElement(Loader, null);
    } else {
      const cells = (this.state.publicRooms || []).reduce((cells, room) => cells.concat(this.createRoomCells(room)), []); // we still show the scrollpanel, at least for now, because
      // otherwise we don't fetch more because we don't get a fill
      // request from the scrollpanel because there isn't one

      let spinner;

      if (this.state.loading) {
        spinner = /*#__PURE__*/_react.default.createElement(Loader, null);
      }

      let scrollpanel_content;

      if (cells.length === 0 && !this.state.loading) {
        scrollpanel_content = /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)('No rooms to show'));
      } else {
        scrollpanel_content = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomDirectory_table"
        }, cells);
      }

      const ScrollPanel = sdk.getComponent("structures.ScrollPanel");
      content = /*#__PURE__*/_react.default.createElement(ScrollPanel, {
        ref: this.collectScrollPanel,
        className: "mx_RoomDirectory_tableWrapper",
        onFillRequest: this.onFillRequest,
        stickyBottom: false,
        startAtBottom: false
      }, scrollpanel_content, spinner);
    }

    let listHeader;

    if (!this.state.protocolsLoading) {
      const NetworkDropdown = sdk.getComponent('directory.NetworkDropdown');
      const DirectorySearchBox = sdk.getComponent('elements.DirectorySearchBox');
      const protocolName = (0, _DirectoryUtils.protocolNameForInstanceId)(this.protocols, this.state.instanceId);
      let instance_expected_field_type;

      if (protocolName && this.protocols && this.protocols[protocolName] && this.protocols[protocolName].location_fields.length > 0 && this.protocols[protocolName].field_types) {
        const last_field = this.protocols[protocolName].location_fields.slice(-1)[0];
        instance_expected_field_type = this.protocols[protocolName].field_types[last_field];
      }

      let placeholder = (0, _languageHandler._t)('Find a room…');

      if (!this.state.instanceId || this.state.instanceId === _NetworkDropdown.ALL_ROOMS) {
        placeholder = (0, _languageHandler._t)("Find a room… (e.g. %(exampleRoom)s)", {
          exampleRoom: "#example:" + this.state.roomServer
        });
      } else if (instance_expected_field_type) {
        placeholder = instance_expected_field_type.placeholder;
      }

      let showJoinButton = this._stringLooksLikeId(this.state.filterString, instance_expected_field_type);

      if (protocolName) {
        const instance = (0, _DirectoryUtils.instanceForInstanceId)(this.protocols, this.state.instanceId);

        if (this._getFieldsForThirdPartyLocation(this.state.filterString, this.protocols[protocolName], instance) === null) {
          showJoinButton = false;
        }
      }

      let dropdown = /*#__PURE__*/_react.default.createElement(NetworkDropdown, {
        protocols: this.protocols,
        onOptionChange: this.onOptionChange,
        selectedServerName: this.state.roomServer,
        selectedInstanceId: this.state.instanceId
      });

      if (this.state.selectedCommunityId) {
        dropdown = null;
      }

      listHeader = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomDirectory_listheader"
      }, /*#__PURE__*/_react.default.createElement(DirectorySearchBox, {
        className: "mx_RoomDirectory_searchbox",
        onChange: this.onFilterChange,
        onClear: this.onFilterClear,
        onJoinClick: this.onJoinFromSearchClick,
        placeholder: placeholder,
        showJoinButton: showJoinButton,
        initialText: this.props.initialText
      }), dropdown);
    }

    const explanation = (0, _languageHandler._t)("If you can't find the room you're looking for, ask for an invite or <a>Create a new room</a>.", null, {
      a: sub => {
        return /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          kind: "secondary",
          onClick: this.onCreateRoomClick
        }, sub);
      }
    });
    const title = this.state.selectedCommunityId ? (0, _languageHandler._t)("Explore rooms in %(communityName)s", {
      communityName: this.state.communityName || this.state.selectedCommunityId
    }) : (0, _languageHandler._t)("Explore rooms");
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: 'mx_RoomDirectory_dialog',
      hasCancel: true,
      onFinished: this.onFinished,
      title: title
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomDirectory"
    }, explanation, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomDirectory_list"
    }, listHeader, content)));
  }

} // Similar to matrix-react-sdk's MatrixTools.getDisplayAliasForRoom
// but works with the objects we get from the public room list


exports.default = RoomDirectory;
(0, _defineProperty2.default)(RoomDirectory, "propTypes", {
  initialText: _propTypes.default.string,
  onFinished: _propTypes.default.func.isRequired
});

function get_display_alias_for_room(room) {
  return room.canonical_alias || (room.aliases ? room.aliases[0] : "");
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUm9vbURpcmVjdG9yeS5qcyJdLCJuYW1lcyI6WyJNQVhfTkFNRV9MRU5HVEgiLCJNQVhfVE9QSUNfTEVOR1RIIiwidHJhY2siLCJhY3Rpb24iLCJBbmFseXRpY3MiLCJ0cmFja0V2ZW50IiwiUm9vbURpcmVjdG9yeSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwic2VsZWN0ZWRDb21tdW5pdHlJZCIsInNldFN0YXRlIiwicHVibGljUm9vbXMiLCJHcm91cFN0b3JlIiwiZ2V0R3JvdXBSb29tcyIsIm1hcCIsInIiLCJyb29tX2lkIiwicm9vbUlkIiwibmFtZSIsInRvcGljIiwiY2Fub25pY2FsX2FsaWFzIiwiY2Fub25pY2FsQWxpYXMiLCJudW1fam9pbmVkX21lbWJlcnMiLCJudW1Kb2luZWRNZW1iZXJzIiwiYXZhdGFyVXJsIiwid29ybGRfcmVhZGFibGUiLCJ3b3JsZFJlYWRhYmxlIiwiZ3Vlc3RfY2FuX2pvaW4iLCJndWVzdHNDYW5Kb2luIiwiZmlsdGVyIiwiZmlsdGVyU3RyaW5nIiwiY29udGFpbmVkSW4iLCJzIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsImxvYWRpbmciLCJuZXh0QmF0Y2giLCJnZXRNb3JlUm9vbXMiLCJyb29tIiwiZXYiLCJzaGlmdEtleSIsInByZXZlbnREZWZhdWx0IiwicmVtb3ZlRnJvbURpcmVjdG9yeSIsInNob3dSb29tIiwic2VydmVyIiwiaW5zdGFuY2VJZCIsInJvb21TZXJ2ZXIiLCJlcnJvciIsInJlZnJlc2hSb29tTGlzdCIsImJhY2t3YXJkcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiYWxpYXMiLCJmaWx0ZXJUaW1lb3V0IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsIkFMTF9ST09NUyIsImluZGV4T2YiLCJzaG93Um9vbUFsaWFzIiwicHJvdG9jb2xOYW1lIiwicHJvdG9jb2xzIiwiaW5zdGFuY2UiLCJmaWVsZHMiLCJfZ2V0RmllbGRzRm9yVGhpcmRQYXJ0eUxvY2F0aW9uIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJicmFuZCIsIlNka0NvbmZpZyIsImdldCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJNYXRyaXhDbGllbnRQZWciLCJnZXRUaGlyZHBhcnR5TG9jYXRpb24iLCJ0aGVuIiwicmVzcCIsImxlbmd0aCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJvbkZpbmlzaGVkIiwiZGlzIiwiZGlzcGF0Y2giLCJwdWJsaWMiLCJlbGVtZW50Iiwic2Nyb2xsUGFuZWwiLCJoYW5kbGVTY3JvbGxLZXkiLCJDb3VudGx5QW5hbHl0aWNzIiwidHJhY2tSb29tRGlyZWN0b3J5Iiwic3RhcnRUaW1lIiwidHJhY2tSb29tRGlyZWN0b3J5QmVnaW4iLCJnZXRUaW1lc3RhbXAiLCJHcm91cEZpbHRlck9yZGVyU3RvcmUiLCJnZXRTZWxlY3RlZFRhZ3MiLCJwcm90b2NvbHNMb2FkaW5nIiwidW5kZWZpbmVkIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJpbml0aWFsVGV4dCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImNvbW11bml0eU5hbWUiLCJfdW5tb3VudGVkIiwiZ2V0VGhpcmRwYXJ0eVByb3RvY29scyIsInJlc3BvbnNlIiwiZXJyIiwiY29uc29sZSIsIndhcm4iLCJpc0d1ZXN0IiwiRmxhaXJTdG9yZSIsImdldEdyb3VwUHJvZmlsZUNhY2hlZCIsInByb2ZpbGUiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwibXlfZmlsdGVyX3N0cmluZyIsIm15X3NlcnZlciIsIm15X25leHRfYmF0Y2giLCJvcHRzIiwibGltaXQiLCJpbmNsdWRlX2FsbF9uZXR3b3JrcyIsInRoaXJkX3BhcnR5X2luc3RhbmNlX2lkIiwic2luY2UiLCJnZW5lcmljX3NlYXJjaF90ZXJtIiwiZGF0YSIsImNvdW50IiwidG90YWxfcm9vbV9jb3VudF9lc3RpbWF0ZSIsImNodW5rIiwidHJhY2tSb29tRGlyZWN0b3J5U2VhcmNoIiwibmV4dF9iYXRjaCIsInB1c2giLCJCb29sZWFuIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1lc3NhZ2UiLCJnZXRfZGlzcGxheV9hbGlhc19mb3Jfcm9vbSIsIlF1ZXN0aW9uRGlhbG9nIiwiZGVzYyIsInNob3VsZF9kZWxldGUiLCJMb2FkZXIiLCJtb2RhbCIsImNyZWF0ZURpYWxvZyIsInN0ZXAiLCJzZXRSb29tRGlyZWN0b3J5VmlzaWJpbGl0eSIsImRlbGV0ZUFsaWFzIiwiY2xvc2UiLCJhdXRvSm9pbiIsInJvb21fYWxpYXMiLCJzaG91bGRQZWVrIiwicGF5bG9hZCIsImF1dG9fam9pbiIsInNob3VsZF9wZWVrIiwiX3R5cGUiLCJvb2JfZGF0YSIsImF2YXRhcl91cmwiLCJ2aWFfc2VydmVycyIsInZpYVNlcnZlcnMiLCJjcmVhdGVSb29tQ2VsbHMiLCJjbGllbnQiLCJjbGllbnRSb29tIiwiZ2V0Um9vbSIsImhhc0pvaW5lZFJvb20iLCJnZXRNeU1lbWJlcnNoaXAiLCJCYXNlQXZhdGFyIiwiQWNjZXNzaWJsZUJ1dHRvbiIsInByZXZpZXdCdXR0b24iLCJqb2luT3JWaWV3QnV0dG9uIiwib25QcmV2aWV3Q2xpY2siLCJvblZpZXdDbGljayIsIm9uSm9pbkNsaWNrIiwic3Vic3RyaW5nIiwiZ2V0SG9tZXNlcnZlclVybCIsIm9uUm9vbUNsaWNrZWQiLCJfX2h0bWwiLCJfc3RyaW5nTG9va3NMaWtlSWQiLCJmaWVsZF90eXBlIiwicGF0IiwicmVnZXhwIiwiUmVnRXhwIiwidGVzdCIsInVzZXJJbnB1dCIsInByb3RvY29sIiwicmVxdWlyZWRGaWVsZHMiLCJsb2NhdGlvbl9maWVsZHMiLCJpIiwidGhpc0ZpZWxkIiwicmVuZGVyIiwiQmFzZURpYWxvZyIsImNvbnRlbnQiLCJjZWxscyIsInJlZHVjZSIsImNvbmNhdCIsInNwaW5uZXIiLCJzY3JvbGxwYW5lbF9jb250ZW50IiwiU2Nyb2xsUGFuZWwiLCJjb2xsZWN0U2Nyb2xsUGFuZWwiLCJvbkZpbGxSZXF1ZXN0IiwibGlzdEhlYWRlciIsIk5ldHdvcmtEcm9wZG93biIsIkRpcmVjdG9yeVNlYXJjaEJveCIsImluc3RhbmNlX2V4cGVjdGVkX2ZpZWxkX3R5cGUiLCJmaWVsZF90eXBlcyIsImxhc3RfZmllbGQiLCJzbGljZSIsInBsYWNlaG9sZGVyIiwiZXhhbXBsZVJvb20iLCJzaG93Sm9pbkJ1dHRvbiIsImRyb3Bkb3duIiwib25PcHRpb25DaGFuZ2UiLCJvbkZpbHRlckNoYW5nZSIsIm9uRmlsdGVyQ2xlYXIiLCJvbkpvaW5Gcm9tU2VhcmNoQ2xpY2siLCJleHBsYW5hdGlvbiIsImEiLCJzdWIiLCJvbkNyZWF0ZVJvb21DbGljayIsIlByb3BUeXBlcyIsInN0cmluZyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiYWxpYXNlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXFCQSxNQUFNQSxlQUFlLEdBQUcsRUFBeEI7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxHQUF6Qjs7QUFFQSxTQUFTQyxLQUFULENBQWVDLE1BQWYsRUFBdUI7QUFDbkJDLHFCQUFVQyxVQUFWLENBQXFCLGVBQXJCLEVBQXNDRixNQUF0QztBQUNIOztBQUVjLE1BQU1HLGFBQU4sU0FBNEJDLGVBQU1DLFNBQWxDLENBQTRDO0FBTXZEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSwyREErRUQsTUFBTTtBQUNwQixVQUFJLEtBQUtDLEtBQUwsQ0FBV0MsbUJBQWYsRUFBb0M7QUFD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RUFBQztBQUFmLE9BQ0sySSxXQURMLGVBRUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tmLFVBREwsRUFFS1QsT0FGTCxDQUZKLENBTkosQ0FESjtBQWdCSDs7QUFwc0JzRCxDLENBdXNCM0Q7QUFDQTs7Ozs4QkF4c0JxQnhMLGEsZUFDRTtBQUNmK0YsRUFBQUEsV0FBVyxFQUFFcUgsbUJBQVVDLE1BRFI7QUFFZnZJLEVBQUFBLFVBQVUsRUFBRXNJLG1CQUFVRSxJQUFWLENBQWVDO0FBRlosQzs7QUF3c0J2QixTQUFTcEYsMEJBQVQsQ0FBb0NoRyxJQUFwQyxFQUEwQztBQUN0QyxTQUFPQSxJQUFJLENBQUNsQixlQUFMLEtBQXlCa0IsSUFBSSxDQUFDcUwsT0FBTCxHQUFlckwsSUFBSSxDQUFDcUwsT0FBTCxDQUFhLENBQWIsQ0FBZixHQUFpQyxFQUExRCxDQUFQO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vaW5kZXhcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IHsgbGlua2lmeUFuZFNhbml0aXplSHRtbCB9IGZyb20gJy4uLy4uL0h0bWxVdGlscyc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IHsgaW5zdGFuY2VGb3JJbnN0YW5jZUlkLCBwcm90b2NvbE5hbWVGb3JJbnN0YW5jZUlkIH0gZnJvbSAnLi4vLi4vdXRpbHMvRGlyZWN0b3J5VXRpbHMnO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuLi8uLi9BbmFseXRpY3MnO1xuaW1wb3J0IHtnZXRIdHRwVXJpRm9yTXhjfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY29udGVudC1yZXBvXCI7XG5pbXBvcnQge0FMTF9ST09NU30gZnJvbSBcIi4uL3ZpZXdzL2RpcmVjdG9yeS9OZXR3b3JrRHJvcGRvd25cIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgR3JvdXBGaWx0ZXJPcmRlclN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvR3JvdXBGaWx0ZXJPcmRlclN0b3JlXCI7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL0dyb3VwU3RvcmVcIjtcbmltcG9ydCBGbGFpclN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvRmxhaXJTdG9yZVwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4uLy4uL0NvdW50bHlBbmFseXRpY3NcIjtcblxuY29uc3QgTUFYX05BTUVfTEVOR1RIID0gODA7XG5jb25zdCBNQVhfVE9QSUNfTEVOR1RIID0gODAwO1xuXG5mdW5jdGlvbiB0cmFjayhhY3Rpb24pIHtcbiAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnUm9vbURpcmVjdG9yeScsIGFjdGlvbik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21EaXJlY3RvcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGluaXRpYWxUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFja1Jvb21EaXJlY3RvcnlCZWdpbigpO1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDb21tdW5pdHlJZCA9IEdyb3VwRmlsdGVyT3JkZXJTdG9yZS5nZXRTZWxlY3RlZFRhZ3MoKVswXTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHB1YmxpY1Jvb21zOiBbXSxcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBwcm90b2NvbHNMb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBpbnN0YW5jZUlkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICByb29tU2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKSxcbiAgICAgICAgICAgIGZpbHRlclN0cmluZzogdGhpcy5wcm9wcy5pbml0aWFsVGV4dCB8fCBcIlwiLFxuICAgICAgICAgICAgc2VsZWN0ZWRDb21tdW5pdHlJZDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfY29tbXVuaXRpZXNfdjJfcHJvdG90eXBlc1wiKVxuICAgICAgICAgICAgICAgID8gc2VsZWN0ZWRDb21tdW5pdHlJZFxuICAgICAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgIGNvbW11bml0eU5hbWU6IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmV4dEJhdGNoID0gbnVsbDtcbiAgICAgICAgdGhpcy5maWx0ZXJUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zY3JvbGxQYW5lbCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvdG9jb2xzID0gbnVsbDtcblxuICAgICAgICB0aGlzLnN0YXRlLnByb3RvY29sc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKSkge1xuICAgICAgICAgICAgLy8gV2UgbWF5IG5vdCBoYXZlIGEgY2xpZW50IHlldCB3aGVuIGludm9rZWQgZnJvbSB3ZWxjb21lIHBhZ2VcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucHJvdG9jb2xzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNlbGVjdGVkQ29tbXVuaXR5SWQpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUaGlyZHBhcnR5UHJvdG9jb2xzKCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3RvY29scyA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Byb3RvY29sc0xvYWRpbmc6IGZhbHNlfSk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBlcnJvciBsb2FkaW5nIHRoaXJkIHBhcnR5IHByb3RvY29sczogJHtlcnJ9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cHJvdG9jb2xzTG9hZGluZzogZmFsc2V9KTtcbiAgICAgICAgICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBHdWVzdHMgY3VycmVudGx5IGFyZW4ndCBhbGxvd2VkIHRvIHVzZSB0aGlzIEFQSSwgc29cbiAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlIHRoaXMgYXMgb3RoZXJ3aXNlIHRoaXMgZXJyb3IgaXMgbGl0ZXJhbGx5IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyB0aGluZyB5b3Ugc2VlIHdoZW4gbG9hZGluZyB0aGUgY2xpZW50IVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyYWNrKCdGYWlsZWQgdG8gZ2V0IHByb3RvY29sIGxpc3QgZnJvbSBob21lc2VydmVyJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICclKGJyYW5kKXMgZmFpbGVkIHRvIGdldCB0aGUgcHJvdG9jb2wgbGlzdCBmcm9tIHRoZSBob21lc2VydmVyLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdUaGUgaG9tZXNlcnZlciBtYXkgYmUgdG9vIG9sZCB0byBzdXBwb3J0IHRoaXJkIHBhcnR5IG5ldHdvcmtzLicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7YnJhbmR9LFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB1c2UgdGhlIHByb3RvY29scyBpbiB0aGUgY29tbXVuaXRpZXMgdjIgcHJvdG90eXBlIGV4cGVyaWVuY2VcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucHJvdG9jb2xzTG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBHcmFiIHRoZSBwcm9maWxlIGluZm8gYXN5bmNcbiAgICAgICAgICAgIEZsYWlyU3RvcmUuZ2V0R3JvdXBQcm9maWxlQ2FjaGVkKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgdGhpcy5zdGF0ZS5zZWxlY3RlZENvbW11bml0eUlkKS50aGVuKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbW11bml0eU5hbWU6IHByb2ZpbGUubmFtZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5yZWZyZXNoUm9vbUxpc3QoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyVGltZW91dCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZmlsdGVyVGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZWZyZXNoUm9vbUxpc3QgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkQ29tbXVuaXR5SWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHB1YmxpY1Jvb21zOiBHcm91cFN0b3JlLmdldEdyb3VwUm9vbXModGhpcy5zdGF0ZS5zZWxlY3RlZENvbW11bml0eUlkKS5tYXAociA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmFuc2xhdGUgYWxsIHRoZSBncm91cCBwcm9wZXJ0aWVzIHRvIHRoZSBkaXJlY3RvcnkgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcGljOiByLnRvcGljLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2Fub25pY2FsX2FsaWFzOiByLmNhbm9uaWNhbEFsaWFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtX2pvaW5lZF9tZW1iZXJzOiByLm51bUpvaW5lZE1lbWJlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHIuYXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgd29ybGRfcmVhZGFibGU6IHIud29ybGRSZWFkYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGd1ZXN0X2Nhbl9qb2luOiByLmd1ZXN0c0NhbkpvaW4sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSkuZmlsdGVyKHIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXJTdHJpbmcgPSB0aGlzLnN0YXRlLmZpbHRlclN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlclN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVkSW4gPSAoczogc3RyaW5nKSA9PiAocyB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlclN0cmluZy50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250YWluZWRJbihyLm5hbWUpIHx8IGNvbnRhaW5lZEluKHIudG9waWMpIHx8IGNvbnRhaW5lZEluKHIuY2Fub25pY2FsX2FsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZXh0QmF0Y2ggPSBudWxsO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHB1YmxpY1Jvb21zOiBbXSxcbiAgICAgICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdldE1vcmVSb29tcygpO1xuICAgIH07XG5cbiAgICBnZXRNb3JlUm9vbXMoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkQ29tbXVuaXR5SWQpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gbm8gbW9yZSByb29tc1xuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgbXlfZmlsdGVyX3N0cmluZyA9IHRoaXMuc3RhdGUuZmlsdGVyU3RyaW5nO1xuICAgICAgICBjb25zdCBteV9zZXJ2ZXIgPSB0aGlzLnN0YXRlLnJvb21TZXJ2ZXI7XG4gICAgICAgIC8vIHJlbWVtYmVyIHRoZSBuZXh0IGJhdGNoIHRva2VuIHdoZW4gd2Ugc2VudCB0aGUgcmVxdWVzdFxuICAgICAgICAvLyB0b28uIElmIGl0J3MgY2hhbmdlZCwgYXBwZW5kaW5nIHRvIHRoZSBsaXN0IHdpbGwgY29ycnVwdCBpdC5cbiAgICAgICAgY29uc3QgbXlfbmV4dF9iYXRjaCA9IHRoaXMubmV4dEJhdGNoO1xuICAgICAgICBjb25zdCBvcHRzID0ge2xpbWl0OiAyMH07XG4gICAgICAgIGlmIChteV9zZXJ2ZXIgIT0gTWF0cml4Q2xpZW50UGVnLmdldEhvbWVzZXJ2ZXJOYW1lKCkpIHtcbiAgICAgICAgICAgIG9wdHMuc2VydmVyID0gbXlfc2VydmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmluc3RhbmNlSWQgPT09IEFMTF9ST09NUykge1xuICAgICAgICAgICAgb3B0cy5pbmNsdWRlX2FsbF9uZXR3b3JrcyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pbnN0YW5jZUlkKSB7XG4gICAgICAgICAgICBvcHRzLnRoaXJkX3BhcnR5X2luc3RhbmNlX2lkID0gdGhpcy5zdGF0ZS5pbnN0YW5jZUlkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5leHRCYXRjaCkgb3B0cy5zaW5jZSA9IHRoaXMubmV4dEJhdGNoO1xuICAgICAgICBpZiAobXlfZmlsdGVyX3N0cmluZykgb3B0cy5maWx0ZXIgPSB7IGdlbmVyaWNfc2VhcmNoX3Rlcm06IG15X2ZpbHRlcl9zdHJpbmcgfTtcbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5wdWJsaWNSb29tcyhvcHRzKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgbXlfZmlsdGVyX3N0cmluZyAhPSB0aGlzLnN0YXRlLmZpbHRlclN0cmluZyB8fFxuICAgICAgICAgICAgICAgIG15X3NlcnZlciAhPSB0aGlzLnN0YXRlLnJvb21TZXJ2ZXIgfHxcbiAgICAgICAgICAgICAgICBteV9uZXh0X2JhdGNoICE9IHRoaXMubmV4dEJhdGNoKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGZpbHRlciBvciBzZXJ2ZXIgaGFzIGNoYW5nZWQgc2luY2UgdGhpcyByZXF1ZXN0IHdhcyBzZW50LFxuICAgICAgICAgICAgICAgIC8vIHRocm93IGF3YXkgdGhlIHJlc3VsdCAoZG9uJ3QgZXZlbiBjbGVhciB0aGUgYnVzeSBmbGFnXG4gICAgICAgICAgICAgICAgLy8gc2luY2Ugd2UgbXVzdCBzdGlsbCBoYXZlIGEgcmVxdWVzdCBpbiBmbGlnaHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UndmUgYmVlbiB1bm1vdW50ZWQsIHdlIGRvbid0IGNhcmUgZWl0aGVyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZmlsdGVyU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY291bnQgPSBkYXRhLnRvdGFsX3Jvb21fY291bnRfZXN0aW1hdGUgfHwgZGF0YS5jaHVuay5sZW5ndGg7XG4gICAgICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFja1Jvb21EaXJlY3RvcnlTZWFyY2goY291bnQsIHRoaXMuc3RhdGUuZmlsdGVyU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5uZXh0QmF0Y2ggPSBkYXRhLm5leHRfYmF0Y2g7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKChzKSA9PiB7XG4gICAgICAgICAgICAgICAgcy5wdWJsaWNSb29tcy5wdXNoKC4uLihkYXRhLmNodW5rIHx8IFtdKSk7XG4gICAgICAgICAgICAgICAgcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBCb29sZWFuKGRhdGEubmV4dF9iYXRjaCk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBteV9maWx0ZXJfc3RyaW5nICE9IHRoaXMuc3RhdGUuZmlsdGVyU3RyaW5nIHx8XG4gICAgICAgICAgICAgICAgbXlfc2VydmVyICE9IHRoaXMuc3RhdGUucm9vbVNlcnZlciB8fFxuICAgICAgICAgICAgICAgIG15X25leHRfYmF0Y2ggIT0gdGhpcy5uZXh0QmF0Y2gpIHtcbiAgICAgICAgICAgICAgICAvLyBhcyBhYm92ZTogd2UgZG9uJ3QgY2FyZSBhYm91dCBlcnJvcnMgZm9yIG9sZFxuICAgICAgICAgICAgICAgIC8vIHJlcXVlc3RzIGVpdGhlclxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlJ3ZlIGJlZW4gdW5tb3VudGVkLCB3ZSBkb24ndCBjYXJlIGVpdGhlci5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZ2V0IHB1YmxpY1Jvb21zOiAlc1wiLCBKU09OLnN0cmluZ2lmeShlcnIpKTtcbiAgICAgICAgICAgIHRyYWNrKCdGYWlsZWQgdG8gZ2V0IHB1YmxpYyByb29tIGxpc3QnKTtcbiAgICAgICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IChcbiAgICAgICAgICAgICAgICAgICAgX3QoJyUoYnJhbmQpcyBmYWlsZWQgdG8gZ2V0IHRoZSBwdWJsaWMgcm9vbSBsaXN0LicsIHsgYnJhbmQgfSkgK1xuICAgICAgICAgICAgICAgICAgICAoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoJ1RoZSBob21lc2VydmVyIG1heSBiZSB1bmF2YWlsYWJsZSBvciBvdmVybG9hZGVkLicpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIGxpbWl0ZWQgaW50ZXJmYWNlIGZvciByZW1vdmluZyByb29tcyBmcm9tIHRoZSBkaXJlY3RvcnkuXG4gICAgICogV2lsbCBzZXQgdGhlIHJvb20gdG8gbm90IGJlIHB1YmxpY2x5IHZpc2libGUgYW5kIGRlbGV0ZSB0aGVcbiAgICAgKiBkZWZhdWx0IGFsaWFzLiBJbiB0aGUgbG9uZyB0ZXJtLCBpdCB3b3VsZCBiZSBiZXR0ZXIgdG8gYWxsb3dcbiAgICAgKiBIUyBhZG1pbnMgdG8gZG8gdGhpcyB0aHJvdWdoIHRoZSBSb29tU2V0dGluZ3MgaW50ZXJmYWNlLCBidXRcbiAgICAgKiB0aGlzIG5lZWRzIFNQRUMtNDE3LlxuICAgICAqL1xuICAgIHJlbW92ZUZyb21EaXJlY3Rvcnkocm9vbSkge1xuICAgICAgICBjb25zdCBhbGlhcyA9IGdldF9kaXNwbGF5X2FsaWFzX2Zvcl9yb29tKHJvb20pO1xuICAgICAgICBjb25zdCBuYW1lID0gcm9vbS5uYW1lIHx8IGFsaWFzIHx8IF90KCdVbm5hbWVkIHJvb20nKTtcblxuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuXG4gICAgICAgIGxldCBkZXNjO1xuICAgICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgICAgIGRlc2MgPSBfdCgnRGVsZXRlIHRoZSByb29tIGFkZHJlc3MgJShhbGlhcylzIGFuZCByZW1vdmUgJShuYW1lKXMgZnJvbSB0aGUgZGlyZWN0b3J5PycsIHthbGlhcywgbmFtZX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzYyA9IF90KCdSZW1vdmUgJShuYW1lKXMgZnJvbSB0aGUgZGlyZWN0b3J5PycsIHtuYW1lOiBuYW1lfSk7XG4gICAgICAgIH1cblxuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSZW1vdmUgZnJvbSBEaXJlY3RvcnknLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnUmVtb3ZlIGZyb20gRGlyZWN0b3J5JyksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzYyxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChzaG91bGRfZGVsZXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaG91bGRfZGVsZXRlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBjb25zdCBMb2FkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RhbCA9IE1vZGFsLmNyZWF0ZURpYWxvZyhMb2FkZXIpO1xuICAgICAgICAgICAgICAgIGxldCBzdGVwID0gX3QoJ3JlbW92ZSAlKG5hbWUpcyBmcm9tIHRoZSBkaXJlY3RvcnkuJywge25hbWU6IG5hbWV9KTtcblxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRSb29tRGlyZWN0b3J5VmlzaWJpbGl0eShyb29tLnJvb21faWQsICdwcml2YXRlJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYWxpYXMpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgc3RlcCA9IF90KCdkZWxldGUgdGhlIGFkZHJlc3MuJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlQWxpYXMoYWxpYXMpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hSb29tTGlzdCgpO1xuICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUm9vbUxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBcIiArIHN0ZXAgKyBcIjogXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSZW1vdmUgZnJvbSBEaXJlY3RvcnkgRXJyb3InLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3InKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KCdUaGUgc2VydmVyIG1heSBiZSB1bmF2YWlsYWJsZSBvciBvdmVybG9hZGVkJykpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uUm9vbUNsaWNrZWQgPSAocm9vbSwgZXYpID0+IHtcbiAgICAgICAgaWYgKGV2LnNoaWZ0S2V5ICYmICF0aGlzLnN0YXRlLnNlbGVjdGVkQ29tbXVuaXR5SWQpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZyb21EaXJlY3Rvcnkocm9vbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3dSb29tKHJvb20pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uT3B0aW9uQ2hhbmdlID0gKHNlcnZlciwgaW5zdGFuY2VJZCkgPT4ge1xuICAgICAgICAvLyBjbGVhciBuZXh0IGJhdGNoIHNvIHdlIGRvbid0IHRyeSB0byBsb2FkIG1vcmUgcm9vbXNcbiAgICAgICAgdGhpcy5uZXh0QmF0Y2ggPSBudWxsO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSBwdWJsaWMgcm9vbXMgb3V0IGhlcmUgb3RoZXJ3aXNlIHdlIG5lZWRsZXNzbHlcbiAgICAgICAgICAgIC8vIHNwZW5kIHRpbWUgZmlsdGVyaW5nIGxvdHMgb2Ygcm9vbXMgd2hlbiB3ZSdyZSBhYm91dCB0b1xuICAgICAgICAgICAgLy8gdG8gY2xlYXIgdGhlIGxpc3QgYW55d2F5LlxuICAgICAgICAgICAgcHVibGljUm9vbXM6IFtdLFxuICAgICAgICAgICAgcm9vbVNlcnZlcjogc2VydmVyLFxuICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZCxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICB9LCB0aGlzLnJlZnJlc2hSb29tTGlzdCk7XG4gICAgICAgIC8vIFdlIGFsc28gcmVmcmVzaCB0aGUgcm9vbSBsaXN0IGVhY2ggdGltZSBldmVuIHRob3VnaCB0aGlzXG4gICAgICAgIC8vIGZpbHRlcmluZyBpcyBjbGllbnQtc2lkZS4gSXQgaG9wZWZ1bGx5IHdvbid0IGJlIGNsaWVudCBzaWRlXG4gICAgICAgIC8vIGZvciB2ZXJ5IGxvbmcsIGFuZCB3ZSBtYXkgaGF2ZSBmZXRjaGVkIGEgdGhvdXNhbmQgcm9vbXMgdG9cbiAgICAgICAgLy8gZmluZCB0aGUgZml2ZSBnaXR0ZXIgb25lcywgYXQgd2hpY2ggcG9pbnQgd2UgZG8gbm90IHdhbnRcbiAgICAgICAgLy8gdG8gcmVuZGVyIGFsbCB0aG9zZSByb29tcyB3aGVuIHN3aXRjaGluZyBiYWNrIHRvICdhbGwgbmV0d29ya3MnLlxuICAgICAgICAvLyBFYXNpZXN0IHRvIGp1c3QgYmxvdyBhd2F5IHRoZSBzdGF0ZSAmIHJlLWZldGNoLlxuICAgIH07XG5cbiAgICBvbkZpbGxSZXF1ZXN0ID0gKGJhY2t3YXJkcykgPT4ge1xuICAgICAgICBpZiAoYmFja3dhcmRzIHx8ICF0aGlzLm5leHRCYXRjaCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TW9yZVJvb21zKCk7XG4gICAgfTtcblxuICAgIG9uRmlsdGVyQ2hhbmdlID0gKGFsaWFzKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmlsdGVyU3RyaW5nOiBhbGlhcyB8fCBudWxsLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBkb24ndCBzZW5kIHRoZSByZXF1ZXN0IGZvciBhIGxpdHRsZSBiaXQsXG4gICAgICAgIC8vIG5vIHBvaW50IGhhbW1lcmluZyB0aGUgc2VydmVyIHdpdGggYVxuICAgICAgICAvLyByZXF1ZXN0IGZvciBldmVyeSBrZXlzdHJva2UsIGxldCB0aGVcbiAgICAgICAgLy8gdXNlciBmaW5pc2ggdHlwaW5nLlxuICAgICAgICBpZiAodGhpcy5maWx0ZXJUaW1lb3V0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5maWx0ZXJUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbHRlclRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hSb29tTGlzdCgpO1xuICAgICAgICB9LCA3MDApO1xuICAgIH07XG5cbiAgICBvbkZpbHRlckNsZWFyID0gKCkgPT4ge1xuICAgICAgICAvLyB1cGRhdGUgaW1tZWRpYXRlbHlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBmaWx0ZXJTdHJpbmc6IG51bGwsXG4gICAgICAgIH0sIHRoaXMucmVmcmVzaFJvb21MaXN0KTtcblxuICAgICAgICBpZiAodGhpcy5maWx0ZXJUaW1lb3V0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5maWx0ZXJUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkpvaW5Gcm9tU2VhcmNoQ2xpY2sgPSAoYWxpYXMpID0+IHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHBhcnRpY3VsYXIgaW5zdGFuY2UgaWQgc2VsZWN0ZWQsIGp1c3Qgc2hvdyB0aGF0IHJvb21zIGFsaWFzXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5pbnN0YW5jZUlkIHx8IHRoaXMuc3RhdGUuaW5zdGFuY2VJZCA9PT0gQUxMX1JPT01TKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgdXNlciBzcGVjaWZpZWQgYW4gYWxpYXMgd2l0aG91dCBhIGRvbWFpbiwgYWRkIG9uIHdoaWNoZXZlciBzZXJ2ZXIgaXMgc2VsZWN0ZWRcbiAgICAgICAgICAgIC8vIGluIHRoZSBkcm9wZG93blxuICAgICAgICAgICAgaWYgKGFsaWFzLmluZGV4T2YoJzonKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIGFsaWFzID0gYWxpYXMgKyAnOicgKyB0aGlzLnN0YXRlLnJvb21TZXJ2ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNob3dSb29tQWxpYXMoYWxpYXMsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIDNyZCBwYXJ0eSBwcm90b2NvbC4gTGV0J3Mgc2VlIGlmIHdlIGNhbiBqb2luIGl0XG4gICAgICAgICAgICBjb25zdCBwcm90b2NvbE5hbWUgPSBwcm90b2NvbE5hbWVGb3JJbnN0YW5jZUlkKHRoaXMucHJvdG9jb2xzLCB0aGlzLnN0YXRlLmluc3RhbmNlSWQpO1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBpbnN0YW5jZUZvckluc3RhbmNlSWQodGhpcy5wcm90b2NvbHMsIHRoaXMuc3RhdGUuaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICBjb25zdCBmaWVsZHMgPSBwcm90b2NvbE5hbWUgPyB0aGlzLl9nZXRGaWVsZHNGb3JUaGlyZFBhcnR5TG9jYXRpb24oYWxpYXMsIHRoaXMucHJvdG9jb2xzW3Byb3RvY29sTmFtZV0sIGluc3RhbmNlKSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoIWZpZWxkcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIGpvaW4gbmV0d29yaycsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1VuYWJsZSB0byBqb2luIG5ldHdvcmsnKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCclKGJyYW5kKXMgZG9lcyBub3Qga25vdyBob3cgdG8gam9pbiBhIHJvb20gb24gdGhpcyBuZXR3b3JrJywgeyBicmFuZCB9KSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhpcmRwYXJ0eUxvY2F0aW9uKHByb3RvY29sTmFtZSwgZmllbGRzKS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3AubGVuZ3RoID4gMCAmJiByZXNwWzBdLmFsaWFzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd1Jvb21BbGlhcyhyZXNwWzBdLmFsaWFzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSb29tIG5vdCBmb3VuZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdSb29tIG5vdCBmb3VuZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdDb3VsZG5cXCd0IGZpbmQgYSBtYXRjaGluZyBNYXRyaXggcm9vbScpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmV0Y2hpbmcgdGhpcmQgcGFydHkgbG9jYXRpb24gZmFpbGVkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRmV0Y2hpbmcgdGhpcmQgcGFydHkgbG9jYXRpb24gZmFpbGVkJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnVW5hYmxlIHRvIGxvb2sgdXAgcm9vbSBJRCBmcm9tIHNlcnZlcicpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25QcmV2aWV3Q2xpY2sgPSAoZXYsIHJvb20pID0+IHtcbiAgICAgICAgdGhpcy5zaG93Um9vbShyb29tLCBudWxsLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH07XG5cbiAgICBvblZpZXdDbGljayA9IChldiwgcm9vbSkgPT4ge1xuICAgICAgICB0aGlzLnNob3dSb29tKHJvb20pO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9O1xuXG4gICAgb25Kb2luQ2xpY2sgPSAoZXYsIHJvb20pID0+IHtcbiAgICAgICAgdGhpcy5zaG93Um9vbShyb29tLCBudWxsLCB0cnVlKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfTtcblxuICAgIG9uQ3JlYXRlUm9vbUNsaWNrID0gcm9vbSA9PiB7XG4gICAgICAgIHRoaXMub25GaW5pc2hlZCgpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19jcmVhdGVfcm9vbScsXG4gICAgICAgICAgICBwdWJsaWM6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzaG93Um9vbUFsaWFzKGFsaWFzLCBhdXRvSm9pbj1mYWxzZSkge1xuICAgICAgICB0aGlzLnNob3dSb29tKG51bGwsIGFsaWFzLCBhdXRvSm9pbik7XG4gICAgfVxuXG4gICAgc2hvd1Jvb20ocm9vbSwgcm9vbV9hbGlhcywgYXV0b0pvaW4gPSBmYWxzZSwgc2hvdWxkUGVlayA9IGZhbHNlKSB7XG4gICAgICAgIHRoaXMub25GaW5pc2hlZCgpO1xuICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIGF1dG9fam9pbjogYXV0b0pvaW4sXG4gICAgICAgICAgICBzaG91bGRfcGVlazogc2hvdWxkUGVlayxcbiAgICAgICAgICAgIF90eXBlOiBcInJvb21fZGlyZWN0b3J5XCIsIC8vIGluc3RydW1lbnRhdGlvblxuICAgICAgICB9O1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgLy8gRG9uJ3QgbGV0IHRoZSB1c2VyIHZpZXcgYSByb29tIHRoZXkgd29uJ3QgYmUgYWJsZSB0byBlaXRoZXJcbiAgICAgICAgICAgIC8vIHBlZWsgb3Igam9pbjogZmFpbCBlYXJsaWVyIHNvIHRoZXkgZG9uJ3QgaGF2ZSB0byBjbGljayBiYWNrXG4gICAgICAgICAgICAvLyB0byB0aGUgZGlyZWN0b3J5LlxuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJvb20ud29ybGRfcmVhZGFibGUgJiYgIXJvb20uZ3Vlc3RfY2FuX2pvaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbid9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFyb29tX2FsaWFzKSB7XG4gICAgICAgICAgICAgICAgcm9vbV9hbGlhcyA9IGdldF9kaXNwbGF5X2FsaWFzX2Zvcl9yb29tKHJvb20pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwYXlsb2FkLm9vYl9kYXRhID0ge1xuICAgICAgICAgICAgICAgIGF2YXRhclVybDogcm9vbS5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgIC8vIFhYWDogVGhpcyBsb2dpYyBpcyBkdXBsaWNhdGVkIGZyb20gdGhlIEpTIFNESyB3aGljaFxuICAgICAgICAgICAgICAgIC8vIHdvdWxkIG5vcm1hbGx5IGRlY2lkZSB3aGF0IHRoZSBuYW1lIGlzLlxuICAgICAgICAgICAgICAgIG5hbWU6IHJvb20ubmFtZSB8fCByb29tX2FsaWFzIHx8IF90KCdVbm5hbWVkIHJvb20nKSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb21TZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZpYV9zZXJ2ZXJzID0gW3RoaXMuc3RhdGUucm9vbVNlcnZlcl07XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5vcHRzID0ge1xuICAgICAgICAgICAgICAgICAgICB2aWFTZXJ2ZXJzOiBbdGhpcy5zdGF0ZS5yb29tU2VydmVyXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEl0J3Mgbm90IHJlYWxseSBwb3NzaWJsZSB0byBqb2luIE1hdHJpeCByb29tcyBieSBJRCBiZWNhdXNlIHRoZSBIUyBoYXMgbm8gd2F5IHRvIGtub3dcbiAgICAgICAgLy8gd2hpY2ggc2VydmVycyB0byBzdGFydCBxdWVyeWluZy4gSG93ZXZlciwgdGhlcmUncyBubyBvdGhlciB3YXkgdG8gam9pbiByb29tcyBpblxuICAgICAgICAvLyB0aGlzIGxpc3Qgd2l0aG91dCBhbGlhc2VzIGF0IHByZXNlbnQsIHNvIGlmIHJvb21BbGlhcyBpc24ndCBzZXQgaGVyZSB3ZSBoYXZlIG5vXG4gICAgICAgIC8vIGNob2ljZSBidXQgdG8gc3VwcGx5IHRoZSBJRC5cbiAgICAgICAgaWYgKHJvb21fYWxpYXMpIHtcbiAgICAgICAgICAgIHBheWxvYWQucm9vbV9hbGlhcyA9IHJvb21fYWxpYXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXlsb2FkLnJvb21faWQgPSByb29tLnJvb21faWQ7XG4gICAgICAgIH1cbiAgICAgICAgZGlzLmRpc3BhdGNoKHBheWxvYWQpO1xuICAgIH1cblxuICAgIGNyZWF0ZVJvb21DZWxscyhyb29tKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgY2xpZW50Um9vbSA9IGNsaWVudC5nZXRSb29tKHJvb20ucm9vbV9pZCk7XG4gICAgICAgIGNvbnN0IGhhc0pvaW5lZFJvb20gPSBjbGllbnRSb29tICYmIGNsaWVudFJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiO1xuICAgICAgICBjb25zdCBpc0d1ZXN0ID0gY2xpZW50LmlzR3Vlc3QoKTtcbiAgICAgICAgY29uc3QgQmFzZUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ2F2YXRhcnMuQmFzZUF2YXRhcicpO1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICBsZXQgcHJldmlld0J1dHRvbjtcbiAgICAgICAgbGV0IGpvaW5PclZpZXdCdXR0b247XG5cbiAgICAgICAgLy8gRWxlbWVudCBXZWIgY3VycmVudGx5IGRvZXMgbm90IGFsbG93IGd1ZXN0cyB0byBqb2luIHJvb21zLCBzbyB3ZVxuICAgICAgICAvLyBpbnN0ZWFkIHNob3cgdGhlbSBwcmV2aWV3IGJ1dHRvbnMgZm9yIGFsbCByb29tcy4gSWYgdGhlIHJvb20gaXMgbm90XG4gICAgICAgIC8vIHdvcmxkIHJlYWRhYmxlLCBhIG1vZGFsIHdpbGwgYXBwZWFyIGFza2luZyB5b3UgdG8gcmVnaXN0ZXIgZmlyc3QuIElmXG4gICAgICAgIC8vIGl0IGlzIHJlYWRhYmxlLCB0aGUgcHJldmlldyBhcHBlYXJzIGFzIG5vcm1hbC5cbiAgICAgICAgaWYgKCFoYXNKb2luZWRSb29tICYmIChyb29tLndvcmxkX3JlYWRhYmxlIHx8IGlzR3Vlc3QpKSB7XG4gICAgICAgICAgICBwcmV2aWV3QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJzZWNvbmRhcnlcIiBvbkNsaWNrPXsoZXYpID0+IHRoaXMub25QcmV2aWV3Q2xpY2soZXYsIHJvb20pfT57X3QoXCJQcmV2aWV3XCIpfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc0pvaW5lZFJvb20pIHtcbiAgICAgICAgICAgIGpvaW5PclZpZXdCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInNlY29uZGFyeVwiIG9uQ2xpY2s9eyhldikgPT4gdGhpcy5vblZpZXdDbGljayhldiwgcm9vbSl9PntfdChcIlZpZXdcIil9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICghaXNHdWVzdCkge1xuICAgICAgICAgICAgam9pbk9yVmlld0J1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9eyhldikgPT4gdGhpcy5vbkpvaW5DbGljayhldiwgcm9vbSl9PntfdChcIkpvaW5cIil9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBuYW1lID0gcm9vbS5uYW1lIHx8IGdldF9kaXNwbGF5X2FsaWFzX2Zvcl9yb29tKHJvb20pIHx8IF90KCdVbm5hbWVkIHJvb20nKTtcbiAgICAgICAgaWYgKG5hbWUubGVuZ3RoID4gTUFYX05BTUVfTEVOR1RIKSB7XG4gICAgICAgICAgICBuYW1lID0gYCR7bmFtZS5zdWJzdHJpbmcoMCwgTUFYX05BTUVfTEVOR1RIKX0uLi5gO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRvcGljID0gcm9vbS50b3BpYyB8fCAnJztcbiAgICAgICAgLy8gQWRkaXRpb25hbCB0cnVuY2F0aW9uIGJhc2VkIG9uIGxpbmUgbnVtYmVycyBpcyBkb25lIHZpYSBDU1MsXG4gICAgICAgIC8vIGJ1dCB0byBlbnN1cmUgdGhhdCB0aGUgRE9NIGlzIG5vdCBwb2xsdXRlZCB3aXRoIGEgaHVnZSBzdHJpbmdcbiAgICAgICAgLy8gd2UgZ2l2ZSBpdCBhIGhhcmQgbGltaXQgYmVmb3JlIHJlbmRlcmluZy5cbiAgICAgICAgaWYgKHRvcGljLmxlbmd0aCA+IE1BWF9UT1BJQ19MRU5HVEgpIHtcbiAgICAgICAgICAgIHRvcGljID0gYCR7dG9waWMuc3Vic3RyaW5nKDAsIE1BWF9UT1BJQ19MRU5HVEgpfS4uLmA7XG4gICAgICAgIH1cbiAgICAgICAgdG9waWMgPSBsaW5raWZ5QW5kU2FuaXRpemVIdG1sKHRvcGljKTtcbiAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gZ2V0SHR0cFVyaUZvck14YyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldEhvbWVzZXJ2ZXJVcmwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbS5hdmF0YXJfdXJsLCAzMiwgMzIsIFwiY3JvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICA8ZGl2IGtleT17IGAke3Jvb20ucm9vbV9pZH1fYXZhdGFyYCB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB0aGlzLm9uUm9vbUNsaWNrZWQocm9vbSwgZXYpfVxuICAgICAgICAgICAgICAgIC8vIGNhbmNlbCBvbk1vdXNlRG93biBvdGhlcndpc2Ugc2hpZnQtY2xpY2tpbmcgaGlnaGxpZ2h0cyB0ZXh0XG4gICAgICAgICAgICAgICAgb25Nb3VzZURvd249eyhldikgPT4ge2V2LnByZXZlbnREZWZhdWx0KCk7fX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X3Jvb21BdmF0YXJcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyIHdpZHRoPXszMn0gaGVpZ2h0PXszMn0gcmVzaXplTWV0aG9kPSdjcm9wJ1xuICAgICAgICAgICAgICAgICAgICBuYW1lPXsgbmFtZSB9IGlkTmFtZT17IG5hbWUgfVxuICAgICAgICAgICAgICAgICAgICB1cmw9eyBhdmF0YXJVcmwgfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICA8ZGl2IGtleT17IGAke3Jvb20ucm9vbV9pZH1fZGVzY3JpcHRpb25gIH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXYpID0+IHRoaXMub25Sb29tQ2xpY2tlZChyb29tLCBldil9XG4gICAgICAgICAgICAgICAgLy8gY2FuY2VsIG9uTW91c2VEb3duIG90aGVyd2lzZSBzaGlmdC1jbGlja2luZyBoaWdobGlnaHRzIHRleHRcbiAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17KGV2KSA9PiB7ZXYucHJldmVudERlZmF1bHQoKTt9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3Rvcnlfcm9vbURlc2NyaXB0aW9uXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlfbmFtZVwiPnsgbmFtZSB9PC9kaXY+Jm5ic3A7XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X3RvcGljXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17IChldikgPT4geyBldi5zdG9wUHJvcGFnYXRpb24oKTsgfSB9XG4gICAgICAgICAgICAgICAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogdG9waWMgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV9hbGlhc1wiPnsgZ2V0X2Rpc3BsYXlfYWxpYXNfZm9yX3Jvb20ocm9vbSkgfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgPGRpdiBrZXk9eyBgJHtyb29tLnJvb21faWR9X21lbWJlckNvdW50YCB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB0aGlzLm9uUm9vbUNsaWNrZWQocm9vbSwgZXYpfVxuICAgICAgICAgICAgICAgIC8vIGNhbmNlbCBvbk1vdXNlRG93biBvdGhlcndpc2Ugc2hpZnQtY2xpY2tpbmcgaGlnaGxpZ2h0cyB0ZXh0XG4gICAgICAgICAgICAgICAgb25Nb3VzZURvd249eyhldikgPT4ge2V2LnByZXZlbnREZWZhdWx0KCk7fX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X3Jvb21NZW1iZXJDb3VudFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyByb29tLm51bV9qb2luZWRfbWVtYmVycyB9XG4gICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICA8ZGl2IGtleT17IGAke3Jvb20ucm9vbV9pZH1fcHJldmlld2AgfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldikgPT4gdGhpcy5vblJvb21DbGlja2VkKHJvb20sIGV2KX1cbiAgICAgICAgICAgICAgICAvLyBjYW5jZWwgb25Nb3VzZURvd24gb3RoZXJ3aXNlIHNoaWZ0LWNsaWNraW5nIGhpZ2hsaWdodHMgdGV4dFxuICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXsoZXYpID0+IHtldi5wcmV2ZW50RGVmYXVsdCgpO319XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV9wcmV2aWV3XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7cHJldmlld0J1dHRvbn1cbiAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgIDxkaXYga2V5PXsgYCR7cm9vbS5yb29tX2lkfV9qb2luYCB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB0aGlzLm9uUm9vbUNsaWNrZWQocm9vbSwgZXYpfVxuICAgICAgICAgICAgICAgIC8vIGNhbmNlbCBvbk1vdXNlRG93biBvdGhlcndpc2Ugc2hpZnQtY2xpY2tpbmcgaGlnaGxpZ2h0cyB0ZXh0XG4gICAgICAgICAgICAgICAgb25Nb3VzZURvd249eyhldikgPT4ge2V2LnByZXZlbnREZWZhdWx0KCk7fX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X2pvaW5cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtqb2luT3JWaWV3QnV0dG9ufVxuICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGNvbGxlY3RTY3JvbGxQYW5lbCA9IChlbGVtZW50KSA9PiB7XG4gICAgICAgIHRoaXMuc2Nyb2xsUGFuZWwgPSBlbGVtZW50O1xuICAgIH07XG5cbiAgICBfc3RyaW5nTG9va3NMaWtlSWQocywgZmllbGRfdHlwZSkge1xuICAgICAgICBsZXQgcGF0ID0gL14jW15cXHNdKzpbXlxcc10vO1xuICAgICAgICBpZiAoZmllbGRfdHlwZSAmJiBmaWVsZF90eXBlLnJlZ2V4cCkge1xuICAgICAgICAgICAgcGF0ID0gbmV3IFJlZ0V4cChmaWVsZF90eXBlLnJlZ2V4cCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGF0LnRlc3Qocyk7XG4gICAgfVxuXG4gICAgX2dldEZpZWxkc0ZvclRoaXJkUGFydHlMb2NhdGlvbih1c2VySW5wdXQsIHByb3RvY29sLCBpbnN0YW5jZSkge1xuICAgICAgICAvLyBtYWtlIGFuIG9iamVjdCB3aXRoIHRoZSBmaWVsZHMgc3BlY2lmaWVkIGJ5IHRoYXQgcHJvdG9jb2wuIFdlXG4gICAgICAgIC8vIHJlcXVpcmUgdGhhdCB0aGUgdmFsdWVzIG9mIGFsbCBidXQgdGhlIGxhc3QgZmllbGQgY29tZSBmcm9tIHRoZVxuICAgICAgICAvLyBpbnN0YW5jZS4gVGhlIGxhc3QgaXMgdGhlIHVzZXIgaW5wdXQuXG4gICAgICAgIGNvbnN0IHJlcXVpcmVkRmllbGRzID0gcHJvdG9jb2wubG9jYXRpb25fZmllbGRzO1xuICAgICAgICBpZiAoIXJlcXVpcmVkRmllbGRzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgZmllbGRzID0ge307XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRGaWVsZHMubGVuZ3RoIC0gMTsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCB0aGlzRmllbGQgPSByZXF1aXJlZEZpZWxkc1tpXTtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5maWVsZHNbdGhpc0ZpZWxkXSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGZpZWxkc1t0aGlzRmllbGRdID0gaW5zdGFuY2UuZmllbGRzW3RoaXNGaWVsZF07XG4gICAgICAgIH1cbiAgICAgICAgZmllbGRzW3JlcXVpcmVkRmllbGRzW3JlcXVpcmVkRmllbGRzLmxlbmd0aCAtIDFdXSA9IHVzZXJJbnB1dDtcbiAgICAgICAgcmV0dXJuIGZpZWxkcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjYWxsZWQgYnkgdGhlIHBhcmVudCBjb21wb25lbnQgd2hlbiBQYWdlVXAvRG93bi9ldGMgaXMgcHJlc3NlZC5cbiAgICAgKlxuICAgICAqIFdlIHBhc3MgaXQgZG93biB0byB0aGUgc2Nyb2xsIHBhbmVsLlxuICAgICAqL1xuICAgIGhhbmRsZVNjcm9sbEtleSA9IGV2ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsUGFuZWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsUGFuZWwuaGFuZGxlU2Nyb2xsS2V5KGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkZpbmlzaGVkID0gKCkgPT4ge1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrUm9vbURpcmVjdG9yeSh0aGlzLnN0YXJ0VGltZSk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gdGhpcy5zdGF0ZS5lcnJvcjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnByb3RvY29sc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8TG9hZGVyIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgY2VsbHMgPSAodGhpcy5zdGF0ZS5wdWJsaWNSb29tcyB8fCBbXSlcbiAgICAgICAgICAgICAgICAucmVkdWNlKChjZWxscywgcm9vbSkgPT4gY2VsbHMuY29uY2F0KHRoaXMuY3JlYXRlUm9vbUNlbGxzKHJvb20pKSwgW10sKTtcbiAgICAgICAgICAgIC8vIHdlIHN0aWxsIHNob3cgdGhlIHNjcm9sbHBhbmVsLCBhdCBsZWFzdCBmb3Igbm93LCBiZWNhdXNlXG4gICAgICAgICAgICAvLyBvdGhlcndpc2Ugd2UgZG9uJ3QgZmV0Y2ggbW9yZSBiZWNhdXNlIHdlIGRvbid0IGdldCBhIGZpbGxcbiAgICAgICAgICAgIC8vIHJlcXVlc3QgZnJvbSB0aGUgc2Nyb2xscGFuZWwgYmVjYXVzZSB0aGVyZSBpc24ndCBvbmVcblxuICAgICAgICAgICAgbGV0IHNwaW5uZXI7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgc3Bpbm5lciA9IDxMb2FkZXIgLz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzY3JvbGxwYW5lbF9jb250ZW50O1xuICAgICAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xscGFuZWxfY29udGVudCA9IDxpPnsgX3QoJ05vIHJvb21zIHRvIHNob3cnKSB9PC9pPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xscGFuZWxfY29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV90YWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICB7IGNlbGxzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBTY3JvbGxQYW5lbCA9IHNkay5nZXRDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLlNjcm9sbFBhbmVsXCIpO1xuICAgICAgICAgICAgY29udGVudCA9IDxTY3JvbGxQYW5lbCByZWY9e3RoaXMuY29sbGVjdFNjcm9sbFBhbmVsfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlfdGFibGVXcmFwcGVyXCJcbiAgICAgICAgICAgICAgICBvbkZpbGxSZXF1ZXN0PXsgdGhpcy5vbkZpbGxSZXF1ZXN0IH1cbiAgICAgICAgICAgICAgICBzdGlja3lCb3R0b209e2ZhbHNlfVxuICAgICAgICAgICAgICAgIHN0YXJ0QXRCb3R0b209e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgc2Nyb2xscGFuZWxfY29udGVudCB9XG4gICAgICAgICAgICAgICAgeyBzcGlubmVyIH1cbiAgICAgICAgICAgIDwvU2Nyb2xsUGFuZWw+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxpc3RIZWFkZXI7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5wcm90b2NvbHNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBOZXR3b3JrRHJvcGRvd24gPSBzZGsuZ2V0Q29tcG9uZW50KCdkaXJlY3RvcnkuTmV0d29ya0Ryb3Bkb3duJyk7XG4gICAgICAgICAgICBjb25zdCBEaXJlY3RvcnlTZWFyY2hCb3ggPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5EaXJlY3RvcnlTZWFyY2hCb3gnKTtcblxuICAgICAgICAgICAgY29uc3QgcHJvdG9jb2xOYW1lID0gcHJvdG9jb2xOYW1lRm9ySW5zdGFuY2VJZCh0aGlzLnByb3RvY29scywgdGhpcy5zdGF0ZS5pbnN0YW5jZUlkKTtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZV9leHBlY3RlZF9maWVsZF90eXBlO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHByb3RvY29sTmFtZSAmJlxuICAgICAgICAgICAgICAgIHRoaXMucHJvdG9jb2xzICYmXG4gICAgICAgICAgICAgICAgdGhpcy5wcm90b2NvbHNbcHJvdG9jb2xOYW1lXSAmJlxuICAgICAgICAgICAgICAgIHRoaXMucHJvdG9jb2xzW3Byb3RvY29sTmFtZV0ubG9jYXRpb25fZmllbGRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICB0aGlzLnByb3RvY29sc1twcm90b2NvbE5hbWVdLmZpZWxkX3R5cGVzXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0X2ZpZWxkID0gdGhpcy5wcm90b2NvbHNbcHJvdG9jb2xOYW1lXS5sb2NhdGlvbl9maWVsZHMuc2xpY2UoLTEpWzBdO1xuICAgICAgICAgICAgICAgIGluc3RhbmNlX2V4cGVjdGVkX2ZpZWxkX3R5cGUgPSB0aGlzLnByb3RvY29sc1twcm90b2NvbE5hbWVdLmZpZWxkX3R5cGVzW2xhc3RfZmllbGRdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcGxhY2Vob2xkZXIgPSBfdCgnRmluZCBhIHJvb23igKYnKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5pbnN0YW5jZUlkIHx8IHRoaXMuc3RhdGUuaW5zdGFuY2VJZCA9PT0gQUxMX1JPT01TKSB7XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSBfdChcIkZpbmQgYSByb29t4oCmIChlLmcuICUoZXhhbXBsZVJvb20pcylcIiwge2V4YW1wbGVSb29tOiBcIiNleGFtcGxlOlwiICsgdGhpcy5zdGF0ZS5yb29tU2VydmVyfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluc3RhbmNlX2V4cGVjdGVkX2ZpZWxkX3R5cGUpIHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IGluc3RhbmNlX2V4cGVjdGVkX2ZpZWxkX3R5cGUucGxhY2Vob2xkZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzaG93Sm9pbkJ1dHRvbiA9IHRoaXMuX3N0cmluZ0xvb2tzTGlrZUlkKHRoaXMuc3RhdGUuZmlsdGVyU3RyaW5nLCBpbnN0YW5jZV9leHBlY3RlZF9maWVsZF90eXBlKTtcbiAgICAgICAgICAgIGlmIChwcm90b2NvbE5hbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IGluc3RhbmNlRm9ySW5zdGFuY2VJZCh0aGlzLnByb3RvY29scywgdGhpcy5zdGF0ZS5pbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZ2V0RmllbGRzRm9yVGhpcmRQYXJ0eUxvY2F0aW9uKHRoaXMuc3RhdGUuZmlsdGVyU3RyaW5nLCB0aGlzLnByb3RvY29sc1twcm90b2NvbE5hbWVdLCBpbnN0YW5jZSkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0pvaW5CdXR0b24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBkcm9wZG93biA9IChcbiAgICAgICAgICAgICAgICA8TmV0d29ya0Ryb3Bkb3duXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29scz17dGhpcy5wcm90b2NvbHN9XG4gICAgICAgICAgICAgICAgICAgIG9uT3B0aW9uQ2hhbmdlPXt0aGlzLm9uT3B0aW9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNlcnZlck5hbWU9e3RoaXMuc3RhdGUucm9vbVNlcnZlcn1cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJbnN0YW5jZUlkPXt0aGlzLnN0YXRlLmluc3RhbmNlSWR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZENvbW11bml0eUlkKSB7XG4gICAgICAgICAgICAgICAgZHJvcGRvd24gPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaXN0SGVhZGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X2xpc3RoZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8RGlyZWN0b3J5U2VhcmNoQm94XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3Rvcnlfc2VhcmNoYm94XCJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25GaWx0ZXJDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xlYXI9e3RoaXMub25GaWx0ZXJDbGVhcn1cbiAgICAgICAgICAgICAgICAgICAgb25Kb2luQ2xpY2s9e3RoaXMub25Kb2luRnJvbVNlYXJjaENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17cGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIHNob3dKb2luQnV0dG9uPXtzaG93Sm9pbkJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFRleHQ9e3RoaXMucHJvcHMuaW5pdGlhbFRleHR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7ZHJvcGRvd259XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhwbGFuYXRpb24gPVxuICAgICAgICAgICAgX3QoXCJJZiB5b3UgY2FuJ3QgZmluZCB0aGUgcm9vbSB5b3UncmUgbG9va2luZyBmb3IsIGFzayBmb3IgYW4gaW52aXRlIG9yIDxhPkNyZWF0ZSBhIG5ldyByb29tPC9hPi5cIiwgbnVsbCxcbiAgICAgICAgICAgICAgICB7YTogc3ViID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInNlY29uZGFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ3JlYXRlUm9vbUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICA+e3N1Yn08L0FjY2Vzc2libGVCdXR0b24+KTtcbiAgICAgICAgICAgICAgICB9fSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkQ29tbXVuaXR5SWRcbiAgICAgICAgICAgID8gX3QoXCJFeHBsb3JlIHJvb21zIGluICUoY29tbXVuaXR5TmFtZSlzXCIsIHtcbiAgICAgICAgICAgICAgICBjb21tdW5pdHlOYW1lOiB0aGlzLnN0YXRlLmNvbW11bml0eU5hbWUgfHwgdGhpcy5zdGF0ZS5zZWxlY3RlZENvbW11bml0eUlkLFxuICAgICAgICAgICAgfSkgOiBfdChcIkV4cGxvcmUgcm9vbXNcIik7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17J214X1Jvb21EaXJlY3RvcnlfZGlhbG9nJ31cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlcIj5cbiAgICAgICAgICAgICAgICAgICAge2V4cGxhbmF0aW9ufVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlfbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2xpc3RIZWFkZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG4vLyBTaW1pbGFyIHRvIG1hdHJpeC1yZWFjdC1zZGsncyBNYXRyaXhUb29scy5nZXREaXNwbGF5QWxpYXNGb3JSb29tXG4vLyBidXQgd29ya3Mgd2l0aCB0aGUgb2JqZWN0cyB3ZSBnZXQgZnJvbSB0aGUgcHVibGljIHJvb20gbGlzdFxuZnVuY3Rpb24gZ2V0X2Rpc3BsYXlfYWxpYXNfZm9yX3Jvb20ocm9vbSkge1xuICAgIHJldHVybiByb29tLmNhbm9uaWNhbF9hbGlhcyB8fCAocm9vbS5hbGlhc2VzID8gcm9vbS5hbGlhc2VzWzBdIDogXCJcIik7XG59XG4iXX0=