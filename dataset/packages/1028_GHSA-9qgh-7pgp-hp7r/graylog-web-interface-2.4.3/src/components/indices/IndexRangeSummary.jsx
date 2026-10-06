import PropTypes from 'prop-types';
import React from 'react';
import { Timestamp } from 'components/common';

const IndexRangeSummary = React.createClass({
  propTypes: {
    indexRange: PropTypes.object,
  },
  render() {
    const { indexRange } = this.props;
    if (!indexRange) {
      return <span><i>没有可用索引段。</i></span>;
    }
    return (
      <span>重新计算段{' '}
        <span title={indexRange.calculated_at}><Timestamp dateTime={indexRange.calculated_at} relative /></span>{' '}
        在{indexRange.took_ms}ms.
      </span>
    );
  },
});

export default IndexRangeSummary;
