import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Row, Col } from 'react-bootstrap';

import NodeListItem from './NodeListItem';
import { Spinner, EntityList, Pluralize } from 'components/common';

import StoreProvider from 'injection/StoreProvider';
const NodesStore = StoreProvider.getStore('Nodes');
const ClusterOverviewStore = StoreProvider.getStore('ClusterOverview');

const NodesList = React.createClass({
  propTypes: {
    permissions: PropTypes.array.isRequired,
  },
  mixins: [Reflux.connect(NodesStore), Reflux.connect(ClusterOverviewStore)],
  _isLoading() {
    return !(this.state.nodes && this.state.clusterOverview);
  },
  _formatNodes(nodes, clusterOverview) {
    const nodeIDs = Object.keys(nodes);

    return nodeIDs.map((nodeID) => {
      return <NodeListItem key={nodeID} node={nodes[nodeID]} systemOverview={clusterOverview[nodeID]} />;
    });
  },
  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const nodesNo = Object.keys(this.state.nodes).length;

    return (
      <Row className="content">
        <Col md={12}>
          <h2>
            <Pluralize value={nodesNo} singular="有" plural="有" /> {nodesNo} 活动 <Pluralize value={nodesNo} singular="节点" plural="节点" />
          </h2>
          <EntityList bsNoItemsStyle="info" noItemsText="没有活动节点。"
                      items={this._formatNodes(this.state.nodes, this.state.clusterOverview)} />
        </Col>
      </Row>
    );
  },
});

export default NodesList;
