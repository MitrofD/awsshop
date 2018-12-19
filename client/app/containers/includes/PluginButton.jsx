// @flow
import React from 'react';
import { tt } from '../../components/TranslateElement';

const PluginButton = () => (
  <a
    className="btn btn-plugin btn-block animated pulse"
    href="https://chrome.google.com/webstore/detail/ethshop/eaaknhgngdkijkmikajjeajmojmbmflg"
    target="_blank"
    rel="noopener noreferrer"
  >
    {tt('Import products plugin')}
  </a>
);

export default PluginButton;
