import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import { TimezoneSelect } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';

import DocsHelper from 'util/DocsHelper';
import FormUtils from 'util/FormsUtils';

const FlexdateConverterConfiguration = React.createClass({
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
    return (data) => {
      const newConfig = this.props.configuration;
      // data can be an event or a value, we need to check its type :sick:
      newConfig[key] = typeof data === 'object' ? FormUtils.getValueFromInput(data.target) : data;
      this.props.onChange(this.props.type, this._getConverterObject(newConfig));
    };
  },
  render() {
    const timezoneHelpMessage = (
      <span>
        适用于日期的时区。 要了解更多请阅读<DocumentationLink
        page={DocsHelper.PAGES.PAGE_FLEXIBLE_DATE_CONVERTER} text="文档" />。
      </span>
    );

    return (
      <div className="xtrc-converter">
        <Input type="checkbox"
               id={`enable-${this.props.type}-converter`}
               label="灵活地解析日期"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked
               onChange={this._toggleConverter} />
        <Row className="row-sm">
          <Col md={9} mdOffset={2}>
            <div className="xtrc-converter-subfields">
              <Input label="时区"
                     id={`${this.props.type}_converter_timezone`}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9"
                     help={timezoneHelpMessage}>
                <TimezoneSelect ref="timezone"
                                id={`${this.props.type}_converter_timezone`}
                                className="timezone-select"
                                value={this.props.configuration.time_zone}
                                onChange={this._onChange('time_zone')} />
              </Input>
            </div>
          </Col>
        </Row>
      </div>
    );
  },
});

export default FlexdateConverterConfiguration;
