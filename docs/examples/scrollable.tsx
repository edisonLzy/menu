/* eslint no-console:0 */

import React from 'react';
import Menu, { Item as MenuItem } from 'rc-menu';

import '../../assets/index.less';

const children = [];
for (let i = 0; i < 20; i += 1) {

  children.push(<MenuItem
     key={String(i)}
     // disabled 的时候 li.rc-menu-item 不会有 tabIndex，因此其是不可以聚焦的
     disabled={i === 1}
     >{i}</MenuItem>);
}

const menuStyle = {
  width: 200,
  height: 200,
  overflow: 'auto',
};

export default () => (
  <div>
    <h2>keyboard scrollable menu</h2>
    <Menu style={menuStyle}>{children}</Menu>
  </div>
);
