import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Button } from 'react-bootstrap';

import ActionsProvider from 'injection/ActionsProvider';
const IndicesActions = ActionsProvider.getActions('Indices');

import { IndexRangeSummary } from 'components/indices';

const ClosedIndexDetails = React.createClass({
  propTypes: {
    indexName: PropTypes.string.isRequired,
    indexRange: PropTypes.object,
  },
  _onReopen() {
    IndicesActions.reopen(this.props.indexName);
  },
  _onDeleteIndex() {
    if (window.confirm(`确定删除索引${this.props.indexName}吗?`)) {
      IndicesActions.delete(this.props.indexName);
    }
  },
  render() {
    const { indexRange } = this.props;
    return (
      <div className="index-info">
        <IndexRangeSummary indexRange={indexRange} />
        <Alert bsStyle="info"><i className="fa fa-info-circle" /> 这个索引是关闭的，索引信息不可用{' '}
          ，请重新打开索引并再次尝试。</Alert>

        <hr style={{ marginBottom: '5', marginTop: '10' }} />

        <Button bsStyle="warning" bsSize="xs" onClick={this._onReopen}>重开索引</Button>{' '}
        <Button bsStyle="danger" bsSize="xs" onClick={this._onDeleteIndex}>删除索引</Button>
      </div>
    );
  },
});

export default ClosedIndexDetails;
