// @flow
import React, { Fragment } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import FadingCircleSpin from './components/spins/FadingCircleSpin';
import ItemsStack from './components/ItemsStack';
import ToastDanger from './components/toasts/ToastDanger';
import Modal from './components/Modal';
import ConfirmModal from './components/ConfirmModal';
import translations from './api/translations';
import user from './api/user';
import './config';
import './images/favicon.ico';
import './main.scss';

window.asHOT = () => (Comp => Comp);

if (isDevMode) {
  // eslint-disable-next-line global-require
  window.asHOT = require('react-hot-loader').hot;
}

const rBody = document.body;

if (rBody) {
  const rootNode = document.createElement('div');
  rBody.appendChild(rootNode);

  const modalBox = document.createElement('div');
  rBody.appendChild(modalBox);

  window.RootNode = (function roonNodeGen() {
    let importantCN = 'cntnt';

    if (/iPhone|iPad|iPod|Android/.test(window.navigator.userAgent)) {
      importantCN += ' mbl';
    }

    const classesObj: { [string]: string } = {};

    const didChangedClassesObj = () => {
      const allClasses: string[] = (Object.values(classesObj): any);
      allClasses.push(importantCN);
      rootNode.className = allClasses.join(' ');
    };

    const retObj = {
      addClass(className: string, toKey?: string) {
        const pureOldKey = toKey || className;
        classesObj[pureOldKey] = className;
        didChangedClassesObj();
      },

      classExists: (className: string) => Tools.has.call(classesObj, className),

      set isInitMode(val: boolean) {
        const initModeCN = 'init-md';
        const methodName = val ? 'addClass' : 'removeClass';
        this[methodName](initModeCN);
      },

      toggleClass(className: string) {
        if (this.classExists(className)) {
          this.removeClass(className);
        } else {
          this.addClass(className);
        }
      },

      removeClass(className: string) {
        delete classesObj[className];
        didChangedClassesObj();
      },
    };

    return retObj;
  }());

  window.showAppError = (errorMessage: string) => {
    const itemsStack = ItemsStack.get(Enums.GLOB_ITEMS_STACK_NAME);
    const toast = <ToastDanger>{errorMessage}</ToastDanger>;
    itemsStack.add(toast);
  };

  window.showConfirmModal = (function makeConfirmModal() {
    const name = 'confirmModal';

    return (content: React.DOM, func: Function) => {
      const rConfirm = () => {
        unmountComponentAtNode(modalBox);
        func();
      };

      render((
        <ConfirmModal
          name={name}
          onConfirm={rConfirm}
        >
          {content}
        </ConfirmModal>
      ), modalBox, () => {
        Modal.open(name);
      });
    };
  }());

  render(<FadingCircleSpin />, rootNode);

  const startupDone = (error?: Error): void => {
    unmountComponentAtNode(rootNode);

    if (error) {
      // eslint-disable-next-line no-alert
      alert(error.message);
      return;
    }

    /* eslint-disable */
    const Tawk_API = Tawk_API || {};
    const Tawk_LoadStart = new Date();

    (function(){
      var script = document.createElement('script');
      const firstScript = document.getElementsByTagName('script')[0];
      script.async = true;
      script.src = 'https://embed.tawk.to/5bce86d3476c2f239ff58eb0/default';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      firstScript.parentNode.insertBefore(script, firstScript);
    })();
    /* eslint-enable */

    // eslint-disable-next-line global-require
    const Routes = require('./containers/Routes').default;

    render((
      <Fragment>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
        <div className="ntfctns">
          <ItemsStack name={Enums.GLOB_ITEMS_STACK_NAME} />
        </div>
      </Fragment>
    ), rootNode);
  };

  // eslint-disable-next-line global-require
  const startupPromise = require('./startup');

  startupPromise.then(() => {
    startupDone();
  }).catch(startupDone);
}
