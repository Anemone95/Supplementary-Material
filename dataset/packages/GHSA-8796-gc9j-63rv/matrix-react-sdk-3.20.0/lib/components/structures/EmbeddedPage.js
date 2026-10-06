"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _languageHandler = require("../../languageHandler");

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _classnames = _interopRequireDefault(require("classnames"));

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2019 New Vector Ltd

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
class EmbeddedPage extends _react.default.PureComponent {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      // HACK: Workaround for the context's MatrixClient not being set up at render time.
      if (payload.action === 'client_started') {
        this.forceUpdate();
      }
    });
    this._dispatcherRef = null;
    this.state = {
      page: ''
    };
  }

  translate(s) {
    // default implementation - skins may wish to extend this
    return (0, _sanitizeHtml.default)((0, _languageHandler._t)(s));
  }

  componentDidMount() {
    this._unmounted = false;

    if (!this.props.url) {
      return;
    } // we use request() to inline the page into the react component
    // so that it can inherit CSS and theming easily rather than mess around
    // with iframes and trying to synchronise document.stylesheets.


    (0, _browserRequest.default)({
      method: "GET",
      url: this.props.url
    }, (err, response, body) => {
      if (this._unmounted) {
        return;
      }

      if (err || response.status < 200 || response.status >= 300) {
        console.warn(`Error loading page: ${err}`);
        this.setState({
          page: (0, _languageHandler._t)("Couldn't load page")
        });
        return;
      }

      body = body.replace(/_t\(['"]([\s\S]*?)['"]\)/mg, (match, g1) => this.translate(g1));

      if (this.props.replaceMap) {
        Object.keys(this.props.replaceMap).forEach(key => {
          body = body.split(key).join(this.props.replaceMap[key]);
        });
      }

      this.setState({
        page: body
      });
    });
    this._dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    this._unmounted = true;
    if (this._dispatcherRef !== null) _dispatcher.default.unregister(this._dispatcherRef);
  }

  render() {
    // HACK: Workaround for the context's MatrixClient not updating.
    const client = this.context || _MatrixClientPeg.MatrixClientPeg.get();

    const isGuest = client ? client.isGuest() : true;
    const className = this.props.className;
    const classes = (0, _classnames.default)({
      [className]: true,
      [`${className}_guest`]: isGuest,
      [`${className}_loggedIn`]: !!client
    });

    const content = /*#__PURE__*/_react.default.createElement("div", {
      className: `${className}_body`,
      dangerouslySetInnerHTML: {
        __html: this.state.page
      }
    });

    if (this.props.scrollbar) {
      return /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
        className: classes
      }, content);
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, content);
    }
  }

}

exports.default = EmbeddedPage;
(0, _defineProperty2.default)(EmbeddedPage, "propTypes", {
  // URL to request embedded page content from
  url: _propTypes.default.string,
  // Class name prefix to apply for a given instance
  className: _propTypes.default.string,
  // Whether to wrap the page in a scrollbar
  scrollbar: _propTypes.default.bool,
  // Map of keys to replace with values, e.g {$placeholder: "value"}
  replaceMap: _propTypes.default.object
});
(0, _defineProperty2.default)(EmbeddedPage, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvRW1iZWRkZWRQYWdlLmpzIl0sIm5hbWVzIjpbIkVtYmVkZGVkUGFnZSIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwicGF5bG9hZCIsImFjdGlvbiIsImZvcmNlVXBkYXRlIiwiX2Rpc3BhdGNoZXJSZWYiLCJzdGF0ZSIsInBhZ2UiLCJ0cmFuc2xhdGUiLCJzIiwiY29tcG9uZW50RGlkTW91bnQiLCJfdW5tb3VudGVkIiwidXJsIiwibWV0aG9kIiwiZXJyIiwicmVzcG9uc2UiLCJib2R5Iiwic3RhdHVzIiwiY29uc29sZSIsIndhcm4iLCJzZXRTdGF0ZSIsInJlcGxhY2UiLCJtYXRjaCIsImcxIiwicmVwbGFjZU1hcCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5Iiwic3BsaXQiLCJqb2luIiwiZGlzIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsInJlbmRlciIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlzR3Vlc3QiLCJjbGFzc05hbWUiLCJjbGFzc2VzIiwiY29udGVudCIsIl9faHRtbCIsInNjcm9sbGJhciIsIlByb3BUeXBlcyIsInN0cmluZyIsImJvb2wiLCJvYmplY3QiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUEzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFlLE1BQU1BLFlBQU4sU0FBMkJDLGVBQU1DLGFBQWpDLENBQStDO0FBYzFEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQs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RSxHQUFFQyxTQUFVLFdBQWQsR0FBMkIsQ0FBQyxDQUFDSjtBQUhOLEtBQVgsQ0FBaEI7O0FBTUEsVUFBTU0sT0FBTyxnQkFBRztBQUFLLE1BQUEsU0FBUyxFQUFHLEdBQUVGLFNBQVUsT0FBN0I7QUFDWixNQUFBLHVCQUF1QixFQUFFO0FBQUVHLFFBQUFBLE1BQU0sRUFBRSxLQUFLdEMsS0FBTCxDQUFXQztBQUFyQjtBQURiLE1BQWhCOztBQUtBLFFBQUksS0FBS1AsS0FBTCxDQUFXNkMsU0FBZixFQUEwQjtBQUN0QiwwQkFBTyw2QkFBQywwQkFBRDtBQUFtQixRQUFBLFNBQVMsRUFBRUg7QUFBOUIsU0FDRkMsT0FERSxDQUFQO0FBR0gsS0FKRCxNQUlPO0FBQ0gsMEJBQU87QUFBSyxRQUFBLFNBQVMsRUFBRUQ7QUFBaEIsU0FDRkMsT0FERSxDQUFQO0FBR0g7QUFDSjs7QUF6R3lEOzs7OEJBQXpDL0MsWSxlQUNFO0FBQ2Y7QUFDQWdCLEVBQUFBLEdBQUcsRUFBRWtDLG1CQUFVQyxNQUZBO0FBR2Y7QUFDQU4sRUFBQUEsU0FBUyxFQUFFSyxtQkFBVUMsTUFKTjtBQUtmO0FBQ0FGLEVBQUFBLFNBQVMsRUFBRUMsbUJBQVVFLElBTk47QUFPZjtBQUNBeEIsRUFBQUEsVUFBVSxFQUFFc0IsbUJBQVVHO0FBUlAsQzs4QkFERnJELFksaUJBWUlzRCw0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdicm93c2VyLXJlcXVlc3QnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHNhbml0aXplSHRtbCBmcm9tICdzYW5pdGl6ZS1odG1sJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVtYmVkZGVkUGFnZSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8vIFVSTCB0byByZXF1ZXN0IGVtYmVkZGVkIHBhZ2UgY29udGVudCBmcm9tXG4gICAgICAgIHVybDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgLy8gQ2xhc3MgbmFtZSBwcmVmaXggdG8gYXBwbHkgZm9yIGEgZ2l2ZW4gaW5zdGFuY2VcbiAgICAgICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAvLyBXaGV0aGVyIHRvIHdyYXAgdGhlIHBhZ2UgaW4gYSBzY3JvbGxiYXJcbiAgICAgICAgc2Nyb2xsYmFyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgLy8gTWFwIG9mIGtleXMgdG8gcmVwbGFjZSB3aXRoIHZhbHVlcywgZS5nIHskcGxhY2Vob2xkZXI6IFwidmFsdWVcIn1cbiAgICAgICAgcmVwbGFjZU1hcDogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLl9kaXNwYXRjaGVyUmVmID0gbnVsbDtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGFnZTogJycsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlKHMpIHtcbiAgICAgICAgLy8gZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiAtIHNraW5zIG1heSB3aXNoIHRvIGV4dGVuZCB0aGlzXG4gICAgICAgIHJldHVybiBzYW5pdGl6ZUh0bWwoX3QocykpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXRoaXMucHJvcHMudXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSB1c2UgcmVxdWVzdCgpIHRvIGlubGluZSB0aGUgcGFnZSBpbnRvIHRoZSByZWFjdCBjb21wb25lbnRcbiAgICAgICAgLy8gc28gdGhhdCBpdCBjYW4gaW5oZXJpdCBDU1MgYW5kIHRoZW1pbmcgZWFzaWx5IHJhdGhlciB0aGFuIG1lc3MgYXJvdW5kXG4gICAgICAgIC8vIHdpdGggaWZyYW1lcyBhbmQgdHJ5aW5nIHRvIHN5bmNocm9uaXNlIGRvY3VtZW50LnN0eWxlc2hlZXRzLlxuXG4gICAgICAgIHJlcXVlc3QoXG4gICAgICAgICAgICB7IG1ldGhvZDogXCJHRVRcIiwgdXJsOiB0aGlzLnByb3BzLnVybCB9LFxuICAgICAgICAgICAgKGVyciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyIHx8IHJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXMgPj0gMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRXJyb3IgbG9hZGluZyBwYWdlOiAke2Vycn1gKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBhZ2U6IF90KFwiQ291bGRuJ3QgbG9hZCBwYWdlXCIpIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYm9keSA9IGJvZHkucmVwbGFjZSgvX3RcXChbJ1wiXShbXFxzXFxTXSo/KVsnXCJdXFwpL21nLCAobWF0Y2gsIGcxKT0+dGhpcy50cmFuc2xhdGUoZzEpKTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnJlcGxhY2VNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5wcm9wcy5yZXBsYWNlTWFwKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5ID0gYm9keS5zcGxpdChrZXkpLmpvaW4odGhpcy5wcm9wcy5yZXBsYWNlTWFwW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGFnZTogYm9keSB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5fZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuX2Rpc3BhdGNoZXJSZWYgIT09IG51bGwpIGRpcy51bnJlZ2lzdGVyKHRoaXMuX2Rpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIG9uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgLy8gSEFDSzogV29ya2Fyb3VuZCBmb3IgdGhlIGNvbnRleHQncyBNYXRyaXhDbGllbnQgbm90IGJlaW5nIHNldCB1cCBhdCByZW5kZXIgdGltZS5cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnY2xpZW50X3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBIQUNLOiBXb3JrYXJvdW5kIGZvciB0aGUgY29udGV4dCdzIE1hdHJpeENsaWVudCBub3QgdXBkYXRpbmcuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuY29udGV4dCB8fCBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGlzR3Vlc3QgPSBjbGllbnQgPyBjbGllbnQuaXNHdWVzdCgpIDogdHJ1ZTtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5wcm9wcy5jbGFzc05hbWU7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgICAgIFtjbGFzc05hbWVdOiB0cnVlLFxuICAgICAgICAgICAgW2Ake2NsYXNzTmFtZX1fZ3Vlc3RgXTogaXNHdWVzdCxcbiAgICAgICAgICAgIFtgJHtjbGFzc05hbWV9X2xvZ2dlZEluYF06ICEhY2xpZW50LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gPGRpdiBjbGFzc05hbWU9e2Ake2NsYXNzTmFtZX1fYm9keWB9XG4gICAgICAgICAgICBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IHRoaXMuc3RhdGUucGFnZSB9fVxuICAgICAgICA+XG4gICAgICAgIDwvZGl2PjtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5zY3JvbGxiYXIpIHtcbiAgICAgICAgICAgIHJldHVybiA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvQXV0b0hpZGVTY3JvbGxiYXI+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==