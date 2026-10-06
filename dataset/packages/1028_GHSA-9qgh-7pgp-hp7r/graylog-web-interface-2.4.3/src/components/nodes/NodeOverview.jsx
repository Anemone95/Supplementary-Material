import PropTypes from 'prop-types';
import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Row, Col, Button } from 'react-bootstrap';

import BufferUsage from './BufferUsage';
import SystemOverviewDetails from './SystemOverviewDetails';
import JvmHeapUsage from './JvmHeapUsage';
import JournalDetails from './JournalDetails';
import SystemInformation from './SystemInformation';
import RestApiOverview from './RestApiOverview';
import PluginsDataTable from './PluginsDataTable';
import InputTypesDataTable from './InputTypesDataTable';

import Routes from 'routing/Routes';

const NodeOverview = React.createClass({
  propTypes: {
    node: PropTypes.object.isRequired,
    systemOverview: PropTypes.object.isRequired,
    jvmInformation: PropTypes.object,
    plugins: PropTypes.array,
    inputDescriptions: PropTypes.object,
    inputStates: PropTypes.array,
  },
  render() {
    const node = this.props.node;
    const systemOverview = this.props.systemOverview;

    let pluginCount;
    if (this.props.plugins) {
      pluginCount = `${this.props.plugins.length} 插件安装`;
    }

    let inputCount;
    if (this.props.inputStates) {
      const runningInputs = this.props.inputStates.filter(inputState => inputState.state.toUpperCase() === 'RUNNING');
      inputCount = `${runningInputs.length} 输入在此节点上运行`;
    }

    return (
      <div>
        <Row className="content">
          <Col md={12}>
            <SystemOverviewDetails node={node} information={systemOverview} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2 style={{ marginBottom: 5 }}>内存/堆使用</h2>
            <JvmHeapUsage nodeId={node.node_id} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2>缓冲区</h2>
            <p className="description">
              缓冲区是为了在通过不同处理器的路上，在短时间（通常是毫秒）内缓存少量的消息而构建的。
            </p>
            <Row>
              <Col md={4}>
                <BufferUsage nodeId={node.node_id} title="输入缓冲区" bufferType="input" />
              </Col>
              <Col md={4}>
                <BufferUsage nodeId={node.node_id} title="进程缓冲区" bufferType="process" />
              </Col>
              <Col md={4}>
                <BufferUsage nodeId={node.node_id} title="输出缓冲区" bufferType="output" />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2>磁盘日志</h2>
            <p className="description">
              传入的消息被写入到磁盘日志中，以确保在发生服务器故障的情况下它们的安全。如果任何输出速度太慢以至于不能跟上消息速率，或者每当传入消息出现高峰时，该日志还有助于保持Graylog的正常工作。它确保Graylog不会缓存主内存中的所有消息，并避免过长的垃圾回收暂停。
            </p>
            <JournalDetails nodeId={node.node_id} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={6}>
            <h2>系统</h2>
            <SystemInformation node={node} systemInformation={systemOverview} jvmInformation={this.props.jvmInformation} />
          </Col>
          <Col md={6}>
            <h2>REST API</h2>
            <RestApiOverview node={node} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2>安装插件 <small>{pluginCount}</small></h2>
            <PluginsDataTable plugins={this.props.plugins} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <span className="pull-right">
              <LinkContainer to={Routes.node_inputs(node.node_id)}>
                <Button bsStyle="success" bsSize="small">管理输入</Button>
              </LinkContainer>
            </span>
            <h2 style={{ marginBottom: 15 }}>可用的输入类型 <small>{inputCount}</small></h2>
            <InputTypesDataTable inputDescriptions={this.props.inputDescriptions} />
          </Col>
        </Row>
      </div>
    );
  },
});

export default NodeOverview;
