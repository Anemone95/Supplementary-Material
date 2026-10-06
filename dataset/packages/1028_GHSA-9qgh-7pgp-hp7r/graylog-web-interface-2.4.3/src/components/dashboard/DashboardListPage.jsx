import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import Immutable from 'immutable';
import { Row, Col } from 'react-bootstrap';

import CombinedProvider from 'injection/CombinedProvider';

const { DashboardsActions, DashboardsStore } = CombinedProvider.get('Dashboards');

import DocsHelper from 'util/DocsHelper';
import PermissionsMixin from 'util/PermissionsMixin';

import DocumentationLink from 'components/support/DocumentationLink';
import Spinner from 'components/common/Spinner';
import PageHeader from 'components/common/PageHeader';
import DashboardList from './DashboardList';
import EditDashboardModalTrigger from './EditDashboardModalTrigger';

const DashboardListPage = React.createClass({
  propTypes: {
    permissions: PropTypes.arrayOf(PropTypes.string),
  },
  mixins: [Reflux.connect(DashboardsStore, 'dashboards'), PermissionsMixin],
  getInitialState() {
    return {
      dashboardsLoaded: false,
    };
  },
  componentDidMount() {
    DashboardsActions.list();
  },
  render() {
    const { dashboards } = this.state.dashboards;
    const filteredDashboards = dashboards;
    const createDashboardButton = this.isPermitted(this.props.permissions, ['dashboards:create']) ?
      <EditDashboardModalTrigger action="create" buttonClass="btn-success btn-lg" /> : null;

    const pageHeader = (
      <PageHeader title="Dashboards">
        <span>
          使用仪表板在您的消息上创建特定的视图。在这里创建一个新的仪表板，并添加您在Graylog的其他部分创建的图表。
        </span>

        <span>
          请查看
          {' '}<DocumentationLink page={DocsHelper.PAGES.DASHBOARDS} text="仪表板教程" />{' '}
          了解其他有用的技巧。
        </span>

        {createDashboardButton}
      </PageHeader>
    );

    let dashboardList;

    if (!dashboards) {
      dashboardList = <Spinner />;
    } else {
      if (dashboards && dashboards.count() > 0 && filteredDashboards.isEmpty()) {
        dashboardList = <div>没有仪表板与您的过滤标准匹配。</div>;
      } else {
        dashboardList = (
          <DashboardList dashboards={filteredDashboards}
                         onDashboardAdd={this._onDashboardAdd}
                         permissions={this.props.permissions}/>
        );
      }
    }

    return (
      <div>
        {pageHeader}

        <Row className="content">
          <Col md={12}>
            {dashboardList}
          </Col>
        </Row>
      </div>
    );
  },
});

export default DashboardListPage;
