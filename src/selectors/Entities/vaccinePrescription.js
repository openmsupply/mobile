import { createSelector } from 'reselect';

import { selectSpecificEntityState } from './index';
import { getFormInputConfig } from '../../utilities/formInputConfigs';

export const selectEditingVaccinePrescriptionId = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { creating } = VaccinePrescriptionState;
  const { id } = creating;
  return id;
};

export const selectEditingVaccinePrescription = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { creating } = VaccinePrescriptionState;
  return creating;
};

export const selectPatientSearchFormConfig = () => getFormInputConfig('searchVaccinePatient');

export const selectVaccines = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { vaccines } = VaccinePrescriptionState;
  return vaccines;
};

export const selectSelectedVaccines = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { selectedVaccines } = VaccinePrescriptionState;

  return selectedVaccines;
};

export const selectSortedVaccines = createSelector([selectVaccines], vaccines => {
  const sortedVaccines = vaccines.sorted('name');

  // Split the items by quantity - showing out-of-stock items at the end of the list.
  const vaccinesWithStock = sortedVaccines.filtered('ANY batches.numberOfPacks > 0').slice();
  const vaccinesWithoutStock = sortedVaccines.filtered('ALL batches.numberOfPacks == 0').slice();

  return [...vaccinesWithStock, ...vaccinesWithoutStock];
});

export const selectSelectedRows = createSelector([selectSelectedVaccines], vaccines =>
  vaccines.reduce((acc, vaccine) => ({ ...acc, [vaccine.id]: true }), {})
);
