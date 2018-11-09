// @flow
const redis = require('redis');

type SubscribeHandler = {
  stop: Function
};

const clientPrototype = redis.RedisClient.prototype;

clientPrototype.CONNECT_SUBS = {};
clientPrototype.DISCONNECT_SUBS = {};
clientPrototype.IS_CONNECTED = false;

clientPrototype.connectSubscribe = function connectSubscribe(func: Function): SubscribeHandler {
  const self = this;
  const keyName = `cnnct_${Date.now()}`;
  self.CONNECT_SUBS[keyName] = func;

  return {
    stop() {
      delete self.CONNECT_SUBS[keyName];
    },
  };
};

clientPrototype.disconnectSubscribe = function disconnectSubscribe(func: Function): SubscribeHandler {
  const self = this;
  const keyName = `dscnnct_${Date.now()}`;
  self.DISCONNECT_SUBS[keyName] = func;

  return {
    stop() {
      delete self.DISCONNECT_SUBS[keyName];
    },
  };
};

clientPrototype.errorHandler = () => {};

const oldOnConnectHandle = clientPrototype.on_connect;

clientPrototype.on_connect = function onConnect() {
  this.IS_CONNECTED = true;

  Object.values(this.CONNECT_SUBS).forEach((func) => {
    if (typeof func === 'function') {
      func();
    }
  });

  oldOnConnectHandle.call(this);
};

const oldConnectionGoneHandle = clientPrototype.connection_gone;

clientPrototype.connection_gone = function connectionGone(why, error) {
  if (this.IS_CONNECTED) {
    Object.values(this.DISCONNECT_SUBS).forEach((func) => {
      if (typeof func === 'function') {
        func();
      }
    });
  }

  this.IS_CONNECTED = false;
  oldConnectionGoneHandle.call(this, why, error);
};

// as session store
clientPrototype.genSessionStore = function genSessionStore() {
  const MS_IN_DAY = 86400000;
  const self = this;
  const sessKeyPrefix = 'sess:';
  const sessLastActionList = 'sessupd';

  return {
    async add(sessId: string, initData: Object): Promise<boolean> {
      if (!self.IS_CONNECTED) {
        return false;
      }

      const sKey = sessKeyPrefix + sessId;
      const jsonStr = JSON.stringify(initData);
      const time = Date.now();

      return new Promise((resolve) => {
        self.multi([
          ['set', sKey, jsonStr],
          ['zadd', sessLastActionList, time, sKey],
        ]).exec((err) => {
          resolve(!err);
        });
      });
    },

    async get(sessId: string): Promise<?Object> {
      let rData: ?Object = null;

      if (!self.IS_CONNECTED) {
        return rData;
      }

      return new Promise((resolve) => {
        self.get(sessKeyPrefix + sessId, (error, reply) => {
          try {
            rData = JSON.parse(reply);
          } catch (parseError) {
            rData = null;
          }

          resolve(rData);
        });
      });
    },

    async remove(sessId: string): Promise<boolean> {
      if (!self.IS_CONNECTED) {
        return false;
      }

      const needKey = sessKeyPrefix + sessId;

      return new Promise((resolve) => {
        self.del(needKey, (error) => {
          resolve(!error);
        });
      });
    },

    async removeOlderThan(inDays: number): Promise<boolean> {
      if (!self.IS_CONNECTED) {
        return false;
      }

      const msDuration = inDays * MS_IN_DAY;
      const startTime = Date.now() - msDuration;

      return new Promise((resolve) => {
        const zRangeAttr = [sessLastActionList, '-inf', startTime];

        self.zrangebyscore(zRangeAttr, (getErr, response) => {
          const needRemoveKeys = Array.isArray(response) ? response : [];
          self.zremrangebyscore(zRangeAttr, () => {});
          needRemoveKeys.forEach(self.del);
          resolve(!getErr);
        });
      });
    },

    async set(sessId: string, data: Object): Promise<boolean> {
      if (!self.IS_CONNECTED) {
        return false;
      }

      const sKey = sessKeyPrefix + sessId;
      const jsonStr = JSON.stringify(data);

      return new Promise((resolve) => {
        self.set(sKey, jsonStr, (err) => {
          resolve(!err);
        });
      });
    },
  };
};

module.exports = redis;
