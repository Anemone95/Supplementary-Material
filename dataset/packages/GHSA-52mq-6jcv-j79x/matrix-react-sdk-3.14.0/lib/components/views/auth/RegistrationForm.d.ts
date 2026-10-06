import React from 'react';
import { ValidatedServerConfig } from "../../../utils/AutoDiscoveryUtils";
declare enum RegistrationField {
    Email = "field_email",
    PhoneNumber = "field_phone_number",
    Username = "field_username",
    Password = "field_password",
    PasswordConfirm = "field_password_confirm"
}
interface IProps {
    defaultEmail?: string;
    defaultPhoneCountry?: string;
    defaultPhoneNumber?: string;
    defaultUsername?: string;
    defaultPassword?: string;
    flows: {
        stages: string[];
    }[];
    serverConfig: ValidatedServerConfig;
    canSubmit?: boolean;
    onRegisterClick(params: {
        username: string;
        password: string;
        email?: string;
        phoneCountry?: string;
        phoneNumber?: string;
    }): Promise<void>;
    onEditServerDetailsClick?(): void;
}
interface IState {
    fieldValid: Partial<Record<RegistrationField, boolean>>;
    phoneCountry: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    passwordConfirm: string;
    passwordComplexity?: number;
}
export default class RegistrationForm extends React.PureComponent<IProps, IState> {
    static defaultProps: {
        onValidationChange: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        canSubmit: boolean;
    };
    constructor(props: any);
    private onSubmit;
    private doSubmit;
    private verifyFieldsBeforeSubmit;
    /**
     * @returns {boolean} true if all fields were valid last time they were validated.
     */
    private allFieldsValid;
    private findFirstInvalidField;
    private markFieldValid;
    private onEmailChange;
    private onEmailValidate;
    private validateEmailRules;
    private onPasswordChange;
    private onPasswordValidate;
    private onPasswordConfirmChange;
    private onPasswordConfirmValidate;
    private validatePasswordConfirmRules;
    private onPhoneCountryChange;
    private onPhoneNumberChange;
    private onPhoneNumberValidate;
    private validatePhoneNumberRules;
    private onUsernameChange;
    private onUsernameValidate;
    private validateUsernameRules;
    /**
     * A step is required if all flows include that step.
     *
     * @param {string} step A stage name to check
     * @returns {boolean} Whether it is required
     */
    private authStepIsRequired;
    /**
     * A step is used if any flows include that step.
     *
     * @param {string} step A stage name to check
     * @returns {boolean} Whether it is used
     */
    private authStepIsUsed;
    private showEmail;
    private showPhoneNumber;
    private renderEmail;
    private renderPassword;
    renderPasswordConfirm(): JSX.Element;
    renderPhoneNumber(): JSX.Element;
    renderUsername(): JSX.Element;
    render(): JSX.Element;
}
export {};
