/**
 * Common part of Checkbox & Radio
 */
import Icon from '../icon';
import { FindParentMixin } from './find-parent';
export var CheckboxMixin = function CheckboxMixin(parent, bem) {
  return {
    mixins: [FindParentMixin],
    props: {
      name: null,
      value: null,
      disabled: Boolean,
      checkedColor: String,
      labelPosition: String,
      labelDisabled: Boolean,
      shape: {
        type: String,
        "default": 'round'
      },
      bindGroup: {
        type: Boolean,
        "default": true
      }
    },
    created: function created() {
      if (this.bindGroup) {
        this.findParent(parent);
      }
    },
    computed: {
      isDisabled: function isDisabled() {
        return this.parent && this.parent.disabled || this.disabled;
      },
      iconStyle: function iconStyle() {
        var checkedColor = this.checkedColor;

        if (checkedColor && this.checked && !this.isDisabled) {
          return {
            borderColor: checkedColor,
            backgroundColor: checkedColor
          };
        }
      }
    },
    render: function render() {
      var _this = this;

      var h = arguments[0];
      var slots = this.slots,
          checked = this.checked;
      var CheckIcon = slots('icon', {
        checked: checked
      }) || h(Icon, {
        "attrs": {
          "name": "success"
        },
        "style": this.iconStyle
      });
      var Label = slots() && h("span", {
        "class": bem('label', [this.labelPosition, {
          disabled: this.isDisabled
        }]),
        "on": {
          "click": this.onClickLabel
        }
      }, [slots()]);
      return h("div", {
        "class": bem(),
        "on": {
          "click": function click(event) {
            _this.$emit('click', event);
          }
        }
      }, [h("div", {
        "class": bem('icon', [this.shape, {
          disabled: this.isDisabled,
          checked: checked
        }]),
        "on": {
          "click": this.onClickIcon
        }
      }, [CheckIcon]), Label]);
    }
  };
};