import React from "react";
interface IDefinition<T extends string> {
    value: T;
    className?: string;
    disabled?: boolean;
    label: React.ReactChild;
    description?: React.ReactChild;
    checked?: boolean;
}
interface IProps<T extends string> {
    name: string;
    className?: string;
    definitions: IDefinition<T>[];
    value?: T;
    outlined?: boolean;
    onChange(newValue: T): void;
}
declare function StyledRadioGroup<T extends string>({ name, definitions, value, className, outlined, onChange }: IProps<T>): JSX.Element;
export default StyledRadioGroup;
