import PropTypes from 'prop-types';
import React from 'react';
import { Label } from 'react-bootstrap';

const StreamStateBadge = React.createClass({
  propTypes: {
    stream: PropTypes.object.isRequired,
  },
  render() {
    if (this.props.stream.is_default) {
      return <Label bsStyle="primary">默认的</Label>;
    }

    if (!this.props.stream.disabled) {
      return null;
    }

    return <Label bsStyle="warning">停止的</Label>;
  },
});

export default StreamStateBadge;
