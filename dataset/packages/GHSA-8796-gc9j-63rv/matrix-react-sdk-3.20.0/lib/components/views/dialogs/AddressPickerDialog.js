"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

const TRUNCATE_QUERY_LIST = 40;
const QUERY_USER_DIRECTORY_DEBOUNCE_MS = 200;
const addressTypeName = {
  'mx-user-id': (0, _languageHandler._td)("Matrix ID"),
  'mx-room-id': (0, _languageHandler._td)("Matrix Room ID"),
  'email': (0, _languageHandler._td)("email address")
};
let AddressPickerDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.AddressPickerDialog"), _dec(_class = (_temp = _class2 = class AddressPickerDialog extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
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
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  value: "",
  focus: true,
  validAddressTypes: _UserAddress.addressTypes,
  pickerType: 'user',
  includeSelf: false
}), _temp)) || _class);
exports.default = AddressPickerDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQWRkcmVzc1BpY2tlckRpYWxvZy5qcyJdLCJuYW1lcyI6WyJUUlVOQ0FURV9RVUVSWV9MSVNUIiwiUVVFUllfVVNFUl9ESVJFQ1RPUllfREVCT1VOQ0VfTVMiLCJhZGRyZXNzVHlwZU5hbWUiLCJBZGRyZXNzUGlja2VyRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2VsZWN0ZWRMaXN0Iiwic3RhdGUiLCJzbGljZSIsIl90ZXh0aW5wdXQiLCJjdXJyZW50IiwidmFsdWUiLCJfYWRkQWRkcmVzc2VzVG9MaXN0Iiwib25GaW5pc2hlZCIsImUiLCJ0ZXh0SW5wdXQiLCJ1bmRlZmluZWQiLCJrZXkiLCJLZXkiLCJFU0NBUEUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkFSUk9XX1VQIiwiYWRkcmVzc1NlbGVjdG9yIiwibW92ZVNlbGVjdGlvblVwIiwiQVJST1dfRE9XTiIsIm1vdmVTZWxlY3Rpb25Eb3duIiwic3VnZ2VzdGVkTGlzdCIsImxlbmd0aCIsIkNPTU1BIiwiRU5URVIiLCJUQUIiLCJpbmNsdWRlcyIsImNob29zZVNlbGVjdGlvbiIsIkJBQ0tTUEFDRSIsIm9uRGlzbWlzc2VkIiwib25CdXR0b25DbGljayIsImV2IiwicXVlcnkiLCJ0YXJnZXQiLCJxdWVyeUNoYW5nZWREZWJvdW5jZXIiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwicGlja2VyVHlwZSIsImdyb3VwSWQiLCJfZG9OYWl2ZUdyb3VwU2VhcmNoIiwic2VydmVyU3VwcG9ydHNVc2VyRGlyZWN0b3J5IiwiX2RvVXNlckRpcmVjdG9yeVNlYXJjaCIsIl9kb0xvY2FsU2VhcmNoIiwiX2RvTmFpdmVHcm91cFJvb21TZWFyY2giLCJfZG9Sb29tU2VhcmNoIiwiY29uc29sZSIsImVycm9yIiwic2V0U3RhdGUiLCJzZWFyY2hFcnJvciIsImluZGV4Iiwic3BsaWNlIiwiX2NhbmNlbFRocmVlcGlkTG9va3VwIiwib25TZWxlY3RlZCIsInB1c2giLCJfZ2V0RmlsdGVyZWRTdWdnZXN0aW9ucyIsInRleHQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsInNwbGl0IiwidmFsaWRBZGRyZXNzVHlwZXMiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsIm9uQ2FuY2VsIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJmaWx0ZXIiLCJ0eXBlIiwiaW52YWxpZEFkZHJlc3NFcnJvciIsImJ1c3kiLCJjb21wb25lbnREaWRNb3VudCIsImZvY3VzIiwiZ2V0UGxhY2Vob2xkZXIiLCJwbGFjZWhvbGRlciIsImxvd2VyQ2FzZVF1ZXJ5IiwidG9Mb3dlckNhc2UiLCJnZXRHcm91cFVzZXJzIiwidGhlbiIsInJlc3AiLCJyZXN1bHRzIiwiY2h1bmsiLCJmb3JFYWNoIiwidSIsInVzZXJJZE1hdGNoIiwidXNlcl9pZCIsImRpc3BsYXlOYW1lTWF0Y2giLCJkaXNwbGF5bmFtZSIsImF2YXRhcl91cmwiLCJkaXNwbGF5X25hbWUiLCJfcHJvY2Vzc1Jlc3VsdHMiLCJjYXRjaCIsImVyciIsImVycmNvZGUiLCJtZXNzYWdlIiwiR3JvdXBTdG9yZSIsImdldEdyb3VwUm9vbXMiLCJyIiwibmFtZU1hdGNoIiwibmFtZSIsInRvcGljTWF0Y2giLCJ0b3BpYyIsImFsaWFzTWF0Y2giLCJjYW5vbmljYWxfYWxpYXMiLCJyb29tX2lkIiwicm9vbXMiLCJnZXRSb29tcyIsInJvb20iLCJyYW5rIiwiSW5maW5pdHkiLCJuYW1lRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJjYW5vbmljYWxBbGlhcyIsImdldENhbm9uaWNhbEFsaWFzIiwiYWxpYXNFdmVudHMiLCJhbGlhc2VzIiwibWFwIiwicmVkdWNlIiwiYSIsImIiLCJjb25jYXQiLCJzaG9ydGVzdE1hdGNoaW5nQWxpYXNMZW5ndGgiLCJhbGlhcyIsImF2YXRhckV2ZW50IiwiYXZhdGFyVXJsIiwidXJsIiwicm9vbUlkIiwic29ydGVkUmVzdWx0cyIsInNvcnQiLCJzZWFyY2hVc2VyRGlyZWN0b3J5IiwidGVybSIsInF1ZXJ5TG93ZXJjYXNlIiwiZ2V0VXNlcnMiLCJ1c2VyIiwidXNlcklkIiwiaW5kZXhPZiIsImRpc3BsYXlOYW1lIiwicmVzdWx0IiwiY2xpZW50IiwiZ2V0Um9vbSIsInRvbWJzdG9uZSIsInJlcGxhY2VtZW50Um9vbSIsImFkZHJlc3NUeXBlIiwiYWRkcmVzcyIsImF2YXRhck14YyIsImlzS25vd24iLCJpbmNsdWRlU2VsZiIsImNyZWRlbnRpYWxzIiwiYWRkclR5cGUiLCJFbWFpbCIsImxvb2tzVmFsaWQiLCJ1bnNoaWZ0IiwiX2xvb2t1cFRocmVlcGlkIiwibW92ZVNlbGVjdGlvblRvcCIsImFkZHJlc3NUZXh0cyIsImhhc0Vycm9yIiwiYWRkcmVzc1RleHQiLCJ0cmltIiwiYWRkck9iaiIsImdldFVzZXIiLCJtZWRpdW0iLCJjYW5jZWxsZWQiLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiaWRlbnRpdHlBY2Nlc3NUb2tlbiIsImdldEFjY2Vzc1Rva2VuIiwibG9va3VwIiwibG9va3VwVGhyZWVQaWQiLCJteGlkIiwicHJvZmlsZSIsImdldFByb2ZpbGVJbmZvIiwic2VsZWN0ZWRBZGRyZXNzZXMiLCJTZXQiLCJhZGQiLCJoYXMiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsIkFkZHJlc3NTZWxlY3RvciIsInNjcm9sbEVsZW1lbnQiLCJpbnB1dExhYmVsIiwiZGVzY3JpcHRpb24iLCJBZGRyZXNzVGlsZSIsImkiLCJfb25QYXN0ZSIsIm9uUXVlcnlDaGFuZ2VkIiwiZmlsdGVyZWRTdWdnZXN0ZWRMaXN0IiwidmFsaWRUeXBlRGVzY3JpcHRpb25zIiwidCIsInZhbGlkVHlwZXNMaXN0Iiwiam9pbiIsInJlZiIsImlkZW50aXR5U2VydmVyIiwiZGVmYXVsdElkZW50aXR5U2VydmVyVXJsIiwiZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZSIsImRlZmF1bHQiLCJzdWIiLCJvblVzZURlZmF1bHRJZGVudGl0eVNlcnZlckNsaWNrIiwic2V0dGluZ3MiLCJvbk1hbmFnZVNldHRpbmdzQ2xpY2siLCJvbktleURvd24iLCJ0aXRsZSIsImV4dHJhTm9kZSIsImJ1dHRvbiIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJub2RlIiwib25lT2ZUeXBlIiwiZnVuYyIsImJvb2wiLCJhcnJheU9mIiwib25lT2YiLCJhZGRyZXNzVHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxtQkFBbUIsR0FBRyxFQUE1QjtBQUNBLE1BQU1DLGdDQUFnQyxHQUFHLEdBQXpDO0FBRUEsTUFBTUMsZUFBZSxHQUFHO0FBQ3BCLGdCQUFjLDBCQUFJLFdBQUosQ0FETTtBQUVwQixnQkFBYywwQkFBSSxnQkFBSixDQUZNO0FBR3BCLFdBQVMsMEJBQUksZUFBSjtBQUhXLENBQXhCO0lBT3FCQyxtQixXQURwQixnREFBcUIsbUNBQXJCLEMsbUNBQUQsTUFDcUJBLG1CQURyQixTQUNpREMsZUFBTUMsU0FEdkQsQ0FDaUU7QUE2QjdEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSx5REFrREgsTUFBTTtBQUNsQixVQUFJQyxZQUFZLEdBQUcsS0FBS0MsS0FBTCxDQUFXRCxZQUFYLENBQXdCRSxLQUF4QixFQUFuQixDQURrQixDQUVsQjtBQUNBOztBQUNBLFVBQUksS0FBS0MsVUFBTCxDQUFnQkMsT0FBaEIsQ0FBd0JDLEtBQXhCLEtBQWtDLEVBQXRDLEVBQTBDO0FBQ3RDTCxRQUFBQSxZQUFZ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LGlCQUFpQixFQUFFc0osbUJBQVVPLE9BQVYsQ0FBa0JQLG1CQUFVUSxLQUFWLENBQWdCQyx5QkFBaEIsQ0FBbEIsQ0FWSjtBQVdmbk4sRUFBQUEsVUFBVSxFQUFFME0sbUJBQVVLLElBQVYsQ0FBZUgsVUFYWjtBQVlmN0ssRUFBQUEsT0FBTyxFQUFFMkssbUJBQVVDLE1BWko7QUFhZjtBQUNBN0ssRUFBQUEsVUFBVSxFQUFFNEssbUJBQVVRLEtBQVYsQ0FBZ0IsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFoQixDQWRHO0FBZWY7QUFDQTtBQUNBcEUsRUFBQUEsV0FBVyxFQUFFNEQsbUJBQVVNO0FBakJSLEMsMERBb0JHO0FBQ2xCbE4sRUFBQUEsS0FBSyxFQUFFLEVBRFc7QUFFbEJvRSxFQUFBQSxLQUFLLEVBQUUsSUFGVztBQUdsQmQsRUFBQUEsaUJBQWlCLEVBQUUrSix5QkFIRDtBQUlsQnJMLEVBQUFBLFVBQVUsRUFBRSxNQUpNO0FBS2xCZ0gsRUFBQUEsV0FBVyxFQUFFO0FBTEssQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgYWRkcmVzc1R5cGVzLCBnZXRBZGRyZXNzVHlwZSB9IGZyb20gJy4uLy4uLy4uL1VzZXJBZGRyZXNzLmpzJztcbmltcG9ydCBHcm91cFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9Hcm91cFN0b3JlJztcbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gJy4uLy4uLy4uL2VtYWlsJztcbmltcG9ydCBJZGVudGl0eUF1dGhDbGllbnQgZnJvbSAnLi4vLi4vLi4vSWRlbnRpdHlBdXRoQ2xpZW50JztcbmltcG9ydCB7IGdldERlZmF1bHRJZGVudGl0eVNlcnZlclVybCwgdXNlRGVmYXVsdElkZW50aXR5U2VydmVyIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvSWRlbnRpdHlTZXJ2ZXJVdGlscyc7XG5pbXBvcnQgeyBhYmJyZXZpYXRlVXJsIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvVXJsVXRpbHMnO1xuaW1wb3J0IHtzbGVlcH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Byb21pc2VcIjtcbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuY29uc3QgVFJVTkNBVEVfUVVFUllfTElTVCA9IDQwO1xuY29uc3QgUVVFUllfVVNFUl9ESVJFQ1RPUllfREVCT1VOQ0VfTVMgPSAyMDA7XG5cbmNvbnN0IGFkZHJlc3NUeXBlTmFtZSA9IHtcbiAgICAnbXgtdXNlci1pZCc6IF90ZChcIk1hdHJpeCBJRFwiKSxcbiAgICAnbXgtcm9vbS1pZCc6IF90ZChcIk1hdHJpeCBSb29tIElEXCIpLFxuICAgICdlbWFpbCc6IF90ZChcImVtYWlsIGFkZHJlc3NcIiksXG59O1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLkFkZHJlc3NQaWNrZXJEaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkZHJlc3NQaWNrZXJEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBQcm9wVHlwZXMubm9kZSxcbiAgICAgICAgLy8gRXh0cmEgbm9kZSBpbnNlcnRlZCBhZnRlciBwaWNrZXIgaW5wdXQsIGRyb3Bkb3duIGFuZCBlcnJvcnNcbiAgICAgICAgZXh0cmFOb2RlOiBQcm9wVHlwZXMubm9kZSxcbiAgICAgICAgdmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgICAgICByb29tSWQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGJ1dHRvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgZm9jdXM6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICB2YWxpZEFkZHJlc3NUeXBlczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9uZU9mKGFkZHJlc3NUeXBlcykpLFxuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBncm91cElkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAvLyBUaGUgdHlwZSBvZiBlbnRpdHkgdG8gc2VhcmNoIGZvci4gRGVmYXVsdDogJ3VzZXInLlxuICAgICAgICBwaWNrZXJUeXBlOiBQcm9wVHlwZXMub25lT2YoWyd1c2VyJywgJ3Jvb20nXSksXG4gICAgICAgIC8vIFdoZXRoZXIgdGhlIGN1cnJlbnQgdXNlciBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlIGFkZHJlc3NlcyByZXR1cm5lZC4gT25seVxuICAgICAgICAvLyBhcHBsaWNhYmxlIHdoZW4gcGlja2VyVHlwZSBpcyBgdXNlcmAuIERlZmF1bHQ6IGZhbHNlLlxuICAgICAgICBpbmNsdWRlU2VsZjogUHJvcFR5cGVzLmJvb2wsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgICBmb2N1czogdHJ1ZSxcbiAgICAgICAgdmFsaWRBZGRyZXNzVHlwZXM6IGFkZHJlc3NUeXBlcyxcbiAgICAgICAgcGlja2VyVHlwZTogJ3VzZXInLFxuICAgICAgICBpbmNsdWRlU2VsZjogZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl90ZXh0aW5wdXQgPSBjcmVhdGVSZWYoKTtcblxuICAgICAgICBsZXQgdmFsaWRBZGRyZXNzVHlwZXMgPSB0aGlzLnByb3BzLnZhbGlkQWRkcmVzc1R5cGVzO1xuICAgICAgICAvLyBSZW1vdmUgZW1haWwgZnJvbSB2YWxpZEFkZHJlc3NUeXBlcyBpZiBubyBJUyBpcyBjb25maWd1cmVkLiBJdCBtYXkgYmUgYWRkZWQgYXQgYSBsYXRlciBzdGFnZSBieSB0aGUgdXNlclxuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpICYmIHZhbGlkQWRkcmVzc1R5cGVzLmluY2x1ZGVzKFwiZW1haWxcIikpIHtcbiAgICAgICAgICAgIHZhbGlkQWRkcmVzc1R5cGVzID0gdmFsaWRBZGRyZXNzVHlwZXMuZmlsdGVyKHR5cGUgPT4gdHlwZSAhPT0gXCJlbWFpbFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyBXaGV0aGVyIHRvIHNob3cgYW4gZXJyb3IgbWVzc2FnZSBiZWNhdXNlIG9mIGFuIGludmFsaWQgYWRkcmVzc1xuICAgICAgICAgICAgaW52YWxpZEFkZHJlc3NFcnJvcjogZmFsc2UsXG4gICAgICAgICAgICAvLyBMaXN0IG9mIFVzZXJBZGRyZXNzVHlwZSBvYmplY3RzIHJlcHJlc2VudGluZ1xuICAgICAgICAgICAgLy8gdGhlIGxpc3Qgb2YgYWRkcmVzc2VzIHdlJ3JlIGdvaW5nIHRvIGludml0ZVxuICAgICAgICAgICAgc2VsZWN0ZWRMaXN0OiBbXSxcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgYSBzZWFyY2ggaXMgb25nb2luZ1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAvLyBBbiBlcnJvciBtZXNzYWdlIGdlbmVyYXRlZCBkdXJpbmcgdGhlIHVzZXIgZGlyZWN0b3J5IHNlYXJjaFxuICAgICAgICAgICAgc2VhcmNoRXJyb3I6IG51bGwsXG4gICAgICAgICAgICAvLyBXaGV0aGVyIHRoZSBzZXJ2ZXIgc3VwcG9ydHMgdGhlIHVzZXJfZGlyZWN0b3J5IEFQSVxuICAgICAgICAgICAgc2VydmVyU3VwcG9ydHNVc2VyRGlyZWN0b3J5OiB0cnVlLFxuICAgICAgICAgICAgLy8gVGhlIHF1ZXJ5IGJlaW5nIHNlYXJjaGVkIGZvclxuICAgICAgICAgICAgcXVlcnk6IFwiXCIsXG4gICAgICAgICAgICAvLyBMaXN0IG9mIFVzZXJBZGRyZXNzVHlwZSBvYmplY3RzIHJlcHJlc2VudGluZyB0aGUgc2V0IG9mXG4gICAgICAgICAgICAvLyBhdXRvLWNvbXBsZXRpb24gcmVzdWx0cyBmb3IgdGhlIGN1cnJlbnQgc2VhcmNoIHF1ZXJ5LlxuICAgICAgICAgICAgc3VnZ2VzdGVkTGlzdDogW10sXG4gICAgICAgICAgICAvLyBMaXN0IG9mIGFkZHJlc3MgdHlwZXMgaW5pdGlhbGlzZWQgZnJvbSBwcm9wcywgYnV0IG1heSBjaGFuZ2Ugd2hpbGUgdGhlXG4gICAgICAgICAgICAvLyBkaWFsb2cgaXMgb3BlbiBhbmQgcmVwcmVzZW50cyB0aGUgc3VwcG9ydGVkIGxpc3Qgb2YgYWRkcmVzcyB0eXBlcyBhdCB0aGlzIHRpbWUuXG4gICAgICAgICAgICB2YWxpZEFkZHJlc3NUeXBlcyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9jdXMpIHtcbiAgICAgICAgICAgIC8vIFNldCB0aGUgY3Vyc29yIGF0IHRoZSBlbmQgb2YgdGhlIHRleHQgaW5wdXRcbiAgICAgICAgICAgIHRoaXMuX3RleHRpbnB1dC5jdXJyZW50LnZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFBsYWNlaG9sZGVyKCkge1xuICAgICAgICBjb25zdCB7IHBsYWNlaG9sZGVyIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAodHlwZW9mIHBsYWNlaG9sZGVyID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gcGxhY2Vob2xkZXI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGl0J3MgYSBmdW5jdGlvbiwgYXMgY2hlY2tlZCBieSBwcm9wIHR5cGVzLlxuICAgICAgICByZXR1cm4gcGxhY2Vob2xkZXIodGhpcy5zdGF0ZS52YWxpZEFkZHJlc3NUeXBlcyk7XG4gICAgfVxuXG4gICAgb25CdXR0b25DbGljayA9ICgpID0+IHtcbiAgICAgICAgbGV0IHNlbGVjdGVkTGlzdCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRMaXN0LnNsaWNlKCk7XG4gICAgICAgIC8vIENoZWNrIHRoZSB0ZXh0IGlucHV0IGZpZWxkIHRvIHNlZSBpZiB1c2VyIGhhcyBhbiB1bmNvbnZlcnRlZCBhZGRyZXNzXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGFuZCBpdCdzIHZhbGlkIGFkZCBpdCB0byB0aGUgbG9jYWwgc2VsZWN0ZWRMaXN0XG4gICAgICAgIGlmICh0aGlzLl90ZXh0aW5wdXQuY3VycmVudC52YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkTGlzdCA9IHRoaXMuX2FkZEFkZHJlc3Nlc1RvTGlzdChbdGhpcy5fdGV4dGlucHV0LmN1cnJlbnQudmFsdWVdKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZExpc3QgPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSwgc2VsZWN0ZWRMaXN0KTtcbiAgICB9O1xuXG4gICAgb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIG9uS2V5RG93biA9IGUgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0SW5wdXQgPSB0aGlzLl90ZXh0aW5wdXQuY3VycmVudCA/IHRoaXMuX3RleHRpbnB1dC5jdXJyZW50LnZhbHVlIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChlLmtleSA9PT0gS2V5LkVTQ0FQRSkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXkgPT09IEtleS5BUlJPV19VUCkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFkZHJlc3NTZWxlY3RvcikgdGhpcy5hZGRyZXNzU2VsZWN0b3IubW92ZVNlbGVjdGlvblVwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5rZXkgPT09IEtleS5BUlJPV19ET1dOKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWRkcmVzc1NlbGVjdG9yKSB0aGlzLmFkZHJlc3NTZWxlY3Rvci5tb3ZlU2VsZWN0aW9uRG93bigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc3VnZ2VzdGVkTGlzdC5sZW5ndGggPiAwICYmIFtLZXkuQ09NTUEsIEtleS5FTlRFUiwgS2V5LlRBQl0uaW5jbHVkZXMoZS5rZXkpKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWRkcmVzc1NlbGVjdG9yKSB0aGlzLmFkZHJlc3NTZWxlY3Rvci5jaG9vc2VTZWxlY3Rpb24oKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZXh0SW5wdXQubGVuZ3RoID09PSAwICYmIHRoaXMuc3RhdGUuc2VsZWN0ZWRMaXN0Lmxlbmd0aCAmJiBlLmtleSA9PT0gS2V5LkJBQ0tTUEFDRSkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMub25EaXNtaXNzZWQodGhpcy5zdGF0ZS5zZWxlY3RlZExpc3QubGVuZ3RoIC0gMSkoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gS2V5LkVOVEVSKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRleHRJbnB1dCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSdzIG5vdGhpbmcgaW4gdGhlIGlucHV0IGJveCwgc3VibWl0IHRoZSBmb3JtXG4gICAgICAgICAgICAgICAgdGhpcy5vbkJ1dHRvbkNsaWNrKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEFkZHJlc3Nlc1RvTGlzdChbdGV4dElucHV0XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGV4dElucHV0ICYmIChlLmtleSA9PT0gS2V5LkNPTU1BIHx8IGUua2V5ID09PSBLZXkuVEFCKSkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuX2FkZEFkZHJlc3Nlc1RvTGlzdChbdGV4dElucHV0XSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25RdWVyeUNoYW5nZWQgPSBldiA9PiB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gZXYudGFyZ2V0LnZhbHVlO1xuICAgICAgICBpZiAodGhpcy5xdWVyeUNoYW5nZWREZWJvdW5jZXIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnF1ZXJ5Q2hhbmdlZERlYm91bmNlcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25seSBkbyBzZWFyY2ggaWYgdGhlcmUgaXMgc29tZXRoaW5nIHRvIHNlYXJjaFxuICAgICAgICBpZiAocXVlcnkubGVuZ3RoID4gMCAmJiBxdWVyeSAhPT0gJ0AnICYmIHF1ZXJ5Lmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5Q2hhbmdlZERlYm91bmNlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnBpY2tlclR5cGUgPT09ICd1c2VyJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5ncm91cElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb05haXZlR3JvdXBTZWFyY2gocXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc2VydmVyU3VwcG9ydHNVc2VyRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb1VzZXJEaXJlY3RvcnlTZWFyY2gocXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZG9Mb2NhbFNlYXJjaChxdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucGlja2VyVHlwZSA9PT0gJ3Jvb20nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmdyb3VwSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvTmFpdmVHcm91cFJvb21TZWFyY2gocXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZG9Sb29tU2VhcmNoKHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Vua25vd24gcGlja2VyVHlwZScsIHRoaXMucHJvcHMucGlja2VyVHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgUVVFUllfVVNFUl9ESVJFQ1RPUllfREVCT1VOQ0VfTVMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc3VnZ2VzdGVkTGlzdDogW10sXG4gICAgICAgICAgICAgICAgcXVlcnk6IFwiXCIsXG4gICAgICAgICAgICAgICAgc2VhcmNoRXJyb3I6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkRpc21pc3NlZCA9IGluZGV4ID0+ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRMaXN0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZExpc3Quc2xpY2UoKTtcbiAgICAgICAgc2VsZWN0ZWRMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWRMaXN0LFxuICAgICAgICAgICAgc3VnZ2VzdGVkTGlzdDogW10sXG4gICAgICAgICAgICBxdWVyeTogXCJcIixcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLl9jYW5jZWxUaHJlZXBpZExvb2t1cCkgdGhpcy5fY2FuY2VsVGhyZWVwaWRMb29rdXAoKTtcbiAgICB9O1xuXG4gICAgb25DbGljayA9IGluZGV4ID0+ICgpID0+IHtcbiAgICAgICAgdGhpcy5vblNlbGVjdGVkKGluZGV4KTtcbiAgICB9O1xuXG4gICAgb25TZWxlY3RlZCA9IGluZGV4ID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRMaXN0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZExpc3Quc2xpY2UoKTtcbiAgICAgICAgc2VsZWN0ZWRMaXN0LnB1c2godGhpcy5fZ2V0RmlsdGVyZWRTdWdnZXN0aW9ucygpW2luZGV4XSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWRMaXN0LFxuICAgICAgICAgICAgc3VnZ2VzdGVkTGlzdDogW10sXG4gICAgICAgICAgICBxdWVyeTogXCJcIixcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLl9jYW5jZWxUaHJlZXBpZExvb2t1cCkgdGhpcy5fY2FuY2VsVGhyZWVwaWRMb29rdXAoKTtcbiAgICB9O1xuXG4gICAgX2RvTmFpdmVHcm91cFNlYXJjaChxdWVyeSkge1xuICAgICAgICBjb25zdCBsb3dlckNhc2VRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogdHJ1ZSxcbiAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgc2VhcmNoRXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0R3JvdXBVc2Vycyh0aGlzLnByb3BzLmdyb3VwSWQpLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIHJlc3AuY2h1bmsuZm9yRWFjaCgodSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZE1hdGNoID0gdS51c2VyX2lkLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJDYXNlUXVlcnkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lTWF0Y2ggPSAodS5kaXNwbGF5bmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlckNhc2VRdWVyeSk7XG4gICAgICAgICAgICAgICAgaWYgKCEodXNlcklkTWF0Y2ggfHwgZGlzcGxheU5hbWVNYXRjaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiB1LnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHUuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheV9uYW1lOiB1LmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXN1bHRzLCBxdWVyeSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoaWxzdCBzZWFyY2hpbmcgZ3JvdXAgcm9vbXM6ICcsIGVycik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWFyY2hFcnJvcjogZXJyLmVycmNvZGUgPyBlcnIubWVzc2FnZSA6IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZyEnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9kb05haXZlR3JvdXBSb29tU2VhcmNoKHF1ZXJ5KSB7XG4gICAgICAgIGNvbnN0IGxvd2VyQ2FzZVF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBHcm91cFN0b3JlLmdldEdyb3VwUm9vbXModGhpcy5wcm9wcy5ncm91cElkKS5mb3JFYWNoKChyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lTWF0Y2ggPSAoci5uYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyQ2FzZVF1ZXJ5KTtcbiAgICAgICAgICAgIGNvbnN0IHRvcGljTWF0Y2ggPSAoci50b3BpYyB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlckNhc2VRdWVyeSk7XG4gICAgICAgICAgICBjb25zdCBhbGlhc01hdGNoID0gKHIuY2Fub25pY2FsX2FsaWFzIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyQ2FzZVF1ZXJ5KTtcbiAgICAgICAgICAgIGlmICghKG5hbWVNYXRjaCB8fCB0b3BpY01hdGNoIHx8IGFsaWFzTWF0Y2gpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICByb29tX2lkOiByLnJvb21faWQsXG4gICAgICAgICAgICAgICAgYXZhdGFyX3VybDogci5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgIG5hbWU6IHIubmFtZSB8fCByLmNhbm9uaWNhbF9hbGlhcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzdWx0cywgcXVlcnkpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZG9Sb29tU2VhcmNoKHF1ZXJ5KSB7XG4gICAgICAgIGNvbnN0IGxvd2VyQ2FzZVF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3Qgcm9vbXMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbXMoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICByb29tcy5mb3JFYWNoKChyb29tKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmFuayA9IEluZmluaXR5O1xuICAgICAgICAgICAgY29uc3QgbmFtZUV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5uYW1lJywgJycpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVFdmVudCA/IG5hbWVFdmVudC5nZXRDb250ZW50KCkubmFtZSA6ICcnO1xuICAgICAgICAgICAgY29uc3QgY2Fub25pY2FsQWxpYXMgPSByb29tLmdldENhbm9uaWNhbEFsaWFzKCk7XG4gICAgICAgICAgICBjb25zdCBhbGlhc0V2ZW50cyA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20uYWxpYXNlcycpO1xuICAgICAgICAgICAgY29uc3QgYWxpYXNlcyA9IGFsaWFzRXZlbnRzLm1hcCgoZXYpID0+IGV2LmdldENvbnRlbnQoKS5hbGlhc2VzKS5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5jb25jYXQoYik7XG4gICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IChuYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyQ2FzZVF1ZXJ5KTtcbiAgICAgICAgICAgIGxldCBhbGlhc01hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgc2hvcnRlc3RNYXRjaGluZ0FsaWFzTGVuZ3RoID0gSW5maW5pdHk7XG4gICAgICAgICAgICBhbGlhc2VzLmZvckVhY2goKGFsaWFzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKChhbGlhcyB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlckNhc2VRdWVyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxpYXNNYXRjaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG9ydGVzdE1hdGNoaW5nQWxpYXNMZW5ndGggPiBhbGlhcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3J0ZXN0TWF0Y2hpbmdBbGlhc0xlbmd0aCA9IGFsaWFzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIShuYW1lTWF0Y2ggfHwgYWxpYXNNYXRjaCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhbGlhc01hdGNoKSB7XG4gICAgICAgICAgICAgICAgLy8gQSBzaG9ydGVyIG1hdGNoaW5nIGFsaWFzIHdpbGwgZ2l2ZSBhIGJldHRlciByYW5rXG4gICAgICAgICAgICAgICAgcmFuayA9IHNob3J0ZXN0TWF0Y2hpbmdBbGlhc0xlbmd0aDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYXZhdGFyRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLmF2YXRhcicsICcnKTtcbiAgICAgICAgICAgIGNvbnN0IGF2YXRhclVybCA9IGF2YXRhckV2ZW50ID8gYXZhdGFyRXZlbnQuZ2V0Q29udGVudCgpLnVybCA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICByYW5rLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IGF2YXRhclVybCxcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lIHx8IGNhbm9uaWNhbEFsaWFzIHx8IGFsaWFzZXNbMF0gfHwgX3QoJ1VubmFtZWQgUm9vbScpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcmFuayBhc2NlbmRpbmcgKGEgaGlnaCByYW5rIGJlaW5nIGxlc3MgcmVsZXZhbnQpXG4gICAgICAgIGNvbnN0IHNvcnRlZFJlc3VsdHMgPSByZXN1bHRzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhLnJhbmsgLSBiLnJhbms7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHNvcnRlZFJlc3VsdHMsIHF1ZXJ5KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2RvVXNlckRpcmVjdG9yeVNlYXJjaChxdWVyeSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgIHNlYXJjaEVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlYXJjaFVzZXJEaXJlY3Rvcnkoe1xuICAgICAgICAgICAgdGVybTogcXVlcnksXG4gICAgICAgIH0pLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBxdWVyeSBtaWdodCBoYXZlIGNoYW5nZWQgc2luY2Ugd2Ugc2VudCB0aGUgcmVxdWVzdCwgc28gaWdub3JlXG4gICAgICAgICAgICAvLyByZXNwb25zZXMgZm9yIGFueXRoaW5nIG90aGVyIHRoYW4gdGhlIGxhdGVzdCBxdWVyeS5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnF1ZXJ5ICE9PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlc3AucmVzdWx0cywgcXVlcnkpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB3aGlsc3Qgc2VhcmNoaW5nIHVzZXIgZGlyZWN0b3J5OiAnLCBlcnIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2VhcmNoRXJyb3I6IGVyci5lcnJjb2RlID8gZXJyLm1lc3NhZ2UgOiBfdCgnU29tZXRoaW5nIHdlbnQgd3JvbmchJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gJ01fVU5SRUNPR05JWkVEJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTdXBwb3J0c1VzZXJEaXJlY3Rvcnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIERvIGEgbG9jYWwgc2VhcmNoIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgdGhpcy5fZG9Mb2NhbFNlYXJjaChxdWVyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2RvTG9jYWxTZWFyY2gocXVlcnkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgIHNlYXJjaEVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcXVlcnlMb3dlcmNhc2UgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VycygpLmZvckVhY2goKHVzZXIpID0+IHtcbiAgICAgICAgICAgIGlmICh1c2VyLnVzZXJJZC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlcmNhc2UpID09PSAtMSAmJlxuICAgICAgICAgICAgICAgIHVzZXIuZGlzcGxheU5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJjYXNlKSA9PT0gLTFcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHV0IHJlc3VsdHMgaW4gdGhlIGZvcm1hdCBvZiB0aGUgbmV3IEFQSVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB1c2VyX2lkOiB1c2VyLnVzZXJJZCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IHVzZXIuZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgYXZhdGFyX3VybDogdXNlci5hdmF0YXJVcmwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlc3VsdHMsIHF1ZXJ5KTtcbiAgICB9XG5cbiAgICBfcHJvY2Vzc1Jlc3VsdHMocmVzdWx0cywgcXVlcnkpIHtcbiAgICAgICAgY29uc3Qgc3VnZ2VzdGVkTGlzdCA9IFtdO1xuICAgICAgICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5yb29tX2lkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyZXN1bHQucm9vbV9pZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9tYnN0b25lID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS50b21ic3RvbmUnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b21ic3RvbmUgJiYgdG9tYnN0b25lLmdldENvbnRlbnQoKSAmJiB0b21ic3RvbmUuZ2V0Q29udGVudCgpW1wicmVwbGFjZW1lbnRfcm9vbVwiXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRSb29tID0gY2xpZW50LmdldFJvb20odG9tYnN0b25lLmdldENvbnRlbnQoKVtcInJlcGxhY2VtZW50X3Jvb21cIl0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIHJvb21zIHdpdGggdG9tYnN0b25lcyB3aGVyZSB3ZSBhcmUgYWxzbyBhd2FyZSBvZiB0aGUgcmVwbGFjZW1lbnQgcm9vbS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudFJvb20pIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWdnZXN0ZWRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzVHlwZTogJ214LXJvb20taWQnLFxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXN1bHQucm9vbV9pZCxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHJlc3VsdC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJNeGM6IHJlc3VsdC5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgICAgICBpc0tub3duOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5pbmNsdWRlU2VsZiAmJlxuICAgICAgICAgICAgICAgIHJlc3VsdC51c2VyX2lkID09PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiBvYmplY3RzLCBzdHJ1Y3R1cmUgb2Ygd2hpY2ggaXMgZGVmaW5lZFxuICAgICAgICAgICAgLy8gYnkgVXNlckFkZHJlc3NUeXBlXG4gICAgICAgICAgICBzdWdnZXN0ZWRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGFkZHJlc3NUeXBlOiAnbXgtdXNlci1pZCcsXG4gICAgICAgICAgICAgICAgYWRkcmVzczogcmVzdWx0LnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHJlc3VsdC5kaXNwbGF5X25hbWUsXG4gICAgICAgICAgICAgICAgYXZhdGFyTXhjOiByZXN1bHQuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICBpc0tub3duOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIElmIHRoZSBxdWVyeSBpcyBhIHZhbGlkIGFkZHJlc3MsIGFkZCBhbiBlbnRyeSBmb3IgdGhhdFxuICAgICAgICAvLyBUaGlzIGlzIGltcG9ydGFudCwgb3RoZXJ3aXNlIHRoZXJlJ3Mgbm8gd2F5IHRvIGludml0ZVxuICAgICAgICAvLyBhIHBlcmZlY3RseSB2YWxpZCBhZGRyZXNzIGlmIHRoZXJlIGFyZSBjbG9zZSBtYXRjaGVzLlxuICAgICAgICBjb25zdCBhZGRyVHlwZSA9IGdldEFkZHJlc3NUeXBlKHF1ZXJ5KTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmFsaWRBZGRyZXNzVHlwZXMuaW5jbHVkZXMoYWRkclR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoYWRkclR5cGUgPT09ICdlbWFpbCcgJiYgIUVtYWlsLmxvb2tzVmFsaWQocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VhcmNoRXJyb3I6IF90KFwiVGhhdCBkb2Vzbid0IGxvb2sgbGlrZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcIil9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWdnZXN0ZWRMaXN0LnVuc2hpZnQoe1xuICAgICAgICAgICAgICAgIGFkZHJlc3NUeXBlOiBhZGRyVHlwZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBxdWVyeSxcbiAgICAgICAgICAgICAgICBpc0tub3duOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NhbmNlbFRocmVlcGlkTG9va3VwKSB0aGlzLl9jYW5jZWxUaHJlZXBpZExvb2t1cCgpO1xuICAgICAgICAgICAgaWYgKGFkZHJUeXBlID09PSAnZW1haWwnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9va3VwVGhyZWVwaWQoYWRkclR5cGUsIHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHN1Z2dlc3RlZExpc3QsXG4gICAgICAgICAgICBpbnZhbGlkQWRkcmVzc0Vycm9yOiBmYWxzZSxcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWRkcmVzc1NlbGVjdG9yKSB0aGlzLmFkZHJlc3NTZWxlY3Rvci5tb3ZlU2VsZWN0aW9uVG9wKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hZGRBZGRyZXNzZXNUb0xpc3QoYWRkcmVzc1RleHRzKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTGlzdCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRMaXN0LnNsaWNlKCk7XG5cbiAgICAgICAgbGV0IGhhc0Vycm9yID0gZmFsc2U7XG4gICAgICAgIGFkZHJlc3NUZXh0cy5mb3JFYWNoKChhZGRyZXNzVGV4dCkgPT4ge1xuICAgICAgICAgICAgYWRkcmVzc1RleHQgPSBhZGRyZXNzVGV4dC50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBhZGRyVHlwZSA9IGdldEFkZHJlc3NUeXBlKGFkZHJlc3NUZXh0KTtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJPYmogPSB7XG4gICAgICAgICAgICAgICAgYWRkcmVzc1R5cGU6IGFkZHJUeXBlLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IGFkZHJlc3NUZXh0LFxuICAgICAgICAgICAgICAgIGlzS25vd246IGZhbHNlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnZhbGlkQWRkcmVzc1R5cGVzLmluY2x1ZGVzKGFkZHJUeXBlKSkge1xuICAgICAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWRkclR5cGUgPT09ICdteC11c2VyLWlkJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcihhZGRyT2JqLmFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJPYmouZGlzcGxheU5hbWUgPSB1c2VyLmRpc3BsYXlOYW1lO1xuICAgICAgICAgICAgICAgICAgICBhZGRyT2JqLmF2YXRhck14YyA9IHVzZXIuYXZhdGFyVXJsO1xuICAgICAgICAgICAgICAgICAgICBhZGRyT2JqLmlzS25vd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWRkclR5cGUgPT09ICdteC1yb29tLWlkJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShhZGRyT2JqLmFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJPYmouZGlzcGxheU5hbWUgPSByb29tLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJPYmouYXZhdGFyTXhjID0gcm9vbS5hdmF0YXJVcmw7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJPYmouaXNLbm93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxlY3RlZExpc3QucHVzaChhZGRyT2JqKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZExpc3QsXG4gICAgICAgICAgICBzdWdnZXN0ZWRMaXN0OiBbXSxcbiAgICAgICAgICAgIHF1ZXJ5OiBcIlwiLFxuICAgICAgICAgICAgaW52YWxpZEFkZHJlc3NFcnJvcjogaGFzRXJyb3IgPyB0cnVlIDogdGhpcy5zdGF0ZS5pbnZhbGlkQWRkcmVzc0Vycm9yLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuX2NhbmNlbFRocmVlcGlkTG9va3VwKSB0aGlzLl9jYW5jZWxUaHJlZXBpZExvb2t1cCgpO1xuICAgICAgICByZXR1cm4gaGFzRXJyb3IgPyBudWxsIDogc2VsZWN0ZWRMaXN0O1xuICAgIH1cblxuICAgIGFzeW5jIF9sb29rdXBUaHJlZXBpZChtZWRpdW0sIGFkZHJlc3MpIHtcbiAgICAgICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuICAgICAgICAvLyBOb3RlIHRoYXQgd2UgY2FuJ3Qgc2FmZWx5IHJlbW92ZSB0aGlzIGFmdGVyIHdlJ3JlIGRvbmVcbiAgICAgICAgLy8gYmVjYXVzZSB3ZSBkb24ndCBrbm93IHRoYXQgaXQncyB0aGUgc2FtZSBvbmUsIHNvIHdlIGp1c3RcbiAgICAgICAgLy8gbGVhdmUgaXQ6IGl0J3MgcmVwbGFjaW5nIHRoZSBvbGQgb25lIGVhY2ggdGltZSBzbyBpdCdzXG4gICAgICAgIC8vIG5vdCBsaWtlIHRoZXkgbGVhay5cbiAgICAgICAgdGhpcy5fY2FuY2VsVGhyZWVwaWRMb29rdXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gd2FpdCBhIGJpdCB0byBsZXQgdGhlIHVzZXIgZmluaXNoIHR5cGluZ1xuICAgICAgICBhd2FpdCBzbGVlcCg1MDApO1xuICAgICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm4gbnVsbDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYXV0aENsaWVudCA9IG5ldyBJZGVudGl0eUF1dGhDbGllbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGlkZW50aXR5QWNjZXNzVG9rZW4gPSBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKCk7XG4gICAgICAgICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgY29uc3QgbG9va3VwID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmxvb2t1cFRocmVlUGlkKFxuICAgICAgICAgICAgICAgIG1lZGl1bSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCAvKiBjYWxsYmFjayAqLyxcbiAgICAgICAgICAgICAgICBpZGVudGl0eUFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChjYW5jZWxsZWQgfHwgbG9va3VwID09PSBudWxsIHx8ICFsb29rdXAubXhpZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHJvZmlsZUluZm8obG9va3VwLm14aWQpO1xuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCB8fCBwcm9maWxlID09PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc3VnZ2VzdGVkTGlzdDogW3tcbiAgICAgICAgICAgICAgICAgICAgLy8gYSBVc2VyQWRkcmVzc1R5cGVcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzc1R5cGU6IG1lZGl1bSxcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHByb2ZpbGUuZGlzcGxheW5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhck14YzogcHJvZmlsZS5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgICAgICBpc0tub3duOiB0cnVlLFxuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWFyY2hFcnJvcjogX3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIScpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0RmlsdGVyZWRTdWdnZXN0aW9ucygpIHtcbiAgICAgICAgLy8gbWFwIGFkZHJlc3NUeXBlID0+IHNldCBvZiBhZGRyZXNzZXMgdG8gYXZvaWQgTyhuKm0pIG9wZXJhdGlvblxuICAgICAgICBjb25zdCBzZWxlY3RlZEFkZHJlc3NlcyA9IHt9O1xuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkTGlzdC5mb3JFYWNoKCh7YWRkcmVzcywgYWRkcmVzc1R5cGV9KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNlbGVjdGVkQWRkcmVzc2VzW2FkZHJlc3NUeXBlXSkgc2VsZWN0ZWRBZGRyZXNzZXNbYWRkcmVzc1R5cGVdID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgc2VsZWN0ZWRBZGRyZXNzZXNbYWRkcmVzc1R5cGVdLmFkZChhZGRyZXNzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRmlsdGVyIG91dCBhbnkgYWRkcmVzc2VzIGluIHRoZSBhYm92ZSBhbHJlYWR5IHNlbGVjdGVkIGFkZHJlc3NlcyAobWF0Y2hpbmcgYm90aCB0eXBlIGFuZCBhZGRyZXNzKVxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5zdWdnZXN0ZWRMaXN0LmZpbHRlcigoe2FkZHJlc3MsIGFkZHJlc3NUeXBlfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICEoc2VsZWN0ZWRBZGRyZXNzZXNbYWRkcmVzc1R5cGVdICYmIHNlbGVjdGVkQWRkcmVzc2VzW2FkZHJlc3NUeXBlXS5oYXMoYWRkcmVzcykpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25QYXN0ZSA9IGUgPT4ge1xuICAgICAgICAvLyBQcmV2ZW50IHRoZSB0ZXh0IGJlaW5nIHBhc3RlZCBpbnRvIHRoZSB0ZXh0YXJlYVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YShcInRleHRcIik7XG4gICAgICAgIC8vIFByb2Nlc3MgaXQgYXMgYSBsaXN0IG9mIGFkZHJlc3NlcyB0byBhZGQgaW5zdGVhZFxuICAgICAgICB0aGlzLl9hZGRBZGRyZXNzZXNUb0xpc3QodGV4dC5zcGxpdCgvW1xccyxdKy8pKTtcbiAgICB9O1xuXG4gICAgb25Vc2VEZWZhdWx0SWRlbnRpdHlTZXJ2ZXJDbGljayA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBJUyBpbiBhY2NvdW50IGRhdGEuIEFjdHVhbGx5IHVzaW5nIGl0IG1heSB0cmlnZ2VyIHRlcm1zLlxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvcnVsZXMtb2YtaG9va3NcbiAgICAgICAgdXNlRGVmYXVsdElkZW50aXR5U2VydmVyKCk7XG5cbiAgICAgICAgLy8gQWRkIGVtYWlsIGFzIGEgdmFsaWQgYWRkcmVzcyB0eXBlLlxuICAgICAgICBjb25zdCB7IHZhbGlkQWRkcmVzc1R5cGVzIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YWxpZEFkZHJlc3NUeXBlcy5wdXNoKCdlbWFpbCcpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsaWRBZGRyZXNzVHlwZXMgfSk7XG4gICAgfTtcblxuICAgIG9uTWFuYWdlU2V0dGluZ3NDbGljayA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3VXNlclNldHRpbmdzKTtcbiAgICAgICAgdGhpcy5vbkNhbmNlbCgpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgY29uc3QgQWRkcmVzc1NlbGVjdG9yID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkFkZHJlc3NTZWxlY3RvclwiKTtcbiAgICAgICAgdGhpcy5zY3JvbGxFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICBsZXQgaW5wdXRMYWJlbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGlucHV0TGFiZWwgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cInRleHRpbnB1dFwiPnt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufTwvbGFiZWw+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBxdWVyeSA9IFtdO1xuICAgICAgICAvLyBjcmVhdGUgdGhlIGludml0ZSBsaXN0XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBBZGRyZXNzVGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5BZGRyZXNzVGlsZVwiKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdGF0ZS5zZWxlY3RlZExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBxdWVyeS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8QWRkcmVzc1RpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M9e3RoaXMuc3RhdGUuc2VsZWN0ZWRMaXN0W2ldfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuRGlzbWlzcz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGlzbWlzc2VkPXt0aGlzLm9uRGlzbWlzc2VkKGkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0FkZHJlc3M9e3RoaXMucHJvcHMucGlja2VyVHlwZSA9PT0gJ3VzZXInfSAvPixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRoZSBxdWVyeSBhdCB0aGUgZW5kXG4gICAgICAgIHF1ZXJ5LnB1c2goXG4gICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgICBrZXk9e3RoaXMuc3RhdGUuc2VsZWN0ZWRMaXN0Lmxlbmd0aH1cbiAgICAgICAgICAgICAgICBvblBhc3RlPXt0aGlzLl9vblBhc3RlfVxuICAgICAgICAgICAgICAgIHJvd3M9XCIxXCJcbiAgICAgICAgICAgICAgICBpZD1cInRleHRpbnB1dFwiXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLl90ZXh0aW5wdXR9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1BpY2tlckRpYWxvZ19pbnB1dFwiXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25RdWVyeUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMuZ2V0UGxhY2Vob2xkZXIoKX1cbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e3RoaXMucHJvcHMudmFsdWV9XG4gICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0aGlzLnByb3BzLmZvY3VzfT5cbiAgICAgICAgICAgIDwvdGV4dGFyZWE+LFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkU3VnZ2VzdGVkTGlzdCA9IHRoaXMuX2dldEZpbHRlcmVkU3VnZ2VzdGlvbnMoKTtcblxuICAgICAgICBsZXQgZXJyb3I7XG4gICAgICAgIGxldCBhZGRyZXNzU2VsZWN0b3I7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmludmFsaWRBZGRyZXNzRXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkVHlwZURlc2NyaXB0aW9ucyA9IHRoaXMuc3RhdGUudmFsaWRBZGRyZXNzVHlwZXMubWFwKCh0KSA9PiBfdChhZGRyZXNzVHlwZU5hbWVbdF0pKTtcbiAgICAgICAgICAgIGVycm9yID0gPGRpdiBjbGFzc05hbWU9XCJteF9BZGRyZXNzUGlja2VyRGlhbG9nX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIllvdSBoYXZlIGVudGVyZWQgYW4gaW52YWxpZCBhZGRyZXNzLlwiKSB9XG4gICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgeyBfdChcIlRyeSB1c2luZyBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWxpZCBhZGRyZXNzIHR5cGVzOiAlKHZhbGlkVHlwZXNMaXN0KXMuXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWRUeXBlc0xpc3Q6IHZhbGlkVHlwZURlc2NyaXB0aW9ucy5qb2luKFwiLCBcIiksXG4gICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc2VhcmNoRXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gPGRpdiBjbGFzc05hbWU9XCJteF9BZGRyZXNzUGlja2VyRGlhbG9nX2Vycm9yXCI+eyB0aGlzLnN0YXRlLnNlYXJjaEVycm9yIH08L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5xdWVyeS5sZW5ndGggPiAwICYmIGZpbHRlcmVkU3VnZ2VzdGVkTGlzdC5sZW5ndGggPT09IDAgJiYgIXRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgZXJyb3IgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfZXJyb3JcIj57IF90KFwiTm8gcmVzdWx0c1wiKSB9PC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkcmVzc1NlbGVjdG9yID0gKFxuICAgICAgICAgICAgICAgIDxBZGRyZXNzU2VsZWN0b3IgcmVmPXsocmVmKSA9PiB7dGhpcy5hZGRyZXNzU2VsZWN0b3IgPSByZWY7fX1cbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzc0xpc3Q9e2ZpbHRlcmVkU3VnZ2VzdGVkTGlzdH1cbiAgICAgICAgICAgICAgICAgICAgc2hvd0FkZHJlc3M9e3RoaXMucHJvcHMucGlja2VyVHlwZSA9PT0gJ3VzZXInfVxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdGVkPXt0aGlzLm9uU2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgICAgIHRydW5jYXRlQXQ9e1RSVU5DQVRFX1FVRVJZX0xJU1R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaWRlbnRpdHlTZXJ2ZXI7XG4gICAgICAgIC8vIElmIHBpY2tlciBjYW5ub3QgY3VycmVudGx5IGFjY2VwdCBlLW1haWwgYnV0IHNob3VsZCBiZSBhYmxlIHRvXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBpY2tlclR5cGUgPT09ICd1c2VyJyAmJiAhdGhpcy5zdGF0ZS52YWxpZEFkZHJlc3NUeXBlcy5pbmNsdWRlcygnZW1haWwnKVxuICAgICAgICAgICAgJiYgdGhpcy5wcm9wcy52YWxpZEFkZHJlc3NUeXBlcy5pbmNsdWRlcygnZW1haWwnKSkge1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdElkZW50aXR5U2VydmVyVXJsID0gZ2V0RGVmYXVsdElkZW50aXR5U2VydmVyVXJsKCk7XG4gICAgICAgICAgICBpZiAoZGVmYXVsdElkZW50aXR5U2VydmVyVXJsKSB7XG4gICAgICAgICAgICAgICAgaWRlbnRpdHlTZXJ2ZXIgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dfaWRlbnRpdHlTZXJ2ZXJcIj57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVXNlIGFuIGlkZW50aXR5IHNlcnZlciB0byBpbnZpdGUgYnkgZW1haWwuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8ZGVmYXVsdD5Vc2UgdGhlIGRlZmF1bHQgKCUoZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZSlzKTwvZGVmYXVsdD4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIm9yIG1hbmFnZSBpbiA8c2V0dGluZ3M+U2V0dGluZ3M8L3NldHRpbmdzPi5cIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdElkZW50aXR5U2VydmVyTmFtZTogYWJicmV2aWF0ZVVybChkZWZhdWx0SWRlbnRpdHlTZXJ2ZXJVcmwpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBzdWIgPT4gPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXt0aGlzLm9uVXNlRGVmYXVsdElkZW50aXR5U2VydmVyQ2xpY2t9PntzdWJ9PC9hPixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiBzdWIgPT4gPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXt0aGlzLm9uTWFuYWdlU2V0dGluZ3NDbGlja30+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICl9PC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZGVudGl0eVNlcnZlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1BpY2tlckRpYWxvZ19pZGVudGl0eVNlcnZlclwiPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJVc2UgYW4gaWRlbnRpdHkgc2VydmVyIHRvIGludml0ZSBieSBlbWFpbC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIk1hbmFnZSBpbiA8c2V0dGluZ3M+U2V0dGluZ3M8L3NldHRpbmdzPi5cIixcbiAgICAgICAgICAgICAgICAgICAge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiBzdWIgPT4gPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXt0aGlzLm9uTWFuYWdlU2V0dGluZ3NDbGlja30+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICl9PC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0FkZHJlc3NQaWNrZXJEaWFsb2dcIiBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH0gdGl0bGU9e3RoaXMucHJvcHMudGl0bGV9PlxuICAgICAgICAgICAgICAgIHtpbnB1dExhYmVsfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BZGRyZXNzUGlja2VyRGlhbG9nX2lucHV0Q29udGFpbmVyXCI+eyBxdWVyeSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgZXJyb3IgfVxuICAgICAgICAgICAgICAgICAgICB7IGFkZHJlc3NTZWxlY3RvciB9XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5leHRyYU5vZGUgfVxuICAgICAgICAgICAgICAgICAgICB7IGlkZW50aXR5U2VydmVyIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXt0aGlzLnByb3BzLmJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25CdXR0b25DbGlja31cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9IC8+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19