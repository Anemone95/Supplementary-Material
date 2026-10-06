import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Row, Col } from 'react-bootstrap';
import { Input } from 'components/bootstrap';
import { Spinner } from 'components/common';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import naturalSort from 'javascript-natural-sort';

import CombinedProvider from 'injection/CombinedProvider';
const { StreamsStore } = CombinedProvider.get('Streams');

const IndexSetDeletionForm = React.createClass({
  propTypes: {
    indexSet: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      assignedStreams: undefined,
      deleteIndices: true,
    };
  },

  _onModalOpen() {
    StreamsStore.load((streams) => {
      const assignedStreams = [];

      streams.forEach((stream) => {
        if (stream.index_set_id === this.props.indexSet.id) {
          assignedStreams.push({ id: stream.id, title: stream.title });
        }
      });

      this.setState({ assignedStreams: assignedStreams });
    });
  },

  _onRemoveClick(e) {
    this.setState({ deleteIndices: e.target.checked });
  },

  open() {
    this.refs[`index-set-deletion-modal-${this.props.indexSet.id}`].open();
  },

  close() {
    this.refs[`index-set-deletion-modal-${this.props.indexSet.id}`].close();
  },

  _isLoading() {
    return !this.state.assignedStreams;
  },

  _isDeletable() {
    return !this._isLoading() && this.state.assignedStreams.length < 1 && !this.props.indexSet.default;
  },

  _modalContent() {
    if (this._isLoading()) {
      return <Spinner text="正在加载分配的流..." />;
    }

    if (this.props.indexSet.default) {
      return (
        <Row>
          <Col md={12}>
            <Alert bsStyle="danger">
              无法删除索引集，因为它是默认的索引集！
            </Alert>
          </Col>
        </Row>
      );
    }

    if (!this._isDeletable()) {
      const assignedStreams = this.state.assignedStreams
        .sort((s1, s2) => naturalSort(s1.title, s2.title))
        .map(stream => <li key={`stream-id-${stream.id}`}>{stream.title}</li>);

      return (
        <div>
          <Row>
            <Col md={12}>
              <Alert bsStyle="danger">
                已经分配了流的索引集无法删除。先删除流分配，才能够删除这个索引集。
              </Alert>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h4>分配流:</h4>
              <ul>
                {assignedStreams}
              </ul>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <Row>
        <Col md={12}>
          <Input type="checkbox"
                 label="删除该索引集的所有数据?"
                 help={<span>所有与该索引集相关的索引将从Elasticsearch中删除。</span>}
                 checked={this.state.deleteIndices}
                 onChange={this._onRemoveClick} />
        </Col>
      </Row>
    );
  },

  _onDelete(e) {
    e.preventDefault();

    if (this._isDeletable()) {
      this.props.onDelete(this.props.indexSet, this.state.deleteIndices);
    }
  },

  render() {
    return (
      <BootstrapModalForm ref={`index-set-deletion-modal-${this.props.indexSet.id}`}
                          title={`删除索引集"${this.props.indexSet.title}"?`}
                          onModalOpen={this._onModalOpen}
                          onSubmitForm={this._onDelete}
                          submitButtonText="删除"
                          submitButtonDisabled={!this._isDeletable()}>
        {this._modalContent()}
      </BootstrapModalForm>
    );
  },
});

export default IndexSetDeletionForm;
