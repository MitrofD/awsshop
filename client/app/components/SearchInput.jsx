// @flow
import React from 'react';
import { TTInput } from './TranslateElement';

type Props = {
  onChange: Function,
  delay: number,
  exact: boolean,
};

const defaultProps = {
  delay: 300,
  exact: false,
};

const strForRegExp = (val: string): string => val.replace(/[$[+*|()^?.\\/]/g, '\\$&');

class SearchInput extends React.PureComponent<Props> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: void) {
    super(props, context);
    this.timer = null;
    this.unmounted = true;

    // binds ...
    const self: any = this;
    self.onChangeValue = this.onChangeValue.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.setRegExpPrefix();
  }

  componentDidUpdate() {
    this.setRegExpPrefix();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopTimer();
  }

  onChangeValue(event: SyntheticEvent<HTMLInputElement>) {
    const inputValue = event.currentTarget.value.trim();
    this.stopTimer();

    this.timer = setTimeout(() => {
      const regexp = inputValue.length ? new RegExp(`${this.regExpPrefix}${strForRegExp(inputValue)}.*`, 'i') : null;
      this.props.onChange(regexp, inputValue);
    }, this.props.delay);
  }

  setRegExpPrefix() {
    this.regExpPrefix = this.props.exact ? '^' : '.*';
  }

  stopTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  timer: ?TimeoutID;

  regExpPrefix: string;

  unmounted: boolean;

  render() {
    const rProps: { [string]: any } = Object.assign({}, this.props);
    delete rProps.exact;
    delete rProps.delay;
    rProps.onChange = this.onChangeValue;

    return (
      <div className="SearchInput">
        <TTInput {...rProps} />
      </div>
    );
  }
}

SearchInput.defaultProps = defaultProps;

export default SearchInput;
