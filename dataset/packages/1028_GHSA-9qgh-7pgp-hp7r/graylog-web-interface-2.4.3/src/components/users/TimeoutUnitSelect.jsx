
import React from 'react';

const TimeoutUnitSelect = React.createClass({
  getValue() {
    return this.refs.session_timeout_unit.value;
  },
  render() {
    return (
      <select className="form-control" ref="session_timeout_unit" {...this.props}>
        <option value={1000}>秒</option>
        <option value={60 * 1000}>分</option>
        <option value={60 * 60 * 1000}>时</option>
        <option value={24 * 60 * 60 * 1000}>天</option>
      </select>
    );
  },
});

export default TimeoutUnitSelect;
