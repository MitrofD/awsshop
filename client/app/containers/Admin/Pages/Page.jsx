// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../../components/TranslateElement';

type Props = Object & {
  onEdit: Function,
  onRemove: Function,
};

const Page = (props: Props) => {
  const {
    _id,
    title,
    path,
  } = props.data;

  const link = `/s/${path}`;

  const onClickEditButton = () => {
    props.onEdit(props.data);
  };

  const onClickRemoveButton = () => {
    props.onRemove(props.data);
  };

  return (
    <tr>
      <td>{title}</td>
      <td>{path}</td>
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

export default Page;
