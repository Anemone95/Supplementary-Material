import React from 'react';
import PropTypes from 'prop-types';
import { KeyValueTable } from 'components/common';

const HTTPJSONPathAdapterSummary = ({ dataAdapter }) => {
  const { config } = dataAdapter;
  return (<dl>
    <dt>查找URL</dt>
    <dd>{config.url}</dd>
    <dt>单值JSONPath</dt>
    <dd><code>{config.single_value_jsonpath}</code></dd>
    <dt>多值JSONPath</dt>
    <dd><code>{config.multi_value_jsonpath}</code></dd>
    <dt>HTTP用户代理</dt>
    <dd>{config.user_agent}</dd>
    <dt>HTTP标头</dt>
    <dd><KeyValueTable pairs={config.headers || {}} /></dd>
  </dl>);
};

HTTPJSONPathAdapterSummary.propTypes = {
  dataAdapter: PropTypes.object.isRequired,
};

export default HTTPJSONPathAdapterSummary;
