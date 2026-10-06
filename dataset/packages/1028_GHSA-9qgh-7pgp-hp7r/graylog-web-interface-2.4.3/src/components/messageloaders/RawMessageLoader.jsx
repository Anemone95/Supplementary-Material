import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import { Select } from 'components/common';
import { BooleanField, DropdownField, NumberField, TextField } from 'components/configurationforms';

import ActionsProvider from 'injection/ActionsProvider';
const MessagesActions = ActionsProvider.getActions('Messages');
const CodecTypesActions = ActionsProvider.getActions('CodecTypes');
const InputsActions = ActionsProvider.getActions('Inputs');

import StoreProvider from 'injection/StoreProvider';
// eslint-disable-next-line no-unused-vars
const MessagesStore = StoreProvider.getStore('Messages');
const CodecTypesStore = StoreProvider.getStore('CodecTypes');
const InputsStore = StoreProvider.getStore('Inputs');

const RawMessageLoader = React.createClass({
  propTypes: {
    onMessageLoaded: PropTypes.func.isRequired,
    inputIdSelector: PropTypes.bool,
  },

  mixins: [Reflux.connect(CodecTypesStore), Reflux.connect(InputsStore)],

  getDefaultProps() {
    return {
      inputIdSelector: false,
    };
  },

  getInitialState() {
    return {
      loading: false,
      message: '',
      remoteAddress: '',
      codec: '',
      codecConfiguration: {},
      inputId: undefined,
    };
  },

  componentDidMount() {
    CodecTypesActions.list();
    if (this.props.inputIdSelector) {
      InputsActions.list();
    }
  },

  DEFAULT_REMOTE_ADDRESS: '127.0.0.1',

  _loadMessage(event) {
    event.preventDefault();

    const { message, remoteAddress, codec, codecConfiguration, inputId } = this.state;
    this.setState({ loading: true });
    const promise = MessagesActions.loadRawMessage.triggerPromise(message, remoteAddress || this.DEFAULT_REMOTE_ADDRESS,
      codec, codecConfiguration);
    promise.then((loadedMessage) => {
      this.props.onMessageLoaded(
        loadedMessage,
        {
          message: message,
          remoteAddress: remoteAddress,
          codec: codec,
          codecConfiguration: codecConfiguration,
          inputId: inputId,
        });
    });
    promise.finally(() => this.setState({ loading: false }));
  },

  _bindValue(event) {
    const newState = {};
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  },

  _formatSelectOptions() {
    if (!this.state.codecTypes) {
      return [{ value: 'none', label: '正在加载编解码器类型...', disabled: true }];
    }

    const codecTypesIds = Object.keys(this.state.codecTypes);
    if (codecTypesIds.length === 0) {
      return [{ value: 'none', label: '没有可用的编解码器' }];
    }

    return codecTypesIds
      .filter(id => id !== 'random-http-msg') // Skip Random HTTP codec, as nobody wants to enter a raw random message.
      .map((id) => {
        const name = this.state.codecTypes[id].name;
        // Add id as label on codecs not having a descriptor name
        return { value: id, label: name === '' ? id : name };
      })
      .sort((codecA, codecB) => codecA.label.toLowerCase().localeCompare(codecB.label.toLowerCase()));
  },

  _formatInputSelectOptions() {
    if (!this.state.inputs) {
      return [{ value: 'none', label: '正在加载输入...', disabled: true }];
    }

    const inputIds = Object.keys(this.state.inputs);
    if (inputIds.length === 0) {
      return [{ value: 'none', label: '没有可用的输入' }];
    }

    return inputIds
      .map((id) => {
        const inputId = this.state.inputs[id].id;
        const label = `${inputId} / ${this.state.inputs[id].title} / ${this.state.inputs[id].name}`;
        return { value: inputId, label: label };
      })
      .sort((inputA, inputB) => inputA.label.toLowerCase().localeCompare(inputB.label.toLowerCase()));
  },

  _onCodecSelect(selectedCodec) {
    this._bindValue({ target: { name: 'codec', value: selectedCodec } });
    this.setState({ codecConfiguration: {} });
  },

  _onInputSelect(selectedInput) {
    this.setState({ inputId: selectedInput });
  },

  _onCodecConfigurationChange(field, value) {
    const newConfiguration = Object.assign(this.state.codecConfiguration);
    newConfiguration[field] = value;
    this._bindValue({ target: { name: 'codecConfiguration', value: newConfiguration } });
  },

  _formatConfigField(key, configField) {
    const value = this.state.codecConfiguration[key];
    const typeName = 'RawMessageLoader';
    const elementKey = `${typeName}-${key}`;

    switch (configField.type) {
      case 'text':
        return (<TextField key={elementKey} typeName={typeName} title={key} field={configField}
                           value={value} onChange={this._onCodecConfigurationChange} />);
      case 'number':
        return (<NumberField key={elementKey} typeName={typeName} title={key} field={configField}
                             value={value} onChange={this._onCodecConfigurationChange} />);
      case 'boolean':
        return (<BooleanField key={elementKey} typeName={typeName} title={key} field={configField}
                              value={value} onChange={this._onCodecConfigurationChange} />);
      case 'dropdown':
        return (<DropdownField key={elementKey} typeName={typeName} title={key} field={configField}
                               value={value} onChange={this._onCodecConfigurationChange} />);
      default:
        return null;
    }
  },

  _isSubmitDisabled() {
    return !this.state.message || !this.state.codec || this.state.loading;
  },

  render() {
    let codecConfigurationOptions;
    if (this.state.codecTypes && this.state.codec) {
      const codecConfiguration = this.state.codecTypes[this.state.codec].requested_configuration;
      codecConfigurationOptions = Object.keys(codecConfiguration)
        .sort((keyA, keyB) => codecConfiguration[keyA].is_optional - codecConfiguration[keyB].is_optional)
        .map(key => this._formatConfigField(key, codecConfiguration[key]));
    }

    let inputIdSelector;
    if (this.props.inputIdSelector) {
      inputIdSelector = (
        <Input id="input" name="input" label={<span>消息输入<small>(可选的)</small></span>}
               help="选择应分配给已解析消息的消息输入ID。">
          <Select id="input" placeholder="选择输入" options={this._formatInputSelectOptions()}
                  matchProp="label" onChange={this._onInputSelect} value={this.state.inputId} />
        </Input>
      );
    }

    return (
      <Row>
        <Col md={7}>
          <form onSubmit={this._loadMessage}>
            <fieldset>
              <Input id="message" name="message" type="textarea" label="原始消息"
                     value={this.state.message} onChange={this._bindValue} rows={3} required />
              <Input id="remoteAddress" name="remoteAddress" type="text"
                     label={<span>源IP地址<small>(可选的)</small></span>}
                     help={`远程IP地址用作消息源。Graylog默认会使用${this.DEFAULT_REMOTE_ADDRESS}。`}
                     value={this.state.remoteAddress} onChange={this._bindValue} />
            </fieldset>
            {inputIdSelector}
            <fieldset>
              <legend>编解码器配置</legend>
              <Input id="codec" name="codec" label="消息编解码器"
                     help="选择应该用于解码消息的编解码器。" required>
                <Select id="codec" placeholder="选择编解码器" options={this._formatSelectOptions()}
                        matchProp="label" onChange={this._onCodecSelect} value={this.state.codec} />
              </Input>
              {codecConfigurationOptions}
            </fieldset>
            <Button type="submit" bsStyle="info" disabled={this._isSubmitDisabled()}>
              {this.state.loading ? '正在加载消息...' : '加载消息'}
            </Button>
          </form>
        </Col>
      </Row>
    );
  },
});

export default RawMessageLoader;
