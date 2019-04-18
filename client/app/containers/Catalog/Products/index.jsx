// @flow
import React from 'react';
import Grid from './Grid';
import { tt } from '../../../components/TranslateElement';
import categories from '../../../api/categories';

const ALL_TEXT = 'All products';

type Props = {
  category?: ?string,
};

type State = {
  xhrRequest: boolean,
};

const defaultProps = {
  category: null,
};

class Products extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  findTitle: ?string = null;

  category: ?Object = null;

  tmpFindTitle = '';

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      xhrRequest: !!props.category,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    if (this.props.category) {
      this.requestWithCategory(this.props.category);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.category !== prevProps.category) {
      if (this.props.category) {
        this.requestWithCategory(this.props.category);
      } else {
        this.category = null;
        this.forceUpdate();
      }
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.tmpFindTitle = input.value.trim();
  }

  onSubmitSearchForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    this.findTitle = this.tmpFindTitle.length > 0 ? this.tmpFindTitle : null;
    this.forceUpdate();
  }

  requestWithCategory(categoryName: string) {
    this.setState({
      xhrRequest: true,
    });

    categories.withName(categoryName).then((category) => {
      this.category = category;
      this.stopRequest();
    }).catch((error) => {
      NotificationBox.danger(error.message);
      this.category = null;
      this.stopRequest();
    });
  }

  stopRequest() {
    if (this.unmounted) {
      return;
    }

    this.setState({
      xhrRequest: false,
    });
  }

  render() {
    let title = ALL_TEXT;
    let goodLabel = null;
    let categoryId = null;

    if (this.props.category) {
      const decodedCategory = decodeURIComponent(this.props.category);
      title = decodedCategory;
    }

    if (this.category) {
      const {
        _id,
        productsCount,
      } = this.category;

      categoryId = _id;

      goodLabel = (
        <div className="inf">
          {tt('Goods')}
:
          {productsCount}
        </div>
      );
    }

    return (
      <div className="Products">
        <div className="ttl">
          {tt(title)}
          {goodLabel}
        </div>
        <form
          noValidate
          className="row actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="col-sm-10">
            <input
              className="form-control"
              onChange={this.onChangeSearchInput}
              type="text"
              placeholder="Product title"
            />
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-primary btn-sm btn-block"
              type="submit"
            >
              {tt('Search')}
            </button>
          </div>
        </form>
        {!this.state.xhrRequest && (
          <Grid
            categoryId={categoryId}
            findTitle={this.findTitle}
          />
        )}
      </div>
    );
  }
}

export default Products;
