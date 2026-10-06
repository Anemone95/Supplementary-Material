import PropTypes from 'prop-types';
import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Input } from 'components/bootstrap';
import FormsUtils from 'util/FormsUtils';
import { ContentPackMarker } from 'components/common';
import { PluginStore } from 'graylog-web-plugin/plugin';
import CombinedProvider from 'injection/CombinedProvider';
import Styles from './ConfigSummary.css';

const { LookupTableDataAdaptersActions } = CombinedProvider.get('LookupTableDataAdapters');

const DataAdapter = React.createClass({

  propTypes: {
    dataAdapter: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      lookupKey: null,
      lookupResult: null,
    };
  },

  _onChange(event) {
    this.setState({ lookupKey: FormsUtils.getValueFromInput(event.target) });
  },

  _lookupKey(e) {
    e.preventDefault();
    LookupTableDataAdaptersActions.lookup(this.props.dataAdapter.name, this.state.lookupKey).then((result) => {
      this.setState({ lookupResult: result });
    });
  },

  render() {
    const plugins = {};
    PluginStore.exports('lookupTableAdapters').forEach((p) => {
      plugins[p.type] = p;
    });

    const dataAdapter = this.props.dataAdapter;
    const plugin = plugins[dataAdapter.config.type];
    if (!plugin) {
      return <p>未知数据适配器类型{dataAdapter.config.type}。 该插件是否丢失?</p>;
    }

    const summary = plugin.summaryComponent;
    return (
      <Row className="content">
        <Col md={6}>
          <h2>
            {dataAdapter.title}
            <ContentPackMarker contentPack={dataAdapter.content_pack} marginLeft={5} />
            {' '}
            <small>({plugin.displayName})</small>
          </h2>
          <div className={Styles.config}>
            <dl>
              <dt>描述</dt>
              <dd>{dataAdapter.description || <em>无描述.</em>}</dd>
            </dl>
          </div>
          <h4>配置</h4>
          <div className={Styles.config}>
            {React.createElement(summary, { dataAdapter: dataAdapter })}
          </div>
        </Col>
        <Col md={6}>
          <h3>测试查询</h3>
          <p>您可以使用此表单手动触发数据适配器。数据将不会被缓存。</p>
          <form onSubmit={this._lookupKey}>
            <fieldset>
              <Input type="text"
                     id="key"
                     name="key"
                     label="键"
                     required
                     onChange={this._onChange}
                     help="用于查找值的键"
                     value={this.state.lookupKey} />
            </fieldset>
            <fieldset>
              <Input>
                <Button type="submit" bsStyle="success">查找</Button>
              </Input>
            </fieldset>
          </form>
          { this.state.lookupResult && (
            <div>
              <h4>查找结果</h4>
              <pre>{JSON.stringify(this.state.lookupResult, null, 2)}</pre>
            </div>
          )}
        </Col>
      </Row>
    );
  },

});

export default DataAdapter;
