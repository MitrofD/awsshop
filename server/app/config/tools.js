// @flow
const tools = require('../api/tools');

Tools = (tools: { [string]: any });

Tools.dateAsUTCString = (date: Date, separator: string = ' '): string => {
  const month = date.getUTCMonth() + 1;
  const dateStr = date.getUTCFullYear() + '-' + ('0' + month).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2);
  const timeStr = ('0' + date.getUTCHours()).slice(-2) + ':' + ('0' + date.getUTCMinutes()).slice(-2) + ':' + ('0' + date.getUTCSeconds()).slice(-2);
  return dateStr + separator + timeStr;
};

Tools.sendEmailError = new Error('Sending email error');

Tools.genUnknownError = (action: string): Error => (new Error(`Unknown error [${action}]`));

// eslint-disable-next-line no-console
Tools.emptyRejectExeption = isDevMode ? (error) => console.log(error.message) : () => {};

Tools.okObj = {
  ok: true,
};
