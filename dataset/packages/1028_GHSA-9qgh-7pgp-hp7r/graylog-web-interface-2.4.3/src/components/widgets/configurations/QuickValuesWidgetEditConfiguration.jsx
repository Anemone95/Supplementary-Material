import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

import { QueryConfiguration, QuickValuesConfiguration } from 'components/widgets/configurations';

const QuickValuesWidgetEditConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  },
  render() {
    return (
      <fieldset>
        <QueryConfiguration {...this.props} />
        <QuickValuesConfiguration {...this.props} />
        <Input key="showPieChart"
               type="checkbox"
               id="quickvalues-show-pie-chart"
               name="show_pie_chart"
               label="显示饼图"
               defaultChecked={this.props.config.show_pie_chart}
               onChange={this.props.onChange}
               help="用饼图表示数据" />

        <Input key="showDataTable"
               type="checkbox"
               id="quickvalues-show-data-table"
               name="show_data_table"
               label="显示数据表"
               defaultChecked={this.props.config.show_data_table}
               onChange={this.props.onChange}
               help="包含有数量信息的表格。" />
      </fieldset>
    );
  },
});

export default QuickValuesWidgetEditConfiguration;
