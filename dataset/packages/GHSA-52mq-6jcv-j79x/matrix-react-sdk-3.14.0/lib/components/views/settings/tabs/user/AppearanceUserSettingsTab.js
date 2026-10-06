"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _theme = require("../../../../../theme");

var _ThemeWatcher = _interopRequireDefault(require("../../../../../settings/watchers/ThemeWatcher"));

var _Slider = _interopRequireDefault(require("../../../elements/Slider"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _FontWatcher = require("../../../../../settings/watchers/FontWatcher");

var _actions = require("../../../../../dispatcher/actions");

var _StyledRadioButton = _interopRequireDefault(require("../../../elements/StyledRadioButton"));

var _StyledCheckbox = _interopRequireDefault(require("../../../elements/StyledCheckbox"));

var _SettingsFlag = _interopRequireDefault(require("../../../elements/SettingsFlag"));

var _Field = _interopRequireDefault(require("../../../elements/Field"));

var _EventTilePreview = _interopRequireDefault(require("../../../elements/EventTilePreview"));

var _StyledRadioGroup = _interopRequireDefault(require("../../../elements/StyledRadioGroup"));

var _classnames = _interopRequireDefault(require("classnames"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _UIFeature = require("../../../../../settings/UIFeature");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class AppearanceUserSettingsTab extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "MESSAGE_PREVIEW_TEXT", (0, _languageHandler._t)("Hey you. You're the best!"));
    (0, _defineProperty2.default)(this, "themeTimer", void 0);
    (0, _defineProperty2.default)(this, "onThemeChange", (newTheme
    /*: string*/
    ) =>
    /*: void*/
    {
      if (this.state.theme === newTheme) return; // doing getValue in the .catch will still return the value we failed to set,
      // so remember what the value was before we tried to set it so we can revert

      const oldTheme
      /*: string*/
      = _SettingsStore.default.getValue('theme');

      _SettingsStore.default.setValue("theme", null, _SettingLevel.SettingLevel.DEVICE, newTheme).catch(() => {
        _dispatcher.default.dispatch({
          action: _actions.Action.RecheckTheme
        });

        this.setState({
          theme: oldTheme
        });
      });

      this.setState({
        theme: newTheme
      }); // The settings watcher doesn't fire until the echo comes back from the
      // server, so to make the theme change immediately we need to manually
      // do the dispatch now
      // XXX: The local echoed value appears to be unreliable, in particular
      // when settings custom themes(!) so adding forceTheme to override
      // the value from settings.

      _dispatcher.default.dispatch({
        action: _actions.Action.RecheckTheme,
        forceTheme: newTheme
      });
    });
    (0, _defineProperty2.default)(this, "onUseSystemThemeChanged", (checked
    /*: boolean*/
    ) =>
    /*: void*/
    {
      this.setState({
        useSystemTheme: checked
      });

      _SettingsStore.default.setValue("use_system_theme", null, _SettingLevel.SettingLevel.DEVICE, checked);

      _dispatcher.default.dispatch({
        action: _actions.Action.RecheckTheme
      });
    });
    (0, _defineProperty2.default)(this, "onFontSizeChanged", (size
    /*: number*/
    ) =>
    /*: void*/
    {
      this.setState({
        fontSize: size.toString()
      });

      _SettingsStore.default.setValue("baseFontSize", null, _SettingLevel.SettingLevel.DEVICE, size - _FontWatcher.FontWatcher.SIZE_DIFF);
    });
    (0, _defineProperty2.default)(this, "onValidateFontSize", async ({
      value
    }
    /*: Pick<IFieldState, "value">*/
    ) =>
    /*: Promise<IValidationResult>*/
    {
      const parsedSize = parseFloat(value);
      const min = _FontWatcher.FontWatcher.MIN_SIZE + _FontWatcher.FontWatcher.SIZE_DIFF;
      const max = _FontWatcher.FontWatcher.MAX_SIZE + _FontWatcher.FontWatcher.SIZE_DIFF;

      if (isNaN(parsedSize)) {
        return {
          valid: false,
          feedback: (0, _languageHandler._t)("Size must be a number")
        };
      }

      if (!(min <= parsedSize && parsedSize <= max)) {
        return {
          valid: false,
          feedback: (0, _languageHandler._t)('Custom font size can only be between %(min)s pt and %(max)s pt', {
            min,
            max
          })
        };
      }

      _SettingsStore.default.setValue("baseFontSize", null, _SettingLevel.SettingLevel.DEVICE, parseInt(value, 10) - _FontWatcher.FontWatcher.SIZE_DIFF);

      return {
        valid: true,
        feedback: (0, _languageHandler._t)('Use between %(min)s pt and %(max)s pt', {
          min,
          max
        })
      };
    });
    (0, _defineProperty2.default)(this, "onAddCustomTheme", async () =>
    /*: Promise<void>*/
    {
      let currentThemes
      /*: string[]*/
      = _SettingsStore.default.getValue("custom_themes");

      if (!currentThemes) currentThemes = [];
      currentThemes = currentThemes.map(c => c); // cheap clone

      if (this.themeTimer) {
        clearTimeout(this.themeTimer);
      }

      try {
        const r = await fetch(this.state.customThemeUrl); // XXX: need some schema for this

        const themeInfo = await r.json();

        if (!themeInfo || typeof themeInfo['name'] !== 'string' || typeof themeInfo['colors'] !== 'object') {
          this.setState({
            customThemeMessage: {
              text: (0, _languageHandler._t)("Invalid theme schema."),
              isError: true
            }
          });
          return;
        }

        currentThemes.push(themeInfo);
      } catch (e) {
        console.error(e);
        this.setState({
          customThemeMessage: {
            text: (0, _languageHandler._t)("Error downloading theme information."),
            isError: true
          }
        });
        return; // Don't continue on error
      }

      await _SettingsStore.default.setValue("custom_themes", null, _SettingLevel.SettingLevel.ACCOUNT, currentThemes);
      this.setState({
        customThemeUrl: "",
        customThemeMessage: {
          text: (0, _languageHandler._t)("Theme added!"),
          isError: false
        }
      });
      this.themeTimer = setTimeout(() => {
        this.setState({
          customThemeMessage: {
            text: "",
            isError: false
          }
        });
      }, 3000);
    });
    (0, _defineProperty2.default)(this, "onCustomThemeChange", (e
    /*: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>*/
    ) =>
    /*: void*/
    {
      this.setState({
        customThemeUrl: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onLayoutChange", (e
    /*: React.ChangeEvent<HTMLInputElement>*/
    ) =>
    /*: void*/
    {
      const val = e.target.value === "true";
      this.setState({
        useIRCLayout: val
      });

      _SettingsStore.default.setValue("useIRCLayout", null, _SettingLevel.SettingLevel.DEVICE, val);
    });
    (0, _defineProperty2.default)(this, "renderLayoutSection", () => {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section mx_AppearanceUserSettingsTab_Layout"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, _languageHandler._t)("Message layout")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AppearanceUserSettingsTab_Layout_RadioButtons"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _classnames.default)("mx_AppearanceUserSettingsTab_Layout_RadioButton", {
          mx_AppearanceUserSettingsTab_Layout_RadioButton_selected: this.state.useIRCLayout
        })
      }, /*#__PURE__*/_react.default.createElement(_EventTilePreview.default, {
        className: "mx_AppearanceUserSettingsTab_Layout_RadioButton_preview",
        message: this.MESSAGE_PREVIEW_TEXT,
        useIRCLayout: true
      }), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "layout",
        value: "true",
        checked: this.state.useIRCLayout,
        onChange: this.onLayoutChange
      }, (0, _languageHandler._t)("Compact"))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AppearanceUserSettingsTab_spacer"
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _classnames.default)("mx_AppearanceUserSettingsTab_Layout_RadioButton", {
          mx_AppearanceUserSettingsTab_Layout_RadioButton_selected: !this.state.useIRCLayout
        })
      }, /*#__PURE__*/_react.default.createElement(_EventTilePreview.default, {
        className: "mx_AppearanceUserSettingsTab_Layout_RadioButton_preview",
        message: this.MESSAGE_PREVIEW_TEXT,
        useIRCLayout: false
      }), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
        name: "layout",
        value: "false",
        checked: !this.state.useIRCLayout,
        onChange: this.onLayoutChange
      }, (0, _languageHandler._t)("Modern")))));
    });
    this.state = _objectSpread(_objectSpread({
      fontSize: (_SettingsStore.default.getValue("baseFontSize", null) + _FontWatcher.FontWatcher.SIZE_DIFF).toString()
    }, this.calculateThemeState()), {}, {
      customThemeUrl: "",
      customThemeMessage: {
        isError: false,
        text: ""
      },
      useCustomFontSize: _SettingsStore.default.getValue("useCustomFontSize"),
      useSystemFont: _SettingsStore.default.getValue("useSystemFont"),
      systemFont: _SettingsStore.default.getValue("systemFont"),
      showAdvanced: false,
      useIRCLayout: _SettingsStore.default.getValue("useIRCLayout")
    });
  }

  calculateThemeState()
  /*: IThemeState*/
  {
    // We have to mirror the logic from ThemeWatcher.getEffectiveTheme so we
    // show the right values for things.
    const themeChoice
    /*: string*/
    = _SettingsStore.default.getValue("theme");

    const systemThemeExplicit
    /*: boolean*/
    = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "use_system_theme", null, false, true);

    const themeExplicit
    /*: string*/
    = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "theme", null, false, true); // If the user has enabled system theme matching, use that.


    if (systemThemeExplicit) {
      return {
        theme: themeChoice,
        useSystemTheme: true
      };
    } // If the user has set a theme explicitly, use that (no system theme matching)


    if (themeExplicit) {
      return {
        theme: themeChoice,
        useSystemTheme: false
      };
    } // Otherwise assume the defaults for the settings


    return {
      theme: themeChoice,
      useSystemTheme: _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, "use_system_theme")
    };
  }

  renderThemeSection() {
    const themeWatcher = new _ThemeWatcher.default();
    let systemThemeSection
    /*: JSX.Element*/
    ;

    if (themeWatcher.isSystemThemeSupported()) {
      systemThemeSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        checked: this.state.useSystemTheme,
        onChange: e => this.onUseSystemThemeChanged(e.target.checked)
      }, _SettingsStore.default.getDisplayName("use_system_theme")));
    }

    let customThemeForm
    /*: JSX.Element*/
    ;

    if (_SettingsStore.default.getValue("feature_custom_themes")) {
      let messageElement = null;

      if (this.state.customThemeMessage.text) {
        if (this.state.customThemeMessage.isError) {
          messageElement = /*#__PURE__*/_react.default.createElement("div", {
            className: "text-error"
          }, this.state.customThemeMessage.text);
        } else {
          messageElement = /*#__PURE__*/_react.default.createElement("div", {
            className: "text-success"
          }, this.state.customThemeMessage.text);
        }
      }

      customThemeForm = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this.onAddCustomTheme
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        label: (0, _languageHandler._t)("Custom theme URL"),
        type: "text",
        id: "mx_GeneralUserSettingsTab_customThemeInput",
        autoComplete: "off",
        onChange: this.onCustomThemeChange,
        value: this.state.customThemeUrl
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onAddCustomTheme,
        type: "submit",
        kind: "primary_sm",
        disabled: !this.state.customThemeUrl.trim()
      }, (0, _languageHandler._t)("Add theme")), messageElement));
    } // XXX: replace any type here


    const themes = Object.entries((0, _theme.enumerateThemes)()).map(p => ({
      id: p[0],
      name: p[1]
    })); // convert pairs to objects for code readability

    const builtInThemes = themes.filter(p => !p.id.startsWith("custom-"));
    const customThemes = themes.filter(p => !builtInThemes.includes(p)).sort((a, b) => a.name.localeCompare(b.name));
    const orderedThemes = [...builtInThemes, ...customThemes];
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_AppearanceUserSettingsTab_themeSection"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Theme")), systemThemeSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ThemeSelectors"
    }, /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "theme",
      definitions: orderedThemes.map(t => ({
        value: t.id,
        label: t.name,
        disabled: this.state.useSystemTheme,
        className: "mx_ThemeSelector_" + t.id
      })),
      onChange: this.onThemeChange,
      value: this.state.useSystemTheme ? undefined : this.state.theme,
      outlined: true
    })), customThemeForm);
  }

  renderFontSection() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_AppearanceUserSettingsTab_fontScaling"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Font size")), /*#__PURE__*/_react.default.createElement(_EventTilePreview.default, {
      className: "mx_AppearanceUserSettingsTab_fontSlider_preview",
      message: this.MESSAGE_PREVIEW_TEXT,
      useIRCLayout: this.state.useIRCLayout
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppearanceUserSettingsTab_fontSlider"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppearanceUserSettingsTab_fontSlider_smallText"
    }, "Aa"), /*#__PURE__*/_react.default.createElement(_Slider.default, {
      values: [13, 14, 15, 16, 18],
      value: parseInt(this.state.fontSize, 10),
      onSelectionChange: this.onFontSizeChanged,
      displayFunc: _ => "",
      disabled: this.state.useCustomFontSize
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppearanceUserSettingsTab_fontSlider_largeText"
    }, "Aa")), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
      name: "useCustomFontSize",
      level: _SettingLevel.SettingLevel.ACCOUNT,
      onChange: checked => this.setState({
        useCustomFontSize: checked
      }),
      useCheckbox: true
    }), /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "number",
      label: (0, _languageHandler._t)("Font size"),
      autoComplete: "off",
      placeholder: this.state.fontSize.toString(),
      value: this.state.fontSize.toString(),
      id: "font_size_field",
      onValidate: this.onValidateFontSize,
      onChange: value => this.setState({
        fontSize: value.target.value
      }),
      disabled: !this.state.useCustomFontSize,
      className: "mx_SettingsTab_customFontSizeField"
    }));
  }

  renderAdvancedSection() {
    if (!_SettingsStore.default.getValue(_UIFeature.UIFeature.AdvancedSettings)) return null;

    const brand = _SdkConfig.default.get().brand;

    const toggle = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppearanceUserSettingsTab_AdvancedToggle",
      onClick: () => this.setState({
        showAdvanced: !this.state.showAdvanced
      })
    }, this.state.showAdvanced ? (0, _languageHandler._t)("Hide advanced") : (0, _languageHandler._t)("Show advanced"));

    let advanced
    /*: React.ReactNode*/
    ;

    if (this.state.showAdvanced) {
      const tooltipContent = (0, _languageHandler._t)("Set the name of a font installed on your system & %(brand)s will attempt to use it.", {
        brand
      });
      advanced = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        name: "useCompactLayout",
        level: _SettingLevel.SettingLevel.DEVICE,
        useCheckbox: true,
        disabled: this.state.useIRCLayout
      }), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        name: "useIRCLayout",
        level: _SettingLevel.SettingLevel.DEVICE,
        useCheckbox: true,
        onChange: checked => this.setState({
          useIRCLayout: checked
        })
      }), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
        name: "useSystemFont",
        level: _SettingLevel.SettingLevel.DEVICE,
        useCheckbox: true,
        onChange: checked => this.setState({
          useSystemFont: checked
        })
      }), /*#__PURE__*/_react.default.createElement(_Field.default, {
        className: "mx_AppearanceUserSettingsTab_systemFont",
        label: _SettingsStore.default.getDisplayName("systemFont"),
        onChange: value => {
          this.setState({
            systemFont: value.target.value
          });

          _SettingsStore.default.setValue("systemFont", null, _SettingLevel.SettingLevel.DEVICE, value.target.value);
        },
        tooltipContent: tooltipContent,
        forceTooltipVisible: true,
        disabled: !this.state.useSystemFont,
        value: this.state.systemFont
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_AppearanceUserSettingsTab_Advanced"
    }, toggle, advanced);
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_AppearanceUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Customise your appearance")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_SubHeading"
    }, (0, _languageHandler._t)("Appearance Settings only affect this %(brand)s session.", {
      brand
    })), this.renderThemeSection(), this.renderFontSection(), this.renderAdvancedSection());
  }

}

exports.default = AppearanceUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiLnRzeCJdLCJuYW1lcyI6WyJBcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwibmV3VGhlbWUiLCJzdGF0ZSIsInRoZW1lIiwib2xkVGhlbWUiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsImNhdGNoIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJSZWNoZWNrVGhlbWUiLCJzZXRTdGF0ZSIsImZvcmNlVGhlbWUiLCJjaGVja2VkIiwidXNlU3lzdGVtVGhlbWUiLCJzaXplIiwiZm9udFNpemUiLCJ0b1N0cmluZyIsIkZvbnRXYXRjaGVyIiwiU0laRV9ESUZGIiwidmFsdWUiLCJwYXJzZWRTaXplIiwicGFyc2VGbG9hdCIsIm1pbiIsIk1JTl9TSVpFIiwibWF4IiwiTUFYX1NJWkUiLCJpc05hTiIsInZhbGlkIiwiZmVlZGJhY2siLCJwYXJzZUludCIsImN1cnJlbnRUaGVtZXMiLCJtYXAiLCJjIiwidGhlbWVUaW1lciIsImNsZWFyVGltZW91dCIsInIiLCJmZXRjaCIsImN1c3RvbVRoZW1lVXJsIiwidGhlbWVJbmZvIiwianNvbiIsImN1c3RvbVRoZW1lTWVzc2FnZSIsInRleHQiLCJpc0Vycm9yIiwicHVzaCIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJBQ0NPVU5UIiwic2V0VGltZW91dCIsInRhcmdldCIsInZhbCIsInVzZUlSQ0xheW91dCIsIm14X0FwcGVhcmFuY2VVc2VyU2V0dGluZ3NUYWJfTGF5b3V0X1JhZGlvQnV0dG9uX3NlbGVjdGVkIiwiTUVTU0FHRV9QUkVWSUVXX1RFWFQiLCJvbkxheW91dENoYW5nZSIsImNhbGN1bGF0ZVRoZW1lU3RhdGUiLCJ1c2VDdXN0b21Gb250U2l6ZSIsInVzZVN5c3RlbUZvbnQiLCJzeXN0ZW1Gb250Iiwic2hvd0FkdmFuY2VkIiwidGhlbWVDaG9pY2UiLCJzeXN0ZW1UaGVtZUV4cGxpY2l0IiwiZ2V0VmFsdWVBdCIsInRoZW1lRXhwbGljaXQiLCJyZW5kZXJUaGVtZVNlY3Rpb24iLCJ0aGVtZVdhdGNoZXIiLCJUaGVtZVdhdGNoZXIiLCJzeXN0ZW1UaGVtZVNlY3Rpb24iLCJpc1N5c3RlbVRoZW1lU3VwcG9ydGVkIiwib25Vc2VTeXN0ZW1UaGVtZUNoYW5nZWQiLCJnZXREaXNwbGF5TmFtZSIsImN1c3RvbVRoZW1lRm9ybSIsIm1lc3NhZ2VFbGVtZW50Iiwib25BZGRDdXN0b21UaGVtZSIsIm9uQ3VzdG9tVGhlbWVDaGFuZ2UiLCJ0cmltIiwidGhlbWVzIiwiT2JqZWN0IiwiZW50cmllcyIsInAiLCJpZCIsIm5hbWUiLCJidWlsdEluVGhlbWVzIiwiZmlsdGVyIiwic3RhcnRzV2l0aCIsImN1c3RvbVRoZW1lcyIsImluY2x1ZGVzIiwic29ydCIsImEiLCJiIiwibG9jYWxlQ29tcGFyZSIsIm9yZGVyZWRUaGVtZXMiLCJ0IiwibGFiZWwiLCJkaXNhYmxlZCIsImNsYXNzTmFtZSIsIm9uVGhlbWVDaGFuZ2UiLCJ1bmRlZmluZWQiLCJyZW5kZXJGb250U2VjdGlvbiIsIm9uRm9udFNpemVDaGFuZ2VkIiwiXyIsIm9uVmFsaWRhdGVGb250U2l6ZSIsInJlbmRlckFkdmFuY2VkU2VjdGlvbiIsIlVJRmVhdHVyZSIsIkFkdmFuY2VkU2V0dGluZ3MiLCJicmFuZCIsIlNka0NvbmZpZyIsImdldCIsInRvZ2dsZSIsImFkdmFuY2VkIiwidG9vbHRpcENvbnRlbnQiLCJyZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNB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QUFILEVBQThEO0FBQUVBLE1BQUFBO0FBQUYsS0FBOUQsQ0FETCxDQUZKLEVBS0ssS0FBS3pDLGtCQUFMLEVBTEwsRUFNSyxLQUFLa0MsaUJBQUwsRUFOTCxFQU9LLEtBQUtJLHFCQUFMLEVBUEwsQ0FESjtBQVdIOztBQTFZa0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IGVudW1lcmF0ZVRoZW1lcyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi90aGVtZVwiO1xuaW1wb3J0IFRoZW1lV2F0Y2hlciBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3Mvd2F0Y2hlcnMvVGhlbWVXYXRjaGVyXCI7XG5pbXBvcnQgU2xpZGVyIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9TbGlkZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEZvbnRXYXRjaGVyIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL3dhdGNoZXJzL0ZvbnRXYXRjaGVyXCI7XG5pbXBvcnQgeyBSZWNoZWNrVGhlbWVQYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9SZWNoZWNrVGhlbWVQYXlsb2FkJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgeyBJVmFsaWRhdGlvblJlc3VsdCwgSUZpZWxkU3RhdGUgfSBmcm9tICcuLi8uLi8uLi9lbGVtZW50cy9WYWxpZGF0aW9uJztcbmltcG9ydCBTdHlsZWRSYWRpb0J1dHRvbiBmcm9tICcuLi8uLi8uLi9lbGVtZW50cy9TdHlsZWRSYWRpb0J1dHRvbic7XG5pbXBvcnQgU3R5bGVkQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3gnO1xuaW1wb3J0IFNldHRpbmdzRmxhZyBmcm9tICcuLi8uLi8uLi9lbGVtZW50cy9TZXR0aW5nc0ZsYWcnO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uLy4uLy4uL2VsZW1lbnRzL0ZpZWxkJztcbmltcG9ydCBFdmVudFRpbGVQcmV2aWV3IGZyb20gJy4uLy4uLy4uL2VsZW1lbnRzL0V2ZW50VGlsZVByZXZpZXcnO1xuaW1wb3J0IFN0eWxlZFJhZGlvR3JvdXAgZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL1N0eWxlZFJhZGlvR3JvdXBcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG59XG5cbmludGVyZmFjZSBJVGhlbWVTdGF0ZSB7XG4gICAgdGhlbWU6IHN0cmluZztcbiAgICB1c2VTeXN0ZW1UaGVtZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDdXN0b21UaGVtZU1lc3NhZ2Uge1xuICAgIGlzRXJyb3I6IGJvb2xlYW47XG4gICAgdGV4dDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIGV4dGVuZHMgSVRoZW1lU3RhdGUge1xuICAgIC8vIFN0cmluZyBkaXNwbGF5aW5nIHRoZSBjdXJyZW50IHNlbGVjdGVkIGZvbnRTaXplLlxuICAgIC8vIE5lZWRzIHRvIGJlIHN0cmluZyBmb3IgdGhpbmdzIGxpa2UgJzE3Licgd2l0aG91dFxuICAgIC8vIHRyYWlsaW5nIDBzLlxuICAgIGZvbnRTaXplOiBzdHJpbmc7XG4gICAgY3VzdG9tVGhlbWVVcmw6IHN0cmluZztcbiAgICBjdXN0b21UaGVtZU1lc3NhZ2U6IEN1c3RvbVRoZW1lTWVzc2FnZTtcbiAgICB1c2VDdXN0b21Gb250U2l6ZTogYm9vbGVhbjtcbiAgICB1c2VTeXN0ZW1Gb250OiBib29sZWFuO1xuICAgIHN5c3RlbUZvbnQ6IHN0cmluZztcbiAgICBzaG93QWR2YW5jZWQ6IGJvb2xlYW47XG4gICAgdXNlSVJDTGF5b3V0OiBib29sZWFuO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcGVhcmFuY2VVc2VyU2V0dGluZ3NUYWIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IE1FU1NBR0VfUFJFVklFV19URVhUID0gX3QoXCJIZXkgeW91LiBZb3UncmUgdGhlIGJlc3QhXCIpO1xuXG4gICAgcHJpdmF0ZSB0aGVtZVRpbWVyOiBOb2RlSlMuVGltZW91dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBmb250U2l6ZTogKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJiYXNlRm9udFNpemVcIiwgbnVsbCkgKyBGb250V2F0Y2hlci5TSVpFX0RJRkYpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAuLi50aGlzLmNhbGN1bGF0ZVRoZW1lU3RhdGUoKSxcbiAgICAgICAgICAgIGN1c3RvbVRoZW1lVXJsOiBcIlwiLFxuICAgICAgICAgICAgY3VzdG9tVGhlbWVNZXNzYWdlOiB7aXNFcnJvcjogZmFsc2UsIHRleHQ6IFwiXCJ9LFxuICAgICAgICAgICAgdXNlQ3VzdG9tRm9udFNpemU6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJ1c2VDdXN0b21Gb250U2l6ZVwiKSxcbiAgICAgICAgICAgIHVzZVN5c3RlbUZvbnQ6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJ1c2VTeXN0ZW1Gb250XCIpLFxuICAgICAgICAgICAgc3lzdGVtRm9udDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInN5c3RlbUZvbnRcIiksXG4gICAgICAgICAgICBzaG93QWR2YW5jZWQ6IGZhbHNlLFxuICAgICAgICAgICAgdXNlSVJDTGF5b3V0OiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwidXNlSVJDTGF5b3V0XCIpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlVGhlbWVTdGF0ZSgpOiBJVGhlbWVTdGF0ZSB7XG4gICAgICAgIC8vIFdlIGhhdmUgdG8gbWlycm9yIHRoZSBsb2dpYyBmcm9tIFRoZW1lV2F0Y2hlci5nZXRFZmZlY3RpdmVUaGVtZSBzbyB3ZVxuICAgICAgICAvLyBzaG93IHRoZSByaWdodCB2YWx1ZXMgZm9yIHRoaW5ncy5cblxuICAgICAgICBjb25zdCB0aGVtZUNob2ljZTogc3RyaW5nID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInRoZW1lXCIpO1xuICAgICAgICBjb25zdCBzeXN0ZW1UaGVtZUV4cGxpY2l0OiBib29sZWFuID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFxuICAgICAgICAgICAgU2V0dGluZ0xldmVsLkRFVklDRSwgXCJ1c2Vfc3lzdGVtX3RoZW1lXCIsIG51bGwsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgY29uc3QgdGhlbWVFeHBsaWNpdDogc3RyaW5nID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFxuICAgICAgICAgICAgU2V0dGluZ0xldmVsLkRFVklDRSwgXCJ0aGVtZVwiLCBudWxsLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIGVuYWJsZWQgc3lzdGVtIHRoZW1lIG1hdGNoaW5nLCB1c2UgdGhhdC5cbiAgICAgICAgaWYgKHN5c3RlbVRoZW1lRXhwbGljaXQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGhlbWU6IHRoZW1lQ2hvaWNlLFxuICAgICAgICAgICAgICAgIHVzZVN5c3RlbVRoZW1lOiB0cnVlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIGhhcyBzZXQgYSB0aGVtZSBleHBsaWNpdGx5LCB1c2UgdGhhdCAobm8gc3lzdGVtIHRoZW1lIG1hdGNoaW5nKVxuICAgICAgICBpZiAodGhlbWVFeHBsaWNpdCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWVDaG9pY2UsXG4gICAgICAgICAgICAgICAgdXNlU3lzdGVtVGhlbWU6IGZhbHNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSBhc3N1bWUgdGhlIGRlZmF1bHRzIGZvciB0aGUgc2V0dGluZ3NcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRoZW1lOiB0aGVtZUNob2ljZSxcbiAgICAgICAgICAgIHVzZVN5c3RlbVRoZW1lOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoU2V0dGluZ0xldmVsLkRFVklDRSwgXCJ1c2Vfc3lzdGVtX3RoZW1lXCIpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25UaGVtZUNoYW5nZSA9IChuZXdUaGVtZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRoZW1lID09PSBuZXdUaGVtZSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGRvaW5nIGdldFZhbHVlIGluIHRoZSAuY2F0Y2ggd2lsbCBzdGlsbCByZXR1cm4gdGhlIHZhbHVlIHdlIGZhaWxlZCB0byBzZXQsXG4gICAgICAgIC8vIHNvIHJlbWVtYmVyIHdoYXQgdGhlIHZhbHVlIHdhcyBiZWZvcmUgd2UgdHJpZWQgdG8gc2V0IGl0IHNvIHdlIGNhbiByZXZlcnRcbiAgICAgICAgY29uc3Qgb2xkVGhlbWU6IHN0cmluZyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3RoZW1lJyk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJ0aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBuZXdUaGVtZSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFJlY2hlY2tUaGVtZVBheWxvYWQ+KHthY3Rpb246IEFjdGlvbi5SZWNoZWNrVGhlbWV9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3RoZW1lOiBvbGRUaGVtZX0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGhlbWU6IG5ld1RoZW1lfSk7XG4gICAgICAgIC8vIFRoZSBzZXR0aW5ncyB3YXRjaGVyIGRvZXNuJ3QgZmlyZSB1bnRpbCB0aGUgZWNobyBjb21lcyBiYWNrIGZyb20gdGhlXG4gICAgICAgIC8vIHNlcnZlciwgc28gdG8gbWFrZSB0aGUgdGhlbWUgY2hhbmdlIGltbWVkaWF0ZWx5IHdlIG5lZWQgdG8gbWFudWFsbHlcbiAgICAgICAgLy8gZG8gdGhlIGRpc3BhdGNoIG5vd1xuICAgICAgICAvLyBYWFg6IFRoZSBsb2NhbCBlY2hvZWQgdmFsdWUgYXBwZWFycyB0byBiZSB1bnJlbGlhYmxlLCBpbiBwYXJ0aWN1bGFyXG4gICAgICAgIC8vIHdoZW4gc2V0dGluZ3MgY3VzdG9tIHRoZW1lcyghKSBzbyBhZGRpbmcgZm9yY2VUaGVtZSB0byBvdmVycmlkZVxuICAgICAgICAvLyB0aGUgdmFsdWUgZnJvbSBzZXR0aW5ncy5cbiAgICAgICAgZGlzLmRpc3BhdGNoPFJlY2hlY2tUaGVtZVBheWxvYWQ+KHthY3Rpb246IEFjdGlvbi5SZWNoZWNrVGhlbWUsIGZvcmNlVGhlbWU6IG5ld1RoZW1lfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Vc2VTeXN0ZW1UaGVtZUNoYW5nZWQgPSAoY2hlY2tlZDogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt1c2VTeXN0ZW1UaGVtZTogY2hlY2tlZH0pO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwidXNlX3N5c3RlbV90aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBjaGVja2VkKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoPFJlY2hlY2tUaGVtZVBheWxvYWQ+KHthY3Rpb246IEFjdGlvbi5SZWNoZWNrVGhlbWV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZvbnRTaXplQ2hhbmdlZCA9IChzaXplOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Zm9udFNpemU6IHNpemUudG9TdHJpbmcoKX0pO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiYmFzZUZvbnRTaXplXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIHNpemUgLSBGb250V2F0Y2hlci5TSVpFX0RJRkYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVmFsaWRhdGVGb250U2l6ZSA9IGFzeW5jICh7dmFsdWV9OiBQaWNrPElGaWVsZFN0YXRlLCBcInZhbHVlXCI+KTogUHJvbWlzZTxJVmFsaWRhdGlvblJlc3VsdD4gPT4ge1xuICAgICAgICBjb25zdCBwYXJzZWRTaXplID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgIGNvbnN0IG1pbiA9IEZvbnRXYXRjaGVyLk1JTl9TSVpFICsgRm9udFdhdGNoZXIuU0laRV9ESUZGO1xuICAgICAgICBjb25zdCBtYXggPSBGb250V2F0Y2hlci5NQVhfU0laRSArIEZvbnRXYXRjaGVyLlNJWkVfRElGRjtcblxuICAgICAgICBpZiAoaXNOYU4ocGFyc2VkU2l6ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7dmFsaWQ6IGZhbHNlLCBmZWVkYmFjazogX3QoXCJTaXplIG11c3QgYmUgYSBudW1iZXJcIil9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEobWluIDw9IHBhcnNlZFNpemUgJiYgcGFyc2VkU2l6ZSA8PSBtYXgpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmZWVkYmFjazogX3QoJ0N1c3RvbSBmb250IHNpemUgY2FuIG9ubHkgYmUgYmV0d2VlbiAlKG1pbilzIHB0IGFuZCAlKG1heClzIHB0Jywge21pbiwgbWF4fSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcbiAgICAgICAgICAgIFwiYmFzZUZvbnRTaXplXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICAgICAgICAgIHBhcnNlSW50KHZhbHVlLCAxMCkgLSBGb250V2F0Y2hlci5TSVpFX0RJRkYsXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHt2YWxpZDogdHJ1ZSwgZmVlZGJhY2s6IF90KCdVc2UgYmV0d2VlbiAlKG1pbilzIHB0IGFuZCAlKG1heClzIHB0Jywge21pbiwgbWF4fSl9O1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkQ3VzdG9tVGhlbWUgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGxldCBjdXJyZW50VGhlbWVzOiBzdHJpbmdbXSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJjdXN0b21fdGhlbWVzXCIpO1xuICAgICAgICBpZiAoIWN1cnJlbnRUaGVtZXMpIGN1cnJlbnRUaGVtZXMgPSBbXTtcbiAgICAgICAgY3VycmVudFRoZW1lcyA9IGN1cnJlbnRUaGVtZXMubWFwKGMgPT4gYyk7IC8vIGNoZWFwIGNsb25lXG5cbiAgICAgICAgaWYgKHRoaXMudGhlbWVUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGhlbWVUaW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgciA9IGF3YWl0IGZldGNoKHRoaXMuc3RhdGUuY3VzdG9tVGhlbWVVcmwpO1xuICAgICAgICAgICAgLy8gWFhYOiBuZWVkIHNvbWUgc2NoZW1hIGZvciB0aGlzXG4gICAgICAgICAgICBjb25zdCB0aGVtZUluZm8gPSBhd2FpdCByLmpzb24oKTtcbiAgICAgICAgICAgIGlmICghdGhlbWVJbmZvIHx8IHR5cGVvZih0aGVtZUluZm9bJ25hbWUnXSkgIT09ICdzdHJpbmcnIHx8IHR5cGVvZih0aGVtZUluZm9bJ2NvbG9ycyddKSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXN0b21UaGVtZU1lc3NhZ2U6IHt0ZXh0OiBfdChcIkludmFsaWQgdGhlbWUgc2NoZW1hLlwiKSwgaXNFcnJvcjogdHJ1ZX19KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyZW50VGhlbWVzLnB1c2godGhlbWVJbmZvKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2N1c3RvbVRoZW1lTWVzc2FnZToge3RleHQ6IF90KFwiRXJyb3IgZG93bmxvYWRpbmcgdGhlbWUgaW5mb3JtYXRpb24uXCIpLCBpc0Vycm9yOiB0cnVlfX0pO1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBEb24ndCBjb250aW51ZSBvbiBlcnJvclxuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcImN1c3RvbV90aGVtZXNcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkFDQ09VTlQsIGN1cnJlbnRUaGVtZXMpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXN0b21UaGVtZVVybDogXCJcIiwgY3VzdG9tVGhlbWVNZXNzYWdlOiB7dGV4dDogX3QoXCJUaGVtZSBhZGRlZCFcIiksIGlzRXJyb3I6IGZhbHNlfX0pO1xuXG4gICAgICAgIHRoaXMudGhlbWVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y3VzdG9tVGhlbWVNZXNzYWdlOiB7dGV4dDogXCJcIiwgaXNFcnJvcjogZmFsc2V9fSk7XG4gICAgICAgIH0sIDMwMDApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ3VzdG9tVGhlbWVDaGFuZ2UgPSAoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTFNlbGVjdEVsZW1lbnQgfCBIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXN0b21UaGVtZVVybDogZS50YXJnZXQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkxheW91dENoYW5nZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCB2YWwgPSBlLnRhcmdldC52YWx1ZSA9PT0gXCJ0cnVlXCI7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1c2VJUkNMYXlvdXQ6IHZhbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInVzZUlSQ0xheW91dFwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCB2YWwpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclRoZW1lU2VjdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGhlbWVXYXRjaGVyID0gbmV3IFRoZW1lV2F0Y2hlcigpO1xuICAgICAgICBsZXQgc3lzdGVtVGhlbWVTZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoZW1lV2F0Y2hlci5pc1N5c3RlbVRoZW1lU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgIHN5c3RlbVRoZW1lU2VjdGlvbiA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPFN0eWxlZENoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUudXNlU3lzdGVtVGhlbWV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gdGhpcy5vblVzZVN5c3RlbVRoZW1lQ2hhbmdlZChlLnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtTZXR0aW5nc1N0b3JlLmdldERpc3BsYXlOYW1lKFwidXNlX3N5c3RlbV90aGVtZVwiKX1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1c3RvbVRoZW1lRm9ybTogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9jdXN0b21fdGhlbWVzXCIpKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VzdG9tVGhlbWVNZXNzYWdlLnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UuaXNFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlRWxlbWVudCA9IDxkaXYgY2xhc3NOYW1lPSd0ZXh0LWVycm9yJz57dGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UudGV4dH08L2Rpdj47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUVsZW1lbnQgPSA8ZGl2IGNsYXNzTmFtZT0ndGV4dC1zdWNjZXNzJz57dGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UudGV4dH08L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VzdG9tVGhlbWVGb3JtID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25BZGRDdXN0b21UaGVtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJDdXN0b20gdGhlbWUgVVJMXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9J214X0dlbmVyYWxVc2VyU2V0dGluZ3NUYWJfY3VzdG9tVGhlbWVJbnB1dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ3VzdG9tVGhlbWVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuY3VzdG9tVGhlbWVVcmx9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWRkQ3VzdG9tVGhlbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUuY3VzdG9tVGhlbWVVcmwudHJpbSgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPntfdChcIkFkZCB0aGVtZVwiKX08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bWVzc2FnZUVsZW1lbnR9XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBYWFg6IHJlcGxhY2UgYW55IHR5cGUgaGVyZVxuICAgICAgICBjb25zdCB0aGVtZXMgPSBPYmplY3QuZW50cmllczxhbnk+KGVudW1lcmF0ZVRoZW1lcygpKVxuICAgICAgICAgICAgLm1hcChwID0+ICh7aWQ6IHBbMF0sIG5hbWU6IHBbMV19KSk7IC8vIGNvbnZlcnQgcGFpcnMgdG8gb2JqZWN0cyBmb3IgY29kZSByZWFkYWJpbGl0eVxuICAgICAgICBjb25zdCBidWlsdEluVGhlbWVzID0gdGhlbWVzLmZpbHRlcihwID0+ICFwLmlkLnN0YXJ0c1dpdGgoXCJjdXN0b20tXCIpKTtcbiAgICAgICAgY29uc3QgY3VzdG9tVGhlbWVzID0gdGhlbWVzLmZpbHRlcihwID0+ICFidWlsdEluVGhlbWVzLmluY2x1ZGVzKHApKVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xuICAgICAgICBjb25zdCBvcmRlcmVkVGhlbWVzID0gWy4uLmJ1aWx0SW5UaGVtZXMsIC4uLmN1c3RvbVRoZW1lc107XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl90aGVtZVNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiVGhlbWVcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIHtzeXN0ZW1UaGVtZVNlY3Rpb259XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9UaGVtZVNlbGVjdG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9Hcm91cFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInRoZW1lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25zPXtvcmRlcmVkVGhlbWVzLm1hcCh0ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5zdGF0ZS51c2VTeXN0ZW1UaGVtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwibXhfVGhlbWVTZWxlY3Rvcl9cIiArIHQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblRoZW1lQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudXNlU3lzdGVtVGhlbWUgPyB1bmRlZmluZWQgOiB0aGlzLnN0YXRlLnRoZW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZWRcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7Y3VzdG9tVGhlbWVGb3JtfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJGb250U2VjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX2ZvbnRTY2FsaW5nXCI+XG5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJGb250IHNpemVcIil9PC9zcGFuPlxuICAgICAgICAgICAgPEV2ZW50VGlsZVByZXZpZXdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX2ZvbnRTbGlkZXJfcHJldmlld1wiXG4gICAgICAgICAgICAgICAgbWVzc2FnZT17dGhpcy5NRVNTQUdFX1BSRVZJRVdfVEVYVH1cbiAgICAgICAgICAgICAgICB1c2VJUkNMYXlvdXQ9e3RoaXMuc3RhdGUudXNlSVJDTGF5b3V0fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9mb250U2xpZGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX2ZvbnRTbGlkZXJfc21hbGxUZXh0XCI+QWE8L2Rpdj5cbiAgICAgICAgICAgICAgICA8U2xpZGVyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcz17WzEzLCAxNCwgMTUsIDE2LCAxOF19XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXJzZUludCh0aGlzLnN0YXRlLmZvbnRTaXplLCAxMCl9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLm9uRm9udFNpemVDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5RnVuYz17XyA9PiBcIlwifVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS51c2VDdXN0b21Gb250U2l6ZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9mb250U2xpZGVyX2xhcmdlVGV4dFwiPkFhPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VDdXN0b21Gb250U2l6ZVwiXG4gICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5BQ0NPVU5UfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoY2hlY2tlZCkgPT4gdGhpcy5zZXRTdGF0ZSh7dXNlQ3VzdG9tRm9udFNpemU6IGNoZWNrZWR9KX1cbiAgICAgICAgICAgICAgICB1c2VDaGVja2JveD17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkZvbnQgc2l6ZVwiKX1cbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnN0YXRlLmZvbnRTaXplLnRvU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZm9udFNpemUudG9TdHJpbmcoKX1cbiAgICAgICAgICAgICAgICBpZD1cImZvbnRfc2l6ZV9maWVsZFwiXG4gICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblZhbGlkYXRlRm9udFNpemV9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4gdGhpcy5zZXRTdGF0ZSh7Zm9udFNpemU6IHZhbHVlLnRhcmdldC52YWx1ZX0pfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS51c2VDdXN0b21Gb250U2l6ZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9jdXN0b21Gb250U2l6ZUZpZWxkXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckxheW91dFNlY3Rpb24gPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9MYXlvdXRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJNZXNzYWdlIGxheW91dFwiKX08L3NwYW4+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9MYXlvdXRfUmFkaW9CdXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX0xheW91dF9SYWRpb0J1dHRvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgIG14X0FwcGVhcmFuY2VVc2VyU2V0dGluZ3NUYWJfTGF5b3V0X1JhZGlvQnV0dG9uX3NlbGVjdGVkOiB0aGlzLnN0YXRlLnVzZUlSQ0xheW91dCxcbiAgICAgICAgICAgICAgICB9KX0+XG4gICAgICAgICAgICAgICAgICAgIDxFdmVudFRpbGVQcmV2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX0xheW91dF9SYWRpb0J1dHRvbl9wcmV2aWV3XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U9e3RoaXMuTUVTU0FHRV9QUkVWSUVXX1RFWFR9XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VJUkNMYXlvdXQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxTdHlsZWRSYWRpb0J1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cImxheW91dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS51c2VJUkNMYXlvdXR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ29tcGFjdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRSYWRpb0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcGVhcmFuY2VVc2VyU2V0dGluZ3NUYWJfc3BhY2VyXCIgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0FwcGVhcmFuY2VVc2VyU2V0dGluZ3NUYWJfTGF5b3V0X1JhZGlvQnV0dG9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgbXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9MYXlvdXRfUmFkaW9CdXR0b25fc2VsZWN0ZWQ6ICF0aGlzLnN0YXRlLnVzZUlSQ0xheW91dCxcbiAgICAgICAgICAgICAgICB9KX0+XG4gICAgICAgICAgICAgICAgICAgIDxFdmVudFRpbGVQcmV2aWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX0xheW91dF9SYWRpb0J1dHRvbl9wcmV2aWV3XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U9e3RoaXMuTUVTU0FHRV9QUkVWSUVXX1RFWFR9XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VJUkNMYXlvdXQ9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJsYXlvdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXshdGhpcy5zdGF0ZS51c2VJUkNMYXlvdXR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkxheW91dENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiTW9kZXJuXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZFJhZGlvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJBZHZhbmNlZFNlY3Rpb24oKSB7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuQWR2YW5jZWRTZXR0aW5ncykpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICBjb25zdCB0b2dnbGUgPSA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX0FkdmFuY2VkVG9nZ2xlXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0U3RhdGUoe3Nob3dBZHZhbmNlZDogIXRoaXMuc3RhdGUuc2hvd0FkdmFuY2VkfSl9XG4gICAgICAgID5cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLnNob3dBZHZhbmNlZCA/IF90KFwiSGlkZSBhZHZhbmNlZFwiKSA6IF90KFwiU2hvdyBhZHZhbmNlZFwiKX1cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIGxldCBhZHZhbmNlZDogUmVhY3QuUmVhY3ROb2RlO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dBZHZhbmNlZCkge1xuICAgICAgICAgICAgY29uc3QgdG9vbHRpcENvbnRlbnQgPSBfdChcbiAgICAgICAgICAgICAgICBcIlNldCB0aGUgbmFtZSBvZiBhIGZvbnQgaW5zdGFsbGVkIG9uIHlvdXIgc3lzdGVtICYgJShicmFuZClzIHdpbGwgYXR0ZW1wdCB0byB1c2UgaXQuXCIsXG4gICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGFkdmFuY2VkID0gPD5cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VDb21wYWN0TGF5b3V0XCJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgICAgIHVzZUNoZWNrYm94PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS51c2VJUkNMYXlvdXR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VJUkNMYXlvdXRcIlxuICAgICAgICAgICAgICAgICAgICBsZXZlbD17U2V0dGluZ0xldmVsLkRFVklDRX1cbiAgICAgICAgICAgICAgICAgICAgdXNlQ2hlY2tib3g9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoY2hlY2tlZCkgPT4gdGhpcy5zZXRTdGF0ZSh7dXNlSVJDTGF5b3V0OiBjaGVja2VkfSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VTeXN0ZW1Gb250XCJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgICAgIHVzZUNoZWNrYm94PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGNoZWNrZWQpID0+IHRoaXMuc2V0U3RhdGUoe3VzZVN5c3RlbUZvbnQ6IGNoZWNrZWR9KX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX3N5c3RlbUZvbnRcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17U2V0dGluZ3NTdG9yZS5nZXREaXNwbGF5TmFtZShcInN5c3RlbUZvbnRcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5c3RlbUZvbnQ6IHZhbHVlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwic3lzdGVtRm9udFwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCB2YWx1ZS50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwQ29udGVudD17dG9vbHRpcENvbnRlbnR9XG4gICAgICAgICAgICAgICAgICAgIGZvcmNlVG9vbHRpcFZpc2libGU9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS51c2VTeXN0ZW1Gb250fVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5zeXN0ZW1Gb250fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX0FkdmFuY2VkXCI+XG4gICAgICAgICAgICB7dG9nZ2xlfVxuICAgICAgICAgICAge2FkdmFuY2VkfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYiBteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiQ3VzdG9taXNlIHlvdXIgYXBwZWFyYW5jZVwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX1N1YkhlYWRpbmdcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiQXBwZWFyYW5jZSBTZXR0aW5ncyBvbmx5IGFmZmVjdCB0aGlzICUoYnJhbmQpcyBzZXNzaW9uLlwiLCB7IGJyYW5kIH0pfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlclRoZW1lU2VjdGlvbigpfVxuICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckZvbnRTZWN0aW9uKCl9XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVyQWR2YW5jZWRTZWN0aW9uKCl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=