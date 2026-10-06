import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import numeral from 'numeral';

import { Spinner } from 'components/common';

import MetricsExtractor from 'logic/metrics/MetricsExtractor';

import StoreProvider from 'injection/StoreProvider';
const MetricsStore = StoreProvider.getStore('Metrics');

import ActionsProvider from 'injection/ActionsProvider';
const MetricsActions = ActionsProvider.getActions('Metrics');

// TODO this is a copy of GlobalTroughput, it just renders differently and only targets a single node.
const NodeThroughput = React.createClass({
  propTypes: {
    nodeId: PropTypes.string.isRequired,
    longFormat: PropTypes.bool,
  },
  mixins: [Reflux.connect(MetricsStore)],
  getDefaultProps() {
    return {
      longFormat: false,
    };
  },
  componentWillMount() {
    this.metricNames = {
      totalIn: 'org.graylog2.throughput.input.1-sec-rate',
      totalOut: 'org.graylog2.throughput.output.1-sec-rate',
    };

    Object.keys(this.metricNames).forEach(metricShortName => MetricsActions.add(this.props.nodeId, this.metricNames[metricShortName]));
  },
  componentWillUnmount() {
    Object.keys(this.metricNames).forEach(metricShortName => MetricsActions.remove(this.props.nodeId, this.metricNames[metricShortName]));
  },
  _isLoading() {
    return !this.state.metrics;
  },
  _formatThroughput(metrics) {
    if (this.props.longFormat) {
      return (
        <span>
          处理 <strong>{numeral(metrics.totalIn).format('0,0')}</strong> 进入和 <strong>
            {numeral(metrics.totalOut).format('0,0')}</strong> 流出 消息/秒。
        </span>
      );
    }
    return (
      <span>
          输入 {numeral(metrics.totalIn).format('0,0')} / 输出 {numeral(metrics.totalOut).format('0,0')} 消息/秒。
        </span>
    );
  },
  render() {
    if (this._isLoading()) {
      return <Spinner text="正在加载吞吐量..." />;
    }

    const nodeId = this.props.nodeId;
    const nodeMetrics = this.state.metrics[nodeId];
    const metrics = MetricsExtractor.getValuesForNode(nodeMetrics, this.metricNames);

    if (Object.keys(metrics).length === 0) {
      return (<span>无法加载吞吐量。</span>);
    }

    return this._formatThroughput(metrics);
  },
});

export default NodeThroughput;
