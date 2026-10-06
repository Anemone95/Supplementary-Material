"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd

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
class AddressSelector extends _react.default.Component {
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

}

exports.default = AddressSelector;
(0, _defineProperty2.default)(AddressSelector, "propTypes", {
  onSelected: _propTypes.default.func.isRequired,
  // List of the addresses to display
  addressList: _propTypes.default.arrayOf(_UserAddress.UserAddressType).isRequired,
  // Whether to show the address on the address tiles
  showAddress: _propTypes.default.bool,
  truncateAt: _propTypes.default.number.isRequired,
  selected: _propTypes.default.number,
  // Element to put as a header on top of the list
  header: _propTypes.default.node
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FkZHJlc3NTZWxlY3Rvci5qcyJdLCJuYW1lcyI6WyJBZGRyZXNzU2VsZWN0b3IiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdGF0ZSIsInNlbGVjdGVkIiwic2V0U3RhdGUiLCJob3ZlciIsIl9tYXhTZWxlY3RlZCIsImFkZHJlc3NMaXN0Iiwic2VsZWN0QWRkcmVzcyIsImluZGV4IiwibGVuZ3RoIiwib25TZWxlY3RlZCIsInVuZGVmaW5lZCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibWF4U2VsZWN0ZWQiLCJjb21wb25lbnREaWRVcGRhdGUiLCJzY3JvbGxFbGVtZW50IiwiZWxlbWVudEhlaWdodCIsImFkZHJlc3NMaXN0RWxlbWVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImhlaWdodCIsInNjcm9sbFRvcCIsImNyZWF0ZUFkZHJlc3NMaXN0VGlsZXMiLCJBZGRyZXNzVGlsZSIsInNkayIsImdldENvbXBvbmVudCIsImkiLCJjbGFzc2VzIiwicHVzaCIsIm9uQ2xpY2siLCJiaW5kIiwib25Nb3VzZUVudGVyIiwib25Nb3VzZUxlYXZlIiwiYWRkcmVzc1R5cGUiLCJhZGRyZXNzIiwicmVmIiwic2hvd0FkZHJlc3MiLCJyZXF1aXJlIiwibGlzdCIsImxpc3RTaXplIiwidHJ1bmNhdGVBdCIsInJlbmRlciIsImhlYWRlciIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiYXJyYXlPZiIsIlVzZXJBZGRyZXNzVHlwZSIsImJvb2wiLCJudW1iZXIiLCJub2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QWhCO0FBQXlCLE1BQUEsR0FBRyxFQUFHUSxHQUFELElBQVM7QUFBQyxhQUFLbkIsYUFBTCxHQUFxQm1CLEdBQXJCO0FBQTBCO0FBQWxFLE9BQ00sS0FBS2xDLEtBQUwsQ0FBV3lDLE1BRGpCLEVBRU0sS0FBS3BCLHNCQUFMLEVBRk4sQ0FESjtBQU1IOztBQTFKd0Q7Ozs4QkFBeEN6QixlLGVBQ0U7QUFDZmMsRUFBQUEsVUFBVSxFQUFFZ0MsbUJBQVVDLElBQVYsQ0FBZUMsVUFEWjtBQUdmO0FBQ0F0QyxFQUFBQSxXQUFXLEVBQUVvQyxtQkFBVUcsT0FBVixDQUFrQkMsNEJBQWxCLEVBQW1DRixVQUpqQztBQUtmO0FBQ0FULEVBQUFBLFdBQVcsRUFBRU8sbUJBQVVLLElBTlI7QUFPZlIsRUFBQUEsVUFBVSxFQUFFRyxtQkFBVU0sTUFBVixDQUFpQkosVUFQZDtBQVFmMUMsRUFBQUEsUUFBUSxFQUFFd0MsbUJBQVVNLE1BUkw7QUFVZjtBQUNBUCxFQUFBQSxNQUFNLEVBQUVDLG1CQUFVTztBQVhILEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBVc2VyQWRkcmVzc1R5cGUgfSBmcm9tICcuLi8uLi8uLi9Vc2VyQWRkcmVzcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkZHJlc3NTZWxlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25TZWxlY3RlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyBMaXN0IG9mIHRoZSBhZGRyZXNzZXMgdG8gZGlzcGxheVxuICAgICAgICBhZGRyZXNzTGlzdDogUHJvcFR5cGVzLmFycmF5T2YoVXNlckFkZHJlc3NUeXBlKS5pc1JlcXVpcmVkLFxuICAgICAgICAvLyBXaGV0aGVyIHRvIHNob3cgdGhlIGFkZHJlc3Mgb24gdGhlIGFkZHJlc3MgdGlsZXNcbiAgICAgICAgc2hvd0FkZHJlc3M6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICB0cnVuY2F0ZUF0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgICAgIHNlbGVjdGVkOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gICAgICAgIC8vIEVsZW1lbnQgdG8gcHV0IGFzIGEgaGVhZGVyIG9uIHRvcCBvZiB0aGUgbGlzdFxuICAgICAgICBoZWFkZXI6IFByb3BUeXBlcy5ub2RlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLnNlbGVjdGVkID09PSB1bmRlZmluZWQgPyAwIDogdGhpcy5wcm9wcy5zZWxlY3RlZCxcbiAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2VsZWN0ZWQgaXRlbSBpc24ndCBvdXRzaWRlIHRoZSBsaXN0IGJvdW5kc1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQ7XG4gICAgICAgIGNvbnN0IG1heFNlbGVjdGVkID0gdGhpcy5fbWF4U2VsZWN0ZWQocHJvcHMuYWRkcmVzc0xpc3QpO1xuICAgICAgICBpZiAoc2VsZWN0ZWQgPiBtYXhTZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBtYXhTZWxlY3RlZCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgLy8gQXMgdGhlIHVzZXIgc2Nyb2xscyB3aXRoIHRoZSBhcnJvdyBrZXlzIGtlZXAgdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICAgICAgLy8gYXQgdGhlIHRvcCBvZiB0aGUgd2luZG93LlxuICAgICAgICBpZiAodGhpcy5zY3JvbGxFbGVtZW50ICYmIHRoaXMucHJvcHMuYWRkcmVzc0xpc3QubGVuZ3RoID4gMCAmJiAhdGhpcy5zdGF0ZS5ob3Zlcikge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudEhlaWdodCA9IHRoaXMuYWRkcmVzc0xpc3RFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AgPSAodGhpcy5zdGF0ZS5zZWxlY3RlZCAqIGVsZW1lbnRIZWlnaHQpIC0gZWxlbWVudEhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVTZWxlY3Rpb25Ub3AgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbW92ZVNlbGVjdGlvblVwID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkIC0gMSxcbiAgICAgICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBtb3ZlU2VsZWN0aW9uRG93biA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQgPCB0aGlzLl9tYXhTZWxlY3RlZCh0aGlzLnByb3BzLmFkZHJlc3NMaXN0KSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWQgKyAxLFxuICAgICAgICAgICAgICAgIGhvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNob29zZVNlbGVjdGlvbiA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RBZGRyZXNzKHRoaXMuc3RhdGUuc2VsZWN0ZWQpO1xuICAgIH07XG5cbiAgICBvbkNsaWNrID0gaW5kZXggPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdEFkZHJlc3MoaW5kZXgpO1xuICAgIH07XG5cbiAgICBvbk1vdXNlRW50ZXIgPSBpbmRleCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWQ6IGluZGV4LFxuICAgICAgICAgICAgaG92ZXI6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbk1vdXNlTGVhdmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBob3ZlcjogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIHNlbGVjdEFkZHJlc3MgPSBpbmRleCA9PiB7XG4gICAgICAgIC8vIE9ubHkgdHJ5IHRvIHNlbGVjdCBhbiBhZGRyZXNzIGlmIG9uZSBleGlzdHNcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYWRkcmVzc0xpc3QubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uU2VsZWN0ZWQoaW5kZXgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhvdmVyOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjcmVhdGVBZGRyZXNzTGlzdFRpbGVzKCkge1xuICAgICAgICBjb25zdCBBZGRyZXNzVGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5BZGRyZXNzVGlsZVwiKTtcbiAgICAgICAgY29uc3QgbWF4U2VsZWN0ZWQgPSB0aGlzLl9tYXhTZWxlY3RlZCh0aGlzLnByb3BzLmFkZHJlc3NMaXN0KTtcbiAgICAgICAgY29uc3QgYWRkcmVzc0xpc3QgPSBbXTtcblxuICAgICAgICAvLyBPbmx5IGNyZWF0ZSB0aGUgYWRkcmVzcyBlbGVtZW50cyBpZiB0aGVyZSBhcmUgYWRkcmVzc1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hZGRyZXNzTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBtYXhTZWxlY3RlZDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICAgICBcIm14X0FkZHJlc3NTZWxlY3Rvcl9hZGRyZXNzTGlzdEVsZW1lbnRcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgXCJteF9BZGRyZXNzU2VsZWN0b3Jfc2VsZWN0ZWRcIjogdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIE5PVEU6IERlZmF1bHRpbmcgdG8gXCJ2ZWN0b3JcIiBhcyB0aGUgbmV0d29yaywgdW50aWwgdGhlIG5ldHdvcmsgYmFja2VuZCBzdHVmZiBpcyBkb25lLlxuICAgICAgICAgICAgICAgIC8vIFNhdmluZyB0aGUgYWRkcmVzc0xpc3RFbGVtZW50IHNvIHdlIGNhbiB1c2UgaXQgdG8gd29yayBvdXQsIGluIHRoZSBjb21wb25lbnREaWRVcGRhdGVcbiAgICAgICAgICAgICAgICAvLyBtZXRob2QsIGhvdyBmYXIgdG8gc2Nyb2xsIHdoZW4gdXNpbmcgdGhlIGFycm93IGtleXNcbiAgICAgICAgICAgICAgICBhZGRyZXNzTGlzdC5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2suYmluZCh0aGlzLCBpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbk1vdXNlRW50ZXIuYmluZCh0aGlzLCBpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbk1vdXNlTGVhdmV9XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3RoaXMucHJvcHMuYWRkcmVzc0xpc3RbaV0uYWRkcmVzc1R5cGUgKyBcIi9cIiArIHRoaXMucHJvcHMuYWRkcmVzc0xpc3RbaV0uYWRkcmVzc31cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17KHJlZikgPT4geyB0aGlzLmFkZHJlc3NMaXN0RWxlbWVudCA9IHJlZjsgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFkZHJlc3NUaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzcz17dGhpcy5wcm9wcy5hZGRyZXNzTGlzdFtpXX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93QWRkcmVzcz17dGhpcy5wcm9wcy5zaG93QWRkcmVzc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZpZWQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya05hbWU9XCJ2ZWN0b3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldHdvcmtVcmw9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3NlYXJjaC1pY29uLXZlY3Rvci5zdmdcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWRkcmVzc0xpc3Q7XG4gICAgfVxuXG4gICAgX21heFNlbGVjdGVkKGxpc3QpIHtcbiAgICAgICAgY29uc3QgbGlzdFNpemUgPSBsaXN0Lmxlbmd0aCA9PT0gMCA/IDAgOiBsaXN0Lmxlbmd0aCAtIDE7XG4gICAgICAgIGNvbnN0IG1heFNlbGVjdGVkID0gbGlzdFNpemUgPiAodGhpcy5wcm9wcy50cnVuY2F0ZUF0IC0gMSkgPyAodGhpcy5wcm9wcy50cnVuY2F0ZUF0IC0gMSkgOiBsaXN0U2l6ZTtcbiAgICAgICAgcmV0dXJuIG1heFNlbGVjdGVkO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgXCJteF9BZGRyZXNzU2VsZWN0b3JcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfQWRkcmVzc1NlbGVjdG9yX2VtcHR5XCI6IHRoaXMucHJvcHMuYWRkcmVzc0xpc3QubGVuZ3RoID09PSAwLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9IHJlZj17KHJlZikgPT4ge3RoaXMuc2Nyb2xsRWxlbWVudCA9IHJlZjt9fT5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuaGVhZGVyIH1cbiAgICAgICAgICAgICAgICB7IHRoaXMuY3JlYXRlQWRkcmVzc0xpc3RUaWxlcygpIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==