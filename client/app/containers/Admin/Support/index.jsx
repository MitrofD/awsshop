// @flow
import React, { useState } from 'react';
import Messages from './Messages';
import Subjects from './Subjects';
import { tt } from '../../../components/TranslateElement';

export default () => {
  const tabs = {
    Messages,
    Subjects,
  };

  const [
    currTab,
    setCurrTab,
  ] = useState('Messages');

  const onClickToTab = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    const tab = event.currentTarget;
    const tabVal = tab.dataset.tab;

    if (Tools.has.call(tabs, tabVal)) {
      setCurrTab(tabVal);
    }
  };

  const tabKeys = Object.keys(tabs);
  const Content = React.createElement(tabs[currTab]);

  return (
    <div className="Support">
      <ul className="nav nav-tabs">
        {tabKeys.map((key) => {
          let itemCN = 'nav-link';

          if (currTab === key) {
            itemCN += ' active';
          }

          return (
            <li
              className="nav-item"
              key={key}
            >
              <a
                className={itemCN}
                data-tab={key}
                href="#"
                onClick={onClickToTab}
              >
                {tt(key)}
              </a>
            </li>
          );
        })}
      </ul>
      <div className="tab-content">
        {Content}
      </div>
    </div>
  );
};
