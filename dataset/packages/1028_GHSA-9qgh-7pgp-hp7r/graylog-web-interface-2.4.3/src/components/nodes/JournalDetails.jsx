import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { LinkContainer } from 'react-router-bootstrap';
import { ProgressBar, Row, Col, Alert } from 'react-bootstrap';
import numeral from 'numeral';
import moment from 'moment';
import {} from 'moment-duration-format';

import MetricsExtractor from 'logic/metrics/MetricsExtractor';

import ActionsProvider from 'injection/ActionsProvider';
const MetricsActions = ActionsProvider.getActions('Metrics');

import StoreProvider from 'injection/StoreProvider';
const MetricsStore = StoreProvider.getStore('Metrics');
const JournalStore = StoreProvider.getStore('Journal');

import { Spinner, Timestamp } from 'components/common';

import NumberUtils from 'util/NumberUtils';
import Routes from 'routing/Routes';

const JournalDetails = React.createClass({
  propTypes: {
    nodeId: PropTypes.string.isRequired,
  },
  mixins: [Reflux.connect(MetricsStore)],

  getInitialState() {
    return {
      journalInformation: undefined,
    };
  },

  componentDidMount() {
    JournalStore.get(this.props.nodeId).then((journalInformation) => {
      this.setState({ journalInformation: journalInformation }, this._listenToMetrics);
    });
  },

  componentWillUnmount() {
    if (this.metricNames) {
      Object.keys(this.metricNames).forEach(metricShortName => MetricsActions.remove(this.props.nodeId, this.metricNames[metricShortName]));
    }
  },

  _listenToMetrics() {
    // only listen for updates if the journal is actually turned on
    if (this.state.journalInformation.enabled) {
      this.metricNames = {
        append: 'org.graylog2.journal.append.1-sec-rate',
        read: 'org.graylog2.journal.read.1-sec-rate',
        segments: 'org.graylog2.journal.segments',
        entriesUncommitted: 'org.graylog2.journal.entries-uncommitted',
        utilizationRatio: 'org.graylog2.journal.utilization-ratio',
        oldestSegment: 'org.graylog2.journal.oldest-segment',
      };
      Object.keys(this.metricNames).forEach(metricShortName => MetricsActions.add(this.props.nodeId, this.metricNames[metricShortName]));
    }
  },

  _isLoading() {
    return !(this.state.metrics && this.state.journalInformation);
  },

  render() {
    if (this._isLoading()) {
      return <Spinner text="正在加载日志指标..." />;
    }

    const nodeId = this.props.nodeId;
    const nodeMetrics = this.state.metrics[nodeId];
    const journalInformation = this.state.journalInformation;

    if (!journalInformation.enabled) {
      return (
        <Alert bsStyle="warning">
          <i className="fa fa-exclamation-triangle" />&nbsp; 磁盘日志在此节点上处于禁用状态。
        </Alert>
      );
    }

    const metrics = this.metricNames ? MetricsExtractor.getValuesForNode(nodeMetrics, this.metricNames) : {};

    if (Object.keys(metrics).length === 0) {
      return (
        <Alert bsStyle="warning">
          <i className="fa fa-exclamation-triangle" />&nbsp; 日志指标不可用。
        </Alert>
      );
    }

    const oldestSegment = moment(metrics.oldestSegment);
    let overcommittedWarning;
    if (metrics.utilizationRatio >= 1) {
      overcommittedWarning = (
        <span>
          <strong>警告!</strong> 日志利用率超过了所定义的最大大小。
          {' '}<LinkContainer to={Routes.SYSTEM.OVERVIEW}><a>点击此处</a></LinkContainer>获得更多信息。<br />
        </span>
      );
    }

    return (
      <Row className="row-sm">
        <Col md={6}>
          <h3>配置</h3>
          <dl className="system-journal">
            <dt>路径:</dt>
            <dd>{journalInformation.journal_config.directory}</dd>
            <dt>最早的条目:</dt>
            <dd><Timestamp dateTime={oldestSegment} relative /></dd>
            <dt>最大大小:</dt>
            <dd>{NumberUtils.formatBytes(journalInformation.journal_config.max_size)}</dd>
            <dt>最大年龄:</dt>
            <dd>{moment.duration(journalInformation.journal_config.max_age).format('d [days] h [hours] m [minutes]')}</dd>
            <dt>刷新政策:</dt>
            <dd>
              每{numeral(journalInformation.journal_config.flush_interval).format('0,0')} 消息
              {' '}或 {moment.duration(journalInformation.journal_config.flush_age).format('h [hours] m [minutes] s [seconds]')}
            </dd>
          </dl>
        </Col>
        <Col md={6} className="journal-details-usage">
          <h3>利用率</h3>

          <ProgressBar now={metrics.utilizationRatio * 100}
                       label={NumberUtils.formatPercentage(metrics.utilizationRatio)} />

          {overcommittedWarning}

          <strong>{numeral(metrics.entriesUncommitted).format('0,0')} 未处理的消息</strong>
          {' '}当前在该日志上, 在 {metrics.segments} 段数。<br />
          <strong>{numeral(metrics.append).format('0,0')} 消息</strong>
          {' '}已经在最后一秒被附加了,{' '}
          <strong>{numeral(metrics.read).format('0,0')} 消息</strong>已经在最后一秒被读取过了。
        </Col>
      </Row>
    );
  },
});

export default JournalDetails;
