import { batch } from 'react-redux';
import { generateUUID } from 'react-native-database';
import { SensorManager } from '../../bluetooth';
import { UIDatabase } from '../../database';
import { createRecord } from '../../database/utilities';
import { selectEditingLocation, selectNewLocation } from '../../selectors/Entities/location';
import {
  selectEditingSensor,
  selectNewSensor,
  selectNewSensorId,
  selectReplacedSensor,
} from '../../selectors/Entities/sensor';
import {
  selectEditingConfigs,
  selectNewConfigs,
} from '../../selectors/Entities/temperatureBreachConfig';
import { LocationActions } from './LocationActions';
import { TemperatureBreachConfigActions } from './TemperatureBreachConfigActions';

export const SENSOR_ACTIONS = {
  CREATE: 'SENSOR/create',
  UPDATE: 'SENSOR/update',
  REMOVE: 'SENSOR/remove',
  RESET: 'SENSOR/reset',
  SAVE_NEW: 'SENSOR/saveNew',
  SAVE_EDITING: 'SENSOR/saveEditing',
  REPLACE: 'SENSOR/replace',
};

const createFromScanner = macAddress => dispatch => {
  dispatch(LocationActions.create());
  dispatch(SensorActions.create(macAddress));
  dispatch(TemperatureBreachConfigActions.createGroup());
};

const reset = () => ({ type: SENSOR_ACTIONS.RESET });

const update = (id, field, value) => ({
  type: SENSOR_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const create = macAddress => async dispatch => {
  const defaultSensor = {
    isPaused: false,
    location: {},
    logDelay: new Date().getTime(),
    logInterval: 300,
    macAddress,
    name: '',
  };
  const payload = await SensorManager().createSensor(defaultSensor);
  dispatch({ type: SENSOR_ACTIONS.CREATE, payload });
};

const updateNewSensor = (value, field) => (dispatch, getState) => {
  const state = getState();
  const newId = selectNewSensorId(state);
  dispatch(update(newId, field, value));
};

const saveNew = sensor => ({
  type: SENSOR_ACTIONS.SAVE_NEW,
  payload: { sensor },
});

const saveEditing = sensor => ({
  type: SENSOR_ACTIONS.SAVE_EDITING,
  payload: { sensor },
});

const save = () => (dispatch, getState) => {
  const fullState = getState();
  const location = selectEditingLocation(fullState);
  const sensor = selectEditingSensor(fullState);
  const configs = selectEditingConfigs(fullState);
  const replacedSensor = selectReplacedSensor(fullState);

  let updatedLocation;
  let updatedSensor;
  const updatedConfigs = [];

  location.description = sensor.name;

  UIDatabase.write(() => {
    updatedLocation = UIDatabase.update('Location', location);
    updatedSensor = UIDatabase.update('Sensor', {
      ...sensor,
      logDelay: new Date(sensor?.logDelay ?? 0),
      location: updatedLocation,
    });
    configs.forEach(config =>
      updatedConfigs.push(UIDatabase.update('TemperatureBreachConfiguration', config))
    );

    if (replacedSensor) {
      replacedSensor.location = null;
      replacedSensor.isActive = false;
      replacedSensor.logDelay = new Date(replacedSensor.logDelay);
      updatedSensor = UIDatabase.update('Sensor', replacedSensor);
    }
  });

  batch(() => {
    dispatch(saveEditing(updatedSensor));
    dispatch(LocationActions.saveEditing(updatedLocation));
    dispatch(TemperatureBreachConfigActions.saveEditingGroup(updatedConfigs));
  });
};

const replace = macAddress => ({
  type: SENSOR_ACTIONS.REPLACE,
  payload: { macAddress, id: generateUUID() },
});

const remove = id => ({
  type: SENSOR_ACTIONS.REMOVE,
  payload: { id },
});

const removeSensor = sensorId => dispatch => {
  const sensor = UIDatabase.get('Sensor', sensorId);

  UIDatabase.write(() => {
    UIDatabase.update('Sensor', {
      id: sensor.id,
      isActive: false,
    });
  });

  dispatch(remove());
};

const createNew = () => (dispatch, getState) => {
  const fullState = getState();
  const location = selectNewLocation(fullState);
  const sensor = selectNewSensor(fullState);
  const configs = selectNewConfigs(fullState);

  let newLocation;
  let newConfigs;
  let newSensor;

  location.description = sensor.name;

  UIDatabase.write(() => {
    const existingSensor = UIDatabase.get('Sensor', sensor.macAddress, 'macAddress');
    const existingLocation = existingSensor?.location;
    const existingConfigs = existingLocation?.breachConfigs;

    if (existingLocation) {
      newLocation = UIDatabase.update('Location', {
        id: existingLocation.id,
        description: sensor.name,
      });
    } else {
      newLocation = createRecord(UIDatabase, 'Location', { ...location, description: sensor.name });
    }

    if (existingSensor) {
      newSensor = UIDatabase.update('Sensor', {
        ...sensor,
        id: existingSensor.id,
        location: newLocation,
        logDelay: new Date(sensor?.logDelay ?? 0),
      });
    } else {
      newSensor = createRecord(UIDatabase, 'Sensor', {
        ...sensor,
        location,
        logDelay: new Date(sensor?.logDelay ?? 0),
      });
    }

    if (existingConfigs) {
      newConfigs = configs.map(config => {
        const matchingConfig = existingConfigs?.find(
          existingConfig => existingConfig.type === config.type
        );

        return UIDatabase.update('TemperatureBreachConfiguration', {
          ...config,
          location: newLocation,
          id: matchingConfig?.id,
        });
      });
    } else {
      newConfigs = configs.map(config =>
        createRecord(UIDatabase, 'TemperatureBreachConfiguration', { ...config, location })
      );
    }

    batch(() => {
      dispatch(saveNew(newSensor));
      dispatch(TemperatureBreachConfigActions.saveNewGroup(newConfigs));
      dispatch(LocationActions.saveNew(newLocation));
    });
  });
};

export const SensorActions = {
  update,
  create,
  createFromScanner,
  reset,
  updateNewSensor,
  createNew,
  saveNew,
  save,
  saveEditing,
  replace,
  removeSensor,
};
