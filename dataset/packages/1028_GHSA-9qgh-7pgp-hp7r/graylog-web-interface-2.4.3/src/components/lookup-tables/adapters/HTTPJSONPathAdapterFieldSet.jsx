import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';
import { KeyValueTable } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';

const HTTPJSONPathAdapterFieldSet = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    updateConfig: PropTypes.func.isRequired,
    handleFormEvent: PropTypes.func.isRequired,
    validationState: PropTypes.func.isRequired,
    validationMessage: PropTypes.func.isRequired,
  },
  getInitialState() {
    return {};
  },
  onHTTPHeaderUpdate(headers) {
    const config = ObjectUtils.clone(this.props.config);
    config.headers = headers;
    this.props.updateConfig(config);
  },
  render() {
    const config = this.props.config;

    return (<fieldset>
      <Input type="text"
             id="url"
             name="url"
             label="查找URL"
             autoFocus
             required
             onChange={this.props.handleFormEvent}
             help={this.props.validationMessage('url', '查找的URL。(这是一个模板 - 请参阅文档)')}
             bsStyle={this.props.validationState('url')}
             value={config.url}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="single_value_jsonpath"
             name="single_value_jsonpath"
             label="单值JSONPath"
             required
             onChange={this.props.handleFormEvent}
             help={this.props.validationMessage('single_value_jsonpath', 'JSONPath字符串从response中获取单值。')}
             bsStyle={this.props.validationState('single_value_jsonpath')}
             value={config.single_value_jsonpath}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="multi_value_jsonpath"
             name="multi_value_jsonpath"
             label="多值JSONPath"
             onChange={this.props.handleFormEvent}
             help={this.props.validationMessage('multi_value_jsonpath', 'JSONPath字符串从response中获取多值。需要返回一个list或map。(可选的)')}
             bsStyle={this.props.validationState('multi_value_jsonpath')}
             value={config.multi_value_jsonpath}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="user_agent"
             name="user_agent"
             label="HTTP用户代理"
             required
             onChange={this.props.handleFormEvent}
             help="用于HTTP请求的用户代理标头。"
             value={config.user_agent}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input id="http_headers"
             label="HTTP标头"
             help="用于HTTP请求的自定义HTTP标头。多个值必须用逗号分隔。"
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9">
        <KeyValueTable pairs={config.headers || {}} editable onChange={this.onHTTPHeaderUpdate} />
      </Input>

    </fieldset>);
  },
});

export default HTTPJSONPathAdapterFieldSet;
