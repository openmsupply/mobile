/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase, generateUUID } from '../database';
import { PageActions } from '../pages/dataTableUtilities/actions';
import { ROUTES } from '../navigation/constants';

export const PRESCRIBER_ACTIONS = {
  EDIT: 'Prescriber/edit',
  CREATE: 'Prescriber/create',
  COMPLETE: 'Prescriber/complete',
  SET: 'Prescriber/set',
  FILTER: 'Prescriber/filter',
  SORT: 'Prescriber/sort',
};

const filterData = searchTerm => ({ type: PRESCRIBER_ACTIONS.FILTER, payload: { searchTerm } });

const sortData = sortKey => ({ type: PRESCRIBER_ACTIONS.SORT, payload: { sortKey } });

const setPrescriber = prescriber => ({ type: PRESCRIBER_ACTIONS.SET, payload: { prescriber } });

const closeModal = () => ({ type: PRESCRIBER_ACTIONS.COMPLETE });

const createPrescriber = () => ({ type: PRESCRIBER_ACTIONS.CREATE });

const editPrescriber = prescriber => ({
  type: PRESCRIBER_ACTIONS.EDIT,
  payload: { prescriber },
});

const updatePrescriber = completedForm => (dispatch, getState) => {
  const { prescriber } = getState();
  const { currentPrescriber } = prescriber;

  if (currentPrescriber) {
    UIDatabase.write(() => {
      UIDatabase.update('Prescriber', {
        ...currentPrescriber,
        ...completedForm,
      });
    });
  } else {
    UIDatabase.write(() => {
      UIDatabase.update('Prescriber', {
        id: generateUUID(),
        ...completedForm,
      });
    });
  }

  dispatch(closeModal());
  dispatch(PageActions.refreshData(ROUTES.DISPENSARY));
};

export const PrescriberActions = {
  createPrescriber,
  updatePrescriber,
  editPrescriber,
  closeModal,
  setPrescriber,
  filterData,
  sortData,
};
