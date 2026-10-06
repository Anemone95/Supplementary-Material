"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _BugReportDialog = _interopRequireDefault(require("./BugReportDialog"));

var _InfoDialog = _interopRequireDefault(require("./InfoDialog"));

var _StyledRadioGroup = _interopRequireDefault(require("../elements/StyledRadioGroup"));

/*
Copyright 2018 New Vector Ltd

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
const existingIssuesUrl = "https://github.com/vector-im/element-web/issues" + "?q=is%3Aopen+is%3Aissue+sort%3Areactions-%2B1-desc";
const newIssueUrl = "https://github.com/vector-im/element-web/issues/new";

var _default = props => {
  const [rating, setRating] = (0, _react.useState)("");
  const [comment, setComment] = (0, _react.useState)("");

  const onDebugLogsLinkClick = () => {
    props.onFinished();

    _Modal.default.createTrackedDialog('Bug Report Dialog', '', _BugReportDialog.default, {});
  };

  const hasFeedback = _CountlyAnalytics.default.instance.canEnable();

  const onFinished = sendFeedback => {
    if (hasFeedback && sendFeedback) {
      _CountlyAnalytics.default.instance.reportFeedback(parseInt(rating, 10), comment);

      _Modal.default.createTrackedDialog('Feedback sent', '', _InfoDialog.default, {
        title: (0, _languageHandler._t)('Feedback sent'),
        description: (0, _languageHandler._t)('Thank you!')
      });
    }

    props.onFinished();
  };

  const brand = _SdkConfig.default.get().brand;

  let countlyFeedbackSection;

  if (hasFeedback) {
    countlyFeedbackSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("hr", null), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_FeedbackDialog_section mx_FeedbackDialog_rateApp"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Rate %(brand)s", {
      brand
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Tell us below how you feel about %(brand)s so far.", {
      brand
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please go into as much detail as you like, so we can track down the problem.")), /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "feedbackRating",
      value: rating,
      onChange: setRating,
      definitions: [{
        value: "1",
        label: "😠"
      }, {
        value: "2",
        label: "😞"
      }, {
        value: "3",
        label: "😑"
      }, {
        value: "4",
        label: "😄"
      }, {
        value: "5",
        label: "😍"
      }]
    }), /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "feedbackComment",
      label: (0, _languageHandler._t)("Add comment"),
      placeholder: (0, _languageHandler._t)("Comment"),
      type: "text",
      autoComplete: "off",
      value: comment,
      element: "textarea",
      onChange: ev => {
        setComment(ev.target.value);
      }
    })));
  }

  let subheading;

  if (hasFeedback) {
    subheading = /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("There are two ways you can provide feedback and help us improve %(brand)s.", {
      brand
    }));
  }

  let bugReports = null;

  if (_SdkConfig.default.get().bug_report_endpoint_url) {
    bugReports = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("PRO TIP: If you start a bug, please submit <debugLogsLink>debug logs</debugLogsLink> " + "to help us track down the problem.", {}, {
      debugLogsLink: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: onDebugLogsLinkClick
      }, sub)
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
    className: "mx_FeedbackDialog",
    hasCancelButton: !!hasFeedback,
    title: (0, _languageHandler._t)("Feedback"),
    description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, subheading, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_FeedbackDialog_section mx_FeedbackDialog_reportBug"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Report a bug")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please view <existingIssuesLink>existing bugs on Github</existingIssuesLink> first. " + "No match? <newIssueLink>Start a new one</newIssueLink>.", {}, {
      existingIssuesLink: sub => {
        return /*#__PURE__*/_react.default.createElement("a", {
          target: "_blank",
          rel: "noreferrer noopener",
          href: existingIssuesUrl
        }, sub);
      },
      newIssueLink: sub => {
        return /*#__PURE__*/_react.default.createElement("a", {
          target: "_blank",
          rel: "noreferrer noopener",
          href: newIssueUrl
        }, sub);
      }
    })), bugReports), countlyFeedbackSection),
    button: hasFeedback ? (0, _languageHandler._t)("Send feedback") : (0, _languageHandler._t)("Go back"),
    buttonDisabled: hasFeedback && rating === "",
    onFinished: onFinished
  });
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRmVlZGJhY2tEaWFsb2cuanMiXSwibmFtZXMiOlsiZXhpc3RpbmdJc3N1ZXNVcmwiLCJuZXdJc3N1ZVVybCIsInByb3BzIiwicmF0aW5nIiwic2V0UmF0aW5nIiwiY29tbWVudCIsInNldENvbW1lbnQiLCJvbkRlYnVnTG9nc0xpbmtDbGljayIsIm9uRmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJCdWdSZXBvcnREaWFsb2ciLCJoYXNGZWVkYmFjayIsIkNvdW50bHlBbmFseXRpY3MiLCJpbnN0YW5jZSIsImNhbkVuYWJsZSIsInNlbmRGZWVkYmFjayIsInJlcG9ydEZlZWRiYWNrIiwicGFyc2VJbnQiLCJJbmZvRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwiY291bnRseUZlZWRiYWNrU2VjdGlvbiIsInZhbHVlIiwibGFiZWwiLCJldiIsInRhcmdldCIsInN1YmhlYWRpbmciLCJidWdSZXBvcnRzIiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJkZWJ1Z0xvZ3NMaW5rIiwic3ViIiwiZXhpc3RpbmdJc3N1ZXNMaW5rIiwibmV3SXNzdWVMaW5rIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY0EsTUFBTUEsaUJBQWlCLEdBQUcsb0RBQ3RCLG9EQURKO0FBRUEsTUFBTUMsV0FBVyxHQUFHLHFEQUFwQjs7ZUFHZ0JDLEtBQUQsSUFBVztBQUN0QixRQUFNLENBQUNDLE1BQUQsRUFBU0MsU0FBVCxJQUFzQixxQkFBUyxFQUFULENBQTVCO0FBQ0Es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QUVqQztBQUFuRCxXQUFrRWlDLEdBQWxFLENBQVA7QUFDSDtBQU44RCxLQURuRSxDQURKLENBRkosRUFhS0gsVUFiTCxDQUhTLEVBa0JQTixzQkFsQk8sQ0FKVDtBQXdCSixJQUFBLE1BQU0sRUFBRWIsV0FBVyxHQUFHLHlCQUFHLGVBQUgsQ0FBSCxHQUF5Qix5QkFBRyxTQUFILENBeEJ4QztBQXlCSixJQUFBLGNBQWMsRUFBRUEsV0FBVyxJQUFJVCxNQUFNLEtBQUssRUF6QnRDO0FBMEJKLElBQUEsVUFBVSxFQUFFSztBQTFCUixJQUFSO0FBNEJILEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VTdGF0ZX0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gJy4vUXVlc3Rpb25EaWFsb2cnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuLi8uLi8uLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBCdWdSZXBvcnREaWFsb2cgZnJvbSBcIi4vQnVnUmVwb3J0RGlhbG9nXCI7XG5pbXBvcnQgSW5mb0RpYWxvZyBmcm9tIFwiLi9JbmZvRGlhbG9nXCI7XG5pbXBvcnQgU3R5bGVkUmFkaW9Hcm91cCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkUmFkaW9Hcm91cFwiO1xuXG5jb25zdCBleGlzdGluZ0lzc3Vlc1VybCA9IFwiaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXNcIiArXG4gICAgXCI/cT1pcyUzQW9wZW4raXMlM0Fpc3N1ZStzb3J0JTNBcmVhY3Rpb25zLSUyQjEtZGVzY1wiO1xuY29uc3QgbmV3SXNzdWVVcmwgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzL25ld1wiO1xuXG5cbmV4cG9ydCBkZWZhdWx0IChwcm9wcykgPT4ge1xuICAgIGNvbnN0IFtyYXRpbmcsIHNldFJhdGluZ10gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBjb25zdCBbY29tbWVudCwgc2V0Q29tbWVudF0gPSB1c2VTdGF0ZShcIlwiKTtcblxuICAgIGNvbnN0IG9uRGVidWdMb2dzTGlua0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBwcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0J1ZyBSZXBvcnQgRGlhbG9nJywgJycsIEJ1Z1JlcG9ydERpYWxvZywge30pO1xuICAgIH07XG5cbiAgICBjb25zdCBoYXNGZWVkYmFjayA9IENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UuY2FuRW5hYmxlKCk7XG4gICAgY29uc3Qgb25GaW5pc2hlZCA9IChzZW5kRmVlZGJhY2spID0+IHtcbiAgICAgICAgaWYgKGhhc0ZlZWRiYWNrICYmIHNlbmRGZWVkYmFjaykge1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS5yZXBvcnRGZWVkYmFjayhwYXJzZUludChyYXRpbmcsIDEwKSwgY29tbWVudCk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGZWVkYmFjayBzZW50JywgJycsIEluZm9EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZlZWRiYWNrIHNlbnQnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ1RoYW5rIHlvdSEnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICBsZXQgY291bnRseUZlZWRiYWNrU2VjdGlvbjtcbiAgICBpZiAoaGFzRmVlZGJhY2spIHtcbiAgICAgICAgY291bnRseUZlZWRiYWNrU2VjdGlvbiA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxociAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9GZWVkYmFja0RpYWxvZ19zZWN0aW9uIG14X0ZlZWRiYWNrRGlhbG9nX3JhdGVBcHBcIj5cbiAgICAgICAgICAgICAgICA8aDM+e190KFwiUmF0ZSAlKGJyYW5kKXNcIiwgeyBicmFuZCB9KX08L2gzPlxuXG4gICAgICAgICAgICAgICAgPHA+e190KFwiVGVsbCB1cyBiZWxvdyBob3cgeW91IGZlZWwgYWJvdXQgJShicmFuZClzIHNvIGZhci5cIiwgeyBicmFuZCB9KX08L3A+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiUGxlYXNlIGdvIGludG8gYXMgbXVjaCBkZXRhaWwgYXMgeW91IGxpa2UsIHNvIHdlIGNhbiB0cmFjayBkb3duIHRoZSBwcm9ibGVtLlwiKX08L3A+XG5cbiAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9Hcm91cFxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwiZmVlZGJhY2tSYXRpbmdcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cmF0aW5nfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0UmF0aW5nfVxuICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9ucz17W1xuICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCIxXCIsIGxhYmVsOiBcIvCfmKBcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCIyXCIsIGxhYmVsOiBcIvCfmJ5cIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCIzXCIsIGxhYmVsOiBcIvCfmJFcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCI0XCIsIGxhYmVsOiBcIvCfmIRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCI1XCIsIGxhYmVsOiBcIvCfmI1cIiB9LFxuICAgICAgICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgaWQ9XCJmZWVkYmFja0NvbW1lbnRcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJBZGQgY29tbWVudFwiKX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiQ29tbWVudFwiKX1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17Y29tbWVudH1cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInRleHRhcmVhXCJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudChldi50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgfVxuXG4gICAgbGV0IHN1YmhlYWRpbmc7XG4gICAgaWYgKGhhc0ZlZWRiYWNrKSB7XG4gICAgICAgIHN1YmhlYWRpbmcgPSAoXG4gICAgICAgICAgICA8aDI+e190KFwiVGhlcmUgYXJlIHR3byB3YXlzIHlvdSBjYW4gcHJvdmlkZSBmZWVkYmFjayBhbmQgaGVscCB1cyBpbXByb3ZlICUoYnJhbmQpcy5cIiwgeyBicmFuZCB9KX08L2gyPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGxldCBidWdSZXBvcnRzID0gbnVsbDtcbiAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgIGJ1Z1JlcG9ydHMgPSAoXG4gICAgICAgICAgICA8cD57XG4gICAgICAgICAgICAgICAgX3QoXCJQUk8gVElQOiBJZiB5b3Ugc3RhcnQgYSBidWcsIHBsZWFzZSBzdWJtaXQgPGRlYnVnTG9nc0xpbms+ZGVidWcgbG9nczwvZGVidWdMb2dzTGluaz4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInRvIGhlbHAgdXMgdHJhY2sgZG93biB0aGUgcHJvYmxlbS5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdMb2dzTGluazogc3ViID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17b25EZWJ1Z0xvZ3NMaW5rQ2xpY2t9PntzdWJ9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9PC9wPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoPFF1ZXN0aW9uRGlhbG9nXG4gICAgICAgIGNsYXNzTmFtZT1cIm14X0ZlZWRiYWNrRGlhbG9nXCJcbiAgICAgICAgaGFzQ2FuY2VsQnV0dG9uPXshIWhhc0ZlZWRiYWNrfVxuICAgICAgICB0aXRsZT17X3QoXCJGZWVkYmFja1wiKX1cbiAgICAgICAgZGVzY3JpcHRpb249ezxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIHsgc3ViaGVhZGluZyB9XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRmVlZGJhY2tEaWFsb2dfc2VjdGlvbiBteF9GZWVkYmFja0RpYWxvZ19yZXBvcnRCdWdcIj5cbiAgICAgICAgICAgICAgICA8aDM+e190KFwiUmVwb3J0IGEgYnVnXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+e1xuICAgICAgICAgICAgICAgICAgICBfdChcIlBsZWFzZSB2aWV3IDxleGlzdGluZ0lzc3Vlc0xpbms+ZXhpc3RpbmcgYnVncyBvbiBHaXRodWI8L2V4aXN0aW5nSXNzdWVzTGluaz4gZmlyc3QuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiTm8gbWF0Y2g/IDxuZXdJc3N1ZUxpbms+U3RhcnQgYSBuZXcgb25lPC9uZXdJc3N1ZUxpbms+LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdJc3N1ZXNMaW5rOiAoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiBocmVmPXtleGlzdGluZ0lzc3Vlc1VybH0+eyBzdWIgfTwvYT47XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXNzdWVMaW5rOiAoc3ViKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiBocmVmPXtuZXdJc3N1ZVVybH0+eyBzdWIgfTwvYT47XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH08L3A+XG4gICAgICAgICAgICAgICAge2J1Z1JlcG9ydHN9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgY291bnRseUZlZWRiYWNrU2VjdGlvbiB9XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+fVxuICAgICAgICBidXR0b249e2hhc0ZlZWRiYWNrID8gX3QoXCJTZW5kIGZlZWRiYWNrXCIpIDogX3QoXCJHbyBiYWNrXCIpfVxuICAgICAgICBidXR0b25EaXNhYmxlZD17aGFzRmVlZGJhY2sgJiYgcmF0aW5nID09PSBcIlwifVxuICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgIC8+KTtcbn07XG4iXX0=