import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, Modal, Button } from 'react-bootstrap';

import BootstrapModalWrapper from 'components/bootstrap/BootstrapModalWrapper';
import SortableList from 'components/common/SortableList';

import ActionsProvider from 'injection/ActionsProvider';
const ExtractorsActions = ActionsProvider.getActions('Extractors');

const ExtractorSortModal = React.createClass({
  propTypes: {
    input: PropTypes.object.isRequired,
    extractors: PropTypes.array.isRequired,
  },
  open() {
    this.refs.modal.open();
  },
  close() {
    this.refs.modal.close();
  },
  _updateSorting(newSorting) {
    this.sortedExtractors = newSorting;
  },
  _saveSorting() {
    if (!this.sortedExtractors) {
      this.close();
    }
    const promise = ExtractorsActions.order.triggerPromise(this.props.input.id, this.sortedExtractors);
    promise.then(() => this.close());
  },
  render() {
    return (
      <BootstrapModalWrapper ref="modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <span>对提取器<em>{this.props.input.title}</em>进行排序</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>将提取器拖放到列表上以更改它们的应用顺序。</p>
          <Row className="row-sm">
            <Col md={12}>
              <SortableList items={this.props.extractors} onMoveItem={this._updateSorting} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={this.close}>关闭</Button>
          <Button type="button" bsStyle="info" onClick={this._saveSorting}>保存</Button>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  },
});

export default ExtractorSortModal;
