import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';

import { UIDatabase, createRecord } from '../../database';
import {
  selectHasRefused,
  selectSelectedBatches,
  selectSelectedVaccinator,
} from '../../selectors/Entities/vaccinePrescription';
import { selectEditingNameId } from '../../selectors/Entities/name';
import { NameActions } from './NameActions';
import { NameNoteActions } from './NameNoteActions';
import { goBack, gotoVaccineDispensingPage } from '../../navigation/actions';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  SET_REFUSAL: 'VACCINE_PRESCRIPTION/setRefusal',
  RESET: 'VACCINE_PRESCRIPTION/reset',
  SELECT_VACCINE: 'VACCINE_PRESCRIPTION/selectVaccine',
  SELECT_BATCH: 'VACCINE_PRESCRIPTION/selectBatch',
  SELECT_VACCINATOR: 'VACCINE_PRESCRIPTION/selectVaccinator',
};

const createDefaultVaccinePrescription = () => ({
  id: generateUUID(),
  name: '',
  code: '',
  type: 'patient',
  isCustomer: false,
  isSupplier: false,
  isManufacturer: false,
  isVisible: true,
});

const getDefaultVaccinator = () => {
  const [batches] = UIDatabase.objects('TransactionBatch')
    .filtered('medicineAdministrator != null && itemBatch.item.isVaccine == true')
    .sorted('transaction.confirmDate', true);

  if (batches) {
    return batches.medicineAdministrator;
  }

  return null;
};

const getDefaultVaccine = () => {
  const [mostRecentTrans] = UIDatabase.objects('Transaction')
    .filtered("type == 'customer_invoice' && (status == 'finalised' || status == 'confirmed')")
    .sorted('confirmDate', true);

  const [item] = mostRecentTrans?.items?.filtered('item.isVaccine == true') ?? [];

  return item?.item ?? null;
};

const getRecommendedBatch = vaccine => {
  const { batchesWithStock = [] } = vaccine ?? getDefaultVaccine() ?? {};

  if (batchesWithStock?.length) {
    const batchesByExpiry = batchesWithStock.sorted('expiryDate');
    const openVials = batchesByExpiry.filter(b => !Number.isInteger(b.numberOfPacks));

    return openVials.length ? openVials[0] : batchesByExpiry[0];
  }

  return null;
};

const create = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.CREATE,
  payload: {
    prescription: createDefaultVaccinePrescription(),
    vaccinator: getDefaultVaccinator(),
    selectedVaccines: [getDefaultVaccine()],
    selectedBatches: [getRecommendedBatch()],
  },
});

const reset = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.RESET,
});

const selectVaccine = vaccine => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINE,
  payload: { vaccine, batch: getRecommendedBatch(vaccine) },
});

const selectBatch = itemBatch => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_BATCH,
  payload: { itemBatch },
});

const setRefusal = hasRefused => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SET_REFUSAL,
  payload: {
    hasRefused,
    selectedVaccines: [getDefaultVaccine()],
    selectedBatches: [getRecommendedBatch()],
  },
});

const createPrescription = (patient, currentUser, selectedBatches, vaccinator) => {
  UIDatabase.write(() => {
    const prescription = createRecord(
      UIDatabase,
      'CustomerInvoice',
      patient,
      currentUser,
      'dispensary'
    );

    selectedBatches.forEach(itemBatch => {
      const { item } = itemBatch;
      const transactionItem = createRecord(UIDatabase, 'TransactionItem', prescription, item);
      createRecord(UIDatabase, 'TransactionBatch', transactionItem, itemBatch);
      transactionItem.setDoses(UIDatabase, 1);
      transactionItem.setVaccinator(UIDatabase, vaccinator);
    });
    prescription.finalise(UIDatabase);
  });
};

const createRefusalNameNote = name => {
  const [patientEvent] = UIDatabase.objects('PatientEvent').filtered('code == "RV"');

  if (!patientEvent) return;

  const id = generateUUID();
  const newNameNote = { id, name, patientEvent, entryDate: new Date() };

  UIDatabase.write(() => UIDatabase.create('NameNote', newNameNote));
};

const confirm = () => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;
  const hasRefused = selectHasRefused(getState());
  const patientID = selectEditingNameId(getState());
  const selectedBatches = selectSelectedBatches(getState());
  const vaccinator = selectSelectedVaccinator(getState());

  batch(() => {
    dispatch(NameActions.saveEditing());
    dispatch(NameNoteActions.saveEditing());
    dispatch(reset());
  });

  const patient = UIDatabase.get('Name', patientID);
  if (hasRefused) {
    createRefusalNameNote(patient);
  } else {
    createPrescription(patient, currentUser, selectedBatches, vaccinator);
  }
};

const selectVaccinator = vaccinator => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINATOR,
  payload: { vaccinator },
});

const cancel = () => goBack();

const confirmAndRepeat = () => dispatch =>
  batch(() => {
    dispatch(confirm());
    dispatch(goBack());
    dispatch(gotoVaccineDispensingPage());
  });

export const VaccinePrescriptionActions = {
  cancel,
  confirm,
  create,
  reset,
  selectBatch,
  selectVaccine,
  setRefusal,
  selectVaccinator,
  confirmAndRepeat,
};
