import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';

const WidgetVisualizationNotFound = React.createClass({
  propTypes: {
    widgetClassName: PropTypes.string.isRequired,
  },
  render() {
    return (
      <Alert bsStyle="danger">
        <i className="fa fa-exclamation-circle" /> 小部件可视化 (<i>{this.props.widgetClassName}</i>) 未找到。

        似乎是提供这个小部件的插件没有加载。
      </Alert>
    );
  },
});

export default WidgetVisualizationNotFound;
