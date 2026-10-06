import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import numeral from 'numeral';

import { Pluralize, Spinner } from 'components/common';

import MetricsExtractor from 'logic/metrics/MetricsExtractor';

import StoreProvider from 'injection/StoreProvider';
const MetricsStore = StoreProvider.getStore('Metrics');

import ActionsProvider from 'injection/ActionsProvider';
const MetricsActions = ActionsProvider.getActions('Metrics');

const JournalState = React.createClass({
  propTypes: {
    nodeId: PropTypes.string.isRequired,
  },
  mixins: [Reflux.connect(MetricsStore)],
  componentWillMount() {
    this.metricNames = {
      append: 'org.graylog2.journal.append.1-sec-rate',
      read: 'org.graylog2.journal.read.1-sec-rate',
      segments: 'org.graylog2.journal.segments',
      entriesUncommitted: 'org.graylog2.journal.entries-uncommitted',
    };
    Object.keys(this.metricNames).forEach(metricShortName => MetricsActions.add(this.props.nodeId, this.metricNames[metricShortName]));
  },
  componentWillUnmount() {
    Object.keys(this.metricNames).forEach(metricShortName => MetricsActions.remove(this.props.nodeId, this.metricNames[metricShortName]));
  },
  _isLoading() {
    return !this.state.metrics;
  },
  render() {
    if (this._isLoading()) {
      return <Spinner text="正在加载日志指标..." />;
    }

    const nodeId = this.props.nodeId;
    const nodeMetrics = this.state.metrics[nodeId];
    const metrics = MetricsExtractor.getValuesForNode(nodeMetrics, this.metricNames);

    if (Object.keys(metrics).length === 0) {
      return <span>日志指标不可用。</span>;
    }

    return (
      <span>
        该日志包括了<strong>{numeral(metrics.entriesUncommitted).format('0,0')} 未处理的消息</strong> 在 {metrics.segments}
        {' '}<Pluralize value={metrics.segments} singular="段" plural="段" />.{' '}
        <strong>{numeral(metrics.append).format('0,0')} 消息</strong> 被附加, <strong>
          {numeral(metrics.read).format('0,0')} 消息</strong> 在最后一秒被读取。
      </span>
    );
  },
});

export default JournalState;
