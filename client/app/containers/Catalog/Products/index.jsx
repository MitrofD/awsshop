// @flow
import React from 'react';
import Grid from './Grid';
import { tt } from '../../../components/TranslateElement';
import Dropdown, { DropdownItem } from '../../../components/Dropdown';
import categories from '../../../api/categories';

const ALL_TEXT = 'All products';

const sorts = {
  fNewToOld: {
    title: 'Date: descending',
    by: 'createdAt',
    desc: -1,
  },
  fOldToNew: {
    title: 'Date: ascending',
    by: 'createdAt',
    desc: 1,
  },
<<<<<<< HEAD
=======
  fAToZ: {
    title: 'Name: Ascending',
    by: 'title',
    desc: 1,
  },
  fZToA: {
    title: 'Name: Descending',
    by: 'title',
    desc: -1,
  },
>>>>>>> 93c271e2daef46ad8b174d25c5e09b7cd7c72917
  fCheapToExpensive: {
    title: 'Price: Lowest first',
    by: 'price',
    desc: 1,
  },
  fExpensiveToCheap: {
    title: 'Price: Highest first',
    by: 'price',
    desc: -1,
  },
  fAToZ: {
    title: 'Name: Ascending',
    by: 'title',
    desc: 1,
  },
  fZToA: {
    title: 'Name: Descending',
    by: 'title',
    desc: -1,
  },
};

const getSort = (type: string) => {
  const rObj: Object = {};
  let rType = type;

  if (Object.prototype.hasOwnProperty.call(sorts, rType)) {
    Object.assign(rObj, sorts[rType]);
  } else {
    const types = Object.keys(sorts);
    [rType] = types;
    Object.assign(rObj, sorts[rType]);
  }

  rObj.type = rType;

  return rObj;
};

type Props = {
  category?: ?string,
};

type State = {
  dropdown: React.DOM,
  sortType: string,
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

  sortData = getSort('');

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      dropdown: null,
      sortType: this.sortData.type,
      xhrRequest: !!props.category,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onClickSortSelect = this.onClickSortSelect.bind(this);
    self.onClickSortItem = this.onClickSortItem.bind(this);
    self.onLeaveDropdown = this.onLeaveDropdown.bind(this);
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

  onClickSortSelect() {
    const types = Object.keys(sorts);

    const dropdown = (
      <Dropdown
        rightSticky
        className="animated fadeIn"
        onLeave={this.onLeaveDropdown}
      >
        {types.map((type) => {
          const typeVal = sorts[type];

          return (
            <DropdownItem key={type}>
              <a
                href="#"
                data-type={type}
                onClick={this.onClickSortItem}
              >
                {typeVal.title}
              </a>
            </DropdownItem>
          );
        })}
      </Dropdown>
    );

    this.setState({
      dropdown,
    });
  }

  onClickSortItem(event: SyntheticEvent<HTMLFormElement>) {
    const element = event.currentTarget;
    event.preventDefault();
    const { type } = element.dataset;
    this.sortData = getSort(type);

    this.setState({
      sortType: type,
      dropdown: null,
    });

    console.log(this.sortData);
  }

  onLeaveDropdown() {
    this.setState({
      dropdown: null,
    });
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
    const {
      dropdown,
    } = this.state;

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
          {`: ${productsCount}`}
        </div>
      );
    }

    let sortClassName = 'sort';

    if (dropdown) {
      sortClassName += ' active';
    }

    return (
      <div className="Products">
        <div className="ttl">
          {tt(title)}
          {goodLabel}
        </div>
        <form
          noValidate
          className="actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="row">
            <div className="col-sm-6 form-group">
              <label>
                {tt('Search')}
                :
              </label>
              <input
                className="form-control"
                onChange={this.onChangeSearchInput}
                type="text"
              />
            </div>
            <div className="col-sm-2">
              <label>&nbsp;</label>
              <button
                className="btn btn-primary btn-sm btn-block"
                type="submit"
              >
                {tt('Search')}
              </button>
            </div>
            <div className="col-sm-4 form-group">
              <label>
                {tt('Sorting')}
                :
              </label>
              <div className={sortClassName}>
                <input
                  readOnly
                  className="form-control"
                  onClick={this.onClickSortSelect}
                  type="text"
                  value={this.sortData.title}
                />
                {dropdown}
              </div>
            </div>
          </div>
        </form>
        {!this.state.xhrRequest && (
          <Grid
            categoryId={categoryId}
            findTitle={this.findTitle}
            sort={this.sortData}
          />
        )}
      </div>
    );
  }
}

export default Products;
