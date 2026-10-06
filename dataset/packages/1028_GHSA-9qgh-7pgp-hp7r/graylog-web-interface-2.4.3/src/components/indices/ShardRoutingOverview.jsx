import PropTypes from 'prop-types';
import React from 'react';

import { ShardRouting } from 'components/indices';
import naturalSort from 'javascript-natural-sort';

const ShardRoutingOverview = React.createClass({
  propTypes: {
    routing: PropTypes.array.isRequired,
    indexName: PropTypes.string.isRequired,
  },
  render() {
    const { indexName, routing } = this.props;
    return (
      <div className="shard-routing">
        <h3>分片路由</h3>

        <ul className="shards">
          {routing
            .sort((shard1, shard2) => naturalSort(shard1.id, shard2.id))
            .map(route => <ShardRouting key={`${indexName}-shard-route-${route.node_id}-${route.id}`} route={route} />)}
        </ul>

        <br style={{ clear: 'both' }} />

        <div className="description">
          粗体的分片是基元，其他的是副本。当基元离开集群时，副本将自动升级为基元。大小和文档的计数只反映主碎片，不可能副本重复。
        </div>
      </div>
    );
  },
});

export default ShardRoutingOverview;
