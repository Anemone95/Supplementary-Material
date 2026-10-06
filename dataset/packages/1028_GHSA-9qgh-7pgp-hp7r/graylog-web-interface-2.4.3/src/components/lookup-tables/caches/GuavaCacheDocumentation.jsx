/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Alert } from 'react-bootstrap';

const GuavaCacheDocumentation = React.createClass({
  render() {
    return (<div>
      <p>内存中缓存维护来自数据适配器的最近使用的值。</p>
      <p>请确保您的Graylog服务器具有足够的堆来容纳缓存的条目并监视缓存效率。</p>

      <Alert style={{ marginBottom: 10 }} bsStyle="info">
        <h4 style={{ marginBottom: 10 }}>实施细节</h4>
        <p>缓存对于每个Graylog服务器都是存于本地的，它们不共享条目。</p>
        <p>例如，如果您有两台服务器，它们将保持彼此完全独立的缓存。</p>
      </Alert>

      <hr />

      <h3 style={{ marginBottom: 10 }}>缓存大小</h3>
      <p>每个缓存都有最大数量的条目，不支持无限缓存。</p>

      <h3 style={{ marginBottom: 10 }}>基于时间的有效期</h3>

      <h5 style={{ marginBottom: 10 }}>访问后失效</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        缓存将在上次使用过后的固定时间内删除条目。<br />
        这导致缓存作为空间有限的最近最少使用缓存运行。
      </p>

      <h5 style={{ marginBottom: 10 }}>写入后失效</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        缓存将在输入缓存过后的固定时间内删除条目。<br />
        这导致条目永远不会超过给定时间，这对于定期更改数据(例如外部系统的配置状态)可能很重要。
      </p>

    </div>);
  },
});

export default GuavaCacheDocumentation;
