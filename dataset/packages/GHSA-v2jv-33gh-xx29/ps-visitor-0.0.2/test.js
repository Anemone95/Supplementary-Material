/**
 * Created by Wisdom Kwan on 17/9/17
 */

"use strict";

const ps_visitor = require('./index');

ps_visitor.ps({
  // user: 'root',
  // cpu: '>1',
  // mem: '>5',
  command: '~SourceTree'
}, 'grep SourceTree').then((result) => {
  console.log(result);
});