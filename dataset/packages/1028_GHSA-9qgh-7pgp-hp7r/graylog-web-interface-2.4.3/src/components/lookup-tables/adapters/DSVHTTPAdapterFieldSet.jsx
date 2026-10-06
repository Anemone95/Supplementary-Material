import React from 'react';

import { Input } from 'components/bootstrap';

const DSVHTTPAdapterFieldSet = ({ handleFormEvent, validationState, validationMessage, config}) => {
  return (<fieldset>
    <Input type="text"
           id="url"
           name="url"
           label="文件URL"
           autoFocus
           required
           onChange={handleFormEvent}
           help={validationMessage('url', 'DSV文件的URL。')}
           bsStyle={validationState('url')}
           value={config.url}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="number"
           id="refresh_interval"
           name="refresh_interval"
           label="刷新间隔"
           required
           onChange={handleFormEvent}
           help="检查DSV文件是否需要重新加载的时间间隔。(in seconds)"
           value={config.refresh_interval}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="separator"
           name="separator"
           label="分隔符"
           required
           onChange={handleFormEvent}
           help="用于分隔列的分隔符。"
           value={config.separator}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="line_separator"
           name="line_separator"
           label="行分隔符"
           required
           onChange={handleFormEvent}
           help="用于分隔行的分隔符。"
           value={config.line_separator}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="quotechar"
           name="quotechar"
           label="引用字符"
           required
           onChange={handleFormEvent}
           help="用于引用元素的字符。"
           value={config.quotechar}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="ignorechar"
           name="ignorechar"
           label="忽略字符"
           required
           onChange={handleFormEvent}
           help="忽略以这些字符开头的行。"
           value={config.ignorechar}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="key_column"
           name="key_column"
           label="键列"
           required
           onChange={handleFormEvent}
           help="用于键查找的列名称。"
           value={config.key_column}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="text"
           id="value_column"
           name="value_column"
           label="值列"
           required
           onChange={handleFormEvent}
           help="用作键的值的列名称。"
           value={config.value_column}
           labelClassName="col-sm-3"
           wrapperClassName="col-sm-9" />
    <Input type="checkbox"
           id="case_insensitive_lookup"
           name="case_insensitive_lookup"
           label="允许不区分大小写的查找"
           checked={config.case_insensitive_lookup}
           onChange={handleFormEvent}
           help="如果键查找应区分大小写，请启用。"
           wrapperClassName="col-md-offset-3 col-md-9" />
    <Input type="checkbox"
           id="check_presence_only"
           name="check_presence_only"
           label="只检查键的存在"
           checked={config.check_presence_only}
           onChange={handleFormEvent}
           help="只检查键是否存在于表中，返回布尔值而不是值。"
           wrapperClassName="col-md-offset-3 col-md-9" />
  </fieldset>);
};

export default DSVHTTPAdapterFieldSet;
