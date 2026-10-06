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

var sdk = _interopRequireWildcard(require("../../../index"));

var _classnames = _interopRequireDefault(require("classnames"));

var _UserAddress = require("../../../UserAddress");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let AddressSelector = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.AddressSelector"), _dec(_class = (_temp = _class2 = class AddressSelector extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "moveSelectionTop", () => {
      if (this.state.selected > 0) {
        this.setState({
          selected: 0,
          hover: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "moveSelectionUp", () => {
      if (this.state.selected > 0) {
        this.setState({
          selected: this.state.selected - 1,
          hover: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "moveSelectionDown", () => {
      if (this.state.selected < this._maxSelected(this.props.addressList)) {
        this.setState({
          selected: this.state.selected + 1,
          hover: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "chooseSelection", () => {
      this.selectAddress(this.state.selected);
    });
    (0, _defineProperty2.default)(this, "onClick", index => {
      this.selectAddress(index);
    });
    (0, _defineProperty2.default)(this, "onMouseEnter", index => {
      this.setState({
        selected: index,
        hover: true
      });
    });
    (0, _defineProperty2.default)(this, "onMouseLeave", () => {
      this.setState({
        hover: false
      });
    });
    (0, _defineProperty2.default)(this, "selectAddress", index => {
      // Only try to select an address if one exists
      if (this.props.addressList.length !== 0) {
        this.props.onSelected(index);
        this.setState({
          hover: false
        });
      }
    });
    this.state = {
      selected: this.props.selected === undefined ? 0 : this.props.selected,
      hover: false
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event


  UNSAFE_componentWillReceiveProps(props) {
    // eslint-disable-line camelcase
    // Make sure the selected item isn't outside the list bounds
    const selected = this.state.selected;

    const maxSelected = this._maxSelected(props.addressList);

    if (selected > maxSelected) {
      this.setState({
        selected: maxSelected
      });
    }
  }

  componentDidUpdate() {
    // As the user scrolls with the arrow keys keep the selected item
    // at the top of the window.
    if (this.scrollElement && this.props.addressList.length > 0 && !this.state.hover) {
      const elementHeight = this.addressListElement.getBoundingClientRect().height;
      this.scrollElement.scrollTop = this.state.selected * elementHeight - elementHeight;
    }
  }

  createAddressListTiles() {
    const AddressTile = sdk.getComponent("elements.AddressTile");

    const maxSelected = this._maxSelected(this.props.addressList);

    const addressList = []; // Only create the address elements if there are address

    if (this.props.addressList.length > 0) {
      for (let i = 0; i <= maxSelected; i++) {
        const classes = (0, _classnames.default)({
          "mx_AddressSelector_addressListElement": true,
          "mx_AddressSelector_selected": this.state.selected === i
        }); // NOTE: Defaulting to "vector" as the network, until the network backend stuff is done.
        // Saving the addressListElement so we can use it to work out, in the componentDidUpdate
        // method, how far to scroll when using the arrow keys

        addressList.push( /*#__PURE__*/_react.default.createElement("div", {
          className: classes,
          onClick: this.onClick.bind(this, i),
          onMouseEnter: this.onMouseEnter.bind(this, i),
          onMouseLeave: this.onMouseLeave,
          key: this.props.addressList[i].addressType + "/" + this.props.addressList[i].address,
          ref: ref => {
            this.addressListElement = ref;
          }
        }, /*#__PURE__*/_react.default.createElement(AddressTile, {
          address: this.props.addressList[i],
          showAddress: this.props.showAddress,
          justified: true,
          networkName: "vector",
          networkUrl: require("../../../../res/img/search-icon-vector.svg")
        })));
      }
    }

    return addressList;
  }

  _maxSelected(list) {
    const listSize = list.length === 0 ? 0 : list.length - 1;
    const maxSelected = listSize > this.props.truncateAt - 1 ? this.props.truncateAt - 1 : listSize;
    return maxSelected;
  }

  render() {
    const classes = (0, _classnames.default)({
      "mx_AddressSelector": true,
      "mx_AddressSelector_empty": this.props.addressList.length === 0
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      ref: ref => {
        this.scrollElement = ref;
      }
    }, this.props.header, this.createAddressListTiles());
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  onSelected: _propTypes.default.func.isRequired,
  // List of the addresses to display
  addressList: _propTypes.default.arrayOf(_UserAddress.UserAddressType).isRequired,
  // Whether to show the address on the address tiles
  showAddress: _propTypes.default.bool,
  truncateAt: _propTypes.default.number.isRequired,
  selected: _propTypes.default.number,
  // Element to put as a header on top of the list
  header: _propTypes.default.node
}), _temp)) || _class);
exports.default = AddressSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FkZHJlc3NTZWxlY3Rvci5qcyJdLCJuYW1lcyI6WyJBZGRyZXNzU2VsZWN0b3IiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdGF0ZSIsInNlbGVjdGVkIiwic2V0U3RhdGUiLCJob3ZlciIsIl9tYXhTZWxlY3RlZCIsImFkZHJlc3NMaXN0Iiwic2VsZWN0QWRkcmVzcyIsImluZGV4IiwibGVuZ3RoIiwib25TZWxlY3RlZCIsInVuZGVmaW5lZCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibWF4U2VsZWN0ZWQiLCJjb21wb25lbnREaWRVcGRhdGUiLCJzY3JvbGxFbGVtZW50IiwiZWxlbWVudEhlaWdodCIsImFkZHJlc3NMaXN0RWxlbWVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImhlaWdodCIsInNjcm9sbFRvcCIsImNyZWF0ZUFkZHJlc3NMaXN0VGlsZXMiLCJBZGRyZXNzVGlsZSIsInNkayIsImdldENvbXBvbmVudCIsImkiLCJjbGFzc2VzIiwicHVzaCIsIm9uQ2xpY2siLCJiaW5kIiwib25Nb3VzZUVudGVyIiwib25Nb3VzZUxlYXZlIiwiYWRkcmVzc1R5cGUiLCJhZGRyZXNzIiwicmVmIiwic2hvd0FkZHJlc3MiLCJyZXF1aXJlIiwibGlzdCIsImxpc3RTaXplIiwidHJ1bmNhdGVBdCIsInJlbmRlciIsImhlYWRlciIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiYXJyYXlPZiIsIlVzZXJBZGRyZXNzVHlwZSIsImJvb2wiLCJudW1iZXIiLCJub2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxlLFdBRHBCLGdEQUFxQixnQ0FBckIsQyxtQ0FBRCxNQUNxQkEsZUFEckIsU0FDNkNDLGVBQU1DLFNBRG5ELENB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QyxhQUFLbkIsYUFBTCxHQUFxQm1CLEdBQXJCO0FBQTBCO0FBQWxFLE9BQ00sS0FBS2xDLEtBQUwsQ0FBV3lDLE1BRGpCLEVBRU0sS0FBS3BCLHNCQUFMLEVBRk4sQ0FESjtBQU1IOztBQTFKd0QsQyxzREFDdEM7QUFDZlgsRUFBQUEsVUFBVSxFQUFFZ0MsbUJBQVVDLElBQVYsQ0FBZUMsVUFEWjtBQUdmO0FBQ0F0QyxFQUFBQSxXQUFXLEVBQUVvQyxtQkFBVUcsT0FBVixDQUFrQkMsNEJBQWxCLEVBQW1DRixVQUpqQztBQUtmO0FBQ0FULEVBQUFBLFdBQVcsRUFBRU8sbUJBQVVLLElBTlI7QUFPZlIsRUFBQUEsVUFBVSxFQUFFRyxtQkFBVU0sTUFBVixDQUFpQkosVUFQZDtBQVFmMUMsRUFBQUEsUUFBUSxFQUFFd0MsbUJBQVVNLE1BUkw7QUFVZjtBQUNBUCxFQUFBQSxNQUFNLEVBQUVDLG1CQUFVTztBQVhILEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBVc2VyQWRkcmVzc1R5cGUgfSBmcm9tICcuLi8uLi8uLi9Vc2VyQWRkcmVzcyc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuQWRkcmVzc1NlbGVjdG9yXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGRyZXNzU2VsZWN0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uU2VsZWN0ZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLy8gTGlzdCBvZiB0aGUgYWRkcmVzc2VzIHRvIGRpc3BsYXlcbiAgICAgICAgYWRkcmVzc0xpc3Q6IFByb3BUeXBlcy5hcnJheU9mKFVzZXJBZGRyZXNzVHlwZSkuaXNSZXF1aXJlZCxcbiAgICAgICAgLy8gV2hldGhlciB0byBzaG93IHRoZSBhZGRyZXNzIG9uIHRoZSBhZGRyZXNzIHRpbGVzXG4gICAgICAgIHNob3dBZGRyZXNzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgdHJ1bmNhdGVBdDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgICBzZWxlY3RlZDogUHJvcFR5cGVzLm51bWJlcixcblxuICAgICAgICAvLyBFbGVtZW50IHRvIHB1dCBhcyBhIGhlYWRlciBvbiB0b3Agb2YgdGhlIGxpc3RcbiAgICAgICAgaGVhZGVyOiBQcm9wVHlwZXMubm9kZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy5zZWxlY3RlZCA9PT0gdW5kZWZpbmVkID8gMCA6IHRoaXMucHJvcHMuc2VsZWN0ZWQsXG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhwcm9wcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNlbGVjdGVkIGl0ZW0gaXNuJ3Qgb3V0c2lkZSB0aGUgbGlzdCBib3VuZHNcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkO1xuICAgICAgICBjb25zdCBtYXhTZWxlY3RlZCA9IHRoaXMuX21heFNlbGVjdGVkKHByb3BzLmFkZHJlc3NMaXN0KTtcbiAgICAgICAgaWYgKHNlbGVjdGVkID4gbWF4U2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZDogbWF4U2VsZWN0ZWQgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIC8vIEFzIHRoZSB1c2VyIHNjcm9sbHMgd2l0aCB0aGUgYXJyb3cga2V5cyBrZWVwIHRoZSBzZWxlY3RlZCBpdGVtXG4gICAgICAgIC8vIGF0IHRoZSB0b3Agb2YgdGhlIHdpbmRvdy5cbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsRWxlbWVudCAmJiB0aGlzLnByb3BzLmFkZHJlc3NMaXN0Lmxlbmd0aCA+IDAgJiYgIXRoaXMuc3RhdGUuaG92ZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRIZWlnaHQgPSB0aGlzLmFkZHJlc3NMaXN0RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wID0gKHRoaXMuc3RhdGUuc2VsZWN0ZWQgKiBlbGVtZW50SGVpZ2h0KSAtIGVsZW1lbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlU2VsZWN0aW9uVG9wID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiAwLFxuICAgICAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG1vdmVTZWxlY3Rpb25VcCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZCAtIDEsXG4gICAgICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbW92ZVNlbGVjdGlvbkRvd24gPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkIDwgdGhpcy5fbWF4U2VsZWN0ZWQodGhpcy5wcm9wcy5hZGRyZXNzTGlzdCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkICsgMSxcbiAgICAgICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjaG9vc2VTZWxlY3Rpb24gPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VsZWN0QWRkcmVzcyh0aGlzLnN0YXRlLnNlbGVjdGVkKTtcbiAgICB9O1xuXG4gICAgb25DbGljayA9IGluZGV4ID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RBZGRyZXNzKGluZGV4KTtcbiAgICB9O1xuXG4gICAgb25Nb3VzZUVudGVyID0gaW5kZXggPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiBpbmRleCxcbiAgICAgICAgICAgIGhvdmVyOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25Nb3VzZUxlYXZlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaG92ZXI6IGZhbHNlIH0pO1xuICAgIH07XG5cbiAgICBzZWxlY3RBZGRyZXNzID0gaW5kZXggPT4ge1xuICAgICAgICAvLyBPbmx5IHRyeSB0byBzZWxlY3QgYW4gYWRkcmVzcyBpZiBvbmUgZXhpc3RzXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmFkZHJlc3NMaXN0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdGVkKGluZGV4KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY3JlYXRlQWRkcmVzc0xpc3RUaWxlcygpIHtcbiAgICAgICAgY29uc3QgQWRkcmVzc1RpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuQWRkcmVzc1RpbGVcIik7XG4gICAgICAgIGNvbnN0IG1heFNlbGVjdGVkID0gdGhpcy5fbWF4U2VsZWN0ZWQodGhpcy5wcm9wcy5hZGRyZXNzTGlzdCk7XG4gICAgICAgIGNvbnN0IGFkZHJlc3NMaXN0ID0gW107XG5cbiAgICAgICAgLy8gT25seSBjcmVhdGUgdGhlIGFkZHJlc3MgZWxlbWVudHMgaWYgdGhlcmUgYXJlIGFkZHJlc3NcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYWRkcmVzc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbWF4U2VsZWN0ZWQ7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICAgICAgXCJteF9BZGRyZXNzU2VsZWN0b3JfYWRkcmVzc0xpc3RFbGVtZW50XCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIFwibXhfQWRkcmVzc1NlbGVjdG9yX3NlbGVjdGVkXCI6IHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09IGksXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBEZWZhdWx0aW5nIHRvIFwidmVjdG9yXCIgYXMgdGhlIG5ldHdvcmssIHVudGlsIHRoZSBuZXR3b3JrIGJhY2tlbmQgc3R1ZmYgaXMgZG9uZS5cbiAgICAgICAgICAgICAgICAvLyBTYXZpbmcgdGhlIGFkZHJlc3NMaXN0RWxlbWVudCBzbyB3ZSBjYW4gdXNlIGl0IHRvIHdvcmsgb3V0LCBpbiB0aGUgY29tcG9uZW50RGlkVXBkYXRlXG4gICAgICAgICAgICAgICAgLy8gbWV0aG9kLCBob3cgZmFyIHRvIHNjcm9sbCB3aGVuIHVzaW5nIHRoZSBhcnJvdyBrZXlzXG4gICAgICAgICAgICAgICAgYWRkcmVzc0xpc3QucHVzaChcbiAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrLmJpbmQodGhpcywgaSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMub25Nb3VzZUVudGVyLmJpbmQodGhpcywgaSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMub25Nb3VzZUxlYXZlfVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt0aGlzLnByb3BzLmFkZHJlc3NMaXN0W2ldLmFkZHJlc3NUeXBlICsgXCIvXCIgKyB0aGlzLnByb3BzLmFkZHJlc3NMaXN0W2ldLmFkZHJlc3N9XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9eyhyZWYpID0+IHsgdGhpcy5hZGRyZXNzTGlzdEVsZW1lbnQgPSByZWY7IH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBZGRyZXNzVGlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M9e3RoaXMucHJvcHMuYWRkcmVzc0xpc3RbaV19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0FkZHJlc3M9e3RoaXMucHJvcHMuc2hvd0FkZHJlc3N9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmaWVkPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldHdvcmtOYW1lPVwidmVjdG9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXR3b3JrVXJsPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9zZWFyY2gtaWNvbi12ZWN0b3Iuc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFkZHJlc3NMaXN0O1xuICAgIH1cblxuICAgIF9tYXhTZWxlY3RlZChsaXN0KSB7XG4gICAgICAgIGNvbnN0IGxpc3RTaXplID0gbGlzdC5sZW5ndGggPT09IDAgPyAwIDogbGlzdC5sZW5ndGggLSAxO1xuICAgICAgICBjb25zdCBtYXhTZWxlY3RlZCA9IGxpc3RTaXplID4gKHRoaXMucHJvcHMudHJ1bmNhdGVBdCAtIDEpID8gKHRoaXMucHJvcHMudHJ1bmNhdGVBdCAtIDEpIDogbGlzdFNpemU7XG4gICAgICAgIHJldHVybiBtYXhTZWxlY3RlZDtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfQWRkcmVzc1NlbGVjdG9yXCI6IHRydWUsXG4gICAgICAgICAgICBcIm14X0FkZHJlc3NTZWxlY3Rvcl9lbXB0eVwiOiB0aGlzLnByb3BzLmFkZHJlc3NMaXN0Lmxlbmd0aCA9PT0gMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSByZWY9eyhyZWYpID0+IHt0aGlzLnNjcm9sbEVsZW1lbnQgPSByZWY7fX0+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmhlYWRlciB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLmNyZWF0ZUFkZHJlc3NMaXN0VGlsZXMoKSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=