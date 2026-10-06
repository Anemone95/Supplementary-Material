/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Alert } from 'react-bootstrap';

const CSVFileAdapterDocumentation = React.createClass({
  render() {
    const csvFile1 = `"ipaddr","hostname"
"127.0.0.1","localhost"
"10.0.0.1","server1"
"10.0.0.2","server2"`;

    const csvFile2 = `'ipaddr';'lladdr';'hostname'
'127.0.0.1';'e4:b2:11:d1:38:14';'localhost'
'10.0.0.1';'e4:b2:12:d1:48:28';'server1'
'10.0.0.2';'e4:b2:11:d1:58:34';'server2'`;

    return (<div>
      <p>CSV数据适配器可以从CSV文件读取键值对。</p>
      <p>请确保您的CSV文件根据您配置的设置进行了格式化。</p>

      <Alert style={{ marginBottom: 10 }} bsStyle="info">
        <h4 style={{ marginBottom: 10 }}>CSV文件要求:</h4>
        <ul className="no-padding">
          <li>CSV文件中的第一行需要是字段/列名称的列表</li>
          <li>文件使用<strong>utf-8</strong>编码</li>
          <li>该文件可由<strong>每个</strong>Graylog服务器节点读取</li>
        </ul>
      </Alert>

      <hr />

      <h3 style={{ marginBottom: 10 }}>例 1</h3>

      <h5 style={{ marginBottom: 10 }}>配置</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        分隔符: <code>,</code><br />
        引用字符: <code>"</code><br />
        键列: <code>ipaddr</code><br />
        值列: <code>hostname</code>
      </p>

      <h5 style={{ marginBottom: 10 }}>CSV文件</h5>
      <pre>{csvFile1}</pre>

      <h3 style={{ marginBottom: 10 }}>例 2</h3>

      <h5 style={{ marginBottom: 10 }}>配置</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        分隔符: <code>;</code><br />
        引用字符: <code>'</code><br />
        键列: <code>ipaddr</code><br />
        值列: <code>hostname</code>
      </p>

      <h5 style={{ marginBottom: 10 }}>CSV文件</h5>
      <pre>{csvFile2}</pre>
    </div>);
  },
});

export default CSVFileAdapterDocumentation;
