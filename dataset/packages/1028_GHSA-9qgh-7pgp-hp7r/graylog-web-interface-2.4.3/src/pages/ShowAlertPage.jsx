import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Label, Tooltip } from 'react-bootstrap';

import { DocumentTitle, OverlayElement, PageHeader, Spinner, Timestamp } from 'components/common';
import { AlertDetails } from 'components/alerts';

import DateTime from 'logic/datetimes/DateTime';
import UserNotification from 'util/UserNotification';
import Routes from 'routing/Routes';

import CombinedProvider from 'injection/CombinedProvider';
const { AlertsStore, AlertsActions } = CombinedProvider.get('Alerts');
const { AlertConditionsStore, AlertConditionsActions } = CombinedProvider.get('AlertConditions');
const { StreamsStore } = CombinedProvider.get('Streams');

import style from './ShowAlertPage.css';

const ShowAlertPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(AlertsStore), Reflux.connect(AlertConditionsStore)],

  getInitialState() {
    return {
      stream: undefined,
    };
  },

  componentDidMount() {
    this._loadData();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.alert !== this.state.alert) {
      this._loadAlertDetails(this.state.alert);
    }
  },

  _loadData() {
    AlertConditionsActions.available();
    AlertsActions.get(this.props.params.alertId);
  },

  _loadAlertDetails(alert) {
    StreamsStore.get(alert.stream_id, (stream) => {
      this.setState({ stream: stream });
    });
    AlertConditionsActions.get(alert.stream_id, alert.condition_id, (error) => {
      if (error.additional && error.additional.status === 404) {
        this.setState({ alertCondition: {} });
      } else {
        UserNotification.error(`Fetching alert condition ${alert.condition_id} failed with status: ${error}`,
          'Could not get alert condition information');
      }
    });
  },

  _isLoading() {
    return !this.state.alert || !this.state.alertCondition || !this.state.types || !this.state.stream;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const alert = this.state.alert;
    const condition = this.state.alertCondition;
    const conditionExists = Object.keys(condition).length > 0;
    const type = this.state.types[condition.type] || {};
    const stream = this.state.stream;

    let statusLabel;
    let resolvedState;
    if (!alert.is_interval || alert.resolved_at) {
      statusLabel = <Label bsStyle="success">解决的</Label>;
      const resolvedAtTime = alert.resolved_at || alert.triggered_at;
      if (resolvedAtTime) {
        resolvedState = (
          <span>
            此警报被解决在 <Timestamp dateTime={resolvedAtTime} format={DateTime.Formats.DATETIME} />.
          </span>
        );
      }
    } else {
      statusLabel = <Label bsStyle="danger">未解决的</Label>;
      resolvedState = (
        <span>
          此警报被触发在{' '}
          <Timestamp dateTime={alert.triggered_at} format={DateTime.Formats.DATETIME} />{' '}
          并且仍然未解决。
        </span>
      );
    }

    const title = (
      <span>{conditionExists ? condition.title || 'Untitled alert' : '未知警报'}&nbsp;
        <small>
          在流 <em>{stream.title}</em>&nbsp;
          <span className={style.alertStatusLabel}>{statusLabel}</span>
        </small>
      </span>
    );

    const conditionDetailsTooltip = (
      <Tooltip id="disabled-condition-details">
        自触发警报以来，相关条件很可能已被删除，没有提供详细信息。
      </Tooltip>
    );

    return (
      <DocumentTitle title={`${conditionExists ? condition.title || 'Untitled alert' : '未知警报'} 在流 ${stream.title}`}>
        <div>
          <PageHeader title={title}>
            <span>
              检查此警报的时间线，包括发送通知和收到消息的警报期间。
            </span>

            <span>
              {resolvedState}
            </span>

            <span>
              <OverlayElement overlay={conditionDetailsTooltip} placement="top" useOverlay={!condition.id}
                              trigger={['hover', 'focus']}>
                <LinkContainer to={Routes.show_alert_condition(stream.id, condition.id)} disabled={!condition.id}>
                  <Button bsStyle="info">条件详情</Button>
                </LinkContainer>
              </OverlayElement>
              &nbsp;
              <LinkContainer to={Routes.ALERTS.LIST}>
                <Button bsStyle="info">警报概览</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <AlertDetails alert={alert} condition={conditionExists && condition} conditionType={type} stream={stream} />
        </div>
      </DocumentTitle>
    );
  },
});

export default ShowAlertPage;
