"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _EditableItemList = _interopRequireDefault(require("../elements/EditableItemList"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _RoomPublishSetting = _interopRequireDefault(require("./RoomPublishSetting"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

class EditableAliasesList extends _EditableItemList.default {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onAliasAdded", async () => {
      await this._aliasField.current.validate({
        allowEmpty: false
      });

      if (this._aliasField.current.isValid) {
        if (this.props.onItemAdded) this.props.onItemAdded(this.props.newItem);
        return;
      }

      this._aliasField.current.focus();

      this._aliasField.current.validate({
        allowEmpty: false,
        focused: true
      });
    });
    this._aliasField = /*#__PURE__*/(0, _react.createRef)();
  }

  _renderNewItemField() {
    // if we don't need the RoomAliasField,
    // we don't need to overriden version of _renderNewItemField
    if (!this.props.domain) {
      return super._renderNewItemField();
    }

    const RoomAliasField = sdk.getComponent('views.elements.RoomAliasField');

    const onChange = alias => this._onNewItemChanged({
      target: {
        value: alias
      }
    });

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onAliasAdded,
      autoComplete: "off",
      noValidate: true,
      className: "mx_EditableItemList_newItem"
    }, /*#__PURE__*/_react.default.createElement(RoomAliasField, {
      ref: this._aliasField,
      onChange: onChange,
      value: this.props.newItem || "",
      domain: this.props.domain
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onAliasAdded,
      kind: "primary"
    }, (0, _languageHandler._t)("Add")));
  }

}

let AliasSettings = (_dec = (0, _replaceableComponent.replaceableComponent)("views.room_settings.AliasSettings"), _dec(_class = (_temp = _class2 = class AliasSettings extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onNewAliasChanged", value => {
      this.setState({
        newAlias: value
      });
    });
    (0, _defineProperty2.default)(this, "onLocalAliasAdded", alias => {
      if (!alias || alias.length === 0) return; // ignore attempts to create blank aliases

      const localDomain = _MatrixClientPeg.MatrixClientPeg.get().getDomain();

      if (!alias.includes(':')) alias += ':' + localDomain;

      _MatrixClientPeg.MatrixClientPeg.get().createAlias(alias, this.props.roomId).then(() => {
        this.setState({
          localAliases: this.state.localAliases.concat(alias),
          newAlias: null
        });

        if (!this.state.canonicalAlias) {
          this.changeCanonicalAlias(alias);
        }
      }).catch(err => {
        console.error(err);

        _Modal.default.createTrackedDialog('Error creating address', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error creating address"),
          description: (0, _languageHandler._t)("There was an error creating that address. It may not be allowed by the server " + "or a temporary failure occurred.")
        });
      });
    });
    (0, _defineProperty2.default)(this, "onLocalAliasDeleted", index => {
      const alias = this.state.localAliases[index]; // TODO: In future, we should probably be making sure that the alias actually belongs
      // to this room. See https://github.com/vector-im/element-web/issues/7353

      _MatrixClientPeg.MatrixClientPeg.get().deleteAlias(alias).then(() => {
        const localAliases = this.state.localAliases.filter(a => a !== alias);
        this.setState({
          localAliases
        });

        if (this.state.canonicalAlias === alias) {
          this.changeCanonicalAlias(null);
        }
      }).catch(err => {
        console.error(err);
        let description;

        if (err.errcode === "M_FORBIDDEN") {
          description = (0, _languageHandler._t)("You don't have permission to delete the address.");
        } else {
          description = (0, _languageHandler._t)("There was an error removing that address. It may no longer exist or a temporary " + "error occurred.");
        }

        _Modal.default.createTrackedDialog('Error removing address', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error removing address"),
          description
        });
      });
    });
    (0, _defineProperty2.default)(this, "onLocalAliasesToggled", event => {
      // expanded
      if (event.target.open) {
        // if local aliases haven't been preloaded yet at component mount
        if (!this.props.canSetCanonicalAlias && this.state.localAliases.length === 0) {
          this.loadLocalAliases();
        }
      }

      this.setState({
        detailsOpen: event.target.open
      });
    });
    (0, _defineProperty2.default)(this, "onCanonicalAliasChange", event => {
      this.changeCanonicalAlias(event.target.value);
    });
    (0, _defineProperty2.default)(this, "onNewAltAliasChanged", value => {
      this.setState({
        newAltAlias: value
      });
    });
    (0, _defineProperty2.default)(this, "onAltAliasAdded", alias => {
      const altAliases = this.state.altAliases.slice();

      if (!altAliases.some(a => a.trim() === alias.trim())) {
        altAliases.push(alias.trim());
        this.changeAltAliases(altAliases);
        this.setState({
          newAltAlias: ""
        });
      }
    });
    (0, _defineProperty2.default)(this, "onAltAliasDeleted", index => {
      const altAliases = this.state.altAliases.slice();
      altAliases.splice(index, 1);
      this.changeAltAliases(altAliases);
    });
    const state = {
      altAliases: [],
      // [ #alias:domain.tld, ... ]
      localAliases: [],
      // [ #alias:my-hs.tld, ... ]
      canonicalAlias: null,
      // #canonical:domain.tld
      updatingCanonicalAlias: false,
      localAliasesLoading: false,
      detailsOpen: false
    };

    if (props.canonicalAliasEvent) {
      const content = props.canonicalAliasEvent.getContent();
      const altAliases = content.alt_aliases;

      if (Array.isArray(altAliases)) {
        state.altAliases = altAliases.slice();
      }

      state.canonicalAlias = content.alias;
    }

    this.state = state;
  }

  componentDidMount() {
    if (this.props.canSetCanonicalAlias) {
      // load local aliases for providing recommendations
      // for the canonical alias and alt_aliases
      this.loadLocalAliases();
    }
  }

  async loadLocalAliases() {
    this.setState({
      localAliasesLoading: true
    });

    try {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      let localAliases = [];

      if (await cli.doesServerSupportUnstableFeature("org.matrix.msc2432")) {
        const response = await cli.unstableGetLocalAliases(this.props.roomId);

        if (Array.isArray(response.aliases)) {
          localAliases = response.aliases;
        }
      }

      this.setState({
        localAliases
      });
    } finally {
      this.setState({
        localAliasesLoading: false
      });
    }
  }

  changeCanonicalAlias(alias) {
    if (!this.props.canSetCanonicalAlias) return;
    const oldAlias = this.state.canonicalAlias;
    this.setState({
      canonicalAlias: alias,
      updatingCanonicalAlias: true
    });
    const eventContent = {
      alt_aliases: this.state.altAliases
    };
    if (alias) eventContent["alias"] = alias;

    _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(this.props.roomId, "m.room.canonical_alias", eventContent, "").catch(err => {
      console.error(err);

      _Modal.default.createTrackedDialog('Error updating main address', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)("Error updating main address"),
        description: (0, _languageHandler._t)("There was an error updating the room's main address. It may not be allowed by the server " + "or a temporary failure occurred.")
      });

      this.setState({
        canonicalAlias: oldAlias
      });
    }).finally(() => {
      this.setState({
        updatingCanonicalAlias: false
      });
    });
  }

  changeAltAliases(altAliases) {
    if (!this.props.canSetCanonicalAlias) return;
    this.setState({
      updatingCanonicalAlias: true,
      altAliases
    });
    const eventContent = {};

    if (this.state.canonicalAlias) {
      eventContent.alias = this.state.canonicalAlias;
    }

    if (altAliases) {
      eventContent["alt_aliases"] = altAliases;
    }

    _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(this.props.roomId, "m.room.canonical_alias", eventContent, "").catch(err => {
      console.error(err);

      _Modal.default.createTrackedDialog('Error updating alternative addresses', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)("Error updating main address"),
        description: (0, _languageHandler._t)("There was an error updating the room's alternative addresses. " + "It may not be allowed by the server or a temporary failure occurred.")
      });
    }).finally(() => {
      this.setState({
        updatingCanonicalAlias: false
      });
    });
  }

  _getAliases() {
    return this.state.altAliases.concat(this._getLocalNonAltAliases());
  }

  _getLocalNonAltAliases() {
    const {
      altAliases
    } = this.state;
    return this.state.localAliases.filter(alias => !altAliases.includes(alias));
  }

  render() {
    const localDomain = _MatrixClientPeg.MatrixClientPeg.get().getDomain();

    let found = false;
    const canonicalValue = this.state.canonicalAlias || "";

    const canonicalAliasSection = /*#__PURE__*/_react.default.createElement(_Field.default, {
      onChange: this.onCanonicalAliasChange,
      value: canonicalValue,
      disabled: this.state.updatingCanonicalAlias || !this.props.canSetCanonicalAlias,
      element: "select",
      id: "canonicalAlias",
      label: (0, _languageHandler._t)('Main address')
    }, /*#__PURE__*/_react.default.createElement("option", {
      value: "",
      key: "unset"
    }, (0, _languageHandler._t)('not specified')), this._getAliases().map((alias, i) => {
      if (alias === this.state.canonicalAlias) found = true;
      return /*#__PURE__*/_react.default.createElement("option", {
        value: alias,
        key: i
      }, alias);
    }), found || !this.state.canonicalAlias ? '' : /*#__PURE__*/_react.default.createElement("option", {
      value: this.state.canonicalAlias,
      key: "arbitrary"
    }, this.state.canonicalAlias));

    let localAliasesList;

    if (this.state.localAliasesLoading) {
      const Spinner = sdk.getComponent("elements.Spinner");
      localAliasesList = /*#__PURE__*/_react.default.createElement(Spinner, null);
    } else {
      localAliasesList = /*#__PURE__*/_react.default.createElement(EditableAliasesList, {
        id: "roomAliases",
        className: "mx_RoomSettings_localAliases",
        items: this.state.localAliases,
        newItem: this.state.newAlias,
        onNewItemChanged: this.onNewAliasChanged,
        canRemove: this.props.canSetAliases,
        canEdit: this.props.canSetAliases,
        onItemAdded: this.onLocalAliasAdded,
        onItemRemoved: this.onLocalAliasDeleted,
        noItemsLabel: (0, _languageHandler._t)('This room has no local addresses'),
        placeholder: (0, _languageHandler._t)('Local address'),
        domain: localDomain
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AliasSettings"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Published Addresses")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Published addresses can be used by anyone on any server to join your room. " + "To publish an address, it needs to be set as a local address first.")), canonicalAliasSection, /*#__PURE__*/_react.default.createElement(_RoomPublishSetting.default, {
      roomId: this.props.roomId,
      canSetCanonicalAlias: this.props.canSetCanonicalAlias
    }), /*#__PURE__*/_react.default.createElement("datalist", {
      id: "mx_AliasSettings_altRecommendations"
    }, this._getLocalNonAltAliases().map(alias => {
      return /*#__PURE__*/_react.default.createElement("option", {
        value: alias,
        key: alias
      });
    }), ";"), /*#__PURE__*/_react.default.createElement(EditableAliasesList, {
      id: "roomAltAliases",
      className: "mx_RoomSettings_altAliases",
      items: this.state.altAliases,
      newItem: this.state.newAltAlias,
      onNewItemChanged: this.onNewAltAliasChanged,
      canRemove: this.props.canSetCanonicalAlias,
      canEdit: this.props.canSetCanonicalAlias,
      onItemAdded: this.onAltAliasAdded,
      onItemRemoved: this.onAltAliasDeleted,
      suggestionsListId: "mx_AliasSettings_altRecommendations",
      itemsLabel: (0, _languageHandler._t)('Other published addresses:'),
      noItemsLabel: (0, _languageHandler._t)('No other published addresses yet, add one below'),
      placeholder: (0, _languageHandler._t)('New published address (e.g. #alias:server)')
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading mx_AliasSettings_localAliasHeader"
    }, (0, _languageHandler._t)("Local Addresses")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Set addresses for this room so users can find this room through your homeserver (%(localDomain)s)", {
      localDomain
    })), /*#__PURE__*/_react.default.createElement("details", {
      onToggle: this.onLocalAliasesToggled
    }, /*#__PURE__*/_react.default.createElement("summary", null, this.state.detailsOpen ? (0, _languageHandler._t)('Show less') : (0, _languageHandler._t)("Show more")), localAliasesList));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  roomId: _propTypes.default.string.isRequired,
  canSetCanonicalAlias: _propTypes.default.bool.isRequired,
  canSetAliases: _propTypes.default.bool.isRequired,
  canonicalAliasEvent: _propTypes.default.object // MatrixEvent

}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  canSetAliases: false,
  canSetCanonicalAlias: false,
  aliasEvents: []
}), _temp)) || _class);
exports.default = AliasSettings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21fc2V0dGluZ3MvQWxpYXNTZXR0aW5ncy5qcyJdLCJuYW1lcyI6WyJFZGl0YWJsZUFsaWFzZXNMaXN0IiwiRWRpdGFibGVJdGVtTGlzdCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJfYWxpYXNGaWVsZCIsImN1cnJlbnQiLCJ2YWxpZGF0ZSIsImFsbG93RW1wdHkiLCJpc1ZhbGlkIiwib25JdGVtQWRkZWQiLCJuZXdJdGVtIiwiZm9jdXMiLCJmb2N1c2VkIiwiX3JlbmRlck5ld0l0ZW1GaWVsZCIsImRvbWFpbiIsIlJvb21BbGlhc0ZpZWxkIiwic2RrIiwiZ2V0Q29tcG9uZW50Iiwib25DaGFuZ2UiLCJhbGlhcyIsIl9vbk5ld0l0ZW1DaGFuZ2VkIiwidGFyZ2V0IiwidmFsdWUiLCJfb25BbGlhc0FkZGVkIiwiQWxpYXNTZXR0aW5ncyIsIlJlYWN0IiwiQ29tcG9uZW50Iiwic2V0U3RhdGUiLCJuZXdBbGlhcyIsImxlbmd0aCIsImxvY2FsRG9tYWluIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0RG9tYWluIiwiaW5jbHVkZXMiLCJjcmVhdGVBbGlhcyIsInJvb21JZCIsInRoZW4iLCJsb2NhbEFsaWFzZXMiLCJzdGF0ZSIsImNvbmNhdCIsImNhbm9uaWNhbEFsaWFzIiwiY2hhbmdlQ2Fub25pY2FsQWxpYXMiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImluZGV4IiwiZGVsZXRlQWxpYXMiLCJmaWx0ZXIiLCJhIiwiZXJyY29kZSIsImV2ZW50Iiwib3BlbiIsImNhblNldENhbm9uaWNhbEFsaWFzIiwibG9hZExvY2FsQWxpYXNlcyIsImRldGFpbHNPcGVuIiwibmV3QWx0QWxpYXMiLCJhbHRBbGlhc2VzIiwic2xpY2UiLCJzb21lIiwidHJpbSIsInB1c2giLCJjaGFuZ2VBbHRBbGlhc2VzIiwic3BsaWNlIiwidXBkYXRpbmdDYW5vbmljYWxBbGlhcyIsImxvY2FsQWxpYXNlc0xvYWRpbmciLCJjYW5vbmljYWxBbGlhc0V2ZW50IiwiY29udGVudCIsImdldENvbnRlbnQiLCJhbHRfYWxpYXNlcyIsIkFycmF5IiwiaXNBcnJheSIsImNvbXBvbmVudERpZE1vdW50IiwiY2xpIiwiZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUiLCJyZXNwb25zZSIsInVuc3RhYmxlR2V0TG9jYWxBbGlhc2VzIiwiYWxpYXNlcyIsIm9sZEFsaWFzIiwiZXZlbnRDb250ZW50Iiwic2VuZFN0YXRlRXZlbnQiLCJmaW5hbGx5IiwiX2dldEFsaWFzZXMiLCJfZ2V0TG9jYWxOb25BbHRBbGlhc2VzIiwicmVuZGVyIiwiZm91bmQiLCJjYW5vbmljYWxWYWx1ZSIsImNhbm9uaWNhbEFsaWFzU2VjdGlvbiIsIm9uQ2Fub25pY2FsQWxpYXNDaGFuZ2UiLCJtYXAiLCJpIiwibG9jYWxBbGlhc2VzTGlzdCIsIlNwaW5uZXIiLCJvbk5ld0FsaWFzQ2hhbmdlZCIsImNhblNldEFsaWFzZXMiLCJvbkxvY2FsQWxpYXNBZGRlZCIsIm9uTG9jYWxBbGlhc0RlbGV0ZWQiLCJvbk5ld0FsdEFsaWFzQ2hhbmdlZCIsIm9uQWx0QWxpYXNBZGRlZCIsIm9uQWx0QWxpYXNEZWxldGVkIiwib25Mb2NhbEFsaWFzZXNUb2dnbGVkIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwiaXNSZXF1aXJlZCIsImJvb2wiLCJvYmplY3QiLCJhbGlhc0V2ZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLG1CQUFOLFNBQWtDQyx5QkFBbEMsQ0FBbUQ7QUFDL0NDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHlE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bkUsS0FBTCxDQUFXc0IsV0FBWCxHQUF5Qix5QkFBRyxXQUFILENBQXpCLEdBQTJDLHlCQUFHLFdBQUgsQ0FBdEQsQ0FESixFQUVLb0MsZ0JBRkwsQ0E1QkosQ0FESjtBQW1DSDs7QUE5VHNELEMsc0RBQ3BDO0FBQ2Y3RCxFQUFBQSxNQUFNLEVBQUV1RSxtQkFBVUMsTUFBVixDQUFpQkMsVUFEVjtBQUVmbEQsRUFBQUEsb0JBQW9CLEVBQUVnRCxtQkFBVUcsSUFBVixDQUFlRCxVQUZ0QjtBQUdmVCxFQUFBQSxhQUFhLEVBQUVPLG1CQUFVRyxJQUFWLENBQWVELFVBSGY7QUFJZnJDLEVBQUFBLG1CQUFtQixFQUFFbUMsbUJBQVVJLE1BSmhCLENBSXdCOztBQUp4QixDLDBEQU9HO0FBQ2xCWCxFQUFBQSxhQUFhLEVBQUUsS0FERztBQUVsQnpDLEVBQUFBLG9CQUFvQixFQUFFLEtBRko7QUFHbEJxRCxFQUFBQSxXQUFXLEVBQUU7QUFISyxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBFZGl0YWJsZUl0ZW1MaXN0IGZyb20gXCIuLi9lbGVtZW50cy9FZGl0YWJsZUl0ZW1MaXN0XCI7XG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFJvb21QdWJsaXNoU2V0dGluZyBmcm9tIFwiLi9Sb29tUHVibGlzaFNldHRpbmdcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5jbGFzcyBFZGl0YWJsZUFsaWFzZXNMaXN0IGV4dGVuZHMgRWRpdGFibGVJdGVtTGlzdCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuX2FsaWFzRmllbGQgPSBjcmVhdGVSZWYoKTtcbiAgICB9XG5cbiAgICBfb25BbGlhc0FkZGVkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLl9hbGlhc0ZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcblxuICAgICAgICBpZiAodGhpcy5fYWxpYXNGaWVsZC5jdXJyZW50LmlzVmFsaWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uSXRlbUFkZGVkKSB0aGlzLnByb3BzLm9uSXRlbUFkZGVkKHRoaXMucHJvcHMubmV3SXRlbSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hbGlhc0ZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgdGhpcy5fYWxpYXNGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgfTtcblxuICAgIF9yZW5kZXJOZXdJdGVtRmllbGQoKSB7XG4gICAgICAgIC8vIGlmIHdlIGRvbid0IG5lZWQgdGhlIFJvb21BbGlhc0ZpZWxkLFxuICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIG92ZXJyaWRlbiB2ZXJzaW9uIG9mIF9yZW5kZXJOZXdJdGVtRmllbGRcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmRvbWFpbikge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLl9yZW5kZXJOZXdJdGVtRmllbGQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBSb29tQWxpYXNGaWVsZCA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLlJvb21BbGlhc0ZpZWxkJyk7XG4gICAgICAgIGNvbnN0IG9uQ2hhbmdlID0gKGFsaWFzKSA9PiB0aGlzLl9vbk5ld0l0ZW1DaGFuZ2VkKHt0YXJnZXQ6IHt2YWx1ZTogYWxpYXN9fSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Zm9ybVxuICAgICAgICAgICAgICAgIG9uU3VibWl0PXt0aGlzLl9vbkFsaWFzQWRkZWR9XG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICBub1ZhbGlkYXRlPXt0cnVlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbUxpc3RfbmV3SXRlbVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFJvb21BbGlhc0ZpZWxkXG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5fYWxpYXNGaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5uZXdJdGVtIHx8IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbj17dGhpcy5wcm9wcy5kb21haW59IC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25BbGlhc0FkZGVkfSBraW5kPVwicHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQWRkXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tX3NldHRpbmdzLkFsaWFzU2V0dGluZ3NcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFsaWFzU2V0dGluZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb21JZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBjYW5TZXRDYW5vbmljYWxBbGlhczogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICAgICAgY2FuU2V0QWxpYXNlczogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICAgICAgY2Fub25pY2FsQWxpYXNFdmVudDogUHJvcFR5cGVzLm9iamVjdCwgLy8gTWF0cml4RXZlbnRcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgY2FuU2V0QWxpYXNlczogZmFsc2UsXG4gICAgICAgIGNhblNldENhbm9uaWNhbEFsaWFzOiBmYWxzZSxcbiAgICAgICAgYWxpYXNFdmVudHM6IFtdLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSB7XG4gICAgICAgICAgICBhbHRBbGlhc2VzOiBbXSwgLy8gWyAjYWxpYXM6ZG9tYWluLnRsZCwgLi4uIF1cbiAgICAgICAgICAgIGxvY2FsQWxpYXNlczogW10sIC8vIFsgI2FsaWFzOm15LWhzLnRsZCwgLi4uIF1cbiAgICAgICAgICAgIGNhbm9uaWNhbEFsaWFzOiBudWxsLCAvLyAjY2Fub25pY2FsOmRvbWFpbi50bGRcbiAgICAgICAgICAgIHVwZGF0aW5nQ2Fub25pY2FsQWxpYXM6IGZhbHNlLFxuICAgICAgICAgICAgbG9jYWxBbGlhc2VzTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBkZXRhaWxzT3BlbjogZmFsc2UsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHByb3BzLmNhbm9uaWNhbEFsaWFzRXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBwcm9wcy5jYW5vbmljYWxBbGlhc0V2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGFsdEFsaWFzZXMgPSBjb250ZW50LmFsdF9hbGlhc2VzO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYWx0QWxpYXNlcykpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5hbHRBbGlhc2VzID0gYWx0QWxpYXNlcy5zbGljZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGUuY2Fub25pY2FsQWxpYXMgPSBjb250ZW50LmFsaWFzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhcykge1xuICAgICAgICAgICAgLy8gbG9hZCBsb2NhbCBhbGlhc2VzIGZvciBwcm92aWRpbmcgcmVjb21tZW5kYXRpb25zXG4gICAgICAgICAgICAvLyBmb3IgdGhlIGNhbm9uaWNhbCBhbGlhcyBhbmQgYWx0X2FsaWFzZXNcbiAgICAgICAgICAgIHRoaXMubG9hZExvY2FsQWxpYXNlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgbG9hZExvY2FsQWxpYXNlcygpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvY2FsQWxpYXNlc0xvYWRpbmc6IHRydWUgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICBsZXQgbG9jYWxBbGlhc2VzID0gW107XG4gICAgICAgICAgICBpZiAoYXdhaXQgY2xpLmRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlKFwib3JnLm1hdHJpeC5tc2MyNDMyXCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjbGkudW5zdGFibGVHZXRMb2NhbEFsaWFzZXModGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3BvbnNlLmFsaWFzZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsQWxpYXNlcyA9IHJlc3BvbnNlLmFsaWFzZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvY2FsQWxpYXNlcyB9KTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2NhbEFsaWFzZXNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZUNhbm9uaWNhbEFsaWFzKGFsaWFzKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhcykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG9sZEFsaWFzID0gdGhpcy5zdGF0ZS5jYW5vbmljYWxBbGlhcztcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjYW5vbmljYWxBbGlhczogYWxpYXMsXG4gICAgICAgICAgICB1cGRhdGluZ0Nhbm9uaWNhbEFsaWFzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBldmVudENvbnRlbnQgPSB7XG4gICAgICAgICAgICBhbHRfYWxpYXNlczogdGhpcy5zdGF0ZS5hbHRBbGlhc2VzLFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhbGlhcykgZXZlbnRDb250ZW50W1wiYWxpYXNcIl0gPSBhbGlhcztcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmNhbm9uaWNhbF9hbGlhc1wiLFxuICAgICAgICAgICAgZXZlbnRDb250ZW50LCBcIlwiKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdFcnJvciB1cGRhdGluZyBtYWluIGFkZHJlc3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvciB1cGRhdGluZyBtYWluIGFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGRhdGluZyB0aGUgcm9vbSdzIG1haW4gYWRkcmVzcy4gSXQgbWF5IG5vdCBiZSBhbGxvd2VkIGJ5IHRoZSBzZXJ2ZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIm9yIGEgdGVtcG9yYXJ5IGZhaWx1cmUgb2NjdXJyZWQuXCIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y2Fub25pY2FsQWxpYXM6IG9sZEFsaWFzfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dXBkYXRpbmdDYW5vbmljYWxBbGlhczogZmFsc2V9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2hhbmdlQWx0QWxpYXNlcyhhbHRBbGlhc2VzKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhcykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXBkYXRpbmdDYW5vbmljYWxBbGlhczogdHJ1ZSxcbiAgICAgICAgICAgIGFsdEFsaWFzZXMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50Q29udGVudCA9IHt9O1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzKSB7XG4gICAgICAgICAgICBldmVudENvbnRlbnQuYWxpYXMgPSB0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbHRBbGlhc2VzKSB7XG4gICAgICAgICAgICBldmVudENvbnRlbnRbXCJhbHRfYWxpYXNlc1wiXSA9IGFsdEFsaWFzZXM7XG4gICAgICAgIH1cblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsIFwibS5yb29tLmNhbm9uaWNhbF9hbGlhc1wiLFxuICAgICAgICAgICAgZXZlbnRDb250ZW50LCBcIlwiKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdFcnJvciB1cGRhdGluZyBhbHRlcm5hdGl2ZSBhZGRyZXNzZXMnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvciB1cGRhdGluZyBtYWluIGFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoZXJlIHdhcyBhbiBlcnJvciB1cGRhdGluZyB0aGUgcm9vbSdzIGFsdGVybmF0aXZlIGFkZHJlc3Nlcy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIkl0IG1heSBub3QgYmUgYWxsb3dlZCBieSB0aGUgc2VydmVyIG9yIGEgdGVtcG9yYXJ5IGZhaWx1cmUgb2NjdXJyZWQuXCIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3VwZGF0aW5nQ2Fub25pY2FsQWxpYXM6IGZhbHNlfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uTmV3QWxpYXNDaGFuZ2VkID0gKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe25ld0FsaWFzOiB2YWx1ZX0pO1xuICAgIH07XG5cbiAgICBvbkxvY2FsQWxpYXNBZGRlZCA9IChhbGlhcykgPT4ge1xuICAgICAgICBpZiAoIWFsaWFzIHx8IGFsaWFzLmxlbmd0aCA9PT0gMCkgcmV0dXJuOyAvLyBpZ25vcmUgYXR0ZW1wdHMgdG8gY3JlYXRlIGJsYW5rIGFsaWFzZXNcblxuICAgICAgICBjb25zdCBsb2NhbERvbWFpbiA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKTtcbiAgICAgICAgaWYgKCFhbGlhcy5pbmNsdWRlcygnOicpKSBhbGlhcyArPSAnOicgKyBsb2NhbERvbWFpbjtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlYXRlQWxpYXMoYWxpYXMsIHRoaXMucHJvcHMucm9vbUlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvY2FsQWxpYXNlczogdGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXMuY29uY2F0KGFsaWFzKSxcbiAgICAgICAgICAgICAgICBuZXdBbGlhczogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VDYW5vbmljYWxBbGlhcyhhbGlhcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0Vycm9yIGNyZWF0aW5nIGFkZHJlc3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvciBjcmVhdGluZyBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGVyZSB3YXMgYW4gZXJyb3IgY3JlYXRpbmcgdGhhdCBhZGRyZXNzLiBJdCBtYXkgbm90IGJlIGFsbG93ZWQgYnkgdGhlIHNlcnZlciBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwib3IgYSB0ZW1wb3JhcnkgZmFpbHVyZSBvY2N1cnJlZC5cIixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbkxvY2FsQWxpYXNEZWxldGVkID0gKGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXNbaW5kZXhdO1xuICAgICAgICAvLyBUT0RPOiBJbiBmdXR1cmUsIHdlIHNob3VsZCBwcm9iYWJseSBiZSBtYWtpbmcgc3VyZSB0aGF0IHRoZSBhbGlhcyBhY3R1YWxseSBiZWxvbmdzXG4gICAgICAgIC8vIHRvIHRoaXMgcm9vbS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzczNTNcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRlbGV0ZUFsaWFzKGFsaWFzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQWxpYXNlcyA9IHRoaXMuc3RhdGUubG9jYWxBbGlhc2VzLmZpbHRlcihhID0+IGEgIT09IGFsaWFzKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvY2FsQWxpYXNlc30pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jYW5vbmljYWxBbGlhcyA9PT0gYWxpYXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUNhbm9uaWNhbEFsaWFzKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICBsZXQgZGVzY3JpcHRpb247XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT09IFwiTV9GT1JCSURERU5cIikge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCJZb3UgZG9uJ3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGRlbGV0ZSB0aGUgYWRkcmVzcy5cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVGhlcmUgd2FzIGFuIGVycm9yIHJlbW92aW5nIHRoYXQgYWRkcmVzcy4gSXQgbWF5IG5vIGxvbmdlciBleGlzdCBvciBhIHRlbXBvcmFyeSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZXJyb3Igb2NjdXJyZWQuXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0Vycm9yIHJlbW92aW5nIGFkZHJlc3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvciByZW1vdmluZyBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbkxvY2FsQWxpYXNlc1RvZ2dsZWQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgLy8gZXhwYW5kZWRcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5vcGVuKSB7XG4gICAgICAgICAgICAvLyBpZiBsb2NhbCBhbGlhc2VzIGhhdmVuJ3QgYmVlbiBwcmVsb2FkZWQgeWV0IGF0IGNvbXBvbmVudCBtb3VudFxuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNhblNldENhbm9uaWNhbEFsaWFzICYmIHRoaXMuc3RhdGUubG9jYWxBbGlhc2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZExvY2FsQWxpYXNlcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RldGFpbHNPcGVuOiBldmVudC50YXJnZXQub3Blbn0pO1xuICAgIH07XG5cbiAgICBvbkNhbm9uaWNhbEFsaWFzQ2hhbmdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuY2hhbmdlQ2Fub25pY2FsQWxpYXMoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgb25OZXdBbHRBbGlhc0NoYW5nZWQgPSAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bmV3QWx0QWxpYXM6IHZhbHVlfSk7XG4gICAgfVxuXG4gICAgb25BbHRBbGlhc0FkZGVkID0gKGFsaWFzKSA9PiB7XG4gICAgICAgIGNvbnN0IGFsdEFsaWFzZXMgPSB0aGlzLnN0YXRlLmFsdEFsaWFzZXMuc2xpY2UoKTtcbiAgICAgICAgaWYgKCFhbHRBbGlhc2VzLnNvbWUoYSA9PiBhLnRyaW0oKSA9PT0gYWxpYXMudHJpbSgpKSkge1xuICAgICAgICAgICAgYWx0QWxpYXNlcy5wdXNoKGFsaWFzLnRyaW0oKSk7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUFsdEFsaWFzZXMoYWx0QWxpYXNlcyk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtuZXdBbHRBbGlhczogXCJcIn0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25BbHRBbGlhc0RlbGV0ZWQgPSAoaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgYWx0QWxpYXNlcyA9IHRoaXMuc3RhdGUuYWx0QWxpYXNlcy5zbGljZSgpO1xuICAgICAgICBhbHRBbGlhc2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuY2hhbmdlQWx0QWxpYXNlcyhhbHRBbGlhc2VzKTtcbiAgICB9XG5cbiAgICBfZ2V0QWxpYXNlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuYWx0QWxpYXNlcy5jb25jYXQodGhpcy5fZ2V0TG9jYWxOb25BbHRBbGlhc2VzKCkpO1xuICAgIH1cblxuICAgIF9nZXRMb2NhbE5vbkFsdEFsaWFzZXMoKSB7XG4gICAgICAgIGNvbnN0IHthbHRBbGlhc2VzfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmxvY2FsQWxpYXNlcy5maWx0ZXIoYWxpYXMgPT4gIWFsdEFsaWFzZXMuaW5jbHVkZXMoYWxpYXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGxvY2FsRG9tYWluID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERvbWFpbigpO1xuXG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjYW5vbmljYWxWYWx1ZSA9IHRoaXMuc3RhdGUuY2Fub25pY2FsQWxpYXMgfHwgXCJcIjtcbiAgICAgICAgY29uc3QgY2Fub25pY2FsQWxpYXNTZWN0aW9uID0gKFxuICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DYW5vbmljYWxBbGlhc0NoYW5nZX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17Y2Fub25pY2FsVmFsdWV9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudXBkYXRpbmdDYW5vbmljYWxBbGlhcyB8fCAhdGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhc31cbiAgICAgICAgICAgICAgICBlbGVtZW50PSdzZWxlY3QnXG4gICAgICAgICAgICAgICAgaWQ9J2Nhbm9uaWNhbEFsaWFzJ1xuICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnTWFpbiBhZGRyZXNzJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiIGtleT1cInVuc2V0XCI+eyBfdCgnbm90IHNwZWNpZmllZCcpIH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2dldEFsaWFzZXMoKS5tYXAoKGFsaWFzLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxpYXMgPT09IHRoaXMuc3RhdGUuY2Fub25pY2FsQWxpYXMpIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT17YWxpYXN9IGtleT17aX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYWxpYXMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCB8fCAhdGhpcy5zdGF0ZS5jYW5vbmljYWxBbGlhcyA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9eyB0aGlzLnN0YXRlLmNhbm9uaWNhbEFsaWFzIH0ga2V5PSdhcmJpdHJhcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5jYW5vbmljYWxBbGlhcyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L0ZpZWxkPlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBsb2NhbEFsaWFzZXNMaXN0O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXNMb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICBsb2NhbEFsaWFzZXNMaXN0ID0gPFNwaW5uZXIgLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2NhbEFsaWFzZXNMaXN0ID0gKDxFZGl0YWJsZUFsaWFzZXNMaXN0XG4gICAgICAgICAgICAgICAgaWQ9XCJyb29tQWxpYXNlc1wiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtcIm14X1Jvb21TZXR0aW5nc19sb2NhbEFsaWFzZXNcIn1cbiAgICAgICAgICAgICAgICBpdGVtcz17dGhpcy5zdGF0ZS5sb2NhbEFsaWFzZXN9XG4gICAgICAgICAgICAgICAgbmV3SXRlbT17dGhpcy5zdGF0ZS5uZXdBbGlhc31cbiAgICAgICAgICAgICAgICBvbk5ld0l0ZW1DaGFuZ2VkPXt0aGlzLm9uTmV3QWxpYXNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIGNhblJlbW92ZT17dGhpcy5wcm9wcy5jYW5TZXRBbGlhc2VzfVxuICAgICAgICAgICAgICAgIGNhbkVkaXQ9e3RoaXMucHJvcHMuY2FuU2V0QWxpYXNlc31cbiAgICAgICAgICAgICAgICBvbkl0ZW1BZGRlZD17dGhpcy5vbkxvY2FsQWxpYXNBZGRlZH1cbiAgICAgICAgICAgICAgICBvbkl0ZW1SZW1vdmVkPXt0aGlzLm9uTG9jYWxBbGlhc0RlbGV0ZWR9XG4gICAgICAgICAgICAgICAgbm9JdGVtc0xhYmVsPXtfdCgnVGhpcyByb29tIGhhcyBubyBsb2NhbCBhZGRyZXNzZXMnKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoJ0xvY2FsIGFkZHJlc3MnKX1cbiAgICAgICAgICAgICAgICBkb21haW49e2xvY2FsRG9tYWlufVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BbGlhc1NldHRpbmdzJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIlB1Ymxpc2hlZCBBZGRyZXNzZXNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxwPntfdChcIlB1Ymxpc2hlZCBhZGRyZXNzZXMgY2FuIGJlIHVzZWQgYnkgYW55b25lIG9uIGFueSBzZXJ2ZXIgdG8gam9pbiB5b3VyIHJvb20uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJUbyBwdWJsaXNoIGFuIGFkZHJlc3MsIGl0IG5lZWRzIHRvIGJlIHNldCBhcyBhIGxvY2FsIGFkZHJlc3MgZmlyc3QuXCIpfTwvcD5cbiAgICAgICAgICAgICAgICB7Y2Fub25pY2FsQWxpYXNTZWN0aW9ufVxuICAgICAgICAgICAgICAgIDxSb29tUHVibGlzaFNldHRpbmcgcm9vbUlkPXt0aGlzLnByb3BzLnJvb21JZH0gY2FuU2V0Q2Fub25pY2FsQWxpYXM9e3RoaXMucHJvcHMuY2FuU2V0Q2Fub25pY2FsQWxpYXN9IC8+XG4gICAgICAgICAgICAgICAgPGRhdGFsaXN0IGlkPVwibXhfQWxpYXNTZXR0aW5nc19hbHRSZWNvbW1lbmRhdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2dldExvY2FsTm9uQWx0QWxpYXNlcygpLm1hcChhbGlhcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPG9wdGlvbiB2YWx1ZT17YWxpYXN9IGtleT17YWxpYXN9IC8+O1xuICAgICAgICAgICAgICAgICAgICB9KX07XG4gICAgICAgICAgICAgICAgPC9kYXRhbGlzdD5cbiAgICAgICAgICAgICAgICA8RWRpdGFibGVBbGlhc2VzTGlzdFxuICAgICAgICAgICAgICAgICAgICBpZD1cInJvb21BbHRBbGlhc2VzXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtcIm14X1Jvb21TZXR0aW5nc19hbHRBbGlhc2VzXCJ9XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zPXt0aGlzLnN0YXRlLmFsdEFsaWFzZXN9XG4gICAgICAgICAgICAgICAgICAgIG5ld0l0ZW09e3RoaXMuc3RhdGUubmV3QWx0QWxpYXN9XG4gICAgICAgICAgICAgICAgICAgIG9uTmV3SXRlbUNoYW5nZWQ9e3RoaXMub25OZXdBbHRBbGlhc0NoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIGNhblJlbW92ZT17dGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhc31cbiAgICAgICAgICAgICAgICAgICAgY2FuRWRpdD17dGhpcy5wcm9wcy5jYW5TZXRDYW5vbmljYWxBbGlhc31cbiAgICAgICAgICAgICAgICAgICAgb25JdGVtQWRkZWQ9e3RoaXMub25BbHRBbGlhc0FkZGVkfVxuICAgICAgICAgICAgICAgICAgICBvbkl0ZW1SZW1vdmVkPXt0aGlzLm9uQWx0QWxpYXNEZWxldGVkfVxuICAgICAgICAgICAgICAgICAgICBzdWdnZXN0aW9uc0xpc3RJZD1cIm14X0FsaWFzU2V0dGluZ3NfYWx0UmVjb21tZW5kYXRpb25zXCJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNMYWJlbD17X3QoJ090aGVyIHB1Ymxpc2hlZCBhZGRyZXNzZXM6Jyl9XG4gICAgICAgICAgICAgICAgICAgIG5vSXRlbXNMYWJlbD17X3QoJ05vIG90aGVyIHB1Ymxpc2hlZCBhZGRyZXNzZXMgeWV0LCBhZGQgb25lIGJlbG93Jyl9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdCgnTmV3IHB1Ymxpc2hlZCBhZGRyZXNzIChlLmcuICNhbGlhczpzZXJ2ZXIpJyl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcgbXhfQWxpYXNTZXR0aW5nc19sb2NhbEFsaWFzSGVhZGVyJz57X3QoXCJMb2NhbCBBZGRyZXNzZXNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxwPntfdChcIlNldCBhZGRyZXNzZXMgZm9yIHRoaXMgcm9vbSBzbyB1c2VycyBjYW4gZmluZCB0aGlzIHJvb20gdGhyb3VnaCB5b3VyIGhvbWVzZXJ2ZXIgKCUobG9jYWxEb21haW4pcylcIiwge2xvY2FsRG9tYWlufSl9PC9wPlxuICAgICAgICAgICAgICAgIDxkZXRhaWxzIG9uVG9nZ2xlPXt0aGlzLm9uTG9jYWxBbGlhc2VzVG9nZ2xlZH0+XG4gICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PnsgdGhpcy5zdGF0ZS5kZXRhaWxzT3BlbiA/IF90KCdTaG93IGxlc3MnKSA6IF90KFwiU2hvdyBtb3JlXCIpfTwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgICAgICAge2xvY2FsQWxpYXNlc0xpc3R9XG4gICAgICAgICAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19