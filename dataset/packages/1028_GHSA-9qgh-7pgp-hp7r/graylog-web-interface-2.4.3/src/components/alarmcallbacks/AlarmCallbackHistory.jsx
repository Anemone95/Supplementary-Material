import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Col, Label } from 'react-bootstrap';

import { EntityListItem, Timestamp } from 'components/common';
import { ConfigurationWell } from 'components/configurationforms';
import DateTime from 'logic/datetimes/DateTime';

const AlarmCallbackHistory = React.createClass({
  propTypes: {
    types: PropTypes.object.isRequired,
    alarmCallbackHistory: PropTypes.object.isRequired,
  },

  render() {
    const history = this.props.alarmCallbackHistory;
    const configuration = history.alarmcallbackconfiguration;
    const type = this.props.types[configuration.type];

    const hadError = history.result.type === 'error';
    const result = (hadError ? <Label bsStyle="danger">错误</Label> : <Label bsStyle="success">发送</Label>);

    const title = (
      <span>
        {type ? configuration.title || 'Untitled notification' : 'Unknown notification'}
        {' '}
        <small>({type ? type.name : configuration.type})</small>
      </span>
    );
    const description = (hadError ?
      <span>发送通知出错 <Timestamp dateTime={history.created_at} format={DateTime.Formats.DATETIME} />: {history.result.error}</span> :
      <span>发送通知成功 <Timestamp dateTime={history.created_at} format={DateTime.Formats.DATETIME} />.</span>);

    let configurationWell;
    let configurationInfo;
    if (type) {
      configurationWell = <ConfigurationWell configuration={configuration.configuration} typeDefinition={type} />;
    } else {
      configurationInfo = (
        <Alert bsStyle="warning">
          该通知所需的插件未加载。不显示其配置。
        </Alert>
      );
    }

    const content = (
      <Col md={12}>
        {configurationInfo}
        <div className="alert-callback">
          {configurationWell}
        </div>
      </Col>
    );

    return (
      <EntityListItem title={title} titleSuffix={result} description={description} contentRow={content} />
    );
  },
});

export default AlarmCallbackHistory;
