import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';
import { PluginStore } from 'graylog-web-plugin/plugin';

import DateTime from 'logic/datetimes/DateTime';

import StringUtils from 'util/StringUtils';
import ObjectUtils from 'util/ObjectUtils';
import FormsUtils from 'util/FormsUtils';

import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';

const WidgetEditConfigModal = React.createClass({
  propTypes: {
    onModalHidden: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
  },

  getInitialState() {
    this.widgetPlugin = this._getWidgetPlugin(this.props.widget.type);
    return {
      description: this.props.widget.description,
      type: this.props.widget.type,
      cache_time: this.props.widget.cache_time,
      config: ObjectUtils.clone(this.props.widget.config), // clone config to not modify it accidentally
      errors: {},
    };
  },

  componentWillReceiveProps(nextProps) {
    this.widgetPlugin = this._getWidgetPlugin(nextProps.widget.type);
  },

  _getWidgetPlugin(widgetType) {
    return PluginStore.exports('widgets').filter(widget => widget.type.toUpperCase() === widgetType.toUpperCase())[0];
  },

  open() {
    this.refs.editModal.open();
  },

  hide() {
    this.refs.editModal.close();
  },

  _getWidgetData() {
    const widget = {};
    const stateKeys = Object.keys(this.state);

    stateKeys.forEach((key) => {
      if (this.state.hasOwnProperty(key) && (key !== 'errors' || key !== 'widgetPlugin')) {
        widget[key] = this.state[key];
      }
    });

    return widget;
  },

  save() {
    const errorKeys = Object.keys(this.state.errors);
    if (!errorKeys.some(key => this.state.errors[key] === true)) {
      this.props.onUpdate(this._getWidgetData());
    }
    this.hide();
  },

  _setSetting(key, value) {
    const newState = ObjectUtils.clone(this.state);
    newState[key] = value;
    this.setState(newState);
  },

  _bindValue(event) {
    this._setSetting(event.target.name, FormsUtils.getValueFromInput(event.target));
  },

  _setConfigurationSetting(key, value) {
    const newConfig = ObjectUtils.clone(this.state.config);
    newConfig[key] = value;
    this.setState({ config: newConfig });
  },

  _bindConfigurationValue(event) {
    this._setConfigurationSetting(event.target.name, FormsUtils.getValueFromInput(event.target));
  },

  _onConfigurationValueChange() {
    switch (arguments.length) {
      // When a single value is passed, we treat it as an event handling
      case 1:
        this._bindConfigurationValue(arguments[0]);
        break;
      // When two arguments are given, treat it as a configuration key-value
      case 2:
        this._setConfigurationSetting(arguments[0], arguments[1]);
        break;
      default:
        throw new Error('Wrong number of arguments, method only accepts an event or a configuration key-value pair');
    }
  },

  _setTimeRangeSetting(key, value) {
    const newTimeRange = ObjectUtils.clone(this.state.config.timerange);

    switch (key) {
      case 'from':
      case 'to':
        const errors = ObjectUtils.clone(this.state.errors);

        try {
          newTimeRange[key] = DateTime.parseFromString(value).toISOString();
          errors[key] = false;
        } catch (e) {
          errors[key] = true;
        }

        this.setState({ errors: errors });
        break;
      default:
        newTimeRange[key] = value;
    }

    this._setConfigurationSetting('timerange', newTimeRange);
  },

  _bindTimeRangeValue(event) {
    this._setTimeRangeSetting(event.target.name, FormsUtils.getValueFromInput(event.target));
  },

  _formatDateTime(dateTime) {
    try {
      return DateTime.parseFromString(dateTime).toString();
    } catch (e) {
      return dateTime;
    }
  },

  _getTimeRangeFormControls() {
    const rangeTypeSelector = (
      <Input type="text"
             label="时间段类型"
             disabled
             value={StringUtils.capitalizeFirstLetter(this.state.config.timerange.type)}
             help="小部件使用的时间段类型。" />
    );

    let rangeValueInput;

    switch (this.state.config.timerange.type) {
      case 'relative':
        rangeValueInput = (
          <Input type="number"
                 id="timerange-relative"
                 name="range"
                 label="搜索相对时间"
                 required
                 min="0"
                 defaultValue={this.state.config.timerange.range}
                 onChange={this._bindTimeRangeValue}
                 help="相对于搜索执行时的秒数。在所有消息中完成了0次搜索。" />
        );
        break;
      case 'absolute':
        rangeValueInput = (
          <div>
            <Input type="text"
                   id="timerange-absolute-from"
                   name="from"
                   label="搜索起始时间"
                   required
                   bsStyle={this.state.errors.from === true ? 'error' : null}
                   defaultValue={this._formatDateTime(this.state.config.timerange.from)}
                   onChange={this._bindTimeRangeValue}
                   help="搜索开始的时间。例如 2015-03-27 13:23:41" />
            <Input type="text"
                   id="timerange-absolute-to"
                   name="to"
                   label="搜索结束时间"
                   required
                   bsStyle={this.state.errors.to === true ? 'error' : null}
                   defaultValue={this._formatDateTime(this.state.config.timerange.to)}
                   onChange={this._bindTimeRangeValue}
                   help="搜索结束的时间。例如 2015-03-27 13:23:41" />
          </div>
        );
        break;
      case 'keyword':
        rangeValueInput = (
          <Input type="text"
                 id="timerange-keyword"
                 name="keyword"
                 label="搜索关键字"
                 required
                 defaultValue={this.state.config.timerange.keyword}
                 onChange={this._bindTimeRangeValue}
                 help="搜索包含关键字表示的时间。例如 last day" />
        );
        break;
      default:
        rangeValueInput = undefined;
    }

    return (
      <div>
        {rangeTypeSelector}
        {rangeValueInput}
      </div>
    );
  },

  _getSpecificConfigurationControls() {
    if (this.widgetPlugin && this.widgetPlugin.configurationEditComponent) {
      return React.createElement(this.widgetPlugin.configurationEditComponent, {
        id: this.props.widget.id,
        config: this.state.config,
        onChange: this._onConfigurationValueChange,
      });
    }

    return null;
  },
  render() {
    return (
      <BootstrapModalForm ref="editModal"
                          title={`编辑小部件"${this.state.description}"`}
                          onSubmitForm={this.save}
                          onModalClose={this.props.onModalHidden}
                          submitButtonText="更新">
        <fieldset>
          <Input type="text"
                 id="title"
                 name="description"
                 label="标题"
                 required
                 defaultValue={this.state.description}
                 onChange={this._bindValue}
                 help="输入一个描述您的小部件的名称。"
                 autoFocus />
          <Input type="number"
                 min="1"
                 required
                 id="cache_time"
                 name="cache_time"
                 label="缓存时间"
                 defaultValue={this.state.cache_time}
                 onChange={this._bindValue}
                 help="小部件值的秒数将被缓存。" />
          {this._getTimeRangeFormControls()}
          {this._getSpecificConfigurationControls()}
        </fieldset>
      </BootstrapModalForm>
    );
  },
});

export default WidgetEditConfigModal;
