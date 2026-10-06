"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SendCustomEvent = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _SyntaxHighlight = _interopRequireDefault(require("../elements/SyntaxHighlight"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _VerificationRequest = require("matrix-js-sdk/src/crypto/verification/request/VerificationRequest");

var _WidgetStore = _interopRequireDefault(require("../../../stores/WidgetStore"));

var _AsyncStore = require("../../../stores/AsyncStore");

var _Settings = require("../../../settings/Settings");

var _SettingsStore = _interopRequireWildcard(require("../../../settings/SettingsStore"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("./ErrorDialog"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _room = require("matrix-js-sdk/src/models/room");

var _event = require("matrix-js-sdk/src/models/event");

var _dec, _class, _class2, _temp;

class GenericEditor extends _react.default.PureComponent {
  // static propTypes = {onBack: PropTypes.func.isRequired};
  constructor(props) {
    super(props);
    this._onChange = this._onChange.bind(this);
    this.onBack = this.onBack.bind(this);
  }

  onBack() {
    if (this.state.message) {
      this.setState({
        message: null
      });
    } else {
      this.props.onBack();
    }
  }

  _onChange(e) {
    this.setState({
      [e.target.id]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  }

  _buttons() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onBack
    }, (0, _languageHandler._t)('Back')), !this.state.message && /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._send
    }, (0, _languageHandler._t)('Send')));
  }

  textInput(id, label) {
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: id,
      label: label,
      size: "42",
      autoFocus: true,
      type: "text",
      autoComplete: "on",
      value: this.state[id],
      onChange: this._onChange
    });
  }

}

class SendCustomEvent extends GenericEditor {
  static getLabel() {
    return (0, _languageHandler._t)('Send Custom Event');
  }

  constructor(props) {
    super(props);
    this._send = this._send.bind(this);
    const {
      eventType,
      stateKey,
      evContent
    } = Object.assign({
      eventType: '',
      stateKey: '',
      evContent: '{\n\n}'
    }, this.props.inputs);
    this.state = {
      isStateEvent: Boolean(this.props.forceStateEvent),
      eventType,
      stateKey,
      evContent
    };
  }

  send(content) {
    const cli = this.context;

    if (this.state.isStateEvent) {
      return cli.sendStateEvent(this.props.room.roomId, this.state.eventType, content, this.state.stateKey);
    } else {
      return cli.sendEvent(this.props.room.roomId, this.state.eventType, content);
    }
  }

  async _send() {
    if (this.state.eventType === '') {
      this.setState({
        message: (0, _languageHandler._t)('You must specify an event type!')
      });
      return;
    }

    let message;

    try {
      const content = JSON.parse(this.state.evContent);
      await this.send(content);
      message = (0, _languageHandler._t)('Event sent!');
    } catch (e) {
      message = (0, _languageHandler._t)('Failed to send custom event.') + ' (' + e.toString() + ')';
    }

    this.setState({
      message
    });
  }

  render() {
    if (this.state.message) {
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_content"
      }, this.state.message), this._buttons());
    }

    const showTglFlip = !this.state.message && !this.props.forceStateEvent && !this.props.forceGeneralEvent;
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DevTools_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DevTools_eventTypeStateKeyGroup"
    }, this.textInput('eventType', (0, _languageHandler._t)('Event Type')), this.state.isStateEvent && this.textInput('stateKey', (0, _languageHandler._t)('State Key'))), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "evContent",
      label: (0, _languageHandler._t)("Event Content"),
      type: "text",
      className: "mx_DevTools_textarea",
      autoComplete: "off",
      value: this.state.evContent,
      onChange: this._onChange,
      element: "textarea"
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onBack
    }, (0, _languageHandler._t)('Back')), !this.state.message && /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._send
    }, (0, _languageHandler._t)('Send')), showTglFlip && /*#__PURE__*/_react.default.createElement("div", {
      style: {
        float: "right"
      }
    }, /*#__PURE__*/_react.default.createElement("input", {
      id: "isStateEvent",
      className: "mx_DevTools_tgl mx_DevTools_tgl-flip",
      type: "checkbox",
      onChange: this._onChange,
      checked: this.state.isStateEvent
    }), /*#__PURE__*/_react.default.createElement("label", {
      className: "mx_DevTools_tgl-btn",
      "data-tg-off": "Event",
      "data-tg-on": "State Event",
      htmlFor: "isStateEvent"
    }))));
  }

}

exports.SendCustomEvent = SendCustomEvent;
(0, _defineProperty2.default)(SendCustomEvent, "propTypes", {
  onBack: _propTypes.default.func.isRequired,
  room: _propTypes.default.instanceOf(_room.Room).isRequired,
  forceStateEvent: _propTypes.default.bool,
  forceGeneralEvent: _propTypes.default.bool,
  inputs: _propTypes.default.object
});
(0, _defineProperty2.default)(SendCustomEvent, "contextType", _MatrixClientContext.default);

class SendAccountData extends GenericEditor {
  static getLabel() {
    return (0, _languageHandler._t)('Send Account Data');
  }

  constructor(props) {
    super(props);
    this._send = this._send.bind(this);
    const {
      eventType,
      evContent
    } = Object.assign({
      eventType: '',
      evContent: '{\n\n}'
    }, this.props.inputs);
    this.state = {
      isRoomAccountData: Boolean(this.props.isRoomAccountData),
      eventType,
      evContent
    };
  }

  send(content) {
    const cli = this.context;

    if (this.state.isRoomAccountData) {
      return cli.setRoomAccountData(this.props.room.roomId, this.state.eventType, content);
    }

    return cli.setAccountData(this.state.eventType, content);
  }

  async _send() {
    if (this.state.eventType === '') {
      this.setState({
        message: (0, _languageHandler._t)('You must specify an event type!')
      });
      return;
    }

    let message;

    try {
      const content = JSON.parse(this.state.evContent);
      await this.send(content);
      message = (0, _languageHandler._t)('Event sent!');
    } catch (e) {
      message = (0, _languageHandler._t)('Failed to send custom event.') + ' (' + e.toString() + ')';
    }

    this.setState({
      message
    });
  }

  render() {
    if (this.state.message) {
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_content"
      }, this.state.message), this._buttons());
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DevTools_content"
    }, this.textInput('eventType', (0, _languageHandler._t)('Event Type')), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "evContent",
      label: (0, _languageHandler._t)("Event Content"),
      type: "text",
      className: "mx_DevTools_textarea",
      autoComplete: "off",
      value: this.state.evContent,
      onChange: this._onChange,
      element: "textarea"
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onBack
    }, (0, _languageHandler._t)('Back')), !this.state.message && /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._send
    }, (0, _languageHandler._t)('Send')), !this.state.message && /*#__PURE__*/_react.default.createElement("div", {
      style: {
        float: "right"
      }
    }, /*#__PURE__*/_react.default.createElement("input", {
      id: "isRoomAccountData",
      className: "mx_DevTools_tgl mx_DevTools_tgl-flip",
      type: "checkbox",
      onChange: this._onChange,
      checked: this.state.isRoomAccountData,
      disabled: this.props.forceMode
    }), /*#__PURE__*/_react.default.createElement("label", {
      className: "mx_DevTools_tgl-btn",
      "data-tg-off": "Account Data",
      "data-tg-on": "Room Data",
      htmlFor: "isRoomAccountData"
    }))));
  }

}

(0, _defineProperty2.default)(SendAccountData, "propTypes", {
  room: _propTypes.default.instanceOf(_room.Room).isRequired,
  isRoomAccountData: _propTypes.default.bool,
  forceMode: _propTypes.default.bool,
  inputs: _propTypes.default.object
});
(0, _defineProperty2.default)(SendAccountData, "contextType", _MatrixClientContext.default);
const INITIAL_LOAD_TILES = 20;
const LOAD_TILES_STEP_SIZE = 50;

class FilteredList extends _react.default.PureComponent {
  static filterChildren(children, query) {
    if (!query) return children;
    const lcQuery = query.toLowerCase();
    return children.filter(child => child.key.toLowerCase().includes(lcQuery));
  }

  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "showAll", () => {
      this.setState({
        truncateAt: this.state.truncateAt + LOAD_TILES_STEP_SIZE
      });
    });
    (0, _defineProperty2.default)(this, "createOverflowElement", (overflowCount
    /*: number*/
    , totalCount
    /*: number*/
    ) => {
      return /*#__PURE__*/_react.default.createElement("button", {
        className: "mx_DevTools_RoomStateExplorer_button",
        onClick: this.showAll
      }, (0, _languageHandler._t)("and %(count)s others...", {
        count: overflowCount
      }));
    });
    (0, _defineProperty2.default)(this, "onQuery", ev => {
      if (this.props.onChange) this.props.onChange(ev.target.value);
    });
    (0, _defineProperty2.default)(this, "getChildren", (start
    /*: number*/
    , end
    /*: number*/
    ) => {
      return this.state.filteredChildren.slice(start, end);
    });
    (0, _defineProperty2.default)(this, "getChildCount", () =>
    /*: number*/
    {
      return this.state.filteredChildren.length;
    });
    this.state = {
      filteredChildren: FilteredList.filterChildren(this.props.children, this.props.query),
      truncateAt: INITIAL_LOAD_TILES
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event


  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line camelcase
    if (this.props.children === nextProps.children && this.props.query === nextProps.query) return;
    this.setState({
      filteredChildren: FilteredList.filterChildren(nextProps.children, nextProps.query),
      truncateAt: INITIAL_LOAD_TILES
    });
  }

  render() {
    const TruncatedList = sdk.getComponent("elements.TruncatedList");
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: (0, _languageHandler._t)('Filter results'),
      autoFocus: true,
      size: 64,
      type: "text",
      autoComplete: "off",
      value: this.props.query,
      onChange: this.onQuery,
      className: "mx_TextInputDialog_input mx_DevTools_RoomStateExplorer_query" // force re-render so that autoFocus is applied when this component is re-used
      ,
      key: this.props.children[0] ? this.props.children[0].key : ''
    }), /*#__PURE__*/_react.default.createElement(TruncatedList, {
      getChildren: this.getChildren,
      getChildCount: this.getChildCount,
      truncateAt: this.state.truncateAt,
      createOverflowElement: this.createOverflowElement
    }));
  }

}

(0, _defineProperty2.default)(FilteredList, "propTypes", {
  children: _propTypes.default.any,
  query: _propTypes.default.string,
  onChange: _propTypes.default.func
});

class RoomStateExplorer extends _react.default.PureComponent {
  static getLabel() {
    return (0, _languageHandler._t)('Explore Room State');
  }

  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "roomStateEvents", void 0);
    this.roomStateEvents = this.props.room.currentState.events;
    this.onBack = this.onBack.bind(this);
    this.editEv = this.editEv.bind(this);
    this.onQueryEventType = this.onQueryEventType.bind(this);
    this.onQueryStateKey = this.onQueryStateKey.bind(this);
    this.state = {
      eventType: null,
      event: null,
      editing: false,
      queryEventType: '',
      queryStateKey: ''
    };
  }

  browseEventType(eventType) {
    return () => {
      this.setState({
        eventType
      });
    };
  }

  onViewSourceClick(event) {
    return () => {
      this.setState({
        event
      });
    };
  }

  onBack() {
    if (this.state.editing) {
      this.setState({
        editing: false
      });
    } else if (this.state.event) {
      this.setState({
        event: null
      });
    } else if (this.state.eventType) {
      this.setState({
        eventType: null
      });
    } else {
      this.props.onBack();
    }
  }

  editEv() {
    this.setState({
      editing: true
    });
  }

  onQueryEventType(filterEventType) {
    this.setState({
      queryEventType: filterEventType
    });
  }

  onQueryStateKey(filterStateKey) {
    this.setState({
      queryStateKey: filterStateKey
    });
  }

  render() {
    if (this.state.event) {
      if (this.state.editing) {
        return /*#__PURE__*/_react.default.createElement(SendCustomEvent, {
          room: this.props.room,
          forceStateEvent: true,
          onBack: this.onBack,
          inputs: {
            eventType: this.state.event.getType(),
            evContent: JSON.stringify(this.state.event.getContent(), null, '\t'),
            stateKey: this.state.event.getStateKey()
          }
        });
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ViewSource"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_content"
      }, /*#__PURE__*/_react.default.createElement(_SyntaxHighlight.default, {
        className: "json"
      }, JSON.stringify(this.state.event.event, null, 2))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onBack
      }, (0, _languageHandler._t)('Back')), /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.editEv
      }, (0, _languageHandler._t)('Edit'))));
    }

    let list = null;
    const classes = 'mx_DevTools_RoomStateExplorer_button';

    if (this.state.eventType === null) {
      list = /*#__PURE__*/_react.default.createElement(FilteredList, {
        query: this.state.queryEventType,
        onChange: this.onQueryEventType
      }, Array.from(this.roomStateEvents.entries()).map(([eventType, allStateKeys]) => {
        let onClickFn;

        if (allStateKeys.size === 1 && allStateKeys.has("")) {
          onClickFn = this.onViewSourceClick(allStateKeys.get(""));
        } else {
          onClickFn = this.browseEventType(eventType);
        }

        return /*#__PURE__*/_react.default.createElement("button", {
          className: classes,
          key: eventType,
          onClick: onClickFn
        }, eventType);
      }));
    } else {
      const stateGroup = this.roomStateEvents.get(this.state.eventType);
      list = /*#__PURE__*/_react.default.createElement(FilteredList, {
        query: this.state.queryStateKey,
        onChange: this.onQueryStateKey
      }, Array.from(stateGroup.entries()).map(([stateKey, ev]) => {
        return /*#__PURE__*/_react.default.createElement("button", {
          className: classes,
          key: stateKey,
          onClick: this.onViewSourceClick(ev)
        }, stateKey);
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, list), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onBack
    }, (0, _languageHandler._t)('Back'))));
  }

}

(0, _defineProperty2.default)(RoomStateExplorer, "propTypes", {
  onBack: _propTypes.default.func.isRequired,
  room: _propTypes.default.instanceOf(_room.Room).isRequired
});
(0, _defineProperty2.default)(RoomStateExplorer, "contextType", _MatrixClientContext.default);

class AccountDataExplorer extends _react.default.PureComponent {
  static getLabel() {
    return (0, _languageHandler._t)('Explore Account Data');
  }

  constructor(props) {
    super(props);
    this.onBack = this.onBack.bind(this);
    this.editEv = this.editEv.bind(this);
    this._onChange = this._onChange.bind(this);
    this.onQueryEventType = this.onQueryEventType.bind(this);
    this.state = {
      isRoomAccountData: false,
      event: null,
      editing: false,
      queryEventType: ''
    };
  }

  getData() {
    if (this.state.isRoomAccountData) {
      return this.props.room.accountData;
    }

    return this.context.store.accountData;
  }

  onViewSourceClick(event) {
    return () => {
      this.setState({
        event
      });
    };
  }

  onBack() {
    if (this.state.editing) {
      this.setState({
        editing: false
      });
    } else if (this.state.event) {
      this.setState({
        event: null
      });
    } else {
      this.props.onBack();
    }
  }

  _onChange(e) {
    this.setState({
      [e.target.id]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  }

  editEv() {
    this.setState({
      editing: true
    });
  }

  onQueryEventType(queryEventType) {
    this.setState({
      queryEventType
    });
  }

  render() {
    if (this.state.event) {
      if (this.state.editing) {
        return /*#__PURE__*/_react.default.createElement(SendAccountData, {
          room: this.props.room,
          isRoomAccountData: this.state.isRoomAccountData,
          onBack: this.onBack,
          inputs: {
            eventType: this.state.event.getType(),
            evContent: JSON.stringify(this.state.event.getContent(), null, '\t')
          },
          forceMode: true
        });
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ViewSource"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_content"
      }, /*#__PURE__*/_react.default.createElement(_SyntaxHighlight.default, {
        className: "json"
      }, JSON.stringify(this.state.event.event, null, 2))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onBack
      }, (0, _languageHandler._t)('Back')), /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.editEv
      }, (0, _languageHandler._t)('Edit'))));
    }

    const rows = [];
    const classes = 'mx_DevTools_RoomStateExplorer_button';
    const data = this.getData();
    Object.keys(data).forEach(evType => {
      const ev = data[evType];
      rows.push( /*#__PURE__*/_react.default.createElement("button", {
        className: classes,
        key: evType,
        onClick: this.onViewSourceClick(ev)
      }, evType));
    });
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement(FilteredList, {
      query: this.state.queryEventType,
      onChange: this.onQueryEventType
    }, rows)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onBack
    }, (0, _languageHandler._t)('Back')), !this.state.message && /*#__PURE__*/_react.default.createElement("div", {
      style: {
        float: "right"
      }
    }, /*#__PURE__*/_react.default.createElement("input", {
      id: "isRoomAccountData",
      className: "mx_DevTools_tgl mx_DevTools_tgl-flip",
      type: "checkbox",
      onChange: this._onChange,
      checked: this.state.isRoomAccountData
    }), /*#__PURE__*/_react.default.createElement("label", {
      className: "mx_DevTools_tgl-btn",
      "data-tg-off": "Account Data",
      "data-tg-on": "Room Data",
      htmlFor: "isRoomAccountData"
    }))));
  }

}

(0, _defineProperty2.default)(AccountDataExplorer, "propTypes", {
  onBack: _propTypes.default.func.isRequired,
  room: _propTypes.default.instanceOf(_room.Room).isRequired
});
(0, _defineProperty2.default)(AccountDataExplorer, "contextType", _MatrixClientContext.default);

class ServersInRoomList extends _react.default.PureComponent {
  static getLabel() {
    return (0, _languageHandler._t)('View Servers in Room');
  }

  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onQuery", query => {
      this.setState({
        query
      });
    });
    const room = this.props.room;
    const servers = new Set();
    room.currentState.getStateEvents("m.room.member").forEach(ev => servers.add(ev.getSender().split(":")[1]));
    this.servers = Array.from(servers).map(s => /*#__PURE__*/_react.default.createElement("button", {
      key: s,
      className: "mx_DevTools_ServersInRoomList_button"
    }, s));
    this.state = {
      query: ''
    };
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement(FilteredList, {
      query: this.state.query,
      onChange: this.onQuery
    }, this.servers)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.props.onBack
    }, (0, _languageHandler._t)('Back'))));
  }

}

(0, _defineProperty2.default)(ServersInRoomList, "propTypes", {
  onBack: _propTypes.default.func.isRequired,
  room: _propTypes.default.instanceOf(_room.Room).isRequired
});
(0, _defineProperty2.default)(ServersInRoomList, "contextType", _MatrixClientContext.default);
const PHASE_MAP = {
  [_VerificationRequest.PHASE_UNSENT]: "unsent",
  [_VerificationRequest.PHASE_REQUESTED]: "requested",
  [_VerificationRequest.PHASE_READY]: "ready",
  [_VerificationRequest.PHASE_DONE]: "done",
  [_VerificationRequest.PHASE_STARTED]: "started",
  [_VerificationRequest.PHASE_CANCELLED]: "cancelled"
};

function VerificationRequest({
  txnId,
  request
}) {
  const [, updateState] = (0, _react.useState)();
  const [timeout, setRequestTimeout] = (0, _react.useState)(request.timeout);
  /* Re-render if something changes state */

  (0, _useEventEmitter.useEventEmitter)(request, "change", updateState);
  /* Keep re-rendering if there's a timeout */

  (0, _react.useEffect)(() => {
    if (request.timeout == 0) return;
    /* Note that request.timeout is a getter, so its value changes */

    const id = setInterval(() => {
      setRequestTimeout(request.timeout);
    }, 500);
    return () => {
      clearInterval(id);
    };
  }, [request]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DevTools_VerificationRequest"
  }, /*#__PURE__*/_react.default.createElement("dl", null, /*#__PURE__*/_react.default.createElement("dt", null, "Transaction"), /*#__PURE__*/_react.default.createElement("dd", null, txnId), /*#__PURE__*/_react.default.createElement("dt", null, "Phase"), /*#__PURE__*/_react.default.createElement("dd", null, PHASE_MAP[request.phase] || request.phase), /*#__PURE__*/_react.default.createElement("dt", null, "Timeout"), /*#__PURE__*/_react.default.createElement("dd", null, Math.floor(timeout / 1000)), /*#__PURE__*/_react.default.createElement("dt", null, "Methods"), /*#__PURE__*/_react.default.createElement("dd", null, request.methods && request.methods.join(", ")), /*#__PURE__*/_react.default.createElement("dt", null, "requestingUserId"), /*#__PURE__*/_react.default.createElement("dd", null, request.requestingUserId), /*#__PURE__*/_react.default.createElement("dt", null, "observeOnly"), /*#__PURE__*/_react.default.createElement("dd", null, JSON.stringify(request.observeOnly))));
}

class VerificationExplorer extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onNewRequest", () => {
      this.forceUpdate();
    });
  }

  static getLabel() {
    return (0, _languageHandler._t)("Verification Requests");
  }
  /* Ensure this.context is the cli */


  componentDidMount() {
    const cli = this.context;
    cli.on("crypto.verification.request", this.onNewRequest);
  }

  componentWillUnmount() {
    const cli = this.context;
    cli.off("crypto.verification.request", this.onNewRequest);
  }

  render() {
    const cli = this.context;
    const room = this.props.room;
    const inRoomChannel = cli._crypto._inRoomVerificationRequests;
    const inRoomRequests = (inRoomChannel._requestsByRoomId || new Map()).get(room.roomId) || new Map();
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, Array.from(inRoomRequests.entries()).reverse().map(([txnId, request]) => /*#__PURE__*/_react.default.createElement(VerificationRequest, {
      txnId: txnId,
      request: request,
      key: txnId
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.props.onBack
    }, (0, _languageHandler._t)("Back"))));
  }

}

(0, _defineProperty2.default)(VerificationExplorer, "contextType", _MatrixClientContext.default);

class WidgetExplorer extends _react.default.Component {
  static getLabel() {
    return (0, _languageHandler._t)("Active Widgets");
  }

  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onWidgetStoreUpdate", () => {
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onQueryChange", query => {
      this.setState({
        query
      });
    });
    (0, _defineProperty2.default)(this, "onEditWidget", widget => {
      this.setState({
        editWidget: widget
      });
    });
    (0, _defineProperty2.default)(this, "onBack", () => {
      const widgets = _WidgetStore.default.instance.getApps(this.props.room.roomId);

      if (this.state.editWidget && widgets.includes(this.state.editWidget)) {
        this.setState({
          editWidget: null
        });
      } else {
        this.props.onBack();
      }
    });
    this.state = {
      query: '',
      editWidget: null // set to an IApp when editing

    };
  }

  componentDidMount() {
    _WidgetStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onWidgetStoreUpdate);
  }

  componentWillUnmount() {
    _WidgetStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.onWidgetStoreUpdate);
  }

  render() {
    const room = this.props.room;
    const editWidget = this.state.editWidget;

    const widgets = _WidgetStore.default.instance.getApps(room.roomId);

    if (editWidget && widgets.includes(editWidget)) {
      const allState = Array.from(Array.from(room.currentState.events.values()).map(e => e.values())).reduce((p, c) => {
        p.push(...c);
        return p;
      }, []);
      const stateEv = allState.find(ev => ev.getId() === editWidget.eventId);

      if (!stateEv) {
        // "should never happen"
        return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("There was an error finding this widget."), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Dialog_buttons"
        }, /*#__PURE__*/_react.default.createElement("button", {
          onClick: this.onBack
        }, (0, _languageHandler._t)("Back"))));
      }

      return /*#__PURE__*/_react.default.createElement(SendCustomEvent, {
        onBack: this.onBack,
        room: room,
        forceStateEvent: true,
        inputs: {
          eventType: stateEv.getType(),
          evContent: JSON.stringify(stateEv.getContent(), null, '\t'),
          stateKey: stateEv.getStateKey()
        }
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement(FilteredList, {
      query: this.state.query,
      onChange: this.onQueryChange
    }, widgets.map(w => {
      return /*#__PURE__*/_react.default.createElement("button", {
        className: "mx_DevTools_RoomStateExplorer_button",
        key: w.url + w.eventId,
        onClick: () => this.onEditWidget(w)
      }, w.url);
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onBack
    }, (0, _languageHandler._t)("Back"))));
  }

}

class SettingsExplorer extends _react.default.Component {
  static getLabel() {
    return (0, _languageHandler._t)("Settings Explorer");
  }

  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onQueryChange", ev => {
      this.setState({
        query: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onExplValuesEdit", ev => {
      this.setState({
        explicitValues: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onExplRoomValuesEdit", ev => {
      this.setState({
        explicitRoomValues: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onBack", () => {
      if (this.state.editSetting) {
        this.setState({
          editSetting: null
        });
      } else if (this.state.viewSetting) {
        this.setState({
          viewSetting: null
        });
      } else {
        this.props.onBack();
      }
    });
    (0, _defineProperty2.default)(this, "onViewClick", (ev, settingId) => {
      ev.preventDefault();
      this.setState({
        viewSetting: settingId
      });
    });
    (0, _defineProperty2.default)(this, "onEditClick", (ev, settingId) => {
      ev.preventDefault();
      this.setState({
        editSetting: settingId,
        explicitValues: this.renderExplicitSettingValues(settingId, null),
        explicitRoomValues: this.renderExplicitSettingValues(settingId, this.props.room.roomId)
      });
    });
    (0, _defineProperty2.default)(this, "onSaveClick", async () => {
      try {
        const settingId = this.state.editSetting;
        const parsedExplicit = JSON.parse(this.state.explicitValues);
        const parsedExplicitRoom = JSON.parse(this.state.explicitRoomValues);

        for (const level of Object.keys(parsedExplicit)) {
          console.log(`[Devtools] Setting value of ${settingId} at ${level} from user input`);

          try {
            const val = parsedExplicit[level];
            await _SettingsStore.default.setValue(settingId, null, level, val);
          } catch (e) {
            console.warn(e);
          }
        }

        const roomId = this.props.room.roomId;

        for (const level of Object.keys(parsedExplicit)) {
          console.log(`[Devtools] Setting value of ${settingId} at ${level} in ${roomId} from user input`);

          try {
            const val = parsedExplicitRoom[level];
            await _SettingsStore.default.setValue(settingId, roomId, level, val);
          } catch (e) {
            console.warn(e);
          }
        }

        this.setState({
          viewSetting: settingId,
          editSetting: null
        });
      } catch (e) {
        _Modal.default.createTrackedDialog('Devtools - Failed to save settings', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Failed to save settings"),
          description: e.message
        });
      }
    });
    this.state = {
      query: '',
      editSetting: null,
      // set to a setting ID when editing
      viewSetting: null,
      // set to a setting ID when exploring in detail
      explicitValues: null,
      // stringified JSON for edit view
      explicitRoomValues: null // stringified JSON for edit view

    };
  }

  renderSettingValue(val) {
    // Note: we don't .toString() a string because we want JSON.stringify to inject quotes for us
    const toStringTypes = ['boolean', 'number'];

    if (toStringTypes.includes(typeof val)) {
      return val.toString();
    } else {
      return JSON.stringify(val);
    }
  }

  renderExplicitSettingValues(setting, roomId) {
    const vals = {};

    for (const level of _SettingsStore.LEVEL_ORDER) {
      try {
        vals[level] = _SettingsStore.default.getValueAt(level, setting, roomId, true, true);

        if (vals[level] === undefined) {
          vals[level] = null;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return JSON.stringify(vals, null, 4);
  }

  renderCanEditLevel(roomId, level) {
    const canEdit = _SettingsStore.default.canSetValue(this.state.editSetting, roomId, level);

    const className = canEdit ? 'mx_DevTools_SettingsExplorer_mutable' : 'mx_DevTools_SettingsExplorer_immutable';
    return /*#__PURE__*/_react.default.createElement("td", {
      className: className
    }, /*#__PURE__*/_react.default.createElement("code", null, canEdit.toString()));
  }

  render() {
    const room = this.props.room;

    if (!this.state.viewSetting && !this.state.editSetting) {
      // view all settings
      const allSettings = Object.keys(_Settings.SETTINGS).filter(n => this.state.query ? n.toLowerCase().includes(this.state.query.toLowerCase()) : true);
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_content mx_DevTools_SettingsExplorer"
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        label: (0, _languageHandler._t)('Filter results'),
        autoFocus: true,
        size: 64,
        type: "text",
        autoComplete: "off",
        value: this.state.query,
        onChange: this.onQueryChange,
        className: "mx_TextInputDialog_input mx_DevTools_RoomStateExplorer_query"
      }), /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Setting ID")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Value")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Value in this room")))), /*#__PURE__*/_react.default.createElement("tbody", null, allSettings.map(i => /*#__PURE__*/_react.default.createElement("tr", {
        key: i
      }, /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("a", {
        href: "",
        onClick: e => this.onViewClick(e, i)
      }, /*#__PURE__*/_react.default.createElement("code", null, i)), /*#__PURE__*/_react.default.createElement("a", {
        href: "",
        onClick: e => this.onEditClick(e, i),
        className: "mx_DevTools_SettingsExplorer_edit"
      }, "\u270F")), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, this.renderSettingValue(_SettingsStore.default.getValue(i)))), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, this.renderSettingValue(_SettingsStore.default.getValue(i, room.roomId))))))))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onBack
      }, (0, _languageHandler._t)("Back"))));
    } else if (this.state.editSetting) {
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_content mx_DevTools_SettingsExplorer"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Setting:"), " ", /*#__PURE__*/_react.default.createElement("code", null, this.state.editSetting)), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_SettingsExplorer_warning"
      }, /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("Caution:")), " ", (0, _languageHandler._t)("This UI does NOT check the types of the values. Use at your own risk.")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Setting definition:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, JSON.stringify(_Settings.SETTINGS[this.state.editSetting], null, 4)))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Level")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Settable at global")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Settable at room")))), /*#__PURE__*/_react.default.createElement("tbody", null, _SettingsStore.LEVEL_ORDER.map(lvl => /*#__PURE__*/_react.default.createElement("tr", {
        key: lvl
      }, /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, lvl)), this.renderCanEditLevel(null, lvl), this.renderCanEditLevel(room.roomId, lvl)))))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Field.default, {
        id: "valExpl",
        label: (0, _languageHandler._t)("Values at explicit levels"),
        type: "text",
        className: "mx_DevTools_textarea",
        element: "textarea",
        autoComplete: "off",
        value: this.state.explicitValues,
        onChange: this.onExplValuesEdit
      })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Field.default, {
        id: "valExpl",
        label: (0, _languageHandler._t)("Values at explicit levels in this room"),
        type: "text",
        className: "mx_DevTools_textarea",
        element: "textarea",
        autoComplete: "off",
        value: this.state.explicitRoomValues,
        onChange: this.onExplRoomValuesEdit
      }))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onSaveClick
      }, (0, _languageHandler._t)("Save setting values")), /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onBack
      }, (0, _languageHandler._t)("Back"))));
    } else if (this.state.viewSetting) {
      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_content mx_DevTools_SettingsExplorer"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Setting:"), " ", /*#__PURE__*/_react.default.createElement("code", null, this.state.viewSetting)), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Setting definition:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, JSON.stringify(_Settings.SETTINGS[this.state.viewSetting], null, 4)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Value:"), "\xA0", /*#__PURE__*/_react.default.createElement("code", null, this.renderSettingValue(_SettingsStore.default.getValue(this.state.viewSetting)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Value in this room:"), "\xA0", /*#__PURE__*/_react.default.createElement("code", null, this.renderSettingValue(_SettingsStore.default.getValue(this.state.viewSetting, room.roomId)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Values at explicit levels:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, this.renderExplicitSettingValues(this.state.viewSetting, null)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Values at explicit levels in this room:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, this.renderExplicitSettingValues(this.state.viewSetting, room.roomId))))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement("button", {
        onClick: e => this.onEditClick(e, this.state.viewSetting)
      }, (0, _languageHandler._t)("Edit Values")), /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onBack
      }, (0, _languageHandler._t)("Back"))));
    }
  }

}

const Entries = [SendCustomEvent, RoomStateExplorer, SendAccountData, AccountDataExplorer, ServersInRoomList, VerificationExplorer, WidgetExplorer, SettingsExplorer];
let DevtoolsDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.DevtoolsDialog"), _dec(_class = (_temp = _class2 = class DevtoolsDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    this.onBack = this.onBack.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.state = {
      mode: null
    };
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _setMode(mode) {
    return () => {
      this.setState({
        mode
      });
    };
  }

  onBack() {
    if (this.prevMode) {
      this.setState({
        mode: this.prevMode
      });
      this.prevMode = null;
    } else {
      this.setState({
        mode: null
      });
    }
  }

  onCancel() {
    this.props.onFinished(false);
  }

  render() {
    let body;

    if (this.state.mode) {
      body = /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Consumer, null, cli => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_label_left"
      }, this.state.mode.getLabel()), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_label_right"
      }, "Room ID: ", this.props.roomId), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_label_bottom"
      }), /*#__PURE__*/_react.default.createElement(this.state.mode, {
        onBack: this.onBack,
        room: cli.getRoom(this.props.roomId)
      })));
    } else {
      const classes = "mx_DevTools_RoomStateExplorer_button";
      body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_label_left"
      }, (0, _languageHandler._t)('Toolbox')), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_label_right"
      }, "Room ID: ", this.props.roomId), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_DevTools_label_bottom"
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_content"
      }, Entries.map(Entry => {
        const label = Entry.getLabel();

        const onClick = this._setMode(Entry);

        return /*#__PURE__*/_react.default.createElement("button", {
          className: classes,
          key: label,
          onClick: onClick
        }, label);
      }))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onCancel
      }, (0, _languageHandler._t)('Cancel'))));
    }

    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_QuestionDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Developer Tools')
    }, body);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  roomId: _propTypes.default.string.isRequired,
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = DevtoolsDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRGV2dG9vbHNEaWFsb2cuanMiXSwibmFtZXMiOlsiR2VuZXJpY0VkaXRvciIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJfb25DaGFuZ2UiLCJiaW5kIiwib25CYWNrIiwic3RhdGUiLCJtZXNzYWdlIiwic2V0U3RhdGUiLCJlIiwidGFyZ2V0IiwiaWQiLCJ0eXBlIiwiY2hlY2tlZCIsInZhbHVlIiwiX2J1dHRvbnMiLCJfc2VuZCIsInRleHRJbnB1dCIsImxhYmVsIiwiU2VuZEN1c3RvbUV2ZW50IiwiZ2V0TGFiZWwiLCJldmVudFR5cGUiLCJzdGF0ZUtleSIsImV2Q29udGVudCIsIk9iamVjdCIsImFzc2lnbiIsImlucHV0cyIsImlzU3RhdGVFdmVudCIsIkJvb2xlYW4iLCJmb3JjZVN0YXRlRXZlbnQiLCJzZW5kIiwiY29udGVudCIsImNsaSIsImNvbnRleHQiLCJzZW5kU3RhdGVFdmVudCIsInJvb20iLCJyb29tSWQiLCJzZW5kRXZlbnQiLCJKU09OIiwicGFyc2UiLCJ0b1N0cmluZyIsInJlbmRlciIsInNob3dUZ2xGbGlwIiwiZm9yY2VHZW5lcmFsRXZlbnQiLCJmbG9hdCIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiaW5zdGFuY2VPZiIsIlJvb20iLCJib29sIiwib2JqZWN0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIlNlbmRBY2NvdW50RGF0YSIsImlzUm9vbUFjY291bnREYXRhIiwic2V0Um9vbUFjY291bnREYXRhIiwic2V0QWNjb3VudERhdGEiLCJmb3JjZU1vZGUiLCJJTklUSUFMX0xPQURfVElMRVMiLCJMT0FEX1RJTEVTX1NURVBfU0laRSIsIkZpbHRlcmVkTGlzdCIsImZpbHRlckNoaWxkcmVuIiwiY2hpbGRyZW4iLCJxdWVyeSIsImxjUXVlcnkiLCJ0b0xvd2VyQ2FzZSIsImZpbHRlciIsImNoaWxkIiwia2V5IiwiaW5jbHVkZXMiLCJ0cnVuY2F0ZUF0Iiwib3ZlcmZsb3dDb3VudCIsInRvdGFsQ291bnQiLCJzaG93QWxsIiwiY291bnQiLCJldiIsIm9uQ2hhbmdlIiwic3RhcnQiLCJlbmQiLCJmaWx0ZXJlZENoaWxkcmVuIiwic2xpY2UiLCJsZW5ndGgiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsIlRydW5jYXRlZExpc3QiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJvblF1ZXJ5IiwiZ2V0Q2hpbGRyZW4iLCJnZXRDaGlsZENvdW50IiwiY3JlYXRlT3ZlcmZsb3dFbGVtZW50IiwiYW55Iiwic3RyaW5nIiwiUm9vbVN0YXRlRXhwbG9yZXIiLCJyb29tU3RhdGVFdmVudHMiLCJjdXJyZW50U3RhdGUiLCJldmVudHMiLCJlZGl0RXYiLCJvblF1ZXJ5RXZlbnRUeXBlIiwib25RdWVyeVN0YXRlS2V5IiwiZXZlbnQiLCJlZGl0aW5nIiwicXVlcnlFdmVudFR5cGUiLCJxdWVyeVN0YXRlS2V5IiwiYnJvd3NlRXZlbnRUeXBlIiwib25WaWV3U291cmNlQ2xpY2siLCJmaWx0ZXJFdmVudFR5cGUiLCJmaWx0ZXJTdGF0ZUtleSIsImdldFR5cGUiLCJzdHJpbmdpZnkiLCJnZXRDb250ZW50IiwiZ2V0U3RhdGVLZXkiLCJsaXN0IiwiY2xhc3NlcyIsIkFycmF5IiwiZnJvbSIsImVudHJpZXMiLCJtYXAiLCJhbGxTdGF0ZUtleXMiLCJvbkNsaWNrRm4iLCJzaXplIiwiaGFzIiwiZ2V0Iiwic3RhdGVHcm91cCIsIkFjY291bnREYXRhRXhwbG9yZXIiLCJnZXREYXRhIiwiYWNjb3VudERhdGEiLCJzdG9yZSIsInJvd3MiLCJkYXRhIiwia2V5cyIsImZvckVhY2giLCJldlR5cGUiLCJwdXNoIiwiU2VydmVyc0luUm9vbUxpc3QiLCJzZXJ2ZXJzIiwiU2V0IiwiZ2V0U3RhdGVFdmVudHMiLCJhZGQiLCJnZXRTZW5kZXIiLCJzcGxpdCIsInMiLCJQSEFTRV9NQVAiLCJQSEFTRV9VTlNFTlQiLCJQSEFTRV9SRVFVRVNURUQiLCJQSEFTRV9SRUFEWSIsIlBIQVNFX0RPTkUiLCJQSEFTRV9TVEFSVEVEIiwiUEhBU0VfQ0FOQ0VMTEVEIiwiVmVyaWZpY2F0aW9uUmVxdWVzdCIsInR4bklkIiwicmVxdWVzdCIsInVwZGF0ZVN0YXRlIiwidGltZW91dCIsInNldFJlcXVlc3RUaW1lb3V0Iiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwicGhhc2UiLCJNYXRoIiwiZmxvb3IiLCJtZXRob2RzIiwiam9pbiIsInJlcXVlc3RpbmdVc2VySWQiLCJvYnNlcnZlT25seSIsIlZlcmlmaWNhdGlvbkV4cGxvcmVyIiwiQ29tcG9uZW50IiwiZm9yY2VVcGRhdGUiLCJjb21wb25lbnREaWRNb3VudCIsIm9uIiwib25OZXdSZXF1ZXN0IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvZmYiLCJpblJvb21DaGFubmVsIiwiX2NyeXB0byIsIl9pblJvb21WZXJpZmljYXRpb25SZXF1ZXN0cyIsImluUm9vbVJlcXVlc3RzIiwiX3JlcXVlc3RzQnlSb29tSWQiLCJNYXAiLCJyZXZlcnNlIiwiV2lkZ2V0RXhwbG9yZXIiLCJ3aWRnZXQiLCJlZGl0V2lkZ2V0Iiwid2lkZ2V0cyIsIldpZGdldFN0b3JlIiwiaW5zdGFuY2UiLCJnZXRBcHBzIiwiVVBEQVRFX0VWRU5UIiwib25XaWRnZXRTdG9yZVVwZGF0ZSIsImFsbFN0YXRlIiwidmFsdWVzIiwicmVkdWNlIiwicCIsImMiLCJzdGF0ZUV2IiwiZmluZCIsImdldElkIiwiZXZlbnRJZCIsIm9uUXVlcnlDaGFuZ2UiLCJ3IiwidXJsIiwib25FZGl0V2lkZ2V0IiwiU2V0dGluZ3NFeHBsb3JlciIsImV4cGxpY2l0VmFsdWVzIiwiZXhwbGljaXRSb29tVmFsdWVzIiwiZWRpdFNldHRpbmciLCJ2aWV3U2V0dGluZyIsInNldHRpbmdJZCIsInByZXZlbnREZWZhdWx0IiwicmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzIiwicGFyc2VkRXhwbGljaXQiLCJwYXJzZWRFeHBsaWNpdFJvb20iLCJsZXZlbCIsImNvbnNvbGUiLCJsb2ciLCJ2YWwiLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJ3YXJuIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwicmVuZGVyU2V0dGluZ1ZhbHVlIiwidG9TdHJpbmdUeXBlcyIsInNldHRpbmciLCJ2YWxzIiwiTEVWRUxfT1JERVIiLCJnZXRWYWx1ZUF0IiwidW5kZWZpbmVkIiwicmVuZGVyQ2FuRWRpdExldmVsIiwiY2FuRWRpdCIsImNhblNldFZhbHVlIiwiY2xhc3NOYW1lIiwiYWxsU2V0dGluZ3MiLCJTRVRUSU5HUyIsIm4iLCJpIiwib25WaWV3Q2xpY2siLCJvbkVkaXRDbGljayIsImdldFZhbHVlIiwibHZsIiwib25FeHBsVmFsdWVzRWRpdCIsIm9uRXhwbFJvb21WYWx1ZXNFZGl0Iiwib25TYXZlQ2xpY2siLCJFbnRyaWVzIiwiRGV2dG9vbHNEaWFsb2ciLCJvbkNhbmNlbCIsIm1vZGUiLCJfdW5tb3VudGVkIiwiX3NldE1vZGUiLCJwcmV2TW9kZSIsIm9uRmluaXNoZWQiLCJib2R5IiwiZ2V0Um9vbSIsIkVudHJ5Iiwib25DbGljayIsIkJhc2VEaWFsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBUUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxhQUFOLFNBQTRCQyxlQUFNQyxhQUFsQyxDQUFnRDtBQUM1QztBQUVBQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFDQSxTQUFLQyxTQUFMLEdBQWlCLEtBQUtBLFNBQUwsQ0FBZUMsSUFBZixDQUFvQixJQUFwQixDQUFqQjtBQUNBLFNBQUtDLE1BQUwsR0FBYyxLQUFLQSxNQUFMLENBQVlE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QjdDLFVBRFY7QUFFZjZNLEVBQUFBLFVBQVUsRUFBRS9NLG1CQUFVQyxJQUFWLENBQWVDO0FBRlosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VTdGF0ZSwgdXNlRWZmZWN0fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBTeW50YXhIaWdobGlnaHQgZnJvbSAnLi4vZWxlbWVudHMvU3ludGF4SGlnaGxpZ2h0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQge3VzZUV2ZW50RW1pdHRlcn0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuXG5pbXBvcnQge1xuICAgIFBIQVNFX1VOU0VOVCxcbiAgICBQSEFTRV9SRVFVRVNURUQsXG4gICAgUEhBU0VfUkVBRFksXG4gICAgUEhBU0VfRE9ORSxcbiAgICBQSEFTRV9TVEFSVEVELFxuICAgIFBIQVNFX0NBTkNFTExFRCxcbn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vcmVxdWVzdC9WZXJpZmljYXRpb25SZXF1ZXN0XCI7XG5pbXBvcnQgV2lkZ2V0U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9XaWRnZXRTdG9yZVwiO1xuaW1wb3J0IHtVUERBVEVfRVZFTlR9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IHtTRVRUSU5HU30gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSwge0xFVkVMX09SREVSfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge01hdHJpeEV2ZW50fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmNsYXNzIEdlbmVyaWNFZGl0b3IgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICAvLyBzdGF0aWMgcHJvcFR5cGVzID0ge29uQmFjazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlID0gdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vbkJhY2sgPSB0aGlzLm9uQmFjay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIG9uQmFjaygpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2U6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQmFjaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uQ2hhbmdlKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W2UudGFyZ2V0LmlkXTogZS50YXJnZXQudHlwZSA9PT0gJ2NoZWNrYm94JyA/IGUudGFyZ2V0LmNoZWNrZWQgOiBlLnRhcmdldC52YWx1ZX0pO1xuICAgIH1cblxuICAgIF9idXR0b25zKCkge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+eyBfdCgnQmFjaycpIH08L2J1dHRvbj5cbiAgICAgICAgICAgIHsgIXRoaXMuc3RhdGUubWVzc2FnZSAmJiA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3NlbmR9PnsgX3QoJ1NlbmQnKSB9PC9idXR0b24+IH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHRleHRJbnB1dChpZCwgbGFiZWwpIHtcbiAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAgaWQ9e2lkfVxuICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgc2l6ZT1cIjQyXCJcbiAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9uXCJcbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlW2lkXX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZX1cbiAgICAgICAgLz47XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VuZEN1c3RvbUV2ZW50IGV4dGVuZHMgR2VuZXJpY0VkaXRvciB7XG4gICAgc3RhdGljIGdldExhYmVsKCkgeyByZXR1cm4gX3QoJ1NlbmQgQ3VzdG9tIEV2ZW50Jyk7IH1cblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uQmFjazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgcm9vbTogUHJvcFR5cGVzLmluc3RhbmNlT2YoUm9vbSkuaXNSZXF1aXJlZCxcbiAgICAgICAgZm9yY2VTdGF0ZUV2ZW50OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgZm9yY2VHZW5lcmFsRXZlbnQ6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBpbnB1dHM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgfTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuX3NlbmQgPSB0aGlzLl9zZW5kLmJpbmQodGhpcyk7XG5cbiAgICAgICAgY29uc3Qge2V2ZW50VHlwZSwgc3RhdGVLZXksIGV2Q29udGVudH0gPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGV2ZW50VHlwZTogJycsXG4gICAgICAgICAgICBzdGF0ZUtleTogJycsXG4gICAgICAgICAgICBldkNvbnRlbnQ6ICd7XFxuXFxufScsXG4gICAgICAgIH0sIHRoaXMucHJvcHMuaW5wdXRzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNTdGF0ZUV2ZW50OiBCb29sZWFuKHRoaXMucHJvcHMuZm9yY2VTdGF0ZUV2ZW50KSxcblxuICAgICAgICAgICAgZXZlbnRUeXBlLFxuICAgICAgICAgICAgc3RhdGVLZXksXG4gICAgICAgICAgICBldkNvbnRlbnQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2VuZChjb250ZW50KSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNTdGF0ZUV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpLnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRoaXMuc3RhdGUuZXZlbnRUeXBlLCBjb250ZW50LCB0aGlzLnN0YXRlLnN0YXRlS2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjbGkuc2VuZEV2ZW50KHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRoaXMuc3RhdGUuZXZlbnRUeXBlLCBjb250ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9zZW5kKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ldmVudFR5cGUgPT09ICcnKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZTogX3QoJ1lvdSBtdXN0IHNwZWNpZnkgYW4gZXZlbnQgdHlwZSEnKSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IEpTT04ucGFyc2UodGhpcy5zdGF0ZS5ldkNvbnRlbnQpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kKGNvbnRlbnQpO1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KCdFdmVudCBzZW50IScpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gX3QoJ0ZhaWxlZCB0byBzZW5kIGN1c3RvbSBldmVudC4nKSArICcgKCcgKyBlLnRvU3RyaW5nKCkgKyAnKSc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2UgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tZXNzYWdlKSB7XG4gICAgICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5tZXNzYWdlIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMuX2J1dHRvbnMoKSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaG93VGdsRmxpcCA9ICF0aGlzLnN0YXRlLm1lc3NhZ2UgJiYgIXRoaXMucHJvcHMuZm9yY2VTdGF0ZUV2ZW50ICYmICF0aGlzLnByb3BzLmZvcmNlR2VuZXJhbEV2ZW50O1xuXG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19ldmVudFR5cGVTdGF0ZUtleUdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy50ZXh0SW5wdXQoJ2V2ZW50VHlwZScsIF90KCdFdmVudCBUeXBlJykpIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmlzU3RhdGVFdmVudCAmJiB0aGlzLnRleHRJbnB1dCgnc3RhdGVLZXknLCBfdCgnU3RhdGUgS2V5JykpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxiciAvPlxuXG4gICAgICAgICAgICAgICAgPEZpZWxkIGlkPVwiZXZDb250ZW50XCIgbGFiZWw9e190KFwiRXZlbnQgQ29udGVudFwiKX0gdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJteF9EZXZUb29sc190ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiIHZhbHVlPXt0aGlzLnN0YXRlLmV2Q29udGVudH0gb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfSBlbGVtZW50PVwidGV4dGFyZWFcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+eyBfdCgnQmFjaycpIH08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICB7ICF0aGlzLnN0YXRlLm1lc3NhZ2UgJiYgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9zZW5kfT57IF90KCdTZW5kJykgfTwvYnV0dG9uPiB9XG4gICAgICAgICAgICAgICAgeyBzaG93VGdsRmxpcCAmJiA8ZGl2IHN0eWxlPXt7ZmxvYXQ6IFwicmlnaHRcIn19PlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJpc1N0YXRlRXZlbnRcIiBjbGFzc05hbWU9XCJteF9EZXZUb29sc190Z2wgbXhfRGV2VG9vbHNfdGdsLWZsaXBcIiB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9IGNoZWNrZWQ9e3RoaXMuc3RhdGUuaXNTdGF0ZUV2ZW50fSAvPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGdsLWJ0blwiIGRhdGEtdGctb2ZmPVwiRXZlbnRcIiBkYXRhLXRnLW9uPVwiU3RhdGUgRXZlbnRcIiBodG1sRm9yPVwiaXNTdGF0ZUV2ZW50XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG5cbmNsYXNzIFNlbmRBY2NvdW50RGF0YSBleHRlbmRzIEdlbmVyaWNFZGl0b3Ige1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHsgcmV0dXJuIF90KCdTZW5kIEFjY291bnQgRGF0YScpOyB9XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICByb29tOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSb29tKS5pc1JlcXVpcmVkLFxuICAgICAgICBpc1Jvb21BY2NvdW50RGF0YTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGZvcmNlTW9kZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGlucHV0czogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5fc2VuZCA9IHRoaXMuX3NlbmQuYmluZCh0aGlzKTtcblxuICAgICAgICBjb25zdCB7ZXZlbnRUeXBlLCBldkNvbnRlbnR9ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBldmVudFR5cGU6ICcnLFxuICAgICAgICAgICAgZXZDb250ZW50OiAne1xcblxcbn0nLFxuICAgICAgICB9LCB0aGlzLnByb3BzLmlucHV0cyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGlzUm9vbUFjY291bnREYXRhOiBCb29sZWFuKHRoaXMucHJvcHMuaXNSb29tQWNjb3VudERhdGEpLFxuXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBldkNvbnRlbnQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2VuZChjb250ZW50KSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNSb29tQWNjb3VudERhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGkuc2V0Um9vbUFjY291bnREYXRhKHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRoaXMuc3RhdGUuZXZlbnRUeXBlLCBjb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2xpLnNldEFjY291bnREYXRhKHRoaXMuc3RhdGUuZXZlbnRUeXBlLCBjb250ZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBfc2VuZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXZlbnRUeXBlID09PSAnJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2U6IF90KCdZb3UgbXVzdCBzcGVjaWZ5IGFuIGV2ZW50IHR5cGUhJykgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBKU09OLnBhcnNlKHRoaXMuc3RhdGUuZXZDb250ZW50KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZChjb250ZW50KTtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdCgnRXZlbnQgc2VudCEnKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KCdGYWlsZWQgdG8gc2VuZCBjdXN0b20gZXZlbnQuJykgKyAnICgnICsgZS50b1N0cmluZygpICsgJyknO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZXNzYWdlIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVzc2FnZSkge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyB0aGlzLl9idXR0b25zKCkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7IHRoaXMudGV4dElucHV0KCdldmVudFR5cGUnLCBfdCgnRXZlbnQgVHlwZScpKSB9XG4gICAgICAgICAgICAgICAgPGJyIC8+XG5cbiAgICAgICAgICAgICAgICA8RmllbGQgaWQ9XCJldkNvbnRlbnRcIiBsYWJlbD17X3QoXCJFdmVudCBDb250ZW50XCIpfSB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX3RleHRhcmVhXCJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCIgdmFsdWU9e3RoaXMuc3RhdGUuZXZDb250ZW50fSBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9IGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CYWNrfT57IF90KCdCYWNrJykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIHsgIXRoaXMuc3RhdGUubWVzc2FnZSAmJiA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3NlbmR9PnsgX3QoJ1NlbmQnKSB9PC9idXR0b24+IH1cbiAgICAgICAgICAgICAgICB7ICF0aGlzLnN0YXRlLm1lc3NhZ2UgJiYgPGRpdiBzdHlsZT17e2Zsb2F0OiBcInJpZ2h0XCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiaXNSb29tQWNjb3VudERhdGFcIiBjbGFzc05hbWU9XCJteF9EZXZUb29sc190Z2wgbXhfRGV2VG9vbHNfdGdsLWZsaXBcIiB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9IGNoZWNrZWQ9e3RoaXMuc3RhdGUuaXNSb29tQWNjb3VudERhdGF9IGRpc2FibGVkPXt0aGlzLnByb3BzLmZvcmNlTW9kZX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX3RnbC1idG5cIiBkYXRhLXRnLW9mZj1cIkFjY291bnQgRGF0YVwiIGRhdGEtdGctb249XCJSb29tIERhdGFcIiBodG1sRm9yPVwiaXNSb29tQWNjb3VudERhdGFcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuY29uc3QgSU5JVElBTF9MT0FEX1RJTEVTID0gMjA7XG5jb25zdCBMT0FEX1RJTEVTX1NURVBfU0laRSA9IDUwO1xuXG5jbGFzcyBGaWx0ZXJlZExpc3QgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBjaGlsZHJlbjogUHJvcFR5cGVzLmFueSxcbiAgICAgICAgcXVlcnk6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9O1xuXG4gICAgc3RhdGljIGZpbHRlckNoaWxkcmVuKGNoaWxkcmVuLCBxdWVyeSkge1xuICAgICAgICBpZiAoIXF1ZXJ5KSByZXR1cm4gY2hpbGRyZW47XG4gICAgICAgIGNvbnN0IGxjUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4uZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQua2V5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobGNRdWVyeSkpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZmlsdGVyZWRDaGlsZHJlbjogRmlsdGVyZWRMaXN0LmZpbHRlckNoaWxkcmVuKHRoaXMucHJvcHMuY2hpbGRyZW4sIHRoaXMucHJvcHMucXVlcnkpLFxuICAgICAgICAgICAgdHJ1bmNhdGVBdDogSU5JVElBTF9MT0FEX1RJTEVTLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNoaWxkcmVuID09PSBuZXh0UHJvcHMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5xdWVyeSA9PT0gbmV4dFByb3BzLnF1ZXJ5KSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmlsdGVyZWRDaGlsZHJlbjogRmlsdGVyZWRMaXN0LmZpbHRlckNoaWxkcmVuKG5leHRQcm9wcy5jaGlsZHJlbiwgbmV4dFByb3BzLnF1ZXJ5KSxcbiAgICAgICAgICAgIHRydW5jYXRlQXQ6IElOSVRJQUxfTE9BRF9USUxFUyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2hvd0FsbCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cnVuY2F0ZUF0OiB0aGlzLnN0YXRlLnRydW5jYXRlQXQgKyBMT0FEX1RJTEVTX1NURVBfU0laRSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudCA9IChvdmVyZmxvd0NvdW50OiBudW1iZXIsIHRvdGFsQ291bnQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gPGJ1dHRvbiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b25cIiBvbkNsaWNrPXt0aGlzLnNob3dBbGx9PlxuICAgICAgICAgICAgeyBfdChcImFuZCAlKGNvdW50KXMgb3RoZXJzLi4uXCIsIHsgY291bnQ6IG92ZXJmbG93Q291bnQgfSkgfVxuICAgICAgICA8L2J1dHRvbj47XG4gICAgfTtcblxuICAgIG9uUXVlcnkgPSAoZXYpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHRoaXMucHJvcHMub25DaGFuZ2UoZXYudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgZ2V0Q2hpbGRyZW4gPSAoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZmlsdGVyZWRDaGlsZHJlbi5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9O1xuXG4gICAgZ2V0Q2hpbGRDb3VudCA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5maWx0ZXJlZENoaWxkcmVuLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBUcnVuY2F0ZWRMaXN0ID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlRydW5jYXRlZExpc3RcIik7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPEZpZWxkIGxhYmVsPXtfdCgnRmlsdGVyIHJlc3VsdHMnKX0gYXV0b0ZvY3VzPXt0cnVlfSBzaXplPXs2NH1cbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIGF1dG9Db21wbGV0ZT1cIm9mZlwiIHZhbHVlPXt0aGlzLnByb3BzLnF1ZXJ5fSBvbkNoYW5nZT17dGhpcy5vblF1ZXJ5fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1RleHRJbnB1dERpYWxvZ19pbnB1dCBteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9xdWVyeVwiXG4gICAgICAgICAgICAgICAgLy8gZm9yY2UgcmUtcmVuZGVyIHNvIHRoYXQgYXV0b0ZvY3VzIGlzIGFwcGxpZWQgd2hlbiB0aGlzIGNvbXBvbmVudCBpcyByZS11c2VkXG4gICAgICAgICAgICAgICAga2V5PXt0aGlzLnByb3BzLmNoaWxkcmVuWzBdID8gdGhpcy5wcm9wcy5jaGlsZHJlblswXS5rZXkgOiAnJ30gLz5cblxuICAgICAgICAgICAgPFRydW5jYXRlZExpc3QgZ2V0Q2hpbGRyZW49e3RoaXMuZ2V0Q2hpbGRyZW59XG4gICAgICAgICAgICAgICAgZ2V0Q2hpbGRDb3VudD17dGhpcy5nZXRDaGlsZENvdW50fVxuICAgICAgICAgICAgICAgIHRydW5jYXRlQXQ9e3RoaXMuc3RhdGUudHJ1bmNhdGVBdH1cbiAgICAgICAgICAgICAgICBjcmVhdGVPdmVyZmxvd0VsZW1lbnQ9e3RoaXMuY3JlYXRlT3ZlcmZsb3dFbGVtZW50fSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5jbGFzcyBSb29tU3RhdGVFeHBsb3JlciBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHsgcmV0dXJuIF90KCdFeHBsb3JlIFJvb20gU3RhdGUnKTsgfVxuXG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25CYWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICByb29tOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSb29tKS5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgcm9vbVN0YXRlRXZlbnRzOiBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBNYXRyaXhFdmVudD4+O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMucm9vbVN0YXRlRXZlbnRzID0gdGhpcy5wcm9wcy5yb29tLmN1cnJlbnRTdGF0ZS5ldmVudHM7XG5cbiAgICAgICAgdGhpcy5vbkJhY2sgPSB0aGlzLm9uQmFjay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmVkaXRFdiA9IHRoaXMuZWRpdEV2LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25RdWVyeUV2ZW50VHlwZSA9IHRoaXMub25RdWVyeUV2ZW50VHlwZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uUXVlcnlTdGF0ZUtleSA9IHRoaXMub25RdWVyeVN0YXRlS2V5LmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGV2ZW50VHlwZTogbnVsbCxcbiAgICAgICAgICAgIGV2ZW50OiBudWxsLFxuICAgICAgICAgICAgZWRpdGluZzogZmFsc2UsXG5cbiAgICAgICAgICAgIHF1ZXJ5RXZlbnRUeXBlOiAnJyxcbiAgICAgICAgICAgIHF1ZXJ5U3RhdGVLZXk6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGJyb3dzZUV2ZW50VHlwZShldmVudFR5cGUpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudFR5cGUgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25WaWV3U291cmNlQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudCB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkJhY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXZlbnQ6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5ldmVudFR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudFR5cGU6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQmFjaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZWRpdEV2KCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdGluZzogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBvblF1ZXJ5RXZlbnRUeXBlKGZpbHRlckV2ZW50VHlwZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcXVlcnlFdmVudFR5cGU6IGZpbHRlckV2ZW50VHlwZSB9KTtcbiAgICB9XG5cbiAgICBvblF1ZXJ5U3RhdGVLZXkoZmlsdGVyU3RhdGVLZXkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHF1ZXJ5U3RhdGVLZXk6IGZpbHRlclN0YXRlS2V5IH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPFNlbmRDdXN0b21FdmVudCByb29tPXt0aGlzLnByb3BzLnJvb219IGZvcmNlU3RhdGVFdmVudD17dHJ1ZX0gb25CYWNrPXt0aGlzLm9uQmFja30gaW5wdXRzPXt7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogdGhpcy5zdGF0ZS5ldmVudC5nZXRUeXBlKCksXG4gICAgICAgICAgICAgICAgICAgIGV2Q29udGVudDogSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ldmVudC5nZXRDb250ZW50KCksIG51bGwsICdcXHQnKSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVLZXk6IHRoaXMuc3RhdGUuZXZlbnQuZ2V0U3RhdGVLZXkoKSxcbiAgICAgICAgICAgICAgICB9fSAvPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVmlld1NvdXJjZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPFN5bnRheEhpZ2hsaWdodCBjbGFzc05hbWU9XCJqc29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuZXZlbnQuZXZlbnQsIG51bGwsIDIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9TeW50YXhIaWdobGlnaHQ+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CYWNrfT57IF90KCdCYWNrJykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuZWRpdEV2fT57IF90KCdFZGl0JykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxpc3QgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSAnbXhfRGV2VG9vbHNfUm9vbVN0YXRlRXhwbG9yZXJfYnV0dG9uJztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXZlbnRUeXBlID09PSBudWxsKSB7XG4gICAgICAgICAgICBsaXN0ID0gPEZpbHRlcmVkTGlzdCBxdWVyeT17dGhpcy5zdGF0ZS5xdWVyeUV2ZW50VHlwZX0gb25DaGFuZ2U9e3RoaXMub25RdWVyeUV2ZW50VHlwZX0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMucm9vbVN0YXRlRXZlbnRzLmVudHJpZXMoKSkubWFwKChbZXZlbnRUeXBlLCBhbGxTdGF0ZUtleXNdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb25DbGlja0ZuO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbFN0YXRlS2V5cy5zaXplID09PSAxICYmIGFsbFN0YXRlS2V5cy5oYXMoXCJcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrRm4gPSB0aGlzLm9uVmlld1NvdXJjZUNsaWNrKGFsbFN0YXRlS2V5cy5nZXQoXCJcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrRm4gPSB0aGlzLmJyb3dzZUV2ZW50VHlwZShldmVudFR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGJ1dHRvbiBjbGFzc05hbWU9e2NsYXNzZXN9IGtleT17ZXZlbnRUeXBlfSBvbkNsaWNrPXtvbkNsaWNrRm59PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtldmVudFR5cGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj47XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9GaWx0ZXJlZExpc3Q+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RhdGVHcm91cCA9IHRoaXMucm9vbVN0YXRlRXZlbnRzLmdldCh0aGlzLnN0YXRlLmV2ZW50VHlwZSk7XG5cbiAgICAgICAgICAgIGxpc3QgPSA8RmlsdGVyZWRMaXN0IHF1ZXJ5PXt0aGlzLnN0YXRlLnF1ZXJ5U3RhdGVLZXl9IG9uQ2hhbmdlPXt0aGlzLm9uUXVlcnlTdGF0ZUtleX0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKHN0YXRlR3JvdXAuZW50cmllcygpKS5tYXAoKFtzdGF0ZUtleSwgZXZdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGJ1dHRvbiBjbGFzc05hbWU9e2NsYXNzZXN9IGtleT17c3RhdGVLZXl9IG9uQ2xpY2s9e3RoaXMub25WaWV3U291cmNlQ2xpY2soZXYpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0YXRlS2V5IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPjtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L0ZpbHRlcmVkTGlzdD47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7IGxpc3QgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+eyBfdCgnQmFjaycpIH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5jbGFzcyBBY2NvdW50RGF0YUV4cGxvcmVyIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGdldExhYmVsKCkgeyByZXR1cm4gX3QoJ0V4cGxvcmUgQWNjb3VudCBEYXRhJyk7IH1cblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uQmFjazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgcm9vbTogUHJvcFR5cGVzLmluc3RhbmNlT2YoUm9vbSkuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLm9uQmFjayA9IHRoaXMub25CYWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZWRpdEV2ID0gdGhpcy5lZGl0RXYuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2UgPSB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uUXVlcnlFdmVudFR5cGUgPSB0aGlzLm9uUXVlcnlFdmVudFR5cGUuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNSb29tQWNjb3VudERhdGE6IGZhbHNlLFxuICAgICAgICAgICAgZXZlbnQ6IG51bGwsXG4gICAgICAgICAgICBlZGl0aW5nOiBmYWxzZSxcblxuICAgICAgICAgICAgcXVlcnlFdmVudFR5cGU6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUm9vbUFjY291bnREYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb29tLmFjY291bnREYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuc3RvcmUuYWNjb3VudERhdGE7XG4gICAgfVxuXG4gICAgb25WaWV3U291cmNlQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudCB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkJhY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXZlbnQ6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQmFjaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uQ2hhbmdlKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W2UudGFyZ2V0LmlkXTogZS50YXJnZXQudHlwZSA9PT0gJ2NoZWNrYm94JyA/IGUudGFyZ2V0LmNoZWNrZWQgOiBlLnRhcmdldC52YWx1ZX0pO1xuICAgIH1cblxuICAgIGVkaXRFdigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRpbmc6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgb25RdWVyeUV2ZW50VHlwZShxdWVyeUV2ZW50VHlwZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcXVlcnlFdmVudFR5cGUgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybiA8U2VuZEFjY291bnREYXRhXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgaXNSb29tQWNjb3VudERhdGE9e3RoaXMuc3RhdGUuaXNSb29tQWNjb3VudERhdGF9XG4gICAgICAgICAgICAgICAgICAgIG9uQmFjaz17dGhpcy5vbkJhY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0cz17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiB0aGlzLnN0YXRlLmV2ZW50LmdldFR5cGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2Q29udGVudDogSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ldmVudC5nZXRDb250ZW50KCksIG51bGwsICdcXHQnKSxcbiAgICAgICAgICAgICAgICAgICAgfX0gZm9yY2VNb2RlPXt0cnVlfSAvPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVmlld1NvdXJjZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8U3ludGF4SGlnaGxpZ2h0IGNsYXNzTmFtZT1cImpzb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ldmVudC5ldmVudCwgbnVsbCwgMikgfVxuICAgICAgICAgICAgICAgICAgICA8L1N5bnRheEhpZ2hsaWdodD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkJhY2t9PnsgX3QoJ0JhY2snKSB9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5lZGl0RXZ9PnsgX3QoJ0VkaXQnKSB9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb3dzID0gW107XG5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9ICdteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b24nO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldERhdGEoKTtcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoZXZUeXBlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldiA9IGRhdGFbZXZUeXBlXTtcbiAgICAgICAgICAgIHJvd3MucHVzaCg8YnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtldlR5cGV9IG9uQ2xpY2s9e3RoaXMub25WaWV3U291cmNlQ2xpY2soZXYpfT5cbiAgICAgICAgICAgICAgICB7IGV2VHlwZSB9XG4gICAgICAgICAgICA8L2J1dHRvbj4pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8RmlsdGVyZWRMaXN0IHF1ZXJ5PXt0aGlzLnN0YXRlLnF1ZXJ5RXZlbnRUeXBlfSBvbkNoYW5nZT17dGhpcy5vblF1ZXJ5RXZlbnRUeXBlfT5cbiAgICAgICAgICAgICAgICAgICAgeyByb3dzIH1cbiAgICAgICAgICAgICAgICA8L0ZpbHRlcmVkTGlzdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkJhY2t9PnsgX3QoJ0JhY2snKSB9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgeyAhdGhpcy5zdGF0ZS5tZXNzYWdlICYmIDxkaXYgc3R5bGU9e3tmbG9hdDogXCJyaWdodFwifX0+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImlzUm9vbUFjY291bnREYXRhXCIgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGdsIG14X0RldlRvb2xzX3RnbC1mbGlwXCIgdHlwZT1cImNoZWNrYm94XCIgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfSBjaGVja2VkPXt0aGlzLnN0YXRlLmlzUm9vbUFjY291bnREYXRhfSAvPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGdsLWJ0blwiIGRhdGEtdGctb2ZmPVwiQWNjb3VudCBEYXRhXCIgZGF0YS10Zy1vbj1cIlJvb20gRGF0YVwiIGh0bWxGb3I9XCJpc1Jvb21BY2NvdW50RGF0YVwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5jbGFzcyBTZXJ2ZXJzSW5Sb29tTGlzdCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHsgcmV0dXJuIF90KCdWaWV3IFNlcnZlcnMgaW4gUm9vbScpOyB9XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkJhY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5pbnN0YW5jZU9mKFJvb20pLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMucHJvcHMucm9vbTtcbiAgICAgICAgY29uc3Qgc2VydmVycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20ubWVtYmVyXCIpLmZvckVhY2goZXYgPT4gc2VydmVycy5hZGQoZXYuZ2V0U2VuZGVyKCkuc3BsaXQoXCI6XCIpWzFdKSk7XG4gICAgICAgIHRoaXMuc2VydmVycyA9IEFycmF5LmZyb20oc2VydmVycykubWFwKHMgPT5cbiAgICAgICAgICAgIDxidXR0b24ga2V5PXtzfSBjbGFzc05hbWU9XCJteF9EZXZUb29sc19TZXJ2ZXJzSW5Sb29tTGlzdF9idXR0b25cIj5cbiAgICAgICAgICAgICAgICB7IHMgfVxuICAgICAgICAgICAgPC9idXR0b24+KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcXVlcnk6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uUXVlcnkgPSAocXVlcnkpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHF1ZXJ5IH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPEZpbHRlcmVkTGlzdCBxdWVyeT17dGhpcy5zdGF0ZS5xdWVyeX0gb25DaGFuZ2U9e3RoaXMub25RdWVyeX0+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zZXJ2ZXJzIH1cbiAgICAgICAgICAgICAgICA8L0ZpbHRlcmVkTGlzdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5vbkJhY2t9PnsgX3QoJ0JhY2snKSB9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuY29uc3QgUEhBU0VfTUFQID0ge1xuICAgIFtQSEFTRV9VTlNFTlRdOiBcInVuc2VudFwiLFxuICAgIFtQSEFTRV9SRVFVRVNURURdOiBcInJlcXVlc3RlZFwiLFxuICAgIFtQSEFTRV9SRUFEWV06IFwicmVhZHlcIixcbiAgICBbUEhBU0VfRE9ORV06IFwiZG9uZVwiLFxuICAgIFtQSEFTRV9TVEFSVEVEXTogXCJzdGFydGVkXCIsXG4gICAgW1BIQVNFX0NBTkNFTExFRF06IFwiY2FuY2VsbGVkXCIsXG59O1xuXG5mdW5jdGlvbiBWZXJpZmljYXRpb25SZXF1ZXN0KHt0eG5JZCwgcmVxdWVzdH0pIHtcbiAgICBjb25zdCBbLCB1cGRhdGVTdGF0ZV0gPSB1c2VTdGF0ZSgpO1xuICAgIGNvbnN0IFt0aW1lb3V0LCBzZXRSZXF1ZXN0VGltZW91dF0gPSB1c2VTdGF0ZShyZXF1ZXN0LnRpbWVvdXQpO1xuXG4gICAgLyogUmUtcmVuZGVyIGlmIHNvbWV0aGluZyBjaGFuZ2VzIHN0YXRlICovXG4gICAgdXNlRXZlbnRFbWl0dGVyKHJlcXVlc3QsIFwiY2hhbmdlXCIsIHVwZGF0ZVN0YXRlKTtcblxuICAgIC8qIEtlZXAgcmUtcmVuZGVyaW5nIGlmIHRoZXJlJ3MgYSB0aW1lb3V0ICovXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3QudGltZW91dCA9PSAwKSByZXR1cm47XG5cbiAgICAgICAgLyogTm90ZSB0aGF0IHJlcXVlc3QudGltZW91dCBpcyBhIGdldHRlciwgc28gaXRzIHZhbHVlIGNoYW5nZXMgKi9cbiAgICAgICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBzZXRSZXF1ZXN0VGltZW91dChyZXF1ZXN0LnRpbWVvdXQpO1xuICAgICAgICB9LCA1MDApO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7IGNsZWFySW50ZXJ2YWwoaWQpOyB9O1xuICAgIH0sIFtyZXF1ZXN0XSk7XG5cbiAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfVmVyaWZpY2F0aW9uUmVxdWVzdFwiPlxuICAgICAgICA8ZGw+XG4gICAgICAgICAgICA8ZHQ+VHJhbnNhY3Rpb248L2R0PlxuICAgICAgICAgICAgPGRkPnt0eG5JZH08L2RkPlxuICAgICAgICAgICAgPGR0PlBoYXNlPC9kdD5cbiAgICAgICAgICAgIDxkZD57UEhBU0VfTUFQW3JlcXVlc3QucGhhc2VdIHx8IHJlcXVlc3QucGhhc2V9PC9kZD5cbiAgICAgICAgICAgIDxkdD5UaW1lb3V0PC9kdD5cbiAgICAgICAgICAgIDxkZD57TWF0aC5mbG9vcih0aW1lb3V0IC8gMTAwMCl9PC9kZD5cbiAgICAgICAgICAgIDxkdD5NZXRob2RzPC9kdD5cbiAgICAgICAgICAgIDxkZD57cmVxdWVzdC5tZXRob2RzICYmIHJlcXVlc3QubWV0aG9kcy5qb2luKFwiLCBcIil9PC9kZD5cbiAgICAgICAgICAgIDxkdD5yZXF1ZXN0aW5nVXNlcklkPC9kdD5cbiAgICAgICAgICAgIDxkZD57cmVxdWVzdC5yZXF1ZXN0aW5nVXNlcklkfTwvZGQ+XG4gICAgICAgICAgICA8ZHQ+b2JzZXJ2ZU9ubHk8L2R0PlxuICAgICAgICAgICAgPGRkPntKU09OLnN0cmluZ2lmeShyZXF1ZXN0Lm9ic2VydmVPbmx5KX08L2RkPlxuICAgICAgICA8L2RsPlxuICAgIDwvZGl2Pik7XG59XG5cbmNsYXNzIFZlcmlmaWNhdGlvbkV4cGxvcmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgZ2V0TGFiZWwoKSB7XG4gICAgICAgIHJldHVybiBfdChcIlZlcmlmaWNhdGlvbiBSZXF1ZXN0c1wiKTtcbiAgICB9XG5cbiAgICAvKiBFbnN1cmUgdGhpcy5jb250ZXh0IGlzIHRoZSBjbGkgKi9cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgb25OZXdSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY2xpLm9uKFwiY3J5cHRvLnZlcmlmaWNhdGlvbi5yZXF1ZXN0XCIsIHRoaXMub25OZXdSZXF1ZXN0KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjbGkub2ZmKFwiY3J5cHRvLnZlcmlmaWNhdGlvbi5yZXF1ZXN0XCIsIHRoaXMub25OZXdSZXF1ZXN0KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMucHJvcHMucm9vbTtcbiAgICAgICAgY29uc3QgaW5Sb29tQ2hhbm5lbCA9IGNsaS5fY3J5cHRvLl9pblJvb21WZXJpZmljYXRpb25SZXF1ZXN0cztcbiAgICAgICAgY29uc3QgaW5Sb29tUmVxdWVzdHMgPSAoaW5Sb29tQ2hhbm5lbC5fcmVxdWVzdHNCeVJvb21JZCB8fCBuZXcgTWFwKCkpLmdldChyb29tLnJvb21JZCkgfHwgbmV3IE1hcCgpO1xuXG4gICAgICAgIHJldHVybiAoPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7QXJyYXkuZnJvbShpblJvb21SZXF1ZXN0cy5lbnRyaWVzKCkpLnJldmVyc2UoKS5tYXAoKFt0eG5JZCwgcmVxdWVzdF0pID0+XG4gICAgICAgICAgICAgICAgICAgIDxWZXJpZmljYXRpb25SZXF1ZXN0IHR4bklkPXt0eG5JZH0gcmVxdWVzdD17cmVxdWVzdH0ga2V5PXt0eG5JZH0gLz4sXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5vbkJhY2t9PntfdChcIkJhY2tcIil9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+KTtcbiAgICB9XG59XG5cbmNsYXNzIFdpZGdldEV4cGxvcmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgZ2V0TGFiZWwoKSB7XG4gICAgICAgIHJldHVybiBfdChcIkFjdGl2ZSBXaWRnZXRzXCIpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcXVlcnk6ICcnLFxuICAgICAgICAgICAgZWRpdFdpZGdldDogbnVsbCwgLy8gc2V0IHRvIGFuIElBcHAgd2hlbiBlZGl0aW5nXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25XaWRnZXRTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBvblF1ZXJ5Q2hhbmdlID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3F1ZXJ5fSk7XG4gICAgfTtcblxuICAgIG9uRWRpdFdpZGdldCA9ICh3aWRnZXQpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZWRpdFdpZGdldDogd2lkZ2V0fSk7XG4gICAgfTtcblxuICAgIG9uQmFjayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IFdpZGdldFN0b3JlLmluc3RhbmNlLmdldEFwcHModGhpcy5wcm9wcy5yb29tLnJvb21JZCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRXaWRnZXQgJiYgd2lkZ2V0cy5pbmNsdWRlcyh0aGlzLnN0YXRlLmVkaXRXaWRnZXQpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlZGl0V2lkZ2V0OiBudWxsfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQmFjaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBXaWRnZXRTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMub25XaWRnZXRTdG9yZVVwZGF0ZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIFdpZGdldFN0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfRVZFTlQsIHRoaXMub25XaWRnZXRTdG9yZVVwZGF0ZSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5wcm9wcy5yb29tO1xuXG4gICAgICAgIGNvbnN0IGVkaXRXaWRnZXQgPSB0aGlzLnN0YXRlLmVkaXRXaWRnZXQ7XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSBXaWRnZXRTdG9yZS5pbnN0YW5jZS5nZXRBcHBzKHJvb20ucm9vbUlkKTtcbiAgICAgICAgaWYgKGVkaXRXaWRnZXQgJiYgd2lkZ2V0cy5pbmNsdWRlcyhlZGl0V2lkZ2V0KSkge1xuICAgICAgICAgICAgY29uc3QgYWxsU3RhdGUgPSBBcnJheS5mcm9tKEFycmF5LmZyb20ocm9vbS5jdXJyZW50U3RhdGUuZXZlbnRzLnZhbHVlcygpKS5tYXAoZSA9PiBlLnZhbHVlcygpKSlcbiAgICAgICAgICAgICAgICAucmVkdWNlKChwLCBjKSA9PiB7cC5wdXNoKC4uLmMpOyByZXR1cm4gcDt9LCBbXSk7XG4gICAgICAgICAgICBjb25zdCBzdGF0ZUV2ID0gYWxsU3RhdGUuZmluZChldiA9PiBldi5nZXRJZCgpID09PSBlZGl0V2lkZ2V0LmV2ZW50SWQpO1xuICAgICAgICAgICAgaWYgKCFzdGF0ZUV2KSB7IC8vIFwic2hvdWxkIG5ldmVyIGhhcHBlblwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlRoZXJlIHdhcyBhbiBlcnJvciBmaW5kaW5nIHRoaXMgd2lkZ2V0LlwiKX1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+e190KFwiQmFja1wiKX08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDxTZW5kQ3VzdG9tRXZlbnRcbiAgICAgICAgICAgICAgICBvbkJhY2s9e3RoaXMub25CYWNrfVxuICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgZm9yY2VTdGF0ZUV2ZW50PXt0cnVlfVxuICAgICAgICAgICAgICAgIGlucHV0cz17e1xuICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6IHN0YXRlRXYuZ2V0VHlwZSgpLFxuICAgICAgICAgICAgICAgICAgICBldkNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KHN0YXRlRXYuZ2V0Q29udGVudCgpLCBudWxsLCAnXFx0JyksXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlS2V5OiBzdGF0ZUV2LmdldFN0YXRlS2V5KCksXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICg8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxGaWx0ZXJlZExpc3QgcXVlcnk9e3RoaXMuc3RhdGUucXVlcnl9IG9uQ2hhbmdlPXt0aGlzLm9uUXVlcnlDaGFuZ2V9PlxuICAgICAgICAgICAgICAgICAgICB7d2lkZ2V0cy5tYXAodyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfRGV2VG9vbHNfUm9vbVN0YXRlRXhwbG9yZXJfYnV0dG9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17dy51cmwgKyB3LmV2ZW50SWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5vbkVkaXRXaWRnZXQodyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+e3cudXJsfTwvYnV0dG9uPjtcbiAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgPC9GaWx0ZXJlZExpc3Q+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CYWNrfT57X3QoXCJCYWNrXCIpfTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxufVxuXG5jbGFzcyBTZXR0aW5nc0V4cGxvcmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgZ2V0TGFiZWwoKSB7XG4gICAgICAgIHJldHVybiBfdChcIlNldHRpbmdzIEV4cGxvcmVyXCIpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcXVlcnk6ICcnLFxuICAgICAgICAgICAgZWRpdFNldHRpbmc6IG51bGwsIC8vIHNldCB0byBhIHNldHRpbmcgSUQgd2hlbiBlZGl0aW5nXG4gICAgICAgICAgICB2aWV3U2V0dGluZzogbnVsbCwgLy8gc2V0IHRvIGEgc2V0dGluZyBJRCB3aGVuIGV4cGxvcmluZyBpbiBkZXRhaWxcblxuICAgICAgICAgICAgZXhwbGljaXRWYWx1ZXM6IG51bGwsIC8vIHN0cmluZ2lmaWVkIEpTT04gZm9yIGVkaXQgdmlld1xuICAgICAgICAgICAgZXhwbGljaXRSb29tVmFsdWVzOiBudWxsLCAvLyBzdHJpbmdpZmllZCBKU09OIGZvciBlZGl0IHZpZXdcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvblF1ZXJ5Q2hhbmdlID0gKGV2KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3F1ZXJ5OiBldi50YXJnZXQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgb25FeHBsVmFsdWVzRWRpdCA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtleHBsaWNpdFZhbHVlczogZXYudGFyZ2V0LnZhbHVlfSk7XG4gICAgfTtcblxuICAgIG9uRXhwbFJvb21WYWx1ZXNFZGl0ID0gKGV2KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2V4cGxpY2l0Um9vbVZhbHVlczogZXYudGFyZ2V0LnZhbHVlfSk7XG4gICAgfTtcblxuICAgIG9uQmFjayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdFNldHRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2VkaXRTZXR0aW5nOiBudWxsfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3U2V0dGluZykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmlld1NldHRpbmc6IG51bGx9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25CYWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25WaWV3Q2xpY2sgPSAoZXYsIHNldHRpbmdJZCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt2aWV3U2V0dGluZzogc2V0dGluZ0lkfSk7XG4gICAgfTtcblxuICAgIG9uRWRpdENsaWNrID0gKGV2LCBzZXR0aW5nSWQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlZGl0U2V0dGluZzogc2V0dGluZ0lkLFxuICAgICAgICAgICAgZXhwbGljaXRWYWx1ZXM6IHRoaXMucmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzKHNldHRpbmdJZCwgbnVsbCksXG4gICAgICAgICAgICBleHBsaWNpdFJvb21WYWx1ZXM6IHRoaXMucmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzKHNldHRpbmdJZCwgdGhpcy5wcm9wcy5yb29tLnJvb21JZCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvblNhdmVDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdJZCA9IHRoaXMuc3RhdGUuZWRpdFNldHRpbmc7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRFeHBsaWNpdCA9IEpTT04ucGFyc2UodGhpcy5zdGF0ZS5leHBsaWNpdFZhbHVlcyk7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRFeHBsaWNpdFJvb20gPSBKU09OLnBhcnNlKHRoaXMuc3RhdGUuZXhwbGljaXRSb29tVmFsdWVzKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgT2JqZWN0LmtleXMocGFyc2VkRXhwbGljaXQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtEZXZ0b29sc10gU2V0dGluZyB2YWx1ZSBvZiAke3NldHRpbmdJZH0gYXQgJHtsZXZlbH0gZnJvbSB1c2VyIGlucHV0YCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsID0gcGFyc2VkRXhwbGljaXRbbGV2ZWxdO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKHNldHRpbmdJZCwgbnVsbCwgbGV2ZWwsIHZhbCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5yb29tLnJvb21JZDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgT2JqZWN0LmtleXMocGFyc2VkRXhwbGljaXQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtEZXZ0b29sc10gU2V0dGluZyB2YWx1ZSBvZiAke3NldHRpbmdJZH0gYXQgJHtsZXZlbH0gaW4gJHtyb29tSWR9IGZyb20gdXNlciBpbnB1dGApO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IHBhcnNlZEV4cGxpY2l0Um9vbVtsZXZlbF07XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoc2V0dGluZ0lkLCByb29tSWQsIGxldmVsLCB2YWwpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZpZXdTZXR0aW5nOiBzZXR0aW5nSWQsXG4gICAgICAgICAgICAgICAgZWRpdFNldHRpbmc6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRGV2dG9vbHMgLSBGYWlsZWQgdG8gc2F2ZSBzZXR0aW5ncycsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byBzYXZlIHNldHRpbmdzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlLm1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXJTZXR0aW5nVmFsdWUodmFsKSB7XG4gICAgICAgIC8vIE5vdGU6IHdlIGRvbid0IC50b1N0cmluZygpIGEgc3RyaW5nIGJlY2F1c2Ugd2Ugd2FudCBKU09OLnN0cmluZ2lmeSB0byBpbmplY3QgcXVvdGVzIGZvciB1c1xuICAgICAgICBjb25zdCB0b1N0cmluZ1R5cGVzID0gWydib29sZWFuJywgJ251bWJlciddO1xuICAgICAgICBpZiAodG9TdHJpbmdUeXBlcy5pbmNsdWRlcyh0eXBlb2YodmFsKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWwudG9TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzKHNldHRpbmcsIHJvb21JZCkge1xuICAgICAgICBjb25zdCB2YWxzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgTEVWRUxfT1JERVIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFsc1tsZXZlbF0gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQobGV2ZWwsIHNldHRpbmcsIHJvb21JZCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHNbbGV2ZWxdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsc1tsZXZlbF0gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHMsIG51bGwsIDQpO1xuICAgIH1cblxuICAgIHJlbmRlckNhbkVkaXRMZXZlbChyb29tSWQsIGxldmVsKSB7XG4gICAgICAgIGNvbnN0IGNhbkVkaXQgPSBTZXR0aW5nc1N0b3JlLmNhblNldFZhbHVlKHRoaXMuc3RhdGUuZWRpdFNldHRpbmcsIHJvb21JZCwgbGV2ZWwpO1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBjYW5FZGl0ID8gJ214X0RldlRvb2xzX1NldHRpbmdzRXhwbG9yZXJfbXV0YWJsZScgOiAnbXhfRGV2VG9vbHNfU2V0dGluZ3NFeHBsb3Jlcl9pbW11dGFibGUnO1xuICAgICAgICByZXR1cm4gPHRkIGNsYXNzTmFtZT17Y2xhc3NOYW1lfT48Y29kZT57Y2FuRWRpdC50b1N0cmluZygpfTwvY29kZT48L3RkPjtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnByb3BzLnJvb207XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnZpZXdTZXR0aW5nICYmICF0aGlzLnN0YXRlLmVkaXRTZXR0aW5nKSB7XG4gICAgICAgICAgICAvLyB2aWV3IGFsbCBzZXR0aW5nc1xuICAgICAgICAgICAgY29uc3QgYWxsU2V0dGluZ3MgPSBPYmplY3Qua2V5cyhTRVRUSU5HUylcbiAgICAgICAgICAgICAgICAuZmlsdGVyKG4gPT4gdGhpcy5zdGF0ZS5xdWVyeSA/IG4udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyh0aGlzLnN0YXRlLnF1ZXJ5LnRvTG93ZXJDYXNlKCkpIDogdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnQgbXhfRGV2VG9vbHNfU2V0dGluZ3NFeHBsb3JlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdGaWx0ZXIgcmVzdWx0cycpfSBhdXRvRm9jdXM9e3RydWV9IHNpemU9ezY0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgYXV0b0NvbXBsZXRlPVwib2ZmXCIgdmFsdWU9e3RoaXMuc3RhdGUucXVlcnl9IG9uQ2hhbmdlPXt0aGlzLm9uUXVlcnlDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVGV4dElucHV0RGlhbG9nX2lucHV0IG14X0RldlRvb2xzX1Jvb21TdGF0ZUV4cGxvcmVyX3F1ZXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+e190KFwiU2V0dGluZyBJRFwiKX08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPntfdChcIlZhbHVlXCIpfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+e190KFwiVmFsdWUgaW4gdGhpcyByb29tXCIpfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthbGxTZXR0aW5ncy5tYXAoaSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJcIiBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblZpZXdDbGljayhlLCBpKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT57aX08L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIlwiIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uRWRpdENsaWNrKGUsIGkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9EZXZUb29sc19TZXR0aW5nc0V4cGxvcmVyX2VkaXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pyPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvZGU+e3RoaXMucmVuZGVyU2V0dGluZ1ZhbHVlKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoaSkpfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJTZXR0aW5nVmFsdWUoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShpLCByb29tLnJvb21JZCkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+e190KFwiQmFja1wiKX08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZWRpdFNldHRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudCBteF9EZXZUb29sc19TZXR0aW5nc0V4cGxvcmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDM+e190KFwiU2V0dGluZzpcIil9IDxjb2RlPnt0aGlzLnN0YXRlLmVkaXRTZXR0aW5nfTwvY29kZT48L2gzPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRGV2VG9vbHNfU2V0dGluZ3NFeHBsb3Jlcl93YXJuaW5nJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Yj57X3QoXCJDYXV0aW9uOlwiKX08L2I+IHtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGlzIFVJIGRvZXMgTk9UIGNoZWNrIHRoZSB0eXBlcyBvZiB0aGUgdmFsdWVzLiBVc2UgYXQgeW91ciBvd24gcmlzay5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiU2V0dGluZyBkZWZpbml0aW9uOlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cHJlPjxjb2RlPntKU09OLnN0cmluZ2lmeShTRVRUSU5HU1t0aGlzLnN0YXRlLmVkaXRTZXR0aW5nXSwgbnVsbCwgNCl9PC9jb2RlPjwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPntfdChcIkxldmVsXCIpfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPntfdChcIlNldHRhYmxlIGF0IGdsb2JhbFwiKX08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD57X3QoXCJTZXR0YWJsZSBhdCByb29tXCIpfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7TEVWRUxfT1JERVIubWFwKGx2bCA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17bHZsfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPjxjb2RlPntsdmx9PC9jb2RlPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckNhbkVkaXRMZXZlbChudWxsLCBsdmwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJDYW5FZGl0TGV2ZWwocm9vbS5yb29tSWQsIGx2bCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9XCJ2YWxFeHBsXCIgbGFiZWw9e190KFwiVmFsdWVzIGF0IGV4cGxpY2l0IGxldmVsc1wiKX0gdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EZXZUb29sc190ZXh0YXJlYVwiIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiIHZhbHVlPXt0aGlzLnN0YXRlLmV4cGxpY2l0VmFsdWVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkV4cGxWYWx1ZXNFZGl0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9XCJ2YWxFeHBsXCIgbGFiZWw9e190KFwiVmFsdWVzIGF0IGV4cGxpY2l0IGxldmVscyBpbiB0aGlzIHJvb21cIil9IHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGV4dGFyZWFcIiBlbGVtZW50PVwidGV4dGFyZWFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIiB2YWx1ZT17dGhpcy5zdGF0ZS5leHBsaWNpdFJvb21WYWx1ZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRXhwbFJvb21WYWx1ZXNFZGl0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uU2F2ZUNsaWNrfT57X3QoXCJTYXZlIHNldHRpbmcgdmFsdWVzXCIpfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+e190KFwiQmFja1wiKX08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmlld1NldHRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudCBteF9EZXZUb29sc19TZXR0aW5nc0V4cGxvcmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDM+e190KFwiU2V0dGluZzpcIil9IDxjb2RlPnt0aGlzLnN0YXRlLnZpZXdTZXR0aW5nfTwvY29kZT48L2gzPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlNldHRpbmcgZGVmaW5pdGlvbjpcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHByZT48Y29kZT57SlNPTi5zdHJpbmdpZnkoU0VUVElOR1NbdGhpcy5zdGF0ZS52aWV3U2V0dGluZ10sIG51bGwsIDQpfTwvY29kZT48L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlZhbHVlOlwiKX0mbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT57dGhpcy5yZW5kZXJTZXR0aW5nVmFsdWUoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSh0aGlzLnN0YXRlLnZpZXdTZXR0aW5nKSl9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiVmFsdWUgaW4gdGhpcyByb29tOlwiKX0mbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT57dGhpcy5yZW5kZXJTZXR0aW5nVmFsdWUoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSh0aGlzLnN0YXRlLnZpZXdTZXR0aW5nLCByb29tLnJvb21JZCkpfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlZhbHVlcyBhdCBleHBsaWNpdCBsZXZlbHM6XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwcmU+PGNvZGU+e3RoaXMucmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzKHRoaXMuc3RhdGUudmlld1NldHRpbmcsIG51bGwpfTwvY29kZT48L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlZhbHVlcyBhdCBleHBsaWNpdCBsZXZlbHMgaW4gdGhpcyByb29tOlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cHJlPjxjb2RlPnt0aGlzLnJlbmRlckV4cGxpY2l0U2V0dGluZ1ZhbHVlcyh0aGlzLnN0YXRlLnZpZXdTZXR0aW5nLCByb29tLnJvb21JZCl9PC9jb2RlPjwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KGUpID0+IHRoaXMub25FZGl0Q2xpY2soZSwgdGhpcy5zdGF0ZS52aWV3U2V0dGluZyl9PntfdChcIkVkaXQgVmFsdWVzXCIpfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+e190KFwiQmFja1wiKX08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jb25zdCBFbnRyaWVzID0gW1xuICAgIFNlbmRDdXN0b21FdmVudCxcbiAgICBSb29tU3RhdGVFeHBsb3JlcixcbiAgICBTZW5kQWNjb3VudERhdGEsXG4gICAgQWNjb3VudERhdGFFeHBsb3JlcixcbiAgICBTZXJ2ZXJzSW5Sb29tTGlzdCxcbiAgICBWZXJpZmljYXRpb25FeHBsb3JlcixcbiAgICBXaWRnZXRFeHBsb3JlcixcbiAgICBTZXR0aW5nc0V4cGxvcmVyLFxuXTtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5EZXZ0b29sc0RpYWxvZ1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGV2dG9vbHNEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICByb29tSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQmFjayA9IHRoaXMub25CYWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25DYW5jZWwgPSB0aGlzLm9uQ2FuY2VsLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG1vZGU6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgX3NldE1vZGUobW9kZSkge1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vZGUgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25CYWNrKCkge1xuICAgICAgICBpZiAodGhpcy5wcmV2TW9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vZGU6IHRoaXMucHJldk1vZGUgfSk7XG4gICAgICAgICAgICB0aGlzLnByZXZNb2RlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb2RlOiBudWxsIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25DYW5jZWwoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgYm9keTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tb2RlKSB7XG4gICAgICAgICAgICBib2R5ID0gPE1hdHJpeENsaWVudENvbnRleHQuQ29uc3VtZXI+XG4gICAgICAgICAgICAgICAgeyhjbGkpID0+IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9sZWZ0XCI+eyB0aGlzLnN0YXRlLm1vZGUuZ2V0TGFiZWwoKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfbGFiZWxfcmlnaHRcIj5Sb29tIElEOiB7IHRoaXMucHJvcHMucm9vbUlkIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9ib3R0b21cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8dGhpcy5zdGF0ZS5tb2RlIG9uQmFjaz17dGhpcy5vbkJhY2t9IHJvb209e2NsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKX0gLz5cbiAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50Pn1cbiAgICAgICAgICAgIDwvTWF0cml4Q2xpZW50Q29udGV4dC5Db25zdW1lcj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gXCJteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b25cIjtcbiAgICAgICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9sZWZ0XCI+eyBfdCgnVG9vbGJveCcpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9yaWdodFwiPlJvb20gSUQ6IHsgdGhpcy5wcm9wcy5yb29tSWQgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2xhYmVsX2JvdHRvbVwiIC8+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBFbnRyaWVzLm1hcCgoRW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IEVudHJ5LmdldExhYmVsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb25DbGljayA9IHRoaXMuX3NldE1vZGUoRW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtsYWJlbH0gb25DbGljaz17b25DbGlja30+eyBsYWJlbCB9PC9idXR0b24+O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkNhbmNlbH0+eyBfdCgnQ2FuY2VsJykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9RdWVzdGlvbkRpYWxvZ1wiIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH0gdGl0bGU9e190KCdEZXZlbG9wZXIgVG9vbHMnKX0+XG4gICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=