import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Col, DropdownButton, MenuItem } from 'react-bootstrap';

import { EntityListItem } from 'components/common';

const UnknownAlertNotification = React.createClass({
  propTypes: {
    alertNotification: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
  },

  render() {
    const notification = this.props.alertNotification;

    const actions = [
      <DropdownButton key="actions-button" title="操作" pullRight id={`more-actions-dropdown-${notification.id}`}>
        <MenuItem onSelect={this.props.onDelete}>删除</MenuItem>
      </DropdownButton>,
    ];

    const content = (
      <Col md={12}>
        <Alert bsStyle="warning">
          无法解决通知类型。这很可能是您在Graylog设置中丢失插件造成的。
        </Alert>
      </Col>
    );
    return (
      <EntityListItem key={`entry-list-${notification.id}`}
                      title="未知通知"
                      titleSuffix={`(${notification.type})`}
                      description="不能在通知类型未知的情况下执行"
                      actions={actions}
                      contentRow={content} />
    );
  },
});

export default UnknownAlertNotification;
