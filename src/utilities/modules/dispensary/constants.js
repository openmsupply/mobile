/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const INSURANCE_POLICY_FIELDS = {
  POLICY_NUMBER_PERSON: 'policyNumberPerson',
  POLICY_NUMBER_FAMILY: 'policyNumberFamily',
};

export const CASH_TRANSACTION_INPUT_MODAL_FIELDS = {
  NAME: 'name',
  AMOUNT: 'amount',
  PAYMENT_TYPE: 'payment_type',
  REASON: 'reason',
  DESCRIPTION: 'description',
};

export const CASH_TRANSACTION_INPUT_MODAL_KEYS = {
  NAME: 'name',
  TYPE: 'title',
  PAYMENT_TYPE: 'description',
  REASON: 'title',
};

export const CASH_TRANSACTION_TYPES = {
  CASH_IN: 'cash_in',
  CASH_OUT: 'cash_out',
};

export const CASH_TRANSACTION_PAYMENT_TYPES = {
  CASH: 'cash',
  CHEQUE: 'cheque',
  CREDIT_CARD: 'credit_card',
  MOBILE_PAYMENT: 'mobile_payment',
};

export const INSURANCE_POLICY = {
  FIELDS: INSURANCE_POLICY_FIELDS,
};

export const CASH_TRANSACTION = {
  TYPES: CASH_TRANSACTION_TYPES,
  PAYMENT_TYPES: CASH_TRANSACTION_PAYMENT_TYPES,
  INPUT_MODAL_FIELDS: CASH_TRANSACTION_INPUT_MODAL_FIELDS,
  INPUT_MODAL_KEYS: CASH_TRANSACTION_INPUT_MODAL_KEYS,
};
