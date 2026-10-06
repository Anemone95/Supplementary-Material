import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import FormUtils from 'util/FormsUtils';

const SplitAndCountConverterConfiguration = React.createClass({
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
    const splitByHelpMessage = (
      <span>
        Split和Count转换器将提取的部分按已定义的字符分隔开，并将存储令牌计数为字段。{' '}
         <strong>例如:</strong> <em>?fields=first_name,last_name,zip</em> 通过<em>,</em>分隔{' '}
        结果为<em>3</em>。 您只需计算了GET用户REST请求的请求字段。
      </span>
    );

    return (
      <div className="xtrc-converter">
        <Input type="checkbox"
               ref="converterEnabled"
               id={`enable-${this.props.type}-converter`}
               label="Split & Count"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked
               onChange={this._toggleConverter} />
        <Row className="row-sm">
          <Col md={9} mdOffset={2}>
            <div className="xtrc-converter-subfields">
              <Input type="text"
                     id={`${this.props.type}_converter_split_by`}
                     label="用于分隔的字符"
                     defaultValue={this.props.configuration.split_by}
                     labelClassName="col-md-3"
                     wrapperClassName="col-md-9"
                     onChange={this._onChange('split_by')}
                     required={this.refs.converterEnabled && this.refs.converterEnabled.getChecked()}
                     help={splitByHelpMessage} />
            </div>
          </Col>
        </Row>
      </div>
    );
  },
});

export default SplitAndCountConverterConfiguration;
