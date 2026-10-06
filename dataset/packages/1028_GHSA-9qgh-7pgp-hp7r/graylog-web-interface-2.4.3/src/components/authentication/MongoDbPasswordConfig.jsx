import PropTypes from 'prop-types';
import React from 'react';
import { DocumentTitle, PageHeader } from 'components/common';

const MongoDbPasswordConfig = React.createClass({
  propTypes: {
    config: PropTypes.object,
  },
  render() {
    return (
      <DocumentTitle title="密码验证器">
        <span>
          <PageHeader title="密码验证器" subpage>
            <span>这个验证器使用存储在MongoDB中的密码授予用户访问权限，通常是最后一个运行，以便其他验证源具有优先权。</span>
          </PageHeader>
          <span>如果您只依赖外部身份验证系统（如LDAP或Active Directory），则可以禁用此身份验证器。目前它没有配置选项。</span>
        </span>
      </DocumentTitle>
    );
  },
});

export default MongoDbPasswordConfig;
