/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PrescriptionSummary } from '../PrescriptionSummary';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { FlexView } from '../FlexView';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';

import { UIDatabase } from '../../database';
import { pay } from '../../utilities/modules/dispensary/pay';
import { FinaliseActions } from '../../actions/FinaliseActions';
import { PaymentSummary } from '../PaymentSummary';
import { selectCurrentUser } from '../../selectors/user';
import { selectCurrentPatient } from '../../selectors/patient';
import { PrescriptionExtra } from '../PrescriptionExtra';
import { FlexColumn } from '../FlexColumn';

import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { PrescriptionActions } from '../../actions/PrescriptionActions';
import { selectPrescriptionTotal } from '../../selectors/payment';

const mapStateToProps = state => {
  const { payment, wizard, modules } = state;
  const { transaction, paymentValid, paymentAmount } = payment;
  const { isComplete } = wizard;

  const { usingPayments } = modules;
  const currentPatient = selectCurrentPatient(state);
  const currentUser = selectCurrentUser(state);
  const canConfirm = paymentValid && !isComplete;
  const total = selectPrescriptionTotal(state);

  return {
    total,
    transaction,
    canConfirm,
    paymentAmount,
    currentUser,
    currentPatient,
    usingPayments,
  };
};

const mapDispatchToProps = dispatch => {
  const openFinaliseModal = () => dispatch(FinaliseActions.openModal());
  const onDelete = () => dispatch(PrescriptionActions.cancelPrescription());
  return { onDelete, openFinaliseModal };
};

const PrescriptionConfirmationComponent = ({
  total,
  transaction,
  currentUser,
  currentPatient,
  paymentAmount,
  canConfirm,
  usingPayments,
  onDelete,
}) => {
  const runWithLoadingIndicator = useLoadingIndicator();

  const confirm = React.useCallback(
    () =>
      UIDatabase.write(() =>
        pay(currentUser, currentPatient, transaction, paymentAmount.value, total.value)
      ),
    [currentUser, currentPatient, transaction, paymentAmount.value]
  );

  const confirmPrescription = React.useCallback(() => runWithLoadingIndicator(confirm), [confirm]);

  return (
    <FlexView flex={1}>
      <PrescriptionInfo />

      <FlexRow flex={1}>
        <FlexColumn flex={1}>
          <PrescriptionExtra />
          <PrescriptionSummary transaction={transaction} />
        </FlexColumn>

        <FlexColumn flex={1}>
          {usingPayments && <PaymentSummary />}

          <FlexRow justifyContent="flex-end">
            <PageButton text="Cancel" onPress={onDelete} />
            <PageButton isDisabled={!canConfirm} text="Complete" onPress={confirmPrescription} />
          </FlexRow>
        </FlexColumn>
      </FlexRow>
    </FlexView>
  );
};

PrescriptionConfirmationComponent.propTypes = {
  transaction: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  currentPatient: PropTypes.object.isRequired,
  paymentAmount: PropTypes.object.isRequired,
  canConfirm: PropTypes.bool.isRequired,
  usingPayments: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
};

export const PrescriptionConfirmation = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionConfirmationComponent);