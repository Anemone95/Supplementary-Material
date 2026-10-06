import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocumentationLink from 'components/support/DocumentationLink';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { ConditionAlertNotifications, EditAlertConditionForm } from 'components/alertconditions';

import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';

import CombinedProvider from 'injection/CombinedProvider';
const { CurrentUserStore } = CombinedProvider.get('CurrentUser');
const { StreamsStore } = CombinedProvider.get('Streams');
const { AlertConditionsStore, AlertConditionsActions } = CombinedProvider.get('AlertConditions');

const EditAlertConditionPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(CurrentUserStore), Reflux.connect(AlertConditionsStore)],

  getInitialState() {
    return {
      stream: undefined,
    };
  },

  componentDidMount() {
    StreamsStore.get(this.props.params.streamId, (stream) => {
      this.setState({ stream: stream });
    });

    AlertConditionsActions.get(this.props.params.streamId, this.props.params.conditionId);
  },

  _isLoading() {
    return !this.state.stream || !this.state.alertCondition;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const condition = this.state.alertCondition;
    const stream = this.state.stream;

    return (
      <DocumentTitle title={`条件${condition.title || 'Untitled'}`}>
        <div>
          <PageHeader title={<span>条件<em>{condition.title || 'Untitled'}</em></span>}>
            <span>
              定义警报条件并配置当条件满足时，Graylog通知您的方式。
            </span>

            <span>
              默认条件不够灵活吗? 您也可以自己写！要了解更多更多关于警告的信息，请查看{' '}
              <DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档" />。
            </span>

            <span>
              <LinkContainer to={Routes.ALERTS.CONDITIONS}>
                <Button bsStyle="info">管理条件</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.ALERTS.NOTIFICATIONS}>
                <Button bsStyle="info">管理通知</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <EditAlertConditionForm alertCondition={condition} stream={stream} />
            </Col>
          </Row>

          <Row className="content">
            <Col md={12}>
              <ConditionAlertNotifications alertCondition={condition} stream={stream} />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default EditAlertConditionPage;
