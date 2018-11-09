// @flow
import React from 'react';
import { tt } from '../../components/TranslateElement';

const PluginButton = () => (
  <a
    href="#!"
    className="btn btn-plugin btn-block"
  >
    {tt('Import products plugin')}
  </a>
);

export default PluginButton;
