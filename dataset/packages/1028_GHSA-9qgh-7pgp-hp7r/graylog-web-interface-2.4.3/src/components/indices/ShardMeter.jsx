import PropTypes from 'prop-types';
import React from 'react';
import numeral from 'numeral';
import moment from 'moment';

const ShardMeter = React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    shardMeter: PropTypes.object.isRequired,
  },
  _formatMeter(meter) {
    const value = <span>{numeral(meter.total).format('0,0')} ops</span>;

    if (meter.total > 0) {
      return <span>{value} <span title={`${meter.time_seconds}s`}>(took {moment.duration(meter.time_seconds, 'seconds').humanize()})</span></span>;
    }

    return value;
  },
  render() {
    const sm = this.props.shardMeter;
    return (
      <span>
        <h3 style={{ display: 'inline' }}>{this.props.title}</h3>
        <dl>
          <dt>索引:</dt>
          <dd>{this._formatMeter(sm.index)}</dd>

          <dt>刷新:</dt>
          <dd>{this._formatMeter(sm.flush)}</dd>

          <dt>合并:</dt>
          <dd>{this._formatMeter(sm.merge)}</dd>

          <dt>查询:</dt>
          <dd>{this._formatMeter(sm.search_query)}</dd>

          <dt>提取:</dt>
          <dd>{this._formatMeter(sm.search_fetch)}</dd>

          <dt>获得:</dt>
          <dd>{this._formatMeter(sm.get)}</dd>

          <dt>更新:</dt>
          <dd>{this._formatMeter(sm.refresh)}</dd>
        </dl>
      </span>
    );
  },
});

export default ShardMeter;
