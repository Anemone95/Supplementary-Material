import PropTypes from 'prop-types';
import React from 'react';
import { Col, Label } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { EntityListItem, Timestamp } from 'components/common';

import Routes from 'routing/Routes';
import DateTime from 'logic/datetimes/DateTime';

import styles from './Alert.css';

const Alert = React.createClass({
  propTypes: {
    alert: PropTypes.object.isRequired,
    alertConditions: PropTypes.array.isRequired,
    streams: PropTypes.array.isRequired,
    conditionTypes: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      showAlarmCallbackHistory: false,
    };
  },

  render() {
    const alert = this.props.alert;
    const condition = this.props.alertConditions.find(alertCondition => alertCondition.id === alert.condition_id);
    const stream = this.props.streams.find(s => s.id === alert.stream_id);
    const conditionType = condition ? this.props.conditionTypes[condition.type] : {};

    let alertTitle;
    if (condition) {
      alertTitle = (
        <span>
          <LinkContainer to={Routes.show_alert(alert.id)}>
            <a>{condition.title || 'Untitled alert'}</a>
          </LinkContainer>
          {' '}
          <small>在流 <em>{stream.title}</em></small>
        </span>
      );
    } else {
      alertTitle = (
        <span>
          <LinkContainer to={Routes.show_alert(alert.id)}><a>未知警报</a></LinkContainer>
        </span>
      );
    }

    let statusBadge;
    if (!alert.is_interval || alert.resolved_at) {
      statusBadge = <Label bsStyle="success">已解决</Label>;
    } else {
      statusBadge = <Label bsStyle="danger">未解决</Label>;
    }

    let alertTime = <Timestamp dateTime={alert.triggered_at} format={DateTime.Formats.DATETIME} />;
    if (alert.is_interval) {
      alertTime = (
        <span>
          触发在 {alertTime},&nbsp;
          {alert.resolved_at ?
            <span>解决在 <Timestamp dateTime={alert.resolved_at} format={DateTime.Formats.DATETIME} />.</span> :
            <span><strong>仍在进行中</strong>.</span>}
        </span>
      );
    } else {
      alertTime = (
        <span>
          触发在 {alertTime}
        </span>
      );
    }

    const content = (
      <Col md={12}>
        <dl className={`dl-horizontal ${styles.alertDescription}`}>
          <dt>原因:</dt>
          <dd>{alert.description}</dd>
          <dt>类型:</dt>
          <dd>{conditionType.name || '未知类型。这通常意味着警报被触发后，警报条件被删除。'}</dd>
        </dl>
      </Col>
    );

    return (
      <EntityListItem key={`entry-list-${alert.id}`}
                      title={alertTitle}
                      titleSuffix={statusBadge}
                      description={alertTime}
                      contentRow={content} />
    );
  },
});

export default Alert;
