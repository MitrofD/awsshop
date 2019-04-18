// @flow
import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import Page from './includes/Page';
import AlertDanger from '../components/alerts/AlertDanger';
import { tt } from '../components/TranslateElement';
import orders from '../api/orders';

type Props = {
  code: string,
  history: Object,
};

type State = {
  alertDanger: ?React$Element<typeof AlertDanger>,
  dotsStr: string,
};

const DOT_STR = '.';
const DOTS_STR_MAX_LENGTH = 3;
const INIT_STATE = {
  alertDanger: null,
  dotsStr: DOT_STR,
};

const STEP_DELAY = 1000;

class OrdersCompleted extends React.PureComponent<Props, State> {
  stepIntervalID: ?IntervalID = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = INIT_STATE;

    const self: any = this;
    self.onClickTryAgainButton = this.onClickTryAgainButton.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.tryAgain();
  }

  componentWillUnmount() {
    this.stopStepIntervalID();
    this.unmounted = true;
  }

  onClickTryAgainButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    button.disabled = true;
    this.tryAgain();
  }

  stopStepIntervalID() {
    if (this.stepIntervalID) {
      clearInterval(this.stepIntervalID);
      this.stepIntervalID = null;
    }
  }

  tryAgain() {
    if (this.state.alertDanger) {
      this.setState(INIT_STATE);
    }

    this.stepIntervalID = setInterval(() => {
      this.setState((prevState) => {
        let currStr = prevState.dotsStr;
        currStr += DOT_STR;

        if (currStr.length > DOTS_STR_MAX_LENGTH) {
          currStr = DOT_STR;
        }

        return {
          dotsStr: currStr,
        };
      });
    }, STEP_DELAY);

    orders.apply(this.props.code).then(() => {
      NotificationBox.success('Operation has been successful');
      this.props.history.push('/shopping-cart');
    }).catch((error) => {
      if (this.unmounted) {
        return;
      }

      this.stopStepIntervalID();
      const alertDanger = <AlertDanger>{error.message}</AlertDanger>;
      this.setState({
        alertDanger,
      });
    });
  }

  render() {
    const {
      alertDanger,
      dotsStr,
    } = this.state;

    let content = null;

    if (alertDanger) {
      content = (
        <Fragment>
          {alertDanger}
          <button
            className="btn btn-primary"
            onClick={this.onClickTryAgainButton}
            type="button"
          >
            {tt('Try again')}
          </button>
        </Fragment>
      );
    } else {
      content = (
        <Fragment>
          {tt('Processing, please wait')}
          {' '}
          {dotsStr}
        </Fragment>
      );
    }

    return (
      <Page className="OrdersCompleted">
        {content}
      </Page>
    );
  }
}

export default asHOT(module)(withRouter(OrdersCompleted));
