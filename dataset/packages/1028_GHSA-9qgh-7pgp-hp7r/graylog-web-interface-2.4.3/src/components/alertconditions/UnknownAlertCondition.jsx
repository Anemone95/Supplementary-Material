import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Col, DropdownButton, MenuItem } from 'react-bootstrap';

import { EntityListItem } from 'components/common';

const UnknownAlertCondition = React.createClass({
  propTypes: {
    alertCondition: PropTypes.object.isRequired,
    stream: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
  },

  render() {
    const condition = this.props.alertCondition;
    const stream = this.props.stream;

    const actions = [
      <DropdownButton key="actions-button" title="操作" pullRight id={`more-actions-dropdown-${condition.id}`}>
        <MenuItem onSelect={this.props.onDelete}>删除</MenuItem>
      </DropdownButton>,
    ];

    const content = (
      <Col md={12}>
        <Alert bsStyle="warning">
          无法解决条件类型。这很可能是您在Graylog设置中丢失插件造成的。
        </Alert>
      </Col>
    );
    return (
      <EntityListItem key={`entry-list-${condition.id}`}
                      title="未知条件"
                      titleSuffix={`(${condition.type})`}
                      description={stream ? <span>观察流 <em>{stream.title}</em></span> : '不观察任何流'}
                      actions={actions}
                      contentRow={content} />
    );
  },
});

export default UnknownAlertCondition;
