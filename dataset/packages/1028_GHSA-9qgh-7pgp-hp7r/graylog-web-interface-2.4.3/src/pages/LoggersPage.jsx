import React from 'react';

import { DocumentTitle, PageHeader } from 'components/common';
import { LoggerOverview } from 'components/loggers';

const LoggersPage = React.createClass({
  render() {
    return (
      <DocumentTitle title="日志">
        <span>
          <PageHeader title="日志">
            <span>
              本部分控制Graylog架构的日志记录，并允许您即时更改日志级别。
              请注意，重新启动受影响的服务后，日志级别会重置为其默认值。
            </span>
          </PageHeader>
          <LoggerOverview />
        </span>
      </DocumentTitle>
    );
  },
});

export default LoggersPage;
