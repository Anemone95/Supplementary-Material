"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _UserAddress = require("../../../UserAddress.js");

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

var Email = _interopRequireWildcard(require("../../../email"));

var _IdentityAuthClient = _interopRequireDefault(require("../../../IdentityAuthClient"));

var _IdentityServerUtils = require("../../../utils/IdentityServerUtils");

var _UrlUtils = require("../../../utils/UrlUtils");

var _promise = require("../../../utils/promise");

var _Keyboard = require("../../../Keyboard");

var _actions = require("../../../dispatcher/actions");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018, 2019 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
const TRUNCATE_QUERY_LIST = 40;
const QUERY_USER_DIRECTORY_DEBOUNCE_MS = 200;
const addressTypeName = {
  'mx-user-id': (0, _languageHandler._td)("Matrix ID"),
  'mx-room-id': (0, _languageHandler._td)("Matrix Room ID"),
  'email': (0, _languageHandler._td)("email address")
};

class AddressPickerDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onButtonClick", () => {
      let selectedList = this.state.selectedList.slice(); // Check the text input field to see if user has an unconverted address
      // If there is and it's valid add it to the local selectedList

      if (this._textinput.current.value !== '') {
        selectedList = this._addAddressesToList([this._textinput.current.value]);
        if (selectedList === null) return;
      }

      this.props.onFinished(true, selectedList);
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onKeyDown", e => {
      const textInput = this._textinput.current ? this._textinput.current.value : undefined;

      if (e.key === _Keyboard.Key.ESCAPE) {
        e.stopPropagation();
        e.preventDefault();
        this.props.onFinished(false);
      } else if (e.key === _Keyboard.Key.ARROW_UP) {
        e.stopPropagation();
        e.preventDefault();
        if (this.addressSelector) this.addressSelector.moveSelectionUp();
      } else if (e.key === _Keyboard.Key.ARROW_DOWN) {
        e.stopPropagation();
        e.preventDefault();
        if (this.addressSelector) this.addressSelector.moveSelectionDown();
      } else if (this.state.suggestedList.length > 0 && [_Keyboard.Key.COMMA, _Keyboard.Key.ENTER, _Keyboard.Key.TAB].includes(e.key)) {
        e.stopPropagation();
        e.preventDefault();
        if (this.addressSelector) this.addressSelector.chooseSelection();
      } else if (textInput.length === 0 && this.state.selectedList.length && e.key === _Keyboard.Key.BACKSPACE) {
        e.stopPropagation();
        e.preventDefault();
        this.onDismissed(this.state.selectedList.length - 1)();
      } else if (e.key === _Keyboard.Key.ENTER) {
        e.stopPropagation();
        e.preventDefault();

        if (textInput === '') {
          // if there's nothing in the input box, submit the form
          this.onButtonClick();
        } else {
          this._addAddressesToList([textInput]);
        }
      } else if (textInput && (e.key === _Keyboard.Key.COMMA || e.key === _Keyboard.Key.TAB)) {
        e.stopPropagation();
        e.preventDefault();

        this._addAddressesToList([textInput]);
      }
    });
    (0, _defineProperty2.default)(this, "onQueryChanged", ev => {
      const query = ev.target.value;

      if (this.queryChangedDebouncer) {
        clearTimeout(this.queryChangedDebouncer);
      } // Only do search if there is something to search


      if (query.length > 0 && query !== '@' && query.length >= 2) {
        this.queryChangedDebouncer = setTimeout(() => {
          if (this.props.pickerType === 'user') {
            if (this.props.groupId) {
              this._doNaiveGroupSearch(query);
            } else if (this.state.serverSupportsUserDirectory) {
              this._doUserDirectorySearch(query);
            } else {
              this._doLocalSearch(query);
            }
          } else if (this.props.pickerType === 'room') {
            if (this.props.groupId) {
              this._doNaiveGroupRoomSearch(query);
            } else {
              this._doRoomSearch(query);
            }
          } else {
            console.error('Unknown pickerType', this.props.pickerType);
          }
        }, QUERY_USER_DIRECTORY_DEBOUNCE_MS);
      } else {
        this.setState({
          suggestedList: [],
          query: "",
          searchError: null
        });
      }
    });
    (0, _defineProperty2.default)(this, "onDismissed", index => () => {
      const selectedList = this.state.selectedList.slice();
      selectedList.splice(index, 1);
      this.setState({
        selectedList,
        suggestedList: [],
        query: ""
      });
      if (this._cancelThreepidLookup) this._cancelThreepidLookup();
    });
    (0, _defineProperty2.default)(this, "onClick", index => () => {
      this.onSelected(index);
    });
    (0, _defineProperty2.default)(this, "onSelected", index => {
      const selectedList = this.state.selectedList.slice();
      selectedList.push(this._getFilteredSuggestions()[index]);
      this.setState({
        selectedList,
        suggestedList: [],
        query: ""
      });
      if (this._cancelThreepidLookup) this._cancelThreepidLookup();
    });
    (0, _defineProperty2.default)(this, "_onPaste", e => {
      // Prevent the text being pasted into the textarea
      e.preventDefault();
      const text = e.clipboardData.getData("text"); // Process it as a list of addresses to add instead

      this._addAddressesToList(text.split(/[\s,]+/));
    });
    (0, _defineProperty2.default)(this, "onUseDefaultIdentityServerClick", e => {
      e.preventDefault(); // Update the IS in account data. Actually using it may trigger terms.
      // eslint-disable-next-line react-hooks/rules-of-hooks

      (0, _IdentityServerUtils.useDefaultIdentityServer)(); // Add email as a valid address type.

      const {
        validAddressTypes
      } = this.state;
      validAddressTypes.push('email');
      this.setState({
        validAddressTypes
      });
    });
    (0, _defineProperty2.default)(this, "onManageSettingsClick", e => {
      e.preventDefault();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);

      this.onCancel();
    });
    this._textinput = /*#__PURE__*/(0, _react.createRef)();
    let _validAddressTypes = this.props.validAddressTypes; // Remove email from validAddressTypes if no IS is configured. It may be added at a later stage by the user

    if (!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl() && _validAddressTypes.includes("email")) {
      _validAddressTypes = _validAddressTypes.filter(type => type !== "email");
    }

    this.state = {
      // Whether to show an error message because of an invalid address
      invalidAddressError: false,
      // List of UserAddressType objects representing
      // the list of addresses we're going to invite
      selectedList: [],
      // Whether a search is ongoing
      busy: false,
      // An error message generated during the user directory search
      searchError: null,
      // Whether the server supports the user_directory API
      serverSupportsUserDirectory: true,
      // The query being searched for
      query: "",
      // List of UserAddressType objects representing the set of
      // auto-completion results for the current search query.
      suggestedList: [],
      // List of address types initialised from props, but may change while the
      // dialog is open and represents the supported list of address types at this time.
      validAddressTypes: _validAddressTypes
    };
  }

  componentDidMount() {
    if (this.props.focus) {
      // Set the cursor at the end of the text input
      this._textinput.current.value = this.props.value;
    }
  }

  getPlaceholder() {
    const {
      placeholder
    } = this.props;

    if (typeof placeholder === "string") {
      return placeholder;
    } // Otherwise it's a function, as checked by prop types.


    return placeholder(this.state.validAddressTypes);
  }

  _doNaiveGroupSearch(query) {
    const lowerCaseQuery = query.toLowerCase();
    this.setState({
      busy: true,
      query,
      searchError: null
    });

    _MatrixClientPeg.MatrixClientPeg.get().getGroupUsers(this.props.groupId).then(resp => {
      const results = [];
      resp.chunk.forEach(u => {
        const userIdMatch = u.user_id.toLowerCase().includes(lowerCaseQuery);
        const displayNameMatch = (u.displayname || '').toLowerCase().includes(lowerCaseQuery);

        if (!(userIdMatch || displayNameMatch)) {
          return;
        }

        results.push({
          user_id: u.user_id,
          avatar_url: u.avatar_url,
          display_name: u.displayname
        });
      });

      this._processResults(results, query);
    }).catch(err => {
      console.error('Error whilst searching group rooms: ', err);
      this.setState({
        searchError: err.errcode ? err.message : (0, _languageHandler._t)('Something went wrong!')
      });
    }).then(() => {
      this.setState({
        busy: false
      });
    });
  }

  _doNaiveGroupRoomSearch(query) {
    const lowerCaseQuery = query.toLowerCase();
    const results = [];

    _GroupStore.default.getGroupRooms(this.props.groupId).forEach(r => {
      const nameMatch = (r.name || '').toLowerCase().includes(lowerCaseQuery);
      const topicMatch = (r.topic || '').toLowerCase().includes(lowerCaseQuery);
      const aliasMatch = (r.canonical_alias || '').toLowerCase().includes(lowerCaseQuery);

      if (!(nameMatch || topicMatch || aliasMatch)) {
        return;
      }

      results.push({
        room_id: r.room_id,
        avatar_url: r.avatar_url,
        name: r.name || r.canonical_alias
      });
    });

    this._processResults(results, query);

    this.setState({
      busy: false
    });
  }

  _doRoomSearch(query) {
    const lowerCaseQuery = query.toLowerCase();

    const rooms = _MatrixClientPeg.MatrixClientPeg.get().getRooms();

    const results = [];
    rooms.forEach(room => {
      let rank = Infinity;
      const nameEvent = room.currentState.getStateEvents('m.room.name', '');
      const name = nameEvent ? nameEvent.getContent().name : '';
      const canonicalAlias = room.getCanonicalAlias();
      const aliasEvents = room.currentState.getStateEvents('m.room.aliases');
      const aliases = aliasEvents.map(ev => ev.getContent().aliases).reduce((a, b) => {
        return a.concat(b);
      }, []);
      const nameMatch = (name || '').toLowerCase().includes(lowerCaseQuery);
      let aliasMatch = false;
      let shortestMatchingAliasLength = Infinity;
      aliases.forEach(alias => {
        if ((alias || '').toLowerCase().includes(lowerCaseQuery)) {
          aliasMatch = true;

          if (shortestMatchingAliasLength > alias.length) {
            shortestMatchingAliasLength = alias.length;
          }
        }
      });

      if (!(nameMatch || aliasMatch)) {
        return;
      }

      if (aliasMatch) {
        // A shorter matching alias will give a better rank
        rank = shortestMatchingAliasLength;
      }

      const avatarEvent = room.currentState.getStateEvents('m.room.avatar', '');
      const avatarUrl = avatarEvent ? avatarEvent.getContent().url : undefined;
      results.push({
        rank,
        room_id: room.roomId,
        avatar_url: avatarUrl,
        name: name || canonicalAlias || aliases[0] || (0, _languageHandler._t)('Unnamed Room')
      });
    }); // Sort by rank ascending (a high rank being less relevant)

    const sortedResults = results.sort((a, b) => {
      return a.rank - b.rank;
    });

    this._processResults(sortedResults, query);

    this.setState({
      busy: false
    });
  }

  _doUserDirectorySearch(query) {
    this.setState({
      busy: true,
      query,
      searchError: null
    });

    _MatrixClientPeg.MatrixClientPeg.get().searchUserDirectory({
      term: query
    }).then(resp => {
      // The query might have changed since we sent the request, so ignore
      // responses for anything other than the latest query.
      if (this.state.query !== query) {
        return;
      }

      this._processResults(resp.results, query);
    }).catch(err => {
      console.error('Error whilst searching user directory: ', err);
      this.setState({
        searchError: err.errcode ? err.message : (0, _languageHandler._t)('Something went wrong!')
      });

      if (err.errcode === 'M_UNRECOGNIZED') {
        this.setState({
          serverSupportsUserDirectory: false
        }); // Do a local search immediately

        this._doLocalSearch(query);
      }
    }).then(() => {
      this.setState({
        busy: false
      });
    });
  }

  _doLocalSearch(query) {
    this.setState({
      query,
      searchError: null
    });
    const queryLowercase = query.toLowerCase();
    const results = [];

    _MatrixClientPeg.MatrixClientPeg.get().getUsers().forEach(user => {
      if (user.userId.toLowerCase().indexOf(queryLowercase) === -1 && user.displayName.toLowerCase().indexOf(queryLowercase) === -1) {
        return;
      } // Put results in the format of the new API


      results.push({
        user_id: user.userId,
        display_name: user.displayName,
        avatar_url: user.avatarUrl
      });
    });

    this._processResults(results, query);
  }

  _processResults(results, query) {
    const suggestedList = [];
    results.forEach(result => {
      if (result.room_id) {
        const client = _MatrixClientPeg.MatrixClientPeg.get();

        const room = client.getRoom(result.room_id);

        if (room) {
          const tombstone = room.currentState.getStateEvents('m.room.tombstone', '');

          if (tombstone && tombstone.getContent() && tombstone.getContent()["replacement_room"]) {
            const replacementRoom = client.getRoom(tombstone.getContent()["replacement_room"]); // Skip rooms with tombstones where we are also aware of the replacement room.

            if (replacementRoom) return;
          }
        }

        suggestedList.push({
          addressType: 'mx-room-id',
          address: result.room_id,
          displayName: result.name,
          avatarMxc: result.avatar_url,
          isKnown: true
        });
        return;
      }

      if (!this.props.includeSelf && result.user_id === _MatrixClientPeg.MatrixClientPeg.get().credentials.userId) {
        return;
      } // Return objects, structure of which is defined
      // by UserAddressType


      suggestedList.push({
        addressType: 'mx-user-id',
        address: result.user_id,
        displayName: result.display_name,
        avatarMxc: result.avatar_url,
        isKnown: true
      });
    }); // If the query is a valid address, add an entry for that
    // This is important, otherwise there's no way to invite
    // a perfectly valid address if there are close matches.

    const addrType = (0, _UserAddress.getAddressType)(query);

    if (this.state.validAddressTypes.includes(addrType)) {
      if (addrType === 'email' && !Email.looksValid(query)) {
        this.setState({
          searchError: (0, _languageHandler._t)("That doesn't look like a valid email address")
        });
        return;
      }

      suggestedList.unshift({
        addressType: addrType,
        address: query,
        isKnown: false
      });
      if (this._cancelThreepidLookup) this._cancelThreepidLookup();

      if (addrType === 'email') {
        this._lookupThreepid(addrType, query);
      }
    }

    this.setState({
      suggestedList,
      invalidAddressError: false
    }, () => {
      if (this.addressSelector) this.addressSelector.moveSelectionTop();
    });
  }

  _addAddressesToList(addressTexts) {
    const selectedList = this.state.selectedList.slice();
    let hasError = false;
    addressTexts.forEach(addressText => {
      addressText = addressText.trim();
      const addrType = (0, _UserAddress.getAddressType)(addressText);
      const addrObj = {
        addressType: addrType,
        address: addressText,
        isKnown: false
      };

      if (!this.state.validAddressTypes.includes(addrType)) {
        hasError = true;
      } else if (addrType === 'mx-user-id') {
        const user = _MatrixClientPeg.MatrixClientPeg.get().getUser(addrObj.address);

        if (user) {
          addrObj.displayName = user.displayName;
          addrObj.avatarMxc = user.avatarUrl;
          addrObj.isKnown = true;
        }
      } else if (addrType === 'mx-room-id') {
        const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(addrObj.address);

        if (room) {
          addrObj.displayName = room.name;
          addrObj.avatarMxc = room.avatarUrl;
          addrObj.isKnown = true;
        }
      }

      selectedList.push(addrObj);
    });
    this.setState({
      selectedList,
      suggestedList: [],
      query: "",
      invalidAddressError: hasError ? true : this.state.invalidAddressError
    });
    if (this._cancelThreepidLookup) this._cancelThreepidLookup();
    return hasError ? null : selectedList;
  }

  async _lookupThreepid(medium, address) {
    let cancelled = false; // Note that we can't safely remove this after we're done
    // because we don't know that it's the same one, so we just
    // leave it: it's replacing the old one each time so it's
    // not like they leak.

    this._cancelThreepidLookup = function () {
      cancelled = true;
    }; // wait a bit to let the user finish typing


    await (0, _promise.sleep)(500);
    if (cancelled) return null;

    try {
      const authClient = new _IdentityAuthClient.default();
      const identityAccessToken = await authClient.getAccessToken();
      if (cancelled) return null;
      const lookup = await _MatrixClientPeg.MatrixClientPeg.get().lookupThreePid(medium, address, undefined
      /* callback */
      , identityAccessToken);
      if (cancelled || lookup === null || !lookup.mxid) return null;
      const profile = await _MatrixClientPeg.MatrixClientPeg.get().getProfileInfo(lookup.mxid);
      if (cancelled || profile === null) return null;
      this.setState({
        suggestedList: [{
          // a UserAddressType
          addressType: medium,
          address: address,
          displayName: profile.displayname,
          avatarMxc: profile.avatar_url,
          isKnown: true
        }]
      });
    } catch (e) {
      console.error(e);
      this.setState({
        searchError: (0, _languageHandler._t)('Something went wrong!')
      });
    }
  }

  _getFilteredSuggestions() {
    // map addressType => set of addresses to avoid O(n*m) operation
    const selectedAddresses = {};
    this.state.selectedList.forEach(({
      address,
      addressType
    }) => {
      if (!selectedAddresses[addressType]) selectedAddresses[addressType] = new Set();
      selectedAddresses[addressType].add(address);
    }); // Filter out any addresses in the above already selected addresses (matching both type and address)

    return this.state.suggestedList.filter(({
      address,
      addressType
    }) => {
      return !(selectedAddresses[addressType] && selectedAddresses[addressType].has(address));
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    const AddressSelector = sdk.getComponent("elements.AddressSelector");
    this.scrollElement = null;
    let inputLabel;

    if (this.props.description) {
      inputLabel = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressPickerDialog_label"
      }, /*#__PURE__*/_react.default.createElement("label", {
        htmlFor: "textinput"
      }, this.props.description));
    }

    const query = []; // create the invite list

    if (this.state.selectedList.length > 0) {
      const AddressTile = sdk.getComponent("elements.AddressTile");

      for (let i = 0; i < this.state.selectedList.length; i++) {
        query.push( /*#__PURE__*/_react.default.createElement(AddressTile, {
          key: i,
          address: this.state.selectedList[i],
          canDismiss: true,
          onDismissed: this.onDismissed(i),
          showAddress: this.props.pickerType === 'user'
        }));
      }
    } // Add the query at the end


    query.push( /*#__PURE__*/_react.default.createElement("textarea", {
      key: this.state.selectedList.length,
      onPaste: this._onPaste,
      rows: "1",
      id: "textinput",
      ref: this._textinput,
      className: "mx_AddressPickerDialog_input",
      onChange: this.onQueryChanged,
      placeholder: this.getPlaceholder(),
      defaultValue: this.props.value,
      autoFocus: this.props.focus
    }));

    const filteredSuggestedList = this._getFilteredSuggestions();

    let error;
    let addressSelector;

    if (this.state.invalidAddressError) {
      const validTypeDescriptions = this.state.validAddressTypes.map(t => (0, _languageHandler._t)(addressTypeName[t]));
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressPickerDialog_error"
      }, (0, _languageHandler._t)("You have entered an invalid address."), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Try using one of the following valid address types: %(validTypesList)s.", {
        validTypesList: validTypeDescriptions.join(", ")
      }));
    } else if (this.state.searchError) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressPickerDialog_error"
      }, this.state.searchError);
    } else if (this.state.query.length > 0 && filteredSuggestedList.length === 0 && !this.state.busy) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressPickerDialog_error"
      }, (0, _languageHandler._t)("No results"));
    } else {
      addressSelector = /*#__PURE__*/_react.default.createElement(AddressSelector, {
        ref: ref => {
          this.addressSelector = ref;
        },
        addressList: filteredSuggestedList,
        showAddress: this.props.pickerType === 'user',
        onSelected: this.onSelected,
        truncateAt: TRUNCATE_QUERY_LIST
      });
    }

    let identityServer; // If picker cannot currently accept e-mail but should be able to

    if (this.props.pickerType === 'user' && !this.state.validAddressTypes.includes('email') && this.props.validAddressTypes.includes('email')) {
      const defaultIdentityServerUrl = (0, _IdentityServerUtils.getDefaultIdentityServerUrl)();

      if (defaultIdentityServerUrl) {
        identityServer = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_AddressPickerDialog_identityServer"
        }, (0, _languageHandler._t)("Use an identity server to invite by email. " + "<default>Use the default (%(defaultIdentityServerName)s)</default> " + "or manage in <settings>Settings</settings>.", {
          defaultIdentityServerName: (0, _UrlUtils.abbreviateUrl)(defaultIdentityServerUrl)
        }, {
          default: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: "#",
            onClick: this.onUseDefaultIdentityServerClick
          }, sub),
          settings: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: "#",
            onClick: this.onManageSettingsClick
          }, sub)
        }));
      } else {
        identityServer = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_AddressPickerDialog_identityServer"
        }, (0, _languageHandler._t)("Use an identity server to invite by email. " + "Manage in <settings>Settings</settings>.", {}, {
          settings: sub => /*#__PURE__*/_react.default.createElement("a", {
            href: "#",
            onClick: this.onManageSettingsClick
          }, sub)
        }));
      }
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_AddressPickerDialog",
      onKeyDown: this.onKeyDown,
      onFinished: this.props.onFinished,
      title: this.props.title
    }, inputLabel, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AddressPickerDialog_inputContainer"
    }, query), error, addressSelector, this.props.extraNode, identityServer), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: this.props.button,
      onPrimaryButtonClick: this.onButtonClick,
      onCancel: this.onCancel
    }));
  }

}

exports.default = AddressPickerDialog;
(0, _defineProperty2.default)(AddressPickerDialog, "propTypes", {
  title: _propTypes.default.string.isRequired,
  description: _propTypes.default.node,
  // Extra node inserted after picker input, dropdown and errors
  extraNode: _propTypes.default.node,
  value: _propTypes.default.string,
  placeholder: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.func]),
  roomId: _propTypes.default.string,
  button: _propTypes.default.string,
  focus: _propTypes.default.bool,
  validAddressTypes: _propTypes.default.arrayOf(_propTypes.default.oneOf(_UserAddress.addressTypes)),
  onFinished: _propTypes.default.func.isRequired,
  groupId: _propTypes.default.string,
  // The type of entity to search for. Default: 'user'.
  pickerType: _propTypes.default.oneOf(['user', 'room']),
  // Whether the current user should be included in the addresses returned. Only
  // applicable when pickerType is `user`. Default: false.
  includeSelf: _propTypes.default.bool
});
(0, _defineProperty2.default)(AddressPickerDialog, "defaultProps", {
  value: "",
  focus: true,
  validAddressTypes: _UserAddress.addressTypes,
  pickerType: 'user',
  includeSelf: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQWRkcmVzc1BpY2tlckRpYWxvZy5qcyJdLCJuYW1lcyI6WyJUUlVOQ0FURV9RVUVSWV9MSVNUIiwiUVVFUllfVVNFUl9ESVJFQ1RPUllfREVCT1VOQ0VfTVMiLCJhZGRyZXNzVHlwZU5hbWUiLCJBZGRyZXNzUGlja2VyRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2VsZWN0ZWRMaXN0Iiwic3RhdGUiLCJzbGljZSIsIl90ZXh0aW5wdXQiLCJjdXJyZW50IiwidmFsdWUiLCJfYWRkQWRkcmVzc2VzVG9MaXN0Iiwib25GaW5pc2hlZCIsImUiLCJ0ZXh0SW5wdXQiLCJ1bmRlZmluZWQiLCJrZXkiLCJLZXkiLCJFU0NBUEUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkFSUk9XX1VQIiwiYWRkcmVzc1NlbGVjdG9yIiwibW92ZVNlbGVjdGlvblVwIiwiQVJST1dfRE9XTiIsIm1vdmVTZWxlY3Rpb25Eb3duIiwic3VnZ2VzdGVkTGlzdCIsImxlbmd0aCIsIkNPTU1BIiwiRU5URVIiLCJUQUIiLCJpbmNsdWRlcyIsImNob29zZVNlbGVjdGlvbiIsIkJBQ0tTUEFDRSIsIm9uRGlzbWlzc2VkIiwib25CdXR0b25DbGljayIsImV2IiwicXVlcnkiLCJ0YXJnZXQiLCJxdWVyeUNoYW5nZWREZWJvdW5jZXIiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwicGlja2VyVHlwZSIsImdyb3VwSWQiLCJfZG9OYWl2ZUdyb3VwU2VhcmNoIiwic2VydmVyU3VwcG9ydHNVc2VyRGlyZWN0b3J5IiwiX2RvVXNlckRpcmVjdG9yeVNlYXJjaCIsIl9kb0xvY2FsU2VhcmNoIiwiX2RvTmFpdmVHcm91cFJvb21TZWFyY2giLCJfZG9Sb29tU2VhcmNoIiwiY29uc29sZSIsImVycm9yIiwic2V0U3RhdGUiLCJzZWFyY2hFcnJvciIsImluZGV4Iiwic3BsaWNlIiwiX2NhbmNlbFRocmVlcGlkTG9va3VwIiwib25TZWxlY3RlZCIsInB1c2giLCJfZ2V0RmlsdGVyZWRTdWdnZXN0aW9ucyIsInRleHQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsInNwbGl0IiwidmFsaWRBZGRyZXNzVHlwZXMiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsIm9uQ2FuY2VsIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJmaWx0ZXIiLCJ0eXBlIiwiaW52YWxpZEFkZHJlc3NFcnJvciIsImJ1c3kiLCJjb21wb25lbnREaWRNb3VudCIsImZvY3VzIiwiZ2V0UGxhY2Vob2xkZXIiLCJwbGFjZWhvbGRlciIsImxvd2VyQ2FzZVF1ZXJ5IiwidG9Mb3dlckNhc2UiLCJnZXRHcm91cFVzZXJzIiwidGhlbiIsInJlc3AiLCJyZXN1bHRzIiwiY2h1bmsiLCJmb3JFYWNoIiwidSIsInVzZXJJZE1hdGNoIiwidXNlcl9pZCIsImRpc3BsYXlOYW1lTWF0Y2giLCJkaXNwbGF5bmFtZSIsImF2YXRhcl91cmwiLCJkaXNwbGF5X25hbWUiLCJfcHJvY2Vzc1Jlc3VsdHMiLCJjYXRjaCIsImVyciIsImVycmNvZGUiLCJtZXNzYWdlIiwiR3JvdXBTdG9yZSIsImdldEdyb3VwUm9vbXMiLCJyIiwibmFtZU1hdGNoIiwibmFtZSIsInRvcGljTWF0Y2giLCJ0b3BpYyIsImFsaWFzTWF0Y2giLCJjYW5vbmljYWxfYWxpYXMiLCJyb29tX2lkIiwicm9vbXMiLCJnZXRSb29tcyIsInJvb20iLCJyYW5rIiwiSW5maW5pdHkiLCJuYW1lRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJjYW5vbmljYWxBbGlhcyIsImdldENhbm9uaWNhbEFsaWFzIiwiYWxpYXNFdmVudHMiLCJhbGlhc2VzIiwibWFwIiwicmVkdWNlIiwiYSIsImIiLCJjb25jYXQiLCJzaG9ydGVzdE1hdGNoaW5nQWxpYXNMZW5ndGgiLCJhbGlhcyIsImF2YXRhckV2ZW50IiwiYXZhdGFyVXJsIiwidXJsIiwicm9vbUlkIiwic29ydGVkUmVzdWx0cyIsInNvcnQiLCJzZWFyY2hVc2VyRGlyZWN0b3J5IiwidGVybSIsInF1ZXJ5TG93ZXJjYXNlIiwiZ2V0VXNlcnMiLCJ1c2VyIiwidXNlcklkIiwiaW5kZXhPZiIsImRpc3BsYXlOYW1lIiwicmVzdWx0IiwiY2xpZW50IiwiZ2V0Um9vbSIsInRvbWJzdG9uZSIsInJlcGxhY2VtZW50Um9vbSIsImFkZHJlc3NUeXBlIiwiYWRkcmVzcyIsImF2YXRhck14YyIsImlzS25vd24iLCJpbmNsdWRlU2VsZiIsImNyZWRlbnRpYWxzIiwiYWRkclR5cGUiLCJFbWFpbCIsImxvb2tzVmFsaWQiLCJ1bnNoaWZ0IiwiX2xvb2t1cFRocmVlcGlkIiwibW92ZVNlbGVjdGlvblRvcCIsImFkZHJlc3NUZXh0cyIsImhhc0Vycm9yIiwiYWRkcmVzc1RleHQiLCJ0cmltIiwiYWRkck9iaiIsImdldFVzZXIiLCJtZWRpdW0iLCJjYW5jZWxsZWQiLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiaWRlbnRpdHlBY2Nlc3NUb2tlbiIsImdldEFjY2Vzc1Rva2VuIiwibG9va3VwIiwibG9va3VwVGhyZWVQaWQiLCJteGlkIiwicHJvZmlsZSIsImdldFByb2ZpbGVJbmZvIiwic2VsZWN0ZWRBZGRyZXNzZXMiLCJTZXQiLCJhZGQiLCJoYXMiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsIkFkZHJlc3NTZWxlY3RvciIsInNjcm9sbEVsZW1lbnQiLCJpbnB1dExhYmVsIiwiZGVzY3JpcHRpb24iLCJBZGRyZXNzVGlsZSIsImkiLCJfb25QYXN0ZSIsIm9uUXVlcnlDaGFuZ2VkIiwiZmlsdGVyZWRTdWdnZXN0ZWRMaXN0IiwidmFsaWRUeXBlRGVzY3JpcHRpb25zIiwidCIsInZhbGlkVHlwZXNMaXN0Iiwiam9pbiIsInJlZiIsImlkZW50aXR5U2VydmVyIiwiZGVmYXVsdElkZW50aXR5U2VydmVyVXJsIiwiZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZSIsImRlZmF1bHQiLCJzdWIiLCJvblVzZURlZmF1bHRJZGVudGl0eVNlcnZlckNsaWNrIiwic2V0dGluZ3MiLCJvbk1hbmFnZVNldHRpbmdzQ2xpY2siLCJvbktleURvd24iLCJ0aXRsZSIsImV4dHJhTm9kZSIsImJ1dHRvbiIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJub2RlIiwib25lT2ZUeXBlIiwiZnVuYyIsImJvb2wiLCJhcnJheU9mIiwib25lT2YiLCJhZGRyZXNzVHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW1CQSxNQUFNQSxtQkFBbUIsR0FBRyxFQUE1QjtBQUNBLE1BQU1DLGdDQUFnQyxHQUFHLEdBQXpDO0FBRUEsTUFBTUMsZUFBZSxHQUFHO0FBQ3BCLGdCQUFjLDBCQUFJLFdBQUosQ0FETTtBQUVwQixnQkFBYywwQkFBSSxnQkFBSixDQUZNO0FBR3BCLFdBQVMsMEJBQUksZUFBSjtBQUhXLENBQXhCOztBQU9lLE1BQU1DLG1CQUFOLFNBQWtDQyxlQUFNQyxTQUF4QyxDQUFrRDtBQTZCN0RDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHlEQWtESCxNQUFNO0FBQ2xCLFVBQUlDLFlBQVksR0FBRyxLQUFLQyxLQUFMLENBQVdELFlBQVgsQ0FBd0JFLEtBQXhCLEVBQW5CLENBRGtCLENBRWxCO0FBQ0E7O0FBQ0EsVUFBSSxLQUFLQyxVQUFMLENBQWdCQyxPQUFo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QkFBVUMsTUFSSDtBQVNmekksRUFBQUEsS0FBSyxFQUFFd0ksbUJBQVVNLElBVEY7QUFVZjVKLEVBQUFBLGlCQUFpQixFQUFFc0osbUJBQVVPLE9BQVYsQ0FBa0JQLG1CQUFVUSxLQUFWLENBQWdCQyx5QkFBaEIsQ0FBbEIsQ0FWSjtBQVdmbk4sRUFBQUEsVUFBVSxFQUFFME0sbUJBQVVLLElBQVYsQ0FBZUgsVUFYWjtBQVlmN0ssRUFBQUEsT0FBTyxFQUFFMkssbUJBQVVDLE1BWko7QUFhZjtBQUNBN0ssRUFBQUEsVUFBVSxFQUFFNEssbUJBQVVRLEtBQVYsQ0FBZ0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFoQixDQWRHO0FBZWY7QUFDQTtBQUNBcEUsRUFBQUEsV0FBVyxFQUFFNEQsbUJBQVVNO0FBakJSLEM7OEJBREY1TixtQixrQkFxQks7QUFDbEJVLEVBQUFBLEtBQUssRUFBRSxFQURXO0FBRWxCb0UsRUFBQUEsS0FBSyxFQUFFLElBRlc7QUFHbEJkLEVBQUFBLGlCQUFpQixFQUFFK0oseUJBSEQ7QUFJbEJyTCxFQUFBQSxVQUFVLEVBQUUsTUFKTTtBQUtsQmdILEVBQUFBLFdBQVcsRUFBRTtBQUxLLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IGFkZHJlc3NUeXBlcywgZ2V0QWRkcmVzc1R5cGUgfSBmcm9tICcuLi8uLi8uLi9Vc2VyQWRkcmVzcy5qcyc7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvR3JvdXBTdG9yZSc7XG5pbXBvcnQgKiBhcyBFbWFpbCBmcm9tICcuLi8uLi8uLi9lbWFpbCc7XG5pbXBvcnQgSWRlbnRpdHlBdXRoQ2xpZW50IGZyb20gJy4uLy4uLy4uL0lkZW50aXR5QXV0aENsaWVudCc7XG5pbXBvcnQgeyBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwsIHVzZURlZmF1bHRJZGVudGl0eVNlcnZlciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0lkZW50aXR5U2VydmVyVXRpbHMnO1xuaW1wb3J0IHsgYWJicmV2aWF0ZVVybCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL1VybFV0aWxzJztcbmltcG9ydCB7c2xlZXB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuXG5jb25zdCBUUlVOQ0FURV9RVUVSWV9MSVNUID0gNDA7XG5jb25zdCBRVUVSWV9VU0VSX0RJUkVDVE9SWV9ERUJPVU5DRV9NUyA9IDIwMDtcblxuY29uc3QgYWRkcmVzc1R5cGVOYW1lID0ge1xuICAgICdteC11c2VyLWlkJzogX3RkKFwiTWF0cml4IElEXCIpLFxuICAgICdteC1yb29tLWlkJzogX3RkKFwiTWF0cml4IFJvb20gSURcIiksXG4gICAgJ2VtYWlsJzogX3RkKFwiZW1haWwgYWRkcmVzc1wiKSxcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWRkcmVzc1BpY2tlckRpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgZGVzY3JpcHRpb246IFByb3BUeXBlcy5ub2RlLFxuICAgICAgICAvLyBFeHRyYSBub2RlIGluc2VydGVkIGFmdGVyIHBpY2tlciBpbnB1dCwgZHJvcGRvd24gYW5kIGVycm9yc1xuICAgICAgICBleHRyYU5vZGU6IFByb3BUeXBlcy5ub2RlLFxuICAgICAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgICAgIHJvb21JZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgYnV0dG9uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBmb2N1czogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIHZhbGlkQWRkcmVzc1R5cGVzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub25lT2YoYWRkcmVzc1R5cGVzKSksXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIC8vIFRoZSB0eXBlIG9mIGVudGl0eSB0byBzZWFyY2ggZm9yLiBEZWZhdWx0OiAndXNlcicuXG4gICAgICAgIHBpY2tlclR5cGU6IFByb3BUeXBlcy5vbmVPZihbJ3VzZXInLCAncm9vbSddKSxcbiAgICAgICAgLy8gV2hldGhlciB0aGUgY3VycmVudCB1c2VyIHNob3VsZCBiZSBpbmNsdWRlZCBpbiB0aGUgYWRkcmVzc2VzIHJldHVybmVkLiBPbmx5XG4gICAgICAgIC8vIGFwcGxpY2FibGUgd2hlbiBwaWNrZXJUeXBlIGlzIGB1c2VyYC4gRGVmYXVsdDogZmFsc2UuXG4gICAgICAgIGluY2x1ZGVTZWxmOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgdmFsdWU6IFwiXCIsXG4gICAgICAgIGZvY3VzOiB0cnVlLFxuICAgICAgICB2YWxpZEFkZHJlc3NUeXBlczogYWRkcmVzc1R5cGVzLFxuICAgICAgICBwaWNrZXJUeXBlOiAndXNlcicsXG4gICAgICAgIGluY2x1ZGVTZWxmOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuX3RleHRpbnB1dCA9IGNyZWF0ZVJlZigpO1xuXG4gICAgICAgIGxldCB2YWxpZEFkZHJlc3NUeXBlcyA9IHRoaXMucHJvcHMudmFsaWRBZGRyZXNzVHlwZXM7XG4gICAgICAgIC8vIFJlbW92ZSBlbWFpbCBmcm9tIHZhbGlkQWRkcmVzc1R5cGVzIGlmIG5vIElTIGlzIGNvbmZpZ3VyZWQuIEl0IG1heSBiZSBhZGRlZCBhdCBhIGxhdGVyIHN0YWdlIGJ5IHRoZSB1c2VyXG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCkgJiYgdmFsaWRBZGRyZXNzVHlwZXMuaW5jbHVkZXMoXCJlbWFpbFwiKSkge1xuICAgICAgICAgICAgdmFsaWRBZGRyZXNzVHlwZXMgPSB2YWxpZEFkZHJlc3NUeXBlcy5maWx0ZXIodHlwZSA9PiB0eXBlICE9PSBcImVtYWlsXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdG8gc2hvdyBhbiBlcnJvciBtZXNzYWdlIGJlY2F1c2Ugb2YgYW4gaW52YWxpZCBhZGRyZXNzXG4gICAgICAgICAgICBpbnZhbGlkQWRkcmVzc0Vycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIC8vIExpc3Qgb2YgVXNlckFkZHJlc3NUeXBlIG9iamVjdHMgcmVwcmVzZW50aW5nXG4gICAgICAgICAgICAvLyB0aGUgbGlzdCBvZiBhZGRyZXNzZXMgd2UncmUgZ29pbmcgdG8gaW52aXRlXG4gICAgICAgICAgICBzZWxlY3RlZExpc3Q6IFtdLFxuICAgICAgICAgICAgLy8gV2hldGhlciBhIHNlYXJjaCBpcyBvbmdvaW5nXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIC8vIEFuIGVycm9yIG1lc3NhZ2UgZ2VuZXJhdGVkIGR1cmluZyB0aGUgdXNlciBkaXJlY3Rvcnkgc2VhcmNoXG4gICAgICAgICAgICBzZWFyY2hFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdGhlIHNlcnZlciBzdXBwb3J0cyB0aGUgdXNlcl9kaXJlY3RvcnkgQVBJXG4gICAgICAgICAgICBzZXJ2ZXJTdXBwb3J0c1VzZXJEaXJlY3Rvcnk6IHRydWUsXG4gICAgICAgICAgICAvLyBUaGUgcXVlcnkgYmVpbmcgc2VhcmNoZWQgZm9yXG4gICAgICAgICAgICBxdWVyeTogXCJcIixcbiAgICAgICAgICAgIC8vIExpc3Qgb2YgVXNlckFkZHJlc3NUeXBlIG9iamVjdHMgcmVwcmVzZW50aW5nIHRoZSBzZXQgb2ZcbiAgICAgICAgICAgIC8vIGF1dG8tY29tcGxldGlvbiByZXN1bHRzIGZvciB0aGUgY3VycmVudCBzZWFyY2ggcXVlcnkuXG4gICAgICAgICAgICBzdWdnZXN0ZWRMaXN0OiBbXSxcbiAgICAgICAgICAgIC8vIExpc3Qgb2YgYWRkcmVzcyB0eXBlcyBpbml0aWFsaXNlZCBmcm9tIHByb3BzLCBidXQgbWF5IGNoYW5nZSB3aGlsZSB0aGVcbiAgICAgICAgICAgIC8vIGRpYWxvZyBpcyBvcGVuIGFuZCByZXByZXNlbnRzIHRoZSBzdXBwb3J0ZWQgbGlzdCBvZiBhZGRyZXNzIHR5cGVzIGF0IHRoaXMgdGltZS5cbiAgICAgICAgICAgIHZhbGlkQWRkcmVzc1R5cGVzLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5mb2N1cykge1xuICAgICAgICAgICAgLy8gU2V0IHRoZSBjdXJzb3IgYXQgdGhlIGVuZCBvZiB0aGUgdGV4dCBpbnB1dFxuICAgICAgICAgICAgdGhpcy5fdGV4dGlucHV0LmN1cnJlbnQudmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UGxhY2Vob2xkZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgcGxhY2Vob2xkZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmICh0eXBlb2YgcGxhY2Vob2xkZXIgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBwbGFjZWhvbGRlcjtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UgaXQncyBhIGZ1bmN0aW9uLCBhcyBjaGVja2VkIGJ5IHByb3AgdHlwZXMuXG4gICAgICAgIHJldHVybiBwbGFjZWhvbGRlcih0aGlzLnN0YXRlLnZhbGlkQWRkcmVzc1R5cGVzKTtcbiAgICB9XG5cbiAgICBvbkJ1dHRvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICBsZXQgc2VsZWN0ZWRMaXN0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZExpc3Quc2xpY2UoKTtcbiAgICAgICAgLy8gQ2hlY2sgdGhlIHRleHQgaW5wdXQgZmllbGQgdG8gc2VlIGlmIHVzZXIgaGFzIGFuIHVuY29udmVydGVkIGFkZHJlc3NcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYW5kIGl0J3MgdmFsaWQgYWRkIGl0IHRvIHRoZSBsb2NhbCBzZWxlY3RlZExpc3RcbiAgICAgICAgaWYgKHRoaXMuX3RleHRpbnB1dC5jdXJyZW50LnZhbHVlICE9PSAnJykge1xuICAgICAgICAgICAgc2VsZWN0ZWRMaXN0ID0gdGhpcy5fYWRkQWRkcmVzc2VzVG9MaXN0KFt0aGlzLl90ZXh0aW5wdXQuY3VycmVudC52YWx1ZV0pO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkTGlzdCA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlLCBzZWxlY3RlZExpc3QpO1xuICAgIH07XG5cbiAgICBvbkNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgb25LZXlEb3duID0gZSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRJbnB1dCA9IHRoaXMuX3RleHRpbnB1dC5jdXJyZW50ID8gdGhpcy5fdGV4dGlucHV0LmN1cnJlbnQudmFsdWUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKGUua2V5ID09PSBLZXkuRVNDQVBFKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gS2V5LkFSUk9XX1VQKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWRkcmVzc1NlbGVjdG9yKSB0aGlzLmFkZHJlc3NTZWxlY3Rvci5tb3ZlU2VsZWN0aW9uVXAoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gS2V5LkFSUk9XX0RPV04pIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5hZGRyZXNzU2VsZWN0b3IpIHRoaXMuYWRkcmVzc1NlbGVjdG9yLm1vdmVTZWxlY3Rpb25Eb3duKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zdWdnZXN0ZWRMaXN0Lmxlbmd0aCA+IDAgJiYgW0tleS5DT01NQSwgS2V5LkVOVEVSLCBLZXkuVEFCXS5pbmNsdWRlcyhlLmtleSkpIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5hZGRyZXNzU2VsZWN0b3IpIHRoaXMuYWRkcmVzc1NlbGVjdG9yLmNob29zZVNlbGVjdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHRJbnB1dC5sZW5ndGggPT09IDAgJiYgdGhpcy5zdGF0ZS5zZWxlY3RlZExpc3QubGVuZ3RoICYmIGUua2V5ID09PSBLZXkuQkFDS1NQQUNFKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5vbkRpc21pc3NlZCh0aGlzLnN0YXRlLnNlbGVjdGVkTGlzdC5sZW5ndGggLSAxKSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5ID09PSBLZXkuRU5URVIpIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGV4dElucHV0ID09PSAnJykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlJ3Mgbm90aGluZyBpbiB0aGUgaW5wdXQgYm94LCBzdWJtaXQgdGhlIGZvcm1cbiAgICAgICAgICAgICAgICB0aGlzLm9uQnV0dG9uQ2xpY2soKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkQWRkcmVzc2VzVG9MaXN0KFt0ZXh0SW5wdXRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0ZXh0SW5wdXQgJiYgKGUua2V5ID09PSBLZXkuQ09NTUEgfHwgZS5rZXkgPT09IEtleS5UQUIpKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5fYWRkQWRkcmVzc2VzVG9MaXN0KFt0ZXh0SW5wdXRdKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblF1ZXJ5Q2hhbmdlZCA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgcXVlcnkgPSBldi50YXJnZXQudmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnF1ZXJ5Q2hhbmdlZERlYm91bmNlcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucXVlcnlDaGFuZ2VkRGVib3VuY2VyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IGRvIHNlYXJjaCBpZiB0aGVyZSBpcyBzb21ldGhpbmcgdG8gc2VhcmNoXG4gICAgICAgIGlmIChxdWVyeS5sZW5ndGggPiAwICYmIHF1ZXJ5ICE9PSAnQCcgJiYgcXVlcnkubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlDaGFuZ2VkRGVib3VuY2VyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMucGlja2VyVHlwZSA9PT0gJ3VzZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmdyb3VwSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvTmFpdmVHcm91cFNlYXJjaChxdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZXJ2ZXJTdXBwb3J0c1VzZXJEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvVXNlckRpcmVjdG9yeVNlYXJjaChxdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb0xvY2FsU2VhcmNoKHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5waWNrZXJUeXBlID09PSAncm9vbScpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZ3JvdXBJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZG9OYWl2ZUdyb3VwUm9vbVNlYXJjaChxdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb1Jvb21TZWFyY2gocXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5rbm93biBwaWNrZXJUeXBlJywgdGhpcy5wcm9wcy5waWNrZXJUeXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBRVUVSWV9VU0VSX0RJUkVDVE9SWV9ERUJPVU5DRV9NUyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0ZWRMaXN0OiBbXSxcbiAgICAgICAgICAgICAgICBxdWVyeTogXCJcIixcbiAgICAgICAgICAgICAgICBzZWFyY2hFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uRGlzbWlzc2VkID0gaW5kZXggPT4gKCkgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3RlZExpc3QgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTGlzdC5zbGljZSgpO1xuICAgICAgICBzZWxlY3RlZExpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZExpc3QsXG4gICAgICAgICAgICBzdWdnZXN0ZWRMaXN0OiBbXSxcbiAgICAgICAgICAgIHF1ZXJ5OiBcIlwiLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuX2NhbmNlbFRocmVlcGlkTG9va3VwKSB0aGlzLl9jYW5jZWxUaHJlZXBpZExvb2t1cCgpO1xuICAgIH07XG5cbiAgICBvbkNsaWNrID0gaW5kZXggPT4gKCkgPT4ge1xuICAgICAgICB0aGlzLm9uU2VsZWN0ZWQoaW5kZXgpO1xuICAgIH07XG5cbiAgICBvblNlbGVjdGVkID0gaW5kZXggPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3RlZExpc3QgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTGlzdC5zbGljZSgpO1xuICAgICAgICBzZWxlY3RlZExpc3QucHVzaCh0aGlzLl9nZXRGaWx0ZXJlZFN1Z2dlc3Rpb25zKClbaW5kZXhdKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZExpc3QsXG4gICAgICAgICAgICBzdWdnZXN0ZWRMaXN0OiBbXSxcbiAgICAgICAgICAgIHF1ZXJ5OiBcIlwiLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuX2NhbmNlbFRocmVlcGlkTG9va3VwKSB0aGlzLl9jYW5jZWxUaHJlZXBpZExvb2t1cCgpO1xuICAgIH07XG5cbiAgICBfZG9OYWl2ZUdyb3VwU2VhcmNoKHF1ZXJ5KSB7XG4gICAgICAgIGNvbnN0IGxvd2VyQ2FzZVF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiB0cnVlLFxuICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICBzZWFyY2hFcnJvcjogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRHcm91cFVzZXJzKHRoaXMucHJvcHMuZ3JvdXBJZCkudGhlbigocmVzcCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgcmVzcC5jaHVuay5mb3JFYWNoKCh1KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkTWF0Y2ggPSB1LnVzZXJfaWQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlckNhc2VRdWVyeSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxheU5hbWVNYXRjaCA9ICh1LmRpc3BsYXluYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyQ2FzZVF1ZXJ5KTtcbiAgICAgICAgICAgICAgICBpZiAoISh1c2VySWRNYXRjaCB8fCBkaXNwbGF5TmFtZU1hdGNoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IHUudXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogdS5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IHUuZGlzcGxheW5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlc3VsdHMsIHF1ZXJ5KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbHN0IHNlYXJjaGluZyBncm91cCByb29tczogJywgZXJyKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlYXJjaEVycm9yOiBlcnIuZXJyY29kZSA/IGVyci5tZXNzYWdlIDogX3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIScpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2RvTmFpdmVHcm91cFJvb21TZWFyY2gocXVlcnkpIHtcbiAgICAgICAgY29uc3QgbG93ZXJDYXNlUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIEdyb3VwU3RvcmUuZ2V0R3JvdXBSb29tcyh0aGlzLnByb3BzLmdyb3VwSWQpLmZvckVhY2goKHIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IChyLm5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJDYXNlUXVlcnkpO1xuICAgICAgICAgICAgY29uc3QgdG9waWNNYXRjaCA9IChyLnRvcGljIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyQ2FzZVF1ZXJ5KTtcbiAgICAgICAgICAgIGNvbnN0IGFsaWFzTWF0Y2ggPSAoci5jYW5vbmljYWxfYWxpYXMgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJDYXNlUXVlcnkpO1xuICAgICAgICAgICAgaWYgKCEobmFtZU1hdGNoIHx8IHRvcGljTWF0Y2ggfHwgYWxpYXNNYXRjaCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHJvb21faWQ6IHIucm9vbV9pZCxcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiByLmF2YXRhcl91cmwsXG4gICAgICAgICAgICAgICAgbmFtZTogci5uYW1lIHx8IHIuY2Fub25pY2FsX2FsaWFzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXN1bHRzLCBxdWVyeSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9kb1Jvb21TZWFyY2gocXVlcnkpIHtcbiAgICAgICAgY29uc3QgbG93ZXJDYXNlUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCByb29tcyA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tcygpO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIHJvb21zLmZvckVhY2goKHJvb20pID0+IHtcbiAgICAgICAgICAgIGxldCByYW5rID0gSW5maW5pdHk7XG4gICAgICAgICAgICBjb25zdCBuYW1lRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLm5hbWUnLCAnJyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gbmFtZUV2ZW50ID8gbmFtZUV2ZW50LmdldENvbnRlbnQoKS5uYW1lIDogJyc7XG4gICAgICAgICAgICBjb25zdCBjYW5vbmljYWxBbGlhcyA9IHJvb20uZ2V0Q2Fub25pY2FsQWxpYXMoKTtcbiAgICAgICAgICAgIGNvbnN0IGFsaWFzRXZlbnRzID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5hbGlhc2VzJyk7XG4gICAgICAgICAgICBjb25zdCBhbGlhc2VzID0gYWxpYXNFdmVudHMubWFwKChldikgPT4gZXYuZ2V0Q29udGVudCgpLmFsaWFzZXMpLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmNvbmNhdChiKTtcbiAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgY29uc3QgbmFtZU1hdGNoID0gKG5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJDYXNlUXVlcnkpO1xuICAgICAgICAgICAgbGV0IGFsaWFzTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBzaG9ydGVzdE1hdGNoaW5nQWxpYXNMZW5ndGggPSBJbmZpbml0eTtcbiAgICAgICAgICAgIGFsaWFzZXMuZm9yRWFjaCgoYWxpYXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoKGFsaWFzIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyQ2FzZVF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBhbGlhc01hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3J0ZXN0TWF0Y2hpbmdBbGlhc0xlbmd0aCA+IGFsaWFzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnRlc3RNYXRjaGluZ0FsaWFzTGVuZ3RoID0gYWxpYXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghKG5hbWVNYXRjaCB8fCBhbGlhc01hdGNoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFsaWFzTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAvLyBBIHNob3J0ZXIgbWF0Y2hpbmcgYWxpYXMgd2lsbCBnaXZlIGEgYmV0dGVyIHJhbmtcbiAgICAgICAgICAgICAgICByYW5rID0gc2hvcnRlc3RNYXRjaGluZ0FsaWFzTGVuZ3RoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBhdmF0YXJFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20uYXZhdGFyJywgJycpO1xuICAgICAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gYXZhdGFyRXZlbnQgPyBhdmF0YXJFdmVudC5nZXRDb250ZW50KCkudXJsIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHJhbmssXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgYXZhdGFyX3VybDogYXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgY2Fub25pY2FsQWxpYXMgfHwgYWxpYXNlc1swXSB8fCBfdCgnVW5uYW1lZCBSb29tJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU29ydCBieSByYW5rIGFzY2VuZGluZyAoYSBoaWdoIHJhbmsgYmVpbmcgbGVzcyByZWxldmFudClcbiAgICAgICAgY29uc3Qgc29ydGVkUmVzdWx0cyA9IHJlc3VsdHMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEucmFuayAtIGIucmFuaztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMoc29ydGVkUmVzdWx0cywgcXVlcnkpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZG9Vc2VyRGlyZWN0b3J5U2VhcmNoKHF1ZXJ5KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogdHJ1ZSxcbiAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgc2VhcmNoRXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VhcmNoVXNlckRpcmVjdG9yeSh7XG4gICAgICAgICAgICB0ZXJtOiBxdWVyeSxcbiAgICAgICAgfSkudGhlbigocmVzcCkgPT4ge1xuICAgICAgICAgICAgLy8gVGhlIHF1ZXJ5IG1pZ2h0IGhhdmUgY2hhbmdlZCBzaW5jZSB3ZSBzZW50IHRoZSByZXF1ZXN0LCBzbyBpZ25vcmVcbiAgICAgICAgICAgIC8vIHJlc3BvbnNlcyBmb3IgYW55dGhpbmcgb3RoZXIgdGhhbiB0aGUgbGF0ZXN0IHF1ZXJ5LlxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUucXVlcnkgIT09IHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzcC5yZXN1bHRzLCBxdWVyeSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxzdCBzZWFyY2hpbmcgdXNlciBkaXJlY3Rvcnk6ICcsIGVycik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWFyY2hFcnJvcjogZXJyLmVycmNvZGUgPyBlcnIubWVzc2FnZSA6IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZyEnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09PSAnTV9VTlJFQ09HTklaRUQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlclN1cHBvcnRzVXNlckRpcmVjdG9yeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gRG8gYSBsb2NhbCBzZWFyY2ggaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgICB0aGlzLl9kb0xvY2FsU2VhcmNoKHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZG9Mb2NhbFNlYXJjaChxdWVyeSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgc2VhcmNoRXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBxdWVyeUxvd2VyY2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJzKCkuZm9yRWFjaCgodXNlcikgPT4ge1xuICAgICAgICAgICAgaWYgKHVzZXIudXNlcklkLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyY2FzZSkgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgdXNlci5kaXNwbGF5TmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlcmNhc2UpID09PSAtMVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQdXQgcmVzdWx0cyBpbiB0aGUgZm9ybWF0IG9mIHRoZSBuZXcgQVBJXG4gICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHVzZXJfaWQ6IHVzZXIudXNlcklkLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlfbmFtZTogdXNlci5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiB1c2VyLmF2YXRhclVybCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzdWx0cywgcXVlcnkpO1xuICAgIH1cblxuICAgIF9wcm9jZXNzUmVzdWx0cyhyZXN1bHRzLCBxdWVyeSkge1xuICAgICAgICBjb25zdCBzdWdnZXN0ZWRMaXN0ID0gW107XG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnJvb21faWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJlc3VsdC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b21ic3RvbmUgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnRvbWJzdG9uZScsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvbWJzdG9uZSAmJiB0b21ic3RvbmUuZ2V0Q29udGVudCgpICYmIHRvbWJzdG9uZS5nZXRDb250ZW50KClbXCJyZXBsYWNlbWVudF9yb29tXCJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudFJvb20gPSBjbGllbnQuZ2V0Um9vbSh0b21ic3RvbmUuZ2V0Q29udGVudCgpW1wicmVwbGFjZW1lbnRfcm9vbVwiXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNraXAgcm9vbXMgd2l0aCB0b21ic3RvbmVzIHdoZXJlIHdlIGFyZSBhbHNvIGF3YXJlIG9mIHRoZSByZXBsYWNlbWVudCByb29tLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50Um9vbSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1Z2dlc3RlZExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3NUeXBlOiAnbXgtcm9vbS1pZCcsXG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IHJlc3VsdC5yb29tX2lkLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogcmVzdWx0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhck14YzogcmVzdWx0LmF2YXRhcl91cmwsXG4gICAgICAgICAgICAgICAgICAgIGlzS25vd246IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLmluY2x1ZGVTZWxmICYmXG4gICAgICAgICAgICAgICAgcmVzdWx0LnVzZXJfaWQgPT09IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWRcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmV0dXJuIG9iamVjdHMsIHN0cnVjdHVyZSBvZiB3aGljaCBpcyBkZWZpbmVkXG4gICAgICAgICAgICAvLyBieSBVc2VyQWRkcmVzc1R5cGVcbiAgICAgICAgICAgIHN1Z2dlc3RlZExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgYWRkcmVzc1R5cGU6ICdteC11c2VyLWlkJyxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXN1bHQudXNlcl9pZCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogcmVzdWx0LmRpc3BsYXlfbmFtZSxcbiAgICAgICAgICAgICAgICBhdmF0YXJNeGM6IHJlc3VsdC5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgIGlzS25vd246IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHF1ZXJ5IGlzIGEgdmFsaWQgYWRkcmVzcywgYWRkIGFuIGVudHJ5IGZvciB0aGF0XG4gICAgICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50LCBvdGhlcndpc2UgdGhlcmUncyBubyB3YXkgdG8gaW52aXRlXG4gICAgICAgIC8vIGEgcGVyZmVjdGx5IHZhbGlkIGFkZHJlc3MgaWYgdGhlcmUgYXJlIGNsb3NlIG1hdGNoZXMuXG4gICAgICAgIGNvbnN0IGFkZHJUeXBlID0gZ2V0QWRkcmVzc1R5cGUocXVlcnkpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWxpZEFkZHJlc3NUeXBlcy5pbmNsdWRlcyhhZGRyVHlwZSkpIHtcbiAgICAgICAgICAgIGlmIChhZGRyVHlwZSA9PT0gJ2VtYWlsJyAmJiAhRW1haWwubG9va3NWYWxpZChxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWFyY2hFcnJvcjogX3QoXCJUaGF0IGRvZXNuJ3QgbG9vayBsaWtlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiKX0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1Z2dlc3RlZExpc3QudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgYWRkcmVzc1R5cGU6IGFkZHJUeXBlLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IHF1ZXJ5LFxuICAgICAgICAgICAgICAgIGlzS25vd246IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2FuY2VsVGhyZWVwaWRMb29rdXApIHRoaXMuX2NhbmNlbFRocmVlcGlkTG9va3VwKCk7XG4gICAgICAgICAgICBpZiAoYWRkclR5cGUgPT09ICdlbWFpbCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb29rdXBUaHJlZXBpZChhZGRyVHlwZSwgcXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc3VnZ2VzdGVkTGlzdCxcbiAgICAgICAgICAgIGludmFsaWRBZGRyZXNzRXJyb3I6IGZhbHNlLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5hZGRyZXNzU2VsZWN0b3IpIHRoaXMuYWRkcmVzc1NlbGVjdG9yLm1vdmVTZWxlY3Rpb25Ub3AoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2FkZEFkZHJlc3Nlc1RvTGlzdChhZGRyZXNzVGV4dHMpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRMaXN0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZExpc3Quc2xpY2UoKTtcblxuICAgICAgICBsZXQgaGFzRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgYWRkcmVzc1RleHRzLmZvckVhY2goKGFkZHJlc3NUZXh0KSA9PiB7XG4gICAgICAgICAgICBhZGRyZXNzVGV4dCA9IGFkZHJlc3NUZXh0LnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJUeXBlID0gZ2V0QWRkcmVzc1R5cGUoYWRkcmVzc1RleHQpO1xuICAgICAgICAgICAgY29uc3QgYWRkck9iaiA9IHtcbiAgICAgICAgICAgICAgICBhZGRyZXNzVHlwZTogYWRkclR5cGUsXG4gICAgICAgICAgICAgICAgYWRkcmVzczogYWRkcmVzc1RleHQsXG4gICAgICAgICAgICAgICAgaXNLbm93bjogZmFsc2UsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUudmFsaWRBZGRyZXNzVHlwZXMuaW5jbHVkZXMoYWRkclR5cGUpKSB7XG4gICAgICAgICAgICAgICAgaGFzRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhZGRyVHlwZSA9PT0gJ214LXVzZXItaWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlciA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VyKGFkZHJPYmouYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkck9iai5kaXNwbGF5TmFtZSA9IHVzZXIuZGlzcGxheU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJPYmouYXZhdGFyTXhjID0gdXNlci5hdmF0YXJVcmw7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJPYmouaXNLbm93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhZGRyVHlwZSA9PT0gJ214LXJvb20taWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKGFkZHJPYmouYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkck9iai5kaXNwbGF5TmFtZSA9IHJvb20ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgYWRkck9iai5hdmF0YXJNeGMgPSByb29tLmF2YXRhclVybDtcbiAgICAgICAgICAgICAgICAgICAgYWRkck9iai5pc0tub3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGVjdGVkTGlzdC5wdXNoKGFkZHJPYmopO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTGlzdCxcbiAgICAgICAgICAgIHN1Z2dlc3RlZExpc3Q6IFtdLFxuICAgICAgICAgICAgcXVlcnk6IFwiXCIsXG4gICAgICAgICAgICBpbnZhbGlkQWRkcmVzc0Vycm9yOiBoYXNFcnJvciA/IHRydWUgOiB0aGlzLnN0YXRlLmludmFsaWRBZGRyZXNzRXJyb3IsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5fY2FuY2VsVGhyZWVwaWRMb29rdXApIHRoaXMuX2NhbmNlbFRocmVlcGlkTG9va3VwKCk7XG4gICAgICAgIHJldHVybiBoYXNFcnJvciA/IG51bGwgOiBzZWxlY3RlZExpc3Q7XG4gICAgfVxuXG4gICAgYXN5bmMgX2xvb2t1cFRocmVlcGlkKG1lZGl1bSwgYWRkcmVzcykge1xuICAgICAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2U7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBjYW4ndCBzYWZlbHkgcmVtb3ZlIHRoaXMgYWZ0ZXIgd2UncmUgZG9uZVxuICAgICAgICAvLyBiZWNhdXNlIHdlIGRvbid0IGtub3cgdGhhdCBpdCdzIHRoZSBzYW1lIG9uZSwgc28gd2UganVzdFxuICAgICAgICAvLyBsZWF2ZSBpdDogaXQncyByZXBsYWNpbmcgdGhlIG9sZCBvbmUgZWFjaCB0aW1lIHNvIGl0J3NcbiAgICAgICAgLy8gbm90IGxpa2UgdGhleSBsZWFrLlxuICAgICAgICB0aGlzLl9jYW5jZWxUaHJlZXBpZExvb2t1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyB3YWl0IGEgYml0IHRvIGxldCB0aGUgdXNlciBmaW5pc2ggdHlwaW5nXG4gICAgICAgIGF3YWl0IHNsZWVwKDUwMCk7XG4gICAgICAgIGlmIChjYW5jZWxsZWQpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhdXRoQ2xpZW50ID0gbmV3IElkZW50aXR5QXV0aENsaWVudCgpO1xuICAgICAgICAgICAgY29uc3QgaWRlbnRpdHlBY2Nlc3NUb2tlbiA9IGF3YWl0IGF1dGhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKTtcbiAgICAgICAgICAgIGlmIChjYW5jZWxsZWQpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICBjb25zdCBsb29rdXAgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubG9va3VwVGhyZWVQaWQoXG4gICAgICAgICAgICAgICAgbWVkaXVtLFxuICAgICAgICAgICAgICAgIGFkZHJlc3MsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkIC8qIGNhbGxiYWNrICovLFxuICAgICAgICAgICAgICAgIGlkZW50aXR5QWNjZXNzVG9rZW4sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCB8fCBsb29rdXAgPT09IG51bGwgfHwgIWxvb2t1cC5teGlkKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRQcm9maWxlSW5mbyhsb29rdXAubXhpZCk7XG4gICAgICAgICAgICBpZiAoY2FuY2VsbGVkIHx8IHByb2ZpbGUgPT09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0ZWRMaXN0OiBbe1xuICAgICAgICAgICAgICAgICAgICAvLyBhIFVzZXJBZGRyZXNzVHlwZVxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzVHlwZTogbWVkaXVtLFxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogcHJvZmlsZS5kaXNwbGF5bmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyTXhjOiBwcm9maWxlLmF2YXRhcl91cmwsXG4gICAgICAgICAgICAgICAgICAgIGlzS25vd246IHRydWUsXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlYXJjaEVycm9yOiBfdCgnU29tZXRoaW5nIHdlbnQgd3JvbmchJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRGaWx0ZXJlZFN1Z2dlc3Rpb25zKCkge1xuICAgICAgICAvLyBtYXAgYWRkcmVzc1R5cGUgPT4gc2V0IG9mIGFkZHJlc3NlcyB0byBhdm9pZCBPKG4qbSkgb3BlcmF0aW9uXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQWRkcmVzc2VzID0ge307XG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRMaXN0LmZvckVhY2goKHthZGRyZXNzLCBhZGRyZXNzVHlwZX0pID0+IHtcbiAgICAgICAgICAgIGlmICghc2VsZWN0ZWRBZGRyZXNzZXNbYWRkcmVzc1R5cGVdKSBzZWxlY3RlZEFkZHJlc3Nlc1thZGRyZXNzVHlwZV0gPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBzZWxlY3RlZEFkZHJlc3Nlc1thZGRyZXNzVHlwZV0uYWRkKGFkZHJlc3MpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBGaWx0ZXIgb3V0IGFueSBhZGRyZXNzZXMgaW4gdGhlIGFib3ZlIGFscmVhZHkgc2VsZWN0ZWQgYWRkcmVzc2VzIChtYXRjaGluZyBib3RoIHR5cGUgYW5kIGFkZHJlc3MpXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnN1Z2dlc3RlZExpc3QuZmlsdGVyKCh7YWRkcmVzcywgYWRkcmVzc1R5cGV9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIShzZWxlY3RlZEFkZHJlc3Nlc1thZGRyZXNzVHlwZV0gJiYgc2VsZWN0ZWRBZGRyZXNzZXNbYWRkcmVzc1R5cGVdLmhhcyhhZGRyZXNzKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vblBhc3RlID0gZSA9PiB7XG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHRleHQgYmVpbmcgcGFzdGVkIGludG8gdGhlIHRleHRhcmVhXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKFwidGV4dFwiKTtcbiAgICAgICAgLy8gUHJvY2VzcyBpdCBhcyBhIGxpc3Qgb2YgYWRkcmVzc2VzIHRvIGFkZCBpbnN0ZWFkXG4gICAgICAgIHRoaXMuX2FkZEFkZHJlc3Nlc1RvTGlzdCh0ZXh0LnNwbGl0KC9bXFxzLF0rLykpO1xuICAgIH07XG5cbiAgICBvblVzZURlZmF1bHRJZGVudGl0eVNlcnZlckNsaWNrID0gZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIElTIGluIGFjY291bnQgZGF0YS4gQWN0dWFsbHkgdXNpbmcgaXQgbWF5IHRyaWdnZXIgdGVybXMuXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9ydWxlcy1vZi1ob29rc1xuICAgICAgICB1c2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXIoKTtcblxuICAgICAgICAvLyBBZGQgZW1haWwgYXMgYSB2YWxpZCBhZGRyZXNzIHR5cGUuXG4gICAgICAgIGNvbnN0IHsgdmFsaWRBZGRyZXNzVHlwZXMgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhbGlkQWRkcmVzc1R5cGVzLnB1c2goJ2VtYWlsJyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2YWxpZEFkZHJlc3NUeXBlcyB9KTtcbiAgICB9O1xuXG4gICAgb25NYW5hZ2VTZXR0aW5nc0NsaWNrID0gZSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MpO1xuICAgICAgICB0aGlzLm9uQ2FuY2VsKCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuICAgICAgICBjb25zdCBBZGRyZXNzU2VsZWN0b3IgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuQWRkcmVzc1NlbGVjdG9yXCIpO1xuICAgICAgICB0aGlzLnNjcm9sbEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIGxldCBpbnB1dExhYmVsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgaW5wdXRMYWJlbCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1BpY2tlckRpYWxvZ19sYWJlbFwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwidGV4dGlucHV0XCI+e3RoaXMucHJvcHMuZGVzY3JpcHRpb259PC9sYWJlbD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gW107XG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgaW52aXRlIGxpc3RcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IEFkZHJlc3NUaWxlID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFkZHJlc3NUaWxlXCIpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YXRlLnNlbGVjdGVkTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LnB1c2goXG4gICAgICAgICAgICAgICAgICAgIDxBZGRyZXNzVGlsZVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzcz17dGhpcy5zdGF0ZS5zZWxlY3RlZExpc3RbaV19XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5EaXNtaXNzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzZWQ9e3RoaXMub25EaXNtaXNzZWQoaSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93QWRkcmVzcz17dGhpcy5wcm9wcy5waWNrZXJUeXBlID09PSAndXNlcid9IC8+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgdGhlIHF1ZXJ5IGF0IHRoZSBlbmRcbiAgICAgICAgcXVlcnkucHVzaChcbiAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgIGtleT17dGhpcy5zdGF0ZS5zZWxlY3RlZExpc3QubGVuZ3RofVxuICAgICAgICAgICAgICAgIG9uUGFzdGU9e3RoaXMuX29uUGFzdGV9XG4gICAgICAgICAgICAgICAgcm93cz1cIjFcIlxuICAgICAgICAgICAgICAgIGlkPVwidGV4dGlucHV0XCJcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3RleHRpbnB1dH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BZGRyZXNzUGlja2VyRGlhbG9nX2lucHV0XCJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblF1ZXJ5Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dGhpcy5nZXRQbGFjZWhvbGRlcigpfVxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17dGhpcy5wcm9wcy52YWx1ZX1cbiAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RoaXMucHJvcHMuZm9jdXN9PlxuICAgICAgICAgICAgPC90ZXh0YXJlYT4sXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZmlsdGVyZWRTdWdnZXN0ZWRMaXN0ID0gdGhpcy5fZ2V0RmlsdGVyZWRTdWdnZXN0aW9ucygpO1xuXG4gICAgICAgIGxldCBlcnJvcjtcbiAgICAgICAgbGV0IGFkZHJlc3NTZWxlY3RvcjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaW52YWxpZEFkZHJlc3NFcnJvcikge1xuICAgICAgICAgICAgY29uc3QgdmFsaWRUeXBlRGVzY3JpcHRpb25zID0gdGhpcy5zdGF0ZS52YWxpZEFkZHJlc3NUeXBlcy5tYXAoKHQpID0+IF90KGFkZHJlc3NUeXBlTmFtZVt0XSkpO1xuICAgICAgICAgICAgZXJyb3IgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiWW91IGhhdmUgZW50ZXJlZCBhbiBpbnZhbGlkIGFkZHJlc3MuXCIpIH1cbiAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICB7IF90KFwiVHJ5IHVzaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIHZhbGlkIGFkZHJlc3MgdHlwZXM6ICUodmFsaWRUeXBlc0xpc3Qpcy5cIiwge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZFR5cGVzTGlzdDogdmFsaWRUeXBlRGVzY3JpcHRpb25zLmpvaW4oXCIsIFwiKSxcbiAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZWFyY2hFcnJvcikge1xuICAgICAgICAgICAgZXJyb3IgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfZXJyb3JcIj57IHRoaXMuc3RhdGUuc2VhcmNoRXJyb3IgfTwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnF1ZXJ5Lmxlbmd0aCA+IDAgJiYgZmlsdGVyZWRTdWdnZXN0ZWRMaXN0Lmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5zdGF0ZS5idXN5KSB7XG4gICAgICAgICAgICBlcnJvciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1BpY2tlckRpYWxvZ19lcnJvclwiPnsgX3QoXCJObyByZXN1bHRzXCIpIH08L2Rpdj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRyZXNzU2VsZWN0b3IgPSAoXG4gICAgICAgICAgICAgICAgPEFkZHJlc3NTZWxlY3RvciByZWY9eyhyZWYpID0+IHt0aGlzLmFkZHJlc3NTZWxlY3RvciA9IHJlZjt9fVxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzTGlzdD17ZmlsdGVyZWRTdWdnZXN0ZWRMaXN0fVxuICAgICAgICAgICAgICAgICAgICBzaG93QWRkcmVzcz17dGhpcy5wcm9wcy5waWNrZXJUeXBlID09PSAndXNlcid9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0ZWQ9e3RoaXMub25TZWxlY3RlZH1cbiAgICAgICAgICAgICAgICAgICAgdHJ1bmNhdGVBdD17VFJVTkNBVEVfUVVFUllfTElTVH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpZGVudGl0eVNlcnZlcjtcbiAgICAgICAgLy8gSWYgcGlja2VyIGNhbm5vdCBjdXJyZW50bHkgYWNjZXB0IGUtbWFpbCBidXQgc2hvdWxkIGJlIGFibGUgdG9cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGlja2VyVHlwZSA9PT0gJ3VzZXInICYmICF0aGlzLnN0YXRlLnZhbGlkQWRkcmVzc1R5cGVzLmluY2x1ZGVzKCdlbWFpbCcpXG4gICAgICAgICAgICAmJiB0aGlzLnByb3BzLnZhbGlkQWRkcmVzc1R5cGVzLmluY2x1ZGVzKCdlbWFpbCcpKSB7XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwgPSBnZXREZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwoKTtcbiAgICAgICAgICAgIGlmIChkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgICAgICBpZGVudGl0eVNlcnZlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1BpY2tlckRpYWxvZ19pZGVudGl0eVNlcnZlclwiPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIHRvIGludml0ZSBieSBlbWFpbC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxkZWZhdWx0PlVzZSB0aGUgZGVmYXVsdCAoJShkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJOYW1lKXMpPC9kZWZhdWx0PiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwib3IgbWFuYWdlIGluIDxzZXR0aW5ncz5TZXR0aW5nczwvc2V0dGluZ3M+LlwiLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJOYW1lOiBhYmJyZXZpYXRlVXJsKGRlZmF1bHRJZGVudGl0eVNlcnZlclVybCksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHN1YiA9PiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e3RoaXMub25Vc2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXJDbGlja30+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHN1YiA9PiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e3RoaXMub25NYW5hZ2VTZXR0aW5nc0NsaWNrfT57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L2Rpdj47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlkZW50aXR5U2VydmVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9BZGRyZXNzUGlja2VyRGlhbG9nX2lkZW50aXR5U2VydmVyXCI+e190KFxuICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgdG8gaW52aXRlIGJ5IGVtYWlsLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiTWFuYWdlIGluIDxzZXR0aW5ncz5TZXR0aW5nczwvc2V0dGluZ3M+LlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHN1YiA9PiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e3RoaXMub25NYW5hZ2VTZXR0aW5nc0NsaWNrfT57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1BpY2tlckRpYWxvZ1wiIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfSB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX0+XG4gICAgICAgICAgICAgICAge2lucHV0TGFiZWx9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfaW5wdXRDb250YWluZXJcIj57IHF1ZXJ5IH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBlcnJvciB9XG4gICAgICAgICAgICAgICAgICAgIHsgYWRkcmVzc1NlbGVjdG9yIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmV4dHJhTm9kZSB9XG4gICAgICAgICAgICAgICAgICAgIHsgaWRlbnRpdHlTZXJ2ZXIgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e3RoaXMucHJvcHMuYnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbkJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH0gLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=