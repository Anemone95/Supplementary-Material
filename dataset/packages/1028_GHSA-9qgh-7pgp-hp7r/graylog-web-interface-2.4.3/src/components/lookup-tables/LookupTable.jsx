import PropTypes from 'prop-types';
import React from 'react';
import { Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import { Input } from 'components/bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Routes from 'routing/Routes';

import FormsUtils from 'util/FormsUtils';
import { ContentPackMarker } from 'components/common';

import CombinedProvider from 'injection/CombinedProvider';

const { LookupTablesActions } = CombinedProvider.get('LookupTables');

const LookupTable = React.createClass({

  propTypes: {
    table: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    dataAdapter: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      lookupKey: null,
      lookupResult: null,
      purgeKey: null,
    };
  },

  _onChange(event) {
    this.setState({ lookupKey: FormsUtils.getValueFromInput(event.target) });
  },

  _onChangePurgeKey(event) {
    this.setState({ purgeKey: FormsUtils.getValueFromInput(event.target) });
  },

  _onPurgeKey(e) {
    e.preventDefault();
    if (this.state.purgeKey && this.state.purgeKey.length > 0) {
      LookupTablesActions.purgeKey(this.props.table, this.state.purgeKey);
    }
  },

  _onPurgeAll(e) {
    e.preventDefault();
    LookupTablesActions.purgeAll(this.props.table);
  },

  _lookupKey(e) {
    e.preventDefault();
    LookupTablesActions.lookup(this.props.table.name, this.state.lookupKey).then((result) => {
      this.setState({ lookupResult: result });
    });
  },

  render() {
    return (
      <Row className="content">
        <Col md={6}>
          <h3>
            {this.props.table.title}
            <ContentPackMarker contentPack={this.props.table.content_pack} marginLeft={5} />
          </h3>
          <span>{this.props.table.description}</span>
          <dl>
            <dt>数据适配器</dt>
            <dd>
              <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.show(this.props.dataAdapter.name)}><a>{this.props.dataAdapter.title}</a></LinkContainer>
            </dd>
            <dt>缓存</dt>
            <dd><LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.CACHES.show(this.props.cache.name)}><a>{this.props.cache.title}</a></LinkContainer></dd>
          </dl>
          {
            (this.props.table.default_single_value || this.props.table.default_multi_value) &&
            <dl>
              <dt>默认单值</dt>
              <dd><code>{this.props.table.default_single_value}</code>{' '}({this.props.table.default_single_value_type.toLowerCase()})</dd>
              <dt>默认多值</dt>
              <dd><code>{this.props.table.default_multi_value}</code>{' '}({this.props.table.default_multi_value_type.toLowerCase()})</dd>
            </dl>
          }
          <h3>清除缓存</h3>
          <p>您可以清除此查找表的完整缓存或清除单个键的缓存条目。</p>
          <form onSubmit={this._onPurgeKey}>
            <fieldset>
              <Input type="text"
                     id="purge-key"
                     name="purge-key"
                     label="键"
                     onChange={this._onChangePurgeKey}
                     help="用于清除缓存的键"
                     required
                     value={this.state.purgeKey} />
              <Input>
                <ButtonToolbar>
                  <Button type="submit" bsStyle="success">清除键缓存</Button>
                  <Button type="button" bsStyle="info" onClick={this._onPurgeAll}>清除所有缓存</Button>
                </ButtonToolbar>
              </Input>
            </fieldset>
          </form>
        </Col>
        <Col md={6}>
          <h3>测试查询</h3>
          <p>您可以使用此表单手动查询查找表。数据将按照Graylog配置的方式进行缓存。</p>
          <form onSubmit={this._lookupKey}>
            <fieldset>
              <Input type="text"
                     id="key"
                     name="key"
                     label="键"
                     required
                     onChange={this._onChange}
                     help="用于查找值的键。"
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

export default LookupTable;
