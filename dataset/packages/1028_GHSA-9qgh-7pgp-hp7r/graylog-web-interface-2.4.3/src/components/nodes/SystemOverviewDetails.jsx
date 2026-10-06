import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';

import { IfPermitted } from 'components/common';
import { DocumentationLink } from 'components/support';
import NodeThroughput from 'components/throughput/NodeThroughput';

import DocsHelper from 'util/DocsHelper';
import StringUtils from 'util/StringUtils';

import StoreProvider from 'injection/StoreProvider';
const SystemProcessingStore = StoreProvider.getStore('SystemProcessing');

const SystemOverviewDetails = React.createClass({
  propTypes: {
    node: PropTypes.object.isRequired,
    information: PropTypes.object.isRequired,
  },
  _toggleMessageProcessing() {
    if (confirm(`您确定在此节点中${this.props.information.is_processing ? '暂停' : '恢复'}消息处理吗?`)) {
      if (this.props.information.is_processing) {
        SystemProcessingStore.pause(this.props.node.node_id);
      } else {
        SystemProcessingStore.resume(this.props.node.node_id);
      }
    }
  },
  render() {
    const information = this.props.information;
    const lbStatus = information.lb_status.toUpperCase();
    let processingStatus;

    if (information.is_processing) {
      processingStatus = (
        <span>
          <i className="fa fa-info-circle" />&nbsp; <NodeThroughput nodeId={this.props.node.node_id} longFormat />
        </span>
      );
    } else {
      processingStatus = (
        <span>
          <i className="fa fa-exclamation-triangle" />&nbsp; 节点<strong>不</strong>处理消息
        </span>
      );
    }

    return (
      <Row>
        <Col md={4}>
          <Alert bsStyle="info">
            <span className="pull-right"> <DocumentationLink page={DocsHelper.PAGES.LOAD_BALANCERS} text="这是什么意思?" /></span>
            <i className="fa fa-exchange" />&nbsp;
            生命周期状态: <strong>{StringUtils.capitalizeFirstLetter(this.props.information.lifecycle)}</strong>
          </Alert>
        </Col>
        <Col md={4}>
          <Alert bsStyle={lbStatus === 'ALIVE' ? 'success' : 'danger'}>
            <span className="pull-right"> <DocumentationLink page={DocsHelper.PAGES.LOAD_BALANCERS} text="这是什么意思?" /></span>
            <i className="fa fa-heart" />&nbsp;
            标记为<strong>{lbStatus}</strong>用于负载均衡器
          </Alert>
        </Col>
        <Col md={4}>
          <Alert bsStyle={information.is_processing ? 'success' : 'danger'}>
            <IfPermitted permissions="processing:changestate">
              <span className="pull-right">
                <Button onClick={this._toggleMessageProcessing} bsSize="xsmall" bsStyle={information.is_processing ? 'danger' : 'success'}>
                  {information.is_processing ? '暂停' : '恢复'}处理
                </Button>
              </span>
            </IfPermitted>
            {processingStatus}
          </Alert>
        </Col>
      </Row>
    );
  },
});

export default SystemOverviewDetails;
