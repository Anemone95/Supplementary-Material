import React from 'react';

import GrokPatterns from 'components/grok-patterns/GrokPatterns';
import { DocumentTitle } from 'components/common';

const GrokPatternsPage = React.createClass({
  render() {
    return (
      <DocumentTitle title="正则匹配模式">
        <GrokPatterns />
      </DocumentTitle>
    );
  },
});

export default GrokPatternsPage;
