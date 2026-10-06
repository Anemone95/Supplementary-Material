[![Travis branch](https://img.shields.io/travis/Vincent-P/react-marked-markdown/master.svg?maxAge=2592000)]()
[![npm version](https://badge.fury.io/js/react-marked-markdown.svg)](https://badge.fury.io/js/react-marked-markdown)
[![npm](https://img.shields.io/npm/dt/react-marked-markdown.svg?maxAge=2592000)]()
# React Marked Markdown

A react components package that helps you use Markdown easily.

---

Writing in Markdown is an amazing experience. Setting up all components and parser is kind of a pain.

## Basic Usage

* Install with `npm install --save react-marked-markdown`
* Import component(s) you want
```js
import {  MarkdownPreview  } from 'react-marked-markdown';
```

## MarkdownPreview

### Basic Markdown view

Display Markdown is really easy with **MarkdownPreview** component.

Here is a simple example :
```js
import React from 'react';

import { MarkdownPreview } from 'react-marked-markdown';

const Post = ({ post }) => (
  <div>
    <h1>{ post.title }</h1>
    <MarkdownPreview value={ post.content }/>
  </div>
);

export default Post;

```

### Options

Behind the scenes, **react-marked-markdown** uses **marked** as Markdown parser.
So all **marked** options are available here.

Here is an example with default options :

```js
<MarkdownPreview
  value="# Hey !"
  markedOptions={{
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
   }} />
```

A list of options can be found [here](https://github.com/chjj/marked#options-1).

### Syntax highlighting

**react-marked-markdown** supports syntax highlighting with [highlight.js](https://highlightjs.org)

## CSS Classes

All **react-marked-markdown** components are unstyled, meaning that you can style them as you want like every others React elements.

```js
<MarkdownPreview className="ui post content" value="#Hey !" />
```

## LiveMarkdownTextarea

LiveMarkdownTextarea allows you to write Markdown in a textarea and see a preview of what you are writing.


```js
<LiveMarkdownTextarea
  placeholder="Enter your comment here."
  className="row"
  inputClassName="field column"
  previewClassName="column comment-preview"
/>
```

## Create your own Markdown Editor

You can even create your own Markdown Editor with **MarkdownPreview** and **MarkdownInput** components.

As an example here is the code of **LiveMarkdownTextarea** component.
Note that there is also a **clear()** method that we can call from parent component to clear the editor.


```js
class LiveMarkdownTextarea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue ? props.defaultValue : '',
    };
  }
  handleTextChange(e) {
    this.setState({ value: e.target.value });
    if (this.props.onTextChange) {
      this.props.onTextChange(e.target.value);
    }
  }
  clear() {
    this.setState({ value: '' });
  }
  render() {
    const {
      placeholder,
      className,
      inputClassName,
      previewClassName,
    } = this.props;
    const { value } = this.state;
    return (
      <section className={ className }>
        <MarkdownInput
          placeholder={ placeholder }
          onChange={ this.handleTextChange.bind(this) }
          value={ value }
          className={ inputClassName }
        />

        <MarkdownPreview
          value={ value }
          className={ previewClassName }
        />
      </section>
    );
  }
}
```