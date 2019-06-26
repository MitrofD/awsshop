// @flow
import React, {
  Fragment,
  useEffect,
  useState,
} from 'react';

import NoHaveLabel from '../../includes/NoHaveLabel';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import competition from '../../../api/competition';

const List = () => {
  const [
    members,
    setMembers,
  ] = useState(null);

  let unmounted = false;

  const setRightMembers = (newMembers) => {
    if (!unmounted) {
      setMembers(newMembers);
    }
  };

  useEffect(() => {
    competition.getMembers().then(setRightMembers).catch((error) => {
      setRightMembers([]);
      NotificationBox.danger(error.message);
    });

    return () => {
      unmounted = true;
    };
  }, []);

  let content = null;

  if (Array.isArray(members)) {
    const allWillDeletdText = 'Сurrent members will be deleted.Are you sure?';
    const membersLength = members.length;

    const onClickGenerateButton = () => {
      const generateMembers = () => {
        const oldMembers = Array.isArray(members) ? members.slice() : members;
        setRightMembers(null);

        competition.generateMembers().then(setRightMembers).catch((error) => {
          setRightMembers(oldMembers);
          NotificationBox.danger(error.message);
        });
      };

      if (membersLength > 0) {
        showConfirmModal(allWillDeletdText, () => {
          generateMembers();
        });
        return;
      }

      generateMembers();
    };

    const generateButton = (
      <button
        className="btn btn-primary"
        type="button"
        onClick={onClickGenerateButton}
      >
        {tt('Click to generate')}
      </button>
    );

    if (membersLength > 0) {
      const onClickDeleteButton = () => {
        const deleteMembers = () => {
          const oldMembers = Array.isArray(members) ? members.slice() : members;
          setRightMembers(null);

          competition.deleteMembers().then(() => {
            setRightMembers([]);
          }).catch((error) => {
            setRightMembers(oldMembers);
            NotificationBox.danger(error.message);
          });
        };

        if (membersLength > 0) {
          showConfirmModal(allWillDeletdText, () => {
            deleteMembers();
          });
          return;
        }

        deleteMembers();
      };

      content = (
        <Fragment>
          <div className="row mb-3 text-right">
            <div className="col-12">
              <button
                className="btn btn-danger mr-1"
                type="button"
                onClick={onClickDeleteButton}
              >
                {tt('Delete all')}
              </button>
              {generateButton}
            </div>
          </div>
          <table className="table tbl-hd">
            <thead>
              <tr>
                <th>{tt('Ranking')}</th>
                <th>{tt('Seller')}</th>
                <th>{tt('Seller ID')}</th>
                <th>{tt('Volume')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr key={member._id}>
                  <td>{idx + 1}</td>
                  <td>{member.name}</td>
                  <td>{`#${member.id}`}</td>
                  <td>{NumberFormat(member.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Fragment>
      );
    } else {
      content = (
        <div className="text-center">
          <NoHaveLabel>{tt('No members find')}</NoHaveLabel>
          {generateButton}
        </div>
      );
    }
  } else {
    content = <XHRSpin />;
  }

  return (
    <div className="List">
      <div className="ttl">{tt('Competition members')}</div>
      <div className="dt">{content}</div>
    </div>
  );
};

export default List;
