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

    if (modal !== this.staticModal) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Nb2RhbC50c3giXSwibmFtZXMiOlsiRElBTE9HX0NPTlRBSU5FUl9JRCIsIlNUQVRJQ19ESUFMT0dfQ09OVEFJTkVSX0lEIiwiTW9kYWxNYW5hZ2VyIiwibW9kYWwiLCJnZXRDdXJyZW50TW9kYWwiLCJjbG9zZVJlYXNvbiIsImNsb3NlIiwiZ2V0T3JDcmVhdGVDb250YWluZXIiLCJjb250YWluZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsImlkIiwiYm9keSIsImFwcGVuZENoaWxkIiwiZ2V0T3JDcmVhdGVTdGF0aWNDb250YWluZXIiLCJoYXNEaWFsb2dzIiwicHJpb3JpdHlNb2RhbCIsInN0YXRpY01vZGFsIiwibW9kYWxzIiwibGVuZ3RoIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsImFuYWx5dGljc0FjdGlvbiIsImFuYWx5dGljc0luZm8iLCJyZXN0IiwiQW5hbHl0aWNzIiwidHJhY2tFdmVudCIsImNyZWF0ZURpYWxvZyIsImFwcGVuZFRyYWNrZWREaWFsb2ciLCJhcHBlbmREaWFsb2ciLCJFbGVtZW50IiwiY3JlYXRlRGlhbG9nQXN5bmMiLCJQcm9taXNlIiwicmVzb2x2ZSIsImFwcGVuZERpYWxvZ0FzeW5jIiwiY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jIiwiYXBwZW5kVHJhY2tlZERpYWxvZ0FzeW5jIiwiY2xvc2VDdXJyZW50TW9kYWwiLCJyZWFzb24iLCJidWlsZE1vZGFsIiwicHJvbSIsInByb3BzIiwiY2xhc3NOYW1lIiwib3B0aW9ucyIsIm9uRmluaXNoZWQiLCJvbkJlZm9yZUNsb3NlIiwiYmVmb3JlQ2xvc2VQcm9taXNlIiwiZWxlbSIsImNsb3NlRGlhbG9nIiwib25GaW5pc2hlZFByb20iLCJnZXRDbG9zZUZuIiwibW9kYWxDb3VudCIsImNvdW50ZXIiLCJkZWZlcnJlZCIsImFyZ3MiLCJzaG91bGRDbG9zZSIsImFwcGx5IiwiaSIsImluZGV4T2YiLCJzcGxpY2UiLCJyZVJlbmRlciIsInByb21pc2UiLCJpc1ByaW9yaXR5TW9kYWwiLCJpc1N0YXRpY01vZGFsIiwidW5zaGlmdCIsImZpbmlzaGVkIiwicHVzaCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiUmVhY3RET00iLCJ1bm1vdW50Q29tcG9uZW50QXROb2RlIiwiY2xhc3NlcyIsInN0YXRpY0RpYWxvZyIsIm9uQmFja2dyb3VuZENsaWNrIiwicmVuZGVyIiwibXhfRGlhbG9nX3dyYXBwZXJXaXRoU3RhdGljVW5kZXIiLCJkaWFsb2ciLCJ3aW5kb3ciLCJzaW5nbGV0b25Nb2RhbE1hbmFnZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWUEsTUFBTUEsbUJBQW1CLEdBQUcscUJBQTVCO0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsMkJBQW5DOztBQTVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFQQTtBQUNBO0FBQ0E7O0FBdURPLE1BQU1DLFlBQU4sQ0FBbUI7QUFBQTtBQUFBLG1EQUNKLENBREk7QUFBQSx5REFLZSxJQUxmO0FBQUEsdURBU2EsSUFUYjtBQUFBLGtEQVlVLEVBWlY7QUFBQSw2REE2UE0sTUFBTTtBQUM5QixZQUFNQyxLQUFLLEdBQUcsS0FBS0MsZUFBTCxFQUFkOztBQUNBLFVBQUksQ0FBQ0QsS0FBTCxFQUFZO0FBQ1I7QUFDSCxPQUo2QixDQUs5QjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0FBLE1BQUFBLEtBQUssQ0FBQ0UsV0FBTixHQUFvQixpQkFBcEI7QUFDQUYsTUFBQUEsS0FBSyxDQUFDRyxLQUFOO0FBQ0FILE1BQUFBLEtBQUssQ0FBQ0UsV0FBTixHQUFvQixJQUFwQjtBQUNILEtBelFxQjtBQUFBOztBQWN0QixTQUFlRSxvQkFBZixHQUFz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Q0o7O0FBeFVxQjs7OztBQTJVMUIsSUFBSSxDQUFDdUUsTUFBTSxDQUFDQyxxQkFBWixFQUFtQztBQUMvQkQsRUFBQUEsTUFBTSxDQUFDQyxxQkFBUCxHQUErQixJQUFJN0UsWUFBSixFQUEvQjtBQUNIOztlQUNjNEUsTUFBTSxDQUFDQyxxQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gJy4vQW5hbHl0aWNzJztcbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHtkZWZlcn0gZnJvbSAnLi91dGlscy9wcm9taXNlJztcbmltcG9ydCBBc3luY1dyYXBwZXIgZnJvbSAnLi9Bc3luY1dyYXBwZXInO1xuXG5jb25zdCBESUFMT0dfQ09OVEFJTkVSX0lEID0gXCJteF9EaWFsb2dfQ29udGFpbmVyXCI7XG5jb25zdCBTVEFUSUNfRElBTE9HX0NPTlRBSU5FUl9JRCA9IFwibXhfRGlhbG9nX1N0YXRpY0NvbnRhaW5lclwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElNb2RhbDxUIGV4dGVuZHMgYW55W10+IHtcbiAgICBlbGVtOiBSZWFjdC5SZWFjdE5vZGU7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIGJlZm9yZUNsb3NlUHJvbWlzZT86IFByb21pc2U8Ym9vbGVhbj47XG4gICAgY2xvc2VSZWFzb24/OiBzdHJpbmc7XG4gICAgb25CZWZvcmVDbG9zZT8ocmVhc29uPzogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPjtcbiAgICBvbkZpbmlzaGVkKC4uLmFyZ3M6IFQpOiB2b2lkO1xuICAgIGNsb3NlKC4uLmFyZ3M6IFQpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElIYW5kbGU8VCBleHRlbmRzIGFueVtdPiB7XG4gICAgZmluaXNoZWQ6IFByb21pc2U8VD47XG4gICAgY2xvc2UoLi4uYXJnczogVCk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJUHJvcHM8VCBleHRlbmRzIGFueVtdPiB7XG4gICAgb25GaW5pc2hlZD8oLi4uYXJnczogVCk6IHZvaWQ7XG4gICAgLy8gVE9ETyBpbXByb3ZlIHR5cGluZyBoZXJlIG9uY2UgYWxsIE1vZGFscyBhcmUgVFMgYW5kIHdlIGNhbiBleGhhdXN0aXZlbHkgY2hlY2sgdGhlIHByb3BzXG4gICAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5pbnRlcmZhY2UgSU9wdGlvbnM8VCBleHRlbmRzIGFueVtdPiB7XG4gICAgb25CZWZvcmVDbG9zZT86IElNb2RhbDxUPltcIm9uQmVmb3JlQ2xvc2VcIl07XG59XG5cbnR5cGUgUGFyYW1ldGVyc1dpdGhvdXRGaXJzdDxUIGV4dGVuZHMgKC4uLmFyZ3M6IGFueSkgPT4gYW55PiA9IFQgZXh0ZW5kcyAoYTogYW55LCAuLi5hcmdzOiBpbmZlciBQKSA9PiBhbnkgPyBQIDogbmV2ZXI7XG5cbmV4cG9ydCBjbGFzcyBNb2RhbE1hbmFnZXIge1xuICAgIHByaXZhdGUgY291bnRlciA9IDA7XG4gICAgLy8gVGhlIG1vZGFsIHRvIHByaW9yaXRpc2Ugb3ZlciBhbGwgb3RoZXJzLiBJZiB0aGlzIGlzIHNldCwgb25seSBzaG93XG4gICAgLy8gdGhpcyBtb2RhbC4gUmVtb3ZlIGFsbCBvdGhlciBtb2RhbHMgZnJvbSB0aGUgc3RhY2sgd2hlbiB0aGlzIG1vZGFsXG4gICAgLy8gaXMgY2xvc2VkLlxuICAgIHByaXZhdGUgcHJpb3JpdHlNb2RhbDogSU1vZGFsPGFueT4gPSBudWxsO1xuICAgIC8vIFRoZSBtb2RhbCB0byBrZWVwIG9wZW4gdW5kZXJuZWF0aCBvdGhlciBtb2RhbHMgaWYgcG9zc2libGUuIFVzZWZ1bFxuICAgIC8vIGZvciBjYXNlcyBsaWtlIFNldHRpbmdzIHdoZXJlIHRoZSBtb2RhbCBzaG91bGQgcmVtYWluIG9wZW4gd2hpbGUgdGhlXG4gICAgLy8gdXNlciBpcyBwcm9tcHRlZCBmb3IgbW9yZSBpbmZvcm1hdGlvbi9lcnJvcnMuXG4gICAgcHJpdmF0ZSBzdGF0aWNNb2RhbDogSU1vZGFsPGFueT4gPSBudWxsO1xuICAgIC8vIEEgbGlzdCBvZiB0aGUgbW9kYWxzIHdlIGhhdmUgc3RhY2tlZCB1cCwgd2l0aCB0aGUgbW9zdCByZWNlbnQgYXQgWzBdXG4gICAgLy8gTmVpdGhlciB0aGUgc3RhdGljIG5vciBwcmlvcml0eSBtb2RhbCB3aWxsIGJlIGluIHRoaXMgbGlzdC5cbiAgICBwcml2YXRlIG1vZGFsczogSU1vZGFsPGFueT5bXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0T3JDcmVhdGVDb250YWluZXIoKSB7XG4gICAgICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChESUFMT0dfQ09OVEFJTkVSX0lEKTtcblxuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5pZCA9IERJQUxPR19DT05UQUlORVJfSUQ7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldE9yQ3JlYXRlU3RhdGljQ29udGFpbmVyKCkge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU1RBVElDX0RJQUxPR19DT05UQUlORVJfSUQpO1xuXG4gICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgY29udGFpbmVyLmlkID0gU1RBVElDX0RJQUxPR19DT05UQUlORVJfSUQ7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYXNEaWFsb2dzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmlvcml0eU1vZGFsIHx8IHRoaXMuc3RhdGljTW9kYWwgfHwgdGhpcy5tb2RhbHMubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlVHJhY2tlZERpYWxvZzxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBhbmFseXRpY3NBY3Rpb246IHN0cmluZyxcbiAgICAgICAgYW5hbHl0aWNzSW5mbzogc3RyaW5nLFxuICAgICAgICAuLi5yZXN0OiBQYXJhbWV0ZXJzPE1vZGFsTWFuYWdlcltcImNyZWF0ZURpYWxvZ1wiXT5cbiAgICApIHtcbiAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ01vZGFsJywgYW5hbHl0aWNzQWN0aW9uLCBhbmFseXRpY3NJbmZvKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlRGlhbG9nPFQ+KC4uLnJlc3QpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhcHBlbmRUcmFja2VkRGlhbG9nPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIGFuYWx5dGljc0FjdGlvbjogc3RyaW5nLFxuICAgICAgICBhbmFseXRpY3NJbmZvOiBzdHJpbmcsXG4gICAgICAgIC4uLnJlc3Q6IFBhcmFtZXRlcnM8TW9kYWxNYW5hZ2VyW1wiYXBwZW5kRGlhbG9nXCJdPlxuICAgICkge1xuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnTW9kYWwnLCBhbmFseXRpY3NBY3Rpb24sIGFuYWx5dGljc0luZm8pO1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBlbmREaWFsb2c8VD4oLi4ucmVzdCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZURpYWxvZzxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBFbGVtZW50OiBSZWFjdC5Db21wb25lbnRUeXBlLFxuICAgICAgICAuLi5yZXN0OiBQYXJhbWV0ZXJzV2l0aG91dEZpcnN0PE1vZGFsTWFuYWdlcltcImNyZWF0ZURpYWxvZ0FzeW5jXCJdPlxuICAgICkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVEaWFsb2dBc3luYzxUPihQcm9taXNlLnJlc29sdmUoRWxlbWVudCksIC4uLnJlc3QpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhcHBlbmREaWFsb2c8VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgRWxlbWVudDogUmVhY3QuQ29tcG9uZW50VHlwZSxcbiAgICAgICAgLi4ucmVzdDogUGFyYW1ldGVyc1dpdGhvdXRGaXJzdDxNb2RhbE1hbmFnZXJbXCJhcHBlbmREaWFsb2dBc3luY1wiXT5cbiAgICApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwZW5kRGlhbG9nQXN5bmM8VD4oUHJvbWlzZS5yZXNvbHZlKEVsZW1lbnQpLCAuLi5yZXN0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIGFuYWx5dGljc0FjdGlvbjogc3RyaW5nLFxuICAgICAgICBhbmFseXRpY3NJbmZvOiBzdHJpbmcsXG4gICAgICAgIC4uLnJlc3Q6IFBhcmFtZXRlcnM8TW9kYWxNYW5hZ2VyW1wiY3JlYXRlRGlhbG9nQXN5bmNcIl0+XG4gICAgKSB7XG4gICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCdNb2RhbCcsIGFuYWx5dGljc0FjdGlvbiwgYW5hbHl0aWNzSW5mbyk7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZURpYWxvZ0FzeW5jPFQ+KC4uLnJlc3QpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhcHBlbmRUcmFja2VkRGlhbG9nQXN5bmM8VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgYW5hbHl0aWNzQWN0aW9uOiBzdHJpbmcsXG4gICAgICAgIGFuYWx5dGljc0luZm86IHN0cmluZyxcbiAgICAgICAgLi4ucmVzdDogUGFyYW1ldGVyczxNb2RhbE1hbmFnZXJbXCJhcHBlbmREaWFsb2dBc3luY1wiXT5cbiAgICApIHtcbiAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ01vZGFsJywgYW5hbHl0aWNzQWN0aW9uLCBhbmFseXRpY3NJbmZvKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwZW5kRGlhbG9nQXN5bmM8VD4oLi4ucmVzdCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsb3NlQ3VycmVudE1vZGFsKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gdGhpcy5nZXRDdXJyZW50TW9kYWwoKTtcbiAgICAgICAgaWYgKCFtb2RhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG1vZGFsLmNsb3NlUmVhc29uID0gcmVhc29uO1xuICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnVpbGRNb2RhbDxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBwcm9tOiBQcm9taXNlPFJlYWN0LkNvbXBvbmVudFR5cGU+LFxuICAgICAgICBwcm9wcz86IElQcm9wczxUPixcbiAgICAgICAgY2xhc3NOYW1lPzogc3RyaW5nLFxuICAgICAgICBvcHRpb25zPzogSU9wdGlvbnM8VD4sXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IG1vZGFsOiBJTW9kYWw8VD4gPSB7XG4gICAgICAgICAgICBvbkZpbmlzaGVkOiBwcm9wcyA/IHByb3BzLm9uRmluaXNoZWQgOiBudWxsLFxuICAgICAgICAgICAgb25CZWZvcmVDbG9zZTogb3B0aW9ucy5vbkJlZm9yZUNsb3NlLFxuICAgICAgICAgICAgYmVmb3JlQ2xvc2VQcm9taXNlOiBudWxsLFxuICAgICAgICAgICAgY2xvc2VSZWFzb246IG51bGwsXG4gICAgICAgICAgICBjbGFzc05hbWUsXG5cbiAgICAgICAgICAgIC8vIHRoZXNlIHdpbGwgYmUgc2V0IGJlbG93IGJ1dCB3ZSBuZWVkIGFuIG9iamVjdCByZWZlcmVuY2UgdG8gcGFzcyB0byBnZXRDbG9zZUZuIGJlZm9yZSB3ZSBjYW4gZG8gdGhhdFxuICAgICAgICAgICAgZWxlbTogbnVsbCxcbiAgICAgICAgICAgIGNsb3NlOiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG5ldmVyIGNhbGwgdGhpcyBmcm9tIG9uRmluaXNoZWQoKSBvdGhlcndpc2UgaXQgd2lsbCBsb29wXG4gICAgICAgIGNvbnN0IFtjbG9zZURpYWxvZywgb25GaW5pc2hlZFByb21dID0gdGhpcy5nZXRDbG9zZUZuPFQ+KG1vZGFsLCBwcm9wcyk7XG5cbiAgICAgICAgLy8gZG9uJ3QgYXR0ZW1wdCB0byByZXVzZSB0aGUgc2FtZSBBc3luY1dyYXBwZXIgZm9yIGRpZmZlcmVudCBkaWFsb2dzLFxuICAgICAgICAvLyBvdGhlcndpc2Ugd2UnbGwgZ2V0IGNvbmZ1c2VkLlxuICAgICAgICBjb25zdCBtb2RhbENvdW50ID0gdGhpcy5jb3VudGVyKys7XG5cbiAgICAgICAgLy8gRklYTUU6IElmIGEgZGlhbG9nIHVzZXMgZ2V0RGVmYXVsdFByb3BzIGl0IGNsb2JiZXJzIHRoZSBvbkZpbmlzaGVkXG4gICAgICAgIC8vIHByb3BlcnR5IHNldCBoZXJlIHNvIHlvdSBjYW4ndCBjbG9zZSB0aGUgZGlhbG9nIGZyb20gYSBidXR0b24gY2xpY2shXG4gICAgICAgIG1vZGFsLmVsZW0gPSA8QXN5bmNXcmFwcGVyIGtleT17bW9kYWxDb3VudH0gcHJvbT17cHJvbX0gey4uLnByb3BzfSBvbkZpbmlzaGVkPXtjbG9zZURpYWxvZ30gLz47XG4gICAgICAgIG1vZGFsLmNsb3NlID0gY2xvc2VEaWFsb2c7XG5cbiAgICAgICAgcmV0dXJuIHttb2RhbCwgY2xvc2VEaWFsb2csIG9uRmluaXNoZWRQcm9tfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsb3NlRm48VCBleHRlbmRzIGFueVtdPihcbiAgICAgICAgbW9kYWw6IElNb2RhbDxUPixcbiAgICAgICAgcHJvcHM6IElQcm9wczxUPixcbiAgICApOiBbSUhhbmRsZTxUPltcImNsb3NlXCJdLCBJSGFuZGxlPFQ+W1wiZmluaXNoZWRcIl1dIHtcbiAgICAgICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcjxUPigpO1xuICAgICAgICByZXR1cm4gW2FzeW5jICguLi5hcmdzOiBUKSA9PiB7XG4gICAgICAgICAgICBpZiAobW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtb2RhbC5vbkJlZm9yZUNsb3NlKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlID0gbW9kYWwub25CZWZvcmVDbG9zZShtb2RhbC5jbG9zZVJlYXNvbik7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2hvdWxkQ2xvc2UgPSBhd2FpdCBtb2RhbC5iZWZvcmVDbG9zZVByb21pc2U7XG4gICAgICAgICAgICAgICAgbW9kYWwuYmVmb3JlQ2xvc2VQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIXNob3VsZENsb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHByb3BzICYmIHByb3BzLm9uRmluaXNoZWQpIHByb3BzLm9uRmluaXNoZWQuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBjb25zdCBpID0gdGhpcy5tb2RhbHMuaW5kZXhPZihtb2RhbCk7XG4gICAgICAgICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RhbHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wcmlvcml0eU1vZGFsID09PSBtb2RhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpb3JpdHlNb2RhbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBYWFg6IFRoaXMgaXMgZGVzdHJ1Y3RpdmVcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGFscyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0aWNNb2RhbCA9PT0gbW9kYWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRpY01vZGFsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIFhYWDogVGhpcyBpcyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgICAgIHRoaXMubW9kYWxzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucmVSZW5kZXIoKTtcbiAgICAgICAgfSwgZGVmZXJyZWQucHJvbWlzZV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGNhbGxiYWNrIG9uQmVmb3JlQ2xvc2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZz99IHJlYXNvbiBlaXRoZXIgXCJiYWNrZ3JvdW5kQ2xpY2tcIiBvciBudWxsXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sPn0gd2hldGhlciB0aGUgZGlhbG9nIHNob3VsZCBjbG9zZVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogT3BlbiBhIG1vZGFsIHZpZXcuXG4gICAgICpcbiAgICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIGRpc3BsYXkgYSByZWFjdCBjb21wb25lbnQgd2hpY2ggaXMgbG9hZGVkIGFzIGFuIGFzeW5jaHJvbm91c1xuICAgICAqIHdlYnBhY2sgY29tcG9uZW50LiBUbyBkbyB0aGlzLCBzZXQgJ2xvYWRlcicgYXM6XG4gICAgICpcbiAgICAgKiAgIChjYikgPT4ge1xuICAgICAqICAgICAgIHJlcXVpcmUoWyc8bW9kdWxlPiddLCBjYik7XG4gICAgICogICB9XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1Byb21pc2V9IHByb20gICBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBhIFJlYWN0IGNvbXBvbmVudFxuICAgICAqICAgd2hpY2ggd2lsbCBiZSBkaXNwbGF5ZWQgYXMgdGhlIG1vZGFsIHZpZXcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHMgICBwcm9wZXJ0aWVzIHRvIHBhc3MgdG8gdGhlIGRpc3BsYXllZFxuICAgICAqICAgIGNvbXBvbmVudC4gKFdlIHdpbGwgYWxzbyBwYXNzIGFuICdvbkZpbmlzaGVkJyBwcm9wZXJ0eS4pXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lICAgQ1NTIGNsYXNzIHRvIGFwcGx5IHRvIHRoZSBtb2RhbCB3cmFwcGVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUHJpb3JpdHlNb2RhbCBpZiB0cnVlLCB0aGlzIG1vZGFsIHdpbGwgYmUgZGlzcGxheWVkIHJlZ2FyZGxlc3NcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiBvdGhlciBtb2RhbHMgdGhhdCBhcmUgY3VycmVudGx5IGluIHRoZSBzdGFjay5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbHNvLCB3aGVuIGNsb3NlZCwgYWxsIG1vZGFscyB3aWxsIGJlIHJlbW92ZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIHRoZSBzdGFjay5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzU3RhdGljTW9kYWwgIGlmIHRydWUsIHRoaXMgbW9kYWwgd2lsbCBiZSBkaXNwbGF5ZWQgdW5kZXIgb3RoZXJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFscyBpbiB0aGUgc3RhY2suIFdoZW4gY2xvc2VkLCBhbGwgbW9kYWxzIHdpbGxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsc28gYmUgcmVtb3ZlZCBmcm9tIHRoZSBzdGFjay4gVGhpcyBpcyBub3QgY29tcGF0aWJsZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCBiZWluZyBhIHByaW9yaXR5IG1vZGFsLiBPbmx5IG9uZSBtb2RhbCBjYW4gYmVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRpYyBhdCBhIHRpbWUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnM/IGV4dHJhIG9wdGlvbnMgZm9yIHRoZSBkaWFsb2dcbiAgICAgKiBAcGFyYW0ge29uQmVmb3JlQ2xvc2V9IG9wdGlvbnMub25CZWZvcmVDbG9zZSBhIGNhbGxiYWNrIHRvIGRlY2lkZSB3aGV0aGVyIHRvIGNsb3NlIHRoZSBkaWFsb2dcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBPYmplY3Qgd2l0aCAnY2xvc2UnIHBhcmFtZXRlciBiZWluZyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBjbG9zZSB0aGUgZGlhbG9nXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVEaWFsb2dBc3luYzxUIGV4dGVuZHMgYW55W10+KFxuICAgICAgICBwcm9tOiBQcm9taXNlPFJlYWN0LkNvbXBvbmVudFR5cGU+LFxuICAgICAgICBwcm9wcz86IElQcm9wczxUPixcbiAgICAgICAgY2xhc3NOYW1lPzogc3RyaW5nLFxuICAgICAgICBpc1ByaW9yaXR5TW9kYWwgPSBmYWxzZSxcbiAgICAgICAgaXNTdGF0aWNNb2RhbCA9IGZhbHNlLFxuICAgICAgICBvcHRpb25zOiBJT3B0aW9uczxUPiA9IHt9LFxuICAgICk6IElIYW5kbGU8VD4ge1xuICAgICAgICBjb25zdCB7bW9kYWwsIGNsb3NlRGlhbG9nLCBvbkZpbmlzaGVkUHJvbX0gPSB0aGlzLmJ1aWxkTW9kYWw8VD4ocHJvbSwgcHJvcHMsIGNsYXNzTmFtZSwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChpc1ByaW9yaXR5TW9kYWwpIHtcbiAgICAgICAgICAgIC8vIFhYWDogVGhpcyBpcyBkZXN0cnVjdGl2ZVxuICAgICAgICAgICAgdGhpcy5wcmlvcml0eU1vZGFsID0gbW9kYWw7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNTdGF0aWNNb2RhbCkge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBpbnRlbnRpb25hbGx5IGRlc3RydWN0aXZlXG4gICAgICAgICAgICB0aGlzLnN0YXRpY01vZGFsID0gbW9kYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1vZGFscy51bnNoaWZ0KG1vZGFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVSZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZURpYWxvZyxcbiAgICAgICAgICAgIGZpbmlzaGVkOiBvbkZpbmlzaGVkUHJvbSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFwcGVuZERpYWxvZ0FzeW5jPFQgZXh0ZW5kcyBhbnlbXT4oXG4gICAgICAgIHByb206IFByb21pc2U8UmVhY3QuQ29tcG9uZW50VHlwZT4sXG4gICAgICAgIHByb3BzPzogSVByb3BzPFQ+LFxuICAgICAgICBjbGFzc05hbWU/OiBzdHJpbmcsXG4gICAgKTogSUhhbmRsZTxUPiB7XG4gICAgICAgIGNvbnN0IHttb2RhbCwgY2xvc2VEaWFsb2csIG9uRmluaXNoZWRQcm9tfSA9IHRoaXMuYnVpbGRNb2RhbDxUPihwcm9tLCBwcm9wcywgY2xhc3NOYW1lLCB7fSk7XG5cbiAgICAgICAgdGhpcy5tb2RhbHMucHVzaChtb2RhbCk7XG4gICAgICAgIHRoaXMucmVSZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNsb3NlOiBjbG9zZURpYWxvZyxcbiAgICAgICAgICAgIGZpbmlzaGVkOiBvbkZpbmlzaGVkUHJvbSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQmFja2dyb3VuZENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBtb2RhbCA9IHRoaXMuZ2V0Q3VycmVudE1vZGFsKCk7XG4gICAgICAgIGlmICghbW9kYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSB3YW50IHRvIHBhc3MgYSByZWFzb24gdG8gdGhlIG9uQmVmb3JlQ2xvc2VcbiAgICAgICAgLy8gY2FsbGJhY2ssIGJ1dCBjbG9zZSBpcyBjdXJyZW50bHkgZGVmaW5lZCB0b1xuICAgICAgICAvLyBwYXNzIGFsbCBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHRoZSBvbkZpbmlzaGVkIGNhbGxiYWNrXG4gICAgICAgIC8vIHNvLCBwYXNzIHRoZSByZWFzb24gdG8gY2xvc2UgdGhyb3VnaCBhIG1lbWJlciB2YXJpYWJsZVxuICAgICAgICBtb2RhbC5jbG9zZVJlYXNvbiA9IFwiYmFja2dyb3VuZENsaWNrXCI7XG4gICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgIG1vZGFsLmNsb3NlUmVhc29uID0gbnVsbDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50TW9kYWwoKTogSU1vZGFsPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmlvcml0eU1vZGFsID8gdGhpcy5wcmlvcml0eU1vZGFsIDogKHRoaXMubW9kYWxzWzBdIHx8IHRoaXMuc3RhdGljTW9kYWwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVSZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLm1vZGFscy5sZW5ndGggPT09IDAgJiYgIXRoaXMucHJpb3JpdHlNb2RhbCAmJiAhdGhpcy5zdGF0aWNNb2RhbCkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gbW9kYWwgdG8gcmVuZGVyLCBtYWtlIGFsbCBvZiBFbGVtZW50IGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gdG8gc2NyZWVuIHJlYWRlciB1c2VycyBhZ2FpblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdhcmlhX3VuaGlkZV9tYWluX2FwcCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoTW9kYWxNYW5hZ2VyLmdldE9yQ3JlYXRlQ29udGFpbmVyKCkpO1xuICAgICAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShNb2RhbE1hbmFnZXIuZ2V0T3JDcmVhdGVTdGF0aWNDb250YWluZXIoKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIaWRlIHRoZSBjb250ZW50IG91dHNpZGUgdGhlIG1vZGFsIHRvIHNjcmVlbiByZWFkZXIgdXNlcnNcbiAgICAgICAgLy8gc28gdGhleSB3b24ndCBiZSBhYmxlIHRvIG5hdmlnYXRlIGludG8gaXQgYW5kIGFjdCBvbiBpdCB1c2luZ1xuICAgICAgICAvLyBzY3JlZW4gcmVhZGVyIHNwZWNpZmljIGZlYXR1cmVzXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdhcmlhX2hpZGVfbWFpbl9hcHAnLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0aWNNb2RhbCkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9EaWFsb2dfd3JhcHBlciBteF9EaWFsb2dfc3RhdGljV3JhcHBlclwiLCB0aGlzLnN0YXRpY01vZGFsLmNsYXNzTmFtZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXRpY0RpYWxvZyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGljTW9kYWwuZWxlbSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19iYWNrZ3JvdW5kIG14X0RpYWxvZ19zdGF0aWNCYWNrZ3JvdW5kXCIgb25DbGljaz17dGhpcy5vbkJhY2tncm91bmRDbGlja30gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIFJlYWN0RE9NLnJlbmRlcihzdGF0aWNEaWFsb2csIE1vZGFsTWFuYWdlci5nZXRPckNyZWF0ZVN0YXRpY0NvbnRhaW5lcigpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgc2FmZSB0byBjYWxsIHJlcGVhdGVkbHkgaWYgd2UgaGFwcGVuIHRvIGRvIHRoYXRcbiAgICAgICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoTW9kYWxNYW5hZ2VyLmdldE9yQ3JlYXRlU3RhdGljQ29udGFpbmVyKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kYWwgPSB0aGlzLmdldEN1cnJlbnRNb2RhbCgpO1xuICAgICAgICBpZiAobW9kYWwgIT09IHRoaXMuc3RhdGljTW9kYWwpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfRGlhbG9nX3dyYXBwZXJcIiwgbW9kYWwuY2xhc3NOYW1lLCB7XG4gICAgICAgICAgICAgICAgbXhfRGlhbG9nX3dyYXBwZXJXaXRoU3RhdGljVW5kZXI6IHRoaXMuc3RhdGljTW9kYWwsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGlhbG9nID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHttb2RhbC5lbGVtfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYmFja2dyb3VuZFwiIG9uQ2xpY2s9e3RoaXMub25CYWNrZ3JvdW5kQ2xpY2t9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBSZWFjdERPTS5yZW5kZXIoZGlhbG9nLCBNb2RhbE1hbmFnZXIuZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIHNhZmUgdG8gY2FsbCByZXBlYXRlZGx5IGlmIHdlIGhhcHBlbiB0byBkbyB0aGF0XG4gICAgICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKE1vZGFsTWFuYWdlci5nZXRPckNyZWF0ZUNvbnRhaW5lcigpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuaWYgKCF3aW5kb3cuc2luZ2xldG9uTW9kYWxNYW5hZ2VyKSB7XG4gICAgd2luZG93LnNpbmdsZXRvbk1vZGFsTWFuYWdlciA9IG5ldyBNb2RhbE1hbmFnZXIoKTtcbn1cbmV4cG9ydCBkZWZhdWx0IHdpbmRvdy5zaW5nbGV0b25Nb2RhbE1hbmFnZXI7XG4iXX0=