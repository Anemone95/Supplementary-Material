import React from 'react';
import { DocumentTitle, PageHeader } from 'components/common';

const MongoDbSessionConfig = () => {
  return (
    <DocumentTitle title="会话验证器">
      <span>
        <PageHeader title="会话验证器" subpage>
          <span>此验证器使用从Web界面提供的会话来授予登录用户的访问权限，通常先运行。</span>
        </PageHeader>
        <span>由于会话是必要的，让Web界面功能不能被禁用。</span>
      </span>
    </DocumentTitle>
  );
};

export default MongoDbSessionConfig;
