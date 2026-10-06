import PropTypes from 'prop-types';
import React from 'react';
import { Label } from 'react-bootstrap';

import { Timestamp } from 'components/common';
import DateTime from 'logic/datetimes/DateTime';

import { IndexSizeSummary } from 'components/indices';

const IndexSummary = React.createClass({
  propTypes: {
    children: PropTypes.node.isRequired,
    index: PropTypes.object.isRequired,
    indexRange: PropTypes.object,
    isDeflector: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
  },
  getInitialState() {
    return { showDetails: this.props.isDeflector };
  },
  _formatLabels(index) {
    const labels = [];
    if (index.is_deflector) {
      labels.push(<Label key={`${this.props.name}-deflector-label`} bsStyle="primary">使用中索引</Label>);
    }

    if (index.is_closed) {
      labels.push(<Label key={`${this.props.name}-closed-label`} bsStyle="warning">关闭的</Label>);
    }

    if (index.is_reopened) {
      labels.push(<Label key={`${this.props.name}-reopened-label`} bsStyle="success">重开的</Label>);
    }

    return <span className="index-label">{labels}</span>;
  },

  _formatIndexRange() {
    if (this.props.isDeflector) {
      return <span>包含了消息 <Timestamp dateTime={new DateTime().toISOString()} relative /></span>;
    }

    const sizes = this.props.index.size;
    if (sizes) {
      const count = sizes.events;
      const deleted = sizes.deleted;
      if (count === 0 || count - deleted === 0) {
        return '索引不包含任何消息。';
      }
    }

    if (!this.props.indexRange) {
      return '索引的时间段是未知的，因为索引段是不可用的。请手动重新计算索引段。';
    }

    if (this.props.indexRange.begin === 0) {
      return <span>包含了消息 <Timestamp dateTime={this.props.indexRange.end} relative /></span>;
    }

    return (
      <span>
        包含的消息从 <Timestamp dateTime={this.props.indexRange.begin} relative /> 到{' '}
        <Timestamp dateTime={this.props.indexRange.end} relative />
      </span>
    );
  },
  _formatShowDetailsLink() {
    if (this.state.showDetails) {
      return <span className="index-more-actions"><i className="fa fa-caret-down" /> 隐藏详细信息/操作</span>;
    }
    return <span className="index-more-actions"><i className="fa fa-caret-right" /> 显示详细信息/操作</span>;
  },
  _toggleShowDetails(event) {
    event.preventDefault();
    this.setState({ showDetails: !this.state.showDetails });
  },
  render() {
    const index = this.props.index;
    return (
      <span>
        <h2>
          {this.props.name}{' '}

          <small>
            {this._formatLabels(index)}{' '}
            {this._formatIndexRange(index)}{' '}

            <IndexSizeSummary index={index} />

            <a onClick={this._toggleShowDetails} href="#">{this._formatShowDetailsLink()}</a>
          </small>
        </h2>

        <div className="index-info-holder">
          {this.state.showDetails && this.props.children}
        </div>
      </span>
    );
  },
});

export default IndexSummary;
