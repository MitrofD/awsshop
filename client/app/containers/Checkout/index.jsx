// @flow
import React, { Fragment } from 'react';
import { hot } from 'react-hot-loader/root';
import countryList from 'react-select-country-list';
import Solidpayments from './Solidpayments';
import Item from './Item';
import Page from '../includes/Page';
import NoHaveLabel from '../includes/NoHaveLabel';
import { tt } from '../../components/TranslateElement';
import { InvalidLabel } from '../../components/Label';
import carts from '../../api/carts';

type Props = {};

type State = Object;

type CartsInfo = {
  quantity: number,
  items: Object[],
  summ: number,
  placed?: boolean,
  error?: Object,
};

const isChangedVal = (val: any) => typeof val === 'string';

class Checkout extends React.Component<Props, State> {
  input: Object = {
    firstname: null,
    lastname: null,
    email: null,
    country: null,
    city: null,
    stateP: null,
    address: null,
    apartment: null,
    zip: null,
  };

  placeholders: Object = {
    firstname: 'first name',
    lastname: 'last name',
    email: 'e-mail address',
    city: 'town / city',
    stateP: 'state / country',
    address: 'house number and street name',
    apartment: 'apartment, suite, unit.',
    zip: 'postcode / ZIP',
  };

  unmounted = true;

  infoSubs: ?SubscribeHandler = null;

  constructor(props: Props, context: null) {
    super(props, context);
    const stateData: CartsInfo = carts.getInfo();

    stateData.placed = false;
    stateData.error = {};
    this.state = stateData;

    const self: any = this;
    self.onClickPlaceOrder = this.onClickPlaceOrder.bind(this);
    self.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    this.infoSubs = carts.subsToInfo((info) => {
      if (this.unmounted) {
        return;
      }

      this.setState(info);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.infoSubs) {
      this.infoSubs.stop();
      this.infoSubs = null;
    }
  }

  onClickPlaceOrder(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    this.setState({
      placed: true,
    });
  }

  handleChange(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const { name, value } = input;
    const pureVal = value.trim();
    let error: ?string = null;

    if (name !== 'apartment') {
      if (pureVal.length === 0) {
        error = 'The field is requered';
      } else if (name === 'email' && !Tools.emailRegExp.test(pureVal)) {
        error = 'Email is incorrect';
      }
    }

    this.input[name] = value;
    this.setState((state) => {
      const { ...newState } = state;
      if (error) {
        newState.error[name] = error;
      } else {
        delete newState.error[name];
      }

      return newState;
    });
  }

  /* eslint-disable no-param-reassign */
  convertErrors(errorLabels, inputCNs, name) {
    let inputsNotEmpty = true;
    const errorCNPrefix = ' is-invalid';

    if (isChangedVal(this.input[name])) {
      if (this.state.error[name]) {
        errorLabels[name] = <InvalidLabel>{this.state.error[name]}</InvalidLabel>;
        inputCNs[name] = errorCNPrefix;
      }
    } else {
      inputsNotEmpty = false;
    }
    return inputsNotEmpty;
  }
  /* eslint-enable no-param-reassign */

  render() {
    const { placeholders } = this;
    const {
      items,
      summ,
      placed,
      xhrRequest,
      error,
    } = this.state;
    let allInputsChanged = true;
    let itemsContent = null;
    const errorLabels = {};
    const inputCNs = {};

    const errorsCount = Object.keys(error).length;
    Object.keys(this.input).forEach((item) => {
      const inputsChangedTmp = this.convertErrors(errorLabels, inputCNs, item);
      allInputsChanged = !allInputsChanged ? allInputsChanged : inputsChangedTmp;
    });
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;

    if (items.length > 0) {
      itemsContent = (
        <div className="col-xl-8 offset-xl-2">
          <form
            noValidate
            onSubmit={this.onClickPlaceOrder}
          >
            <div className="page-title bm"><span>Checkout</span></div>
            <div className="checkout">
              <div className="row">
                {!placed && (
                  <div className="col-xl-6">
                    <div className="box-form addition">
                      <h6>Personal data</h6>
                      {
                        Object.keys(this.input).map((item) => {
                          let content = null;

                          if (item === 'country') {
                            content = (
                              <Fragment key={item}>
                                <h6>SHIPPING INFORMATION</h6>
                                <div className="form-group">
                                  <select name={item} className={`form-control ${inputCNs[item]}`} onChange={this.handleChange}>
                                    <option key="0" value="">Select Country</option>
                                    {countryList().getData().map(country => (
                                      <option key={country.value} value={country.value}>{country.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </Fragment>
                            );
                          } else {
                            content = (
                              <div key={item} className="form-group">
                                <input type="text" name={item} className={`form-control ${inputCNs[item]}`} placeholder={placeholders[item]} onChange={this.handleChange} />
                                {errorLabels[item]}
                              </div>
                            );
                          }

                          return content;
                        })
                      }
                    </div>
                  </div>
                )}
                <div className={placed ? 'col-xl-8 offset-xl-2' : 'col-xl-6'}>
                  <h6 className="adt">SHOPPING CART</h6>

                  <div className="table-border">
                    <div className="table-responsive">
                      <table className="table style-1">
                        <thead>
                          <tr>
                            <th colSpan="2">Product</th>
                            <th>QUANTITY</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <Item
                              {...item}
                              key={item._id}
                            />
                          ))}
                          <tr>
                            <td colSpan="2" className="text-left">
                              <strong>Shipping:</strong>
                            </td>
                            <td colSpan="2" className="text-right">Free shipping</td>
                          </tr>
                          <tr className="strong-total">
                            <td colSpan="2" className="text-left">
                              <strong>Total:</strong>
                            </td>
                            <td colSpan="2" className="text-right">
                              <strong className="total">{NumberFormat(summ)}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {!placed && (
                  <div className="col-xl-6 offset-xl-3 mb-4">
                    <button disabled={disabledSubmit} className="btn btn-block btn-success text-light" type="submit">PLACE ORDER</button>
                  </div>
                )}
              </div>
            </div>
          </form>
          {placed && (
            <Solidpayments
              inputs={this.input}
            />
          )}
        </div>
      );
    } else {
      itemsContent = <NoHaveLabel>{tt('Your shopping cart is empty')}</NoHaveLabel>;
    }

    return (
      <Page className="CheckoutPage">
        <div className="row">
          {itemsContent}
        </div>
      </Page>
    );
  }
}

export default hot(Checkout);
