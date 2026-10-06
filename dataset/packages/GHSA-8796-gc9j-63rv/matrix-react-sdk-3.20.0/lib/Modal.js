"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ModalManager = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _classnames = _interopRequireDefault(require("classnames"));

var _Analytics = _interopRequireDefault(require("./Analytics"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _promise = require("./utils/promise");

var _AsyncWrapper = _interopRequireDefault(require("./AsyncWrapper"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const DIALOG_CONTAINER_ID = "mx_Dialog_Container";
const STATIC_DIALOG_CONTAINER_ID = "mx_Dialog_StaticContainer";
/*:: export interface IModal<T extends any[]> {
    elem: React.ReactNode;
    className?: string;
    beforeClosePromise?: Promise<boolean>;
    closeReason?: string;
    onBeforeClose?(reason?: string): Promise<boolean>;
    onFinished(...args: T): void;
    close(...args: T): void;
    hidden?: boolean;
}*/

/*:: export interface IHandle<T extends any[]> {
    finished: Promise<T>;
    close(...args: T): void;
}*/

class ModalManager {
  constructor() {
    (0, _defineProperty2.default)(this, "counter", 0);
    (0, _defineProperty2.default)(this, "priorityModal", null);
    (0, _defineProperty2.default)(this, "staticModal", null);
    (0, _defineProperty2.default)(this, "modals", []);
    (0, _defineProperty2.default)(this, "onBackgroundClick", () => {
      const modal = this.getCurrentModal();

      if (!modal) {
        return;
      } // we want to pass a reason to the onBeforeClose
      // callback, but close is currently defined to
      // pass all number of arguments to the onFinished callback
      // so, pass the reason to close through a member variable


      modal.closeReason = "backgroundClick";
      modal.close();
      modal.closeReason = null;
    });
  }

  static getOrCreateContainer() {
    let container = document.getElementById(DIALOG_CONTAINER_ID);

    if (!container) {
      container = document.createElement("div");
      container.id = DIALOG_CONTAINER_ID;
      document.body.appendChild(container);
    }

    return container;
  }

  static getOrCreateStaticContainer() {
    let container = document.getElementById(STATIC_DIALOG_CONTAINER_ID);

    if (!container) {
      container = document.createElement("div");
      container.id = STATIC_DIALOG_CONTAINER_ID;
      document.body.appendChild(container);
    }

    return container;
  }

  toggleCurrentDialogVisibility() {
    const modal = this.getCurrentModal();
    if (!modal) return;
    modal.hidden = !modal.hidden;
  }

  hasDialogs() {
    return this.priorityModal || this.staticModal || this.modals.length > 0;
  }

  createTrackedDialog(analyticsAction
  /*: string*/
  , analyticsInfo
  /*: string*/
  , ...rest) {
    _Analytics.default.trackEvent('Modal', analyticsAction, analyticsInfo);

    return this.createDialog(...rest);
  }

  appendTrackedDialog(analyticsAction
  /*: string*/
  , analyticsInfo
  /*: string*/
  , ...rest) {
    _Analytics.default.trackEvent('Modal', analyticsAction, analyticsInfo);

    return this.appendDialog(...rest);
  }

  createDialog(Element
  /*: React.ComponentType*/
  , ...rest) {
    return this.createDialogAsync(Promise.resolve(Element), ...rest);
  }

  appendDialog(Element
  /*: React.ComponentType*/
  , ...rest) {
    return this.appendDialogAsync(Promise.resolve(Element), ...rest);
  }

  createTrackedDialogAsync(analyticsAction
  /*: string*/
  , analyticsInfo
  /*: string*/
  , ...rest) {
    _Analytics.default.trackEvent('Modal', analyticsAction, analyticsInfo);

    return this.createDialogAsync(...rest);
  }

  appendTrackedDialogAsync(analyticsAction
  /*: string*/
  , analyticsInfo
  /*: string*/
  , ...rest) {
    _Analytics.default.trackEvent('Modal', analyticsAction, analyticsInfo);

    return this.appendDialogAsync(...rest);
  }

  closeCurrentModal(reason
  /*: string*/
  ) {
    const modal = this.getCurrentModal();

    if (!modal) {
      return;
    }

    modal.closeReason = reason;
    modal.close();
  }

  buildModal(prom
  /*: Promise<React.ComponentType>*/
  , props
  /*: IProps<T>*/
  , className
  /*: string*/
  , options
  /*: IOptions<T>*/
  ) {
    const modal
    /*: IModal<T>*/
    = {
      onFinished: props ? props.onFinished : null,
      onBeforeClose: options.onBeforeClose,
      beforeClosePromise: null,
      closeReason: null,
      className,
      // these will be set below but we need an object reference to pass to getCloseFn before we can do that
      elem: null,
      close: null
    }; // never call this from onFinished() otherwise it will loop

    const [closeDialog, onFinishedProm] = this.getCloseFn(modal, props); // don't attempt to reuse the same AsyncWrapper for different dialogs,
    // otherwise we'll get confused.

    const modalCount = this.counter++; // FIXME: If a dialog uses getDefaultProps it clobbers the onFinished
    // property set here so you can't close the dialog from a button click!

    modal.elem = /*#__PURE__*/_react.default.createElement(_AsyncWrapper.default, (0, _extends2.default)({
      key: modalCount,
      prom: prom
    }, props, {
      onFinished: closeDialog
    }));
    modal.close = closeDialog;
    return {
      modal,
      closeDialog,
      onFinishedProm
    };
  }

  getCloseFn(modal
  /*: IModal<T>*/
  , props
  /*: IProps<T>*/
  )
  /*: [IHandle<T>["close"], IHandle<T>["finished"]]*/
  {
    const deferred = (0, _promise.defer)();
    return [async (...args) => {
      if (modal.beforeClosePromise) {
        await modal.beforeClosePromise;
      } else if (modal.onBeforeClose) {
        modal.beforeClosePromise = modal.onBeforeClose(modal.closeReason);
        const shouldClose = await modal.beforeClosePromise;
        modal.beforeClosePromise = null;

        if (!shouldClose) {
          return;
        }
      }

      deferred.resolve(args);
      if (props && props.onFinished) props.onFinished.apply(null, args);
      const i = this.modals.indexOf(modal);

      if (i >= 0) {
        this.modals.splice(i, 1);
      }

      if (this.priorityModal === modal) {
        this.priorityModal = null; // XXX: This is destructive

        this.modals = [];
      }

      if (this.staticModal === modal) {
        this.staticModal = null; // XXX: This is destructive

        this.modals = [];
      }

      this.reRender();
    }, deferred.promise];
  }
  /**
   * @callback onBeforeClose
   * @param {string?} reason either "backgroundClick" or null
   * @return {Promise<bool>} whether the dialog should close
   */

  /**
   * Open a modal view.
   *
   * This can be used to display a react component which is loaded as an asynchronous
   * webpack component. To do this, set 'loader' as:
   *
   *   (cb) => {
   *       require(['<module>'], cb);
   *   }
   *
   * @param {Promise} prom   a promise which resolves with a React component
   *   which will be displayed as the modal view.
   *
   * @param {Object} props   properties to pass to the displayed
   *    component. (We will also pass an 'onFinished' property.)
   *
   * @param {String} className   CSS class to apply to the modal wrapper
   *
   * @param {boolean} isPriorityModal if true, this modal will be displayed regardless
   *                                  of other modals that are currently in the stack.
   *                                  Also, when closed, all modals will be removed
   *                                  from the stack.
   * @param {boolean} isStaticModal  if true, this modal will be displayed under other
   *                                 modals in the stack. When closed, all modals will
   *                                 also be removed from the stack. This is not compatible
   *                                 with being a priority modal. Only one modal can be
   *                                 static at a time.
   * @param {Object} options? extra options for the dialog
   * @param {onBeforeClose} options.onBeforeClose a callback to decide whether to close the dialog
   * @returns {object} Object with 'close' parameter being a function that will close the dialog
   */


  createDialogAsync(prom
  /*: Promise<React.ComponentType>*/
  , props
  /*: IProps<T>*/
  , className
  /*: string*/
  , isPriorityModal = false, isStaticModal = false, options
  /*: IOptions<T>*/
  = {})
  /*: IHandle<T>*/
  {
    const {
      modal,
      closeDialog,
      onFinishedProm
    } = this.buildModal(prom, props, className, options);

    if (isPriorityModal) {
      // XXX: This is destructive
      this.priorityModal = modal;
    } else if (isStaticModal) {
      // This is intentionally destructive
      this.staticModal = modal;
    } else {
      this.modals.unshift(modal);
    }

    this.reRender();
    return {
      close: closeDialog,
      finished: onFinishedProm
    };
  }

  appendDialogAsync(prom
  /*: Promise<React.ComponentType>*/
  , props
  /*: IProps<T>*/
  , className
  /*: string*/
  )
  /*: IHandle<T>*/
  {
    const {
      modal,
      closeDialog,
      onFinishedProm
    } = this.buildModal(prom, props, className, {});
    this.modals.push(modal);
    this.reRender();
    return {
      close: closeDialog,
      finished: onFinishedProm
    };
  }

  getCurrentModal()
  /*: IModal<any>*/
  {
    return this.priorityModal ? this.priorityModal : this.modals[0] || this.staticModal;
  }

  reRender() {
    if (this.modals.length === 0 && !this.priorityModal && !this.staticModal) {
      // If there is no modal to render, make all of Element available
      // to screen reader users again
      _dispatcher.default.dispatch({
        action: 'aria_unhide_main_app'
      });

      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateContainer());

      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateStaticContainer());

      return;
    } // Hide the content outside the modal to screen reader users
    // so they won't be able to navigate into it and act on it using
    // screen reader specific features


    _dispatcher.default.dispatch({
      action: 'aria_hide_main_app'
    });

    if (this.staticModal) {
      const classes = (0, _classnames.default)("mx_Dialog_wrapper mx_Dialog_staticWrapper", this.staticModal.className);

      const staticDialog = /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog"
      }, this.staticModal.elem), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_background mx_Dialog_staticBackground",
        onClick: this.onBackgroundClick
      }));

      _reactDom.default.render(staticDialog, ModalManager.getOrCreateStaticContainer());
    } else {
      // This is safe to call repeatedly if we happen to do that
      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateStaticContainer());
    }

    const modal = this.getCurrentModal();

    if (modal !== this.staticModal && !modal.hidden) {
      const classes = (0, _classnames.default)("mx_Dialog_wrapper", modal.className, {
        mx_Dialog_wrapperWithStaticUnder: this.staticModal
      });

      const dialog = /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog"
      }, modal.elem), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_background",
        onClick: this.onBackgroundClick
      }));

      _reactDom.default.render(dialog, ModalManager.getOrCreateContainer());
    } else {
      // This is safe to call repeatedly if we happen to do that
      _reactDom.default.unmountComponentAtNode(ModalManager.getOrCreateContainer());
    }
  }

}

exports.ModalManager = ModalManager;

if (!window.singletonModalManager) {
  window.singletonModalManager = new ModalManager();
}

var _default = window.singletonModalManager;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Nb2RhbC50c3giXSwibmFtZXMiOlsiRElBTE9HX0NPTlRBSU5FUl9JRCIsIlNUQVRJQ19ESUFMT0dfQ09OVEFJTkVSX0lEIiwiTW9kYWxNYW5hZ2VyIiwibW9kYWwiLCJnZXRDdXJyZW50TW9kYWwiLCJjbG9zZVJlYXNvbiIsImNsb3NlIiwiZ2V0T3JDcmVhdGVDb250YWluZXIiLCJjb250YWluZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsImlkIiwiYm9keSIsImFwcGVuZENoaWxkIiwiZ2V0T3JDcmVhdGVTdGF0aWNDb250YWluZXIiLCJ0b2dnbGVDdXJyZW50RGlhbG9nVmlzaWJpbGl0eSIsImhpZGRlbiIsImhhc0RpYWxvZ3MiLCJwcmlvcml0eU1vZGFsIiwic3RhdGljTW9kYWwiLCJtb2RhbHMiLCJsZW5ndGgiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiYW5hbHl0aWNzQWN0aW9uIiwiYW5hbHl0aWNzSW5mbyIsInJlc3QiLCJBbmFseXRpY3MiLCJ0cmFja0V2ZW50IiwiY3JlYXRlRGlhbG9nIiwiYXBwZW5kVHJhY2tlZERpYWxvZyIsImFwcGVuZERpYWxvZyIsIkVsZW1lbnQiLCJjcmVhdGVEaWFsb2dBc3luYyIsIlByb21pc2UiLCJyZXNvbHZlIiwiYXBwZW5kRGlhbG9nQXN5bmMiLCJjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMiLCJhcHBlbmRUcmFja2VkRGlhbG9nQXN5bmMiLCJjbG9zZUN1cnJlbnRNb2RhbCIsInJlYXNvbiIsImJ1aWxkTW9kYWwiLCJwcm9tIiwicHJvcHMiLCJjbGFzc05hbWUiLCJvcHRpb25zIiwib25GaW5pc2hlZCIsIm9uQmVmb3JlQ2xvc2UiLCJiZWZvcmVDbG9zZVByb21pc2UiLCJlbGVtIiwiY2xvc2VEaWFsb2ciLCJvbkZpbmlzaGVkUHJvbSIsImdldENsb3NlRm4iLCJtb2RhbENvdW50IiwiY291bnRlciIsImRlZmVycmVkIiwiYXJncyIsInNob3VsZENsb3NlIiwiYXBwbHkiLCJpIiwiaW5kZXhPZiIsInNwbGljZSIsInJlUmVuZGVyIiwicHJvbWlzZSIsImlzUHJpb3JpdHlNb2RhbCIsImlzU3RhdGljTW9kYWwiLCJ1bnNoaWZ0IiwiZmluaXNoZWQiLCJwdXNoIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJSZWFjdERPTSIsInVubW91bnRDb21wb25lbnRBdE5vZGUiLCJjbGFzc2VzIiwic3RhdGljRGlhbG9nIiwib25CYWNrZ3JvdW5kQ2xpY2siLCJyZW5kZXIiLCJteF9EaWFsb2dfd3JhcHBlcldpdGhTdGF0aWNVbmRlciIsImRpYWxvZyIsIndpbmRvdyIsInNpbmdsZXRvbk1vZGFsTWFuYWdlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZQSxNQUFNQSxtQkFBbUIsR0FBRyxxQkFBNUI7QUFDQSxNQUFNQywwQkFBMEIsR0FBRywyQkFBbkM7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBUkE7QUFDQTtBQUNBOztBQXdETyxNQUFNQyxZQUFOLENBQW1CO0FBQUE7QUFBQSxtREFDSixDQURJO0FBQUEseURBS2UsSUFMZjtBQUFBLHVEQVNhLElBVGI7QUFBQSxrREFZVSxFQVpWO0FBQUEsNkRBbVFNLE1BQU07QUFDOUIsWUFBTUMsS0FBSyxHQUFHLEtBQUtDLGVBQUwsRUFBZDs7QUFDQSxVQUFJLENBQUNELEtBQUwsRUFBWTtBQUNSO0FBQ0gsT0FKNkIsQ0FLOUI7QUFDQTtBQUNBO0FBQ0E7OztBQUNBQSxNQUFBQSxLQUFLLENBQUNFLFdBQU4sR0FBb0IsaUJBQXBCO0FBQ0FGLE1BQUFBLEtBQUssQ0FBQ0csS0FBTjtBQUNBSCxNQUFBQSxLQUFLLENBQUNFLFdBQU4sR0FBb0Is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QUFDOEMsSUFEWCxDQURKLGVBSUk7QUFBSyxRQUFBLFNBQVMsRUFBQyxzQkFBZjtBQUFzQyxRQUFBLE9BQU8sRUFBRSxLQUFLMkI7QUFBcEQsUUFKSixDQURKOztBQVNBSix3QkFBU0ssTUFBVCxDQUFnQkUsTUFBaEIsRUFBd0I3RSxZQUFZLENBQUNLLG9CQUFiLEVBQXhCO0FBQ0gsS0FmRCxNQWVPO0FBQ0g7QUFDQWlFLHdCQUFTQyxzQkFBVCxDQUFnQ3ZFLFlBQVksQ0FBQ0ssb0JBQWIsRUFBaEM7QUFDSDtBQUNKOztBQTlVcUI7Ozs7QUFpVjFCLElBQUksQ0FBQ3lFLE1BQU0sQ0FBQ0MscUJBQVosRUFBbUM7QUFDL0JELEVBQUFBLE1BQU0sQ0FBQ0MscUJBQVAsR0FBK0IsSUFBSS9FLFlBQUosRUFBL0I7QUFDSDs7ZUFDYzhFLE1BQU0sQ0FBQ0MscUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuL0FuYWx5dGljcyc7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7ZGVmZXJ9IGZyb20gJy4vdXRpbHMvcHJvbWlzZSc7XG5pbXBvcnQgQXN5bmNXcmFwcGVyIGZyb20gJy4vQXN5bmNXcmFwcGVyJztcblxuY29uc3QgRElBTE9HX0NPTlRBSU5FUl9JRCA9IFwibXhfRGlhbG9nX0NvbnRhaW5lclwiO1xuY29uc3QgU1RBVElDX0RJQUxPR19DT05UQUlORVJfSUQgPSBcIm14X0RpYWxvZ19TdGF0aWNDb250YWluZXJcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJTW9kYWw8VCBleHRlbmRzIGFueVtdPiB7XG4gICAgZWxlbTogUmVhY3QuUmVhY3ROb2RlO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBiZWZvcmVDbG9zZVByb21pc2U/OiBQcm9taXNlPGJvb2xlYW4+O1xuICAgIGNsb3NlUmVhc29uPzogc3RyaW5nO1xuICAgIG9uQmVmb3JlQ2xvc2U/KHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj47XG4gICAgb25GaW5pc2hlZCguLi5hcmdzOiBUKTogdm9pZDtcbiAgICBjbG9zZSguLi5hcmdzOiBUKTogdm9pZDtcbiAgICBoaWRkZW4/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElIYW5kbGU8VCBleHRlbmRzIGFueVtdPiB7XG4gICAgZmluaXNoZWQ6IFByb21pc2U8VD47XG4gICAgY2xvc2UoLi4uYXJnczogVCk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJUHJvcHM8VCBleHRlbmRzIGFueVtdPiB7XG4gICAgb25GaW5pc2hlZD8oLi4uYXJnczogVCk6IHZvaWQ7XG4gICAgLy8gVE9ETyBpbXByb3ZlIHR5cGluZyBoZXJlIG9uY2UgYWxsIE1vZGFscyBhcmUgVFMgYW5kIHdlIGNhbiBleGhhdXN0aXZlbHkgY2hlY2sgdGhlIHByb3BzXG4gICAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5pbnRlcmZhY2UgSU9wdGlvbnM8VCBleHRlbmRzIGFueVtdPiB7XG4gICAgb25CZWZvcmVDbG9zZT86IElNb2RhbDxUPltcIm9uQmVmb3JlQ2xvc2VcIl07XG59XG5cbnR5cGUgUGFyYW1ldGVyc1dpdGhvdXRGaXJzdDxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueSkgPT4gYW55PiA9IFQgZXh0ZW5kcyAoYTogYW55LCAuLi5hcmdzOiBpbmZlciBQKSA9PiBhbnkgPyBQIDogbmV2ZXI7XG5cbmV4cG9ydCBjbGFzcyBNb2RhbE1hbmFnZXIge1xuICAgIHByaXZhdGUgY291bnRlciA9IDA7XG4gICAgLy8gVGhlIG1vZGFsIHRvIHByaW9yaXRpc2Ugb3ZlciBhbGwgb3RoZXJzLiBJZiB0aGlzIGlzIHNldCwgb25seSBzaG93XG4gICAgLy8gdGhpcyBtb2RhbC4gUmVtb3ZlIGFsbCBvdGhlciBtb2RhbHMgZnJvbSB0aGUgc3RhY2sgd2hlbiB0aGlzIG1vZGFsXG4gICAgLy8gaXMgY2xvc2VkLlxuICAgIHByaXZhdGUgcHJpb3JpdHlNb2RhbDogSU1vZGFsPGFueT4gPSBudWxsO1xuICAgIC8vIFRoZSBtb2RhbCB0byBrZWVwIG9wZW4gdW5kZXJuZWF0aCBvdGhlciBtb2RhbHMgaWYgcG9zc2libGUuIFVzZWZ1bFxuICAgIC8vIGZvciBjYXNlcyBsaWtlIFNldHRpbmdzIHdoZXJlIHRoZSBtb2RhbCBzaG91bGQgcmVtYWluIG9wZW4gd2hpbGUgdGhlXG4gICAgLy8gdXNlciBpcyBwcm9tcHRlZCBmb3IgbW9yZSBpbmZvcm1hdGlvbi9lcnJvcnMuXG4gICAgcHJpdmF0ZSBzdGF0aWNNb2RhbDogSU1vZGFsPGFueT4gPSBudWxsO1xuICAgIC8vIEEgbGlzdCBvZiB0aGUgbW9kYWxzIHdlIGhhdmUgc3RhY2tlZCB1cCwgd2l0aCB0aGUgbW9zdCByZWNlbnQgYXQgWzBdXG4gICAgLy8gTmVpdGhlciB0aGUgc3RhdGljIG5vciBwcmlvcml0eSBtb2RhbCB3aWxsIGJlIGluIHRoaXMgbGlzdC5cbiAgICBwcml2YXRlIG1vZGFsczogSU1vZGFsPGFueT5bXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0T3JDcmVhdGVDb250YWluZXIoKSB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChESUFMT0dfQ09OVEFJTkVSX0lEKTtcblxuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5pZCA9IERJQUxPR19DT05UQUlORVJfSUQ7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldE9yQ3JlYXRlU3RhdGljQ29udGFpbmVyKCkge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU1RBVElDX0RJQUxPR19DT05UQUlORVJfSUQpO1xuXG4gICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgY29udGFpbmVyLmlkID0gU1RBVElDX0RJQUxPR19DT05UQUlORVJfSUQ7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b2dnbGVDdXJyZW50RGlhbG9nVmlzaWJpbGl0eSgpIHtcbiAgICAgICAgY29uc3QgbW9kYWwgPSB0aGlzLmdldEN1cnJlbnRNb2RhbCgpO1xuICAgICAgICBpZiAoIW1vZGFsKSByZXR1cm47XG4gICAgICAgIG1vZGFsLmhpZGRlbiA9ICFtb2RhbC5oaWRkZW47XG4gICAgfVxuXG4gICAgcHVibGljIGhhc0RpYWxvZ3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaW9yaXR5TW9kYWwgfHwgdGhpcy5zdGF0aWNNb2RhbCB8fCB0aGlzLm1vZGFscy5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVUcmFja2VkRGlhbG9nPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIGFuYWx5dGljc0FjdGlvbjogc3RyaW5nLFxuICAgICAgICBhbmFseXRpY3NJbmZvOiBzdHJpbmcsXG4gICAgICAgIC4uLnJlc3Q6IFBhcmFtZXRlcnM8TW9kYWxNYW5hZ2VyW1wiY3JlYXRlRGlhbG9nXCJdPlxuICAgICkge1xuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnTW9kYWwnLCBhbmFseXRpY3NBY3Rpb24sIGFuYWx5dGljc0luZm8pO1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVEaWFsb2c8VD4oLi4ucmVzdCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZFRyYWNrZWREaWFsb2c8VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgYW5hbHl0aWNzQWN0aW9uOiBzdHJpbmcsXG4gICAgICAgIGFuYWx5dGljc0luZm86IHN0cmluZyxcbiAgICAgICAgLi4ucmVzdDogUGFyYW1ldGVyczxNb2RhbE1hbmFnZXJbXCJhcHBlbmREaWFsb2dcIl0+XG4gICAgKSB7XG4gICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCdNb2RhbCcsIGFuYWx5dGljc0FjdGlvbiwgYW5hbHl0aWNzSW5mbyk7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcGVuZERpYWxvZzxUPiguLi5yZXN0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlRGlhbG9nPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIEVsZW1lbnQ6IFJlYWN0LkNvbXBvbmVudFR5cGUsXG4gICAgICAgIC4uLnJlc3Q6IFBhcmFtZXRlcnNXaXRob3V0Rmlyc3Q8TW9kYWxNYW5hZ2VyW1wiY3JlYXRlRGlhbG9nQXN5bmNcIl0+XG4gICAgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZURpYWxvZ0FzeW5jPFQ+KFByb21pc2UucmVzb2x2ZShFbGVtZW50KSwgLi4ucmVzdCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZERpYWxvZzxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBFbGVtZW50OiBSZWFjdC5Db21wb25lbnRUeXBlLFxuICAgICAgICAuLi5yZXN0OiBQYXJhbWV0ZXJzV2l0aG91dEZpcnN0PE1vZGFsTWFuYWdlcltcImFwcGVuZERpYWxvZ0FzeW5jXCJdPlxuICAgICkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBlbmREaWFsb2dBc3luYzxUPihQcm9taXNlLnJlc29sdmUoRWxlbWVudCksIC4uLnJlc3QpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmM8VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgYW5hbHl0aWNzQWN0aW9uOiBzdHJpbmcsXG4gICAgICAgIGFuYWx5dGljc0luZm86IHN0cmluZyxcbiAgICAgICAgLi4ucmVzdDogUGFyYW1ldGVyczxNb2RhbE1hbmFnZXJbXCJjcmVhdGVEaWFsb2dBc3luY1wiXT5cbiAgICApIHtcbiAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ01vZGFsJywgYW5hbHl0aWNzQWN0aW9uLCBhbmFseXRpY3NJbmZvKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlRGlhbG9nQXN5bmM8VD4oLi4ucmVzdCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZFRyYWNrZWREaWFsb2dBc3luYzxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBhbmFseXRpY3NBY3Rpb246IHN0cmluZyxcbiAgICAgICAgYW5hbHl0aWNzSW5mbzogc3RyaW5nLFxuICAgICAgICAuLi5yZXN0OiBQYXJhbWV0ZXJzPE1vZGFsTWFuYWdlcltcImFwcGVuZERpYWxvZ0FzeW5jXCJdPlxuICAgICkge1xuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnTW9kYWwnLCBhbmFseXRpY3NBY3Rpb24sIGFuYWx5dGljc0luZm8pO1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBlbmREaWFsb2dBc3luYzxUPiguLi5yZXN0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xvc2VDdXJyZW50TW9kYWwocmVhc29uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbW9kYWwgPSB0aGlzLmdldEN1cnJlbnRNb2RhbCgpO1xuICAgICAgICBpZiAoIW1vZGFsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbW9kYWwuY2xvc2VSZWFzb24gPSByZWFzb247XG4gICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBidWlsZE1vZGFsPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIHByb206IFByb21pc2U8UmVhY3QuQ29tcG9uZW50VHlwZT4sXG4gICAgICAgIHByb3BzPzogSVByb3BzPFQ+LFxuICAgICAgICBjbGFzc05hbWU/OiBzdHJpbmcsXG4gICAgICAgIG9wdGlvbnM/OiBJT3B0aW9uczxUPixcbiAgICApIHtcbiAgICAgICAgY29uc3QgbW9kYWw6IElNb2RhbDxUPiA9IHtcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IHByb3BzID8gcHJvcHMub25GaW5pc2hlZCA6IG51bGwsXG4gICAgICAgICAgICBvbkJlZm9yZUNsb3NlOiBvcHRpb25zLm9uQmVmb3JlQ2xvc2UsXG4gICAgICAgICAgICBiZWZvcmVDbG9zZVByb21pc2U6IG51bGwsXG4gICAgICAgICAgICBjbG9zZVJlYXNvbjogbnVsbCxcbiAgICAgICAgICAgIGNsYXNzTmFtZSxcblxuICAgICAgICAgICAgLy8gdGhlc2Ugd2lsbCBiZSBzZXQgYmVsb3cgYnV0IHdlIG5lZWQgYW4gb2JqZWN0IHJlZmVyZW5jZSB0byBwYXNzIHRvIGdldENsb3NlRm4gYmVmb3JlIHdlIGNhbiBkbyB0aGF0XG4gICAgICAgICAgICBlbGVtOiBudWxsLFxuICAgICAgICAgICAgY2xvc2U6IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gbmV2ZXIgY2FsbCB0aGlzIGZyb20gb25GaW5pc2hlZCgpIG90aGVyd2lzZSBpdCB3aWxsIGxvb3BcbiAgICAgICAgY29uc3QgW2Nsb3NlRGlhbG9nLCBvbkZpbmlzaGVkUHJvbV0gPSB0aGlzLmdldENsb3NlRm48VD4obW9kYWwsIHByb3BzKTtcblxuICAgICAgICAvLyBkb24ndCBhdHRlbXB0IHRvIHJldXNlIHRoZSBzYW1lIEFzeW5jV3JhcHBlciBmb3IgZGlmZmVyZW50IGRpYWxvZ3MsXG4gICAgICAgIC8vIG90aGVyd2lzZSB3ZSdsbCBnZXQgY29uZnVzZWQuXG4gICAgICAgIGNvbnN0IG1vZGFsQ291bnQgPSB0aGlzLmNvdW50ZXIrKztcblxuICAgICAgICAvLyBGSVhNRTogSWYgYSBkaWFsb2cgdXNlcyBnZXREZWZhdWx0UHJvcHMgaXQgY2xvYmJlcnMgdGhlIG9uRmluaXNoZWRcbiAgICAgICAgLy8gcHJvcGVydHkgc2V0IGhlcmUgc28geW91IGNhbid0IGNsb3NlIHRoZSBkaWFsb2cgZnJvbSBhIGJ1dHRvbiBjbGljayFcbiAgICAgICAgbW9kYWwuZWxlbSA9IDxBc3luY1dyYXBwZXIga2V5PXttb2RhbENvdW50fSBwcm9tPXtwcm9tfSB7Li4ucHJvcHN9IG9uRmluaXNoZWQ9e2Nsb3NlRGlhbG9nfSAvPjtcbiAgICAgICAgbW9kYWwuY2xvc2UgPSBjbG9zZURpYWxvZztcblxuICAgICAgICByZXR1cm4ge21vZGFsLCBjbG9zZURpYWxvZywgb25GaW5pc2hlZFByb219O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2xvc2VGbjxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBtb2RhbDogSU1vZGFsPFQ+LFxuICAgICAgICBwcm9wczogSVByb3BzPFQ+LFxuICAgICk6IFtJSGFuZGxlPFQ+W1wiY2xvc2VcIl0sIElIYW5kbGU8VD5bXCJmaW5pc2hlZFwiXV0ge1xuICAgICAgICBjb25zdCBkZWZlcnJlZCA9IGRlZmVyPFQ+KCk7XG4gICAgICAgIHJldHVybiBbYXN5bmMgKC4uLmFyZ3M6IFQpID0+IHtcbiAgICAgICAgICAgIGlmIChtb2RhbC5iZWZvcmVDbG9zZVByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBtb2RhbC5iZWZvcmVDbG9zZVByb21pc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vZGFsLm9uQmVmb3JlQ2xvc2UpIHtcbiAgICAgICAgICAgICAgICBtb2RhbC5iZWZvcmVDbG9zZVByb21pc2UgPSBtb2RhbC5vbkJlZm9yZUNsb3NlKG1vZGFsLmNsb3NlUmVhc29uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzaG91bGRDbG9zZSA9IGF3YWl0IG1vZGFsLmJlZm9yZUNsb3NlUHJvbWlzZTtcbiAgICAgICAgICAgICAgICBtb2RhbC5iZWZvcmVDbG9zZVByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICghc2hvdWxkQ2xvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYXJncyk7XG4gICAgICAgICAgICBpZiAocHJvcHMgJiYgcHJvcHMub25GaW5pc2hlZCkgcHJvcHMub25GaW5pc2hlZC5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLm1vZGFscy5pbmRleE9mKG1vZGFsKTtcbiAgICAgICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGFscy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByaW9yaXR5TW9kYWwgPT09IG1vZGFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmlvcml0eU1vZGFsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIFhYWDogVGhpcyBpcyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgICAgIHRoaXMubW9kYWxzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRpY01vZGFsID09PSBtb2RhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGljTW9kYWwgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gWFhYOiBUaGlzIGlzIGRlc3RydWN0aXZlXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RhbHMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZVJlbmRlcigpO1xuICAgICAgICB9LCBkZWZlcnJlZC5wcm9taXNlXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAY2FsbGJhY2sgb25CZWZvcmVDbG9zZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nP30gcmVhc29uIGVpdGhlciBcImJhY2tncm91bmRDbGlja1wiIG9yIG51bGxcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2w+fSB3aGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGNsb3NlXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBPcGVuIGEgbW9kYWwgdmlldy5cbiAgICAgKlxuICAgICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gZGlzcGxheSBhIHJlYWN0IGNvbXBvbmVudCB3aGljaCBpcyBsb2FkZWQgYXMgYW4gYXN5bmNocm9ub3VzXG4gICAgICogd2VicGFjayBjb21wb25lbnQuIFRvIGRvIHRoaXMsIHNldCAnbG9hZGVyJyBhczpcbiAgICAgKlxuICAgICAqICAgKGNiKSA9PiB7XG4gICAgICogICAgICAgcmVxdWlyZShbJzxtb2R1bGU+J10sIGNiKTtcbiAgICAgKiAgIH1cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UHJvbWlzZX0gcHJvbSAgIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIGEgUmVhY3QgY29tcG9uZW50XG4gICAgICogICB3aGljaCB3aWxsIGJlIGRpc3BsYXllZCBhcyB0aGUgbW9kYWwgdmlldy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyAgIHByb3BlcnRpZXMgdG8gcGFzcyB0byB0aGUgZGlzcGxheWVkXG4gICAgICogICAgY29tcG9uZW50LiAoV2Ugd2lsbCBhbHNvIHBhc3MgYW4gJ29uRmluaXNoZWQnIHByb3BlcnR5LilcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgICBDU1MgY2xhc3MgdG8gYXBwbHkgdG8gdGhlIG1vZGFsIHdyYXBwZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNQcmlvcml0eU1vZGFsIGlmIHRydWUsIHRoaXMgbW9kYWwgd2lsbCBiZSBkaXNwbGF5ZWQgcmVnYXJkbGVzc1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIG90aGVyIG1vZGFscyB0aGF0IGFyZSBjdXJyZW50bHkgaW4gdGhlIHN0YWNrLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFsc28sIHdoZW4gY2xvc2VkLCBhbGwgbW9kYWxzIHdpbGwgYmUgcmVtb3ZlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gdGhlIHN0YWNrLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNTdGF0aWNNb2RhbCAgaWYgdHJ1ZSwgdGhpcyBtb2RhbCB3aWxsIGJlIGRpc3BsYXllZCB1bmRlciBvdGhlclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxzIGluIHRoZSBzdGFjay4gV2hlbiBjbG9zZWQsIGFsbCBtb2RhbHMgd2lsbFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxzbyBiZSByZW1vdmVkIGZyb20gdGhlIHN0YWNrLiBUaGlzIGlzIG5vdCBjb21wYXRpYmxlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIGJlaW5nIGEgcHJpb3JpdHkgbW9kYWwuIE9ubHkgb25lIG1vZGFsIGNhbiBiZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGljIGF0IGEgdGltZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucz8gZXh0cmEgb3B0aW9ucyBmb3IgdGhlIGRpYWxvZ1xuICAgICAqIEBwYXJhbSB7b25CZWZvcmVDbG9zZX0gb3B0aW9ucy5vbkJlZm9yZUNsb3NlIGEgY2FsbGJhY2sgdG8gZGVjaWRlIHdoZXRoZXIgdG8gY2xvc2UgdGhlIGRpYWxvZ1xuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IE9iamVjdCB3aXRoICdjbG9zZScgcGFyYW1ldGVyIGJlaW5nIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGNsb3NlIHRoZSBkaWFsb2dcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZURpYWxvZ0FzeW5jPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIHByb206IFByb21pc2U8UmVhY3QuQ29tcG9uZW50VHlwZT4sXG4gICAgICAgIHByb3BzPzogSVByb3BzPFQ+LFxuICAgICAgICBjbGFzc05hbWU/OiBzdHJpbmcsXG4gICAgICAgIGlzUHJpb3JpdHlNb2RhbCA9IGZhbHNlLFxuICAgICAgICBpc1N0YXRpY01vZGFsID0gZmFsc2UsXG4gICAgICAgIG9wdGlvbnM6IElPcHRpb25zPFQ+ID0ge30sXG4gICAgKTogSUhhbmRsZTxUPiB7XG4gICAgICAgIGNvbnN0IHttb2RhbCwgY2xvc2VEaWFsb2csIG9uRmluaXNoZWRQcm9tfSA9IHRoaXMuYnVpbGRNb2RhbDxUPihwcm9tLCBwcm9wcywgY2xhc3NOYW1lLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGlzUHJpb3JpdHlNb2RhbCkge1xuICAgICAgICAgICAgLy8gWFhYOiBUaGlzIGlzIGRlc3RydWN0aXZlXG4gICAgICAgICAgICB0aGlzLnByaW9yaXR5TW9kYWwgPSBtb2RhbDtcbiAgICAgICAgfSBlbHNlIGlmIChpc1N0YXRpY01vZGFsKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsbHkgZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgIHRoaXMuc3RhdGljTW9kYWwgPSBtb2RhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9kYWxzLnVuc2hpZnQobW9kYWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZVJlbmRlcigpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlRGlhbG9nLFxuICAgICAgICAgICAgZmluaXNoZWQ6IG9uRmluaXNoZWRQcm9tLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXBwZW5kRGlhbG9nQXN5bmM8VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgcHJvbTogUHJvbWlzZTxSZWFjdC5Db21wb25lbnRUeXBlPixcbiAgICAgICAgcHJvcHM/OiBJUHJvcHM8VD4sXG4gICAgICAgIGNsYXNzTmFtZT86IHN0cmluZyxcbiAgICApOiBJSGFuZGxlPFQ+IHtcbiAgICAgICAgY29uc3Qge21vZGFsLCBjbG9zZURpYWxvZywgb25GaW5pc2hlZFByb219ID0gdGhpcy5idWlsZE1vZGFsPFQ+KHByb20sIHByb3BzLCBjbGFzc05hbWUsIHt9KTtcblxuICAgICAgICB0aGlzLm1vZGFscy5wdXNoKG1vZGFsKTtcbiAgICAgICAgdGhpcy5yZVJlbmRlcigpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2xvc2U6IGNsb3NlRGlhbG9nLFxuICAgICAgICAgICAgZmluaXNoZWQ6IG9uRmluaXNoZWRQcm9tLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CYWNrZ3JvdW5kQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gdGhpcy5nZXRDdXJyZW50TW9kYWwoKTtcbiAgICAgICAgaWYgKCFtb2RhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdlIHdhbnQgdG8gcGFzcyBhIHJlYXNvbiB0byB0aGUgb25CZWZvcmVDbG9zZVxuICAgICAgICAvLyBjYWxsYmFjaywgYnV0IGNsb3NlIGlzIGN1cnJlbnRseSBkZWZpbmVkIHRvXG4gICAgICAgIC8vIHBhc3MgYWxsIG51bWJlciBvZiBhcmd1bWVudHMgdG8gdGhlIG9uRmluaXNoZWQgY2FsbGJhY2tcbiAgICAgICAgLy8gc28sIHBhc3MgdGhlIHJlYXNvbiB0byBjbG9zZSB0aHJvdWdoIGEgbWVtYmVyIHZhcmlhYmxlXG4gICAgICAgIG1vZGFsLmNsb3NlUmVhc29uID0gXCJiYWNrZ3JvdW5kQ2xpY2tcIjtcbiAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgbW9kYWwuY2xvc2VSZWFzb24gPSBudWxsO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldEN1cnJlbnRNb2RhbCgpOiBJTW9kYWw8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByaW9yaXR5TW9kYWwgPyB0aGlzLnByaW9yaXR5TW9kYWwgOiAodGhpcy5tb2RhbHNbMF0gfHwgdGhpcy5zdGF0aWNNb2RhbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZVJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMubW9kYWxzLmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5wcmlvcml0eU1vZGFsICYmICF0aGlzLnN0YXRpY01vZGFsKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBtb2RhbCB0byByZW5kZXIsIG1ha2UgYWxsIG9mIEVsZW1lbnQgYXZhaWxhYmxlXG4gICAgICAgICAgICAvLyB0byBzY3JlZW4gcmVhZGVyIHVzZXJzIGFnYWluXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2FyaWFfdW5oaWRlX21haW5fYXBwJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShNb2RhbE1hbmFnZXIuZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG4gICAgICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKE1vZGFsTWFuYWdlci5nZXRPckNyZWF0ZVN0YXRpY0NvbnRhaW5lcigpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhpZGUgdGhlIGNvbnRlbnQgb3V0c2lkZSB0aGUgbW9kYWwgdG8gc2NyZWVuIHJlYWRlciB1c2Vyc1xuICAgICAgICAvLyBzbyB0aGV5IHdvbid0IGJlIGFibGUgdG8gbmF2aWdhdGUgaW50byBpdCBhbmQgYWN0IG9uIGl0IHVzaW5nXG4gICAgICAgIC8vIHNjcmVlbiByZWFkZXIgc3BlY2lmaWMgZmVhdHVyZXNcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2FyaWFfaGlkZV9tYWluX2FwcCcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRpY01vZGFsKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X0RpYWxvZ193cmFwcGVyIG14X0RpYWxvZ19zdGF0aWNXcmFwcGVyXCIsIHRoaXMuc3RhdGljTW9kYWwuY2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgY29uc3Qgc3RhdGljRGlhbG9nID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0aWNNb2RhbC5lbGVtIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2JhY2tncm91bmQgbXhfRGlhbG9nX3N0YXRpY0JhY2tncm91bmRcIiBvbkNsaWNrPXt0aGlzLm9uQmFja2dyb3VuZENsaWNrfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgUmVhY3RET00ucmVuZGVyKHN0YXRpY0RpYWxvZywgTW9kYWxNYW5hZ2VyLmdldE9yQ3JlYXRlU3RhdGljQ29udGFpbmVyKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBzYWZlIHRvIGNhbGwgcmVwZWF0ZWRseSBpZiB3ZSBoYXBwZW4gdG8gZG8gdGhhdFxuICAgICAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShNb2RhbE1hbmFnZXIuZ2V0T3JDcmVhdGVTdGF0aWNDb250YWluZXIoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb2RhbCA9IHRoaXMuZ2V0Q3VycmVudE1vZGFsKCk7XG4gICAgICAgIGlmIChtb2RhbCAhPT0gdGhpcy5zdGF0aWNNb2RhbCAmJiAhbW9kYWwuaGlkZGVuKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X0RpYWxvZ193cmFwcGVyXCIsIG1vZGFsLmNsYXNzTmFtZSwge1xuICAgICAgICAgICAgICAgIG14X0RpYWxvZ193cmFwcGVyV2l0aFN0YXRpY1VuZGVyOiB0aGlzLnN0YXRpY01vZGFsLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bW9kYWwuZWxlbX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2JhY2tncm91bmRcIiBvbkNsaWNrPXt0aGlzLm9uQmFja2dyb3VuZENsaWNrfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgUmVhY3RET00ucmVuZGVyKGRpYWxvZywgTW9kYWxNYW5hZ2VyLmdldE9yQ3JlYXRlQ29udGFpbmVyKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBzYWZlIHRvIGNhbGwgcmVwZWF0ZWRseSBpZiB3ZSBoYXBwZW4gdG8gZG8gdGhhdFxuICAgICAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShNb2RhbE1hbmFnZXIuZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmlmICghd2luZG93LnNpbmdsZXRvbk1vZGFsTWFuYWdlcikge1xuICAgIHdpbmRvdy5zaW5nbGV0b25Nb2RhbE1hbmFnZXIgPSBuZXcgTW9kYWxNYW5hZ2VyKCk7XG59XG5leHBvcnQgZGVmYXVsdCB3aW5kb3cuc2luZ2xldG9uTW9kYWxNYW5hZ2VyO1xuIl19