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

var sdk = _interopRequireWildcard(require("../../../index"));

var _SyntaxHighlight = _interopRequireDefault(require("../elements/SyntaxHighlight"));

var _languageHandler = require("../../../languageHandler");

var _matrixJsSdk = require("matrix-js-sdk");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _VerificationRequest = require("matrix-js-sdk/src/crypto/verification/request/VerificationRequest");

var _WidgetStore = _interopRequireDefault(require("../../../stores/WidgetStore"));

var _AsyncStore = require("../../../stores/AsyncStore");

/*
Copyright 2017 Michael Telatynski <7t3chguy@gmail.com>

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
    }, (0, _languageHandler._t)('Send')), !this.state.message && !this.props.forceStateEvent && /*#__PURE__*/_react.default.createElement("div", {
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

(0, _defineProperty2.default)(SendCustomEvent, "propTypes", {
  onBack: _propTypes.default.func.isRequired,
  room: _propTypes.default.instanceOf(_matrixJsSdk.Room).isRequired,
  forceStateEvent: _propTypes.default.bool,
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
  room: _propTypes.default.instanceOf(_matrixJsSdk.Room).isRequired,
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
  room: _propTypes.default.instanceOf(_matrixJsSdk.Room).isRequired
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
  room: _propTypes.default.instanceOf(_matrixJsSdk.Room).isRequired
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
  room: _propTypes.default.instanceOf(_matrixJsSdk.Room).isRequired
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

const Entries = [SendCustomEvent, RoomStateExplorer, SendAccountData, AccountDataExplorer, ServersInRoomList, VerificationExplorer, WidgetExplorer];

class DevtoolsDialog extends _react.default.PureComponent {
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

}

exports.default = DevtoolsDialog;
(0, _defineProperty2.default)(DevtoolsDialog, "propTypes", {
  roomId: _propTypes.default.string.isRequired,
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRGV2dG9vbHNEaWFsb2cuanMiXSwibmFtZXMiOlsiR2VuZXJpY0VkaXRvciIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJfb25DaGFuZ2UiLCJiaW5kIiwib25CYWNrIiwic3RhdGUiLCJtZXNzYWdlIiwic2V0U3RhdGUiLCJlIiwidGFyZ2V0IiwiaWQiLCJ0eXBlIiwiY2hlY2tlZCIsInZhbHVlIiwiX2J1dHRvbnMiLCJfc2VuZCIsInRleHRJbnB1dCIsImxhYmVsIiwiU2VuZEN1c3RvbUV2ZW50IiwiZ2V0TGFiZWwiLCJldmVudFR5cGUiLCJzdGF0ZUtleSIsImV2Q29udGVudCIsIk9iamVjdCIsImFzc2lnbiIsImlucHV0cyIsImlzU3RhdGVFdmVudCIsIkJvb2xlYW4iLCJmb3JjZVN0YXRlRXZlbnQiLCJzZW5kIiwiY29udGVudCIsImNsaSIsImNvbnRleHQiLCJzZW5kU3RhdGVFdmVudCIsInJvb20iLCJyb29tSWQiLCJzZW5kRXZlbnQiLCJKU09OIiwicGFyc2UiLCJ0b1N0cmluZyIsInJlbmRlciIsImZsb2F0IiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJpbnN0YW5jZU9mIiwiUm9vbSIsImJvb2wiLCJvYmplY3QiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiU2VuZEFjY291bnREYXRhIiwiaXNSb29tQWNjb3VudERhdGEiLCJzZXRSb29tQWNjb3VudERhdGEiLCJzZXRBY2NvdW50RGF0YSIsImZvcmNlTW9kZSIsIklOSVRJQUxfTE9BRF9USUxFUyIsIkxPQURfVElMRVNfU1RFUF9TSVpFIiwiRmlsdGVyZWRMaXN0IiwiZmlsdGVyQ2hpbGRyZW4iLCJjaGlsZHJlbiIsInF1ZXJ5IiwibGNRdWVyeSIsInRvTG93ZXJDYXNlIiwiZmlsdGVyIiwiY2hpbGQiLCJrZXkiLCJpbmNsdWRlcyIsInRydW5jYXRlQXQiLCJvdmVyZmxvd0NvdW50IiwidG90YWxDb3VudCIsInNob3dBbGwiLCJjb3VudCIsImV2Iiwib25DaGFuZ2UiLCJzdGFydCIsImVuZCIsImZpbHRlcmVkQ2hpbGRyZW4iLCJzbGljZSIsImxlbmd0aCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwiVHJ1bmNhdGVkTGlzdCIsInNkayIsImdldENvbXBvbmVudCIsIm9uUXVlcnkiLCJnZXRDaGlsZHJlbiIsImdldENoaWxkQ291bnQiLCJjcmVhdGVPdmVyZmxvd0VsZW1lbnQiLCJhbnkiLCJzdHJpbmciLCJSb29tU3RhdGVFeHBsb3JlciIsInJvb21TdGF0ZUV2ZW50cyIsImN1cnJlbnRTdGF0ZSIsImV2ZW50cyIsImVkaXRFdiIsIm9uUXVlcnlFdmVudFR5cGUiLCJvblF1ZXJ5U3RhdGVLZXkiLCJldmVudCIsImVkaXRpbmciLCJxdWVyeUV2ZW50VHlwZSIsInF1ZXJ5U3RhdGVLZXkiLCJicm93c2VFdmVudFR5cGUiLCJvblZpZXdTb3VyY2VDbGljayIsImZpbHRlckV2ZW50VHlwZSIsImZpbHRlclN0YXRlS2V5IiwiZ2V0VHlwZSIsInN0cmluZ2lmeSIsImdldENvbnRlbnQiLCJnZXRTdGF0ZUtleSIsImxpc3QiLCJjbGFzc2VzIiwiQXJyYXkiLCJmcm9tIiwiZW50cmllcyIsIm1hcCIsImFsbFN0YXRlS2V5cyIsIm9uQ2xpY2tGbiIsInNpemUiLCJoYXMiLCJnZXQiLCJzdGF0ZUdyb3VwIiwiQWNjb3VudERhdGFFeHBsb3JlciIsImdldERhdGEiLCJhY2NvdW50RGF0YSIsInN0b3JlIiwicm93cyIsImRhdGEiLCJrZXlzIiwiZm9yRWFjaCIsImV2VHlwZSIsInB1c2giLCJTZXJ2ZXJzSW5Sb29tTGlzdCIsInNlcnZlcnMiLCJTZXQiLCJnZXRTdGF0ZUV2ZW50cyIsImFkZCIsImdldFNlbmRlciIsInNwbGl0IiwicyIsIlBIQVNFX01BUCIsIlBIQVNFX1VOU0VOVCIsIlBIQVNFX1JFUVVFU1RFRCIsIlBIQVNFX1JFQURZIiwiUEhBU0VfRE9ORSIsIlBIQVNFX1NUQVJURUQiLCJQSEFTRV9DQU5DRUxMRUQiLCJWZXJpZmljYXRpb25SZXF1ZXN0IiwidHhuSWQiLCJyZXF1ZXN0IiwidXBkYXRlU3RhdGUiLCJ0aW1lb3V0Iiwic2V0UmVxdWVzdFRpbWVvdXQiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJwaGFzZSIsIk1hdGgiLCJmbG9vciIsIm1ldGhvZHMiLCJqb2luIiwicmVxdWVzdGluZ1VzZXJJZCIsIm9ic2VydmVPbmx5IiwiVmVyaWZpY2F0aW9uRXhwbG9yZXIiLCJDb21wb25lbnQiLCJmb3JjZVVwZGF0ZSIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJvbk5ld1JlcXVlc3QiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsImluUm9vbUNoYW5uZWwiLCJfY3J5cHRvIiwiX2luUm9vbVZlcmlmaWNhdGlvblJlcXVlc3RzIiwiaW5Sb29tUmVxdWVzdHMiLCJfcmVxdWVzdHNCeVJvb21JZCIsIk1hcCIsInJldmVyc2UiLCJXaWRnZXRFeHBsb3JlciIsIndpZGdldCIsImVkaXRXaWRnZXQiLCJ3aWRnZXRzIiwiV2lkZ2V0U3RvcmUiLCJpbnN0YW5jZSIsImdldEFwcHMiLCJVUERBVEVfRVZFTlQiLCJvbldpZGdldFN0b3JlVXBkYXRlIiwiYWxsU3RhdGUiLCJ2YWx1ZXMiLCJyZWR1Y2UiLCJwIiwiYyIsInN0YXRlRXYiLCJmaW5kIiwiZ2V0SWQiLCJldmVudElkIiwib25RdWVyeUNoYW5nZSIsInciLCJ1cmwiLCJvbkVkaXRXaWRnZXQiLCJFbnRyaWVzIiwiRGV2dG9vbHNEaWFsb2ciLCJvbkNhbmNlbCIsIm1vZGUiLCJfdW5tb3VudGVkIiwiX3NldE1vZGUiLCJwcmV2TW9kZSIsIm9uRmluaXNoZWQiLCJib2R5IiwiZ2V0Um9vbSIsIkVudHJ5Iiwib25DbGljayIsIkJhc2VEaWFsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBUUE7O0FBQ0E7O0FBbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXVCQSxNQUFNQSxhQUFOLFNBQTRCQyxlQUFNQyxhQUFsQyxDQUFnRDtBQUM1QztBQUVBQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFDQSxTQUFLQyxTQUFMLEdBQWlCLEtBQUtBLFNBQUwsQ0FBZUMsSUFBZixDQUFvQixJQUFwQixDQUFqQjtBQUNBLFNBQUtDLE1BQUwsR0FBYyxLQUFLQSxNQUFMLENBQVlELElBQVosQ0FBaUIsSUFBakIsQ0FBZDtBQUNIOztBQUVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJLEtBQUtDLEtBQUwsQ0FBV0MsT0FBZixFQUF3QjtBQUNwQixXQUFLQyxRQUFMLENBQWM7QUFBRUQsUUFBQUEsT0FBTyxFQUFFO0FBQVgsT0FBZDtBQUNILEtBRkQsTUFFTztBQUNILFdBQUtMLEtBQUwsQ0FBV0csTUFBWDtBQUNIO0FBQ0o7O0FBRURGLEVBQUFBLFNBQVMsQ0FBQ00sQ0FBRCxFQUFJO0FBQ1QsU0FBS0QsUUFBTCxDQUFjO0FBQUMsT0FBQ0MsQ0FBQyxDQUFDQyxNQUFGLENBQVNDLEVBQVYsR0FBZUYsQ0FBQyxDQUFDQyxNQUFGLENBQVNFLElBQVQsS0FBa0IsVUFBbEIsR0FBK0JILENBQUMsQ0FBQ0MsTUFBRixDQUFTRyxPQUF4QyxHQUFrREosQ0FBQyxDQUFDQyxNQUFGLENBQVNJO0FBQTNFLEtBQWQ7QUFDSDs7QUFFREMsRUFBQUEsUUFBUSxHQUFHO0FBQ1Asd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNIO0FBQVEsTUFBQSxPQUFPLEVBQUUsS0FBS1Y7QUFBdEIsT0FBZ0MseUJBQUcsTUFBSCxDQUFoQyxDQURHLEVBRUQsQ0FBQyxLQUFLQyxLQUFMLENBQVdDLE9BQVosaUJBQXVCO0FBQVEsTUFBQSxPQUFPLEVBQUUsS0FBS1M7QUFBdEIsT0FBK0IseUJBQUcsTUFBSCxDQUEvQixDQUZ0QixDQUFQO0FBSUg7O0FBRURDLEVBQUFBLFNBQVMsQ0FBQ04sRUFBRCxFQUFLTyxLQUFMLEVBQVk7QUFDakIsd0JBQU8sNkJBQUMsY0FBRDtBQUFPLE1BQUEsRUFBRSxFQUFFUCxFQUFYO0FBQWUsTUFBQSxLQUFLLEVBQUVPLEtBQXRCO0FBQTZCLE1BQUEsSUFBSSxFQUFDLElBQWxDO0FBQXVDLE1BQUEsU0FBUyxFQUFFLElBQWxEO0FBQXdELE1BQUEsSUFBSSxFQUFDLE1BQTdEO0FBQW9FLE1BQUEsWUFBWSxFQUFDLElBQWpGO0FBQ08sTUFBQSxLQUFLLEVBQUUsS0FBS1osS0FBTCxDQUFXSyxFQUFYLENBRGQ7QUFDOEIsTUFBQSxRQUFRLEVBQUUsS0FBS1I7QUFEN0MsTUFBUDtBQUVIOztBQS9CMkM7O0FBa0NoRCxNQUFNZ0IsZUFBTixTQUE4QnJCLGFBQTlCLENBQTRDO0FBQ3hDLFNBQU9zQixRQUFQLEdBQWtCO0FBQUUsV0FBTyx5QkFBRyxtQkFBSCxDQUFQO0FBQWlDOztBQVdyRG5CLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUNBLFNBQUtjLEtBQUwsR0FBYSxLQUFLQSxLQUFMLENBQVdaLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBYjtBQUVBLFVBQU07QUFBQ2lCLE1BQUFBLFNBQUQ7QUFBWUMsTUFBQUEsUUFBWjtBQUFzQkMsTUFBQUE7QUFBdEIsUUFBbUNDLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQ25ESixNQUFBQSxTQUFTLEVBQUUsRUFEd0M7QUFFbkRDLE1BQUFBLFFBQVEsRUFBRSxFQUZ5QztBQUduREMsTUFBQUEsU0FBUyxFQUFFO0FBSHdDLEtBQWQsRUFJdEMsS0FBS3JCLEtBQUwsQ0FBV3dCLE1BSjJCLENBQXpDO0FBTUEsU0FBS3BCLEtBQUwsR0FBYTtBQUNUcUIsTUFBQUEsWUFBWSxFQUFFQyxPQUFPLENBQUMsS0FBSzFCLEtBQUwsQ0FBVzJCLGVBQVosQ0FEWjtBQUdUUixNQUFBQSxTQUhTO0FBSVRDLE1BQUFBLFFBSlM7QUFLVEMsTUFBQUE7QUFMUyxLQUFiO0FBT0g7O0FBRURPLEVBQUFBLElBQUksQ0FBQ0MsT0FBRCxFQUFVO0FBQ1YsVUFBTUMsR0FBRyxHQUFHLEtBQUtDLE9BQWpCOztBQUNBLFFBQUksS0FBSzNCLEtBQUwsQ0FBV3FCLFlBQWYsRUFBNkI7QUFDekIsYUFBT0ssR0FBRyxDQUFDRSxjQUFKLENBQW1CLEtBQUtoQyxLQUFMLENBQVdpQyxJQUFYLENBQWdCQyxNQUFuQyxFQUEyQyxLQUFLOUIsS0FBTCxDQUFXZSxTQUF0RCxFQUFpRVUsT0FBakUsRUFBMEUsS0FBS3pCLEtBQUwsQ0FBV2dCLFFBQXJGLENBQVA7QUFDSCxLQUZELE1BRU87QUFDSCxhQUFPVSxHQUFHLENBQUNLLFNBQUosQ0FBYyxLQUFLbkMsS0FBTCxDQUFXaUMsSUFBWCxDQUFnQkMsTUFBOUIsRUFBc0MsS0FBSzlCLEtBQUwsQ0FBV2UsU0FBakQsRUFBNERVLE9BQTVELENBQVA7QUFDSDtBQUNKOztBQUVELFFBQU1mLEtBQU4sR0FBYztBQUNWLFFBQUksS0FBS1YsS0FBTCxDQUFXZSxTQUFYLEtBQXlCLEVBQTdCLEVBQWlDO0FBQzdCLFdBQUtiLFFBQUwsQ0FBYztBQUFFRCxRQUFBQSxPQUFPLEVBQUUseUJBQUcsaUNBQUg7QUFBWCxPQUFkO0FBQ0E7QUFDSDs7QUFFRCxRQUFJQSxPQUFKOztBQUNBLFFBQUk7QUFDQSxZQUFNd0IsT0FBTyxHQUFHTyxJQUFJLENBQUNDLEtBQUwsQ0FBVyxLQUFLakMsS0FBTCxDQUFXaUIsU0FBdEIsQ0FBaEI7QUFDQSxZQUFNLEtBQUtPLElBQUwsQ0FBVUMsT0FBVixDQUFOO0FBQ0F4QixNQUFBQSxPQUFPLEdBQUcseUJBQUcsYUFBSCxDQUFWO0FBQ0gsS0FKRCxDQUlFLE9BQU9FLENBQVAsRUFBVTtBQUNSRixNQUFBQSxPQUFPLEdBQUcseUJBQUcsOEJBQUgsSUFBcUMsSUFBckMsR0FBNENFLENBQUMsQ0FBQytCLFFBQUYsRUFBNUMsR0FBMkQsR0FBckU7QUFDSDs7QUFDRCxTQUFLaEMsUUFBTCxDQUFjO0FBQUVELE1BQUFBO0FBQUYsS0FBZDtBQUNIOztBQUVEa0MsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLbkMsS0FBTCxDQUFXQyxPQUFmLEVBQXdCO0FBQ3BCLDBCQUFPLHVEQUNIO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUNNLEtBQUtELEtBQUwsQ0FBV0MsT0FEakIsQ0FERyxFQUlELEtBQUtRLFFBQUwsRUFKQyxDQUFQO0FBTUg7O0FBRUQsd0JBQU8sdURBQ0g7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNNLEtBQUtFLFNBQUwsQ0FBZSxXQUFmLEVBQTRCLHlCQUFHLFlBQUgsQ0FBNUIsQ0FETixFQUVNLEtBQUtYLEtBQUwsQ0FBV3FCLFlBQVgsSUFBMkIsS0FBS1YsU0FBTCxDQUFlLFVBQWYsRUFBMkIseUJBQUcsV0FBSCxDQUEzQixDQUZqQyxDQURKLGVBTUksd0NBTkosZUFRSSw2QkFBQyxjQUFEO0FBQU8sTUFBQSxFQUFFLEVBQUMsV0FBVjtBQUFzQixNQUFBLEtBQUssRUFBRSx5QkFBRyxlQUFILENBQTdCO0FBQWtELE1BQUEsSUFBSSxFQUFDLE1BQXZEO0FBQThELE1BQUEsU0FBUyxFQUFDLHNCQUF4RTtBQUNPLE1BQUEsWUFBWSxFQUFDLEtBRHBCO0FBQzBCLE1BQUEsS0FBSyxFQUFFLEtBQUtYLEtBQUwsQ0FBV2lCLFNBRDVDO0FBQ3VELE1BQUEsUUFBUSxFQUFFLEtBQUtwQixTQUR0RTtBQUNpRixNQUFBLE9BQU8sRUFBQztBQUR6RixNQVJKLENBREcsZUFZSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLRTtBQUF0QixPQUFnQyx5QkFBRyxNQUFILENBQWhDLENBREosRUFFTSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0MsT0FBWixpQkFBdUI7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLUztBQUF0QixPQUErQix5QkFBRyxNQUFILENBQS9CLENBRjdCLEVBR00sQ0FBQyxLQUFLVixLQUFMLENBQVdDLE9BQVosSUFBdUIsQ0FBQyxLQUFLTCxLQUFMLENBQVcyQixlQUFuQyxpQkFBc0Q7QUFBSyxNQUFBLEtBQUssRUFBRTtBQUFDYSxRQUFBQSxLQUFLLEVBQUU7QUFBUjtBQUFaLG9CQUNwRDtBQUFPLE1BQUEsRUFBRSxFQUFDLGNBQVY7QUFBeUIsTUFBQSxTQUFTLEVBQUMsc0NBQW5DO0FBQTBFLE1BQUEsSUFBSSxFQUFDLFVBQS9FO0FBQTBGLE1BQUEsUUFBUSxFQUFFLEtBQUt2QyxTQUF6RztBQUFvSCxNQUFBLE9BQU8sRUFBRSxLQUFLRyxLQUFMLENBQVdxQjtBQUF4SSxNQURvRCxlQUVwRDtBQUFPLE1BQUEsU0FBUyxFQUFDLHFCQUFqQjtBQUF1QyxxQkFBWSxPQUFuRDtBQUEyRCxvQkFBVyxhQUF0RTtBQUFvRixNQUFBLE9BQU8sRUFBQztBQUE1RixNQUZvRCxDQUg1RCxDQVpHLENBQVA7QUFxQkg7O0FBeEZ1Qzs7OEJBQXRDUixlLGVBR2lCO0FBQ2ZkLEVBQUFBLE1BQU0sRUFBRXNDLG1CQUFVQyxJQUFWLENBQWVDLFVBRFI7QUFFZlYsRUFBQUEsSUFBSSxFQUFFUSxtQkFBVUcsVUFBVixDQUFxQkMsaUJBQXJCLEVBQTJCRixVQUZsQjtBQUdmaEIsRUFBQUEsZUFBZSxFQUFFYyxtQkFBVUssSUFIWjtBQUlmdEIsRUFBQUEsTUFBTSxFQUFFaUIsbUJBQVVNO0FBSkgsQzs4QkFIakI5QixlLGlCQVVtQitCLDRCOztBQWlGekIsTUFBTUMsZUFBTixTQUE4QnJELGFBQTlCLENBQTRDO0FBQ3hDLFNBQU9zQixRQUFQLEdBQWtCO0FBQUUsV0FBTyx5QkFBRyxtQkFBSCxDQUFQO0FBQWlDOztBQVdyRG5CLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUNBLFNBQUtjLEtBQUwsR0FBYSxLQUFLQSxLQUFMLENBQVdaLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBYjtBQUVBLFVBQU07QUFBQ2lCLE1BQUFBLFNBQUQ7QUFBWUUsTUFBQUE7QUFBWixRQUF5QkMsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFDekNKLE1BQUFBLFNBQVMsRUFBRSxFQUQ4QjtBQUV6Q0UsTUFBQUEsU0FBUyxFQUFFO0FBRjhCLEtBQWQsRUFHNUIsS0FBS3JCLEtBQUwsQ0FBV3dCLE1BSGlCLENBQS9CO0FBS0EsU0FBS3BCLEtBQUwsR0FBYTtBQUNUOEMsTUFBQUEsaUJBQWlCLEVBQUV4QixPQUFPLENBQUMsS0FBSzFCLEtBQUwsQ0FBV2tELGlCQUFaLENBRGpCO0FBR1QvQixNQUFBQSxTQUhTO0FBSVRFLE1BQUFBO0FBSlMsS0FBYjtBQU1IOztBQUVETyxFQUFBQSxJQUFJLENBQUNDLE9BQUQsRUFBVTtBQUNWLFVBQU1DLEdBQUcsR0FBRyxLQUFLQyxPQUFqQjs7QUFDQSxRQUFJLEtBQUszQixLQUFMLENBQVc4QyxpQkFBZixFQUFrQztBQUM5QixhQUFPcEIsR0FBRyxDQUFDcUIsa0JBQUosQ0FBdUIsS0FBS25ELEtBQUwsQ0FBV2lDLElBQVgsQ0FBZ0JDLE1BQXZDLEVBQStDLEtBQUs5QixLQUFMLENBQVdlLFNBQTFELEVBQXFFVSxPQUFyRSxDQUFQO0FBQ0g7O0FBQ0QsV0FBT0MsR0FBRyxDQUFDc0IsY0FBSixDQUFtQixLQUFLaEQsS0FBTCxDQUFXZSxTQUE5QixFQUF5Q1UsT0FBekMsQ0FBUDtBQUNIOztBQUVELFFBQU1mLEtBQU4sR0FBYztBQUNWLFFBQUksS0FBS1YsS0FBTCxDQUFXZSxTQUFYLEtBQXlCLEVBQTdCLEVBQWlDO0FBQzdCLFdBQUtiLFFBQUwsQ0FBYztBQUFFRCxRQUFBQSxPQUFPLEVBQUUseUJBQUcsaUNBQUg7QUFBWCxPQUFkO0FBQ0E7QUFDSDs7QUFFRCxRQUFJQSxPQUFKOztBQUNBLFFBQUk7QUFDQSxZQUFNd0IsT0FBTyxHQUFHTyxJQUFJLENBQUNDLEtBQUwsQ0FBVyxLQUFLakMsS0FBTCxDQUFXaUIsU0FBdEIsQ0FBaEI7QUFDQSxZQUFNLEtBQUtPLElBQUwsQ0FBVUMsT0FBVixDQUFOO0FBQ0F4QixNQUFBQSxPQUFPLEdBQUcseUJBQUcsYUFBSCxDQUFWO0FBQ0gsS0FKRCxDQUlFLE9BQU9FLENBQVAsRUFBVTtBQUNSRixNQUFBQSxPQUFPLEdBQUcseUJBQUcsOEJBQUgsSUFBcUMsSUFBckMsR0FBNENFLENBQUMsQ0FBQytCLFFBQUYsRUFBNUMsR0FBMkQsR0FBckU7QUFDSDs7QUFDRCxTQUFLaEMsUUFBTCxDQUFjO0FBQUVELE1BQUFBO0FBQUYsS0FBZDtBQUNIOztBQUVEa0MsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLbkMsS0FBTCxDQUFXQyxPQUFmLEVBQXdCO0FBQ3BCLDBCQUFPLHVEQUNIO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUNNLEtBQUtELEtBQUwsQ0FBV0MsT0FEakIsQ0FERyxFQUlELEtBQUtRLFFBQUwsRUFKQyxDQUFQO0FBTUg7O0FBRUQsd0JBQU8sdURBQ0g7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ00sS0FBS0UsU0FBTCxDQUFlLFdBQWYsRUFBNEIseUJBQUcsWUFBSCxDQUE1QixDQUROLGVBRUksd0NBRkosZUFJSSw2QkFBQyxjQUFEO0FBQU8sTUFBQSxFQUFFLEVBQUMsV0FBVjtBQUFzQixNQUFBLEtBQUssRUFBRSx5QkFBRyxlQUFILENBQTdCO0FBQWtELE1BQUEsSUFBSSxFQUFDLE1BQXZEO0FBQThELE1BQUEsU0FBUyxFQUFDLHNCQUF4RTtBQUNPLE1BQUEsWUFBWSxFQUFDLEtBRHBCO0FBQzBCLE1BQUEsS0FBSyxFQUFFLEtBQUtYLEtBQUwsQ0FBV2lCLFNBRDVDO0FBQ3VELE1BQUEsUUFBUSxFQUFFLEtBQUtwQixTQUR0RTtBQUNpRixNQUFBLE9BQU8sRUFBQztBQUR6RixNQUpKLENBREcsZUFRSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLRTtBQUF0QixPQUFnQyx5QkFBRyxNQUFILENBQWhDLENBREosRUFFTSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0MsT0FBWixpQkFBdUI7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLUztBQUF0QixPQUErQix5QkFBRyxNQUFILENBQS9CLENBRjdCLEVBR00sQ0FBQyxLQUFLVixLQUFMLENBQVdDLE9BQVosaUJBQXVCO0FBQUssTUFBQSxLQUFLLEVBQUU7QUFBQ21DLFFBQUFBLEtBQUssRUFBRTtBQUFSO0FBQVosb0JBQ3JCO0FBQU8sTUFBQSxFQUFFLEVBQUMsbUJBQVY7QUFBOEIsTUFBQSxTQUFTLEVBQUMsc0NBQXhDO0FBQStFLE1BQUEsSUFBSSxFQUFDLFVBQXBGO0FBQStGLE1BQUEsUUFBUSxFQUFFLEtBQUt2QyxTQUE5RztBQUF5SCxNQUFBLE9BQU8sRUFBRSxLQUFLRyxLQUFMLENBQVc4QyxpQkFBN0k7QUFBZ0ssTUFBQSxRQUFRLEVBQUUsS0FBS2xELEtBQUwsQ0FBV3FEO0FBQXJMLE1BRHFCLGVBRXJCO0FBQU8sTUFBQSxTQUFTLEVBQUMscUJBQWpCO0FBQXVDLHFCQUFZLGNBQW5EO0FBQWtFLG9CQUFXLFdBQTdFO0FBQXlGLE1BQUEsT0FBTyxFQUFDO0FBQWpHLE1BRnFCLENBSDdCLENBUkcsQ0FBUDtBQWlCSDs7QUFqRnVDOzs4QkFBdENKLGUsZUFHaUI7QUFDZmhCLEVBQUFBLElBQUksRUFBRVEsbUJBQVVHLFVBQVYsQ0FBcUJDLGlCQUFyQixFQUEyQkYsVUFEbEI7QUFFZk8sRUFBQUEsaUJBQWlCLEVBQUVULG1CQUFVSyxJQUZkO0FBR2ZPLEVBQUFBLFNBQVMsRUFBRVosbUJBQVVLLElBSE47QUFJZnRCLEVBQUFBLE1BQU0sRUFBRWlCLG1CQUFVTTtBQUpILEM7OEJBSGpCRSxlLGlCQVVtQkQsNEI7QUEwRXpCLE1BQU1NLGtCQUFrQixHQUFHLEVBQTNCO0FBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsRUFBN0I7O0FBRUEsTUFBTUMsWUFBTixTQUEyQjNELGVBQU1DLGFBQWpDLENBQStDO0FBTzNDLFNBQU8yRCxjQUFQLENBQXNCQyxRQUF0QixFQUFnQ0MsS0FBaEMsRUFBdUM7QUFDbkMsUUFBSSxDQUFDQSxLQUFMLEVBQVksT0FBT0QsUUFBUDtBQUNaLFVBQU1FLE9BQU8sR0FBR0QsS0FBSyxDQUFDRSxXQUFOLEVBQWhCO0FBQ0EsV0FBT0gsUUFBUSxDQUFDSSxNQUFULENBQWlCQyxLQUFELElBQVdBLEtBQUssQ0FBQ0MsR0FBTixDQUFVSCxXQUFWLEdBQXdCSSxRQUF4QixDQUFpQ0wsT0FBakMsQ0FBM0IsQ0FBUDtBQUNIOztBQUVEN0QsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsbURBa0JULE1BQU07QUFDWixXQUFLTSxRQUFMLENBQWM7QUFDVjRELFFBQUFBLFVBQVUsRUFBRSxLQUFLOUQsS0FBTCxDQUFXOEQsVUFBWCxHQUF3Qlg7QUFEMUIsT0FBZDtBQUdILEtBdEJrQjtBQUFBLGlFQXdCSyxDQUFDWTtBQUFEO0FBQUEsTUFBd0JDO0FBQXhCO0FBQUEsU0FBK0M7QUFDbkUsMEJBQU87QUFBUSxRQUFBLFNBQVMsRUFBQyxzQ0FBbEI7QUFBeUQsUUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFBdkUsU0FDRCx5QkFBRyx5QkFBSCxFQUE4QjtBQUFFQyxRQUFBQSxLQUFLLEVBQUVIO0FBQVQsT0FBOUIsQ0FEQyxDQUFQO0FBR0gsS0E1QmtCO0FBQUEsbURBOEJSSSxFQUFELElBQVE7QUFDZCxVQUFJLEtBQUt2RSxLQUFMLENBQVd3RSxRQUFmLEVBQXlCLEtBQUt4RSxLQUFMLENBQVd3RSxRQUFYLENBQW9CRCxFQUFFLENBQUMvRCxNQUFILENBQVVJLEtBQTlCO0FBQzVCLEtBaENrQjtBQUFBLHVEQWtDTCxDQUFDNkQ7QUFBRDtBQUFBLE1BQWdCQztBQUFoQjtBQUFBLFNBQWdDO0FBQzFDLGFBQU8sS0FBS3RFLEtBQUwsQ0FBV3VFLGdCQUFYLENBQTRCQyxLQUE1QixDQUFrQ0gsS0FBbEMsRUFBeUNDLEdBQXpDLENBQVA7QUFDSCxLQXBDa0I7QUFBQSx5REFzQ0g7QUFBQTtBQUFjO0FBQzFCLGFBQU8sS0FBS3RFLEtBQUwsQ0FBV3VFLGdCQUFYLENBQTRCRSxNQUFuQztBQUNILEtBeENrQjtBQUdmLFNBQUt6RSxLQUFMLEdBQWE7QUFDVHVFLE1BQUFBLGdCQUFnQixFQUFFbkIsWUFBWSxDQUFDQyxjQUFiLENBQTRCLEtBQUt6RCxLQUFMLENBQVcwRCxRQUF2QyxFQUFpRCxLQUFLMUQsS0FBTCxDQUFXMkQsS0FBNUQsQ0FEVDtBQUVUTyxNQUFBQSxVQUFVLEVBQUVaO0FBRkgsS0FBYjtBQUlILEdBcEIwQyxDQXNCM0M7OztBQUNBd0IsRUFBQUEsZ0NBQWdDLENBQUNDLFNBQUQsRUFBWTtBQUFFO0FBQzFDLFFBQUksS0FBSy9FLEtBQUwsQ0FBVzBELFFBQVgsS0FBd0JxQixTQUFTLENBQUNyQixRQUFsQyxJQUE4QyxLQUFLMUQsS0FBTCxDQUFXMkQsS0FBWCxLQUFxQm9CLFNBQVMsQ0FBQ3BCLEtBQWpGLEVBQXdGO0FBQ3hGLFNBQUtyRCxRQUFMLENBQWM7QUFDVnFFLE1BQUFBLGdCQUFnQixFQUFFbkIsWUFBWSxDQUFDQyxjQUFiLENBQTRCc0IsU0FBUyxDQUFDckIsUUFBdEMsRUFBZ0RxQixTQUFTLENBQUNwQixLQUExRCxDQURSO0FBRVZPLE1BQUFBLFVBQVUsRUFBRVo7QUFGRixLQUFkO0FBSUg7O0FBMEJEZixFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNeUMsYUFBYSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsd0JBQWpCLENBQXRCO0FBQ0Esd0JBQU8sdURBQ0gsNkJBQUMsY0FBRDtBQUFPLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGdCQUFILENBQWQ7QUFBb0MsTUFBQSxTQUFTLEVBQUUsSUFBL0M7QUFBcUQsTUFBQSxJQUFJLEVBQUUsRUFBM0Q7QUFDTyxNQUFBLElBQUksRUFBQyxNQURaO0FBQ21CLE1BQUEsWUFBWSxFQUFDLEtBRGhDO0FBQ3NDLE1BQUEsS0FBSyxFQUFFLEtBQUtsRixLQUFMLENBQVcyRCxLQUR4RDtBQUMrRCxNQUFBLFFBQVEsRUFBRSxLQUFLd0IsT0FEOUU7QUFFTyxNQUFBLFNBQVMsRUFBQyw4REFGakIsQ0FHTztBQUhQO0FBSU8sTUFBQSxHQUFHLEVBQUUsS0FBS25GLEtBQUwsQ0FBVzBELFFBQVgsQ0FBb0IsQ0FBcEIsSUFBeUIsS0FBSzFELEtBQUwsQ0FBVzBELFFBQVgsQ0FBb0IsQ0FBcEIsRUFBdUJNLEdBQWhELEdBQXNEO0FBSmxFLE1BREcsZUFPSCw2QkFBQyxhQUFEO0FBQWUsTUFBQSxXQUFXLEVBQUUsS0FBS29CLFdBQWpDO0FBQ2UsTUFBQSxhQUFhLEVBQUUsS0FBS0MsYUFEbkM7QUFFZSxNQUFBLFVBQVUsRUFBRSxLQUFLakYsS0FBTCxDQUFXOEQsVUFGdEM7QUFHZSxNQUFBLHFCQUFxQixFQUFFLEtBQUtvQjtBQUgzQyxNQVBHLENBQVA7QUFZSDs7QUFyRTBDOzs4QkFBekM5QixZLGVBQ2lCO0FBQ2ZFLEVBQUFBLFFBQVEsRUFBRWpCLG1CQUFVOEMsR0FETDtBQUVmNUIsRUFBQUEsS0FBSyxFQUFFbEIsbUJBQVUrQyxNQUZGO0FBR2ZoQixFQUFBQSxRQUFRLEVBQUUvQixtQkFBVUM7QUFITCxDOztBQXVFdkIsTUFBTStDLGlCQUFOLFNBQWdDNUYsZUFBTUMsYUFBdEMsQ0FBb0Q7QUFDaEQsU0FBT29CLFFBQVAsR0FBa0I7QUFBRSxXQUFPLHlCQUFHLG9CQUFILENBQVA7QUFBa0M7O0FBV3REbkIsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGU7QUFHZixTQUFLMEYsZUFBTCxHQUF1QixLQUFLMUYsS0FBTCxDQUFXaUMsSUFBWCxDQUFnQjBELFlBQWhCLENBQTZCQyxNQUFwRDtBQUVBLFNBQUt6RixNQUFMLEdBQWMsS0FBS0EsTUFBTCxDQUFZRCxJQUFaLENBQWlCLElBQWpCLENBQWQ7QUFDQSxTQUFLMkYsTUFBTCxHQUFjLEtBQUtBLE1BQUwsQ0FBWTNGLElBQVosQ0FBaUIsSUFBakIsQ0FBZDtBQUNBLFNBQUs0RixnQkFBTCxHQUF3QixLQUFLQSxnQkFBTCxDQUFzQjVGLElBQXRCLENBQTJCLElBQTNCLENBQXhCO0FBQ0EsU0FBSzZGLGVBQUwsR0FBdUIsS0FBS0EsZUFBTCxDQUFxQjdGLElBQXJCLENBQTBCLElBQTFCLENBQXZCO0FBRUEsU0FBS0UsS0FBTCxHQUFhO0FBQ1RlLE1BQUFBLFNBQVMsRUFBRSxJQURGO0FBRVQ2RSxNQUFBQSxLQUFLLEVBQUUsSUFGRTtBQUdUQyxNQUFBQSxPQUFPLEVBQUUsS0FIQTtBQUtUQyxNQUFBQSxjQUFjLEVBQUUsRUFMUDtBQU1UQyxNQUFBQSxhQUFhLEVBQUU7QUFOTixLQUFiO0FBUUg7O0FBRURDLEVBQUFBLGVBQWUsQ0FBQ2pGLFNBQUQsRUFBWTtBQUN2QixXQUFPLE1BQU07QUFDVCxXQUFLYixRQUFMLENBQWM7QUFBRWEsUUFBQUE7QUFBRixPQUFkO0FBQ0gsS0FGRDtBQUdIOztBQUVEa0YsRUFBQUEsaUJBQWlCLENBQUNMLEtBQUQsRUFBUTtBQUNyQixXQUFPLE1BQU07QUFDVCxXQUFLMUYsUUFBTCxDQUFjO0FBQUUwRixRQUFBQTtBQUFGLE9BQWQ7QUFDSCxLQUZEO0FBR0g7O0FBRUQ3RixFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJLEtBQUtDLEtBQUwsQ0FBVzZGLE9BQWYsRUFBd0I7QUFDcEIsV0FBSzNGLFFBQUwsQ0FBYztBQUFFMkYsUUFBQUEsT0FBTyxFQUFFO0FBQVgsT0FBZDtBQUNILEtBRkQsTUFFTyxJQUFJLEtBQUs3RixLQUFMLENBQVc0RixLQUFmLEVBQXNCO0FBQ3pCLFdBQUsxRixRQUFMLENBQWM7QUFBRTBGLFFBQUFBLEtBQUssRUFBRTtBQUFULE9BQWQ7QUFDSCxLQUZNLE1BRUEsSUFBSSxLQUFLNUYsS0FBTCxDQUFXZSxTQUFmLEVBQTBCO0FBQzdCLFdBQUtiLFFBQUwsQ0FBYztBQUFFYSxRQUFBQSxTQUFTLEVBQUU7QUFBYixPQUFkO0FBQ0gsS0FGTSxNQUVBO0FBQ0gsV0FBS25CLEtBQUwsQ0FBV0csTUFBWDtBQUNIO0FBQ0o7O0FBRUQwRixFQUFBQSxNQUFNLEdBQUc7QUFDTCxTQUFLdkYsUUFBTCxDQUFjO0FBQUUyRixNQUFBQSxPQUFPLEVBQUU7QUFBWCxLQUFkO0FBQ0g7O0FBRURILEVBQUFBLGdCQUFnQixDQUFDUSxlQUFELEVBQWtCO0FBQzlCLFNBQUtoRyxRQUFMLENBQWM7QUFBRTRGLE1BQUFBLGNBQWMsRUFBRUk7QUFBbEIsS0FBZDtBQUNIOztBQUVEUCxFQUFBQSxlQUFlLENBQUNRLGNBQUQsRUFBaUI7QUFDNUIsU0FBS2pHLFFBQUwsQ0FBYztBQUFFNkYsTUFBQUEsYUFBYSxFQUFFSTtBQUFqQixLQUFkO0FBQ0g7O0FBRURoRSxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJLEtBQUtuQyxLQUFMLENBQVc0RixLQUFmLEVBQXNCO0FBQ2xCLFVBQUksS0FBSzVGLEtBQUwsQ0FBVzZGLE9BQWYsRUFBd0I7QUFDcEIsNEJBQU8sNkJBQUMsZUFBRDtBQUFpQixVQUFBLElBQUksRUFBRSxLQUFLakcsS0FBTCxDQUFXaUMsSUFBbEM7QUFBd0MsVUFBQSxlQUFlLEVBQUUsSUFBekQ7QUFBK0QsVUFBQSxNQUFNLEVBQUUsS0FBSzlCLE1BQTVFO0FBQW9GLFVBQUEsTUFBTSxFQUFFO0FBQy9GZ0IsWUFBQUEsU0FBUyxFQUFFLEtBQUtmLEtBQUwsQ0FBVzRGLEtBQVgsQ0FBaUJRLE9BQWpCLEVBRG9GO0FBRS9GbkYsWUFBQUEsU0FBUyxFQUFFZSxJQUFJLENBQUNxRSxTQUFMLENBQWUsS0FBS3JHLEtBQUwsQ0FBVzRGLEtBQVgsQ0FBaUJVLFVBQWpCLEVBQWYsRUFBOEMsSUFBOUMsRUFBb0QsSUFBcEQsQ0FGb0Y7QUFHL0Z0RixZQUFBQSxRQUFRLEVBQUUsS0FBS2hCLEtBQUwsQ0FBVzRGLEtBQVgsQ0FBaUJXLFdBQWpCO0FBSHFGO0FBQTVGLFVBQVA7QUFLSDs7QUFFRCwwQkFBTztBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0g7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLDZCQUFDLHdCQUFEO0FBQWlCLFFBQUEsU0FBUyxFQUFDO0FBQTNCLFNBQ012RSxJQUFJLENBQUNxRSxTQUFMLENBQWUsS0FBS3JHLEtBQUwsQ0FBVzRGLEtBQVgsQ0FBaUJBLEtBQWhDLEVBQXVDLElBQXZDLEVBQTZDLENBQTdDLENBRE4sQ0FESixDQURHLGVBTUg7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJO0FBQVEsUUFBQSxPQUFPLEVBQUUsS0FBSzdGO0FBQXRCLFNBQWdDLHlCQUFHLE1BQUgsQ0FBaEMsQ0FESixlQUVJO0FBQVEsUUFBQSxPQUFPLEVBQUUsS0FBSzBGO0FBQXRCLFNBQWdDLHlCQUFHLE1BQUgsQ0FBaEMsQ0FGSixDQU5HLENBQVA7QUFXSDs7QUFFRCxRQUFJZSxJQUFJLEdBQUcsSUFBWDtBQUVBLFVBQU1DLE9BQU8sR0FBRyxzQ0FBaEI7O0FBQ0EsUUFBSSxLQUFLekcsS0FBTCxDQUFXZSxTQUFYLEtBQXlCLElBQTdCLEVBQW1DO0FBQy9CeUYsTUFBQUEsSUFBSSxnQkFBRyw2QkFBQyxZQUFEO0FBQWMsUUFBQSxLQUFLLEVBQUUsS0FBS3hHLEtBQUwsQ0FBVzhGLGNBQWhDO0FBQWdELFFBQUEsUUFBUSxFQUFFLEtBQUtKO0FBQS9ELFNBRUNnQixLQUFLLENBQUNDLElBQU4sQ0FBVyxLQUFLckIsZUFBTCxDQUFxQnNCLE9BQXJCLEVBQVgsRUFBMkNDLEdBQTNDLENBQStDLENBQUMsQ0FBQzlGLFNBQUQsRUFBWStGLFlBQVosQ0FBRCxLQUErQjtBQUMxRSxZQUFJQyxTQUFKOztBQUNBLFlBQUlELFlBQVksQ0FBQ0UsSUFBYixLQUFzQixDQUF0QixJQUEyQkYsWUFBWSxDQUFDRyxHQUFiLENBQWlCLEVBQWpCLENBQS9CLEVBQXFEO0FBQ2pERixVQUFBQSxTQUFTLEdBQUcsS0FBS2QsaUJBQUwsQ0FBdUJhLFlBQVksQ0FBQ0ksR0FBYixDQUFpQixFQUFqQixDQUF2QixDQUFaO0FBQ0gsU0FGRCxNQUVPO0FBQ0hILFVBQUFBLFNBQVMsR0FBRyxLQUFLZixlQUFMLENBQXFCakYsU0FBckIsQ0FBWjtBQUNIOztBQUVELDRCQUFPO0FBQVEsVUFBQSxTQUFTLEVBQUUwRixPQUFuQjtBQUE0QixVQUFBLEdBQUcsRUFBRTFGLFNBQWpDO0FBQTRDLFVBQUEsT0FBTyxFQUFFZ0c7QUFBckQsV0FDRmhHLFNBREUsQ0FBUDtBQUdILE9BWEQsQ0FGRCxDQUFQO0FBZ0JILEtBakJELE1BaUJPO0FBQ0gsWUFBTW9HLFVBQVUsR0FBRyxLQUFLN0IsZUFBTCxDQUFxQjRCLEdBQXJCLENBQXlCLEtBQUtsSCxLQUFMLENBQVdlLFNBQXBDLENBQW5CO0FBRUF5RixNQUFBQSxJQUFJLGdCQUFHLDZCQUFDLFlBQUQ7QUFBYyxRQUFBLEtBQUssRUFBRSxLQUFLeEcsS0FBTCxDQUFXK0YsYUFBaEM7QUFBK0MsUUFBQSxRQUFRLEVBQUUsS0FBS0o7QUFBOUQsU0FFQ2UsS0FBSyxDQUFDQyxJQUFOLENBQVdRLFVBQVUsQ0FBQ1AsT0FBWCxFQUFYLEVBQWlDQyxHQUFqQyxDQUFxQyxDQUFDLENBQUM3RixRQUFELEVBQVdtRCxFQUFYLENBQUQsS0FBb0I7QUFDckQsNEJBQU87QUFBUSxVQUFBLFNBQVMsRUFBRXNDLE9BQW5CO0FBQTRCLFVBQUEsR0FBRyxFQUFFekYsUUFBakM7QUFBMkMsVUFBQSxPQUFPLEVBQUUsS0FBS2lGLGlCQUFMLENBQXVCOUIsRUFBdkI7QUFBcEQsV0FDRG5ELFFBREMsQ0FBUDtBQUdILE9BSkQsQ0FGRCxDQUFQO0FBU0g7O0FBRUQsd0JBQU8sdURBQ0g7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ013RixJQUROLENBREcsZUFJSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLekc7QUFBdEIsT0FBZ0MseUJBQUcsTUFBSCxDQUFoQyxDQURKLENBSkcsQ0FBUDtBQVFIOztBQXJJK0M7OzhCQUE5Q3NGLGlCLGVBR2lCO0FBQ2Z0RixFQUFBQSxNQUFNLEVBQUVzQyxtQkFBVUMsSUFBVixDQUFlQyxVQURSO0FBRWZWLEVBQUFBLElBQUksRUFBRVEsbUJBQVVHLFVBQVYsQ0FBcUJDLGlCQUFyQixFQUEyQkY7QUFGbEIsQzs4QkFIakI4QyxpQixpQkFRbUJ6Qyw0Qjs7QUFnSXpCLE1BQU13RSxtQkFBTixTQUFrQzNILGVBQU1DLGFBQXhDLENBQXNEO0FBQ2xELFNBQU9vQixRQUFQLEdBQWtCO0FBQUUsV0FBTyx5QkFBRyxzQkFBSCxDQUFQO0FBQW9DOztBQVN4RG5CLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUVBLFNBQUtHLE1BQUwsR0FBYyxLQUFLQSxNQUFMLENBQVlELElBQVosQ0FBaUIsSUFBakIsQ0FBZDtBQUNBLFNBQUsyRixNQUFMLEdBQWMsS0FBS0EsTUFBTCxDQUFZM0YsSUFBWixDQUFpQixJQUFqQixDQUFkO0FBQ0EsU0FBS0QsU0FBTCxHQUFpQixLQUFLQSxTQUFMLENBQWVDLElBQWYsQ0FBb0IsSUFBcEIsQ0FBakI7QUFDQSxTQUFLNEYsZ0JBQUwsR0FBd0IsS0FBS0EsZ0JBQUwsQ0FBc0I1RixJQUF0QixDQUEyQixJQUEzQixDQUF4QjtBQUVBLFNBQUtFLEtBQUwsR0FBYTtBQUNUOEMsTUFBQUEsaUJBQWlCLEVBQUUsS0FEVjtBQUVUOEMsTUFBQUEsS0FBSyxFQUFFLElBRkU7QUFHVEMsTUFBQUEsT0FBTyxFQUFFLEtBSEE7QUFLVEMsTUFBQUEsY0FBYyxFQUFFO0FBTFAsS0FBYjtBQU9IOztBQUVEdUIsRUFBQUEsT0FBTyxHQUFHO0FBQ04sUUFBSSxLQUFLckgsS0FBTCxDQUFXOEMsaUJBQWYsRUFBa0M7QUFDOUIsYUFBTyxLQUFLbEQsS0FBTCxDQUFXaUMsSUFBWCxDQUFnQnlGLFdBQXZCO0FBQ0g7O0FBQ0QsV0FBTyxLQUFLM0YsT0FBTCxDQUFhNEYsS0FBYixDQUFtQkQsV0FBMUI7QUFDSDs7QUFFRHJCLEVBQUFBLGlCQUFpQixDQUFDTCxLQUFELEVBQVE7QUFDckIsV0FBTyxNQUFNO0FBQ1QsV0FBSzFGLFFBQUwsQ0FBYztBQUFFMEYsUUFBQUE7QUFBRixPQUFkO0FBQ0gsS0FGRDtBQUdIOztBQUVEN0YsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLQyxLQUFMLENBQVc2RixPQUFmLEVBQXdCO0FBQ3BCLFdBQUszRixRQUFMLENBQWM7QUFBRTJGLFFBQUFBLE9BQU8sRUFBRTtBQUFYLE9BQWQ7QUFDSCxLQUZELE1BRU8sSUFBSSxLQUFLN0YsS0FBTCxDQUFXNEYsS0FBZixFQUFzQjtBQUN6QixXQUFLMUYsUUFBTCxDQUFjO0FBQUUwRixRQUFBQSxLQUFLLEVBQUU7QUFBVCxPQUFkO0FBQ0gsS0FGTSxNQUVBO0FBQ0gsV0FBS2hHLEtBQUwsQ0FBV0csTUFBWDtBQUNIO0FBQ0o7O0FBRURGLEVBQUFBLFNBQVMsQ0FBQ00sQ0FBRCxFQUFJO0FBQ1QsU0FBS0QsUUFBTCxDQUFjO0FBQUMsT0FBQ0MsQ0FBQyxDQUFDQyxNQUFGLENBQVNDLEVBQVYsR0FBZUYsQ0FBQyxDQUFDQyxNQUFGLENBQVNFLElBQVQsS0FBa0IsVUFBbEIsR0FBK0JILENBQUMsQ0FBQ0MsTUFBRixDQUFTRyxPQUF4QyxHQUFrREosQ0FBQyxDQUFDQyxNQUFGLENBQVNJO0FBQTNFLEtBQWQ7QUFDSDs7QUFFRGlGLEVBQUFBLE1BQU0sR0FBRztBQUNMLFNBQUt2RixRQUFMLENBQWM7QUFBRTJGLE1BQUFBLE9BQU8sRUFBRTtBQUFYLEtBQWQ7QUFDSDs7QUFFREgsRUFBQUEsZ0JBQWdCLENBQUNJLGNBQUQsRUFBaUI7QUFDN0IsU0FBSzVGLFFBQUwsQ0FBYztBQUFFNEYsTUFBQUE7QUFBRixLQUFkO0FBQ0g7O0FBRUQzRCxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJLEtBQUtuQyxLQUFMLENBQVc0RixLQUFmLEVBQXNCO0FBQ2xCLFVBQUksS0FBSzVGLEtBQUwsQ0FBVzZGLE9BQWYsRUFBd0I7QUFDcEIsNEJBQU8sNkJBQUMsZUFBRDtBQUNILFVBQUEsSUFBSSxFQUFFLEtBQUtqRyxLQUFMLENBQVdpQyxJQURkO0FBRUgsVUFBQSxpQkFBaUIsRUFBRSxLQUFLN0IsS0FBTCxDQUFXOEMsaUJBRjNCO0FBR0gsVUFBQSxNQUFNLEVBQUUsS0FBSy9DLE1BSFY7QUFJSCxVQUFBLE1BQU0sRUFBRTtBQUNKZ0IsWUFBQUEsU0FBUyxFQUFFLEtBQUtmLEtBQUwsQ0FBVzRGLEtBQVgsQ0FBaUJRLE9BQWpCLEVBRFA7QUFFSm5GLFlBQUFBLFNBQVMsRUFBRWUsSUFBSSxDQUFDcUUsU0FBTCxDQUFlLEtBQUtyRyxLQUFMLENBQVc0RixLQUFYLENBQWlCVSxVQUFqQixFQUFmLEVBQThDLElBQTlDLEVBQW9ELElBQXBEO0FBRlAsV0FKTDtBQU9BLFVBQUEsU0FBUyxFQUFFO0FBUFgsVUFBUDtBQVFIOztBQUVELDBCQUFPO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFDSDtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksNkJBQUMsd0JBQUQ7QUFBaUIsUUFBQSxTQUFTLEVBQUM7QUFBM0IsU0FDTXRFLElBQUksQ0FBQ3FFLFNBQUwsQ0FBZSxLQUFLckcsS0FBTCxDQUFXNEYsS0FBWCxDQUFpQkEsS0FBaEMsRUFBdUMsSUFBdkMsRUFBNkMsQ0FBN0MsQ0FETixDQURKLENBREcsZUFNSDtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0k7QUFBUSxRQUFBLE9BQU8sRUFBRSxLQUFLN0Y7QUFBdEIsU0FBZ0MseUJBQUcsTUFBSCxDQUFoQyxDQURKLGVBRUk7QUFBUSxRQUFBLE9BQU8sRUFBRSxLQUFLMEY7QUFBdEIsU0FBZ0MseUJBQUcsTUFBSCxDQUFoQyxDQUZKLENBTkcsQ0FBUDtBQVdIOztBQUVELFVBQU0rQixJQUFJLEdBQUcsRUFBYjtBQUVBLFVBQU1mLE9BQU8sR0FBRyxzQ0FBaEI7QUFFQSxVQUFNZ0IsSUFBSSxHQUFHLEtBQUtKLE9BQUwsRUFBYjtBQUNBbkcsSUFBQUEsTUFBTSxDQUFDd0csSUFBUCxDQUFZRCxJQUFaLEVBQWtCRSxPQUFsQixDQUEyQkMsTUFBRCxJQUFZO0FBQ2xDLFlBQU16RCxFQUFFLEdBQUdzRCxJQUFJLENBQUNHLE1BQUQsQ0FBZjtBQUNBSixNQUFBQSxJQUFJLENBQUNLLElBQUwsZUFBVTtBQUFRLFFBQUEsU0FBUyxFQUFFcEIsT0FBbkI7QUFBNEIsUUFBQSxHQUFHLEVBQUVtQixNQUFqQztBQUF5QyxRQUFBLE9BQU8sRUFBRSxLQUFLM0IsaUJBQUwsQ0FBdUI5QixFQUF2QjtBQUFsRCxTQUNKeUQsTUFESSxDQUFWO0FBR0gsS0FMRDtBQU9BLHdCQUFPLHVEQUNIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSw2QkFBQyxZQUFEO0FBQWMsTUFBQSxLQUFLLEVBQUUsS0FBSzVILEtBQUwsQ0FBVzhGLGNBQWhDO0FBQWdELE1BQUEsUUFBUSxFQUFFLEtBQUtKO0FBQS9ELE9BQ004QixJQUROLENBREosQ0FERyxlQU1IO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFRLE1BQUEsT0FBTyxFQUFFLEtBQUt6SDtBQUF0QixPQUFnQyx5QkFBRyxNQUFILENBQWhDLENBREosRUFFTSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0MsT0FBWixpQkFBdUI7QUFBSyxNQUFBLEtBQUssRUFBRTtBQUFDbUMsUUFBQUEsS0FBSyxFQUFFO0FBQVI7QUFBWixvQkFDckI7QUFBTyxNQUFBLEVBQUUsRUFBQyxtQkFBVjtBQUE4QixNQUFBLFNBQVMsRUFBQyxzQ0FBeEM7QUFBK0UsTUFBQSxJQUFJLEVBQUMsVUFBcEY7QUFBK0YsTUFBQSxRQUFRLEVBQUUsS0FBS3ZDLFNBQTlHO0FBQXlILE1BQUEsT0FBTyxFQUFFLEtBQUtHLEtBQUwsQ0FBVzhDO0FBQTdJLE1BRHFCLGVBRXJCO0FBQU8sTUFBQSxTQUFTLEVBQUMscUJBQWpCO0FBQXVDLHFCQUFZLGNBQW5EO0FBQWtFLG9CQUFXLFdBQTdFO0FBQXlGLE1BQUEsT0FBTyxFQUFDO0FBQWpHLE1BRnFCLENBRjdCLENBTkcsQ0FBUDtBQWNIOztBQWxIaUQ7OzhCQUFoRHNFLG1CLGVBR2lCO0FBQ2ZySCxFQUFBQSxNQUFNLEVBQUVzQyxtQkFBVUMsSUFBVixDQUFlQyxVQURSO0FBRWZWLEVBQUFBLElBQUksRUFBRVEsbUJBQVVHLFVBQVYsQ0FBcUJDLGlCQUFyQixFQUEyQkY7QUFGbEIsQzs4QkFIakI2RSxtQixpQkFRbUJ4RSw0Qjs7QUE2R3pCLE1BQU1rRixpQkFBTixTQUFnQ3JJLGVBQU1DLGFBQXRDLENBQW9EO0FBQ2hELFNBQU9vQixRQUFQLEdBQWtCO0FBQUUsV0FBTyx5QkFBRyxzQkFBSCxDQUFQO0FBQW9DOztBQVN4RG5CLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLG1EQWdCUjJELEtBQUQsSUFBVztBQUNqQixXQUFLckQsUUFBTCxDQUFjO0FBQUVxRCxRQUFBQTtBQUFGLE9BQWQ7QUFDSCxLQWxCa0I7QUFHZixVQUFNMUIsSUFBSSxHQUFHLEtBQUtqQyxLQUFMLENBQVdpQyxJQUF4QjtBQUNBLFVBQU1rRyxPQUFPLEdBQUcsSUFBSUMsR0FBSixFQUFoQjtBQUNBbkcsSUFBQUEsSUFBSSxDQUFDMEQsWUFBTCxDQUFrQjBDLGNBQWxCLENBQWlDLGVBQWpDLEVBQWtETixPQUFsRCxDQUEwRHhELEVBQUUsSUFBSTRELE9BQU8sQ0FBQ0csR0FBUixDQUFZL0QsRUFBRSxDQUFDZ0UsU0FBSCxHQUFlQyxLQUFmLENBQXFCLEdBQXJCLEVBQTBCLENBQTFCLENBQVosQ0FBaEU7QUFDQSxTQUFLTCxPQUFMLEdBQWVyQixLQUFLLENBQUNDLElBQU4sQ0FBV29CLE9BQVgsRUFBb0JsQixHQUFwQixDQUF3QndCLENBQUMsaUJBQ3BDO0FBQVEsTUFBQSxHQUFHLEVBQUVBLENBQWI7QUFBZ0IsTUFBQSxTQUFTLEVBQUM7QUFBMUIsT0FDTUEsQ0FETixDQURXLENBQWY7QUFLQSxTQUFLckksS0FBTCxHQUFhO0FBQ1R1RCxNQUFBQSxLQUFLLEVBQUU7QUFERSxLQUFiO0FBR0g7O0FBTURwQixFQUFBQSxNQUFNLEdBQUc7QUFDTCx3QkFBTyx1REFDSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMsWUFBRDtBQUFjLE1BQUEsS0FBSyxFQUFFLEtBQUtuQyxLQUFMLENBQVd1RCxLQUFoQztBQUF1QyxNQUFBLFFBQVEsRUFBRSxLQUFLd0I7QUFBdEQsT0FDTSxLQUFLZ0QsT0FEWCxDQURKLENBREcsZUFNSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLbkksS0FBTCxDQUFXRztBQUE1QixPQUFzQyx5QkFBRyxNQUFILENBQXRDLENBREosQ0FORyxDQUFQO0FBVUg7O0FBekMrQzs7OEJBQTlDK0gsaUIsZUFHaUI7QUFDZi9ILEVBQUFBLE1BQU0sRUFBRXNDLG1CQUFVQyxJQUFWLENBQWVDLFVBRFI7QUFFZlYsRUFBQUEsSUFBSSxFQUFFUSxtQkFBVUcsVUFBVixDQUFxQkMsaUJBQXJCLEVBQTJCRjtBQUZsQixDOzhCQUhqQnVGLGlCLGlCQVFtQmxGLDRCO0FBb0N6QixNQUFNMEYsU0FBUyxHQUFHO0FBQ2QsR0FBQ0MsaUNBQUQsR0FBZ0IsUUFERjtBQUVkLEdBQUNDLG9DQUFELEdBQW1CLFdBRkw7QUFHZCxHQUFDQyxnQ0FBRCxHQUFlLE9BSEQ7QUFJZCxHQUFDQywrQkFBRCxHQUFjLE1BSkE7QUFLZCxHQUFDQyxrQ0FBRCxHQUFpQixTQUxIO0FBTWQsR0FBQ0Msb0NBQUQsR0FBbUI7QUFOTCxDQUFsQjs7QUFTQSxTQUFTQyxtQkFBVCxDQUE2QjtBQUFDQyxFQUFBQSxLQUFEO0FBQVFDLEVBQUFBO0FBQVIsQ0FBN0IsRUFBK0M7QUFDM0MsUUFBTSxHQUFHQyxXQUFILElBQWtCLHNCQUF4QjtBQUNBLFFBQU0sQ0FBQ0MsT0FBRCxFQUFVQyxpQkFBVixJQUErQixxQkFBU0gsT0FBTyxDQUFDRSxPQUFqQixDQUFyQztBQUVBOztBQUNBLHdDQUFnQkYsT0FBaEIsRUFBeUIsUUFBekIsRUFBbUNDLFdBQW5DO0FBRUE7O0FBQ0Esd0JBQVUsTUFBTTtBQUNaLFFBQUlELE9BQU8sQ0FBQ0UsT0FBUixJQUFtQixDQUF2QixFQUEwQjtBQUUxQjs7QUFDQSxVQUFNNUksRUFBRSxHQUFHOEksV0FBVyxDQUFDLE1BQU07QUFDMUJELE1BQUFBLGlCQUFpQixDQUFDSCxPQUFPLENBQUNFLE9BQVQsQ0FBakI7QUFDRixLQUZxQixFQUVuQixHQUZtQixDQUF0QjtBQUlBLFdBQU8sTUFBTTtBQUFFRyxNQUFBQSxhQUFhLENBQUMvSSxFQUFELENBQWI7QUFBb0IsS0FBbkM7QUFDSCxHQVRELEVBU0csQ0FBQzBJLE9BQUQsQ0FUSDtBQVdBLHNCQUFRO0FBQUssSUFBQSxTQUFTLEVBQUM7QUFBZixrQkFDSixzREFDSSx1REFESixlQUVJLHlDQUFLRCxLQUFMLENBRkosZUFHSSxpREFISixlQUlJLHlDQUFLUixTQUFTLENBQUNTLE9BQU8sQ0FBQ00sS0FBVCxDQUFULElBQTRCTixPQUFPLENBQUNNLEtBQXpDLENBSkosZUFLSSxtREFMSixlQU1JLHlDQUFLQyxJQUFJLENBQUNDLEtBQUwsQ0FBV04sT0FBTyxHQUFHLElBQXJCLENBQUwsQ0FOSixlQU9JLG1EQVBKLGVBUUkseUNBQUtGLE9BQU8sQ0FBQ1MsT0FBUixJQUFtQlQsT0FBTyxDQUFDUyxPQUFSLENBQWdCQyxJQUFoQixDQUFxQixJQUFyQixDQUF4QixDQVJKLGVBU0ksNERBVEosZUFVSSx5Q0FBS1YsT0FBTyxDQUFDVyxnQkFBYixDQVZKLGVBV0ksdURBWEosZUFZSSx5Q0FBSzFILElBQUksQ0FBQ3FFLFNBQUwsQ0FBZTBDLE9BQU8sQ0FBQ1ksV0FBdkIsQ0FBTCxDQVpKLENBREksQ0FBUjtBQWdCSDs7QUFFRCxNQUFNQyxvQkFBTixTQUFtQ25LLGVBQU1vSyxTQUF6QyxDQUFtRDtBQUFBO0FBQUE7QUFBQSx3REFRaEMsTUFBTTtBQUNqQixXQUFLQyxXQUFMO0FBQ0gsS0FWOEM7QUFBQTs7QUFDL0MsU0FBT2hKLFFBQVAsR0FBa0I7QUFDZCxXQUFPLHlCQUFHLHVCQUFILENBQVA7QUFDSDtBQUVEOzs7QUFPQWlKLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCLFVBQU1ySSxHQUFHLEdBQUcsS0FBS0MsT0FBakI7QUFDQUQsSUFBQUEsR0FBRyxDQUFDc0ksRUFBSixDQUFPLDZCQUFQLEVBQXNDLEtBQUtDLFlBQTNDO0FBQ0g7O0FBRURDLEVBQUFBLG9CQUFvQixHQUFHO0FBQ25CLFVBQU14SSxHQUFHLEdBQUcsS0FBS0MsT0FBakI7QUFDQUQsSUFBQUEsR0FBRyxDQUFDeUksR0FBSixDQUFRLDZCQUFSLEVBQXVDLEtBQUtGLFlBQTVDO0FBQ0g7O0FBRUQ5SCxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNVCxHQUFHLEdBQUcsS0FBS0MsT0FBakI7QUFDQSxVQUFNRSxJQUFJLEdBQUcsS0FBS2pDLEtBQUwsQ0FBV2lDLElBQXhCO0FBQ0EsVUFBTXVJLGFBQWEsR0FBRzFJLEdBQUcsQ0FBQzJJLE9BQUosQ0FBWUMsMkJBQWxDO0FBQ0EsVUFBTUMsY0FBYyxHQUFHLENBQUNILGFBQWEsQ0FBQ0ksaUJBQWQsSUFBbUMsSUFBSUMsR0FBSixFQUFwQyxFQUErQ3ZELEdBQS9DLENBQW1EckYsSUFBSSxDQUFDQyxNQUF4RCxLQUFtRSxJQUFJMkksR0FBSixFQUExRjtBQUVBLHdCQUFRLHVEQUNKO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLL0QsS0FBSyxDQUFDQyxJQUFOLENBQVc0RCxjQUFjLENBQUMzRCxPQUFmLEVBQVgsRUFBcUM4RCxPQUFyQyxHQUErQzdELEdBQS9DLENBQW1ELENBQUMsQ0FBQ2lDLEtBQUQsRUFBUUMsT0FBUixDQUFELGtCQUNoRCw2QkFBQyxtQkFBRDtBQUFxQixNQUFBLEtBQUssRUFBRUQsS0FBNUI7QUFBbUMsTUFBQSxPQUFPLEVBQUVDLE9BQTVDO0FBQXFELE1BQUEsR0FBRyxFQUFFRDtBQUExRCxNQURILENBREwsQ0FESSxlQU1KO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFRLE1BQUEsT0FBTyxFQUFFLEtBQUtsSixLQUFMLENBQVdHO0FBQTVCLE9BQXFDLHlCQUFHLE1BQUgsQ0FBckMsQ0FESixDQU5JLENBQVI7QUFVSDs7QUF0QzhDOzs4QkFBN0M2SixvQixpQkFNbUJoSCw0Qjs7QUFtQ3pCLE1BQU0rSCxjQUFOLFNBQTZCbEwsZUFBTW9LLFNBQW5DLENBQTZDO0FBQ3pDLFNBQU8vSSxRQUFQLEdBQWtCO0FBQ2QsV0FBTyx5QkFBRyxnQkFBSCxDQUFQO0FBQ0g7O0FBRURuQixFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSwrREFTRyxNQUFNO0FBQ3hCLFdBQUtrSyxXQUFMO0FBQ0gsS0FYa0I7QUFBQSx5REFhRnZHLEtBQUQsSUFBVztBQUN2QixXQUFLckQsUUFBTCxDQUFjO0FBQUNxRCxRQUFBQTtBQUFELE9BQWQ7QUFDSCxLQWZrQjtBQUFBLHdEQWlCSHFILE1BQUQsSUFBWTtBQUN2QixXQUFLMUssUUFBTCxDQUFjO0FBQUMySyxRQUFBQSxVQUFVLEVBQUVEO0FBQWIsT0FBZDtBQUNILEtBbkJrQjtBQUFBLGtEQXFCVixNQUFNO0FBQ1gsWUFBTUUsT0FBTyxHQUFHQyxxQkFBWUMsUUFBWixDQUFxQkMsT0FBckIsQ0FBNkIsS0FBS3JMLEtBQUwsQ0FBV2lDLElBQVgsQ0FBZ0JDLE1BQTdDLENBQWhCOztBQUNBLFVBQUksS0FBSzlCLEtBQUwsQ0FBVzZLLFVBQVgsSUFBeUJDLE9BQU8sQ0FBQ2pILFFBQVIsQ0FBaUIsS0FBSzdELEtBQUwsQ0FBVzZLLFVBQTVCLENBQTdCLEVBQXNFO0FBQ2xFLGFBQUszSyxRQUFMLENBQWM7QUFBQzJLLFVBQUFBLFVBQVUsRUFBRTtBQUFiLFNBQWQ7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLakwsS0FBTCxDQUFXRyxNQUFYO0FBQ0g7QUFDSixLQTVCa0I7QUFHZixTQUFLQyxLQUFMLEdBQWE7QUFDVHVELE1BQUFBLEtBQUssRUFBRSxFQURFO0FBRVRzSCxNQUFBQSxVQUFVLEVBQUUsSUFGSCxDQUVTOztBQUZULEtBQWI7QUFJSDs7QUF1QkRkLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCZ0IseUJBQVlDLFFBQVosQ0FBcUJoQixFQUFyQixDQUF3QmtCLHdCQUF4QixFQUFzQyxLQUFLQyxtQkFBM0M7QUFDSDs7QUFFRGpCLEVBQUFBLG9CQUFvQixHQUFHO0FBQ25CYSx5QkFBWUMsUUFBWixDQUFxQmIsR0FBckIsQ0FBeUJlLHdCQUF6QixFQUF1QyxLQUFLQyxtQkFBNUM7QUFDSDs7QUFFRGhKLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1OLElBQUksR0FBRyxLQUFLakMsS0FBTCxDQUFXaUMsSUFBeEI7QUFFQSxVQUFNZ0osVUFBVSxHQUFHLEtBQUs3SyxLQUFMLENBQVc2SyxVQUE5Qjs7QUFDQSxVQUFNQyxPQUFPLEdBQUdDLHFCQUFZQyxRQUFaLENBQXFCQyxPQUFyQixDQUE2QnBKLElBQUksQ0FBQ0MsTUFBbEMsQ0FBaEI7O0FBQ0EsUUFBSStJLFVBQVUsSUFBSUMsT0FBTyxDQUFDakgsUUFBUixDQUFpQmdILFVBQWpCLENBQWxCLEVBQWdEO0FBQzVDLFlBQU1PLFFBQVEsR0FBRzFFLEtBQUssQ0FBQ0MsSUFBTixDQUFXRCxLQUFLLENBQUNDLElBQU4sQ0FBVzlFLElBQUksQ0FBQzBELFlBQUwsQ0FBa0JDLE1BQWxCLENBQXlCNkYsTUFBekIsRUFBWCxFQUE4Q3hFLEdBQTlDLENBQWtEMUcsQ0FBQyxJQUFJQSxDQUFDLENBQUNrTCxNQUFGLEVBQXZELENBQVgsRUFDWkMsTUFEWSxDQUNMLENBQUNDLENBQUQsRUFBSUMsQ0FBSixLQUFVO0FBQUNELFFBQUFBLENBQUMsQ0FBQzFELElBQUYsQ0FBTyxHQUFHMkQsQ0FBVjtBQUFjLGVBQU9ELENBQVA7QUFBVSxPQUQ5QixFQUNnQyxFQURoQyxDQUFqQjtBQUVBLFlBQU1FLE9BQU8sR0FBR0wsUUFBUSxDQUFDTSxJQUFULENBQWN2SCxFQUFFLElBQUlBLEVBQUUsQ0FBQ3dILEtBQUgsT0FBZWQsVUFBVSxDQUFDZSxPQUE5QyxDQUFoQjs7QUFDQSxVQUFJLENBQUNILE9BQUwsRUFBYztBQUFFO0FBQ1osNEJBQU8sMENBQ0YseUJBQUcseUNBQUgsQ0FERSxlQUVIO0FBQUssVUFBQSxTQUFTLEVBQUM7QUFBZix3QkFDSTtBQUFRLFVBQUEsT0FBTyxFQUFFLEtBQUsxTDtBQUF0QixXQUErQix5QkFBRyxNQUFILENBQS9CLENBREosQ0FGRyxDQUFQO0FBTUg7O0FBQ0QsMEJBQU8sNkJBQUMsZUFBRDtBQUNILFFBQUEsTUFBTSxFQUFFLEtBQUtBLE1BRFY7QUFFSCxRQUFBLElBQUksRUFBRThCLElBRkg7QUFHSCxRQUFBLGVBQWUsRUFBRSxJQUhkO0FBSUgsUUFBQSxNQUFNLEVBQUU7QUFDSmQsVUFBQUEsU0FBUyxFQUFFMEssT0FBTyxDQUFDckYsT0FBUixFQURQO0FBRUpuRixVQUFBQSxTQUFTLEVBQUVlLElBQUksQ0FBQ3FFLFNBQUwsQ0FBZW9GLE9BQU8sQ0FBQ25GLFVBQVIsRUFBZixFQUFxQyxJQUFyQyxFQUEyQyxJQUEzQyxDQUZQO0FBR0p0RixVQUFBQSxRQUFRLEVBQUV5SyxPQUFPLENBQUNsRixXQUFSO0FBSE47QUFKTCxRQUFQO0FBVUg7O0FBRUQsd0JBQVEsdURBQ0o7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLFlBQUQ7QUFBYyxNQUFBLEtBQUssRUFBRSxLQUFLdkcsS0FBTCxDQUFXdUQsS0FBaEM7QUFBdUMsTUFBQSxRQUFRLEVBQUUsS0FBS3NJO0FBQXRELE9BQ0tmLE9BQU8sQ0FBQ2pFLEdBQVIsQ0FBWWlGLENBQUMsSUFBSTtBQUNkLDBCQUFPO0FBQ0gsUUFBQSxTQUFTLEVBQUMsc0NBRFA7QUFFSCxRQUFBLEdBQUcsRUFBRUEsQ0FBQyxDQUFDQyxHQUFGLEdBQVFELENBQUMsQ0FBQ0YsT0FGWjtBQUdILFFBQUEsT0FBTyxFQUFFLE1BQU0sS0FBS0ksWUFBTCxDQUFrQkYsQ0FBbEI7QUFIWixTQUlMQSxDQUFDLENBQUNDLEdBSkcsQ0FBUDtBQUtILEtBTkEsQ0FETCxDQURKLENBREksZUFZSjtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLaE07QUFBdEIsT0FBK0IseUJBQUcsTUFBSCxDQUEvQixDQURKLENBWkksQ0FBUjtBQWdCSDs7QUF4RndDOztBQTJGN0MsTUFBTWtNLE9BQU8sR0FBRyxDQUNacEwsZUFEWSxFQUVad0UsaUJBRlksRUFHWnhDLGVBSFksRUFJWnVFLG1CQUpZLEVBS1pVLGlCQUxZLEVBTVo4QixvQkFOWSxFQU9aZSxjQVBZLENBQWhCOztBQVVlLE1BQU11QixjQUFOLFNBQTZCek0sZUFBTUMsYUFBbkMsQ0FBaUQ7QUFNNURDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUNBLFNBQUtHLE1BQUwsR0FBYyxLQUFLQSxNQUFMLENBQVlELElBQVosQ0FBaUIsSUFBakIsQ0FBZDtBQUNBLFNBQUtxTSxRQUFMLEdBQWdCLEtBQUtBLFFBQUwsQ0FBY3JNLElBQWQsQ0FBbUIsSUFBbkIsQ0FBaEI7QUFFQSxTQUFLRSxLQUFMLEdBQWE7QUFDVG9NLE1BQUFBLElBQUksRUFBRTtBQURHLEtBQWI7QUFHSDs7QUFFRGxDLEVBQUFBLG9CQUFvQixHQUFHO0FBQ25CLFNBQUttQyxVQUFMLEdBQWtCLElBQWxCO0FBQ0g7O0FBRURDLEVBQUFBLFFBQVEsQ0FBQ0YsSUFBRCxFQUFPO0FBQ1gsV0FBTyxNQUFNO0FBQ1QsV0FBS2xNLFFBQUwsQ0FBYztBQUFFa00sUUFBQUE7QUFBRixPQUFkO0FBQ0gsS0FGRDtBQUdIOztBQUVEck0sRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLd00sUUFBVCxFQUFtQjtBQUNmLFdBQUtyTSxRQUFMLENBQWM7QUFBRWtNLFFBQUFBLElBQUksRUFBRSxLQUFLRztBQUFiLE9BQWQ7QUFDQSxXQUFLQSxRQUFMLEdBQWdCLElBQWhCO0FBQ0gsS0FIRCxNQUdPO0FBQ0gsV0FBS3JNLFFBQUwsQ0FBYztBQUFFa00sUUFBQUEsSUFBSSxFQUFFO0FBQVIsT0FBZDtBQUNIO0FBQ0o7O0FBRURELEVBQUFBLFFBQVEsR0FBRztBQUNQLFNBQUt2TSxLQUFMLENBQVc0TSxVQUFYLENBQXNCLEtBQXRCO0FBQ0g7O0FBRURySyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJc0ssSUFBSjs7QUFFQSxRQUFJLEtBQUt6TSxLQUFMLENBQVdvTSxJQUFmLEVBQXFCO0FBQ2pCSyxNQUFBQSxJQUFJLGdCQUFHLDZCQUFDLDRCQUFELENBQXFCLFFBQXJCLFFBQ0QvSyxHQUFELGlCQUFTLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUNOO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUEwQyxLQUFLMUIsS0FBTCxDQUFXb00sSUFBWCxDQUFnQnRMLFFBQWhCLEVBQTFDLENBRE0sZUFFTjtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQW9ELEtBQUtsQixLQUFMLENBQVdrQyxNQUEvRCxDQUZNLGVBR047QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFFBSE0sZUFJTixrQ0FBTSxLQUFOLENBQVksSUFBWjtBQUFpQixRQUFBLE1BQU0sRUFBRSxLQUFLL0IsTUFBOUI7QUFBc0MsUUFBQSxJQUFJLEVBQUUyQixHQUFHLENBQUNnTCxPQUFKLENBQVksS0FBSzlNLEtBQUwsQ0FBV2tDLE1BQXZCO0FBQTVDLFFBSk0sQ0FEUCxDQUFQO0FBUUgsS0FURCxNQVNPO0FBQ0gsWUFBTTJFLE9BQU8sR0FBRyxzQ0FBaEI7QUFDQWdHLE1BQUFBLElBQUksZ0JBQUcsNkJBQUMsY0FBRCxDQUFPLFFBQVAscUJBQ0gsdURBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQTBDLHlCQUFHLFNBQUgsQ0FBMUMsQ0FESixlQUVJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFBb0QsS0FBSzdNLEtBQUwsQ0FBV2tDLE1BQS9ELENBRkosZUFHSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsUUFISixlQUtJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUNNbUssT0FBTyxDQUFDcEYsR0FBUixDQUFhOEYsS0FBRCxJQUFXO0FBQ3JCLGNBQU0vTCxLQUFLLEdBQUcrTCxLQUFLLENBQUM3TCxRQUFOLEVBQWQ7O0FBQ0EsY0FBTThMLE9BQU8sR0FBRyxLQUFLTixRQUFMLENBQWNLLEtBQWQsQ0FBaEI7O0FBQ0EsNEJBQU87QUFBUSxVQUFBLFNBQVMsRUFBRWxHLE9BQW5CO0FBQTRCLFVBQUEsR0FBRyxFQUFFN0YsS0FBakM7QUFBd0MsVUFBQSxPQUFPLEVBQUVnTTtBQUFqRCxXQUE0RGhNLEtBQTVELENBQVA7QUFDSCxPQUpDLENBRE4sQ0FMSixDQURHLGVBY0g7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJO0FBQVEsUUFBQSxPQUFPLEVBQUUsS0FBS3VMO0FBQXRCLFNBQWtDLHlCQUFHLFFBQUgsQ0FBbEMsQ0FESixDQWRHLENBQVA7QUFrQkg7O0FBRUQsVUFBTVUsVUFBVSxHQUFHaEksR0FBRyxDQUFDQyxZQUFKLENBQWlCLDBCQUFqQixDQUFuQjtBQUNBLHdCQUNJLDZCQUFDLFVBQUQ7QUFBWSxNQUFBLFNBQVMsRUFBQyxtQkFBdEI7QUFBMEMsTUFBQSxVQUFVLEVBQUUsS0FBS2xGLEtBQUwsQ0FBVzRNLFVBQWpFO0FBQTZFLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGlCQUFIO0FBQXBGLE9BQ01DLElBRE4sQ0FESjtBQUtIOztBQS9FMkQ7Ozs4QkFBM0NQLGMsZUFDRTtBQUNmcEssRUFBQUEsTUFBTSxFQUFFTyxtQkFBVStDLE1BQVYsQ0FBaUI3QyxVQURWO0FBRWZpSyxFQUFBQSxVQUFVLEVBQUVuSyxtQkFBVUMsSUFBVixDQUFlQztBQUZaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7dXNlU3RhdGUsIHVzZUVmZmVjdH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgU3ludGF4SGlnaGxpZ2h0IGZyb20gJy4uL2VsZW1lbnRzL1N5bnRheEhpZ2hsaWdodCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBSb29tLCBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHt1c2VFdmVudEVtaXR0ZXJ9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcblxuaW1wb3J0IHtcbiAgICBQSEFTRV9VTlNFTlQsXG4gICAgUEhBU0VfUkVRVUVTVEVELFxuICAgIFBIQVNFX1JFQURZLFxuICAgIFBIQVNFX0RPTkUsXG4gICAgUEhBU0VfU1RBUlRFRCxcbiAgICBQSEFTRV9DQU5DRUxMRUQsXG59IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL3JlcXVlc3QvVmVyaWZpY2F0aW9uUmVxdWVzdFwiO1xuaW1wb3J0IFdpZGdldFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCB7VVBEQVRFX0VWRU5UfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcblxuY2xhc3MgR2VuZXJpY0VkaXRvciBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIC8vIHN0YXRpYyBwcm9wVHlwZXMgPSB7b25CYWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2UgPSB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uQmFjayA9IHRoaXMub25CYWNrLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgb25CYWNrKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZTogbnVsbCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25CYWNrKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25DaGFuZ2UoZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtbZS50YXJnZXQuaWRdOiBlLnRhcmdldC50eXBlID09PSAnY2hlY2tib3gnID8gZS50YXJnZXQuY2hlY2tlZCA6IGUudGFyZ2V0LnZhbHVlfSk7XG4gICAgfVxuXG4gICAgX2J1dHRvbnMoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CYWNrfT57IF90KCdCYWNrJykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgeyAhdGhpcy5zdGF0ZS5tZXNzYWdlICYmIDxidXR0b24gb25DbGljaz17dGhpcy5fc2VuZH0+eyBfdCgnU2VuZCcpIH08L2J1dHRvbj4gfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgdGV4dElucHV0KGlkLCBsYWJlbCkge1xuICAgICAgICByZXR1cm4gPEZpZWxkIGlkPXtpZH0gbGFiZWw9e2xhYmVsfSBzaXplPVwiNDJcIiBhdXRvRm9jdXM9e3RydWV9IHR5cGU9XCJ0ZXh0XCIgYXV0b0NvbXBsZXRlPVwib25cIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlW2lkXX0gb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfSAvPjtcbiAgICB9XG59XG5cbmNsYXNzIFNlbmRDdXN0b21FdmVudCBleHRlbmRzIEdlbmVyaWNFZGl0b3Ige1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHsgcmV0dXJuIF90KCdTZW5kIEN1c3RvbSBFdmVudCcpOyB9XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkJhY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5pbnN0YW5jZU9mKFJvb20pLmlzUmVxdWlyZWQsXG4gICAgICAgIGZvcmNlU3RhdGVFdmVudDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGlucHV0czogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5fc2VuZCA9IHRoaXMuX3NlbmQuYmluZCh0aGlzKTtcblxuICAgICAgICBjb25zdCB7ZXZlbnRUeXBlLCBzdGF0ZUtleSwgZXZDb250ZW50fSA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgZXZlbnRUeXBlOiAnJyxcbiAgICAgICAgICAgIHN0YXRlS2V5OiAnJyxcbiAgICAgICAgICAgIGV2Q29udGVudDogJ3tcXG5cXG59JyxcbiAgICAgICAgfSwgdGhpcy5wcm9wcy5pbnB1dHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpc1N0YXRlRXZlbnQ6IEJvb2xlYW4odGhpcy5wcm9wcy5mb3JjZVN0YXRlRXZlbnQpLFxuXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBzdGF0ZUtleSxcbiAgICAgICAgICAgIGV2Q29udGVudCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzZW5kKGNvbnRlbnQpIHtcbiAgICAgICAgY29uc3QgY2xpID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc1N0YXRlRXZlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGkuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tLnJvb21JZCwgdGhpcy5zdGF0ZS5ldmVudFR5cGUsIGNvbnRlbnQsIHRoaXMuc3RhdGUuc3RhdGVLZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNsaS5zZW5kRXZlbnQodGhpcy5wcm9wcy5yb29tLnJvb21JZCwgdGhpcy5zdGF0ZS5ldmVudFR5cGUsIGNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX3NlbmQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmV2ZW50VHlwZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZXNzYWdlOiBfdCgnWW91IG11c3Qgc3BlY2lmeSBhbiBldmVudCB0eXBlIScpIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gSlNPTi5wYXJzZSh0aGlzLnN0YXRlLmV2Q29udGVudCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmQoY29udGVudCk7XG4gICAgICAgICAgICBtZXNzYWdlID0gX3QoJ0V2ZW50IHNlbnQhJyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdCgnRmFpbGVkIHRvIHNlbmQgY3VzdG9tIGV2ZW50LicpICsgJyAoJyArIGUudG9TdHJpbmcoKSArICcpJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZSB9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLm1lc3NhZ2UgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgdGhpcy5fYnV0dG9ucygpIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19ldmVudFR5cGVTdGF0ZUtleUdyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy50ZXh0SW5wdXQoJ2V2ZW50VHlwZScsIF90KCdFdmVudCBUeXBlJykpIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmlzU3RhdGVFdmVudCAmJiB0aGlzLnRleHRJbnB1dCgnc3RhdGVLZXknLCBfdCgnU3RhdGUgS2V5JykpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxiciAvPlxuXG4gICAgICAgICAgICAgICAgPEZpZWxkIGlkPVwiZXZDb250ZW50XCIgbGFiZWw9e190KFwiRXZlbnQgQ29udGVudFwiKX0gdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJteF9EZXZUb29sc190ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiIHZhbHVlPXt0aGlzLnN0YXRlLmV2Q29udGVudH0gb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfSBlbGVtZW50PVwidGV4dGFyZWFcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+eyBfdCgnQmFjaycpIH08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICB7ICF0aGlzLnN0YXRlLm1lc3NhZ2UgJiYgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9zZW5kfT57IF90KCdTZW5kJykgfTwvYnV0dG9uPiB9XG4gICAgICAgICAgICAgICAgeyAhdGhpcy5zdGF0ZS5tZXNzYWdlICYmICF0aGlzLnByb3BzLmZvcmNlU3RhdGVFdmVudCAmJiA8ZGl2IHN0eWxlPXt7ZmxvYXQ6IFwicmlnaHRcIn19PlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJpc1N0YXRlRXZlbnRcIiBjbGFzc05hbWU9XCJteF9EZXZUb29sc190Z2wgbXhfRGV2VG9vbHNfdGdsLWZsaXBcIiB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9IGNoZWNrZWQ9e3RoaXMuc3RhdGUuaXNTdGF0ZUV2ZW50fSAvPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGdsLWJ0blwiIGRhdGEtdGctb2ZmPVwiRXZlbnRcIiBkYXRhLXRnLW9uPVwiU3RhdGUgRXZlbnRcIiBodG1sRm9yPVwiaXNTdGF0ZUV2ZW50XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG5cbmNsYXNzIFNlbmRBY2NvdW50RGF0YSBleHRlbmRzIEdlbmVyaWNFZGl0b3Ige1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHsgcmV0dXJuIF90KCdTZW5kIEFjY291bnQgRGF0YScpOyB9XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICByb29tOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSb29tKS5pc1JlcXVpcmVkLFxuICAgICAgICBpc1Jvb21BY2NvdW50RGF0YTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGZvcmNlTW9kZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGlucHV0czogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5fc2VuZCA9IHRoaXMuX3NlbmQuYmluZCh0aGlzKTtcblxuICAgICAgICBjb25zdCB7ZXZlbnRUeXBlLCBldkNvbnRlbnR9ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBldmVudFR5cGU6ICcnLFxuICAgICAgICAgICAgZXZDb250ZW50OiAne1xcblxcbn0nLFxuICAgICAgICB9LCB0aGlzLnByb3BzLmlucHV0cyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGlzUm9vbUFjY291bnREYXRhOiBCb29sZWFuKHRoaXMucHJvcHMuaXNSb29tQWNjb3VudERhdGEpLFxuXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBldkNvbnRlbnQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2VuZChjb250ZW50KSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNSb29tQWNjb3VudERhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGkuc2V0Um9vbUFjY291bnREYXRhKHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRoaXMuc3RhdGUuZXZlbnRUeXBlLCBjb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2xpLnNldEFjY291bnREYXRhKHRoaXMuc3RhdGUuZXZlbnRUeXBlLCBjb250ZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBfc2VuZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXZlbnRUeXBlID09PSAnJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2U6IF90KCdZb3UgbXVzdCBzcGVjaWZ5IGFuIGV2ZW50IHR5cGUhJykgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBKU09OLnBhcnNlKHRoaXMuc3RhdGUuZXZDb250ZW50KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZChjb250ZW50KTtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdCgnRXZlbnQgc2VudCEnKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KCdGYWlsZWQgdG8gc2VuZCBjdXN0b20gZXZlbnQuJykgKyAnICgnICsgZS50b1N0cmluZygpICsgJyknO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZXNzYWdlIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVzc2FnZSkge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUubWVzc2FnZSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyB0aGlzLl9idXR0b25zKCkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7IHRoaXMudGV4dElucHV0KCdldmVudFR5cGUnLCBfdCgnRXZlbnQgVHlwZScpKSB9XG4gICAgICAgICAgICAgICAgPGJyIC8+XG5cbiAgICAgICAgICAgICAgICA8RmllbGQgaWQ9XCJldkNvbnRlbnRcIiBsYWJlbD17X3QoXCJFdmVudCBDb250ZW50XCIpfSB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX3RleHRhcmVhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCIgdmFsdWU9e3RoaXMuc3RhdGUuZXZDb250ZW50fSBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9IGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CYWNrfT57IF90KCdCYWNrJykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIHsgIXRoaXMuc3RhdGUubWVzc2FnZSAmJiA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX3NlbmR9PnsgX3QoJ1NlbmQnKSB9PC9idXR0b24+IH1cbiAgICAgICAgICAgICAgICB7ICF0aGlzLnN0YXRlLm1lc3NhZ2UgJiYgPGRpdiBzdHlsZT17e2Zsb2F0OiBcInJpZ2h0XCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiaXNSb29tQWNjb3VudERhdGFcIiBjbGFzc05hbWU9XCJteF9EZXZUb29sc190Z2wgbXhfRGV2VG9vbHNfdGdsLWZsaXBcIiB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9IGNoZWNrZWQ9e3RoaXMuc3RhdGUuaXNSb29tQWNjb3VudERhdGF9IGRpc2FibGVkPXt0aGlzLnByb3BzLmZvcmNlTW9kZX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX3RnbC1idG5cIiBkYXRhLXRnLW9mZj1cIkFjY291bnQgRGF0YVwiIGRhdGEtdGctb249XCJSb29tIERhdGFcIiBodG1sRm9yPVwiaXNSb29tQWNjb3VudERhdGFcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuY29uc3QgSU5JVElBTF9MT0FEX1RJTEVTID0gMjA7XG5jb25zdCBMT0FEX1RJTEVTX1NURVBfU0laRSA9IDUwO1xuXG5jbGFzcyBGaWx0ZXJlZExpc3QgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBjaGlsZHJlbjogUHJvcFR5cGVzLmFueSxcbiAgICAgICAgcXVlcnk6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9O1xuXG4gICAgc3RhdGljIGZpbHRlckNoaWxkcmVuKGNoaWxkcmVuLCBxdWVyeSkge1xuICAgICAgICBpZiAoIXF1ZXJ5KSByZXR1cm4gY2hpbGRyZW47XG4gICAgICAgIGNvbnN0IGxjUXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW4uZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQua2V5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobGNRdWVyeSkpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZmlsdGVyZWRDaGlsZHJlbjogRmlsdGVyZWRMaXN0LmZpbHRlckNoaWxkcmVuKHRoaXMucHJvcHMuY2hpbGRyZW4sIHRoaXMucHJvcHMucXVlcnkpLFxuICAgICAgICAgICAgdHJ1bmNhdGVBdDogSU5JVElBTF9MT0FEX1RJTEVTLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNoaWxkcmVuID09PSBuZXh0UHJvcHMuY2hpbGRyZW4gJiYgdGhpcy5wcm9wcy5xdWVyeSA9PT0gbmV4dFByb3BzLnF1ZXJ5KSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmlsdGVyZWRDaGlsZHJlbjogRmlsdGVyZWRMaXN0LmZpbHRlckNoaWxkcmVuKG5leHRQcm9wcy5jaGlsZHJlbiwgbmV4dFByb3BzLnF1ZXJ5KSxcbiAgICAgICAgICAgIHRydW5jYXRlQXQ6IElOSVRJQUxfTE9BRF9USUxFUyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2hvd0FsbCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cnVuY2F0ZUF0OiB0aGlzLnN0YXRlLnRydW5jYXRlQXQgKyBMT0FEX1RJTEVTX1NURVBfU0laRSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudCA9IChvdmVyZmxvd0NvdW50OiBudW1iZXIsIHRvdGFsQ291bnQ6IG51bWJlcikgPT4ge1xuICAgICAgICByZXR1cm4gPGJ1dHRvbiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b25cIiBvbkNsaWNrPXt0aGlzLnNob3dBbGx9PlxuICAgICAgICAgICAgeyBfdChcImFuZCAlKGNvdW50KXMgb3RoZXJzLi4uXCIsIHsgY291bnQ6IG92ZXJmbG93Q291bnQgfSkgfVxuICAgICAgICA8L2J1dHRvbj47XG4gICAgfTtcblxuICAgIG9uUXVlcnkgPSAoZXYpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHRoaXMucHJvcHMub25DaGFuZ2UoZXYudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgZ2V0Q2hpbGRyZW4gPSAoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZmlsdGVyZWRDaGlsZHJlbi5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9O1xuXG4gICAgZ2V0Q2hpbGRDb3VudCA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5maWx0ZXJlZENoaWxkcmVuLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBUcnVuY2F0ZWRMaXN0ID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlRydW5jYXRlZExpc3RcIik7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPEZpZWxkIGxhYmVsPXtfdCgnRmlsdGVyIHJlc3VsdHMnKX0gYXV0b0ZvY3VzPXt0cnVlfSBzaXplPXs2NH1cbiAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIGF1dG9Db21wbGV0ZT1cIm9mZlwiIHZhbHVlPXt0aGlzLnByb3BzLnF1ZXJ5fSBvbkNoYW5nZT17dGhpcy5vblF1ZXJ5fVxuICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1RleHRJbnB1dERpYWxvZ19pbnB1dCBteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9xdWVyeVwiXG4gICAgICAgICAgICAgICAgICAgLy8gZm9yY2UgcmUtcmVuZGVyIHNvIHRoYXQgYXV0b0ZvY3VzIGlzIGFwcGxpZWQgd2hlbiB0aGlzIGNvbXBvbmVudCBpcyByZS11c2VkXG4gICAgICAgICAgICAgICAgICAga2V5PXt0aGlzLnByb3BzLmNoaWxkcmVuWzBdID8gdGhpcy5wcm9wcy5jaGlsZHJlblswXS5rZXkgOiAnJ30gLz5cblxuICAgICAgICAgICAgPFRydW5jYXRlZExpc3QgZ2V0Q2hpbGRyZW49e3RoaXMuZ2V0Q2hpbGRyZW59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRDaGlsZENvdW50PXt0aGlzLmdldENoaWxkQ291bnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVuY2F0ZUF0PXt0aGlzLnN0YXRlLnRydW5jYXRlQXR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVPdmVyZmxvd0VsZW1lbnQ9e3RoaXMuY3JlYXRlT3ZlcmZsb3dFbGVtZW50fSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5jbGFzcyBSb29tU3RhdGVFeHBsb3JlciBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHsgcmV0dXJuIF90KCdFeHBsb3JlIFJvb20gU3RhdGUnKTsgfVxuXG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25CYWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICByb29tOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSb29tKS5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgcm9vbVN0YXRlRXZlbnRzOiBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBNYXRyaXhFdmVudD4+O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMucm9vbVN0YXRlRXZlbnRzID0gdGhpcy5wcm9wcy5yb29tLmN1cnJlbnRTdGF0ZS5ldmVudHM7XG5cbiAgICAgICAgdGhpcy5vbkJhY2sgPSB0aGlzLm9uQmFjay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmVkaXRFdiA9IHRoaXMuZWRpdEV2LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25RdWVyeUV2ZW50VHlwZSA9IHRoaXMub25RdWVyeUV2ZW50VHlwZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uUXVlcnlTdGF0ZUtleSA9IHRoaXMub25RdWVyeVN0YXRlS2V5LmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGV2ZW50VHlwZTogbnVsbCxcbiAgICAgICAgICAgIGV2ZW50OiBudWxsLFxuICAgICAgICAgICAgZWRpdGluZzogZmFsc2UsXG5cbiAgICAgICAgICAgIHF1ZXJ5RXZlbnRUeXBlOiAnJyxcbiAgICAgICAgICAgIHF1ZXJ5U3RhdGVLZXk6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGJyb3dzZUV2ZW50VHlwZShldmVudFR5cGUpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudFR5cGUgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25WaWV3U291cmNlQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudCB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkJhY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXZlbnQ6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5ldmVudFR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudFR5cGU6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQmFjaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZWRpdEV2KCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdGluZzogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICBvblF1ZXJ5RXZlbnRUeXBlKGZpbHRlckV2ZW50VHlwZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcXVlcnlFdmVudFR5cGU6IGZpbHRlckV2ZW50VHlwZSB9KTtcbiAgICB9XG5cbiAgICBvblF1ZXJ5U3RhdGVLZXkoZmlsdGVyU3RhdGVLZXkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHF1ZXJ5U3RhdGVLZXk6IGZpbHRlclN0YXRlS2V5IH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPFNlbmRDdXN0b21FdmVudCByb29tPXt0aGlzLnByb3BzLnJvb219IGZvcmNlU3RhdGVFdmVudD17dHJ1ZX0gb25CYWNrPXt0aGlzLm9uQmFja30gaW5wdXRzPXt7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogdGhpcy5zdGF0ZS5ldmVudC5nZXRUeXBlKCksXG4gICAgICAgICAgICAgICAgICAgIGV2Q29udGVudDogSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ldmVudC5nZXRDb250ZW50KCksIG51bGwsICdcXHQnKSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVLZXk6IHRoaXMuc3RhdGUuZXZlbnQuZ2V0U3RhdGVLZXkoKSxcbiAgICAgICAgICAgICAgICB9fSAvPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVmlld1NvdXJjZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPFN5bnRheEhpZ2hsaWdodCBjbGFzc05hbWU9XCJqc29uXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuZXZlbnQuZXZlbnQsIG51bGwsIDIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9TeW50YXhIaWdobGlnaHQ+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CYWNrfT57IF90KCdCYWNrJykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuZWRpdEV2fT57IF90KCdFZGl0JykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxpc3QgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSAnbXhfRGV2VG9vbHNfUm9vbVN0YXRlRXhwbG9yZXJfYnV0dG9uJztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXZlbnRUeXBlID09PSBudWxsKSB7XG4gICAgICAgICAgICBsaXN0ID0gPEZpbHRlcmVkTGlzdCBxdWVyeT17dGhpcy5zdGF0ZS5xdWVyeUV2ZW50VHlwZX0gb25DaGFuZ2U9e3RoaXMub25RdWVyeUV2ZW50VHlwZX0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMucm9vbVN0YXRlRXZlbnRzLmVudHJpZXMoKSkubWFwKChbZXZlbnRUeXBlLCBhbGxTdGF0ZUtleXNdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb25DbGlja0ZuO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbFN0YXRlS2V5cy5zaXplID09PSAxICYmIGFsbFN0YXRlS2V5cy5oYXMoXCJcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrRm4gPSB0aGlzLm9uVmlld1NvdXJjZUNsaWNrKGFsbFN0YXRlS2V5cy5nZXQoXCJcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrRm4gPSB0aGlzLmJyb3dzZUV2ZW50VHlwZShldmVudFR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGJ1dHRvbiBjbGFzc05hbWU9e2NsYXNzZXN9IGtleT17ZXZlbnRUeXBlfSBvbkNsaWNrPXtvbkNsaWNrRm59PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtldmVudFR5cGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj47XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9GaWx0ZXJlZExpc3Q+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RhdGVHcm91cCA9IHRoaXMucm9vbVN0YXRlRXZlbnRzLmdldCh0aGlzLnN0YXRlLmV2ZW50VHlwZSk7XG5cbiAgICAgICAgICAgIGxpc3QgPSA8RmlsdGVyZWRMaXN0IHF1ZXJ5PXt0aGlzLnN0YXRlLnF1ZXJ5U3RhdGVLZXl9IG9uQ2hhbmdlPXt0aGlzLm9uUXVlcnlTdGF0ZUtleX0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBBcnJheS5mcm9tKHN0YXRlR3JvdXAuZW50cmllcygpKS5tYXAoKFtzdGF0ZUtleSwgZXZdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGJ1dHRvbiBjbGFzc05hbWU9e2NsYXNzZXN9IGtleT17c3RhdGVLZXl9IG9uQ2xpY2s9e3RoaXMub25WaWV3U291cmNlQ2xpY2soZXYpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0YXRlS2V5IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPjtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L0ZpbHRlcmVkTGlzdD47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7IGxpc3QgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQmFja30+eyBfdCgnQmFjaycpIH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5jbGFzcyBBY2NvdW50RGF0YUV4cGxvcmVyIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGdldExhYmVsKCkgeyByZXR1cm4gX3QoJ0V4cGxvcmUgQWNjb3VudCBEYXRhJyk7IH1cblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uQmFjazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgcm9vbTogUHJvcFR5cGVzLmluc3RhbmNlT2YoUm9vbSkuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLm9uQmFjayA9IHRoaXMub25CYWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZWRpdEV2ID0gdGhpcy5lZGl0RXYuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2UgPSB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uUXVlcnlFdmVudFR5cGUgPSB0aGlzLm9uUXVlcnlFdmVudFR5cGUuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNSb29tQWNjb3VudERhdGE6IGZhbHNlLFxuICAgICAgICAgICAgZXZlbnQ6IG51bGwsXG4gICAgICAgICAgICBlZGl0aW5nOiBmYWxzZSxcblxuICAgICAgICAgICAgcXVlcnlFdmVudFR5cGU6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUm9vbUFjY291bnREYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb29tLmFjY291bnREYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuc3RvcmUuYWNjb3VudERhdGE7XG4gICAgfVxuXG4gICAgb25WaWV3U291cmNlQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBldmVudCB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkJhY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXZlbnQ6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQmFjaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uQ2hhbmdlKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7W2UudGFyZ2V0LmlkXTogZS50YXJnZXQudHlwZSA9PT0gJ2NoZWNrYm94JyA/IGUudGFyZ2V0LmNoZWNrZWQgOiBlLnRhcmdldC52YWx1ZX0pO1xuICAgIH1cblxuICAgIGVkaXRFdigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRpbmc6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgb25RdWVyeUV2ZW50VHlwZShxdWVyeUV2ZW50VHlwZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcXVlcnlFdmVudFR5cGUgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybiA8U2VuZEFjY291bnREYXRhXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgaXNSb29tQWNjb3VudERhdGE9e3RoaXMuc3RhdGUuaXNSb29tQWNjb3VudERhdGF9XG4gICAgICAgICAgICAgICAgICAgIG9uQmFjaz17dGhpcy5vbkJhY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0cz17e1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiB0aGlzLnN0YXRlLmV2ZW50LmdldFR5cGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2Q29udGVudDogSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ldmVudC5nZXRDb250ZW50KCksIG51bGwsICdcXHQnKSxcbiAgICAgICAgICAgICAgICAgICAgfX0gZm9yY2VNb2RlPXt0cnVlfSAvPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVmlld1NvdXJjZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8U3ludGF4SGlnaGxpZ2h0IGNsYXNzTmFtZT1cImpzb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5ldmVudC5ldmVudCwgbnVsbCwgMikgfVxuICAgICAgICAgICAgICAgICAgICA8L1N5bnRheEhpZ2hsaWdodD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkJhY2t9PnsgX3QoJ0JhY2snKSB9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5lZGl0RXZ9PnsgX3QoJ0VkaXQnKSB9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb3dzID0gW107XG5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9ICdteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b24nO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldERhdGEoKTtcbiAgICAgICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoZXZUeXBlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldiA9IGRhdGFbZXZUeXBlXTtcbiAgICAgICAgICAgIHJvd3MucHVzaCg8YnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtldlR5cGV9IG9uQ2xpY2s9e3RoaXMub25WaWV3U291cmNlQ2xpY2soZXYpfT5cbiAgICAgICAgICAgICAgICB7IGV2VHlwZSB9XG4gICAgICAgICAgICA8L2J1dHRvbj4pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8RmlsdGVyZWRMaXN0IHF1ZXJ5PXt0aGlzLnN0YXRlLnF1ZXJ5RXZlbnRUeXBlfSBvbkNoYW5nZT17dGhpcy5vblF1ZXJ5RXZlbnRUeXBlfT5cbiAgICAgICAgICAgICAgICAgICAgeyByb3dzIH1cbiAgICAgICAgICAgICAgICA8L0ZpbHRlcmVkTGlzdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkJhY2t9PnsgX3QoJ0JhY2snKSB9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgeyAhdGhpcy5zdGF0ZS5tZXNzYWdlICYmIDxkaXYgc3R5bGU9e3tmbG9hdDogXCJyaWdodFwifX0+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImlzUm9vbUFjY291bnREYXRhXCIgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGdsIG14X0RldlRvb2xzX3RnbC1mbGlwXCIgdHlwZT1cImNoZWNrYm94XCIgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfSBjaGVja2VkPXt0aGlzLnN0YXRlLmlzUm9vbUFjY291bnREYXRhfSAvPlxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGdsLWJ0blwiIGRhdGEtdGctb2ZmPVwiQWNjb3VudCBEYXRhXCIgZGF0YS10Zy1vbj1cIlJvb20gRGF0YVwiIGh0bWxGb3I9XCJpc1Jvb21BY2NvdW50RGF0YVwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5jbGFzcyBTZXJ2ZXJzSW5Sb29tTGlzdCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHsgcmV0dXJuIF90KCdWaWV3IFNlcnZlcnMgaW4gUm9vbScpOyB9XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkJhY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5pbnN0YW5jZU9mKFJvb20pLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMucHJvcHMucm9vbTtcbiAgICAgICAgY29uc3Qgc2VydmVycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20ubWVtYmVyXCIpLmZvckVhY2goZXYgPT4gc2VydmVycy5hZGQoZXYuZ2V0U2VuZGVyKCkuc3BsaXQoXCI6XCIpWzFdKSk7XG4gICAgICAgIHRoaXMuc2VydmVycyA9IEFycmF5LmZyb20oc2VydmVycykubWFwKHMgPT5cbiAgICAgICAgICAgIDxidXR0b24ga2V5PXtzfSBjbGFzc05hbWU9XCJteF9EZXZUb29sc19TZXJ2ZXJzSW5Sb29tTGlzdF9idXR0b25cIj5cbiAgICAgICAgICAgICAgICB7IHMgfVxuICAgICAgICAgICAgPC9idXR0b24+KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcXVlcnk6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uUXVlcnkgPSAocXVlcnkpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHF1ZXJ5IH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPEZpbHRlcmVkTGlzdCBxdWVyeT17dGhpcy5zdGF0ZS5xdWVyeX0gb25DaGFuZ2U9e3RoaXMub25RdWVyeX0+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zZXJ2ZXJzIH1cbiAgICAgICAgICAgICAgICA8L0ZpbHRlcmVkTGlzdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5vbkJhY2t9PnsgX3QoJ0JhY2snKSB9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuY29uc3QgUEhBU0VfTUFQID0ge1xuICAgIFtQSEFTRV9VTlNFTlRdOiBcInVuc2VudFwiLFxuICAgIFtQSEFTRV9SRVFVRVNURURdOiBcInJlcXVlc3RlZFwiLFxuICAgIFtQSEFTRV9SRUFEWV06IFwicmVhZHlcIixcbiAgICBbUEhBU0VfRE9ORV06IFwiZG9uZVwiLFxuICAgIFtQSEFTRV9TVEFSVEVEXTogXCJzdGFydGVkXCIsXG4gICAgW1BIQVNFX0NBTkNFTExFRF06IFwiY2FuY2VsbGVkXCIsXG59O1xuXG5mdW5jdGlvbiBWZXJpZmljYXRpb25SZXF1ZXN0KHt0eG5JZCwgcmVxdWVzdH0pIHtcbiAgICBjb25zdCBbLCB1cGRhdGVTdGF0ZV0gPSB1c2VTdGF0ZSgpO1xuICAgIGNvbnN0IFt0aW1lb3V0LCBzZXRSZXF1ZXN0VGltZW91dF0gPSB1c2VTdGF0ZShyZXF1ZXN0LnRpbWVvdXQpO1xuXG4gICAgLyogUmUtcmVuZGVyIGlmIHNvbWV0aGluZyBjaGFuZ2VzIHN0YXRlICovXG4gICAgdXNlRXZlbnRFbWl0dGVyKHJlcXVlc3QsIFwiY2hhbmdlXCIsIHVwZGF0ZVN0YXRlKTtcblxuICAgIC8qIEtlZXAgcmUtcmVuZGVyaW5nIGlmIHRoZXJlJ3MgYSB0aW1lb3V0ICovXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHJlcXVlc3QudGltZW91dCA9PSAwKSByZXR1cm47XG5cbiAgICAgICAgLyogTm90ZSB0aGF0IHJlcXVlc3QudGltZW91dCBpcyBhIGdldHRlciwgc28gaXRzIHZhbHVlIGNoYW5nZXMgKi9cbiAgICAgICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgIHNldFJlcXVlc3RUaW1lb3V0KHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHsgY2xlYXJJbnRlcnZhbChpZCk7IH07XG4gICAgfSwgW3JlcXVlc3RdKTtcblxuICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19WZXJpZmljYXRpb25SZXF1ZXN0XCI+XG4gICAgICAgIDxkbD5cbiAgICAgICAgICAgIDxkdD5UcmFuc2FjdGlvbjwvZHQ+XG4gICAgICAgICAgICA8ZGQ+e3R4bklkfTwvZGQ+XG4gICAgICAgICAgICA8ZHQ+UGhhc2U8L2R0PlxuICAgICAgICAgICAgPGRkPntQSEFTRV9NQVBbcmVxdWVzdC5waGFzZV0gfHwgcmVxdWVzdC5waGFzZX08L2RkPlxuICAgICAgICAgICAgPGR0PlRpbWVvdXQ8L2R0PlxuICAgICAgICAgICAgPGRkPntNYXRoLmZsb29yKHRpbWVvdXQgLyAxMDAwKX08L2RkPlxuICAgICAgICAgICAgPGR0Pk1ldGhvZHM8L2R0PlxuICAgICAgICAgICAgPGRkPntyZXF1ZXN0Lm1ldGhvZHMgJiYgcmVxdWVzdC5tZXRob2RzLmpvaW4oXCIsIFwiKX08L2RkPlxuICAgICAgICAgICAgPGR0PnJlcXVlc3RpbmdVc2VySWQ8L2R0PlxuICAgICAgICAgICAgPGRkPntyZXF1ZXN0LnJlcXVlc3RpbmdVc2VySWR9PC9kZD5cbiAgICAgICAgICAgIDxkdD5vYnNlcnZlT25seTwvZHQ+XG4gICAgICAgICAgICA8ZGQ+e0pTT04uc3RyaW5naWZ5KHJlcXVlc3Qub2JzZXJ2ZU9ubHkpfTwvZGQ+XG4gICAgICAgIDwvZGw+XG4gICAgPC9kaXY+KTtcbn1cblxuY2xhc3MgVmVyaWZpY2F0aW9uRXhwbG9yZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHtcbiAgICAgICAgcmV0dXJuIF90KFwiVmVyaWZpY2F0aW9uIFJlcXVlc3RzXCIpO1xuICAgIH1cblxuICAgIC8qIEVuc3VyZSB0aGlzLmNvbnRleHQgaXMgdGhlIGNsaSAqL1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBvbk5ld1JlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjbGkub24oXCJjcnlwdG8udmVyaWZpY2F0aW9uLnJlcXVlc3RcIiwgdGhpcy5vbk5ld1JlcXVlc3QpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCBjbGkgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNsaS5vZmYoXCJjcnlwdG8udmVyaWZpY2F0aW9uLnJlcXVlc3RcIiwgdGhpcy5vbk5ld1JlcXVlc3QpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY2xpID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5wcm9wcy5yb29tO1xuICAgICAgICBjb25zdCBpblJvb21DaGFubmVsID0gY2xpLl9jcnlwdG8uX2luUm9vbVZlcmlmaWNhdGlvblJlcXVlc3RzO1xuICAgICAgICBjb25zdCBpblJvb21SZXF1ZXN0cyA9IChpblJvb21DaGFubmVsLl9yZXF1ZXN0c0J5Um9vbUlkIHx8IG5ldyBNYXAoKSkuZ2V0KHJvb20ucm9vbUlkKSB8fCBuZXcgTWFwKCk7XG5cbiAgICAgICAgcmV0dXJuICg8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgIHtBcnJheS5mcm9tKGluUm9vbVJlcXVlc3RzLmVudHJpZXMoKSkucmV2ZXJzZSgpLm1hcCgoW3R4bklkLCByZXF1ZXN0XSkgPT5cbiAgICAgICAgICAgICAgICAgICAgPFZlcmlmaWNhdGlvblJlcXVlc3QgdHhuSWQ9e3R4bklkfSByZXF1ZXN0PXtyZXF1ZXN0fSBrZXk9e3R4bklkfSAvPixcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQmFja30+e190KFwiQmFja1wiKX08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj4pO1xuICAgIH1cbn1cblxuY2xhc3MgV2lkZ2V0RXhwbG9yZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBnZXRMYWJlbCgpIHtcbiAgICAgICAgcmV0dXJuIF90KFwiQWN0aXZlIFdpZGdldHNcIik7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBxdWVyeTogJycsXG4gICAgICAgICAgICBlZGl0V2lkZ2V0OiBudWxsLCAvLyBzZXQgdG8gYW4gSUFwcCB3aGVuIGVkaXRpbmdcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbldpZGdldFN0b3JlVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIG9uUXVlcnlDaGFuZ2UgPSAocXVlcnkpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cXVlcnl9KTtcbiAgICB9O1xuXG4gICAgb25FZGl0V2lkZ2V0ID0gKHdpZGdldCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtlZGl0V2lkZ2V0OiB3aWRnZXR9KTtcbiAgICB9O1xuXG4gICAgb25CYWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0QXBwcyh0aGlzLnByb3BzLnJvb20ucm9vbUlkKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdFdpZGdldCAmJiB3aWRnZXRzLmluY2x1ZGVzKHRoaXMuc3RhdGUuZWRpdFdpZGdldCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2VkaXRXaWRnZXQ6IG51bGx9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25CYWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIFdpZGdldFN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vbldpZGdldFN0b3JlVXBkYXRlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbldpZGdldFN0b3JlVXBkYXRlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnByb3BzLnJvb207XG5cbiAgICAgICAgY29uc3QgZWRpdFdpZGdldCA9IHRoaXMuc3RhdGUuZWRpdFdpZGdldDtcbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IFdpZGdldFN0b3JlLmluc3RhbmNlLmdldEFwcHMocm9vbS5yb29tSWQpO1xuICAgICAgICBpZiAoZWRpdFdpZGdldCAmJiB3aWRnZXRzLmluY2x1ZGVzKGVkaXRXaWRnZXQpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxTdGF0ZSA9IEFycmF5LmZyb20oQXJyYXkuZnJvbShyb29tLmN1cnJlbnRTdGF0ZS5ldmVudHMudmFsdWVzKCkpLm1hcChlID0+IGUudmFsdWVzKCkpKVxuICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHAsIGMpID0+IHtwLnB1c2goLi4uYyk7IHJldHVybiBwO30sIFtdKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlRXYgPSBhbGxTdGF0ZS5maW5kKGV2ID0+IGV2LmdldElkKCkgPT09IGVkaXRXaWRnZXQuZXZlbnRJZCk7XG4gICAgICAgICAgICBpZiAoIXN0YXRlRXYpIHsgLy8gXCJzaG91bGQgbmV2ZXIgaGFwcGVuXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiVGhlcmUgd2FzIGFuIGVycm9yIGZpbmRpbmcgdGhpcyB3aWRnZXQuXCIpfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25CYWNrfT57X3QoXCJCYWNrXCIpfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gPFNlbmRDdXN0b21FdmVudFxuICAgICAgICAgICAgICAgIG9uQmFjaz17dGhpcy5vbkJhY2t9XG4gICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICBmb3JjZVN0YXRlRXZlbnQ9e3RydWV9XG4gICAgICAgICAgICAgICAgaW5wdXRzPXt7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogc3RhdGVFdi5nZXRUeXBlKCksXG4gICAgICAgICAgICAgICAgICAgIGV2Q29udGVudDogSlNPTi5zdHJpbmdpZnkoc3RhdGVFdi5nZXRDb250ZW50KCksIG51bGwsICdcXHQnKSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVLZXk6IHN0YXRlRXYuZ2V0U3RhdGVLZXkoKSxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPEZpbHRlcmVkTGlzdCBxdWVyeT17dGhpcy5zdGF0ZS5xdWVyeX0gb25DaGFuZ2U9e3RoaXMub25RdWVyeUNoYW5nZX0+XG4gICAgICAgICAgICAgICAgICAgIHt3aWRnZXRzLm1hcCh3ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt3LnVybCArIHcuZXZlbnRJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLm9uRWRpdFdpZGdldCh3KX1cbiAgICAgICAgICAgICAgICAgICAgICAgID57dy51cmx9PC9idXR0b24+O1xuICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICA8L0ZpbHRlcmVkTGlzdD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkJhY2t9PntfdChcIkJhY2tcIil9PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+KTtcbiAgICB9XG59XG5cbmNvbnN0IEVudHJpZXMgPSBbXG4gICAgU2VuZEN1c3RvbUV2ZW50LFxuICAgIFJvb21TdGF0ZUV4cGxvcmVyLFxuICAgIFNlbmRBY2NvdW50RGF0YSxcbiAgICBBY2NvdW50RGF0YUV4cGxvcmVyLFxuICAgIFNlcnZlcnNJblJvb21MaXN0LFxuICAgIFZlcmlmaWNhdGlvbkV4cGxvcmVyLFxuICAgIFdpZGdldEV4cGxvcmVyLFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGV2dG9vbHNEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICByb29tSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQmFjayA9IHRoaXMub25CYWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25DYW5jZWwgPSB0aGlzLm9uQ2FuY2VsLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG1vZGU6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgX3NldE1vZGUobW9kZSkge1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vZGUgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25CYWNrKCkge1xuICAgICAgICBpZiAodGhpcy5wcmV2TW9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1vZGU6IHRoaXMucHJldk1vZGUgfSk7XG4gICAgICAgICAgICB0aGlzLnByZXZNb2RlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtb2RlOiBudWxsIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25DYW5jZWwoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgYm9keTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tb2RlKSB7XG4gICAgICAgICAgICBib2R5ID0gPE1hdHJpeENsaWVudENvbnRleHQuQ29uc3VtZXI+XG4gICAgICAgICAgICAgICAgeyhjbGkpID0+IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9sZWZ0XCI+eyB0aGlzLnN0YXRlLm1vZGUuZ2V0TGFiZWwoKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfbGFiZWxfcmlnaHRcIj5Sb29tIElEOiB7IHRoaXMucHJvcHMucm9vbUlkIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9ib3R0b21cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8dGhpcy5zdGF0ZS5tb2RlIG9uQmFjaz17dGhpcy5vbkJhY2t9IHJvb209e2NsaS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKX0gLz5cbiAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50Pn1cbiAgICAgICAgICAgIDwvTWF0cml4Q2xpZW50Q29udGV4dC5Db25zdW1lcj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gXCJteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9idXR0b25cIjtcbiAgICAgICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9sZWZ0XCI+eyBfdCgnVG9vbGJveCcpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9yaWdodFwiPlJvb20gSUQ6IHsgdGhpcy5wcm9wcy5yb29tSWQgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2xhYmVsX2JvdHRvbVwiIC8+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBFbnRyaWVzLm1hcCgoRW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IEVudHJ5LmdldExhYmVsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb25DbGljayA9IHRoaXMuX3NldE1vZGUoRW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtsYWJlbH0gb25DbGljaz17b25DbGlja30+eyBsYWJlbCB9PC9idXR0b24+O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkNhbmNlbH0+eyBfdCgnQ2FuY2VsJykgfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9RdWVzdGlvbkRpYWxvZ1wiIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH0gdGl0bGU9e190KCdEZXZlbG9wZXIgVG9vbHMnKX0+XG4gICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=