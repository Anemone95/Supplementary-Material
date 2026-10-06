import React from 'react';
import { Alert } from 'react-bootstrap';

const NoopRetentionStrategyConfiguration = React.createClass({
  render() {
    return (
      <Alert>
        由于这种保留策略不做任何事，所以它不可配置。
      </Alert>
    );
  },
});

export default NoopRetentionStrategyConfiguration;
