import React from 'react';
import { DocumentTitle, PageHeader } from 'components/common';

const AccessTokenConfig = () => {
  return (
    <DocumentTitle title="访问令牌认证器">
      <span>
        <PageHeader title="访问令牌认证器" subpage>
          <span>每个用户都可以生成访问令牌，以避免在不安全的脚本中使用主密码。</span>
        </PageHeader>
        <span>目前没有配置可用于访问令牌。 如果您不使用访问令牌，则可以安全地禁用此身份验证器。</span>
      </span>
    </DocumentTitle>
  );
};

export default AccessTokenConfig;
