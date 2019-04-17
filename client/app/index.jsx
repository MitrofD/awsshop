// @flow
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import FadingCircleSpin from './components/spins/FadingCircleSpin';
import ItemsStack from './components/ItemsStack';
import ToastDanger from './components/toasts/ToastDanger';
import ToastSuccess from './components/toasts/ToastSuccess';
import Modal from './components/Modal';
import ConfirmModal from './components/ConfirmModal';
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

  window.RootNode = (function genRootNode() {
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

  window.NotificationBox = (function configNotificationBox() {
    type itemsStackRefType = React$Element<typeof ItemsStack>;
    let itemsStackRef: ItemsStack;

    const notificationBoxEl = document.createElement('div');
    notificationBoxEl.className = 'ntfctns';
    rBody.appendChild(notificationBoxEl);

    const setItemsStackRef = (el: any) => {
      if (el) {
        itemsStackRef = el;
      }
    };

    render(<ItemsStack ref={setItemsStackRef} />, notificationBoxEl);

    return {
      danger(message: string, replace: boolean = false) {
        const toast = <ToastDanger>{message}</ToastDanger>;
        itemsStackRef.add(toast, {
          replace,
        });
      },

      success(message: string, replace: boolean = false) {
        const toast = <ToastSuccess>{message}</ToastSuccess>;
        itemsStackRef.add(toast, {
          replace,
        });
      },
    };
  }());

  window.showConfirmModal = (function makeConfirmModal() {
    const name = 'cnfrmMdl';

    return (content: React$Node, func: Function) => {
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

  const startupDone = (error?: Error) => {
    unmountComponentAtNode(rootNode);

    if (error) {
      console.error(error);
      NotificationBox.danger(error.message);
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
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    ), rootNode);
  };

  // eslint-disable-next-line global-require
  const startupPromise = require('./startup').default;

  startupPromise.then(() => {
    startupDone();
  }).catch(startupDone);
}
