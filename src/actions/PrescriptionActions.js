/* eslint-disable no-unused-expressions */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { batch } from 'react-redux';

import { UIDatabase, createRecord } from '../database';

import { PrescriberActions } from './PrescriberActions';
import { WizardActions } from './WizardActions';

export const PRESCRIPTION_ACTIONS = {
  REFRESH: 'Prescription/refresh',
};

const refresh = () => ({ type: PRESCRIPTION_ACTIONS.REFRESH });

const appendDirection = (id, newValue) => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const item = items.filtered('id == $0', id)[0];
  const { note } = item;

  item.setItemDirection(UIDatabase, `${note ?? ''} ${newValue}`);

  dispatch(refresh());
};

const updateDirection = (id, newValue) => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const item = items.filtered('id == $0', id)[0];

  // Split the value on spaces, creating 'words' and
  // attempting to get the most recently entered 'word'.
  const splitValue = newValue.split(' ');

  // If the last value is a falsey, it is whitespace. Use the 'word' beforehand
  // for the abbreviation lookup. If the input is only whitespace, will assign
  // undefined and no Abbreviation will be found.
  const whitespaceOffset = splitValue[splitValue.length - 1] ? 1 : 2;
  const possibleAbbreviation = splitValue[splitValue.length - whitespaceOffset];

  // Try to find if the most recent word is an Abbreviation.
  const abbreviation = UIDatabase.get('Abbreviation', possibleAbbreviation, 'abbreviation');

  // If and appreviation was found, remove the Abbreviation and replace it with the expansion.
  // Otherwise, just assign the input as the note.
  if (abbreviation) {
    const withAbbreviation = splitValue.slice(0, splitValue.length - whitespaceOffset).join(' ');
    const updateValue = `${withAbbreviation} ${abbreviation.expansion} `;

    item.setItemDirection(UIDatabase, updateValue);
  } else {
    item.setItemDirection(UIDatabase, newValue);
  }
  dispatch(refresh());
};

const removeItem = id => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const item = items.filtered('id == $0', id);

  UIDatabase.write(() => {
    UIDatabase.delete('TransactionItem', item);
  });

  dispatch(refresh());
};

const editQuantity = (id, quantity) => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const itemToUpdate = items.filtered('id == $0', id)[0];

  UIDatabase.write(() => {
    itemToUpdate.setTotalQuantity(UIDatabase, quantity);
    UIDatabase.save('TransactionItem', itemToUpdate);
  });
};

const assignPrescriber = prescriber => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;

  UIDatabase.write(() =>
    UIDatabase.update('Transaction', {
      ...transaction,
      prescriber,
    })
  );

  batch(() => {
    dispatch(PrescriberActions.setPrescriber(prescriber));
    dispatch(WizardActions.nextTab());
  });
};

const addItem = itemID => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const item = UIDatabase.get('Item', itemID);

  if (!transaction.hasItem(item)) {
    UIDatabase.write(() => {
      createRecord(UIDatabase, 'TransactionItem', transaction, item, 1);
    });
  }

  dispatch(refresh());
};

export const PrescriptionActions = {
  addItem,
  assignPrescriber,
  editQuantity,
  removeItem,
  updateDirection,
  appendDirection,
};