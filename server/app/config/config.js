// @flow
const {
  URL,
  SUPPORT_EMAIL,
} = process.env;

let urlAddress = URL;

const inConfigText = 'in config file';

if (!urlAddress && isDevMode) {
  urlAddress = `localhost:${Port - 1}`;
} else if (!urlAddress) {
  throw new Error(`Url option is required. (URL ${inConfigText})`);
}

const exampleUrl = 'exchange.com';
const defProtocol = 'http://';
const urlMatches = urlAddress.match(Tools.urlRegExp);

if (!urlMatches) {
  throw new Error(`Url option is incorrect.Example: ${defProtocol + exampleUrl} (URL ${inConfigText})`);
}

const supportEmail = typeof SUPPORT_EMAIL === 'string' ? SUPPORT_EMAIL.trim() : '';

if (supportEmail.length === 0) {
  throw new Error(`Support email option is required. (SUPPORT_EMAIL ${inConfigText})`);
} else if (!Tools.emailRegExp.test(supportEmail)) {
  throw new Error(`Support email option is incorrect.Example: support@${exampleUrl} (SUPPORT_EMAIL ${inConfigText})`);
}

let [
  ,
  protocol,
  domain,
  port,
] = urlMatches;

if (!protocol) {
  protocol = defProtocol;
}

let name = domain;
let secure = false;
let pureDomain = domain;
let wssProtocol = 'ws';

if (protocol === 'https://') {
  wssProtocol += 's';
  secure = true;
}

wssProtocol += '://';

if (Tools.domainRegExp.test(domain)) {
  const sep = '.';
  const domainParts = domain.split(sep);
  const pureDomainParts = domainParts.slice(-2);
  pureDomain = pureDomainParts.join(sep);
  name = pureDomainParts[0];
}

Config = {
  protocol,
  supportEmail,
  port,
  wssProtocol,
  domain: pureDomain,
  isSecure: secure,
  name: Tools.capitalize(name),
  url: protocol + domain + port,
};
