// @flow
import React from 'react';
import { tt } from '../../components/TranslateElement';

const PluginButton = () => (
  <a
    className="btn btn-plugin btn-block"
    href="https://chrome.google.com/webstore/detail/awesome-shop/lamneomcjgfjkmgijffligcpmfhgmnbm"
    target="_blank"
    rel="noopener noreferrer"
  >
    {tt('Import products plugin')}
  </a>
);

export default PluginButton;
