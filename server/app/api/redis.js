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
  const keys = Object.keys(this.CONNECT_SUBS);
  const keysLength = keys.length;
  let i = 0;

  for (; i < keysLength; i += 1) {
    const key = keys[i];
    this.CONNECT_SUBS[key]();
  }

  oldOnConnectHandle.call(this);
};

const oldConnectionGoneHandle = clientPrototype.connection_gone;

clientPrototype.connection_gone = function connectionGone(why, error) {
  if (this.IS_CONNECTED) {
    const keys = Object.keys(this.DISCONNECT_SUBS);
    const keysLength = keys.length;
    let i = 0;

    for (; i < keysLength; i += 1) {
      const key = keys[i];
      this.DISCONNECT_SUBS[key]();
    }
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
          [
            'set',
            sKey,
            jsonStr,
          ], [
            'zadd',
            sessLastActionList,
            time,
            sKey,
          ],
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
        const zRangeAttr = [
          sessLastActionList,
          '-inf',
          startTime,
        ];

        self.zrangebyscore(zRangeAttr, (getErr, response) => {
          self.zremrangebyscore(zRangeAttr, () => {});
          const needRemoveKeys = Array.isArray(response) ? response : [];
          const needRemoveKeysLength = needRemoveKeys.length;
          let i = 0;

          for (; i < needRemoveKeysLength; i += 1) {
            const key = needRemoveKeys[i];
            self.del(key);
          }

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
