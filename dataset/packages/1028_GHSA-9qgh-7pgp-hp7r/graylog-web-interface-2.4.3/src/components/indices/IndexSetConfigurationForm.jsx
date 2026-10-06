import PropTypes from 'prop-types';
import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Col, Row } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import { Spinner } from 'components/common';

import { PluginStore } from 'graylog-web-plugin/plugin';
import IndexMaintenanceStrategiesConfiguration from 'components/indices/IndexMaintenanceStrategiesConfiguration';
import {} from 'components/indices/rotation'; // Load rotation plugin UI plugins from core.
import {} from 'components/indices/retention'; // Load rotation plugin UI plugins from core.

const IndexSetConfigurationForm = React.createClass({
  propTypes: {
    indexSet: PropTypes.object.isRequired,
    rotationStrategies: PropTypes.array.isRequired,
    retentionStrategies: PropTypes.array.isRequired,
    create: PropTypes.bool,
    onUpdate: PropTypes.func.isRequired,
    cancelLink: PropTypes.string.isRequired,
  },

  getInitialState() {
    return {
      indexSet: this.props.indexSet,
      validationErrors: {},
    };
  },

  _updateConfig(fieldName, value) {
    const config = this.state.indexSet;
    config[fieldName] = value;
    this.setState({ indexSet: config });
  },

  _validateIndexPrefix(event) {
    const value = event.target.value;

    if (value.match(/^[a-z0-9][a-z0-9_\-+]*$/)) {
      if (this.state.validationErrors[event.target.name]) {
        const nextValidationErrors = Object.assign({}, this.state.validationErrors);
        delete nextValidationErrors[event.target.name];
        this.setState({ validationErrors: nextValidationErrors });
      }
    } else {
      const nextValidationErrors = Object.assign({}, this.state.validationErrors);
      if (value.length === 0) {
        nextValidationErrors[event.target.name] = '索引前缀无效: 不能为空';
      } else if (value.indexOf('_') === 0 || value.indexOf('-') === 0 || value.indexOf('+') === 0) {
        nextValidationErrors[event.target.name] = '索引前缀无效: 必须以字母或数字开头';
      } else if (value.toLowerCase() !== value) {
        nextValidationErrors[event.target.name] = '索引前缀无效: 必须是小写的';
      } else {
        nextValidationErrors[event.target.name] = '索引前缀无效: 必须只包含字母和数字, \'_\', \'-\' 和 \'+\'';
      }
      this.setState({ validationErrors: nextValidationErrors });
    }

    this._onInputChange(event);
  },

  _onInputChange(event) {
    this._updateConfig(event.target.name, event.target.value);
  },

  _onDisableOptimizationClick(event) {
    this._updateConfig(event.target.name, event.target.checked);
  },

  _saveConfiguration(event) {
    event.preventDefault();

    const invalidFields = Object.keys(this.state.validationErrors);
    if (invalidFields.length !== 0) {
      document.getElementsByName(invalidFields[0])[0].focus();
      return;
    }

    this.props.onUpdate(this.state.indexSet);
  },

  _updateRotationConfigState(strategy, data) {
    this._updateConfig('rotation_strategy_class', strategy);
    this._updateConfig('rotation_strategy', data);
  },

  _updateRetentionConfigState(strategy, data) {
    this._updateConfig('retention_strategy_class', strategy);
    this._updateConfig('retention_strategy', data);
  },

  render() {
    const indexSet = this.props.indexSet;
    const validationErrors = this.state.validationErrors;

    let rotationConfig;
    if (this.props.rotationStrategies) {
      // The component expects a different structure - legacy
      const activeConfig = {
        config: this.props.indexSet.rotation_strategy,
        strategy: this.props.indexSet.rotation_strategy_class,
      };
      rotationConfig = (<IndexMaintenanceStrategiesConfiguration title="索引循环配置"
                                                                 description="Graylog使用多个索引来存储文档。您可以配置它决定何时循环当前使用中索引的策略。"
                                                                 selectPlaceholder="选择循环的策略"
                                                                 pluginExports={PluginStore.exports('indexRotationConfig')}
                                                                 strategies={this.props.rotationStrategies}
                                                                 activeConfig={activeConfig}
                                                                 updateState={this._updateRotationConfigState} />);
    } else {
      rotationConfig = (<Spinner />);
    }

    let retentionConfig;
    if (this.props.retentionStrategies) {
      // The component expects a different structure - legacy
      const activeConfig = {
        config: this.props.indexSet.retention_strategy,
        strategy: this.props.indexSet.retention_strategy_class,
      };
      retentionConfig = (<IndexMaintenanceStrategiesConfiguration title="索引保留配置"
                                                                  description="Graylog使用保留策略来清理旧的索引。"
                                                                  selectPlaceholder="选择保留策略"
                                                                  pluginExports={PluginStore.exports('indexRetentionConfig')}
                                                                  strategies={this.props.retentionStrategies}
                                                                  activeConfig={activeConfig}
                                                                  updateState={this._updateRetentionConfigState} />);
    } else {
      retentionConfig = (<Spinner />);
    }

    let readOnlyconfig;
    if (this.props.create) {
      const indexPrefixHelp = (
        <span>
          一个<strong>唯一的</strong>前缀使用在这个索引集的弹性搜索索引中。
          前缀必须以字母或数字开头，并且只能包含字母，数字，'_', '-' 和 '+'。
        </span>
      );
      readOnlyconfig = (
        <span>
          <Input type="text"
                 id="index-set-index-prefix"
                 label="索引前缀"
                 name="index_prefix"
                 onChange={this._validateIndexPrefix}
                 value={indexSet.index_prefix}
                 help={validationErrors.index_prefix ? validationErrors.index_prefix : indexPrefixHelp}
                 bsStyle={validationErrors.index_prefix ? 'error' : null}
                 required />
          <Input type="text"
                 id="index-set-index-analyzer"
                 label="分析器"
                 name="index_analyzer"
                 onChange={this._onInputChange}
                 value={indexSet.index_analyzer}
                 help="索引集的Elasticsearch分析器"
                 required />
        </span>
      );
    }

    return (
      <Row>
        <Col md={8}>
          <form className="form" onSubmit={this._saveConfiguration}>
            <Row>
              <Col md={12}>
                <Input type="text"
                       id="index-set-title"
                       label="标题"
                       name="title"
                       onChange={this._onInputChange}
                       value={indexSet.title}
                       help="索引集的名称。"
                       autoFocus
                       required />
                <Input type="text"
                       id="index-set-description"
                       label="描述"
                       name="description"
                       onChange={this._onInputChange}
                       value={indexSet.description}
                       help="对该索引集的描述。"
                       required />
                {readOnlyconfig}
                <Input type="number"
                       id="index-set-shards"
                       label="索引分片"
                       name="shards"
                       onChange={this._onInputChange}
                       value={indexSet.shards}
                       help="这个索引集中单个索引使用的弹性搜索碎片数量。"
                       required />
                <Input type="number"
                       id="index-set-replicas"
                       label="索引副本"
                       name="replicas"
                       onChange={this._onInputChange}
                       value={indexSet.replicas}
                       help="这个索引集中单个索引使用的弹性搜索副本数量。"
                       required />
                <Input type="number"
                       id="index-set-max-num-segments"
                       label="最大段数"
                       name="index_optimization_max_num_segments"
                       min="1"
                       onChange={this._onInputChange}
                       value={indexSet.index_optimization_max_num_segments}
                       help="优化(强制合并)后单个弹性搜索索引的最大段数。"
                       required />
                <Input type="checkbox"
                       id="index-set-disable-optimization"
                       label="循环后禁用索引优化"
                       name="index_optimization_disabled"
                       onChange={this._onDisableOptimizationClick}
                       checked={indexSet.index_optimization_disabled}
                       help="循环后禁用弹性搜索索引优化(强制合并)。" />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                {indexSet.writable && rotationConfig}
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                {indexSet.writable && retentionConfig}
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Button type="submit" bsStyle="primary" style={{ marginRight: 10 }}>保存</Button>
                <LinkContainer to={this.props.cancelLink}>
                  <Button bsStyle="default">取消</Button>
                </LinkContainer>
              </Col>
            </Row>
          </form>
        </Col>
      </Row>
    );
  },
});

export default IndexSetConfigurationForm;
