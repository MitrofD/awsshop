// @flow
const event = 'scroll';
const documentElement: HTMLInputElement = (document.documentElement: any);

type ScrollData = {
  height: number,
  topPos: number,
};

const getScrollTop = (function genGetScrollTopFunc() {
  if (window.pageYOffset) {
    return () => window.pageYOffset();
  }

  return () => documentElement.scrollTop;
}());

const isFuncType = (mayBeFunc: any) => {
  if (typeof mayBeFunc !== 'function') {
    throw new Error('First attribute has to be "function" type');
  }
};

const windowScroll = {
  bind(func: (ScrollData) => void) {
    isFuncType(func);

    const pureFunc = () => {
      func({
        height: documentElement.clientHeight,
        topPos: getScrollTop(),
      });
    };

    window.addEventListener(event, pureFunc);
    return pureFunc;
  },

  unbind(func: Function) {
    isFuncType(func);
    window.removeEventListener(event, func);
  },
};

export default windowScroll;
