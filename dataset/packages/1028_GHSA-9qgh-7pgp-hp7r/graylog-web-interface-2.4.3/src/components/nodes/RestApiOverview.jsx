import PropTypes from 'prop-types';
import React from 'react';
import { Timestamp } from 'components/common';

const RestApiOverview = React.createClass({
  propTypes: {
    node: PropTypes.object.isRequired,
  },
  render() {
    return (
      <dl className="system-rest">
        <dt>传输地址:</dt>
        <dd>{this.props.node.transport_address}</dd>
        <dt>最后一次看到:</dt>
        <dd><Timestamp dateTime={this.props.node.last_seen} relative /></dd>
      </dl>
    );
  },
});

export default RestApiOverview;
