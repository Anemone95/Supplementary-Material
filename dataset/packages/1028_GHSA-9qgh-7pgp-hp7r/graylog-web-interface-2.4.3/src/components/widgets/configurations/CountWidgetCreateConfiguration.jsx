import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

const CountWidgetCreateConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  },

  getInitialConfiguration() {
    return {
      trend: false,
      lower_is_better: false,
    };
  },

  render() {
    return (
      <fieldset>
        <Input key="trend"
               type="checkbox"
               id="count-trend"
               name="trend"
               label="显示趋势"
               checked={this.props.config.trend}
               onChange={this.props.onChange}
               help="显示这个数字的趋势信息。" />

        <Input key="lowerIsBetter"
               type="checkbox"
               id="count-lower-is-better"
               name="lower_is_better"
               label="较低的优"
               disabled={this.props.config.trend === false}
               checked={this.props.config.lower_is_better}
               onChange={this.props.onChange}
               help="当趋势下降时，使用绿色。" />
      </fieldset>
    );
  },
});

export default CountWidgetCreateConfiguration;
