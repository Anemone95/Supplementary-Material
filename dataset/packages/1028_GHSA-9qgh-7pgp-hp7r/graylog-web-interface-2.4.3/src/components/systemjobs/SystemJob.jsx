import React from 'react';
import { ProgressBar } from 'react-bootstrap';

import { LinkToNode, Timestamp } from 'components/common';

import ActionsProvider from 'injection/ActionsProvider';
const SystemJobsActions = ActionsProvider.getActions('SystemJobs');

const SystemJob = React.createClass({
  _onCancel(job) {
    return (e) => {
      e.preventDefault();
      if (window.confirm(`您确定要取消系统脚本"${job.info}"吗?`)) {
        SystemJobsActions.cancelJob(job.id);
      }
    };
  },
  render() {
    const job = this.props.job;
    const progress = job.percent_complete < 100 ?
      (<ProgressBar bsStyle="info" active now={job.percent_complete} />) : <span className="label label-success finished">完成了!</span>;
    const cancel = job.is_cancelable ?
      (<button type="button" className="btn btn-primary btn-xs pull-right" onClick={this._onCancel(job)}>取消脚本</button>) : null;

    return (
      <div>
        <div style={{ lineHeight: 1.5, marginBottom: 5 }}>
          <i className="fa fa-cog" />{' '}
          <span data-toggle="tooltip" title={job.name}>{job.info}</span>{' '}
          - 开始在 <LinkToNode nodeId={job.node_id} />{' '}
          <Timestamp dateTime={job.started_at} relative />{' '}
          {cancel}
        </div>

        {progress}
      </div>
    );
  },
});

export default SystemJob;
