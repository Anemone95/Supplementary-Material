import PropTypes from 'prop-types';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { Spinner } from 'components/common';

import ActionsProvider from 'injection/ActionsProvider';
const IndicesActions = ActionsProvider.getActions('Indices');
const IndexRangesActions = ActionsProvider.getActions('IndexRanges');
import StoreProvider from 'injection/StoreProvider';
StoreProvider.getStore('IndexRanges'); // To make IndexRangesActions work.

import { IndexRangeSummary, ShardMeter, ShardRoutingOverview } from 'components/indices';

const IndexDetails = React.createClass({
  propTypes: {
    index: PropTypes.object.isRequired,
    indexName: PropTypes.string.isRequired,
    indexRange: PropTypes.object.isRequired,
    indexSetId: PropTypes.string.isRequired,
    isDeflector: PropTypes.bool.isRequired,
  },
  componentDidMount() {
    IndicesActions.subscribe(this.props.indexName);
  },
  componentWillUnmount() {
    IndicesActions.unsubscribe(this.props.indexName);
  },

  _formatActionButtons() {
    if (this.props.isDeflector) {
      return (
        <span>
          <Button bsStyle="warning" bsSize="xs" disabled>使用中的索引不能被关闭</Button>{' '}
          <Button bsStyle="danger" bsSize="xs" disabled>使用中的索引不能被删除</Button>
        </span>
      );
    }

    return (
      <span>
        <Button bsStyle="warning" bsSize="xs" onClick={this._onRecalculateIndex}>重新计算索引段</Button>{' '}
        <Button bsStyle="warning" bsSize="xs" onClick={this._onCloseIndex}>关闭索引</Button>{' '}
        <Button bsStyle="danger" bsSize="xs" onClick={this._onDeleteIndex}>删除索引</Button>
      </span>
    );
  },
  _onRecalculateIndex() {
    if (window.confirm(`确定重新计算索引${this.props.indexName}的索引段吗?`)) {
      IndexRangesActions.recalculateIndex(this.props.indexName).then(() => {
        IndicesActions.list(this.props.indexSetId);
      });
    }
  },
  _onCloseIndex() {
    if (window.confirm(`确定关闭索引${this.props.indexName}吗?`)) {
      IndicesActions.close(this.props.indexName).then(() => {
        IndicesActions.list(this.props.indexSetId);
      });
    }
  },
  _onDeleteIndex() {
    if (window.confirm(`确定删除索引${this.props.indexName}吗?`)) {
      IndicesActions.delete(this.props.indexName).then(() => {
        IndicesActions.list(this.props.indexSetId);
      });
    }
  },
  render() {
    if (!this.props.index || !this.props.index.all_shards) {
      return <Spinner />;
    }
    const { index, indexRange, indexName } = this.props;
    return (
      <div className="index-info">
        <IndexRangeSummary indexRange={indexRange} />{' '}

        {index.all_shards.segments} 段数,{' '}
        {index.all_shards.open_search_contexts} 打开搜索上下文,{' '}
        {index.all_shards.documents.deleted} 删除的消息

        <Row style={{ marginBottom: '10' }}>
          <Col md={4} className="shard-meters">
            <ShardMeter title="主分片操作" shardMeter={index.primary_shards} />
          </Col>
          <Col md={4} className="shard-meters">
            <ShardMeter title="总分片操作" shardMeter={index.all_shards} />
          </Col>
        </Row>

        <ShardRoutingOverview routing={index.routing} indexName={indexName} />

        <hr style={{ marginBottom: '5', marginTop: '10' }} />

        {this._formatActionButtons()}
      </div>
    );
  },
});

export default IndexDetails;
