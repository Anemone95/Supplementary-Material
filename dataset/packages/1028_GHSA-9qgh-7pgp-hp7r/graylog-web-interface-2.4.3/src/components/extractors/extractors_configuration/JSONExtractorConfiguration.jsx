import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import StoreProvider from 'injection/StoreProvider';
const ToolsStore = StoreProvider.getStore('Tools');

import ExtractorUtils from 'util/ExtractorUtils';
import FormUtils from 'util/FormsUtils';

const JSONExtractorConfiguration = React.createClass({
  propTypes: {
    configuration: PropTypes.object.isRequired,
    exampleMessage: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onExtractorPreviewLoad: PropTypes.func.isRequired,
  },
  getInitialState() {
    return {
      trying: false,
      configuration: this._getEffectiveConfiguration(this.props.configuration),
    };
  },
  componentDidMount() {
    this.props.onChange(this.state.configuration);
  },
  componentWillReceiveProps(nextProps) {
    this.setState({ configuration: this._getEffectiveConfiguration(nextProps.configuration) });
  },
  DEFAULT_CONFIGURATION: {
    list_separator: ', ',
    key_separator: '_',
    kv_separator: '=',
    key_prefix: '',
    replace_key_whitespace: false,
    key_whitespace_replacement: '_',
  },
  _getEffectiveConfiguration(configuration) {
    return ExtractorUtils.getEffectiveConfiguration(this.DEFAULT_CONFIGURATION, configuration);
  },
  _onChange(key) {
    return (event) => {
      this.props.onExtractorPreviewLoad(undefined);
      const newConfig = this.state.configuration;
      newConfig[key] = FormUtils.getValueFromInput(event.target);
      this.props.onChange(newConfig);
    };
  },
  _onTryClick() {
    this.setState({ trying: true });

    const configuration = this.state.configuration;
    const promise = ToolsStore.testJSON(configuration.flatten, configuration.list_separator,
      configuration.key_separator, configuration.kv_separator, configuration.replace_key_whitespace,
      configuration.key_whitespace_replacement, configuration.key_prefix, this.props.exampleMessage);

    promise.then((result) => {
      const matches = [];
      for (const match in result.matches) {
        if (result.matches.hasOwnProperty(match)) {
          matches.push(<dt key={`${match}-name`}>{match}</dt>);
          matches.push(<dd key={`${match}-value`}><samp>{result.matches[match]}</samp></dd>);
        }
      }

      const preview = (matches.length === 0 ? '' : <dl>{matches}</dl>);
      this.props.onExtractorPreviewLoad(preview);
    });

    promise.finally(() => this.setState({ trying: false }));
  },
  _isTryButtonDisabled() {
    return this.state.trying || !this.props.exampleMessage;
  },
  render() {
    return (
      <div>
        <Input type="checkbox"
               id="flatten"
               label="扁平结构"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked={this.state.configuration.flatten}
               onChange={this._onChange('flatten')}
               help="是否将JSON对象转换为单个消息字段，或将其扩展到多个字段。" />

        <Input type="text"
               id="list_separator"
               label="列表项分隔符"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.list_separator}
               required
               onChange={this._onChange('list_separator')}
               help="使用什么字符串来连接JSON列表的项目。" />

        <Input type="text"
               id="key_separator"
               label="键分隔符"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.key_separator}
               required
               onChange={this._onChange('key_separator')}
               help={<span>用什么字符串连接嵌套JSON对象的不同键(只适用于<em>非</em>扁平化的情况)。</span>} />

        <Input type="text"
               id="kv_separator"
               label="键/值分隔符"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.kv_separator}
               required
               onChange={this._onChange('kv_separator')}
               help="用什么字符串将JSON对象的键/值配对连接在一起(只适用于扁平化的情况)。" />

        <Input type="text"
               id="key_prefix"
               label="键前缀"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.key_prefix}
               onChange={this._onChange('key_prefix')}
               help="从JSON对象中提取每个键的文本。" />

        <Input type="checkbox"
               id="replace_key_whitespace"
               label="替换空格键"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked={this.state.configuration.replace_key_whitespace}
               onChange={this._onChange('replace_key_whitespace')}
               help="当存储所提取消息时，包含空格的字段键将被丢弃。请检查这个信息盒，并用其他字符替换JSON键中的空格。" />

        <Input type="text"
               id="key_whitespace_replacement"
               label="键空格替换"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               defaultValue={this.state.configuration.key_whitespace_replacement}
               disabled={!this.state.configuration.replace_key_whitespace}
               required
               onChange={this._onChange('key_whitespace_replacement')}
               help="在消息键中使用什么字符替换空白字符。请确保替换字符在Lucene中是有效的，例如 '-' 或 '_'。" />

        <Input wrapperClassName="col-md-offset-2 col-md-10">
          <Button bsStyle="info" onClick={this._onTryClick} disabled={this._isTryButtonDisabled()}>
            {this.state.trying ? <i className="fa fa-spin fa-spinner" /> : '尝试'}
          </Button>
        </Input>
      </div>
    );
  },
});

export default JSONExtractorConfiguration;
