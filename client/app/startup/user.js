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
    const cookieRegExp = new RegExp(`${Config.csrfCookieName}=(\\w+)`);
    const cookieMatches = document.cookie.match(cookieRegExp);

    if (cookieMatches) {
      const csrfToken = cookieMatches[1];
      axios.defaults.headers.common[Config.csrfCookieName] = csrfToken;
    }
  } else {
    RootNode.removeClass(classNameKey);
    delete axios.defaults.headers.common[Config.csrfCookieName];
  }
};

configUserPromise.then(() => {
  const currUser = user.get();
  applyUser(currUser);
  user.subscribe(applyUser);
}).catch(Tools.emptyRejectExeption);

export default configUserPromise;
