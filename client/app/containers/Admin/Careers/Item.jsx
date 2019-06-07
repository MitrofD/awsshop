// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../../components/TranslateElement';

type Props = Object & {
  onEdit: Function,
  onRemove: Function,
};

const Item = (props: Props) => {
  const {
    _id,
    quantity,
    location,
    position,
    title,
  } = props.data;

  const link = `/vacancy/${_id}`;

  const onClickEditButton = () => {
    props.onEdit(props.data);
  };

  const onClickRemoveButton = () => {
    props.onRemove(props.data);
  };

  const sOrEmpty = quantity > 1 ? 's' : '';

  return (
    <tr>
      <td>
        <div className="text-primary">{title}</div>
        <div className="quantity">
          {`${quantity} `}
          {tt(`position${sOrEmpty} available`)}
        </div>
      </td>
      <td>{position}</td>
      <td>{location}</td>
      <td className="td-actns text-right">
        <Link
          target="_blank"
          to={link}
        >
          {tt('Link')}
        </Link>
        |
        <button
          className="edt"
          onClick={onClickEditButton}
          type="button"
        >
          {tt('Edit')}
        </button>
        |
        <button
          className="rmv"
          onClick={onClickRemoveButton}
          type="button"
        >
          {tt('Remove')}
        </button>
      </td>
    </tr>
  );
};

export default Item;
