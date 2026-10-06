import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';

import StoreProvider from 'injection/StoreProvider';
const NodesStore = StoreProvider.getStore('Nodes');
const MetricsStore = StoreProvider.getStore('Metrics');

import ActionsProvider from 'injection/ActionsProvider';
const MetricsActions = ActionsProvider.getActions('Metrics');

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { MetricsComponent } from 'components/metrics';

const ShowMetricsPage = React.createClass({
  propTypes: {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },
  mixins: [Reflux.connect(NodesStore), Reflux.connect(MetricsStore), Reflux.listenTo(NodesStore, '_getMetrics')],

  _getMetrics() {
    MetricsActions.names();
  },

  render() {
    if (!this.state.nodes || !this.state.metricsNames) {
      return <Spinner />;
    }

    let nodeId = this.props.params.nodeId;
    // "master" node ID is a placeholder for master node, get first master node ID
    if (nodeId === 'master') {
      const nodeIDs = Object.keys(this.state.nodes);
      const masterNodes = nodeIDs.filter(nodeID => this.state.nodes[nodeID].is_master);
      nodeId = masterNodes[0] || nodeIDs[0];
    }

    const node = this.state.nodes[nodeId];
    const title = <span>Metrics of node {node.short_node_id} / {node.hostname}</span>;
    const namespace = MetricsStore.namespace;
    const names = this.state.metricsNames[nodeId];
    const filter = this.props.location.query.filter;
    return (
      <DocumentTitle title={`节点${node.short_node_id} / ${node.hostname}的指标`}>
        <span>
          <PageHeader title={title}>
            <span>
              所有的Graylog节点都提供了一套用于诊断，调试和监控的内部指标。请注意，您也可以通过JMX访问所有指标。
            </span>
            <span>此节点总共报告了{names.length}个指标。</span>
          </PageHeader>

          <MetricsComponent names={names} namespace={namespace} nodeId={nodeId} filter={filter} />
        </span>
      </DocumentTitle>
    );
  },
});

export default ShowMetricsPage;
