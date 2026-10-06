import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import DocsHelper from 'util/DocsHelper';
import PermissionsMixin from 'util/PermissionsMixin';

import {} from 'components/authentication'; // Make sure to load all auth config plugins!

import PageHeader from 'components/common/PageHeader';
import DocumentationLink from 'components/support/DocumentationLink';

import AuthenticationComponent from 'components/authentication/AuthenticationComponent';

const AuthenticationPage = React.createClass({

  propTypes: {
    children: PropTypes.object,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  },

  mixins: [PermissionsMixin],

  render() {
    return (
      <span>
        <PageHeader title="认证管理">
          <span>配置Graylog的认证提供者并管理此Graylog集群的激活用户。</span>
          <span>要了解更多关于认证的信息，请查看<DocumentationLink page={DocsHelper.PAGES.USERS_ROLES}
                                                                   text="文档" />。</span>
        </PageHeader>

        <Row className="content">
          <Col md={12}>
            <AuthenticationComponent location={this.props.location} params={this.props.params} history={this.props.history}>
              {this.props.children}
            </AuthenticationComponent>
          </Col>
        </Row>
      </span>
    );
  },
});

export default AuthenticationPage;
