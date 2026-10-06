import React from 'react';
import { DocumentTitle, PageHeader } from 'components/common';

const RootUserConfig = () => {
  return (
    <DocumentTitle title="管理用户验证器">
      <span>
        <PageHeader title="管理用户验证器" subpage>
          <span>该验证器授予对配置文件中指定的管理员用户的访问权限。</span>
        </PageHeader>
        <span>目前，管理员用户认证器不能在配置文件之外进行配置。现在也不能禁用。</span>
      </span>
    </DocumentTitle>
  );
};

export default RootUserConfig;
