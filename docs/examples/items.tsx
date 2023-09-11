/* eslint no-console:0 */

import React from 'react';
import Menu from '../../src';
import '../../assets/index.less';

export default () => (
  <Menu
    selectable
    multiple
    triggerSubMenuAction='click'
    defaultOpenKeys={['sub1-1']}
    items={[
      {
        // MenuItem
        label: 'Top Menu Item',
        key: 'top',
      },
      {
        // SubMenu
        label: 'SubMenu',
        key: 'sub1',
        children: [
          {
            // MenuItem
            label: 'Menu Item 1-1',
            key: 'inner11',
          },
          {
            // SubMenu
            label: 'SubMenu inner',
            key: 'sub1-1',
            children: [
              {
                // MenuItem
                label: 'Menu Item 111',
                key: 'inner1-1-1',
              },
            ],
          },
        ],
      },
    ]}
  />
);
