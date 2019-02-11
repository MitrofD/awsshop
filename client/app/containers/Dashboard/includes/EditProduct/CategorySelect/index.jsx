// @flow
import React, { Fragment } from 'react';
import CategoriesModal from './CategoriesModal';
import categories from '../../../../../api/categories';

type Props = {
  className?: ?string,
  id: ?string,
  onChange: (?string) => void,
};

type State = {
  modal: ?React$Element<typeof CategoriesModal>,
  title: string,
  xhrRequest: boolean,
};

const NO_HAS_TITLE = '-- NOT SET --';

const defaultProps = {
  className: 'form-control',
};

class CategorySelect extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    let xhrRequest = false;
    let title = NO_HAS_TITLE;

    if (props.id) {
      this.id = props.id;
      xhrRequest = true;
      title = 'Please wait...';
    }

    this.state = {
      title,
      xhrRequest,
      modal: null,
    };

    const self: any = this;
    self.onCloseModal = this.onCloseModal.bind(this);
    self.onClickToMe = this.onClickToMe.bind(this);
    self.onSetCategory = this.onSetCategory.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    if (this.id) {
      const finishWithTitle = (title: string) => {
        if (this.unmounted) {
          return;
        }

        const newState = {
          title,
          xhrRequest: false,
        };

        this.setState(newState);
      };

      categories.withId(this.id).then((category) => {
        finishWithTitle(category.name);
      }).catch(() => {
        this.id = null;
        this.props.onChange(null);
        finishWithTitle(NO_HAS_TITLE);
      });
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onCloseModal() {
    this.setState({
      modal: null,
    });
  }

  onClickToMe(event: SyntheticEvent<HTMLElement>) {
    if (this.state.xhrRequest) {
      return;
    }

    this.setState({
      modal: (
        <CategoriesModal
          id={this.id}
          onClose={this.onCloseModal}
          onSet={this.onSetCategory}
        />
      ),
    });
  }

  onSetCategory(category: Object) {
    this.id = category._id;
    this.setState({
      modal: null,
      title: category.name,
    });

    this.props.onChange(this.id);
  }

  id: ?string = null;
  unmounted = true;

  render() {
    const {
      modal,
      title,
    } = this.state;

    return (
      <Fragment>
        {modal}
        <select
          className={this.props.className}
          onClick={this.onClickToMe}
        >
          <option hidden>{title}</option>
        </select>
      </Fragment>
    );
  }
}

export default CategorySelect;
