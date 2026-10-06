import PropTypes from 'prop-types';
import React from 'react';
import { ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';

import ActionsProvider from 'injection/ActionsProvider';
const DeflectorActions = ActionsProvider.getActions('Deflector');
const IndexRangesActions = ActionsProvider.getActions('IndexRanges');

import StoreProvider from 'injection/StoreProvider';
const DeflectorStore = StoreProvider.getStore('Deflector'); // eslint-disable-line no-unused-vars

const IndicesMaintenanceDropdown = React.createClass({
  propTypes: {
    indexSetId: PropTypes.string.isRequired,
    indexSet: PropTypes.object,
  },

  _onRecalculateIndexRange() {
    if (window.confirm('这将会使用后台系统脚本重新计算这个索引集的索引段。你想继续吗?')) {
      IndexRangesActions.recalculate(this.props.indexSetId);
    }
  },
  _onCycleDeflector() {
    if (window.confirm('这将会手动地在这个索引集中循环当前的正进行的写索引，您想要继续吗?')) {
      DeflectorActions.cycle(this.props.indexSetId).then(() => {
        DeflectorActions.list(this.props.indexSetId);
      });
    }
  },
  render() {
    let cycleButton;
    if (this.props.indexSet && this.props.indexSet.writable) {
      cycleButton = <MenuItem eventKey="2" onClick={this._onCycleDeflector}>循环正进行的写索引</MenuItem>;
    }
    return (
      <ButtonGroup>
        <DropdownButton bsStyle="info" title="维护" id="indices-maintenance-actions" pullRight>
          <MenuItem eventKey="1" onClick={this._onRecalculateIndexRange}>重新计算索引段</MenuItem>
          {cycleButton}
        </DropdownButton>
      </ButtonGroup>
    );
  },
});

export default IndicesMaintenanceDropdown;
