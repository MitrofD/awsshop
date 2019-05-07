// @flow
import React from 'react';

type InputElement = 'input' | 'textarea';
type InputElementProps = Object;

const trnsltrCN = 'tt';
const trnsltrId = 't_';
const trnsltrInputrCN = 'tt-inpt';
const trnsltrIdLength = trnsltrId.length;
let TRANSLATION_DATA = {};

const getText = (key: string): string => TRANSLATION_DATA[key] || key;

const spanWithKeyAndClass = (key: string, className: string): React$Node => {
  const text = getText(key);

  return (
    <span
      id={trnsltrId + key}
      className={className}
    >
      {text}
    </span>
  );
};

const reactElWithKeyAndClass = (props: InputElementProps, className: string, type: InputElement): React$Element<any> => {
  const objCopy: { [string]: any } = Object.assign({}, props);
  const key = objCopy.placeholder;

  if (key) {
    let rCN = className;

    if (objCopy.className) {
      rCN += ` ${objCopy.className}`;
    }

    objCopy['data-tt'] = trnsltrId + key;
    objCopy.className = rCN;
    objCopy.placeholder = getText(key);
  }

  return React.createElement(type, objCopy, objCopy.children);
};

const apply = (newData: any) => {
  TRANSLATION_DATA = Object.prototype.toString.call(newData) === '[object Object]' ? newData : {};

  // single elements
  const trnsltEls = document.getElementsByClassName(trnsltrCN);
  const trnsltElsLength = trnsltEls.length;
  let i = 0;

  for (; i < trnsltElsLength; i += 1) {
    const el = trnsltEls[i];
    const key = el.id.slice(trnsltrIdLength);
    el.innerText = getText(key);
  }

  // elements with placeholder
  const trnsltPlchldrEls = document.getElementsByClassName(trnsltrInputrCN);
  const trnsltPlchldrElsLength = trnsltPlchldrEls.length;
  i = 0;

  for (; i < trnsltPlchldrElsLength; i += 1) {
    const el: { [string]: any } = trnsltPlchldrEls[i];
    const key = el.dataset.tt.slice(trnsltrIdLength);
    el.placeholder = getText(key);
  }
};

const tt = (key: string): React$Node => spanWithKeyAndClass(key, trnsltrCN);
const TTInput = (props: InputElementProps) => reactElWithKeyAndClass(props, trnsltrInputrCN, 'input');
const TTTextarea = (props: InputElementProps) => reactElWithKeyAndClass(props, trnsltrInputrCN, 'textarea');

export {
  apply,
  getText,
  tt,
  TTInput,
  TTTextarea,
};
