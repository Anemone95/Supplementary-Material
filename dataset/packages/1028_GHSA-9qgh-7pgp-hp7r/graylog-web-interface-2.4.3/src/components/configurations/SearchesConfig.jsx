import PropTypes from 'prop-types';
import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { BootstrapModalForm, Input } from 'components/bootstrap';
import { IfPermitted, ISODurationInput } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';

import moment from 'moment';
import {} from 'moment-duration-format';

import TimeRangeOptionsForm from './TimeRangeOptionsForm';
import TimeRangeOptionsSummary from './TimeRangeOptionsSummary';

const SearchesConfig = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  },

  getInitialState() {
    const queryTimeRangeLimit = this._getPropConfigValue('query_time_range_limit');
    const relativeTimerangeOptions = this._getPropConfigValue('relative_timerange_options');
    const surroundingTimerangeOptions = this._getPropConfigValue('surrounding_timerange_options');
    const surroundingFilterFields = this._getPropConfigValue('surrounding_filter_fields');
    const analysisDisabledFields = this._getPropConfigValue('analysis_disabled_fields');

    return {
      config: {
        query_time_range_limit: queryTimeRangeLimit,
        relative_timerange_options: relativeTimerangeOptions,
        surrounding_timerange_options: surroundingTimerangeOptions,
        surrounding_filter_fields: surroundingFilterFields,
        analysis_disabled_fields: analysisDisabledFields,
      },
      limitEnabled: moment.duration(queryTimeRangeLimit).asMilliseconds() > 0,
      relativeTimeRangeOptionsUpdate: undefined,
      surroundingTimeRangeOptionsUpdate: undefined,
    };
  },

  _getPropConfigValue(field) {
    return this.props.config ? this.props.config[field] : undefined;
  },

  _onUpdate(field) {
    return (newOptions) => {
      const update = ObjectUtils.clone(this.state.config);

      update[field] = newOptions;

      this.setState({ config: update });
    };
  },

  _onRelativeTimeRangeOptionsUpdate(data) {
    this.setState({ relativeTimeRangeOptionsUpdate: data });
  },

  _onSurroundingTimeRangeOptionsUpdate(data) {
    this.setState({ surroundingTimeRangeOptionsUpdate: data });
  },

  _buildTimeRangeOptions(options) {
    return Object.keys(options).map((key) => {
      return { period: key, description: options[key] };
    });
  },

  _onFilterFieldsUpdate(e) {
    this.setState({ surroundingFilterFields: e.target.value });
  },

  _onAnalysisDisabledFieldsUpdate(e) {
    this.setState({ analysisDisabledFields: e.target.value });
  },

  _onChecked() {
    const config = ObjectUtils.clone(this.state.config);

    if (this.state.limitEnabled) {
      // If currently enabled, disable by setting the limit to 0 seconds.
      config.query_time_range_limit = 'PT0S';
    } else {
      // If currently not enabled, set a default of 30 days.
      config.query_time_range_limit = 'P30D';
    }

    this.setState({ config: config, limitEnabled: !this.state.limitEnabled });
  },

  _isEnabled() {
    return this.state.limitEnabled;
  },

  _splitStringList(stringList) {
    return stringList.split(',').map(f => f.trim()).filter(f => f.length > 0);
  },

  _saveConfig() {
    const update = ObjectUtils.clone(this.state.config);

    if (this.state.relativeTimeRangeOptionsUpdate) {
      update.relative_timerange_options = {};

      this.state.relativeTimeRangeOptionsUpdate.forEach((entry) => {
        update.relative_timerange_options[entry.period] = entry.description;
      });

      this.setState({ relativeTimeRangeOptionsUpdate: undefined });
    }

    if (this.state.surroundingTimeRangeOptionsUpdate) {
      update.surrounding_timerange_options = {};

      this.state.surroundingTimeRangeOptionsUpdate.forEach((entry) => {
        update.surrounding_timerange_options[entry.period] = entry.description;
      });

      this.setState({ surroundingTimeRangeOptionsUpdate: undefined });
    }

    // Make sure to update filter fields
    if (this.state.surroundingFilterFields) {
      update.surrounding_filter_fields = this._splitStringList(this.state.surroundingFilterFields);
      this.setState({ surroundingFilterFields: undefined });
    }

    if (this.state.analysisDisabledFields) {
      update.analysis_disabled_fields = this._splitStringList(this.state.analysisDisabledFields);
      this.setState({ analysisDisabledFields: undefined });
    }

    this.props.updateConfig(update).then(() => {
      this._closeModal();
    });
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _openModal() {
    this.refs.searchesConfigModal.open();
  },

  _closeModal() {
    this.refs.searchesConfigModal.close();
  },

  queryTimeRangeLimitValidator(milliseconds) {
    return milliseconds >= 1;
  },

  relativeTimeRangeValidator(milliseconds, duration) {
    return milliseconds >= 1 || duration === 'PT0S';
  },

  surroundingTimeRangeValidator(milliseconds) {
    return milliseconds >= 1;
  },

  render() {
    const config = this.state.config;
    const duration = moment.duration(config.query_time_range_limit);
    const limit = this._isEnabled() ? `${config.query_time_range_limit} (${duration.format()})` : 'disabled';

    let filterFields;
    let filterFieldsString;
    if (this.state.config.surrounding_filter_fields) {
      filterFields = this.state.config.surrounding_filter_fields.map((f, idx) => <li key={idx}>{f}</li>);
      filterFieldsString = this.state.config.surrounding_filter_fields.join(', ');
    }

    let analysisDisabledFields;
    let analysisDisabledFieldsString;
    if (this.state.config.analysis_disabled_fields) {
      analysisDisabledFields = this.state.config.analysis_disabled_fields.map((f, idx) => <li key={idx}>{f}</li>);
      analysisDisabledFieldsString = this.state.config.analysis_disabled_fields.join(', ');
    }

    return (
      <div>
        <h2>搜索配置</h2>

        <dl className="deflist">
          <dt>查询时间范围限制</dt>
          <dd>{limit}</dd>
          <dd>用户可以查询过去的数据的时间上限。这可以防止用户意外地创建跨越大量数据的查询，并且需要很长的时间和许多资源来完成(如果有的话)。</dd>
        </dl>

        <Row>
          <Col md={6}>
            <strong>相对时间范围选项</strong>
            <TimeRangeOptionsSummary options={this.state.config.relative_timerange_options} />
          </Col>
          <Col md={6}>
            <strong>周围的时间范围选项</strong>
            <TimeRangeOptionsSummary options={this.state.config.surrounding_timerange_options} />

            <strong>周围的搜索过滤器字段</strong>
            <ul>
              {filterFields}
            </ul>

            <strong>禁用字段的UI分析</strong>
            <ul>
              {analysisDisabledFields}
            </ul>
          </Col>
        </Row>
        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>修改</Button>
        </IfPermitted>

        <BootstrapModalForm ref="searchesConfigModal"
                            title="修改搜索配置"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonText="保存">
          <fieldset>
            <Input type="checkbox" label="启用查询限制"
                   name="enabled"
                   checked={this._isEnabled()}
                   onChange={this._onChecked} />
            {this._isEnabled() &&
            <ISODurationInput duration={config.query_time_range_limit}
                              update={this._onUpdate('query_time_range_limit')}
                              label="查询时间范围限制（ISO8601持续时间）"
                              help={'搜索的最大时间范围。(例如，"P30D" for 30 days, "PT24H" for 24 hours)'}
                              validator={this.queryTimeRangeLimitValidator}
                              required />
            }

            <TimeRangeOptionsForm options={this.state.relativeTimeRangeOptionsUpdate || this._buildTimeRangeOptions(this.state.config.relative_timerange_options)}
                                  update={this._onRelativeTimeRangeOptionsUpdate}
                                  validator={this.relativeTimeRangeValidator}
                                  title="相对时间范围选项"
                                  help={<span>将<strong>相对</strong>时间范围选择器的可用选项配置为<strong>ISO8601持续时间</strong></span>} />

            <TimeRangeOptionsForm options={this.state.surroundingTimeRangeOptionsUpdate || this._buildTimeRangeOptions(this.state.config.surrounding_timerange_options)}
                                  update={this._onSurroundingTimeRangeOptionsUpdate}
                                  validator={this.surroundingTimeRangeValidator}
                                  title="周围的时间范围选项"
                                  help={<span>将<strong>周围</strong>时间范围选择器的可用选项配置为<strong>ISO8601持续时间</strong></span>} />

            <Input type="text"
                   label="周围的搜索过滤器字段"
                   onChange={this._onFilterFieldsUpdate}
                   value={this.state.surroundingFilterFields || filterFieldsString}
                   help="A ','分隔的消息字段列表将用作周围消息查询的过滤器。"
                   required />

            <Input type="text"
                   label="禁用字段分析"
                   onChange={this._onAnalysisDisabledFieldsUpdate}
                   value={this.state.analysisDisabledFields || analysisDisabledFieldsString}
                   help="A ','分隔的消息字段列表将用作提取分析，像快速值在web-UI中将被禁用。"
                   required />
          </fieldset>
        </BootstrapModalForm>
      </div>
    );
  },
});

export default SearchesConfig;
