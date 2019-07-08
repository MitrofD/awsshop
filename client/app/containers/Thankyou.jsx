// @flow
import React from 'react';
import axios from 'axios';
import Page from './includes/Page';
import XHRSpin from './includes/XHRSpin';
import solidpayments from '../api/solidpayments';

type Props = Object;

type State = Object;

class Thankyou extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      response: null,
      error: null,
    };

    const self: any = this;
  }

  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    const id = query.get('id') || '';

    if (!id) {
      this.setState({
        error: 'Id is empty',
      });
    }

    solidpayments.getOrderInfo(id).then((response) => {
      this.setState({
        response,
      });
    }).catch((error) => {
      this.setState({
        error,
      });
    });
  }

  render() {
    let content = null;
    const { response, error } = this.state;

    if (response) {
      content = (
        <div className="row">
          {response.result.description}
        </div>
      );
    } else if (error) {
      content = (
        <div>{error.message}</div>
      );
    } else {
      content = <XHRSpin />;
    }

    return (
      <Page className="ProductPage sp">
        {content}
      </Page>
    );
  }
}

export default Thankyou;
