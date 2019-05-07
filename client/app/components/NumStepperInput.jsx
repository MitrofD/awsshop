// @flow
/*
import React, { useState } from 'react';
import NumberInput from './NumberInput';

type Props = Object & {
  step?: ?number,
};

const defaultProps = {
  step: 1,
};

const getPureStep = (mbStep: any) => {
  const numVal = parseFloat(mbStep);

  if (Number.isNaN(numVal)) {
    throw new Error('Attribute step has to be number type');
  }

  if (numVal === 0) {
    throw new Error('Attribute step can\'t be 0');
  }

  return numVal;
};

class NumStepperInput extends React.PureComponent<Props> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    const self: any = this;
    self.onClickPrevStepButton = this.onClickPrevStepButton.bind(this);
    self.onClickNextStepButton = this.onClickNextStepButton.bind(this);
    self.onRefNumInput = this.onRefNumInput.bind(this);
  }

  onClickPrevStepButton() {
    this.makeStep(false);
  }

  onClickNextStepButton() {
    this.makeStep(true);
  }

  onRefNumInput(mbNumInput: ?NumberInput) {
    if (mbNumInput) {
      this.numInput = mbNumInput;
    }
  }

  makeStep(asNext: boolean) {
    let step = getPureStep(this.props.step);

    if (!asNext) {
      step *= -1;
    }

    const inputVal = this.numInput.getValue();
    let pureVal = parseFloat(inputVal);

    if (Number.isNaN(pureVal)) {
      pureVal = typeof this.numInput.min === 'number' ? this.numInput.min : step;
    } else {
      pureVal += step;
    }

    this.numInput.setValue(pureVal);
  }

  numInput: NumberInput;

  render() {
    const propsCopy = Object.assign({}, this.props);
    delete propsCopy.step;

    return (
      <div className="NumStepperInput">
        <button
          type="button"
          onClick={this.onClickPrevStepButton}
        >
          -
        </button>
        <NumberInput
          {...propsCopy}
          ref={this.onRefNumInput}
        />
        <button
          type="button"
          onClick={this.onClickNextStepButton}
        >
          +
        </button>
      </div>
    );
  }
}

export default NumStepperInput;
*/
