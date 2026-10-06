import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

import { WidgetEditConfigModal } from 'components/widgets';

import ObjectUtils from 'util/ObjectUtils';
import FormsUtils from 'util/FormsUtils';

import StoreProvider from 'injection/StoreProvider';
const FieldGraphsStore = StoreProvider.getStore('FieldGraphs');

const StackedChartWidgetConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  },

  _setSeriesSetting(seriesNo, key, value) {
    const newSeries = ObjectUtils.clone(this.props.config.series);
    newSeries[seriesNo][key] = value;
    this.props.onChange('series', newSeries);
  },

  _bindSeriesValue(event) {
    this._setSeriesSetting(event.target.getAttribute('data-series'), event.target.name, FormsUtils.getValueFromInput(event.target));
  },

  render() {
    const controls = [];

    this.props.config.series.forEach((series) => {
      const seriesNo = this.props.config.series.indexOf(series);
      controls.push(
        <fieldset key={`series${seriesNo}`}>
          <legend>Series #{seriesNo + 1}</legend>
          <Input type="text"
                 id={`series-${seriesNo}-field`}
                 name="field"
                 label="字段"
                 data-series={seriesNo}
                 defaultValue={series.field}
                 onChange={this._bindSeriesValue}
                 help="用于获取系列值的字段。"
                 required />
          <Input type="text"
                 id={`series-${seriesNo}-query`}
                 name="query"
                 label="搜索查询"
                 data-series={seriesNo}
                 defaultValue={series.query}
                 onChange={this._bindSeriesValue}
                 help="将要执行的以获得系列值的搜索查询。" />
          <Input type="select"
                 id={`series-${seriesNo}-statistical-function`}
                 name="statistical_function"
                 label="统计函数"
                 data-series={seriesNo}
                 defaultValue={series.statistical_function}
                 onChange={this._bindSeriesValue}
                 help="应用于级数的统计函数。">
            {FieldGraphsStore.constructor.FUNCTIONS.keySeq().map((statFunction) => {
              return (
                <option key={statFunction} value={statFunction}>
                  {FieldGraphsStore.constructor.FUNCTIONS.get(statFunction)}
                </option>
              );
            })}
          </Input>
        </fieldset>,
      );
    }, this);

    return (
      <fieldset>
        {controls}
      </fieldset>
    );
  },
});

export default StackedChartWidgetConfiguration;
