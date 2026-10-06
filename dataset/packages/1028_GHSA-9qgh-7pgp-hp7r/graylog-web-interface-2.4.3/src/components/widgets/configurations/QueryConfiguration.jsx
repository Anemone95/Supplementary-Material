import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

const QueryConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  },
  render() {
    return (
      <Input type="text"
             key="query"
             id="query"
             name="query"
             label="搜索查询"
             defaultValue={this.props.config.query}
             onChange={this.props.onChange}
             help="获得小部件值的将要执行的搜索查询。" />
    );
  },
});

export default QueryConfiguration;
