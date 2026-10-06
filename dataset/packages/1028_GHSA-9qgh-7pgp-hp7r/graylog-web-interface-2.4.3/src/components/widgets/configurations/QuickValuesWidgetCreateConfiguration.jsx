import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

const QuickValuesWidgetCreateConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  },

  getInitialConfiguration() {
    return {
      show_pie_chart: true,
      show_data_table: true,
    };
  },

  render() {
    return (
      <fieldset>
        <Input key="showPieChart"
               type="checkbox"
               id="quickvalues-show-pie-chart"
               name="show_pie_chart"
               label="显示饼图"
               checked={this.props.config.show_pie_chart}
               onChange={this.props.onChange}
               help="包含数据的饼状图表示。" />

        <Input key="showDataTable"
               type="checkbox"
               id="quickvalues-show-data-table"
               name="show_data_table"
               label="显示数据表"
               checked={this.props.config.show_data_table}
               onChange={this.props.onChange}
               help="包含有数量信息的表格。" />
      </fieldset>
    );
  },
});

export default QuickValuesWidgetCreateConfiguration;
