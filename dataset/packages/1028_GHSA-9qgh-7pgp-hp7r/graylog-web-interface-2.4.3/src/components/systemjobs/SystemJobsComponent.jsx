import React from 'react';
import Reflux from 'reflux';
import { Col, Row } from 'react-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const SystemJobsStore = StoreProvider.getStore('SystemJobs');

import ActionsProvider from 'injection/ActionsProvider';
const SystemJobsActions = ActionsProvider.getActions('SystemJobs');

import { Spinner } from 'components/common';
import { SystemJobsList } from 'components/systemjobs';

const SystemJobsComponent = React.createClass({
  mixins: [Reflux.connect(SystemJobsStore)],
  componentDidMount() {
    SystemJobsActions.list();

    this.interval = setInterval(SystemJobsActions.list, 2000);
  },
  componentWillUnmount() {
    clearInterval(this.interval);
  },
  render() {
    if (!this.state.jobs) {
      return <Spinner />;
    }
    const jobs = Object.keys(this.state.jobs)
      .map(nodeId => this.state.jobs[nodeId] ? this.state.jobs[nodeId].jobs : [])
      .reduce((a, b) => a.concat(b));
    return (
      <Row className="content">
        <Col md={12}>
          <h2>系统脚本</h2>
          <p className="description">
            由于维护原因，系统脚本是一个，由Graylog服务器节点出于维护的原因而执行的长时间任务。有些脚本如果没有停止就会提供进度信息。
          </p>

          <SystemJobsList jobs={jobs} />
        </Col>
      </Row>
    );
  },
});

export default SystemJobsComponent;
