"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Tab = void 0;

var React = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../languageHandler");

var sdk = _interopRequireWildcard(require("../../index"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

/*
Copyright 2017 Travis Ralston
Copyright 2019 New Vector Ltd
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

/**
 * Represents a tab for the TabbedView.
 */
class Tab {
  /**
   * Creates a new tab.
   * @param {string} id The tab's ID.
   * @param {string} label The untranslated tab label.
   * @param {string} icon The class for the tab icon. This should be a simple mask.
   * @param {React.ReactNode} body The JSX for the tab container.
   */
  constructor(id
  /*: string*/
  , label
  /*: string*/
  , icon
  /*: string*/
  , body
  /*: React.ReactNode*/
  ) {
    this.id
    /*:: */
    = id
    /*:: */
    ;
    this.label
    /*:: */
    = label
    /*:: */
    ;
    this.icon
    /*:: */
    = icon
    /*:: */
    ;
    this.body
    /*:: */
    = body
    /*:: */
    ;
  }

}

exports.Tab = Tab;

class TabbedView extends React.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    let activeTabIndex = 0;

    if (props.initialTabId) {
      const tabIndex = props.tabs.findIndex(t => t.id === props.initialTabId);
      if (tabIndex >= 0) activeTabIndex = tabIndex;
    }

    this.state = {
      activeTabIndex
    };
  }

  _getActiveTabIndex() {
    if (!this.state || !this.state.activeTabIndex) return 0;
    return this.state.activeTabIndex;
  }
  /**
   * Shows the given tab
   * @param {Tab} tab the tab to show
   * @private
   */


  _setActiveTab(tab
  /*: Tab*/
  ) {
    const idx = this.props.tabs.indexOf(tab);

    if (idx !== -1) {
      this.setState({
        activeTabIndex: idx
      });
    } else {
      console.error("Could not find tab " + tab.label + " in tabs");
    }
  }

  _renderTabLabel(tab
  /*: Tab*/
  ) {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let classes = "mx_TabbedView_tabLabel ";
    const idx = this.props.tabs.indexOf(tab);
    if (idx === this._getActiveTabIndex()) classes += "mx_TabbedView_tabLabel_active";
    let tabIcon = null;

    if (tab.icon) {
      tabIcon = /*#__PURE__*/React.createElement("span", {
        className: `mx_TabbedView_maskedIcon ${tab.icon}`
      });
    }

    const onClickHandler = () => this._setActiveTab(tab);

    const label = (0, _languageHandler._t)(tab.label);
    return /*#__PURE__*/React.createElement(AccessibleButton, {
      className: classes,
      key: "tab_label_" + tab.label,
      onClick: onClickHandler
    }, tabIcon, /*#__PURE__*/React.createElement("span", {
      className: "mx_TabbedView_tabLabel_text"
    }, label));
  }

  _renderTabPanel(tab
  /*: Tab*/
  )
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView_tabPanel",
      key: "mx_tabpanel_" + tab.label
    }, /*#__PURE__*/React.createElement(_AutoHideScrollbar.default, {
      className: "mx_TabbedView_tabPanelContent"
    }, tab.body));
  }

  render()
  /*: React.ReactNode*/
  {
    const labels = this.props.tabs.map(tab => this._renderTabLabel(tab));

    const panel = this._renderTabPanel(this.props.tabs[this._getActiveTabIndex()]);

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView_tabLabels"
    }, labels), panel);
  }

}

exports.default = TabbedView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVGFiYmVkVmlldy50c3giXSwibmFtZXMiOlsiVGFiIiwiY29uc3RydWN0b3IiLCJpZCIsImxhYmVsIiwiaWNvbiIsImJvZHkiLCJUYWJiZWRWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wcyIsImFjdGl2ZVRhYkluZGV4IiwiaW5pdGlhbFRhYklkIiwidGFiSW5kZXgiLCJ0YWJzIiwiZmluZEluZGV4IiwidCIsInN0YXRlIiwiX2dldEFjdGl2ZVRhYkluZGV4IiwiX3NldEFjdGl2ZVRhYiIsInRhYiIsImlkeCIsImluZGV4T2YiLCJzZXRTdGF0ZSIsImNvbnNvbGUiLCJlcnJvciIsIl9yZW5kZXJUYWJMYWJlbCIsIkFjY2Vzc2libGVCdXR0b24iLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjbGFzc2VzIiwidGFiSWNvbiIsIm9uQ2xpY2tIYW5kbGVyIiwiX3JlbmRlclRhYlBhbmVsIiwicmVuZGVyIiwibGFiZWxzIiwibWFwIiwicGFuZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQU9BO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLEdBQU4sQ0FBVTtBQUNiO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0lDLEVBQUFBLFdBQVcsQ0FBUUM7QUFBUjtBQUFBLElBQTJCQztBQUEzQjtBQUFBLElBQWlEQztBQUFqRDtBQUFBLElBQXNFQztBQUF0RTtBQUFBLElBQTZGO0FBQUEsU0FBckZIO0FBQXFGO0FBQUEsTUFBckZBO0FBQXFGO0FBQUE7QUFBQSxTQUFsRUM7QUFBa0U7QUFBQSxNQUFsRUE7QUFBa0U7QUFBQTtBQUFBLFNBQTVDQztBQUE0QztBQUFBLE1BQTVDQTtBQUE0QztB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QUM7QUFBN0IsT0FDS2dCLEdBQUcsQ0FBQ2QsSUFEVCxDQURKLENBREo7QUFPSDs7QUFFTTRCLEVBQUFBLE1BQVA7QUFBQTtBQUFpQztBQUM3QixVQUFNQyxNQUFNLEdBQUcsS0FBS3pCLEtBQUwsQ0FBV0ksSUFBWCxDQUFnQnNCLEdBQWhCLENBQW9CaEIsR0FBRyxJQUFJLEtBQUtNLGVBQUwsQ0FBcUJOLEdBQXJCLENBQTNCLENBQWY7O0FBQ0EsVUFBTWlCLEtBQUssR0FBRyxLQUFLSixlQUFMLENBQXFCLEtBQUt2QixLQUFMLENBQVdJLElBQVgsQ0FBZ0IsS0FBS0ksa0JBQUwsRUFBaEIsQ0FBckIsQ0FBZDs7QUFFQSx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tpQixNQURMLENBREosRUFJS0UsS0FKTCxDQURKO0FBUUg7O0FBbEZtRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge190fSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi9pbmRleFwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gJy4vQXV0b0hpZGVTY3JvbGxiYXInO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0YWIgZm9yIHRoZSBUYWJiZWRWaWV3LlxuICovXG5leHBvcnQgY2xhc3MgVGFiIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHRhYi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgVGhlIHRhYidzIElELlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbCBUaGUgdW50cmFuc2xhdGVkIHRhYiBsYWJlbC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWNvbiBUaGUgY2xhc3MgZm9yIHRoZSB0YWIgaWNvbi4gVGhpcyBzaG91bGQgYmUgYSBzaW1wbGUgbWFzay5cbiAgICAgKiBAcGFyYW0ge1JlYWN0LlJlYWN0Tm9kZX0gYm9keSBUaGUgSlNYIGZvciB0aGUgdGFiIGNvbnRhaW5lci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGxhYmVsOiBzdHJpbmcsIHB1YmxpYyBpY29uOiBzdHJpbmcsIHB1YmxpYyBib2R5OiBSZWFjdC5SZWFjdE5vZGUpIHtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHRhYnM6IFRhYltdO1xuICAgIGluaXRpYWxUYWJJZD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgYWN0aXZlVGFiSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFiYmVkVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGxldCBhY3RpdmVUYWJJbmRleCA9IDA7XG4gICAgICAgIGlmIChwcm9wcy5pbml0aWFsVGFiSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRhYkluZGV4ID0gcHJvcHMudGFicy5maW5kSW5kZXgodCA9PiB0LmlkID09PSBwcm9wcy5pbml0aWFsVGFiSWQpO1xuICAgICAgICAgICAgaWYgKHRhYkluZGV4ID49IDApIGFjdGl2ZVRhYkluZGV4ID0gdGFiSW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgYWN0aXZlVGFiSW5kZXgsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0QWN0aXZlVGFiSW5kZXgoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZSB8fCAhdGhpcy5zdGF0ZS5hY3RpdmVUYWJJbmRleCkgcmV0dXJuIDA7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmFjdGl2ZVRhYkluZGV4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIHRoZSBnaXZlbiB0YWJcbiAgICAgKiBAcGFyYW0ge1RhYn0gdGFiIHRoZSB0YWIgdG8gc2hvd1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2V0QWN0aXZlVGFiKHRhYjogVGFiKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMucHJvcHMudGFicy5pbmRleE9mKHRhYik7XG4gICAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHthY3RpdmVUYWJJbmRleDogaWR4fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ291bGQgbm90IGZpbmQgdGFiIFwiICsgdGFiLmxhYmVsICsgXCIgaW4gdGFic1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3JlbmRlclRhYkxhYmVsKHRhYjogVGFiKSB7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG5cbiAgICAgICAgbGV0IGNsYXNzZXMgPSBcIm14X1RhYmJlZFZpZXdfdGFiTGFiZWwgXCI7XG5cbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5wcm9wcy50YWJzLmluZGV4T2YodGFiKTtcbiAgICAgICAgaWYgKGlkeCA9PT0gdGhpcy5fZ2V0QWN0aXZlVGFiSW5kZXgoKSkgY2xhc3NlcyArPSBcIm14X1RhYmJlZFZpZXdfdGFiTGFiZWxfYWN0aXZlXCI7XG5cbiAgICAgICAgbGV0IHRhYkljb24gPSBudWxsO1xuICAgICAgICBpZiAodGFiLmljb24pIHtcbiAgICAgICAgICAgIHRhYkljb24gPSA8c3BhbiBjbGFzc05hbWU9e2BteF9UYWJiZWRWaWV3X21hc2tlZEljb24gJHt0YWIuaWNvbn1gfSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9uQ2xpY2tIYW5kbGVyID0gKCkgPT4gdGhpcy5fc2V0QWN0aXZlVGFiKHRhYik7XG5cbiAgICAgICAgY29uc3QgbGFiZWwgPSBfdCh0YWIubGFiZWwpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPXtjbGFzc2VzfSBrZXk9e1widGFiX2xhYmVsX1wiICsgdGFiLmxhYmVsfSBvbkNsaWNrPXtvbkNsaWNrSGFuZGxlcn0+XG4gICAgICAgICAgICAgICAge3RhYkljb259XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVGFiYmVkVmlld190YWJMYWJlbF90ZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgbGFiZWwgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZW5kZXJUYWJQYW5lbCh0YWI6IFRhYik6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RhYmJlZFZpZXdfdGFiUGFuZWxcIiBrZXk9e1wibXhfdGFicGFuZWxfXCIgKyB0YWIubGFiZWx9PlxuICAgICAgICAgICAgICAgIDxBdXRvSGlkZVNjcm9sbGJhciBjbGFzc05hbWU9J214X1RhYmJlZFZpZXdfdGFiUGFuZWxDb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAge3RhYi5ib2R5fVxuICAgICAgICAgICAgICAgIDwvQXV0b0hpZGVTY3JvbGxiYXI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IGxhYmVscyA9IHRoaXMucHJvcHMudGFicy5tYXAodGFiID0+IHRoaXMuX3JlbmRlclRhYkxhYmVsKHRhYikpO1xuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMuX3JlbmRlclRhYlBhbmVsKHRoaXMucHJvcHMudGFic1t0aGlzLl9nZXRBY3RpdmVUYWJJbmRleCgpXSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVGFiYmVkVmlld1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVGFiYmVkVmlld190YWJMYWJlbHNcIj5cbiAgICAgICAgICAgICAgICAgICAge2xhYmVsc31cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7cGFuZWx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=