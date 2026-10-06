import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const InputStaticFieldsStore = StoreProvider.getStore('InputStaticFields');

const InputStaticFields = React.createClass({
  propTypes: {
    input: PropTypes.object.isRequired,
  },
  _deleteStaticField(fieldName) {
    return () => {
      if (window.confirm(`您确定要把静态字段'${fieldName}'从'${this.props.input.title}'中删除吗?`)) {
        InputStaticFieldsStore.destroy(this.props.input, fieldName);
      }
    };
  },
  _deleteButton(fieldName) {
    return (
      <Button bsStyle="link" bsSize="xsmall" style={{ verticalAlign: 'baseline' }} onClick={this._deleteStaticField(fieldName)}>
        <i className="fa fa-remove" />
      </Button>
    );
  },
  _formatStaticFields(staticFields) {
    const formattedFields = [];
    const staticFieldNames = Object.keys(staticFields);

    staticFieldNames.forEach((fieldName) => {
      formattedFields.push(
        <li key={`${fieldName}-field`}>
          <strong>{fieldName}:</strong> {staticFields[fieldName]} {this._deleteButton(fieldName)}
        </li>,
      );
    });

    return formattedFields;
  },
  render() {
    const staticFieldNames = Object.keys(this.props.input.static_fields);
    if (staticFieldNames.length === 0) {
      return <div />;
    }

    return (
      <div className="static-fields">
        <h3 style={{ marginBottom: 5 }}>静态字段</h3>
        <ul>
          {this._formatStaticFields(this.props.input.static_fields)}
        </ul>
      </div>
    );
  },
});

export default InputStaticFields;
