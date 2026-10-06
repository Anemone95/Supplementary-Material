import PropTypes from 'prop-types';
import React from 'react';

const NullCacheSummary = React.createClass({
  propTypes: {
    cache: PropTypes.object.isRequired,
  },

  render() {
    return (<p>此缓存没有配置。</p>);
  },
});

export default NullCacheSummary;
