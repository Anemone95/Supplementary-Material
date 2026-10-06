"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let ReactionsRowButton = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.ReactionsRowButton"), _dec(_class = (_temp = _class2 = class ReactionsRowButton extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onClick", ev => {
      const {
        mxEvent,
        myReactionEvent,
        content
      } = this.props;

      if (myReactionEvent) {
        _MatrixClientPeg.MatrixClientPeg.get().redactEvent(mxEvent.getRoomId(), myReactionEvent.getId());
      } else {
        _MatrixClientPeg.MatrixClientPeg.get().sendEvent(mxEvent.getRoomId(), "m.reaction", {
          "m.relates_to": {
            "rel_type": "m.annotation",
            "event_id": mxEvent.getId(),
            "key": content
          }
        });

        _dispatcher.default.dispatch({
          action: "message_sent"
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMouseOver", () => {
      this.setState({
        // To avoid littering the DOM with a tooltip for every reaction,
        // only render it on first use.
        tooltipRendered: true,
        tooltipVisible: true
      });
    });
    (0, _defineProperty2.default)(this, "onMouseLeave", () => {
      this.setState({
        tooltipVisible: false
      });
    });
    this.state = {
      tooltipVisible: false
    };
  }

  render() {
    const ReactionsRowButtonTooltip = sdk.getComponent('messages.ReactionsRowButtonTooltip');
    const {
      mxEvent,
      content,
      count,
      reactionEvents,
      myReactionEvent
    } = this.props;
    const classes = (0, _classnames.default)({
      mx_ReactionsRowButton: true,
      mx_ReactionsRowButton_selected: !!myReactionEvent
    });
    let tooltip;

    if (this.state.tooltipRendered) {
      tooltip = /*#__PURE__*/_react.default.createElement(ReactionsRowButtonTooltip, {
        mxEvent: this.props.mxEvent,
        content: content,
        reactionEvents: reactionEvents,
        visible: this.state.tooltipVisible
      });
    }

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(mxEvent.getRoomId());

    let label;

    if (room) {
      const senders = [];

      for (const reactionEvent of reactionEvents) {
        const member = room.getMember(reactionEvent.getSender());
        const name = member ? member.name : reactionEvent.getSender();
        senders.push(name);
      }

      label = (0, _languageHandler._t)("<reactors/><reactedWith> reacted with %(content)s</reactedWith>", {
        content
      }, {
        reactors: () => {
          return (0, _FormattingUtils.formatCommaSeparatedList)(senders, 6);
        },
        reactedWith: sub => {
          if (!content) {
            return null;
          }

          return sub;
        }
      });
    }

    const isPeeking = room.getMyMembership() !== "join";
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    return /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      className: classes,
      "aria-label": label,
      onClick: this.onClick,
      disabled: isPeeking,
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ReactionsRowButton_content",
      "aria-hidden": "true"
    }, content), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ReactionsRowButton_count",
      "aria-hidden": "true"
    }, count), tooltip);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // The event we're displaying reactions for
  mxEvent: _propTypes.default.object.isRequired,
  // The reaction content / key / emoji
  content: _propTypes.default.string.isRequired,
  // The count of votes for this key
  count: _propTypes.default.number.isRequired,
  // A Set of Martix reaction events for this key
  reactionEvents: _propTypes.default.object.isRequired,
  // A possible Matrix event if the current user has voted for this type
  myReactionEvent: _propTypes.default.object
}), _temp)) || _class);
exports.default = ReactionsRowButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1JlYWN0aW9uc1Jvd0J1dHRvbi5qcyJdLCJuYW1lcyI6WyJSZWFjdGlvbnNSb3dCdXR0b24iLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJteEV2ZW50IiwibXlSZWFjdGlvbkV2ZW50IiwiY29udGVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInJlZGFjdEV2ZW50IiwiZ2V0Um9vbUlkIiwiZ2V0SWQiLCJzZW5kRXZlbnQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInNldFN0YXRlIiwidG9vbHRpcFJlbmRlcmVkIiwidG9vbHRpcFZpc2libGUiLCJzdGF0ZSIsInJlbmRlciIsIlJlYWN0aW9uc1Jvd0J1dHRvblRvb2x0aXAiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb3VudCIsInJlYWN0aW9uRXZlbnRzIiwiY2xhc3NlcyIsIm14X1JlYWN0aW9uc1Jvd0J1dHRvbiIsIm14X1JlYWN0aW9uc1Jvd0J1dHRvbl9zZWxlY3RlZCIsInRvb2x0aXAiLCJyb29tIiwiZ2V0Um9vbSIsImxhYmVsIiwic2VuZGVycyIsInJlYWN0aW9uRXZlbnQiLCJtZW1iZXIiLCJnZXRNZW1iZXIiLCJnZXRTZW5kZXIiLCJuYW1lIiwicHVzaCIsInJlYWN0b3JzIiwicmVhY3RlZFdpdGgiLCJzdWIiLCJpc1BlZWtpbmciLCJnZXRNeU1lbWJlcnNoaXAiLCJBY2Nlc3NpYmxlQnV0dG9uIiwib25DbGljayIsIm9uTW91c2VPdmVyIiwib25Nb3VzZUxlYXZlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsInN0cmluZyIsIm51bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsa0IsV0FEcEIsZ0RBQXFCLG1DQUFy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QUFBLGNBQWMsRUFBRXdCLG1CQUFVQyxNQUFWLENBQWlCQyxVQVJsQjtBQVNmO0FBQ0E5QyxFQUFBQSxlQUFlLEVBQUU0QyxtQkFBVUM7QUFWWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0IH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvRm9ybWF0dGluZ1V0aWxzJztcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLm1lc3NhZ2VzLlJlYWN0aW9uc1Jvd0J1dHRvblwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3Rpb25zUm93QnV0dG9uIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLy8gVGhlIGV2ZW50IHdlJ3JlIGRpc3BsYXlpbmcgcmVhY3Rpb25zIGZvclxuICAgICAgICBteEV2ZW50OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIC8vIFRoZSByZWFjdGlvbiBjb250ZW50IC8ga2V5IC8gZW1vamlcbiAgICAgICAgY29udGVudDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICAvLyBUaGUgY291bnQgb2Ygdm90ZXMgZm9yIHRoaXMga2V5XG4gICAgICAgIGNvdW50OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICAgIC8vIEEgU2V0IG9mIE1hcnRpeCByZWFjdGlvbiBldmVudHMgZm9yIHRoaXMga2V5XG4gICAgICAgIHJlYWN0aW9uRXZlbnRzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIC8vIEEgcG9zc2libGUgTWF0cml4IGV2ZW50IGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIHZvdGVkIGZvciB0aGlzIHR5cGVcbiAgICAgICAgbXlSZWFjdGlvbkV2ZW50OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdG9vbHRpcFZpc2libGU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uQ2xpY2sgPSAoZXYpID0+IHtcbiAgICAgICAgY29uc3QgeyBteEV2ZW50LCBteVJlYWN0aW9uRXZlbnQsIGNvbnRlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmIChteVJlYWN0aW9uRXZlbnQpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZWRhY3RFdmVudChcbiAgICAgICAgICAgICAgICBteEV2ZW50LmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgIG15UmVhY3Rpb25FdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kRXZlbnQobXhFdmVudC5nZXRSb29tSWQoKSwgXCJtLnJlYWN0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICBcIm0ucmVsYXRlc190b1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwicmVsX3R5cGVcIjogXCJtLmFubm90YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJldmVudF9pZFwiOiBteEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwibWVzc2FnZV9zZW50XCJ9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbk1vdXNlT3ZlciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAvLyBUbyBhdm9pZCBsaXR0ZXJpbmcgdGhlIERPTSB3aXRoIGEgdG9vbHRpcCBmb3IgZXZlcnkgcmVhY3Rpb24sXG4gICAgICAgICAgICAvLyBvbmx5IHJlbmRlciBpdCBvbiBmaXJzdCB1c2UuXG4gICAgICAgICAgICB0b29sdGlwUmVuZGVyZWQ6IHRydWUsXG4gICAgICAgICAgICB0b29sdGlwVmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Nb3VzZUxlYXZlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRvb2x0aXBWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBSZWFjdGlvbnNSb3dCdXR0b25Ub29sdGlwID1cbiAgICAgICAgICAgIHNkay5nZXRDb21wb25lbnQoJ21lc3NhZ2VzLlJlYWN0aW9uc1Jvd0J1dHRvblRvb2x0aXAnKTtcbiAgICAgICAgY29uc3QgeyBteEV2ZW50LCBjb250ZW50LCBjb3VudCwgcmVhY3Rpb25FdmVudHMsIG15UmVhY3Rpb25FdmVudCB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBteF9SZWFjdGlvbnNSb3dCdXR0b246IHRydWUsXG4gICAgICAgICAgICBteF9SZWFjdGlvbnNSb3dCdXR0b25fc2VsZWN0ZWQ6ICEhbXlSZWFjdGlvbkV2ZW50LFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgdG9vbHRpcDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudG9vbHRpcFJlbmRlcmVkKSB7XG4gICAgICAgICAgICB0b29sdGlwID0gPFJlYWN0aW9uc1Jvd0J1dHRvblRvb2x0aXBcbiAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgY29udGVudD17Y29udGVudH1cbiAgICAgICAgICAgICAgICByZWFjdGlvbkV2ZW50cz17cmVhY3Rpb25FdmVudHN9XG4gICAgICAgICAgICAgICAgdmlzaWJsZT17dGhpcy5zdGF0ZS50b29sdGlwVmlzaWJsZX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKG14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICBsZXQgbGFiZWw7XG4gICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICBjb25zdCBzZW5kZXJzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlYWN0aW9uRXZlbnQgb2YgcmVhY3Rpb25FdmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tLmdldE1lbWJlcihyZWFjdGlvbkV2ZW50LmdldFNlbmRlcigpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gbWVtYmVyID8gbWVtYmVyLm5hbWUgOiByZWFjdGlvbkV2ZW50LmdldFNlbmRlcigpO1xuICAgICAgICAgICAgICAgIHNlbmRlcnMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhYmVsID0gX3QoXG4gICAgICAgICAgICAgICAgXCI8cmVhY3RvcnMvPjxyZWFjdGVkV2l0aD4gcmVhY3RlZCB3aXRoICUoY29udGVudClzPC9yZWFjdGVkV2l0aD5cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWN0b3JzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0KHNlbmRlcnMsIDYpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWFjdGVkV2l0aDogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3ViO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzUGVla2luZyA9IHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgIT09IFwiam9pblwiO1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICByZXR1cm4gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2lzUGVla2luZ31cbiAgICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLm9uTW91c2VPdmVyfVxuICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLm9uTW91c2VMZWF2ZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUmVhY3Rpb25zUm93QnV0dG9uX2NvbnRlbnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1JlYWN0aW9uc1Jvd0J1dHRvbl9jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgIHtjb3VudH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIHt0b29sdGlwfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgIH1cbn1cbiJdfQ==