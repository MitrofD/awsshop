// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import { tt } from '../components/TranslateElement';

type Props = {
  type?: string,
  verificationCode: string,
};

type State = {};

const defaultProps = {
  type: null,
};

class ReactivateAccount extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  unmounted: boolean;

  constructor(props: Props, context: void) {
    super(props, context);
    this.unmounted = true;

    // binds...
    const self: any = this;
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    console.log(this);
    console.log(form);
  }

  render() {
    let title = 'reactivateAccount';

    if (this.props.type) {
      title += Tools.capitalize(this.props.type);
    }

    return (
      <div className="ReactivateAccount center-layout">
        <div className="main">
          <div className="sticky-title">{tt(title)}</div>
          <div className="content">
            Reset security for
            {' '}
            {this.props.type}
            {' '}
            {this.props.verificationCode}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ReactivateAccount);
