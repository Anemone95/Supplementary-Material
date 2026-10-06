import React from 'react';

import { Alert } from 'react-bootstrap';

const DSVHTTPAdapterDocumentation = () => {
  const csvFile1 = `"127.0.0.1","localhost"
"10.0.0.1","server1"
"10.0.0.2","server2"`;

  const csvFile2 = `'127.0.0.1';'e4:b2:11:d1:38:14'
'10.0.0.1';'e4:b2:12:d1:48:28'
'10.0.0.2';'e4:b2:11:d1:58:34'`;

  return (<div>
    <p>DSV数据适配器可以从DSV文件读取键值对(或检查是否存在键)。</p>
    <p>请确保您的DSV文件根据您配置的设置进行格式化。</p>

    <Alert style={{ marginBottom: 10 }} bsStyle="info">
      <h4 style={{ marginBottom: 10 }}>CSV文件要求:</h4>
      <ul className="no-padding">
        <li>文件使用<strong>utf-8</strong>编码</li>
        <li><strong>每个</strong>Graylog服务器节点都可以使用相同的URL访问该文件</li>
      </ul>
    </Alert>

    <hr />

    <h3 style={{ marginBottom: 10 }}>例 1</h3>

    <h5 style={{ marginBottom: 10 }}>配置</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      分隔符: <code>,</code><br />
      引用字符: <code>"</code><br />
    </p>

    <h5 style={{ marginBottom: 10 }}>DSV文件</h5>
    <pre>{csvFile1}</pre>

    <h3 style={{ marginBottom: 10 }}>例 2</h3>

    <h5 style={{ marginBottom: 10 }}>配置</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      分隔符: <code>;</code><br />
      引用字符: <code>'</code><br />
    </p>

    <h5 style={{ marginBottom: 10 }}>DSV文件</h5>
    <pre>{csvFile2}</pre>
  </div>);
};

export default DSVHTTPAdapterDocumentation;
