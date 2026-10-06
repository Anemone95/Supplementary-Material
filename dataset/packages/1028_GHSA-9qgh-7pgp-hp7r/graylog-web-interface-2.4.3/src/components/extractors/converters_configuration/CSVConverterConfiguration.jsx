import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import FormUtils from 'util/FormsUtils';

const CSVConverterConfiguration = React.createClass({
  propTypes: {
    type: PropTypes.string.isRequired,
    configuration: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  },
  componentDidMount() {
    this.props.onChange(this.props.type, this._getConverterObject());
  },
  _getConverterObject(configuration) {
    return { type: this.props.type, config: configuration || this.props.configuration };
  },
  _toggleConverter(event) {
    let converter;
    if (FormUtils.getValueFromInput(event.target) === true) {
      converter = this._getConverterObject();
    }

    this.props.onChange(this.props.type, converter);
  },
  _onChange(key) {
    return (event) => {
      const newConfig = this.props.configuration;
      newConfig[key] = FormUtils.getValueFromInput(event.target);
      this.props.onChange(this.props.type, this._getConverterObject(newConfig));
    };
  },
  render() {
    const separatorHelpMessage = (
      <span>
        例如 <code>,</code>, <code>\n</code>, 和 <code>\t</code> 将被翻译成一个单一的字符。
      </span>
    );

    return (
      <div className="xtrc-converter">
        <Input type="checkbox"
               ref="converterEnabled"
               id={`enable-${this.props.type}-converter`}
               label="将CSV列添加为字段"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked
               onChange={this._toggleConverter} />

        <Row className="row-sm">
          <Col md={9} mdOffset={2}>
            <div className="xtrc-converter-subfields">
              <Input type="text"
                     id={`${this.props.type}_converter_column_header`}
                     label="字段名"
                     defaultValue={this.props.configuration.column_header}
                     labelClassName="col-md-3"
                     wrapperClassName="col-md-9"
                     placeholder="字段1,字段2,字段3"
                     onChange={this._onChange('column_header')}
                     required={this.refs.converterEnabled && this.refs.converterEnabled.getChecked()} />

              <Input type="text"
                     id={`${this.props.type}_converter_separator`}
                     label="分隔符字符"
                     defaultValue={this.props.configuration.separator || ','}
                     labelClassName="col-md-3"
                     wrapperClassName="col-md-9"
                     maxLength="2"
                     onChange={this._onChange('separator')}
                     help={separatorHelpMessage} />

              <Input type="text"
                     id={`${this.props.type}_converter_quote_char`}
                     label="引用字符"
                     defaultValue={this.props.configuration.quote_char || '"'}
                     labelClassName="col-md-3"
                     wrapperClassName="col-md-9"
                     maxLength="1"
                     onChange={this._onChange('quote_char')} />

              <Input type="text"
                     id={`${this.props.type}_converter_escape_char`}
                     label="转义字符"
                     defaultValue={this.props.configuration.escape_char || '\\'}
                     labelClassName="col-md-3"
                     wrapperClassName="col-md-9"
                     maxLength="1"
                     onChange={this._onChange('escape_char')}
                     help="用于转义分隔符和引号字符的字符。" />

              <Input type="checkbox"
                     id={`${this.props.type}_converter_strict_quotes`}
                     label="使用严格的引号"
                     wrapperClassName="col-md-offset-3 col-md-9"
                     defaultChecked={this.props.configuration.strict_quotes}
                     onChange={this._onChange('strict_quotes')}
                     help="忽略引号之外的内容。" />

              <Input type="checkbox"
                     id={`${this.props.type}_converter_trim_leading_whitespace`}
                     label="削减行距空格"
                     wrapperClassName="col-md-offset-3 col-md-9"
                     defaultChecked={this.props.configuration.trim_leading_whitespace}
                     onChange={this._onChange('trim_leading_whitespace')} />
            </div>
          </Col>
        </Row>
      </div>
    );
  },
});

export default CSVConverterConfiguration;
