import PropTypes from 'prop-types';
import React from 'react';
import { Button, Col, ControlLabel, FormControl, FormGroup, Row } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import ExtractorExampleMessage from './ExtractorExampleMessage';
import EditExtractorConfiguration from './EditExtractorConfiguration';
import EditExtractorConverters from './EditExtractorConverters';

import ActionsProvider from 'injection/ActionsProvider';
const ExtractorsActions = ActionsProvider.getActions('Extractors');

import ExtractorUtils from 'util/ExtractorUtils';
import FormUtils from 'util/FormsUtils';

import StoreProvider from 'injection/StoreProvider';
const ToolsStore = StoreProvider.getStore('Tools');

const EditExtractor = React.createClass({
  propTypes: {
    action: PropTypes.oneOf(['create', 'edit']).isRequired,
    extractor: PropTypes.object.isRequired,
    inputId: PropTypes.string.isRequired,
    exampleMessage: PropTypes.string,
    onSave: PropTypes.func.isRequired,
  },
  getInitialState() {
    return {
      updatedExtractor: this.props.extractor,
      conditionTestResult: undefined,
      exampleMessage: this.props.exampleMessage,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.exampleMessage !== nextProps.exampleMessage) {
      this._updateExampleMessage(nextProps.exampleMessage);
    }
  },

  _updateExampleMessage(nextExample) {
    this.setState({ exampleMessage: nextExample });
  },

  // Ensures the target field only contains alphanumeric characters and underscores
  _onTargetFieldChange(event) {
    const value = event.target.value;
    const newValue = value.replace(/[^\w\d_]/g, '');

    if (value !== newValue) {
      this.refs.targetField.getInputDOMNode().value = newValue;
    }

    this._onFieldChange('target_field')(event);
  },
  _onFieldChange(key) {
    return (event) => {
      const nextState = {};
      const updatedExtractor = this.state.updatedExtractor;
      updatedExtractor[key] = FormUtils.getValueFromInput(event.target);
      nextState.updatedExtractor = updatedExtractor;

      // Reset result of testing condition after a change in the input
      if (key === 'condition_value') {
        nextState.conditionTestResult = undefined;
      }

      this.setState(nextState);
    };
  },
  _onConfigurationChange(newConfiguration) {
    const updatedExtractor = this.state.updatedExtractor;
    updatedExtractor.extractor_config = newConfiguration;
    this.setState({ updatedExtractor: updatedExtractor });
  },
  _onConverterChange(converterType, newConverter) {
    const updatedExtractor = this.state.updatedExtractor;
    const previousConverter = updatedExtractor.converters.filter(converter => converter.type === converterType)[0];

    if (previousConverter) {
      // Remove converter from the list
      const position = updatedExtractor.converters.indexOf(previousConverter);
      updatedExtractor.converters.splice(position, 1);
    }

    if (newConverter) {
      updatedExtractor.converters.push(newConverter);
    }

    this.setState({ updatedExtractor: updatedExtractor });
  },
  _testCondition() {
    const updatedExtractor = this.state.updatedExtractor;
    const tester = (updatedExtractor.condition_type === 'string' ? ToolsStore.testContainsString : ToolsStore.testRegex);
    const promise = tester(updatedExtractor.condition_value, this.state.exampleMessage);
    promise.then(result => this.setState({ conditionTestResult: result.matched }));
  },
  _tryButtonDisabled() {
    return this.state.updatedExtractor.condition_value === '' || this.state.updatedExtractor.condition_value === undefined || !this.state.exampleMessage;
  },
  _getExtractorConditionControls() {
    if (!this.state.updatedExtractor.condition_type || this.state.updatedExtractor.condition_type === 'none') {
      return <div />;
    }

    let conditionInputLabel;
    let conditionInputHelp;

    if (this.state.updatedExtractor.condition_type === 'string') {
      conditionInputLabel = '字段包含的字符串';
      conditionInputHelp = '输入字段应该包含的字符串，以便尝试提取。';
    } else {
      conditionInputLabel = '字段匹配的正则表达式';
      conditionInputHelp = '输入字段应该匹配的正则表达式，以便尝试提取。';
    }

    let inputStyle;
    if (this.state.conditionTestResult === true) {
      inputStyle = 'success';
      conditionInputHelp = '匹配!提取器将针对这个示例运行。';
    } else if (this.state.conditionTestResult === false) {
      inputStyle = 'error';
      conditionInputHelp = '不匹配!提取器不会运行。';
    }

    return (
      <div>
        <Input id="condition_value" label={conditionInputLabel}
               bsStyle={inputStyle}
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               help={conditionInputHelp}>
          <Row className="row-sm">
            <Col md={11}>
              <input type="text" id="condition_value" className="form-control"
                     defaultValue={this.state.updatedExtractor.condition_value}
                     onChange={this._onFieldChange('condition_value')} required />
            </Col>
            <Col md={1} className="text-right">
              <Button bsStyle="info" onClick={this._testCondition}
                      disabled={this._tryButtonDisabled()}>
                尝试
              </Button>
            </Col>
          </Row>
        </Input>
      </div>
    );
  },
  _saveExtractor(event) {
    event.preventDefault();
    ExtractorsActions.save.triggerPromise(this.props.inputId, this.state.updatedExtractor)
      .then(() => this.props.onSave());
  },

  _staticField(label, text) {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={2}>
          {label}
        </Col>
        <Col md={10}>
          <FormControl.Static>{text}</FormControl.Static>
        </Col>
      </FormGroup>
    );
  },

  render() {
    const conditionTypeHelpMessage = '只从与特定条件匹配的消息中提取，可以帮助您' +
      '避免错误或不必要的提取，还可以节省CPU资源。';

    const cursorStrategyHelpMessage = (
      <span>
        您想要复制还是从源代码中剪切?你不能在标准字段上使用裁剪功能，例如{' '}
        <em>消息</em>和<em>源</em>。
      </span>
    );

    const targetFieldHelpMessage = (
      <span>
        选择一个字段名来存储提取的值。它只能包含<b>字母数字字符和
        分数</b>。 例如: <em>http_response_code</em>。
      </span>
    );

    let storeAsFieldInput;
    // Grok and JSON extractors create their required fields, so no need to add an input for them
    if (this.state.updatedExtractor.type !== ExtractorUtils.ExtractorTypes.GROK && this.state.updatedExtractor.type !== ExtractorUtils.ExtractorTypes.JSON) {
      storeAsFieldInput = (
        <Input type="text" ref="targetField" id="target_field" label="存储为字段"
               defaultValue={this.state.updatedExtractor.target_field}
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               onChange={this._onTargetFieldChange}
               required
               help={targetFieldHelpMessage} />
      );
    }

    return (
      <div>
        <Row className="content extractor-list">
          <Col md={12}>
            <h2>示例消息</h2>
            <Row style={{ marginTop: 5 }}>
              <Col md={12}>
                <ExtractorExampleMessage field={this.state.updatedExtractor.source_field}
                                         example={this.state.exampleMessage}
                                         onExampleLoad={this._updateExampleMessage} />
              </Col>
            </Row>
            <h2>提取器配置</h2>
            <Row>
              <Col md={8}>
                <form className="extractor-form form-horizontal" method="POST" onSubmit={this._saveExtractor}>
                  {this._staticField('提取器类型', ExtractorUtils.getReadableExtractorTypeName(this.state.updatedExtractor.type))}
                  {this._staticField('源字段', this.state.updatedExtractor.source_field)}

                  <EditExtractorConfiguration ref="extractorConfiguration"
                                              extractorType={this.state.updatedExtractor.type}
                                              configuration={this.state.updatedExtractor.extractor_config}
                                              onChange={this._onConfigurationChange}
                                              exampleMessage={this.state.exampleMessage} />

                  <Input label="条件" labelClassName="col-md-2" wrapperClassName="col-md-10"
                         help={conditionTypeHelpMessage}>
                    <div className="radio">
                      <label>
                        <input type="radio" name="condition_type" value="none"
                               onChange={this._onFieldChange('condition_type')}
                               defaultChecked={!this.state.updatedExtractor.condition_type || this.state.updatedExtractor.condition_type === 'none'} />
                        总是尝试提取
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input type="radio" name="condition_type" value="string"
                               onChange={this._onFieldChange('condition_type')}
                               defaultChecked={this.state.updatedExtractor.condition_type === 'string'} />
                        只有字段包含字符串时才尝试提取
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input type="radio" name="condition_type" value="regex"
                               onChange={this._onFieldChange('condition_type')}
                               defaultChecked={this.state.updatedExtractor.condition_type === 'regex'} />
                        只有字段匹配正则表达式时才尝试提取
                      </label>
                    </div>
                  </Input>
                  {this._getExtractorConditionControls()}

                  {storeAsFieldInput}

                  <Input label="提取策略" labelClassName="col-md-2" wrapperClassName="col-md-10"
                         help={cursorStrategyHelpMessage}>
                    <label className="radio-inline">
                      <input type="radio" name="cursor_strategy" value="copy"
                             onChange={this._onFieldChange('cursor_strategy')}
                             defaultChecked={!this.state.updatedExtractor.cursor_strategy || this.state.updatedExtractor.cursor_strategy === 'copy'} />
                      复制
                    </label>
                    <label className="radio-inline">
                      <input type="radio" name="cursor_strategy" value="cut"
                             onChange={this._onFieldChange('cursor_strategy')}
                             defaultChecked={this.state.updatedExtractor.cursor_strategy === 'cut'} />
                      剪切
                    </label>
                  </Input>

                  <Input type="text" id="title" label="提取器名称"
                         defaultValue={this.state.updatedExtractor.title}
                         labelClassName="col-md-2"
                         wrapperClassName="col-md-10"
                         onChange={this._onFieldChange('title')}
                         required
                         help="提取器的描述性名称。" />

                  <div style={{ marginBottom: 20 }}>
                    <EditExtractorConverters extractorType={this.state.updatedExtractor.type}
                                             converters={this.state.updatedExtractor.converters}
                                             onChange={this._onConverterChange} />
                  </div>

                  <Input wrapperClassName="col-md-offset-2 col-md-10">
                    <Button type="submit" bsStyle="success">
                      {this.props.action === 'create' ? '创建提取器' : '修改提取器'}
                    </Button>
                  </Input>
                </form>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  },
});

export default EditExtractor;
