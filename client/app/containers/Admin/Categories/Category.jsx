// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import AddEditCategory from './AddEditCategory';
import { tt } from '../../../components/TranslateElement';
import categories from '../../../api/categories';

type onRemoveFunction = (string) => void;

type Props = {
  data: Object,
  onRemove: onRemoveFunction,
};

type State = {
  data: Object,
  modal: React$Node,
};

class Category extends React.PureComponent<Props, State> {
  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      data: props.data,
      modal: null,
    };

    const self: any = this;
    self.onCloseModal = this.onCloseModal.bind(this);
    self.onClickEditButton = this.onClickEditButton.bind(this);
    self.onClickRemoveButton = this.onClickRemoveButton.bind(this);
    self.onEditedCategory = this.onEditedCategory.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onCloseModal() {
    this.setState({
      modal: null,
    });
  }

  onClickEditButton() {
    this.setState((prevState) => {
      const newState = {
        modal: (
          <AddEditCategory
            isOpened
            item={prevState.data}
            onApply={this.onEditedCategory}
            onClose={this.onCloseModal}
          />
        ),
      };

      return newState;
    });
  }

  onClickRemoveButton(event: SyntheticEvent<HTMLButtonElement>) {
    const category = this.state.data;

    const requiredAction = () => {
      const button = event.currentTarget;
      button.disabled = true;

      categories.remove(category._id).then(() => {
        this.props.onRemove(category._id);
      }).catch((error) => {
        button.disabled = false;
        NotificationBox.danger(error.message);
      });
    };

    if (category.productsCount > 0) {
      showConfirmModal(`Category "${category.name}" contains ${category.productsCount} products.Are you sure?`, () => {
        requiredAction();
      });
      return;
    }

    requiredAction();
  }

  onEditedCategory(newData: Object) {
    this.setState({
      data: newData,
    });

    this.onCloseModal();
  }

  render() {
    const category = this.state.data;

    return (
      <tr>
        <td>
          <Link
            to={Config.categoryPath + encodeURIComponent(category.name)}
          >
            {category.name}
          </Link>
          {this.state.modal}
        </td>
        <td>{category.productsCount}</td>
        <td className="td-actns">
          <button
            className="edt"
            onClick={this.onClickEditButton}
            type="button"
          >
            {tt('Edit')}
          </button>
|
          <button
            className="rmv"
            onClick={this.onClickRemoveButton}
            type="button"
          >
            {tt('Remove')}
          </button>
        </td>
      </tr>
    );
  }
}

export default Category;
