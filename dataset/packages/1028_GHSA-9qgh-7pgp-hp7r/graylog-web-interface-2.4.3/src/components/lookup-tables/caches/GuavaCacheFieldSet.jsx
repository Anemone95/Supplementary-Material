import PropTypes from 'prop-types';
import React from 'react';
import ObjectUtils from 'util/ObjectUtils';

import { Input } from 'components/bootstrap';
import { TimeUnitInput } from 'components/common';

const GuavaCacheFieldSet = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
    handleFormEvent: PropTypes.func.isRequired,
// eslint-disable-next-line react/no-unused-prop-types
    validationState: PropTypes.func.isRequired,
// eslint-disable-next-line react/no-unused-prop-types
    validationMessage: PropTypes.func.isRequired,
  },

  _update(value, unit, enabled, name) {
    const config = ObjectUtils.clone(this.props.config);
    config[name] = enabled ? value : 0;
    config[`${name}_unit`] = unit;
    this.props.updateConfig(config);
  },

  updateAfterAccess(value, unit, enabled) {
    this._update(value, unit, enabled, 'expire_after_access');
  },

  updateAfterWrite(value, unit, enabled) {
    this._update(value, unit, enabled, 'expire_after_write');
  },

  updateRefresh(value, unit, enabled) {
    this._update(value, unit, enabled, 'refresh_after_write');
  },

  render() {
    const config = this.props.config;

    return (<fieldset>
      <Input type="text"
             id="max_size"
             name="max_size"
             label="最大条目数"
             autoFocus
             required
             onChange={this.props.handleFormEvent}
             help="高速缓存保存在内存中的条目数量的限制。"
             value={config.max_size}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <TimeUnitInput label="访问后失效"
                     help="如果启用，则在从上次使用它们的指定时间之后，条目将从缓存中删除。"
                     update={this.updateAfterAccess}
                     value={config.expire_after_access}
                     unit={config.expire_after_access_unit || 'SECONDS'}
                     enabled={config.expire_after_access > 0}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" />
      <TimeUnitInput label="写入后失效"
                     help="如果启用，则在第一次使用指定时间后，将从缓存中删除条目。"
                     update={this.updateAfterWrite}
                     value={config.expire_after_write}
                     unit={config.expire_after_write_unit || 'SECONDS'}
                     enabled={config.expire_after_write > 0}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" />
    </fieldset>);
  },
});

export default GuavaCacheFieldSet;
