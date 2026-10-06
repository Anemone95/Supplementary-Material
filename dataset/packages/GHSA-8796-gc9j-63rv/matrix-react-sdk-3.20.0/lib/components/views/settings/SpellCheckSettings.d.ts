import React from 'react';
interface ExistingSpellCheckLanguageIProps {
    language: string;
    onRemoved(language: string): any;
}
interface SpellCheckLanguagesIProps {
    languages: Array<string>;
    onLanguagesChange(languages: Array<string>): any;
}
interface SpellCheckLanguagesIState {
    newLanguage: string;
}
export declare class ExistingSpellCheckLanguage extends React.Component<ExistingSpellCheckLanguageIProps> {
    _onRemove: (e: any) => any;
    render(): JSX.Element;
}
export default class SpellCheckLanguages extends React.Component<SpellCheckLanguagesIProps, SpellCheckLanguagesIState> {
    constructor(props: any);
    _onRemoved: (language: any) => void;
    _onAddClick: (e: any) => void;
    _onNewLanguageChange: (language: string) => void;
    render(): JSX.Element;
}
export {};
