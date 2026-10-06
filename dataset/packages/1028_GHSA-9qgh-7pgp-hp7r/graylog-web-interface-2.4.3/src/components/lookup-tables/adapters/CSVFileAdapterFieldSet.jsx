import PropTypes from 'prop-types';
import React from 'react';

import { Input } from 'components/bootstrap';

const CSVFileAdapterFieldSet = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
// eslint-disable-next-line react/no-unused-prop-types
    updateConfig: PropTypes.func.isRequired,
    handleFormEvent: PropTypes.func.isRequired,
    validationState: PropTypes.func.isRequired,
    validationMessage: PropTypes.func.isRequired,
  },

  render() {
    const config = this.props.config;

    return (<fieldset>
      <Input type="text"
             id="path"
             name="path"
             label="文件路径"
             autoFocus
             required
             onChange={this.props.handleFormEvent}
             help={this.props.validationMessage('path', 'CSV文件的路径。')}
             bsStyle={this.props.validationState('path')}
             value={config.path}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="number"
             id="check_interval"
             name="check_interval"
             label="检查间隔"
             required
             onChange={this.props.handleFormEvent}
             help="检查CSV文件是否需要重新加载的时间间隔。(in seconds)"
             value={config.check_interval}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="separator"
             name="separator"
             label="分隔符"
             required
             onChange={this.props.handleFormEvent}
             help="用于分隔条目的分隔符。"
             value={config.separator}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="quotechar"
             name="quotechar"
             label="引用字符"
             required
             onChange={this.props.handleFormEvent}
             help="用于引用元素的字符。"
             value={config.quotechar}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="key_column"
             name="key_column"
             label="键列"
             required
             onChange={this.props.handleFormEvent}
             help="用于键查找的列名称。"
             value={config.key_column}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="value_column"
             name="value_column"
             label="值列"
             required
             onChange={this.props.handleFormEvent}
             help="用作键的值的列名称。"
             value={config.value_column}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="checkbox"
             id="case_insensitive_lookup"
             name="case_insensitive_lookup"
             label="允许不区分大小写的查找"
             checked={config.case_insensitive_lookup}
             onChange={this.props.handleFormEvent}
             help="如果键查找应区分大小写，请启用。"
             wrapperClassName="col-md-offset-3 col-md-9" />
    </fieldset>);
  },
});

export default CSVFileAdapterFieldSet;
