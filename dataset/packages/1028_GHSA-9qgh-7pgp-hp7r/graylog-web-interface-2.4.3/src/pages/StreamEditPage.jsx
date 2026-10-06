import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Alert, Row, Col } from 'react-bootstrap';

import StreamRulesEditor from 'components/streamrules/StreamRulesEditor';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
const StreamsStore = StoreProvider.getStore('Streams');

const StreamEditPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  },
  mixins: [Reflux.connect(CurrentUserStore)],

  componentDidMount() {
    StreamsStore.get(this.props.params.streamId, (stream) => {
      this.setState({ stream });
    });
  },

  _isLoading() {
    return !this.state.currentUser || !this.state.stream;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    let content = (<StreamRulesEditor currentUser={this.state.currentUser} streamId={this.props.params.streamId}
                                 messageId={this.props.location.query.message_id} index={this.props.location.query.index} />);
    if (this.state.stream.is_default) {
      content = (
        <div className="row content">
          <div className="col-md-12">
            <Alert bsStyle="danger">
              默认流不能被编辑。
            </Alert>
          </div>
        </div>
      );
    }
    return (
      <DocumentTitle title={`Rules of Stream ${this.state.stream.title}`}>
        <div>
          <PageHeader title={<span>流&raquo;{this.state.stream.title}&raquo;的规则</span>}>
            <span>
              这个页面专门用于更简单和舒适地创建和处理流规则。您可以{' '}
              在这看到配置的流规则对消息匹配的影响。
            </span>
          </PageHeader>

          {content}
        </div>
      </DocumentTitle>
    );
  },
});

export default StreamEditPage;
