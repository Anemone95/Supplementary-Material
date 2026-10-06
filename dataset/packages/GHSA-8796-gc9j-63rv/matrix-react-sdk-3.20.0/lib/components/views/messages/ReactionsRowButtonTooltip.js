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

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _HtmlUtils = require("../../../HtmlUtils");

var _languageHandler = require("../../../languageHandler");

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let ReactionsRowButtonTooltip = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.ReactionsRowButtonTooltip"), _dec(_class = (_temp = _class2 = class ReactionsRowButtonTooltip extends _react.default.PureComponent {
  render() {
    const Tooltip = sdk.getComponent('elements.Tooltip');
    const {
      content,
      reactionEvents,
      mxEvent,
      visible
    } = this.props;

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(mxEvent.getRoomId());

    let tooltipLabel;

    if (room) {
      const senders = [];

      for (const reactionEvent of reactionEvents) {
        const member = room.getMember(reactionEvent.getSender());
        const name = member ? member.name : reactionEvent.getSender();
        senders.push(name);
      }

      const shortName = (0, _HtmlUtils.unicodeToShortcode)(content);
      tooltipLabel = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("<reactors/><reactedWith>reacted with %(shortName)s</reactedWith>", {
        shortName
      }, {
        reactors: () => {
          return /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_Tooltip_title"
          }, (0, _FormattingUtils.formatCommaSeparatedList)(senders, 6));
        },
        reactedWith: sub => {
          if (!shortName) {
            return null;
          }

          return /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_Tooltip_sub"
          }, sub);
        }
      }));
    }

    let tooltip;

    if (tooltipLabel) {
      tooltip = /*#__PURE__*/_react.default.createElement(Tooltip, {
        visible: visible,
        label: tooltipLabel
      });
    }

    return tooltip;
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // The event we're displaying reactions for
  mxEvent: _propTypes.default.object.isRequired,
  // The reaction content / key / emoji
  content: _propTypes.default.string.isRequired,
  // A Set of Martix reaction events for this key
  reactionEvents: _propTypes.default.object.isRequired,
  visible: _propTypes.default.bool.isRequired
}), _temp)) || _class);
exports.default = ReactionsRowButtonTooltip;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1JlYWN0aW9uc1Jvd0J1dHRvblRvb2x0aXAuanMiXSwibmFtZXMiOlsiUmVhY3Rpb25zUm93QnV0dG9uVG9vbHRpcCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInJlbmRlciIsIlRvb2x0aXAiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb250ZW50IiwicmVhY3Rpb25FdmVudHMiLCJteEV2ZW50IiwidmlzaWJsZSIsInByb3BzIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFJvb20iLCJnZXRSb29tSWQiLCJ0b29sdGlwTGFiZWwiLCJzZW5kZXJzIiwicmVhY3Rpb25FdmVudCIsIm1lbWJlciIsImdldE1lbWJlciIsImdldFNlbmRlciIsIm5hbWUiLCJwdXNoIiwic2hvcnROYW1lIiwicmVhY3RvcnMiLCJyZWFjdGVkV2l0aCIsInN1YiIsInRvb2x0aXAiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwic3RyaW5nIiwiYm9vbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEseUIsV0FEcEIsZ0RBQXFCLDBDQUFyQixDLG1DQUFELE1BQ3FCQSx5QkFEckIsU0FDdURDLGVBQU1DLGFBRDdELENBQzJFO0FBV3ZFQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxPQUFPLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixrQkFBakIsQ0FBaEI7QUFDQSxVQUFNO0FBQUVDLE1BQUFBLE9BQUY7QUFBV0MsTUFBQUEsY0FBWDtBQUEyQkMsTUFBQUEsT0FBM0I7QUFBb0NDLE1BQUFBO0FBQXBDLFFBQWdELEtBQUtDLEtBQTNEOztBQUVBLFVBQU1DLElBQUksR0FBR0MsaUNBQWdCQyxHQUFoQixHQUFzQkMsT0FBdEIsQ0FBOEJOLE9BQU8sQ0FBQ08sU0FBUixFQUE5QixDQUFiOztBQUNBLFFBQUlDLFlBQUo7O0FBQ0EsUUFBSUwsSUFBSixFQUFVO0FBQ04sWUFBTU0sT0FBTyxHQUFHLEVBQWhCOztBQUNBLFdBQUssTUFBTUMsYUFBWCxJQUE0QlgsY0FBNUIsRUFBNEM7QUFDeEMsY0FBTVksTUFBTSxHQUFHUixJQUFJLENBQUNTLFNBQUwsQ0FBZUYsYUFBYSxDQUFDRyxTQUFkLEVBQWYsQ0FBZjtBQUNBLGNBQU1DLElBQUksR0FBR0gsTUFBTSxHQUFHQSxNQUFNLENBQUNHLElBQVYsR0FBaUJKLGFBQWEsQ0FBQ0csU0FBZCxFQUFwQztBQUNBSixRQUFBQSxPQUFPLENBQUNNLElBQVIsQ0FBYUQsSUFBYjtBQUNIOztBQUNELFlBQU1FLFNBQVMsR0FBRyxtQ0FBbUJsQixPQUFuQixDQUFsQjtBQUNBVSxNQUFBQSxZQUFZLGdCQUFHLDBDQUFNLHlCQUNqQixrRUFEaUIsRUFFakI7QUFDSVEsUUFBQUE7QUFESixPQUZpQixFQUtqQjtBQUNJQyxRQUFBQSxRQUFRLEVBQUUsTUFBTTtBQUNaLDhCQUFPO0FBQUssWUFBQSxTQUFTLEVBQUM7QUFBZixhQUNGLCtDQUF5QlIsT0FBekIsRUFBa0MsQ0FBbEMsQ0FERSxDQUFQO0FBR0gsU0FMTDtBQU1JUyxRQUFBQSxXQUFXLEVBQUdDLEdBQUQsSUFBUztBQUNsQixjQUFJLENBQUNILFNBQUwsRUFBZ0I7QUFDWixtQkFBTyxJQUFQO0FBQ0g7O0FBQ0QsOEJBQU87QUFBSyxZQUFBLFNBQVMsRUFBQztBQUFmLGFBQ0ZHLEdBREUsQ0FBUDtBQUdIO0FBYkwsT0FMaUIsQ0FBTixDQUFmO0FBcUJIOztBQUVELFFBQUlDLE9BQUo7O0FBQ0EsUUFBSVosWUFBSixFQUFrQjtBQUNkWSxNQUFBQSxPQUFPLGdCQUFHLDZCQUFDLE9BQUQ7QUFBUyxRQUFBLE9BQU8sRUFBRW5CLE9BQWxCO0FBQTJCLFFBQUEsS0FBSyxFQUFFTztBQUFsQyxRQUFWO0FBQ0g7O0FBRUQsV0FBT1ksT0FBUDtBQUNIOztBQXREc0UsQyxzREFDcEQ7QUFDZjtBQUNBcEIsRUFBQUEsT0FBTyxFQUFFcUIsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRlg7QUFHZjtBQUNBekIsRUFBQUEsT0FBTyxFQUFFdUIsbUJBQVVHLE1BQVYsQ0FBaUJELFVBSlg7QUFLZjtBQUNBeEIsRUFBQUEsY0FBYyxFQUFFc0IsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBTmxCO0FBT2Z0QixFQUFBQSxPQUFPLEVBQUVvQixtQkFBVUksSUFBVixDQUFlRjtBQVBULEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgdW5pY29kZVRvU2hvcnRjb2RlIH0gZnJvbSAnLi4vLi4vLi4vSHRtbFV0aWxzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IGZvcm1hdENvbW1hU2VwYXJhdGVkTGlzdCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlscyc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MubWVzc2FnZXMuUmVhY3Rpb25zUm93QnV0dG9uVG9vbHRpcFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3Rpb25zUm93QnV0dG9uVG9vbHRpcCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8vIFRoZSBldmVudCB3ZSdyZSBkaXNwbGF5aW5nIHJlYWN0aW9ucyBmb3JcbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICAvLyBUaGUgcmVhY3Rpb24gY29udGVudCAvIGtleSAvIGVtb2ppXG4gICAgICAgIGNvbnRlbnQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgLy8gQSBTZXQgb2YgTWFydGl4IHJlYWN0aW9uIGV2ZW50cyBmb3IgdGhpcyBrZXlcbiAgICAgICAgcmVhY3Rpb25FdmVudHM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgdmlzaWJsZTogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFRvb2x0aXAgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5Ub29sdGlwJyk7XG4gICAgICAgIGNvbnN0IHsgY29udGVudCwgcmVhY3Rpb25FdmVudHMsIG14RXZlbnQsIHZpc2libGUgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKG14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICBsZXQgdG9vbHRpcExhYmVsO1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgY29uc3Qgc2VuZGVycyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCByZWFjdGlvbkV2ZW50IG9mIHJlYWN0aW9uRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gcm9vbS5nZXRNZW1iZXIocmVhY3Rpb25FdmVudC5nZXRTZW5kZXIoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IG1lbWJlciA/IG1lbWJlci5uYW1lIDogcmVhY3Rpb25FdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgICAgICAgICBzZW5kZXJzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzaG9ydE5hbWUgPSB1bmljb2RlVG9TaG9ydGNvZGUoY29udGVudCk7XG4gICAgICAgICAgICB0b29sdGlwTGFiZWwgPSA8ZGl2PntfdChcbiAgICAgICAgICAgICAgICBcIjxyZWFjdG9ycy8+PHJlYWN0ZWRXaXRoPnJlYWN0ZWQgd2l0aCAlKHNob3J0TmFtZSlzPC9yZWFjdGVkV2l0aD5cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHNob3J0TmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhY3RvcnM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0Q29tbWFTZXBhcmF0ZWRMaXN0KHNlbmRlcnMsIDYpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWFjdGVkV2l0aDogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzaG9ydE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfc3ViXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3N1Yn1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKX08L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdG9vbHRpcDtcbiAgICAgICAgaWYgKHRvb2x0aXBMYWJlbCkge1xuICAgICAgICAgICAgdG9vbHRpcCA9IDxUb29sdGlwIHZpc2libGU9e3Zpc2libGV9IGxhYmVsPXt0b29sdGlwTGFiZWx9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvb2x0aXA7XG4gICAgfVxufVxuIl19