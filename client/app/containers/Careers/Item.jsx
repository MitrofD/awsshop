// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../components/TranslateElement';

type Props = Object;

const Item = (props: Props) => {
  const {
    _id,
    quantity,
    location,
    position,
    title,
  } = props;

  const link = `/career/${_id}`;
  const sOrEmpty = quantity > 1 ? 's' : '';

  return (
    <tr>
      <td>
        <div className="info">
          <div className="text-primary">{title}</div>
          <div className="quantity">
            {`${quantity} `}
            {tt(`position${sOrEmpty} available`)}
          </div>
        </div>
      </td>
      <td>
        <strong>{position}</strong>
      </td>
      <td>{location}</td>
      <td>
        <Link
          className="btn"
          to={link}
        >
          {tt('Details')}
        </Link>
        <a
          className="btn btn-apply"
          href="#"
        >
          {tt('Apply')}
        </a>
      </td>
    </tr>
  );
};

export default Item;
