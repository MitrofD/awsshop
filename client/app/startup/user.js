// @flow
import axios from 'axios';
import user from '../api/user';

const configUserPromise = user.config();

const applyUser = (userData: ?Object) => {
  const classNameKey = 'usr';
  let className = 'athrzd';

  if (userData) {
    if (userData.isAdmin) {
      className += ' admn';
    }

    RootNode.addClass(className, classNameKey);
  } else {
    RootNode.removeClass(classNameKey);
  }
};

configUserPromise.then(() => {
  const currUser = user.get();
  applyUser(currUser);
  user.subscribe(applyUser);
}).catch(Tools.emptyRejectExeption);

module.exports = configUserPromise;
