import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

import { Spinner } from 'components/common';
import { AddDecoratorButton, Decorator, DecoratorList } from 'components/search';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';
import PermissionsMixin from 'util/PermissionsMixin';

import StoreProvider from 'injection/StoreProvider';
const DecoratorsStore = StoreProvider.getStore('Decorators');
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

import ActionsProvider from 'injection/ActionsProvider';
const DecoratorsActions = ActionsProvider.getActions('Decorators');

import DecoratorStyles from '!style!css!components/search/decoratorStyles.css';

const DecoratorSidebar = React.createClass({
  propTypes: {
    stream: PropTypes.string,
    maximumHeight: PropTypes.number,
  },
  mixins: [Reflux.connect(DecoratorsStore), Reflux.connect(CurrentUserStore), PermissionsMixin],
  getInitialState() {
    return {
      maxDecoratorsHeight: 1000,
    };
  },

  componentDidMount() {
    this._updateHeight();
    window.addEventListener('scroll', this._updateHeight);
  },

  componentDidUpdate(prevProps) {
    if (this.props.maximumHeight !== prevProps.maximumHeight) {
      this._updateHeight();
    }
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', this._updateHeight);
  },

  MINIMUM_DECORATORS_HEIGHT: 50,

  _updateHeight() {
    const decoratorsContainer = ReactDOM.findDOMNode(this.refs.decoratorsContainer);
    const maxHeight = this.props.maximumHeight - decoratorsContainer.getBoundingClientRect().top;

    this.setState({ maxDecoratorsHeight: Math.max(maxHeight, this.MINIMUM_DECORATORS_HEIGHT) });
  },

  _formatDecorator(decorator) {
    const typeDefinition = this.state.types[decorator.type] || { requested_configuration: {}, name: `未知的类型: ${decorator.type}` };
    return ({ id: decorator.id,
      title: <Decorator key={`decorator-${decorator.id}`}
                                                   decorator={decorator}
                                                   typeDefinition={typeDefinition} /> });
  },
  _updateOrder(decorators) {
    decorators.forEach((item, idx) => {
      const decorator = this.state.decorators.find(i => i.id === item.id);
      decorator.order = idx;
      DecoratorsActions.update(decorator.id, decorator);
    });
  },
  render() {
    if (!this.state.decorators) {
      return <Spinner />;
    }
    const decorators = this.state.decorators
      .filter(decorator => (this.props.stream ? decorator.stream === this.props.stream : !decorator.stream))
      .sort((d1, d2) => d1.order - d2.order);
    const nextDecoratorOrder = decorators.length > 0 ? decorators[decorators.length - 1].order + 1 : 0;
    const decoratorItems = decorators.map(this._formatDecorator);
    const popoverHelp = (
      <Popover id="decorators-help" className={DecoratorStyles.helpPopover}>
        <p className="description">
          装饰器可以动态地修改搜索结果的显示效果。这些更改不会保留，只显示在搜索结果中。 装饰器的配置可以保存在<strong>每个流</strong>中。
        </p>
        <p className="description">
          使用拖放来修改装饰器的顺序。
        </p>
        <p>
          要了解更多关于消息装饰器的信息，请查看<DocumentationLink page={DocsHelper.PAGES.DECORATORS} text="文档" />。
        </p>
      </Popover>
    );

    const editPermissions = this.isPermitted(this.state.currentUser.permissions, `decorators:edit:${this.props.stream}`);
    return (
      <div>
        <AddDecoratorButton stream={this.props.stream} nextOrder={nextDecoratorOrder} disabled={!editPermissions} />
        <div className={DecoratorStyles.helpLinkContainer}>
          <OverlayTrigger trigger="click" rootClose placement="right" overlay={popoverHelp}>
            <Button bsStyle="link" className={DecoratorStyles.helpLink}>什么是消息装饰器?</Button>
          </OverlayTrigger>
        </div>
        <div ref="decoratorsContainer" className={DecoratorStyles.decoratorListContainer} style={{ maxHeight: this.state.maxDecoratorsHeight }}>
          <DecoratorList decorators={decoratorItems} onReorder={this._updateOrder} disableDragging={!editPermissions} />
        </div>
      </div>
    );
  },
});

export default DecoratorSidebar;
