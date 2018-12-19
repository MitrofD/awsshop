// @flow
import React from 'react';

const getDefName = (function genDefName() {
  let idx = 0;
  return () => {
    idx += 1;
    return `num-inpt-${idx}`;
  };
}());

type Props = {
  disableDecimal?: boolean,
  min: ?number,
  max: ?number,
  name: string,
  onChange: ?Function,
};

const defaultProps = {
  disableDecimal: false,
  min: null,
  max: null,
  name: getDefName(),
};

class NumberInput extends React.PureComponent<Props> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: void) {
    super(props, context);
    this.unmounted = true;

    // binds ...
    const self: any = this;
    self.onKeyDownInput = this.onKeyDownInput.bind(this);
    self.onKeyUpInput = this.onKeyUpInput.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.applyProps();
  }

  componentDidUpdate() {
    this.applyProps();
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onKeyDownInput(event: SyntheticKeyboardEvent<HTMLInputElement>) {
    if (!this.availableKeyCodes.includes(event.keyCode)) {
      event.preventDefault();
    }
  }

  onKeyUpInput(event: SyntheticKeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const clearInput = input.value.trim();
    this.checkInputFunc(clearInput);
  }

  get value(): ?number {
    if (this.rValue) {
      return parseFloat(this.rValue);
    }

    return null;
  }

  set value(newValue: any) {
    let strVal = '';

    if (typeof newValue === 'string') {
      strVal = newValue;
    } else if (typeof newValue === 'number') {
      strVal = newValue.toString();
    }

    this.checkInputFunc(strVal);
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  setValueFunc(val: any) {}

  applyProps() {
    const {
      min,
      max,
      onChange,
      disableDecimal,
    } = this.props;

    this.availableKeyCodes = [8, 9, 13, 17, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 56, 57, 65, 67, 86, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
    const pName = 'val';
    const checkExtrems: Array<number> = [];
    const rMin = parseFloat(min);
    const rMax = parseFloat(max);

    if (this.input) {
      this.rValue = this.input.value;
    }

    let funcBody = 'var self = this;';
    funcBody += `var newValue = parseFloat(${pName});`;
    funcBody += `self.input.value = ${pName};`;
    funcBody += 'if (!isNaN(newValue)) {';

    if (!Number.isNaN(rMin)) {
      funcBody += `if (newValue < ${rMin}) {`;
      funcBody += `newValue = ${rMin};`;
      funcBody += `self.input.value = '${rMin}';`;
      funcBody += '}';
      checkExtrems.push(rMin);
    }

    if (!Number.isNaN(rMax)) {
      funcBody += `if (newValue > ${rMax}) {`;
      funcBody += `newValue = ${rMax};`;
      funcBody += `self.input.value = '${rMax}';`;
      funcBody += '}';
      checkExtrems.push(rMax);
    }

    funcBody += '} else {';
    funcBody += 'newValue = null;';
    funcBody += '}';
    funcBody += 'if (self.rValue !== newValue) {';
    funcBody += 'self.rValue = newValue;';

    if (typeof onChange === 'function') {
      funcBody += 'onChange(self.input, newValue);';
    }

    funcBody += '}';
    eval(`this.setValueFunc = function (${pName}) { ${funcBody} };`);

    if (checkExtrems.length === 2 && rMax < rMin) {
      throw new Error('Max value can not be great then min value');
    }

    let regExpStr = '\\d+';

    if (!disableDecimal) {
      this.availableKeyCodes.push(190, 110);
      regExpStr += '\\.?';
    }

    regExpStr += '\\d*';

    if (checkExtrems.length === 0 || (checkExtrems.some(extr => extr < 0))) {
      regExpStr = `-?${regExpStr}|-`;
      this.availableKeyCodes.push(189);
    }

    funcBody = `var results = ${pName}.match(/${regExpStr}/);`;
    funcBody += 'if (results !== null) {';
    funcBody += 'this.setValueFunc(results[0]);';
    funcBody += '} else {';
    funcBody += 'this.setValueFunc(null);';
    funcBody += '}';
    eval(`this.checkInputFunc = function (${pName}) { ${funcBody} }`);
    // this.checkInputFunc(String(this.rValue || ''));
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  checkInputFunc(val: any) {}

  availableKeyCodes: number[];
  input: ?HTMLInputElement;
  rValue: string;
  unmounted: boolean;

  render() {
    const propsCopy: { [string]: any } = { ...this.props };
    delete propsCopy.disableDecimal;
    delete propsCopy.onChange;

    return (
      <input
        {...propsCopy}
        className="NumberInput"
        type="text"
        onKeyUp={this.onKeyUpInput}
        onKeyDown={this.onKeyDownInput}
        autoComplete="off"
        ref={
          (el) => {
            this.input = el;
          }
        }
      />
    );
  }
}

export default NumberInput;
