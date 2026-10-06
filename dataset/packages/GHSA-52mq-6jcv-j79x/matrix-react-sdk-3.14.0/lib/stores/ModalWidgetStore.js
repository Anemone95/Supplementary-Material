"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalWidgetStore = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AsyncStoreWithClient = require("./AsyncStoreWithClient");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../Modal"));

var _ModalWidgetDialog = _interopRequireDefault(require("../components/views/dialogs/ModalWidgetDialog"));

var _WidgetMessagingStore = require("./widgets/WidgetMessagingStore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class ModalWidgetStore extends _AsyncStoreWithClient.AsyncStoreWithClient
/*:: <IState>*/
{
  constructor() {
    super(_dispatcher.default, {});
    (0, _defineProperty2.default)(this, "modalInstance", null);
    (0, _defineProperty2.default)(this, "openSourceWidgetId", null);
    (0, _defineProperty2.default)(this, "canOpenModalWidget", () => {
      return !this.modalInstance;
    });
    (0, _defineProperty2.default)(this, "openModalWidget", (requestData
    /*: IModalWidgetOpenRequestData*/
    , sourceWidget
    /*: Widget*/
    , widgetRoomId
    /*: string*/
    ) => {
      if (this.modalInstance) return;
      this.openSourceWidgetId = sourceWidget.id;
      this.modalInstance = _Modal.default.createTrackedDialog('Modal Widget', '', _ModalWidgetDialog.default, {
        widgetDefinition: _objectSpread({}, requestData),
        widgetRoomId,
        sourceWidgetId: sourceWidget.id,
        onFinished: (success
        /*: boolean*/
        , data
        /*: IModalWidgetReturnData*/
        ) => {
          if (!success) {
            this.closeModalWidget(sourceWidget, {
              "m.exited": true
            });
          } else {
            this.closeModalWidget(sourceWidget, data);
          }

          this.openSourceWidgetId = null;
          this.modalInstance = null;
        }
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "closeModalWidget", (sourceWidget
    /*: Widget*/
    , data
    /*: IModalWidgetReturnData*/
    ) => {
      if (!this.modalInstance) return;

      if (this.openSourceWidgetId === sourceWidget.id) {
        this.openSourceWidgetId = null;
        this.modalInstance.close();
        this.modalInstance = null;

        const sourceMessaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessaging(sourceWidget);

        if (!sourceMessaging) {
          console.error("No source widget messaging for modal widget");
          return;
        }

        sourceMessaging.notifyModalWidgetClose(data);
      }
    });
  }

  static get instance()
  /*: ModalWidgetStore*/
  {
    return ModalWidgetStore.internalInstance;
  }

  async onAction(payload
  /*: ActionPayload*/
  )
  /*: Promise<any>*/
  {// nothing
  }

}

exports.ModalWidgetStore = ModalWidgetStore;
(0, _defineProperty2.default)(ModalWidgetStore, "internalInstance", new ModalWidgetStore());
window.mxModalWidgetStore = ModalWidgetStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvTW9kYWxXaWRnZXRTdG9yZS50cyJdLCJuYW1lcyI6WyJNb2RhbFdpZGdldFN0b3JlIiwiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwibW9kYWxJbnN0YW5jZSIsInJlcXVlc3REYXRhIiwic291cmNlV2lkZ2V0Iiwid2lkZ2V0Um9vbUlkIiwib3BlblNvdXJjZVdpZGdldElkIiwiaWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJNb2RhbFdpZGdldERpYWxvZyIsIndpZGdldERlZmluaXRpb24iLCJzb3VyY2VXaWRnZXRJZCIsIm9uRmluaXNoZWQiLCJzdWNjZXNzIiwiZGF0YSIsImNsb3NlTW9kYWxXaWRnZXQiLCJjbG9zZSIsInNvdXJjZU1lc3NhZ2luZyIsIldpZGdldE1lc3NhZ2luZ1N0b3JlIiwiaW5zdGFuY2UiLCJnZXRNZXNzYWdpbmciLCJjb25zb2xlIiwiZXJyb3IiLCJub3RpZnlNb2RhbFdpZGdldENsb3NlIiwiaW50ZXJuYWxJbnN0YW5jZSIsIm9uQWN0aW9uIiwicGF5bG9hZCIsIndpbmRvdyIsIm14TW9kYWxXaWRnZXRTdG9yZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7OztBQVFPLE1BQU1BLGdCQUFOLFNBQStCQztBQUEvQjtBQUE0RDtBQUt2REMsRUFBQUEsV0FBUixHQUFzQjtBQUNsQixVQUFNQyxtQkFBTixFQUF5QixFQUF6QjtBQURrQix5REFIbUIsSUFHbkI7QUFBQSw4REFGZSxJQUVmO0FBQUEsOERBWU0sTUFBTTtBQUM5QixhQUFPLENBQUMsS0FBS0MsYUFBYjtBQUNILEtBZHFCO0FBQUEsMkRBZ0JHLENBQ3JCQztBQURxQjtBQUFBLE1BRXJCQztBQUZxQjtBQUFBLE1BR3JCQztBQUhxQjtBQUFBLFNBSXBCO0FBQ0QsVUFBSSxLQUFLSCxhQUFULEVBQXdCO0FBQ3hCLFdBQUtJLGtCQUFMLEdBQTBCRixZQUFZLENBQUNHLEVBQXZDO0FBQ0EsV0FBS0wsYUFBTCxHQUFxQk0sZUFBTUMsbUJBQU4sQ0FBMEIsY0FBMUIsRUFBMEMsRUFBMUMsRUFBOENDLDBCQUE5QyxFQUFpRTtBQUNsRkMsUUFBQUEsZ0JBQWdCLG9CQUFNUixXQUFOLENBRGtFO0FBRWxGRSxRQUFBQSxZQUZrRjtBQUdsRk8sUUFBQUEsY0FBYyxFQUFFUixZQUFZLENBQUNHLEVBSHFEO0FBSWxGTSxRQUFBQSxVQUFVLEVBQUUsQ0FBQ0M7QUFBRDtBQUFBLFVBQW1CQztBQUFuQjtBQUFBLGFBQXFEO0FBQzdELGNBQUksQ0FBQ0QsT0FBTCxFQUFjO0FBQ1YsaUJBQUtFLGdCQUFMLENBQXNCWixZQUF0QixFQUFvQztBQUFFLDBCQUFZO0FBQWQsYUFBcEM7QUFDSCxXQUZELE1BRU87QUFDSCxpQkFBS1ksZ0JBQUwsQ0FBc0JaLFlBQXRCLEVBQW9DVyxJQUFwQztBQUNIOztBQUVELGVBQUtULGtCQUFMLEdBQTBCLElBQTFCO0FBQ0EsZUFBS0osYUFBTCxHQUFxQixJQUFyQjtBQUNIO0FBYmlGLE9BQWpFLEVBY2xCLElBZGtCO0FBY1o7QUFBaUIsV0FkTDtBQWNZO0FBQWUsVUFkM0IsQ0FBckI7QUFlSCxLQXRDcUI7QUFBQSw0REF3Q0ksQ0FBQ0U7QUFBRDtBQUFBLE1BQXVCVztBQUF2QjtBQUFBLFNBQXlEO0FBQy9FLFVBQUksQ0FBQyxLQUFLYixhQUFWLEVBQXlCOztBQUN6QixVQUFJLEtBQUtJLGtCQUFMLEtBQTRCRixZQUFZLENBQUNHLEVBQTdDLEVBQWlEO0FBQzdDLGFBQUtELGtCQUFMLEdBQTBCLElBQTFCO0FBQ0EsYUFBS0osYUFBTCxDQUFtQmUsS0FBbkI7QUFDQSxhQUFLZixhQUFMLEdBQXFCLElBQXJCOztBQUVBLGNBQU1nQixlQUFlLEdBQUdDLDJDQUFxQkMsUUFBckIsQ0FBOEJDLFlBQTlCLENBQTJDakIsWUFBM0MsQ0FBeEI7O0FBQ0EsWUFBSSxDQUFDYyxlQUFMLEVBQXNCO0FBQ2xCSSxVQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FBYyw2Q0FBZDtBQUNBO0FBQ0g7O0FBQ0RMLFFBQUFBLGVBQWUsQ0FBQ00sc0JBQWhCLENBQXVDVCxJQUF2QztBQUNIO0FBQ0osS0F0RHFCO0FBRXJCOztBQUVELGFBQWtCSyxRQUFsQjtBQUFBO0FBQStDO0FBQzNDLFdBQU90QixnQkFBZ0IsQ0FBQzJCLGdCQUF4QjtBQUNIOztBQUVELFFBQWdCQyxRQUFoQixDQUF5QkM7QUFBekI7QUFBQTtBQUFBO0FBQStELEdBQzNEO0FBQ0g7O0FBZjhEOzs7OEJBQXREN0IsZ0Isc0JBQ3lCLElBQUlBLGdCQUFKLEU7QUE2RHRDOEIsTUFBTSxDQUFDQyxrQkFBUCxHQUE0Qi9CLGdCQUFnQixDQUFDc0IsUUFBN0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBBc3luY1N0b3JlV2l0aENsaWVudCB9IGZyb20gXCIuL0FzeW5jU3RvcmVXaXRoQ2xpZW50XCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgTW9kYWwsIHtJSGFuZGxlLCBJTW9kYWx9IGZyb20gXCIuLi9Nb2RhbFwiO1xuaW1wb3J0IE1vZGFsV2lkZ2V0RGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTW9kYWxXaWRnZXREaWFsb2dcIjtcbmltcG9ydCB7V2lkZ2V0TWVzc2FnaW5nU3RvcmV9IGZyb20gXCIuL3dpZGdldHMvV2lkZ2V0TWVzc2FnaW5nU3RvcmVcIjtcbmltcG9ydCB7SU1vZGFsV2lkZ2V0T3BlblJlcXVlc3REYXRhLCBJTW9kYWxXaWRnZXRSZXR1cm5EYXRhLCBXaWRnZXR9IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBtb2RhbD86IElNb2RhbDxhbnk+O1xuICAgIG9wZW5lZEZyb21JZD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIE1vZGFsV2lkZ2V0U3RvcmUgZXh0ZW5kcyBBc3luY1N0b3JlV2l0aENsaWVudDxJU3RhdGU+IHtcbiAgICBwcml2YXRlIHN0YXRpYyBpbnRlcm5hbEluc3RhbmNlID0gbmV3IE1vZGFsV2lkZ2V0U3RvcmUoKTtcbiAgICBwcml2YXRlIG1vZGFsSW5zdGFuY2U6IElIYW5kbGU8dm9pZFtdPiA9IG51bGw7XG4gICAgcHJpdmF0ZSBvcGVuU291cmNlV2lkZ2V0SWQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcihkZWZhdWx0RGlzcGF0Y2hlciwge30pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGluc3RhbmNlKCk6IE1vZGFsV2lkZ2V0U3RvcmUge1xuICAgICAgICByZXR1cm4gTW9kYWxXaWRnZXRTdG9yZS5pbnRlcm5hbEluc3RhbmNlO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbkFjdGlvbihwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgLy8gbm90aGluZ1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5PcGVuTW9kYWxXaWRnZXQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5tb2RhbEluc3RhbmNlO1xuICAgIH07XG5cbiAgICBwdWJsaWMgb3Blbk1vZGFsV2lkZ2V0ID0gKFxuICAgICAgICByZXF1ZXN0RGF0YTogSU1vZGFsV2lkZ2V0T3BlblJlcXVlc3REYXRhLFxuICAgICAgICBzb3VyY2VXaWRnZXQ6IFdpZGdldCxcbiAgICAgICAgd2lkZ2V0Um9vbUlkPzogc3RyaW5nLFxuICAgICkgPT4ge1xuICAgICAgICBpZiAodGhpcy5tb2RhbEluc3RhbmNlKSByZXR1cm47XG4gICAgICAgIHRoaXMub3BlblNvdXJjZVdpZGdldElkID0gc291cmNlV2lkZ2V0LmlkO1xuICAgICAgICB0aGlzLm1vZGFsSW5zdGFuY2UgPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdNb2RhbCBXaWRnZXQnLCAnJywgTW9kYWxXaWRnZXREaWFsb2csIHtcbiAgICAgICAgICAgIHdpZGdldERlZmluaXRpb246IHsuLi5yZXF1ZXN0RGF0YX0sXG4gICAgICAgICAgICB3aWRnZXRSb29tSWQsXG4gICAgICAgICAgICBzb3VyY2VXaWRnZXRJZDogc291cmNlV2lkZ2V0LmlkLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKHN1Y2Nlc3M6IGJvb2xlYW4sIGRhdGE/OiBJTW9kYWxXaWRnZXRSZXR1cm5EYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNb2RhbFdpZGdldChzb3VyY2VXaWRnZXQsIHsgXCJtLmV4aXRlZFwiOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNb2RhbFdpZGdldChzb3VyY2VXaWRnZXQsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMub3BlblNvdXJjZVdpZGdldElkID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGFsSW5zdGFuY2UgPSBudWxsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBjbG9zZU1vZGFsV2lkZ2V0ID0gKHNvdXJjZVdpZGdldDogV2lkZ2V0LCBkYXRhPzogSU1vZGFsV2lkZ2V0UmV0dXJuRGF0YSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubW9kYWxJbnN0YW5jZSkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5vcGVuU291cmNlV2lkZ2V0SWQgPT09IHNvdXJjZVdpZGdldC5pZCkge1xuICAgICAgICAgICAgdGhpcy5vcGVuU291cmNlV2lkZ2V0SWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5tb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLm1vZGFsSW5zdGFuY2UgPSBudWxsO1xuXG4gICAgICAgICAgICBjb25zdCBzb3VyY2VNZXNzYWdpbmcgPSBXaWRnZXRNZXNzYWdpbmdTdG9yZS5pbnN0YW5jZS5nZXRNZXNzYWdpbmcoc291cmNlV2lkZ2V0KTtcbiAgICAgICAgICAgIGlmICghc291cmNlTWVzc2FnaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk5vIHNvdXJjZSB3aWRnZXQgbWVzc2FnaW5nIGZvciBtb2RhbCB3aWRnZXRcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc291cmNlTWVzc2FnaW5nLm5vdGlmeU1vZGFsV2lkZ2V0Q2xvc2UoZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG53aW5kb3cubXhNb2RhbFdpZGdldFN0b3JlID0gTW9kYWxXaWRnZXRTdG9yZS5pbnN0YW5jZTtcbiJdfQ==