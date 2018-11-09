// @flow
const cron = require('node-cron');
const crypto = require('crypto');
const cookies = require('./cookies');
const uuid = require('./uuid');

type SessionStore = {
  add(string, Object): Promise<boolean>;
  get(string): Promise<?Object>;
  remove(string): Promise<boolean>;
  removeOlderThan(number): Promise<boolean>;
  set(string, Object): Promise<boolean>;
};

const COOKIE_NAME = 'sessid';
const SALT = process.env.SESSION_SALT || '';

const newSessId = (): string => {
  const hash = crypto.createHash('sha1');
  return hash.update(uuid.v4() + SALT).digest('hex');
};

class SessionItem {
  id: string;
  isEdited: boolean;
  lData: Object;
  store: SessionStore;

  constructor(id: string, store: SessionStore, initData: Object) {
    this.isEdited = false;
    this.lData = initData;
    this.store = store;
    this.id = id;
  }

  get data(): Object {
    return Object.assign({}, this.lData);
  }

  set(field: string, value: ?any) {
    const oldData = this.lData[field];

    if (oldData !== value) {
      this.lData[field] = value;
      this.isEdited = true;
    }
  }

  unset(field: string) {
    if (this.lData[field]) {
      delete this.lData[field];
      this.isEdited = true;
    }
  }

  get(field: string): ?any {
    return this.lData[field];
  }

  apply(data: Object) {
    this.lData = Object.assign({}, data);
    this.isEdited = true;
  }

  reset(excluded?: string[]) {
    const nData = {};

    if (excluded) {
      excluded.forEach((item) => {
        const needVal = this.lData[item];

        if (needVal) {
          nData[item] = needVal;
        }
      });
    }

    this.lData = nData;
    this.isEdited = true;
  }

  synch() {
    if (!this.isEdited) {
      return;
    }

    this.store.set(this.id, this.lData);
  }
}

class Session {
  cookieOptions: Object;
  cookieName: string;
  cleanTask: ?Object;
  store: SessionStore;

  constructor(store: SessionStore, cookieOptions?: Object) {
    const pureCookieOptions = cookieOptions || {};
    const tmpCookieName = typeof pureCookieOptions.name === 'string' ? pureCookieOptions.name.trim() : '';
    const cookieName = tmpCookieName.length > 0 ? tmpCookieName : COOKIE_NAME;

    this.cookieName = cookieName;
    this.cookieOptions = pureCookieOptions;
    this.store = store;

    const tmpExpireDays = parseInt(pureCookieOptions.expireDays);
    const expireDays = Number.isNaN(tmpExpireDays) ? 3 : tmpExpireDays;

    this.cleanTask = cron.schedule('0 0 * * *', () => {
      this.store.removeOlderThan(expireDays);
    });
  }

  destroy() {
    if (typeof this.cleanTask === 'object' && this.cleanTask !== null) {
      this.cleanTask.destroy();
    }

    this.cleanTask = null;
  }

  async forRequest(req: Object, res: Object): Promise<void> {
    if (typeof req.session === 'object') {
      return;
    }

    const cookiesObj = cookies.parse(req.headers.cookie);
    const existsSessId = cookiesObj[this.cookieName];
    const storeData = await this.store.get(existsSessId);

    if (storeData) {
      req.session = new SessionItem(existsSessId, this.store, storeData);
    } else if (res.setHeader) {
      const sessId = newSessId();
      const cookiesStr = cookies.get(this.cookieName, sessId, this.cookieOptions);

      const initData = {};
      res.setHeader('Set-Cookie', cookiesStr);
      this.store.add(sessId, initData);
      req.session = new SessionItem(sessId, this.store, initData);
    }

    res.on('finish', () => {
      req.session.synch();
    });
  }
}

module.exports = Session;
