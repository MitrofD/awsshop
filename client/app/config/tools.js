// @flow
import tools from '../api/tools';

window.Tools = Object.assign({}, tools);

// eslint-disable-next-line no-console
Tools.emptyRejectExeption = isDevMode ? error => console.log(error.message) : () => {};
Tools.ethAdressRegExp = /^0x[a-fA-F0-9]{40}$/;

Tools.passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

Tools.getErrorsObj = (data: any): Object => {
  const errorKeyPrefix = 'Error';
  const pureObj = Tools.isObject(data) ? data : {};
  const retObj = {};

  const pureObjKeys = Object.keys(pureObj);

  pureObjKeys.forEach((key) => {
    const rKey = key + errorKeyPrefix;
    retObj[rKey] = pureObj[key];
  });

  return retObj;
};

Tools.googleTokenRegExp = /^\d{6}$/;

Tools.date = (date: Date): string => {
  const month = date.getMonth() + 1;
  const monthStr = `0${month}`;
  const dateStr = `0${date.getDate()}`;
  return `${date.getFullYear()}/${monthStr.slice(-2)}/${dateStr.slice(-2)}`;
};

Tools.time = (date: Date): string => {
  const hoursStr = `0${date.getHours()}`;
  const minutesStr = `0${date.getMinutes()}`;
  const secondsStr = `0${date.getSeconds()}`;
  return `${hoursStr.slice(-2)}:${minutesStr.slice(-2)}:${secondsStr.slice(-2)}`;
};

Tools.prettyTime = (isoStr: string): string => {
  const [date, time] = isoStr.split('T');
  const rTime = time.substr(0, 8);
  return `${date} ${rTime}`;
};

Tools.subUrl = (sub: string) => `${Config.protocol}${sub}.${Config.domain}${Config.port}`;
