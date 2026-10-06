import React from 'react';

const DSVHTTPAdapterSummary = ({ dataAdapter }) => {
  const { config } = dataAdapter;

  return (<dl>
    <dt>文件URL</dt>
    <dd>{config.url}</dd>
    <dt>分隔符</dt>
    <dd><code>{config.separator}</code></dd>
    <dt>行分隔符</dt>
    <dd><code>{config.line_separator}</code></dd>
    <dt>引用字符</dt>
    <dd><code>{config.quotechar}</code></dd>
    <dt>忽略开始的行</dt>
    <dd><code>{config.ignorechar}</code></dd>
    <dt>键列</dt>
    <dd>{config.key_column}</dd>
    <dt>值列</dt>
    <dd>{config.value_column}</dd>
    <dt>检查间隔</dt>
    <dd>{config.check_interval} 秒</dd>
    <dt>不区分大小写的查找</dt>
    <dd>{config.case_insensitive_lookup ? 'yes' : 'no'}</dd>
  </dl>);
};

export default DSVHTTPAdapterSummary;
