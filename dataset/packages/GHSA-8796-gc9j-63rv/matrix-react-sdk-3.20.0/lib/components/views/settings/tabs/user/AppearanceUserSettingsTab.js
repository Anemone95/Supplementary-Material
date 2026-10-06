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

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _theme = require("../../../../../theme");

var _ThemeWatcher = _interopRequireDefault(require("../../../../../settings/watchers/ThemeWatcher"));

var _Slider = _interopRequireDefault(require("../../../elements/Slider"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _FontWatcher = require("../../../../../settings/watchers/FontWatcher");

var _actions = require("../../../../../dispatcher/actions");

var _StyledCheckbox = _interopRequireDefault(require("../../../elements/StyledCheckbox"));

var _SettingsFlag = _interopRequireDefault(require("../../../elements/SettingsFlag"));

var _Field = _interopRequireDefault(require("../../../elements/Field"));

var _EventTilePreview = _interopRequireDefault(require("../../../elements/EventTilePreview"));

var _StyledRadioGroup = _interopRequireDefault(require("../../../elements/StyledRadioGroup"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _UIFeature = require("../../../../../settings/UIFeature");

var _Layout = require("../../../../../settings/Layout");

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _temp;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

let AppearanceUserSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.user.AppearanceUserSettingsTab"), _dec(_class = (_temp = class AppearanceUserSettingsTab extends _react.default.Component
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
    (0, _defineProperty2.default)(this, "onIRCLayoutChange", (enabled
    /*: boolean*/
    ) => {
      if (enabled) {
        this.setState({
          layout: _Layout.Layout.IRC
        });

        _SettingsStore.default.setValue("layout", null, _SettingLevel.SettingLevel.DEVICE, _Layout.Layout.IRC);
      } else {
        this.setState({
          layout: _Layout.Layout.Group
        });

        _SettingsStore.default.setValue("layout", null, _SettingLevel.SettingLevel.DEVICE, _Layout.Layout.Group);
      }
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
      layout: _SettingsStore.default.getValue("layout"),
      userId: "@erim:fink.fink",
      displayName: "Erimayas Fink",
      avatarUrl: null
    });
  }

  async componentDidMount() {
    // Fetch the current user profile for the message preview
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const userId = client.getUserId();
    const profileInfo = await client.getProfileInfo(userId);
    this.setState({
      userId,
      displayName: profileInfo.displayname,
      avatarUrl: profileInfo.avatar_url
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
      layout: this.state.layout,
      userId: this.state.userId,
      displayName: this.state.displayName,
      avatarUrl: this.state.avatarUrl
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
        disabled: this.state.layout == _Layout.Layout.IRC
      }), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        checked: this.state.layout == _Layout.Layout.IRC,
        onChange: ev => this.onIRCLayoutChange(ev.target.checked)
      }, (0, _languageHandler._t)("Enable experimental, compact IRC style layout")), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
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

}, _temp)) || _class);
exports.default = AppearanceUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiLnRzeCJdLCJuYW1lcyI6WyJBcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwibmV3VGhlbWUiLCJzdGF0ZSIsInRoZW1lIiwib2xkVGhlbWUiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsImNhdGNoIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJSZWNoZWNrVGhlbWUiLCJzZXRTdGF0ZSIsImZvcmNlVGhlbWUiLCJjaGVja2VkIiwidXNlU3lzdGVtVGhlbWUiLCJzaXplIiwiZm9udFNpemUiLCJ0b1N0cmluZyIsIkZvbnRXYXRjaGVyIiwiU0laRV9ESUZGIiwidmFsdWUiLCJwYXJzZWRTaXplIiwicGFyc2VGbG9hdCIsIm1pbiIsIk1JTl9TSVpFIiwibWF4IiwiTUFYX1NJWkUiLCJpc05hTiIsInZhbGlkIiwiZmVlZGJhY2siLCJwYXJzZUludCIsImN1cnJlbnRUaGVtZXMiLCJtYXAiLCJjIiwidGhlbWVUaW1lciIsImNsZWFyVGltZW91dCIsInIiLCJmZXRjaCIsImN1c3RvbVRoZW1lVXJsIiwidGhlbWVJbmZvIiwianNvbiIsImN1c3RvbVRoZW1lTWVzc2FnZSIsInRleHQiLCJpc0Vycm9yIiwicHVzaCIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJBQ0NPVU5UIiwic2V0VGltZW91dCIsInRhcmdldCIsImVuYWJsZWQiLCJsYXlvdXQiLCJMYXlvdXQiLCJJUkMiLCJHcm91cCIsImNhbGN1bGF0ZVRoZW1lU3RhdGUiLCJ1c2VDdXN0b21Gb250U2l6ZSIsInVzZVN5c3RlbUZvbnQiLCJzeXN0ZW1Gb250Iiwic2hvd0FkdmFuY2VkIiwidXNlcklkIiwiZGlzcGxheU5hbWUiLCJhdmF0YXJVcmwiLCJjb21wb25lbnREaWRNb3VudCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVzZXJJZCIsInByb2ZpbGVJbmZvIiwiZ2V0UHJvZmlsZUluZm8iLCJkaXNwbGF5bmFtZSIsImF2YXRhcl91cmwiLCJ0aGVtZUNob2ljZSIsInN5c3RlbVRoZW1lRXhwbGljaXQiLCJnZXRWYWx1ZUF0IiwidGhlbWVFeHBsaWNpdCIsInJlbmRlclRoZW1lU2VjdGlvbiIsInRoZW1lV2F0Y2hlciIsIlRoZW1lV2F0Y2hlciIsInN5c3RlbVRoZW1lU2VjdGlvbiIsImlzU3lzdGVtVGhlbWVTdXBwb3J0ZWQiLCJvblVzZVN5c3RlbVRoZW1lQ2hhbmdlZCIsImdldERpc3BsYXlOYW1lIiwiY3VzdG9tVGhlbWVGb3JtIiwibWVzc2FnZUVsZW1lbnQiLCJvbkFkZEN1c3RvbVRoZW1lIiwib25DdXN0b21UaGVtZUNoYW5nZSIsInRyaW0iLCJ0aGVtZXMiLCJPYmplY3QiLCJlbnRyaWVzIiwicCIsImlkIiwibmFtZSIsImJ1aWx0SW5UaGVtZXMiLCJmaWx0ZXIiLCJzdGFydHNXaXRoIiwiY3VzdG9tVGhlbWVzIiwiaW5jbHVkZXMiLCJzb3J0IiwiYSIsImIiLCJsb2NhbGVDb21wYXJlIiwib3JkZXJlZFRoZW1lcyIsInQiLCJsYWJlbCIsImRpc2FibGVkIiwiY2xhc3NOYW1lIiwib25UaGVtZUNoYW5nZSIsInVuZGVmaW5lZCIsInJlbmRlckZvbnRTZWN0aW9uIiwiTUVTU0FHRV9QUkVWSUVXX1RFWFQiLCJvbkZvbnRTaXplQ2hhbmdlZCIsIl8iLCJvblZhbGlkYXRlRm9udFNpemUiLCJyZW5kZXJBZHZhbmNlZFNlY3Rpb24iLCJVSUZlYXR1cmUiLCJBZHZhbmNlZFNldHRpbmdzIiwiYnJhbmQiLCJTZGtDb25maWciLCJ0b2dnbGUiLCJhZHZhbmNlZCIsInRvb2x0aXBDb250ZW50IiwiZXYiLCJvbklSQ0xheW91dENoYW5nZSIsInJlbmRlciJdLCJtYXBwaW5n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Ii8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IGVudW1lcmF0ZVRoZW1lcyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi90aGVtZVwiO1xuaW1wb3J0IFRoZW1lV2F0Y2hlciBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3Mvd2F0Y2hlcnMvVGhlbWVXYXRjaGVyXCI7XG5pbXBvcnQgU2xpZGVyIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9TbGlkZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEZvbnRXYXRjaGVyIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL3dhdGNoZXJzL0ZvbnRXYXRjaGVyXCI7XG5pbXBvcnQgeyBSZWNoZWNrVGhlbWVQYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9SZWNoZWNrVGhlbWVQYXlsb2FkJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgeyBJVmFsaWRhdGlvblJlc3VsdCwgSUZpZWxkU3RhdGUgfSBmcm9tICcuLi8uLi8uLi9lbGVtZW50cy9WYWxpZGF0aW9uJztcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tICcuLi8uLi8uLi9lbGVtZW50cy9TdHlsZWRDaGVja2JveCc7XG5pbXBvcnQgU2V0dGluZ3NGbGFnIGZyb20gJy4uLy4uLy4uL2VsZW1lbnRzL1NldHRpbmdzRmxhZyc7XG5pbXBvcnQgRmllbGQgZnJvbSAnLi4vLi4vLi4vZWxlbWVudHMvRmllbGQnO1xuaW1wb3J0IEV2ZW50VGlsZVByZXZpZXcgZnJvbSAnLi4vLi4vLi4vZWxlbWVudHMvRXZlbnRUaWxlUHJldmlldyc7XG5pbXBvcnQgU3R5bGVkUmFkaW9Hcm91cCBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvU3R5bGVkUmFkaW9Hcm91cFwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHtVSUZlYXR1cmV9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7TGF5b3V0fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvTGF5b3V0XCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG59XG5cbmludGVyZmFjZSBJVGhlbWVTdGF0ZSB7XG4gICAgdGhlbWU6IHN0cmluZztcbiAgICB1c2VTeXN0ZW1UaGVtZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDdXN0b21UaGVtZU1lc3NhZ2Uge1xuICAgIGlzRXJyb3I6IGJvb2xlYW47XG4gICAgdGV4dDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIGV4dGVuZHMgSVRoZW1lU3RhdGUge1xuICAgIC8vIFN0cmluZyBkaXNwbGF5aW5nIHRoZSBjdXJyZW50IHNlbGVjdGVkIGZvbnRTaXplLlxuICAgIC8vIE5lZWRzIHRvIGJlIHN0cmluZyBmb3IgdGhpbmdzIGxpa2UgJzE3Licgd2l0aG91dFxuICAgIC8vIHRyYWlsaW5nIDBzLlxuICAgIGZvbnRTaXplOiBzdHJpbmc7XG4gICAgY3VzdG9tVGhlbWVVcmw6IHN0cmluZztcbiAgICBjdXN0b21UaGVtZU1lc3NhZ2U6IEN1c3RvbVRoZW1lTWVzc2FnZTtcbiAgICB1c2VDdXN0b21Gb250U2l6ZTogYm9vbGVhbjtcbiAgICB1c2VTeXN0ZW1Gb250OiBib29sZWFuO1xuICAgIHN5c3RlbUZvbnQ6IHN0cmluZztcbiAgICBzaG93QWR2YW5jZWQ6IGJvb2xlYW47XG4gICAgbGF5b3V0OiBMYXlvdXQ7XG4gICAgLy8gVXNlciBwcm9maWxlIGRhdGEgZm9yIHRoZSBtZXNzYWdlIHByZXZpZXdcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBkaXNwbGF5TmFtZTogc3RyaW5nO1xuICAgIGF2YXRhclVybDogc3RyaW5nO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy50YWJzLnVzZXIuQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYlwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgTUVTU0FHRV9QUkVWSUVXX1RFWFQgPSBfdChcIkhleSB5b3UuIFlvdSdyZSB0aGUgYmVzdCFcIik7XG5cbiAgICBwcml2YXRlIHRoZW1lVGltZXI6IE5vZGVKUy5UaW1lb3V0O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImJhc2VGb250U2l6ZVwiLCBudWxsKSArIEZvbnRXYXRjaGVyLlNJWkVfRElGRikudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIC4uLnRoaXMuY2FsY3VsYXRlVGhlbWVTdGF0ZSgpLFxuICAgICAgICAgICAgY3VzdG9tVGhlbWVVcmw6IFwiXCIsXG4gICAgICAgICAgICBjdXN0b21UaGVtZU1lc3NhZ2U6IHtpc0Vycm9yOiBmYWxzZSwgdGV4dDogXCJcIn0sXG4gICAgICAgICAgICB1c2VDdXN0b21Gb250U2l6ZTogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInVzZUN1c3RvbUZvbnRTaXplXCIpLFxuICAgICAgICAgICAgdXNlU3lzdGVtRm9udDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInVzZVN5c3RlbUZvbnRcIiksXG4gICAgICAgICAgICBzeXN0ZW1Gb250OiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic3lzdGVtRm9udFwiKSxcbiAgICAgICAgICAgIHNob3dBZHZhbmNlZDogZmFsc2UsXG4gICAgICAgICAgICBsYXlvdXQ6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsYXlvdXRcIiksXG4gICAgICAgICAgICB1c2VySWQ6IFwiQGVyaW06Zmluay5maW5rXCIsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJFcmltYXlhcyBGaW5rXCIsXG4gICAgICAgICAgICBhdmF0YXJVcmw6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIC8vIEZldGNoIHRoZSBjdXJyZW50IHVzZXIgcHJvZmlsZSBmb3IgdGhlIG1lc3NhZ2UgcHJldmlld1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IGNsaWVudC5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgcHJvZmlsZUluZm8gPSBhd2FpdCBjbGllbnQuZ2V0UHJvZmlsZUluZm8odXNlcklkKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBwcm9maWxlSW5mby5kaXNwbGF5bmFtZSxcbiAgICAgICAgICAgIGF2YXRhclVybDogcHJvZmlsZUluZm8uYXZhdGFyX3VybCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVUaGVtZVN0YXRlKCk6IElUaGVtZVN0YXRlIHtcbiAgICAgICAgLy8gV2UgaGF2ZSB0byBtaXJyb3IgdGhlIGxvZ2ljIGZyb20gVGhlbWVXYXRjaGVyLmdldEVmZmVjdGl2ZVRoZW1lIHNvIHdlXG4gICAgICAgIC8vIHNob3cgdGhlIHJpZ2h0IHZhbHVlcyBmb3IgdGhpbmdzLlxuXG4gICAgICAgIGNvbnN0IHRoZW1lQ2hvaWNlOiBzdHJpbmcgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwidGhlbWVcIik7XG4gICAgICAgIGNvbnN0IHN5c3RlbVRoZW1lRXhwbGljaXQ6IGJvb2xlYW4gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLCBcInVzZV9zeXN0ZW1fdGhlbWVcIiwgbnVsbCwgZmFsc2UsIHRydWUpO1xuICAgICAgICBjb25zdCB0aGVtZUV4cGxpY2l0OiBzdHJpbmcgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLCBcInRoZW1lXCIsIG51bGwsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAvLyBJZiB0aGUgdXNlciBoYXMgZW5hYmxlZCBzeXN0ZW0gdGhlbWUgbWF0Y2hpbmcsIHVzZSB0aGF0LlxuICAgICAgICBpZiAoc3lzdGVtVGhlbWVFeHBsaWNpdCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aGVtZTogdGhlbWVDaG9pY2UsXG4gICAgICAgICAgICAgICAgdXNlU3lzdGVtVGhlbWU6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIHNldCBhIHRoZW1lIGV4cGxpY2l0bHksIHVzZSB0aGF0IChubyBzeXN0ZW0gdGhlbWUgbWF0Y2hpbmcpXG4gICAgICAgIGlmICh0aGVtZUV4cGxpY2l0KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRoZW1lOiB0aGVtZUNob2ljZSxcbiAgICAgICAgICAgICAgICB1c2VTeXN0ZW1UaGVtZTogZmFsc2UsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGFzc3VtZSB0aGUgZGVmYXVsdHMgZm9yIHRoZSBzZXR0aW5nc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGhlbWU6IHRoZW1lQ2hvaWNlLFxuICAgICAgICAgICAgdXNlU3lzdGVtVGhlbWU6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuREVWSUNFLCBcInVzZV9zeXN0ZW1fdGhlbWVcIiksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblRoZW1lQ2hhbmdlID0gKG5ld1RoZW1lOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGhlbWUgPT09IG5ld1RoZW1lKSByZXR1cm47XG5cbiAgICAgICAgLy8gZG9pbmcgZ2V0VmFsdWUgaW4gdGhlIC5jYXRjaCB3aWxsIHN0aWxsIHJldHVybiB0aGUgdmFsdWUgd2UgZmFpbGVkIHRvIHNldCxcbiAgICAgICAgLy8gc28gcmVtZW1iZXIgd2hhdCB0aGUgdmFsdWUgd2FzIGJlZm9yZSB3ZSB0cmllZCB0byBzZXQgaXQgc28gd2UgY2FuIHJldmVydFxuICAgICAgICBjb25zdCBvbGRUaGVtZTogc3RyaW5nID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSgndGhlbWUnKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInRoZW1lXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIG5ld1RoZW1lKS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8UmVjaGVja1RoZW1lUGF5bG9hZD4oe2FjdGlvbjogQWN0aW9uLlJlY2hlY2tUaGVtZX0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGhlbWU6IG9sZFRoZW1lfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt0aGVtZTogbmV3VGhlbWV9KTtcbiAgICAgICAgLy8gVGhlIHNldHRpbmdzIHdhdGNoZXIgZG9lc24ndCBmaXJlIHVudGlsIHRoZSBlY2hvIGNvbWVzIGJhY2sgZnJvbSB0aGVcbiAgICAgICAgLy8gc2VydmVyLCBzbyB0byBtYWtlIHRoZSB0aGVtZSBjaGFuZ2UgaW1tZWRpYXRlbHkgd2UgbmVlZCB0byBtYW51YWxseVxuICAgICAgICAvLyBkbyB0aGUgZGlzcGF0Y2ggbm93XG4gICAgICAgIC8vIFhYWDogVGhlIGxvY2FsIGVjaG9lZCB2YWx1ZSBhcHBlYXJzIHRvIGJlIHVucmVsaWFibGUsIGluIHBhcnRpY3VsYXJcbiAgICAgICAgLy8gd2hlbiBzZXR0aW5ncyBjdXN0b20gdGhlbWVzKCEpIHNvIGFkZGluZyBmb3JjZVRoZW1lIHRvIG92ZXJyaWRlXG4gICAgICAgIC8vIHRoZSB2YWx1ZSBmcm9tIHNldHRpbmdzLlxuICAgICAgICBkaXMuZGlzcGF0Y2g8UmVjaGVja1RoZW1lUGF5bG9hZD4oe2FjdGlvbjogQWN0aW9uLlJlY2hlY2tUaGVtZSwgZm9yY2VUaGVtZTogbmV3VGhlbWV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZVN5c3RlbVRoZW1lQ2hhbmdlZCA9IChjaGVja2VkOiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3VzZVN5c3RlbVRoZW1lOiBjaGVja2VkfSk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJ1c2Vfc3lzdGVtX3RoZW1lXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIGNoZWNrZWQpO1xuICAgICAgICBkaXMuZGlzcGF0Y2g8UmVjaGVja1RoZW1lUGF5bG9hZD4oe2FjdGlvbjogQWN0aW9uLlJlY2hlY2tUaGVtZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9udFNpemVDaGFuZ2VkID0gKHNpemU6IG51bWJlcik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtmb250U2l6ZTogc2l6ZS50b1N0cmluZygpfSk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJiYXNlRm9udFNpemVcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgc2l6ZSAtIEZvbnRXYXRjaGVyLlNJWkVfRElGRik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25WYWxpZGF0ZUZvbnRTaXplID0gYXN5bmMgKHt2YWx1ZX06IFBpY2s8SUZpZWxkU3RhdGUsIFwidmFsdWVcIj4pOiBQcm9taXNlPElWYWxpZGF0aW9uUmVzdWx0PiA9PiB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFNpemUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgY29uc3QgbWluID0gRm9udFdhdGNoZXIuTUlOX1NJWkUgKyBGb250V2F0Y2hlci5TSVpFX0RJRkY7XG4gICAgICAgIGNvbnN0IG1heCA9IEZvbnRXYXRjaGVyLk1BWF9TSVpFICsgRm9udFdhdGNoZXIuU0laRV9ESUZGO1xuXG4gICAgICAgIGlmIChpc05hTihwYXJzZWRTaXplKSkge1xuICAgICAgICAgICAgcmV0dXJuIHt2YWxpZDogZmFsc2UsIGZlZWRiYWNrOiBfdChcIlNpemUgbXVzdCBiZSBhIG51bWJlclwiKX07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIShtaW4gPD0gcGFyc2VkU2l6ZSAmJiBwYXJzZWRTaXplIDw9IG1heCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZlZWRiYWNrOiBfdCgnQ3VzdG9tIGZvbnQgc2l6ZSBjYW4gb25seSBiZSBiZXR3ZWVuICUobWluKXMgcHQgYW5kICUobWF4KXMgcHQnLCB7bWluLCBtYXh9KSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFxuICAgICAgICAgICAgXCJiYXNlRm9udFNpemVcIixcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgICAgICAgICAgcGFyc2VJbnQodmFsdWUsIDEwKSAtIEZvbnRXYXRjaGVyLlNJWkVfRElGRixcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4ge3ZhbGlkOiB0cnVlLCBmZWVkYmFjazogX3QoJ1VzZSBiZXR3ZWVuICUobWluKXMgcHQgYW5kICUobWF4KXMgcHQnLCB7bWluLCBtYXh9KX07XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BZGRDdXN0b21UaGVtZSA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgbGV0IGN1cnJlbnRUaGVtZXM6IHN0cmluZ1tdID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImN1c3RvbV90aGVtZXNcIik7XG4gICAgICAgIGlmICghY3VycmVudFRoZW1lcykgY3VycmVudFRoZW1lcyA9IFtdO1xuICAgICAgICBjdXJyZW50VGhlbWVzID0gY3VycmVudFRoZW1lcy5tYXAoYyA9PiBjKTsgLy8gY2hlYXAgY2xvbmVcblxuICAgICAgICBpZiAodGhpcy50aGVtZVRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aGVtZVRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByID0gYXdhaXQgZmV0Y2godGhpcy5zdGF0ZS5jdXN0b21UaGVtZVVybCk7XG4gICAgICAgICAgICAvLyBYWFg6IG5lZWQgc29tZSBzY2hlbWEgZm9yIHRoaXNcbiAgICAgICAgICAgIGNvbnN0IHRoZW1lSW5mbyA9IGF3YWl0IHIuanNvbigpO1xuICAgICAgICAgICAgaWYgKCF0aGVtZUluZm8gfHwgdHlwZW9mKHRoZW1lSW5mb1snbmFtZSddKSAhPT0gJ3N0cmluZycgfHwgdHlwZW9mKHRoZW1lSW5mb1snY29sb3JzJ10pICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2N1c3RvbVRoZW1lTWVzc2FnZToge3RleHQ6IF90KFwiSW52YWxpZCB0aGVtZSBzY2hlbWEuXCIpLCBpc0Vycm9yOiB0cnVlfX0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnRUaGVtZXMucHVzaCh0aGVtZUluZm8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y3VzdG9tVGhlbWVNZXNzYWdlOiB7dGV4dDogX3QoXCJFcnJvciBkb3dubG9hZGluZyB0aGVtZSBpbmZvcm1hdGlvbi5cIiksIGlzRXJyb3I6IHRydWV9fSk7XG4gICAgICAgICAgICByZXR1cm47IC8vIERvbid0IGNvbnRpbnVlIG9uIGVycm9yXG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiY3VzdG9tX3RoZW1lc1wiLCBudWxsLCBTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgY3VycmVudFRoZW1lcyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2N1c3RvbVRoZW1lVXJsOiBcIlwiLCBjdXN0b21UaGVtZU1lc3NhZ2U6IHt0ZXh0OiBfdChcIlRoZW1lIGFkZGVkIVwiKSwgaXNFcnJvcjogZmFsc2V9fSk7XG5cbiAgICAgICAgdGhpcy50aGVtZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjdXN0b21UaGVtZU1lc3NhZ2U6IHt0ZXh0OiBcIlwiLCBpc0Vycm9yOiBmYWxzZX19KTtcbiAgICAgICAgfSwgMzAwMCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DdXN0b21UaGVtZUNoYW5nZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MU2VsZWN0RWxlbWVudCB8IEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2N1c3RvbVRoZW1lVXJsOiBlLnRhcmdldC52YWx1ZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSVJDTGF5b3V0Q2hhbmdlID0gKGVuYWJsZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xheW91dDogTGF5b3V0LklSQ30pO1xuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcImxheW91dFwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBMYXlvdXQuSVJDKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xheW91dDogTGF5b3V0Lkdyb3VwfSk7XG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwibGF5b3V0XCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIExheW91dC5Hcm91cCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclRoZW1lU2VjdGlvbigpIHtcbiAgICAgICAgY29uc3QgdGhlbWVXYXRjaGVyID0gbmV3IFRoZW1lV2F0Y2hlcigpO1xuICAgICAgICBsZXQgc3lzdGVtVGhlbWVTZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoZW1lV2F0Y2hlci5pc1N5c3RlbVRoZW1lU3VwcG9ydGVkKCkpIHtcbiAgICAgICAgICAgIHN5c3RlbVRoZW1lU2VjdGlvbiA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPFN0eWxlZENoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUudXNlU3lzdGVtVGhlbWV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gdGhpcy5vblVzZVN5c3RlbVRoZW1lQ2hhbmdlZChlLnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtTZXR0aW5nc1N0b3JlLmdldERpc3BsYXlOYW1lKFwidXNlX3N5c3RlbV90aGVtZVwiKX1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGN1c3RvbVRoZW1lRm9ybTogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9jdXN0b21fdGhlbWVzXCIpKSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VzdG9tVGhlbWVNZXNzYWdlLnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UuaXNFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlRWxlbWVudCA9IDxkaXYgY2xhc3NOYW1lPSd0ZXh0LWVycm9yJz57dGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UudGV4dH08L2Rpdj47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUVsZW1lbnQgPSA8ZGl2IGNsYXNzTmFtZT0ndGV4dC1zdWNjZXNzJz57dGhpcy5zdGF0ZS5jdXN0b21UaGVtZU1lc3NhZ2UudGV4dH08L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VzdG9tVGhlbWVGb3JtID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25BZGRDdXN0b21UaGVtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJDdXN0b20gdGhlbWUgVVJMXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9J214X0dlbmVyYWxVc2VyU2V0dGluZ3NUYWJfY3VzdG9tVGhlbWVJbnB1dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ3VzdG9tVGhlbWVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuY3VzdG9tVGhlbWVVcmx9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWRkQ3VzdG9tVGhlbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUuY3VzdG9tVGhlbWVVcmwudHJpbSgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPntfdChcIkFkZCB0aGVtZVwiKX08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bWVzc2FnZUVsZW1lbnR9XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBYWFg6IHJlcGxhY2UgYW55IHR5cGUgaGVyZVxuICAgICAgICBjb25zdCB0aGVtZXMgPSBPYmplY3QuZW50cmllczxhbnk+KGVudW1lcmF0ZVRoZW1lcygpKVxuICAgICAgICAgICAgLm1hcChwID0+ICh7aWQ6IHBbMF0sIG5hbWU6IHBbMV19KSk7IC8vIGNvbnZlcnQgcGFpcnMgdG8gb2JqZWN0cyBmb3IgY29kZSByZWFkYWJpbGl0eVxuICAgICAgICBjb25zdCBidWlsdEluVGhlbWVzID0gdGhlbWVzLmZpbHRlcihwID0+ICFwLmlkLnN0YXJ0c1dpdGgoXCJjdXN0b20tXCIpKTtcbiAgICAgICAgY29uc3QgY3VzdG9tVGhlbWVzID0gdGhlbWVzLmZpbHRlcihwID0+ICFidWlsdEluVGhlbWVzLmluY2x1ZGVzKHApKVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xuICAgICAgICBjb25zdCBvcmRlcmVkVGhlbWVzID0gWy4uLmJ1aWx0SW5UaGVtZXMsIC4uLmN1c3RvbVRoZW1lc107XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl90aGVtZVNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiVGhlbWVcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIHtzeXN0ZW1UaGVtZVNlY3Rpb259XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9UaGVtZVNlbGVjdG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9Hcm91cFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInRoZW1lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25zPXtvcmRlcmVkVGhlbWVzLm1hcCh0ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5zdGF0ZS51c2VTeXN0ZW1UaGVtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwibXhfVGhlbWVTZWxlY3Rvcl9cIiArIHQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblRoZW1lQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudXNlU3lzdGVtVGhlbWUgPyB1bmRlZmluZWQgOiB0aGlzLnN0YXRlLnRoZW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZWRcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7Y3VzdG9tVGhlbWVGb3JtfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJGb250U2VjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX2ZvbnRTY2FsaW5nXCI+XG5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJGb250IHNpemVcIil9PC9zcGFuPlxuICAgICAgICAgICAgPEV2ZW50VGlsZVByZXZpZXdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX2ZvbnRTbGlkZXJfcHJldmlld1wiXG4gICAgICAgICAgICAgICAgbWVzc2FnZT17dGhpcy5NRVNTQUdFX1BSRVZJRVdfVEVYVH1cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMuc3RhdGUubGF5b3V0fVxuICAgICAgICAgICAgICAgIHVzZXJJZD17dGhpcy5zdGF0ZS51c2VySWR9XG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU9e3RoaXMuc3RhdGUuZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgYXZhdGFyVXJsPXt0aGlzLnN0YXRlLmF2YXRhclVybH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcGVhcmFuY2VVc2VyU2V0dGluZ3NUYWJfZm9udFNsaWRlclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9mb250U2xpZGVyX3NtYWxsVGV4dFwiPkFhPC9kaXY+XG4gICAgICAgICAgICAgICAgPFNsaWRlclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM9e1sxMywgMTQsIDE1LCAxNiwgMThdfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFyc2VJbnQodGhpcy5zdGF0ZS5mb250U2l6ZSwgMTApfVxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5vbkZvbnRTaXplQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheUZ1bmM9e18gPT4gXCJcIn1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudXNlQ3VzdG9tRm9udFNpemV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcGVhcmFuY2VVc2VyU2V0dGluZ3NUYWJfZm9udFNsaWRlcl9sYXJnZVRleHRcIj5BYTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxTZXR0aW5nc0ZsYWdcbiAgICAgICAgICAgICAgICBuYW1lPVwidXNlQ3VzdG9tRm9udFNpemVcIlxuICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuQUNDT1VOVH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGNoZWNrZWQpID0+IHRoaXMuc2V0U3RhdGUoe3VzZUN1c3RvbUZvbnRTaXplOiBjaGVja2VkfSl9XG4gICAgICAgICAgICAgICAgdXNlQ2hlY2tib3g9e3RydWV9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJGb250IHNpemVcIil9XG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dGhpcy5zdGF0ZS5mb250U2l6ZS50b1N0cmluZygpfVxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmZvbnRTaXplLnRvU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgaWQ9XCJmb250X3NpemVfZmllbGRcIlxuICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25WYWxpZGF0ZUZvbnRTaXplfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHRoaXMuc2V0U3RhdGUoe2ZvbnRTaXplOiB2YWx1ZS50YXJnZXQudmFsdWV9KX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUudXNlQ3VzdG9tRm9udFNpemV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfY3VzdG9tRm9udFNpemVGaWVsZFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJBZHZhbmNlZFNlY3Rpb24oKSB7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuQWR2YW5jZWRTZXR0aW5ncykpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICBjb25zdCB0b2dnbGUgPSA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BcHBlYXJhbmNlVXNlclNldHRpbmdzVGFiX0FkdmFuY2VkVG9nZ2xlXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuc2V0U3RhdGUoe3Nob3dBZHZhbmNlZDogIXRoaXMuc3RhdGUuc2hvd0FkdmFuY2VkfSl9XG4gICAgICAgID5cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLnNob3dBZHZhbmNlZCA/IF90KFwiSGlkZSBhZHZhbmNlZFwiKSA6IF90KFwiU2hvdyBhZHZhbmNlZFwiKX1cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIGxldCBhZHZhbmNlZDogUmVhY3QuUmVhY3ROb2RlO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dBZHZhbmNlZCkge1xuICAgICAgICAgICAgY29uc3QgdG9vbHRpcENvbnRlbnQgPSBfdChcbiAgICAgICAgICAgICAgICBcIlNldCB0aGUgbmFtZSBvZiBhIGZvbnQgaW5zdGFsbGVkIG9uIHlvdXIgc3lzdGVtICYgJShicmFuZClzIHdpbGwgYXR0ZW1wdCB0byB1c2UgaXQuXCIsXG4gICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGFkdmFuY2VkID0gPD5cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VDb21wYWN0TGF5b3V0XCJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgICAgIHVzZUNoZWNrYm94PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5sYXlvdXQgPT0gTGF5b3V0LklSQ31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnN0YXRlLmxheW91dCA9PSBMYXlvdXQuSVJDfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2KSA9PiB0aGlzLm9uSVJDTGF5b3V0Q2hhbmdlKGV2LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkVuYWJsZSBleHBlcmltZW50YWwsIGNvbXBhY3QgSVJDIHN0eWxlIGxheW91dFwiKX1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuXG4gICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgICAgICBuYW1lPVwidXNlU3lzdGVtRm9udFwiXG4gICAgICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfVxuICAgICAgICAgICAgICAgICAgICB1c2VDaGVja2JveD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhjaGVja2VkKSA9PiB0aGlzLnNldFN0YXRlKHt1c2VTeXN0ZW1Gb250OiBjaGVja2VkfSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9zeXN0ZW1Gb250XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e1NldHRpbmdzU3RvcmUuZ2V0RGlzcGxheU5hbWUoXCJzeXN0ZW1Gb250XCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeXN0ZW1Gb250OiB2YWx1ZS50YXJnZXQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInN5c3RlbUZvbnRcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgdmFsdWUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENvbnRlbnQ9e3Rvb2x0aXBDb250ZW50fVxuICAgICAgICAgICAgICAgICAgICBmb3JjZVRvb2x0aXBWaXNpYmxlPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUudXNlU3lzdGVtRm9udH1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuc3lzdGVtRm9udH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYl9BZHZhbmNlZFwiPlxuICAgICAgICAgICAge3RvZ2dsZX1cbiAgICAgICAgICAgIHthZHZhbmNlZH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfQXBwZWFyYW5jZVVzZXJTZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIkN1c3RvbWlzZSB5b3VyIGFwcGVhcmFuY2VcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9TdWJIZWFkaW5nXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkFwcGVhcmFuY2UgU2V0dGluZ3Mgb25seSBhZmZlY3QgdGhpcyAlKGJyYW5kKXMgc2Vzc2lvbi5cIiwgeyBicmFuZCB9KX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJUaGVtZVNlY3Rpb24oKX1cbiAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJGb250U2VjdGlvbigpfVxuICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckFkdmFuY2VkU2VjdGlvbigpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19