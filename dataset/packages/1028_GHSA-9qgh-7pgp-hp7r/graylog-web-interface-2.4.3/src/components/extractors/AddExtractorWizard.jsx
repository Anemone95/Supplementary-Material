import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

import LoaderTabs from 'components/messageloaders/LoaderTabs';
import MessageFieldExtractorActions from 'components/search/MessageFieldExtractorActions';

const AddExtractorWizard = React.createClass({
  propTypes: {
    inputId: PropTypes.string,
  },
  getInitialState() {
    return {
      showExtractorForm: false,
    };
  },
  _showAddExtractorForm() {
    this.setState({ showExtractorForm: !this.state.showExtractorForm });
  },
  render() {
    let extractorForm;

    if (this.state.showExtractorForm) {
      // Components using this component, will give it a proper fieldName and message
      const extractorFieldActions = <MessageFieldExtractorActions fieldName="" message={{}} />;
      extractorForm = (
        <div className="stream-loader">
          <LoaderTabs selectedInputId={this.props.inputId} customFieldActions={extractorFieldActions} />
        </div>
      );
    }

    return (
      <Row className="content">
        <Col md={12}>
          <h2 style={{ marginBottom: 5 }}>添加提取器</h2>

          <p>
            首先加载一条消息并有一个例子。您可以决定是否加载此输入接收到的最近消息，或者手动选择一个提供其ID的消息。
          </p>
          <p>
            <Button bsStyle="info" bsSize="small" onClick={this._showAddExtractorForm} disabled={this.state.showExtractorForm}>
              开始
            </Button>
          </p>

          {extractorForm}
        </Col>
      </Row>
    );
  },
});

export default AddExtractorWizard;
