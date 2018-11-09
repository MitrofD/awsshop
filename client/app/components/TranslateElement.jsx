// @flow
import React from 'react';

type InputElement = 'input' | 'textarea';
type InputElementProps = Object;

const trnsltrCN = 'tt';
const trnsltrId = 't_';
const trnsltrInputrCN = 'tt-inpt';
const trnsltrIdLength = trnsltrId.length;
let TRANSLATION_DATA = {};

const getTextForKey = (key: string): string => TRANSLATION_DATA[key] || key;

const spanWithKeyAndClass = (key: string, className: string): React$Node => {
  const text = getTextForKey(key);

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
    objCopy.placeholder = getTextForKey(key);
  }

  return React.createElement(type, objCopy, objCopy.children);
};

const apply = (newData: any) => {
  TRANSLATION_DATA = Object.prototype.toString.call(newData) === '[object Object]' ? newData : {};

  // single elements
  const trnsltEls = document.getElementsByClassName(trnsltrCN);

  for (let i = 0; i < trnsltEls.length; i += 1) {
    const el = trnsltEls[i];
    const key = el.id.slice(trnsltrIdLength);
    el.innerText = getTextForKey(key);
  }

  // elements with placeholder
  const trnsltPlchldrEls = document.getElementsByClassName(trnsltrInputrCN);

  for (let i = 0; i < trnsltPlchldrEls.length; i += 1) {
    const el: { [string]: any } = trnsltPlchldrEls[i];
    const key = el.dataset.tt.slice(trnsltrIdLength);
    el.placeholder = getTextForKey(key);
  }
};

const tt = (key: string): React$Node => spanWithKeyAndClass(key, trnsltrCN);
const TTInput = (props: InputElementProps) => reactElWithKeyAndClass(props, trnsltrInputrCN, 'input');
const TTTextarea = (props: InputElementProps) => reactElWithKeyAndClass(props, trnsltrInputrCN, 'textarea');

export {
  apply,
  tt,
  TTInput,
  TTTextarea,
};
