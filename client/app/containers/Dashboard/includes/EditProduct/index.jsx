// @flow
import React from 'react';
import NumberInput from 'tl-react-numeric-input';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/skins/ui/oxide/skin.min.css';
import CategorySelect from './CategorySelect';
import XHRSpin from '../../../includes/XHRSpin';
import { InvalidLabel } from '../../../../components/Label';
import { tt } from '../../../../components/TranslateElement';
import serverSettings from '../../../../api/server-settings';
import products from '../../../../api/products';

const getUniqueId = (function makeUniqueIdFunc() {
  let idx = 0;

  return () => {
    idx += 1;
    return `edt-prdct${idx}`;
  };
}());

type Props = Object & {
  goToBack: Function,
  onSave: (data: Object) => void,
};

type State = {
  categoryError: ?string,
  currTab: string,
  descriptionError: ?string,
  images: string[],
  titleError: ?string,
  priceError: ?string,
  shippingError: ?string,
  submitMode: boolean;
  xhrRequest: boolean;
};

const EMPTY_NUM = 0;
const EMPTY_STR = '';

class EditProduct extends React.Component<Props, State> {
  earningsPrice: ?string = null;

  inputChangeTimer: ?TimeoutID = null;

  tabs = {
    desc: 'description',
    shppng: 'shipping',
  };

  uniqueIDs: { [string]: string } = {};

  btnTitle: string;

  category: ?string;

  description: string;

  isRaw: boolean;

  title: string;

  price: number;

  profitPrice: string;

  priceInputRef: NumberInput;

  shipping: string;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);
    this.btnTitle = 'Save changes';
    this.isRaw = false;

    const uniqueId = getUniqueId();

    this.uniqueIDs = {
      desc: `desc-txtrea${uniqueId}`,
      shppng: `shppng-txtrea${uniqueId}`,
    };

    if (props.isRaw) {
      this.isRaw = true;
      this.btnTitle = 'Push to shop';
    }

    const getStrPropOrDef = (prop: string) => {
      const retVal = typeof props[prop] === 'string' ? props[prop].trim() : EMPTY_STR;
      return retVal;
    };

    this.price = parseFloat(props.price) || EMPTY_NUM;
    this.category = getStrPropOrDef('categoryId');
    this.description = getStrPropOrDef('description');
    this.title = getStrPropOrDef('title');
    this.shipping = getStrPropOrDef('shipping');

    const images = Tools.isArray(props.images) ? props.images : [];

    this.state = {
      images,
      categoryError: this.getRequiredErrorWithPropStr('category'),
      currTab: this.getFirstTab(),
      descriptionError: this.getRequiredErrorWithPropStr('description'),
      titleError: this.getRequiredErrorWithPropStr('title'),
      priceError: this.getRequiredErrorWithPropNum('price'),
      shippingError: this.getRequiredErrorWithPropStr('shipping'),
      submitMode: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeTitleInput = this.onChangeTitleInput.bind(this);
    self.onChangeCategorySelect = this.onChangeCategorySelect.bind(this);
    self.onClickCancelButton = this.onClickCancelButton.bind(this);
    self.onClickTabItem = this.onClickTabItem.bind(this);
    self.onClickThumb = this.onClickThumb.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    const settings = {
      height: 500,
      menu: [],
      plugins: 'textcolor colorpicker image link lists hr',
      toolbar: 'bold italic underline | strikethrough alignleft aligncenter alignright alignjustify alignnone | forecolor backcolor | bullist numlist | fontsizeselect | link unlink | hr | image',
    };

    const onChangeDescContent = (editor: Object) => {
      const content = editor.getContent();
      this.description = content.trim();

      this.setStateAfterInputChange({
        descriptionError: this.getRequiredErrorWithPropStr('description'),
      });
    };

    tinymce.init({
      ...settings,
      selector: `#${this.uniqueIDs.desc}`,
      setup: (descEditor) => {
        descEditor.on('keyup', () => {
          onChangeDescContent(descEditor);
        });

        descEditor.on('change', () => {
          onChangeDescContent(descEditor);
        });
      },
    });

    const onChangeShippingContent = (editor: Object) => {
      const content = editor.getContent();
      this.shipping = content.trim();

      this.setStateAfterInputChange({
        shippingError: this.getRequiredErrorWithPropStr('shipping'),
      });
    };

    tinymce.init({
      ...settings,
      selector: `#${this.uniqueIDs.shppng}`,
      setup: (descEditor) => {
        descEditor.on('keyup', () => {
          onChangeShippingContent(descEditor);
        });

        descEditor.on('change', () => {
          onChangeShippingContent(descEditor);
        });
      },
    });

    const defVal = 0;

    const makeEarnings = (purchPrice: any, purchPricePerc: any) => {
      const pPurchPrice = parseFloat(purchPrice) || defVal;
      const pPurchPricePerc = parseFloat(purchPricePerc) || defVal;
      let earnings = (this.price / 100) * pPurchPricePerc;

      if (earnings > pPurchPrice) {
        earnings = pPurchPrice;
      }

      this.earningsPrice = NumberFormat(earnings);
    };

    const makeProfitPrice = (profPrice: any, purchPricePerc: any) => {
      const pProfPrice = parseFloat(profPrice) || defVal;
      const pProfPerc = parseFloat(purchPricePerc) || defVal;
      let profit = (this.price / 100) * pProfPerc;

      if (profit > pProfPrice) {
        profit = pProfPrice;
      }

      this.profitPrice = NumberFormat(this.price + profit);

      this.setState({
        xhrRequest: false,
      });
    };

    serverSettings.get().then((sSettings) => {
      makeEarnings(sSettings.PURCHASE_PRICE, sSettings.PURCHASE_PRICE_PERC);
      makeProfitPrice(sSettings.PROFIT_PRICE, sSettings.PROFIT_PRICE_PERC);
    }).catch(() => {
      makeEarnings(defVal, defVal);
      makeProfitPrice(defVal, defVal);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onChangeTitleInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.title = input.value.trim();

    this.setStateAfterInputChange({
      titleError: this.getRequiredErrorWithPropStr('title'),
    });
  }

  onChangeCategorySelect(categoryId: ?string) {
    this.category = categoryId || EMPTY_STR;

    this.setState({
      categoryError: this.getRequiredErrorWithPropStr('category'),
    });
  }

  onClickCancelButton(event: SyntheticEvent<HTMLElement>) {
    this.props.goToBack(event);
  }

  onClickTabItem(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    const { tab } = event.currentTarget.dataset;

    if (!Tools.has.call(this.tabs, tab)) {
      throw new Error(`Tab "${tab}" not available`);
    }

    this.setState({
      currTab: tab,
    });
  }

  onClickThumb(event: SyntheticEvent<HTMLElement>) {
    const { idx } = event.currentTarget.dataset;
    const pureIdx = parseInt(idx) || EMPTY_NUM;

    this.setState((prevState) => {
      const thumbImages = prevState.images;
      thumbImages.splice(pureIdx, 1);

      return {
        images: thumbImages,
      };
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const methodName = this.isRaw ? 'push' : 'update';

    const sendData = {
      categoryId: this.category,
      description: this.description,
      images: this.state.images,
      title: this.title,
      shipping: this.shipping,
    };

    products[methodName](this.props._id, sendData).then((product) => {
      this.props.onSave(product);
    }).catch((error) => {
      NotificationBox.danger(error.message);
    });
  }

  getFirstTab() {
    const allTabs = Object.keys(this.tabs);
    return allTabs[0];
  }

  getRequiredErrorWithPropNum(prop: string): ?string {
    let pureVal = EMPTY_NUM;

    if (Tools.has.call(this, prop)) {
      pureVal = (this: Object)[prop];
    }

    let error: ?string = null;

    if (pureVal === EMPTY_NUM) {
      error = `${Tools.capitalize(prop)} is required`;
    }

    return error;
  }

  getRequiredErrorWithPropStr(prop: string): ?string {
    let pureVal = EMPTY_STR;

    if (Tools.has.call(this, prop)) {
      pureVal = (this: Object)[prop];
    }

    let error: ?string = null;

    if (pureVal.length === 0) {
      error = `${Tools.capitalize(prop)} is required`;
    }

    return error;
  }

  setStateAfterInputChange(newState: Object) {
    this.stopInputChangeTimer();

    this.inputChangeTimer = setTimeout(() => {
      this.setState(newState);
    }, Config.inputTimeout);
  }

  stopInputChangeTimer() {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }

    this.inputChangeTimer = null;
  }

  render() {
    const {
      categoryError,
      currTab,
      descriptionError,
      images,
      titleError,
      shippingError,
      submitMode,
      xhrRequest,
    } = this.state;

    let className = 'EditProduct';
    let loader = null;

    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      category: inputCN,
      description: inputCN,
      title: inputCN,
      shipping: inputCN,
    };

    if (xhrRequest) {
      loader = <XHRSpin />;
      className += ' ldr-md';
    } else {
      const errorCNPrefix = ' is-invalid';

      if (categoryError) {
        errorLabels.category = <InvalidLabel>{categoryError}</InvalidLabel>;
        inputCNs.category += errorCNPrefix;
      }

      if (descriptionError) {
        errorLabels.description = <InvalidLabel>{descriptionError}</InvalidLabel>;
        inputCNs.description += errorCNPrefix;
      }

      if (titleError) {
        errorLabels.title = <InvalidLabel>{titleError}</InvalidLabel>;
        inputCNs.title += errorCNPrefix;
      }

      if (shippingError) {
        errorLabels.shipping = <InvalidLabel>{shippingError}</InvalidLabel>;
        inputCNs.shipping += errorCNPrefix;
      }
    }

    const tabKeys = Object.keys(this.tabs);
    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = submitMode || xhrRequest || errorsCount > 0;

    return (
      <div className={className}>
        {loader}
        <form
          noValidate
          className="ldr-hddn"
          onSubmit={this.onSubmitForm}
        >
          <div className="form-group">
            <label>{tt('Title')}</label>
            <input
              autoComplete="title"
              className={inputCNs.title}
              defaultValue={this.title}
              onChange={this.onChangeTitleInput}
              name="title"
              type="text"
            />
            {errorLabels.title}
          </div>
          <div className="row form-group">
            <div className="col-sm-4">
              <img
                alt="main_img"
                className="img-thumbnail"
                src={this.props.image}
              />
            </div>
            <div className="col-sm-8">
              {images.length > 0 && (
                <div className="row thmbs">
                  {images.map((image, idx) => {
                    const key = `thmb${idx}`;

                    return (
                      <div
                        className="col-sm-3"
                        key={key}
                      >
                        <div
                          className="thmb"
                          style={{ backgroundImage: `url(${image})` }}
                        >
                          <button
                            className="cls"
                            data-idx={idx}
                            onClick={this.onClickThumb}
                            type="button"
                          >
                            {tt('Delete')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {this.props.url && (
                <div className="attr-inf">
                  <strong>Product link:</strong>
                  {' '}
                  <a href={this.props.url}>{this.props.url}</a>
                </div>
              )}
              <div className="attr-inf">
                <strong>Original price:</strong>
                {' '}
                {NumberFormat(this.price)}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>{tt('Category')}</label>
                <CategorySelect
                  className={inputCNs.category}
                  id={this.category}
                  onChange={this.onChangeCategorySelect}
                />
                {errorLabels.category}
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>
                  {tt('Price')}
                  {' '}
(
                  {tt('earnings')}
:
                  {' '}
                  {this.earningsPrice}
)
                </label>
                <input
                  disabled
                  className="form-control"
                  defaultValue={this.profitPrice}
                />
              </div>
            </div>
          </div>
          <div className="tabs">
            <ul className="nav nav-tabs">
              {tabKeys.map((tabKey) => {
                const tabTitle = this.tabs[tabKey];
                let tabItemCN = 'nav-link';

                if (currTab === tabKey) {
                  tabItemCN += ' active';
                }

                return (
                  <li
                    className="nav-item"
                    key={tabKey}
                  >
                    <a
                      className={tabItemCN}
                      data-tab={tabKey}
                      onClick={this.onClickTabItem}
                      href="#!"
                    >
                      {tabTitle}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className={`tab-content ${currTab}`}>
              <div className="form-group desc">
                <textarea
                  className={inputCNs.description}
                  defaultValue={this.description}
                  id={this.uniqueIDs.desc}
                  name="description"
                />
                {errorLabels.description}
              </div>
              <div className="form-group shppng">
                <textarea
                  className={inputCNs.shipping}
                  defaultValue={this.shipping}
                  id={this.uniqueIDs.shppng}
                  name="shipping"
                />
                {errorLabels.shipping}
              </div>
            </div>
          </div>
          <div className="btns-grp float-right">
            <button
              className="btn btn-link"
              onClick={this.onClickCancelButton}
              type="button"
            >
              {tt('Cancel')}
            </button>
            <button
              className="btn btn-primary"
              disabled={disabledSubmit}
              type="submit"
            >
              {tt(this.btnTitle)}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default EditProduct;
