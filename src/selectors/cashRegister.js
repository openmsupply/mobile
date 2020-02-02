/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import { pageStateSelector } from './pageSelectors';

import { ROUTES } from '../navigation/constants';
import { recordKeyExtractor } from '../pages/dataTableUtilities';
import currency from '../localization/currency';

export const selectPageState = createSelector([pageStateSelector], pageState => {
  if (pageState?.route === ROUTES.CASH_REGISTER) {
    return pageState;
  }

  // Handle page component rendering during navigation to root.
  return {
    ...pageState,
    backingData: [],
    dataState: new Map(),
    transactionType: 'payment',
    columns: [],
    keyExtractor: recordKeyExtractor,
    modalKey: '',
    sortKey: '',
  };
});

export const selectTransactions = createSelector(
  [selectPageState],
  pageState => pageState.backingData
);

export const selectTransactionType = createSelector(
  [selectPageState],
  pageState => pageState.transactionType
);

export const selectPayments = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'payment')
);

export const selectReceipts = createSelector([selectTransactions], transactions =>
  transactions.filter(({ type }) => type === 'receipt')
);

export const selectTransactionData = createSelector(
  [selectTransactionType, selectTransactions, selectPayments, selectReceipts],
  (transactionType, transactions, payments, receipts) => {
    switch (transactionType) {
      case 'payment':
        return payments;
      case 'receipt':
        return receipts;
      default:
        return transactions;
    }
  }
);

export const selectPaymentsTotal = createSelector([selectPayments], payments =>
  payments.reduce((acc, { total }) => acc.add(total), currency(0))
);
export const selectReceiptsTotal = createSelector([selectReceipts], receipts =>
  receipts.reduce((acc, { total }) => acc.add(total), currency(0))
);

export const selectBalance = createSelector(
  [selectReceiptsTotal, selectPaymentsTotal],
  (receiptsTotal, paymentsTotal) => receiptsTotal.subtract(paymentsTotal).format()
);
