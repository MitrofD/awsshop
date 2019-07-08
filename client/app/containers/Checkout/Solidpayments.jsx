// @flow
import React from 'react';
import axios from 'axios';
import XHRSpin from '../includes/XHRSpin';
import solidpayments from '../../api/solidpayments';

type Props = Object;

type State = Object;

class Solidpayments extends React.Component<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      script: null,
      error: null,
    };
  }

  componentDidMount() {
    solidpayments.getCheckoutId(this.props.inputs).then((checkoutId) => {
      if (!checkoutId) {
        const error = new Error('Something went wrong');
        this.setState({
          error,
        });
      } else {
      /* eslint-disable */
        const script = document.createElement('script');
        const firstScript = document.getElementsByTagName('script')[0];
        script.async = true;
        script.src = `https://test.solidpayments.net/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        firstScript.parentNode.insertBefore(script, firstScript);
        this.setState({
          script: true,
        });
      }
      /* eslint-enable */
    }).catch((error) => {
      this.setState({
        error,
      });
    });
  }


  render() {
    let content = null;
    const { script, error } = this.state;

    if (script) {
      content = (
        <form action="http://localhost:3000/thankyouPage" className="paymentWidgets" data-brands="VISA MASTER" />
      );
    } else if (error) {
      content = (
        <div>{error.message}</div>
      );
    } else {
      content = <XHRSpin />;
    }

    return (
      <div className="Solidpayments">
        {content}
      </div>
    );
  }
}

export default Solidpayments;
